// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Chat Panel Tests
 * Tests for the live chat sidebar functionality
 */

test.describe('Chat Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('chat toggle button exists', async ({ page }) => {
    // The chat toggle button should be in the top right
    const toggleButton = page.locator('button[aria-label="Open chat"], button[aria-label="Close chat"]');
    await expect(toggleButton).toBeVisible();
  });

  test('chat panel opens when toggle is clicked', async ({ page }) => {
    // Click the chat toggle button
    const toggleButton = page.locator('button[aria-label="Open chat"]');
    await toggleButton.click();
    
    // Input field should exist (proves panel is open)
    const input = page.locator('input[placeholder="Type a message..."]');
    await expect(input).toBeVisible();
    
    // Chat header should show bot name
    const header = page.getByRole('heading', { name: 'Kratos' });
    await expect(header).toBeVisible();
  });

  test('chat panel closes when toggle is clicked again', async ({ page }) => {
    // Open chat
    const openButton = page.locator('button[aria-label="Open chat"]');
    await openButton.click();
    
    // Verify it's open
    await expect(page.locator('input[placeholder="Type a message..."]')).toBeVisible();
    
    // Close chat
    const closeButton = page.locator('button[aria-label="Close chat"]');
    await closeButton.click();
    
    // Wait for animation to complete
    await page.waitForTimeout(400);
    
    // Panel should slide out (translated off-screen)
    // Check that the close button is now the open button again
    await expect(page.locator('button[aria-label="Open chat"]')).toBeVisible();
  });

  test('can type in chat input', async ({ page }) => {
    // Open chat
    await page.locator('button[aria-label="Open chat"]').click();
    
    // Type a message
    const input = page.locator('input[placeholder="Type a message..."]');
    await input.fill('Hello Kratos!');
    
    // Verify input value
    await expect(input).toHaveValue('Hello Kratos!');
  });

  test('send button is disabled when input is empty', async ({ page }) => {
    // Open chat
    await page.locator('button[aria-label="Open chat"]').click();
    
    // Send button should be disabled when empty
    const sendButton = page.locator('button[type="submit"]');
    // Check that button has cursor-not-allowed class (disabled state)
    await expect(sendButton).toHaveClass(/cursor-not-allowed/);
  });

  test('send button is enabled when input has text', async ({ page }) => {
    // Open chat
    await page.locator('button[aria-label="Open chat"]').click();
    
    // Type a message
    const input = page.locator('input[placeholder="Type a message..."]');
    await input.fill('Test message');
    
    // Send button should not have disabled class
    const sendButton = page.locator('button[type="submit"]');
    await expect(sendButton).not.toHaveClass(/cursor-not-allowed/);
  });

  test('chat header shows bot name', async ({ page }) => {
    // Open chat
    await page.locator('button[aria-label="Open chat"]').click();
    
    // Header should show "Kratos"
    const header = page.locator('h3:has-text("Kratos")');
    await expect(header).toBeVisible();
  });

  test('empty state shows placeholder message', async ({ page }) => {
    // Open chat
    await page.locator('button[aria-label="Open chat"]').click();
    
    // Should show empty state
    const emptyState = page.locator('text=No messages yet');
    await expect(emptyState).toBeVisible();
  });
});
