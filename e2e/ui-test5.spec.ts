import { test, expect } from '@playwright/test';

test('TimePlan 详情页面测试 - 30秒等待', async ({ page }) => {
  // 登录
  await page.goto('http://localhost:9082/login');
  await page.fill('input[placeholder="用户名或邮箱"]', 'testuser');
  await page.fill('input[placeholder="密码"]', 'Test123!@#');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  
  // 点击进入 Orion X 项目
  await page.click('text=Orion X');
  
  // 等待 30 秒
  await page.waitForTimeout(30000);
  
  // 截图
  await page.screenshot({ path: '/tmp/test5-detail.png', fullPage: true });
  
  console.log('等待完成');
});
