import { Page, expect } from '@playwright/test';

/**
 * Helper functions for E2E tests
 */

/**
 * Create a new plan
 */
export async function createNewPlan(page: Page, title: string): Promise<void> {
  // Wait for the page to be fully loaded
  await page.waitForSelector('button:has-text("新建计划")');
  
  // Click new plan button
  await page.click('button:has-text("新建计划")');
  
  // Wait for modal to be visible - use more general selector for Ant Design 6
  await page.waitForSelector('.ant-modal-wrap');
  await page.waitForTimeout(500); // Wait for animation
  
  // Wait for input to be ready - use more general selector
  const nameInput = page.locator('.ant-modal input').first();
  await nameInput.waitFor({ state: 'visible' });
  await nameInput.fill(title);
  
  // Click the primary button (创建/保存)
  const submitButton = page.locator('.ant-modal-footer button.ant-btn-primary');
  await submitButton.waitFor({ state: 'visible' });
  await submitButton.click();
  
  // Wait for navigation to plan detail page
  await expect(page.locator('[data-testid="unified-timeline-panel-v2"]')).toBeVisible({ timeout: 15000 });
  
  // Wait a bit for the plan to fully load
  await page.waitForTimeout(800);
}

/**
 * Clear all localStorage data
 */
export async function clearLocalStorage(page: Page): Promise<void> {
  await page.evaluate(() => {
    localStorage.clear();
  });
}

/**
 * Initialize sample data for matrix view
 */
export async function initializeSampleData(page: Page): Promise<void> {
  // Switch to matrix view
  await page.click('button:has-text("矩阵")');
  await page.waitForTimeout(800);
  
  // Initialize sample data if button exists
  const initButton = page.locator('button:has-text("初始化示例数据")');
  const isVisible = await initButton.isVisible().catch(() => false);
  
  if (isVisible) {
    await initButton.click();
    // Wait for success message or table to appear
    await Promise.race([
      page.waitForSelector('.ant-message-success', { timeout: 5000 }),
      page.waitForSelector('.ant-table', { timeout: 5000 })
    ]);
    await page.waitForTimeout(800);
  }
}
