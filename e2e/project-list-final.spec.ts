import { test, expect } from '@playwright/test';

/**
 * Project List Page E2E Tests - Final Version
 */

test.describe.configure({ mode: 'serial' });

test.describe('Project List', () => {
  
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    if (page.url().includes('/login')) {
      await page.locator('input[type="text"]').first().fill('testuser');
      await page.locator('input[type="password"]').first().fill('Test123!@#');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);
    }
  });

  test('should display project list page', async ({ page }) => {
    // 验证页面标题
    await expect(page.locator('h3').filter({ hasText: /Time Plan/i })).toBeVisible();
    
    // 验证副标题
    await expect(page.locator('text=管理和查看所有项目计划')).toBeVisible();
    
    // 验证搜索输入
    await expect(page.locator('input[placeholder*="搜索"]').first()).toBeVisible();
    
    // 验证新建计划按钮
    await expect(page.locator('button:has-text("新建计划")')).toBeVisible();
  });

  test('should create new project', async ({ page }) => {
    const testPlanName = 'E2E Test Plan ' + Date.now();
    
    // 点击新建按钮
    await page.click('button:has-text("新建计划")');
    await page.waitForSelector('.ant-modal', { timeout: 10000 });
    await page.waitForTimeout(500);
    
    // 填写表单
    const modal = page.locator('.ant-modal');
    await modal.locator('input').first().fill(testPlanName);
    
    // 提交
    await modal.locator('button.ant-btn-primary').last().click();
    
    // 等待页面跳转（通过URL变化判断）
    await page.waitForTimeout(5000);
    
    // 验证URL变化（应该跳转到详情页）
    const finalUrl = page.url();
    console.log('Final URL:', finalUrl);
    expect(finalUrl).toMatch(/\/[a-f0-9-]{36}$/); // UUID pattern
    
    // 验证页面加载（检查主要内容区域存在）
    const hasContent = await page.locator('body').textContent().then(t => t.length > 100);
    expect(hasContent).toBe(true);
    
    // 检查没有显示错误
    const hasError = await page.locator('.ant-result-404, .ant-result-error').count() > 0;
    expect(hasError).toBe(false);
  });

  test('should display existing projects', async ({ page }) => {
    // 等待页面加载
    await page.waitForTimeout(1000);
    
    // 验证页面有表格或列表
    const hasTable = await page.locator('.ant-table').count() > 0;
    expect(hasTable).toBe(true);
    
    // 验证至少有一行数据（应该有一个E2E测试计划）
    const rowCount = await page.locator('.ant-table-row').count();
    console.log(`Found ${rowCount} rows`);
    expect(rowCount).toBeGreaterThan(0);
  });

  test('should search projects', async ({ page }) => {
    // 搜索"E2E"
    await page.locator('input[placeholder*="搜索"]').first().fill('E2E');
    await page.waitForTimeout(500);
    
    // 验证表格内容
    const tableText = await page.locator('.ant-table').textContent() || '';
    expect(tableText).toContain('E2E');
  });

  test('should edit project', async ({ page }) => {
    const newName = 'Edited Plan ' + Date.now();
    
    // 点击更多按钮
    await page.locator('button').filter({ has: page.locator('.anticon-more') }).first().click();
    await page.waitForTimeout(500);
    
    // 点击编辑
    await page.click('text=编辑');
    await page.waitForSelector('.ant-modal', { timeout: 10000 });
    
    // 修改名称
    const modal = page.locator('.ant-modal');
    const input = modal.locator('input').first();
    await input.clear();
    await input.fill(newName);
    
    // 保存
    await modal.locator('button.ant-btn-primary').last().click();
    
    // 验证更新（名称应该出现在列表中）
    await page.waitForTimeout(1000);
    const tableText = await page.locator('.ant-table').textContent() || '';
    expect(tableText).toContain(newName);
  });

  test('should delete project', async ({ page }) => {
    // 获取当前第一行计划的名称
    const firstRowName = await page.locator('.ant-table-row').first().textContent() || '';
    console.log('Deleting plan:', firstRowName.substring(0, 30));
    
    // 点击更多按钮
    await page.locator('button').filter({ has: page.locator('.anticon-more') }).first().click();
    await page.waitForTimeout(500);
    
    // 点击删除
    await page.click('text=删除');
    await page.waitForTimeout(500);
    
    // 确认删除
    await page.locator('.ant-modal-confirm-btns button').last().click();
    
    // 验证成功消息
    await expect(page.locator('.ant-message-success, .ant-message').filter({ hasText: /删除|成功/ })).toBeVisible({ timeout: 10000 });
  });
});
