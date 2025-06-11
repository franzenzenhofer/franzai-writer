# Add Environment Variable Validation

**Created**: 2025-06-10
**Priority**: High
**Component**: Configuration/Security
**Status**: PARTIALLY COMPLETE (Updated: 2025-06-11)

## UPDATE 2025-06-11
Environment variables are used throughout the codebase:
- Firebase configuration uses process.env variables
- API routes check for environment variables
- Test endpoints exist for environment validation (/api/test-env)

However, the comprehensive validation system is NOT complete:
- No Zod schema validation
- No startup validation that prevents app from starting
- No type-safe environment access wrapper
- No .env.example file in the project

## Description
Implement proper environment variable validation to ensure all required variables are present and valid before the application starts.

## Issues Found
- No validation of required environment variables
- Application may fail silently with missing configs
- Security risk if API keys are missing or malformed

## Tasks
- [ ] Create environment validation schema
- [ ] Add startup validation script
- [ ] Implement type-safe environment access
- [ ] Add validation for all required variables
- [ ] Create .env.example file
- [ ] Add validation to build process
- [ ] Document all environment variables

## Implementation
```typescript
// src/lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  // Firebase
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1),
  
  // Genkit
  GOOGLE_GENAI_API_KEY: z.string().min(1),
  
  // Development
  NEXT_PUBLIC_USE_FIREBASE_EMULATOR: z.enum(['true', 'false']).optional(),
});

export const env = envSchema.parse(process.env);
```

## Environment Variables to Validate
- NEXT_PUBLIC_FIREBASE_API_KEY
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- NEXT_PUBLIC_FIREBASE_PROJECT_ID
- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- NEXT_PUBLIC_FIREBASE_APP_ID
- GOOGLE_GENAI_API_KEY
- NEXT_PUBLIC_USE_FIREBASE_EMULATOR

## Acceptance Criteria
- [ ] App fails to start with missing required env vars
- [ ] Clear error messages for missing variables
- [ ] Type-safe environment access throughout app
- [ ] .env.example file with all variables documented