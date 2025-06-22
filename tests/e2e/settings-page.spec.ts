import { test, expect } from '@playwright/test';
import { testUser } from '../test-constants';

test.describe('Settings Page E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login and navigate to settings
    await page.goto('/login');
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    
    // Navigate to settings
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
  });

  test('should display all settings tabs and user information', async ({ page }) => {
    // Check page header
    await expect(page.locator('h1')).toContainText('Settings');
    
    // Check tabs are present
    await expect(page.getByRole('tab', { name: /Account/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Preferences/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Appearance/i })).toBeVisible();
    
    // Check user information is displayed
    await expect(page.locator('input[type="email"][disabled]')).toHaveValue(testUser.email);
    await expect(page.locator('text=User ID')).toBeVisible();
  });

  test('should switch between tabs correctly', async ({ page }) => {
    // Click on Preferences tab
    await page.getByRole('tab', { name: /Preferences/i }).click();
    await expect(page.locator('text=Document Preferences')).toBeVisible();
    await expect(page.locator('text=AI Preferences')).toBeVisible();
    
    // Click on Appearance tab
    await page.getByRole('tab', { name: /Appearance/i }).click();
    await expect(page.locator('text=Color theme')).toBeVisible();
    await expect(page.locator('button:has-text("Light")')).toBeVisible();
  });

  test('should toggle preferences and show toast notifications', async ({ page }) => {
    // Go to Preferences tab
    await page.getByRole('tab', { name: /Preferences/i }).click();
    
    // Toggle auto-save
    const autoSaveSwitch = page.locator('#autosave');
    const initialState = await autoSaveSwitch.isChecked();
    await autoSaveSwitch.click();
    
    // Check toast notification appears
    await expect(page.locator('text=Preference updated')).toBeVisible();
    
    // Verify state changed
    expect(await autoSaveSwitch.isChecked()).toBe(!initialState);
  });

  test('should handle theme selection', async ({ page }) => {
    // Go to Appearance tab
    await page.getByRole('tab', { name: /Appearance/i }).click();
    
    // Click Dark theme button
    await page.locator('button:has-text("Dark")').click();
    
    // Check that Dark button is now selected (has different variant)
    await expect(page.locator('button:has-text("Dark")[class*="default"]')).toBeVisible();
    
    // Check preview updates
    await expect(page.locator('text=Theme Preview')).toBeVisible();
  });

  test('should show delete account dialog with proper validation', async ({ page }) => {
    // Click delete account button
    await page.locator('button:has-text("Delete account")').click();
    
    // Check dialog appears
    await expect(page.locator('text=Are you absolutely sure?')).toBeVisible();
    
    // Try to delete without typing DELETE
    const deleteButton = page.locator('button:has-text("Delete Account")').last();
    await expect(deleteButton).toBeDisabled();
    
    // Type DELETE
    await page.fill('input[placeholder="Type DELETE"]', 'DELETE');
    await expect(deleteButton).toBeEnabled();
    
    // Cancel the dialog
    await page.locator('button:has-text("Cancel")').click();
    await expect(page.locator('text=Are you absolutely sure?')).not.toBeVisible();
  });
});