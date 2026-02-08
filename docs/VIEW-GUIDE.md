# 视图切换指南

## 问题说明

之前的更改针对的是**版本对比视图**（Version Table View），而用户截图中看到的是**表格视图**（Table View）。这是两个不同的视图！

## 视图说明

### 1. 表格视图（Table）
- **入口**: 点击工具栏中的"表格"按钮 (TableOutlined图标)
- **组件**: `src/components/views/TableView.tsx`
- **功能**: 显示所有Timeline和Line的列表，支持搜索、筛选、排序
- **当前状态**: 未添加"类型"列

### 2. 版本对比视图（Version）
- **入口**: 点击工具栏中的"版本"按钮 (HistoryOutlined图标)
- **组件**: `src/components/views/VersionTableView.tsx`
- **功能**: 对比两个版本的差异，显示变更的任务
- **V11.3更新**: 
  - ✅ "任务"重命名为"计划单元"
  - ✅ 移除"状态"列
  - ✅ 显示类型、依赖关系、时长

### 3. 迭代视图（Iteration）
- **入口**: 点击工具栏中的"迭代"按钮 (BlockOutlined图标)
- **组件**: `src/components/views/IterationView.tsx` 或 `src/components/iteration/IterationView.tsx`
- **功能**: 按迭代/Sprint组织任务，显示容量和负载
- **当前状态**: 未显示依赖关系连线

### 4. 甘特图视图（Gantt）
- **入口**: 点击工具栏中的"甘特图"按钮 (BarChartOutlined图标)
- **组件**: `src/components/timeline/TimelinePanel.tsx`
- **功能**: 可视化时间线和依赖关系
- **当前状态**: 应该已显示OrionX的MR拆解和依赖连线

## 如何查看V11.3的更改？

### 方式1: 切换到版本对比视图
1. 打开OrionX计划详情页
2. 点击工具栏的"版本"按钮
3. 选择两个版本进行对比
4. 查看类型、依赖关系、时长列

### 方式2: 在甘特图中查看MR拆解
1. 打开OrionX计划详情页（确保是`orion-x-2026-full-v3`或`v4`）
2. 保持在甘特图视图
3. 查看E0架构、视觉感知、行为决策等Timeline
4. 应该能看到拆分的MR节点和它们之间的依赖连线

## 待修复事项

1. **表格视图（Table）**需要添加：
   - ✅ "类型"列（lineplan/milestone/gateway）
   - ✅ "依赖关系"列
   - ✅ "时长"列

2. **迭代视图（Iteration）**需要：
   - 显示MR之间的依赖关系
   - 可视化依赖网络

## OrionX数据状态

- ✅ 已导出到 `allTimePlans.ts`
- ✅ 数据v4包含MR拆解（12个新MR）
- ✅ 包含12+个内部依赖关系
- ✅ 添加了module和productLine属性
