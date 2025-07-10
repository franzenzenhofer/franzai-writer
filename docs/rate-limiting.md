# Rate Limiting Implementation

This document describes the client-side rate limiting system implemented to prevent abuse and manage API quotas effectively.

## Overview

The rate limiting system uses a sliding window approach to track AI requests on the client side. It provides:

- **Configurable limits**: Default 10 requests per 10 minutes
- **User feedback**: Warnings at 80% usage, errors when exceeded
- **Automatic cleanup**: Old requests are automatically removed
- **Multi-tab sync**: Rate limits work across browser tabs
- **Visual indicators**: Progress bars and countdown timers

## Architecture

### Core Components

1. **Rate Limiting Hook** (`src/hooks/use-rate-limit.ts`)
   - React hook for rate limiting functionality
   - Standalone service class for non-React usage
   - localStorage-based persistence

2. **UI Components** (`src/components/ui/rate-limit-status.tsx`)
   - Status display components
   - Warning and error alerts
   - Progress indicators

3. **Integration Points**
   - AI Stage Runner: Pre-request validation
   - Wizard Shell: User feedback and error handling

### Data Flow

```
User Action → Rate Limit Check → AI Request → Response
     ↓              ↓              ↓
   UI Update ← Error Handling ← Rate Limit Record
```

## Configuration

### Default Settings

```typescript
const DEFAULT_CONFIG = {
  maxRequests: 10,        // Maximum requests allowed
  windowMs: 10 * 60 * 1000,  // 10 minutes window
  warningThreshold: 0.8,     // Show warning at 80% usage
  storageKey: 'ai-rate-limit-requests'
};
```

### Customization

```typescript
// Custom rate limit configuration
const customRateLimit = useRateLimit({
  maxRequests: 20,           // Allow 20 requests
  windowMs: 60 * 60 * 1000,  // Per hour
  warningThreshold: 0.9,     // Warn at 90% usage
  storageKey: 'custom-rate-limit'
});
```

## Usage

### React Hook

```typescript
import { useRateLimit } from '@/hooks/use-rate-limit';

function MyComponent() {
  const { status, checkAndRecord, formatTimeUntilReset } = useRateLimit();
  
  const handleAction = async () => {
    try {
      // Check and record request
      checkAndRecord('/api/my-endpoint', 'user-id');
      
      // Proceed with actual request
      await fetch('/api/my-endpoint');
      
    } catch (error) {
      if (error instanceof RateLimitError) {
        // Handle rate limit exceeded
        console.error('Rate limited:', error.message);
      }
    }
  };
  
  return (
    <div>
      <button onClick={handleAction} disabled={status.isLimited}>
        Make Request ({status.remainingRequests} remaining)
      </button>
    </div>
  );
}
```

### Standalone Service

```typescript
import { RateLimitService } from '@/hooks/use-rate-limit';

const rateLimiter = new RateLimitService({
  maxRequests: 5,
  windowMs: 5 * 60 * 1000  // 5 minutes
});

// Check before making request
if (rateLimiter.canMakeRequest()) {
  // Make request
  rateLimiter.recordRequest('/api/endpoint');
} else {
  // Handle rate limit
  console.log('Rate limited');
}
```

### UI Components

```typescript
import { RateLimitStatusDisplay } from '@/components/ui/rate-limit-status';

function MyPage() {
  const { status, formatTimeUntilReset, resetRequests } = useRateLimit();
  
  return (
    <div>
      <RateLimitStatusDisplay 
        status={status}
        formatTimeUntilReset={formatTimeUntilReset}
        showResetButton={process.env.NODE_ENV === 'development'}
        onReset={resetRequests}
      />
    </div>
  );
}
```

## Error Handling

### Rate Limit Error

```typescript
import { RateLimitError } from '@/hooks/use-rate-limit';

try {
  await makeAIRequest();
} catch (error) {
  if (error instanceof RateLimitError) {
    console.log('Rate limited:', error.message);
    console.log('Remaining requests:', error.remainingRequests);
    console.log('Reset time:', error.resetTime);
    console.log('Retry after:', error.retryAfter, 'seconds');
  }
}
```

### Error Properties

- `message`: Human-readable error message
- `remainingRequests`: Number of requests remaining
- `resetTime`: Timestamp when limit resets
- `retryAfter`: Seconds until retry is allowed

## Storage

### Data Structure

```typescript
interface RequestRecord {
  timestamp: number;   // When request was made
  endpoint?: string;   // Which endpoint was called
  userId?: string;     // User identifier
}
```

### Storage Key

Default: `ai-rate-limit-requests`

Data is stored in localStorage and automatically cleaned up when requests expire.

## Testing

### Development Tools

Use the rate limit test component in development:

```typescript
import { RateLimitTest } from '@/components/dev/rate-limit-test';

// Only available in development mode
<RateLimitTest />
```

### Manual Testing

1. **Basic Test**: Verify rate limiting works
2. **Stress Test**: Exceed rate limit to test error handling
3. **Reset Test**: Verify reset functionality works
4. **Multi-tab Test**: Open multiple tabs and verify sync

## Integration Points

### AI Stage Runner

Rate limiting is automatically applied to all AI requests through the `runAiStage` function in `src/lib/ai-stage-runner.ts`.

### Wizard Shell

The wizard shell displays rate limit status and handles rate limit errors with appropriate user feedback.

## Monitoring

### Console Logging

Rate limit events are logged to the console:

```
[AI Stage Runner] Rate limit check passed
[AI Stage Runner] Rate limit exceeded
[WizardShell] Rate limit exceeded for stage
```

### Status Tracking

Monitor rate limit status in real-time:

```typescript
const { status } = useRateLimit();

console.log('Usage:', status.usagePercentage);
console.log('Remaining:', status.remainingRequests);
console.log('Is limited:', status.isLimited);
console.log('Should warn:', status.shouldShowWarning);
```

## Best Practices

1. **Always check rate limits** before making AI requests
2. **Provide clear feedback** to users about rate limiting
3. **Handle errors gracefully** with retry guidance
4. **Use appropriate limits** for your use case
5. **Test thoroughly** in development
6. **Monitor usage** to adjust limits as needed

## Troubleshooting

### Common Issues

1. **Rate limit not working**: Check localStorage is enabled
2. **Inconsistent behavior**: Clear localStorage data
3. **Multi-tab issues**: Ensure storage event listeners are working
4. **Development testing**: Use reset button to clear limits

### Debugging

```typescript
// Check current status
console.log(defaultRateLimitService.getStatus());

// Check localStorage
console.log(localStorage.getItem('ai-rate-limit-requests'));

// Reset for testing
defaultRateLimitService.resetRequests();
```

## Security Considerations

- **Client-side only**: This is not a security measure, only UX
- **Can be bypassed**: Users can clear localStorage
- **Server-side backup**: Consider server-side rate limiting for security
- **Abuse detection**: Monitor for unusual patterns

## Performance

- **Minimal overhead**: Only checks when needed
- **Automatic cleanup**: Old requests are removed efficiently
- **Local storage**: No network requests for rate limiting
- **Multi-tab sync**: Uses storage events for coordination