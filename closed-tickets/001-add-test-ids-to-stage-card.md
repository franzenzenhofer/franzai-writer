# Add Test IDs to Stage Card Component

**Created**: 2025-06-10
**Priority**: High
**Component**: src/components/wizard/stage-card.tsx

## Description
Add data-testid and id attributes to all interactive elements in the StageCard component to make it more testable with Playwright.

## Tasks
- [ ] Add test IDs to Process Stage button
- [ ] Add test IDs to Skip Stage button  
- [ ] Add test IDs to Edit Input button
- [ ] Add test IDs to Edit Output button
- [ ] Add test IDs to AI Redo button
- [ ] Add test IDs to Accept & Continue button
- [ ] Add test IDs to Save Output Edits button
- [ ] Add unique IDs based on stage.id for each button

## Acceptance Criteria
- All buttons have unique data-testid attributes
- IDs include the stage ID for uniqueness
- No breaking changes to existing functionality