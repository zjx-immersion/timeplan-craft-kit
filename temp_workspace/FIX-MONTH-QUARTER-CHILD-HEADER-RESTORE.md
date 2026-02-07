# 修复月视图/季度视图子级表头显示

## 问题分析

**用户反馈**: 第一行的年显示了，但第二行的月/季度没有正确显示

**根本原因**: 
- 之前的修改让 `renderChildHeaders` 返回 `null`，导致**整个子级表头层消失**
- 但实际上需要：**渲染空格子**（无文字，但要有网格结构和分隔线）

**截图分析**:
```
当前状态（错误）:
┌─────────────────────────────┐
│  2025      |      2026       │  ← 只有父级表头
└─────────────────────────────┘
（下面直接是时间线内容，没有网格分隔）

目标状态（正确）:
┌─────────────────────────────┐
│  2025      |      2026       │  ← 父级表头（年）
├─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┤  ← 子级表头（空格，有网格线）
```

## 修复方案

### 1. TimelinePanel.tsx - 恢复子级表头渲染

**位置**: `src/components/timeline/TimelinePanel.tsx` → `renderChildHeaders`

**核心逻辑**:
```typescript
const renderChildHeaders = useCallback(() => {
  return (
    <div style={{ display: 'flex', height: 36, width: totalWidth }}>
      {dateHeaders.map((date, index) => {
        const columnWidth = getScaleUnit(scale);
        
        return (
          <div
            key={index}
            style={{
              width: columnWidth,
              flexShrink: 0,
              borderRight: `1px solid ${token.colorBorderSecondary}`,
              // ...
            }}
          >
            {/* ✅ 月视图和季度视图：不显示文字，只保留格子结构 */}
            {scale !== 'month' && scale !== 'quarter' && (
              <>
                <div>{formatDateHeader(date, scale)}</div>
                {/* 节假日标签等 */}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}, [scale, dateHeaders, totalWidth, token]);
```

**关键点**:
1. **始终渲染** `<div>` 格子结构
2. **条件显示** 文字内容：`scale !== 'month' && scale !== 'quarter'` 时才显示
3. **保留边框**: `borderRight` 始终存在，创建网格分隔效果

### 2. 月视图网格效果

**原理**:
```
父级:  2026                          ← 年份
      ├───────────────────────────┤
子级:  │ │ │ │ │ │ │ │ │ │ │ │      ← 12个空格（每个代表1个月）
      1月2月3月...12月              ← 通过网格线隐式表达
```

- **每个格子宽度** = 该月天数 × `PIXELS_PER_DAY` (40px)
- **格子边框** = `1px solid ${token.colorBorderSecondary}`
- **格子内容** = 空（无文字）

### 3. 季度视图网格效果

**原理**:
```
父级:  2024        2025        2026  ← 年份
      ├─────────┬─────────┬─────────┤
子级:  │   │   │ │   │   │ │   │   │ ← 12个空格（每个代表1个季度）
      Q1 Q2 Q3 Q4 Q1 Q2 Q3 Q4 Q1 Q2  ← 通过网格线隐式表达
```

- **每个格子宽度** = 该季度天数 × `PIXELS_PER_DAY` (40px)
- **格子边框** = `1px solid ${token.colorBorderSecondary}`
- **格子内容** = 空（无文字）

## 构建验证

```bash
pnpm run build
# ✅ 构建成功
```

## 视觉对比

### 修复前（错误）
- ❌ 只有父级表头（年）
- ❌ 下面没有网格分隔
- ❌ 时间线元素无法对准月份/季度

### 修复后（正确）
- ✅ 父级表头显示年份
- ✅ 子级表头显示空格子（12个月 或 多个季度）
- ✅ 网格线清晰分隔每个月/季度
- ✅ 时间线元素精准对齐到日期

## 总结

**核心原则**: 
- 月视图/季度视图的**设计语言**是"减少文字，保留结构"
- **不是**完全删除子级表头，而是**隐藏文字，保留格子**
- 通过**网格线**隐式表达时间单位（月/季度）

**修复完成**: ✅
- [x] 恢复子级表头渲染
- [x] 条件隐藏文字（月视图/季度视图）
- [x] 保留网格结构和分隔线
- [x] 构建验证通过
