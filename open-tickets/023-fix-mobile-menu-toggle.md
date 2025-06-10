# Fix Mobile Menu Toggle Button

**Created**: 2025-06-10
**Priority**: High
**Component**: Navigation/Mobile

## Description
The mobile menu toggle button is not appearing on the homepage, causing navigation issues on mobile devices.

## Issue Details
- The mobile menu component was created but the toggle button is not visible
- Playwright test failed to find button[aria-label="Toggle menu"]
- Mobile users cannot access navigation

## Tasks
- [ ] Debug why the mobile menu toggle is not rendering
- [ ] Ensure the toggle appears on all pages
- [ ] Fix the aria-label attribute
- [ ] Test on multiple screen sizes
- [ ] Verify with Playwright tests

## Technical Details
- Mobile menu component exists at: src/components/layout/mobile-menu.tsx
- Site header includes the mobile menu but it's not showing
- May be a CSS issue or conditional rendering problem

## Acceptance Criteria
- [ ] Mobile menu toggle visible on all pages when viewport < 768px
- [ ] Toggle button has proper aria-label
- [ ] Menu opens/closes correctly
- [ ] Playwright tests pass