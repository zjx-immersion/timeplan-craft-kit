# 阶段1 TDD 实施计划

**项目**: timeplan-craft-kit  
**方法**: TDD（测试驱动开发）  
**开始日期**: 2026-02-06  
**目标**: 完成核心组件和基础功能

---

## 📋 TDD 开发流程

每个功能/组件遵循以下流程：

1. **编写测试用例** (Red) - 先写失败的测试
2. **实现功能代码** (Green) - 让测试通过
3. **重构优化** (Refactor) - 优化代码质量
4. **集成验证** - 集成到页面，确保构建成功
5. **文档记录** - 记录到 temp_workspace

---

## 🎯 阶段1任务清单

### 优先级分组

#### P0 - 核心基础（必须完成）

| 序号 | 任务 | 类型 | 预计工时 | 状态 | 测试文件 | 实现文件 |
|------|------|------|----------|------|----------|----------|
| 1 | criticalPath 完善 | 工具函数 | 2h | ⏳ | utils/__tests__/criticalPath.test.ts | utils/criticalPath.ts |
| 2 | dataExport 完善 | 工具函数 | 1.5h | ⏳ | utils/__tests__/dataExport.test.ts | utils/dataExport.ts |
| 3 | dataImport 完善 | 工具函数 | 1.5h | ⏳ | utils/__tests__/dataImport.test.ts | utils/dataImport.ts |
| 4 | TimelinePanel 核心 | 组件 | 8h | ⏳ | components/timeline/__tests__/TimelinePanel.test.tsx | components/timeline/TimelinePanel.tsx |
| 5 | TimelineRow | 组件 | 4h | ⏳ | components/timeline/__tests__/TimelineRow.test.tsx | components/timeline/TimelineRow.tsx |
| 6 | TimelineNodeRenderer | 组件 | 2h | ⏳ | components/timeline/__tests__/TimelineNodeRenderer.test.tsx | components/timeline/TimelineNodeRenderer.tsx |

#### P1 - 渲染增强（重要）

| 序号 | 任务 | 类型 | 预计工时 | 状态 | 测试文件 | 实现文件 |
|------|------|------|----------|------|----------|----------|
| 7 | TimelineBar | 组件 | 4h | ⏳ | components/timeline/__tests__/TimelineBar.test.tsx | components/timeline/TimelineBar.tsx |
| 8 | TimelineMilestone | 组件 | 2h | ⏳ | components/timeline/__tests__/TimelineMilestone.test.tsx | components/timeline/TimelineMilestone.tsx |
| 9 | TimelineGateway | 组件 | 2h | ⏳ | components/timeline/__tests__/TimelineGateway.test.tsx | components/timeline/TimelineGateway.tsx |
| 10 | DependencyLines | 组件 | 3h | ⏳ | components/timeline/__tests__/DependencyLines.test.tsx | components/timeline/DependencyLines.tsx |

#### P2 - 交互功能（可选）

| 序号 | 任务 | 类型 | 预计工时 | 状态 | 测试文件 | 实现文件 |
|------|------|------|----------|------|----------|----------|
| 11 | useTimelineDrag Hook | Hook | 4h | ⏳ | hooks/__tests__/useTimelineDrag.test.ts | hooks/useTimelineDrag.ts |
| 12 | useBarResize Hook | Hook | 3h | ⏳ | hooks/__tests__/useBarResize.test.ts | hooks/useBarResize.ts |
| 13 | ResizableBar | 组件 | 3h | ⏳ | components/timeline/__tests__/ResizableBar.test.tsx | components/timeline/ResizableBar.tsx |

**总计**: 约 40-45 小时

---

## 📝 详细实施步骤

### Step 1: criticalPath 工具函数 (2h)

**TDD 流程**:

1. **编写测试** (30min)
   ```typescript
   // utils/__tests__/criticalPath.test.ts
   - 测试基本CPM算法
   - 测试依赖关系计算
   - 测试关键路径识别
   - 测试边界情况
   ```

2. **实现功能** (1h)
   - 从 timeline-craft-kit 迁移核心算法
   - 适配 Ant Design 数据结构
   - 优化性能（< 50ms for 1000 nodes）

3. **重构** (15min)
   - 代码优化
   - 添加注释

4. **集成** (15min)
   - 集成到 TimelinePanel
   - 验证构建成功

5. **文档** (记录到 temp_workspace)

---

### Step 2: dataExport 工具函数 (1.5h)

**TDD 流程**:

1. **编写测试** (30min)
   ```typescript
   // utils/__tests__/dataExport.test.ts
   - 测试 JSON 导出
   - 测试 CSV 导出
   - 测试 Excel 导出
   - 测试数据完整性
   ```

2. **实现功能** (45min)
   - JSON 导出逻辑
   - CSV 导出逻辑
   - Excel 导出逻辑

3. **集成** (15min)
   - 集成到 ExportDialog
   - 验证功能

---

### Step 3: dataImport 工具函数 (1.5h)

**TDD 流程**:

1. **编写测试** (30min)
   ```typescript
   // utils/__tests__/dataImport.test.ts
   - 测试 JSON 导入
   - 测试数据验证
   - 测试 ID 冲突处理
   - 测试错误处理
   ```

2. **实现功能** (45min)
   - JSON 解析
   - 数据验证
   - ID 冲突处理

3. **集成** (15min)
   - 集成到 ImportDialog
   - 验证功能

---

### Step 4: TimelinePanel 核心组件 (8h)

**TDD 流程**:

1. **编写测试** (2h)
   ```typescript
   // components/timeline/__tests__/TimelinePanel.test.tsx
   - 测试组件渲染
   - 测试时间轴渲染
   - 测试 Timeline 列表渲染
   - 测试滚动功能
   - 测试缩放功能
   ```

2. **实现功能** (5h)
   - 从 timeline-craft-kit 迁移核心逻辑
   - 适配 Ant Design 组件
   - 实现响应式布局
   - 集成 TimelineToolbar
   - 集成 ViewSwitcher

3. **重构** (30min)
   - 性能优化
   - 代码整理

4. **集成** (30min)
   - 集成到 Index.tsx
   - 验证所有交互
   - 确保构建成功

---

### Step 5: TimelineRow 组件 (4h)

**TDD 流程**:

1. **编写测试** (1h)
   ```typescript
   // components/timeline/__tests__/TimelineRow.test.tsx
   - 测试行渲染
   - 测试左侧标签区域
   - 测试右侧甘特图区域
   - 测试悬停效果
   - 测试点击事件
   ```

2. **实现功能** (2.5h)
   - 行布局实现
   - 标签区域实现
   - 甘特图区域实现
   - 交互实现

3. **集成** (30min)
   - 集成到 TimelinePanel
   - 验证功能

---

### Step 6-10: 其他组件

按照相同的 TDD 流程实施：
- TimelineNodeRenderer
- TimelineBar
- TimelineMilestone
- TimelineGateway
- DependencyLines

---

## 🔄 每日工作流

### 每日开始
```bash
cd timeplan-craft-kit
npm run test -- --watch  # 启动测试监听
npm run dev             # 启动开发服务器
```

### 开发过程
1. 选择一个任务
2. 创建测试文件（如果不存在）
3. 编写测试用例（先失败）
4. 实现功能代码（让测试通过）
5. 重构优化
6. 集成到页面验证
7. 运行完整测试套件
8. 确保构建成功：`npm run build`
9. 记录文档

### 每日结束
- 更新进度表
- 提交代码（如使用 git）
- 记录明日计划

---

## ✅ 完成标准

每个任务完成需要满足：

1. ✅ 测试覆盖率 > 80%
2. ✅ 所有测试通过
3. ✅ ESLint 无错误
4. ✅ TypeScript 无类型错误
5. ✅ 成功集成到页面
6. ✅ `npm run build` 构建成功
7. ✅ 功能在浏览器中正常工作
8. ✅ 文档已更新

---

## 📊 进度跟踪

更新频率：每完成一个任务

| 日期 | 完成任务 | 实际工时 | 累计进度 | 备注 |
|------|---------|---------|---------|------|
| 2026-02-06 | 计划创建 | 0.5h | 0% | 初始化 |
| - | - | - | - | - |

---

## 📁 文档结构

```
temp_workspace/
├── PHASE1-TDD-PLAN.md           # 本文档
├── DAILY-LOG-YYYY-MM-DD.md      # 每日工作日志
├── TEST-COVERAGE-REPORT.md      # 测试覆盖率报告
├── INTEGRATION-CHECKLIST.md     # 集成检查清单
└── ISSUES-AND-SOLUTIONS.md      # 问题和解决方案
```

---

## 🚀 开始实施

**下一步**: 开始 Step 1 - criticalPath 工具函数

**命令**:
```bash
# 创建测试文件
touch src/utils/__tests__/criticalPath.complete.test.ts

# 启动测试监听
npm run test -- --watch src/utils/__tests__/criticalPath

# 开始 TDD 开发
```

---

**创建时间**: 2026-02-06  
**预计完成**: 5-6 天（1-2 人团队）  
**状态**: 🚀 准备开始
