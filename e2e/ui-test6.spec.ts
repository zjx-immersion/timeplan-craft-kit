import { test, expect } from '@playwright/test';

test('TimePlan 详情页面测试 - 检查 JS 错误', async ({ page }) => {
  const errors: string[] = [];
  const consoleLogs: string[] = [];
  
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(`[${msg.type()}] ${text}`);
    if (msg.type() === 'error') {
      errors.push(text);
    }
  });
  
  page.on('pageerror', error => {
    errors.push(`PageError: ${error.message}`);
    console.log('PageError:', error.message);
  });
  
  // 登录
  await page.goto('http://localhost:9082/login');
  await page.fill('input[placeholder="用户名或邮箱"]', 'testuser');
  await page.fill('input[placeholder="密码"]', 'Test123!@#');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  
  // 点击进入 Orion X 项目
  await page.click('text=Orion X');
  await page.waitForTimeout(10000);
  
  console.log('=== Console Logs ===');
  consoleLogs.slice(-20).forEach(log => console.log(log));
  
  console.log('=== Errors ===');
  errors.forEach(err => console.log(err));
});
