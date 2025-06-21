# Ticket #117: Update Footer Links and Create Missing Pages

## Priority: Medium

## Type: Content Update / Page Creation

## Description
Update the site footer to reflect reality by removing the placeholder GitHub link, adding proper navigation links, and creating the missing Privacy and Terms pages that are currently referenced but don't exist.

## Current Issues

### 1. Footer Contains Placeholder GitHub Link
**File**: `src/components/layout/site-footer.tsx` (lines 31-40)
**Problem**: Links to `https://github.com/your-repo/franz-ai-writer` (placeholder URL)
**Impact**: Broken/misleading link for users

### 2. Footer Links Point to Non-Existent Pages
**Current footer links**:
- `/privacy` → **404 (page doesn't exist)**
- `/terms` → **404 (page doesn't exist)**

### 3. Missing Important Navigation Links
**Footer should include**:
- Link to homepage (`/`) 
- Link to main FranzAI website (`https://www.franzai.com`)
- Remove GitHub link entirely

### 4. Site Config Contains Placeholder
**File**: `src/config/site.ts` (line 18)
```typescript
github: "https://github.com/your-repo/franz-ai-writer", // Updated placeholder
```

## Required Changes

### 1. Update Footer Component
**File**: `src/components/layout/site-footer.tsx`

**Remove GitHub link section**:
```typescript
// ❌ REMOVE THIS ENTIRE SECTION
<Link 
  href={siteConfig.links.github} 
  target="_blank" 
  rel="noreferrer"
  className="text-muted-foreground hover:text-foreground transition-colors"
>
  <Github className="h-5 w-5" />
  <span className="sr-only">GitHub</span>
</Link>
```

**Add proper navigation links**:
```typescript
<div className="flex items-center gap-6">
  <Link 
    href="/" 
    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
  >
    Home
  </Link>
  <Link 
    href="https://www.franzai.com" 
    target="_blank"
    rel="noreferrer"
    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
  >
    FranzAI.com
  </Link>
  <Link 
    href="/privacy" 
    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
  >
    Privacy
  </Link>
  <Link 
    href="/terms" 
    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
  >
    Terms
  </Link>
</div>
```

### 2. Create Privacy Policy Page
**File**: `src/app/privacy/page.tsx`

**Create new page with proper privacy policy content**:
```typescript
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - Franz AI Writer',
  description: 'Privacy policy for Franz AI Writer application',
};

export default function PrivacyPage() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      
      <div className="prose prose-gray max-w-none">
        <p className="text-lg text-muted-foreground mb-6">
          Last updated: {new Date().toLocaleDateString()}
        </p>
        
        {/* Privacy policy content */}
      </div>
    </div>
  );
}
```

### 3. Create Terms of Service Page
**File**: `src/app/terms/page.tsx`

**Create new page with proper terms content**:
```typescript
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - Franz AI Writer',
  description: 'Terms of service for Franz AI Writer application',
};

export default function TermsPage() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
      
      <div className="prose prose-gray max-w-none">
        <p className="text-lg text-muted-foreground mb-6">
          Last updated: {new Date().toLocaleDateString()}
        </p>
        
        {/* Terms content */}
      </div>
    </div>
  );
}
```

### 4. Update Site Configuration
**File**: `src/config/site.ts`

**Remove GitHub link entirely**:
```typescript
export const siteConfig = {
  name: "Franz AI Writer",
  description: "Generate documents using an AI-powered, multi-step wizard.",
  mainNav: [
    {
      title: "Home",
      href: "/",
    },
    {
      title: "Dashboard", 
      href: "/dashboard",
    },
    {
      title: "AI Logs",
      href: "/debug/ai-log-viewer",
    },
  ],
  links: {
    website: "https://www.franzai.com",
    // Remove github link entirely
  },
};
```

## Content Requirements

### Privacy Policy Content
**Key sections to include**:
1. **Information Collection** - What data is collected
2. **Data Usage** - How data is used  
3. **AI Processing** - How user inputs are processed by AI
4. **Data Storage** - Where and how data is stored (Firebase)
5. **Data Sharing** - Third-party services (Google AI, Firebase)
6. **User Rights** - Access, deletion, portability
7. **Cookies** - Session management
8. **Contact Information** - How to reach privacy team

### Terms of Service Content
**Key sections to include**:
1. **Service Description** - What Franz AI Writer provides
2. **User Accounts** - Registration and responsibilities
3. **Acceptable Use** - What users can/cannot do
4. **AI Content** - Rights and responsibilities for AI-generated content
5. **Intellectual Property** - Ownership of content and workflows
6. **Service Availability** - Uptime, maintenance, changes
7. **Limitation of Liability** - Legal protections
8. **Termination** - Account closure conditions
9. **Governing Law** - Legal jurisdiction
10. **Contact Information** - Support and legal contacts

## Implementation Plan

### Phase 1: Footer Updates
1. Remove GitHub link and import
2. Add Home and FranzAI.com links
3. Update layout and styling
4. Test responsive design

### Phase 2: Create Privacy Page
1. Create privacy page component
2. Add comprehensive privacy policy content
3. Ensure mobile responsiveness
4. Add proper metadata

### Phase 3: Create Terms Page  
1. Create terms page component
2. Add comprehensive terms of service content
3. Ensure mobile responsiveness
4. Add proper metadata

### Phase 4: Site Config Updates
1. Remove GitHub link from config
2. Add website link for FranzAI.com
3. Add Home to main navigation
4. Update any references

## Files to Create/Modify

### New Files
1. **`src/app/privacy/page.tsx`** - Privacy policy page
2. **`src/app/terms/page.tsx`** - Terms of service page

### Modified Files
3. **`src/components/layout/site-footer.tsx`** - Update footer links
4. **`src/config/site.ts`** - Remove GitHub, add website link

### Test Files to Update
5. **`tests/e2e/homepage.spec.ts`** - Update footer link tests
6. **Add new E2E tests** for privacy and terms pages

## Footer Design Specifications

### Updated Footer Layout
```
┌─────────────────────────────────────────────────────────────┐
│ © 2025 Franz AI Writer. All rights reserved.               │
│ Made with ❤️ using AI-powered workflows                     │
│                                                             │
│ [Home] [FranzAI.com] [Privacy] [Terms]                     │
└─────────────────────────────────────────────────────────────┘
```

### Responsive Behavior
- **Desktop**: Links in horizontal row
- **Mobile**: Links stack vertically or wrap
- **Hover states**: Smooth color transitions
- **Accessibility**: Proper focus indicators

## Legal Content Guidelines

### Privacy Policy Requirements
- **GDPR Compliance** - EU user rights
- **CCPA Compliance** - California privacy rights  
- **Clear Language** - Easy to understand
- **Specific to AI** - Address AI processing concerns
- **Contact Methods** - Multiple ways to reach privacy team

### Terms of Service Requirements
- **Fair Terms** - Reasonable user obligations
- **AI Disclaimers** - Limitations of AI-generated content
- **User Rights** - What users retain
- **Service Changes** - How terms can be updated
- **Dispute Resolution** - Process for handling issues

## Acceptance Criteria

### Footer Updates
- [ ] GitHub link completely removed
- [ ] Home link navigates to `/`
- [ ] FranzAI.com link opens in new tab to `https://www.franzai.com`
- [ ] Privacy link navigates to `/privacy`
- [ ] Terms link navigates to `/terms`
- [ ] Footer is responsive on all screen sizes
- [ ] All links have proper hover states

### Privacy Page
- [ ] Page loads at `/privacy` without errors
- [ ] Contains comprehensive privacy policy
- [ ] Mobile responsive design
- [ ] Proper page metadata (title, description)
- [ ] Professional styling consistent with site

### Terms Page  
- [ ] Page loads at `/terms` without errors
- [ ] Contains comprehensive terms of service
- [ ] Mobile responsive design
- [ ] Proper page metadata (title, description)
- [ ] Professional styling consistent with site

### Site Config
- [ ] GitHub link removed from config
- [ ] Website link added for FranzAI.com
- [ ] No broken references to removed links
- [ ] Main navigation updated appropriately

## Risk Assessment: Low

### Benefits
- **Professional appearance** - Proper legal pages
- **User trust** - Clear privacy and terms information
- **Legal compliance** - Required for business operation
- **Better navigation** - Links to important pages

### Risks
- **Content accuracy** - Legal content must be reviewed
- **SEO impact** - New pages need proper optimization
- **Link maintenance** - External links need monitoring

### Mitigation
- Legal review of privacy and terms content
- SEO optimization for new pages
- Regular link checking and updates
- User testing of new navigation

## Implementation Notes

### External Link Handling
```typescript
// FranzAI.com link should open in new tab
<Link 
  href="https://www.franzai.com"
  target="_blank"
  rel="noreferrer"
  className="..."
>
  FranzAI.com
</Link>
```

### Page Layout Consistency
```typescript
// Use consistent container and typography
<div className="container max-w-4xl mx-auto px-4 py-8">
  <h1 className="text-3xl font-bold mb-8">Page Title</h1>
  <div className="prose prose-gray max-w-none">
    {/* Content */}
  </div>
</div>
```

### Responsive Footer
```typescript
// Ensure proper responsive behavior
<div className="flex flex-col md:flex-row justify-between items-center gap-4">
  <div className="text-center md:text-left">
    {/* Copyright */}
  </div>
  <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
    {/* Links */}
  </div>
</div>
``` 