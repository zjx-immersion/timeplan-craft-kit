import { test, expect } from '@playwright/test';

test('TimePlan 完整流程测试', async ({ page }) => {
  // 1. 访问登录页面
  await page.goto('http://localhost:9082/login');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/tmp/test-01-login.png' });
  
  // 2. 登录
  await page.fill('input[placeholder="用户名或邮箱"]', 'testuser');
  await page.fill('input[placeholder="密码"]', 'Test123!@#');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: '/tmp/test-02-list.png' });
  
  // 3. 点击进入 Orion X 项目
  await page.click('text=Orion X');
  await page.waitForTimeout(5000);
  await page.screenshot({ path: '/tmp/test-03-detail.png', fullPage: false });
  
  console.log('所有截图完成');
});
