# 时间轴对齐问题修复报告

## 🐛 严重Bug：时间轴、今日线、节点位置完全不对齐

### 问题描述

用户截图显示：
- 时间刻度头显示2026年2月
- 红色今日线在2026-02-08的位置
- **但是节点（Bar/Milestone）的位置与日期刻度完全错位**
- 导致无法准确判断节点的起止日期

### 根本原因

**TimelineHeader 组件的子级表头宽度计算有严重bug！**

在生成时间刻度时，**假设每个时间单位都是完整的**：
- 月视图：假设每个月都从1号开始，使用 `getDaysInMonth(month)`
- 周视图：假设每周都是完整的7天
- 双周视图：假设每两周都是完整的14天

**但实际上，视图边界可能在月中间、周中间！**

### 问题代码（V6之前）

#### 月视图 Bug

```typescript
case 'month': {
  const months = eachMonthOfInterval({ start: startDate, end: endDate });
  months.forEach((month) => {
    // ❌ 错误：使用整月天数，忽略了视图边界
    const daysInMonth = getDaysInMonth(month);  // 假设整月
    cells.push({
      date: month,
      label: format(month, 'M'),
      width: daysInMonth * pixelsPerDay,  // ❌ 如果视图从1月15号开始，这里会多算15天！
    });
  });
  break;
}
```

**问题示例：**
- 视图范围：`2024-01-15` 到 `2028-12-31`
- 第一个月份刻度：2024年1月
  - ❌ V6错误：宽度 = 31天 * 5px = 155px
  - ✅ V7正确：宽度 = 17天（15-31）* 5px = 85px
- **差异：70px**（14天的偏移）
- 随着刻度推移，**偏移越来越大**！

#### 周视图 Bug

```typescript
case 'week': {
  const weeks = eachWeekOfInterval({ start: startDate, end: endDate }, { weekStartsOn: 1 });
  weeks.forEach((weekStart) => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    cells.push({
      date: weekStart,
      label: `${format(weekStart, 'd')}-${format(weekEnd, 'd')}`,
      width: 7 * pixelsPerDay,  // ❌ 假设完整7天
    });
  });
  break;
}
```

#### 双周视图 Bug

```typescript
case 'biweekly': {
  let current = startOfWeek(startDate, { weekStartsOn: 1 });
  while (current <= endDate) {
    const periodEnd = addDays(current, 13);
    cells.push({
      date: current,
      label: `${format(current, 'M/d')}-${format(periodEnd, 'd')}`,
      width: 14 * pixelsPerDay,  // ❌ 假设完整14天
    });
    current = addDays(current, 14);
  }
  break;
}
```

---

## ✅ 修复方案

### 核心原则

**所有时间刻度的宽度必须使用"在视图范围内的实际天数"计算：**

```typescript
// ✅ 正确的计算方式
const monthEnd = endOfMonth(month);
const actualStart = month < startDate ? startDate : month;
const actualEnd = monthEnd > endDate ? endDate : monthEnd;
const daysInView = differenceInCalendarDays(actualEnd, actualStart) + 1;

cells.push({
  date: month,
  label: format(month, 'M'),
  width: daysInView * pixelsPerDay,  // ✅ 使用视图内实际天数
});
```

### 月视图修复

```typescript
case 'month': {
  // 子级：月份（1, 2, 3...12）
  const months = eachMonthOfInterval({ start: startDate, end: endDate });
  months.forEach((month) => {
    // ✅ 修复：计算该月在视图范围内的实际天数（而不是整月天数）
    const monthEnd = endOfMonth(month);
    const actualStart = month < startDate ? startDate : month;
    const actualEnd = monthEnd > endDate ? endDate : monthEnd;
    const daysInView = differenceInCalendarDays(actualEnd, actualStart) + 1;
    
    cells.push({
      date: month,
      label: format(month, 'M'),  // ✅ 只显示数字：1, 2, 3...12
      width: daysInView * pixelsPerDay,  // ✅ 使用视图内实际天数，确保对齐
    });
  });
  break;
}
```

### 周视图修复

```typescript
case 'week': {
  // 子级：周范围（1-7, 8-14...）
  const weeks = eachWeekOfInterval({ start: startDate, end: endDate }, { weekStartsOn: 1 });
  weeks.forEach((weekStart) => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    // ✅ 修复：计算该周在视图范围内的实际天数
    const actualStart = weekStart < startDate ? startDate : weekStart;
    const actualEnd = weekEnd > endDate ? endDate : weekEnd;
    const daysInView = differenceInCalendarDays(actualEnd, actualStart) + 1;
    
    cells.push({
      date: weekStart,
      label: `${format(weekStart, 'd')}-${format(weekEnd, 'd')}`,
      width: daysInView * pixelsPerDay,  // ✅ 使用视图内实际天数
    });
  });
  break;
}
```

### 双周视图修复

```typescript
case 'biweekly': {
  // 子级：双周范围（1/1-14, 1/15-28...）
  let current = startOfWeek(startDate, { weekStartsOn: 1 });
  while (current <= endDate) {
    const periodEnd = addDays(current, 13);
    // ✅ 修复：计算该双周在视图范围内的实际天数
    const actualStart = current < startDate ? startDate : current;
    const actualEnd = periodEnd > endDate ? endDate : periodEnd;
    const daysInView = differenceInCalendarDays(actualEnd, actualStart) + 1;
    
    cells.push({
      date: current,
      label: `${format(current, 'M/d')}-${format(periodEnd, 'd')}`,
      width: daysInView * pixelsPerDay,  // ✅ 使用视图内实际天数
    });
    current = addDays(current, 14);
  }
  break;
}
```

### 季度视图（已正确）

季度视图的代码已经正确实现了实际天数计算，无需修改。

---

## 📊 修复效果

### 修复前（V6）

```
时间刻度头：
[======== 1月 ========] [======== 2月 ========] ...
  155px (31天 × 5px)      140px (28天 × 5px)
  ❌ 错误：从1月1号开始    ❌ 错误：完整2月

节点位置计算：
- 使用 normalizedViewStartDate = 2024-01-15
- 节点从1月15号开始计算位置

结果：时间刻度和节点位置偏移 70px！
```

### 修复后（V7）

```
时间刻度头：
[==== 1月 ====] [======== 2月 ========] ...
  85px (17天 × 5px)    140px (28天 × 5px)
  ✅ 正确：从1月15号   ✅ 正确：完整2月

节点位置计算：
- 使用 normalizedViewStartDate = 2024-01-15
- 节点从1月15号开始计算位置

结果：时间刻度和节点位置完全对齐！✅
```

---

## 🔍 对齐原理

### 一致的计算基准

1. **viewStartDate 规范化**
   ```typescript
   case 'month':
     return startOfYear(date);  // 返回2024-01-01
   ```

2. **时间刻度头生成**（TimelineHeader）
   ```typescript
   // 父级表头（年份）：使用actualDays计算宽度
   // 子级表头（月份）：使用actualDays计算宽度 ✅ V7修复
   ```

3. **节点位置计算**（getPositionFromDate）
   ```typescript
   const diffDays = differenceInCalendarDays(normalizedDate, normalizedStart);
   return diffDays * pixelsPerDay;
   ```

4. **今日线位置计算**（TodayLine）
   ```typescript
   const todayPosition = getPositionFromDate(today, viewStartDate, scale);
   ```

### 关键一致性

✅ **所有计算都使用相同的基准日期**：`normalizedViewStartDate`  
✅ **所有计算都使用相同的像素比率**：`pixelsPerDay`  
✅ **所有计算都使用实际日历天数**：`differenceInCalendarDays + 1`

---

## 📝 修改文件

### `src/components/timeline/TimelineHeader.tsx`

#### 修改1：月视图子级表头
- **行数：** 264-277
- **修改：** 从 `getDaysInMonth(month)` 改为 `differenceInCalendarDays(actualEnd, actualStart) + 1`

#### 修改2：周视图子级表头
- **行数：** 235-246
- **修改：** 从固定 `7 * pixelsPerDay` 改为计算实际天数

#### 修改3：双周视图子级表头
- **行数：** 249-261
- **修改：** 从固定 `14 * pixelsPerDay` 改为计算实际天数

---

## 🧪 验证测试

### 手工测试场景

1. **月视图对齐测试**
   - [ ] 打开月视图
   - [ ] 检查时间刻度头的每个月份宽度
   - [ ] 检查节点（Bar）的位置是否与日期刻度对齐
   - [ ] 检查今日线（红线）是否对齐到今天的日期刻度

2. **周视图对齐测试**
   - [ ] 切换到周视图
   - [ ] 检查每周刻度宽度
   - [ ] 检查节点位置对齐

3. **双周视图对齐测试**
   - [ ] 切换到双周视图
   - [ ] 检查双周刻度宽度
   - [ ] 检查节点位置对齐

4. **季度视图对齐测试**
   - [ ] 切换到季度视图
   - [ ] 检查季度刻度宽度
   - [ ] 检查节点位置对齐

### 关键验证点

- ✅ **今日线应该精确对齐到今天的日期刻度**
- ✅ **Bar的左边缘应该对齐到startDate的日期刻度**
- ✅ **Bar的右边缘应该对齐到endDate的日期刻度**
- ✅ **Milestone应该对齐到其日期的日期刻度**
- ✅ **拖拽调整节点后，位置应该保持对齐**

---

## 💡 经验教训

### 教训1：不要假设时间单位是完整的

❌ **错误假设：** 每个月都是完整的31天  
✅ **正确做法：** 计算该月在视图范围内的实际天数

### 教训2：统一使用实际天数计算

所有宽度/位置计算都应该基于：
```typescript
differenceInCalendarDays(endDate, startDate) + 1
```

### 教训3：父级和子级表头必须使用相同的计算方式

- 父级表头（年份）使用实际天数 ✅
- 子级表头（月份）也必须使用实际天数 ✅

### 教训4：视图边界必须在所有地方统一处理

```typescript
const actualStart = periodStart < viewStartDate ? viewStartDate : periodStart;
const actualEnd = periodEnd > viewEndDate ? viewEndDate : periodEnd;
```

---

## 🚀 下一步

### 建议测试

1. **边界测试**
   - 视图从月中间开始（如1月15号）
   - 视图从周中间开始（如周三）
   - 视图跨越多年（2024-2028）

2. **缩放测试**
   - 切换不同的scale（day, week, month, quarter）
   - 验证每种scale下对齐都正确

3. **交互测试**
   - 拖拽节点，验证位置仍然对齐
   - 拖拽调整节点宽度，验证对齐
   - 滚动时间轴，验证对齐保持

---

**修复完成时间：** 2026-02-06  
**修复版本：** V7  
**修复级别：** 🔴 严重Bug修复  
**测试状态：** ⏳ 待手工验证
