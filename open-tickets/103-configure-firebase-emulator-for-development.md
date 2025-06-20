# 103: Configure Firebase Emulator for Development

**Created**: 2025-06-20
**Priority**: Medium
**Component**: Firebase Configuration

## Description

The development environment is repeatedly showing warnings about using production Firebase:

```
[FIREBASE INIT] WARNING: Using PRODUCTION Firebase!
```

This warning appears multiple times during development, indicating that the Firebase emulator is not being used despite the CLAUDE.md documentation recommending Firebase emulators for local development.

## Tasks

- [ ] Review current Firebase configuration in the codebase
- [ ] Ensure Firebase emulator configuration is properly set up
- [ ] Update environment variables to use emulator in development
- [ ] Add clear documentation about when to use production vs emulator
- [ ] Consider adding a development mode check to automatically use emulator

## Acceptance Criteria

- Firebase emulator is used by default in development mode
- Production Firebase is only used when explicitly configured
- Clear console messages indicate which Firebase mode is active
- No accidental writes to production database during development

## Technical Notes

- Current environment variable: `NEXT_PUBLIC_USE_FIREBASE_EMULATOR=false`
- This should likely be `true` for development mode
- May need to update Firebase initialization logic to respect this setting