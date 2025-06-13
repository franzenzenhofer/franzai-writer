# TURBOPACK LEARNINGS

## Critical Issues Found

### 1. Next.js 15.2.2 Compilation Hang
- **Issue**: Turbopack gets stuck in endless compilation loop
- **Symptoms**: Shows "compiling..." indefinitely, high CPU/memory usage
- **Cause**: Often circular dependencies that Turbopack doesn't catch
- **Solution**: Check for circular imports, downgrade to 15.2.0 if needed

### 2. Server Actions + Client Components = Problems
- **Issue**: "Failed to find Server Action" errors
- **Cause**: Re-exporting server actions and passing them to client components
- **Solution**: 
  - Define server actions directly in the file where used
  - Import server actions directly in client components
  - Use API routes as intermediary

### 3. Barrel Exports Don't Tree-Shake
- **Issue**: Tree-shaking optimization doesn't work with barrel files
- **Impact**: Larger bundle sizes, potential compilation issues
- **Solution**: Avoid barrel exports at server/client boundaries

## Architecture Best Practices

### 1. Clear Server/Client Boundaries
```
✅ GOOD:
Server Component → API Route → Client Component
Client Component → fetch() → API Route → Server Logic

❌ BAD:
Server Component → Client Component (with server action imports)
Client Component → import { serverAction } from './actions'
```

### 2. Server Actions Isolation
```
✅ GOOD:
// api/execute/route.ts
import { serverAction } from '@/actions';
export async function POST(req) {
  const result = await serverAction(await req.json());
  return Response.json(result);
}

// client-component.tsx
async function callAction(data) {
  const res = await fetch('/api/execute', { 
    method: 'POST',
    body: JSON.stringify(data)
  });
  return res.json();
}

❌ BAD:
// client-component.tsx
import { serverAction } from '@/actions';
```

### 3. Module-Level Side Effects
```
✅ GOOD:
// Lazy initialization
let instance;
export function getInstance() {
  if (!instance) {
    instance = new Thing();
  }
  return instance;
}

❌ BAD:
// Module-level initialization
const instance = new Thing(); // Runs on import!
export { instance };
```

## Debugging Techniques

### 1. Enable Tracing
```bash
NEXT_TURBOPACK_TRACING=1 next dev --turbopack
# Creates .next/trace-turbopack for analysis
```

### 2. Check for Circular Dependencies
```bash
# Run without Turbopack to see if it catches circular deps
rm -rf .next
next dev # without --turbopack flag
```

### 3. Incremental Testing
- Add ONE import at a time
- Test with curl after each change
- If hang: kill server, remove last import

## Known Workarounds

### 1. For Server Actions in Client Components
- Use API routes as proxy
- Define actions inline if small
- Use dynamic imports with ssr: false

### 2. For Compilation Hangs
- Check for circular dependencies
- Remove barrel exports
- Simplify import chains
- Use direct imports instead of index files

### 3. For Memory Issues
```bash
# Debug memory usage
next build --experimental-debug-memory-usage
```

## Our Specific Issues

### Problem: WizardShell imports server action
- **Symptom**: Page hangs when loading
- **Root Cause**: Client component importing server action directly
- **Fix**: Use API route to call server action

### Problem: Firebase barrel exports
- **Symptom**: Complex initialization at module level
- **Root Cause**: Module-level throws and complex exports
- **Fix**: Separate auth functions, lazy initialization

### Problem: Cross-boundary imports
- **Symptom**: Server component imports client component with server dependencies
- **Root Cause**: Mixing server and client code in import chain
- **Fix**: Clear separation with API routes as bridge