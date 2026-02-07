import { test, expect } from '@playwright/test';

test.describe('Eye Tracking', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('eye pupils exist in SVG face', async ({ page }) => {
    // The SVG face should have ellipse elements for eye pupils
    const leftPupil = page.locator('svg ellipse').first();
    await expect(leftPupil).toBeVisible();
  });

  // Skip mouse tests on mobile - touch doesn't work the same way
  test('eyes respond to mouse movement', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Mouse tracking not applicable on mobile');
    
    const leftPupil = page.locator('svg ellipse').first();
    await expect(leftPupil).toBeVisible();
    
    const initialCx = parseFloat(await leftPupil.getAttribute('cx'));
    
    // Move mouse to far right of viewport
    await page.mouse.move(800, 200);
    await page.waitForTimeout(300); // Wait for animation
    
    const newCx = parseFloat(await leftPupil.getAttribute('cx'));
    
    // Eyes should move at least a little in response to mouse
    expect(Math.abs(newCx - initialCx)).toBeGreaterThan(0.5);
  });

  test('eyes stay within bounds', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Mouse tracking not applicable on mobile');
    
    const leftPupil = page.locator('svg ellipse').first();
    await expect(leftPupil).toBeVisible();
    
    // Move mouse to extreme positions
    await page.mouse.move(2000, 2000);
    await page.waitForTimeout(300);
    
    const cx = parseFloat(await leftPupil.getAttribute('cx'));
    const cy = parseFloat(await leftPupil.getAttribute('cy'));
    
    // Eyes should stay within reasonable bounds (max 5px offset from center 140, 160)
    expect(cx).toBeGreaterThan(135);
    expect(cx).toBeLessThan(145);
    expect(cy).toBeGreaterThan(155);
    expect(cy).toBeLessThan(165);
  });

  test('both eyes track together', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Mouse tracking not applicable on mobile');
    
    const pupils = page.locator('svg ellipse');
    await expect(pupils.first()).toBeVisible();
    
    // Move mouse to top-left
    await page.mouse.move(100, 100);
    await page.waitForTimeout(300);
    
    // Both eyes should have similar relative offsets
    const leftCx = parseFloat(await pupils.nth(0).getAttribute('cx'));
    const rightCx = parseFloat(await pupils.nth(1).getAttribute('cx'));
    
    // Left eye center is 140, right is 260 - offset should be similar
    const leftOffset = leftCx - 140;
    const rightOffset = rightCx - 260;
    
    expect(Math.abs(leftOffset - rightOffset)).toBeLessThan(1);
  });

  test('eye tracking is smooth (no jumps)', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Mouse tracking not applicable on mobile');
    
    const leftPupil = page.locator('svg ellipse').first();
    await expect(leftPupil).toBeVisible();
    
    // Record positions during movement
    const positions = [];
    
    for (let x = 200; x <= 600; x += 100) {
      await page.mouse.move(x, 200);
      await page.waitForTimeout(100);
      const cx = parseFloat(await leftPupil.getAttribute('cx'));
      positions.push(cx);
    }
    
    // Check that movement is gradual (no big jumps)
    for (let i = 1; i < positions.length; i++) {
      const diff = Math.abs(positions[i] - positions[i-1]);
      expect(diff).toBeLessThan(10); // No jumps larger than 10px
    }
  });
});
