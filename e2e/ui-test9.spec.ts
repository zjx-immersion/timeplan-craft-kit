import { test, expect } from '@playwright/test';

test('TimePlan 详情页面测试 - 诊断', async ({ page }) => {
  // 监听控制台日志
  page.on('console', msg => {
    console.log(`[${msg.type()}] ${msg.text()}`);
  });
  
  // 登录并进入详情页
  await page.goto('http://localhost:9082/login');
  await page.fill('input[placeholder="用户名或邮箱"]', 'testuser');
  await page.fill('input[placeholder="密码"]', 'Test123!@#');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  
  await page.click('text=Orion X');
  await page.waitForTimeout(10000);
  
  // 获取页面 HTML
  const html = await page.content();
  console.log('Page HTML length:', html.length);
  
  // 检查是否有特定文本
  const hasLoading = await page.locator('text=加载项目中').isVisible().catch(() => false);
  const hasTimeline = await page.locator('text=项目管理').isVisible().catch(() => false);
  
  console.log('Has loading spinner:', hasLoading);
  console.log('Has timeline text:', hasTimeline);
  
  await page.screenshot({ path: '/tmp/test9-detail.png' });
});
