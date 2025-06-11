# Create Unit Tests and Route Tests

**Created**: 2025-06-10
**Priority**: High
**Component**: Testing

## Description
Implement comprehensive unit tests for components and utilities, plus route tests for all Next.js pages and API routes.

## Tasks
- [ ] Set up testing framework (Jest + React Testing Library)
- [ ] Create unit tests for utility functions
- [ ] Create component unit tests
- [ ] Create route tests for all pages
- [ ] Create tests for AI actions
- [ ] Set up test coverage reporting
- [ ] Add tests to CI/CD pipeline

## Testing Setup
```bash
# Install testing dependencies
npm install --save-dev jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
npm install --save-dev @testing-library/user-event @testing-library/react-hooks
npm install --save-dev @types/jest
```

## Test Structure
```
tests/
├── unit/
│   ├── components/
│   │   ├── wizard/
│   │   │   ├── stage-card.test.tsx
│   │   │   ├── wizard-shell.test.tsx
│   │   │   └── stage-input-area.test.tsx
│   │   └── ui/
│   │       └── button.test.tsx
│   ├── lib/
│   │   ├── utils.test.ts
│   │   └── workflow-loader.test.ts
│   └── actions/
│       └── aiActions.test.ts
├── integration/
│   ├── routes/
│   │   ├── home.test.tsx
│   │   ├── dashboard.test.tsx
│   │   └── wizard.test.tsx
│   └── workflows/
│       └── workflow-execution.test.tsx
└── e2e/
    └── (Playwright tests)
```

## Unit Test Examples

### Component Test
```typescript
// stage-card.test.tsx
describe('StageCard', () => {
  it('shows process button when stage is idle', () => {
    const { getByTestId } = render(<StageCard {...props} />);
    expect(getByTestId('process-stage-1')).toBeInTheDocument();
  });

  it('disables button when dependencies not met', () => {
    const props = { stageState: { depsAreMet: false } };
    const { getByTestId } = render(<StageCard {...props} />);
    expect(getByTestId('process-stage-1')).toBeDisabled();
  });
});
```

### Utility Test
```typescript
// utils.test.ts
describe('cn utility', () => {
  it('merges class names correctly', () => {
    expect(cn('base', 'additional')).toBe('base additional');
    expect(cn('base', { active: true })).toBe('base active');
  });
});
```

### Route Test
```typescript
// dashboard.test.tsx
describe('Dashboard Page', () => {
  it('renders workflow cards', async () => {
    render(<DashboardPage />);
    expect(screen.getByText('Targeted Page SEO Optimized V3')).toBeInTheDocument();
    expect(screen.getByText('SEO Optimized Cooking Recipe')).toBeInTheDocument();
  });

  it('shows login prompt when not authenticated', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });
    render(<DashboardPage />);
    expect(screen.getByTestId('dashboard-login-button')).toBeInTheDocument();
  });
});
```

## API/Action Tests
```typescript
// aiActions.test.ts
describe('runAiStage', () => {
  it('processes stage with valid input', async () => {
    const result = await runAiStage({
      promptTemplate: 'Test {{input}}',
      model: 'gemini-2.0-flash',
      contextVars: { input: 'test' }
    });
    expect(result.content).toBeDefined();
    expect(result.error).toBeUndefined();
  });

  it('handles errors gracefully', async () => {
    const result = await runAiStage({ /* invalid */ });
    expect(result.error).toBeDefined();
  });
});
```

## Coverage Goals
- Minimum 80% code coverage
- 100% coverage for utility functions
- 90% coverage for critical paths
- All user-facing features tested

## CI/CD Integration
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test -- --coverage
      - run: npm run test:e2e
```

## Acceptance Criteria
- [ ] Jest configured with Next.js
- [ ] Unit tests for all utilities
- [ ] Component tests with >80% coverage
- [ ] Route tests for all pages
- [ ] AI action tests with mocking
- [ ] Test coverage reports generated
- [ ] All tests passing in CI