# Test info

- Name: Dashboard >> should be responsive on mobile
- Location: /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/dashboard.spec.ts:39:7

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toBeVisible()

Locator: getByRole('heading', { name: 'AI Writing Workflows' })
Expected: visible
Received: <element(s) not found>
Call log:
  - expect.toBeVisible with timeout 5000ms
  - waiting for getByRole('heading', { name: 'AI Writing Workflows' })

    at /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/dashboard.spec.ts:43:79
```

# Page snapshot

```yaml
- banner:
  - button "Toggle menu":
    - img
    - text: Toggle menu
  - text: FranzAI Writer
  - navigation
- main:
  - heading "Start a new document" [level=1]
  - table:
    - rowgroup:
      - row "Workflow Actions":
        - cell "Workflow"
        - cell "Actions"
    - rowgroup:
      - row "Targeted Page SEO Optimized V3 Start":
        - cell "Targeted Page SEO Optimized V3"
        - cell "Start":
          - link "Start":
            - /url: /w/article/new
            - text: Start
            - img
      - row "SEO Optimized Cooking Recipe Start":
        - cell "SEO Optimized Cooking Recipe"
        - cell "Start":
          - link "Start":
            - /url: /w/recipe/new
            - text: Start
            - img
      - row "Poem Generator Start":
        - cell "Poem Generator"
        - cell "Start":
          - link "Start":
            - /url: /w/poem/new
            - text: Start
            - img
      - row "Gemini AI Tools Test Start":
        - cell "Gemini AI Tools Test"
        - cell "Start":
          - link "Start":
            - /url: /w/gemini-test/new
            - text: Start
            - img
  - heading "Recent documents" [level=2]
  - img
  - heading "Ready to Save Your Work?" [level=3]
  - paragraph: Log in or sign up to keep track of your documents.
  - link "Login / Sign Up":
    - /url: /login
    - img
    - text: Login / Sign Up
- contentinfo:
  - paragraph: © 2025 Franz AI Writer. All rights reserved.
  - paragraph:
    - text: Made with
    - img
    - text: using AI-powered workflows
  - link "Privacy":
    - /url: /privacy
  - link "Terms":
    - /url: /terms
  - link "GitHub":
    - /url: https://github.com/your-repo/franz-ai-writer
    - img
    - text: GitHub
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
   3 | test.describe('Dashboard', () => {
   4 |   test('should display dashboard with workflows', async ({ page }) => {
   5 |     await page.goto('/dashboard');
   6 |     
   7 |     await expect(page.getByRole('heading', { name: 'AI Writing Workflows' })).toBeVisible();
   8 |     
   9 |     const workflowCards = page.locator('[data-testid^="workflow-card-"]');
  10 |     await expect(workflowCards).toHaveCount(2);
  11 |     
  12 |     await expect(page.getByText('Recipe SEO Optimized')).toBeVisible();
  13 |     await expect(page.getByText('Targeted Page SEO Optimized')).toBeVisible();
  14 |   });
  15 |
  16 |   test('should navigate to wizard when selecting a workflow', async ({ page }) => {
  17 |     await page.goto('/dashboard');
  18 |     
  19 |     const recipeCard = page.locator('[data-testid="workflow-card-recipe-seo-optimized"]');
  20 |     await expect(recipeCard).toBeVisible();
  21 |     
  22 |     await recipeCard.getByTestId('workflow-start-button').click();
  23 |     
  24 |     await page.waitForURL('**/wizard/**');
  25 |     await expect(page).toHaveURL(/\/wizard\/.+$/);
  26 |   });
  27 |
  28 |   test('should display recent documents section', async ({ page }) => {
  29 |     await page.goto('/dashboard');
  30 |     
  31 |     await expect(page.getByRole('heading', { name: 'Recent documents' })).toBeVisible();
  32 |     
  33 |     const loginPrompt = page.getByText('Ready to Save Your Work?');
  34 |     if (await loginPrompt.isVisible()) {
  35 |       await expect(page.getByTestId('dashboard-login-button')).toBeVisible();
  36 |     }
  37 |   });
  38 |
  39 |   test('should be responsive on mobile', async ({ page }) => {
  40 |     await page.setViewportSize({ width: 375, height: 667 });
  41 |     await page.goto('/dashboard');
  42 |     
> 43 |     await expect(page.getByRole('heading', { name: 'AI Writing Workflows' })).toBeVisible();
     |                                                                               ^ Error: Timed out 5000ms waiting for expect(locator).toBeVisible()
  44 |     
  45 |     const workflowCards = page.locator('[data-testid^="workflow-card-"]');
  46 |     const cardCount = await workflowCards.count();
  47 |     
  48 |     for (let i = 0; i < cardCount; i++) {
  49 |       const card = workflowCards.nth(i);
  50 |       const box = await card.boundingBox();
  51 |       
  52 |       expect(box?.width).toBeGreaterThan(300);
  53 |     }
  54 |   });
  55 | });
```