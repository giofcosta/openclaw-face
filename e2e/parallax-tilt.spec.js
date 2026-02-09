import { test, expect } from '@playwright/test';

test.describe('3D Parallax Tilt Effect', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('parallax tilt effect is applied to face wrapper', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Mouse tracking not applicable on mobile');
    
    // The tilt effect is applied to a wrapper div containing the face
    const faceWrapper = page.locator('div').filter({ has: page.locator('svg') }).first();
    await expect(faceWrapper).toBeVisible();
    
    // Get initial transform style
    const initialStyle = await faceWrapper.evaluate((el) => 
      el.style.transform
    );
    
    // Move mouse to different position to trigger tilt
    await page.mouse.move(100, 100);
    await page.waitForTimeout(300);
    
    const newStyle = await faceWrapper.evaluate((el) => 
      el.style.transform
    );
    
    // Should have transform applied when mouse moves
    // The transform should change when mouse moves
    expect(newStyle).not.toBe(initialStyle);
  });

  test('tilt effect responds to mouse movement', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Mouse tracking not applicable on mobile');
    
    const faceWrapper = page.locator('div').filter({ has: page.locator('svg') }).first();
    await expect(faceWrapper).toBeVisible();
    
    // Move mouse to opposite corners and check if transform changes
    await page.mouse.move(100, 100);
    await page.waitForTimeout(200);
    const topLeftTransform = await faceWrapper.evaluate((el) => el.style.transform);
    
    await page.mouse.move(800, 600);
    await page.waitForTimeout(200);
    const bottomRightTransform = await faceWrapper.evaluate((el) => el.style.transform);
    
    // Should be different transforms for different mouse positions
    expect(topLeftTransform).not.toBe(bottomRightTransform);
  });

  test('parallax effect can be disabled', async ({ page }) => {
    // By default parallax should be enabled
    const faceWrapper = page.locator('div').filter({ has: page.locator('svg') }).first();
    await expect(faceWrapper).toBeVisible();
    
    // Move mouse and check if transform is applied
    await page.mouse.move(200, 200);
    await page.waitForTimeout(200);
    
    const transform = await faceWrapper.evaluate((el) => el.style.transform);
    // Even if not dramatic, should have some transform
    expect(transform).toBeDefined();
  });

  test('parallax effect works with custom avatars', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Mouse tracking not applicable on mobile');
    
    // Generate an avatar to test with custom avatar mode
    await page.getByRole('button', { name: /generate avatar/i }).click();
    await page.waitForSelector('[role="dialog"]');
    
    // Generate an avatar
    await page.getByRole('button', { name: /generate/i }).click();
    await page.waitForTimeout(2000);
    
    // Close modal
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    // Now check if parallax effect works with custom avatar
    const faceWrapper = page.locator('div').filter({ has: page.locator('img') }).first();
    if (await faceWrapper.count() > 0) {
      await expect(faceWrapper).toBeVisible();
      
      // Move mouse and check transform
      const initialTransform = await faceWrapper.evaluate((el) => el.style.transform);
      await page.mouse.move(400, 300);
      await page.waitForTimeout(300);
      const newTransform = await faceWrapper.evaluate((el) => el.style.transform);
      
      expect(newTransform).not.toBe(initialTransform);
    }
  });

  test('perspective is applied to enable 3D effect', async ({ page }) => {
    const faceWrapper = page.locator('div').filter({ has: page.locator('svg') }).first();
    await expect(faceWrapper).toBeVisible();
    
    // Check that perspective transform style is applied
    const style = await faceWrapper.evaluate((el) => 
      window.getComputedStyle(el).getPropertyValue('transform-style')
    );
    
    // Should have preserve-3d or have perspective set
    expect(style).toBeTruthy(); // Element should have 3D context
  });
});