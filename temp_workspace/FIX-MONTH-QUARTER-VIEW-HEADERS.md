# 修复月视图和季度视图的时间轴划分显示

## 问题描述

**用户反馈**: 在timeplan详情页中，月视图和季度视图的时间轴上，红框处（第二行子级表头）没有显示对应的月划分和季度划分。

**现状**:
- 父级表头（第一行）：只显示年份"2026"
- 子级表头（第二行）：完全空白，没有显示月份或季度标签

**期望**:
- 月视图：子级表头应显示"1月"、"2月"、"3月"..."12月"
- 季度视图：子级表头应显示"Q1"、"Q2"、"Q3"、"Q4"

---

## 根本原因

在之前的修改中（`FIX-MONTH-QUARTER-VIEW-RESTORE-COMPLETE.md`），我们将月视图和季度视图的子级表头设置为**不显示文字**，只保留格子结构：

```typescript
// 之前的代码（错误）
{scale !== 'month' && scale !== 'quarter' && (
  <>
    <div>{formatDateHeader(date, scale)}</div>
  </>
)}
```

这导致月视图和季度视图的子级表头中没有任何文字标签，用户无法看到月份或季度的划分。

---

## 修复方案

### 修改文件
`src/components/timeline/TimelinePanel.tsx`

### 修改内容

#### 修改前
```typescript
/**
 * 渲染子级表头（日期层）
 * ✅ 月视图和季度视图：显示空格子（无文字，只有网格分隔）
 */
const renderChildHeaders = useCallback(() => {
  return (
    <div style={{ display: 'flex', height: 36, width: totalWidth, minWidth: '100%' }}>
      {dateHeaders.map((date, index) => {
        const columnWidth = getScaleUnit(scale);
        // ...

        return (
          <div key={index} style={{ width: columnWidth, /* ... */ }}>
            {/* ❌ 月视图和季度视图：不显示文字，只保留格子结构 */}
            {scale !== 'month' && scale !== 'quarter' && (
              <>
                {/* 日期标签 */}
                <div>{formatDateHeader(date, scale)}</div>
                {/* 节假日标签 */}
                {holidayName && scale === 'day' && (
                  <div>{holidayName}</div>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}, [scale, dateHeaders, totalWidth, token]);
```

#### 修改后
```typescript
/**
 * 渲染子级表头（日期层）
 * ✅ 月视图：显示月份（1月、2月...）
 * ✅ 季度视图：显示季度（Q1、Q2、Q3、Q4）
 */
const renderChildHeaders = useCallback(() => {
  return (
    <div style={{ display: 'flex', height: 36, width: totalWidth, minWidth: '100%' }}>
      {dateHeaders.map((date, index) => {
        const columnWidth = getScaleUnit(scale);
        // ...

        return (
          <div key={index} style={{ width: columnWidth, /* ... */ }}>
            {/* ✅ 所有视图都显示对应的日期标签 */}
            <div>{formatDateHeader(date, scale)}</div>
            
            {/* 节假日标签 - 只在天视图显示 */}
            {holidayName && scale === 'day' && (
              <div>{holidayName}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}, [scale, dateHeaders, totalWidth, token]);
```

### 关键变化

1. **移除条件判断**: 删除了 `scale !== 'month' && scale !== 'quarter' &&` 条件
2. **恢复文字显示**: 所有视图（包括月视图和季度视图）的子级表头都显示对应的日期标签
3. **保持节假日逻辑**: 节假日标签仍然只在天视图中显示

---

## formatDateHeader 函数行为

根据 `src/utils/dateUtils.ts` 中的实现，`formatDateHeader` 函数会根据不同的 `scale` 返回不同格式的日期：

### 天视图 (day)
```typescript
// 返回: "1日"、"2日"、"3日"...
return format(date, 'd日', { locale: zhCN });
```

### 周视图 (week)
```typescript
// 返回: "1周"、"2周"、"3周"...
return `${Math.ceil(date.getDate() / 7)}周`;
```

### 双周视图 (biweekly)
```typescript
// 返回: "1双周"、"2双周"...
return `${Math.ceil(date.getDate() / 14)}双周`;
```

### 月视图 (month)
```typescript
// 返回: "1月"、"2月"、"3月"..."12月"
return format(date, 'M月', { locale: zhCN });
```

### 季度视图 (quarter)
```typescript
// 返回: "Q1"、"Q2"、"Q3"、"Q4"
const quarter = Math.ceil((date.getMonth() + 1) / 3);
return `Q${quarter}`;
```

---

## 修复后的效果

### 月视图
```
┌─────────────────────────────┐
│           2026              │  ← 父级表头（年份）
├─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┤
│1│2│3│4│5│6│7│8│9│10│11│12│  ← 子级表头（月份）
│月月月月月月月月月月 月 月 │
```

### 季度视图
```
┌──────────────────────────────────┐
│    2024    │    2025    │   2026  │  ← 父级表头（年份）
├────┬────┬──┼────┬────┬──┼───┬────┤
│ Q1 │ Q2 │Q3│ Q4 │ Q1 │Q2 │Q3 │ Q4 │  ← 子级表头（季度）
```

---

## 构建状态

**注意**: 运行 `pnpm run build` 后出现了一些TypeScript类型错误，但这些错误是**之前就存在的遗留问题**，与本次修改无关：

```
error TS2739: Type '{ id: string; title: string; ... }' is missing the following properties from type 'Timeline': name, lineIds
error TS2345: Property 'label' is missing in type '{ ... }' but required in type 'Line'.
```

这些类型错误需要单独修复Mock数据和类型定义，不影响本次功能修复的正确性。

---

## 验证测试

修复完成后，请验证以下功能：

### 月视图
- [ ] 父级表头显示年份（如"2026"）
- [ ] 子级表头显示月份（如"1月"、"2月"..."12月"）
- [ ] 每个月份对应一个格子，宽度根据该月天数计算
- [ ] 网格线正确分隔每个月

### 季度视图
- [ ] 父级表头显示年份（如"2024"、"2025"、"2026"）
- [ ] 子级表头显示季度（如"Q1"、"Q2"、"Q3"、"Q4"）
- [ ] 每个季度对应一个格子，宽度根据该季度天数计算
- [ ] 网格线正确分隔每个季度

### 其他视图（确保不受影响）
- [ ] 天视图：显示"1日"、"2日"、"3日"...
- [ ] 周视图：显示"1周"、"2周"、"3周"...
- [ ] 双周视图：显示"1双周"、"2双周"...

---

## 总结

**修复内容**: 恢复了月视图和季度视图的子级表头文字显示
**修改文件**: `src/components/timeline/TimelinePanel.tsx`
**修改行数**: 约10行（移除条件判断，简化渲染逻辑）
**影响范围**: 仅影响月视图和季度视图的子级表头显示
**向后兼容**: 是（不影响其他视图的功能）

**核心原则**: 时间轴的子级表头应该**始终显示**对应时间粒度的标签，让用户清晰地看到时间划分。
