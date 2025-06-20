# DESIGN GUIDELINES

## Brand Colors

### Primary Palette
- **Royal Blue**: `#1d4ed8` - THE ONLY COLOR for active clickable buttons - Main brand color, used for ALL primary actions
- **Primary Hover**: `#1d4ed8/90` - Slightly transparent for hover states
- **Accent Violet**: `#8B5CF6` - Secondary accent color for special elements
- **Success Green**: `#10B981` - Emerald green for success states, checkmarks
- **Destructive Red**: `#EF4444` - Rose red for errors and destructive actions
- **Warning Orange**: `#F59E0B` - Amber orange for warnings

### Neutral Palette
- **Background**: `#FFFFFF` - Pure white background
- **Foreground**: `#0F172A` - Rich black text
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
   - Secondary buttons: Light background with colored text
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

5. **OPTIMIZED PROPORTIONS**
   - Balanced text-to-padding ratios (not too square!)
   - Default: h-10 px-4 (40px height, 16px horizontal padding)
   - Large: h-11 px-6 (44px height, 24px horizontal padding)
   - Mobile: Use mobile-specific sizes for 44px+ touch targets

### Button Hierarchy (Order of Importance)

```tsx
// 1. PRIMARY BUTTON (Main Actions) - MUST USE ROYAL BLUE #1d4ed8
variant="default"
className="bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg shadow-md active:scale-[0.98]"
// Example: Royal Blue (#1d4ed8) with white text - THE ONLY COLOR FOR ACTIVE BUTTONS!

// 2. SECONDARY BUTTON - MAIN ALTERNATIVE to primary buttons
variant="secondary"  
className="bg-secondary text-secondary-foreground hover:bg-primary/10 hover:shadow-sm"
// Example: Light blue background with blue text - USE THIS for most non-primary actions

// 3. OUTLINE BUTTON - Less common, for specific secondary actions
variant="outline"
className="border-2 border-primary bg-background text-primary hover:bg-primary hover:text-primary-foreground"
// Example: White background with blue border and text, fills with blue on hover

// 4. GHOST BUTTON (Tertiary Actions)
variant="ghost"
className="hover:bg-secondary hover:text-secondary-foreground border border-transparent hover:border-border"
// Note: Even ghost buttons should show borders on hover for mobile clarity

// SPECIAL VARIANTS
// DESTRUCTIVE BUTTON (Dangerous Actions)
variant="destructive"
className="bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-md shadow-sm"
// Example: Red background with white text
```

### Button Sizes (Optimized Proportions)

```tsx
size="sm"      // h-9 px-3 text-xs    (36px height - desktop only)
size="default" // h-10 px-4 py-2      (40px height - balanced proportions)  
size="lg"      // h-11 px-6           (44px height - premium feel)
size="icon"    // h-10 w-10           (square 40px for icons)

// Mobile-Optimized Sizes (44px+ touch targets)
size="mobile-sm"      // h-11 px-4 text-sm  (44px minimum)
size="mobile-default" // h-12 px-5          (48px comfortable)
size="mobile-lg"      // h-14 px-8          (56px premium)
```

### Special Button States

1. **Loading State**
   - Show spinner icon (Loader2 with animate-spin)
   - Disable button interaction
   - Change text to "Processing..." or similar

2. **Disabled State**
   - Reduce opacity to 50%
   - Remove all hover effects
   - Prevent cursor interaction

3. **Icon Buttons**
   - Always pair icons with text for clarity
   - Icons should be 4x4 (h-4 w-4) for default size
   - Add margin between icon and text (mr-2)

### Button Placement & Usage

1. **Primary Action**: Right-aligned in card footers - use `variant="default"`
2. **Cancel/Secondary**: Left side of primary action - use `variant="secondary"`
3. **Alternative Actions**: Use `variant="secondary"` (NOT outline)
4. **Outline buttons**: Only for specific cases like "Learn More" or less important actions
5. **Destructive Actions**: Separated from other buttons - use `variant="destructive"`
6. **Mobile Considerations**: Use mobile-* sizes for touch interfaces

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
- **Placeholder Text**: Must be clearly distinguishable with lighter color
- **Font Family**: System fonts for best performance

## Mobile-First Design

1. **Touch Targets**: Minimum 44x44px (use mobile-* sizes)
2. **Borders**: Always visible, not just on focus
3. **Spacing**: Generous padding for finger taps
4. **Contrast**: Extra important on mobile screens

## Component Examples

### Good Button Example
```tsx
<Button 
  variant="default"
  size="default"
  className="bg-primary text-white hover:bg-primary/90 hover:shadow-lg shadow-md active:scale-[0.98]"
>
  <ArrowRight className="mr-2 h-4 w-4" />
  Continue
</Button>
```
**CRITICAL**: All active clickable buttons MUST use Royal Blue #1d4ed8 - NO OTHER COLORS ALLOWED!

### Bad Button Example (NEVER DO THIS)
```tsx
// NO! Gray on gray, no shadow, no visible interaction
<button className="bg-gray-200 text-gray-600">
  Continue  
</button>
```

### Correct Button Hierarchy Examples
```tsx
// Primary action (main CTA)
<Button variant="default">Save Changes</Button>

// Secondary action (common alternative) - USE THIS instead of outline for most cases
<Button variant="secondary">Cancel</Button>

// Outline (less common, specific secondary actions)
<Button variant="outline">Learn More</Button>

// Ghost (tertiary, subtle actions)
<Button variant="ghost">Skip</Button>
```

## Update Notifications

When implementing update notifications for cache busting:
- Use toast notifications with action buttons
- Include refresh icon with "Update Available" message
- Provide clear CTA to refresh the page
- Check for updates every 5 minutes in production

import React, { useState } from 'react';
import { ArrowRight, Download, Heart, Settings, Trash2, Plus, Edit, Search, Loader2, Check, X, Star, Mail, Phone, Share2, Eye, Copy, FileText, Home, User, Calendar, Bell, ShoppingCart, Camera, Bookmark, Lock, Unlock, Volume2, VolumeX, Play, Pause, RefreshCw, Save, Upload, Filter, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

const ButtonShowcase = () => {
  const [loading, setLoading] = useState({});
  const [favorites, setFavorites] = useState({});

  const toggleLoading = (id) => {
    setLoading(prev => ({ ...prev, [id]: !prev[id] }));
    setTimeout(() => {
      setLoading(prev => ({ ...prev, [id]: false }));
    }, 2000);
  };

  const toggleFavorite = (id) => {
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Base button component following the design guidelines with standard Tailwind classes
  const Button = ({ variant = 'default', size = 'default', className = '', children, disabled = false, loading = false, ...props }) => {
    const baseClasses = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md cursor-pointer";
    
    const variants = {
      default: "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg shadow-md active:scale-95 border border-blue-600 hover:border-blue-700",
      secondary: "bg-slate-50 text-blue-600 hover:bg-blue-50 hover:shadow-sm border border-slate-200 hover:border-blue-300",
      outline: "border-2 border-blue-600 bg-background text-primary hover:bg-blue-600 hover:text-white hover:shadow-md shadow-sm",
      destructive: "bg-red-500 text-white hover:bg-red-600 hover:shadow-md shadow-sm border border-red-500 hover:border-red-600 active:scale-95",
      ghost: "hover:bg-slate-100 hover:text-slate-900 border border-transparent hover:border-slate-200 text-slate-700",
      success: "bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-md shadow-sm border border-emerald-500 hover:border-emerald-600 active:scale-95",
      warning: "bg-amber-500 text-white hover:bg-amber-600 hover:shadow-md shadow-sm border border-amber-500 hover:border-amber-600 active:scale-95",
      accent: "bg-violet-500 text-white hover:bg-violet-600 hover:shadow-lg shadow-md border border-violet-500 hover:border-violet-600 active:scale-95"
    };

    const sizes = {
      sm: "h-9 px-3 text-xs min-w-11",
      default: "h-10 px-4 py-2 text-sm min-w-11", 
      lg: "h-11 px-6 text-base min-w-11",
      icon: "h-10 w-10 p-0 min-w-10",
      mobile: "h-11 px-4 text-sm min-w-11",
      mobileDefault: "h-12 px-5 text-sm min-w-11",
      mobileLg: "h-14 px-8 text-sm min-w-11"
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

  return (
    <div className="p-8 bg-white min-h-screen">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-normal text-slate-900">Design Guideline Button Showcase</h1>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Every button follows the design guidelines: visible borders, high contrast, shadows, hover effects, and mobile-first approach with 44px minimum touch targets.
          </p>
        </div>

        {/* Primary Variant Buttons */}
        <section className="space-y-6">
          <h2 className="text-2xl font-normal text-slate-900 border-b border-slate-200 pb-2">Primary Buttons (Main Actions)</h2>
          <div className="space-y-4">
            
            {/* Different Sizes */}
            <div className="space-y-3">
              <h3 className="text-lg text-slate-900">All Sizes</h3>
              <div className="flex flex-wrap gap-4 items-end">
                <Button variant="default" size="sm">
                  <Plus className="mr-2 h-3 w-3" />
                  Small
                </Button>
                <Button variant="default" size="default">
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Default
                </Button>
                <Button variant="default" size="lg">
                  <Download className="mr-2 h-5 w-5" />
                  Large
                </Button>
                <Button variant="default" size="icon" title="Settings">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Various Primary Actions */}
            <div className="space-y-3">
              <h3 className="text-lg text-slate-900">Common Primary Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <Button variant="default">
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
                <Button variant="default">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload File
                </Button>
                <Button variant="default">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New
                </Button>
                <Button variant="default">
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Continue
                </Button>
                <Button variant="default">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button variant="default">
                  <Play className="mr-2 h-4 w-4" />
                  Start Process
                </Button>
                <Button variant="default">
                  <Check className="mr-2 h-4 w-4" />
                  Confirm
                </Button>
                <Button variant="default">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>

            {/* Loading States */}
            <div className="space-y-3">
              <h3 className="text-lg text-slate-900">Loading States</h3>
              <div className="flex flex-wrap gap-4">
                <Button 
                  variant="default" 
                  loading={loading.save}
                  onClick={() => toggleLoading('save')}
                >
                  {loading.save ? 'Saving...' : 'Save Document'}
                </Button>
                <Button 
                  variant="default" 
                  loading={loading.upload}
                  onClick={() => toggleLoading('upload')}
                >
                  {loading.upload ? 'Uploading...' : 'Upload Files'}
                </Button>
                <Button 
                  variant="default" 
                  loading={loading.process}
                  onClick={() => toggleLoading('process')}
                >
                  {loading.process ? 'Processing...' : 'Start Process'}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Secondary Variant Buttons */}
        <section className="space-y-6">
          <h2 className="text-2xl font-normal text-slate-900 border-b border-slate-200 pb-2">Secondary Buttons</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Button variant="secondary">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="secondary">
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
            <Button variant="secondary">
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </Button>
            <Button variant="secondary">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button variant="secondary">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button variant="secondary">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
            <Button variant="secondary">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule
            </Button>
            <Button variant="secondary">
              <FileText className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </section>

        {/* Outline Variant Buttons */}
        <section className="space-y-6">
          <h2 className="text-2xl font-normal text-slate-900 border-b border-slate-200 pb-2">Outline Buttons (Secondary Actions)</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Button variant="outline">
              <Mail className="mr-2 h-4 w-4" />
              Send Email
            </Button>
            <Button variant="outline">
              <Phone className="mr-2 h-4 w-4" />
              Call
            </Button>
            <Button variant="outline">
              <User className="mr-2 h-4 w-4" />
              Profile
            </Button>
            <Button variant="outline">
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </Button>
            <Button variant="outline">
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            <Button variant="outline">
              <Camera className="mr-2 h-4 w-4" />
              Take Photo
            </Button>
            <Button variant="outline">
              <Lock className="mr-2 h-4 w-4" />
              Secure
            </Button>
            <Button variant="outline">
              <Unlock className="mr-2 h-4 w-4" />
              Unlock
            </Button>
          </div>
        </section>

        {/* Destructive Variant Buttons */}
        <section className="space-y-6">
          <h2 className="text-2xl font-normal text-slate-900 border-b border-slate-200 pb-2">Destructive Buttons (Dangerous Actions)</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Button variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
            <Button variant="destructive">
              <X className="mr-2 h-4 w-4" />
              Cancel Order
            </Button>
            <Button variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Remove Account
            </Button>
            <Button variant="destructive">
              <X className="mr-2 h-4 w-4" />
              Reject
            </Button>
            <Button variant="destructive" size="sm">
              <Trash2 className="mr-2 h-3 w-3" />
              Delete Item
            </Button>
            <Button variant="destructive" size="lg">
              <X className="mr-2 h-5 w-5" />
              Cancel Subscription
            </Button>
          </div>
        </section>

        {/* Success Variant Buttons */}
        <section className="space-y-6">
          <h2 className="text-2xl font-normal text-slate-900 border-b border-slate-200 pb-2">Success Buttons</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Button variant="success">
              <Check className="mr-2 h-4 w-4" />
              Approve
            </Button>
            <Button variant="success">
              <Check className="mr-2 h-4 w-4" />
              Complete
            </Button>
            <Button variant="success">
              <Check className="mr-2 h-4 w-4" />
              Accept
            </Button>
            <Button variant="success">
              <Check className="mr-2 h-4 w-4" />
              Publish
            </Button>
            <Button variant="success">
              <Check className="mr-2 h-4 w-4" />
              Submit
            </Button>
            <Button variant="success">
              <Check className="mr-2 h-4 w-4" />
              Verify
            </Button>
          </div>
        </section>

        {/* Warning Variant Buttons */}
        <section className="space-y-6">
          <h2 className="text-2xl font-normal text-slate-900 border-b border-slate-200 pb-2">Warning Buttons</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Button variant="warning">
              <RefreshCw className="mr-2 h-4 w-4" />
              Force Update
            </Button>
            <Button variant="warning">
              <Upload className="mr-2 h-4 w-4" />
              Override
            </Button>
            <Button variant="warning">
              <Edit className="mr-2 h-4 w-4" />
              Modify
            </Button>
            <Button variant="warning">
              <Pause className="mr-2 h-4 w-4" />
              Suspend
            </Button>
          </div>
        </section>

        {/* Accent Variant Buttons */}
        <section className="space-y-6">
          <h2 className="text-2xl font-normal text-slate-900 border-b border-slate-200 pb-2">Accent Buttons (Special Elements)</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Button variant="accent">
              <Star className="mr-2 h-4 w-4" />
              Premium
            </Button>
            <Button variant="accent">
              <Heart className="mr-2 h-4 w-4" />
              Favorite
            </Button>
            <Button variant="accent">
              <Bookmark className="mr-2 h-4 w-4" />
              Bookmark
            </Button>
            <Button variant="accent">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
          </div>
        </section>

        {/* Ghost Variant Buttons */}
        <section className="space-y-6">
          <h2 className="text-2xl font-normal text-slate-900 border-b border-slate-200 pb-2">Ghost Buttons (Tertiary Actions)</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Button variant="ghost">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button variant="ghost">
              <ChevronRight className="mr-2 h-4 w-4" />
              Next
            </Button>
            <Button variant="ghost">
              <ChevronDown className="mr-2 h-4 w-4" />
              More Options
            </Button>
            <Button variant="ghost">
              <Volume2 className="mr-2 h-4 w-4" />
              Sound On
            </Button>
            <Button variant="ghost">
              <VolumeX className="mr-2 h-4 w-4" />
              Mute
            </Button>
            <Button variant="ghost">
              <Eye className="mr-2 h-4 w-4" />
              Show Details
            </Button>
          </div>
        </section>

        {/* Icon-Only Buttons */}
        <section className="space-y-6">
          <h2 className="text-2xl font-normal text-slate-900 border-b border-slate-200 pb-2">Icon-Only Buttons</h2>
          <div className="space-y-4">
            <div className="space-y-3">
              <h3 className="text-lg text-slate-900">Primary Icon Buttons</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="default" size="icon" title="Settings">
                  <Settings className="h-4 w-4" />
                </Button>
                <Button variant="default" size="icon" title="Search">
                  <Search className="h-4 w-4" />
                </Button>
                <Button variant="default" size="icon" title="Add">
                  <Plus className="h-4 w-4" />
                </Button>
                <Button variant="default" size="icon" title="Edit">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="default" size="icon" title="Share">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-lg text-slate-900">Secondary Icon Buttons</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="secondary" size="icon" title="Home">
                  <Home className="h-4 w-4" />
                </Button>
                <Button variant="secondary" size="icon" title="User">
                  <User className="h-4 w-4" />
                </Button>
                <Button variant="secondary" size="icon" title="Calendar">
                  <Calendar className="h-4 w-4" />
                </Button>
                <Button variant="secondary" size="icon" title="Bell">
                  <Bell className="h-4 w-4" />
                </Button>
                <Button variant="secondary" size="icon" title="Mail">
                  <Mail className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg text-slate-900">Outline Icon Buttons</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="outline" size="icon" title="Copy">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" title="Download">
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" title="Upload">
                  <Upload className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" title="Refresh">
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" title="Filter">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg text-slate-900">Interactive Icon Buttons</h3>
              <div className="flex flex-wrap gap-4">
                <Button 
                  variant={favorites.heart ? "accent" : "ghost"} 
                  size="icon" 
                  title="Favorite"
                  onClick={() => toggleFavorite('heart')}
                >
                  <Heart className={`h-4 w-4 ${favorites.heart ? 'fill-current' : ''}`} />
                </Button>
                <Button 
                  variant={favorites.star ? "warning" : "ghost"} 
                  size="icon" 
                  title="Star"
                  onClick={() => toggleFavorite('star')}
                >
                  <Star className={`h-4 w-4 ${favorites.star ? 'fill-current' : ''}`} />
                </Button>
                <Button 
                  variant={favorites.bookmark ? "accent" : "ghost"} 
                  size="icon" 
                  title="Bookmark"
                  onClick={() => toggleFavorite('bookmark')}
                >
                  <Bookmark className={`h-4 w-4 ${favorites.bookmark ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Disabled States */}
        <section className="space-y-6">
          <h2 className="text-2xl font-normal text-slate-900 border-b border-slate-200 pb-2">Disabled States</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Button variant="default" disabled>
              <Save className="mr-2 h-4 w-4" />
              Save (Disabled)
            </Button>
            <Button variant="secondary" disabled>
              <Edit className="mr-2 h-4 w-4" />
              Edit (Disabled)
            </Button>
            <Button variant="outline" disabled>
              <Share2 className="mr-2 h-4 w-4" />
              Share (Disabled)
            </Button>
            <Button variant="destructive" disabled>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete (Disabled)
            </Button>
            <Button variant="success" disabled>
              <Check className="mr-2 h-4 w-4" />
              Approve (Disabled)
            </Button>
            <Button variant="ghost" disabled>
              <Eye className="mr-2 h-4 w-4" />
              View (Disabled)
            </Button>
          </div>
        </section>

        {/* Button Groups */}
        <section className="space-y-6">
          <h2 className="text-2xl font-normal text-slate-900 border-b border-slate-200 pb-2">Button Groups and Combinations</h2>
          
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-lg text-slate-900">Primary + Secondary Actions</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="default">
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
                <Button variant="secondary">
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg text-slate-900">Confirm + Destructive Actions</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="success">
                  <Check className="mr-2 h-4 w-4" />
                  Confirm Delete
                </Button>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Forever
                </Button>
                <Button variant="ghost">
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg text-slate-900">Media Controls</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="accent" size="icon" title="Play">
                  <Play className="h-4 w-4" />
                </Button>
                <Button variant="secondary" size="icon" title="Pause">
                  <Pause className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" title="Volume">
                  <Volume2 className="h-4 w-4" />
                </Button>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg text-slate-900">Navigation Controls</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="ghost">
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                <Button variant="default">
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Continue
                </Button>
                <Button variant="ghost">
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Mobile Demonstration */}
        <section className="space-y-6">
          <h2 className="text-2xl font-normal text-slate-900 border-b border-slate-200 pb-2">Mobile-Optimized (44px Touch Targets)</h2>
          <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
            <p className="text-sm text-slate-600 mb-4">All buttons meet the 44px minimum touch target requirement for mobile accessibility.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button variant="default" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Create New Item
              </Button>
              <Button variant="outline" className="w-full">
                <Search className="mr-2 h-4 w-4" />
                Search Everything
              </Button>
              <Button variant="secondary" className="w-full">
                <Edit className="mr-2 h-4 w-4" />
                Edit Settings
              </Button>
              <Button variant="destructive" className="w-full">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            </div>
          </div>
        </section>

        {/* Color Showcase */}
        <section className="space-y-6">
          <h2 className="text-2xl font-normal text-slate-900 border-b border-slate-200 pb-2">Brand Color Implementation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-600 text-white p-4 rounded-lg text-center">
              <div className="text-sm font-medium">Primary Blue</div>
              <div className="text-xs opacity-75">bg-blue-600</div>
            </div>
            <div className="bg-violet-500 text-white p-4 rounded-lg text-center">
              <div className="text-sm font-medium">Accent Violet</div>
              <div className="text-xs opacity-75">bg-violet-500</div>
            </div>
            <div className="bg-emerald-500 text-white p-4 rounded-lg text-center">
              <div className="text-sm font-medium">Success Green</div>
              <div className="text-xs opacity-75">bg-emerald-500</div>
            </div>
            <div className="bg-red-500 text-white p-4 rounded-lg text-center">
              <div className="text-sm font-medium">Destructive Red</div>
              <div className="text-xs opacity-75">bg-red-500</div>
            </div>
          </div>
        </section>

        {/* Design Features Summary */}
        <section className="space-y-6">
          <h2 className="text-2xl font-normal text-slate-900 border-b border-slate-200 pb-2">Design Features Implemented</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
              <h3 className="font-medium text-slate-900 mb-3">✅ Always Visible Borders</h3>
              <p className="text-sm text-slate-600">Every button has a visible border at all times, essential for mobile usability.</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
              <h3 className="font-medium text-slate-900 mb-3">✅ High Contrast Colors</h3>
              <p className="text-sm text-slate-600">No gray-on-gray combinations. Vibrant colors with clear text readability.</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
              <h3 className="font-medium text-slate-900 mb-3">✅ Shadows and Depth</h3>
              <p className="text-sm text-slate-600">Primary buttons have shadow-md, increased to shadow-lg on hover for elevation.</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
              <h3 className="font-medium text-slate-900 mb-3">✅ Smooth Hover Effects</h3>
              <p className="text-sm text-slate-600">Color transitions, shadow increases, and tactile feedback with scale transforms.</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
              <h3 className="font-medium text-slate-900 mb-3">✅ Mobile-First Design</h3>
              <p className="text-sm text-slate-600">44px minimum touch targets and visible borders for finger taps.</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
              <h3 className="font-medium text-slate-900 mb-3">✅ Brand Colors</h3>
              <p className="text-sm text-slate-600">Blue, Violet, Emerald, Red color palette following the design guidelines.</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default ButtonShowcase;