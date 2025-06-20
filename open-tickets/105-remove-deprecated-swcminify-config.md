# 105: Remove Deprecated swcMinify Configuration

**Created**: 2025-01-21
**Priority**: Low
**Component**: Build Configuration

## Description

The Next.js dev server is showing a warning about invalid configuration options:

```
⚠ Invalid next.config.ts options detected: 
⚠     Unrecognized key(s) in object: 'swcMinify'
⚠ See more info here: https://nextjs.org/docs/messages/invalid-next-config
```

The `swcMinify` option has been deprecated in Next.js 15 as SWC minification is now the default and only option.

## Tasks

- [ ] Open next.config.ts
- [ ] Remove the `swcMinify` configuration option
- [ ] Test that the dev server starts without warnings
- [ ] Verify build process still works correctly

## Acceptance Criteria

- No configuration warnings appear when starting the dev server
- Build and minification continue to work correctly
- No regression in bundle size or performance

## Technical Notes

- In Next.js 13+, SWC minification became the default
- In Next.js 15, the option was completely removed
- This is a simple cleanup task to remove deprecated configuration