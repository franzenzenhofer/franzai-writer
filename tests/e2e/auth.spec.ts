import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login');
    
    await expect(page.getByTestId('login-form-title')).toBeVisible();
    await expect(page.getByTestId('login-form-title')).toHaveText('Sign in to your account');
    
    await expect(page.getByTestId('email-input')).toBeVisible();
    await expect(page.getByTestId('password-input')).toBeVisible();
    await expect(page.getByTestId('login-button')).toBeVisible();
    await expect(page.getByTestId('google-login-button')).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/login');
    
    await page.getByTestId('login-button').click();
    
    await expect(page.getByText('Email is required')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();
  });

  test('should show validation error for invalid email', async ({ page }) => {
    await page.goto('/login');
    
    await page.getByTestId('email-input').fill('invalid-email');
    await page.getByTestId('password-input').fill('password123');
    await page.getByTestId('login-button').click();
    
    await expect(page.getByText('Invalid email address')).toBeVisible();
  });

  test('should navigate to signup page', async ({ page }) => {
    await page.goto('/login');
    
    await page.getByTestId('signup-link').click();
    
    await page.waitForURL('**/signup');
    await expect(page).toHaveURL(/\/signup$/);
    await expect(page.getByTestId('signup-form-title')).toBeVisible();
  });

  test('should navigate to password reset page', async ({ page }) => {
    await page.goto('/login');
    
    await page.getByTestId('forgot-password-link').click();
    
    await page.waitForURL('**/reset-password');
    await expect(page).toHaveURL(/\/reset-password$/);
  });

  test('should display signup page', async ({ page }) => {
    await page.goto('/signup');
    
    await expect(page.getByTestId('signup-form-title')).toBeVisible();
    await expect(page.getByTestId('signup-form-title')).toHaveText('Create a new account');
    
    await expect(page.getByTestId('email-input')).toBeVisible();
    await expect(page.getByTestId('password-input')).toBeVisible();
    await expect(page.getByTestId('confirm-password-input')).toBeVisible();
    await expect(page.getByTestId('signup-button')).toBeVisible();
  });

  test('should validate password confirmation', async ({ page }) => {
    await page.goto('/signup');
    
    await page.getByTestId('email-input').fill('test@example.com');
    await page.getByTestId('password-input').fill('password123');
    await page.getByTestId('confirm-password-input').fill('different123');
    await page.getByTestId('signup-button').click();
    
    await expect(page.getByText('Passwords do not match')).toBeVisible();
  });
});