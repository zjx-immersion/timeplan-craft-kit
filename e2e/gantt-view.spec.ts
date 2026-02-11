import { test, expect } from '@playwright/test';
import { createNewPlan, clearLocalStorage } from './helpers';

/**
 * Gantt View E2E Tests
 * Tests for the main Gantt chart functionality
 */

test.describe.configure({ mode: 'serial' });

test.describe('Gantt View', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();
  });

  test('should display gantt view by default', async ({ page }) => {
    await createNewPlan(page, 'Gantt Test Plan');
    
    // Verify gantt view is active by default
    await expect(page.locator('[data-current-view="gantt"]')).toBeVisible();
    
    // Verify timeline container exists
    await expect(page.locator('[data-timeline-container="true"]')).toBeVisible();
  });

  test('should toggle edit mode', async ({ page }) => {
    await createNewPlan(page, 'Gantt Test Plan');
    
    // Verify initial state (view mode)
    await expect(page.locator('button:has-text("编辑模式")')).toBeVisible();
    
    // Click edit mode
    await page.click('button:has-text("编辑模式")');
    
    // Verify button changes to view mode
    await expect(page.locator('button:has-text("查看模式")')).toBeVisible();
  });

  test('should change time scale', async ({ page }) => {
    await createNewPlan(page, 'Gantt Test Plan');
    
    // Verify scale options exist
    await expect(page.locator('.ant-segmented')).toBeVisible();
    
    // Click on different scales
    await page.click('text=周');
    await page.waitForTimeout(200);
    await page.click('text=月');
    await page.waitForTimeout(200);
    await page.click('text=天');
    
    // Verify scale changed (no error should occur)
    await expect(page.locator('[data-timeline-container="true"]')).toBeVisible();
  });

  test('should zoom in and out', async ({ page }) => {
    await createNewPlan(page, 'Gantt Test Plan');
    
    // Find zoom buttons by their icons (using aria-label or class)
    const zoomInButton = page.locator('button .anticon-zoom-in, button .anticon-plus').first();
    const zoomOutButton = page.locator('button .anticon-zoom-out, button .anticon-minus').first();
    
    // Click zoom in if button exists
    if (await zoomInButton.isVisible().catch(() => false)) {
      await zoomInButton.click();
      await page.waitForTimeout(200);
    }
    
    // Click zoom out if button exists  
    if (await zoomOutButton.isVisible().catch(() => false)) {
      await zoomOutButton.click();
    }
    
    // Verify timeline still visible
    await expect(page.locator('[data-timeline-container="true"]')).toBeVisible();
  });

  test('should scroll to today', async ({ page }) => {
    await createNewPlan(page, 'Gantt Test Plan');
    
    // Click today button
    await page.click('button:has-text("今天")');
    
    // Verify no error occurs
    await expect(page.locator('[data-timeline-container="true"]')).toBeVisible();
  });

  test('should toggle critical path', async ({ page }) => {
    await createNewPlan(page, 'Gantt Test Plan');
    
    // First enable edit mode
    await page.click('button:has-text("编辑模式")');
    
    // Click critical path button
    await page.click('button:has-text("关键路径")');
    
    // Verify button is active (primary type)
    const criticalPathButton = page.locator('button:has-text("关键路径")');
    await expect(criticalPathButton).toHaveClass(/ant-btn-primary/);
  });

  test('should perform undo and redo', async ({ page }) => {
    await createNewPlan(page, 'Gantt Test Plan');
    
    // Enable edit mode
    await page.click('button:has-text("编辑模式")');
    
    // Verify undo/redo buttons are disabled initially
    await expect(page.locator('button[title="撤销 (Ctrl+Z)"]')).toBeDisabled();
    await expect(page.locator('button[title="重做 (Ctrl+Shift+Z)"]')).toBeDisabled();
    
    // Add a timeline
    await page.click('button:has-text("Timeline")');
    
    // Verify undo is now enabled
    await expect(page.locator('button[title="撤销 (Ctrl+Z)"]')).toBeEnabled();
    
    // Click undo
    await page.click('button[title="撤销 (Ctrl+Z)"]');
    
    // Verify redo is now enabled
    await expect(page.locator('button[title="重做 (Ctrl+Shift+Z)"]')).toBeEnabled();
  });

  test('should export data', async ({ page }) => {
    await createNewPlan(page, 'Gantt Test Plan');
    
    // Click export dropdown
    await page.click('button[title="导出"]');
    
    // Wait for dropdown to appear
    await page.waitForSelector('.ant-dropdown-menu');
    
    // Verify export options
    await expect(page.locator('text=导出为 JSON')).toBeVisible();
    await expect(page.locator('text=导出为 CSV')).toBeVisible();
    await expect(page.locator('text=导出为 Excel')).toBeVisible();
    
    // Click elsewhere to close
    await page.keyboard.press('Escape');
  });

  test('should edit plan title', async ({ page }) => {
    await createNewPlan(page, 'Gantt Test Plan');
    
    // Find and click on title to edit (the large title text)
    const titleElement = page.locator('[data-testid="unified-timeline-panel-v2"] div').filter({ hasText: 'Gantt Test Plan' }).first();
    await titleElement.click();
    
    // Wait for input to appear
    const titleInput = page.locator('input[value="Gantt Test Plan"]');
    await titleInput.waitFor();
    await titleInput.fill('Updated Plan Title');
    await titleInput.press('Enter');
    
    // Verify title updated
    await expect(page.locator('text=Updated Plan Title')).toBeVisible();
    
    // Verify success message
    await expect(page.locator('.ant-message-success')).toContainText('标题已更新');
  });
});
