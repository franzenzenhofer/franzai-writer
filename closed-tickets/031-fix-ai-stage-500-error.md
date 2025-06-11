# Fix AI Stage Processing 500 Error

**Created**: 2025-06-10
**Priority**: CRITICAL
**Component**: AI/API

## Description
When processing AI stages in the wizard, the server returns 500 Internal Server Error. This prevents the workflow from completing.

## Error Details
- Console shows: "Failed to load resource: the server responded with a status of 500 (Internal Server Error)"
- Occurs when clicking "Process Stage" for AI-powered stages
- Server logs don't show the actual error
- Affects both article and recipe workflows

## Potential Causes
- Missing or invalid Genkit API key
- AI action route not properly configured
- Demo mode not handled in AI processing
- Error in prompt template processing
- Missing error handling in runAiStage

## Tasks
- [ ] Add proper error logging to AI actions
- [ ] Check Genkit configuration
- [ ] Verify API keys are valid
- [ ] Add try-catch blocks with detailed logging
- [ ] Handle demo mode in AI processing
- [ ] Return proper error responses

## Debug Steps
1. Check `/app/actions/aiActions.ts` for error handling
2. Verify GOOGLE_GENAI_API_KEY is set correctly
3. Add console.log to trace execution
4. Check if Genkit is properly initialized
5. Test API directly with curl

## Acceptance Criteria
- [ ] AI stages process without 500 errors
- [ ] Proper error messages returned to client
- [ ] Errors logged with stack traces
- [ ] Demo mode works with AI generation