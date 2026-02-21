import { test, expect } from '@playwright/test';

test('TimePlan 详情页面测试 - 状态诊断', async ({ page }) => {
  // 注入脚本监听 React 状态
  await page.addInitScript(() => {
    window.addEventListener('load', () => {
      console.log('Window loaded');
    });
  });
  
  page.on('console', msg => {
    console.log(`[${msg.type()}] ${msg.text()}`);
  });
  
  // 登录并进入详情页
  await page.goto('http://localhost:9082/login');
  await page.fill('input[placeholder="用户名或邮箱"]', 'testuser');
  await page.fill('input[placeholder="密码"]', 'Test123!@#');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  
  // 获取 loading 状态
  const loadingState = await page.evaluate(() => {
    // 尝试从 localStorage 获取 Zustand 状态
    const storage = localStorage.getItem('timeplan-storage-with-api');
    if (storage) {
      const state = JSON.parse(storage);
      return {
        hasCurrentPlan: !!state.currentPlan,
        planTitle: state.currentPlan?.title,
        timelinesCount: state.currentPlan?.timelines?.length,
      };
    }
    return null;
  });
  
  console.log('Before click - Storage state:', loadingState);
  
  await page.click('text=Orion X');
  await page.waitForTimeout(15000);
  
  // 再次获取状态
  const loadingState2 = await page.evaluate(() => {
    const storage = localStorage.getItem('timeplan-storage-with-api');
    if (storage) {
      const state = JSON.parse(storage);
      return {
        hasCurrentPlan: !!state.currentPlan,
        planTitle: state.currentPlan?.title,
        timelinesCount: state.currentPlan?.timelines?.length,
      };
    }
    return null;
  });
  
  console.log('After 15s - Storage state:', loadingState2);
  
  // 检查页面是否显示 TimelinePanel 内容
  const pageText = await page.locator('body').innerText();
  console.log('Page contains "TimelinePanel":', pageText.includes('TimelinePanel'));
  console.log('Page contains "加载项目中":', pageText.includes('加载项目中'));
  console.log('Page contains "项目管理":', pageText.includes('项目管理'));
  
  await page.screenshot({ path: '/tmp/test10-detail.png' });
});
