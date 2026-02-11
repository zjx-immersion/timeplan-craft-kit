# E2E 测试套件

基于 Phase2-测试指南 设计的 Playwright 端到端测试。

## 快速开始

### 1. 安装依赖
```bash
pnpm install
```

### 2. 确保应用运行
```bash
pnpm run dev
# 应用将在 http://localhost:9082 运行
```

### 3. 运行测试
```bash
# 运行所有测试
pnpm exec playwright test

# 运行特定测试文件
pnpm exec playwright test e2e/gantt-view.spec.ts

# 运行带调试输出
pnpm exec playwright test --debug

# 生成 HTML 报告
pnpm exec playwright test --reporter=html
pnpm exec playwright show-report
```

## 测试文件说明

| 文件 | 描述 | 测试用例数 |
|------|------|-----------|
| `gantt-view.spec.ts` | 甘特图视图功能测试 | 9 |
| `matrix-view.spec.ts` | 矩阵视图功能测试 (基于测试指南) | 12 |
| `table-view.spec.ts` | 表格视图功能测试 | 5 |
| `other-views.spec.ts` | 其他视图测试 | 7 |
| `project-list.spec.ts` | 项目列表管理测试 | 6 |

## 测试覆盖功能

### 矩阵视图 (基于测试指南)
- ✅ 基础功能 (视图切换、初始化数据)
- ✅ Product 管理 (CRUD)
- ✅ Team 管理 (CRUD、成员管理)
- ✅ 矩阵表格显示、统计卡片、热力图
- ✅ 视图切换 (V1/V2)
- ✅ 数据持久化

### 甘特图视图
- ✅ 编辑模式切换
- ✅ 时间刻度切换
- ✅ 缩放功能
- ✅ 撤销/重做
- ✅ 关键路径
- ✅ 数据导出

### 项目列表
- ✅ 创建项目
- ✅ 编辑项目
- ✅ 删除项目
- ✅ 搜索过滤

## 技术说明

- **测试框架**: Playwright
- **浏览器**: Chromium
- **配置**: `playwright.config.ts`
- **辅助函数**: `helpers.ts`

## 注意事项

1. 测试会清理 localStorage，请确保不要在生产环境运行
2. 应用需要预先运行在 localhost:9082
3. 部分测试因预置示例数据可能需要调整
