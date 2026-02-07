# 时间轴宽度问题分析

## 问题描述

### 问题1：蓝色框看起来不止一根线
- 截图显示的蓝色框是浏览器的文本选择框
- 不是代码渲染的边框
- 无需修复

### 问题2：右侧滚动空白没有时间轴 ❌
- 横向滚动到右边时，出现大量空白
- 时间轴表头没有延伸到滚动区域末尾
- 只显示了 11-12 月，右侧是空白

## 根本原因

### 容器结构
```
滚动容器 (overflow: auto)
├─ 左侧固定栏 (position: sticky, left: 0, width: SIDEBAR_WIDTH)
└─ 右侧内容区 (flex: 1, minWidth: totalWidth)
   ├─ TimelineHeader (position: sticky, top: 0)
   │  └─ 表头flex容器 (display: flex) ← 宽度由内容撑开
   ├─ 网格背景 (position: absolute, width: totalWidth)
   └─ Timeline行内容 (position: relative, width: totalWidth)
```

### 问题分析

1. **TimelineHeader 没有固定宽度**：
   - 最外层容器没有设置 `width`
   - 只有 `position: sticky`
   - 内部使用 `display: flex`，宽度由内容（cell）撑开

2. **内容宽度由 cell 决定**：
   - `parentHeaders` 和 `childHeaders` 的宽度之和
   - 如果某些原因导致 headers 生成不足，表头就会短

3. **右侧内容区域可以滚动更远**：
   - 设置了 `minWidth: totalWidth`
   - 如果 TimelineHeader 宽度小于 `totalWidth`，就会出现空白

## 修复方案

### 方案1：TimelineHeader 设置固定宽度 ✅ 推荐

为 TimelineHeader 组件添加 `width` prop，让其匹配 `totalWidth`。

```typescript
// TimelineHeader.tsx
interface TimelineHeaderProps {
  startDate: Date;
  endDate: Date;
  scale: TimeScale;
  width?: number;  // ← 新增：总宽度
}

// 最外层容器
<div style={{
  position: 'sticky',
  top: 0,
  zIndex: 11,
  width: width,  // ← 设置明确宽度
  minWidth: width,  // ← 确保不会缩小
  backgroundColor: token.colorBgContainer,
  borderBottom: `2px solid ${token.colorBorder}`,
}}>

// TimelinePanel.tsx
<TimelineHeader
  startDate={normalizedViewStartDate}
  endDate={normalizedViewEndDate}
  scale={scale}
  width={totalWidth}  // ← 传入总宽度
/>
```

### 方案2：调整右侧内容区域的 minWidth ❌ 不推荐

不设置 `minWidth`，让内容自然撑开。但这会导致网格背景和 Timeline 行内容也无法正确计算宽度。

## 修复优先级

1. **高优先级**：TimelineHeader 宽度修复
2. **低优先级**：蓝色选择框（无需修复，是浏览器行为）
