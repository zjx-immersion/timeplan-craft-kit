import { test, expect } from '@playwright/test';

test('TimePlan 详情页面测试 - 网络日志', async ({ page }) => {
  const networkLogs: string[] = [];
  
  page.on('response', response => {
    const url = response.url();
    const status = response.status();
    if (url.includes('/api/v1/')) {
      networkLogs.push(`${status} ${url}`);
    }
  });
  
  // 登录
  await page.goto('http://localhost:9082/login', { waitUntil: 'networkidle' });
  await page.fill('input[placeholder="用户名或邮箱"]', 'testuser');
  await page.fill('input[placeholder="密码"]', 'Test123!@#');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(5000);
  
  // 点击进入 Orion X 项目
  await page.click('text=Orion X');
  await page.waitForTimeout(15000);
  
  console.log('=== Network Logs ===');
  networkLogs.forEach(log => console.log(log));
  
  // 截图
  await page.screenshot({ path: '/tmp/test8-detail.png' });
});
