# Add Settings Page with Keyboard Hint Toggle

**Created**: 2025-06-20
**Priority**: Low
**Component**: Settings, UI/UX
**Status**: OPEN

## Description

Create a settings page that allows users to toggle the display of keyboard shortcuts (CMD+Enter hints) next to buttons. This gives power users who are familiar with the shortcuts the option to hide them for a cleaner interface.

## Background

As part of the CMD+Enter submit functionality implementation, keyboard hints are now displayed next to buttons (e.g., "Run AI (⌘+Enter)" on Mac). While helpful for discovering the feature, experienced users may prefer to hide these hints.

## Tasks

- [ ] Create a new settings page route at `/settings`
- [ ] Add settings navigation item to the main menu
- [ ] Implement user preferences storage (localStorage or user database)
- [ ] Create toggle switch for "Show keyboard shortcuts"
- [ ] Update KeyboardHint component to respect user preference
- [ ] Add other relevant settings as needed (theme, AI preferences, etc.)
- [ ] Ensure settings persist across sessions
- [ ] Add proper mobile responsiveness

## Technical Considerations

1. **Storage Options**:
   - Local: Use localStorage for anonymous users
   - Database: Store in user profile for authenticated users
   - Consider using a context provider for global access

2. **Settings Structure**:
   ```typescript
   interface UserSettings {
     ui: {
       showKeyboardHints: boolean;
       theme?: 'light' | 'dark' | 'system';
     };
     // Future settings categories
   }
   ```

3. **Component Updates**:
   - KeyboardHint should check settings before rendering
   - Use React Context or similar for global settings access
   - Ensure SSR compatibility

## UI/UX Requirements

- Clean, organized settings layout
- Group related settings together
- Clear labels and descriptions
- Instant feedback when toggling settings
- Consider adding a "Reset to defaults" option

## Future Expansion

This settings page can later include:
- Theme selection (light/dark mode)
- AI model preferences
- Export format defaults
- Auto-save intervals
- Notification preferences
- Language selection

## Acceptance Criteria

- [ ] Settings page accessible from main navigation
- [ ] Keyboard hint toggle works immediately
- [ ] Settings persist across page reloads
- [ ] Settings sync for authenticated users
- [ ] Mobile-friendly interface
- [ ] No performance impact on app startup
- [ ] Graceful fallback if settings fail to load