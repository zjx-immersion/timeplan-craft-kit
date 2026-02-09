# 时区导致的日期对齐问题修复

## 修复日期：2026-02-09

## 问题描述

从用户截图和 console log 发现，**甘特图中 line 的绘制位置与时间轴不匹配**：
- 实际终止时间应该在 3 月（红框处）
- 但目前错误地对齐到了 2 月底（蓝色框处）

## 根本原因

### 时区解析导致的日期偏移

当日期数据以 ISO 字符串格式存储（如从 API 返回或 localStorage 加载）时：

```javascript
// 原始数据（ISO字符串）
'2025-08-28T16:00:00.000Z'  // UTC 时间

// 使用 new Date() 解析
new Date('2025-08-28T16:00:00.000Z')
// → 在 UTC+8 时区（中国）会被解析为：2025-08-29 00:00:00 本地时间
// ❌ 导致日期向后偏移了一天！
```

### 问题影响范围

从 console log 发现多个日期都存在偏移：

```javascript
原始startDate: '2025-08-28T16:00:00.000Z', 解析后: '2025-08-29'  // ❌ 多了一天
原始startDate: '2025-11-07T16:00:00.000Z', 解析后: '2025-11-08'  // ❌ 多了一天
```

这导致：
1. **任务条位置偏移**：所有使用 ISO 字符串的日期都向后偏移了一天
2. **时间轴不对齐**：渲染位置与时间轴标签不匹配
3. **数据一致性问题**：同一个日期在不同时区可能产生不同结果

## 解决方案

### 1. 创建统一的日期解析函数

新增 `parseDateAsLocal` 函数，直接从字符串提取日期部分，避免时区转换：

```typescript
// /Users/jxzhong/workspace/voyah-devops-solution/devops-conponent-design/timeplan-craft-kit/src/utils/dateUtils.ts

/**
 * 解析日期为本地日期（仅年月日，忽略时区）
 * ✅ 统一日期解析逻辑，避免时区导致的日期偏移
 * 
 * 关键问题：'2025-08-28T16:00:00.000Z' 在UTC+8时区会被解析为 2025-08-29
 * 解决方案：直接从字符串提取日期部分 (YYYY-MM-DD)
 */
export const parseDateAsLocal = (dateInput: Date | string): Date => {
  if (dateInput instanceof Date) {
    // 如果已经是Date对象，提取本地的年月日
    return new Date(dateInput.getFullYear(), dateInput.getMonth(), dateInput.getDate());
  }
  
  // 如果是字符串，直接解析日期部分（YYYY-MM-DD）
  const dateStr = typeof dateInput === 'string' ? dateInput : dateInput.toString();
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  
  if (match) {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1; // 月份从0开始
    const day = parseInt(match[3], 10);
    return new Date(year, month, day);
  }
  
  // 兜底：使用Date构造函数，然后提取本地日期
  const date = new Date(dateInput);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};
```

### 2. 替换所有日期解析点

在以下文件中，将所有 `new Date(line.startDate)` 替换为 `parseDateAsLocal(line.startDate)`：

#### 核心组件

1. **TimelinePanel.tsx** - 甘特图主组件
   ```typescript
   // ❌ 旧代码
   const displayStartDate = new Date(line.startDate);
   const displayEndDate = new Date(line.endDate);
   
   // ✅ 新代码
   const displayStartDate = parseDateAsLocal(line.startDate);
   const displayEndDate = parseDateAsLocal(line.endDate);
   ```

2. **LineRenderer.tsx** - 任务条渲染
   ```typescript
   // Tooltip 日期格式化
   const startDate = parseDateAsLocal(line.startDate);
   const endDate = parseDateAsLocal(line.endDate);
   ```

3. **RelationRenderer.tsx** - 依赖关系线
   ```typescript
   const startPos = getPositionFromDate(
     parseDateAsLocal(line.startDate),
     viewStartDate,
     scale
   );
   ```

4. **BaselineMarker.tsx** - 基线标记
   ```typescript
   const dateObj = parseDateAsLocal(baseline.date);
   const pos = getPositionFromDate(dateObj, viewStartDate, scale);
   ```

5. **TodayLine.tsx** - 今日标记
   ```typescript
   const today = useMemo(() => {
     const now = new Date();
     return new Date(now.getFullYear(), now.getMonth(), now.getDate());
   }, []);
   ```

#### 交互 Hooks

6. **useBarResize.ts** - 调整大小
   ```typescript
   const lineStartDate = parseDateAsLocal(line.startDate);
   const lineEndDate = parseDateAsLocal(line.endDate);
   ```

7. **useTimelineDrag.ts** - 拖拽移动
   ```typescript
   const originalStart = parseDateAsLocal(line.startDate);
   const originalEnd = parseDateAsLocal(line.endDate);
   ```

## 修复效果

### 修复前

```javascript
// ISO字符串在UTC+8时区的解析
'2025-08-28T16:00:00.000Z' → new Date() → 2025-08-29 00:00:00
// ❌ 导致任务条渲染在错误的位置（向后偏移一天）
```

### 修复后

```javascript
// 统一使用本地日期解析
'2025-08-28T16:00:00.000Z' → parseDateAsLocal() → 2025-08-28 00:00:00
// ✅ 任务条正确渲染在 2025-08-28 的位置
```

## 验证方法

1. **刷新浏览器**，查看甘特图

2. **检查对齐**：
   - 今日标记（红线）应该与时间轴的当前日期对齐
   - 任务条应该与起止日期对应的时间轴列对齐
   - 里程碑和门禁标记应该在正确的日期列上

3. **使用 Tooltip**：
   - 鼠标悬停在任务条上，查看显示的日期范围
   - 鼠标悬停在里程碑/门禁上，查看显示的日期
   - 对比 Tooltip 显示的日期与时间轴标签，应该完全对齐

4. **Console Log**：
   ```javascript
   // 应该看到类似输出
   [TimelinePanel] 第一个Line位置计算:
     原始startDate: '2025-08-28T16:00:00.000Z'
     解析后: '2025-08-28'  // ✅ 日期正确，没有偏移
   ```

## 技术总结

### 关键原则

1. **统一日期解析**：所有日期字符串都使用 `parseDateAsLocal` 解析
2. **忽略时区**：甘特图基于"日历日期"，不关心具体时区
3. **仅使用年月日**：所有计算都基于本地的年、月、日，忽略时分秒

### 为什么这样做有效

- **避免时区转换**：直接从字符串提取日期部分，不经过时区转换
- **保持一致性**：无论数据来源（API、localStorage、用户输入），都使用相同的解析逻辑
- **简化计算**：所有日期都是本地 00:00:00，计算天数差异更简单准确

## 相关文件

- `/Users/jxzhong/workspace/voyah-devops-solution/devops-conponent-design/timeplan-craft-kit/src/utils/dateUtils.ts` - 日期工具函数
- `/Users/jxzhong/workspace/voyah-devops-solution/devops-conponent-design/timeplan-craft-kit/src/components/timeline/TimelinePanel.tsx` - 主组件
- `/Users/jxzhong/workspace/voyah-devops-solution/devops-conponent-design/timeplan-craft-kit/src/components/timeline/LineRenderer.tsx` - 渲染器
- `/Users/jxzhong/workspace/voyah-devops-solution/devops-conponent-design/timeplan-craft-kit/src/components/timeline/RelationRenderer.tsx` - 关系线
- `/Users/jxzhong/workspace/voyah-devops-solution/devops-conponent-design/timeplan-craft-kit/src/components/timeline/BaselineMarker.tsx` - 基线
- `/Users/jxzhong/workspace/voyah-devops-solution/devops-conponent-design/timeplan-craft-kit/src/components/timeline/TodayLine.tsx` - 今日标记
- `/Users/jxzhong/workspace/voyah-devops-solution/devops-conponent-design/timeplan-craft-kit/src/hooks/useBarResize.ts` - 调整大小
- `/Users/jxzhong/workspace/voyah-devops-solution/devops-conponent-design/timeplan-craft-kit/src/hooks/useTimelineDrag.ts` - 拖拽

## 下一步

如果测试发现还有对齐问题，请检查：
1. 是否还有其他文件使用 `new Date(line.startDate)`
2. 数据源中的日期格式是否统一
3. 是否有其他时区相关的计算逻辑

---

**修复者**：AI Assistant  
**修复日期**：2026-02-09  
**问题类型**：时区导致的日期对齐错误  
**解决方案**：统一使用 `parseDateAsLocal` 解析所有日期数据
