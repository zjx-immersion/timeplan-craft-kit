import { Page, expect } from '@playwright/test';

/**
 * Helper functions for E2E tests
 */

/**
 * Ensure user is logged in
 * Assumes test user already exists (created via API)
 */
export async function ensureLoggedIn(page: Page): Promise<void> {
  // Navigate to the app
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  // Check if we're on the login page (redirected)
  const currentUrl = page.url();
  if (currentUrl.includes('/login')) {
    console.log('On login page, performing login...');
    await performLogin(page);
  }
}

/**
 * Perform login on the login page
 */
async function performLogin(page: Page): Promise<void> {
  // Wait for login form to be visible
  await page.waitForSelector('input[placeholder*="用户名"], input[placeholder*="邮箱"]');
  
  // Fill login form using label/index approach
  const inputs = page.locator('input[type="text"], input[type="email"]').first();
  await inputs.fill('testuser');
  
  const passwordInput = page.locator('input[type="password"]').first();
  await passwordInput.fill('Test123!@#');
  
  // Submit - find the submit button in the login form
  await page.click('button[type="submit"], .ant-btn-primary:has-text("登录")');
  
  // Wait for navigation to complete (go to home page)
  await page.waitForURL(/\/[^\/]*\/?$/, { timeout: 10000 });
  console.log('Logged in successfully');
}

/**
 * Create a new plan
 */
export async function createNewPlan(page: Page, title: string): Promise<void> {
  // Ensure logged in first
  await ensureLoggedIn(page);
  
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
  
  // Fill owner field if exists
  const ownerInput = page.locator('input[placeholder="负责人"]').first();
  if (await ownerInput.isVisible().catch(() => false)) {
    await ownerInput.fill('Test Owner');
  }
  
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
