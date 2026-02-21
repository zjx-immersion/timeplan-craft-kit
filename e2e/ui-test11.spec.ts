import { test, expect } from '@playwright/test';

test('TimePlan 详情页面测试 - localStorage 诊断', async ({ page }) => {
  // 登录并进入详情页
  await page.goto('http://localhost:9082/login');
  await page.fill('input[placeholder="用户名或邮箱"]', 'testuser');
  await page.fill('input[placeholder="密码"]', 'Test123!@#');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  
  await page.click('text=Orion X');
  await page.waitForTimeout(15000);
  
  // 获取 localStorage 状态
  const state = await page.evaluate(() => {
    const storage = localStorage.getItem('timeplan-storage-with-api');
    if (storage) {
      return JSON.parse(storage);
    }
    return null;
  });
  
  console.log('=== localStorage State ===');
  console.log('Has currentPlan:', !!state?.currentPlan);
  console.log('Plan title:', state?.currentPlan?.title);
  console.log('Timelines count:', state?.currentPlan?.timelines?.length);
  console.log('State keys:', Object.keys(state || {}));
  
  // 获取页面上的 Spin 组件
  const spinVisible = await page.locator('.ant-spin').isVisible().catch(() => false);
  console.log('Spin visible:', spinVisible);
  
  // 检查 HTML 内容
  const bodyHTML = await page.locator('body').innerHTML();
  console.log('Body contains TimelinePanel:', bodyHTML.includes('TimelinePanel'));
  console.log('Body contains timeline-container:', bodyHTML.includes('timeline-container'));
  
  await page.screenshot({ path: '/tmp/test11-detail.png', fullPage: true });
});
