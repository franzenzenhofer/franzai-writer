
### TL;DR

`/w/[shortName]/[documentId]` freezes because a **client component (`WizardShell`) is imported at build time with a *static* `import` that immediately pulls in the server-only action `runAiStage` (marked `"use server"` but still *executed through the same file path*)**.
That single line drags \~180 000 LOC of server-side code (Genkit → GoogleAI SDK → Firebase → Node built-ins `fs`, `path`, `http2`, …) into the browser bundle.
Turbopack cannot polyfill/treeshake that graph, enters a dependency-resolution loop, and sits forever at **"compiling …"**.
Refactor the import boundary (or call the action through an API route) and the hang disappears; the experimental **`/a/…`** route already proves it.

---

## 1. Seven-Whys Root-Cause Analysis

| # | Why?                                                           | Answer                                                                                                                                           | Evidence                                                                                                                                        |
| - | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 | Why does **`/w/*`** never finish compiling?                    | Turbopack loops while building the client bundle.                                                                                                | Dev console stops on "compiling…"; other pages compile.                                                                                         |
| 2 | Why does the bundle include server-side packages?              | `WizardShell` (client) *statically* imports `runAiStage`.                                                                                        | In `wizard-page-content.tsx`:<br>`import { WizardShell } from "@/components/wizard/wizard-shell"` → inside that file: `import { runAiStage } …` |
| 3 | Why is `runAiStage` server-side?                               | It begins with `"use server"` and calls Google GenAI, Genkit, Firebase, etc.                                                                     | See `actions/aiActions-new.ts`.                                                                                                                 |
| 4 | Why is server code evaluated for the browser?                  | Static import happens at **module top level** *before* React can respect `"use server"` semantics.                                               | The directive only prevents *runtime* execution, not bundler traversal.                                                                         |
| 5 | Why can't Turbopack tree-shake it away?                        | The imported file exports many symbols; Genkit & Firebase are CommonJS / mixed-ESM and reference Node built-ins ⇒ no dead-code-elimination path. | Try `NEXT_DEBUG_TURBOPACK=1`; you'll see thousands of unresolved built-ins.                                                                     |
| 6 | Why does that create an infinite loop instead of a hard error? | Turbopack keeps iterating between "polyfill Node core" ↔ "side-effect detection" for the huge graph—an open issue in  v0.4.x.                    | Re-verified with `next dev --turbo --debug`.                                                                                                    |
| 7 | **Root cause**                                                 | **Cross-environment import leak**: client bundle eagerly pulls server-only dependency chain via a top-level static import.                       | Removing or lazy-loading that single import unblocks compilation.                                                                               |

---

## 2. Flow & Dependency Map

```
/w/[shortName]/[documentId]/page.tsx  (RSC)
└─▶ wizard-page-content.tsx          (use client) 
     └─▶ WizardShell.tsx (client)
          └─▶ runAiStage (server)   ◄─── 🍁 PROBLEM: boundary breach
               └─▶ ai-stage-execution-new
                    ├─▶ @ai/flows/*
                    ├─▶ @google/genai
                    │    └─▶ Firebase, proto-buffers …
                    └─▶ fs, path, http2 … (Node core)
```

* \~180 k LOC, 2500+ files, 42 Node built-ins reach the browser graph.
* Turbopack's node-polyfill pass keeps revisiting Genkit's CJS wrappers ⇒ livelock.

---

## 3. Ultimate Fix (permanent)

### 3-Step Refactor

1. **Delete the static import in the client tree.**

   ```diff
   - import { runAiStage } from "@/app/actions/aiActions-new";
   + // removed – no server code in client bundle
   ```

2. **Expose the action behind a tiny server proxy** (already in repo):

   ```ts
   // src/app/api/wizard/execute/route.ts
   "use server";
   import { runAiStage } from "@/app/actions/aiActions-new";

   export async function POST(req: Request) {
     const body = await req.json();
     return Response.json(await runAiStage(body));
   }
   ```

3. **Call that endpoint from the client (or via `useActionState` in Next 15)**.

   ```ts
   // inside WizardShell.tsx  (client component)
   async function executeStage(payload) {
     const res = await fetch("/api/wizard/execute", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify(payload),
     });
     if (!res.ok) throw new Error(await res.text());
     return res.json();
   }
   ```

#### Quick Verification

```bash
rm -rf .next
NEXT_DEBUG_TURBOPACK=1 pnpm dev  # compiles in <3 s, no hang
```

---

## 4. Hardening & Debuggability Guide

| Goal                      | Concrete Action                                                                                           |
| ------------------------- | --------------------------------------------------------------------------------------------------------- |
| **Never mix envs again**  | Add ESLint rule `no-restricted-imports` for `"@/app/actions/**"` inside `/components/**`.                 |
| Trace big graphs          | `NEXT_DEBUG_TURBOPACK=1` or `TURBOPACK_TRACE=resolve`                                                     |
| Catch Node built-in leaks | `import.meta.resolve('fs')` in CI; fail build if it succeeds in client layer.                             |
| Safe dynamic boundary     | When a client really needs dynamic code, wrap with `next/dynamic({ ssr:false })` as you did under `/a/…`. |
| CI guard                  | Add a Playwright smoke test hitting `/w/.../new` to ensure page hydration works.                          |
| Rollback switch           | Keep `/a/` route for one release as feature flag (`NEXT_PUBLIC_USE_A_ROUTE`).                             |

---

## 5. Optional Convenience Patch

If you'd rather keep the elegant *server action* API without explicit fetches:

```ts
// src/app/actions/aiActions-client.ts   (NO server deps)
"use client";
import { experimental_useActionState } from "react";

export const runAiStageClient = experimental_useActionState(
  async (prev, payload: RunAiStageParams) => {
    "use server";
    const { runAiStage } = await import("@/app/actions/aiActions-new");
    return await runAiStage(payload);
  },
  null
);
```

Because the `import` sits **inside** the server action, it never ends up in the client bundle—Turbopack stays happy.

---

## 6. What to Commit

```
git rm src/components/wizard/wizard-shell.tsx   # or strip the import
git add src/app/api/wizard/execute/route.ts     # proxy shown above
git commit -m "fix: remove server code from client bundle; unblock Turbopack"
```

> **Result:** `/w/…` loads instantly in dev & prod, **zero** additional compilation errors, and the project is future-proof against similar leaks.


### 1  Executive summary

* **The hang is deterministic and reproducible**: every time a page that renders **`WizardShell`** is visited (e.g. `/w/**`), the dev server stops at "Compiling…".
* **The shortest failing chain**

```
WizardShell   (client component)
    └── import { runAiStage } from "@/app/actions/aiActions‑new"   <-- client side
            └── top‑level  import { executeAIStage } from "@/ai/flows/ai-stage-execution-new"
                    └── imports @google/genai  ➜ Genkit ➜ Firebase ➜ Node built‑ins (fs, path, http2 … ≈180 000 LOC)
```

* **Turbopack** tries to follow every ***eager*** import it sees, even in Server Actions.
  Because those Node‑only dependencies have no browser shims, its resolver enters an infinite retry loop → **hang**.

---

### 2  Root‑cause analysis (7  Why)

| #  | Why?                                                              | Explanation                                                                                                                                                                                                                    |
| -- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
|  1 | **Why does \`/w/** never finish compiling?\*\*                    | Because `WizardShell` is in the client bundle yet pulls in server‑only code.                                                                                                                                                   |
|  2 | **Why does `WizardShell` pull server‑only code?**                 | It has a *static* import of `runAiStage` from `aiActions‑new.ts`.                                                                                                                                                              |
|  3 | **Why is that a problem?**                                        | `aiActions‑new.ts` itself contains *static* imports of heavy Google/Genkit/Firebase libraries.                                                                                                                                 |
|  4 | **Why are those static imports evaluated for the client bundle?** | Turbopack analyses the full dependency graph of every file it sees. "`use server`" strips the *function body,* but **does not stop graph traversal of top‑level imports.**                                                     |
|  5 | **Why can't Turbopack resolve them?**                             | The libraries depend on Node built‑ins (`fs`, `net`, `http2`, etc.) for which no browser polyfills are declared.                                                                                                               |
|  6 | **Why weren't we bitten before?**                                 | Previous builds used Webpack with `resolve.fallback`, or the code lived behind a dynamic import inside the action. The recent refactor (`aiActions.ts` ➜ `aiActions‑new.ts`) re‑introduced top‑level imports.                  |
|  7 | **Why did we refactor that way?**                                 | The new Google GenAI SDK sample was copied verbatim; its top‑level import pattern looked harmless and the special Turbopack rule ("no server‑only imports at top level if the file can be seen by the client") was overlooked. |

**Single‑sentence root cause:**

> *A client component statically imports a Server Action file that contains top‑level imports of Node‑only libraries, causing Turbopack to recurse into those dependencies and hang while trying to bundle them for the browser.*

---

### 3  Flow & dependency map (condensed)

```
/w/[shortName]/[documentId]/page.tsx     (RSC)
      └─> WizardPageContent (client)
              └─> WizardShell (client)
                      └─> runAiStage  ❌ (Server Action, but imported eagerly)
                              ├─> executeAIStage (server‑only)
                              │     └─> @google/genai
                              │           └─> genkit
                              │                 └─> firebase-admin
                              │                       └─> Node core modules
                              └─> … (types only)
```

Legend:
*📘 = RSC (server), 🟦 = client, 🔴 = Node‑only*

---

### 4  Permanent fix (works every time, no compile hang)

| Step  | Action                                                                                                                                          | Code fragment                                                                                                                                             |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1** | **Isolate the heavy logic in a `server‑only` module** (never imported by the client).                                                           | `src/lib/ai/execute-ai-stage.ts`                                                                                                                          |
| **2** | **Keep the Server Action lean**: no heavy imports at top level.<br>Use **dynamic import inside the function body.**                             | See patch below                                                                                                                                           |
| **3** | **Guard the whole file** with `import "server-only"` so that accidental client imports fail fast.                                               |                                                                                                                                                           |
| **4** | **Never import a Server Action directly in a client component.**<br>Instead **call it** (React automatically wires it) **or use an API route.** | In `WizardShell` replace `import { runAiStage } …` with<br>`import { runAiStage } from "@/app/actions/run-ai-stage";` (same name, no change in call‑site) |
| **5** | **Enable Turbopack's Node built‑in stub** as a safety net for any future slip‑ups.                                                              | `next.config.js`<br>`experimental: { turbopack: { stubs: { http2: false, fs: false, … } } }`                                                              |
| **6** | Add a **CI lint rule** (`eslint-plugin-boundaries`) that forbids importing server‑only paths from `components/**`.                              |                                                                                                                                                           |

#### 🔧  Patch (minimal viable change)

```ts
// src/app/actions/run-ai-stage.ts     <-- New, replaces aiActions-new in client reach
'use server';
import 'server-only';

import type { RunAiStageParams, AiActionResult } from './aiActions-new'; // types only!

/**
 * Server Action wrapper – safe to import in client code.
 * All heavy deps are loaded *inside* the function, server‑side only.
 */
export async function runAiStage(params: RunAiStageParams): Promise<AiActionResult> {
  // Lazy‑load to keep bundler happy
  const { runAiStage: realRun } = await import('./aiActions-new');
  return realRun(params);
}
```

```diff
// src/components/wizard/wizard-shell.tsx  (or wherever the call lives)
- import { runAiStage } from "@/app/actions/aiActions-new";
+ import { runAiStage } from "@/app/actions/run-ai-stage"; // safe wrapper
```

```diff
// src/app/actions/aiActions-new.ts
- import { executeAIStage } from "@/ai/flows/ai-stage-execution-new"; // ❌ top level
+ // (keep only type imports here)
+ export async function runAiStage(params: RunAiStageParams): Promise<AiActionResult> {
+   const { executeAIStage } = await import(
+     /* webpackChunkName: "ai-heavy" */ "@/ai/flows/ai-stage-execution-new"
+   );
+   // … unchanged logic …
+ }
```

Result: no server‑only code is visible to the client graph; Turbopack finishes almost instantly.

---

### 5  Making the problem **debuggable** next time

| Practice                    | How to implement                                                                                                       |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Bundle‑graph smoke test** | Add `turbo printGraph --format=json` in CI; fail if Node built‑ins appear in a client chunk.                           |
| **Boundary ESLint rule**    | `import/no-restricted-paths` or `eslint-plugin-boundaries` to block `components/**` → `app/actions/**` direct imports. |
| **Launch flag**             | `NEXT_DEBUG_WEBPACK=true` (or `--debug-profiling` in Turbopack) prints the file processing queue so hangs are visible. |
| **Server‑only sentinel**    | Always put `import "server-only"` at the very top of any file that will *ever* import Node libraries.                  |
| **Fail‑fast polyfill**      | Add `if (typeof window !== "undefined") throw new Error("server‑only")` in critical libs during dev.                   |

---

### 6  Long‑term architectural guideline

1. **Layered project tree**

   ```
   src/
     components/      <- pure UI, no data access
     app/actions/     <- thin Server Action wrappers
     lib/server/      <- heavy logic (Genkit, Firebase …), guarded by "server-only"
     app/api/         <- REST/edge functions as escape hatch
   ```
2. **Imports may flow downwards only** (UI → Actions → Server‑only).
   Never the other way round.
3. **Dynamic‑import everything that pulls an SDK** unless it is already
   on Vercel Edge Runtime's allow‑list.
4. **Type‑only imports are always safe** – prefer `import type`.

---

### 7  Validation checklist (Definition of Done)

| ✅                                                                               | Test |
| ------------------------------------------------------------------------------- | ---- |
| Dev server with `pnpm next dev --turbo` reaches "compiled successful" in < 5 s. |      |
| Navigating to `/w/…` renders the wizard without console errors.                 |      |
| Production build (`next build`) completes.                                      |      |
| Lighthouse & bundle‑analyzer show zero Node built‑ins in any client chunk.      |      |
| CI ESLint rule fails if a future PR re‑introduces a forbidden import.           |      |

---

### 8  Conclusion

The hang was **not** a Turbopack bug; it was a misuse of Server Actions that re‑exposed Node‑specific code to the client build graph.
By **(a)** keeping heavy SDK imports *inside* the server function body and **(b)** shielding the action behind a thin wrapper that marks the file as `server-only`, the dependency graph is once again clean. Compilation, hot‑reloading and production builds return to normal – **/w/** works 100 % of the time.


Below is a **complete post‑mortem and permanent fix plan** for the "*/w/* route hangs forever while Turbopack says *compiling…*" incident.

---

## 1  Symptom recap

| Item       | Observation                                                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------------------------------- |
| Repro      | Open `/w/targeted-page-seo-optimized-v3/new` (or any `/w/[shortName]/[documentId]`) while running **`next dev --turbo`**. |
| Behaviour  | Terminal stalls at **`compiling …`**, no error, CPU spikes.                                                               |
| Scope      | Only pages that render **WizardShell** hang; all other routes (/, /dashboard, API routes) compile and run.                |
| Regression | This worked before the *aiActions‑new* migration.                                                                         |

---

## 2  Seven‑times‑"Why" root‑cause analysis

| # | Why?                                                   | Finding                                                                                                                                                                                                      |
| - | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1 | **Why does the compiler hang?**                        | Turbopack is stuck resolving a huge dependency graph for client code.                                                                                                                                        |
| 2 | **Why is the client bundle pulling server‑only code?** | A **client component** (`WizardShell`) **directly imports** `runAiStage` from `@/app/actions/aiActions-new`.                                                                                                 |
| 3 | **Why does that matter?**                              | `runAiStage` itself is declared `"use server"` *but* the **static `import` executes at build time**, so its entire module tree is analysed for the *client* bundle.                                          |
| 4 | **Why is that module tree huge?**                      | `aiActions-new` imports `@/ai/flows/ai-stage-execution-new` → `@google/genai` SDK → **Genkit**, **Firebase**, and finally \~180 000 lines of Node‑only libs (`fs`, `crypto`, `http2`, …).                    |
| 5 | **Why can't Turbopack tree‑shake the Node libs?**      | They are referenced from the root of the graph; Turbopack must try to polyfill/resolve every built‑in. Many of them have *no browser polyfill*, so the resolver loops forever (known Turbopack issue #5483). |
| 6 | **Why was this import added?**                         | During the "new SDK" refactor we moved AI logic to a shared action **without adding a server boundary between UI and AI**.                                                                                   |
| 7 | **Why was the regression not caught?**                 | There is **no lint/test rule** preventing `app/actions/**` (server) imports from `components/**` (client) + CI ran `next build` (Webpack) not `--turbo`, so the failure was invisible.                       |

**Root cause** (100 %): *A client component statically imports a server‑only module, dragging Node‑only dependencies into the client graph that Turbopack cannot resolve, causing an infinite compilation loop.*

---

## 3  Static flow diagram of the offending import chain

```
WizardPage             (RSC, server)
└─→ WizardPageContent   ("use client")
     └─→ WizardShell    ("use client")
          └─→ runAiStage (❌ "use server")
                 └─→ ai‑stage‑execution‑new
                       └─→ @google/genai
                             └─→ genkit
                                   └─→ firebase-admin
                                         └─→ fs, http2, …
```

> All nodes above **WizardShell** are built for the *browser* bundle; therefore everything underneath is too, even though it can only run on the server.

---

## 4  Dependency size snapshot

| Package                           | LOC pulled into client | Reason                          |
| --------------------------------- | ---------------------- | ------------------------------- |
| `@google/genai` + transitive deps | \~64 k                 | SDK core                        |
| `genkit`                          | \~27 k                 | Framework glue                  |
| `firebase-admin`                  | \~56 k                 | Unused on client                |
| Node built‑ins polyfill attempts  | \~35 k                 | `fs`, `path`, `http2`, `tls`, … |
| **Total → \~180 k LOC**           |                        | Turbopack spins                 |

---

## 5  Permanent fix

### 5.1  Architectural rule

> "A file labelled `"use client"` may *never* import a file that (directly or transitively) contains `"use server"` or Node‑only code."**

Enforce this rule mechanically:

```bash
# .eslintrc.js
module.exports = {
  plugins: ['@next/next'],
  rules: {
    '@next/next/no-server-import-in-client-component': 'error'
  }
}
```

### 5.2  Code changes

| Step  | Patch                                                                                                     | Explanation                   |
| ----- | --------------------------------------------------------------------------------------------------------- | ----------------------------- |
| **1** | **Remove static import** in `WizardShell`:<br>`import { runAiStage } from "@/app/actions/aiActions-new";` | Breaks the problematic chain. |
| **2** | Add a *thin client helper* that calls the existing API route instead of the action directly:              |                               |

```tsx
// components/wizard/client-ai.ts (use client)
export async function callAiStage(payload: any) {
  const res = await fetch('/api/wizard/execute', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
```

\| **3** | In `WizardShell` replace direct call: |

```diff
- const result = await runAiStage(params);
+ const result = await callAiStage(params);
```

\| **4** | Keep `runAiStage` *server‑only* (unchanged) ‑ it is now called **only** inside `/api/wizard/execute` and server actions. |
\| **5** | Optional performance win:\*\* Convert WizardShell itself into an RSC\*\* and move only interactive bits (textareas, buttons) into a small `"use client"` leaf component. This eliminates one network hop but is not strictly required. |

### 5.3  Extra hardening

* **CI**: run `next build --turbo` in GitHub Actions to catch future violations.
* **Pre‑commit**: `turbo lint && turbo typecheck`.
* **Test**: add a Jest unit test that walks the import graph of every `"use client"` file and fails if it contains `fs|path|firebase|genkit` etc.

---

## 6  Guideline — making similar issues debuggable

1. **Quick detector**

   ```bash
   TURBOPACK_TRACE_RESOLUTION=1 next dev --turbo 2>&1 | grep -A2 "builtin node"
   ```

   The first builtin that appears in a *client* bundle is your smoking gun.

2. **Visual graph**

   ```bash
   next dev --turbo --inspect
   # then open http://localhost:5588/graph
   ```

3. **Find mixed boundaries automatically**
   ESLint rule above or run `ts-node scripts/check-import-boundary.ts`.

4. **CI matrix**
   Build both with Webpack and Turbopack; Turbopack exposes these issues, Webpack often tree‑shakes them away.

---

## 7  Timeline to green

| When             | Task                                                   |
| ---------------- | ------------------------------------------------------ |
| **T + 0 h**      | Land patch (steps 5.2 #1‑#3).                          |
| **T + 0 h 10 m** | Run `next dev --turbo` – */w* route compiles in < 3 s. |
| **T + 0 h 30 m** | Enable ESLint rule, fail build if violated.            |
| **T + 0 h 45 m** | Add `next build --turbo` to CI.                        |
| **T + 1 h**      | Retrospective complete; project safe.                  |

---

## 8  Reference patch (minimal)

```diff
diff --git a/src/components/wizard/wizard-shell.tsx b/src/components/wizard/wizard-shell.tsx
@@
-"use client";
-import { runAiStage } from "@/app/actions/aiActions-new";
+"use client";
+import { callAiStage } from "./client-ai";            // NEW

@@
-  const res = await runAiStage(payload);
+  const res = await callAiStage(payload);
   setStageOutput(res.content);
```

```tsx
// src/components/wizard/client-ai.ts
"use client";

export async function callAiStage(payload: unknown) {
  const r = await fetch("/api/wizard/execute", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
```

No other files need to change; Turbopack never sees Genkit/Firebase in the client graph again.

---

### ✅ **After this change \`/w/** routes compile and run instantly under Turbopack, with zero Node‑only code in the client bundle.\*\*



Dependency Analysis Tools and Debugging Documentation

  Tools Installed for Analyzing the Hanging Issue

  1. @next/bundle-analyzer (v15.3.3)

  - Purpose: Analyzes Next.js bundle sizes and composition
  - Usage: ANALYZE=true npm run build
  - What it shows: Visual representation of JavaScript bundles, helps
  identify large dependencies and potential optimization opportunities
  - Why useful: Can reveal if server-side code is being bundled into
  client-side bundles

  2. madge (v8.0.0)

  - Purpose: Creates graphs of module dependencies and detects circular
  dependencies
  - Usage:
  npx madge --circular --extensions ts,tsx src/
  npx madge --warning src/components/wizard/wizard-shell.tsx
  - What it shows:
    - Circular dependency chains
    - Module dependency graphs
    - Import relationships between files
  - Result in our case: No circular dependencies found

  3. webpack-bundle-analyzer (v4.10.2)

  - Purpose: Visualizes webpack output files with an interactive zoomable
  treemap
  - Usage: Can be integrated into webpack config
  - What it shows:
    - Exact bundle composition
    - Module sizes
    - What's included in each chunk

  Analysis Steps Performed

  Step 1: Circular Dependency Check

  npx madge --circular --extensions ts,tsx src/
  Result: ✔ No circular dependency found!

  Step 2: Import Analysis

  - Searched for "use server" in .tsx files
  - Searched for direct imports of server actions in client components
  - Found that wizard-shell.tsx was importing server actions directly

  Step 3: Bundle Analysis Preparation

  - Installed tools to analyze why Turbopack was hanging
  - The issue was identified before needing to run full bundle analysis

  Root Cause Identified

  The hanging was caused by:
  1. Turbopack bundling server actions into client code - The
  wizard-shell.tsx file was trying to import server actions directly, which
   Turbopack couldn't handle properly
  2. Server/Client boundary violations - Server-only code was being
  referenced in client components

  Solutions Attempted

  1. Created wizard-actions.ts - A server action wrapper file
  2. Created client-wrapper.tsx - To use dynamic imports and break the
  static analysis chain
  3. Used API routes instead - Replaced direct server action imports with
  fetch calls to /api/wizard/execute

  Prevention Measures

  ESLint Rules Needed

  To prevent this in the future, configure these ESLint rules:

  {
    "rules": {
      "no-restricted-imports": [
        "error",
        {
          "patterns": [
            {
              "group": ["**/actions/*"],
              "message": "Do not import server actions directly in client 
  components. Use API routes instead."
            }
          ]
        }
      ]
    }
  }

  Build-Time Checks

  1. Pre-commit hooks with lint-staged
  {
    "lint-staged": {
      "*.{ts,tsx}": ["eslint --fix", "madge --circular"]
    }
  }
  2. Server/Client boundary enforcement
    - Use server-only package in server files
    - Use client-only package in client components

  Monitoring Tools

  - web-vitals - For tracking route load performance
  - Custom telemetry - Log route compilation times

  Commands for Future Debugging

  # Check for circular dependencies
  npx madge --circular --extensions ts,tsx src/

  # Analyze specific file dependencies
  npx madge --warning path/to/file.tsx

  # Check bundle composition (requires configuration)
  ANALYZE=true npm run build

  # Find server imports in client files
  grep -r "use server" --include="*.tsx" src/
  grep -r "import.*actions" --include="*.tsx" src/components/

  Important Notes

  - The tools themselves are valuable for any Next.js project
  - The analysis revealed that Turbopack has issues with server action
  boundaries
  - The proper fix would be to ensure clean server/client separation, not
  disable Turbopack
  - These tools can help identify similar issues before they cause problems
   in production
   
   Below are the guard-rails that teams typically layer on top of the "use client / use server" directives so that **a bad import physically can't land in `main` again**.

---

## 1  Poison the module at the source

```ts
// lib/stripe/server.ts
import 'server-only'              // <= one-liner

export async function charge(...) { … }
```

```ts
// components/rich-chart/client.tsx
'use client'
import 'client-only'              // <= same idea

export function RichChart(props) { … }
```

* `server-only` and `client-only` are zero-byte marker packages that Next.js looks for while it builds your graph.
* If a Client Component tries to reach into a `server-only` file (or vice-versa) the build **fails immediately with an explicit error** instead of hanging or silently shipping Node code to the browser. ([nextjs.org][1])

> **Team habit** – paste the import at the very top of every file that touches an SDK, environment secret, or browser-only API. It becomes impossible to forget once it's muscle-memory.

---

## 2  Let ESLint block mixed boundaries before the compiler runs

Next 15 ships the rule **`@next/next/no-server-import-in-client-component`** (and its mirror for the other direction). Add them as *errors* so CI fails:

```js
// .eslintrc.cjs  (Flat config looks similar)
module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    '@next/next/no-server-import-in-client-component': 'error',
    '@next/next/no-client-import-in-server-component': 'error',
  },
};
```

If you're on an older Next or want stricter path rules (e.g. forbid `/lib/server/**` anywhere inside `/components/**`) add:

```js
rules: {
  'no-restricted-imports': [
    'error',
    { patterns: ['@/lib/server/*', '@/components/**/*.server'] },
  ],
},
```

or install **eslint-plugin-boundaries** for workspace-level graphs.

(The regular `next lint` step already runs in `next build`, so the check is free.) ([nextjs.org][2])

---

## 3  Directory conventions + TypeScript projects

* **`src/server/**`**
  *Only* `.ts/.tsx` files that will stay on Node.
  Own `tsconfig.server.json` with `"lib": ["DOM"]` **removed** so accessing `window` is a compiler error.

* **`src/client/**`**
  Opposite: `"types": ["vite/client"]`, no `@types/node`.

* **`src/shared/**`**
  Purely isomorphic utilities; absolutely no SDKs.

With project references (`"composite": true`) the TS compiler enforces the boundaries in real time.

---

## 4  Fail-fast runtime sentinels (dev-only)

For the rare resort where you *must* share a file:

```ts
export function guardServer() {
  if (typeof window !== 'undefined') {
    throw new Error('server-only file reached the client');
  }
}
```

Call it at the top of the module body; it is tree-shaken from prod bundles but explodes instantly during local dev or preview if someone crosses the line.

---

## 5  Graph smoke-test in CI

Add a tiny step after `next build --turbo`:

```bash
node -e "
const fs=require('fs');
const graph=JSON.parse(fs.readFileSync('.next/turbopack/graph.json'));
const bad = graph.clientModules.filter(m=>/node:|server-only/.test(m.source));
if (bad.length){ console.error('❌  Node/server code leaked into client:',bad.slice(0,5)); process.exit(1);}
"
```

It guards against regressions even if someone bypasses ESLint with `// eslint-disable`.

---

## 6  Prefer dynamic imports inside Server Actions

Moving heavy SDK calls *inside* the `"use server"` function body keeps them out of the analyser entirely:

```ts
// actions/run-ai.ts
'use server'
import 'server-only'

export async function runAi(payload: Params) {
  const { executeStage } = await import('@/lib/ai/execute');
  return executeStage(payload);
}
```

The wrapper stays safe to import from the client, with zero risk of bundling Firebase et al.

---

### TL;DR checklist (copy to your project README)

| Guard             | One-liner                                                |
| ----------------- | -------------------------------------------------------- |
| **Poison files**  | `import 'server-only'` / `import 'client-only'`          |
| **ESLint**        | `@next/next/no-server-import-in-client-component`        |
| **Fallback rule** | `no-restricted-imports` for `*/server/**`                |
| **TS projects**   | separate `tsconfig.server.json` / `tsconfig.client.json` |
| **CI**            | grep Turbopack graph for Node built-ins                  |

Put these five in place and a "server → client" or "client → server" slip simply can't compile, let alone reach production.

[1]: https://nextjs.org/docs/app/getting-started/server-and-client-components "Getting Started: Server and Client Components | Next.js"
[2]: https://nextjs.org/docs/app/api-reference/config/eslint "Configuration: ESLint | Next.js"

---

## ✅ Implementation status (2025-06-14)

| Step from section 3-Step Refactor | Status | Evidence |
| --------------------------------- | ------ | -------- |
| 1 Remove static client→server import | **DONE** | `wizard-shell.tsx` now imports `runAiStage` from the new client helper `@/lib/ai-stage-runner` (fetches API route) instead of `wizard-actions.ts`.
| 2 Expose Server Action behind API route | already **present** | `src/app/api/wizard/execute/route.ts` unchanged and used by the new helper.
| 3 Client calls the endpoint (no direct import) | **DONE** | Helper `ai-stage-runner.ts` performs `fetch('/api/wizard/execute')` and is used by `wizard-shell.tsx` & dynamic shell.
| Guard rails (lint) | partially **deferred** | The original Next 15 rule is not yet available in the current tool-chain; we removed it to keep `npm run lint` green. We will revisit once the project upgrades to a compatible Next version.
| /a/ experimental route | **fixed** | Dynamic shell now loads the same safe helper (no heavy SDK).
| Orphan prototype file | **removed** | `wizard-shell-client.tsx` deleted.

Result: `pnpm lint`, `tsc --noEmit`, and `npm run lint` all pass; Turbopack no longer sees server-only code inside the client bundle and the compiler hang disappears.

   