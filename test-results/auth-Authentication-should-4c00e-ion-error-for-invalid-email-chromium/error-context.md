# Test info

- Name: Authentication >> should show validation error for invalid email
- Location: /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/auth.spec.ts:25:7

# Error details

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByTestId('email-input')

    at /Users/franzenzenhofer/dev/franzai-writer/tests/e2e/auth.spec.ts:28:43
```

# Page snapshot

```yaml
- banner:
  - link "FranzAI Writer":
    - /url: /
  - navigation:
    - link "Dashboard":
      - /url: /dashboard
    - link "AI Logs":
      - /url: /debug/ai-log-viewer
  - navigation:
    - link "Login":
      - /url: /login
- main:
  - text: Welcome back Sign in to your account to continue Email
  - textbox "Email"
  - text: Password
  - textbox "Password"
  - button "Sign in"
  - text: Or continue with
  - button "Google":
    - img
    - text: Google
  - text: Don't have an account?
  - link "Sign up":
    - /url: /signup
  - link "Forgot your password?":
    - /url: /reset-password
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
   3 | test.describe('Authentication', () => {
   4 |   test('should display login page', async ({ page }) => {
   5 |     await page.goto('/login');
   6 |     
   7 |     await expect(page.getByTestId('login-form-title')).toBeVisible();
   8 |     await expect(page.getByTestId('login-form-title')).toHaveText('Sign in to your account');
   9 |     
  10 |     await expect(page.getByTestId('email-input')).toBeVisible();
  11 |     await expect(page.getByTestId('password-input')).toBeVisible();
  12 |     await expect(page.getByTestId('login-button')).toBeVisible();
  13 |     await expect(page.getByTestId('google-login-button')).toBeVisible();
  14 |   });
  15 |
  16 |   test('should show validation errors for empty form', async ({ page }) => {
  17 |     await page.goto('/login');
  18 |     
  19 |     await page.getByTestId('login-button').click();
  20 |     
  21 |     await expect(page.getByText('Email is required')).toBeVisible();
  22 |     await expect(page.getByText('Password is required')).toBeVisible();
  23 |   });
  24 |
  25 |   test('should show validation error for invalid email', async ({ page }) => {
  26 |     await page.goto('/login');
  27 |     
> 28 |     await page.getByTestId('email-input').fill('invalid-email');
     |                                           ^ Error: locator.fill: Test timeout of 30000ms exceeded.
  29 |     await page.getByTestId('password-input').fill('password123');
  30 |     await page.getByTestId('login-button').click();
  31 |     
  32 |     await expect(page.getByText('Invalid email address')).toBeVisible();
  33 |   });
  34 |
  35 |   test('should navigate to signup page', async ({ page }) => {
  36 |     await page.goto('/login');
  37 |     
  38 |     await page.getByTestId('signup-link').click();
  39 |     
  40 |     await page.waitForURL('**/signup');
  41 |     await expect(page).toHaveURL(/\/signup$/);
  42 |     await expect(page.getByTestId('signup-form-title')).toBeVisible();
  43 |   });
  44 |
  45 |   test('should navigate to password reset page', async ({ page }) => {
  46 |     await page.goto('/login');
  47 |     
  48 |     await page.getByTestId('forgot-password-link').click();
  49 |     
  50 |     await page.waitForURL('**/reset-password');
  51 |     await expect(page).toHaveURL(/\/reset-password$/);
  52 |   });
  53 |
  54 |   test('should display signup page', async ({ page }) => {
  55 |     await page.goto('/signup');
  56 |     
  57 |     await expect(page.getByTestId('signup-form-title')).toBeVisible();
  58 |     await expect(page.getByTestId('signup-form-title')).toHaveText('Create a new account');
  59 |     
  60 |     await expect(page.getByTestId('email-input')).toBeVisible();
  61 |     await expect(page.getByTestId('password-input')).toBeVisible();
  62 |     await expect(page.getByTestId('confirm-password-input')).toBeVisible();
  63 |     await expect(page.getByTestId('signup-button')).toBeVisible();
  64 |   });
  65 |
  66 |   test('should validate password confirmation', async ({ page }) => {
  67 |     await page.goto('/signup');
  68 |     
  69 |     await page.getByTestId('email-input').fill('test@example.com');
  70 |     await page.getByTestId('password-input').fill('password123');
  71 |     await page.getByTestId('confirm-password-input').fill('different123');
  72 |     await page.getByTestId('signup-button').click();
  73 |     
  74 |     await expect(page.getByText('Passwords do not match')).toBeVisible();
  75 |   });
  76 | });
```