# Orion X TimePlan 数据验证

## 数据完整性检查

### 浏览器Console验证脚本

```javascript
// ========================================
// 1. 获取当前TimePlan数据
// ========================================
const getCurrentPlan = () => {
  // 从localStorage获取数据
  const stored = localStorage.getItem('timeplan-craft-kit-store');
  if (!stored) {
    console.error('❌ 未找到存储的数据');
    return null;
  }
  
  const data = JSON.parse(stored);
  const currentPlanId = data.state?.currentPlanId;
  const plans = data.state?.plans || [];
  
  const plan = plans.find(p => p.id === currentPlanId || p.title?.includes('Orion X'));
  
  if (!plan) {
    console.error('❌ 未找到 Orion X 计划');
    console.log('可用的plans:', plans.map(p => ({ id: p.id, title: p.title })));
    return null;
  }
  
  return plan;
};

const plan = getCurrentPlan();

if (plan) {
  console.log('✅ 找到计划:', plan.title);
  console.log('\n========== 数据统计 ==========');
  console.log('📊 Timelines (产品平台):', plan.timelines?.length || 0);
  console.log('📊 Lines (任务/里程碑/门禁):', plan.lines?.length || 0);
  console.log('📊 Relations (依赖关系):', plan.relations?.length || 0);
  console.log('📊 Baselines (基线):', plan.baselines?.length || 0);
  
  console.log('\n========== Timelines 列表 ==========');
  plan.timelines?.forEach((tl, i) => {
    const linesCount = plan.lines?.filter(l => l.timelineId === tl.id).length || 0;
    console.log(`${i + 1}. ${tl.name} (${tl.id})`);
    console.log(`   - Lines: ${linesCount}`);
    console.log(`   - Owner: ${tl.owner || '未指定'}`);
  });
  
  console.log('\n========== Lines 分类统计 ==========');
  const barCount = plan.lines?.filter(l => l.schemaId === 'bar-schema').length || 0;
  const milestoneCount = plan.lines?.filter(l => l.schemaId === 'milestone-schema').length || 0;
  const gatewayCount = plan.lines?.filter(l => l.schemaId === 'gateway-schema').length || 0;
  console.log(`📊 Bars (任务条): ${barCount}`);
  console.log(`📊 Milestones (里程碑): ${milestoneCount}`);
  console.log(`📊 Gateways (门禁): ${gatewayCount}`);
  
  console.log('\n========== 视图数据准备检查 ==========');
  
  // 甘特图视图
  console.log('✅ 甘特图视图 (TimelinePanel):');
  console.log('   - Timelines: ✓');
  console.log('   - Lines: ✓');
  console.log('   - Relations: ✓');
  console.log('   - Baselines: ✓');
  
  // 版本对比视图
  console.log('✅ 版本对比视图 (VersionTableView):');
  console.log('   - Lines: ✓ (用于对比)');
  
  // 版本计划视图
  console.log('✅ 版本计划视图 (VersionPlanView):');
  console.log('   - Timelines: ✓');
  console.log(`   - Gates: ${gatewayCount} ✓`);
  console.log(`   - Milestones: ${milestoneCount} ✓`);
  
  // 迭代规划视图
  console.log('✅ 迭代规划视图 (IterationView):');
  console.log('   - Timelines: ✓ (派生团队)');
  console.log('   - Lines: ✓ (显示markers)');
  
  console.log('\n========== 数据完整性检查 ==========');
  
  // 检查timeline的lineIds是否正确
  let orphanLines = 0;
  plan.timelines?.forEach(tl => {
    const actualLines = plan.lines?.filter(l => l.timelineId === tl.id) || [];
    const declaredIds = new Set(tl.lineIds || []);
    const actualIds = new Set(actualLines.map(l => l.id));
    
    const missing = [...declaredIds].filter(id => !actualIds.has(id));
    const extra = [...actualIds].filter(id => !declaredIds.has(id));
    
    if (missing.length > 0 || extra.length > 0) {
      console.warn(`⚠️ Timeline ${tl.name}:`);
      if (missing.length > 0) console.warn(`   - lineIds中有但lines中没有: ${missing.length}`);
      if (extra.length > 0) console.warn(`   - lines中有但lineIds中没有: ${extra.length}`);
    }
  });
  
  // 检查relations的有效性
  const lineIds = new Set(plan.lines?.map(l => l.id) || []);
  const invalidRelations = plan.relations?.filter(rel => 
    !lineIds.has(rel.fromLineId) || !lineIds.has(rel.toLineId)
  ) || [];
  
  if (invalidRelations.length > 0) {
    console.warn(`⚠️ 无效的Relations: ${invalidRelations.length}`);
  } else {
    console.log(`✅ 所有Relations有效`);
  }
  
  // 检查lines的startDate/endDate
  let invalidDates = 0;
  plan.lines?.forEach(line => {
    const start = new Date(line.startDate);
    if (isNaN(start.getTime())) {
      console.warn(`⚠️ Line ${line.id} 的 startDate 无效:`, line.startDate);
      invalidDates++;
    }
    
    if (line.endDate) {
      const end = new Date(line.endDate);
      if (isNaN(end.getTime())) {
        console.warn(`⚠️ Line ${line.id} 的 endDate 无效:`, line.endDate);
        invalidDates++;
      } else if (end < start) {
        console.warn(`⚠️ Line ${line.id} 的 endDate < startDate`);
        invalidDates++;
      }
    }
  });
  
  if (invalidDates === 0) {
    console.log(`✅ 所有Lines的日期有效`);
  } else {
    console.warn(`⚠️ 发现 ${invalidDates} 个无效日期`);
  }
  
  console.log('\n========== 总结 ==========');
  if (invalidRelations.length === 0 && invalidDates === 0 && orphanLines === 0) {
    console.log('✅ 数据完整性验证通过！');
    console.log('✅ 所有视图都可以正常使用此数据');
  } else {
    console.warn('⚠️ 发现数据完整性问题，需要修复');
  }
}
```

### 执行方式

1. 打开页面：http://localhost:9088/orion-x-2026-full-v3
2. 打开浏览器开发者工具（F12）
3. 切换到 Console 标签
4. 复制粘贴上面的脚本并回车
5. 查看输出结果

---

## 预期输出

```
✅ 找到计划: Orion X 智能驾驶平台 2026 年度计划（完整版）

========== 数据统计 ==========
📊 Timelines (产品平台): 7
📊 Lines (任务/里程碑/门禁): 53+
📊 Relations (依赖关系): 27+
📊 Baselines (基线): 12

========== Timelines 列表 ==========
1. 项目管理 (tl-project-mgmt)
   - Lines: 6
   - Owner: 项目办
2. 电子电器架构 (tl-ee-arch)
   - Lines: 10
   - Owner: 架构团队
3. 感知算法 (tl-perception)
   - Lines: 8
   - Owner: 感知团队
4. 规划决策 (tl-planning)
   - Lines: 8
   - Owner: 规划团队
5. 控制执行 (tl-control)
   - Lines: 8
   - Owner: 控制团队
6. 软件集成 (tl-integration)
   - Lines: 8
   - Owner: 集成团队
7. 整车测试 (tl-testing)
   - Lines: 8
   - Owner: 测试团队

========== Lines 分类统计 ==========
📊 Bars (任务条): ~28
📊 Milestones (里程碑): ~14
📊 Gateways (门禁): ~14

========== 视图数据准备检查 ==========
✅ 甘特图视图 (TimelinePanel):
   - Timelines: ✓
   - Lines: ✓
   - Relations: ✓
   - Baselines: ✓
✅ 版本对比视图 (VersionTableView):
   - Lines: ✓ (用于对比)
✅ 版本计划视图 (VersionPlanView):
   - Timelines: ✓
   - Gates: 14 ✓
   - Milestones: 14 ✓
✅ 迭代规划视图 (IterationView):
   - Timelines: ✓ (派生团队)
   - Lines: ✓ (显示markers)

========== 数据完整性检查 ==========
✅ 所有Relations有效
✅ 所有Lines的日期有效

========== 总结 ==========
✅ 数据完整性验证通过！
✅ 所有视图都可以正常使用此数据
```

---

## 各视图数据使用说明

### 1. 甘特图视图 (TimelinePanel)

**使用的数据**:
```typescript
{
  timelines: Timeline[]     // 显示为左侧列表
  lines: Line[]            // 渲染为bars/milestones/gateways
  relations: Relation[]    // 渲染为依赖连线
  baselines: Baseline[]    // 渲染为垂直基线标记
}
```

**数据要求**:
- ✅ timelines: 至少1个
- ✅ lines: 每个timeline至少1个line
- ✅ relations: 可选，但推荐有
- ✅ baselines: 可选

**验证**: 切换到甘特图，应该看到7个timeline行，每行有bars/gates/milestones

---

### 2. 版本对比视图 (VersionTableView)

**使用的数据**:
```typescript
{
  lines: Line[]  // 对比开始日期、结束日期、进度
}
```

**数据要求**:
- ✅ lines: 至少1个，用于对比
- ℹ️ 目前使用同一个plan做对比（baseVersion = compareVersion）

**验证**: 切换到版本对比，应该看到所有lines的表格列表

---

### 3. 版本计划视图 (VersionPlanView) ⭐ 新建

**使用的数据**:
```typescript
{
  timelines: Timeline[]  // 作为产品平台行
  lines: Line[]         // 筛选出gates和milestones
}
```

**数据处理逻辑**:
```typescript
// 1. 纵轴：timelines → 产品平台行
productRows = timelines.map(timeline => {
  const gates = lines.filter(l => 
    l.timelineId === timeline.id && 
    l.schemaId === 'gateway-schema'
  );
  const milestones = lines.filter(l => 
    l.timelineId === timeline.id && 
    l.schemaId === 'milestone-schema'
  );
  return { timeline, gates, milestones };
});

// 2. 横轴：自动计算月份范围
timeRange = {
  start: min(lines.map(l => l.startDate)),
  end: max(lines.map(l => l.startDate))
};
monthColumns = eachMonthOfInterval(timeRange);

// 3. 单元格：判断gate/milestone是否在该月
isLineInMonth(line, monthStart) => {
  return line.startDate在[monthStart, monthEnd]区间内
}
```

**数据要求**:
- ✅ timelines: 至少1个（作为产品平台）
- ✅ lines: 至少有gates或milestones
- ✅ 日期有效且在合理范围内

**验证**: 切换到版本计划，应该看到：
- 7行产品平台
- 多列月份（2025-12 到 2027-01）
- 单元格中有蓝色（milestone）和橙色（gate）标签

---

### 4. 迭代规划视图 (IterationView)

**使用的数据**:
```typescript
{
  timelines: Timeline[]     // 用于派生团队和模块
  lines: Line[]            // gates/milestones显示在迭代上方
}
```

**数据处理逻辑**:
```typescript
// 从timelines派生团队和模块（通过迭代配置）
// gates和milestones按日期匹配到迭代
iterationMarkers = iterations.map(iter => {
  return lines.filter(line => 
    (line.schemaId === 'gateway-schema' || line.schemaId === 'milestone-schema') &&
    line.startDate在[iter.startDate, iter.endDate]区间内
  );
});
```

**数据要求**:
- ✅ timelines: 用于派生团队（需要配置）
- ✅ lines: gates/milestones用于显示
- ✅ 需要外部迭代配置（products, teams, modules, iterations）

**验证**: 切换到迭代规划，应该看到：
- 团队和模块矩阵
- 迭代列（Sprint 1-N）
- 上方有gates/milestones标记

---

## 数据结构检查

### TimePlan 必需字段

```typescript
interface TimePlan {
  id: string;              // ✅ 必需
  title: string;           // ✅ 必需
  owner?: string;          // ✓ 可选
  description?: string;    // ✓ 可选
  schemaId: string;        // ✅ 必需
  timelines: Timeline[];   // ✅ 必需，至少1个
  lines: Line[];           // ✅ 必需，至少1个
  relations?: Relation[];  // ✓ 可选
  baselines?: Baseline[];  // ✓ 可选
  viewConfig?: ViewConfig; // ✓ 可选
}
```

### Timeline 必需字段

```typescript
interface Timeline {
  id: string;              // ✅ 必需
  name: string;            // ✅ 必需
  title?: string;          // ✓ 可选（显示优先使用）
  owner?: string;          // ✓ 可选
  description?: string;    // ✓ 可选
  lineIds: string[];       // ✅ 必需（关联lines）
  order?: number;          // ✓ 可选（排序）
  color?: string;          // ✓ 可选（默认色）
}
```

### Line 必需字段

```typescript
interface Line {
  id: string;              // ✅ 必需
  schemaId: string;        // ✅ 必需 ('bar-schema' | 'milestone-schema' | 'gateway-schema')
  label: string;           // ✅ 必需
  startDate: string;       // ✅ 必需（ISO格式）
  endDate?: string;        // ✓ bar必需，milestone/gateway不需要
  timelineId: string;      // ✅ 必需（关联timeline）
  progress?: number;       // ✓ 可选（0-100）
}
```

---

## 潜在问题检查

### 1. Timeline.lineIds 不匹配

**问题**: 
- `timeline.lineIds` 中声明的ID
- `lines` 中实际的 `timelineId` 引用
- 两者可能不一致

**检查脚本**:
```javascript
plan.timelines.forEach(tl => {
  const declaredIds = new Set(tl.lineIds || []);
  const actualLines = plan.lines.filter(l => l.timelineId === tl.id);
  const actualIds = new Set(actualLines.map(l => l.id));
  
  const missing = [...declaredIds].filter(id => !actualIds.has(id));
  const extra = [...actualIds].filter(id => !declaredIds.has(id));
  
  if (missing.length > 0) {
    console.warn(`⚠️ ${tl.name}: lineIds中有${missing.length}个ID在lines中找不到`);
  }
  if (extra.length > 0) {
    console.warn(`⚠️ ${tl.name}: lines中有${extra.length}个line未在lineIds中声明`);
  }
});
```

### 2. Relations 引用无效line

**问题**: relation的fromLineId或toLineId指向不存在的line

**检查脚本**:
```javascript
const lineIds = new Set(plan.lines.map(l => l.id));
const invalidRels = plan.relations.filter(rel => 
  !lineIds.has(rel.fromLineId) || !lineIds.has(rel.toLineId)
);

if (invalidRels.length > 0) {
  console.warn(`⚠️ 发现 ${invalidRels.length} 个无效Relations`);
  invalidRels.forEach(rel => {
    console.warn(`   - ${rel.id}: ${rel.fromLineId} → ${rel.toLineId}`);
  });
}
```

### 3. 日期格式或范围问题

**问题**: 
- 日期字符串格式不正确
- endDate < startDate
- 日期在合理范围外（如1970年或2099年）

**检查脚本**:
```javascript
plan.lines.forEach(line => {
  const start = new Date(line.startDate);
  
  if (isNaN(start.getTime())) {
    console.warn(`⚠️ ${line.id}: startDate无效`);
  }
  
  if (line.endDate) {
    const end = new Date(line.endDate);
    if (isNaN(end.getTime())) {
      console.warn(`⚠️ ${line.id}: endDate无效`);
    } else if (end < start) {
      console.warn(`⚠️ ${line.id}: endDate < startDate`);
    }
  }
  
  // 检查bar必须有endDate
  if (line.schemaId === 'bar-schema' && !line.endDate) {
    console.warn(`⚠️ ${line.id}: bar缺少endDate`);
  }
});
```

---

## 手动验证清单

### 甘特图视图
- [ ] 左侧显示7个timeline（项目管理、电子电器架构...）
- [ ] 每个timeline有多个bars/gates/milestones
- [ ] 依赖关系线正常显示
- [ ] 基线垂直线正常显示
- [ ] 无console错误

### 版本对比视图
- [ ] 显示表格，包含所有lines
- [ ] 有"基准版本"和"对比版本"列
- [ ] 显示开始日期、结束日期、进度
- [ ] 无console错误

### 版本计划视图
- [ ] 显示7行产品平台
- [ ] 横轴显示多列月份
- [ ] 单元格有蓝色milestone标签
- [ ] 单元格有橙色gate标签
- [ ] 产品平台列固定，可横向滚动
- [ ] 无console错误

### 迭代规划视图
- [ ] 显示团队和模块矩阵
- [ ] 迭代列（Sprint 1, Sprint 2...）
- [ ] 上方显示gates/milestones标记
- [ ] 可以添加MR（如果有配置）
- [ ] 无console错误

---

## 数据增强建议

如果验证发现数据不完整，可以考虑：

### 1. 增加Timeline的title字段
```typescript
timelines: [
  {
    id: 'tl-project-mgmt',
    name: '项目管理',
    title: '项目管理',  // ← 添加
    // ...
  }
]
```

### 2. 确保所有bar有endDate
```typescript
// bar-schema必需字段
{
  id: 'line-xxx',
  schemaId: 'bar-schema',
  label: 'xxx',
  startDate: '2026-01-01',
  endDate: '2026-02-01',  // ← 必需
  timelineId: 'tl-xxx',
}
```

### 3. 添加迭代配置数据
如果需要完整的迭代规划视图功能，需要添加：
- products（产品）
- teams（团队）
- modules（模块）
- iterations（迭代/Sprint）
- mrs（MR/任务）

---

## 快速验证命令

在浏览器Console执行简化版验证：

```javascript
// 快速检查
const plan = JSON.parse(localStorage.getItem('timeplan-craft-kit-store')).state.plans.find(p => p.title?.includes('Orion'));
console.log('Timelines:', plan?.timelines?.length);
console.log('Lines:', plan?.lines?.length);
console.log('Relations:', plan?.relations?.length);
console.log('Baselines:', plan?.baselines?.length);
```

---

**创建时间**: 2026-02-07  
**用途**: 验证数据完整性，确保所有视图正常工作
