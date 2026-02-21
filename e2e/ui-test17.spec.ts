import { test, expect } from '@playwright/test';

test('TimePlan 详情页面测试 - 最终修复', async ({ page }) => {
  let loadPlanCallCount = 0;
  let loadPlansCallCount = 0;
  
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('Loading plan:')) {
      loadPlanCallCount++;
    }
    if (text.includes('Loading plans')) {
      loadPlansCallCount++;
    }
  });
  
  // 登录
  await page.goto('http://localhost:9082/login');
  await page.fill('input[placeholder="用户名或邮箱"]', 'testuser');
  await page.fill('input[placeholder="密码"]', 'Test123!@#');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  
  console.log(`After login - loadPlans calls: ${loadPlansCallCount}, loadPlan calls: ${loadPlanCallCount}`);
  
  // 点击项目
  await page.click('text=Orion X');
  await page.waitForTimeout(15000);
  
  console.log(`After detail - loadPlans calls: ${loadPlansCallCount}, loadPlan calls: ${loadPlanCallCount}`);
  
  await page.screenshot({ path: '/tmp/test17-detail.png' });
  
  // 检查内容是否显示
  const hasLoading = await page.locator('text=加载项目中...').isVisible().catch(() => false);
  const timelineVisible = await page.locator('.timeline-panel, [data-testid="timeline-panel"]').first().isVisible().catch(() => false);
  
  console.log(`Has loading: ${hasLoading}, Timeline visible: ${timelineVisible}`);
  
  // 期望 loadPlan 只被调用几次（而不是几百次）
  expect(loadPlanCallCount).toBeLessThan(10);
  expect(loadPlansCallCount).toBeLessThan(5);
});
