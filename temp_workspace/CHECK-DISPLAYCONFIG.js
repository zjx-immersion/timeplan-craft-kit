// ========== 检查Relations的displayConfig ==========
// 请在浏览器控制台执行此脚本

console.log('========== 🔍 检查displayConfig ==========');

// 方法1: 从React DevTools获取
// 1. 打开React DevTools
// 2. 选中TimelinePanel组件
// 3. 在控制台执行: console.log($r.props.data.relations)

// 方法2: 直接检查页面渲染的数据（如果可访问）
// 尝试从全局变量或store获取

console.log('⚠️ 需要手动操作:');
console.log('1. 打开React DevTools (F12 → Components标签)');
console.log('2. 在左侧组件树中找到 "TimelinePanel" 组件');
console.log('3. 点击选中它');
console.log('4. 在控制台执行以下命令:');
console.log('');
console.log('const relations = $r.props.data.relations;');
console.log('console.log("Relations总数:", relations.length);');
console.log('relations.forEach((rel, idx) => {');
console.log('  console.log(`Relation[${idx}]:`, {');
console.log('    id: rel.id,');
console.log('    type: rel.type,');
console.log('    visible: rel.displayConfig?.visible,');
console.log('    lineStyle: rel.displayConfig?.lineStyle,');
console.log('    lineColor: rel.displayConfig?.lineColor,');
console.log('  });');
console.log('});');
console.log('');
console.log('// 统计visible状态');
console.log('const visibleCount = relations.filter(r => r.displayConfig?.visible === true).length;');
console.log('const hiddenCount = relations.filter(r => r.displayConfig?.visible === false).length;');
console.log('const undefinedCount = relations.filter(r => r.displayConfig?.visible === undefined).length;');
console.log('console.log("Visible:", visibleCount, "Hidden:", hiddenCount, "Undefined:", undefinedCount);');

console.log('');
console.log('========== 检查完成 ==========');
