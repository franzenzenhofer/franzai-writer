# Test info

- Name: Basic Navigation Tests (Chrome Only) >> should navigate from homepage to dashboard
- Location: /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/basic-navigation.spec.ts:6:7

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toHaveURL(expected)

Locator: locator(':root')
Expected string: "http://localhost:9002/dashboard"
Received string: "http://localhost:9002/"
Call log:
  - expect.toHaveURL with timeout 5000ms
  - waiting for locator(':root')
    9 × locator resolved to <html lang="en">…</html>
      - unexpected value "http://localhost:9002/"

    at /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/basic-navigation.spec.ts:18:24
```

# Page snapshot

```yaml
- banner:
  - link "FranzAI Writer":
    - /url: /
  - navigation:
    - link "Home":
      - /url: /
    - link "Dashboard":
      - /url: /dashboard
    - link "Documents":
      - /url: /documents
    - link "Assets":
      - /url: /assets
    - link "AI Logs":
      - /url: /admin/debug/ai-log-viewer
  - navigation:
    - link "Login":
      - /url: /login
- main:
  - text: FranzAI Writer
  - heading "Write Better, Faster with AI Guidance" [level=1]
  - paragraph: Create professional documents through intelligent workflows. From SEO articles to recipes, let AI help you craft perfect content.
  - link "Get Started":
    - /url: /dashboard
    - text: Get Started
    - img
  - link "Try it out":
    - /url: /dashboard
  - paragraph: Free to start • No credit card required
  - heading "Everything you need to write professionally" [level=2]
  - img
  - heading "AI-Powered Workflows" [level=3]
  - paragraph: Transform ideas into polished documents with intelligent multi-step guidance
  - img
  - heading "Smart Content Generation" [level=3]
  - paragraph: Powered by advanced AI models for natural, context-aware writing
  - img
  - heading "Structured Creation" [level=3]
  - paragraph: Build documents step-by-step with dependencies and smart validation
  - img
  - text: SEO-optimized content
  - img
  - text: Multiple workflows
  - img
  - text: Export ready
  - heading "Ready to start writing?" [level=2]
  - link "Start Writing Now":
    - /url: /dashboard
    - img
    - text: Start Writing Now
- contentinfo:
  - paragraph: © 2025 Franz AI Writer. All rights reserved.
  - paragraph:
    - text: Made with
    - img
    - text: using AI-powered workflows
  - link "Home":
    - /url: /
  - link "FranzAI.com":
    - /url: https://www.franzai.com
  - link "Privacy":
    - /url: /privacy
  - link "Terms":
    - /url: /terms
- region "Notifications (F8)":
  - list
- alert
- button "Open Next.js Dev Tools":
  - img
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test.describe('Basic Navigation Tests (Chrome Only)', () => {
   4 |   test.skip(({ browserName }) => browserName !== 'chromium', 'Chrome only per CLAUDE.md guidelines');
   5 |
   6 |   test('should navigate from homepage to dashboard', async ({ page }) => {
   7 |     // Go to homepage
   8 |     await page.goto('/');
   9 |     await page.waitForLoadState('networkidle');
  10 |     
  11 |     // Check we're on the homepage
  12 |     await expect(page).toHaveTitle(/Franz AI Writer/);
  13 |     
  14 |     // Look for and click the "Start Writing Now" button
  15 |     await page.click('text=Start Writing Now');
  16 |     
  17 |     // Should navigate to dashboard
> 18 |     await expect(page).toHaveURL('/dashboard');
     |                        ^ Error: Timed out 5000ms waiting for expect(locator).toHaveURL(expected)
  19 |     
  20 |     // Dashboard should have the expected content
  21 |     await expect(page.locator('h1')).toContainText('Your Documents');
  22 |   });
  23 |
  24 |   test('should show login page and allow navigation', async ({ page }) => {
  25 |     // Go to login page
  26 |     await page.goto('/login');
  27 |     await page.waitForLoadState('networkidle');
  28 |     
  29 |     // Check login page elements
  30 |     await expect(page.locator('h2')).toContainText('Sign in to your account');
  31 |     await expect(page.locator('input[type="email"]')).toBeVisible();
  32 |     await expect(page.locator('input[type="password"]')).toBeVisible();
  33 |     await expect(page.locator('button[type="submit"]')).toBeVisible();
  34 |   });
  35 |
  36 |   test('should navigate to settings page', async ({ page }) => {
  37 |     // Start from dashboard to create session
  38 |     await page.goto('/dashboard');
  39 |     await page.waitForSelector('text=Start a new document', { timeout: 10000 });
  40 |     
  41 |     // Navigate to settings
  42 |     await page.goto('/settings');
  43 |     await page.waitForLoadState('networkidle');
  44 |     
  45 |     // Check settings page structure
  46 |     await expect(page.locator('h1')).toContainText('Profile & Settings');
  47 |     await expect(page.locator('text=Profile Information')).toBeVisible();
  48 |     await expect(page.locator('text=Content Management')).toBeVisible();
  49 |     await expect(page.locator('text=Account Actions')).toBeVisible();
  50 |   });
  51 |
  52 |   test('should navigate to all documents page', async ({ page }) => {
  53 |     // Start from dashboard
  54 |     await page.goto('/dashboard');
  55 |     await page.waitForSelector('text=Start a new document', { timeout: 10000 });
  56 |     
  57 |     // Navigate to documents
  58 |     await page.goto('/documents');
  59 |     await page.waitForLoadState('networkidle');
  60 |     
  61 |     // Check documents page
  62 |     await expect(page.locator('h1')).toContainText('All Documents');
  63 |   });
  64 |
  65 |   test('should navigate to workflow details page', async ({ page }) => {
  66 |     // Go to poem workflow details
  67 |     await page.goto('/workflow-details/poem');
  68 |     await page.waitForLoadState('networkidle');
  69 |     
  70 |     // Check workflow details page
  71 |     await expect(page.locator('h1')).toContainText('Poem');
  72 |     await expect(page.locator('button:has-text("Start Workflow")')).toBeVisible();
  73 |   });
  74 | });
```