# Add Unique IDs to All Interactive Elements

**Created**: 2025-01-07
**Priority**: MEDIUM
**Component**: UI/Accessibility/Testing

## Description
Currently, interactive elements (buttons, textareas, inputs, selects) throughout the application lack unique IDs, which creates issues for accessibility, automated testing with Playwright, and proper element identification. Every interactive element should have a unique, descriptive ID attribute.

## Current Issue
- Interactive elements missing ID attributes across the application
- Difficult to target specific elements for Playwright testing
- Poor accessibility for screen readers and assistive technologies
- Hard to track user interactions with specific elements
- Challenging to debug UI issues related to specific components
- Textareas, inputs, and selects not easily accessible for automated testing

## Benefits of Unique Element IDs
- **Accessibility**: Screen readers can properly identify and announce elements
- **Playwright Testing**: E2E tests can reliably target specific elements
- **Analytics**: Track specific element interactions
- **Debugging**: Easier to identify problematic elements in logs
- **Maintenance**: Clear identification for developers
- **Form Testing**: Automated tests can easily fill and validate form fields

## Tasks
- [ ] Audit all interactive elements across the application
- [ ] Create naming convention for element IDs
- [ ] Add unique IDs to all buttons in components
- [ ] Add unique IDs to all textareas (especially Audience Analysis form)
- [ ] Add unique IDs to all input fields
- [ ] Add unique IDs to all select/dropdown elements
- [ ] Update UI library components (Button, Textarea, Input, Select, etc.)
- [ ] Add IDs to form elements for Playwright testing
- [ ] Add IDs to navigation elements
- [ ] Add IDs to action elements (Edit, Delete, etc.)
- [ ] Add IDs to wizard navigation and form elements
- [ ] Add IDs to modal and dialog elements
- [ ] Document ID naming conventions

## ID Naming Convention
```typescript
// Format: [component/page]-[field/action]-[context?]-[type]
// Examples:
// Buttons
id="wizard-continue-btn"
id="login-submit-btn"
id="dashboard-create-workflow-btn"
id="workflow-delete-confirm-btn"
id="header-menu-toggle-btn"

// Form Elements
id="audience-demographics-textarea"
id="audience-interests-textarea"
id="audience-knowledge-select"
id="login-email-input"
id="signup-password-input"
```

## Technical Implementation
- [ ] Search all components for interactive elements (`<button>`, `<textarea>`, `<input>`, `<select>`)
- [ ] Update UI components to require/generate IDs (Button, Textarea, Input, Select)
- [ ] Add TypeScript interfaces for element ID requirements
- [ ] Create utility function for generating consistent IDs
- [ ] Update all existing interactive element usages
- [ ] Prioritize Audience Analysis form elements for Playwright testing

## Files to Review
- [ ] `src/components/ui/button.tsx`
- [ ] `src/components/ui/textarea.tsx`
- [ ] `src/components/ui/input.tsx`
- [ ] `src/components/ui/select.tsx`
- [ ] All wizard components (especially Audience Analysis)
- [ ] All form components
- [ ] Navigation components
- [ ] Modal/dialog components
- [ ] Dashboard components

## Acceptance Criteria
- [ ] Every interactive element in the application has a unique ID
- [ ] ID naming follows established convention
- [ ] No duplicate IDs across the application
- [ ] All UI components enforce ID requirements
- [ ] Documentation updated with ID guidelines
- [ ] Playwright tests can reliably target all elements by ID
- [ ] Audience Analysis textareas have specific IDs for testing
- [ ] Form validation and submission testing works reliably 