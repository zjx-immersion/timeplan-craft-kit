import { test, expect } from '@playwright/test';

test('TimePlan 详情页面测试 - 修正 localStorage 诊断', async ({ page }) => {
  // 登录并进入详情页
  await page.goto('http://localhost:9082/login');
  await page.fill('input[placeholder="用户名或邮箱"]', 'testuser');
  await page.fill('input[placeholder="密码"]', 'Test123!@#');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  
  await page.click('text=Orion X');
  await page.waitForTimeout(15000);
  
  // 获取 localStorage 状态（Zustand persist 结构）
  const state = await page.evaluate(() => {
    const storage = localStorage.getItem('timeplan-storage-with-api');
    if (storage) {
      const parsed = JSON.parse(storage);
      console.log('Raw storage:', parsed);
      return parsed.state || parsed;
    }
    return null;
  });
  
  console.log('=== Corrected localStorage State ===');
  console.log('State type:', typeof state);
  console.log('State keys:', state ? Object.keys(state) : 'null');
  console.log('Has currentPlan:', !!(state?.currentPlan));
  console.log('Plan title:', state?.currentPlan?.title);
  console.log('Timelines count:', state?.currentPlan?.timelines?.length);
  
  await page.screenshot({ path: '/tmp/test12-detail.png', fullPage: true });
});
