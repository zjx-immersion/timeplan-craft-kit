import { test, expect } from '@playwright/test';
import { createNewPlan, clearLocalStorage, ensureLoggedIn } from './helpers';

/**
 * Project List Page E2E Tests
 * Tests for the project listing and management
 */

test.describe.configure({ mode: 'serial' });

test.describe('Project List', () => {
  
  test.beforeEach(async ({ page }) => {
    await ensureLoggedIn(page);
    await clearLocalStorage(page);
  });

  test('should display project list page', async ({ page }) => {
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Verify page title - use more flexible selector
    await expect(page.getByRole('heading', { name: 'Time Plan' }).first()).toBeVisible({ timeout: 10000 });
    
    // Verify subtitle
    await expect(page.getByText('管理和查看所有项目计划').first()).toBeVisible();
    
    // Verify search input
    await expect(page.locator('input[placeholder*="搜索"]').first()).toBeVisible();
    
    // Verify new plan button
    await expect(page.getByRole('button', { name: '新建计划' })).toBeVisible();
  });

  test('should create new project', async ({ page }) => {
    // Click new plan button
    await page.click('button:has-text("新建计划")');
    
    // Verify modal opens
    await expect(page.locator('.ant-modal-title:has-text("新建项目")')).toBeVisible();
    
    // Fill form
    await page.fill('input[placeholder*="项目名称"]', 'My New Plan');
    await page.fill('input[placeholder*="负责人"]', 'Test Owner');
    await page.fill('textarea[placeholder*="项目描述"]', 'This is a test description');
    
    // Submit
    await page.click('.ant-modal-footer button.ant-btn-primary');
    
    // Verify redirect to plan detail page
    await expect(page.locator('[data-testid="unified-timeline-panel-v2"]')).toBeVisible();
    
    // Verify plan title is displayed
    await expect(page.locator('text=My New Plan')).toBeVisible();
  });

  test('should display existing projects', async ({ page }) => {
    // Verify at least one project exists (from test data or previously created)
    // Check for table rows or project list items
    await expect(page.locator('table tbody tr').first()).toBeVisible();
  });

  test('should search projects', async ({ page }) => {
    // Create a project first
    await createNewPlan(page, 'Searchable Plan');
    
    // Go back to list - click the back arrow button in the top left
    await page.click('.ant-btn-text .anticon-arrow-left');
    await page.waitForTimeout(500);
    
    // Search for the project
    await page.fill('input[placeholder*="搜索计划名称"]', 'Searchable');
    await page.waitForTimeout(300);
    
    // Verify project is found (use first() to handle multiple matches)
    await expect(page.locator('text=Searchable Plan').first()).toBeVisible();
  });

  test('should edit project', async ({ page }) => {
    // Create a project first
    await createNewPlan(page, 'Editable Plan');
    
    // Go back to list - click the back arrow button in the top left
    await page.click('.ant-btn-text .anticon-arrow-left');
    await page.waitForTimeout(500);
    
    // Click more actions menu
    await page.locator('button .anticon-more, button:has(.anticon-more)').first().click();
    
    // Wait for dropdown and click edit
    await page.waitForSelector('.ant-dropdown-menu');
    await page.click('text=编辑');
    
    // Verify edit modal opens
    await expect(page.locator('.ant-modal-title:has-text("编辑项目")')).toBeVisible();
    
    // Modify name
    const nameInput = page.locator('input[placeholder*="项目名称"]');
    await nameInput.clear();
    await nameInput.fill('Updated Plan Name');
    
    // Save
    await page.click('.ant-modal-footer button.ant-btn-primary');
    
    // Verify updated name appears in list
    await expect(page.locator('text=Updated Plan Name')).toBeVisible();
  });

  test('should delete project', async ({ page }) => {
    // Create a project first
    await createNewPlan(page, 'Deletable Plan');
    
    // Go back to list - click the back arrow button in the top left
    await page.click('.ant-btn-text .anticon-arrow-left');
    await page.waitForTimeout(500);
    
    // Click more actions menu
    await page.locator('button .anticon-more, button:has(.anticon-more)').first().click();
    
    // Wait for dropdown and click delete
    await page.waitForSelector('.ant-dropdown-menu');
    await page.click('text=删除');
    
    // Confirm deletion in modal - click the red delete button (second button in footer)
    await page.locator('.ant-modal-confirm-btns button').nth(1).click();
    
    // Verify success message - look for text containing '已删除' in any success message
    await expect(page.locator('.ant-message-success:has-text("已删除")')).toBeVisible();
  });
});
