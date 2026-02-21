import { test, expect } from '@playwright/test';

/**
 * Smoke Test - 前后端集成冒烟测试
 * 验证关键API调用链路
 */

test.describe('Smoke Test - Integration', () => {
  
  test('should verify complete API chain', async ({ page, request }) => {
    const apiCalls: any[] = [];
    
    // 监听API请求
    page.on('requestfinished', async (req) => {
      const url = req.url();
      if (url.includes('localhost:8000')) {
        const response = await req.response();
        apiCalls.push({
          method: req.method(),
          url: url.replace('http://localhost:8000', ''),
          status: response?.status()
        });
      }
    });
    
    // 1. 访问首页
    console.log('Step 1: Navigate to home');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // 2. 登录
    console.log('Step 2: Login');
    if (page.url().includes('/login')) {
      await page.locator('input[type="text"]').first().fill('testuser');
      await page.locator('input[type="password"]').first().fill('Test123!@#');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);
    }
    
    // 3. 验证首页加载
    console.log('Step 3: Verify home page');
    await expect(page.locator('h3').filter({ hasText: /Time Plan/i })).toBeVisible();
    
    // 4. 创建计划
    console.log('Step 4: Create plan');
    await page.click('button:has-text("新建计划")');
    await page.waitForSelector('.ant-modal');
    await page.locator('.ant-modal input').first().fill('Smoke Test Plan');
    await page.locator('.ant-modal button.ant-btn-primary').last().click();
    await page.waitForTimeout(3000);
    
    // 5. 验证跳转
    console.log('Step 5: Verify navigation');
    const finalUrl = page.url();
    expect(finalUrl).toMatch(/\/[a-f0-9-]{36}$/);
    
    // 6. 打印API调用
    console.log('\n=== API Calls ===');
    apiCalls.forEach((call, i) => {
      console.log(`${i+1}. ${call.method} ${call.url} -> ${call.status}`);
    });
    
    // 验证关键API被调用
    const hasGetPlans = apiCalls.some(c => c.url === '/api/v1/plans' && c.method === 'GET');
    const hasCreatePlan = apiCalls.some(c => c.url === '/api/v1/plans' && c.method === 'POST');
    const hasGetPlanDetail = apiCalls.some(c => c.url.match(/\/api\/v1\/plans\/[a-f0-9-]+$/));
    
    expect(hasGetPlans || hasGetPlanDetail).toBe(true);
    
    console.log('\n✅ Smoke test passed!');
  });

  test('should verify all critical API endpoints', async ({ request }) => {
    // 直接测试API端点
    console.log('Testing API endpoints directly...');
    
    // 1. 登录
    const login = await request.post('http://localhost:8000/api/v1/auth/login', {
      data: { username: 'testuser', password: 'Test123!@#' }
    });
    expect(login.ok()).toBe(true);
    const { access_token } = await login.json();
    
    // 2. 测试各个端点
    const endpoints = [
      { url: '/api/v1/auth/me', method: 'GET' },
      { url: '/api/v1/plans', method: 'GET' },
      { url: '/api/v1/timeplans', method: 'GET' },
    ];
    
    for (const ep of endpoints) {
      const response = await request.fetch(`http://localhost:8000${ep.url}`, {
        method: ep.method,
        headers: { 'Authorization': `Bearer ${access_token}` }
      });
      console.log(`${ep.method} ${ep.url}: ${response.status()} ${response.ok() ? '✅' : '❌'}`);
      expect(response.ok()).toBe(true);
    }
    
    console.log('\n✅ All endpoints test passed!');
  });
});
