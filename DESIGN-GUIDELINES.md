# DESIGN GUIDELINES

## Brand Colors

### Primary Palette
- **Primary Blue**: `#2563EB` (Royal Blue) - Main brand color, used for primary actions
- **Primary Hover**: `#2563EB/90` - Slightly transparent for hover states  
- **Accent Violet**: `#8B5CF6` - Secondary accent color for special elements
- **Success Green**: `#10B981` - Emerald green for success states, checkmarks
- **Destructive Red**: `#EF4444` - Rose red for errors and destructive actions
- **Warning Orange**: `#F59E0B` - Amber orange for warnings

### Neutral Palette
- **Background**: `#FFFFFF` - Pure white background
- **Foreground**: `#0F172A` - Rich black text
- **Dark Gray**: `#374151` - Dark gray for secondary button text
- **Muted**: `#F8FAFC` - Light gray for subtle backgrounds
- **Border**: `#E2E8F0` - Visible borders, always shown (no invisible borders!)

## Button Design Rules

### CRITICAL BUTTON REQUIREMENTS

1. **ALWAYS VISIBLE BORDERS**
   - Every button MUST have a visible border
   - Borders must be visible at all times, not just on hover
   - This is essential for mobile usability
   - Even "ghost" buttons need subtle borders

2. **HIGH CONTRAST**
   - NO gray-on-gray combinations
   - Primary buttons: Vibrant blue background with white text
   - Secondary buttons: Light background with DARK GRAY text (`#374151`)
   - Outline buttons: White background with PRIMARY BLUE text (`#2563EB`)
   - Text must always be clearly readable

3. **SHADOWS AND DEPTH**
   - Primary buttons: `shadow-md` (medium shadow) by default
   - Hover state: Increase to `shadow-lg` (large shadow)
   - Active state: Scale down slightly `scale-[0.98]` for tactile feedback
   - Shadows give buttons depth and make them feel clickable

4. **HOVER EFFECTS**
   - Always include hover states
   - Use color transitions (e.g., `hover:bg-primary/90`)
   - Increase shadow on hover for elevation effect
   - Smooth transitions with `transition-all duration-200`

### Button Variants

```tsx
// PRIMARY BUTTON (Main Actions)
variant="default"
className="bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg shadow-md active:scale-95 border border-blue-600 hover:border-blue-700"
// Royal Blue (#2563EB equivalent) with white text

// SECONDARY BUTTON (Updated with dark gray text)
variant="secondary"  
className="bg-slate-50 text-gray-700 hover:bg-blue-50 hover:shadow-sm border border-slate-200 hover:border-blue-300"
// Light background with DARK GRAY text, NOT colored text

// OUTLINE BUTTON (Secondary Actions)
variant="outline"
className="border-2 border-blue-600 bg-white text-blue-600 hover:bg-blue-600 hover:text-white hover:shadow-md shadow-sm"
// White background with blue border and PRIMARY BLUE text, fills with blue on hover

// DESTRUCTIVE BUTTON (Dangerous Actions)
variant="destructive"
className="bg-red-500 text-white hover:bg-red-600 hover:shadow-md shadow-sm border border-red-500 hover:border-red-600 active:scale-95"
// Red background with white text

// SUCCESS BUTTON (Positive Actions)
variant="success"
className="bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-md shadow-sm border border-emerald-500 hover:border-emerald-600 active:scale-95"
// Green background with white text

// WARNING BUTTON (Caution Actions)
variant="warning"
className="bg-amber-500 text-white hover:bg-amber-600 hover:shadow-md shadow-sm border border-amber-500 hover:border-amber-600 active:scale-95"
// Orange background with white text

// ACCENT BUTTON (Special Elements)
variant="accent"
className="bg-violet-500 text-white hover:bg-violet-600 hover:shadow-lg shadow-md border border-violet-500 hover:border-violet-600 active:scale-95"
// Purple background with white text

// GHOST BUTTON (Tertiary Actions)
variant="ghost"
className="hover:bg-slate-100 hover:text-slate-900 border border-transparent hover:border-slate-200 text-slate-700"
// Transparent with subtle hover, but still shows borders on hover for mobile clarity
```

### Button Sizes & Touch Targets

```tsx
size="sm"      // h-8 px-4 text-xs min-w-11  (minimum 44px total with padding)
size="default" // h-10 px-8 py-2 text-sm min-w-11  (44px minimum touch target)
size="lg"      // h-11 px-10 text-base min-w-11  (larger than 44px)
size="icon"    // h-10 w-10 p-0 min-w-10  (exactly 40px, close to 44px for icons)
```

### Special Button States

1. **Loading State**
   - Show spinner icon (Loader2 with animate-spin)
   - Disable button interaction
   - Change text to "Processing..." or similar
   - Keep all styling intact

2. **Disabled State**
   - Reduce opacity to 50% (`opacity-50`)
   - Remove all hover effects
   - Prevent cursor interaction (`cursor-not-allowed`)
   - Maintain border visibility

3. **Icon Buttons**
   - Always pair icons with text for clarity (except icon-only buttons)
   - Icons should be 4x4 (h-4 w-4) for default size
   - Add margin between icon and text (mr-2)
   - Icon-only buttons need tooltips/titles

### Button Color Specifications

#### Text Colors by Variant:
- **Primary**: White text (`text-white`)
- **Secondary**: Dark gray text (`text-gray-700`) - NOT colored text
- **Outline**: Primary blue text (`text-blue-600`) - matches border
- **Destructive**: White text (`text-white`)
- **Success**: White text (`text-white`)
- **Warning**: White text (`text-white`)
- **Accent**: White text (`text-white`)
- **Ghost**: Dark gray text (`text-slate-700`)

#### Background Colors by Variant:
- **Primary**: `bg-blue-600` → `hover:bg-blue-700`
- **Secondary**: `bg-slate-50` → `hover:bg-blue-50`
- **Outline**: `bg-white` → `hover:bg-blue-600`
- **Destructive**: `bg-red-500` → `hover:bg-red-600`
- **Success**: `bg-emerald-500` → `hover:bg-emerald-600`
- **Warning**: `bg-amber-500` → `hover:bg-amber-600`
- **Accent**: `bg-violet-500` → `hover:bg-violet-600`
- **Ghost**: `transparent` → `hover:bg-slate-100`

### Button Placement & Usage

1. **Primary Action**: Right-aligned in card footers, used for main CTA
2. **Secondary Action**: Paired with primary, uses secondary variant with dark gray text
3. **Cancel/Back**: Left side of primary action, uses ghost or secondary variant
4. **Destructive Actions**: Separated from other buttons, clearly marked
5. **Mobile Considerations**: All buttons meet 44px minimum touch target

### Mobile-First Design Requirements

1. **Touch Targets**: Minimum 44x44px (implemented via min-w-11 and proper height)
2. **Borders**: Always visible, not just on focus or hover
3. **Spacing**: Generous padding for finger taps  
4. **Contrast**: High contrast maintained on all screen sizes
5. **Hover Effects**: Work on both mouse and touch devices

## Component Implementation

### Complete Button Component Example
```tsx
const Button = ({ variant = 'default', size = 'default', className = '', children, disabled = false, loading = false, ...props }) => {
  const baseClasses = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md cursor-pointer";
  
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg shadow-md active:scale-95 border border-blue-600 hover:border-blue-700",
    secondary: "bg-slate-50 text-gray-700 hover:bg-blue-50 hover:shadow-sm border border-slate-200 hover:border-blue-300",
    outline: "border-2 border-blue-600 bg-white text-blue-600 hover:bg-blue-600 hover:text-white hover:shadow-md shadow-sm",
    destructive: "bg-red-500 text-white hover:bg-red-600 hover:shadow-md shadow-sm border border-red-500 hover:border-red-600 active:scale-95",
    ghost: "hover:bg-slate-100 hover:text-slate-900 border border-transparent hover:border-slate-200 text-slate-700",
    success: "bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-md shadow-sm border border-emerald-500 hover:border-emerald-600 active:scale-95",
    warning: "bg-amber-500 text-white hover:bg-amber-600 hover:shadow-md shadow-sm border border-amber-500 hover:border-amber-600 active:scale-95",
    accent: "bg-violet-500 text-white hover:bg-violet-600 hover:shadow-lg shadow-md border border-violet-500 hover:border-violet-600 active:scale-95"
  };

  const sizes = {
    sm: "h-8 px-3 text-xs min-w-11",
    default: "h-10 px-5 py-2 text-sm min-w-11", 
    lg: "h-11 px-8 text-base min-w-11",
    icon: "h-10 w-10 p-0 min-w-10"
  };

  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : "";
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabledClasses} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
};
```

### Usage Examples

#### ✅ CORRECT Examples:
```tsx
// Primary action with proper styling
<Button variant="default">
  <Save className="mr-2 h-4 w-4" />
  Save Changes
</Button>

// Secondary action with dark gray text
<Button variant="secondary">
  <Edit className="mr-2 h-4 w-4" />
  Edit Settings
</Button>

// Outline button with blue text matching border
<Button variant="outline">
  <Share2 className="mr-2 h-4 w-4" />
  Share Document
</Button>
```

#### ❌ INCORRECT Examples:
```tsx
// NO! Gray on gray, no visible border
<button className="bg-gray-200 text-gray-600">Continue</button>

// NO! Secondary button with colored text instead of dark gray
<Button variant="secondary" className="text-blue-600">Edit</Button>

// NO! No shadow, no border visibility
<button className="bg-blue-500 text-white">Save</button>
```

## Golden Ratio Spacing

Use the golden ratio (1.618) for harmonious spacing:
- Base unit: 1rem (16px)
- Small spacing: 0.618rem (~10px)
- Medium spacing: 1rem (16px)  
- Large spacing: 1.618rem (~26px)
- Extra large: 2.618rem (~42px)

## Typography

- **Headings**: Use default font weights (not bold) for clean look
- **Body Text**: 16px base size, 1.5 line height
- **Button Text**: Medium font weight for clarity
- **Placeholder Text**: Must be clearly distinguishable with lighter color
- **Font Family**: System fonts for best performance

## Update Notifications

When implementing update notifications for cache busting:
- Use toast notifications with action buttons
- Include refresh icon with "Update Available" message  
- Provide clear CTA to refresh the page
- Check for updates every 5 minutes in production 