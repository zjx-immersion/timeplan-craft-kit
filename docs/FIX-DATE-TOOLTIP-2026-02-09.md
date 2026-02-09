# 日期显示和 Tooltip 功能修复 (2026-02-09)

## ✅ 已完成修复

### 1. 修复 BaselineMarker 日期解析错误

**问题**: 
```
[BaselineMarker] Error calculating position: TypeError: date.getFullYear is not a function
```

**原因**: 从 `localStorage` 加载数据后，日期可能被序列化为字符串，导致 `baseline.date` 不是 `Date` 对象。

**修复**:
- `BaselineMarker.tsx` (line 99-104): 在计算位置前确保日期转换为 `Date` 对象
- `BaselineMarker.tsx` (line 120-127): 在格式化日期前确保日期转换为 `Date` 对象

```typescript
// ✅ 修复前
const pos = getPositionFromDate(baseline.date, viewStartDate, scale);

// ✅ 修复后
const dateObj = baseline.date instanceof Date ? baseline.date : new Date(baseline.date);
const pos = getPositionFromDate(dateObj, viewStartDate, scale);
```

---

### 2. 添加鼠标悬停显示日期功能

为以下三种元素类型添加了 `Tooltip` 显示日期信息：

#### 📊 Bar (lineplan) - 显示起止日期范围
```typescript
Tooltip: "2026-01-15 ~ 2026-03-31"
```

#### 🔺 Milestone - 显示单个日期
```typescript
Tooltip: "2026-04-01"
```

#### 🔷 Gateway - 显示单个日期
```typescript
Tooltip: "2026-05-15"
```

**实现细节**:
- 使用 `antd` 的 `Tooltip` 组件
- 悬停延迟 0.5 秒 (`mouseEnterDelay={0.5}`)
- 位置固定在上方 (`placement="top"`)
- 使用 `date-fns` 格式化日期为 `yyyy-MM-dd` 格式

---

### 3. 单元测试验证

✅ **所有测试通过** (14个测试)

```bash
npm test -- timelineCoordinates.test.ts

✓ src/utils/__tests__/timelineCoordinates.test.ts (14 tests) 4ms

Test Files  1 passed (1)
     Tests  14 passed (14)
```

**测试覆盖**:
- ✅ 本地时间计算逻辑
- ✅ 不同时间尺度 (day, week, month) 下的坐标计算
- ✅ 日期到像素位置的转换
- ✅ 跨年跨月的边界情况

---

## 🔍 测试指引

### 步骤 1: 刷新浏览器

清除缓存并刷新浏览器，确保加载最新代码。

### 步骤 2: 验证 Tooltip 功能

1. **测试 Bar (lineplan)**:
   - 鼠标悬停在任意横条上
   - 应该显示 `起始日期 ~ 结束日期` 格式的 Tooltip

2. **测试 Milestone**:
   - 鼠标悬停在任意里程碑（倒三角）上
   - 应该显示单个日期的 Tooltip

3. **测试 Gateway**:
   - 鼠标悬停在任意网关（菱形）上
   - 应该显示单个日期的 Tooltip

### 步骤 3: 验证日期对齐

使用 Tooltip 显示的日期信息，对比时间轴上的月份/日期标记：

1. **今日标记 (2026-02-09)**:
   - 红色竖线应该精确对齐到 2 月时间轴的 2/9 位置

2. **任务条起始/结束**:
   - 悬停显示日期后，检查该日期是否与时间轴对齐
   - 例如：`2026-01-15` 应该在 1 月时间轴的中间偏后位置

3. **跨月检查**:
   - 检查横跨多个月的任务条
   - 起始点和结束点都应该与对应月份的日期对齐

---

## 📊 关键日志信息

从 console log 中提取关键信息用于验证：

```javascript
[TodayLine] 今日标记位置计算: {
  今天: '2026-02-09',
  起始日期: '2024-01-01',
  scale: 'month',
  计算位置: 3850
}

[TimelinePanel] 第一个Line位置计算: {
  lineId: 'line-pm-001',
  原始startDate: '2026-01-15T00:00:00.000Z',
  解析后: '2026-01-15',
  viewStartDate: '2024-01-01'
}
[TimelinePanel] 第一个Line计算位置: 3725
```

**验证要点**:
- 今日 (2026-02-09) 位置: 3850px
- line-pm-001 (2026-01-15) 位置: 3725px
- 差值: 125px (应该约等于 25 天 × 每天像素数)

---

## 🔧 核心修改文件

1. **BaselineMarker.tsx**:
   - 修复日期解析错误
   - 确保 `baseline.date` 始终为 `Date` 对象

2. **LineRenderer.tsx**:
   - 引入 `antd Tooltip`, `date-fns format`
   - 为 `BarRenderer` 添加日期范围 Tooltip
   - 为 `MilestoneRenderer` 添加日期 Tooltip
   - 为 `GatewayRenderer` 添加日期 Tooltip

3. **dateUtils.ts** (之前已修复):
   - `getPositionFromDate`: 使用明确的本地时间计算
   - `getBarWidthPrecise`: 使用明确的本地时间计算

---

## 📝 下一步

如果测试后发现对齐问题依然存在，请提供：

1. **截图**: 显示未对齐的具体位置
2. **Tooltip 日期**: 鼠标悬停显示的日期
3. **Console Log**: 该元素对应的位置计算日志
4. **时间轴刻度**: 当前使用的视图（日/周/月）

这些信息将帮助我们更精确地定位和修复对齐问题。

---

## 💡 技术细节

### 日期处理原则

1. **统一本地时间**: 所有日期计算都基于本地时间的年月日
2. **避免 UTC 偏移**: 通过 `new Date(year, month, date)` 构造本地日期对象
3. **一致性验证**: 使用 Tooltip 显示的日期作为"真相源"进行对齐验证

### 关键计算逻辑

```typescript
// ✅ 正确：明确使用本地时间
const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
const localStart = new Date(viewStartDate.getFullYear(), viewStartDate.getMonth(), viewStartDate.getDate());
const diffDays = differenceInCalendarDays(localDate, localStart);
return diffDays * pixelsPerDay;
```

### Tooltip 实现

```typescript
// Bar (lineplan) - 显示日期范围
const dateRangeText = React.useMemo(() => {
  const startDate = line.startDate instanceof Date ? line.startDate : new Date(line.startDate);
  const endDate = line.endDate instanceof Date ? line.endDate : new Date(line.endDate);
  return `${format(startDate, 'yyyy-MM-dd')} ~ ${format(endDate, 'yyyy-MM-dd')}`;
}, [line.startDate, line.endDate]);

<Tooltip title={dateRangeText} placement="top" mouseEnterDelay={0.5}>
  {/* 元素内容 */}
</Tooltip>
```

---

**修复完成时间**: 2026-02-09
**单元测试状态**: ✅ 全部通过 (14/14)
**Linter 状态**: ✅ 无错误
