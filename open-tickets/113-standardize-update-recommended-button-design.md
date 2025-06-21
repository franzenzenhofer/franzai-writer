# Ticket #113: Standardize "Update Recommended" Button to Design Guidelines

**Priority:** Medium  
**Type:** UX Improvement, Design System Compliance  
**Components:** `DismissibleWarningBadge`, Stage Cards, Export Stage Card  
**Status:** Open

## Problem Statement

The current "Update recommended" functionality uses a `DismissibleWarningBadge` component that:

1. **Not following design guidelines**: Uses badge styling instead of the standard warning button variant
2. **Causes layout reflows**: Positioned inline with title, causing text reflow when appearing/disappearing  
3. **Poor UX placement**: Embedded in card titles, disrupting visual hierarchy
4. **Inconsistent with design system**: Should use the warning button variant defined in design guidelines

## Current Implementation Analysis

### Current Code Locations:
- `src/components/wizard/dismissible-warning-badge.tsx` - Custom badge component
- `src/components/wizard/stage-card.tsx:330` - Usage in stage cards
- `src/components/wizard/export-stage/export-stage-card.tsx:322` - Usage in export stages
- `src/components/wizard/wizard-shell.tsx:987` - Alert variant implementation

### Current Styling:
```tsx
// Current badge implementation
<Badge
  variant="outline"
  className="bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-300"
>
  Update recommended
</Badge>
```

### Design Guidelines Specify:
```tsx
// WARNING BUTTON (Caution Actions)
variant="warning"
className="bg-amber-500 text-white hover:bg-amber-600 hover:shadow-md shadow-sm border border-amber-500 hover:border-amber-600 active:scale-95"
```

## Solution Requirements

### 1. Design System Compliance
- **MUST** use the standard `warning` button variant from design guidelines
- **MUST** follow amber background with white text specification
- **MUST** include proper hover states and shadow effects
- **MUST** maintain 44px minimum touch target (already satisfied by Button component)

### 2. UX & Layout Requirements
- **MUST NOT** cause reflows in stage card layouts
- **MUST** be positioned to not disrupt card title hierarchy
- **MUST** provide clear visual indication without destroying card design
- **MUST** be easily discoverable but not visually overwhelming

### 3. Positioning Strategy
**Recommended approach**: Move to card header actions area instead of inline with title

```tsx
// Current problematic placement (causes reflow)
<CardTitle className="font-headline text-xl flex items-center">
  {stage.title}
  {isStale && <DismissibleWarningBadge>Update recommended</DismissibleWarningBadge>}
</CardTitle>

// Proposed placement (no reflow)
<CardHeader className="flex flex-row justify-between items-start">
  <div className="flex-1 min-w-0">
    <CardTitle>{stage.title}</CardTitle>
    <CardDescription>{stage.description}</CardDescription>
  </div>
  <div className="flex-shrink-0 ml-2 flex items-center gap-2">
    {isStale && (
      <Button
        variant="warning"
        size="sm"
        onClick={handleRegenerate}
        className="whitespace-nowrap"
      >
        Update recommended
      </Button>
    )}
    <StageInfoTrigger stage={stage} workflow={workflow} />
  </div>
</CardHeader>
```

## Implementation Plan

### Phase 1: Create Standardized Component
1. Create `UpdateRecommendedButton` component using warning variant
2. Implement proper dismiss functionality
3. Add click-to-regenerate functionality
4. Follow all design guidelines (shadows, borders, hover states)

### Phase 2: Update Stage Cards
1. Replace `DismissibleWarningBadge` usage in `stage-card.tsx`
2. Position button in card header actions area
3. Ensure no layout reflows occur
4. Test responsive behavior

### Phase 3: Update Export Stage Cards  
1. Replace usage in `export-stage-card.tsx`
2. Maintain consistent positioning with regular stage cards
3. Test all export stage states

### Phase 4: Testing & Validation
1. Visual regression testing for layout stability
2. Test reflow behavior on different screen sizes
3. Validate touch targets on mobile devices
4. Confirm design guideline compliance

## Technical Specifications

### New Component Interface:
```tsx
interface UpdateRecommendedButtonProps {
  onRegenerate: () => void;
  onDismiss: () => void;
  size?: 'sm' | 'default';
  className?: string;
}

export function UpdateRecommendedButton({
  onRegenerate,
  onDismiss,
  size = 'sm',
  className
}: UpdateRecommendedButtonProps) {
  return (
    <Button
      variant="warning"
      size={size}
      onClick={onRegenerate}
      className={cn("relative group", className)}
    >
      Update recommended
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          onDismiss();
        }}
        className="ml-2 h-4 w-4 p-0 opacity-70 hover:opacity-100"
      >
        <X className="h-3 w-3" />
      </Button>
    </Button>
  );
}
```

## Success Criteria

- [ ] Uses standard warning button variant with proper styling
- [ ] No layout reflows when button appears/disappears  
- [ ] Positioned in card header actions area (not inline with title)
- [ ] Maintains 44px touch targets on all devices
- [ ] Follows all design guideline specifications
- [ ] Consistent behavior across stage and export stage cards
- [ ] Smooth hover transitions and proper shadows
- [ ] Accessible dismiss functionality
- [ ] Visual hierarchy preserved in card layouts

## Testing Checklist

- [ ] Visual regression tests pass
- [ ] No reflow measured in card layouts
- [ ] Touch targets meet accessibility standards
- [ ] Button styling matches design guidelines exactly
- [ ] Hover states work correctly
- [ ] Dismiss functionality works properly
- [ ] Click-to-regenerate works as expected
- [ ] Responsive behavior validated on mobile
- [ ] Dark mode styling consistent

## Files to Modify

- `src/components/wizard/update-recommended-button.tsx` (new)
- `src/components/wizard/stage-card.tsx`
- `src/components/wizard/export-stage/export-stage-card.tsx`
- Consider deprecating `src/components/wizard/dismissible-warning-badge.tsx`

## Dependencies

- Requires existing Button component with warning variant
- No breaking changes to existing APIs
- Backward compatible implementation approach 