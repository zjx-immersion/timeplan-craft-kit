# SVG连线渲染检查脚本

## 问题现象
- 日志显示 `Line positions built: 50` ✅
- 但页面上看不到连线 ❌

## 立即在浏览器控制台执行以下脚本

### 脚本1: 检查SVG元素是否存在
```javascript
// ==================== 检查SVG元素 ====================
console.log('🔍 ========== SVG渲染检查 ==========');

const svg = document.querySelector('svg[style*="position: absolute"]');
console.log('1️⃣ SVG元素:', svg ? '✅ 存在' : '❌ 不存在');

if (svg) {
  console.log('  - SVG宽度:', svg.style.width);
  console.log('  - SVG高度:', svg.style.height);
  console.log('  - SVG zIndex:', svg.style.zIndex);
  console.log('  - SVG子元素数量:', svg.children.length);
  
  // 检查defs（箭头定义）
  const defs = svg.querySelector('defs');
  console.log('2️⃣ Defs元素:', defs ? '✅ 存在' : '❌ 不存在');
  
  if (defs) {
    const markers = defs.querySelectorAll('marker');
    console.log('  - Marker数量:', markers.length);
    markers.forEach((marker, idx) => {
      console.log(`    - Marker[${idx}]:`, marker.id);
    });
  }
  
  // 检查g元素（每个relation一个g）
  const groups = svg.querySelectorAll('g');
  console.log('3️⃣ G元素数量:', groups.length, groups.length > 0 ? '✅' : '❌');
  
  // 检查path元素（连线）
  const paths = svg.querySelectorAll('path');
  console.log('4️⃣ Path元素数量:', paths.length, paths.length > 0 ? '✅' : '❌');
  
  if (paths.length > 0) {
    console.log('📍 Path详情:');
    paths.forEach((path, idx) => {
      const d = path.getAttribute('d');
      const stroke = path.getAttribute('stroke');
      const strokeWidth = path.getAttribute('stroke-width');
      const strokeDasharray = path.getAttribute('stroke-dasharray');
      const markerEnd = path.getAttribute('marker-end');
      
      console.log(`  Path[${idx}]:`);
      console.log(`    - d: ${d ? d.substring(0, 50) + '...' : 'null'}`);
      console.log(`    - stroke: ${stroke}`);
      console.log(`    - strokeWidth: ${strokeWidth}`);
      console.log(`    - strokeDasharray: ${strokeDasharray}`);
      console.log(`    - markerEnd: ${markerEnd}`);
    });
  }
  
  // 检查circle元素（连接点）
  const circles = svg.querySelectorAll('circle');
  console.log('5️⃣ Circle元素数量:', circles.length, circles.length > 0 ? '✅' : '❌');
  
  if (circles.length > 0) {
    console.log('📍 前3个Circle位置:');
    circles.forEach((circle, idx) => {
      if (idx < 3) {
        console.log(`  Circle[${idx}]:`, {
          cx: circle.getAttribute('cx'),
          cy: circle.getAttribute('cy'),
          r: circle.getAttribute('r'),
          fill: circle.getAttribute('fill'),
        });
      }
    });
  }
  
} else {
  console.error('❌ SVG元素不存在！RelationRenderer没有渲染任何内容。');
}

console.log('🔍 ========== 检查完成 ==========');
```

---

## 脚本2: 检查Relations数据
```javascript
// ==================== 检查Relations数据 ====================
console.log('📊 ========== Relations数据检查 ==========');

// 尝试从多种方式获取当前plan
let currentPlan = null;

// 方法1: 从window.__TIMEPLAN_STORE__获取（如果有暴露）
if (window.__TIMEPLAN_STORE__) {
  currentPlan = window.__TIMEPLAN_STORE__.currentPlan;
  console.log('✅ 从 window.__TIMEPLAN_STORE__ 获取');
}

// 方法2: 从React DevTools获取（需要手动）
if (!currentPlan) {
  console.warn('⚠️ 无法自动获取currentPlan，请在React DevTools中找到UnifiedTimelinePanelV2组件');
  console.warn('然后在控制台执行: $r.props 或查看 plan 数据');
}

if (currentPlan) {
  console.log('1️⃣ Plan信息:');
  console.log('  - Title:', currentPlan.title);
  console.log('  - Timelines:', currentPlan.timelines?.length || 0);
  console.log('  - Lines:', currentPlan.lines?.length || 0);
  console.log('  - Relations:', currentPlan.relations?.length || 0);
  
  if (currentPlan.relations && currentPlan.relations.length > 0) {
    console.log('2️⃣ Relations详情:');
    
    const lineIds = new Set(currentPlan.lines?.map(l => l.id) || []);
    
    currentPlan.relations.forEach((rel, idx) => {
      const fromExists = lineIds.has(rel.fromLineId);
      const toExists = lineIds.has(rel.toLineId);
      const visible = rel.displayConfig?.visible !== false;
      
      let status = '✅';
      let reason = 'Valid';
      
      if (!visible) {
        status = '❌';
        reason = 'Hidden (visible=false)';
      } else if (!fromExists) {
        status = '❌';
        reason = `From line not found: ${rel.fromLineId}`;
      } else if (!toExists) {
        status = '❌';
        reason = `To line not found: ${rel.toLineId}`;
      }
      
      console.log(`  Relation[${idx}] ${status}:`, {
        type: rel.type,
        from: rel.fromLineId,
        to: rel.toLineId,
        dependencyType: rel.properties?.dependencyType,
        visible: visible,
        status: reason,
      });
    });
    
    const validCount = currentPlan.relations.filter(rel => {
      const fromExists = lineIds.has(rel.fromLineId);
      const toExists = lineIds.has(rel.toLineId);
      const visible = rel.displayConfig?.visible !== false;
      return visible && fromExists && toExists;
    }).length;
    
    console.log(`📊 Summary: ${validCount}/${currentPlan.relations.length} valid relations`);
    
  } else {
    console.error('❌ Relations数组为空！');
  }
} else {
  console.log('手动获取方法：');
  console.log('1. 打开React DevTools');
  console.log('2. 找到UnifiedTimelinePanelV2组件');
  console.log('3. 点击选中，然后在控制台执行: console.log($r.props)');
}

console.log('📊 ========== 检查完成 ==========');
```

---

## 脚本3: 强制红色粗线测试（如果SVG存在但看不见）
```javascript
// ==================== 强制修改连线颜色 ====================
console.log('🎨 ========== 强制红色粗线测试 ==========');

const paths = document.querySelectorAll('svg path[stroke-dasharray]');
console.log('找到', paths.length, '条连线');

if (paths.length > 0) {
  paths.forEach((path, idx) => {
    path.setAttribute('stroke', '#FF0000');  // 红色
    path.setAttribute('stroke-width', '8');   // 8px粗
    path.setAttribute('stroke-dasharray', 'none');  // 实线
    console.log(`✅ Path[${idx}] 已改为红色粗线`);
  });
  
  console.log('✅ 所有连线已改为红色粗线，如果还看不到，说明path的d属性有问题');
} else {
  console.error('❌ 没有找到任何path元素！');
}

console.log('🎨 ========== 修改完成 ==========');
```

---

## 预期结果分析

### 情况1: SVG元素不存在
**症状**: 脚本1显示 `❌ SVG元素不存在`
**原因**: 
- Relations数据为空（`relationsCount: 0`）
- 或者`data.relations && data.relations.length > 0`条件未满足
**解决**: 检查Relations数据是否真的存在

### 情况2: SVG存在但没有Path元素
**症状**: 脚本1显示 `✅ SVG元素存在` 但 `Path元素数量: 0`
**原因**:
- Relations引用的Line不存在（`fromLineId`或`toLineId`找不到）
- 或者`relation.displayConfig.visible = false`
**解决**: 执行脚本2检查Relations数据完整性

### 情况3: SVG和Path都存在，但看不见
**症状**: 脚本1显示一切正常（Path数量 > 0）
**原因**:
- 连线颜色与背景色冲突
- 连线被其他元素遮挡
- Path的`d`属性计算错误（路径超出视图范围）
**解决**: 执行脚本3强制红色粗线测试

### 情况4: Path的d属性为空或无效
**症状**: 脚本1显示Path存在但`d: null`或`d: M NaN NaN`
**原因**: 
- 日期解析错误
- 位置计算返回NaN
- viewStartDate或scale不正确
**解决**: 检查日志中的Line位置计算，查看是否有NaN值

---

## 快速诊断流程

1. ✅ **刷新页面**
2. ✅ **打开控制台**
3. ✅ **执行脚本1** - 检查SVG元素
4. ✅ **执行脚本2** - 检查Relations数据（如果可以获取）
5. ✅ **如果SVG存在但看不见，执行脚本3** - 强制红色测试

---

## 临时修复：强制显示测试连线

如果以上都正常但仍看不见，可以在 `RelationRenderer.tsx` 中添加测试连线：

```typescript
// 在 return 的 SVG 中添加一条测试线
<svg>
  {/* 测试线 - 从左上角到右下角的红色粗线 */}
  <line
    x1="100"
    y1="100"
    x2="500"
    y2="500"
    stroke="#FF0000"
    strokeWidth="8"
    strokeDasharray="none"
  />
  
  {/* 原有的Relations渲染 */}
  {relations.map(...)}
</svg>
```

**如果连测试线都看不到**，说明SVG层级问题（被遮挡或overflow:hidden）。
