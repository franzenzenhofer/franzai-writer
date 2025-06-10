# Cleanup Unused Paths and Routes

**Created**: 2025-01-06
**Priority**: Medium
**Component**: Core/Routing
**Type**: Refactoring

## Description

The codebase has accumulated various unused paths, routes, and API endpoints during development. These need to be identified and removed to reduce code clutter, improve maintainability, and reduce the application's surface area.

## Tasks

- [ ] Audit all API routes in `src/app/api/` for usage
- [ ] Check for unused page routes in the app directory
- [ ] Identify and remove test/debug routes (e.g., `/api/test-ai`, `/api/test-env`)
- [ ] Review and clean up any deprecated or unused components
- [ ] Check for unused imports and dead code
- [ ] Verify all remaining routes are documented
- [ ] Update any route references in documentation

## Acceptance Criteria

- All unused API routes are removed
- All unused page routes are removed
- No broken links or references remain
- Build and tests pass after cleanup
- Application functionality remains intact
- Code coverage doesn't decrease significantly

## Technical Notes

Areas to check:
- `/api/test-ai/` - appears to be a debug route
- `/api/test-env/` - appears to be a debug route
- Any routes not referenced in the main navigation or workflows
- Orphaned components no longer used by any routes

## Testing

- Run full test suite after cleanup
- Manually test all main user flows
- Check for 404 errors in browser console
- Verify all navigation links work correctly