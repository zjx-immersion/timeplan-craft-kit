# 关键发现：DevTools显示的是右侧画布区域！

## 重新分析截图

### 截图1、2的DevTools显示的HTML

仔细看右侧黑色DevTools区域的HTML代码：

```html
<div style="position: absolute; left: 2645px; top: 0px; height: 1377px;">  ← 这是网格背景！
  <div style="position: absolute; left: 2036px; top: 0px; height: 1377px;">
  <div style="position: absolute; left: 2129px; top: 0px; height: 1377px;">
  <!-- 很多垂直网格线 -->
</div>

<div style="position: relative; width: 5475px; min-width: 100%; padding-top: 0px;">  ← Timeline行内容容器
  <!-- 依赖关系线等 -->
  
  <!-- Timeline行 - 右侧画布区域 -->
  <div style="height: 120px; box-sizing: border-box; margin: 0px; padding: 0px;">  ← 外层
    <div style="position: relative; height: 120px; border-bottom: 0px; background-color: rgba(0, 0, 0, 0); box-sizing: border-box; margin: 0px; padding: 0px;">  ← 内层
      <!-- Lines内容 -->
    </div>
  </div>
  
  <!-- 重复多次 -->
</div>
```

## 关键发现

### 1. 这是右侧画布的结构！
DevTools显示的是**右侧画布区域**的Timeline行，不是左侧列表！

右侧Timeline行的内层div代码：
```typescript
// TimelinePanel.tsx 2053-2063行
<div style={{
  position: 'relative',
  height: ROW_HEIGHT,
  borderBottom: `1px solid ${token.colorBorderSecondary}`,  // ← 代码中有
  backgroundColor: 'transparent',
  boxSizing: 'border-box',
  margin: 0,
  padding: 0,
}}>
```

但DevTools显示：
```html
border-bottom: 0px;  <!-- ❌ 实际渲染时变成了0px -->
```

### 2. border-bottom: 0px 的问题

**可能原因**：
1. `token.colorBorderSecondary` 是 `undefined`
2. 生成的CSS字符串无效：`1px solid undefined`
3. 浏览器解析失败，使用默认值 `0px`

## 验证方法

### 在浏览器Console运行：
```javascript
// 查找所有右侧Timeline行的内层div
const rightSideDivs = document.querySelectorAll('[style*="position: relative"][style*="height: 120px"]');
console.log('Found divs:', rightSideDivs.length);

rightSideDivs.forEach((div, i) => {
  console.log(`Div ${i}:`, {
    borderBottom: div.style.borderBottom,
    computedBorder: window.getComputedStyle(div).borderBottom,
    backgroundColor: div.style.backgroundColor,
  });
});
```

## 左侧的竖线

### 左侧边栏的 borderRight
```typescript
// TimelinePanel.tsx 1713行
borderRight: `1px solid ${token.colorBorder}`,
```

这是整个侧边栏容器的右边框，应该在**所有timeline的右侧**显示。

### 为什么新建timeline看不到竖线？

**可能性1**：浏览器缓存
- 代码已更新，但浏览器使用了旧版本
- 需要强制刷新（Cmd+Shift+R）

**可能性2**：z-index或定位问题
- 某些元素覆盖了侧边栏的边框

**可能性3**：背景色问题
- 新建timeline的背景色与边框颜色相近，看不清

## 下一步

1. ✅ 已添加调试代码
2. ⏳ 用户刷新页面
3. ⏳ 查看Console输出
4. ⏳ 在浏览器Console运行验证脚本
5. ⏳ 根据输出确定问题根源

## 临时修复：使用硬编码颜色

如果确认是token问题，可以临时使用硬编码：
```typescript
borderBottom: `1px solid #f0f0f0`,  // 代替 token.colorBorderSecondary
borderRight: `1px solid #d9d9d9`,   // 代替 token.colorBorder
```
