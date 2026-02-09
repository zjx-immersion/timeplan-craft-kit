# 时间轴滚动和样式修复记录

**日期**: 2026-02-07  
**版本**: v11.6

## 问题描述

用户反馈时间轴存在三个问题：

### 问题1: 时间轴末尾样式差异
- **现象**: 滚动到时间轴块结束的地方，蓝色框中的月份格子样式不一致
- **影响**: 最后几个月份的背景色显示不完整

### 问题2: 右侧过多空白可滚动
- **现象**: 时间轴右侧有大量空白页面可以滚动
- **预期**: 滚动范围应该精确限制在起点到终点时间（2024.1 - 2028.12）

### 问题3: 最外层滚动条
- **现象**: 截图2中，最外层出现滚动条
- **预期**: 只有timeplan的甘特图计划画布中才应该出现内容的滚动条

## 根本原因

### 问题1 - 样式差异
甘特图每一行没有设置固定宽度，导致背景色没有完全覆盖到时间轴末尾。

```typescript
// ❌ 原逻辑 - 没有设置宽度
<div style={{
  position: 'relative',
  height: ROW_HEIGHT,
  borderBottom: `1px solid ${token.colorBorderSecondary}`,
  backgroundColor: `${timelineColor}08`,
}}>
```

### 问题2 - 过多空白
右侧容器只设置了 `minWidth`，没有限制 `maxWidth`，导致可以无限滚动。

```typescript
// ❌ 原逻辑 - 只有minWidth
<div style={{
  flex: 1,
  position: 'relative',
  backgroundColor: '#fff',
  minWidth: totalWidth,
}}>
```

### 问题3 - 外层滚动条
`UnifiedTimelinePanelV2` 的最外层容器没有设置 `overflow: hidden`。

```typescript
// ❌ 原逻辑 - 没有overflow控制
<div style={{
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: token.colorBgContainer,
}}>
```

## 解决方案

### 修复1 - 统一样式
为甘特图每一行添加固定宽度：

```typescript
// ✅ 新逻辑 - 添加固定宽度
<div style={{
  position: 'relative',
  height: ROW_HEIGHT,
  width: totalWidth,  // ✅ 固定宽度，确保背景色覆盖整个时间轴
  borderBottom: `1px solid ${token.colorBorderSecondary}`,
  backgroundColor: `${timelineColor}08`,
}}>
```

**效果**：
- 背景色完整覆盖到时间轴末尾
- 所有行的宽度统一为 `totalWidth`

### 修复2 - 限制滚动范围
设置右侧容器的固定宽度：

```typescript
// ✅ 新逻辑 - 固定宽度
<div style={{
  flex: 1,
  position: 'relative',
  backgroundColor: '#fff',
  width: totalWidth,      // ✅ 固定宽度
  maxWidth: totalWidth,   // ✅ 限制最大宽度
  minWidth: totalWidth,   // ✅ 保持最小宽度
}}>
```

**效果**：
- 滚动范围精确限制在 2024.1 - 2028.12
- 右侧无多余空白可滚动

### 修复3 - 移除外层滚动条
在最外层容器添加 `overflow: hidden`：

```typescript
// ✅ 新逻辑 - 禁止外层滚动
<div style={{
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: token.colorBgContainer,
  overflow: 'hidden',  // ✅ 去掉最外层滚动条
}}>
```

**效果**：
- 最外层不再出现滚动条
- 只有甘特图内部可滚动

## 修改文件

1. **`src/components/timeline/TimelinePanel.tsx`**
   - 第2023行：右侧容器添加固定宽度约束
   - 第2267行：甘特图每一行添加固定宽度

2. **`src/components/timeline/UnifiedTimelinePanelV2.tsx`**
   - 第368行：最外层容器添加 `overflow: hidden`

## 技术细节

### 宽度计算
```typescript
// getTotalTimelineWidth 实现
const totalWidth = useMemo(
  () => getTotalTimelineWidth(normalizedViewStartDate, normalizedViewEndDate, scale),
  [normalizedViewStartDate, normalizedViewEndDate, scale]
);

// 基于实际日历天数计算
export const getTotalTimelineWidth = (
  startDate: Date,
  endDate: Date,
  scale: TimeScale
): number => {
  const pixelsPerDay = getPixelsPerDay(scale);
  const totalDays = differenceInCalendarDays(endDate, startDate) + 1;
  return totalDays * pixelsPerDay;
};
```

### 布局层级
```
UnifiedTimelinePanelV2 (overflow: hidden)
└── Header (固定)
└── ViewSwitcher (固定)
└── TimelinePanel (overflow: auto) ✅ 唯一滚动区域
    ├── Sidebar (左侧固定)
    └── Content (右侧，width = totalWidth)
        ├── TimelineHeader (表头)
        └── Gantt Chart Rows (每行 width = totalWidth)
```

## 效果

### 修复前
- ❌ 时间轴末尾背景色不完整
- ❌ 右侧可以无限滚动
- ❌ 最外层出现滚动条

### 修复后
- ✅ 时间轴末尾背景色完整
- ✅ 滚动范围精确限制在 2024.1 - 2028.12
- ✅ 只有甘特图内部可滚动

## 相关提交

- `efab246` - fix: 修复时间轴滚动和样式问题
- `dc8b2fd` - fix: 修复时间轴最后时间段背景色不一致问题
- `d582265` - fix: 忽略viewConfig中的错误日期范围

## 测试建议

1. **刷新页面**，清除浏览器缓存（Ctrl+Shift+R / Cmd+Shift+R）
2. **打开 OrionX 计划**，切换到甘特图视图
3. **检查样式**：
   - ✅ 滚动到时间轴末尾，检查背景色是否完整
   - ✅ 所有月份格子样式是否一致
4. **检查滚动范围**：
   - ✅ 水平滚动到最右侧，是否停在 2028年12月
   - ✅ 右侧是否没有多余空白可滚动
5. **检查滚动条**：
   - ✅ 最外层（页面）是否没有滚动条
   - ✅ 只有甘特图内部是否可以滚动

---

**状态**: ✅ 已修复  
**验证**: 待用户测试反馈
