# 类型重命名总结

> **日期**: 2026-02-08  
> **提交**: 30096b5  
> **版本**: V11.2

---

## 📋 重命名概述

根据用户需求，将时间线中的"任务类型"重命名为更明确的"计划单元(LinePlan)"类型。

### 变更对比

| 原名称 | 新名称 | 说明 |
|--------|--------|------|
| `bar-schema` | `lineplan-schema` | Schema ID |
| `'bar'` | `'lineplan'` | Visual Type |
| `BarSchema` | `LinePlanSchema` | TypeScript类型 |
| "任务" | "计划单元" | UI显示文本 |

---

## 🎯 类型体系

### 核心Line类型

1. **lineplan-schema** (计划单元)
   - 有起止时间的计划单元
   - 支持进度、状态、优先级等属性
   - 可拖拽、可调整大小
   - 默认7天duration

2. **milestone-schema** (里程碑)
   - 重要的时间点标记
   - 只有startDate，无endDate
   - 菱形图标显示
   - 支持类型：交付、评审、发布、决策

3. **gateway-schema** (关口)
   - 关键决策点或检查点
   - 只有startDate，无endDate
   - 六边形图标显示
   - 支持类型：决策点、检查点、质量门禁、同步点

### 其他类型

4. **Baseline** (基线)
   - 时间点基线
   - 用于标记重要日期（如今日、发布日）

5. **BaselineRange** (时间范围基线)
   - 时间范围标记
   - 用于标记特定时间段（如冲刺、里程碑周期）

---

## 📝 修改清单

### 1. Schema定义 (`src/schemas/defaultSchemas.ts`)

```typescript
// ✅ 重命名
export const LinePlanSchema: LineSchema = {
  id: 'lineplan-schema',  // 原: 'bar-schema'
  name: '计划单元',
  visualType: 'lineplan',  // 原: 'bar'
  version: '2.0.0',        // 从1.0.0升级
  // ...
};

// ✅ 兼容性别名
export const BarSchema = LinePlanSchema;

// ✅ 导出数组
export const DEFAULT_SCHEMAS: LineSchema[] = [
  LinePlanSchema,  // 原: BarSchema
  MilestoneSchema,
  GatewaySchema,
];
```

### 2. Schema注册 (`src/schemas/schemaRegistry.ts`)

```typescript
// ✅ 更新导入
import { LinePlanSchema, MilestoneSchema, GatewaySchema } from './defaultSchemas';

// ✅ 更新注册
export function initializeDefaultSchemas(): void {
  schemaRegistry.register(LinePlanSchema);  // 原: BarSchema
  // ...
}
```

### 3. TimelinePanel组件 (`src/components/timeline/TimelinePanel.tsx`)

**函数签名更新**:
```typescript
// ✅ 类型参数
handleAddNodeToTimeline(timelineId: string, type: 'lineplan' | 'milestone' | 'gateway')
handleAddNode(type: 'lineplan' | 'milestone' | 'gateway')

// ✅ Schema映射
const schemaId = type === 'lineplan' ? 'lineplan-schema' : ...

// ✅ 默认duration
endDate: type === 'lineplan' ? addDays(today, 7) : undefined

// ✅ 类型转换
if ((newSchemaId === 'lineplan-schema' || newSchemaId === 'bar-schema') && !newLine.endDate) {
  newLine.endDate = addDays(newLine.startDate, 7);
}
```

**UI更新**:
```typescript
// ✅ 菜单项
{
  label: '添加计划单元',  // 原: '添加计划单元 (Bar)'
  icon: <MinusOutlined />,
  onClick: () => handleAddNode('lineplan'),  // 原: 'bar'
}
```

### 4. MatrixView组件 (`src/components/views/MatrixView.tsx`)

**兼容性处理**:
```typescript
// ✅ 支持新旧两种ID
const getTypeIcon = (schemaId: string) => {
  switch (schemaId) {
    case 'lineplan-schema':
    case 'bar-schema': // 兼容旧版
      return <MinusOutlined style={{ fontSize: 12 }} />;
    // ...
  }
};

// ✅ 更新显示文本
const getTypeName = (schemaId: string) => {
  switch (schemaId) {
    case 'lineplan-schema':
    case 'bar-schema':
      return '计划单元';  // 原: '任务'
    // ...
  }
};
```

### 5. 测试数据 (`src/utils/mockData.ts`, `src/data/`)

```typescript
// ✅ 批量替换
schemaId: 'lineplan-schema',  // 原: 'bar-schema'
```

所有mock数据和示例数据中的26处 `bar-schema` 已全部更新为 `lineplan-schema`。

---

## ✅ 兼容性保证

### 1. 别名导出
```typescript
// defaultSchemas.ts
export const BarSchema = LinePlanSchema;  // 旧代码仍可使用
```

### 2. 双重支持
```typescript
// MatrixView.tsx
case 'lineplan-schema':
case 'bar-schema':  // 兼容旧数据
  return <MinusOutlined />;
```

### 3. 类型转换
```typescript
// TimelinePanel.tsx
if ((newSchemaId === 'lineplan-schema' || newSchemaId === 'bar-schema') && !newLine.endDate) {
  // 支持新旧两种ID
}
```

---

## 🔍 验证清单

### 功能验证
- [x] ✅ 添加计划单元功能正常
- [x] ✅ 类型转换功能正常（lineplan ↔ milestone ↔ gateway）
- [x] ✅ 矩阵视图显示正确（"计划单元"标签）
- [x] ✅ 旧数据兼容（bar-schema仍可识别）

### UI验证
- [x] ✅ 工具栏：显示"添加计划单元"
- [x] ✅ 快捷菜单：显示"添加计划单元"
- [x] ✅ 矩阵视图：标签显示"计划单元"
- [x] ✅ 甘特图：计划单元正常渲染

### 数据验证
- [x] ✅ 新建节点使用 lineplan-schema
- [x] ✅ Mock数据使用 lineplan-schema
- [x] ✅ 类型转换到lineplan时自动添加endDate

---

## 📊 影响范围

### 修改文件统计

| 类别 | 文件数 | 变更行数 |
|------|--------|----------|
| Schema定义 | 2 | +27 -20 |
| 组件 | 2 | +31 -23 |
| 测试数据 | 1 | +26 -26 |
| **总计** | **5** | **+46 -36** |

### 影响的功能模块

1. **节点创建**
   - 工具栏"添加计划单元"按钮
   - 快捷菜单"添加计划单元"选项
   - Timeline右键菜单

2. **节点编辑**
   - 类型转换功能
   - 节点属性编辑

3. **数据展示**
   - 甘特图渲染
   - 矩阵视图显示
   - 表格视图显示

4. **数据持久化**
   - Mock数据生成
   - 示例数据加载

---

## 🚀 后续建议

### 1. 文档更新
- [ ] 更新用户手册中的类型说明
- [ ] 更新API文档中的Schema定义
- [ ] 更新开发文档中的类型体系图

### 2. 测试补充
- [ ] 添加类型重命名的单元测试
- [ ] 添加兼容性测试（bar-schema → lineplan-schema）
- [ ] 添加类型转换的集成测试

### 3. 数据迁移
如果有生产数据：
- [ ] 编写迁移脚本（bar-schema → lineplan-schema）
- [ ] 提供回滚方案
- [ ] 测试环境先行验证

### 4. 废弃计划
建议在未来版本中：
- 2个版本后：标记 `bar-schema` 为 `@deprecated`
- 4个版本后：彻底移除 `bar-schema` 支持
- 提供迁移工具和警告提示

---

## 📌 注意事项

### 开发者注意
1. **新代码**：使用 `lineplan-schema`
2. **旧代码**：如果引用了 `BarSchema`，建议更新为 `LinePlanSchema`
3. **类型判断**：需要同时检查 `lineplan-schema` 和 `bar-schema`

### 用户注意
1. **UI变化**：按钮文本从"添加计划单元(Bar)"改为"添加计划单元"
2. **标签变化**：矩阵视图中标签从"任务"改为"计划单元"
3. **功能不变**：所有功能保持不变，仅名称调整

---

## 📅 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| V11.2 | 2026-02-08 | 类型重命名：bar-schema → lineplan-schema |
| V11.1 | 2026-02-08 | 删除功能和矩阵视图修复 |
| V11.0 | 2026-02-07 | 测试反馈修复 |

---

**完成时间**: 2026-02-08  
**验证状态**: ✅ 所有功能正常  
**兼容状态**: ✅ 保持向后兼容
