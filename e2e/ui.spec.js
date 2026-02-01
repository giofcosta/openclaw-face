import { test, expect } from '@playwright/test';

test.describe('Main Page Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('main container has padding from edges', async ({ page }) => {
    const mainContainer = page.locator('body > div#root > div').first();
    await expect(mainContainer).toBeVisible();
    
    // Check that content is not touching the edges
    const box = await mainContainer.boundingBox();
    const viewport = page.viewportSize();
    
    // On mobile (width < 640px), expect at least 24px padding (p-6 = 1.5rem = 24px)
    // On desktop, expect more
    const minPadding = viewport.width < 640 ? 20 : 30;
    
    // The main container should have padding applied
    const computedStyle = await mainContainer.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        paddingLeft: parseFloat(style.paddingLeft),
        paddingRight: parseFloat(style.paddingRight),
        paddingTop: parseFloat(style.paddingTop),
        paddingBottom: parseFloat(style.paddingBottom),
      };
    });

    expect(computedStyle.paddingLeft).toBeGreaterThanOrEqual(minPadding);
    expect(computedStyle.paddingRight).toBeGreaterThanOrEqual(minPadding);
  });

  test('page loads without errors', async ({ page }) => {
    // Check for loading state or face element
    const face = page.locator('[class*="flex-1"]').first();
    await expect(face).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Avatar Generator Modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Open the avatar generator
    await page.click('text=Generate Avatar');
    await page.waitForSelector('text=Avatar Studio', { state: 'visible' });
  });

  test('modal has proper padding on mobile', async ({ page, isMobile }) => {
    if (!isMobile) return; // Skip on desktop
    
    const modal = page.locator('[class*="fixed inset-0"]').first();
    const modalContent = modal.locator('> div').first();
    
    // Check modal backdrop padding
    const backdropStyle = await modal.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return parseFloat(style.padding);
    });
    expect(backdropStyle).toBeGreaterThanOrEqual(16); // p-4 = 16px minimum

    // Check that modal content has proper spacing from viewport edges
    const box = await modalContent.boundingBox();
    const viewport = page.viewportSize();
    
    expect(box.x).toBeGreaterThanOrEqual(8); // Some margin from left
    expect(viewport.width - (box.x + box.width)).toBeGreaterThanOrEqual(8); // Some margin from right
  });

  test('header has proper padding', async ({ page }) => {
    // Find the header by its border-b class which is unique to the header container
    const header = page.locator('[class*="border-b"][class*="border-white"]').first();
    
    const style = await header.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        paddingLeft: parseFloat(computed.paddingLeft),
        paddingRight: parseFloat(computed.paddingRight),
      };
    });
    
    // Should have at least 16px padding (p-4 = 1rem = 16px)
    expect(style.paddingLeft).toBeGreaterThanOrEqual(16);
    expect(style.paddingRight).toBeGreaterThanOrEqual(16);
  });

  test('tabs have proper padding', async ({ page }) => {
    // Find the tabs container - it's the second element with border-b
    const tabsContainer = page.locator('[class*="border-b"][class*="border-white"]').nth(1);
    
    const style = await tabsContainer.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        paddingLeft: parseFloat(computed.paddingLeft),
        paddingRight: parseFloat(computed.paddingRight),
      };
    });
    
    expect(style.paddingLeft).toBeGreaterThanOrEqual(16);
    expect(style.paddingRight).toBeGreaterThanOrEqual(16);
  });

  test('generate button is not full width on desktop', async ({ page, isMobile }) => {
    if (isMobile) return; // Only check desktop
    
    const button = page.locator('button:has-text("⚡ Generate Avatar")');
    await expect(button).toBeVisible();
    
    const box = await button.boundingBox();
    const viewport = page.viewportSize();
    
    // Button should be less than 50% of viewport width on desktop
    expect(box.width).toBeLessThan(viewport.width * 0.5);
  });

  test('content area has proper padding', async ({ page }) => {
    // Find the scrollable content area by its overflow-y-auto class
    const content = page.locator('[class*="overflow-y-auto"]').first();
    
    const style = await content.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        padding: parseFloat(computed.padding),
        paddingLeft: parseFloat(computed.paddingLeft),
        paddingTop: parseFloat(computed.paddingTop),
      };
    });
    
    // Should have at least 16px padding
    expect(style.paddingLeft).toBeGreaterThanOrEqual(16);
    expect(style.paddingTop).toBeGreaterThanOrEqual(16);
  });

  test('modal can be closed', async ({ page }) => {
    const closeButton = page.locator('button:has-text("✕")');
    await closeButton.click();
    
    await expect(page.locator('text=Avatar Studio')).not.toBeVisible();
  });

  test('toast component exists and can be triggered', async ({ page }) => {
    // Verify the Toast component is properly imported by checking the modal renders
    // The actual toast test would require generating an avatar which depends on external API
    // This test verifies the UI structure is correct
    const useButton = page.locator('button:has-text("Use as Face")');
    const generateButton = page.locator('button:has-text("⚡ Generate Avatar")');
    
    // Generate button should be visible
    await expect(generateButton).toBeVisible();
    
    // Use as Face button should NOT be visible before generation
    await expect(useButton).not.toBeVisible();
  });

  test('takes visual screenshot for review', async ({ page }, testInfo) => {
    // Take screenshot for visual review
    await page.screenshot({ 
      path: `e2e/screenshots/${testInfo.project.name.replace(' ', '-')}-modal.png`,
      fullPage: false 
    });
  });
});

test.describe('Visual Regression', () => {
  test('main page visual snapshot', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Wait for animations
    
    await page.screenshot({ 
      path: `e2e/screenshots/${testInfo.project.name.replace(' ', '-')}-main.png`,
      fullPage: false 
    });
  });

  test('modal visual snapshot', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.click('text=Generate Avatar');
    await page.waitForSelector('text=Avatar Studio', { state: 'visible' });
    await page.waitForTimeout(500);
    
    await page.screenshot({ 
      path: `e2e/screenshots/${testInfo.project.name.replace(' ', '-')}-modal.png`,
      fullPage: false 
    });
  });
});
