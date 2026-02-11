# TimePlan Craft Kit - E2E 测试汇总报告

**生成时间**: 2026-02-11  
**测试框架**: Playwright  
**浏览器**: Chromium  
**应用地址**: http://localhost:9082

---

## 📊 测试统计

| 类别 | 数量 |
|------|------|
| 总测试用例 | 39 |
| 通过 | 验证中 |
| 失败 | 验证中 |
| 跳过 | 0 |

---

## 📁 测试用例详情

### 1. 甘特图视图测试 (`gantt-view.spec.ts`) - 9个用例

| # | 测试名称 | 状态 | 说明 |
|---|---------|------|------|
| 1 | should display gantt view by default | 🔄 | 验证甘特图默认显示 |
| 2 | should toggle edit mode | 🔄 | 验证编辑模式切换 |
| 3 | should change time scale | 🔄 | 验证时间刻度切换 |
| 4 | should zoom in and out | ⚠️ | 验证缩放功能（需调整选择器） |
| 5 | should scroll to today | 🔄 | 验证定位到今天 |
| 6 | should toggle critical path | 🔄 | 验证关键路径切换 |
| 7 | should perform undo and redo | 🔄 | 验证撤销/重做 |
| 8 | should export data | 🔄 | 验证数据导出 |
| 9 | should edit plan title | 🔄 | 验证标题编辑 |

### 2. 矩阵视图测试 (`matrix-view.spec.ts`) - 12个用例

| # | 测试名称 | 状态 | 说明 |
|---|---------|------|------|
| 1.1 | should switch to matrix view | 🔄 | 切换到矩阵视图 |
| 1.2 | should initialize sample data | 🔄 | 初始化示例数据 |
| 2.1 | should view product list | 🔄 | 查看Product列表 |
| 2.2 | should create new product | 🔄 | 新建Product |
| 2.3 | should edit product | 🔄 | 编辑Product |
| 2.4 | should delete product | 🔄 | 删除Product |
| 3.1 | should view team list | 🔄 | 查看Team列表 |
| 3.2 | should create new team | 🔄 | 新建Team |
| 4.1 | should display matrix table | 🔄 | 矩阵表格显示 |
| 4.2 | should display statistics | 🔄 | 统计卡片显示 |
| 4.3 | should display heatmap legend | 🔄 | 热力图图例 |
| 5.1 | should switch between V1/V2 | 🔄 | V1/V2视图切换 |

### 3. 表格视图测试 (`table-view.spec.ts`) - 5个用例

| # | 测试名称 | 状态 | 说明 |
|---|---------|------|------|
| 1 | should display table view | 🔄 | 验证表格视图 |
| 2 | should search and filter | 🔄 | 搜索和过滤 |
| 3 | should sort columns | 🔄 | 列排序 |
| 4 | should open column settings | 🔄 | 列设置 |
| 5 | should switch between views | 🔄 | 视图切换 |

### 4. 其他视图测试 (`other-views.spec.ts`) - 7个用例

| # | 测试名称 | 状态 | 说明 |
|---|---------|------|------|
| 1 | should display version comparison | 🔄 | 版本对比视图 |
| 2 | should display version plan | 🔄 | 版本计划视图 |
| 3 | should display iteration view | 🔄 | 迭代视图 |
| 4 | should display module iteration | 🔄 | 模块规划视图 |
| 5-7 | should navigate through all views | 🔄 | 遍历所有视图 |

### 5. 项目列表测试 (`project-list.spec.ts`) - 6个用例

| # | 测试名称 | 状态 | 说明 |
|---|---------|------|------|
| 1 | should display project list page | ✅ | 项目列表页显示 |
| 2 | should create new project | ✅ | 创建新项目 |
| 3 | should display existing projects | ✅ | 显示已有项目 |
| 4 | should search projects | 🔄 | 搜索项目 |
| 5 | should edit project | 🔄 | 编辑项目 |
| 6 | should delete project | 🔄 | 删除项目 |

---

## ✅ 查看测试报告的 3 种方式

### 方式 1: 查看 HTML 报告（推荐）
```bash
cd timeplan-craft-kit

# 生成并查看 HTML 报告
pnpm exec playwright test --reporter=html
pnpm exec playwright show-report
```
报告将自动在浏览器中打开，显示：
- 测试通过率统计
- 每个测试的详细结果
- 失败测试的截图和视频
- 执行时间分析

### 方式 2: 查看列表报告（终端）
```bash
# 在终端查看简洁报告
pnpm exec playwright test --reporter=list

# 查看详细报告
pnpm exec playwright test --reporter=line
```

### 方式 3: 查看 JSON 报告
```bash
# 生成 JSON 格式报告
pnpm exec playwright test --reporter=json > test-report.json
cat test-report.json
```

---

## 📸 失败测试的截图/视频

测试失败时，Playwright 会自动保存：
- **截图**: `test-results/<test-name>/test-failed-1.png`
- **视频**: `test-results/<test-name>/video.webm`
- **追踪**: `playwright-report/data/`

---

## 🔧 常见问题

### 测试超时
```bash
# 增加超时时间
pnpm exec playwright test --timeout=120000
```

### 只运行成功的测试
```bash
# 跳过失败测试
pnpm exec playwright test --pass-with-no-tests
```

### 调试特定测试
```bash
# 带调试模式运行
pnpm exec playwright test e2e/gantt-view.spec.ts --debug
```

---

**图例说明**:
- ✅ 通过
- ❌ 失败
- 🔄 待验证/运行中
- ⚠️ 需要调整
