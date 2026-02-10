import { test, expect } from '@playwright/test';

test.describe('Weather Atmosphere Effects', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('weather atmosphere canvas is rendered', async ({ page }) => {
    // The WeatherAtmosphere component renders a canvas with data-testid
    const canvas = page.locator('[data-testid="weather-canvas"]');
    await expect(canvas).toBeVisible();
  });

  test('weather canvas is positioned behind the face', async ({ page }) => {
    const canvas = page.locator('[data-testid="weather-canvas"]');
    await expect(canvas).toBeVisible();
    const className = await canvas.getAttribute('class');
    expect(className).toContain('absolute');
    expect(className).toContain('inset-0');
    expect(className).toContain('z-0');
  });

  test('weather canvas does not block interactions', async ({ page }) => {
    const canvas = page.locator('[data-testid="weather-canvas"]');
    await expect(canvas).toBeVisible();
    const className = await canvas.getAttribute('class');
    expect(className).toContain('pointer-events-none');
  });

  test('weather canvas has subtle opacity', async ({ page }) => {
    const canvas = page.locator('[data-testid="weather-canvas"]');
    await expect(canvas).toBeVisible();
    const style = await canvas.getAttribute('style');
    expect(style).toContain('opacity');
    expect(style).toContain('0.6');
  });

  test('face elements remain interactive with weather enabled', async ({ page }) => {
    // The weather should not block the avatar button
    const avatarButton = page.getByRole('button', { name: /generate avatar/i });
    await expect(avatarButton).toBeVisible();
    await avatarButton.click();
    
    // Avatar generator should open (button text changes to "Back to Face")
    await expect(page.getByRole('button', { name: /back to face/i })).toBeVisible();
  });

  test('weather canvas dimensions match container', async ({ page }) => {
    const canvas = page.locator('[data-testid="weather-canvas"]');
    await expect(canvas).toBeVisible();
    
    // Wait for canvas to initialize with dimensions (resize runs on mount)
    await page.waitForTimeout(1000);
    
    // Canvas should have width and height attributes set by JS
    const width = await canvas.getAttribute('width');
    const height = await canvas.getAttribute('height');
    
    // Should have positive dimensions (canvas.width sets the attribute)
    const parsedWidth = parseInt(width) || 0;
    const parsedHeight = parseInt(height) || 0;
    expect(parsedWidth).toBeGreaterThan(0);
    expect(parsedHeight).toBeGreaterThan(0);
  });
});
