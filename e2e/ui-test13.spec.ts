import { test, expect } from '@playwright/test';

test('TimePlan 详情页面测试 - loading 状态诊断', async ({ page }) => {
  let loadPlanCallCount = 0;
  
  // 拦截所有请求
  page.on('request', request => {
    if (request.url().includes('/api/v1/timeplans/') && request.url().includes('/timelines')) {
      loadPlanCallCount++;
      console.log(`Timeline API call #${loadPlanCallCount}:`, request.url());
    }
  });
  
  page.on('console', msg => {
    if (msg.text().includes('loadPlan') || msg.text().includes('Loading')) {
      console.log(`[${msg.type()}] ${msg.text()}`);
    }
  });
  
  // 登录并进入详情页
  await page.goto('http://localhost:9082/login');
  await page.fill('input[placeholder="用户名或邮箱"]', 'testuser');
  await page.fill('input[placeholder="密码"]', 'Test123!@#');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  
  console.log('Before click - API calls:', loadPlanCallCount);
  
  await page.click('text=Orion X');
  await page.waitForTimeout(20000);
  
  console.log('After 20s - Total API calls:', loadPlanCallCount);
  
  // 检查多次调用问题
  await page.screenshot({ path: '/tmp/test13-detail.png' });
});
