# Support Gemini Files API for Large Inputs

**Created**: 2025-06-10
**Priority**: Low
**Component**: AI Integration

## Description
Implement the Gemini Files API to handle large files or reusable assets in workflows. Stages should reference uploaded file IDs in `workflow.json`.

## Tasks
- [ ] Add API calls to upload and manage files
- [ ] Allow stages to reference `createPartFromUri` file IDs
- [ ] Provide UI feedback for upload progress and status
- [ ] Ensure uploaded files are cached and reused when possible
- [ ] Document file management within workflows
