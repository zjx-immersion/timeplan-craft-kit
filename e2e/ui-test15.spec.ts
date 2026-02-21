import { test, expect } from '@playwright/test';

test('TimePlan 详情页面测试 - 等待Vite刷新', async ({ page }) => {
  let loadPlanCallCount = 0;
  const planCalls: string[] = [];
  
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('Loading plan:')) {
      loadPlanCallCount++;
      planCalls.push(text.substring(0, 80));
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
  console.log('Calls:', planCalls.slice(0, 5));
  
  await page.screenshot({ path: '/tmp/test15-detail.png' });
});
