# 连线不显示问题诊断

## 问题描述
用户反馈：timeplan中没有显示连线

## 诊断步骤

### 1. 数据完整性检查

#### MockData.ts 检查 ✅
- **位置**: `src/utils/mockData.ts:574`
- **数据赋值**: `plan.relations = relations;`
- **数据生成逻辑**:
  ```typescript
  const relations: Relation[] = [];
  
  // Timeline 1 内部依赖链 (lines 0-3)
  if (lines.length >= 4) {
    relations.push(...); // 3条关系
  }
  
  // Timeline 4 内部依赖链 (lines 10-12)
  if (lines.length >= 14) {
    relations.push(...); // 2条关系
  }
  
  // 跨Timeline依赖 (lines 5->7, 15->16)
  if (lines.length >= 18) {
    relations.push(...); // 2条关系
  }
  ```

**结论**: Mock数据中**确实包含relations**数据，至少应有7条依赖关系。

---

### 2. 数据传递链路检查

#### 2.1 Index.tsx → UnifiedTimelinePanelV2 ✅
```typescript
// src/pages/Index.tsx:84
<UnifiedTimelinePanelV2
  planId={currentPlan.id}
  initialView="gantt"
/>
```

#### 2.2 UnifiedTimelinePanelV2 → TimelinePanel ✅
```typescript
// src/components/timeline/UnifiedTimelinePanelV2.tsx:133
<TimelinePanel
  data={plan}  // ✅ 传递完整的plan对象（包含relations）
  onDataChange={handleDataChange}
  scale={scale}
  zoom={zoom}
  showCriticalPath={showCriticalPath}
  readonly={!editMode}
  hideToolbar={true}
/>
```

#### 2.3 TimelinePanel → RelationRenderer ✅
```typescript
// src/components/timeline/TimelinePanel.tsx:962
{data.relations && data.relations.length > 0 && (
  <RelationRenderer
    relations={data.relations}  // ✅ 传递relations数组
    lines={data.lines}
    timelines={data.timelines}
    viewStartDate={normalizedViewStartDate}
    scale={scale}
    rowHeight={ROW_HEIGHT}
  />
)}
```

**结论**: 数据传递链路正确。

---

### 3. 可能的问题原因

#### 问题1: Relations数据为空
**诊断**: 检查实际运行时的relations是否为空数组

**可能原因**:
- Mock数据生成的条件未满足（`lines.length` 不足）
- `addMockDataToPlan` 函数未正确执行
- 用户创建的计划未勾选"添加示例数据"

**验证方法**:
```javascript
// 在浏览器控制台执行
console.log('Current Plan:', window.__TIMEPLAN_STORE__?.currentPlan);
console.log('Relations:', window.__TIMEPLAN_STORE__?.currentPlan?.relations);
```

---

#### 问题2: Line位置计算错误
**诊断**: 检查`linePositions` Map是否正确构建

**可能原因**:
- `line.timelineId` 与 `timeline.id` 不匹配
- Timeline未找到（`timelineIndex === -1`）
- 日期解析错误

**验证方法**:
```javascript
// 检查Line和Timeline的ID匹配
const lines = currentPlan.lines;
const timelines = currentPlan.timelines;
lines.forEach(line => {
  const found = timelines.find(t => t.id === line.timelineId);
  if (!found) console.error('Timeline not found for line:', line.id);
});
```

---

#### 问题3: Relations引用的Line不存在
**诊断**: 检查`relation.fromLineId`和`relation.toLineId`是否在lines中存在

**可能原因**:
- Relations引用的Line ID不存在
- Line被删除但Relations未更新

**验证方法**:
```javascript
// 检查Relations引用的Line是否存在
const relations = currentPlan.relations;
const lines = currentPlan.lines;
const lineIds = new Set(lines.map(l => l.id));

relations.forEach(rel => {
  if (!lineIds.has(rel.fromLineId)) {
    console.error('From Line not found:', rel.fromLineId);
  }
  if (!lineIds.has(rel.toLineId)) {
    console.error('To Line not found:', rel.toLineId);
  }
});
```

---

#### 问题4: SVG渲染层级问题
**诊断**: 检查SVG是否被其他元素遮挡

**可能原因**:
- `z-index: 1` 不够高
- 其他元素覆盖了SVG
- SVG的`pointerEvents: 'none'`导致不可见（实际不会影响显示）

**验证方法**:
```javascript
// 检查SVG元素是否存在
document.querySelector('svg[style*="position: absolute"]');
```

---

#### 问题5: 连线颜色与背景色相同
**诊断**: 检查连线颜色是否与背景色冲突

**可能原因**:
- 青绿色（`#14B8A6`）在某些背景下不明显
- 虚线效果导致连线看起来很淡

**验证方法**:
- 检查浏览器开发工具中的SVG路径元素
- 修改连线颜色为红色（`#FF0000`）测试

---

### 4. 添加调试日志

#### 4.1 TimelinePanel 日志
```typescript
// 在 TimelinePanel.tsx 中添加
console.log('[TimelinePanel] 🔗 Relations Debug:', {
  hasRelations: !!data.relations,
  relationsCount: data.relations?.length || 0,
  relations: data.relations,
  linesCount: data.lines?.length || 0,
  timelinesCount: data.timelines?.length || 0,
});
```

#### 4.2 RelationRenderer 日志
```typescript
// 在 RelationRenderer.tsx 中添加
console.log('[RelationRenderer] 📍 Building line positions:', {
  linesCount: lines.length,
  timelinesCount: timelines.length,
});

console.log('[RelationRenderer] ✅ Line positions built:', positions.size);

console.log('[RelationRenderer] 🎨 Rendering relations:', {
  relationsCount: relations.length,
  linePositionsCount: linePositions.size,
});
```

---

### 5. 修复建议

#### 修复1: 确保Mock数据完整
```typescript
// 在 TimePlanList.tsx 创建项目时
const handleCreate = async (values: any) => {
  let newPlan: TimePlan = {
    // ...
    relations: [],  // ✅ 初始化为空数组
  };

  // ✅ 强制添加Mock数据
  if (values.addMockData) {
    newPlan = addMockDataToPlan(newPlan);
    console.log('Added mock data, relations:', newPlan.relations.length);
  }
};
```

#### 修复2: 添加Relations数据验证
```typescript
// 在 RelationRenderer.tsx 开头添加
if (!relations || relations.length === 0) {
  console.warn('[RelationRenderer] No relations to render');
  return null;
}

if (!lines || lines.length === 0) {
  console.warn('[RelationRenderer] No lines available');
  return null;
}

if (!timelines || timelines.length === 0) {
  console.warn('[RelationRenderer] No timelines available');
  return null;
}
```

#### 修复3: 增强错误提示
```typescript
// 在 RelationRenderer.tsx 渲染部分
{relations.map((relation) => {
  if (!relation.displayConfig?.visible) {
    console.log('[RelationRenderer] Relation hidden:', relation.id);
    return null;
  }
  
  const fromPos = linePositions.get(relation.fromLineId);
  const toPos = linePositions.get(relation.toLineId);
  
  if (!fromPos) {
    console.error('[RelationRenderer] From line position not found:', relation.fromLineId);
    return null;
  }
  
  if (!toPos) {
    console.error('[RelationRenderer] To line position not found:', relation.toLineId);
    return null;
  }
  
  // ... 渲染逻辑
})}
```

---

### 6. 测试步骤

#### 步骤1: 检查控制台日志
1. 打开浏览器开发工具（F12）
2. 切换到Console标签
3. 刷新页面
4. 查找 `[TimelinePanel] 🔗 Relations Debug` 日志
5. 查找 `[RelationRenderer]` 相关日志

#### 步骤2: 检查数据
```javascript
// 在控制台执行
const currentPlan = /* 获取当前plan */;
console.log('Relations count:', currentPlan.relations?.length);
console.log('Lines count:', currentPlan.lines?.length);
console.log('Timelines count:', currentPlan.timelines?.length);

// 检查Relations引用
currentPlan.relations?.forEach((rel, idx) => {
  const fromLine = currentPlan.lines.find(l => l.id === rel.fromLineId);
  const toLine = currentPlan.lines.find(l => l.id === rel.toLineId);
  console.log(`Relation ${idx}:`, {
    from: fromLine ? `✅ ${fromLine.label}` : `❌ NOT FOUND (${rel.fromLineId})`,
    to: toLine ? `✅ ${toLine.label}` : `❌ NOT FOUND (${rel.toLineId})`,
    type: rel.properties?.dependencyType,
    visible: rel.displayConfig?.visible,
  });
});
```

#### 步骤3: 检查SVG元素
```javascript
// 检查SVG是否存在
const svg = document.querySelector('svg[style*="position: absolute"]');
console.log('SVG element:', svg);
console.log('SVG children:', svg?.children.length);

// 检查path元素
const paths = document.querySelectorAll('svg path[stroke="#14B8A6"]');
console.log('Paths count:', paths.length);
paths.forEach((path, idx) => {
  console.log(`Path ${idx}:`, path.getAttribute('d'));
});
```

#### 步骤4: 临时修改颜色测试
```typescript
// 在 RelationRenderer.tsx 中临时修改
stroke={isHovered ? '#FF0000' : '#FF0000'}  // ✅ 强制红色
strokeWidth={isHovered ? 5 : 5}  // ✅ 强制粗线
```

---

### 7. 预期结果

如果一切正常，控制台应该显示：

```
[TimelinePanel] 🔗 Relations Debug: {
  hasRelations: true,
  relationsCount: 7,  // ✅ 应该有至少7条
  linesCount: 18,     // ✅ 应该有至少18个Line
  timelinesCount: 7,  // ✅ 应该有至少7个Timeline
}

[RelationRenderer] 📍 Building line positions: {
  linesCount: 18,
  timelinesCount: 7,
}

[RelationRenderer] ✅ Line positions built: 18  // ✅ 应该等于lines数量

[RelationRenderer] 🎨 Rendering relations: {
  relationsCount: 7,
  linePositionsCount: 18,
}
```

页面上应该看到：
- ✅ 7条青绿色虚线
- ✅ 连线连接正确的任务条
- ✅ Hover时连线变粗并显示标签（FS/SS/FF/SF）

---

## 总结

**已添加的调试日志**:
1. ✅ TimelinePanel - Relations数据检查
2. ✅ RelationRenderer - Line位置构建日志
3. ✅ RelationRenderer - 渲染信息日志

**下一步**:
1. 启动开发服务器 `pnpm run dev`
2. 打开浏览器控制台
3. 查看日志输出
4. 根据日志定位具体问题

**常见问题快速诊断**:
- `relationsCount: 0` → Mock数据未正确生成或未勾选"添加示例数据"
- `linePositionsCount: 0` → Line数据为空或Timeline匹配失败
- 有日志但看不到连线 → 颜色/层级/渲染问题，尝试修改颜色测试
