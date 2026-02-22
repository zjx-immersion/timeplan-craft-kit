import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page, request }) => {
  // First, try to register a test user via API
  const registerResponse = await request.post('http://localhost:3002/api/v1/auth/register', {
    data: {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Test123!@#',
      display_name: 'Test User'
    }
  });
  
  // User might already exist, that's okay
  console.log('Register response:', registerResponse.status());
  
  // Navigate to the app
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  // Check if login button exists
  const loginButton = page.locator('button:has-text("登录")').first();
  const isLoginVisible = await loginButton.isVisible().catch(() => false);
  
  if (isLoginVisible) {
    console.log('Performing login...');
    // Perform login
    await loginButton.click();
    
    // Wait for login modal
    await expect(page.locator('.ant-modal-title:has-text("登录")')).toBeVisible();
    
    // Fill login form with test credentials
    await page.fill('input[placeholder="用户名"]', 'testuser');
    await page.fill('input[placeholder="密码"]', 'Test123!@#');
    
    // Submit
    await page.click('.ant-modal-footer button.ant-btn-primary');
    
    // Wait for login to complete - look for user menu or logout button
    await page.waitForTimeout(2000);
    
    // Verify we're logged in by checking if login button is gone
    const stillLoginVisible = await loginButton.isVisible().catch(() => false);
    if (stillLoginVisible) {
      throw new Error('Login failed - still showing login button');
    }
  } else {
    console.log('Already logged in or no login button found');
  }
  
  // Save authentication state
  await page.context().storageState({ path: authFile });
  console.log('Authentication state saved');
});
