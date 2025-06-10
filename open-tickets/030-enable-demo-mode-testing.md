# Enable Demo Mode for Testing

**Created**: 2025-06-10
**Priority**: CRITICAL
**Component**: Authentication/Testing

## Description
Currently, the application requires authentication for all features, making it impossible to test workflows without creating real user accounts. We need a demo mode that allows testing without authentication.

## Current Issue
- AuthGuard blocks access to wizard without login
- No way to test workflows in demo mode
- Testing requires real Firebase authentication
- This blocks automated testing

## Tasks
- [ ] Implement demo mode flag in environment
- [ ] Modify AuthGuard to allow demo mode
- [ ] Create demo user context
- [ ] Update document persistence for demo mode
- [ ] Add demo mode indicator in UI
- [ ] Ensure demo data doesn't persist

## Implementation Approach

### 1. Environment Variable
```env
NEXT_PUBLIC_DEMO_MODE=true
```

### 2. Modified AuthGuard
```typescript
export function AuthGuard({ children, fallbackPath = '/login' }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  useEffect(() => {
    if (!loading && !user && !isDemoMode) {
      router.push(fallbackPath);
    }
  }, [user, loading, router, fallbackPath, isDemoMode]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user && !isDemoMode) {
    return null;
  }

  return <>{children}</>;
}
```

### 3. Demo User Context
```typescript
const DEMO_USER = {
  uid: 'demo-user',
  email: 'demo@example.com',
  displayName: 'Demo User',
  isDemo: true
};
```

## Acceptance Criteria
- [ ] Demo mode can be enabled via environment variable
- [ ] Workflows accessible without authentication in demo mode
- [ ] Demo mode clearly indicated in UI
- [ ] Demo data stored in memory only
- [ ] Automated tests can run without Firebase auth