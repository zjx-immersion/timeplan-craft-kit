# TimePlan 视图增强设计方案

> **版本**: v1.0  
> **分支**: feature/plan-view-enhancement  
> **设计日期**: 2026-02-10  
> **负责人**: 开发团队  
> **状态**: 设计中

---

## 📋 目录

1. [设计概述](#设计概述)
2. [表格视图增强](#表格视图增强)
3. [矩阵视图重设计](#矩阵视图重设计)
4. [版本计划增强](#版本计划增强)
5. [迭代规划增强](#迭代规划增强)
6. [数据模型设计](#数据模型设计)
7. [组件架构](#组件架构)
8. [实施计划](#实施计划)

---

## 一、设计概述

### 1.1 设计目标

基于《领域项目&计划设计-功能差距分析报告》，针对五大视图的关键缺失功能进行增强设计，重点解决：

| 视图 | 当前完成度 | 目标完成度 | 核心增强 |
|------|-----------|-----------|---------|
| 表格视图 | 60% | 95% | 行内编辑、批量操作 |
| 矩阵视图 | 30% | 90% | 产品×团队矩阵、工作量热力图 |
| 版本计划 | 40% | 90% | 版本管理、门禁管理 |
| 迭代规划 | 85% | 100% | 数据持久化、MR编辑 |

### 1.2 设计原则

1. **数据一致性优先**：所有视图共享同一份TimePlan数据，确保修改实时同步
2. **渐进式增强**：保留现有功能，新功能作为增强而非替换
3. **用户体验第一**：交互流畅，操作简单，反馈及时
4. **可扩展性**：架构设计考虑未来扩展需求

### 1.3 技术栈

```typescript
// 核心技术
React 19.0.0
TypeScript 5.8.3
Ant Design 6.2.1

// 新增依赖
zustand 4.x          // 状态管理
immer 10.x           // 不可变数据
dexie 4.x            // IndexedDB封装
@tanstack/react-table 8.x  // 表格增强
react-beautiful-dnd 13.x   // 拖拽增强
```

---

## 二、表格视图增强

### 2.1 功能目标

- ✅ 行内编辑（双击单元格）
- ✅ 批量选择与批量操作
- ✅ 列自定义（显示/隐藏、宽度、顺序）
- ✅ Excel批量导入
- ✅ 高级筛选与搜索

### 2.2 页面布局设计

```
┌──────────────────────────────────────────────────────────────────┐
│ 表格视图                                    [导入] [导出] [设置]   │
├──────────────────────────────────────────────────────────────────┤
│ 🔍 搜索: [____________]  📊 筛选: [Timeline▼] [类型▼] [状态▼]   │
│                                                                    │
│ ☑ 已选 5 项  [批量删除] [批量设置状态▼] [批量分配负责人▼]        │
├──────────────────────────────────────────────────────────────────┤
│ ┌────┬──────────┬──────────┬──────────┬──────────┬──────────┐  │
│ │☑   │Timeline  │名称      │类型      │负责人    │开始日期  │  │
│ ├────┼──────────┼──────────┼──────────┼──────────┼──────────┤  │
│ │☑   │团队A     │需求分析  │计划单元  │张三      │2026-02-15│  │
│ │    │          │          │          │          │[可编辑]  │  │
│ ├────┼──────────┼──────────┼──────────┼──────────┼──────────┤  │
│ │☐   │团队B     │开发任务  │计划单元  │李四      │2026-03-01│  │
│ ├────┼──────────┼──────────┼──────────┼──────────┼──────────┤  │
│ │☑   │团队A     │测试      │计划单元  │王五      │2026-03-15│  │
│ └────┴──────────┴──────────┴──────────┴──────────┴──────────┘  │
│                                                                    │
│ 第 1-10 条，共 125 条  [< 上一页] [1] [2] [3] ... [下一页 >]     │
└──────────────────────────────────────────────────────────────────┘
```

### 2.3 行内编辑设计

#### 2.3.1 交互流程

```
用户双击单元格
    ↓
单元格变为编辑状态
    ↓
显示对应的编辑器（input/select/datepicker）
    ↓
用户修改内容
    ↓
失焦 或 按Enter → 保存 (调用验证)
按Esc → 取消
    ↓
保存成功 → 更新数据 + 提示
保存失败 → 显示错误 + 回滚
```

#### 2.3.2 编辑器映射

```typescript
// 字段类型 → 编辑器组件
const editorMap = {
  name: TextEditor,           // 文本输入框
  startDate: DateEditor,      // 日期选择器
  endDate: DateEditor,
  type: SelectEditor,         // 下拉选择
  status: SelectEditor,
  priority: SelectEditor,
  owner: UserSelectEditor,    // 人员选择器
  progress: SliderEditor,     // 进度滑块
};
```

#### 2.3.3 数据校验规则

```typescript
const validationRules = {
  name: {
    required: true,
    maxLength: 100,
    pattern: /^[\u4e00-\u9fa5a-zA-Z0-9\s\-_]+$/,
  },
  startDate: {
    required: true,
    mustBeforeEndDate: true,
  },
  endDate: {
    mustAfterStartDate: true,
  },
  owner: {
    mustBeValidUser: true,
  },
};
```

### 2.4 批量操作设计

#### 2.4.1 批量操作栏

```typescript
interface BatchOperations {
  delete: () => void;                    // 批量删除
  setStatus: (status: string) => void;   // 批量设置状态
  setPriority: (priority: string) => void;  // 批量设置优先级
  assignOwner: (owner: string) => void;  // 批量分配负责人
  export: () => void;                    // 导出选中项
}
```

#### 2.4.2 批量操作确认

```
用户选择批量删除
    ↓
显示确认对话框：
┌────────────────────────────────────┐
│ ⚠️  确认批量删除                    │
├────────────────────────────────────┤
│ 您将删除 5 个任务：                 │
│ • 需求分析 (团队A)                  │
│ • 测试 (团队A)                      │
│ • ...                               │
│                                     │
│ 此操作不可恢复！                    │
│                                     │
│ [取消]            [确认删除]        │
└────────────────────────────────────┘
    ↓
确认 → 执行删除 → 更新表格 → 提示成功
取消 → 不执行
```

### 2.5 列自定义设计

#### 2.5.1 列设置面板

```
┌──────────────────────────────────┐
│ 列设置                  [× 关闭] │
├──────────────────────────────────┤
│ 显示列：                          │
│ ☑ Timeline                       │
│ ☑ 名称                           │
│ ☑ 类型                           │
│ ☑ 负责人                         │
│ ☑ 开始日期                       │
│ ☑ 结束日期                       │
│ ☐ 时长                           │
│ ☑ 进度                           │
│ ☑ 状态                           │
│ ☐ 优先级                         │
│ ☐ 依赖                           │
│                                   │
│ 列顺序（拖拽调整）：              │
│ ⋮⋮ Timeline                      │
│ ⋮⋮ 名称                          │
│ ⋮⋮ 负责人                        │
│ ⋮⋮ 开始日期                      │
│                                   │
│ [恢复默认]        [应用]          │
└──────────────────────────────────┘
```

#### 2.5.2 列配置持久化

```typescript
interface ColumnConfig {
  id: string;
  visible: boolean;
  width: number;
  order: number;
}

// 保存到 localStorage
const saveColumnConfig = (config: ColumnConfig[]) => {
  localStorage.setItem('table-column-config', JSON.stringify(config));
};
```

### 2.6 Excel批量导入设计

#### 2.6.1 导入流程

```
用户点击"导入"按钮
    ↓
选择Excel文件
    ↓
解析Excel
    ↓
┌────────────────────────────────────────┐
│ 导入预览                     [× 关闭]  │
├────────────────────────────────────────┤
│ 共解析 50 行，有效数据 48 行            │
│ 错误 2 行：第3行（缺少必填字段）        │
│           第15行（日期格式错误）        │
│                                         │
│ 字段映射：                              │
│ Excel列A → Timeline ✓                  │
│ Excel列B → 名称 ✓                      │
│ Excel列C → 类型 ✓                      │
│ Excel列D → 负责人 ✓                    │
│ Excel列E → 开始日期 ✓                  │
│                                         │
│ 预览前3行：                             │
│ ┌─────┬────────┬──────┬──────┬────┐   │
│ │Row  │Timeline│名称  │类型  │... │   │
│ ├─────┼────────┼──────┼──────┼────┤   │
│ │1 ✓  │团队A   │需求  │计划  │... │   │
│ │2 ✓  │团队B   │开发  │计划  │... │   │
│ │3 ❌ │团队C   │      │计划  │... │   │
│ └─────┴────────┴──────┴──────┴────┘   │
│                                         │
│ [取消]  [修正错误]  [导入有效数据(48)]  │
└────────────────────────────────────────┘
    ↓
确认导入 → 批量创建 → 更新表格 → 提示成功
```

#### 2.6.2 Excel模板

```typescript
const excelTemplate = {
  headers: [
    'Timeline',
    '名称 *',
    '类型 *',
    '负责人',
    '开始日期 *',
    '结束日期',
    '进度 (0-100)',
    '状态',
    '优先级',
    '备注',
  ],
  exampleRows: [
    ['团队A', '需求分析', '计划单元', '张三', '2026-02-15', '2026-02-20', '50', '进行中', 'P1', ''],
    ['团队B', '开发任务', '计划单元', '李四', '2026-03-01', '2026-03-15', '0', '未开始', 'P0', ''],
  ],
};
```

### 2.7 组件设计

#### 2.7.1 组件结构

```
TableView.tsx (主容器)
  ├── TableToolbar.tsx (工具栏)
  │   ├── SearchInput.tsx
  │   ├── FilterBar.tsx
  │   └── BatchOperationBar.tsx
  ├── EnhancedTable.tsx (表格主体)
  │   ├── EditableCell.tsx (可编辑单元格)
  │   │   ├── TextEditor.tsx
  │   │   ├── DateEditor.tsx
  │   │   ├── SelectEditor.tsx
  │   │   └── UserSelectEditor.tsx
  │   └── TablePagination.tsx
  ├── ColumnSettingsDialog.tsx (列设置)
  └── ImportDialog.tsx (导入对话框)
      ├── FileUploader.tsx
      ├── FieldMapper.tsx
      └── ImportPreview.tsx
```

#### 2.7.2 EditableCell 组件

```typescript
// src/components/views/table/EditableCell.tsx

import React, { useState, useCallback } from 'react';
import { message } from 'antd';

interface EditableCellProps<T> {
  value: T;
  rowId: string;
  columnId: string;
  editorType: 'text' | 'date' | 'select' | 'user';
  options?: any; // 对于select类型
  onSave: (rowId: string, columnId: string, value: T) => Promise<boolean>;
  validate?: (value: T) => string | null; // 返回错误信息或null
}

export function EditableCell<T>({
  value,
  rowId,
  columnId,
  editorType,
  options,
  onSave,
  validate,
}: EditableCellProps<T>) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [error, setError] = useState<string | null>(null);

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
    setEditValue(value);
    setError(null);
  }, [value]);

  const handleSave = useCallback(async () => {
    // 1. 验证
    if (validate) {
      const errorMsg = validate(editValue);
      if (errorMsg) {
        setError(errorMsg);
        message.error(errorMsg);
        return;
      }
    }

    // 2. 保存
    try {
      const success = await onSave(rowId, columnId, editValue);
      if (success) {
        setIsEditing(false);
        message.success('保存成功');
      }
    } catch (err) {
      message.error('保存失败：' + err.message);
    }
  }, [rowId, columnId, editValue, onSave, validate]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setEditValue(value);
    setError(null);
  }, [value]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  }, [handleSave, handleCancel]);

  if (isEditing) {
    return (
      <div className="editable-cell-editing">
        {renderEditor()}
        {error && <div className="error-text">{error}</div>}
      </div>
    );
  }

  return (
    <div
      className="editable-cell-display"
      onDoubleClick={handleDoubleClick}
      title="双击编辑"
    >
      {renderDisplay()}
    </div>
  );

  function renderEditor() {
    switch (editorType) {
      case 'text':
        return (
          <input
            autoFocus
            value={editValue as string}
            onChange={(e) => setEditValue(e.target.value as T)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
          />
        );
      case 'date':
        return <DateEditor value={editValue} onChange={setEditValue} onSave={handleSave} />;
      case 'select':
        return (
          <SelectEditor
            value={editValue}
            options={options}
            onChange={setEditValue}
            onSave={handleSave}
          />
        );
      case 'user':
        return <UserSelectEditor value={editValue} onChange={setEditValue} onSave={handleSave} />;
      default:
        return null;
    }
  }

  function renderDisplay() {
    // 根据类型格式化显示
    if (columnId === 'startDate' || columnId === 'endDate') {
      return formatDate(value as string);
    }
    return String(value);
  }
}
```

---

## 三、矩阵视图重设计

### 3.1 功能目标

- ✅ 产品×团队二维矩阵
- ✅ 工作量统计与热力图
- ✅ 优先级分层显示
- ✅ 单元格交互（点击查看明细、右键添加任务）
- ✅ 时间维度切换（月/季度/半年）

### 3.2 页面布局设计

```
┌────────────────────────────────────────────────────────────────┐
│ 矩阵视图 - 资源分析                                             │
├────────────────────────────────────────────────────────────────┤
│ 📅 时间维度: [按月▼] [2026年▼]                                 │
│ 🎯 显示模式: [工作量▼] [任务数] [按优先级]                     │
│                                                                  │
│ 图例: 🟢 <60人天  🟡 60-80人天  🔴 >80人天                    │
├────────────────────────────────────────────────────────────────┤
│ ┌──────────┬──────────┬──────────┬──────────┬──────────┬─────┐│
│ │产品\团队  │行车团队  │泊车团队  │安全团队  │平台团队  │汇总 ││
│ ├──────────┼──────────┼──────────┼──────────┼──────────┼─────┤│
│ │产品A     │ 45人天🟡│   -      │   -      │ 10人天🟢│ 55  ││
│ │行车系统  │ 5个任务  │          │          │ 1个任务  │     ││
│ │          │⚫2 🔴1🟠2│          │          │ 🟠1     │     ││
│ ├──────────┼──────────┼──────────┼──────────┼──────────┼─────┤│
│ │产品B     │   -      │ 85人天🔴│ 20人天🟢│ 15人天🟢│ 120 ││
│ │泊车系统  │          │ 8个任务  │ 2个任务  │ 2个任务  │     ││
│ │          │          │⚫3 🔴3🟠2│ 🟠2     │ 🟠2     │     ││
│ ├──────────┼──────────┼──────────┼──────────┼──────────┼─────┤│
│ │产品C     │ 30人天🟢│ 15人天🟢│ 90人天🔴│ 25人天🟢│ 160 ││
│ │主动安全  │ 3个任务  │ 2个任务  │ 9个任务  │ 3个任务  │     ││
│ │          │ 🔴2 🟠1 │ 🟠2     │⚫4 🔴3🟠2│ 🟠3     │     ││
│ ├──────────┼──────────┼──────────┼──────────┼──────────┼─────┤│
│ │产品D     │ 55人天🟡│ 40人天🟡│ 35人天🟢│ 20人天🟢│ 150 ││
│ │平台服务  │ 6个任务  │ 4个任务  │ 4个任务  │ 2个任务  │     ││
│ │          │⚫1 🔴3🟠2│🔴2 🟠2  │🔴2 🟠2  │ 🟠2     │     ││
│ ├──────────┼──────────┼──────────┼──────────┼──────────┼─────┤│
│ │汇总      │ 130人天  │ 140人天  │ 145人天  │ 70人天   │ 485 ││
│ │          │ 14任务   │ 14任务   │ 15任务   │ 8任务    │ 51  ││
│ └──────────┴──────────┴──────────┴──────────┴──────────┴─────┘│
│                                                                  │
│ 资源预警:                                                        │
│ 🔴 泊车团队 负载过高 (140人天，超出容量120人天)                 │
│ 🔴 安全团队 负载过高 (145人天，超出容量130人天)                 │
└────────────────────────────────────────────────────────────────┘
```

### 3.3 单元格设计

#### 3.3.1 单元格内容结构

```typescript
interface MatrixCellData {
  productId: string;
  teamId: string;
  
  // 工作量统计
  totalEffort: number;        // 总人天
  taskCount: number;          // 任务数
  
  // 优先级分布
  p0Count: number;            // ⚫ P0数量
  p1Count: number;            // 🔴 P1数量
  p2Count: number;            // 🟠 P2数量
  p3Count: number;            // 🟢 P3数量
  
  // 热力图
  heatLevel: 'low' | 'medium' | 'high';
  heatColor: string;          // #22c55e / #f59e0b / #ef4444
  
  // 关联任务
  lines: Line[];
}
```

#### 3.3.2 单元格交互

```
鼠标悬停 → 显示Tooltip
┌──────────────────────────────────┐
│ 产品A - 行车团队                  │
├──────────────────────────────────┤
│ 总工作量: 45人天                  │
│ 任务数: 5个                       │
│                                   │
│ 优先级分布:                       │
│ • P0: 2个任务 (18人天)            │
│ • P1: 1个任务 (15人天)            │
│ • P2: 2个任务 (12人天)            │
│                                   │
│ 负载状态: 中等 🟡                 │
│ 容量利用率: 75%                   │
│                                   │
│ 点击查看明细 >                    │
└──────────────────────────────────┘

左键点击 → 打开明细对话框
右键点击 → 显示菜单
  ├─ 添加任务
  ├─ 查看任务列表
  └─ 导出数据
```

### 3.4 明细对话框设计

```
┌──────────────────────────────────────────────────────────────┐
│ 产品A - 行车团队 任务明细                         [× 关闭]    │
├──────────────────────────────────────────────────────────────┤
│ 总工作量: 45人天  |  任务数: 5个  |  负载: 75% 🟡             │
├──────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────────┐  │
│ │ ⚫ P0 - 需求分析                                        │  │
│ │    负责人: 张三  |  工作量: 10人天  |  2026-02-15~02-25  │  │
│ │    进度: ████████░░ 80%                                │  │
│ ├────────────────────────────────────────────────────────┤  │
│ │ ⚫ P0 - 架构设计                                        │  │
│ │    负责人: 李四  |  工作量: 8人天   |  2026-02-26~03-05  │  │
│ │    进度: ██████░░░░ 60%                                │  │
│ ├────────────────────────────────────────────────────────┤  │
│ │ 🔴 P1 - 核心功能开发                                   │  │
│ │    负责人: 王五  |  工作量: 15人天  |  2026-03-06~03-22  │  │
│ │    进度: ███░░░░░░░ 30%                                │  │
│ ├────────────────────────────────────────────────────────┤  │
│ │ 🟠 P2 - 单元测试                                       │  │
│ │    负责人: 赵六  |  工作量: 6人天   |  2026-03-23~03-29  │  │
│ │    进度: ░░░░░░░░░░ 0%                                 │  │
│ ├────────────────────────────────────────────────────────┤  │
│ │ 🟠 P2 - 文档编写                                       │  │
│ │    负责人: 张三  |  工作量: 6人天   |  2026-03-30~04-05  │  │
│ │    进度: ░░░░░░░░░░ 0%                                 │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ [导出] [添加任务] [在甘特图中查看]                            │
└──────────────────────────────────────────────────────────────┘
```

### 3.5 数据计算逻辑

```typescript
// src/utils/matrixCalculator.ts

interface MatrixCalculatorInput {
  lines: Line[];
  timelines: Timeline[];
  products: Product[];
  teams: Team[];
  timeRange: {
    start: Date;
    end: Date;
  };
}

export class MatrixCalculator {
  /**
   * 计算矩阵数据
   */
  static calculate(input: MatrixCalculatorInput): MatrixData {
    const { lines, products, teams, timeRange } = input;
    
    // 1. 初始化矩阵
    const matrix: MatrixCellData[][] = [];
    for (let i = 0; i < products.length; i++) {
      matrix[i] = [];
      for (let j = 0; j < teams.length; j++) {
        matrix[i][j] = {
          productId: products[i].id,
          teamId: teams[j].id,
          totalEffort: 0,
          taskCount: 0,
          p0Count: 0,
          p1Count: 0,
          p2Count: 0,
          p3Count: 0,
          heatLevel: 'low',
          heatColor: '#22c55e',
          lines: [],
        };
      }
    }
    
    // 2. 遍历所有Line，分配到对应单元格
    for (const line of lines) {
      // 判断Line是否在时间范围内
      if (!this.isInTimeRange(line, timeRange)) {
        continue;
      }
      
      // 获取产品和团队
      const productId = line.attributes?.productLine;
      const teamId = this.getTeamFromTimeline(line.timelineId, input.timelines);
      
      if (!productId || !teamId) continue;
      
      // 找到对应单元格
      const productIndex = products.findIndex(p => p.id === productId);
      const teamIndex = teams.findIndex(t => t.id === teamId);
      
      if (productIndex === -1 || teamIndex === -1) continue;
      
      const cell = matrix[productIndex][teamIndex];
      
      // 3. 累加工作量
      const effort = line.attributes?.effort || 0;
      cell.totalEffort += effort;
      cell.taskCount += 1;
      
      // 4. 优先级分布
      const priority = line.attributes?.priority || 'P3';
      if (priority === 'P0') cell.p0Count += 1;
      else if (priority === 'P1') cell.p1Count += 1;
      else if (priority === 'P2') cell.p2Count += 1;
      else cell.p3Count += 1;
      
      // 5. 关联Line
      cell.lines.push(line);
    }
    
    // 6. 计算热力图等级
    for (let i = 0; i < products.length; i++) {
      for (let j = 0; j < teams.length; j++) {
        const cell = matrix[i][j];
        const team = teams[j];
        
        // 根据团队容量计算负载率
        const loadRate = team.capacity > 0 ? cell.totalEffort / team.capacity : 0;
        
        if (loadRate < 0.6) {
          cell.heatLevel = 'low';
          cell.heatColor = '#22c55e'; // green
        } else if (loadRate < 0.8) {
          cell.heatLevel = 'medium';
          cell.heatColor = '#f59e0b'; // yellow
        } else {
          cell.heatLevel = 'high';
          cell.heatColor = '#ef4444'; // red
        }
      }
    }
    
    return {
      matrix,
      products,
      teams,
      summary: this.calculateSummary(matrix, products, teams),
    };
  }
  
  /**
   * 计算汇总
   */
  private static calculateSummary(
    matrix: MatrixCellData[][],
    products: Product[],
    teams: Team[]
  ): MatrixSummary {
    const rowSummary: number[] = new Array(products.length).fill(0);
    const colSummary: number[] = new Array(teams.length).fill(0);
    let total = 0;
    
    for (let i = 0; i < products.length; i++) {
      for (let j = 0; j < teams.length; j++) {
        const effort = matrix[i][j].totalEffort;
        rowSummary[i] += effort;
        colSummary[j] += effort;
        total += effort;
      }
    }
    
    return { rowSummary, colSummary, total };
  }
  
  /**
   * 检测资源预警
   */
  static detectWarnings(matrix: MatrixData): ResourceWarning[] {
    const warnings: ResourceWarning[] = [];
    
    for (let j = 0; j < matrix.teams.length; j++) {
      const team = matrix.teams[j];
      const totalEffort = matrix.summary.colSummary[j];
      
      if (totalEffort > team.capacity) {
        warnings.push({
          type: 'overload',
          teamId: team.id,
          teamName: team.name,
          totalEffort,
          capacity: team.capacity,
          overload: totalEffort - team.capacity,
        });
      }
    }
    
    return warnings;
  }
}
```

### 3.6 组件设计

```
MatrixView.tsx (主容器)
  ├── MatrixToolbar.tsx (工具栏)
  │   ├── TimeDimensionSelector.tsx (时间维度)
  │   ├── DisplayModeSelector.tsx (显示模式)
  │   └── MatrixLegend.tsx (图例)
  ├── MatrixGrid.tsx (矩阵网格)
  │   ├── MatrixHeader.tsx (表头)
  │   ├── MatrixRow.tsx (行)
  │   │   └── MatrixCell.tsx (单元格)
  │   │       ├── CellContent.tsx (内容)
  │   │       ├── CellTooltip.tsx (提示)
  │   │       └── CellContextMenu.tsx (右键菜单)
  │   └── MatrixSummary.tsx (汇总行列)
  ├── MatrixDetailDialog.tsx (明细对话框)
  └── ResourceWarnings.tsx (资源预警)
```

---

## 四、版本计划增强

### 4.1 功能目标

- ✅ 版本管理（CRUD）
- ✅ 门禁管理
- ✅ 版本切换与对比
- ✅ 版本基线
- ✅ 版本看板视图

### 4.2 页面布局设计

```
┌──────────────────────────────────────────────────────────────┐
│ 版本计划                            [+新建版本] [版本对比]     │
├──────────────────────────────────────────────────────────────┤
│ 当前版本: [V1.1 Beta ▼]                                       │
├──────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────────┐  │
│ │ 📦 V1.0  Alpha版本                   [编辑] [删除]      │  │
│ │ 发布日期: 2026-03-15  |  状态: ✅ 已发布                │  │
│ │ ───────────────────────────────────────────────────────│  │
│ │ 📊 概览:                                                │  │
│ │ • 总任务: 48个                                          │  │
│ │ • 完成: 48个 (100%)                                     │  │
│ │ • 工作量: 285人天                                       │  │
│ │ • 门禁: 8/8 通过 ✅                                     │  │
│ │                                                         │  │
│ │ 🏁 里程碑:                                              │  │
│ │ • ✅ M1: 需求评审完成 (2026-02-20)                      │  │
│ │ • ✅ M2: 开发完成 (2026-03-10)                          │  │
│ │ • ✅ M3: 测试完成 (2026-03-15)                          │  │
│ │                                                         │  │
│ │ 🔒 门禁状态: [查看详情]                                 │  │
│ │ ✅✅✅✅✅✅✅✅                                          │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ 📦 V1.1  Beta版本                    [编辑] [删除]      │  │
│ │ 发布日期: 2026-04-30  |  状态: 🟡 进行中               │  │
│ │ ───────────────────────────────────────────────────────│  │
│ │ 📊 概览:                                                │  │
│ │ • 总任务: 62个                                          │  │
│ │ • 完成: 28个 (45%)                                      │  │
│ │ • 进行中: 20个                                          │  │
│ │ • 未开始: 14个                                          │  │
│ │ • 工作量: 385人天 (完成 175人天)                        │  │
│ │ • 门禁: 5/10 通过 🟡                                    │  │
│ │                                                         │  │
│ │ 📈 进度:                                                │  │
│ │ ██████████████████░░░░░░░░░░░░░░░░░░░░░░ 45%          │  │
│ │                                                         │  │
│ │ 🏁 里程碑:                                              │  │
│ │ • ✅ M1: 需求评审完成 (2026-03-20)                      │  │
│ │ • 🟡 M2: 开发完成 (2026-04-15) - 进行中                │  │
│ │ • ⭕ M3: 测试完成 (2026-04-30)                          │  │
│ │                                                         │  │
│ │ 🔒 门禁状态: [查看详情]                                 │  │
│ │ ✅✅✅✅✅⭕⭕⭕⭕⭕                                        │  │
│ │                                                         │  │
│ │ ⚠️  风险提示:                                           │  │
│ │ • 泊车团队资源不足，可能影响M2里程碑                     │  │
│ │ • 3个P0任务进度落后                                     │  │
│ └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### 4.3 版本编辑对话框

```
┌────────────────────────────────────────────────────────────┐
│ 编辑版本 - V1.1                                  [× 关闭]   │
├────────────────────────────────────────────────────────────┤
│ 基本信息:                                                   │
│ ┌────────────────────────────────────────────────────────┐│
│ │ 版本名称: [V1.1                              ] *必填    ││
│ │                                                         ││
│ │ 版本类型: [Beta▼] (Alpha/Beta/RC/Release)              ││
│ │                                                         ││
│ │ 发布日期: [2026-04-30] *必填                           ││
│ │                                                         ││
│ │ 状态: [进行中▼] (规划中/进行中/已发布/已取消)           ││
│ │                                                         ││
│ │ 描述:                                                   ││
│ │ ┌─────────────────────────────────────────────────────┐││
│ │ │ 第二个Beta版本，包含核心功能优化和性能提升...       │││
│ │ │                                                     │││
│ │ └─────────────────────────────────────────────────────┘││
│ └────────────────────────────────────────────────────────┘│
│                                                             │
│ 里程碑:                                                     │
│ ┌────────────────────────────────────────────────────────┐│
│ │ ✅ M1: 需求评审完成  2026-03-20  [编辑] [删除]         ││
│ │ 🟡 M2: 开发完成      2026-04-15  [编辑] [删除]         ││
│ │ ⭕ M3: 测试完成      2026-04-30  [编辑] [删除]         ││
│ │                                                         ││
│ │ [+ 添加里程碑]                                          ││
│ └────────────────────────────────────────────────────────┘│
│                                                             │
│ 门禁设置: [管理门禁]                                        │
│ ┌────────────────────────────────────────────────────────┐│
│ │ ✅ 代码审查通过 (5/5)                                   ││
│ │ ✅ 单元测试覆盖率>80% (85%)                             ││
│ │ ✅ 集成测试通过 (8/8)                                   ││
│ │ ⭕ 性能测试通过                                         ││
│ │ ⭕ 安全扫描通过                                         ││
│ │ ... (共10个门禁)                                        ││
│ └────────────────────────────────────────────────────────┘│
│                                                             │
│ [取消]                                    [保存]            │
└────────────────────────────────────────────────────────────┘
```

### 4.4 门禁管理

```
┌────────────────────────────────────────────────────────────┐
│ 门禁管理 - V1.1                                  [× 关闭]   │
├────────────────────────────────────────────────────────────┤
│ [+ 添加门禁]                                     总计: 10个 │
├────────────────────────────────────────────────────────────┤
│ 🔒 质量门禁 (5个)                                           │
│ ┌────────────────────────────────────────────────────────┐│
│ │ ✅ G1: 代码审查通过                                     ││
│ │    检查项: 所有MR已审查 (5/5)                           ││
│ │    负责人: 张三                                         ││
│ │    完成时间: 2026-04-10                                 ││
│ │    [查看明细] [编辑] [删除]                             ││
│ ├────────────────────────────────────────────────────────┤│
│ │ ✅ G2: 单元测试覆盖率>80%                               ││
│ │    检查项: 当前覆盖率 85%                               ││
│ │    负责人: 李四                                         ││
│ │    完成时间: 2026-04-12                                 ││
│ │    [查看明细] [编辑] [删除]                             ││
│ ├────────────────────────────────────────────────────────┤│
│ │ ✅ G3: 集成测试通过                                     ││
│ │    检查项: 所有集成测试通过 (8/8)                       ││
│ │    负责人: 王五                                         ││
│ │    完成时间: 2026-04-14                                 ││
│ │    [查看明细] [编辑] [删除]                             ││
│ ├────────────────────────────────────────────────────────┤│
│ │ ⭕ G4: 性能测试通过                                     ││
│ │    检查项: 响应时间<200ms, CPU<70%, 内存<2GB           ││
│ │    负责人: 赵六                                         ││
│ │    计划时间: 2026-04-20                                 ││
│ │    [查看明细] [编辑] [删除]                             ││
│ ├────────────────────────────────────────────────────────┤│
│ │ ⭕ G5: 安全扫描通过                                     ││
│ │    检查项: 无高危漏洞, 无中危漏洞                       ││
│ │    负责人: 孙七                                         ││
│ │    计划时间: 2026-04-22                                 ││
│ │    [查看明细] [编辑] [删除]                             ││
│ └────────────────────────────────────────────────────────┘│
│                                                             │
│ 🔐 发布门禁 (5个)                                           │
│ ┌────────────────────────────────────────────────────────┐│
│ │ ⭕ G6: 文档完成                                         ││
│ │ ⭕ G7: 客户验收                                         ││
│ │ ⭕ G8: 生产环境部署                                     ││
│ │ ⭕ G9: 发布说明准备                                     ││
│ │ ⭕ G10: 培训材料完成                                    ││
│ └────────────────────────────────────────────────────────┘│
│                                                             │
│ 进度: 5/10 通过 (50%)                                       │
│ ██████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░ 50%    │
└────────────────────────────────────────────────────────────┘
```

### 4.5 版本对比视图

```
┌────────────────────────────────────────────────────────────┐
│ 版本对比                                         [× 关闭]   │
├────────────────────────────────────────────────────────────┤
│ 基准版本: [V1.0 ▼]       对比版本: [V1.1 ▼]                │
├────────────────────────────────────────────────────────────┤
│ ┌─────────────────────┬─────────────────────────────────┐  │
│ │ 指标                 │ V1.0        │ V1.1       │ 变化 │  │
│ ├─────────────────────┼─────────────┼────────────┼─────┤  │
│ │ 总任务数             │ 48          │ 62         │+14  │  │
│ │ 总工作量             │ 285人天     │ 385人天    │+100 │  │
│ │ 里程碑数             │ 3           │ 3          │ 0   │  │
│ │ 门禁数               │ 8           │ 10         │ +2  │  │
│ │ 发布日期             │ 2026-03-15  │ 2026-04-30 │+46天│  │
│ └─────────────────────┴─────────────┴────────────┴─────┘  │
│                                                             │
│ 任务变更明细:                                               │
│ ┌────────────────────────────────────────────────────────┐│
│ │ 🟢 新增 (18个):                                         ││
│ │ • 新功能A开发 (团队A, 15人天)                           ││
│ │ • 新功能B开发 (团队B, 20人天)                           ││
│ │ • 性能优化 (团队C, 10人天)                              ││
│ │ ...                                                     ││
│ ├────────────────────────────────────────────────────────┤│
│ │ 🔴 删除 (4个):                                          ││
│ │ • 原型设计 (已完成，不在V1.1范围)                       ││
│ │ • 初步测试 (合并到集成测试)                             ││
│ │ ...                                                     ││
│ ├────────────────────────────────────────────────────────┤│
│ │ 🟡 修改 (8个):                                          ││
│ │ • 核心功能开发: 工作量 20人天 → 25人天                 ││
│ │ • 集成测试: 日期 03-10 → 04-20                         ││
│ │ ...                                                     ││
│ └────────────────────────────────────────────────────────┘│
│                                                             │
│ [导出对比报告]                            [在甘特图中查看]  │
└────────────────────────────────────────────────────────────┘
```

### 4.6 数据模型

```typescript
// src/types/version.ts

export interface Version {
  id: string;
  name: string;                    // V1.0, V1.1
  type: 'alpha' | 'beta' | 'rc' | 'release';
  releaseDate: Date;
  status: 'planning' | 'in-progress' | 'released' | 'cancelled';
  description?: string;
  
  // 里程碑
  milestones: Milestone[];
  
  // 门禁
  gates: Gate[];
  
  // 基线快照
  baselineId?: string;
  
  // 统计数据（计算得出）
  stats: {
    totalTasks: number;
    completedTasks: number;
    totalEffort: number;
    completedEffort: number;
    progress: number;           // 0-100
    gatesPassedCount: number;
    gatesTotal: number;
  };
  
  // 元数据
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface Milestone {
  id: string;
  versionId: string;
  name: string;
  date: Date;
  status: 'completed' | 'in-progress' | 'pending';
  linkedLineId?: string;        // 关联的TimePlan Line
  description?: string;
}

export interface Gate {
  id: string;
  versionId: string;
  name: string;
  type: 'quality' | 'security' | 'performance' | 'release';
  status: 'passed' | 'failed' | 'pending';
  
  // 检查项
  checkItems: GateCheckItem[];
  
  // 负责人
  owner: string;
  
  // 时间
  plannedDate?: Date;
  completedDate?: Date;
  
  // 备注
  notes?: string;
}

export interface GateCheckItem {
  id: string;
  name: string;
  description?: string;
  status: 'passed' | 'failed' | 'pending';
  result?: string;              // 检查结果描述
}

export interface VersionComparison {
  baseVersion: Version;
  compareVersion: Version;
  
  diff: {
    addedTasks: Line[];
    removedTasks: Line[];
    modifiedTasks: Array<{
      line: Line;
      changes: Array<{
        field: string;
        oldValue: any;
        newValue: any;
      }>;
    }>;
  };
  
  statsDiff: {
    tasksDiff: number;
    effortDiff: number;
    daysDiff: number;
  };
}
```

---

## 五、迭代规划增强

### 5.1 功能目标

- ✅ 数据持久化（与TimePlan集成）
- ✅ MR编辑功能
- ✅ 团队工作量统计
- ✅ 迭代看板视图

### 5.2 数据持久化设计

#### 5.2.1 数据关联策略

```typescript
// IterationTask 与 Line 的双向绑定

// 策略1: 轻量级关联（推荐）
interface IterationTask {
  id: string;
  mrId: string;
  // ...
  
  // 关联TimePlan Line
  linkedLineId?: string;
  
  // 快照数据（避免频繁查询）
  snapshot: {
    name: string;
    startDate: string;
    endDate: string;
    owner: string;
  };
}

// 策略2: 直接同步（备选）
// IterationTask的字段直接从Line读取，不存储冗余数据
```

#### 5.2.2 同步机制

```typescript
// src/hooks/useIterationSync.ts

export function useIterationSync() {
  const { data: timeplanData, setData } = useTimeplanContext();
  const [iterationTasks, setIterationTasks] = useState<IterationTask[]>([]);
  
  /**
   * 创建IterationTask时，同步创建或关联Line
   */
  const createIterationTask = useCallback(async (task: Omit<IterationTask, 'id'>) => {
    // 1. 创建IterationTask
    const newTask: IterationTask = {
      ...task,
      id: generateId(),
    };
    
    // 2. 创建或关联Line
    let linkedLineId: string | undefined;
    
    // 检查是否已存在对应的Line
    const existingLine = timeplanData.lines.find(
      line => line.attributes?.mrId === task.mrId
    );
    
    if (existingLine) {
      // 使用现有Line
      linkedLineId = existingLine.id;
    } else {
      // 创建新Line
      const newLine: Line = {
        id: generateId(),
        name: task.name,
        timelineId: task.teamId,  // 假设teamId对应timeline
        type: 'bar',
        startDate: task.startDate,
        endDate: task.endDate,
        attributes: {
          mrId: task.mrId,
          effort: task.effort,
          progress: task.progress,
          status: task.status,
          owner: task.owner,
        },
      };
      
      // 添加到timeplanData
      setData(prev => ({
        ...prev,
        lines: [...prev.lines, newLine],
      }));
      
      linkedLineId = newLine.id;
    }
    
    // 3. 更新IterationTask的关联
    newTask.linkedLineId = linkedLineId;
    
    // 4. 保存到state和localStorage
    setIterationTasks(prev => [...prev, newTask]);
    saveToStorage([...iterationTasks, newTask]);
    
    return newTask;
  }, [timeplanData, setData, iterationTasks]);
  
  /**
   * 更新IterationTask时，同步更新Line
   */
  const updateIterationTask = useCallback(async (
    taskId: string,
    updates: Partial<IterationTask>
  ) => {
    // 1. 找到IterationTask
    const task = iterationTasks.find(t => t.id === taskId);
    if (!task) return;
    
    // 2. 更新IterationTask
    const updatedTask = { ...task, ...updates };
    setIterationTasks(prev =>
      prev.map(t => t.id === taskId ? updatedTask : t)
    );
    
    // 3. 同步更新Line
    if (task.linkedLineId) {
      setData(prev => ({
        ...prev,
        lines: prev.lines.map(line =>
          line.id === task.linkedLineId
            ? {
                ...line,
                name: updatedTask.name,
                startDate: updatedTask.startDate,
                endDate: updatedTask.endDate,
                attributes: {
                  ...line.attributes,
                  effort: updatedTask.effort,
                  progress: updatedTask.progress,
                  status: updatedTask.status,
                  owner: updatedTask.owner,
                },
              }
            : line
        ),
      }));
    }
    
    // 4. 保存
    saveToStorage(iterationTasks.map(t => t.id === taskId ? updatedTask : t));
  }, [iterationTasks, setData]);
  
  /**
   * Line更新时，同步更新IterationTask
   */
  useEffect(() => {
    // 监听Line变化
    const syncFromLines = () => {
      setIterationTasks(prev =>
        prev.map(task => {
          if (!task.linkedLineId) return task;
          
          const line = timeplanData.lines.find(l => l.id === task.linkedLineId);
          if (!line) return task;
          
          // 同步字段
          return {
            ...task,
            name: line.name,
            startDate: line.startDate,
            endDate: line.endDate,
            owner: line.attributes?.owner || task.owner,
            effort: line.attributes?.effort || task.effort,
            progress: line.attributes?.progress || task.progress,
            status: line.attributes?.status || task.status,
          };
        })
      );
    };
    
    syncFromLines();
  }, [timeplanData.lines]);
  
  return {
    iterationTasks,
    createIterationTask,
    updateIterationTask,
    deleteIterationTask,
  };
}
```

### 5.3 MR编辑功能

```
┌────────────────────────────────────────────────────────────┐
│ 编辑MR                                           [× 关闭]   │
├────────────────────────────────────────────────────────────┤
│ 基本信息:                                                   │
│ ┌────────────────────────────────────────────────────────┐│
│ │ MR名称: [核心功能开发                        ] *必填    ││
│ │                                                         ││
│ │ MR ID: [MR-2024-0315]                                   ││
│ │                                                         ││
│ │ 产品: [产品A - 行车系统▼]                               ││
│ │                                                         ││
│ │ 团队: [行车团队▼]                                       ││
│ │                                                         ││
│ │ 模块: [核心模块▼]                                       ││
│ │                                                         ││
│ │ 迭代: [Sprint-05▼]                                      ││
│ └────────────────────────────────────────────────────────┘│
│                                                             │
│ 时间与工作量:                                               │
│ ┌────────────────────────────────────────────────────────┐│
│ │ 开始日期: [2026-03-15]                                  ││
│ │                                                         ││
│ │ 结束日期: [2026-03-29]                                  ││
│ │                                                         ││
│ │ 工作量: [15] 人天                                       ││
│ │                                                         ││
│ │ 负责人: [张三▼]                                         ││
│ └────────────────────────────────────────────────────────┘│
│                                                             │
│ 状态与优先级:                                               │
│ ┌────────────────────────────────────────────────────────┐│
│ │ 状态: [进行中▼] (未开始/进行中/已完成)                  ││
│ │                                                         ││
│ │ 优先级: [P1▼] (P0/P1/P2/P3)                             ││
│ │                                                         ││
│ │ 进度: [░░░░░░░░░░] 60%                                  ││
│ └────────────────────────────────────────────────────────┘│
│                                                             │
│ 依赖关系:                                                   │
│ ┌────────────────────────────────────────────────────────┐│
│ │ 依赖的MR (前置任务):                                    ││
│ │ • MR-2024-0310: 架构设计 (已完成) ✅                    ││
│ │ • MR-2024-0312: 接口定义 (已完成) ✅                    ││
│ │                                                         ││
│ │ [+ 添加依赖]                                            ││
│ │                                                         ││
│ │ 被依赖的MR (后置任务):                                  ││
│ │ • MR-2024-0320: 单元测试 (进行中) 🟡                   ││
│ │ • MR-2024-0325: 集成测试 (未开始) ⭕                   ││
│ └────────────────────────────────────────────────────────┘│
│                                                             │
│ 备注:                                                       │
│ ┌────────────────────────────────────────────────────────┐│
│ │                                                         ││
│ │                                                         ││
│ └────────────────────────────────────────────────────────┘│
│                                                             │
│ [删除MR]                          [取消]       [保存]      │
└────────────────────────────────────────────────────────────┘
```

### 5.4 团队工作量统计

```
┌────────────────────────────────────────────────────────────┐
│ 团队工作量统计 - Sprint 05                                  │
├────────────────────────────────────────────────────────────┤
│ ┌────────────┬──────────┬──────────┬──────────┬──────────┐│
│ │ 团队       │ 总工作量 │ 容量     │ 负载率   │ 状态     ││
│ ├────────────┼──────────┼──────────┼──────────┼──────────┤│
│ │ 行车团队   │ 45人天   │ 60人天   │ 75%      │ 正常🟢  ││
│ │            │ ███████████████████████████░░░░░░░░ 75%    ││
│ │            │ 5个MR, 3人, 平均15人天/人                   ││
│ ├────────────┼──────────┼──────────┼──────────┼──────────┤│
│ │ 泊车团队   │ 68人天   │ 80人天   │ 85%      │ 偏高🟡  ││
│ │            │ ████████████████████████████████░░░░ 85%   ││
│ │            │ 6个MR, 4人, 平均17人天/人                   ││
│ ├────────────┼──────────┼──────────┼──────────┼──────────┤│
│ │ 安全团队   │ 95人天   │ 90人天   │ 106%     │ 超载🔴  ││
│ │            │ ████████████████████████████████████ 106%  ││
│ │            │ 8个MR, 5人, 平均19人天/人                   ││
│ │            │ ⚠️  超出容量 5人天                          ││
│ ├────────────┼──────────┼──────────┼──────────┼──────────┤│
│ │ 平台团队   │ 32人天   │ 50人天   │ 64%      │ 正常🟢  ││
│ │            │ ████████████████████████░░░░░░░░░░░░ 64%   ││
│ │            │ 3个MR, 2人, 平均16人天/人                   ││
│ └────────────┴──────────┴──────────┴──────────┴──────────┘│
│                                                             │
│ 整体统计:                                                   │
│ • 总工作量: 240人天                                         │
│ • 总容量: 280人天                                           │
│ • 平均负载率: 86%                                           │
│ • MR总数: 22个                                              │
│ • 参与人数: 14人                                            │
│                                                             │
│ 风险提示:                                                   │
│ ⚠️  安全团队负载超出容量，建议调整排期或增加资源             │
└────────────────────────────────────────────────────────────┘
```

---

## 六、数据模型设计

### 6.1 扩展TimeplanData

```typescript
// src/types/timeplanSchema.ts

export interface TimeplanDataExtended extends TimeplanData {
  // 原有字段
  timelines: Timeline[];
  lines: Line[];
  relations: Relation[];
  baselines?: Baseline[];
  baselineRanges?: BaselineRange[];
  
  // 新增字段
  versions?: Version[];              // 版本管理
  iterationTasks?: IterationTask[];  // 迭代任务
  products?: Product[];              // 产品配置
  teams?: Team[];                    // 团队配置
  modules?: Module[];                // 模块配置
  columnConfig?: ColumnConfig[];     // 表格列配置
}
```

### 6.2 新增数据结构

```typescript
// 产品
export interface Product {
  id: string;
  name: string;
  code: string;              // 产品代码，如 "ADAS"
  icon?: string;             // 图标
  color: string;             // 主题色
  description?: string;
}

// 团队
export interface Team {
  id: string;
  name: string;
  capacity: number;          // 容量（人天/迭代）
  members: TeamMember[];
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;              // 角色
  capacity: number;          // 个人容量（人天/迭代）
}

// 模块
export interface Module {
  id: string;
  name: string;
  productId: string;
  teamId: string;
  description?: string;
}

// 迭代任务
export interface IterationTask {
  id: string;
  mrId: string;
  name: string;
  
  // 分配
  productId: string;
  teamId: string;
  moduleId: string;
  sprintId: string;          // 迭代ID，如 "Sprint-05"
  
  // 时间
  startDate: string;
  endDate: string;
  
  // 工作量与进度
  effort: number;            // 人天
  progress: number;          // 0-100
  status: 'todo' | 'in-progress' | 'done';
  
  // 人员
  owner: string;
  
  // 优先级
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  
  // 依赖
  dependencies: string[];    // 依赖的IterationTask ID
  
  // 关联TimePlan Line
  linkedLineId?: string;
  
  // 元数据
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 七、组件架构

### 7.1 状态管理架构

```typescript
// src/stores/useTimeplanStore.ts (使用zustand)

import create from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface TimeplanStore {
  // 数据
  data: TimeplanDataExtended;
  
  // 视图状态
  viewState: {
    currentView: 'gantt' | 'table' | 'matrix' | 'version' | 'iteration';
    editMode: boolean;
    selectedIds: string[];
  };
  
  // Actions
  setData: (data: TimeplanDataExtended) => void;
  updateLine: (id: string, updates: Partial<Line>) => void;
  deleteLine: (id: string) => void;
  addVersion: (version: Version) => void;
  updateVersion: (id: string, updates: Partial<Version>) => void;
  // ...更多actions
}

export const useTimeplanStore = create<TimeplanStore>()(
  persist(
    immer((set) => ({
      data: {
        timelines: [],
        lines: [],
        relations: [],
        versions: [],
        iterationTasks: [],
        products: [],
        teams: [],
        modules: [],
      },
      viewState: {
        currentView: 'gantt',
        editMode: false,
        selectedIds: [],
      },
      setData: (data) => set({ data }),
      updateLine: (id, updates) =>
        set((state) => {
          const lineIndex = state.data.lines.findIndex((l) => l.id === id);
          if (lineIndex !== -1) {
            state.data.lines[lineIndex] = {
              ...state.data.lines[lineIndex],
              ...updates,
            };
          }
        }),
      // ...
    })),
    {
      name: 'timeplan-store',
      storage: createIndexedDBStorage(), // 使用IndexedDB
    }
  )
);
```

### 7.2 目录结构

```
src/
├── components/
│   ├── views/
│   │   ├── table/
│   │   │   ├── TableView.tsx
│   │   │   ├── EnhancedTable.tsx
│   │   │   ├── EditableCell.tsx
│   │   │   ├── editors/
│   │   │   │   ├── TextEditor.tsx
│   │   │   │   ├── DateEditor.tsx
│   │   │   │   ├── SelectEditor.tsx
│   │   │   │   └── UserSelectEditor.tsx
│   │   │   ├── TableToolbar.tsx
│   │   │   ├── BatchOperationBar.tsx
│   │   │   ├── ColumnSettingsDialog.tsx
│   │   │   └── ImportDialog.tsx
│   │   ├── matrix/
│   │   │   ├── MatrixView.tsx
│   │   │   ├── MatrixGrid.tsx
│   │   │   ├── MatrixCell.tsx
│   │   │   ├── MatrixDetailDialog.tsx
│   │   │   └── ResourceWarnings.tsx
│   │   ├── version/
│   │   │   ├── VersionPlanView.tsx
│   │   │   ├── VersionCard.tsx
│   │   │   ├── VersionEditDialog.tsx
│   │   │   ├── GateManagementDialog.tsx
│   │   │   └── VersionComparisonDialog.tsx
│   │   └── iteration/
│   │       ├── IterationView.tsx (现有)
│   │       ├── MREditDialog.tsx
│   │       └── TeamWorkloadPanel.tsx
│   ├── timeline/ (现有)
│   └── common/ (现有)
├── stores/
│   ├── useTimeplanStore.ts
│   ├── useVersionStore.ts
│   └── useIterationStore.ts
├── hooks/
│   ├── useEditableTable.ts
│   ├── useMatrixData.ts
│   ├── useVersionManager.ts
│   └── useIterationSync.ts
├── utils/
│   ├── matrixCalculator.ts
│   ├── versionComparator.ts
│   ├── excelImporter.ts
│   └── validation.ts
└── types/
    ├── timeplanSchema.ts
    ├── version.ts
    ├── iteration.ts
    └── matrix.ts
```

---

## 八、实施计划

### 8.1 Phase 1: 表格视图增强 (2周)

**Week 1: 行内编辑**
- [ ] Day 1-2: EditableCell组件 + 基础编辑器
- [ ] Day 3-4: 各类型编辑器（Text/Date/Select/User）
- [ ] Day 5: 数据校验与错误处理

**Week 2: 批量操作与列自定义**
- [ ] Day 1-2: 批量选择与批量操作
- [ ] Day 3: 列设置与拖拽排序
- [ ] Day 4: Excel导入功能
- [ ] Day 5: 测试与优化

### 8.2 Phase 2: 矩阵视图重设计 (2周)

**Week 3: 数据计算与布局**
- [ ] Day 1-2: MatrixCalculator工具类
- [ ] Day 3-4: MatrixGrid组件 + 热力图
- [ ] Day 5: 汇总行列与图例

**Week 4: 交互与明细**
- [ ] Day 1-2: 单元格交互（点击/右键）
- [ ] Day 3: MatrixDetailDialog
- [ ] Day 4: 资源预警
- [ ] Day 5: 测试与优化

### 8.3 Phase 3: 版本计划增强 (1.5周)

**Week 5: 版本管理**
- [ ] Day 1-2: Version数据模型 + CRUD
- [ ] Day 3: VersionEditDialog
- [ ] Day 4: 版本切换器
- [ ] Day 5: 版本卡片展示

**Week 6 (前半周): 门禁管理**
- [ ] Day 1-2: GateManagementDialog
- [ ] Day 3: 版本对比功能

### 8.4 Phase 4: 迭代规划增强 (0.5周)

**Week 6 (后半周): 数据持久化与编辑**
- [ ] Day 4: useIterationSync hook
- [ ] Day 5: MREditDialog + TeamWorkloadPanel

### 8.5 Phase 5: 集成测试与优化 (1周)

**Week 7: 全面测试**
- [ ] Day 1-2: 单元测试
- [ ] Day 3: 集成测试
- [ ] Day 4: E2E测试
- [ ] Day 5: 性能优化与文档

### 8.6 总体时间线

```
Week 1-2: 表格视图增强      ████████████░░░░░░░░░░░░░░░░
Week 3-4: 矩阵视图重设计    ░░░░░░░░░░░░████████████░░░░░
Week 5-6: 版本计划 + 迭代   ░░░░░░░░░░░░░░░░░░░░░░░░████
Week 7:   测试与优化        ░░░░░░░░░░░░░░░░░░░░░░░░░░░░
                            ────────────────────────────
                            2周      4周      6周   7周
```

---

## 九、风险与挑战

### 9.1 技术风险

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| IndexedDB兼容性 | 中 | 提供localStorage降级方案 |
| 大数据量性能 | 高 | 虚拟滚动、分页、Web Worker |
| 数据一致性 | 高 | 双向同步机制、事务管理 |
| 状态管理复杂度 | 中 | 使用zustand简化，immer保证不可变 |

### 9.2 用户体验风险

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| 行内编辑学习成本 | 中 | 提供操作提示、引导动画 |
| 矩阵视图信息过载 | 中 | 分层显示、可折叠 |
| 版本管理概念混淆 | 中 | 明确文档、示例项目 |

### 9.3 进度风险

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| 矩阵视图重设计时间不足 | 高 | 采用迭代开发，先MVP后优化 |
| 测试时间不足 | 中 | 边开发边测试，自动化测试 |

---

## 十、验收标准

### 10.1 表格视图

- ✅ 支持至少10个字段的行内编辑
- ✅ 批量操作支持选中>100条数据
- ✅ Excel导入成功率>95%
- ✅ 列自定义配置能持久化
- ✅ 响应时间<200ms（1000条数据）

### 10.2 矩阵视图

- ✅ 正确计算产品×团队矩阵
- ✅ 热力图颜色准确反映负载
- ✅ 单元格点击查看明细
- ✅ 资源预警准确率>90%
- ✅ 支持至少20个产品×20个团队（400单元格）

### 10.3 版本计划

- ✅ 版本CRUD功能完整
- ✅ 门禁管理支持至少10个门禁
- ✅ 版本对比正确显示差异
- ✅ 版本基线与TimePlan基线集成

### 10.4 迭代规划

- ✅ IterationTask与Line双向同步
- ✅ MR编辑功能完整
- ✅ 团队工作量统计准确
- ✅ 数据持久化无丢失

---

## 附录

### A. 参考文档

- [领域项目&计划设计-功能差距分析报告](../../prds/领域项目&计划设计-功能差距分析报告.md)
- [Timeline-vs-Timeplan-功能对比分析报告](../../prds/Timeline-vs-Timeplan-功能对比分析报告.md)
- [Ant Design 6 文档](https://ant.design/components/overview-cn/)
- [Zustand 文档](https://zustand-demo.pmnd.rs/)
- [@tanstack/react-table 文档](https://tanstack.com/table/v8)

### B. 设计原型

原型文件位于：`prds/领域项目&计划设计/`

### C. 数据迁移

从当前版本迁移到新版本：

```typescript
// src/utils/dataMigration.ts

export function migrateToV3(oldData: TimeplanData): TimeplanDataExtended {
  return {
    ...oldData,
    versions: [],
    iterationTasks: [],
    products: defaultProducts,
    teams: defaultTeams,
    modules: [],
    columnConfig: defaultColumnConfig,
  };
}
```

---

**文档版本**: v1.0  
**最后更新**: 2026-02-10  
**下一步**: 评审会议，确认设计方案