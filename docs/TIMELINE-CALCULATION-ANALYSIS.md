# 时间轴计算逻辑全面分析

> **分析日期**: 2026-02-09  
> **问题**: 甘特图时间轴对齐问题  
> **结论**: 项目中存在 **3 套不同的时间轴计算系统**，导致对齐混乱

---

## 🔍 核心发现

### **存在 3 套独立的时间轴计算系统**

| 系统 | 文件 | 状态 | pixelsPerDay (月视图) | 使用位置 |
|------|------|------|-----------------------|---------|
| **系统 1** | `dateUtils.ts` | ✅ 当前主用 | 5px | TimelinePanel, TimelineHeader, 大部分组件 |
| **系统 2** | `timelineCoordinates.ts` | ⚠️ 创建但未完全使用 | 5px | 单元测试已验证 |
| **系统 3** | `timeAxisScaler.ts` | ❌ 存在但未使用 | ~6.67px (200/30) | 无 |

---

## 📊 详细对比

### 1️⃣ **系统 1: `dateUtils.ts`** (当前主系统)

**文件**: `src/utils/dateUtils.ts`

**核心函数**:
- `getPixelsPerDay(scale: TimeScale): number`
- `getPositionFromDate(date: Date, viewStartDate: Date, scale: TimeScale): number`
- `getBarWidthPrecise(startDate: Date, endDate: Date, scale: TimeScale): number`

**月视图配置**:
```typescript
case 'month':
  return 5; // 每天 5px
```

**使用位置** (13 个文件):
- ✅ `TimelinePanel.tsx` - 主面板
- ✅ `TimelineHeader.tsx` - 时间轴头部
- ✅ `TodayLine.tsx` - 今日标记
- ✅ `BaselineMarker.tsx` - 基线标记
- ✅ `RelationRenderer.tsx` - 关系渲染
- ✅ `useTimelineDrag.ts` - 拖拽钩子
- ✅ `useBarResize.ts` - 调整大小钩子
- ✅ `BaselineRangeMarker.tsx` - 范围标记
- + 5 个单元测试文件

**计算逻辑**:
```typescript
// 位置计算
const position = 天数差 × pixelsPerDay(5px)

// 宽度计算
const width = (天数差 + 1) × pixelsPerDay(5px)
```

---

### 2️⃣ **系统 2: `timelineCoordinates.ts`** (统一坐标系统)

**文件**: `src/utils/timelineCoordinates.ts`

**核心函数**:
- `getPixelsPerDay(scale: TimeScale): number`
- `getPositionFromLocalDate(year, month, day, baseYear, baseMonth, baseDay, scale): number`
- `getRangeWidth(startYear, startMonth, startDay, endYear, endMonth, endDay, scale): number`
- `generateMonthsArray(startYear, startMonth, endYear, endMonth): MonthInfo[]`

**月视图配置**:
```typescript
case 'month':
  return 5; // 压缩视图，每天 5px
```

**特点**:
- ✅ 强调"天"为最小单位
- ✅ 使用本地时间避免时区转换
- ✅ 提供月份数组生成（带累积天数索引）
- ✅ 单元测试覆盖率 100%（14/14 通过）

**使用位置**:
- ⚠️ 仅在单元测试中使用
- ❌ 主代码未调用

**计算逻辑**:
```typescript
// 位置计算（本地日期）
const targetDate = new Date(year, month, day);
const baseDate = new Date(baseYear, baseMonth, baseDay);
const daysDiff = differenceInCalendarDays(targetDate, baseDate);
const position = daysDiff × pixelsPerDay(5px);
```

---

### 3️⃣ **系统 3: `timeAxisScaler.ts`** (缩放系统)

**文件**: `src/utils/timeAxisScaler.ts`

**核心函数**:
- `calculateTimeAxisConfig(scale: TimeScale, zoom: number): TimeAxisConfig`
- `calculateDatePosition(date: Date, startDate: Date, config: TimeAxisConfig): number`
- `calculatePositionDate(x: number, startDate: Date, config: TimeAxisConfig): Date`

**月视图配置**:
```typescript
month: {
  pixelsPerMonth: 200,  // 1个月 = 200px
  baseMonths: 6,        // 默认显示6个月
}

// 每天像素数
pixelsPerDay = pixelsPerMonth / 30 = 200 / 30 ≈ 6.67px  // ❌ 与系统1不一致！
```

**特点**:
- ✅ 支持缩放 (0.5x - 2.0x)
- ✅ 视口自适应（月视图 3-6 个月）
- ✅ 等比例缩放
- ❌ **像素配置与系统1不一致**

**使用位置**:
- ❌ **完全未使用**（孤立代码）

**计算逻辑**:
```typescript
// 位置计算（基于毫秒时间戳）
const daysDiff = Math.floor(
  (date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
);
const position = daysDiff × config.pixelsPerDay;  // ❌ 使用不同的 pixelsPerDay
```

---

## ⚠️ 问题根源

### **1. 多套系统并存导致的问题**

| 问题 | 描述 | 影响 |
|------|------|------|
| **配置不一致** | 系统3的 `pixelsPerDay` (6.67px) ≠ 系统1/2 (5px) | 如果混用会导致错位 |
| **代码冗余** | 3套系统实现相似功能 | 维护成本高，易混淆 |
| **未完全统一** | 系统2创建但未完全采用 | 存在半成品代码 |
| **时区处理不统一** | 系统1部分使用 `parseDateAsLocal`，系统3使用时间戳 | 潜在的日期偏移风险 |

### **2. 当前系统（系统1）的已知问题**

#### ✅ 已修复（2026-02-09）
- ✅ `new Date("YYYY-MM-DD")` 时区解析问题 → 引入 `parseDateAsLocal`
- ✅ `TimelineHeader` 位置计算 NaN → 添加 `cumulativePosition`
- ✅ 统一使用 `differenceInCalendarDays` 计算天数差

#### ⚠️ 仍需改进
- ⚠️ `TimelineHeader` 月份标签不显示年份（截图问题）
- ⚠️ 缺少完整的坐标系统抽象（部分逻辑分散在各组件中）

---

## 🎯 对齐验证（基于系统1）

### **数学计算验证** ✅

#### 测试数据 1: 任务 line-pm-001
```
日期: 2026-01-15
TimelineHeader 2026年1月位置: 3655px
预期位置: 3655 + (15-1) × 5 = 3725px
实际位置: 3725px
结论: ✅ 完美匹配
```

#### 测试数据 2: 今日标记
```
日期: 2026-02-09
TimelineHeader 2026年2月位置: 3810px
预期位置: 3810 + (9-1) × 5 = 3850px
实际位置: 3850px
结论: ✅ 完美匹配
```

### **视觉对齐问题** ⚠️

虽然数学计算正确，但用户截图显示时间轴头部标签不清晰：
- ❌ 只显示月份数字（1, 2, 3）
- ❌ 没有年份信息
- ❌ 跨年边界不明显

---

## 📋 统一建议

### **短期方案**（立即执行）

#### 1. 修复 `TimelineHeader` 标签显示
```typescript
// 修改 TimelineHeader.tsx 中的 label 生成逻辑
// 月视图下，显示 "2026年1月" 而不是 "1"
case 'month':
  cells.forEach((month, idx) => {
    cells.push({
      label: `${year}年${month + 1}月`,  // ✅ 增加年份
      // ... 其他属性
    });
  });
```

#### 2. 清理孤立代码
- 🗑️ 删除或归档 `timeAxisScaler.ts`（未使用）
- 🗑️ 或者明确标注为"实验性代码"

### **中期方案**（逐步迁移）

#### 3. 完全迁移到系统2（`timelineCoordinates.ts`）

**理由**:
- ✅ 设计更清晰（统一抽象）
- ✅ 单元测试覆盖完整
- ✅ 强调本地时间处理
- ✅ 提供月份数组生成（便于 Header 渲染）

**迁移步骤**:
1. 逐个组件替换 `dateUtils.getPositionFromDate` → `timelineCoordinates.getPositionFromLocalDate`
2. 替换 `dateUtils.getBarWidthPrecise` → `timelineCoordinates.getRangeWidth`
3. 运行单元测试确保无回归
4. 更新文档

### **长期方案**（架构优化）

#### 4. 建立清晰的分层架构

```
📦 时间轴计算模块
├── 📄 timelineCoordinates.ts (核心坐标系统)
│   ├── getPixelsPerDay()
│   ├── getPositionFromLocalDate()
│   ├── getRangeWidth()
│   └── generateMonthsArray()
├── 📄 dateUtils.ts (日期工具)
│   ├── parseDateAsLocal()
│   ├── normalizeViewStartDate()
│   └── normalizeViewEndDate()
└── 📄 timelineZoom.ts (缩放功能 - 可选)
    ├── calculateZoomLevel()
    └── applyZoom()
```

#### 5. 添加类型安全和运行时验证

```typescript
// 坐标类型
type TimelinePosition = number;  // 像素值
type TimelineWidth = number;     // 像素值
type LocalDate = { year: number; month: number; day: number };

// 验证函数
function assertValidPosition(pos: TimelinePosition): asserts pos is TimelinePosition {
  if (isNaN(pos) || pos < 0) {
    throw new Error(`Invalid timeline position: ${pos}`);
  }
}
```

---

## 📈 迁移优先级

| 优先级 | 任务 | 工作量 | 影响范围 |
|--------|------|--------|----------|
| 🔴 **P0** | 修复 TimelineHeader 标签显示年份 | 0.5h | TimelineHeader.tsx |
| 🟡 **P1** | 清理/归档 timeAxisScaler.ts | 0.5h | 1 个文件 |
| 🟢 **P2** | 迁移到 timelineCoordinates | 4h | 13 个文件 |
| 🔵 **P3** | 架构重构 + 类型安全 | 8h | 整体架构 |

---

## 🧪 单元测试覆盖情况

### **系统 1: dateUtils.ts**
- ✅ `dateUtils.test.ts` - 30 tests passed
- ✅ 覆盖 `parseDateAsLocal`, `getPositionFromDate`, `getBarWidthPrecise`

### **系统 2: timelineCoordinates.ts**
- ✅ `timelineCoordinates.test.ts` - 14 tests passed
- ✅ 覆盖所有核心函数

### **系统 3: timeAxisScaler.ts**
- ✅ `timeAxisScaler.test.ts` - tests passed
- ⚠️ 但系统本身未被使用

---

## 💡 最终建议

### **立即执行** (今天)
1. ✅ 修复 `TimelineHeader` 月份标签，增加年份显示
2. ✅ 验证视觉对齐是否完美

### **本周执行**
3. 清理 `timeAxisScaler.ts` 或明确标注状态
4. 创建迁移计划文档

### **本月执行**
5. 逐步迁移到 `timelineCoordinates.ts`
6. 增加集成测试验证对齐

### **长期规划**
7. 架构重构，建立清晰分层
8. 增强类型安全和运行时验证

---

## 📚 相关文档

- [x] `FIX-TIMEZONE-ALIGNMENT-2026-02-09.md` - 时区对齐修复
- [x] `FIX-HEADER-POSITION-NAN.md` - Header 位置 NaN 修复
- [x] `DEBUG-ALIGNMENT-GUIDE.md` - 对齐调试指南
- [x] `PENDING-TIMELINE-ISSUES.md` - 遗留问题汇总
- [ ] **TODO: MIGRATION-TO-TIMELINE-COORDINATES.md** - 迁移指南

---

## 🔗 关键文件清单

### **核心计算模块**
- `src/utils/dateUtils.ts` (348 lines) - 系统1
- `src/utils/timelineCoordinates.ts` (159 lines) - 系统2
- `src/utils/timeAxisScaler.ts` (275 lines) - 系统3

### **主要使用方**
- `src/components/timeline/TimelinePanel.tsx` (2569 lines)
- `src/components/timeline/TimelineHeader.tsx` (453 lines)
- `src/components/timeline/TodayLine.tsx` (117 lines)
- `src/components/timeline/LineRenderer.tsx` (使用位置计算)
- `src/components/timeline/RelationRenderer.tsx` (使用位置计算)
- `src/hooks/useTimelineDrag.ts` (使用位置转换)
- `src/hooks/useBarResize.ts` (使用位置转换)

---

**总结**: 当前项目中存在 **3 套独立的时间轴计算系统**，虽然系统1（`dateUtils.ts`）数学计算正确，但缺乏统一抽象，且存在未使用的系统3。建议立即修复显示问题，然后逐步迁移到更清晰的系统2。
