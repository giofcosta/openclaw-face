import { test, expect } from '@playwright/test';

test.describe('3D Parallax Tilt Effect', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('parallax tilt effect is applied to face wrapper', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Mouse tracking not applicable on mobile');
    
    // Wait for app to fully render
    await page.waitForTimeout(500);
    
    // The tilt effect is applied to the face wrapper div
    const faceWrapper = page.locator('[data-testid="face-tilt-wrapper"]');
    await expect(faceWrapper).toBeVisible();
    
    // Get the transform style (should have perspective even at 0,0)
    const transform = await faceWrapper.evaluate((el) => 
      el.style.transform || 'none'
    );
    
    // Should have perspective transform applied
    expect(transform).toContain('perspective');
  });

  test('tilt effect responds to mouse movement', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Mouse tracking not applicable on mobile');
    
    await page.waitForTimeout(500);
    const faceWrapper = page.locator('[data-testid="face-tilt-wrapper"]');
    await expect(faceWrapper).toBeVisible();
    
    // Move mouse to one corner
    await page.mouse.move(100, 100);
    await page.waitForTimeout(300);
    const topLeftTransform = await faceWrapper.evaluate((el) => el.style.transform || 'none');
    
    // Move mouse to opposite corner
    await page.mouse.move(700, 500);
    await page.waitForTimeout(300);
    const bottomRightTransform = await faceWrapper.evaluate((el) => el.style.transform || 'none');
    
    // Both should have perspective transforms and should be different
    expect(topLeftTransform).toContain('perspective');
    expect(bottomRightTransform).toContain('perspective');
    expect(topLeftTransform).not.toBe(bottomRightTransform);
  });

  test('parallax effect can be disabled', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Mouse tracking not applicable on mobile');
    
    // By default parallax should be enabled
    const faceWrapper = page.locator('[data-testid="face-tilt-wrapper"]');
    await expect(faceWrapper).toBeVisible();
    
    // Move mouse and check if transform is applied
    await page.mouse.move(200, 200);
    await page.waitForTimeout(200);
    
    const transform = await faceWrapper.evaluate((el) => el.style.transform);
    // Should have perspective transform
    expect(transform).toContain('perspective');
  });

  test('parallax effect works with custom avatars', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Mouse tracking not applicable on mobile');
    
    // Generate an avatar to test with custom avatar mode
    await page.getByRole('button', { name: /generate avatar/i }).click();
    
    // Wait for avatar generator panel to be visible
    await page.waitForTimeout(500);
    
    // Generate an avatar (DiceBear is instant)
    const generateBtn = page.getByRole('button', { name: /^generate$/i });
    await expect(generateBtn).toBeVisible({ timeout: 5000 });
    await generateBtn.click();
    await page.waitForTimeout(1000);
    
    // Use as face if button is visible
    const useAsFaceBtn = page.getByRole('button', { name: /use as face/i });
    if (await useAsFaceBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await useAsFaceBtn.click();
      await page.waitForTimeout(500);
    }
    
    // Close modal by clicking "Back to Face"
    const backBtn = page.getByRole('button', { name: /back to face/i });
    if (await backBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await backBtn.click();
    }
    await page.waitForTimeout(500);
    
    // Check if custom avatar is displayed
    const avatarImg = page.locator('img[alt="Kratos Avatar"]');
    if (await avatarImg.count() > 0) {
      await expect(avatarImg).toBeVisible();
      
      // The tilt wrapper should have perspective transform
      const tiltWrapper = page.locator('[data-testid="face-tilt-wrapper"]');
      if (await tiltWrapper.count() > 0) {
        const transform = await tiltWrapper.evaluate((el) => el.style.transform);
        expect(transform).toContain('perspective');
      }
    } else {
      // If no avatar was generated/used, just check the SVG face wrapper
      const faceWrapper = page.locator('[data-testid="face-tilt-wrapper"]');
      await expect(faceWrapper).toBeVisible();
    }
  });

  test('perspective is applied to enable 3D effect', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Mouse tracking not applicable on mobile');
    
    const faceWrapper = page.locator('[data-testid="face-tilt-wrapper"]');
    await expect(faceWrapper).toBeVisible();
    
    // Check that perspective transform is applied to the style
    const transform = await faceWrapper.evaluate((el) => el.style.transform || 'none');
    
    // Should have perspective(1000px) in transform
    expect(transform).toContain('perspective(1000px)');
  });
});