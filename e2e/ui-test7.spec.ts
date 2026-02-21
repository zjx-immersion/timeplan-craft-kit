import { test, expect } from '@playwright/test';

test('TimePlan 详情页面测试 - 强制刷新', async ({ page }) => {
  // 登录
  await page.goto('http://localhost:9082/login');
  await page.fill('input[placeholder="用户名或邮箱"]', 'testuser');
  await page.fill('input[placeholder="密码"]', 'Test123!@#');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  
  // 点击进入 Orion X 项目（强制刷新）
  await page.click('text=Orion X');
  await page.waitForTimeout(5000);
  
  // 强制刷新页面
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(10000);
  
  // 截图
  await page.screenshot({ path: '/tmp/test7-detail.png', fullPage: true });
  
  console.log('Current URL:', page.url());
});
