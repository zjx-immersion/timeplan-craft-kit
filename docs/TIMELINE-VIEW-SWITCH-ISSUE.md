# 时间轴视图切换问题分析

## 🐛 问题描述

### 症状时间线

1. **之前**（修改前）:
   - ✅ 第一次进入甘特图：时间轴显示完整（2024-2028，包含2026数据）
   - ❌ 切换到其他视图（如表格视图）
   - ❌ 再切换回甘特图：时间轴显示不全

2. **现在**（修改后）:
   - ❌ 第一次进入甘特图：时间轴就不全（只显示2027年12月）
   - ❌ 问题更严重了

### 用户反馈

> "之前是第一次从timeplan进入时间轴显示是全的，切换视图后，再进入甘特图时间轴不全；本次chat导致第一次进入时间轴也不全了"

## 🔍 问题分析

### 尝试1: 动态日期范围（失败）

**提交**: `3d4e09d` 和 `576c782`

**修改内容**:
```typescript
// 原来：固定范围
return new Date(2024, 0, 1);

// 改为：动态计算
const { startDate } = calculateViewDateRange(initialData, 1);
return startDate;
```

**问题**:
1. `calculateViewDateRange` 在 `useState` 初始化函数中调用
2. 此时 `initialData` 可能还没有完整数据
3. 或者返回了错误的日期范围
4. 导致第一次进入时间轴就显示不全

**结果**: ❌ 加重了问题，已回退

### 尝试1失败的原因

1. **时序问题**: `useState` 的初始化函数**只执行一次**（组件首次挂载时）
2. **数据延迟**: 如果 `initialData` 在首次渲染时还是空的/旧的，计算出的范围就错了
3. **无法更新**: state 初始化后，即使数据更新，也不会重新计算范围

### 真正的问题（推测）

根据症状分析，真正的问题可能是：

#### 可能性1: 视图切换时状态丢失

**场景**:
```
用户操作流程：
1. 打开 OrionX 计划 → TimelinePanel 挂载 → viewStartDate = 2024-01-01
2. 切换到表格视图 → TimelinePanel 可能卸载
3. 切换回甘特图 → TimelinePanel 重新挂载 → viewStartDate = ???
```

**问题**: 
- 如果 TimelinePanel 在视图切换时被卸载/重新挂载
- useState 会重新初始化
- 但此时 `initialData` 可能有问题

#### 可能性2: `initialData` prop 变化

**场景**:
```typescript
// UnifiedTimelinePanelV2 中
<TimelinePanel
  data={plan}  // ← 这个 prop 在视图切换时可能变化
  ...
/>
```

**问题**:
- `initialData` 是从 `data` prop 获取的
- 但 `viewStartDate` 只在首次挂载时初始化
- 如果 `data` prop 后续变化，`viewStartDate` 不会更新

#### 可能性3: localStorage 缓存问题

**场景**:
- 计划数据保存在 localStorage
- 视图切换时，可能读取了错误的缓存数据
- 导致 `initialData` 内容不一致

## 🔧 解决方案（待验证）

### 方案A: 监听 data prop 变化并更新视图范围

```typescript
const [viewStartDate, setViewStartDate] = useState(() => {
  // 初始化
  return new Date(2024, 0, 1);
});

// 监听 data 变化，动态更新范围
useEffect(() => {
  if (data.lines && data.lines.length > 0) {
    const { startDate, endDate } = calculateViewDateRange(data, 1);
    setViewStartDate(startDate);
    setViewEndDate(endDate);
  }
}, [data]); // 依赖 data
```

**优点**:
- 数据变化时自动更新范围
- 视图切换后也能正确显示

**缺点**:
- 可能导致视图频繁重新渲染
- 需要仔细处理依赖关系

### 方案B: 使用 useMemo 计算日期范围

```typescript
const viewDateRange = useMemo(() => {
  if (data.lines && data.lines.length > 0) {
    return calculateViewDateRange(data, 1);
  }
  return {
    startDate: new Date(2024, 0, 1),
    endDate: new Date(2028, 11, 31)
  };
}, [data]);

const [viewStartDate, setViewStartDate] = useState(viewDateRange.startDate);
const [viewEndDate, setViewEndDate] = useState(viewDateRange.endDate);

// 当 memo 值变化时更新 state
useEffect(() => {
  setViewStartDate(viewDateRange.startDate);
  setViewEndDate(viewDateRange.endDate);
}, [viewDateRange]);
```

**优点**:
- 性能更好（避免不必要的计算）
- 响应数据变化

**缺点**:
- 代码复杂度增加

### 方案C: 保持固定范围 + 调试视图切换逻辑

```typescript
// 保持现状：固定 2024-2028
const [viewStartDate, setViewStartDate] = useState(() => {
  return new Date(2024, 0, 1);
});

// 添加详细日志追踪视图切换
useEffect(() => {
  console.log('[TimelinePanel] Component mounted/updated:', {
    viewStartDate,
    viewEndDate,
    dataLinesCount: data.lines?.length,
    dataDateRange: data.lines?.[0]?.startDate,
  });
}, [data]);
```

**优点**:
- 不改变现有逻辑
- 先找到根本原因再修复

**缺点**:
- 无法解决原问题（切换视图后不全）

## 📋 下一步行动

### Step 1: 添加调试日志

在关键位置添加日志：
1. `UnifiedTimelinePanelV2`: 视图切换时
2. `TimelinePanel`: 组件挂载/卸载时
3. `TimelinePanel`: `data` prop 变化时

### Step 2: 复现问题

按用户描述的步骤操作：
1. 打开 OrionX 计划
2. 查看甘特图（记录时间轴范围）
3. 切换到表格视图
4. 切换回甘特图（记录时间轴范围）
5. 对比两次的时间轴范围

### Step 3: 根据日志分析

检查：
- `initialData` 的内容是否一致
- `viewStartDate` 是否被意外修改
- 组件是否被重新挂载

### Step 4: 实施修复

根据分析结果选择合适的方案。

## 📝 当前状态

### 回退操作

```bash
git reset --hard HEAD~3  # 回退到修改前
```

### 当前代码状态

```typescript
// TimelinePanel.tsx (第301-320行)
const [viewStartDate, setViewStartDate] = useState(() => {
  if (initialData.viewConfig?.startDate) {
    return initialData.viewConfig.startDate instanceof Date
      ? initialData.viewConfig.startDate
      : new Date(initialData.viewConfig.startDate);
  }
  // ✅ 固定范围：2024年1月1日
  return new Date(2024, 0, 1);  // ← 已恢复
});
```

### 期待的行为

- ✅ 第一次进入甘特图：显示完整（2024-2028）
- ⚠️ 切换视图后再回来：仍需调试

---

**版本**: V11.4（已回退动态范围功能）  
**日期**: 2026-02-08  
**状态**: 🔄 等待进一步调试
