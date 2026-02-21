import { test, expect } from '@playwright/test';

test('TimePlan 详情页面测试 - 最终修复 v2', async ({ page }) => {
  let loadPlanCallCount = 0;
  
  page.on('console', msg => {
    if (msg.text().includes('Loading plan:')) {
      loadPlanCallCount++;
    }
  });
  
  await page.goto('http://localhost:9082/login');
  await page.fill('input[placeholder="用户名或邮箱"]', 'testuser');
  await page.fill('input[placeholder="密码"]', 'Test123!@#');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  
  await page.click('text=Orion X');
  await page.waitForTimeout(15000);
  
  console.log(`Total loadPlan calls: ${loadPlanCallCount}`);
  
  await page.screenshot({ path: '/tmp/test18-detail.png' });
  
  const hasLoading = await page.locator('text=加载项目中...').isVisible().catch(() => false);
  const hasContent = await page.locator('text=Orion X').first().isVisible().catch(() => false);
  
  console.log(`Has loading: ${hasLoading}, Has content: ${hasContent}`);
  
  expect(loadPlanCallCount).toBeLessThan(5);
});
