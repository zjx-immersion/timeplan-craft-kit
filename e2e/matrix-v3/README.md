# 矩阵V3 E2E 测试

## 测试概述

本目录包含矩阵V3差异化单元格内容显示功能的端到端测试。

## 测试文件

| 文件 | 说明 |
|------|------|
| `differential-cell-content.spec.ts` | 主要测试文件，包含所有测试用例 |
| `README.md` | 本文件 |

## 测试覆盖范围

### 里程碑单元格测试
- ✅ 应显示里程碑图标
- ✅ 应显示SSTS数量
- ✅ 应显示交付版本（如果有）
- ✅ 应显示车型节点（如果有）
- ✅ 悬浮应显示详细Tooltip

### 门禁单元格测试
- ✅ 应显示门禁图标
- ✅ 应显示门禁类型
- ✅ 应显示检查项进度
- ✅ 应显示整体状态标签
- ✅ 悬浮应显示详细Tooltip

### 详情对话框测试
- ✅ 点击里程碑单元格应打开里程碑详情对话框
- ✅ 点击门禁单元格应打开门禁详情对话框
- ✅ 里程碑详情对话框应显示SSTS列表
- ✅ 里程碑详情对话框应显示交付物时间线
- ✅ 门禁详情对话框应显示检查项列表
- ✅ 门禁详情对话框应显示进度概览
- ✅ 应能通过关闭按钮关闭对话框

### 矩阵列类型验证
- ✅ 里程碑列头应显示里程碑图标
- ✅ 门禁列头应显示门禁图标
- ✅ 同一列的所有单元格应显示相同类型内容

### 向后兼容性
- ✅ 空数据单元格应显示占位符
- ✅ 缺失数据的单元格应正常显示

## 运行测试

### 前置条件
1. 开发服务器已启动: `pnpm dev`
2. 服务器运行在: `http://localhost:9082`

### 运行所有测试
```bash
npx playwright test e2e/matrix-v3/
```

### 运行特定测试文件
```bash
npx playwright test e2e/matrix-v3/differential-cell-content.spec.ts
```

### 以UI模式运行（便于调试）
```bash
npx playwright test e2e/matrix-v3/ --ui
```

### 生成报告
```bash
npx playwright test e2e/matrix-v3/ --reporter=html
```

### 更新截图基准
```bash
npx playwright test e2e/matrix-v3/ --update-snapshots
```

## 测试数据

测试使用 `orion-x-2026-full-v3` 计划数据，包含：
- 7条Timeline（产品线）
- 28个时间节点（里程碑+门禁）
- 7×28=196个矩阵单元格

## 调试技巧

1. **使用Playwright Inspector**
   ```bash
   PWDEBUG=1 npx playwright test e2e/matrix-v3/
   ```

2. **慢速模式**
   ```bash
   npx playwright test e2e/matrix-v3/ --headed --slow-mo=1000
   ```

3. **仅运行特定测试**
   ```bash
   npx playwright test -g "应显示里程碑图标"
   ```

4. **保持浏览器打开**
   ```bash
   npx playwright test e2e/matrix-v3/ --headed --workers=1
   ```

## 常见问题

### 测试超时
- 确保开发服务器已启动
- 检查 `playwright.config.ts` 中的超时配置

### 选择器失败
- 检查组件是否正确渲染
- 使用浏览器开发者工具验证data-testid

### 截图不匹配
- 更新基准截图: `npx playwright test --update-snapshots`
- 检查是否有UI变动

## 维护指南

### 添加新测试
1. 在 `differential-cell-content.spec.ts` 中添加测试用例
2. 使用 `test.describe` 组织相关测试
3. 遵循现有命名规范

### 更新选择器
1. 优先使用 `data-testid` 属性
2. 避免使用易变的选择器（如类名、XPath）
3. 在 `.playwright-mcp.yml` 中更新选择器映射

### 更新测试数据
1. 在 `.playwright-mcp.yml` 中更新 `matrixV3.testData`
2. 确保测试计划数据存在
