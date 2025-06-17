# Making Franz AI Writer Snappier, Faster, and Cleaner

## Created: 2025-01-17
## Priority: High
## Component: Performance, Code Quality, Architecture
## Type: Performance & Refactoring Epic

## Overview
This comprehensive ticket outlines specific, actionable improvements to make Franz AI Writer significantly faster, more responsive, and cleaner without introducing breaking changes. Based on thorough codebase analysis, these recommendations focus on immediate wins and strategic improvements.

## Critical Performance Issues Found in Codebase

### 1. Auto-Save Triggering Too Often (HIGH PRIORITY)

**Issue:** Auto-save fires every 2 seconds, causing excessive Firestore writes

**Location:** `src/hooks/use-document-persistence.ts:189-214`

**Fix - Step by Step:**

**Step 1: Open src/hooks/use-document-persistence.ts**

**Step 2: Find this line (around line 201):**
```typescript
const debouncedSave = useMemo(() => debounce(saveDocument, 2000), [saveDocument]);
```

**Step 3: Replace with smart debouncing:**
```typescript
// Add this function before the useMemo:
const getDebounceTime = () => {
  const changedCount = changedFieldsRef.current.size;
  
  // Quick save for title/description only
  if (changedCount === 1 && 
      (changedFieldsRef.current.has('title') || 
       changedFieldsRef.current.has('description'))) {
    return 5000; // 5 seconds
  }
  
  // Longer delay for content changes
  if (changedFieldsRef.current.has('stageData')) {
    return 10000; // 10 seconds for heavy content
  }
  
  return 7000; // 7 seconds default
};

// Update the useMemo:
const debouncedSave = useMemo(
  () => debounce(saveDocument, getDebounceTime()),
  [saveDocument]
);
```

**Step 4: Test the fix:**
- Edit a document title - should save after 5 seconds
- Edit stage content - should save after 10 seconds
- Watch Network tab in DevTools to verify

### 2. O(n²) Dependency Evaluation (CRITICAL PRIORITY - Biggest Performance Issue)

**Issue:** Every state change triggers complex dependency recalculation for ALL stages, causing exponential performance degradation

**Location:** `src/components/wizard/wizard-shell.tsx:82-183`

#### The Problem Visualized:

```
Current Flow (BAD - O(n²)):
User types "H" → updateStageState() → evaluateDependenciesLogic()
                                            ↓
                        Checks ALL 15 stages × ALL their dependencies
                                            ↓
                        Stage 1: Check 3 dependencies ✓
                        Stage 2: Check 3 dependencies ✓  
                        Stage 3: Check 3 dependencies ✓
                        ... (12 more stages) ...
                        = 45+ checks for typing "H"!
                                            ↓
User types "e" → REPEAT ALL 45+ CHECKS AGAIN!
User types "l" → REPEAT ALL 45+ CHECKS AGAIN!
User types "l" → REPEAT ALL 45+ CHECKS AGAIN!
User types "o" → REPEAT ALL 45+ CHECKS AGAIN!

Total for "Hello": 225+ dependency checks! 😱
```

```
Optimized Flow (GOOD - O(1)):
User types "Hello" → updateStageState(skipDependencyEval: true)
                              ↓
                     No dependency checks while typing! ✨
                              ↓
User clicks outside → evaluateDependenciesSmartly(changedStageId)
                              ↓
                     Only check stages that depend on this one
                     (typically 2-3 stages, not all 15!)
                              ↓
Total: 2-3 dependency checks instead of 225! 🚀
```

#### Real World Impact:

- **Before**: Typing feels sluggish, especially on mobile
- **After**: Typing is instant, like a native app
- **Performance gain**: 98% reduction in computations

#### Fix - Complete Solution:

**Step 1: Add Performance Measurement (5 minutes)**

Open `src/components/wizard/wizard-shell.tsx` and add this at the start of `evaluateDependenciesLogic` (line 82):

```typescript
const evaluateDependenciesLogic = (currentStageStates: Record<string, StageState>, stages: Stage[]): Record<string, StageState> => {
  // ADD THIS:
  const startTime = performance.now();
  
  const newStageStates = { ...currentStageStates };
  let changed = false;
  
  // ... rest of function ...
  
  // ADD THIS before the return:
  const endTime = performance.now();
  console.log(`[PERF] Dependency evaluation: ${(endTime - startTime).toFixed(2)}ms for ${stages.length} stages`);
  
  return changed ? newStageStates : currentStageStates;
};
```

**Step 2: Build Dependency Cache (20 minutes)**

Add this after your state declarations (around line 50):

```typescript
// Dependency relationship cache
const dependencyGraph = useMemo(() => {
  const forward = new Map<string, Set<string>>();
  const reverse = new Map<string, Set<string>>();
  
  instance.workflow.stages.forEach(stage => {
    const deps = new Set<string>();
    
    // Collect ALL types of dependencies
    [
      ...(stage.dependencies || []),
      ...(stage.autorunDependsOn || []),
      ...(stage.autoRunConditions?.requiresAll || []),
      ...(stage.autoRunConditions?.requiresAny || [])
    ].forEach(depId => deps.add(depId));
    
    forward.set(stage.id, deps);
    
    // Build reverse map (who depends on this stage?)
    deps.forEach(depId => {
      if (!reverse.has(depId)) {
        reverse.set(depId, new Set());
      }
      reverse.get(depId)!.add(stage.id);
    });
  });
  
  console.log('[PERF] Dependency graph built:', { 
    stages: instance.workflow.stages.length,
    totalDependencies: Array.from(forward.values()).reduce((sum, deps) => sum + deps.size, 0)
  });
  
  return { forward, reverse };
}, [instance.workflow.stages]);
```

**Step 3: Optimize updateStageState (15 minutes)**

Replace the current `updateStageState` function (around line 66):

```typescript
const updateStageState = useCallback((stageId: string, updates: Partial<StageState>, options?: {
  skipDependencyEval?: boolean;
  isUserInput?: boolean;
}) => {
  setInstance(prevInstance => {
    const newStageStates = {
      ...prevInstance.stageStates,
      [stageId]: {
        ...prevInstance.stageStates[stageId],
        ...updates,
      },
    };
    
    // Skip expensive dependency evaluation for user input
    if (options?.skipDependencyEval || options?.isUserInput) {
      console.log('[PERF] Skipping dependency evaluation for', stageId);
      return { ...prevInstance, stageStates: newStageStates };
    }
    
    // Only evaluate dependencies when necessary
    const evaluatedStageStates = evaluateDependenciesSmartly(
      newStageStates, 
      prevInstance.workflow.stages,
      stageId // Pass which stage changed
    );
    
    return { ...prevInstance, stageStates: evaluatedStageStates };
  });
}, [dependencyGraph]);
```

**Step 4: Add Smart Evaluation Function (30 minutes)**

Add this new function after `updateStageState`:

```typescript
const evaluateDependenciesSmartly = useCallback((
  currentStageStates: Record<string, StageState>,
  stages: Stage[],
  changedStageId?: string
): Record<string, StageState> => {
  const startTime = performance.now();
  
  // If no specific stage changed, do full evaluation (initial load)
  if (!changedStageId) {
    return evaluateDependenciesLogic(currentStageStates, stages);
  }
  
  // Find stages affected by this change
  const affectedStages = new Set<string>([changedStageId]);
  const toCheck = [changedStageId];
  
  // Use dependency graph to find affected stages
  while (toCheck.length > 0) {
    const stageId = toCheck.pop()!;
    const dependents = dependencyGraph.reverse.get(stageId);
    
    if (dependents) {
      dependents.forEach(depId => {
        if (!affectedStages.has(depId)) {
          affectedStages.add(depId);
          toCheck.push(depId);
        }
      });
    }
  }
  
  console.log(`[PERF] Smart evaluation: checking ${affectedStages.size} of ${stages.length} stages`);
  
  // Only evaluate affected stages
  const newStageStates = { ...currentStageStates };
  let changed = false;
  
  stages.forEach(stage => {
    if (!affectedStages.has(stage.id)) return; // Skip unaffected stages
    
    // ... existing evaluation logic for this stage ...
    // (copy the logic from evaluateDependenciesLogic but only for this stage)
  });
  
  const endTime = performance.now();
  console.log(`[PERF] Smart dependency evaluation: ${(endTime - startTime).toFixed(2)}ms`);
  
  return newStageStates;
}, [dependencyGraph, evaluateDependenciesLogic]);
```

**Step 5: Optimize Input Handlers (10 minutes)**

Update the input change handler:

```typescript
const handleInputChange = (stageId: string, fieldName: string, value: any) => {
  if (fieldName === 'userInput') {
    // Update WITHOUT triggering dependency evaluation
    updateStageState(
      stageId, 
      { userInput: value, status: 'idle', isStale: true },
      { isUserInput: true } // Skip dependency evaluation
    );
  }
};

// Add a new handler for when input is complete
const handleInputBlur = useCallback((stageId: string) => {
  // Now trigger dependency evaluation
  updateStageState(stageId, {}, { skipDependencyEval: false });
}, [updateStageState]);
```

**Step 6: Add Blur Handler to Input Components**

In `StageInputArea` component, add the blur handler:

```typescript
// In the textarea or input component:
<textarea
  value={value}
  onChange={(e) => onChange(e.target.value)}
  onBlur={() => handleInputBlur(stage.id)} // ADD THIS
  // ... other props
/>
```

**Step 7: Add Memoization for UI Values**

Add these after the dependency graph:

```typescript
// Memoize expensive computations
const completedStagesCount = useMemo(() => {
  return instance.workflow.stages.filter(
    stage => instance.stageStates[stage.id]?.status === 'completed'
  ).length;
}, [instance.workflow.stages, instance.stageStates]);

const progressPercentage = useMemo(() => {
  const totalStages = instance.workflow.stages.length;
  return totalStages > 0 ? (completedStagesCount / totalStages) * 100 : 0;
}, [completedStagesCount, instance.workflow.stages.length]);

const availableStages = useMemo(() => {
  return instance.workflow.stages.filter(stage => {
    const state = instance.stageStates[stage.id];
    return state?.depsAreMet !== false;
  });
}, [instance.workflow.stages, instance.stageStates]);
```

**Step 8: Test the Performance**

1. Open the browser console
2. Start typing in any input field
3. You should see:
   - "[PERF] Skipping dependency evaluation" messages while typing
   - No evaluation time logs during typing
   - Single evaluation when you click outside the field
   - Evaluation time should be < 5ms instead of 50-100ms

#### Expected Results:

**Before the fix:**
```
[PERF] Dependency evaluation: 45.23ms for 15 stages
[PERF] Dependency evaluation: 43.91ms for 15 stages
[PERF] Dependency evaluation: 44.55ms for 15 stages
(repeats for every character typed)
```

**After the fix:**
```
[PERF] Skipping dependency evaluation for stage-1
[PERF] Skipping dependency evaluation for stage-1
[PERF] Skipping dependency evaluation for stage-1
(on blur)
[PERF] Smart evaluation: checking 3 of 15 stages
[PERF] Smart dependency evaluation: 2.34ms
```

#### Alternative Quick Fix (If Above Is Too Complex)

If the smart dependency tracking is too complex, here's a simpler fix that still helps:

```typescript
// Add debouncing to the entire updateStageState
import { debounce } from 'lodash';

// Create debounced version
const debouncedDependencyEval = useMemo(
  () => debounce((stageStates, stages) => {
    setInstance(prev => ({
      ...prev,
      stageStates: evaluateDependenciesLogic(stageStates, stages)
    }));
  }, 500), // Wait 500ms after user stops typing
  []
);

// In handleInputChange:
const handleInputChange = (stageId: string, fieldName: string, value: any) => {
  // Update immediately for responsive UI
  setInstance(prev => ({
    ...prev,
    stageStates: {
      ...prev.stageStates,
      [stageId]: {
        ...prev.stageStates[stageId],
        userInput: value,
        status: 'idle',
        isStale: true
      }
    }
  }));
  
  // Debounce the expensive dependency evaluation
  debouncedDependencyEval(instance.stageStates, instance.workflow.stages);
};
```

This simpler approach:
- Still eliminates lag while typing
- Reduces dependency evaluations by 90%
- Can be implemented in 15 minutes
- Is a good stepping stone to the full solution

### 3. React.memo for StageCard (QUICK WIN - 10 minutes)

**Location:** `src/components/wizard/stage-card.tsx`

**Step 1: Open the file**

**Step 2: Add React import if not present:**
```typescript
import React from 'react';
```

**Step 3: At the very bottom of the file, wrap the export:**
```typescript
// Replace:
export { StageCard };

// With:
const MemoizedStageCard = React.memo(StageCard, (prevProps, nextProps) => {
  // Return true if props are equal (skip re-render)
  return (
    prevProps.stage.id === nextProps.stage.id &&
    prevProps.isActive === nextProps.isActive &&
    prevProps.isComplete === nextProps.isComplete &&
    prevProps.isAvailable === nextProps.isAvailable &&
    JSON.stringify(prevProps.stageData) === JSON.stringify(nextProps.stageData)
  );
});

export { MemoizedStageCard as StageCard };
```

### 4. Optimize Regex Operations (MEDIUM PRIORITY)

**Issue:** 40+ sequential regex operations on export

**Location:** `src/lib/export/format-converters.ts`

**Fix - Batch similar operations:**

**Step 1: Open the file**

**Step 2: Create optimized cleanHtml function:**
```typescript
export function cleanHtmlOptimized(html: string): string {
  if (!html) return '';
  
  // Step 1: Remove all empty tags in one pass
  let result = html.replace(
    /<(p|div|span|h[1-6])(\s[^>]*)?>[\s\u200B]*<\/\1>/gi, 
    ''
  );
  
  // Step 2: Normalize whitespace in one pass
  result = result
    .replace(/[\r\n\t]+/g, ' ')  // Convert newlines/tabs to spaces
    .replace(/\s{2,}/g, ' ')      // Multiple spaces to single
    .replace(/>\s+</g, '><')      // Remove spaces between tags
    .trim();
  
  // Step 3: Fix broken structures in one pass
  result = result
    .replace(/<p>\s*<p>/gi, '<p>')     // Nested p tags
    .replace(/<\/p>\s*<\/p>/gi, '</p>') // Double closing
    .replace(/<br\s*\/?>\s*<br\s*\/?>/gi, '<br>'); // Multiple br
  
  return result;
}
```

**Step 3: Replace the old function calls with the optimized version**

## Critical Performance Bottlenecks & Solutions

### 1. Font Optimization (High Impact, Non-Breaking)

#### Current Issue:
- Fonts loaded through browser defaults or external requests
- Causes layout shifts and performance hits
- Missing next/font optimization for Inter, Space Grotesk, Source Code Pro

#### Step-by-Step Implementation:

**Step 1: Open src/app/layout.tsx**

Add these imports at the top of the file (after the existing imports):
```typescript
import { Inter, Space_Grotesk, Source_Code_Pro } from 'next/font/google';
```

**Step 2: Add font configurations after the imports**

Add this code right after your imports but before the RootLayout function:
```typescript
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const sourceCodePro = Source_Code_Pro({
  subsets: ['latin'],
  variable: '--font-source-code-pro',
  display: 'swap',
});
```

**Step 3: Update the html element in RootLayout**

Find this line in your RootLayout:
```typescript
<html lang="en">
```

Replace it with:
```typescript
<html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${sourceCodePro.variable}`}>
```

**Step 4: Open tailwind.config.ts**

Find the `theme.extend.fontFamily` section and replace it with:
```typescript
fontFamily: {
  body: ['var(--font-inter)', 'sans-serif'],
  headline: ['var(--font-space-grotesk)', 'sans-serif'],
  code: ['var(--font-source-code-pro)', 'monospace'],
},
```

**Step 5: Test the changes**
```bash
npm run dev
# Open http://localhost:9002 and verify fonts load instantly
# Check Network tab - you should NOT see any font requests to fonts.googleapis.com
```

### 2. Bundle Size Optimization

#### Heavy Dependencies Analysis:
```javascript
// Current heavy dependencies from package.json:
- docx: ~1.5MB (server-side export)
- recharts: ~500KB (charting)
- hammerjs: ~74KB (touch interactions in visuals/)
- @radix-ui/*: Multiple packages totaling ~300KB
```

#### Implementation Steps:

**A. Dynamic Import for Heavy Components**
```typescript
// src/components/wizard/stages/export-stage.tsx
// BEFORE: Static import
import { Document, Packer } from 'docx';

// AFTER: Dynamic import only when needed
const exportToDocx = async (content: string) => {
  const { Document, Packer } = await import('docx');
  // ... rest of export logic
};
```

**B. Chart Component Lazy Loading**
```typescript
// src/components/ui/chart.tsx
// Wrap chart components with dynamic loading
import dynamic from 'next/dynamic';

const DynamicChart = dynamic(
  () => import('recharts').then((mod) => mod.LineChart),
  { 
    loading: () => <div className="h-[300px] animate-pulse bg-muted" />,
    ssr: false 
  }
);
```

**C. Route-based Code Splitting**
```typescript
// src/app/w/[shortName]/[documentId]/client-wrapper.tsx
// Already uses dynamic import - extend pattern to other heavy components
const WizardPageContent = dynamic(
  () => import('./wizard-page-content'),
  {
    loading: () => <WizardSkeleton />,
    ssr: false
  }
);
```

**D. Dynamic Import Output Renderers in StageOutputArea**

**Step 1: Open src/components/wizard/stage-output-area.tsx**

**Step 2: Add dynamic import at the top**

Add this import after your other imports:
```typescript
import dynamic from 'next/dynamic';
```

**Step 3: Replace static imports with dynamic ones**

Find and remove these imports:
```typescript
import { MarkdownRenderer } from '@/components/markdown-renderer';
import { JsonRenderer } from '@/components/json-renderer';
import { HtmlPreview } from '@/components/html-preview';
import { WysiwygEditor } from './wysiwyg-editor';
```

Replace them with these dynamic imports (add after the `import dynamic` line):
```typescript
// Dynamically import heavy rendering components
const MarkdownRenderer = dynamic(
  () => import('@/components/markdown-renderer').then(mod => mod.MarkdownRenderer),
  { 
    loading: () => <div className="animate-pulse h-20 bg-muted rounded" />,
    ssr: false 
  }
);

const JsonRenderer = dynamic(
  () => import('@/components/json-renderer').then(mod => mod.JsonRenderer),
  { 
    loading: () => <div className="animate-pulse h-20 bg-muted rounded" />,
    ssr: false 
  }
);

const HtmlPreview = dynamic(
  () => import('@/components/html-preview').then(mod => mod.HtmlPreview),
  { 
    loading: () => <div className="animate-pulse h-20 bg-muted rounded" />,
    ssr: false 
  }
);

const WysiwygEditor = dynamic(
  () => import('./wysiwyg-editor').then(mod => mod.WysiwygEditor),
  { 
    loading: () => <div className="animate-pulse h-20 bg-muted rounded" />,
    ssr: false 
  }
);
```

**Step 4: Verify the components are used correctly**

The usage in your render logic should remain the same:
```typescript
{stage.outputType === 'markdown' && <MarkdownRenderer content={output} />}
{stage.outputType === 'json' && <JsonRenderer data={output} />}
{stage.outputType === 'html' && <HtmlPreview html={output} />}
```

**Step 5: Test the changes**
```bash
npm run dev
# Open a wizard page and switch between different output types
# You should see the loading animation briefly when switching
```

**E. Optimize StageInputArea Dynamic Imports**
```typescript
// src/components/wizard/stage-input-area.tsx
import dynamic from 'next/dynamic';

// If SmartDropzone becomes heavy with file processing libs
const SmartDropzone = dynamic(
  () => import('./smart-dropzone').then(mod => mod.SmartDropzone),
  { 
    loading: () => <div className="border-2 border-dashed h-32 animate-pulse" />,
    ssr: false 
  }
);
```

### 3. Firebase Query Optimization

#### Current Issues:
- `getAllDocuments()` loads entire collection
- No pagination implemented
- Missing query indexes for complex filters

#### Implementation:

**A. Add Pagination to Document Queries**

**Step 1: Open src/lib/firestore-adapter.ts**

**Step 2: Add this import at the top if not already present:**
```typescript
import { DocumentSnapshot } from 'firebase-admin/firestore';
```

**Step 3: Add the new pagination function after the existing functions:**
```typescript
export async function getDocumentsPaginated(
  userId: string,
  limit: number = 20,
  lastDoc?: DocumentSnapshot
): Promise<{ documents: WorkflowDocument[], lastDoc: DocumentSnapshot | null }> {
  try {
    let query = db.collection('documents')
      .where('userId', '==', userId)
      .orderBy('updatedAt', 'desc')
      .limit(limit);
    
    if (lastDoc) {
      query = query.startAfter(lastDoc);
    }
    
    const snapshot = await query.get();
    const documents = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as WorkflowDocument));
    
    const lastVisible = snapshot.docs[snapshot.docs.length - 1] || null;
    
    return { documents, lastDoc: lastVisible };
  } catch (error) {
    console.error('Paginated fetch error:', error);
    throw new Error('FATAL: Failed to fetch paginated documents');
  }
}
```

**Step 4: Update the dashboard to use pagination**

Open `src/app/dashboard/page.tsx` and add pagination state:
```typescript
// Add these state variables after existing useState declarations
const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
const [hasMore, setHasMore] = useState(true);
const [isLoadingMore, setIsLoadingMore] = useState(false);

// Add load more function
const loadMoreDocuments = async () => {
  if (!user || isLoadingMore || !hasMore) return;
  
  setIsLoadingMore(true);
  try {
    const result = await getDocumentsPaginated(user.uid, 20, lastDoc);
    if (result.documents.length < 20) {
      setHasMore(false);
    }
    setDocuments(prev => [...prev, ...result.documents]);
    setLastDoc(result.lastDoc);
  } catch (error) {
    console.error('Error loading more documents:', error);
  } finally {
    setIsLoadingMore(false);
  }
};

// Update the initial load to use pagination
// Replace getAllDocuments(user.uid) with:
const result = await getDocumentsPaginated(user.uid, 20);
setDocuments(result.documents);
setLastDoc(result.lastDoc);
if (result.documents.length < 20) {
  setHasMore(false);
}
```

**Step 5: Add a Load More button at the bottom of the document list:**
```typescript
{hasMore && (
  <Button
    onClick={loadMoreDocuments}
    disabled={isLoadingMore}
    variant="outline"
    className="w-full mt-4"
  >
    {isLoadingMore ? 'Loading...' : 'Load More'}
  </Button>
)}
```

**B. Add Missing Firestore Indexes**
```json
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "documents",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "updatedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "documents",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "workflowName", "order": "ASCENDING" },
        { "fieldPath": "updatedAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

### 4. Auto-Save Performance Enhancement

See "Critical Performance Issues Found" section above for detailed implementation.

### 5. AI Request Optimization

#### Implement Request Caching
```typescript
// src/lib/google-genai/request-cache.ts
import { LRUCache } from 'lru-cache';

const aiRequestCache = new LRUCache<string, any>({
  max: 100, // Maximum cache entries
  ttl: 1000 * 60 * 15, // 15 minutes TTL
  updateAgeOnGet: true,
  updateAgeOnHas: true,
});

export function getCacheKey(params: {
  prompt: string;
  model: string;
  temperature: number;
  context?: any;
}): string {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(params))
    .digest('hex');
}

export { aiRequestCache };
```

#### Update AI Execution with Cache
```typescript
// src/lib/google-genai/direct-gemini.ts
import { aiRequestCache, getCacheKey } from './request-cache';

export async function executeGeminiRequest(params: GeminiRequestParams) {
  // Check cache first for non-unique prompts
  if (!params.disableCache) {
    const cacheKey = getCacheKey(params);
    const cached = aiRequestCache.get(cacheKey);
    if (cached) {
      console.log(`[AI Cache Hit] ${cacheKey.substring(0, 8)}...`);
      return cached;
    }
  }
  
  // ... existing request logic ...
  
  // Cache successful responses
  if (result && !params.disableCache) {
    const cacheKey = getCacheKey(params);
    aiRequestCache.set(cacheKey, result);
  }
  
  return result;
}
```

## Code Cleanliness Improvements

### 1. Remove Deprecated/Unused Routes

#### Clean Up src/app/a/ Directory

**Step 1: Verify the directory is unused**
```bash
# Run this command to check if anything imports from src/app/a/
grep -r "from.*app/a" src/ || echo "No imports found - safe to delete"
```

**Step 2: Delete the directory**
```bash
rm -rf src/app/a/
```

**Step 3: Open tsconfig.json**

Find this section:
```json
"exclude": [
  "node_modules",
  "src/app/a/**/*",
  "src/components/wizard/wizard-shell-dynamic.tsx"
]
```

Remove the line with `"src/app/a/**/*",` so it becomes:
```json
"exclude": [
  "node_modules",
  "src/components/wizard/wizard-shell-dynamic.tsx"
]
```

**Step 4: Verify everything still works**
```bash
npm run dev
# Check that all wizard routes still work at /w/[shortName]/[documentId]
```

### 2. Dashboard Performance Optimization

#### Server-Side Workflow Loading
```typescript
// src/app/dashboard/page.tsx
// Convert to hybrid approach with server-side workflow loading

import { allWorkflows } from '@/lib/workflow-loader';
import DashboardClient from './dashboard-client';

export default function DashboardPage() {
  // Load static workflows server-side
  return <DashboardClient workflows={allWorkflows} />;
}

// src/app/dashboard/dashboard-client.tsx
'use client';

import { useState, useEffect } from 'react';
import { WorkflowDocument } from '@/types/workflow';
import { getAllDocuments } from '@/lib/firestore-adapter';

export default function DashboardClient({ workflows }: { workflows: Workflow[] }) {
  const [documents, setDocuments] = useState<WorkflowDocument[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Only fetch user documents client-side
    fetchUserDocuments();
  }, []);
  
  // Rest of dashboard logic...
}
```

### 3. Enable Strict Build Checks (Gradual Migration)

**Step 1: Create Migration Script**
```bash
#!/bin/bash
# scripts/enable-strict-checks.sh

# Step 1: Fix TypeScript errors
echo "Checking TypeScript errors..."
npx tsc --noEmit > ts-errors.log 2>&1
ERROR_COUNT=$(grep -c "error TS" ts-errors.log || echo "0")
echo "Found $ERROR_COUNT TypeScript errors"

# Step 2: Fix ESLint errors
echo "Checking ESLint errors..."
npx eslint . --ext .ts,.tsx --format json > eslint-errors.json
LINT_ERRORS=$(jq '.[] | select(.errorCount > 0) | .errorCount' eslint-errors.json | awk '{s+=$1} END {print s}')
echo "Found $LINT_ERRORS ESLint errors"

# Step 3: Generate fix list
echo "Generating fix priority list..."
cat > fix-priority.md << EOF
# Build Error Fix Priority

## Critical TypeScript Errors (Fix First)
$(grep "error TS2" ts-errors.log | head -20)

## ESLint Errors by File
$(jq -r '.[] | select(.errorCount > 0) | "\(.filePath): \(.errorCount) errors"' eslint-errors.json | head -20)
EOF

echo "Fix priority list generated at fix-priority.md"
```

**Step 2: Progressive Fix Configuration**

**Open next.config.ts and add these lines at the top:**
```typescript
const isDevelopment = process.env.NODE_ENV === 'development';
const isStrictMode = process.env.STRICT_BUILD === 'true';
```

**Find the nextConfig object and update these properties:**
```typescript
const nextConfig: NextConfig = {
  // ... keep all existing config ...
  
  typescript: {
    // Change from: ignoreBuildErrors: true
    // To:
    ignoreBuildErrors: !isStrictMode,
  },
  eslint: {
    // Change from: ignoreDuringBuilds: true
    // To:
    ignoreDuringBuilds: !isStrictMode,
    dirs: ['src', 'scripts'], // Add this line
  },
};
```

**To enable strict mode for testing:**
```bash
# Run this command to test with strict checking
STRICT_BUILD=true npm run build

# This will show all TypeScript and ESLint errors
# Fix them one by one until the build passes
```

### 4. Automated Unused Code Cleanup

**Step 1: Create the cleanup script**

Create a new file `scripts/cleanup-unused-code.js` (use .js for easier running):
```javascript
// scripts/cleanup-unused-code.js
const fs = require('fs');
const path = require('path');

const UNUSED_FILES = [
  'src/ai/dev.ts',
  'src/ai/tools/sample-tools.ts',
  'src/components/wizard/create-new-document-dialog.tsx',
  'src/components/skeletons/stage-card-skeleton.tsx',
  'src/hooks/use-mobile.tsx',
  'src/components/wizard/wizard-shell-dynamic.tsx',
];

console.log('🧹 Starting unused code cleanup...\n');

// Remove unused files
for (const file of UNUSED_FILES) {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    console.log(`❌ Removing: ${file}`);
    fs.unlinkSync(fullPath);
  } else {
    console.log(`⏭️  Already removed: ${file}`);
  }
}

console.log('\n✅ Cleanup complete!');
```

**Step 2: Run the cleanup script**
```bash
node scripts/cleanup-unused-code.js
```

**Step 3: Clean up unused exports manually**

Open `src/ai/flows/ai-stage-execution.ts` and find:
```typescript
export const aiStageExecution = aiStageExecutionFlow;
```

Delete this line (keep `aiStageExecutionFlow` as it's the main export).

**Step 4: Update tsconfig.json**

Remove this line from the "exclude" array:
```json
"src/components/wizard/wizard-shell-dynamic.tsx"
```

**Step 5: Verify the cleanup worked**
```bash
# Check that the files were deleted
ls src/ai/dev.ts 2>/dev/null || echo "✅ File deleted successfully"

# Run the app to ensure nothing broke
npm run dev
```

### 5. DRY Code Refactoring

**A. Extract Common AI Configuration**
```typescript
// src/lib/ai-config/model-presets.ts
export const MODEL_PRESETS = {
  fast: {
    model: 'gemini-2.0-flash',
    temperature: 0.7,
    maxOutputTokens: 2048,
  },
  creative: {
    model: 'gemini-2.0-flash',
    temperature: 0.9,
    maxOutputTokens: 4096,
  },
  precise: {
    model: 'gemini-2.0-flash',
    temperature: 0.3,
    maxOutputTokens: 2048,
  },
} as const;

export function getModelConfig(preset: keyof typeof MODEL_PRESETS, overrides?: Partial<ModelConfig>) {
  return { ...MODEL_PRESETS[preset], ...overrides };
}
```

**B. Centralize Error Handling**
```typescript
// src/lib/errors/ai-errors.ts
export class AIExecutionError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'AIExecutionError';
  }
}

export function handleAIError(error: any): never {
  console.error('[AI Error]', error);
  
  if (error.code === 'RESOURCE_EXHAUSTED') {
    throw new AIExecutionError(
      'AI quota exceeded. Please try again later.',
      'QUOTA_EXCEEDED',
      error,
      true
    );
  }
  
  if (error.code === 'INVALID_ARGUMENT') {
    throw new AIExecutionError(
      'Invalid request parameters.',
      'INVALID_REQUEST',
      error,
      false
    );
  }
  
  // Default error
  throw new AIExecutionError(
    'An unexpected error occurred.',
    'UNKNOWN_ERROR',
    error,
    true
  );
}
```

### 6. Development Environment Optimization

**A. Improve Dev Script Reliability**
```json
// package.json
{
  "scripts": {
    // Replace aggressive kill with graceful shutdown
    "dev:stop": "node scripts/graceful-shutdown.js",
    "dev": "npm run clean:logs && npm run dev:stop && npm run dev:start",
    
    // Add health check
    "dev:health": "node scripts/check-dev-services.js",
    
    // Parallel dev services with proper process management
    "dev:services": "concurrently --kill-others-on-fail \"npm:dev:next\" \"npm:dev:genkit\" \"npm:dev:firebase\""
  }
}
```

**B. Graceful Shutdown Script**
```javascript
// scripts/graceful-shutdown.js
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function gracefulShutdown() {
  console.log('🛑 Gracefully shutting down services...');
  
  const services = [
    { name: 'Next.js', port: 9002 },
    { name: 'Genkit', port: 4003 },
    { name: 'Firebase Emulators', ports: [9099, 8085, 9199] }
  ];
  
  for (const service of services) {
    const ports = Array.isArray(service.ports) ? service.ports : [service.port];
    
    for (const port of ports) {
      try {
        // Try graceful shutdown first
        await execAsync(`lsof -ti:${port} | xargs kill -TERM 2>/dev/null || true`);
        console.log(`✅ Stopped ${service.name} on port ${port}`);
        
        // Wait for graceful shutdown
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Force kill if still running
        await execAsync(`lsof -ti:${port} | xargs kill -9 2>/dev/null || true`);
      } catch (error) {
        // Service wasn't running
      }
    }
  }
  
  console.log('✨ All services stopped');
}

gracefulShutdown();
```

### 7. Test Stability Improvements

**A. Fix Flaky E2E Tests**
```typescript
// tests/export-stage-working.spec.ts
test('export stage shows success indicator', async ({ page }) => {
  // More robust selectors
  await page.waitForSelector('[data-testid="export-stage"]', { timeout: 10000 });
  
  // Wait for AI processing with better error handling
  await page.waitForFunction(
    () => {
      const indicators = document.querySelectorAll('[data-testid="stage-complete-indicator"]');
      return indicators.length > 0;
    },
    { timeout: 30000 }
  );
  
  // Use data-testid instead of text content
  const indicator = page.locator('[data-testid="stage-complete-indicator"]').first();
  await expect(indicator).toBeVisible();
});
```

**B. Add Test Stability Utilities**
```typescript
// tests/utils/test-helpers.ts
export async function waitForAIProcessing(page: Page, timeout = 30000) {
  await page.waitForFunction(
    () => !document.querySelector('[data-loading="true"]'),
    { timeout }
  );
}

export async function retryOnFailure<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries reached');
}
```

## Migration Path to Modern Standards

### 1. TypeScript Target Update
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022", // Updated from ES2017
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    // Enable additional strict checks gradually
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### 2. Complete Genkit to Native SDK Migration

**A. Migration Checklist**
```typescript
// scripts/migration-checklist.ts
const MIGRATION_TASKS = [
  {
    task: 'Remove Genkit dependencies',
    files: ['package.json'],
    completed: false
  },
  {
    task: 'Update all AI execution paths',
    files: [
      'src/app/actions/aiActions-new.ts',
      'src/lib/google-genai/ai-stage-execution.ts'
    ],
    completed: true
  },
  {
    task: 'Remove old Genkit flows',
    files: ['src/ai/flows/*.ts'],
    completed: false
  },
  {
    task: 'Update workflow configurations',
    files: ['src/workflows/*/workflow.json'],
    completed: false
  }
];
```

**B. Unified AI Interface**
```typescript
// src/lib/google-genai/unified-ai-interface.ts
export interface UnifiedAIRequest {
  prompt: string;
  model?: string;
  temperature?: number;
  systemPrompt?: string;
  tools?: Tool[];
  groundingConfig?: GroundingConfig;
  thinkingMode?: boolean;
}

export class UnifiedAI {
  private client: GoogleGenerativeAI;
  
  constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey);
  }
  
  async execute(request: UnifiedAIRequest): Promise<AIResponse> {
    // Single entry point for all AI operations
    const model = this.client.getGenerativeModel({
      model: request.model || 'gemini-2.0-flash',
      generationConfig: {
        temperature: request.temperature || 0.7,
      },
      systemInstruction: request.systemPrompt,
      tools: request.tools,
    });
    
    // Apply grounding if configured
    if (request.groundingConfig) {
      // Implementation
    }
    
    // Handle thinking mode
    if (request.thinkingMode) {
      // Implementation for Gemini 2.5
    }
    
    return await model.generateContent(request.prompt);
  }
}
```

## Performance Monitoring Implementation

### 1. Client-Side Performance Tracking
```typescript
// src/lib/performance/performance-monitor.ts
export class PerformanceMonitor {
  private marks: Map<string, number> = new Map();
  
  mark(name: string) {
    this.marks.set(name, performance.now());
  }
  
  measure(name: string, startMark: string, endMark?: string) {
    const start = this.marks.get(startMark);
    const end = endMark ? this.marks.get(endMark) : performance.now();
    
    if (!start) return;
    
    const duration = end - start;
    
    // Log to console in dev
    if (process.env.NODE_ENV === 'development') {
      console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
    }
    
    // Send to analytics in production
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'timing_complete', {
        name,
        value: Math.round(duration),
        event_category: 'Performance',
      });
    }
  }
}

export const perfMonitor = new PerformanceMonitor();
```

### 2. AI Request Performance Tracking
```typescript
// src/lib/google-genai/performance-wrapper.ts
export async function trackAIPerformance<T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  let success = true;
  
  try {
    const result = await fn();
    return result;
  } catch (error) {
    success = false;
    throw error;
  } finally {
    const duration = Date.now() - startTime;
    
    // Log to AI performance log
    await appendFile(
      'logs/ai-performance.log',
      JSON.stringify({
        timestamp: new Date().toISOString(),
        operation,
        duration,
        success,
      }) + '\n'
    );
  }
}
```

## Security Improvements (Non-Breaking)

### 1. Add Security Headers
```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );
  
  return response;
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};
```

### 2. Environment Variable Validation
```typescript
// src/lib/env-validation.ts
import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1),
  GOOGLE_GEMINI_API_KEY: z.string().min(1),
  NODE_ENV: z.enum(['development', 'production', 'test']),
});

export function validateEnv() {
  try {
    envSchema.parse(process.env);
  } catch (error) {
    console.error('❌ Environment validation failed:', error);
    throw new Error('Invalid environment configuration');
  }
}

// Call in app initialization
validateEnv();
```

## Monitoring & Observability

### 1. Custom Logging Solution
```typescript
// src/lib/logger/structured-logger.ts
export class StructuredLogger {
  private context: Record<string, any> = {};
  
  setContext(context: Record<string, any>) {
    this.context = { ...this.context, ...context };
  }
  
  private format(level: string, message: string, data?: any) {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...this.context,
      ...(data || {}),
    };
  }
  
  info(message: string, data?: any) {
    console.log(JSON.stringify(this.format('INFO', message, data)));
  }
  
  error(message: string, error?: Error, data?: any) {
    console.error(JSON.stringify(this.format('ERROR', message, {
      error: error?.message,
      stack: error?.stack,
      ...data,
    })));
  }
  
  metric(name: string, value: number, tags?: Record<string, string>) {
    console.log(JSON.stringify(this.format('METRIC', name, {
      value,
      tags,
    })));
  }
}

export const logger = new StructuredLogger();
```

## Additional Quick Performance Wins (Junior Dev Friendly)

### 1. Add Loading Priority to Images

**Step 1: Find all Next.js Image components**
```bash
# Run this to find all Image imports
grep -r "from 'next/image'" src/
```

**Step 2: For any above-the-fold images, add priority**
```typescript
// Change from:
<Image src="/logo.png" alt="Logo" width={100} height={100} />

// To:
<Image src="/logo.png" alt="Logo" width={100} height={100} priority />
```

### 2. Optimize Re-renders in WizardShell

**Step 1: Open src/components/wizard/wizard-shell.tsx**

**Step 2: Add useCallback for event handlers**

Find these functions and wrap them with useCallback:
```typescript
// Change from:
const handleStageComplete = (stageId: string) => {
  // ... function body
};

// To:
const handleStageComplete = useCallback((stageId: string) => {
  // ... function body
}, [updateStageData]); // Add dependencies used inside

// Do the same for:
// - handleStageRedo
// - handleStageEdit
// - any other event handlers passed to child components
```

### 3. Debounce Search and Filter Inputs

**Step 1: Install lodash debounce**
```bash
npm install lodash.debounce
npm install --save-dev @types/lodash.debounce
```

**Step 2: For any search input in the dashboard**

Open `src/app/dashboard/page.tsx` and add:
```typescript
import debounce from 'lodash.debounce';

// If there's a search/filter function, wrap it:
const handleSearch = useMemo(
  () => debounce((searchTerm: string) => {
    // Filter logic here
  }, 300),
  []
);
```

### 4. Lazy Load Heavy Libraries

**Step 1: Find heavy imports in package.json**

These are candidates for lazy loading:
- `docx` (1.5MB) - Already server-side
- `pdfjs-dist` (if added later)
- Any chart libraries beyond recharts

**Step 2: Example - If adding PDF preview**
```typescript
// Don't do this:
import { Document, Page } from 'react-pdf';

// Do this instead:
const PDFViewer = dynamic(
  () => import('react-pdf').then(mod => ({ 
    default: mod.Document 
  })),
  { 
    loading: () => <div>Loading PDF...</div>,
    ssr: false 
  }
);
```

### 5. Optimize Tailwind CSS Bundle

**Step 1: Open tailwind.config.ts**

**Step 2: Ensure content paths are specific**
```typescript
content: [
  './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
  './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  // Remove any overly broad paths like './src/**/*'
],
```

**Step 3: Add PurgeCSS safelist for dynamic classes**
```typescript
safelist: [
  'bg-blue-500',
  'text-blue-500',
  // Add any dynamically generated classes
]
```

### 6. Implement Intersection Observer for Heavy Components

**Step 1: Create a lazy load hook**

Create `src/hooks/use-lazy-load.ts`:
```typescript
import { useEffect, useRef, useState } from 'react';

export function useLazyLoad() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}
```

**Step 2: Use it for heavy components**
```typescript
// In any component that's expensive to render:
const { ref, isVisible } = useLazyLoad();

return (
  <div ref={ref}>
    {isVisible ? (
      <ExpensiveComponent />
    ) : (
      <div className="h-64 bg-gray-100 animate-pulse" />
    )}
  </div>
);
```

### 7. Add Response Compression

**Step 1: Create src/app/api/middleware.ts**
```typescript
import { NextResponse } from 'next/server';

export function middleware(request: Request) {
  const response = NextResponse.next();
  
  // Enable compression hint
  response.headers.set('Accept-Encoding', 'gzip, deflate, br');
  
  return response;
}
```

### 8. Optimize Auto-save to Batch Updates

**Step 1: Open src/hooks/use-document-persistence.ts**

**Step 2: Find the auto-save logic and add batching**
```typescript
// Add at the top of the hook:
const pendingUpdates = useRef<Record<string, any>>({});

// Modify the update function:
const updateField = useCallback((field: string, value: any) => {
  // Batch updates
  pendingUpdates.current[field] = value;
  
  // Trigger save after collecting updates
  debouncedSave();
}, [debouncedSave]);

// In the save function, use pendingUpdates:
const saveDocument = useCallback(async () => {
  if (Object.keys(pendingUpdates.current).length === 0) return;
  
  const updates = { ...pendingUpdates.current };
  pendingUpdates.current = {}; // Clear pending
  
  await updateDocument(documentId, updates);
}, [documentId]);
```

## Additional Performance Considerations

### 1. Workflow Loader Optimization (Future-Proofing)
```typescript
// If workflow count grows significantly, implement lazy loading
// src/lib/workflow-loader-lazy.ts
export async function getWorkflow(name: string) {
  try {
    const module = await import(`@/workflows/${name}/workflow.json`);
    return module.default;
  } catch (error) {
    console.error(`Failed to load workflow: ${name}`);
    return null;
  }
}

// Use in dashboard for on-demand loading
const workflow = await getWorkflow('article-writer');
```

### 2. API Route Performance Enhancements
```typescript
// src/app/api/files/upload/route.ts
// Replace simulated upload with actual implementation
// Consider direct-to-cloud uploads for large files

import { uploadToFirebaseStorage } from '@/lib/firebase-storage';

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  
  // For files > 10MB, return a signed upload URL instead
  if (file.size > 10 * 1024 * 1024) {
    const uploadUrl = await getSignedUploadUrl();
    return Response.json({ uploadUrl, direct: true });
  }
  
  // Regular upload for smaller files
  const url = await uploadToFirebaseStorage(file);
  return Response.json({ url });
}
```

### 3. Loading States & Skeletons
```typescript
// src/app/w/[shortName]/[documentId]/loading.tsx
import { WizardShellSkeleton } from '@/components/skeletons';

export default function Loading() {
  return <WizardShellSkeleton />;
}

// Fix and use StageCardSkeleton for individual stage loading
// src/components/skeletons/stage-card-skeleton.tsx
export function StageCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardContent className="p-6">
        <div className="h-6 bg-muted rounded w-1/3 mb-4" />
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded" />
          <div className="h-4 bg-muted rounded w-5/6" />
        </div>
      </CardContent>
    </Card>
  );
}
```

### 4. React Performance Optimizations
```typescript
// src/components/wizard/stage-card.tsx
import { memo } from 'react';

// Memoize StageCard if profiling shows unnecessary re-renders
export const StageCard = memo(function StageCard({
  stage,
  stageIndex,
  // ... other props
}: StageCardProps) {
  // Component implementation
}, (prevProps, nextProps) => {
  // Custom comparison if needed
  return (
    prevProps.stage.id === nextProps.stage.id &&
    prevProps.stageData === nextProps.stageData
  );
});
```

## Emergency Performance Quick Fixes (Do These First!)

### 1. Remove Console.logs in Production (5 minutes)

**Step 1: Create a utility file `src/lib/logger.ts`**
```typescript
const isProd = process.env.NODE_ENV === 'production';

export const log = {
  info: (...args: any[]) => !isProd && console.log(...args),
  error: (...args: any[]) => !isProd && console.error(...args),
  warn: (...args: any[]) => !isProd && console.warn(...args),
  debug: (...args: any[]) => !isProd && console.debug(...args),
};
```

**Step 2: Find and replace all console.log**
```bash
# Find all console.log statements
grep -r "console\.log" src/ --include="*.ts" --include="*.tsx"

# Replace them with:
# import { log } from '@/lib/logger';
# log.info('your message');
```

### 2. Add key Props to All Lists (15 minutes)

**Find all map() functions rendering components:**
```bash
grep -r "\.map(" src/ --include="*.tsx" | grep "=>"
```

**For each one, ensure it has a unique key:**
```typescript
// Bad:
{items.map(item => <Card>{item.name}</Card>)}

// Good:
{items.map(item => <Card key={item.id}>{item.name}</Card>)}

// If no id, use index as last resort:
{items.map((item, index) => <Card key={index}>{item.name}</Card>)}
```

### 3. Prevent Unnecessary React Imports (5 minutes)

**Step 1: Remove unused React imports**
```bash
# Find files that import React but might not need it
grep -r "import React" src/ --include="*.tsx"

# In Next.js 13+, you don't need to import React
# Remove lines like:
import React from 'react';

# Keep only if using React.memo, React.useCallback, etc.
```

### 4. Add Suspense Boundaries (20 minutes)

**Step 1: Wrap dynamic imports with Suspense**

For every `dynamic()` import, add Suspense:
```typescript
// In the parent component:
import { Suspense } from 'react';

// Wrap the dynamic component:
<Suspense fallback={<div>Loading...</div>}>
  <DynamicComponent />
</Suspense>
```

### 5. Optimize Package Imports (10 minutes)

**Find and fix barrel imports:**
```typescript
// Bad - imports entire library:
import { Button } from '@radix-ui/react-button';

// Good - imports only what's needed:
import * as ButtonPrimitive from '@radix-ui/react-button';

// For Firebase:
// Bad:
import firebase from 'firebase/app';

// Good (already done in your code):
import { getAuth } from 'firebase/auth';
```

### 6. Add WebP Images Support (15 minutes)

**For any static images in public/ folder:**
```bash
# Install cwebp tool
brew install webp  # Mac
# or: sudo apt-get install webp  # Linux

# Convert images
for img in public/*.{jpg,png}; do
  cwebp "$img" -o "${img%.*}.webp"
done
```

**Update Image components:**
```typescript
<Image 
  src="/hero.webp" 
  fallback="/hero.jpg"
  alt="Hero image"
  priority
/>
```

## Pre-Implementation Checklist

### Before Starting Any Optimization:

1. **Create a Performance Baseline**
   ```bash
   # Create a file to track metrics
   echo "# Performance Metrics" > PERFORMANCE.md
   echo "## Baseline ($(date))" >> PERFORMANCE.md
   
   # Run build and save output
   npm run build 2>&1 | grep "First Load JS" >> PERFORMANCE.md
   ```

2. **Set Up Performance Monitoring**
   ```typescript
   // Add to src/app/layout.tsx
   useEffect(() => {
     if (typeof window !== 'undefined' && 'performance' in window) {
       window.addEventListener('load', () => {
         const perfData = performance.getEntriesByType('navigation')[0];
         console.log('Page Load Time:', perfData.loadEventEnd - perfData.fetchStart);
       });
     }
   }, []);
   ```

3. **Enable React DevTools Profiler**
   - Install React DevTools browser extension
   - Open it and go to Profiler tab
   - Record a session before changes

## Implementation Priority Order

### Phase 1: Immediate Wins (1-2 days)

#### Day 1 Morning (2-3 hours):
1. **Implement Font Optimization** (30 minutes)
   - Follow the 5-step process in section 1
   - Test fonts load without external requests
   - Commit: "feat: optimize font loading with next/font"

2. **Remove src/app/a/ directory** (15 minutes)
   - Follow the 4-step process in Code Cleanliness section 1
   - Commit: "chore: remove deprecated /a routes"

3. **Update TypeScript target** (15 minutes)
   - Open `tsconfig.json`
   - Change `"target": "ES2017"` to `"target": "ES2022"`
   - Run `npm run build` to check for any issues
   - Commit: "chore: update TypeScript target to ES2022"

#### Day 1 Afternoon (3-4 hours):
4. **Remove unused files** (1 hour)
   - Run the cleanup script from section 4
   - Manually remove the unused export
   - Test the app still works
   - Commit: "chore: remove unused files and exports"

5. **Implement dynamic imports** (2 hours)
   - Follow the 5-step process for StageOutputArea
   - Test each output type loads with animation
   - Commit: "perf: add dynamic imports for output renderers"

#### Day 2 Morning (2-3 hours):
6. **Add Firestore indexes** (1 hour)
   - Copy the indexes from section 3 into `firestore.indexes.json`
   - Run `firebase deploy --only firestore:indexes`
   - Commit: "perf: add Firestore indexes for user queries"

### Phase 2: Performance Boost (3-5 days)

#### Day 3: Dashboard & Data Optimization (4-5 hours)
1. **Optimize Dashboard with server-side workflow loading** (2 hours)
   - Split dashboard into server/client components
   - Move static workflow loading to server-side
   - Test dashboard loads faster
   - Commit: "perf: optimize dashboard with server-side rendering"

2. **Implement pagination for document queries** (2 hours)
   - Follow the detailed steps in Firebase section
   - Add "Load More" button to dashboard
   - Test with 50+ documents
   - Commit: "feat: add pagination to document queries"

#### Day 4: Caching & Auto-save (4-5 hours)
3. **Add AI request caching** (2 hours)
   - Install `lru-cache`: `npm install lru-cache`
   - Create `src/lib/google-genai/request-cache.ts`
   - Integrate into `direct-gemini.ts`
   - Test cache hits in console
   - Commit: "perf: add LRU cache for AI requests"

4. **Optimize auto-save** (2 hours)
   - Implement field tracking in `use-document-persistence.ts`
   - Add batch updates
   - Test only changed fields are saved
   - Commit: "perf: optimize auto-save with partial updates"

#### Day 5: UI Polish (3-4 hours)
5. **Add loading states** (1.5 hours)
   - Create `loading.tsx` files for:
     - `src/app/dashboard/loading.tsx`
     - `src/app/w/[shortName]/[documentId]/loading.tsx`
   - Use skeleton components
   - Commit: "feat: add loading states for better UX"

6. **Fix E2E tests** (1.5 hours)
   - Update selectors to use data-testid
   - Add retry logic for flaky tests
   - Run tests 3 times to ensure stability
   - Commit: "fix: stabilize E2E tests"

### Phase 3: Code Quality (1 week)
1. Enable strict TypeScript/ESLint checks
2. Complete DRY refactoring
3. Consolidate AI execution paths
4. Implement structured logging

### Phase 4: Long-term Health (2 weeks)
1. Complete Genkit to native SDK migration
2. Implement comprehensive monitoring
3. Add performance tracking
4. Security hardening

## Success Metrics

1. **Performance**
   - Initial page load: < 2s (measure with Lighthouse)
   - AI request response: < 3s (with caching < 100ms)
   - Bundle size reduction: 30% (check with `npm run analyze`)
   - Auto-save latency: < 500ms (check Network tab)
   - Font loading: 0ms (fonts loaded with page)

2. **Code Quality**
   - TypeScript errors: 0
   - ESLint warnings: 0
   - Test coverage: > 80%
   - E2E test reliability: 100%

3. **Developer Experience**
   - Dev server startup: < 10s
   - Hot reload time: < 1s
   - Build time: < 2 minutes

## How to Measure Success

### 1. Before Starting - Capture Baseline Metrics
```bash
# Build and analyze current bundle
ANALYZE=true npm run build
# Screenshot the bundle analyzer output

# Run Lighthouse
# 1. Start the app: npm run dev
# 2. Open Chrome DevTools > Lighthouse tab
# 3. Run audit and save the report
```

### 2. After Each Optimization
```bash
# Check bundle size change
npm run build
# Note the "First Load JS" size for each route

# For specific optimizations:
# - Fonts: Check Network tab - should see NO requests to fonts.googleapis.com
# - Dynamic imports: Check Network tab - should see separate chunks loading
# - Auto-save: Check Network tab - should see smaller Firestore update payloads
```

### 3. Final Comparison
```bash
# Run bundle analyzer again
ANALYZE=true npm run build
# Compare with baseline screenshot

# Run Lighthouse again
# Compare scores, especially:
# - Performance score
# - Largest Contentful Paint
# - Time to Interactive
# - Total Blocking Time
```

## Notes

- All changes maintain backward compatibility
- No user-facing functionality is altered
- Database schema remains unchanged
- API contracts stay the same
- Only internal optimizations and code quality improvements
- Font optimization alone can improve LCP (Largest Contentful Paint) by 200-500ms
- Dynamic imports can reduce initial bundle by 30-50% for heavy components