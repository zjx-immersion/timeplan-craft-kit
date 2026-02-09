# 时间轴对齐问题修复总结

**修复日期**: 2026-02-09  
**问题描述**: 顶部时间轴与甘特图画布中渲染的元素没有对齐  
**根本原因**: Date对象的时区转换导致计算偏差

---

## 🔧 核心修复

### 1. 创建统一坐标系统 (`timelineCoordinates.ts`)

**目的**: 建立基于"天"为最小单位的统一坐标系统

**核心原则**:
- 所有计算都基于本地时间（年、月、日），避免时区转换
- 位置计算公式：`position = 天数差 × 每天像素数`
- 宽度计算公式：`width = 实际天数 × 每天像素数`

**关键函数**:
```typescript
- getPixelsPerDay(scale): 获取每天的像素数
- createLocalDate(year, month, day): 创建本地日期，避免时区问题
- getDaysDifference(startDate, endDate): 计算两个日期之间的天数差
- generateMonthsArray(): 生成月份数组，包含每月的实际天数
- getPositionFromLocalDate(): 计算日期在时间轴上的位置（像素）
- getRangeWidth(): 计算时间范围的宽度（像素）
```

### 2. 修复 TimelineHeader 组件

**问题**: `eachMonthOfInterval` 等函数使用的 Date 对象会被隐式转换为 UTC 时间

**解决方案**:
1. 在使用 `eachMonthOfInterval` 之前，先将 Date 对象转换为本地时间：
   ```typescript
   const localStart = createLocalDate(
     startDate.getFullYear(),
     startDate.getMonth(),
     startDate.getDate()
   );
   ```
2. 所有的 `date-fns` 函数都使用 `localStart` 和 `localEnd`
3. 日志输出使用本地时间格式化，避免显示 UTC 时间

**修改文件**:
- `src/components/timeline/TimelineHeader.tsx`
  - 修改 `getParentHeaders()` 函数
  - 修改 `getChildHeaders()` 函数
  - 修改 console.log 输出格式

### 3. 保持网格线逻辑

**TimelinePanel 中的网格线渲染**:
- ✅ 月视图和季度视图：使用累积宽度计算网格线位置
- ✅ 其他视图：使用固定列宽 × 索引

---

## 🧪 单元测试

创建了完整的单元测试文件：
`src/utils/__tests__/timelineCoordinates.test.ts`

**测试覆盖**:
- ✅ 像素计算
- ✅ 本地日期创建
- ✅ 天数差计算
- ✅ 月份数组生成
- ✅ 位置计算
- ✅ 宽度计算
- ✅ 综合测试（验证3月应该显示在正确位置）

---

## 📋 验证检查清单

### 刷新浏览器后，检查以下内容：

#### 1. Console日志检查
```
[TimelineHeader] 🎨 渲染开始:
  - startDate 应该是 "2024-01-01" (不是 "2023-12-31") ✅
  - endDate 应该是 "2028-12-31" (不是 "2028-12-30") ✅
```

#### 2. 月视图（Month View）
- [ ] 2024年的12个月应该平铺显示
- [ ] 每个月的宽度应该与实际天数成正比
  - 1月: 31天
  - 2月: 29天（2024是闰年）
  - 3月: 31天
  - ...
- [ ] 3月应该显示在 (31+29) × 5px = 300px 的位置
- [ ] 红框标记的元素应该与3月对齐

#### 3. 日视图（Day View）
- [ ] 月份分隔符与下面的日期应该对齐
- [ ] 周末和节假日的背景色应该准确覆盖对应的日期

#### 4. 周视图（Week View）
- [ ] 周范围标签应该与实际周范围对齐

#### 5. 双周视图（Biweekly View）
- [ ] 双周范围标签应该与实际双周范围对齐

---

## 🔍 如果问题依然存在

### 可能的原因：

1. **浏览器缓存未清除**
   - 解决方案：强制刷新（Ctrl+Shift+R 或 Cmd+Shift+R）

2. **还有其他组件使用了错误的日期计算**
   - 需要检查：LineRenderer、RelationRenderer 等

3. **getPositionFromDate 函数需要更新**
   - 需要确保它也使用本地时间计算

---

## 📝 下一步计划

### 1. 添加鼠标悬停显示日期功能
- [ ] LineRenderer 添加 Tooltip
- [ ] 显示格式：单个日期 或 "起始日期 - 结束日期"
- [ ] Gateway 和 Milestone 显示单个日期
- [ ] Bar 显示日期范围

### 2. 性能优化
- [ ] 月份数组生成结果缓存
- [ ] 避免重复计算累积宽度

### 3. 最外层滚动条
- [ ] 已添加 `maxHeight: '100%'` 和 `overflow: 'hidden'` 到 TimelinePanel
- [ ] 需要验证是否已解决

---

## 📌 重要提醒

**核心原则**: 所有日期计算都应该基于本地时间（年、月、日），避免 Date 对象的 UTC 时间转换。

**统一坐标系统**: 
- 基准点: 2024-01-01 = 0px
- 每一天 = pixelsPerDay (根据视图类型不同)
- 任何日期的位置 = (该日期 - 基准日期的天数) × pixelsPerDay
