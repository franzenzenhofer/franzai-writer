# Fix Graceful Error Handling Test Failure (E2E)

**Created**: 2025-06-10
**Priority**: CRITICAL
**Component**: E2E Tests / UI Error Handling
**Related Test**: `tests/e2e/article-workflow-complete.spec.ts` (Test name: "should handle errors gracefully")
**Related Ticket**: `open-tickets/031-fix-ai-stage-500-error.md`

**Status**: 2025-06-20 - TEST FAILING - 0% COMPLETE

## Description
The Playwright E2E test `article-workflow-complete.spec.ts` for "should handle errors gracefully" is failing.
The test simulates a 500 Internal Server Error from the API during workflow processing.
It expects a user-facing error message (e.g., containing "text=error") to be visible, but the locator times out, meaning the error message is not displayed as expected.

Reference: `test-results/article-workflow-complete--33e11-ld-handle-errors-gracefully-Mobile-Chrome/error-context.md`

## Error Details (from test-results)
```
Error: Timed out 5000ms waiting for expect(locator).toBeVisible()
Locator: locator('text=error').first()
Expected: visible
Received: <element(s) not found>
```

## Expected Behavior
When a backend API call results in a 500 error during a workflow stage, the UI should:
1.  Clearly indicate that an error has occurred.
2.  Display a user-friendly error message.
3.  Prevent the user from proceeding with the broken stage if applicable.
4.  The E2E test should be able to locate this error message.

## Tasks
- [ ] Investigate `article-workflow-complete.spec.ts` at line 102 (or as per latest test file).
- [ ] Review the UI components responsible for displaying errors when API calls within the wizard fail.
- [ ] Ensure that network errors (especially 500s) are caught and result in a visible error message that the test can identify.
- [ ] Update UI components or error handling logic as needed.
- [ ] Verify the fix by running the E2E test locally until it passes.
- [ ] Ensure the error message is accessible and user-friendly.

## Acceptance Criteria
- [ ] The "should handle errors gracefully" E2E test passes consistently.
- [ ] Users receive clear, visible feedback in the UI when a server-side error occurs during workflow processing.
- [ ] The application remains stable and does not crash.
```
