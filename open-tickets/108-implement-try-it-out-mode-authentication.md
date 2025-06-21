# Implement "Try It Out" Mode Authentication System

**Created:** 2025-06-21
**Priority:** High
**Component:** Authentication, User Management
**Type:** Feature Implementation

## Background

Currently, the application has a `generateUserId()` fallback method that creates server-side user IDs when no authentication is present. This violates our FAIL HARD policy. However, we want to support a "Try It Out" mode that allows users to experience the full application without logging in.

## Current Situation

From analysis of the `origin/fix/webpack-module-resolution` branch:
- The branch removes the `generateUserId()` fallback entirely (which is correct)
- This enforces the FAIL HARD policy - no fallbacks!
- However, we need a proper "Try It Out" mode implementation

## Requirements

### "Try It Out" Mode Specification

1. **Entry Point**: 
   - The homepage has a "Try it" button (right button)
   - This should navigate to the dashboard with a temporary user session

2. **Temporary User Implementation**:
   - Generate a temporary user ID (e.g., `temp_user_[timestamp]_[random]`)
   - This should be a deliberate feature, NOT a fallback
   - Store this in session/local storage
   - Allow full functionality as if logged in

3. **User Experience**:
   - User can create documents, use all features
   - Documents are saved with the temporary user ID
   - Clear messaging that this is temporary
   - Prompt to create account to save work permanently

4. **Technical Implementation**:
   - Create a `createTemporarySession()` function (NOT a fallback!)
   - This is only called when user explicitly clicks "Try it"
   - Set a flag like `isTemporaryUser: true`
   - Display appropriate UI indicators

## Implementation Tasks

1. **Remove the fallback** (from webpack-module-resolution branch):
   ```typescript
   // DELETE THIS CODE - NO FALLBACKS!
   function generateUserId(): string {
     const prefix = typeof window !== 'undefined' ? 'client' : 'server';
     const timestamp = Date.now();
     const randomStr = Math.random().toString(36).substring(2, 12);
     return `${prefix}_user_${timestamp}_${randomStr}`;
   }
   ```

2. **Create proper Try It Out mode**:
   ```typescript
   // NEW: Deliberate temporary session creation
   export function createTemporarySession(): TemporaryUser {
     // This is ONLY called from "Try it" button
     const tempId = `temp_user_${Date.now()}_${crypto.randomUUID()}`;
     return {
       uid: tempId,
       isTemporary: true,
       createdAt: new Date(),
       expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
     };
   }
   ```

3. **Update UI Components**:
   - Add "Try it" button handler on homepage
   - Show temporary user indicator in dashboard
   - Add "Create Account" prompts in strategic locations

4. **Document Persistence**:
   - Ensure temporary documents are properly marked
   - Consider cleanup strategy for old temporary data

## Acceptance Criteria

- [ ] NO fallback user ID generation - FAIL HARD if no auth
- [ ] "Try it" button creates explicit temporary session
- [ ] Full functionality available in Try It Out mode
- [ ] Clear UI indicators for temporary status
- [ ] Smooth upgrade path to real account
- [ ] Documents created in temporary mode are retrievable

## Notes

This is NOT about adding fallbacks or defensive coding. This is about implementing a proper, intentional "Try It Out" feature that gives users a taste of the application before signing up.