# 迁移任务清单

**项目**: timeplan-craft-kit (Ant Design 版本)  
**源项目**: timeline-craft-kit  
**策略**: 1:1 完全还原  
**开始日期**: 2026-01-27  

---

## 📊 总体进度

### 统计

| 分类 | 总数 | 已完成 | 进行中 | 待开始 | 完成率 |
|------|------|--------|--------|--------|--------|
| **环境配置** | 10 | 10 | 0 | 0 | 100% |
| **基础组件** | 5 | 3 | 0 | 2 | 60% |
| **页面组件** | 3 | 3 | 0 | 0 | 100% |
| **时间线组件** | 26 | 0 | 0 | 26 | 0% |
| **迭代规划组件** | 9 | 0 | 0 | 9 | 0% |
| **对话框组件** | 2 | 0 | 0 | 2 | 0% |
| **Hooks** | 5 | 0 | 0 | 5 | 0% |
| **工具函数** | 8 | 0 | 0 | 8 | 0% |
| **总计** | **68** | **16** | **0** | **52** | **24%** |

---

## ✅ 阶段 1: 环境准备 (已完成 100%)

### 1.1 项目初始化 ✅

- [x] 创建项目目录
- [x] package.json 配置
- [x] vite.config.ts 配置
- [x] tsconfig.json 配置
- [x] vitest.config.ts 配置
- [x] .gitignore 配置
- [x] index.html 入口
- [x] README.md 文档

### 1.2 主题和配置 ✅

- [x] Ant Design 主题配置 (src/theme/index.ts)
- [x] 应用入口文件 (src/main.tsx)

---

## ⏳ 阶段 2: 基础设施 (进行中 60%)

### 2.1 类型定义 ✅

- [x] timeplanSchema.ts (从原项目复制)

### 2.2 状态管理 ✅

- [x] timePlanStore.ts (Zustand Store)

### 2.3 页面组件 ✅

- [x] App.tsx (路由配置)
- [x] TimePlanList.tsx (项目列表)
- [x] Index.tsx (项目详情主页面)
- [x] NotFound.tsx (404页面)

### 2.4 通用组件 (待开发)

| 组件 | 文件 | 状态 | 负责人 | 预计工时 |
|------|------|------|--------|----------|
| Button 封装 | components/common/Button.tsx | ⬜ | - | 0.5h |
| Modal 封装 | components/common/Modal.tsx | ⬜ | - | 0.5h |
| Input 封装 | components/common/Input.tsx | ⬜ | - | 0.5h |
| Select 封装 | components/common/Select.tsx | ⬜ | - | 0.5h |
| DatePicker 封装 | components/common/DatePicker.tsx | ⬜ | - | 0.5h |

---

## 📋 阶段 3: 核心组件迁移 (0%)

### 3.1 时间线组件 - 核心容器

| 组件 | 原路径 | 新路径 | 难度 | 状态 | 负责人 | 预计工时 | 对比验证 |
|------|--------|--------|------|------|--------|----------|----------|
| TimelinePanel | timeline/TimelinePanel.tsx | components/timeline/TimelinePanel.tsx | 🔴 高 | ⬜ | - | 8h | ⬜ |
| TimelineToolbar | timeline/TimelineToolbar.tsx | components/timeline/TimelineToolbar.tsx | 🟡 中 | ⬜ | - | 3h | ⬜ |
| ViewSwitcher | timeline/ViewSwitcher.tsx | components/timeline/ViewSwitcher.tsx | 🟢 低 | ⬜ | - | 2h | ⬜ |

### 3.2 时间线组件 - 渲染器

| 组件 | 原路径 | 新路径 | 难度 | 状态 | 负责人 | 预计工时 | 对比验证 |
|------|--------|--------|------|------|--------|----------|----------|
| TimelineRow | timeline/TimelineRow.tsx | components/timeline/TimelineRow.tsx | 🟡 中 | ⬜ | - | 4h | ⬜ |
| SortableTimelineRow | timeline/SortableTimelineRow.tsx | components/timeline/SortableTimelineRow.tsx | 🟡 中 | ⬜ | - | 3h | ⬜ |
| TimelineNodeRenderer | timeline/TimelineNodeRenderer.tsx | components/timeline/TimelineNodeRenderer.tsx | 🟢 低 | ⬜ | - | 2h | ⬜ |
| TimelineBar | timeline/TimelineBar.tsx | components/timeline/TimelineBar.tsx | 🟡 中 | ⬜ | - | 4h | ⬜ |
| TimelineMilestone | timeline/TimelineMilestone.tsx | components/timeline/TimelineMilestone.tsx | 🟢 低 | ⬜ | - | 2h | ⬜ |
| TimelineGateway | timeline/TimelineGateway.tsx | components/timeline/TimelineGateway.tsx | 🟢 低 | ⬜ | - | 2h | ⬜ |
| ResizableBar | timeline/ResizableBar.tsx | components/timeline/ResizableBar.tsx | 🟡 中 | ⬜ | - | 3h | ⬜ |

### 3.3 时间线组件 - 视图

| 组件 | 原路径 | 新路径 | 难度 | 状态 | 负责人 | 预计工时 | 对比验证 |
|------|--------|--------|------|------|--------|----------|----------|
| TableView | timeline/TableView.tsx | components/timeline/TableView.tsx | 🟡 中 | ⬜ | - | 4h | ⬜ |
| MatrixView | timeline/MatrixView.tsx | components/timeline/MatrixView.tsx | 🟡 中 | ⬜ | - | 4h | ⬜ |
| VersionTableView | timeline/VersionTableView.tsx | components/timeline/VersionTableView.tsx | 🟡 中 | ⬜ | - | 3h | ⬜ |

### 3.4 时间线组件 - 辅助

| 组件 | 原路径 | 新路径 | 难度 | 状态 | 负责人 | 预计工时 | 对比验证 |
|------|--------|--------|------|------|--------|----------|----------|
| DependencyLines | timeline/DependencyLines.tsx | components/timeline/DependencyLines.tsx | 🟢 低 | ⬜ | - | 3h | ⬜ |
| TodayLine | timeline/TodayLine.tsx | components/timeline/TodayLine.tsx | 🟢 低 | ⬜ | - | 1h | ⬜ |
| BaselineMarker | timeline/BaselineMarker.tsx | components/timeline/BaselineMarker.tsx | 🟢 低 | ⬜ | - | 1h | ⬜ |
| BaselineRangeMarker | timeline/BaselineRangeMarker.tsx | components/timeline/BaselineRangeMarker.tsx | 🟢 低 | ⬜ | - | 1h | ⬜ |
| ConnectionMode | timeline/ConnectionMode.tsx | components/timeline/ConnectionMode.tsx | 🟡 中 | ⬜ | - | 2h | ⬜ |
| ConnectionPoints | timeline/ConnectionPoints.tsx | components/timeline/ConnectionPoints.tsx | 🟢 低 | ⬜ | - | 1h | ⬜ |
| DateTooltip | timeline/DateTooltip.tsx | components/timeline/DateTooltip.tsx | 🟢 低 | ⬜ | - | 1h | ⬜ |
| RelationDetailTooltip | timeline/RelationDetailTooltip.tsx | components/timeline/RelationDetailTooltip.tsx | 🟢 低 | ⬜ | - | 1h | ⬜ |

### 3.5 时间线组件 - 对话框

| 组件 | 原路径 | 新路径 | 难度 | 状态 | 负责人 | 预计工时 | 对比验证 |
|------|--------|--------|------|------|--------|----------|----------|
| NodeEditDialog | timeline/NodeEditDialog.tsx | components/timeline/NodeEditDialog.tsx | 🟡 中 | ⬜ | - | 3h | ⬜ |
| TimelineEditDialog | timeline/TimelineEditDialog.tsx | components/timeline/TimelineEditDialog.tsx | 🟡 中 | ⬜ | - | 3h | ⬜ |
| BaselineEditDialog | timeline/BaselineEditDialog.tsx | components/timeline/BaselineEditDialog.tsx | 🟡 中 | ⬜ | - | 2h | ⬜ |
| BaselineRangeEditDialog | timeline/BaselineRangeEditDialog.tsx | components/timeline/BaselineRangeEditDialog.tsx | 🟡 中 | ⬜ | - | 2h | ⬜ |
| TimelineTimeShiftDialog | timeline/TimelineTimeShiftDialog.tsx | components/timeline/TimelineTimeShiftDialog.tsx | 🟡 中 | ⬜ | - | 2h | ⬜ |

### 3.6 迭代规划组件

| 组件 | 原路径 | 新路径 | 难度 | 状态 | 负责人 | 预计工时 | 对比验证 |
|------|--------|--------|------|------|--------|----------|----------|
| IterationView | iteration/IterationView.tsx | components/iteration/IterationView.tsx | 🟡 中 | ⬜ | - | 4h | ⬜ |
| IterationMatrix | iteration/IterationMatrix.tsx | components/iteration/IterationMatrix.tsx | 🔴 高 | ⬜ | - | 6h | ⬜ |
| MRCard | iteration/MRCard.tsx | components/iteration/MRCard.tsx | 🟢 低 | ⬜ | - | 2h | ⬜ |
| MRSelectorDialog | iteration/MRSelectorDialog.tsx | components/iteration/MRSelectorDialog.tsx | 🟡 中 | ⬜ | - | 3h | ⬜ |
| MRDetailDialog | iteration/MRDetailDialog.tsx | components/iteration/MRDetailDialog.tsx | 🟢 低 | ⬜ | - | 2h | ⬜ |
| DependencyLines | iteration/DependencyLines.tsx | components/iteration/DependencyLines.tsx | 🟢 低 | ⬜ | - | 2h | ⬜ |
| IterationMarkers | iteration/IterationMarkers.tsx | components/iteration/IterationMarkers.tsx | 🟡 中 | ⬜ | - | 2h | ⬜ |
| IterationWidthSelector | iteration/IterationWidthSelector.tsx | components/iteration/IterationWidthSelector.tsx | 🟢 低 | ⬜ | - | 1h | ⬜ |
| ProductSelector | iteration/ProductSelector.tsx | components/iteration/ProductSelector.tsx | 🟢 低 | ⬜ | - | 1h | ⬜ |

### 3.7 对话框组件

| 组件 | 原路径 | 新路径 | 难度 | 状态 | 负责人 | 预计工时 | 对比验证 |
|------|--------|--------|------|------|--------|----------|----------|
| ExportDialog | dialogs/ExportDialog.tsx | components/dialogs/ExportDialog.tsx | 🟡 中 | ⬜ | - | 3h | ⬜ |
| ImportDialog | dialogs/ImportDialog.tsx | components/dialogs/ImportDialog.tsx | 🟡 中 | ⬜ | - | 3h | ⬜ |

---

## 🔧 阶段 4: Hooks 和工具函数

### 4.1 自定义 Hooks

| Hook | 原路径 | 新路径 | 状态 | 负责人 | 预计工时 |
|------|--------|--------|------|--------|----------|
| useTimelineDrag | hooks/useTimelineDrag.ts | hooks/useTimelineDrag.ts | ⬜ | - | 4h |
| useBarResize | hooks/useBarResize.ts | hooks/useBarResize.ts | ⬜ | - | 3h |
| useUndoRedo | hooks/useUndoRedo.ts | hooks/useUndoRedo.ts | ⬜ | - | 4h |
| useConnectionMode | hooks/useConnectionMode.tsx | hooks/useConnectionMode.tsx | ⬜ | - | 2h |
| useKeyboardShortcuts | hooks/useKeyboardShortcuts.ts | hooks/useKeyboardShortcuts.ts | ⬜ | - | 2h |

### 4.2 工具函数

| 函数 | 原路径 | 新路径 | 状态 | 负责人 | 预计工时 |
|------|--------|--------|------|--------|----------|
| dateUtils | utils/dateUtils.ts | utils/dateUtils.ts | ⬜ | - | 2h |
| criticalPath.v2 | utils/criticalPath.v2.ts | utils/criticalPath.ts | ⬜ | - | 3h |
| dataExport | utils/dataExport.ts | utils/dataExport.ts | ⬜ | - | 2h |
| dataImport | utils/dataImport.ts | utils/dataImport.ts | ⬜ | - | 2h |
| calculatePosition | utils/calculatePosition.ts | utils/calculatePosition.ts | ⬜ | - | 2h |
| validation | utils/validation.ts | utils/validation.ts | ⬜ | - | 1h |
| localStorage | utils/localStorage.ts | utils/localStorage.ts | ⬜ | - | 1h |
| uuid | utils/uuid.ts | utils/uuid.ts | ⬜ | - | 0.5h |

---

## ✅ 阶段 5: 对比验证 (待开始)

### 5.1 功能对比

- [ ] 项目管理 (8个功能点)
- [ ] 时间线管理 (6个功能点)
- [ ] 任务管理 (9个功能点)
- [ ] 依赖关系 (6个功能点)
- [ ] 视图功能 (6个功能点)
- [ ] 迭代规划 (8个功能点)
- [ ] 数据管理 (7个功能点)
- [ ] 交互功能 (8个功能点)

### 5.2 UI 对比

- [ ] 视觉回归测试
- [ ] 截图对比
- [ ] 布局一致性
- [ ] 样式一致性

### 5.3 数据对比

- [ ] 数据结构一致性
- [ ] LocalStorage 数据对比
- [ ] 状态管理对比
- [ ] 操作结果对比

### 5.4 性能对比

- [ ] 首屏加载时间
- [ ] 组件渲染性能
- [ ] 拖拽响应时间
- [ ] 内存占用

---

## 📅 时间计划

### 总体时间估算

| 阶段 | 工作量 | 建议人员 | 预计天数 |
|------|--------|----------|----------|
| 阶段1: 环境准备 | ✅ 已完成 | - | 0 |
| 阶段2: 基础设施 | 4h | 1人 | 0.5天 |
| 阶段3: 核心组件 | 100h | 2人 | 12.5天 |
| 阶段4: Hooks/工具 | 30h | 1人 | 3.75天 |
| 阶段5: 对比验证 | 24h | 1人 | 3天 |
| 阶段6: 修复优化 | 16h | 2人 | 2天 |
| **总计** | **174h** | **2-3人** | **22天** |

### 里程碑

| 里程碑 | 目标日期 | 交付内容 |
|--------|----------|----------|
| M1: 基础就绪 | D+1 | 基础组件、页面完成 |
| M2: 核心完成 | D+14 | 甘特图核心功能完成 |
| M3: 全功能 | D+18 | 所有组件迁移完成 |
| M4: 验证通过 | D+21 | 对比验证100%通过 |
| M5: 正式发布 | D+22 | 文档完善，正式发布 |

---

## 🎯 当前优先级

### P0 (本周必须完成)

1. [ ] 完成通用组件封装 (2h)
2. [ ] 开始 TimelinePanel 迁移 (8h)
3. [ ] 完成基础工具函数 (6h)
4. [ ] 配置对比测试环境 (2h)

### P1 (下周完成)

1. [ ] 完成时间线核心组件
2. [ ] 完成拖拽功能
3. [ ] 完成依赖关系渲染
4. [ ] 开始功能对比验证

### P2 (第三周)

1. [ ] 完成迭代规划组件
2. [ ] 完成所有对话框
3. [ ] 完成数据导入导出
4. [ ] 全面对比验证

---

## 📝 每日任务模板

### 日期: YYYY-MM-DD

#### 计划任务
- [ ] 任务1 (预计Xh)
- [ ] 任务2 (预计Xh)

#### 完成情况
- [x] 实际完成的任务1
- [x] 实际完成的任务2

#### 对比验证
- [ ] 功能对比: X/Y 通过
- [ ] UI 对比: X% 一致
- [ ] 数据对比: X/Y 通过

#### 遇到的问题
1. 问题描述
   - 解决方案

#### 明日计划
- [ ] 明日任务1
- [ ] 明日任务2

---

## 📊 质量指标

### 目标

- [ ] 代码覆盖率 > 80%
- [ ] 功能对比 100% 通过
- [ ] UI 对比差异 < 1%
- [ ] 性能不降低
- [ ] 无阻塞性 Bug

### 当前状态

| 指标 | 目标 | 当前 | 状态 |
|------|------|------|------|
| 代码覆盖率 | > 80% | 0% | ⏳ |
| 功能完成率 | 100% | 24% | ⏳ |
| UI 一致性 | > 99% | - | ⏳ |
| 性能 | 不降低 | - | ⏳ |
| Bug数量 | 0 | 0 | ✅ |

---

**最后更新**: 2026-01-27  
**负责人**: -  
**状态**: 🚧 进行中
