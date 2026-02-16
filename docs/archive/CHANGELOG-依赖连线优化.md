# 依赖连线详情显示优化

**日期**: 2026-02-10  
**分支**: feature/migrate-dependency-line-editor  
**提交**: 96736fd

---

## 📋 优化内容

### 1. Tooltip 触发方式优化 ✅

**修改前**:
- 鼠标 hover 连线时显示详情
- 移开鼠标后立即消失

**修改后**:
- 点击连线后显示详情（选中状态）
- 点击其他地方或再次点击连线后隐藏
- 更符合用户使用习惯

**技术实现**:
```typescript
// RelationRenderer.tsx
// 从 hoveredId 改为 selectedRelationId
{selectedRelationId && (
  <RelationTooltip
    relation={selectedRelation}
    // ...
  />
)}
```

### 2. 时间差计算和显示 ✅

**新增功能**:
- 根据依赖类型自动计算两个任务之间的实际时间差
- 以"天"为单位显示

**计算规则**:

| 依赖类型 | 起点时间 | 终点时间 | 说明 |
|---------|---------|---------|------|
| **FS** (finish-to-start) | 前置任务结束时间 | 后置任务开始时间 | 最常见 |
| **SS** (start-to-start) | 前置任务开始时间 | 后置任务开始时间 | 同步开始 |
| **FF** (finish-to-finish) | 前置任务结束时间 | 后置任务结束时间 | 同步结束 |
| **SF** (start-to-finish) | 前置任务开始时间 | 后置任务结束时间 | 较少用 |

**显示格式**:
```
延迟时间: -45 天
后置任务开始较早
```

**颜色标识**:
- 🔴 **红色** (< 0): 后置任务开始较早（负延迟）
- 🔵 **蓝色** (= 0): 无间隔（零延迟）
- 🟢 **绿色** (> 0): 后置任务延后开始（正延迟）

### 3. 区分实际时间差和配置延迟

**实际时间差**:
- 标签: "延迟时间"
- 计算自动任务实际日期
- 反映实际的时间间隔

**配置延迟 (lag)**:
- 标签: "配置延迟"
- 来自用户手动配置
- 仅在有配置时显示

**示例显示**:
```
延迟时间: -45 天
后置任务开始较早

配置延迟: +10 天
```

---

## 📊 技术细节

### 时间差计算逻辑

```typescript
// RelationTooltip.tsx
const timeDifference = useMemo(() => {
  if (!fromLine || !toLine) return null;

  try {
    let fromDate: Date;
    let toDate: Date;

    // 根据依赖类型确定比较的时间点
    switch (dependencyType) {
      case 'finish-to-start':
        fromDate = fromLine.endDate ? parseDateAsLocal(fromLine.endDate) : parseDateAsLocal(fromLine.startDate);
        toDate = parseDateAsLocal(toLine.startDate);
        break;
      // ... 其他类型
    }

    // 计算天数差
    const diffTime = toDate.getTime() - fromDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  } catch (error) {
    console.error('计算时间差失败:', error);
    return null;
  }
}, [fromLine, toLine, dependencyType]);
```

### 点击事件优化

```typescript
// RelationRenderer.tsx
onClick={(e) => {
  e.stopPropagation();
  // 更新鼠标位置，用于显示 Tooltip
  setMousePosition({ x: e.clientX, y: e.clientY });
  if (isEditMode && onRelationClick) {
    onRelationClick(relation.id);
  }
}}
```

---

## 🧪 测试验证

### 功能测试

| 测试项 | 状态 | 说明 |
|-------|------|------|
| 点击显示详情 | ✅ | 正常 |
| 取消选中隐藏 | ✅ | 正常 |
| 时间差计算 FS | ✅ | 正确 |
| 时间差计算 SS | ✅ | 正确 |
| 时间差计算 FF | ✅ | 正确 |
| 时间差计算 SF | ✅ | 正确 |
| 负延迟显示 | ✅ | 红色 + 说明 |
| 零延迟显示 | ✅ | 蓝色 + 说明 |
| 正延迟显示 | ✅ | 绿色 + 说明 |
| 配置延迟显示 | ✅ | 独立显示 |

### 边界情况

- ✅ 任务无结束时间：使用开始时间代替
- ✅ 计算错误：捕获异常，返回 null
- ✅ 前置/后置任务缺失：显示"部分任务信息缺失"警告

---

## 📝 用户界面示例

### 详情卡片结构

```
┌─────────────────────────────────┐
│ 依赖关系详情         [关键路径] │
├─────────────────────────────────┤
│ 依赖类型                        │
│   结束-开始 (FS)                │
│   前置任务完成后，后置任务才能  │
│   开始                          │
├─────────────────────────────────┤
│ 前置任务                        │
│   FC3 功能需求锁定              │
│   负责人: 需求团队              │
├─────────────────────────────────┤
│ 后置任务                        │
│   E0 架构概念设计               │
│   负责人: 架构师                │
├─────────────────────────────────┤
│ ⏰ 延迟时间                     │
│   -45 天                        │
│   后置任务开始较早              │
├─────────────────────────────────┤
│ 配置延迟 (如果有)               │
│   +10 天                        │
├─────────────────────────────────┤
│ 备注 (如果有)                   │
│   这是一个重要的依赖关系        │
└─────────────────────────────────┘
```

---

## 🎯 与用户反馈对比

### 用户反馈 1
> 不是鼠标 over 的实现显示依赖详情，而是鼠标选中时显示

**解决方案**: ✅ 改为点击选中后显示，符合预期

### 用户反馈 2
> 依赖详情框中，需要显示两个依赖相差的时间

**解决方案**: ✅ 根据依赖类型计算时间差，显示格式为"-45 天"

---

## 📊 代码变更统计

| 文件 | 变更 | 说明 |
|------|------|------|
| `RelationRenderer.tsx` | +8, -6 | 触发方式改为选中 |
| `RelationTooltip.tsx` | +63, -7 | 时间差计算和显示 |
| **总计** | **+71, -13** | **58 行净增加** |

---

## ✅ 完成状态

- ✅ Tooltip 触发方式优化
- ✅ 时间差计算实现
- ✅ 时间差显示优化
- ✅ 颜色和说明区分
- ✅ 配置延迟独立显示
- ✅ 边界情况处理
- ✅ 代码提交完成

**状态**: 已完成并测试 ✅

---

**更新时间**: 2026-02-10  
**分支**: feature/migrate-dependency-line-editor  
**提交**: 96736fd
