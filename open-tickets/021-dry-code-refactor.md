# DRY Code and Logic Refactor

**Created**: 2025-06-10
**Priority**: High
**Component**: Code Quality
**Status**: PARTIALLY COMPLETE (Updated: 2025-06-11)

## UPDATE 2025-06-11
Some refactoring has been done:
- Common hooks exist (use-document-persistence, use-mobile, use-toast)
- Shared UI components library (shadcn/ui components)
- Some utility functions in lib/utils.ts

However, the comprehensive DRY refactoring is NOT complete:
- Still duplicate patterns in authentication checks
- Repeated form handling logic
- No unified data fetching hooks
- No common error handling utilities
- Stage state management is still repeated
- No systematic refactoring of duplicate code

## Description
Refactor the codebase to eliminate code duplication and repeated logic patterns. Extract common functionality into reusable hooks, utilities, and components.

## Tasks
- [ ] Identify duplicate code patterns
- [ ] Extract common hooks
- [ ] Create shared utility functions
- [ ] Consolidate similar components
- [ ] Standardize data fetching patterns
- [ ] Create common form components
- [ ] Unify error handling
- [ ] Standardize loading states

## Areas of Duplication

### 1. Authentication Checks
**Current**: Repeated in multiple components
```typescript
// Before - repeated in many files
const { user, loading } = useAuth();
if (!user && !loading) {
  return <LoginPrompt />;
}
```

**After**: Extract to hook
```typescript
// hooks/use-require-auth.ts
export function useRequireAuth(redirectTo = '/login') {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo);
    }
  }, [user, loading, redirectTo]);
  
  return { user, loading };
}
```

### 2. Form Handling
**Current**: Similar form logic repeated
```typescript
// Extract common form patterns
export function useFormWithValidation<T>(
  initialValues: T,
  validationSchema: Schema<T>,
  onSubmit: (values: T) => Promise<void>
) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Common form logic
  return { values, errors, isSubmitting, handleChange, handleSubmit };
}
```

### 3. Data Fetching
**Current**: Repeated Firebase queries
```typescript
// hooks/use-firestore-query.ts
export function useFirestoreQuery<T>(
  query: Query,
  options?: { realtime?: boolean }
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Common query logic
  return { data, loading, error, refetch };
}
```

### 4. Stage State Management
**Current**: Repeated stage logic
```typescript
// hooks/use-stage-state.ts
export function useStageState(stageId: string, workflow: Workflow) {
  const [state, setState] = useState<StageState>();
  
  const updateState = useCallback((updates: Partial<StageState>) => {
    // Common update logic
  }, []);
  
  const canRunStage = useMemo(() => {
    // Common validation logic
  }, [state]);
  
  return { state, updateState, canRunStage };
}
```

### 5. Component Patterns
**Current**: Similar card components
```typescript
// components/common/action-card.tsx
interface ActionCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: ButtonProps['variant'];
  }>;
  status?: 'idle' | 'loading' | 'success' | 'error';
}

export function ActionCard({ ...props }: ActionCardProps) {
  // Unified card component
}
```

### 6. API Error Handling
**Current**: Repeated try-catch patterns
```typescript
// utils/api-handler.ts
export async function apiHandler<T>(
  apiCall: () => Promise<T>,
  options?: {
    onError?: (error: Error) => void;
    errorMessage?: string;
    showToast?: boolean;
  }
): Promise<{ data?: T; error?: Error }> {
  try {
    const data = await apiCall();
    return { data };
  } catch (error) {
    // Unified error handling
    return { error };
  }
}
```

### 7. Status Indicators
**Current**: Repeated status UI
```typescript
// components/common/status-indicator.tsx
interface StatusIndicatorProps {
  status: 'idle' | 'loading' | 'success' | 'error' | 'warning';
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusIndicator({ status, message, size = 'md' }: StatusIndicatorProps) {
  // Unified status display
}
```

## Refactoring Strategy
1. Start with most repeated patterns
2. Create abstractions incrementally
3. Maintain backward compatibility
4. Add comprehensive tests
5. Update documentation

## Benefits
- Reduced code size (est. 30%)
- Easier maintenance
- Consistent behavior
- Faster development
- Better testability

## Acceptance Criteria
- [ ] No duplicate code blocks > 10 lines
- [ ] Common hooks extracted
- [ ] Utility functions consolidated
- [ ] Component library created
- [ ] Tests updated
- [ ] Documentation updated
- [ ] Code review passed