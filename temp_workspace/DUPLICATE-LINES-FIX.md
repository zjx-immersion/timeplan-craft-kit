# Timeline重复线条修复 - 2026-02-07

## 问题描述

新增的Timeline右侧出现**多条靠得很近的线**，看起来不像是单条分隔线。

### 用户反馈
> "分析新增timeline的线，看起来不止一条线，且靠得很近，需要分析，找到问题"

## 根本原因

**水平网格线和Timeline行的borderBottom重叠渲染**，导致同一位置有两条线。

### 代码分析

#### 问题代码1：水平网格线（1940-1954行）
```typescript
{/* 水平网格线 */}
{data.timelines.map((_, index) => (
  <div
    key={index}
    style={{
      position: 'absolute',
      left: 0,
      right: 0,
      top: (index + 1) * ROW_HEIGHT - 1,  // ← 位置：每行底部
      height: 1,
      backgroundColor: token.colorBorderSecondary,
    }}
  />
))}
```

#### 问题代码2：Timeline行边框（2069行）
```typescript
<div style={{
  height: ROW_HEIGHT,
  borderBottom: `1px solid ${token.colorBorderSecondary}`,  // ← 位置：行底部
  boxSizing: 'border-box',
}}>
```

### 重叠计算

对于第 `n` 个Timeline（index = n）：

1. **水平网格线位置**：
   - `top: (n + 1) * ROW_HEIGHT - 1`
   - 例如：n=0 → top: 119px

2. **borderBottom位置**：
   - 行起始位置：`n * ROW_HEIGHT`
   - 行结束位置：`(n + 1) * ROW_HEIGHT`
   - borderBottom在：`(n + 1) * ROW_HEIGHT - 1`（因为 `boxSizing: 'border-box'`）
   - 例如：n=0 → borderBottom: 119px

**结论**：两条线位置完全相同！

### 视觉效果

- 两条1px线重叠在同一位置
- 可能显示为：
  - 一条粗线（视觉上看起来是2px）
  - 两条紧邻的线（由于浏览器渲染差异）
  - 颜色更深的线（如果有透明度）

## 修复方案

**移除水平网格线，只保留Timeline行的borderBottom**。

### 理由

1. **语义清晰**：borderBottom是Timeline行结构的一部分
2. **性能更好**：不需要额外的绝对定位div
3. **代码简洁**：减少重复渲染
4. **维护性好**：只需在一个地方修改边框样式

### 修复代码

```typescript
// 文件：TimelinePanel.tsx (1940行)
// 移除整个水平网格线循环，替换为注释：
{/* ✅ 水平分隔线已移除：使用Timeline行的borderBottom代替，避免重复渲染 */}
```

## 修复效果

### 修复前
- ❌ 水平网格线 + Timeline行borderBottom 重叠
- ❌ 每个Timeline行底部有两条线
- ❌ 线条看起来更粗或更密集
- ❌ 性能浪费（重复渲染）

### 修复后
- ✅ 只保留Timeline行的borderBottom
- ✅ 每个Timeline行底部只有一条清晰的分隔线
- ✅ 线条粗细正常（1px）
- ✅ 性能优化（减少DOM元素）

## 网格线总结

修复后的网格线结构：

### 1. 垂直网格线 ✅ 保留
- 位置：网格背景容器内
- 渲染：基于 `dateHeaders`
- 作用：月/季度/日期分隔线

### 2. 水平分隔线 ✅ 使用borderBottom
- 位置：每个Timeline行
- 渲染：`borderBottom: '1px solid ${token.colorBorderSecondary}'`
- 作用：Timeline行分隔线

### 3. 水平网格线 ❌ 已移除
- 原因：与Timeline行borderBottom重叠
- 替代：使用Timeline行的borderBottom

## 文件修改

### TimelinePanel.tsx
- **行1940-1954**：移除水平网格线循环
- **行1940**：添加注释说明

## 验证步骤

1. 刷新页面：http://localhost:9086/
2. 查看Timeline行分隔线
3. 验证：
   - ✅ 每个Timeline行底部只有一条线
   - ✅ 线条粗细正常（1px）
   - ✅ 线条颜色统一
   - ✅ 垂直网格线正常显示
   - ✅ 不再有重复或靠得很近的线

## 相关修复

### 今日修复历史
1. ✅ Timeline复制功能（复制所有Lines和Relations）
2. ✅ 网格线显示问题（Timeline行透明背景）
3. ✅ **重复线条问题（移除水平网格线重叠）** ← 本次修复
