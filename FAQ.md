# Timeline Craft Kit - 常见问题与解决方案 (FAQ)

> 本文档记录 Timeline 甘特图组件开发过程中遇到的问题、根本原因和解决方案，便于后续快速定位和修复类似问题。

## 目录

- [UI 显示问题](#ui-显示问题)
  - [1. 今日线标签不可见](#1-今日线标签不可见)
  - [2. Sidebar右边框显示不完整](#2-sidebar右边框显示不完整)
  - [3. Timeline行高度不对齐](#3-timeline行高度不对齐)
  - [4. 网格线重复显示（双线）](#4-网格线重复显示双线)
  - [5. 新增/复制的Timeline画布空白](#5-新增复制的timeline画布空白)
- [功能问题](#功能问题)
  - [6. 编辑模式功能失效](#6-编辑模式功能失效)
  - [7. 复制Timeline不完整](#7-复制timeline不完整)
  - [8. 时间轴横向滚动空白无时间轴](#8-时间轴横向滚动空白无时间轴)
  - [11. Matrix V3 导航到甘特图时间轴显示不完整](#11-matrix-v3-导航到甘特图时间轴显示不完整)
- [数据一致性](#数据一致性)
  - [9. 新建/复制的Timeline结构不一致](#9-新建复制的timeline结构不一致)
- [设计说明](#设计说明)
  - [10. 垂直网格线粗细不一致（设计特性）](#10-垂直网格线粗细不一致设计特性)

---

## UI 显示问题

### 1. 今日线标签不可见

**问题描述**: 
红色垂直"今日"线上的日期标签被其他UI元素遮挡，用户无法看见。

**症状**:
- 可以看到红色垂直线
- 但顶部的"今日：YYYY-MM-DD"标签不可见或被遮挡

**根本原因**:
- `TodayLine` 组件的 `zIndex: 5` 过低
- 远低于其他UI元素（sidebar: 100, header: 101）
- 导致标签被覆盖

**解决方案**:
```tsx
// 文件: src/components/timeline/TodayLine.tsx
<div
  style={{
    // ...
    zIndex: 200, // ✅ 从 5 提升到 200
  }}
>
  <div
    style={{
      // 标签样式增强
      fontSize: 12,      // 增大
      fontWeight: 600,   // 加粗
      padding: '3px 10px',
      borderRadius: 4,
      boxShadow: `0 2px 4px rgba(0,0,0,0.25), 0 0 10px ${timelineColors.todayGlow}`,
      border: '1px solid rgba(255, 255, 255, 0.3)', // 添加边框
    }}
  >
    今日：{format(today, 'yyyy-MM-dd', { locale: zhCN })}
  </div>
</div>
```

**相关文件**:
- `src/components/timeline/TodayLine.tsx`

**验证方法**:
1. 刷新页面，找到红色垂直线
2. 确认顶部有清晰的"今日：日期"标签
3. 切换时间尺度（月/周/日），标签始终可见

**修复日期**: 2026-02-07

---

### 2. Sidebar右边框显示不完整

**问题描述**: 
左侧Timeline列表的右边框（垂直分隔线）显示不完整，滚动后下方timeline没有右边框。

**症状**:
- 默认加载时，上方timeline右边有垂直线
- 向下滚动后，下方timeline右边框消失
- 造成视觉不一致

**根本原因**:
- Sidebar的 `borderRight` 定义在外层容器上
- 但容器**没有明确高度**
- 当可视区域高度 > timeline列表高度时，sidebar下方空白区域没有边框渲染

**解决方案**:
```tsx
// 文件: src/components/timeline/TimelinePanel.tsx
<div
  ref={sidebarRef}
  style={{
    width: SIDEBAR_WIDTH,
    flexShrink: 0,
    backgroundColor: token.colorBgLayout,
    borderRight: `1px solid ${token.colorBorder}`,
    position: 'sticky',
    left: 0,
    zIndex: 100,
    alignSelf: 'flex-start', // ✅ 确保从顶部开始
    minHeight: '100%',       // ✅ 确保至少与容器一样高
  }}
>
```

**关键点**:
- `minHeight: '100%'` - 确保sidebar最小高度等于父容器，边框贯穿全高
- `alignSelf: 'flex-start'` - 确保从容器顶部开始对齐
- 如果timeline列表更长，sidebar会自动撑高（比`height: '100%'`更灵活）

**相关文件**:
- `src/components/timeline/TimelinePanel.tsx` (第1707-1719行)

**验证方法**:
1. 刷新页面，所有timeline行右边都有垂直分隔线
2. 垂直滚动到底部，最下方timeline右边仍有完整垂直线
3. 测试不同timeline数量（1个、10+个），边框都正常显示

**修复日期**: 2026-02-07

---

### 3. Timeline行高度不对齐

**问题描述**: 
新建timeline时，左侧列表和右侧画布的行高度不对齐，网格线错位。

**症状**:
- 左侧timeline标题块与右侧画布行高度有gap
- 水平网格线与timeline行底边不在同一条直线上

**根本原因**:
- 左右两侧使用了不同的DOM结构
- CSS盒模型差异（padding、margin、border影响高度计算）
- 没有统一的高度约束

**解决方案 1 - 统一DOM结构**:
```tsx
// 左侧和右侧都使用两层div包裹
// 外层：固定高度容器
<div style={{ height: ROW_HEIGHT, boxSizing: 'border-box', margin: 0, padding: 0 }}>
  {/* 内层：实际内容 */}
  <div style={{
    height: ROW_HEIGHT,
    borderBottom: `1px solid ${token.colorBorderSecondary}`,
    boxSizing: 'border-box',
    margin: 0,
    padding: 0,
  }}>
    {/* 内容 */}
  </div>
</div>
```

**解决方案 2 - 强制CSS规范**:
```tsx
style={{
  height: ROW_HEIGHT,       // 固定高度 120px
  boxSizing: 'border-box',  // 边框包含在高度内
  margin: 0,                // 无外边距
  padding: 0,               // 垂直方向无内边距（水平可有）
}}
```

**相关文件**:
- `src/components/timeline/TimelinePanel.tsx` (Timeline行渲染部分)

**验证方法**:
1. 新建timeline
2. 使用DevTools测量左侧和右侧行的高度
3. 确认都是120px
4. 确认网格线与行底边对齐

**修复日期**: 2026-02-06

---

### 4. 网格线重复显示（双线）

**问题描述**: 
新增timeline的底部边框看起来像两条线，且靠得很近。

**症状**:
- Timeline行底部有明显的"双线"效果
- 线条靠得非常近，视觉上显得粗重

**根本原因**:
- **网格背景层**绘制了水平分隔线（`top: (index + 1) * ROW_HEIGHT - 1`）
- **Timeline行**自身也有 `borderBottom: 1px solid`
- 两条1px线条在同一像素位置重叠渲染，造成视觉"双线"效果

**解决方案**:
```tsx
// 移除网格背景层的水平分隔线，仅保留垂直网格线
// 依靠Timeline行自身的 borderBottom 来实现水平分隔
<div style={{ position: 'absolute', zIndex: 0 }}>
  {/* 仅渲染垂直网格线 */}
  {dateHeaders.map((date, index) => (
    <div key={`line-${index}`} style={{
      position: 'absolute',
      left: index * columnWidth,
      top: 0,
      bottom: 0,
      width: 1,
      backgroundColor: token.colorBorderSecondary,
    }} />
  ))}
  
  {/* ✅ 水平分隔线已移除：使用Timeline行的borderBottom代替 */}
</div>
```

**相关文件**:
- `src/components/timeline/TimelinePanel.tsx` (第1940-1954行)

**验证方法**:
1. 新建或复制timeline
2. 检查行底部边框
3. 确认只有一条清晰的1px线，无双线效果

**修复日期**: 2026-02-06

---

### 5. 新增/复制的Timeline画布空白

**问题描述**: 
新增或复制的timeline右侧画布区域是空白的，没有网格线。

**症状**:
- 新增/复制的timeline行，右侧画布完全空白
- 默认加载的timeline有网格背景，新的没有

**根本原因**:
- Timeline行的 `backgroundColor: '#fff'` 是**不透明的**
- 遮挡了下方的网格背景层（`zIndex: 0`）
- 导致网格线不可见

**解决方案**:
```tsx
// 1. 右侧内容区域背景设为白色
<div style={{
  flex: 1,
  position: 'relative',
  backgroundColor: '#fff', // ✅ 从 '#fafafa' 改为 '#fff'
  minWidth: totalWidth,
}}>

// 2. Timeline行背景设为透明
<div style={{
  position: 'relative',
  height: ROW_HEIGHT,
  borderBottom: `1px solid ${token.colorBorderSecondary}`,
  backgroundColor: 'transparent', // ✅ 从 '#fff' 改为 'transparent'
  boxSizing: 'border-box',
}}>
```

**关键点**:
- 外层区域提供统一白色背景
- Timeline行透明，让网格线可以"透过来"
- 网格线在最底层（`zIndex: 0`），所有行都能看到

**相关文件**:
- `src/components/timeline/TimelinePanel.tsx` (第1845-1851行, 2065-2075行)

**验证方法**:
1. 新建timeline
2. 确认右侧画布有网格线
3. 复制timeline，确认也有网格线
4. 与默认timeline对比，网格一致

**修复日期**: 2026-02-06

---

## 功能问题

### 6. 编辑模式功能失效

**问题描述**: 
点击"编辑模式"后，编辑相关的UI和操作都不生效（右键菜单、选中效果、连线等）。

**症状**:
- 点击编辑模式按钮后，无任何变化
- Timeline的"三点"按钮不显示
- 右键弹出框不出现
- 选中元素（line、gateway等）没有选中效果
- 无法连线

**根本原因**:
```tsx
// 错误的 isEditMode 计算逻辑
const isEditMode = externalReadonly !== undefined 
  ? !externalReadonly 
  : (externalIsEditMode !== undefined ? externalIsEditMode : internalIsEditMode);
```

问题：
- 优先判断 `externalReadonly`
- 如果父组件传了 `readonly={false}`，则 `isEditMode = true`
- 忽略了 `externalIsEditMode` 的值
- 导致编辑模式开关失效

**解决方案**:
```tsx
// ✅ 正确的优先级：externalIsEditMode > externalReadonly > internalIsEditMode
const isEditMode = externalIsEditMode !== undefined 
  ? externalIsEditMode 
  : (externalReadonly !== undefined ? !externalReadonly : internalIsEditMode);
```

**相关文件**:
- `src/components/timeline/TimelinePanel.tsx` (isEditMode计算逻辑)

**验证方法**:
1. 点击"编辑模式"按钮
2. 确认Timeline行上出现"三点"菜单按钮
3. 右键元素，确认弹出菜单
4. 点击元素，确认有选中效果
5. 尝试连线，确认可以操作

**修复日期**: 2026-02-06

---

### 7. 复制Timeline不完整

**问题描述**: 
复制timeline时，只复制了timeline对象本身，没有复制其中的lines和relations。

**症状**:
- 复制后的timeline是空的，没有任何元素
- 原timeline的bars、milestones、gateways都没有复制
- 依赖关系也丢失了

**根本原因**:
```tsx
// 原有简单复制
const newTimeline = { ...timeline, id: newId, name: `${timeline.name} (副本)` };
```

问题：
- 只复制了timeline元数据
- 没有复制关联的 `lines`（bars、milestones、gateways）
- 没有复制 `relations`（依赖关系）

**解决方案**:
```tsx
const handleCopyTimeline = useCallback((timelineId: string) => {
  const timeline = data.timelines.find(t => t.id === timelineId);
  if (!timeline) return;
  
  // 1. 找到该timeline的所有lines
  const timelineLines = data.lines.filter(line => line.timelineId === timelineId);
  
  // 2. 复制timeline，生成新ID
  const newTimelineId = `timeline-${Date.now()}`;
  const newTimeline: Timeline = {
    ...timeline,
    id: newTimelineId,
    name: `${timeline.name} (副本)`,
    title: `${timeline.title || timeline.name} (副本)`,
    lineIds: [],  // 稍后填充
  };
  
  // 3. 深度复制所有lines，生成新ID映射
  const lineIdMap = new Map<string, string>();
  const copiedLines: Line[] = timelineLines.map(line => {
    const newLineId = `line-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    lineIdMap.set(line.id, newLineId);
    return { ...line, id: newLineId, timelineId: newTimelineId };
  });
  
  // 4. 复制内部relations（仅复制两端都在同一timeline内的关系）
  const timelineLineIds = new Set(timelineLines.map(l => l.id));
  const copiedRelations: Relation[] = (data.relations || [])
    .filter(rel => timelineLineIds.has(rel.fromLineId) && timelineLineIds.has(rel.toLineId))
    .map(rel => ({
      ...rel,
      id: `rel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fromLineId: lineIdMap.get(rel.fromLineId) || rel.fromLineId,
      toLineId: lineIdMap.get(rel.toLineId) || rel.toLineId,
    }));
  
  // 5. 更新timeline的lineIds
  newTimeline.lineIds = copiedLines.map(l => l.id);
  
  // 6. 更新数据
  setData({
    ...data,
    timelines: [...data.timelines, newTimeline],
    lines: [...data.lines, ...copiedLines],
    relations: [...(data.relations || []), ...copiedRelations],
  });
  
  message.success(`Timeline 已复制（包含 ${copiedLines.length} 个元素和 ${copiedRelations.length} 条依赖关系）`);
}, [data, setData]);
```

**关键点**:
- 深度复制所有lines，生成新ID
- 维护旧ID到新ID的映射（lineIdMap）
- 只复制timeline内部的relations
- 更新relations的fromLineId和toLineId为新ID
- 更新timeline的lineIds数组

**相关文件**:
- `src/components/timeline/TimelinePanel.tsx` (handleCopyTimeline函数, 第688-741行)

**验证方法**:
1. 选择一个有多个元素的timeline
2. 点击"复制"
3. 确认新timeline包含所有bars、milestones、gateways
4. 确认依赖关系线条也被复制
5. 检查控制台消息，显示复制的元素和关系数量

**修复日期**: 2026-02-06

---

### 8. 时间轴横向滚动空白无时间轴

**问题描述**: 
横向滚动甘特图时，右侧出现大量空白区域，没有时间轴覆盖。

**症状**:
- 可以向右滚动很远
- 滚动到的区域是空白的，没有月份/日期标签
- 时间轴宽度不够

**根本原因 1 - viewEndDate不够远**:
```tsx
// 初始化时viewEndDate固定为24个月
const [viewEndDate, setViewEndDate] = useState(addMonths(new Date(), 24));
```

问题：
- 如果lines的结束日期超过24个月，时间轴不够长
- 用户滚动到lines区域，却没有时间标签

**根本原因 2 - TimelineHeader宽度未设置**:
```tsx
// TimelineHeader没有接收width prop
<TimelineHeader
  startDate={normalizedViewStartDate}
  endDate={normalizedViewEndDate}
  scale={scale}
  // ❌ 缺少 width prop
/>
```

问题：
- TimelineHeader的宽度由内容撑开
- 当totalWidth很大时，header的width不够
- 导致右侧空白区域没有时间轴

**解决方案 1 - 动态扩展viewEndDate**:
```tsx
// 初始化时计算合理的viewEndDate
const maxLineEndDate = useMemo(() => {
  if (!data.lines || data.lines.length === 0) return new Date();
  return data.lines.reduce((max, line) => {
    const lineEnd = line.endDate ? new Date(line.endDate) : new Date(line.startDate);
    return lineEnd > max ? lineEnd : max;
  }, new Date());
}, [data.lines]);

// 设置初始viewEndDate为 max(24个月, maxLineEndDate + 6个月)
const initialViewEnd = useMemo(() => {
  const defaultEnd = addMonths(new Date(), 24);
  const dataEnd = addMonths(maxLineEndDate, 6);
  return dataEnd > defaultEnd ? dataEnd : defaultEnd;
}, [maxLineEndDate]);

const [viewEndDate, setViewEndDate] = useState(initialViewEnd);

// 监听lines变化，动态扩展viewEndDate
useEffect(() => {
  const maxEnd = addMonths(maxLineEndDate, 6);
  if (maxEnd > viewEndDate) {
    setViewEndDate(maxEnd);
  }
}, [maxLineEndDate, viewEndDate]);
```

**解决方案 2 - 为TimelineHeader设置width**:
```tsx
// TimelineHeader.tsx - 添加width prop
interface TimelineHeaderProps {
  startDate: Date;
  endDate: Date;
  scale: TimeScale;
  width?: number;  // ✅ 新增
}

// 应用width到外层容器
<div
  style={{
    position: 'sticky',
    top: 0,
    zIndex: 11,
    width: width,      // ✅ 设置宽度
    minWidth: width,   // ✅ 设置最小宽度
    backgroundColor: token.colorBgContainer,
    borderBottom: `2px solid ${token.colorBorder}`,
  }}
>

// TimelinePanel.tsx - 传递totalWidth
<TimelineHeader
  startDate={normalizedViewStartDate}
  endDate={normalizedViewEndDate}
  scale={scale}
  width={totalWidth}  // ✅ 传递totalWidth
/>
```

**相关文件**:
- `src/components/timeline/TimelinePanel.tsx` (viewEndDate计算逻辑)
- `src/components/timeline/TimelineHeader.tsx` (width prop)

**验证方法**:
1. 横向滚动到最右边
2. 确认所有可滚动区域都有时间轴标签
3. 添加结束日期很晚的line
4. 确认时间轴自动扩展覆盖

**修复日期**: 2026-02-06

---

## 数据一致性

### 9. 新建/复制的Timeline结构不一致

**问题描述**: 
新建或复制的timeline与默认加载的timeline使用了不同的数据结构和显示逻辑。

**症状**:
- 新建timeline的title是undefined
- 显示时使用`timeline.name`
- 默认timeline使用`timeline.title`
- 导致复制后显示不一致

**根本原因**:
```tsx
// 默认数据有 title 字段
const defaultTimeline = {
  id: 'tl-project-mgmt',
  name: '项目管理',
  title: '项目管理',  // ← 有title
  // ...
};

// 新建时只设置 name
const newTimeline = {
  id: `timeline-${Date.now()}`,
  name: '新 Timeline',
  // ❌ 缺少 title
  // ...
};

// 显示时优先使用title
{timeline.title || timeline.name}  // ← 不一致
```

**解决方案**:
```tsx
// 1. handleAddTimeline - 同时设置name和title
const newTimeline: Timeline = {
  id: `timeline-${Date.now()}`,
  name: '新 Timeline',
  title: '新 Timeline',  // ✅ 添加title
  description: '未指定',
  color: '#1677ff',
  lineIds: [],
  owner: '',
};

// 2. handleCopyTimeline - 复制时也更新title
const newTimeline: Timeline = {
  ...timeline,
  id: newTimelineId,
  name: `${timeline.name} (副本)`,
  title: `${timeline.title || timeline.name} (副本)`,  // ✅ 同步更新title
  lineIds: copiedLines.map(l => l.id),
};

// 3. 显示时统一使用 timeline.title || timeline.name
{timeline.title || timeline.name}
```

**相关文件**:
- `src/components/timeline/UnifiedTimelinePanelV2.tsx` (handleAddTimeline)
- `src/components/timeline/TimelinePanel.tsx` (handleCopyTimeline, 显示逻辑)

**验证方法**:
1. 新建timeline，检查DevTools中的数据，确认有title字段
2. 复制timeline，确认title也被正确复制和更新
3. 在UI上，新建/复制/默认timeline的显示一致

**修复日期**: 2026-02-06

---

## 设计说明

### 10. 垂直网格线粗细不一致（设计特性）

**问题描述**: 
在日/周视图中，垂直网格线粗细不一致，部分是1px，部分是2px。

**症状**:
- 月初的垂直线明显更粗（2px）
- 其他日期的线较细（1px）
- 颜色也有深浅差异

**说明**: 
这**不是bug**，是**功能性设计特性**。

**设计目的**:
- 在日/周视图中，数据密度很高
- 通过加粗月初边界（2px深色），帮助用户快速识别月份分隔
- 提升时间导航的可读性

**代码逻辑**:
```tsx
// 月视图/季视图：所有垂直线统一1px
{scale === 'month' || scale === 'quarter' ? (
  dateHeaders.map((date, index) => (
    <div style={{
      width: 1,  // ✅ 统一1px
      backgroundColor: token.colorBorderSecondary,
    }} />
  ))
) : (
  // 日/周视图：月初2px，其他1px
  dateHeaders.map((date, index) => {
    const isMonthStart = date.getDate() === 1;
    return (
      <div style={{
        width: isMonthStart ? 2 : 1,  // ✅ 月初加粗
        backgroundColor: isMonthStart
          ? token.colorBorder          // 深色
          : token.colorBorderSecondary, // 浅色
      }} />
    );
  })
)}
```

**如果需要统一**:
如果确实希望所有垂直线都是1px，可以修改：
```tsx
width: 1,  // 改为固定1px，去掉三元运算
backgroundColor: token.colorBorderSecondary,  // 统一颜色
```

**相关文件**:
- `src/components/timeline/TimelinePanel.tsx` (第1900-1940行)

**建议**: 
保持当前设计，这是行业惯例（如MS Project、Jira Timeline等都有类似设计）。

---

### 11. 迭代规划页面列不对齐

**问题描述**: 
迭代规划矩阵视图中，各迭代列（红色/蓝色）没有严格对齐，垂直分隔线错位。

**症状**:
- 每列宽度不一致
- 垂直分隔线不在同一条直线上
- 表头、marker行、数据行对齐不一致

**根本原因**:
```tsx
// 原有代码：每列都有右边框
<div style={{
  width: CELL_WIDTH,
  borderRight: '1px solid #d9d9d9', // ❌ 边框累积导致宽度不一致
}}>
```

问题：
- `borderRight: 1px` 会累积，每列实际占用 `CELL_WIDTH + 1px`
- 默认`boxSizing: content-box`，边框额外增加宽度
- 导致列宽不一致，垂直线错位

**解决方案**:
```tsx
// 文件: src/components/iteration/IterationMatrix.tsx

// ✅ 统一使用borderLeft，第一列无边框
{iterations.map((iter, index) => (
  <div
    key={iter.id}
    style={{
      flexShrink: 0,
      borderLeft: index === 0 ? 'none' : '1px solid #d9d9d9', // ✅ 第一列无左边框
      width: CELL_WIDTH,
      boxSizing: 'border-box', // ✅ 边框包含在宽度内
    }}
  >
```

**关键点**:
- 改用 `borderLeft`，第一列无边框，其他列左边框
- `boxSizing: 'border-box'` - 边框包含在宽度内
- 表头、marker行、数据行统一使用相同逻辑

**相关文件**:
- `src/components/iteration/IterationMatrix.tsx` (第250-258, 318-333, 437-456行)

**验证方法**:
1. 打开迭代规划视图
2. 使用DevTools检查每列宽度
3. 确认所有列宽完全一致（包含边框）
4. 确认垂直分隔线完全对齐

**修复日期**: 2026-02-07

---

### 12. 甘特图周视图时间范围过长

**问题描述**: 
切换到单周或双周视图后，时间轴显示范围过长（默认24个月），无法专注于短期规划。

**症状**:
- 单周/双周视图显示几十个周期
- 滚动范围过大，不便于短期规划
- 无法快速聚焦当前和近期任务

**根本原因**:
```tsx
// viewEndDate固定为24个月
const [viewEndDate] = useState(() => addMonths(new Date(), 24));
```

问题：
- 不区分time scale，所有视图都显示24个月
- 单周/双周视图需要更短的时间范围

**解决方案**:
```tsx
// 文件: src/components/timeline/TimelinePanel.tsx

// ✅ 添加useEffect，根据scale动态调整viewEndDate
useEffect(() => {
  const today = new Date();
  let targetEndDate: Date;
  
  if (scale === 'week') {
    // 单周视图：显示6个单周（42天）
    targetEndDate = addDays(today, 42);
  } else if (scale === 'biweekly') {
    // 双周视图：显示6个双周（84天）
    targetEndDate = addDays(today, 84);
  } else {
    // 其他scale保持原有逻辑
    return;
  }
  
  setViewEndDate(targetEndDate);
}, [scale]);
```

**配置说明**:
- **单周视图**: 6周 = 42天
- **双周视图**: 6个双周 = 84天
- **其他视图**: 保持原有动态计算逻辑（最大24个月或数据范围+6个月）

**相关文件**:
- `src/components/timeline/TimelinePanel.tsx` (第323-342行)

**验证方法**:
1. 切换到单周视图
2. 确认显示约6个单周（42天左右）
3. 切换到双周视图
4. 确认显示约6个双周（84天左右）
5. 切换到月视图，确认正常（不受影响）

**修复日期**: 2026-02-07

---

---

## 运行时错误

### 13. 页面空白 - startOfDay is not defined

**问题描述**: 
TimePlan详细页加载后显示完全空白，浏览器console报错。

**症状**:
- 页面一片空白，无任何内容
- Console错误：`Uncaught ReferenceError: startOfDay is not defined`
- React组件渲染失败

**根本原因**:
```tsx
// 文件: src/components/timeline/TimelinePanel.tsx

// ❌ 使用了函数但未导入
useEffect(() => {
  const today = startOfDay(new Date()); // ❌ startOfDay未定义
  // ...
}, [scale]);

// Import语句缺少 startOfDay
import {
  format,
  addDays,
  startOfWeek,
  // ❌ 缺少 startOfDay
} from 'date-fns';
```

问题：
- 在添加新功能时使用了`startOfDay`函数
- 忘记在文件顶部的import语句中添加
- 导致运行时引用未定义的函数，抛出ReferenceError
- 整个组件渲染失败，页面空白

**解决方案**:
```tsx
// ✅ 添加 startOfDay 到 import 语句
import {
  format,
  addDays,
  startOfWeek,
  startOfDay,     // ✅ 新增
} from 'date-fns';
```

**错误类型**: 
- **严重程度**: 🔴 P0 - 致命错误
- **影响范围**: 应用完全不可用
- **用户影响**: 100%

**相关文件**:
- `src/components/timeline/TimelinePanel.tsx` (第66-70行)

**预防措施**:
1. 使用新函数前，先添加import
2. 修改后立即本地测试
3. 注意IDE的红色波浪线提示
4. 使用TypeScript严格模式
5. 启用ESLint检查

**验证方法**:
1. 刷新页面 (Ctrl+Shift+R)
2. 检查console无ReferenceError
3. 确认TimePlan详情页正常显示
4. 测试甘特图基本功能

**修复日期**: 2026-02-07

---

## 附录

### 常用调试方法

#### 1. 检查Timeline行边框
```javascript
// 在浏览器控制台运行
const allRows = document.querySelectorAll('[style*="height: 120px"][style*="border-bottom"]');
console.log('Total rows:', allRows.length);
allRows.forEach((row, i) => {
  console.log(`Row ${i}:`, {
    borderBottom: row.style.borderBottom,
    computed: window.getComputedStyle(row).borderBottom,
    height: window.getComputedStyle(row).height,
  });
});
```

#### 2. 检查Sidebar高度
```javascript
const sidebar = document.querySelector('[ref="sidebarRef"]') || 
                document.querySelector('div[style*="width: 280px"]');
if (sidebar) {
  console.log('Sidebar:', {
    height: window.getComputedStyle(sidebar).height,
    minHeight: window.getComputedStyle(sidebar).minHeight,
    borderRight: window.getComputedStyle(sidebar).borderRight,
  });
}
```

#### 3. 检查z-index层级
```javascript
const elements = document.querySelectorAll('[style*="zIndex"], [style*="z-index"]');
elements.forEach(el => {
  console.log(el.className || el.tagName, {
    zIndex: window.getComputedStyle(el).zIndex,
    position: window.getComputedStyle(el).position,
  });
});
```

### 关键常量

```tsx
// src/components/timeline/TimelinePanel.tsx
const ROW_HEIGHT = 120;      // Timeline行高度
const SIDEBAR_WIDTH = 280;   // 左侧边栏宽度

// z-index层级规划
// - 0: 网格背景
// - 5: Lines/Elements (已废弃)
// - 10: 基线范围标记
// - 20: 基线标记
// - 100: Sidebar
// - 101: 表头
// - 200: 今日线
```

### 相关文档

- `temp_workspace/TODAY-LINE-FIX.md` - 今日线修复详细说明
- `temp_workspace/SIDEBAR-BORDER-FIX.md` - Sidebar边框修复详细说明
- `temp_workspace/FIXES-2026-02-07-PART2.md` - 2026-02-07修复汇总
- `temp_workspace/DUPLICATE-LINES-FIX.md` - 双线问题修复
- `temp_workspace/GRID-VISIBILITY-FIX.md` - 网格可见性修复
- `temp_workspace/TIMELINE-WIDTH-ISSUE.md` - 时间轴宽度问题
- `temp_workspace/TIMELINE-CONSISTENCY-ISSUE.md` - 数据一致性问题

---

### 11. Matrix V3 导航到甘特图时间轴显示不完整

**问题描述**: 
从 Matrix V3 矩阵视图点击单元格导航到甘特图时，时间轴只显示部分月份（如2026年4月-10月），缺少2026年11月之后、2027、2028年的时间轴，且横向滚动条消失无法滑动。

**症状**:
- 从 timeplan 主页进入甘特图：时间轴完整显示 2024-2028 年（60个月）
- 从 Matrix V3 导航进入：时间轴只显示 2026年4月-10月（7个月）
- 总宽度从 9135px 变为 1070px
- 横向滚动条消失，无法查看其他时间区域

**根本原因**:
导航 effect 错误地调整了视图范围到目标元素附近：

```tsx
// 错误的导航逻辑 - 调整了视图范围
if (targetLines.length > 0) {
  const minDate = new Date(Math.min(...startDates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...endDates.map(d => d.getTime())));
  
  // 添加边距后设置新的视图范围
  rangeStart = addMonths(minDate, -3);
  rangeEnd = addMonths(maxDate, 3);
  
  setViewStartDate(rangeStart);  // ❌ 缩小了视图范围
  setViewEndDate(rangeEnd);
}
```

问题：
- 导航时将视图范围调整为目标元素附近（前后3个月）
- 导致时间轴总宽度大幅缩小
- 无法显示完整的时间轴和滚动条

**解决方案**:
保持完整的 2024-2028 视图范围，只滚动到目标位置：

```tsx
// ✅ 修复后的导航逻辑 - 保持视图范围不变
useEffect(() => {
  if (targetLineIds.length === 0) return;
  
  console.log('[TimelinePanel] 🎯 响应导航请求:', {
    targetLineIds,
    currentViewStart: normalizedViewStartDate.toISOString(),
    currentViewEnd: normalizedViewEndDate.toISOString(),
  });
  
  // ✅ 不再调整视图范围，保持完整的 2024-2028 时间轴
  // 只获取目标Line信息用于滚动和高亮
  const targetLines = data.lines.filter(line => targetLineIds.includes(line.id));
  
  // 1. 滚动到当前任务索引对应的Line（使用当前视图范围）
  if (autoScroll && targetLineIds.length > 0 && scrollContainerRef.current) {
    const currentLineId = targetLineIds[currentTaskIndex] || targetLineIds[0];
    setTimeout(() => {
      scrollToLine(currentLineId);  // ✅ 不传自定义范围，使用当前完整范围
    }, 100);
  }
  
  // 2. 触发高亮动画
  if (highlight) {
    setHighlightedLineIds(new Set(targetLineIds));
    setTimeout(() => {
      setHighlightedLineIds(new Set());
    }, highlightDuration);
  }
}, [targetLineIds, currentTaskIndex, highlight, autoScroll, highlightDuration, 
    data.lines, normalizedViewStartDate, normalizedViewEndDate]);
```

**关键改动**:
1. 移除 `setViewStartDate` 和 `setViewEndDate` 调用
2. 移除 `navigationViewRangeRef` 临时存储
3. `scrollToLine` 不再传入自定义视图范围
4. 使用当前完整的 2024-2028 视图范围进行滚动计算

**相关文件**:
- `src/components/timeline/TimelinePanel.tsx` (导航响应 effect, 第716-767行)

**验证方法**:
1. 从 Matrix V3 点击单元格导航到甘特图
2. 确认时间轴显示完整的 2024-2028 年（60个月）
3. 确认总宽度为 9135px
4. 确认有横向滚动条，可以滚动到任意时间区域
5. 确认自动滚动到目标元素位置并高亮显示

**修复日期**: 2026-02-16

---

**最后更新**: 2026-02-16  
**维护者**: Cursor AI Assistant
