import { test, expect } from '@playwright/test';

test('analyze detail page loading', async ({ page }) => {
  // 先创建一个计划获取ID
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  if (page.url().includes('/login')) {
    await page.locator('input[type="text"]').first().fill('testuser');
    await page.locator('input[type="password"]').first().fill('Test123!@#');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
  }
  
  // 创建计划
  await page.click('button:has-text("新建计划")');
  await page.waitForSelector('.ant-modal');
  await page.locator('.ant-modal input').first().fill('Detail Test Plan');
  await page.locator('.ant-modal button.ant-btn-primary').last().click();
  await page.waitForTimeout(3000);
  
  const url = page.url();
  const planId = url.split('/').pop();
  console.log('Plan ID:', planId);
  
  // 重新加载详情页
  console.log('\n=== Reloading detail page ===');
  await page.goto(`/${planId}`);
  await page.waitForLoadState('networkidle');
  
  // 等待一段时间让页面加载
  await page.waitForTimeout(5000);
  
  console.log('URL after reload:', page.url());
  console.log('Page title:', await page.title());
  
  // 检查页面内容
  const bodyContent = await page.locator('body').innerHTML();
  console.log('\nBody content preview:');
  console.log(bodyContent.substring(0, 1500));
  
  // 检查是否有错误
  const errorElements = await page.locator('.ant-result-404, .ant-result-error, .ant-alert-error').count();
  console.log(`\nError elements found: ${errorElements}`);
  
  // 检查加载状态
  const loadingElements = await page.locator('.ant-spin, .ant-skeleton').count();
  console.log(`Loading elements found: ${loadingElements}`);
  
  // 分析关键元素
  console.log('\n=== Key Elements Analysis ===');
  
  // 检查 UnifiedTimelinePanelV2
  const panel = await page.locator('[data-testid="unified-timeline-panel-v2"]').count();
  console.log(`UnifiedTimelinePanelV2: ${panel}`);
  
  // 检查计划标题
  const planTitle = await page.locator('text=Detail Test Plan').count();
  console.log(`Plan title visible: ${planTitle}`);
  
  // 检查是否有时间线相关内容
  const timelineContent = await page.locator('.timeline, [class*="timeline"]').count();
  console.log(`Timeline elements: ${timelineContent}`);
  
  // 收集API调用
  const apiCalls: any[] = [];
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('localhost:8000')) {
      apiCalls.push({
        url: url.replace('http://localhost:8000', ''),
        status: response.status()
      });
    }
  });
  
  // 再次刷新触发API调用
  await page.reload();
  await page.waitForTimeout(3000);
  
  console.log('\n=== API Calls ===');
  const uniqueCalls = [...new Set(apiCalls.map(c => `${c.method || 'GET'} ${c.url}`))];
  uniqueCalls.slice(0, 20).forEach((call, i) => {
    console.log(`${i + 1}. ${call}`);
  });
});
