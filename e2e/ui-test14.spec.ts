import { test, expect } from '@playwright/test';

test('TimePlan 详情页面测试 - 修复无限循环', async ({ page }) => {
  let loadPlanCallCount = 0;
  
  page.on('request', request => {
    if (request.url().includes('/timeplans/') && request.url().includes('/timelines')) {
      loadPlanCallCount++;
    }
  });
  
  page.on('console', msg => {
    if (msg.text().includes('loadPlan')) {
      console.log(`[${msg.type()}] ${msg.text()}`);
    }
  });
  
  // 登录并进入详情页
  await page.goto('http://localhost:9082/login');
  await page.fill('input[placeholder="用户名或邮箱"]', 'testuser');
  await page.fill('input[placeholder="密码"]', 'Test123!@#');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  
  await page.click('text=Orion X');
  await page.waitForTimeout(10000);
  
  console.log(`loadPlan API calls: ${loadPlanCallCount}`);
  
  await page.screenshot({ path: '/tmp/test14-detail.png' });
  
  // 检查是否显示内容而不是加载中
  const hasLoading = await page.locator('text=加载项目中...').isVisible().catch(() => false);
  const hasTimeline = await page.locator('.timeline-panel').count();
  
  console.log(`Has loading: ${hasLoading}, Timeline panels: ${hasTimeline}`);
});
