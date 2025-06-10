# Create Comprehensive Playwright Tests

**Created**: 2025-06-10
**Priority**: High
**Component**: tests/e2e

## Description
Create a comprehensive suite of Playwright tests for the Franz AI Writer application.

## Tasks
- [ ] Create test for homepage navigation
- [ ] Create test for login flow
- [ ] Create test for dashboard workflow selection
- [ ] Create test for wizard workflow execution
- [ ] Create test for stage input and processing
- [ ] Create test for document finalization
- [ ] Create test for error handling scenarios

## Test Scenarios
1. User can navigate from home to dashboard
2. User can select a workflow from dashboard
3. User can complete all stages in a workflow
4. User can skip optional stages
5. User can edit stage inputs after completion
6. User can finalize and export document
7. Error states are handled gracefully

## Acceptance Criteria
- All critical user paths are covered
- Tests use the data-testid attributes
- Tests run reliably in CI/CD
- Tests provide clear failure messages