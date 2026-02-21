import { test, expect } from '@playwright/test';

/**
 * 测试失败分析 - 找出所有不稳定的选择器
 */

test.describe('Failure Analysis', () => {
  
  test('analyze page structure', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // 登录
    if (page.url().includes('/login')) {
      await page.locator('input[type="text"]').first().fill('testuser');
      await page.locator('input[type="password"]').first().fill('Test123!@#');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);
    }
    
    console.log('\n=== Page Structure Analysis ===');
    console.log('URL:', page.url());
    console.log('Title:', await page.title());
    
    // 分析h3元素
    const h3Elements = await page.locator('h3').all();
    console.log(`\nFound ${h3Elements.length} h3 elements:`);
    for (let i = 0; i < h3Elements.length; i++) {
      const text = await h3Elements[i].textContent();
      console.log(`  ${i}: "${text}"`);
    }
    
    // 分析按钮
    const buttons = await page.locator('button').all();
    console.log(`\nFound ${buttons.length} buttons:`);
    for (let i = 0; i < Math.min(buttons.length, 10); i++) {
      const text = await buttons[i].textContent();
      const visible = await buttons[i].isVisible().catch(() => false);
      console.log(`  ${i}: "${text?.substring(0, 30)}" - visible: ${visible}`);
    }
    
    // 分析表格
    const tables = await page.locator('.ant-table').all();
    console.log(`\nFound ${tables.length} tables`);
    
    // 分析行
    const rows = await page.locator('.ant-table-row').all();
    console.log(`Found ${rows.length} table rows`);
    
    // 截图分析
    await page.screenshot({ path: '/tmp/page-analysis.png', fullPage: true });
    console.log('\nScreenshot saved to /tmp/page-analysis.png');
  });

  test('analyze create flow', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // 登录
    if (page.url().includes('/login')) {
      await page.locator('input[type="text"]').first().fill('testuser');
      await page.locator('input[type="password"]').first().fill('Test123!@#');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);
    }
    
    console.log('\n=== Create Flow Analysis ===');
    
    // 点击新建
    console.log('Clicking 新建计划...');
    await page.click('button:has-text("新建计划")');
    await page.waitForTimeout(1000);
    
    // 分析Modal
    const modal = page.locator('.ant-modal');
    const modalCount = await modal.count();
    console.log(`Modal count: ${modalCount}`);
    
    if (modalCount > 0) {
      const modalHtml = await modal.first().innerHTML();
      console.log('Modal HTML preview:', modalHtml.substring(0, 500));
      
      // 分析Modal内的输入框
      const inputs = await modal.locator('input').all();
      console.log(`Found ${inputs.length} inputs in modal`);
      for (let i = 0; i < inputs.length; i++) {
        const placeholder = await inputs[i].getAttribute('placeholder');
        const type = await inputs[i].getAttribute('type');
        console.log(`  Input ${i}: type=${type}, placeholder="${placeholder}"`);
      }
    }
    
    // 填写表单
    await modal.locator('input').first().fill('Analysis Test Plan');
    console.log('Filled first input');
    
    // 点击提交
    console.log('Clicking submit...');
    await modal.locator('button.ant-btn-primary').last().click();
    
    // 等待并观察
    await page.waitForTimeout(5000);
    
    console.log('Final URL:', page.url());
    
    // 检查页面内容
    const bodyText = await page.locator('body').textContent();
    console.log('Body text preview:', bodyText?.substring(0, 200));
    
    await page.screenshot({ path: '/tmp/create-flow-analysis.png', fullPage: true });
    console.log('Screenshot saved to /tmp/create-flow-analysis.png');
  });
});
