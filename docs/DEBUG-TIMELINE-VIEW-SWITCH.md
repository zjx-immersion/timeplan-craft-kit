# 时间轴视图切换问题调试指南

## 🎯 目标

诊断并修复"切换视图后时间轴不全"的问题

## 📋 问题描述

**症状**:
1. ✅ 第一次进入甘特图：时间轴显示完整（2024-2028）
2. ❌ 切换到其他视图（如表格视图、矩阵视图）
3. ❌ 切换回甘特图：时间轴只显示部分（如2027年12月）
4. ❌ 强制刷新（Cmd+Shift+R）后仍不正常

## 🧪 调试步骤

### Step 1: 清除所有缓存

```bash
# 在浏览器Console中执行
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Step 2: 打开控制台

按 `F12` 或 `Cmd+Option+I`，切换到 **Console** 标签

### Step 3: 操作序列（重要：按顺序执行）

#### 3.1 第一次进入甘特图

1. 选择"Orion X 智能驾驶平台 2026 年度计划"
2. 确保当前视图是"甘特图"（默认应该是）
3. **观察时间轴是否显示完整（2024-2028）**
4. **记录Console日志**（重点关注以下日志）：

```javascript
// 期望看到：
[TimelinePanel] 使用默认 startDate: 2024-01-01
[TimelinePanel] 使用默认 endDate: 2028-12-31
[TimelinePanel] 规范化 viewStartDate: { 
  原始: 2024-01-01..., 
  规范化后: 2024-01-01..., 
  scale: 'month' 
}
[TimelinePanel] 规范化 viewEndDate: { 
  原始: 2028-12-31..., 
  规范化后: 2028-12-31..., 
  scale: 'month' 
}
[TimelineHeader] 🎨 渲染开始: { 
  startDate: '2024-01-01', 
  endDate: '2028-12-31', 
  startYear: 2024, 
  endYear: 2028, 
  scale: 'month' 
}
[TimelineHeader] 📊 父级表头计算完成: { 
  count: 5, 
  labels: '2024, 2025, 2026, 2027, 2028',
  totalWidth: xxx 
}
[TimelineHeader] 📅 子级表头计算完成: { 
  count: 60,  // 5年 * 12月 = 60个月
  firstLabel: '1月', 
  lastLabel: '12月' 
}
```

#### 3.2 切换到其他视图

1. 点击工具栏的"表格"按钮
2. 等待表格视图渲染完成
3. **记录此时Console有无新的日志**

#### 3.3 切换回甘特图

1. 点击工具栏的"甘特图"按钮
2. **观察时间轴显示情况**（是否只显示2027年12月）
3. **重点记录Console日志**：

```javascript
// 对比第一次的日志，看看有什么不同：
[TimelinePanel] 规范化 viewStartDate: { 
  原始: ???,        // ← 这个值是什么？
  规范化后: ???,    // ← 这个值是什么？
  scale: 'month' 
}
[TimelineHeader] 🎨 渲染开始: { 
  startDate: '???',   // ← 是否还是2024-01-01？
  endDate: '???',     // ← 是否还是2028-12-31？
  startYear: ???,     // ← 是否还是2024？
  endYear: ???        // ← 是否还是2028？
}
[TimelineHeader] 📊 父级表头计算完成: { 
  count: ???,         // ← 是否还是5？
  labels: '???'       // ← 是否还是'2024, 2025, 2026, 2027, 2028'？
}
```

### Step 4: 收集关键信息

请将以下信息发给我：

#### 4.1 第一次进入甘特图的日志

```
请复制粘贴所有以 [TimelinePanel] 和 [TimelineHeader] 开头的日志
```

#### 4.2 切换回甘特图后的日志

```
请复制粘贴切换后所有新增的 [TimelinePanel] 和 [TimelineHeader] 日志
```

#### 4.3 视觉对比

- 第一次：时间轴表头显示哪些年份？（应该是2024-2028）
- 切换后：时间轴表头显示哪些年份？（你说只有2027年12月）

## 🔍 可能的问题点

### 猜测1: viewStartDate 被意外修改

**场景**:
```typescript
// 某处代码可能调用了
setViewStartDate(new Date(2027, 11, 1));  // 意外设置为2027年12月
```

**验证方法**: 
- 查看日志中 `规范化 viewStartDate` 的 `原始` 值
- 如果不是2024-01-01，说明被修改了

### 猜测2: TimelinePanel 被重新挂载

**场景**:
```typescript
// UnifiedTimelinePanelV2 中可能在视图切换时卸载了TimelinePanel
{view === 'gantt' && <TimelinePanel ... />}
```

**验证方法**:
- 查看是否有新的 `[TimelinePanel] 使用默认 startDate` 日志
- 如果有，说明组件重新挂载了

### 猜测3: normalizeViewStartDate 的bug

**场景**:
```typescript
// normalizeViewStartDate 可能在某些情况下返回错误的日期
const normalized = normalizeViewStartDate(new Date(2024, 0, 1), 'month');
// 期望: 2024-01-01
// 实际: 2027-12-01 ??? (不太可能)
```

**验证方法**:
- 对比 `原始` 和 `规范化后` 的值
- 如果相差很大，说明normalizeViewStartDate有bug

### 猜测4: React state 批处理问题

**场景**:
```typescript
// 多次快速切换导致state更新顺序错乱
setViewStartDate(date1);  // 第1次切换
setViewStartDate(date2);  // 第2次切换（覆盖了第1次）
```

**验证方法**:
- 慢速切换（等2秒）看是否还有问题
- 查看日志中是否有多次 `规范化` 输出

## 📊 调试日志说明

### 正常情况下的完整日志流程

```
# 1. 组件初始化
[TimelinePanel] 使用默认 startDate: 2024-01-01
[TimelinePanel] 使用默认 endDate: 2028-12-31

# 2. 日期规范化
[TimelinePanel] 规范化 viewStartDate: { 
  原始: Sat Jan 01 2024 00:00:00, 
  规范化后: Sat Jan 01 2024 00:00:00, 
  scale: 'month' 
}
[TimelinePanel] 规范化 viewEndDate: { 
  原始: Tue Dec 31 2028 00:00:00, 
  规范化后: Tue Dec 31 2028 00:00:00, 
  scale: 'month' 
}

# 3. TimelineHeader渲染
[TimelineHeader] 🎨 渲染开始: { 
  startDate: '2024-01-01', 
  endDate: '2028-12-31', 
  startYear: 2024, 
  endYear: 2028, 
  scale: 'month', 
  width: 12000 
}
[TimelineHeader] 📊 父级表头计算完成: { 
  count: 5,                              # 5个年份
  labels: '2024, 2025, 2026, 2027, 2028', 
  widths: '2400, 2400, 2400, 2400, 2400',  # 每年约2400px
  totalWidth: 12000 
}
[TimelineHeader] 📅 子级表头计算完成: { 
  count: 60,                             # 60个月
  firstLabel: '1月', 
  lastLabel: '12月' 
}
```

### 异常情况下的日志特征

#### 情况A: viewStartDate 被修改

```
# 第一次（正常）
[TimelinePanel] 使用默认 startDate: 2024-01-01

# 切换回来（异常）
[TimelinePanel] 规范化 viewStartDate: { 
  原始: Mon Dec 01 2027 00:00:00,  # ← 注意：变成了2027年！
  规范化后: Mon Dec 01 2027 00:00:00, 
  scale: 'month' 
}
```

#### 情况B: 组件重新挂载

```
# 切换回来时出现新的初始化日志
[TimelinePanel] 使用默认 startDate: 2024-01-01  # ← 重新初始化
[TimelinePanel] 使用默认 endDate: 2028-12-31
```

#### 情况C: TimelineHeader 接收错误参数

```
[TimelineHeader] 🎨 渲染开始: { 
  startDate: '2027-12-01',  # ← 错误的开始日期
  endDate: '2027-12-31',    # ← 错误的结束日期
  startYear: 2027,
  endYear: 2027,            # ← 只有2027年
}
[TimelineHeader] 📊 父级表头计算完成: { 
  count: 1,                 # ← 只有1个年份！
  labels: '2027', 
}
```

## 🛠️ 可能的修复方案

### 如果是viewStartDate被修改

搜索代码中所有 `setViewStartDate` 的调用：

```bash
grep -rn "setViewStartDate" src/components/
```

检查是否有地方意外修改了这个值。

### 如果是组件重新挂载

检查 `UnifiedTimelinePanelV2.tsx` 的渲染逻辑：

```typescript
// 确保TimelinePanel不会在视图切换时被卸载
{view === 'gantt' && <TimelinePanel ... />}  // ❌ 会卸载
{/* vs */}
<TimelinePanel style={{ display: view === 'gantt' ? 'block' : 'none' }} />  // ✅ 不卸载
```

### 如果是state批处理问题

在 `setViewStartDate` 调用时添加延迟：

```typescript
setTimeout(() => {
  setViewStartDate(newDate);
}, 0);
```

## 📝 提交记录

```
a2c2da2 debug: 增强TimelineHeader调试日志
515fac2 debug: 添加时间轴渲染调试日志
  ├─ TimelinePanel 初始化日志
  ├─ 日期规范化日志
  └─ TimelineHeader 渲染日志
```

---

**下一步**: 请刷新浏览器，按照上述步骤操作，并将Console日志完整发送给我！

我需要看到：
1. 第一次进入时的完整日志
2. 切换回来后的完整日志
3. 对比两次日志的差异

这样我就能精确定位问题所在！🔍
