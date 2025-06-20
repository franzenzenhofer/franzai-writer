# 051 - Unused Code Analysis Report

## Created: 2025-01-06
## Priority: Medium
## Component: Code Quality / Technical Debt
## Status: IN PROGRESS - 50% COMPLETE (Updated: 2025-06-20)

## UPDATE 2025-06-11
The unused code analysis was completed and documented, but the actual cleanup has NOT been performed:
- Report exists with detailed findings
- Knip configuration added to project
- No files have been removed
- No unused exports have been cleaned up
- Knip not added to CI/CD or regular scripts
- This ticket should remain open until cleanup is actually performed

## Description
This ticket documents the results of an unused code analysis performed using Knip, a modern dead code elimination tool for TypeScript projects. The analysis revealed several areas where code cleanup would improve maintainability and reduce technical debt.

## Analysis Summary

### Tool Used: Knip v5.60.2
Knip was chosen as it's the current best-in-class tool for TypeScript projects, replacing older tools like ts-prune. It uses a mark-and-sweep algorithm to find truly unused code.

### Key Findings

#### 1. Unused Custom Code (HIGH PRIORITY - Review and Remove)
These are files we wrote that appear to be unused and should be reviewed:

- **`src/ai/dev.ts`** - Development/testing file that may no longer be needed
- **`src/ai/tools/sample-tools.ts`** - Sample tool implementation not integrated into workflows
- **`src/components/wizard/create-new-document-dialog.tsx`** - Dialog component that was likely replaced by a different implementation
- **`src/components/skeletons/stage-card-skeleton.tsx`** - Skeleton loader that doesn't appear to be used
- **`src/hooks/use-mobile.tsx`** - Mobile detection hook not being utilized

#### 2. Unused Exports in Active Files (MEDIUM PRIORITY)
These exports exist in files that are being used, but the specific exports are not imported anywhere:

- **`aiStageExecution`** in `src/ai/flows/ai-stage-execution.ts` - Duplicate export (alias)
- **`calculateWordCount`** and **`findLastEditedStage`** in `src/lib/utils.ts` - Utility functions
- **Firebase exports** in `src/lib/firebase.ts`: `app`, `logOut`, `onAuthStateChange`
- Various type exports that were defined but never used

#### 3. Unused UI Components (LOW PRIORITY - Keep for Future Use)
These are shadcn/ui components that were installed but not yet used. These should be kept as they're part of the design system and may be used in future features:

- Calendar, Chart, Menubar, Popover, Radio Group, Scroll Area, Sidebar, Slider, Switch, Table, Tooltip

#### 4. Unused Dependencies (LOW PRIORITY - Premature to Remove)
These npm packages are installed but not currently used. As noted, removing these would be premature optimization:

- UI libraries: Various Radix UI components, date-fns, recharts
- Firebase UI library (firebaseui) - May be needed for future auth UI
- Development tools: patch-package, dotenv

## Recommendations

### Immediate Actions (This Sprint)

1. **Review and remove unused custom code files**:
   ```bash
   # Files to review and potentially delete:
   src/ai/dev.ts
   src/ai/tools/sample-tools.ts
   src/components/wizard/create-new-document-dialog.tsx
   src/components/skeletons/stage-card-skeleton.tsx
   src/hooks/use-mobile.tsx
   ```

2. **Clean up unused exports**:
   - Remove `aiStageExecution` alias if `aiStageExecutionFlow` is the primary export
   - Review if `calculateWordCount` and `findLastEditedStage` are needed
   - Check Firebase exports - some may be needed for future features

3. **Remove unused type definitions** that are confirmed to not be needed

### Future Actions (Technical Debt Backlog)

1. **Add Knip to CI/CD pipeline** to prevent accumulation of dead code:
   ```json
   // package.json
   "scripts": {
     "lint:unused": "knip",
     "lint:all": "npm run lint && npm run typecheck && npm run lint:unused"
   }
   ```

2. **Configure TypeScript for stricter checking**:
   ```json
   // tsconfig.json
   {
     "compilerOptions": {
       "noUnusedLocals": true,
       "noUnusedParameters": true
     }
   }
   ```

3. **Document component library usage** - Create a components.md file documenting which shadcn/ui components are available for use

### Do NOT Remove (Yet)

1. **UI Component Library Files** - These are part of the design system and may be used in upcoming features
2. **NPM Dependencies** - Removing these is premature optimization; they don't significantly impact bundle size if tree-shaken properly
3. **Type definitions** that might be used in future API contracts

## Code Quality Metrics

- **Unused files**: 17 (5 custom, 12 library)
- **Unused dependencies**: 15
- **Unused exports**: 39
- **Unused types**: 13

## Implementation Notes

### Running Knip
```bash
# One-time analysis
npx knip

# Add to regular workflow
npm run lint:unused
```

### Knip Configuration
The project now has a `knip.json` configuration file that:
- Properly configures Next.js app router entries
- Ignores test files and generated directories
- Handles Next.js specific patterns

## Acceptance Criteria

- [ ] All unused custom code files have been reviewed
- [ ] Decision made on each file (keep/remove/refactor)
- [ ] Unused exports in active files cleaned up
- [ ] Knip added to linting scripts
- [ ] Team informed about available UI components

## Benefits

1. **Reduced Cognitive Load** - Less code to understand and maintain
2. **Improved Build Times** - Smaller codebase to process
3. **Better Code Navigation** - Easier to find actually used code
4. **Prevent Bugs** - Dead code can't cause bugs

## References
- [Knip Documentation](https://knip.dev)
- [Effective TypeScript: Finding Dead Code](https://effectivetypescript.com/2023/07/29/knip/)
- [Next.js Tree Shaking](https://nextjs.org/docs/architecture/nextjs-compiler#tree-shaking)