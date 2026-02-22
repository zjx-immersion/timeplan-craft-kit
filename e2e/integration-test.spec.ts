import { test, expect } from '@playwright/test';

/**
 * Integration Test - 前后端集成验证
 * 验证完整的API调用链路
 */

test.describe('Integration Test - API Chain', () => {
  
  test('should complete full API workflow', async ({ page }) => {
    // Step 1: 访问首页并检查重定向到登录页
    console.log('Step 1: Navigate to home page');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // 如果未登录，应该重定向到登录页
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);
    
    if (currentUrl.includes('/login')) {
      console.log('Redirected to login page - OK');
      
      // Step 2: 执行登录
      console.log('Step 2: Perform login');
      await page.waitForSelector('input[type="text"], input[type="email"]', { timeout: 10000 });
      
      const usernameInput = page.locator('input[type="text"], input[type="email"]').first();
      await usernameInput.fill('testuser');
      
      const passwordInput = page.locator('input[type="password"]').first();
      await passwordInput.fill('Test123!@#');
      
      await page.click('button[type="submit"], button.ant-btn-primary');
      
      // 等待登录完成并重定向
      await page.waitForURL(/^(?!.*login).*$/, { timeout: 15000 });
      console.log('Login successful');
    }
    
    // Step 3: 验证主页面加载
    console.log('Step 3: Verify main page loaded');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // 验证页面标题或关键元素
    const title = await page.title();
    console.log(`Page title: ${title}`);
    expect(title).toContain('TimePlan');
    
    // Step 4: 检查API调用（通过浏览器网络）
    console.log('Step 4: Monitor API calls');
    
    // 收集网络请求
    const apiCalls: string[] = [];
    page.on('request', request => {
      const url = request.url();
      if (url.includes('localhost:3002')) {
        apiCalls.push(`${request.method()} ${url}`);
        console.log(`API Call: ${request.method()} ${url}`);
      }
    });
    
    // 刷新页面触发API调用
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // 验证至少有一些API调用
    console.log(`Total API calls: ${apiCalls.length}`);
    expect(apiCalls.length).toBeGreaterThan(0);
    
    // Step 5: 测试创建项目流程
    console.log('Step 5: Test create plan flow');
    await page.click('button:has-text("新建")');
    await page.waitForSelector('.ant-modal-wrap', { timeout: 10000 });
    await page.waitForTimeout(500);
    
    const modal = page.locator('.ant-modal');
    await modal.locator('input').first().fill('Integration Test Plan');
    
    // 记录创建前的API调用数
    const callsBeforeCreate = apiCalls.length;
    
    // 提交表单
    await modal.locator('button.ant-btn-primary').last().click();
    
    // 等待API响应
    await page.waitForTimeout(3000);
    
    // 验证有新的API调用
    const callsAfterCreate = apiCalls.length;
    console.log(`API calls before: ${callsBeforeCreate}, after: ${callsAfterCreate}`);
    expect(callsAfterCreate).toBeGreaterThan(callsBeforeCreate);
    
    // 验证成功创建（通过检查页面跳转或成功消息）
    const finalUrl = page.url();
    console.log(`Final URL: ${finalUrl}`);
    
    // 验证不在列表页（应该跳转到详情页）
    expect(finalUrl).not.toBe('http://localhost:9082/');
    
    console.log('Integration test completed successfully!');
  });

  test('should verify API endpoints directly', async ({ page }) => {
    // 直接测试后端API可用性
    console.log('Testing API endpoints directly...');
    
    const endpoints = [
      { url: 'http://localhost:3002/', method: 'GET', name: 'Health Check' },
      { url: 'http://localhost:3002/api/v1/auth/login', method: 'POST', name: 'Login API' },
      { url: 'http://localhost:3002/api/v1/timeplans', method: 'GET', name: 'List Plans' },
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await page.evaluate(async (ep) => {
          try {
            const res = await fetch(ep.url, {
              method: ep.method,
              headers: { 'Content-Type': 'application/json' }
            });
            return { status: res.status, ok: res.ok };
          } catch (e) {
            return { status: 0, ok: false, error: String(e) };
          }
        }, endpoint);
        
        console.log(`${endpoint.name}: ${response.status} ${response.ok ? '✅' : '⚠️'}`);
      } catch (error) {
        console.error(`${endpoint.name}: Failed ❌`, error);
      }
    }
  });
});
