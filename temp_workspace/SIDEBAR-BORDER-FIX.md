# Sidebar右边框显示不完整问题修复

## 问题描述

用户反馈（附截图）：
1. **默认加载时**：新timeline单元格右边有垂直线
2. **滚动页面后**：只有新timeline以上的timeline有右边的线，以下的没有
3. **表现**：垂直分隔线显示不完整，造成视觉不一致

## 问题根源

### 代码分析

**文件**: `timeplan-craft-kit/src/components/timeline/TimelinePanel.tsx`

**原有代码** (第1707-1717行):
```tsx
<div
  ref={sidebarRef}
  style={{
    width: SIDEBAR_WIDTH,
    flexShrink: 0,
    backgroundColor: token.colorBgLayout,
    borderRight: `1px solid ${token.colorBorder}`, // ← 右边框定义在这里
    position: 'sticky',
    left: 0,
    zIndex: 100,
    // ❌ 缺少高度设置！
  }}
>
  {/* Timeline 列表 */}
</div>
```

**问题原因**:
1. Sidebar的`borderRight`定义在外层容器上
2. 但**没有明确设置高度**
3. 当父容器有`overflow: auto`时，sidebar的实际渲染高度只包含其子元素（timeline列表）的高度
4. 如果可视区域高度大于timeline列表高度，sidebar的下方空白区域**没有背景和边框**
5. 导致滚动后，下方timeline行看不到右边框

### 布局结构

```
主内容区域 (flex: 1, overflow: auto)
├── 左侧sidebar (sticky, borderRight, ❌ 无高度)
│   ├── 表头 (height: 68px)
│   └── Timeline列表 (每行120px × N行)
└── 右侧内容区 (flex: 1)
```

**症状**:
- Timeline列表高度 = 68px + 120px × N
- 如果 **容器高度 > timeline列表高度**，sidebar下方是空白的
- 空白区域没有`borderRight`渲染，导致垂直线断裂

## 修复方案

### ✅ 方案: 添加 minHeight 和 alignSelf

**修改内容**:
```tsx
<div
  ref={sidebarRef}
  style={{
    width: SIDEBAR_WIDTH,
    flexShrink: 0,
    backgroundColor: token.colorBgLayout,
    borderRight: `1px solid ${token.colorBorder}`,
    position: 'sticky',
    left: 0,
    zIndex: 100,
    alignSelf: 'flex-start', // ✅ 确保从顶部开始对齐
    minHeight: '100%',       // ✅ 确保至少与容器一样高，右边框贯穿全高
  }}
>
```

**效果**:
1. `minHeight: '100%'`: 确保sidebar的最小高度等于父容器高度
2. `alignSelf: 'flex-start'`: 确保sidebar从flex容器顶部开始
3. 即使timeline列表很短，sidebar也会占满整个可视高度
4. `borderRight`会贯穿整个sidebar高度，所有timeline行都能看到右边框

## 技术细节

### 为什么不用 height: '100%'？

- `height: '100%'` 会强制sidebar高度等于父容器
- 如果timeline列表更长，会导致overflow问题
- `minHeight: '100%'` 更灵活：
  - 如果timeline列表短 → sidebar = 容器高度
  - 如果timeline列表长 → sidebar = 列表高度（自动撑高）

### Sticky 定位说明

- `position: sticky` + `left: 0`: sidebar在水平滚动时保持固定
- 配合`minHeight: '100%'`: 确保sticky元素有足够高度显示完整边框

## 验证步骤

1. **刷新页面**
2. **默认状态**: 所有timeline行右边都应该有垂直分隔线
3. **垂直滚动**: 
   - 向下滚动到底部
   - 确认最下方的timeline行右边仍有垂直线
   - 确认垂直线连续，无断裂
4. **水平滚动**: 
   - 向右滚动
   - 确认sidebar保持sticky在左侧
   - 确认右边框始终可见
5. **多种timeline数量**: 
   - 测试timeline很少时（1-2个）
   - 测试timeline很多时（10+个）
   - 确认边框都正常显示

## 相关文件

- ✅ `timeplan-craft-kit/src/components/timeline/TimelinePanel.tsx` (第1707-1719行)

## 状态

✅ **已修复**: 添加 `minHeight: '100%'` 和 `alignSelf: 'flex-start'`

## 视觉效果

### 修复前:
```
┌─────────────┬─────────────
│ Timeline 1  │  (有右边框)
├─────────────┤
│ Timeline 2  │  (有右边框)
├─────────────┤
│ Timeline 3  │  (有右边框)
└─────────────┘
   (空白，无右边框) ← ❌ 问题
   (空白，无右边框)
```

### 修复后:
```
┌─────────────┬─────────────
│ Timeline 1  │  (有右边框)
├─────────────┤
│ Timeline 2  │  (有右边框)
├─────────────┤
│ Timeline 3  │  (有右边框)
│             │  (有右边框) ✅
│             │  (有右边框) ✅
└─────────────┴─────────────
```

完整的垂直分隔线贯穿整个sidebar高度！
