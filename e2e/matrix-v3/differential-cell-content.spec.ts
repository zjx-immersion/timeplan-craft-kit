/**
 * 矩阵V3 - 差异化单元格内容显示功能测试
 * 
 * 测试目标：验证里程碑和门禁列在单元格中显示不同的内容
 * 
 * @version 1.0.0
 * @date 2026-02-12
 */

import { test, expect, Page } from '@playwright/test';

// 测试数据常量
const TEST_PLAN_URL = '/orion-x-2026-full-v3';
const MATRIX_BUTTON_TEXT = '矩阵';
const MATRIX_V3_BUTTON_TEXT = '矩阵 V3';

// 选择器常量 - 使用data-testid便于维护
const SELECTORS = {
  // 导航
  matrixButton: '[data-testid="matrix-view-button"]',
  matrixDropdown: '[data-testid="matrix-dropdown"]',
  
  // 矩阵表格
  matrixTable: '.ant-table',
  matrixCell: '[data-testid="matrix-cell"]',
  milestoneCell: '[data-testid="milestone-cell-content"]',
  gatewayCell: '[data-testid="gateway-cell-content"]',
  
  // 里程碑单元格元素
  milestoneIcon: '[data-testid="milestone-icon"]',
  sstsCount: '[data-testid="ssts-count"]',
  deliverableVersion: '[data-testid="deliverable-version"]',
  vehicleNodes: '[data-testid="vehicle-nodes"]',
  
  // 门禁单元格元素
  gatewayIcon: '[data-testid="gateway-icon"]',
  gatewayType: '[data-testid="gateway-type"]',
  checkItemProgress: '[data-testid="checkitem-progress"]',
  gatewayStatus: '[data-testid="gateway-status"]',
  progressBar: '.ant-progress',
  
  // Tooltip
  tooltip: '.ant-tooltip',
  tooltipContent: '.ant-tooltip-content',
  
  // 详情对话框
  milestoneDialog: '[data-testid="milestone-detail-dialog"]',
  gatewayDialog: '[data-testid="gateway-detail-dialog"]',
  dialogTitle: '.ant-modal-title',
  dialogClose: '.ant-modal-close',
  
  // 对话框内元素
  sstsList: '[data-testid="ssts-list"]',
  deliverablesTimeline: '[data-testid="deliverables-timeline"]',
  checkItemsList: '[data-testid="checkitems-list"]',
  progressOverview: '[data-testid="progress-overview"]',
};

/**
 * 导航到矩阵视图
 */
async function navigateToMatrixView(page: Page): Promise<void> {
  // 访问测试计划
  await page.goto(TEST_PLAN_URL);
  await page.waitForLoadState('networkidle');
  
  // 等待页面加载完成
  await expect(page.locator('text=Orion X 智能驾驶平台')).toBeVisible({ timeout: 10000 });
  
  // 点击矩阵按钮打开下拉菜单
  const matrixButton = page.locator('button:has-text("矩阵")');
  await expect(matrixButton).toBeVisible();
  await matrixButton.click();
  
  // 选择矩阵V3
  const matrixV3Option = page.locator('text=矩阵 V3 (Timeline × 里程碑)');
  await expect(matrixV3Option).toBeVisible();
  await matrixV3Option.click();
  
  // 等待矩阵视图加载
  await page.waitForTimeout(1000);
  await expect(page.locator(SELECTORS.matrixTable)).toBeVisible();
}

/**
 * 获取单元格内容类型
 */
async function getCellType(page: Page, row: number, col: number): Promise<'milestone' | 'gateway' | 'empty'> {
  const cell = page.locator(SELECTORS.matrixTable).locator('tbody tr').nth(row).locator('td').nth(col);
  
  if (await cell.locator('[data-testid="milestone-icon"]').count() > 0) {
    return 'milestone';
  }
  if (await cell.locator('[data-testid="gateway-icon"]').count() > 0) {
    return 'gateway';
  }
  return 'empty';
}

test.describe('矩阵V3 - 差异化单元格内容显示', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToMatrixView(page);
  });

  test.describe('里程碑单元格显示', () => {
    test('应显示里程碑图标', async ({ page }) => {
      // 找到第一个里程碑列的单元格
      const milestoneCells = page.locator('[data-testid="milestone-cell-content"]').first();
      await expect(milestoneCells).toBeVisible();
      
      // 验证图标存在
      const icon = milestoneCells.locator('[data-icon="flag"]');
      await expect(icon).toBeVisible();
    });

    test('应显示SSTS数量', async ({ page }) => {
      const milestoneCell = page.locator('[data-testid="milestone-cell-content"]').first();
      await expect(milestoneCell).toBeVisible();
      
      // 验证包含"SSTS"文本
      const sstsText = milestoneCell.locator('text=/\\d+个SSTS/');
      await expect(sstsText).toBeVisible();
    });

    test('应显示交付版本（如果有）', async ({ page }) => {
      const milestoneCell = page.locator('[data-testid="milestone-cell-content"]').first();
      
      // 检查是否有版本标签
      const versionTag = milestoneCell.locator('.ant-tag');
      const count = await versionTag.count();
      
      if (count > 0) {
        // 验证版本格式
        const versionText = await versionTag.textContent();
        expect(versionText).toMatch(/v\d+\.\d+/);
      }
    });

    test('应显示车型节点（如果有）', async ({ page }) => {
      const milestoneCell = page.locator('[data-testid="milestone-cell-content"]').first();
      
      // 检查是否包含车型节点文本
      const hasVehicleNodes = await milestoneCell.locator('text=/E\d+/').count() > 0;
      
      if (hasVehicleNodes) {
        const vehicleText = await milestoneCell.locator('text=/E\d+/').textContent();
        expect(vehicleText).toMatch(/E\d+/);
      }
    });

    test('悬浮应显示详细Tooltip', async ({ page }) => {
      const milestoneCell = page.locator('[data-testid="milestone-cell-content"]').first();
      
      // 悬浮触发Tooltip
      await milestoneCell.hover();
      
      // 等待Tooltip出现
      await page.waitForTimeout(500);
      
      // 验证Tooltip包含SSTS列表信息
      const tooltip = page.locator(SELECTORS.tooltip);
      await expect(tooltip).toBeVisible();
      
      const tooltipContent = await tooltip.textContent();
      expect(tooltipContent).toContain('里程碑详情');
    });
  });

  test.describe('门禁单元格显示', () => {
    test('应显示门禁图标', async ({ page }) => {
      // 找到第一个门禁列的单元格
      const gatewayCells = page.locator('[data-testid="gateway-cell-content"]').first();
      await expect(gatewayCells).toBeVisible();
      
      // 验证图标存在
      const icon = gatewayCells.locator('[data-icon="safety"]');
      await expect(icon).toBeVisible();
    });

    test('应显示门禁类型', async ({ page }) => {
      const gatewayCell = page.locator('[data-testid="gateway-cell-content"]').first();
      await expect(gatewayCell).toBeVisible();
      
      // 验证包含门禁类型文本
      const typeText = gatewayCell.locator('text=/门禁$/');
      await expect(typeText).toBeVisible();
    });

    test('应显示检查项进度', async ({ page }) => {
      const gatewayCell = page.locator('[data-testid="gateway-cell-content"]').first();
      await expect(gatewayCell).toBeVisible();
      
      // 验证包含"通过"文本
      const progressText = gatewayCell.locator('text=/\\d+/\\d+通过/');
      await expect(progressText).toBeVisible();
      
      // 验证进度条存在
      const progressBar = gatewayCell.locator(SELECTORS.progressBar);
      await expect(progressBar).toBeVisible();
    });

    test('应显示整体状态标签', async ({ page }) => {
      const gatewayCell = page.locator('[data-testid="gateway-cell-content"]').first();
      
      // 验证状态标签存在
      const statusTag = gatewayCell.locator('.ant-tag');
      const count = await statusTag.count();
      expect(count).toBeGreaterThan(0);
      
      // 验证状态文本
      const statusText = await statusTag.textContent();
      const validStatuses = ['已通过', '审核中', '待决策', '未通过'];
      expect(validStatuses).toContain(statusText);
    });

    test('悬浮应显示详细Tooltip', async ({ page }) => {
      const gatewayCell = page.locator('[data-testid="gateway-cell-content"]').first();
      
      // 悬浮触发Tooltip
      await gatewayCell.hover();
      
      // 等待Tooltip出现
      await page.waitForTimeout(500);
      
      // 验证Tooltip包含门禁详情
      const tooltip = page.locator(SELECTORS.tooltip);
      await expect(tooltip).toBeVisible();
      
      const tooltipContent = await tooltip.textContent();
      expect(tooltipContent).toContain('门禁详情');
    });
  });

  test.describe('详情对话框交互', () => {
    test('点击里程碑单元格应打开里程碑详情对话框', async ({ page }) => {
      const milestoneCell = page.locator('[data-testid="milestone-cell-content"]').first();
      
      // 点击单元格
      await milestoneCell.click();
      
      // 等待对话框出现
      await page.waitForTimeout(500);
      
      // 验证里程碑对话框打开
      const dialog = page.locator(SELECTORS.milestoneDialog).or(page.locator('.ant-modal:has-text("里程碑")'));
      await expect(dialog).toBeVisible();
      
      // 验证对话框标题包含"里程碑"
      const title = page.locator(SELECTORS.dialogTitle);
      const titleText = await title.textContent();
      expect(titleText).toContain('🎯');
    });

    test('点击门禁单元格应打开门禁详情对话框', async ({ page }) => {
      const gatewayCell = page.locator('[data-testid="gateway-cell-content"]').first();
      
      // 点击单元格
      await gatewayCell.click();
      
      // 等待对话框出现
      await page.waitForTimeout(500);
      
      // 验证门禁对话框打开
      const dialog = page.locator(SELECTORS.gatewayDialog).or(page.locator('.ant-modal:has-text("门禁")'));
      await expect(dialog).toBeVisible();
      
      // 验证对话框标题包含"门禁"
      const title = page.locator(SELECTORS.dialogTitle);
      const titleText = await title.textContent();
      expect(titleText).toContain('🚪');
    });

    test('里程碑详情对话框应显示SSTS列表', async ({ page }) => {
      const milestoneCell = page.locator('[data-testid="milestone-cell-content"]').first();
      await milestoneCell.click();
      await page.waitForTimeout(500);
      
      // 验证对话框包含SSTS列表标题
      const sstsSection = page.locator('text=SSTS需求列表');
      await expect(sstsSection).toBeVisible();
    });

    test('里程碑详情对话框应显示交付物时间线', async ({ page }) => {
      const milestoneCell = page.locator('[data-testid="milestone-cell-content"]').first();
      await milestoneCell.click();
      await page.waitForTimeout(500);
      
      // 验证对话框包含车型节点交付物
      const deliverablesSection = page.locator('text=车型节点');
      
      // 只有当有车型节点数据时才验证
      if (await deliverablesSection.count() > 0) {
        await expect(deliverablesSection).toBeVisible();
      }
    });

    test('门禁详情对话框应显示检查项列表', async ({ page }) => {
      const gatewayCell = page.locator('[data-testid="gateway-cell-content"]').first();
      await gatewayCell.click();
      await page.waitForTimeout(500);
      
      // 验证对话框包含检查项列表
      const checkItemsSection = page.locator('text=检查项列表');
      await expect(checkItemsSection).toBeVisible();
    });

    test('门禁详情对话框应显示进度概览', async ({ page }) => {
      const gatewayCell = page.locator('[data-testid="gateway-cell-content"]').first();
      await gatewayCell.click();
      await page.waitForTimeout(500);
      
      // 验证对话框包含进度条
      const progressSection = page.locator('text=检查项完成进度');
      await expect(progressSection).toBeVisible();
    });

    test('应能通过关闭按钮关闭对话框', async ({ page }) => {
      const milestoneCell = page.locator('[data-testid="milestone-cell-content"]').first();
      await milestoneCell.click();
      await page.waitForTimeout(500);
      
      // 验证对话框打开
      const dialog = page.locator('.ant-modal');
      await expect(dialog).toBeVisible();
      
      // 点击关闭按钮
      const closeButton = page.locator(SELECTORS.dialogClose);
      await closeButton.click();
      
      // 验证对话框关闭
      await expect(dialog).not.toBeVisible();
    });
  });

  test.describe('矩阵列类型验证', () => {
    test('里程碑列头应显示里程碑图标', async ({ page }) => {
      // 查找包含🎯的列头
      const milestoneHeader = page.locator('th:has-text("🎯")').first();
      await expect(milestoneHeader).toBeVisible();
    });

    test('门禁列头应显示门禁图标', async ({ page }) => {
      // 查找包含🚪的列头
      const gatewayHeader = page.locator('th:has-text("🚪")').first();
      await expect(gatewayHeader).toBeVisible();
    });

    test('同一列的所有单元格应显示相同类型内容', async ({ page }) => {
      // 获取表格所有行
      const rows = page.locator(SELECTORS.matrixTable).locator('tbody tr');
      const rowCount = await rows.count();
      
      // 检查第一列（排除Timeline名称列）
      let firstDataColType: 'milestone' | 'gateway' | null = null;
      
      for (let i = 0; i < Math.min(rowCount, 3); i++) {
        const cell = rows.nth(i).locator('td').nth(1); // 第二列是第一数据列
        
        if (await cell.locator('[data-icon="flag"]').count() > 0) {
          if (firstDataColType === null) firstDataColType = 'milestone';
          expect(firstDataColType).toBe('milestone');
        } else if (await cell.locator('[data-icon="safety"]').count() > 0) {
          if (firstDataColType === null) firstDataColType = 'gateway';
          expect(firstDataColType).toBe('gateway');
        }
      }
    });
  });

  test.describe('向后兼容性', () => {
    test('空数据单元格应显示占位符', async ({ page }) => {
      // 查找包含"-"的单元格
      const emptyCells = page.locator('td:has-text("-")');
      
      // 只要有一个空单元格就验证
      if (await emptyCells.count() > 0) {
        const emptyCell = emptyCells.first();
        await expect(emptyCell).toBeVisible();
      }
    });

    test('缺失数据的单元格应正常显示', async ({ page }) => {
      // 所有可见的单元格都应该能正常渲染
      const cells = page.locator(SELECTORS.matrixTable).locator('tbody td');
      const cellCount = await cells.count();
      
      // 验证至少有一些单元格
      expect(cellCount).toBeGreaterThan(0);
      
      // 验证每个单元格都有内容
      for (let i = 0; i < Math.min(cellCount, 10); i++) {
        const cell = cells.nth(i);
        await expect(cell).toBeVisible();
      }
    });
  });
});

/**
 * 截图测试 - 用于视觉回归
 */
test.describe('视觉回归测试', () => {
  test('里程碑单元格截图', async ({ page }) => {
    await navigateToMatrixView(page);
    
    const milestoneCell = page.locator('[data-testid="milestone-cell-content"]').first();
    await milestoneCell.scrollIntoViewIfNeeded();
    
    // 截图验证
    await expect(milestoneCell).toHaveScreenshot('milestone-cell.png', {
      threshold: 0.2,
    });
  });

  test('门禁单元格截图', async ({ page }) => {
    await navigateToMatrixView(page);
    
    const gatewayCell = page.locator('[data-testid="gateway-cell-content"]').first();
    await gatewayCell.scrollIntoViewIfNeeded();
    
    // 截图验证
    await expect(gatewayCell).toHaveScreenshot('gateway-cell.png', {
      threshold: 0.2,
    });
  });
});
