# Experimental Branch Test Failures Investigation

**Created:** 2025-07-03
**Priority:** HIGH
**Component:** Testing / E2E
**Branch:** gemini-experimental-branch

## Description

Investigation of test failures on `gemini-experimental-branch`. Both poem and press release workflow tests are failing, indicating a potential regression or breaking change.

## Current Status

### Press Release Workflow Test Failure
- **Error**: `#process-stage-key-facts` button not clickable (timeout after 60s)
- **Root Cause**: Research stage not completing properly
- **Symptom**: Research stage shows "Run AI" button still visible, indicating it hasn't been processed
- **Stage Dependencies**: Key Facts stage is waiting for Research stage to complete

### Poem Workflow Test Failures
- Multiple tests failing with various timeout errors
- Basic workflow test fails at the very start (can't find textarea)
- Other tests fail at different stages (image customization, export, etc.)

## Key Findings

1. **Button ID Pattern**: Confirmed that buttons use `id="process-stage-${stage.id}"` pattern
2. **Research Stage Issue**: The research stage requires manual click on "Run AI" button but test might not be waiting properly
3. **Attempted Fix**: Updated test to explicitly wait for research completion with:
   ```typescript
   await page.waitForSelector('#process-stage-research', { timeout: 10000 });
   await page.click('#process-stage-research');
   await page.waitForSelector('[data-testid="stage-card-research"] code', { timeout: 60000 });
   await page.waitForTimeout(2000);
   ```

## Experimental Branch Commit History (not in master)

```
f42527f docs(tickets): Document experimental branch test failures
30873e3 docs(tickets): Close workflow documentation ticket
e8875ae docs(tickets): Close Gemini Grounding ticket
57208ed docs(tickets): Close improve button labeling ticket
3dc0d49 feat(workflow): Implement autorunDependsOn feature
ce3498b refactor(tickets): Close CTO review ticket
c477a7e refactor(tickets): Close environment validation ticket and create new ticket for remaining work
1442655 refactor(tickets): Close DRY code refactor ticket and create new ticket for remaining work
12abcd0 refactor(tickets): Close workflow documentation ticket and create new ticket for remaining work
24d9fc1 refactor(tickets): Close accessibility ticket and create new ticket for remaining work
d06041f refactor(tickets): Close Gemini Grounding ticket and create new ticket for remaining work
2bd9cb5 refactor(tickets): Close UX/UI analysis ticket and create new tickets for quick wins
768435d fix: simplify settings page and add working E2E test structure
31485b2 refactor: massive DRY improvements to all new routes with shared components and E2E tests
0655951 feat: enhance workflow detail view with modern UI and comprehensive information architecture
16dcda0 feat: create user asset manager for files and images
e7e6f97 feat: create user settings page with account management
ff9b156 fix: resolve duplicate key errors and refactor document table to DRY component
1fae52b fix: document visibility test now passes completely
bebae10 fix: show recent documents for temporary users in dashboard
459b676 test: create document visibility test for dashboard and all documents view
0a79235 feat: implement document copy and delete functionality
4cc0b5d feat: create comprehensive all documents view interface
672d1e9 test: enhance dashboard tests with pagination and bulk operations
7944d4a docs: update E2E testing guidelines to require one master test per workflow
9349bcc test: add critical image generation E2E test coverage
9c5534e docs: update CLAUDE.md to list all E2E test files exempt from 5-test limit
8e82c20 test: restore and enhance comprehensive E2E tests for critical workflows
a69962c fix(export-preview): use iframe for reliable styled/clean preview after reload and remove server chunk error
094aa71 Restore poem-workflow-comprehensive.spec.ts to SUPER POWERFUL status
06e9b14 Final cleanup and quality assurance for epic completion
8347492 Update CLAUDE.md with comprehensive E2E testing guidelines
7fb1c1f Clean up E2E tests per CLAUDE.md guidelines
29cfc10 Improve DOCX aspect ratio extraction with more robust regex parsing
7a51234 Add debugging logs for DOCX aspect ratio processing
74138cc Implement image copyright attribution for Imagen-generated images
61ddac7 CRITICAL FIX: Resolve HTML preview stage completion issue - systematic debugging approach
5f3f8dc fix: resolve generate-html-preview stage not completing in poem workflow
40e5df0 Complete ticket 118b: Poem workflow cleanup - remove redundant metadata
f4ff1bb Complete ticket 118a: Poem workflow critical fixes P0 - verified working
425c36c fix: prevent export stages from showing incorrect 'Update Recommended' status
8b9bd8d Complete ticket 117b: Update footer links and create missing pages
f8a660d feat: add privacy policy and terms of service pages
b277895 Complete ticket 117a: Update AI log viewer design system and route migration
4c874ac Fix export stage styled preview not showing after reload
b6fb8cd Update AI log viewer design system compliance (Ticket 117a Phase 1)
a47d93e Fix recent documents display issue (Ticket 116b Phase 1)
```

## Key Features/Changes on Experimental Branch

1. **autorunDependsOn feature** (3dc0d49) - New workflow feature implementation
2. **Massive refactoring work** - Multiple tickets closed for DRY improvements, accessibility, etc.
3. **New pages/features**:
   - User settings page with account management
   - User asset manager for files and images
   - Enhanced workflow detail view
   - Privacy policy and terms of service pages
4. **Multiple poem workflow fixes**:
   - HTML preview stage completion issues
   - Export stage improvements
   - Image copyright attribution for Imagen
5. **Testing improvements**:
   - E2E testing guidelines updates
   - Comprehensive test restoration
   - Document visibility tests

## Hypothesis

The `autorunDependsOn` feature implementation might have changed how stage dependencies work, causing the research stage to not properly signal completion to dependent stages.

## Next Steps

1. Test on master branch to establish baseline
2. Compare stage execution behavior between branches
3. Check if autorunDependsOn implementation affects stage completion signals
4. Review any changes to stage state management

## Test Environment
- Branch: gemini-experimental-branch
- Test Runner: Playwright (headed mode)
- Failed Tests: 
  - press-release-workflow.spec.ts (all 3 tests)
  - poem-workflow-comprehensive.spec.ts (8 out of 12 tests)

## Notes
- All tests run in Chrome only per CLAUDE.md guidelines
- Dev server running on port 9002
- Using production Firebase (not emulator)