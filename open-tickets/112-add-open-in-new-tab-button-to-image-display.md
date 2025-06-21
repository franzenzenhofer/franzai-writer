# Ticket #112: Add "Open in New Tab" Button to Image Display

## Priority: Medium

## Type: Feature Enhancement

## Description
Add a small icon button next to the existing download button in the `ImageOutputDisplay` component that opens the image in a new browser tab for better viewing and sharing.

## Current State
The `ImageOutputDisplay` component (`src/components/wizard/image-output-display.tsx`) currently has:
- A download button positioned `absolute top-2 right-2`
- Single button layout with Download icon and "Download" text
- Working download functionality for generated images

## Required Changes

### 1. Update ImageOutputDisplay Component
**File**: `src/components/wizard/image-output-display.tsx`

**Changes needed**:
- Import `ExternalLink` icon from lucide-react
- Add `handleOpenInNewTab` function
- Update button layout to use flex container for both buttons
- Add new icon-only button for opening in new tab

**Current button area** (lines ~140-155):
```tsx
{/* Download button */}
{imageUrl && selectedImage && (
  <Button
    size="sm"
    variant="outline"
    className="absolute top-2 right-2"
    onClick={() => handleDownload(selectedImage, selectedIndex)}
  >
    <Download className="h-4 w-4 mr-1" />
    Download
  </Button>
)}
```

**Should become**:
```tsx
{/* Action buttons */}
{imageUrl && selectedImage && (
  <div className="absolute top-2 right-2 flex gap-1">
    <Button
      size="sm"
      variant="outline"
      onClick={() => handleDownload(selectedImage, selectedIndex)}
      id="image-download-btn"
    >
      <Download className="h-4 w-4 mr-1" />
      Download
    </Button>
    <Button
      size="sm"
      variant="outline"
      className="px-2"
      onClick={() => handleOpenInNewTab(imageUrl)}
      title="Open image in new tab"
      id="image-open-new-tab-btn"
    >
      <ExternalLink className="h-4 w-4" />
    </Button>
  </div>
)}
```

### 2. Add handleOpenInNewTab Function
Add this function after the existing `handleDownload` function:

```tsx
const handleOpenInNewTab = (imageUrl: string) => {
  if (!imageUrl) {
    console.error("No URL available to open");
    return;
  }
  
  // For data URLs, we need to create a blob URL for the new tab
  if (imageUrl.startsWith("data:")) {
    fetch(imageUrl)
      .then(response => response.blob())
      .then(blob => {
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
        // Clean up after a delay
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      })
      .catch(err => {
        console.error("Error opening image in new tab:", err);
      });
  } else {
    // Direct HTTP URLs can be opened directly
    window.open(imageUrl, '_blank');
  }
};
```

## Design Guidelines Compliance

### Button Hierarchy
- **Download button**: Maintains existing outline variant (export action)
- **Open in new tab**: Icon-only outline variant (secondary action)
- **Layout**: Horizontal flex container with `gap-1` for proper spacing

### Accessibility
- Add `title` attribute for tooltip on hover
- Add unique `id` attributes for both buttons for testing
- Maintain 44px minimum touch target (current button size)
- Keep existing keyboard navigation support

### Visual Design
- Use `ExternalLink` icon (4x4 size to match download icon)
- Icon-only button with `px-2` padding (smaller than download button)
- Consistent outline variant with existing design system
- Positioned in top-right corner as button group

## Testing Requirements

### Unit Tests
- Test `handleOpenInNewTab` function with HTTP URLs
- Test `handleOpenInNewTab` function with data URLs
- Test button rendering with proper accessibility attributes

### E2E Tests
- Add test case to verify both buttons are visible
- Test download functionality (existing)
- Test new tab opening functionality
- Verify proper button IDs are present

### Manual Testing
- Generate image in poem workflow
- Verify download button still works
- Verify new tab button opens image correctly
- Test with both data URLs and HTTP URLs
- Check responsive behavior on mobile

## Acceptance Criteria

- [ ] Download button functionality remains unchanged
- [ ] New "open in new tab" icon button appears next to download button
- [ ] Button opens image in new browser tab
- [ ] Works with both data URLs and HTTP image URLs
- [ ] Proper accessibility attributes (title, id)
- [ ] Consistent with design system (outline variant)
- [ ] Responsive layout (buttons stack on very small screens if needed)
- [ ] No console errors
- [ ] E2E tests pass
- [ ] Proper cleanup of blob URLs for data URLs

## Implementation Notes

### Error Handling
- Handle cases where image URL is not available
- Console.error for debugging but don't show user errors
- Graceful fallback if window.open is blocked

### Performance
- Immediate opening for HTTP URLs
- Efficient blob creation and cleanup for data URLs
- No memory leaks from unreleased blob URLs

### Browser Compatibility
- Use standard `window.open()` (universal support)
- Standard `URL.createObjectURL()` and `URL.revokeObjectURL()`
- Fallback handling for popup blockers

## Files to Modify
1. `src/components/wizard/image-output-display.tsx` - Main implementation
2. Tests for the component (if they exist)
3. Update E2E tests that verify image display functionality

## Dependencies
- lucide-react (already installed) - for ExternalLink icon
- No new package dependencies required

## Risk Assessment: Low
- Small, contained change to existing component
- Uses existing patterns and icons
- No breaking changes to current functionality
- Standard browser APIs with good support 