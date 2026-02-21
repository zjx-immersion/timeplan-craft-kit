import { test, expect } from '@playwright/test';

test('TimePlan 详情页面测试 - 捕获网络请求', async ({ page }) => {
  // 捕获网络请求
  page.route('**/*', route => {
    const url = route.request().url();
    if (url.includes('/api/v1/')) {
      console.log('API Request:', route.request().method(), url);
    }
    route.continue();
  });
  
  // 登录
  await page.goto('http://localhost:9082/login');
  await page.fill('input[placeholder="用户名或邮箱"]', 'testuser');
  await page.fill('input[placeholder="密码"]', 'Test123!@#');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  
  // 点击进入 Orion X 项目
  await page.click('text=Orion X');
  await page.waitForTimeout(15000); // 等待 15 秒
  
  // 截图
  await page.screenshot({ path: '/tmp/test4-detail.png' });
  
  // 获取当前 URL
  console.log('Current URL:', page.url());
});
