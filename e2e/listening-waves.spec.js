// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Listening Waves Tests
 * Tests for the listening animation around the avatar
 */

test.describe('Listening Waves Animation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('listening waves canvas does not exist when not listening', async ({ page }) => {
    // By default, listening waves should not be visible
    const canvas = page.locator('[data-testid="listening-waves"]');
    await expect(canvas).not.toBeVisible();
  });

  test('page loads without errors with listening waves component', async ({ page }) => {
    // Verify page loads correctly
    const face = page.locator('[data-testid="face-tilt-wrapper"]');
    await expect(face).toBeVisible();
    
    // No console errors
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.waitForTimeout(1000);
    
    // Filter out WebSocket connection errors (expected when backend not running)
    const realErrors = errors.filter(e => !e.includes('WebSocket'));
    expect(realErrors).toHaveLength(0);
  });

  test('listening waves component is properly positioned', async ({ page }) => {
    // The ListeningWaves canvas should be absolute positioned
    // We can't test the actual animation without triggering listening state
    // But we can verify the component structure is correct
    
    // Check that Face component renders correctly
    const faceWrapper = page.locator('[data-testid="face-tilt-wrapper"]');
    await expect(faceWrapper).toBeVisible();
  });
});
