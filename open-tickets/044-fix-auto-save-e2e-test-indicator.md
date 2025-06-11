# Fix Auto-Save E2E Test Failure - Save Indicator Not Visible

**Created**: 2025-06-10
**Priority**: CRITICAL
**Component**: E2E Tests / UI Auto-Save Feedback / Document Persistence
**Related Test**: `tests/e2e/article-workflow-complete.spec.ts` (Test name: "should save progress automatically")
**Related Ticket**: `open-tickets/038-fix-autosave-after-url-change.md`

## Description
The Playwright E2E test `article-workflow-complete.spec.ts` for "should save progress automatically" is failing.
The test fills the first stage of a workflow and then waits for an auto-save indicator (text "Saving" or "Last saved") to become visible. The test times out, meaning this indicator does not appear.

Reference: `test-results/article-workflow-complete--d5962-save-progress-automatically-Mobile-Chrome/error-context.md`

## Error Details (from test-results)
```
Error: Timed out 10000ms waiting for expect(locator).toBeVisible()
Locator: locator('text=Saving').or(locator('text=Last saved'))
Expected: visible
Received: <element(s) not found>
```
Test code line: `await expect(page.locator('text=Saving').or(page.locator('text=Last saved'))).toBeVisible({ timeout: 10000 });` (around line 119 of the spec file).

## Problem
This failure suggests one or more of the following:
1.  The auto-save functionality itself is not triggering or working correctly (consistent with ticket `038-fix-autosave-after-url-change.md`).
2.  The auto-save is working, but the UI indicator (e.g., displaying "Saving..." or "Last saved at HH:MM") is not being displayed.
3.  The text used in the indicator has changed, and the test locator is outdated.

## Tasks
- [ ] First, investigate the status of `open-tickets/038-fix-autosave-after-url-change.md`. If auto-save is fundamentally broken, this test will naturally fail.
- [ ] If auto-save is believed to be working, investigate the UI components responsible for displaying the auto-save status.
- [ ] Verify that the `use-document-persistence.ts` hook (or equivalent) correctly updates the state that drives this UI indicator.
- [ ] Check the conditions under which the "Saving" or "Last saved" messages are rendered.
- [ ] Ensure the locators `page.locator('text=Saving')` and `page.locator('text=Last saved')` accurately reflect the text content of the save indicator.
- [ ] Verify the fix by running the E2E test locally until it passes.

## Acceptance Criteria
- [ ] The "should save progress automatically" E2E test passes consistently.
- [ ] A visual indicator for auto-save status ("Saving...", "Last saved...") is correctly displayed to the user during and after auto-save operations.
- [ ] The auto-save functionality works as expected (see ticket 038).
```
