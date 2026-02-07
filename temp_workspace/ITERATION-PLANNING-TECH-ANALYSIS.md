# timeline-craft-kit 迭代规划看板技术分析

## 一、总体架构

### 1.1 视图结构

迭代规划看板采用**矩阵式布局**，包含以下层级：

```
┌─────────────────────────────────────────────────────┐
│ Header: 产品选择器 + 宽度调节器                      │
├─────────────────────────────────────────────────────┤
│ Timeline Header: 迭代标题行（Sprint 1, 2, 3...）     │
│ Markers Row: Gateway/Milestone 标记行                │
├────────┬────────────────────────────────────────────┤
│ 团队A  │ 模块A-1 │ Sprint 1 | Sprint 2 | Sprint 3   │
│        │ 模块A-2 │ [MR卡片] | [MR卡片] | [空]       │
├────────┼─────────┼──────────┼──────────┼───────────┤
│ 团队B  │ 模块B-1 │ [MR卡片] | [空]     | [MR卡片]   │
└────────┴─────────┴──────────┴──────────┴───────────┘
```

### 1.2 核心组件层级

```
IterationPlanView.tsx (独立页面)
    └─ ProductSelector.tsx (产品选择)
    └─ IterationMatrix.tsx (矩阵核心)
        ├─ IterationMarkers.tsx (Gateway/Milestone 标记)
        ├─ MRCard.tsx (需求卡片)
        ├─ DependencyLines.tsx (依赖关系连线)
        └─ IterationWidthSelector.tsx (宽度调节器)
    └─ MRSelectorDialog.tsx (MR 选择对话框)
    └─ MRDetailDialog.tsx (MR 详情对话框)

IterationView.tsx (嵌入式组件)
    └─ 与 IterationPlanView 相同，但无独立 Header
```

---

## 二、核心数据结构

### 2.1 类型定义 (`src/types/iteration.ts`)

#### 产品和团队
```typescript
export interface Product {
  id: string;
  name: string;              // '行车', '泊车', '主动安全'
  type: ProductType;         // 'driving' | 'parking' | 'active-safety'
  description?: string;
}

export interface Team {
  id: string;
  name: string;              // '感知团队', '规划团队'
  productId: string;         // 所属产品
}

export interface Module {
  id: string;
  name: string;              // '视觉感知', '雷达感知'
  teamId: string;            // 所属团队
  order?: number;            // 显示顺序
}
```

#### 迭代和需求
```typescript
export interface Iteration {
  id: string;
  name: string;              // 'Sprint 1', 'Sprint 2'
  startDate: Date;
  endDate: Date;
  duration: number;          // 通常14天（2周）
  productId: string;
  order: number;
}

export interface MR {
  id: string;
  name: string;              // 'MR-001 车辆检测算法优化'
  sstsId: string;            // 所属子系统
  dependencies?: string[];   // 依赖的其他 MR ID
  estimatedDays?: number;    // 预估工作量
  priority?: 'high' | 'medium' | 'low';
  status?: 'todo' | 'in-progress' | 'done';
}

export interface IterationTask {
  id: string;
  moduleId: string;          // 模块ID
  iterationId: string;       // 迭代ID
  mrIds: string[];           // 该单元格包含的 MR 列表
}
```

### 2.2 数据关系

```
Product (1:N) Team (1:N) Module
Product (1:N) Iteration
SSTS (1:N) MR
Module × Iteration = IterationTask (N:N)
IterationTask (1:N) MR
```

---

## 三、核心技术实现

### 3.1 矩阵布局 (`IterationMatrix.tsx`)

#### 固定列与滚动
```typescript
// 团队列：不固定，可横向滚动
<div style={{ width: 200 }}>团队名称</div>

// 模块列：固定在左侧
<div className="sticky left-0 z-10" style={{ width: 200 }}>
  模块名称
</div>

// 迭代列：可滚动
<div style={{ width: CELL_WIDTH }}>Sprint 1</div>
```

#### 动态行高计算
```typescript
// 根据单元格中最多的 MR 数量计算行高
const maxMRsInRow = Math.max(
  ...iterations.map(iter => {
    const task = tasks.find(t => 
      t.moduleId === module.id && t.iterationId === iter.id
    );
    return task ? task.mrIds.length : 0;
  }),
  1
);

const rowHeight = Math.max(
  MIN_ROW_HEIGHT,
  CELL_PADDING * 2 + maxMRsInRow * MR_CARD_HEIGHT + (maxMRsInRow - 1) * 4
);
```

#### 宽度档位系统
```typescript
const widthLevels = {
  1: 150,   // 最窄，竖排布局
  2: 300,   // 窄，竖排布局
  3: 450,   // 中等，开始横排布局
  4: 600,   // 宽，横排布局
  5: 795,   // 最宽，横排布局
};

const useHorizontalLayout = widthLevel >= 3;
```

### 3.2 拖拽排期 (`onDragStart`, `onDrop`)

```typescript
// 1. 开始拖拽 MR 卡片
onDragStart={(e) => {
  setDraggedMR({
    mr,
    moduleId: module.id,
    iterationId: iter.id,
  });
  e.currentTarget.style.opacity = '0.5';
}}

// 2. 放置到目标单元格
onDrop={(e) => {
  e.preventDefault();
  if (draggedMR && onMRMove) {
    onMRMove(
      draggedMR.mr.id,
      draggedMR.moduleId,
      draggedMR.iterationId,
      toModuleId,
      toIterationId
    );
  }
}}

// 3. 更新任务数据
handleMRMove: (mrId, fromModule, fromIter, toModule, toIter) => {
  // 从源单元格移除 MR
  // 添加到目标单元格
  // 如果源单元格为空，删除任务
}
```

### 3.3 迭代标记显示 (`IterationMarkers.tsx`)

#### 数据筛选
```typescript
const iterationMarkers = useMemo(() => {
  const markers = new Map<string, Line[]>();
  
  iterations.forEach(iter => {
    const iterLines = timePlan.lines.filter(line => {
      if (line.schemaId !== 'gateway-schema' && 
          line.schemaId !== 'milestone-schema') return false;
      
      const lineDate = new Date(line.startDate);
      return lineDate >= iter.startDate && lineDate <= iter.endDate;
    });
    
    markers.set(iter.id, iterLines.sort((a, b) => 
      new Date(a.startDate) - new Date(b.startDate)
    ));
  });
  
  return markers;
}, [timePlan, iterations]);
```

#### 动态显示数量
```typescript
// 根据单元格宽度调整显示数量
const maxVisible = CELL_WIDTH <= 150 ? 1 : 
                   (CELL_WIDTH <= 450 ? 2 : 3);

// 超出部分显示"+N"按钮
<button onClick={() => setDialogOpen(true)}>
  +{moreCount}
</button>
```

### 3.4 MR 卡片 (`MRCard.tsx`)

#### 视觉状态
```typescript
const MRCard = ({ mr, isDragging, hasDependencyIssue }) => (
  <div
    className={cn(
      "px-2 py-1.5 rounded text-xs",
      "border border-border bg-card",
      isDragging && "opacity-50",
      hasDependencyIssue && "border-yellow-500 bg-yellow-50",
      priorityColors[mr.priority],
      statusColors[mr.status]
    )}
  >
    <div className="font-medium truncate">{mr.name}</div>
    <div className="text-muted-foreground mt-0.5">
      {mr.estimatedDays}天
    </div>
  </div>
);
```

### 3.5 依赖关系连线 (`DependencyLines.tsx`)

#### SVG 渲染
```typescript
<svg className="absolute inset-0 pointer-events-none z-5">
  {dependencies.map(({ from, to }) => {
    const fromRect = getCardRect(from.mrId, from.moduleId, from.iterationId);
    const toRect = getCardRect(to.mrId, to.moduleId, to.iterationId);
    
    return (
      <path
        d={`M ${fromRect.right} ${fromRect.centerY} 
            L ${toRect.left} ${toRect.centerY}`}
        stroke="#3b82f6"
        strokeWidth="2"
        fill="none"
        markerEnd="url(#arrowhead)"
      />
    );
  })}
</svg>
```

---

## 四、交互功能

### 4.1 添加 MR 到单元格

```typescript
// 1. 点击空单元格或"+"按钮
onCellClick={(moduleId, iterationId) => {
  setSelectedCell({ moduleId, iterationId });
  setMrDialogOpen(true);
}}

// 2. 在对话框中选择 MR（支持按 Feature > SSTS > MR 树形选择）
<MRSelectorDialog
  features={mockFeatures}
  sstsList={mockSSTSList}
  mrs={mockMRs}
  onSelect={(mrIds) => handleMRSelect(mrIds)}
/>

// 3. 更新任务数据
handleMRSelect: (mrIds) => {
  // 查找或创建任务
  // 合并 MR ID 列表
  // 更新 tasks 状态
}
```

### 4.2 查看 MR 详情

```typescript
// 点击 MR 卡片
<MRCard
  onClick={() => handleMRClick(mr)}
/>

// 显示详情对话框
<MRDetailDialog
  mr={selectedMR}
  allMrs={mockMRs}  // 用于显示依赖关系
/>
```

### 4.3 调整迭代宽度

```typescript
<IterationWidthSelector
  value={widthLevel}
  onChange={setWidthLevel}
/>

// 档位切换影响：
// 1 -> 150px: 竖排，显示1个标记
// 2 -> 300px: 竖排，显示2个标记
// 3 -> 450px: 横排（2列），显示2个标记
// 4 -> 600px: 横排（2列），显示3个标记
// 5 -> 795px: 横排（2列），显示3个标记
```

---

## 五、关键技术点

### 5.1 日期计算

```typescript
// 生成迭代周期（每个迭代2周）
function generateIterations(productId, startDate, count) {
  const iterations = [];
  const start = new Date(startDate);
  
  for (let i = 0; i < count; i++) {
    const iterStartDate = new Date(start);
    iterStartDate.setDate(start.getDate() + i * 14);
    
    const iterEndDate = new Date(iterStartDate);
    iterEndDate.setDate(iterStartDate.getDate() + 13);
    
    iterations.push({
      id: `iter-${productId}-${i + 1}`,
      name: `Sprint ${i + 1}`,
      startDate: iterStartDate,
      endDate: iterEndDate,
      duration: 14,
      productId,
      order: i + 1,
    });
  }
  
  return iterations;
}

// 调整到周一作为起始日期
const firstIterStart = new Date(minDate);
firstIterStart.setDate(
  firstIterStart.getDate() - (firstIterStart.getDay() || 7) + 1
);
```

### 5.2 数据映射与过滤

```typescript
// 按团队分组模块
const modulesByTeam = useMemo(() => {
  const grouped = new Map<string, Module[]>();
  
  teams.forEach(team => {
    const teamModules = modules
      .filter(m => m.teamId === team.id)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    grouped.set(team.id, teamModules);
  });
  
  return grouped;
}, [teams, modules]);

// 获取单元格的 MR 列表
const task = tasks.find(t => 
  t.moduleId === module.id && t.iterationId === iter.id
);
const cellMRs = task 
  ? mrs.filter(mr => task.mrIds.includes(mr.id)) 
  : [];
```

### 5.3 性能优化

```typescript
// 1. useMemo 缓存计算结果
const iterations = useMemo(() => {
  return generateIterations(selectedProduct.id, startDate, 6);
}, [selectedProduct, data]);

// 2. useCallback 缓存事件处理函数
const handleCellClick = useCallback((moduleId, iterationId) => {
  setSelectedCell({ moduleId, iterationId });
  setMrDialogOpen(true);
}, []);

// 3. 虚拟滚动（待优化，当前未实现）
// 对于大量行（>100），可使用 react-window 优化渲染
```

---

## 六、UI 组件库

### 6.1 使用的 Shadcn/ui 组件

- `Button`: 返回按钮、添加按钮、操作按钮
- `Dialog`: MR 选择对话框、MR 详情对话框、标记展开对话框
- `Input`: 搜索框
- `Badge`: 标签徽章
- `Separator`: 分隔线

### 6.2 Lucide React 图标

- `ArrowLeft`: 返回图标
- `Plus`: 添加图标
- `Search`: 搜索图标
- `Diamond`: Milestone 图标
- `Hexagon`: Gateway 图标
- `AlertTriangle`: 依赖警告图标

### 6.3 样式系统

- **Tailwind CSS**: 所有样式基于 Tailwind utility classes
- **CSS 变量**: 使用 `@apply` 和 CSS 变量定义主题色
- **响应式**: 使用 `flex`, `grid`, `sticky` 实现自适应布局

---

## 七、与 TimePlan 的集成

### 7.1 数据关联

```typescript
// TimePlan 提供日期范围
const minDate = Math.min(...data.lines.map(l => new Date(l.startDate)));
const maxDate = Math.max(...data.lines.map(l => new Date(l.endDate)));

// 生成覆盖整个时间范围的迭代
const daysDiff = (maxDate - minDate) / (1000 * 60 * 60 * 24);
const iterationCount = Math.ceil(daysDiff / 14) + 1;
```

### 7.2 显示 Gateway/Milestone

```typescript
// 筛选在迭代时间范围内的标记
timePlan.lines.forEach(line => {
  if (line.schemaId === 'gateway-schema' || 
      line.schemaId === 'milestone-schema') {
    const lineDate = new Date(line.startDate);
    if (lineDate >= iter.startDate && lineDate <= iter.endDate) {
      iterLines.push(line);
    }
  }
});
```

---

## 八、扩展点

### 8.1 待实现功能

1. **数据持久化**: 将任务数据保存到后端
2. **权限控制**: 不同角色的操作权限（查看/编辑/拖拽）
3. **历史记录**: 任务变更历史和回滚
4. **批量操作**: 批量移动/复制 MR
5. **导出功能**: 导出为 Excel/CSV

### 8.2 性能优化

1. **虚拟滚动**: 使用 `react-window` 优化大量行渲染
2. **懒加载**: 按需加载 MR 详情数据
3. **防抖/节流**: 搜索、拖拽事件优化
4. **Web Worker**: 复杂计算（依赖关系、路径规划）放到 Worker

### 8.3 用户体验

1. **快捷键**: 键盘导航（方向键、回车、ESC）
2. **撤销/重做**: Ctrl+Z / Ctrl+Y
3. **拖拽预览**: 显示拖拽目标位置的预览
4. **冲突检测**: 检测工作量超限、依赖冲突等

---

## 九、技术栈总结

| 类别 | 技术 | 用途 |
|------|------|------|
| **框架** | React 18 + TypeScript | UI 构建和类型安全 |
| **路由** | React Router v6 | 页面导航 |
| **状态管理** | useState + useContext | 本地状态和全局状态 |
| **UI 组件** | Shadcn/ui (基于 Radix UI) | 对话框、按钮、输入框等 |
| **图标** | Lucide React | 矢量图标 |
| **样式** | Tailwind CSS | 原子化 CSS |
| **日期处理** | date-fns | 日期格式化和计算 |
| **工具函数** | cn (clsx + tailwind-merge) | 条件样式合并 |

---

## 十、目录结构

```
timeline-craft-kit/
└── src/
    ├── pages/
    │   └── IterationPlanView.tsx        # 独立页面
    ├── components/
    │   └── iteration/
    │       ├── IterationView.tsx         # 嵌入式组件
    │       ├── IterationMatrix.tsx       # 矩阵核心
    │       ├── IterationMarkers.tsx      # Gateway/Milestone 标记
    │       ├── IterationWidthSelector.tsx # 宽度调节器
    │       ├── MRCard.tsx                # MR 卡片
    │       ├── MRSelectorDialog.tsx      # MR 选择对话框
    │       ├── MRDetailDialog.tsx        # MR 详情对话框
    │       ├── ProductSelector.tsx       # 产品选择器
    │       └── DependencyLines.tsx       # 依赖关系连线
    └── types/
        └── iteration.ts                  # 类型定义
```

---

## 总结

迭代规划看板是一个**高度交互、数据驱动**的矩阵视图组件，核心特点：

1. **矩阵布局**: 团队-模块（纵轴）× 迭代（横轴）
2. **拖拽排期**: 支持 MR 在单元格间移动
3. **依赖可视化**: SVG 连线显示 MR 依赖关系
4. **时间对齐**: 与 TimePlan 的 Gateway/Milestone 集成
5. **响应式宽度**: 5档宽度调节，适应不同屏幕和数据密度
6. **固定列**: 模块列固定在左侧，方便对比

**技术亮点**:
- 使用 `useMemo` 和 `useCallback` 优化性能
- 动态行高计算，适应不同数量的 MR
- Drag & Drop API 实现拖拽排期
- SVG 绘制依赖关系连线
- Shadcn/ui + Tailwind CSS 快速构建美观UI
