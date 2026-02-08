# 今日线修复 - 2026-02-07

## 问题描述

用户反馈：
1. **边框粗细不一致**：部分边框看起来粗细不一样
2. **今日线标签不可见**：红色垂直线上的日期标签被遮挡，z-index过低

## 根本原因

### 1. 今日线 z-index 过低
- **现状**：`TodayLine` 组件的 `zIndex: 5`
- **问题**：远低于其他UI元素（sidebar: 100, header: 101）
- **结果**：日期标签被其他元素遮挡，用户无法看见

### 2. 垂直网格线粗细不一致
- **现状**：在 day/week 视图中
  - 月初线条：`width: 2px`，颜色：`token.colorBorder`
  - 其他线条：`width: 1px`，颜色：`token.colorBorderSecondary`
- **问题**：这是**设计特性**，用于强调月份边界
- **月视图**：所有垂直线都是 `1px`，无此问题

## 修复方案

### ✅ 修复 1: 提高今日线 z-index 并增强标签可见性

**文件**: `timeplan-craft-kit/src/components/timeline/TodayLine.tsx`

**修改内容**:
1. **提高 z-index**: 从 `5` 提升到 `200`
   - 确保在 sidebar (100) 和 header (101) 之上
   - 确保在所有内容元素之上

2. **增强标签样式**:
   - 增大字体：`fontSize: 11` → `12`
   - 加粗字体：`fontWeight: 500` → `600`
   - 增大内边距：`padding: '2px 8px'` → `'3px 10px'`
   - 增大圆角：`borderRadius: 3` → `4`
   - 增强阴影：加强发光效果
   - 添加边框：`border: '1px solid rgba(255, 255, 255, 0.3)'`

**代码变更**:
```tsx
<div
  style={{
    position: 'absolute',
    left: todayPosition,
    top: 0,
    bottom: 0,
    width: 2,
    zIndex: 200, // ✅ 从 5 提升到 200
    pointerEvents: 'none',
  }}
>
  {/* 顶部标签 */}
  <div
    style={{
      position: 'absolute',
      left: '50%',
      top: -24,
      transform: 'translateX(-50%)',
      padding: '3px 10px', // ✅ 增大
      backgroundColor: timelineColors.today,
      color: '#fff',
      fontSize: 12, // ✅ 增大
      fontWeight: 600, // ✅ 加粗
      borderRadius: 4, // ✅ 增大
      whiteSpace: 'nowrap',
      boxShadow: `0 2px 4px rgba(0,0,0,0.25), 0 0 10px ${timelineColors.todayGlow}`, // ✅ 增强
      border: '1px solid rgba(255, 255, 255, 0.3)', // ✅ 新增
    }}
  >
    今日：{format(today, 'yyyy-MM-dd', { locale: zhCN })}
  </div>
```

### ℹ️ 说明 2: 垂直网格线粗细差异是设计特性

**当前行为**:
- **月/季视图**：所有垂直线 `1px`，视觉统一
- **日/周视图**：
  - 月初边界：`2px` 粗线，深色
  - 其他日期：`1px` 细线，浅色

**设计目的**:
- 在日/周视图中，通过加粗月初线条来**强调月份边界**
- 帮助用户快速识别月份分隔
- 这是**功能性设计**，而非缺陷

**如果需要统一**:
如果用户希望所有垂直线统一为1px，可以修改 `TimelinePanel.tsx` 第1932行：
```tsx
width: isMonthStart ? 2 : 1,  // 改为 width: 1,
```

## 验证步骤

1. **刷新页面**，查看甘特图
2. **查找红色垂直线**（今日线）
3. **确认顶部标签可见**：
   - 标签显示 "今日：YYYY-MM-DD"
   - 标签在红线正上方，清晰可见
   - 标签有红色背景，白色文字，带边框和发光效果
4. **切换不同时间尺度**（月/周/日），确认标签始终可见
5. **滚动页面**，确认标签不被遮挡

## 相关文件

- ✅ `timeplan-craft-kit/src/components/timeline/TodayLine.tsx` - 今日线组件
- `timeplan-craft-kit/src/components/timeline/TimelinePanel.tsx` - 主面板（调用TodayLine）
- `timeplan-craft-kit/src/theme/timelineColors.ts` - 颜色定义

## 后续建议

如果用户反馈边框粗细问题确实影响使用，可以考虑：
1. **统一所有垂直网格线为 1px**
2. **使用颜色而非粗细来区分月份边界**（保持1px，但颜色更深）
3. **仅在特定尺度下（如day）才加粗月初线**

## 状态

✅ **已完成**: 今日线 z-index 和标签样式优化
ℹ️ **已说明**: 垂直网格线粗细差异是设计特性
