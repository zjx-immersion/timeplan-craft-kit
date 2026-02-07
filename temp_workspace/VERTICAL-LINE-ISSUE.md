# 竖线缺失问题诊断

## 问题描述

用户反馈：新建timeline的title块右边**没有竖线**。

## 截图分析

### 截图3显示
- 左侧有多个timeline列表项
- "新 Timeline"项右侧没有明显的竖线
- 但"软件集成"、"整年测试"等有竖线

## 可能的竖线来源

### 1. 侧边栏的 borderRight
```typescript
// TimelinePanel.tsx 1707-1717行
<div ref={sidebarRef} style={{
  width: SIDEBAR_WIDTH,  // 200px
  borderRight: `1px solid ${token.colorBorder}`,  // ← 侧边栏右边框
  position: 'sticky',
  left: 0,
  zIndex: 100,
}}>
```

**这是整个侧边栏的右边框**，不是Timeline行的边框。所有timeline应该都能看到这条线。

### 2. Timeline行内可能有其他元素

检查代码，Timeline行内只有：
- 折叠图标
- 颜色标签
- Timeline信息（标题+描述）
- 快捷菜单（...按钮）

**没有在Timeline行内部渲染竖线的逻辑**。

### 3. 可能是浏览器渲染问题

如果页面滚动或重新渲染，某些边框可能不显示。

## 代码检查

### 左侧边栏容器（1707行）
```typescript
<div ref={sidebarRef} style={{
  width: SIDEBAR_WIDTH,
  flexShrink: 0,
  backgroundColor: token.colorBgLayout,
  borderRight: `1px solid ${token.colorBorder}`,  // ✅ 侧边栏右边框
  position: 'sticky',
  left: 0,
  zIndex: 100,
}}>
```

### Timeline行（1753行）
```typescript
<div style={{
  height: ROW_HEIGHT,
  display: 'flex',
  alignItems: 'center',
  padding: `0 ${token.paddingSM}px`,
  borderBottom: `1px solid ${token.colorBorderSecondary}`,  // ✅ 底部边框
  // ❌ 没有 borderRight
}}>
```

## 结论

**侧边栏的 `borderRight` 是所有timeline共享的**，不是单个timeline行的样式。

如果"新 Timeline"看不到右侧竖线，可能的原因：
1. **视觉错觉** - 因为新timeline是空的，背景色可能看起来不同
2. **浏览器缓存** - 需要强制刷新
3. **z-index问题** - 某些元素覆盖了边框
4. **滚动位置** - 如果侧边栏滚动到某个位置，边框可能被遮挡

## 建议

1. **强制刷新页面** - Cmd+Shift+R / Ctrl+Shift+R
2. **检查侧边栏的 borderRight 是否存在** - 在DevTools中检查侧边栏div
3. **截图标注** - 具体指出哪里缺少竖线

## 代码确认

当前代码中，侧边栏有明确的 `borderRight` 设置（1712行）：
```typescript
borderRight: `1px solid ${token.colorBorder}`,
```

这条竖线应该对所有timeline都可见。
