/**
 * 矩阵V3测试辅助函数
 * 
 * @version 1.0.0
 * @date 2026-02-12
 */

import { Page, Locator, expect } from '@playwright/test';

// 测试数据常量
export const TEST_CONFIG = {
  baseUrl: 'http://localhost:9082',
  testPlanId: 'orion-x-2026-full-v3',
  timeouts: {
    navigation: 10000,
    action: 10000,
    test: 60000,
  },
} as const;

// 选择器常量
export const SELECTORS = {
  // 导航
  matrixButton: 'button:has-text("矩阵")',
  matrixV3Option: 'text=矩阵 V3 (Timeline × 里程碑)',
  
  // 矩阵
  matrixTable: '.ant-table',
  milestoneCell: '[data-testid="milestone-cell-content"]',
  gatewayCell: '[data-testid="gateway-cell-content"]',
  
  // 里程碑元素
  milestoneIcon: '[data-testid="milestone-icon"]',
  sstsCount: '[data-testid="ssts-count"]',
  deliverableVersion: '[data-testid="deliverable-version"]',
  vehicleNodes: '[data-testid="vehicle-nodes"]',
  
  // 门禁元素
  gatewayIcon: '[data-testid="gateway-icon"]',
  gatewayType: '[data-testid="gateway-type"]',
  checkItemProgress: '[data-testid="checkitem-progress"]',
  gatewayStatus: '[data-testid="gateway-status"]',
  progressBar: '.ant-progress',
  
  // 对话框
  milestoneDialog: '[data-testid="milestone-detail-dialog"]',
  gatewayDialog: '[data-testid="gateway-detail-dialog"]',
  dialogTitle: '.ant-modal-title',
  dialogClose: '.ant-modal-close',
  
  // 对话框内元素
  sstsList: '[data-testid="ssts-list"]',
  deliverablesTimeline: '[data-testid="deliverables-timeline"]',
  checkItemsList: '[data-testid="checkitems-list"]',
  progressOverview: '[data-testid="progress-overview"]',
  
  // Tooltip
  tooltip: '.ant-tooltip',
} as const;

/**
 * 导航到矩阵视图
 */
export async function navigateToMatrixView(page: Page): Promise<void> {
  await page.goto(`/${TEST_CONFIG.testPlanId}`);
  await page.waitForLoadState('networkidle');
  
  // 等待页面加载
  await expect(page.locator('text=Orion X')).toBeVisible({ timeout: TEST_CONFIG.timeouts.navigation });
  
  // 打开矩阵下拉菜单
  const matrixButton = page.locator(SELECTORS.matrixButton);
  await expect(matrixButton).toBeVisible();
  await matrixButton.click();
  
  // 选择矩阵V3
  const matrixV3Option = page.locator(SELECTORS.matrixV3Option);
  await expect(matrixV3Option).toBeVisible();
  await matrixV3Option.click();
  
  // 等待矩阵加载
  await page.waitForTimeout(1000);
  await expect(page.locator(SELECTORS.matrixTable)).toBeVisible();
}

/**
 * 获取里程碑单元格
 */
export function getMilestoneCell(page: Page, index: number = 0): Locator {
  return page.locator(SELECTORS.milestoneCell).nth(index);
}

/**
 * 获取门禁单元格
 */
export function getGatewayCell(page: Page, index: number = 0): Locator {
  return page.locator(SELECTORS.gatewayCell).nth(index);
}

/**
 * 打开里程碑详情对话框
 */
export async function openMilestoneDialog(page: Page, index: number = 0): Promise<void> {
  const cell = getMilestoneCell(page, index);
  await cell.click();
  await page.waitForTimeout(500);
  await expect(page.locator(SELECTORS.milestoneDialog)).toBeVisible();
}

/**
 * 打开门禁详情对话框
 */
export async function openGatewayDialog(page: Page, index: number = 0): Promise<void> {
  const cell = getGatewayCell(page, index);
  await cell.click();
  await page.waitForTimeout(500);
  await expect(page.locator(SELECTORS.gatewayDialog)).toBeVisible();
}

/**
 * 关闭当前对话框
 */
export async function closeDialog(page: Page): Promise<void> {
  const closeButton = page.locator(SELECTORS.dialogClose);
  await closeButton.click();
  await page.waitForTimeout(300);
}

/**
 * 验证里程碑单元格内容
 */
export async function verifyMilestoneCellContent(cell: Locator): Promise<void> {
  // 验证图标
  await expect(cell.locator(SELECTORS.milestoneIcon)).toBeVisible();
  
  // 验证SSTS数量
  await expect(cell.locator(SELECTORS.sstsCount)).toBeVisible();
  const sstsText = await cell.locator(SELECTORS.sstsCount).textContent();
  expect(sstsText).toMatch(/\d+个SSTS/);
}

/**
 * 验证门禁单元格内容
 */
export async function verifyGatewayCellContent(cell: Locator): Promise<void> {
  // 验证图标
  await expect(cell.locator(SELECTORS.gatewayIcon)).toBeVisible();
  
  // 验证类型
  await expect(cell.locator(SELECTORS.gatewayType)).toBeVisible();
  
  // 验证进度
  await expect(cell.locator(SELECTORS.checkItemProgress)).toBeVisible();
  const progressText = await cell.locator(SELECTORS.checkItemProgress).textContent();
  expect(progressText).toMatch(/\d+\/\d+通过/);
  
  // 验证进度条
  await expect(cell.locator(SELECTORS.progressBar)).toBeVisible();
  
  // 验证状态
  await expect(cell.locator(SELECTORS.gatewayStatus)).toBeVisible();
}

/**
 * 验证里程碑详情对话框
 */
export async function verifyMilestoneDialog(page: Page): Promise<void> {
  const dialog = page.locator(SELECTORS.milestoneDialog);
  await expect(dialog).toBeVisible();
  
  // 验证标题
  const title = await page.locator(SELECTORS.dialogTitle).textContent();
  expect(title).toContain('🎯');
  
  // 验证SSTS列表
  await expect(page.locator(SELECTORS.sstsList)).toBeVisible();
}

/**
 * 验证门禁详情对话框
 */
export async function verifyGatewayDialog(page: Page): Promise<void> {
  const dialog = page.locator(SELECTORS.gatewayDialog);
  await expect(dialog).toBeVisible();
  
  // 验证标题
  const title = await page.locator(SELECTORS.dialogTitle).textContent();
  expect(title).toContain('🚪');
  
  // 验证检查项列表
  await expect(page.locator(SELECTORS.checkItemsList)).toBeVisible();
  
  // 验证进度概览
  await expect(page.locator(SELECTORS.progressOverview)).toBeVisible();
}

/**
 * 截图并保存
 */
export async function takeScreenshot(page: Page, name: string): Promise<void> {
  await page.screenshot({
    path: `./e2e/matrix-v3/screenshots/${name}.png`,
    fullPage: false,
  });
}

/**
 * 等待Tooltip出现
 */
export async function waitForTooltip(page: Page): Promise<void> {
  await page.waitForTimeout(500);
  await expect(page.locator(SELECTORS.tooltip)).toBeVisible();
}

/**
 * 获取单元格类型
 */
export async function getCellType(cell: Locator): Promise<'milestone' | 'gateway' | 'empty'> {
  if (await cell.locator(SELECTORS.milestoneIcon).count() > 0) {
    return 'milestone';
  }
  if (await cell.locator(SELECTORS.gatewayIcon).count() > 0) {
    return 'gateway';
  }
  return 'empty';
}

/**
 * 获取表格所有行
 */
export function getTableRows(page: Page): Locator {
  return page.locator(SELECTORS.matrixTable).locator('tbody tr');
}

/**
 * 获取表格单元格
 */
export function getTableCell(page: Page, row: number, col: number): Locator {
  return getTableRows(page).nth(row).locator('td').nth(col);
}
