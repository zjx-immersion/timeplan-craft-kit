import { test, expect, Page } from '@playwright/test';

/**
 * Other Views E2E Tests
 * Tests for Version Comparison, Iteration, and Module Iteration views
 */

test.describe('Other Views', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Clear localStorage
    await page.evaluate(() => {
      localStorage.removeItem('timeplan-store');
    });
    await page.reload();
    
    // Create a new plan with mock data
    await createNewPlan(page, 'Other Views Test Plan');
  });

  test.describe('Version Comparison View', () => {
    test('should display version comparison view', async ({ page }) => {
      // Click version comparison button
      await page.click('button:has-text("版本对比")');
      
      // Verify view is active
      await expect(page.locator('[data-current-view="version"]')).toBeVisible();
      
      // Verify content exists
      await expect(page.locator('[data-testid="view-content-version"]')).toBeVisible();
    });
  });

  test.describe('Version Plan View', () => {
    test('should display version plan view', async ({ page }) => {
      // Click version plan button
      await page.click('button:has-text("版本计划")');
      
      // Verify view is active
      await expect(page.locator('[data-current-view="versionPlan"]')).toBeVisible();
      
      // Verify content exists
      await expect(page.locator('[data-testid="view-content-versionPlan"]')).toBeVisible();
    });
  });

  test.describe('Iteration View', () => {
    test('should display iteration view', async ({ page }) => {
      // Click iteration button
      await page.click('button:has-text("时间迭代")');
      
      // Verify view is active
      await expect(page.locator('[data-current-view="iteration"]')).toBeVisible();
      
      // Verify content exists
      await expect(page.locator('[data-testid="view-content-iteration"]')).toBeVisible();
    });
  });

  test.describe('Module Iteration View', () => {
    test('should display module iteration view', async ({ page }) => {
      // Click module iteration button
      await page.click('button:has-text("模块规划")');
      
      // Verify view is active
      await expect(page.locator('[data-current-view="moduleIteration"]')).toBeVisible();
      
      // Verify content exists
      await expect(page.locator('[data-testid="view-content-moduleIteration"]')).toBeVisible();
    });
  });

  test.describe('View Navigation', () => {
    test('should navigate through all views', async ({ page }) => {
      const views = [
        { name: '甘特图', view: 'gantt' },
        { name: '表格', view: 'table' },
        { name: '矩阵', view: 'matrix' },
        { name: '版本对比', view: 'version' },
        { name: '版本计划', view: 'versionPlan' },
        { name: '时间迭代', view: 'iteration' },
        { name: '模块规划', view: 'moduleIteration' },
      ];

      for (const { name, view } of views) {
        // Click view button
        await page.click(`button:has-text("${name}")`);
        
        // Verify view is active
        await expect(page.locator(`[data-current-view="${view}"]`)).toBeVisible();
        
        // Verify content area exists
        await expect(page.locator(`[data-testid="view-content-${view}"]`)).toBeVisible();
      }
    });
  });
});

async function createNewPlan(page: Page, title: string): Promise<void> {
  await page.click('button:has-text("新建计划")');
  await page.waitForSelector('.ant-modal-content');
  await page.fill('input[placeholder="输入项目名称"]', title);
  // Use the primary button in the modal footer
  await page.click('.ant-modal-footer button.ant-btn-primary');
  await expect(page.locator('[data-testid="unified-timeline-panel-v2"]')).toBeVisible();
}
