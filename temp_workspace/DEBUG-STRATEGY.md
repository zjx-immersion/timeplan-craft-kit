# Timeline结构不一致问题 - 深度调查

## 问题总结

用户反馈：
1. 新建/复制的timeline与默认加载的timeline结构不一致
2. 新建timeline的title块右边**没有竖线**

## DevTools关键发现

### 截图1、2 HTML源码显示

右侧DevTools中显示的HTML结构：
```html
<div style="height: 120px; box-sizing: border-box; margin: 0px; padding: 0px;">
  <div style="position: relative; height: 120px; border-bottom: 0px; background-color: rgba(0, 0, 0, 0); box-sizing: border-box; margin: 0px; padding: 0px;">
  </div>
</div>
```

**❌ 关键问题**：`border-bottom: 0px;`  
预期应该是：`border-bottom: 1px solid #f0f0f0;`

## 问题分析

### 左侧Timeline列表的内层div代码
```typescript
// TimelinePanel.tsx 1753-1764行
<div style={{
  height: ROW_HEIGHT,
  display: 'flex',
  alignItems: 'center',
  padding: `0 ${token.paddingSM}px`,
  borderBottom: `1px solid ${token.colorBorderSecondary}`,  // ← 预期有1px边框
  cursor: 'pointer',
  backgroundColor: token.colorBgContainer,
  boxSizing: 'border-box',
  margin: 0,
}}>
```

### 但DevTools显示
```html
style="...border-bottom: 0px;..."  <!-- ❌ 边框宽度为0 -->
```

## 可能的原因

### 1. token.colorBorderSecondary 值问题 ⚠️ 最可能
```typescript
// 如果 token.colorBorderSecondary = undefined
borderBottom: `1px solid undefined`  // ← 无效CSS，浏览器忽略或设为0
```

### 2. CSS被覆盖
某些全局CSS规则覆盖了inline style（可能性较低，因为inline style优先级很高）。

### 3. React渲染时机问题
Token在某些timeline渲染时还未初始化。

### 4. 条件渲染差异
不同的timeline走了不同的渲染分支。

## 修复策略

### 调试步骤1：添加console.log ✅ 已完成
```typescript
// TimelinePanel.tsx 1741-1754行
console.log('[Timeline Row]', {
  id: timeline.id,
  title: timeline.title,
  name: timeline.name,
  display: timeline.title || timeline.name,
  linesCount: lines.length,
});

// 1767-1777行
onMouseEnter={(e) => {
  console.log('[Timeline Row Hover]', {
    timeline: timeline.title || timeline.name,
    height: e.currentTarget.offsetHeight,
    borderBottom: e.currentTarget.style.borderBottom,
    computedBorder: window.getComputedStyle(e.currentTarget).borderBottom,
  });
}}
```

### 调试步骤2：打印token值
```typescript
console.log('token.colorBorderSecondary:', token.colorBorderSecondary);
console.log('token.colorBorder:', token.colorBorder);
console.log('token.colorBgContainer:', token.colorBgContainer);
```

### 调试步骤3：使用硬编码测试
如果是token问题，临时使用硬编码值：
```typescript
borderBottom: `1px solid #f0f0f0`,  // ← 硬编码颜色
```

## 竖线问题

### 左侧边栏的竖线
用户提到的"title块右边没有竖线"，这条竖线应该是：
- **侧边栏的 borderRight**（整个侧边栏的右边框）
- 不是单个timeline行的边框

```typescript
// TimelinePanel.tsx 1707-1717行
<div ref={sidebarRef} style={{
  width: SIDEBAR_WIDTH,  // 200px
  borderRight: `1px solid ${token.colorBorder}`,  // ← 这是竖线！
  position: 'sticky',
  left: 0,
  zIndex: 100,
}}>
```

这条竖线应该对所有timeline都可见。如果某些timeline看不到，可能是：
1. z-index问题
2. 背景色覆盖
3. 浏览器渲染bug

## 下一步

1. ✅ **已添加调试代码**
2. ⏳ **等待用户刷新页面并查看Console输出**
3. ⏳ **根据Console输出确定问题根源**

## 预期Console输出

刷新页面后，Console应该显示：
```
[Timeline Row] { id: '...', title: '...', name: '...', hasTitle: true, hasName: true, display: '...', linesCount: 5 }
[Timeline Row] { id: '...', title: undefined, name: '新 Timeline', hasTitle: false, hasName: true, display: '新 Timeline', linesCount: 0 }
...
```

鼠标悬停在timeline上时应该显示：
```
[Timeline Row Hover] { timeline: '...', height: 120, borderBottom: '1px solid rgb(...)', computedBorder: '1px solid rgb(...)' }
```

如果看到 `borderBottom: ''` 或 `computedBorder: 'none'`，说明CSS未正确应用。
