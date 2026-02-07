/**
 * 自动截图脚本
 */

import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://localhost:9082';
const SCREENSHOT_DIR = path.join(__dirname, '../../prds/screenshots');

// 确保目录存在
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('╔═══════════════════════════════════════════════════╗');
  console.log('║   TimePlan Craft Kit - 自动截图工具            ║');
  console.log('║   全屏模式 (1920x1080)                         ║');
  console.log('╚═══════════════════════════════════════════════════╝\n');

  console.log('🚀 启动浏览器...\n');

  const browser = await chromium.launch({
    headless: false,  // 显示浏览器
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();

  try {
    // 1. 项目列表
    console.log('1️⃣ 截取项目列表...');
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await sleep(1500);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '01-项目列表页面-全屏.png'),
      fullPage: true,
    });
    console.log('✅ 保存: 01-项目列表页面-全屏.png\n');

    // 2. 甘特图
    console.log('2️⃣ 截取甘特图视图...');
    await page.locator('text=工程效能计划').first().click();
    await page.waitForLoadState('networkidle');
    await sleep(2000);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '02-甘特图视图-全屏.png'),
      fullPage: true,
    });
    console.log('✅ 保存: 02-甘特图视图-全屏.png\n');

    // 3. 迭代视图
    console.log('3️⃣ 截取迭代规划视图...');
    await page.locator('label').filter({ hasText: '迭代' }).click();
    await sleep(2000);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '03-迭代视图-主界面-全屏.png'),
      fullPage: true,
    });
    console.log('✅ 保存: 03-迭代视图-主界面-全屏.png\n');

    // 4. 迭代卡片
    console.log('4️⃣ 截取迭代卡片详情...');
    const cards = page.locator('.ant-card');
    const cardCount = await cards.count();
    console.log(`   找到 ${cardCount} 个卡片`);
    if (cardCount > 0) {
      await cards.first().screenshot({
        path: path.join(SCREENSHOT_DIR, '04-迭代卡片详情.png'),
      });
      console.log('✅ 保存: 04-迭代卡片详情.png\n');
    } else {
      console.log('⚠️ 未找到卡片（可能没有数据）\n');
    }

    // 5. 表格视图
    console.log('5️⃣ 截取表格视图...');
    await page.locator('label').filter({ hasText: '表格' }).click();
    await sleep(1500);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '05-表格视图-全屏.png'),
      fullPage: true,
    });
    console.log('✅ 保存: 05-表格视图-全屏.png\n');

    // 6. 矩阵视图
    console.log('6️⃣ 截取矩阵视图...');
    await page.locator('label').filter({ hasText: '矩阵' }).click();
    await sleep(1500);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '06-矩阵视图-全屏.png'),
      fullPage: true,
    });
    console.log('✅ 保存: 06-矩阵视图-全屏.png\n');

    // 7. 工具栏
    console.log('7️⃣ 截取工具栏特写...');
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '07-工具栏特写.png'),
      clip: { x: 0, y: 0, width: 1920, height: 120 },
    });
    console.log('✅ 保存: 07-工具栏特写.png\n');

    // 8. 视图切换器
    console.log('8️⃣ 截取视图切换器特写...');
    await page.locator('label').filter({ hasText: '迭代' }).click();
    await sleep(500);
    const switcher = page.locator('.ant-segmented').first();
    if (await switcher.isVisible()) {
      await switcher.screenshot({
        path: path.join(SCREENSHOT_DIR, '08-视图切换器.png'),
      });
      console.log('✅ 保存: 08-视图切换器.png\n');
    }

    // 汇总
    console.log('=' + '='.repeat(60));
    console.log('🎉 截图任务全部完成！\n');
    console.log('📂 截图目录: ' + SCREENSHOT_DIR + '\n');
    
    const files = fs.readdirSync(SCREENSHOT_DIR).filter(f => f.endsWith('.png'));
    console.log(`📸 共生成 ${files.length} 张截图:\n`);
    
    files.forEach((file, index) => {
      const stats = fs.statSync(path.join(SCREENSHOT_DIR, file));
      const sizeInKB = (stats.size / 1024).toFixed(2);
      console.log(`   ${index + 1}. ${file} (${sizeInKB} KB)`);
    });
    console.log('\n' + '='.repeat(60) + '\n');

  } catch (error) {
    console.error('\n❌ 截图失败:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
}

// 执行
main().catch(console.error);
