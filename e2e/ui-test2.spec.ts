import { test, expect } from '@playwright/test';

test('TimePlan 完整流程测试 - 延长等待时间', async ({ page }) => {
  // 1. 访问登录页面
  await page.goto('http://localhost:9082/login');
  await page.waitForTimeout(2000);
  
  // 2. 登录 - 填写表单
  await page.fill('input[placeholder="用户名或邮箱"]', 'testuser');
  await page.fill('input[placeholder="密码"]', 'Test123!@#');
  await page.click('button[type="submit"]');
  
  // 等待登录完成并跳转
  await page.waitForTimeout(5000);
  await page.screenshot({ path: '/tmp/test2-02-after-login.png' });
  
  // 检查当前 URL
  const url = page.url();
  console.log('Current URL:', url);
  
  // 3. 如果登录成功，应该能看到 TimePlan 列表
  if (url.includes('/login')) {
    console.log('登录失败，仍在登录页面');
    return;
  }
  
  // 等待列表加载
  await page.waitForTimeout(3000);
  await page.screenshot({ path: '/tmp/test2-03-list.png' });
  
  // 4. 点击进入 Orion X 项目
  await page.click('text=Orion X');
  await page.waitForTimeout(8000);
  await page.screenshot({ path: '/tmp/test2-04-detail.png' });
});
