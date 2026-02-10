# TimePlan 视图增强 - 实施指南

> **分支**: feature/plan-view-enhancement  
> **设计文档**: [PLAN-VIEW-ENHANCEMENT-DESIGN.md](./PLAN-VIEW-ENHANCEMENT-DESIGN.md)

---

## 🎯 快速开始

### 实施优先级

基于分析报告，按以下优先级实施：

#### P0 - 必须完成（4周）

```
Week 1-2: 表格视图行内编辑
Week 3-4: 矩阵视图重设计  
Week 5:   版本管理核心功能
Week 6:   迭代数据持久化
```

#### P1 - 重要功能（3周）

```
Week 7-8: 表格批量操作 + 门禁管理
Week 9:   MR编辑功能
```

---

## 📦 依赖安装

```bash
cd timeplan-craft-kit

# 新增依赖
pnpm add zustand@4 immer@10 dexie@4
pnpm add @tanstack/react-table@8
pnpm add react-beautiful-dnd@13
pnpm add xlsx@0.18

# 开发依赖
pnpm add -D @types/react-beautiful-dnd
```

---

## 🔧 环境配置

### 1. 状态管理迁移

创建 Zustand store：

```bash
mkdir -p src/stores
touch src/stores/useTimeplanStore.ts
```

### 2. 数据库初始化

创建 IndexedDB 配置：

```bash
mkdir -p src/db
touch src/db/timeplanDB.ts
```

### 3. 工具函数

创建必要的工具类：

```bash
mkdir -p src/utils/{matrix,version,table}
touch src/utils/matrix/matrixCalculator.ts
touch src/utils/version/versionManager.ts
touch src/utils/table/excelImporter.ts
```

---

## 🚀 分阶段实施

### Phase 1: 表格视图增强

#### Step 1: 创建基础结构

```bash
mkdir -p src/components/views/table/{editors,dialogs}
```

#### Step 2: 实现行内编辑

```typescript
// src/components/views/table/EditableCell.tsx
// 参考设计文档 2.7.2 节
```

**测试清单**：
- [ ] 双击进入编辑模式
- [ ] Enter保存，Esc取消
- [ ] 失焦自动保存
- [ ] 数据校验显示错误
- [ ] 支持Text/Date/Select/User编辑器

#### Step 3: 实现批量操作

```typescript
// src/components/views/table/BatchOperationBar.tsx
```

**测试清单**：
- [ ] 批量选择（全选/反选）
- [ ] 批量删除确认
- [ ] 批量设置状态
- [ ] 批量分配负责人

---

### Phase 2: 矩阵视图重设计

#### Step 1: 数据计算

```typescript
// src/utils/matrix/matrixCalculator.ts
// 参考设计文档 3.5 节
```

**关键功能**：
- 产品×团队二维矩阵
- 工作量统计
- 热力图等级计算
- 资源预警检测

#### Step 2: UI组件

```bash
mkdir -p src/components/views/matrix
```

**组件列表**：
- `MatrixView.tsx` - 主容器
- `MatrixGrid.tsx` - 矩阵网格
- `MatrixCell.tsx` - 单元格
- `MatrixDetailDialog.tsx` - 明细对话框

#### Step 3: 集成测试

```bash
# 运行测试
pnpm test src/components/views/matrix
```

---

### Phase 3: 版本计划增强

#### Step 1: 数据模型

```typescript
// src/types/version.ts
// 参考设计文档 4.6 节
```

**核心类型**：
- `Version` - 版本
- `Milestone` - 里程碑
- `Gate` - 门禁
- `VersionComparison` - 版本对比

#### Step 2: 版本管理UI

```bash
mkdir -p src/components/views/version
```

**组件列表**：
- `VersionPlanView.tsx` - 版本列表
- `VersionEditDialog.tsx` - 版本编辑
- `GateManagementDialog.tsx` - 门禁管理
- `VersionComparisonDialog.tsx` - 版本对比

---

### Phase 4: 迭代规划增强

#### Step 1: 数据持久化

```typescript
// src/hooks/useIterationSync.ts
// 参考设计文档 5.2.2 节
```

**关键功能**：
- IterationTask 与 Line 双向同步
- localStorage/IndexedDB 持久化
- 数据冲突处理

#### Step 2: MR编辑

```typescript
// src/components/iteration/MREditDialog.tsx
```

---

## 🧪 测试策略

### 单元测试

```bash
# 测试工具函数
pnpm test src/utils/matrix
pnpm test src/utils/version

# 测试组件
pnpm test src/components/views/table
```

### 集成测试

```bash
# 测试数据同步
pnpm test:integration src/hooks/useIterationSync

# 测试视图切换
pnpm test:integration src/components/views
```

### E2E测试

```bash
# 使用Playwright
pnpm test:e2e --headed
```

---

## 📊 进度跟踪

### Week 1-2: 表格视图

- [ ] Day 1-2: EditableCell + 基础编辑器
- [ ] Day 3-4: 各类型编辑器
- [ ] Day 5: 数据校验
- [ ] Day 6-7: 批量操作
- [ ] Day 8: 列设置
- [ ] Day 9: Excel导入
- [ ] Day 10: 测试优化

### Week 3-4: 矩阵视图

- [ ] Day 1-2: MatrixCalculator
- [ ] Day 3-4: MatrixGrid + 热力图
- [ ] Day 5: 汇总行列
- [ ] Day 6-7: 单元格交互
- [ ] Day 8: 明细对话框
- [ ] Day 9: 资源预警
- [ ] Day 10: 测试优化

### Week 5-6: 版本 + 迭代

- [ ] Day 1-2: Version 数据模型
- [ ] Day 3-4: 版本管理UI
- [ ] Day 5-6: 门禁管理
- [ ] Day 7: 版本对比
- [ ] Day 8-9: 迭代数据持久化
- [ ] Day 10: MR编辑

### Week 7: 测试与优化

- [ ] Day 1-2: 单元测试
- [ ] Day 3: 集成测试
- [ ] Day 4: E2E测试
- [ ] Day 5: 性能优化

---

## 🐛 调试技巧

### 数据同步问题

```typescript
// 开启调试日志
localStorage.setItem('debug', 'timeplan:*');

// 查看同步状态
console.log(useTimeplanStore.getState());
```

### 性能分析

```typescript
// React DevTools Profiler
// 查找慢组件

// 使用React.memo优化
const MemoizedCell = React.memo(MatrixCell);
```

### 数据验证

```typescript
// 验证数据一致性
import { validateDataIntegrity } from '@/utils/validation';

validateDataIntegrity(timeplanData);
```

---

## 📚 参考资料

- [详细设计文档](./PLAN-VIEW-ENHANCEMENT-DESIGN.md)
- [功能差距分析报告](../../prds/领域项目&计划设计-功能差距分析报告.md)
- [Zustand 最佳实践](https://github.com/pmndrs/zustand/blob/main/docs/guides/best-practices.md)
- [React Table 指南](https://tanstack.com/table/v8/docs/guide/introduction)

---

## 🤝 贡献指南

1. 从 `feature/plan-view-enhancement` 创建功能分支
2. 遵循代码规范（ESLint + Prettier）
3. 编写单元测试（覆盖率 > 80%）
4. 提交 PR 前运行 `pnpm test` 和 `pnpm lint`
5. PR 标题格式：`feat: 简短描述` 或 `fix: 简短描述`

---

**祝开发顺利！** 🎉