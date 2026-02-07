import { test, expect } from '@playwright/test';

test.describe('Theme Presets', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('theme selector button exists', async ({ page }) => {
    // Theme selector should be visible in top-right
    const themeButton = page.locator('button').filter({ hasText: /⚡|🌃|🌿|⬜|💜|🌊|🌅|🌙/ }).first();
    await expect(themeButton).toBeVisible();
  });

  test('clicking theme selector opens dropdown', async ({ page }) => {
    // Find and click theme button
    const themeButton = page.locator('button').filter({ hasText: /⚡|🌃|🌿|⬜|💜|🌊|🌅|🌙/ }).first();
    await themeButton.click();

    // Dropdown should appear with theme options
    await expect(page.getByText('Choose Theme')).toBeVisible();
  });

  test('can select different themes', async ({ page }) => {
    // Open theme selector
    const themeButton = page.locator('button').filter({ hasText: /⚡|🌃|🌿|⬜|💜|🌊|🌅|🌙/ }).first();
    await themeButton.click();

    // Click Cyberpunk theme
    await page.getByText('Cyberpunk').click();

    // Theme selector should close and show new theme emoji
    await expect(page.getByText('🌃')).toBeVisible();
  });

  test('theme preference persists after reload', async ({ page }) => {
    // Select a theme
    const themeButton = page.locator('button').filter({ hasText: /⚡|🌃|🌿|⬜|💜|🌊|🌅|🌙/ }).first();
    await themeButton.click();
    await page.getByText('Ocean').click();

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Ocean theme should still be selected
    await expect(page.getByText('🌊')).toBeVisible();
  });

  test('all theme presets are available', async ({ page }) => {
    // Open theme selector
    const themeButton = page.locator('button').filter({ hasText: /⚡|🌃|🌿|⬜|💜|🌊|🌅|🌙/ }).first();
    await themeButton.click();

    // Check all theme buttons exist in the dropdown
    const dropdown = page.locator('[class*="grid"]').last();
    await expect(dropdown.getByText('Default')).toBeVisible();
    await expect(dropdown.getByText('Cyberpunk')).toBeVisible();
    await expect(dropdown.getByText('Nature')).toBeVisible();
    await expect(dropdown.getByText('Minimal')).toBeVisible();
    await expect(dropdown.getByText('Neon')).toBeVisible();
    await expect(dropdown.getByText('Ocean')).toBeVisible();
    await expect(dropdown.getByText('Sunset')).toBeVisible();
    await expect(dropdown.getByText('Midnight')).toBeVisible();
  });

  test('background color changes with theme', async ({ page }) => {
    // Get initial background
    const body = page.locator('body');
    const initialBg = await body.evaluate((el) => window.getComputedStyle(el).backgroundColor);

    // Change theme to Cyberpunk
    const themeButton = page.locator('button').filter({ hasText: /⚡|🌃|🌿|⬜|💜|🌊|🌅|🌙/ }).first();
    await themeButton.click();
    await page.getByText('Cyberpunk').click();
    await page.waitForTimeout(100);

    // Background should have changed
    const newBg = await body.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(newBg).not.toBe(initialBg);
  });
});
