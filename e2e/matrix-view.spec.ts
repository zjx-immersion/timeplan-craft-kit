import { test, expect } from '@playwright/test';
import { createNewPlan, clearLocalStorage } from './helpers';

/**
 * Phase 2 MVP E2E Tests - Matrix View
 * Based on: view-enhancement-workspace/Phase2-测试指南.md
 */

test.describe.configure({ mode: 'serial' });

test.describe('Matrix View Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();
  });

  /**
   * ============================================
   * 一、基础功能测试 (Basic Functionality Tests)
   * ============================================
   */
  test('1.1 should switch to matrix view', async ({ page }) => {
    await createNewPlan(page, 'Matrix Test Plan');
    
    // Click matrix view button
    await page.click('button:has-text("矩阵")');
    await page.waitForTimeout(800);
    
    // Verify matrix view is active
    await expect(page.locator('[data-current-view="matrix"]')).toBeVisible();
    
    // Verify V2 button is shown (default) - use exact text to avoid conflict with "矩阵 V2" button
    await expect(page.locator('button').filter({ hasText: /^V2$/ })).toBeVisible();
  });

  test('1.2 should show empty state and init button', async ({ page }) => {
    await createNewPlan(page, 'Matrix Test Plan');
    await page.click('button:has-text("矩阵")');
    await page.waitForTimeout(800);
    
    // Verify empty state message
    await expect(page.locator('text=暂无Product数据')).toBeVisible();
    
    // Verify initialize button exists
    await expect(page.locator('button:has-text("初始化示例数据")')).toBeVisible();
    
    // Verify create buttons exist
    await expect(page.locator('button:has-text("创建Product")')).toBeVisible();
    await expect(page.locator('button:has-text("创建Team")')).toBeVisible();
  });

  /**
   * ============================================
   * 二、Product管理测试 (Product Management)
   * ============================================
   */
  test('2.1 should open product management dialog', async ({ page }) => {
    await createNewPlan(page, 'Matrix Test Plan');
    await page.click('button:has-text("矩阵")');
    await page.waitForTimeout(800);
    
    // Click "创建Product" button (available in empty state)
    await page.click('button:has-text("创建Product")');
    await page.waitForTimeout(500);
    
    // Verify dialog opens - check for modal title
    await expect(page.locator('.ant-modal-title').filter({ hasText: /Product/ })).toBeVisible();
  });

  test('2.2 should open team management dialog', async ({ page }) => {
    await createNewPlan(page, 'Matrix Test Plan');
    await page.click('button:has-text("矩阵")');
    await page.waitForTimeout(800);
    
    // Click "创建Team" button (available in empty state)
    await page.click('button:has-text("创建Team")');
    await page.waitForTimeout(500);
    
    // Verify dialog opens - check for modal title
    await expect(page.locator('.ant-modal-title').filter({ hasText: /Team/ })).toBeVisible();
  });

  /**
   * ============================================
   * 三、视图切换测试 (View Switching)
   * ============================================
   */
  test('3.1 should switch between V1 and V2 matrix views', async ({ page }) => {
    await createNewPlan(page, 'Matrix Test Plan');
    await page.click('button:has-text("矩阵")');
    await page.waitForTimeout(800);
    
    // Verify currently in V2 (default) - use exact match
    const v2Button = page.locator('button').filter({ hasText: /^V2$/ });
    await expect(v2Button).toBeVisible();
    
    // Click to switch to V1
    await v2Button.click();
    await page.waitForTimeout(500);
    
    // Verify V1 button appears - use exact match
    const v1Button = page.locator('button').filter({ hasText: /^V1$/ });
    await expect(v1Button).toBeVisible();
    
    // Click V2 button to switch back
    await v1Button.click();
    await page.waitForTimeout(500);
    
    // Verify V2 button appears again
    await expect(v2Button).toBeVisible();
  });

  /**
   * ============================================
   * 四、视图导航测试 (View Navigation)
   * ============================================
   */
  test('4.1 should navigate to other views from matrix', async ({ page }) => {
    await createNewPlan(page, 'Matrix Test Plan');
    
    // Switch to matrix view
    await page.click('button:has-text("矩阵")');
    await page.waitForTimeout(800);
    await expect(page.locator('[data-current-view="matrix"]')).toBeVisible();
    
    // Switch to table view
    await page.click('button:has-text("表格")');
    await page.waitForTimeout(500);
    await expect(page.locator('[data-current-view="table"]')).toBeVisible();
    
    // Switch back to matrix view
    await page.click('button:has-text("矩阵")');
    await page.waitForTimeout(500);
    await expect(page.locator('[data-current-view="matrix"]')).toBeVisible();
  });

  test('4.2 should navigate to gantt view from matrix', async ({ page }) => {
    await createNewPlan(page, 'Matrix Test Plan');
    
    // Switch to matrix view
    await page.click('button:has-text("矩阵")');
    await page.waitForTimeout(800);
    await expect(page.locator('[data-current-view="matrix"]')).toBeVisible();
    
    // Switch to gantt view
    await page.click('button:has-text("甘特图")');
    await page.waitForTimeout(500);
    await expect(page.locator('[data-current-view="gantt"]')).toBeVisible();
    
    // Verify timeline container
    await expect(page.locator('[data-timeline-container="true"]')).toBeVisible();
  });

  /**
   * ============================================
   * 五、响应式测试 (Responsive Tests)
   * ============================================
   */
  test('5.1 should render matrix view correctly', async ({ page }) => {
    await createNewPlan(page, 'Matrix Test Plan');
    await page.click('button:has-text("矩阵")');
    await page.waitForTimeout(800);
    
    // Verify matrix view container exists
    await expect(page.locator('[data-current-view="matrix"]')).toBeVisible();
    
    // Verify toolbar buttons are present
    await expect(page.locator('button:has-text("创建Product")').or(
      page.locator('button:has-text("Product管理")')
    )).toBeVisible();
  });
});
