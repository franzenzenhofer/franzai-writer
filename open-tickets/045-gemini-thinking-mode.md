# Enable Gemini Thinking Mode

**Created**: 2025-06-10
**Priority**: Low
**Component**: AI Integration

## Description
Expose Gemini's thinking features so workflows can request thought summaries and configure thinking budgets. All parameters should be stored in `workflow.json`.

## Tasks
- [ ] Update genkit configuration to include `thinkingConfig`
- [ ] Allow workflows to specify thinking budgets per stage
- [ ] Display thought summaries in the UI when available
- [ ] Handle pricing implications for thinking tokens
- [ ] Update documentation with usage guidelines
