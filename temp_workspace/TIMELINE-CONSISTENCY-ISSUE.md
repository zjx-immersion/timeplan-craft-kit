# Timeline数据结构不一致问题

## 问题描述

用户反馈：默认加载的timeline和新建/复制的timeline的HTML元素、布局不一致。

## 根本原因

### Timeline类型定义（timeplanSchema.ts）
```typescript
export interface Timeline {
  id: string;
  name: string;                   // 必需字段
  title?: string;                 // 可选字段（兼容旧版）
  owner: string;
  description?: string;
  color?: string;
  // ...
}
```

### 问题分析

#### 1. 显示逻辑使用 `title`
```typescript
// TimelinePanel.tsx 1796行
<div>{timeline.title}</div>  // ❌ 使用 title，但新建时未设置
```

#### 2. 新建Timeline只设置 `name`
```typescript
// UnifiedTimelinePanelV2.tsx 164-171行
const newTimeline: Timeline = {
  id: `timeline-${Date.now()}`,
  name: '新 Timeline',      // ✅ 设置了 name
  description: '未指定',
  color: '#1677ff',
  lineIds: [],
  owner: '',
  // ❌ 没有设置 title！
};
```

#### 3. 复制Timeline只更新 `name`
```typescript
// TimelinePanel.tsx 727-732行
const newTimeline: Timeline = {
  ...timeline,
  id: newTimelineId,
  name: `${timeline.name} (副本)`,  // ✅ 更新了 name
  lineIds: copiedLines.map(l => l.id),
  // ❌ 如果原timeline有title，复制后title没有更新后缀
};
```

#### 4. 默认数据可能有 `title`
- 默认加载的timeline数据从 v1 迁移而来
- 可能同时包含 `name` 和 `title` 字段
- 或者只有其中一个

### 数据不一致导致的问题

| 数据来源 | name | title | 显示结果 |
|---------|------|-------|---------|
| 默认加载 | ✅ | ✅ | 显示title |
| 新建 | ✅ | ❌ | 显示undefined |
| 复制 | ✅更新 | ⚠️未更新 | 显示原title |

## 修复方案

### 方案1：统一使用 `title` 优先，`name` 后备 ✅ 推荐

```typescript
// 1. 显示时使用 title || name
<div>{timeline.title || timeline.name}</div>

// 2. 新建时同时设置 name 和 title
const newTimeline: Timeline = {
  name: '新 Timeline',
  title: '新 Timeline',  // ← 添加
  // ...
};

// 3. 复制时同时更新 name 和 title
const newTimeline: Timeline = {
  ...timeline,
  name: `${timeline.name} (副本)`,
  title: `${timeline.title || timeline.name} (副本)`,  // ← 添加
  // ...
};
```

### 方案2：只使用 `name`，废弃 `title` ❌ 不推荐

需要迁移所有现有数据，改动较大。

## 修复位置

### 1. TimelinePanel.tsx - 显示逻辑
- **行1796**：显示标题时使用 `timeline.title || timeline.name`
- **行1816**：传递给TimelineQuickMenu时使用 `timeline.title || timeline.name`
- **行727-732**：复制Timeline时同时更新 `title`

### 2. UnifiedTimelinePanelV2.tsx - 新建逻辑
- **行164-171**：新建Timeline时添加 `title` 字段

## 预期效果

修复后：
- ✅ 所有timeline数据结构统一
- ✅ 新建timeline有完整的 name 和 title
- ✅ 复制timeline的 title 也会更新
- ✅ 显示时向后兼容，支持只有 name 的旧数据
- ✅ HTML结构和样式完全一致
