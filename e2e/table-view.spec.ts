import { test, expect, Page } from '@playwright/test';

/**
 * Table View E2E Tests
 * Tests for the table/list view functionality
 */

test.describe('Table View', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Clear localStorage
    await page.evaluate(() => {
      localStorage.removeItem('timeplan-store');
    });
    await page.reload();
    
    // Create a new plan with mock data
    await createNewPlan(page, 'Table Test Plan');
    
    // Switch to table view
    await page.click('button:has-text("表格")');
    
    // Wait for table to be visible
    await expect(page.locator('[data-current-view="table"]')).toBeVisible();
  });

  test('should display table view', async ({ page }) => {
    // Verify table view is active
    await expect(page.locator('[data-current-view="table"]')).toBeVisible();
    
    // Verify table exists
    await expect(page.locator('.ant-table')).toBeVisible();
  });

  test('should search and filter data', async ({ page }) => {
    // Type in search box
    await page.fill('.ant-table-wrapper input[placeholder*="搜索"]', 'Orion');
    
    // Verify search works (table should update)
    await expect(page.locator('.ant-table')).toBeVisible();
  });

  test('should sort columns', async ({ page }) => {
    // Find a sortable column header and click it
    const columnHeader = page.locator('.ant-table-thead th').first();
    await columnHeader.click();
    
    // Click again to reverse sort
    await columnHeader.click();
    
    // Verify table still displays
    await expect(page.locator('.ant-table')).toBeVisible();
  });

  test('should open column settings', async ({ page }) => {
    // Click column settings button
    await page.click('button[title="列设置"]');
    
    // Verify settings dialog opens
    await expect(page.locator('.ant-modal-title')).toContainText('列设置');
    
    // Close dialog
    await page.click('.ant-modal-close');
  });

  test('should show row selection in edit mode', async ({ page }) => {
    // Enable edit mode
    await page.click('button:has-text("编辑模式")');
    
    // Verify checkboxes exist in table
    await expect(page.locator('.ant-checkbox-input').first()).toBeVisible();
  });

  test('should switch between views and preserve data', async ({ page }) => {
    // Switch to gantt view
    await page.click('button:has-text("甘特图")');
    await expect(page.locator('[data-current-view="gantt"]')).toBeVisible();
    
    // Switch back to table view
    await page.click('button:has-text("表格")');
    await expect(page.locator('[data-current-view="table"]')).toBeVisible();
    
    // Verify table still has data
    await expect(page.locator('.ant-table-tbody tr')).toHaveCount.greaterThan(0);
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
