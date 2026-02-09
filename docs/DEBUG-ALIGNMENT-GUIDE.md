# 时间轴对齐问题调试指南

## 目的

本文档提供详细的调试方法，帮助诊断和修复甘特图中任务条位置与时间轴不对齐的问题。

## 最新更新：2026-02-09

已增强所有关键组件的调试日志，现在可以输出更详细的信息用于问题诊断。

## 调试日志说明

### 1. TimelinePanel（主面板）

**输出内容**：
```javascript
[TimelinePanel] ⏱️ 时间轴整体范围:
  - scale: month
  - dateHeaders数量: 60
  - 第一个日期: 2024/1/1
  - 最后一个日期: 2028/12/31
  - 总宽度: 21900px
  - 前3个任务: 项目管理任务1, 架构设计, 感知算法

[TimelinePanel] 📋 前3个任务的日期数据:
  1. [lineplan] 项目管理任务1:
     startDate原始值: "2025-07-15T16:00:00.000Z"
     endDate原始值: "2025-10-31T16:00:00.000Z"
  2. [milestone] 架构里程碑:
     startDate原始值: "2025-11-01"
     endDate原始值: null
```

**关键检查点**：
- ✅ `startDate原始值`：如果是 ISO 字符串（包含 `T` 和 `Z`），需要确保 `parseDateAsLocal` 正确解析
- ✅ `scale`：当前视图模式（day/week/month等）

**第一个任务的详细计算**：
```javascript
[TimelinePanel] 🔍 第一个Line位置计算:
  - lineId: line-pm-001
  - lineName: 项目启动
  - 原始startDate: "2025-07-15T16:00:00.000Z"
  - 原始endDate: "2025-10-31T16:00:00.000Z"
  - 解析后startDate: 2025-07-15
  - 解析后endDate: 2025-10-31
  - viewStartDate: 2024-01-01
  - scale: month

[TimelinePanel] 📍 第一个Line计算位置: 3725px
```

**关键检查点**：
- ❌ 如果`解析后startDate`与`原始startDate`的日期部分不一致（相差1天），说明时区解析有问题
- ✅ 如果一致，则 `parseDateAsLocal` 工作正常

### 2. TimelineHeader（时间轴表头）

**输出内容**：
```javascript
[TimelineHeader] 🎨 渲染开始:
  startDate: 2024-01-01
  endDate: 2028-12-31
  scale: month
  width: 21900

[TimelineHeader] 📅 子级表头计算完成:
  - 总数: 60
  - 前10个表头:
    1. 1月 | 日期: 2024-01-01 | 位置: 0px | 宽度: 155px
    2. 2月 | 日期: 2024-02-01 | 位置: 155px | 宽度: 145px
    3. 3月 | 日期: 2024-03-01 | 位置: 300px | 宽度: 155px
    4. 4月 | 日期: 2024-04-01 | 位置: 455px | 宽度: 150px
    5. 5月 | 日期: 2024-05-01 | 位置: 605px | 宽度: 155px
    ...
```

**关键检查点**：
- ✅ 每个月的起始`位置`应该与对应月份第一天的计算位置一致
- ✅ 例如：2025年7月1日应该在某个固定位置，如果任务的 `startDate` 是 2025-07-15，其位置应该在 7月表头的中间位置

### 3. TodayLine（今日标记）

**输出内容**：
```javascript
[TodayLine] 🕐 今日标记位置计算:
  - 今天: 2026-02-09
  - 视图范围: 2024-01-01 ~ 2028-12-31
  - scale: month
  - 计算位置: 3870px
```

**关键检查点**：
- ✅ `今天`的日期应该是当前真实日期
- ✅ `计算位置`应该与时间轴上 2026年2月9日的列位置一致

## 验证对齐的方法

### 方法1：使用鼠标悬停 Tooltip

1. **刷新浏览器**
2. **鼠标悬停在任务条上**，查看 Tooltip 显示的日期
3. **对比 Tooltip 日期与时间轴列**：
   - 例如：Tooltip 显示 `2025-07-15 ~ 2025-10-31`
   - 任务条应该从时间轴的 7月中旬 开始，到 10月底 结束

### 方法2：检查今日标记

1. **找到红色虚线**（今日标记）
2. **查看它与时间轴的对齐**：
   - 如果今天是 2026-02-09
   - 红线应该在时间轴的 2月 区域，靠近 9号的位置

### 方法3：分析 Console Log

#### 步骤1：找到第一个任务的日志

```javascript
[TimelinePanel] 🔍 第一个Line位置计算:
  - 解析后startDate: 2025-07-15
  - 计算位置: 3725px
```

#### 步骤2：找到对应日期的表头位置

```javascript
[TimelineHeader] 📅 子级表头:
  19. 7月 | 日期: 2025-07-01 | 位置: 2925px | 宽度: 155px
```

#### 步骤3：手工验证计算

- **7月1日位置**：2925px
- **7月宽度**：155px（31天）
- **每天像素数**：155 / 31 ≈ 5px/天
- **7月15日位置**：2925 + (15-1) * 5 = 2925 + 70 = 2995px

**对比实际计算位置**：3725px

如果差异很大，说明存在对齐问题。

## 常见问题诊断

### 问题1：解析后的日期与原始日期相差1天

**症状**：
```javascript
原始startDate: "2025-08-28T16:00:00.000Z"
解析后startDate: 2025-08-29  // ❌ 多了一天
```

**原因**：`parseDateAsLocal` 未生效或有 bug

**解决方案**：检查是否所有使用 `line.startDate` 的地方都使用了 `parseDateAsLocal`

### 问题2：任务条位置偏移，但日期解析正确

**症状**：
```javascript
解析后startDate: 2025-07-15  // ✅ 正确
计算位置: 3725px
但时间轴7月15日应该在: 2995px  // ❌ 位置不匹配
```

**可能原因**：
1. `viewStartDate` 规范化有问题
2. `getPositionFromDate` 计算逻辑有误
3. `pixelsPerDay` 在不同组件中不一致

**解决方案**：
- 检查 `viewStartDate` 是否在所有组件中一致
- 确认 `scale` 参数是否正确传递
- 验证 `getPixelsPerDay` 的返回值

### 问题3：时间轴表头位置正确，但任务条错位

**症状**：
- TimelineHeader 的列位置看起来正确
- 但任务条的绘制位置不对

**可能原因**：
- `TimelinePanel` 和 `TimelineHeader` 使用了不同的 `viewStartDate`
- 存在额外的偏移量或边距

**解决方案**：
- 确保两个组件接收相同的 `normalizedViewStartDate`
- 检查是否有 `leftOffset` 或 `margin` 影响位置

## 调试工作流

1. **刷新浏览器**，打开 Console
2. **查看初始化日志**：
   - `[TimelinePanel] ⏱️ 时间轴整体范围`
   - `[TimelineHeader] 📅 子级表头计算完成`
3. **查看任务数据**：
   - `[TimelinePanel] 📋 前3个任务的日期数据`
   - 确认原始日期格式
4. **查看第一个任务的计算**：
   - `[TimelinePanel] 🔍 第一个Line位置计算`
   - 验证日期解析是否正确
5. **查看今日标记**：
   - `[TodayLine] 🕐 今日标记位置计算`
   - 对比红线与时间轴是否对齐
6. **截图 + Console Log**：
   - 如果发现问题，截图并复制完整的 Console Log
   - 提供给开发者进行分析

## 预期的正确状态

### ✅ 日期解析正确

```javascript
原始startDate: "2025-08-28T16:00:00.000Z"
解析后startDate: 2025-08-28  // ✅ 日期部分一致
```

### ✅ 位置计算正确

```javascript
[TimelineHeader] 📅 子级表头:
  20. 8月 | 日期: 2025-08-01 | 位置: 3080px | 宽度: 155px

[TimelinePanel] 🔍 第一个Line:
  - 解析后startDate: 2025-08-28
  - 计算位置: 3215px  // 3080 + 27*5 = 3215 ✅

差异 = 3215 - 3080 = 135px
每天 5px，135/5 = 27天
8月1日 + 27天 = 8月28日 ✅
```

### ✅ 视觉对齐正确

- 任务条起始位置与 Tooltip 显示的日期在时间轴上的列对齐
- 今日标记（红线）与时间轴上的当前日期列对齐
- 里程碑和门禁图标在正确的日期列上

## 相关文件

- `/Users/jxzhong/workspace/voyah-devops-solution/devops-conponent-design/timeplan-craft-kit/src/utils/dateUtils.ts`
- `/Users/jxzhong/workspace/voyah-devops-solution/devops-conponent-design/timeplan-craft-kit/src/components/timeline/TimelinePanel.tsx`
- `/Users/jxzhong/workspace/voyah-devops-solution/devops-conponent-design/timeplan-craft-kit/src/components/timeline/TimelineHeader.tsx`
- `/Users/jxzhong/workspace/voyah-devops-solution/devops-conponent-design/timeplan-craft-kit/src/components/timeline/TodayLine.tsx`
- `/Users/jxzhong/workspace/voyah-devops-solution/devops-conponent-design/timeplan-craft-kit/docs/FIX-TIMEZONE-ALIGNMENT-2026-02-09.md`

---

**创建日期**：2026-02-09  
**最后更新**：2026-02-09  
**调试增强版本**：v2.0
