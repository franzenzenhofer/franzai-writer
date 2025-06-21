# Critical Authentication Fix from webpack-module-resolution Branch

**Created:** 2025-06-21
**Priority:** CRITICAL
**Component:** Authentication, Security
**Type:** Security Fix

## Overview

The `origin/fix/webpack-module-resolution` branch contains a CRITICAL authentication fix that we absolutely need. This branch removes the dangerous `generateUserId()` fallback that violates our FAIL HARD policy.

## CRITICAL Change We MUST Port

### Remove generateUserId() Fallback - FAIL HARD Policy

**What needs to be removed:**
```typescript
// This MUST be deleted - NO FALLBACKS!
function generateUserId(): string {
  const prefix = typeof window !== 'undefined' ? 'client' : 'server';
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 12);
  return `${prefix}_user_${timestamp}_${randomStr}`;
}
```

**Why this is CRITICAL:**
- Violates FAIL HARD policy - we don't want fallbacks
- Server-generated user IDs break document retrieval
- Creates inconsistent state in the application
- This is a SECURITY/CONSISTENCY issue

**Implementation:**
1. Find ALL instances of `generateUserId()` 
2. DELETE the function completely
3. Ensure code FAILS if no authentication present
4. ONLY allow temporary users through explicit "Try it out" flow (see ticket 108)

## Nice-to-Have Improvements (Lower Priority)

### Build Info System (Optional)
- Adds version tracking for deployments
- Useful for debugging production issues
- Can be implemented later if needed

### Design Guidelines Documentation (Optional)
- Documents the design system
- Good for team consistency
- Can be added incrementally

## Implementation Priority

1. **IMMEDIATE**: Remove `generateUserId()` fallback
2. **Later**: Consider build info system if deployment tracking needed
3. **Later**: Add design documentation as team grows

## Success Criteria

- [ ] `generateUserId()` function COMPLETELY REMOVED
- [ ] Application FAILS HARD if no authentication
- [ ] No defensive coding or fallbacks
- [ ] "Try it out" mode is the ONLY way to use app without auth

## Notes

The authentication fix is MANDATORY and must be done immediately. The other improvements are nice-to-have and can be implemented later based on actual needs.