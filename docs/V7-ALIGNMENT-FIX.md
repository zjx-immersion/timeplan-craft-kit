# V7 时间轴对齐修复报告

## 📋 问题描述

**严重对齐错误**：时间轴刻度、今日线、节点位置完全不对齐！

### 现象

从截图和控制台日志分析：

1. **时间刻度头显示**：`11, 12, 今日: 2026-02-08, 2, 3...`
2. **红色今日线**：在 2026-02-08 的位置
3. **节点位置**：与时间刻度完全错位
4. **RelationRenderer 日志**：30个有效关系，但渲染位置不正确

## 🔍 根本原因

### ❌ V6 错误实现

```typescript:45:50:timeplan-craft-kit/src/utils/dateUtils.ts
case 'month':
  // ❌ 错误：规范化到年初（2024-01-01）
  return startOfYear(date);
case 'quarter':
  // ❌ 错误：往前推2年
  return new Date(currentYear - 2, 0, 1);
```

### 问题分析

1. **用户查看 2026年2月**
   - `viewStartDate` 被规范化到 `2024-01-01`（年初）
   - 时间刻度头从 2026-02-01 开始显示
   - 节点位置从 2024-01-01 开始计算
   - **完全错位！**

2. **对齐失败链路**
   ```
   normalizeViewStartDate(2026-02-15, 'month')
   ↓
   ❌ 返回 2024-01-01 (startOfYear)
   ↓
   TimelineHeader: 从 2026-02-01 渲染
   节点位置: 从 2024-01-01 计算
   ↓
   严重错位！
   ```

## ✅ V7 修复方案

### 参考原项目（timeline-craft-kit）

**正确实现**：

```typescript:47:48:timeline-craft-kit/src/utils/dateUtils.ts
case 'month':
  return startOfMonth(date);  // ✅ 规范化到月初
```

### 修复内容

#### 1. 修复视图日期规范化函数

**文件**: `timeplan-craft-kit/src/utils/dateUtils.ts`

```typescript
// ❌ 修复前
case 'month':
  return startOfYear(date);  // 返回年初

// ✅ 修复后
case 'month':
  return startOfMonth(date);  // 返回月初（参考原项目）
```

```typescript
// ❌ 修复前
case 'month':
  return endOfYear(date);  // 返回年末

// ✅ 修复后
case 'month':
  return endOfMonth(date);  // 返回月末（参考原项目）
```

#### 2. 修复时间刻度头宽度计算

**文件**: `timeplan-craft-kit/src/components/timeline/TimelineHeader.tsx`

**月视图子级**：

```typescript
// ✅ 修复后：使用该月实际天数（28-31天）
case 'month': {
  const months = eachMonthOfInterval({ start: startDate, end: endDate });
  months.forEach((month) => {
    const daysInMonth = getDaysInMonth(month);  // 28-31天
    
    cells.push({
      date: month,
      label: format(month, 'M'),
      width: daysInMonth * pixelsPerDay,  // ✅ 28-31天 × 5px
    });
  });
  break;
}
```

**周视图子级**：

```typescript
// ✅ 修复后：精确7天
case 'week': {
  const weeks = eachWeekOfInterval({ start: startDate, end: endDate }, { weekStartsOn: 1 });
  weeks.forEach((weekStart) => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    
    cells.push({
      date: weekStart,
      label: `${format(weekStart, 'd')}-${format(weekEnd, 'd')}`,
      width: 7 * pixelsPerDay,  // ✅ 精确7天
    });
  });
  break;
}
```

**双周视图子级**：

```typescript
// ✅ 修复后：精确14天
case 'biweekly': {
  let current = startOfWeek(startDate, { weekStartsOn: 1 });
  while (current <= endDate) {
    const periodEnd = addDays(current, 13);
    
    cells.push({
      date: current,
      label: `${format(current, 'M/d')}-${format(periodEnd, 'd')}`,
      width: 14 * pixelsPerDay,  // ✅ 精确14天
    });
    current = addDays(current, 14);
  }
  break;
}
```

## 🎯 修复后对齐机制

### 统一基准日期

```typescript
// TimelinePanel.tsx
const normalizedViewStartDate = useMemo(() => 
  normalizeViewStartDate(viewStartDate, scale), [viewStartDate, scale]);

// 月视图示例
normalizeViewStartDate(new Date(2026, 1, 15), 'month')
// ✅ 返回: 2026-02-01 (月初)
```

### 统一计算流程

```
用户查看 2026年2月
↓
normalizeViewStartDate(2026-02-15, 'month')
↓
✅ 返回 2026-02-01 (startOfMonth)
↓
TimelineHeader:
- 2月宽度 = getDaysInMonth(2月) × 5px = 28 × 5px = 140px
↓
节点位置计算:
- getPositionFromDate(2026-02-15, 2026-02-01, 'month')
- = differenceInCalendarDays(2026-02-15, 2026-02-01) × 5px
- = 14 × 5px = 70px
↓
✅ 完美对齐！节点位置在2月刻度范围内（0-140px）
```

### 对齐保证

1. **统一基准日期**：所有计算使用 `normalizeViewStartDate(viewStartDate, scale)`
2. **统一像素比率**：所有计算使用 `getPixelsPerDay(scale)`（月视图为 5px/天）
3. **统一计算方法**：使用 `differenceInCalendarDays` 计算天数差
4. **实际天数**：表头宽度使用实际月份天数（28-31），而非固定值

## 📊 对比验证

### 修复前（V6）

```
viewStartDate: 2024-01-01 (错误：被规范化到年初)
TimelineHeader: 从 2026-02-01 开始渲染
节点位置: 从 2024-01-01 开始计算
结果: 严重错位（2年+ 1月的偏移）
```

### 修复后（V7）

```
viewStartDate: 2026-02-01 (正确：被规范化到月初)
TimelineHeader: 从 2026-02-01 开始渲染
节点位置: 从 2026-02-01 开始计算
结果: ✅ 完美对齐
```

## 🧪 测试验证

### 单元测试

```bash
npm test -- src/utils/__tests__/dateUtils.test.ts --run
```

**预期结果**：
- ✅ V5 核心算法测试全部通过
- ✅ `normalizeViewStartDate` 月视图返回月初

### 手工测试

1. **今日线对齐**：红线应该对齐到今天的日期刻度
2. **Bar对齐**：左右边缘应该对齐到起止日期刻度
3. **Milestone对齐**：应该对齐到其日期刻度
4. **关系线对齐**：连线起止点应该对齐到节点位置

## 📝 关键修改总结

| 文件 | 修改内容 | 影响 |
|------|---------|------|
| `dateUtils.ts` | 月视图规范化：`startOfYear` → `startOfMonth` | 修复基准日期错误 |
| `dateUtils.ts` | 季度视图规范化：自定义逻辑 → `startOfQuarter` | 统一使用date-fns |
| `TimelineHeader.tsx` | 月视图子级：动态天数 → `getDaysInMonth` | 使用实际天数（28-31） |
| `TimelineHeader.tsx` | 周视图子级：动态天数 → `7 * pixelsPerDay` | 精确7天 |
| `TimelineHeader.tsx` | 双周视图子级：动态天数 → `14 * pixelsPerDay` | 精确14天 |

## 🎉 预期效果

修复后，时间轴应该实现：

1. ✅ **今日线**（红线）精确对齐到今天的日期刻度
2. ✅ **Bar节点**的左右边缘精确对齐到起止日期刻度
3. ✅ **Milestone节点**精确对齐到其日期刻度
4. ✅ **关系线**的起止点精确对齐到节点位置
5. ✅ **时间刻度头**的宽度与节点位置计算使用相同基准

---

**修复时间**: 2026-02-08  
**修复版本**: V7  
**参考**: timeline-craft-kit 原项目实现
