# 网格线显示修复 - 2026-02-07

## 问题描述

新增或复制的Timeline右侧画布区域**完全空白，看不到网格线和边框**。

### 用户反馈
- 截图显示：左侧有多个Timeline列表项，但右侧画布是空白的
- Console log显示：timelinesCount: 11，但右侧没有显示网格

## 根本原因

**Timeline行的白色背景完全遮挡了网格背景**。

### 层级结构问题
```
右侧内容区域 (backgroundColor: '#fafafa')
├─ TimelineHeader (时间轴表头)
├─ 网格背景 (position: absolute, top: 68, zIndex: 0)  ← 最底层
└─ Timeline行内容 (position: relative, 后渲染)
   └─ Timeline行 (backgroundColor: '#fff')  ← 白色背景遮挡网格！
```

### 问题分析
1. **网格背景**：`position: absolute`，`zIndex: 0`（最底层）
2. **Timeline行内容**：`position: relative`（后渲染，覆盖在网格背景之上）
3. **Timeline行**：`backgroundColor: '#fff'`（不透明白色，完全遮挡网格）

**结果**：无论网格背景如何渲染，都被Timeline行的白色背景完全遮挡，导致看不到网格线。

## 修复方案

### 修复1：Timeline行背景改为透明
```typescript
// 文件：TimelinePanel.tsx (2065-2075行)
<div style={{
  position: 'relative',
  height: ROW_HEIGHT,
  borderBottom: `1px solid ${token.colorBorderSecondary}`,
  backgroundColor: 'transparent',  // ✅ 修复：透明背景，让网格线透过来
  boxSizing: 'border-box',
  margin: 0,
  padding: 0,
}}>
```

### 修复2：右侧内容区域背景改为白色
```typescript
// 文件：TimelinePanel.tsx (1845-1851行)
<div style={{
  flex: 1,
  position: 'relative',
  backgroundColor: '#fff',  // ✅ 修复：与左侧背景色一致，统一为白色
  minWidth: totalWidth,
}}>
```

## 修复效果

### 修复前
- ❌ Timeline行白色背景遮挡网格
- ❌ 右侧画布完全空白
- ❌ 看不到垂直网格线
- ❌ 看不到水平网格线

### 修复后
- ✅ Timeline行透明背景
- ✅ 网格背景透过Timeline行显示
- ✅ 垂直网格线正确显示
- ✅ 水平网格线正确显示
- ✅ Timeline行边框正确显示
- ✅ 左右两侧背景色统一为白色

## 网格渲染逻辑

### 层级结构（修复后）
```
右侧内容区域 (backgroundColor: '#fff')  ← 白色背景
├─ TimelineHeader (时间轴表头)
├─ 网格背景 (position: absolute, zIndex: 0)  ← 网格线层
│  ├─ 垂直网格线（基于dateHeaders）
│  └─ 水平网格线（基于timelines）
└─ Timeline行内容 (position: relative)
   ├─ 依赖关系线 (zIndex: 10)
   └─ Timeline行 (backgroundColor: 'transparent')  ← 透明，网格透过来
      └─ Lines内容（bars, milestones, gateways）
```

### 网格线类型
1. **垂直网格线**：
   - 基于 `dateHeaders` 渲染
   - 月视图/季度视图：每个月/季度一条线
   - 其他视图：每天一条线，月初线条加粗

2. **水平网格线**：
   - 基于 `data.timelines` 遍历
   - 每个Timeline行底部一条线
   - 位置：`top: (index + 1) * ROW_HEIGHT - 1`

3. **Timeline行边框**：
   - 每个Timeline行的 `borderBottom`
   - 与水平网格线重合
   - 作为行分隔线

## 文件修改

### TimelinePanel.tsx
- **行1849**：右侧内容区域背景色 `#fafafa` → `#fff`
- **行2070**：Timeline行背景色 `#fff` → `transparent`

## 验证步骤

1. 刷新页面：http://localhost:9086/
2. 查看右侧画布区域
3. 验证：
   - ✅ 垂直网格线可见（月/季度分隔线）
   - ✅ 水平网格线可见（Timeline行分隔线）
   - ✅ 空Timeline行也显示网格线
   - ✅ 背景色统一为白色
   - ✅ Lines内容正常显示

## 相关修复

### 之前的修复
- ✅ Timeline复制功能（复制所有Lines和Relations）
- ✅ Timeline对齐问题（统一DOM结构）
- ✅ 时间轴范围扩展（动态计算viewEndDate）

### 本次修复
- ✅ 网格线显示问题（Timeline行透明背景）
