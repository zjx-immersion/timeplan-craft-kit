# 编辑模式功能迁移计划

**日期**: 2026-02-07  
**任务**: 将timeline-craft-kit的编辑功能迁移到timeplan-craft-kit

## 🎯 目标功能

根据源项目分析和用户需求，需要实现以下编辑模式功能：

### 1. ✅ 已完成
- [x] 基础拖拽移动（已有useTimelineDrag hook）
- [x] 基础调整大小（已有useBarResize hook）
- [x] 撤销/重做（已修复useUndoRedo hook）
- [x] TimelineQuickMenu（三点菜单）

### 2. ⏳ 待实现

#### A. 连线交互功能
- [ ] **ConnectionPoints** - 连接点组件
  - 显示左右连接点（入口/出口）
  - 支持点击开始连线
  - 支持点击完成连线
  - 视觉状态：默认、源节点、目标候选

- [ ] **ConnectionMode** - 连线模式指示器
  - 底部浮动提示框
  - 显示当前连线状态
  - 取消连线按钮

#### B. 右键菜单功能
- [ ] **NodeContextMenu** - 节点右键菜单
  - 编辑节点
  - 删除节点
  - 仅编辑模式下显示

- [ ] **TimelineContextMenu** - 时间轴背景右键菜单
  - 添加节点（Bar/Milestone/Gateway）
  - 创建依赖连线
  - 添加基线
  - 绘制时间区间

#### C. 选中状态增强
- [ ] **选中视觉反馈**
  - Bar: `ring-2 ring-ring ring-offset-2 rounded`
  - Milestone/Gateway: `ring-2 ring-ring rounded-full`
  - 拖拽时: `opacity-80 scale-110 z-50`
  - Hover时: `z-[100]`

#### D. 基线功能（可选）
- [ ] **BaselineMarker** - 基线标记
- [ ] **BaselineRangeDragCreator** - 拖拽创建时间区间
- [ ] **BaselineEditDialog** - 基线编辑对话框

#### E. 依赖连线交互增强
- [ ] **选中连线**
  - 点击连线高亮显示
  - 显示关系类型标签
  - 显示删除按钮

## 📋 实施阶段

### 阶段1: 连线交互（P0优先级）⭐⭐⭐

这是用户最关注的功能："点击选中各种元素后，显示选中样式和可以点击另一个元素上的连线节点进行自动连线"

#### 1.1 创建ConnectionPoints组件

**文件**: `src/components/timeline/ConnectionPoints.tsx`

**功能**:
- 在Bar/Milestone/Gateway上显示连接点
- 左连接点：入口（其他节点连到这里）
- 右连接点：出口（从这里连到其他节点）
- 状态管理：默认、源节点、目标候选

**依赖**: 
- Ant Design图标
- 状态：`connectionMode: { lineId: string | null, direction: 'from' | 'to' }`

#### 1.2 创建ConnectionMode组件

**文件**: `src/components/timeline/ConnectionMode.tsx`

**功能**:
- 底部浮动提示框
- 显示"连线模式 - 从XXX连接"
- 取消按钮

#### 1.3 集成到LineRenderer

**修改**: `src/components/timeline/LineRenderer.tsx`

- 在Bar/Milestone/Gateway组件中添加ConnectionPoints
- 传递connectionMode状态
- 处理连线开始/完成事件

#### 1.4 在TimelinePanel中管理连线状态

**修改**: `src/components/timeline/TimelinePanel.tsx`

```typescript
// 添加状态
const [connectionMode, setConnectionMode] = useState<{
  lineId: string | null;
  direction: 'from' | 'to';
}>({ lineId: null, direction: 'from' });

// 开始连线
const handleStartConnection = useCallback((lineId: string, direction: 'from' | 'to') => {
  setConnectionMode({ lineId, direction });
}, []);

// 完成连线
const handleCompleteConnection = useCallback((targetLineId: string) => {
  if (!connectionMode.lineId) return;
  
  // 创建新的relation
  const newRelation: Relation = {
    id: `rel-${Date.now()}`,
    fromLineId: connectionMode.direction === 'from' ? connectionMode.lineId : targetLineId,
    toLineId: connectionMode.direction === 'from' ? targetLineId : connectionMode.lineId,
    type: 'dependency',
  };
  
  setData({
    ...data,
    relations: [...data.relations, newRelation],
  });
  
  setConnectionMode({ lineId: null, direction: 'from' });
}, [connectionMode, data, setData]);

// 取消连线
const handleCancelConnection = useCallback(() => {
  setConnectionMode({ lineId: null, direction: 'from' });
}, []);
```

### 阶段2: 右键菜单（P1优先级）⭐⭐

#### 2.1 检查UI组件库

**问题**: timeline-craft-kit使用Shadcn/ui的ContextMenu，但timeplan-craft-kit使用Ant Design

**解决方案**:
- 使用Ant Design的`Dropdown`组件代替
- 通过`onContextMenu`事件触发

#### 2.2 创建NodeContextMenu

**文件**: `src/components/timeline/NodeContextMenu.tsx`（新建）

```typescript
import { Dropdown, Menu } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

// 使用Dropdown + onContextMenu实现右键菜单
```

#### 2.3 创建TimelineContextMenu

**文件**: `src/components/timeline/TimelineContextMenu.tsx`（新建）

包含：
- 添加节点（Bar/Milestone/Gateway）子菜单
- 创建依赖连线
- 添加基线（可选）

### 阶段3: 选中状态增强（P1优先级）⭐⭐

#### 3.1 修改LineRenderer

**文件**: `src/components/timeline/LineRenderer.tsx`

添加选中样式：
```typescript
// Bar选中样式
style={{
  // ...existing styles
  ...(isSelected && {
    outline: '2px solid #1890ff',
    outlineOffset: '2px',
    borderRadius: '4px',
  }),
}}

// Milestone/Gateway选中样式
style={{
  // ...existing styles
  ...(isSelected && {
    outline: '2px solid #1890ff',
    borderRadius: '50%',
  }),
}}
```

#### 3.2 在TimelinePanel中管理选中状态

已有`selectedLineId`状态，但需要增强：
- 点击元素时设置选中
- 点击空白处取消选中
- 显示连接点（仅选中元素）

### 阶段4: 依赖连线交互（P1优先级）⭐⭐

#### 4.1 修改RelationRenderer

**文件**: `src/components/timeline/RelationRenderer.tsx`

添加：
- 选中连线状态
- 点击连线事件
- 显示关系类型标签
- 编辑模式下显示删除按钮

```typescript
const [selectedRelationId, setSelectedRelationId] = useState<string | null>(null);
const [hoveredRelationId, setHoveredRelationId] = useState<string | null>(null);
```

### 阶段5: 基线功能（P2优先级）⭐（可选）

如果用户需要，后续实现：
- BaselineMarker
- BaselineRangeDragCreator
- BaselineEditDialog

## 🔧 技术适配

### UI组件库差异

| 功能 | timeline-craft-kit | timeplan-craft-kit | 解决方案 |
|------|-------------------|-------------------|---------|
| 右键菜单 | Shadcn ContextMenu | Ant Design Dropdown | 使用Dropdown + onContextMenu |
| 图标 | lucide-react | @ant-design/icons | 映射图标名称 |
| 样式类 | Tailwind cn() | Ant Design style对象 | 使用内联样式 |
| 对话框 | Shadcn Dialog | Ant Design Modal | 已有Modal组件 |

### 图标映射

```typescript
// lucide-react → @ant-design/icons
Edit → EditOutlined
Trash2 → DeleteOutlined
Plus → PlusOutlined
GitBranch → BranchesOutlined
Flag → FlagOutlined
Diamond → AppstoreOutlined
Link2 → LinkOutlined
X → CloseOutlined
```

## 📝 实施顺序

1. **Day 1**: 阶段1 - 连线交互（最重要）
   - [x] 修复无限循环bug
   - [ ] 创建ConnectionPoints组件
   - [ ] 创建ConnectionMode组件
   - [ ] 集成到LineRenderer
   - [ ] 在TimelinePanel中管理状态

2. **Day 2**: 阶段2+3 - 右键菜单和选中状态
   - [ ] 创建NodeContextMenu
   - [ ] 创建TimelineContextMenu
   - [ ] 增强选中视觉效果

3. **Day 3**: 阶段4 - 依赖连线交互
   - [ ] 修改RelationRenderer添加选中功能
   - [ ] 添加删除连线功能
   - [ ] 添加关系类型标签

4. **Day 4** (可选): 阶段5 - 基线功能
   - 根据用户需求决定是否实施

## ✅ 验收标准

### 连线功能
- [ ] 点击Bar/Milestone/Gateway显示连接点
- [ ] 点击连接点进入连线模式
- [ ] 底部显示连线模式提示
- [ ] 点击目标连接点完成连线
- [ ] 新建的连线立即显示在画布上
- [ ] 可以取消连线操作

### 右键菜单
- [ ] 右键点击节点显示编辑/删除菜单
- [ ] 右键点击空白显示添加节点菜单
- [ ] 仅在编辑模式下显示

### 选中状态
- [ ] 点击元素显示选中样式（外圈高亮）
- [ ] 拖拽时放大并半透明
- [ ] Hover时提升层级

### 依赖连线
- [ ] 点击连线高亮显示
- [ ] 选中连线显示关系类型
- [ ] 编辑模式下可删除连线

## 🚨 注意事项

1. **性能**: 连接点只在编辑模式+hover/选中时显示，避免性能问题
2. **UI一致性**: 使用Ant Design组件保持风格统一
3. **状态管理**: 复用已有的useUndoRedo hook
4. **错误处理**: 防止创建自连接、重复连线
5. **用户体验**: 提供清晰的视觉反馈和操作提示
