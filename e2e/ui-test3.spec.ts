import { test, expect } from '@playwright/test';

test('TimePlan 详情页面测试 - 捕获控制台错误', async ({ page }) => {
  // 捕获控制台错误
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
      console.log('Console Error:', msg.text());
    }
  });
  
  // 登录
  await page.goto('http://localhost:9082/login');
  await page.fill('input[placeholder="用户名或邮箱"]', 'testuser');
  await page.fill('input[placeholder="密码"]', 'Test123!@#');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  
  // 点击进入 Orion X 项目
  await page.click('text=Orion X');
  await page.waitForTimeout(10000); // 等待 10 秒
  
  // 截图
  await page.screenshot({ path: '/tmp/test3-detail.png' });
  
  console.log('Console errors count:', errors.length);
});
