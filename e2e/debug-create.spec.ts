import { test, expect } from '@playwright/test';

test('debug create plan flow', async ({ page }) => {
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
  
  console.log('After login URL:', page.url());
  
  // 点击新建
  await page.click('button:has-text("新建")');
  await page.waitForTimeout(1000);
  
  console.log('After click new, modal exists:', await page.locator('.ant-modal').count() > 0);
  
  // 填写表单
  const modal = page.locator('.ant-modal');
  await modal.locator('input').first().fill('Debug Test Plan');
  await page.waitForTimeout(500);
  
  // 点击提交
  await modal.locator('button.ant-btn-primary').last().click();
  
  // 等待并观察
  await page.waitForTimeout(5000);
  
  console.log('Final URL:', page.url());
  console.log('Page title:', await page.title());
  
  // 截图
  await page.screenshot({ path: '/tmp/debug-screenshot.png', fullPage: true });
  console.log('Screenshot saved');
});
