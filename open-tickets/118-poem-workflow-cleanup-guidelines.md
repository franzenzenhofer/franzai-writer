# Ticket #118: Poem Workflow Cleanup & Blueprint Improvements (Non-Breaking)

**Priority:** Medium  
**Type:** Internal Refactor / Maintainability  
**Components:** `src/workflows/poem-generator/workflow.json`, Parser, Wizard UI  
**Status:** Open  

---

## Executive Summary
The **Poem Generator** workflow is our most mature "full-funnel" example and will be the *reference blueprint* for all future workflows. While it runs correctly, the JSON carries noise, duplicated metadata, and some half-implemented conventions. This ticket proposes a **non-breaking** clean-up that removes low-value data, documents existing logic, and lays *minimal* groundwork for future evolutions—without changing runtime behaviour.

---

## Pain Points & Root-Cause Analysis
| # | Symptom | Root Cause | Impact |
|---|---------|-----------|--------|
| 1 | `showThinking:false` repeated | Default already *false* → legacy copy-paste | File noise, diff-bloat |
| 2 | `tokenEstimate` numbers drift | Manual guesswork; UI only shows a tooltip | Inaccurate info, maintenance cost |
| 3 | Large inline `promptTemplate` strings | Parser lacks file-loader for markdown | Hard to read, noisy diffs |
| 4 | `autoRun` **vs** `autorunDependsOn` looks redundant | They solve **different** problems (see below) but lack docs | On-boarding confusion |
| 5 | `jsonFields` duplicated info from `formFields` | Display renderer requires explicit array | Boiler-plate |
| 6 | Field-name inconsistencies (`count`, `numImages`) | No enforced naming guideline | Cognitive friction |
| 7 | Cannot group stages visually | No `phase` metadata | UI gets cluttered for long flows |

### Detail: `autoRun` vs `autorunDependsOn`
* **`autoRun:boolean`** – "This stage *may* trigger automatically once it is *active*."  
* **`dependencies:string[]`** – Define *activation* (when a stage becomes visible).  
* **`autorunDependsOn:string[]`** – *Additional* conditions before *auto-run* fires. Used in Poem flow so `generate-html-preview` waits for *either* `html-briefing` 👩‍💻 **or** explicit user skip.

Keeping both fields avoids overloading `dependencies` and preserves backward compatibility. We *will* better document this distinction.

### Detail: `tokenEstimate`
Only consumed in one place:  
```190:194:src/components/wizard/stage-info-overlay.tsx
{stage.tokenEstimate !== undefined && stage.tokenEstimate > 0 && (
  <span>~{stage.tokenEstimate.toLocaleString()}</span>
)}
```  
Purely cosmetic. We can safely drop the property; if desired, the overlay could estimate tokens from prompt length on the fly.

### Detail: External `aiTemplate` Support
The **Stage** type has an optional `aiTemplate` key, but no code path reads it—only export-format objects use it. Therefore external markdown templates for ordinary stages **do not actually work yet**. Implementing it touches:
* Loader in `ai-stage-execution.ts` (read file, substitute vars)
* Next.js bundler (make sure MD files are available in both server & client)
* Vite dev server hot-reload

---

## Revised Implementation Plan
All steps are *non-breaking*; legacy workflows load unchanged.

### A. Parser & UI Enhancements
1. **Global Defaults**  
   – Omit `showThinking:false`; default stays `false`.  
   – Accept missing `tokenEstimate`; Stage-info overlay hides badge when absent.  
2. **`jsonFields` Autogeneration**  
   – If `outputType==='json'` and `jsonFields` is *undefined*, derive array from `formFields` (`name`→`key`). No magic strings needed.
3. **`phase` Metadata**  
   – Optional `phase:string` on stages; UI can collapse sections later.
4. **External `aiTemplate` Loader** *(stretch, but desirable)*  
   – If `aiTemplate` present, load markdown file, else fallback to `promptTemplate`.

### B. Poem Workflow Cleanup
1. Remove every redundant `showThinking:false`, `tokenEstimate:0`, and any `model`/`temperature` equal to workflow default.  
2. Harmonise field names to kebab-case and single canonical identifier (`numberOfImages` etc.).  
3. Add `phase` keys for clarity.

---

## Success Criteria
- Poem workflow JSON size reduced & easier to read (≤ 250 LOC).
- **Zero breaking changes**: existing workflows (including Poem) load and run exactly as before.
- **All Poem-related e2e tests** (`tests/e2e/*poem*.spec.ts`) pass without modification.
- Parser compiles old and new workflow files identically (snapshot test).
- Other workflows can copy Poem workflow with minimal edits.
- No UI regression in wizard, image generation, or export stages.

---
**Estimated Effort**: 6-8 hours (parser tweaks + documentation)  
**Impact**: Medium-High – boosts maintainability & scalability across all future workflows. 