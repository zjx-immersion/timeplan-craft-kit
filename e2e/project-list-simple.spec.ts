import { test, expect } from '@playwright/test';

/**
 * Project List Page E2E Tests - Simplified Version
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
    // 点击新建按钮
    await page.click('button:has-text("新建计划")');
    await page.waitForSelector('.ant-modal', { timeout: 10000 });
    await page.waitForTimeout(500);
    
    // 填写表单
    const modal = page.locator('.ant-modal');
    await modal.locator('input').first().fill('My New Test Plan');
    await modal.locator('input[placeholder*="负责人"]').first().fill('Test Owner');
    
    // 提交
    await modal.locator('button.ant-btn-primary').last().click();
    
    // 等待页面跳转（通过URL变化判断）
    const startUrl = page.url();
    await page.waitForFunction((url) => window.location.href !== url, startUrl, { timeout: 15000 });
    await page.waitForTimeout(2000);
    
    // 验证URL变化
    const finalUrl = page.url();
    expect(finalUrl).not.toBe(startUrl);
    expect(finalUrl).toMatch(/\/[a-f0-9-]{36}$/); // UUID pattern
    
    // 验证页面内容（检查页面标题或主要内容区域）
    await expect(page.locator('text=My New Test Plan').first()).toBeVisible({ timeout: 10000 });
  });

  test('should display existing projects', async ({ page }) => {
    // 验证页面有内容（表格行或卡片）
    await page.waitForTimeout(1000);
    
    const rowCount = await page.locator('.ant-table-row, .ant-list-item, [class*="plan"]').count();
    console.log(`Found ${rowCount} plan items`);
    
    // 至少应该有一个测试计划
    expect(rowCount).toBeGreaterThan(0);
  });

  test('should search projects', async ({ page }) => {
    // 搜索
    await page.locator('input[placeholder*="搜索"]').first().fill('E2E');
    await page.waitForTimeout(500);
    
    // 验证搜索结果
    const hasResults = await page.locator('text=E2E').first().isVisible().catch(() => false);
    expect(hasResults).toBe(true);
  });

  test('should edit project', async ({ page }) => {
    // 点击更多按钮（第一个项目）
    await page.locator('button').filter({ has: page.locator('.anticon-more') }).first().click();
    await page.waitForTimeout(500);
    
    // 点击编辑
    await page.click('text=编辑');
    await page.waitForSelector('.ant-modal', { timeout: 10000 });
    
    // 修改名称
    const modal = page.locator('.ant-modal');
    const input = modal.locator('input').first();
    await input.clear();
    await input.fill('Updated Plan Name');
    
    // 保存
    await modal.locator('button.ant-btn-primary').last().click();
    
    // 验证更新
    await expect(page.locator('text=Updated Plan Name').first()).toBeVisible({ timeout: 10000 });
  });

  test('should delete project', async ({ page }) => {
    // 创建一个可删除的计划
    await page.click('button:has-text("新建计划")');
    await page.waitForSelector('.ant-modal', { timeout: 10000 });
    await page.locator('.ant-modal input').first().fill('To Be Deleted');
    await page.locator('.ant-modal button.ant-btn-primary').last().click();
    await page.waitForTimeout(3000);
    
    // 返回列表
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // 找到并删除
    const rows = page.locator('.ant-table-row, [class*="plan-item"]');
    const count = await rows.count();
    
    if (count > 0) {
      // 点击最后一个项目的更多按钮
      await rows.last().locator('button').filter({ has: page.locator('.anticon-more') }).click();
      await page.waitForTimeout(500);
      
      // 点击删除
      await page.click('text=删除');
      await page.waitForTimeout(500);
      
      // 确认删除
      await page.locator('.ant-modal-confirm-btns button').last().click();
      
      // 验证成功消息
      await expect(page.locator('.ant-message-success, .ant-message').filter({ hasText: /删除|成功/ })).toBeVisible({ timeout: 10000 });
    }
  });
});
