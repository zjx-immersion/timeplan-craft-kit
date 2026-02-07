// ========== 紧急SVG检查脚本 ==========
// 请在浏览器控制台复制粘贴执行

console.log('========== 🔍 SVG渲染检查 ==========');

// 1. 检查SVG元素
const svg = document.querySelector('svg[style*="position: absolute"]');
console.log('1️⃣ SVG元素:', svg ? '✅ 存在' : '❌ 不存在');

if (!svg) {
  console.error('❌ SVG元素不存在！RelationRenderer没有返回SVG。');
  console.log('========== 检查结束 ==========');
} else {
  console.log('  ✅ SVG存在，继续检查...');
  console.log('  - SVG宽度:', svg.style.width);
  console.log('  - SVG高度:', svg.style.height);
  console.log('  - SVG zIndex:', svg.style.zIndex);
  console.log('  - SVG pointerEvents:', svg.style.pointerEvents);
  console.log('  - SVG display:', window.getComputedStyle(svg).display);
  console.log('  - SVG visibility:', window.getComputedStyle(svg).visibility);
  console.log('  - SVG opacity:', window.getComputedStyle(svg).opacity);
  console.log('  - SVG子元素数量:', svg.children.length);
  
  // 2. 检查defs（箭头定义）
  const defs = svg.querySelector('defs');
  console.log('2️⃣ Defs元素:', defs ? '✅ 存在' : '❌ 不存在');
  if (defs) {
    const markers = defs.querySelectorAll('marker');
    console.log('  - Marker数量:', markers.length);
    markers.forEach((m, i) => console.log(`    - Marker[${i}]:`, m.id));
  }
  
  // 3. 检查g元素（每个relation一个g）
  const groups = svg.querySelectorAll('g');
  console.log('3️⃣ G元素数量:', groups.length, groups.length > 0 ? '✅' : '❌');
  
  // 4. 检查path元素（连线）
  const allPaths = svg.querySelectorAll('path');
  const tealPaths = svg.querySelectorAll('path[stroke="#14B8A6"]');
  const transparentPaths = svg.querySelectorAll('path[stroke="transparent"]');
  console.log('4️⃣ Path元素:');
  console.log('  - 总Path数量:', allPaths.length);
  console.log('  - 青色Path数量 (stroke=#14B8A6):', tealPaths.length);
  console.log('  - 透明Path数量 (stroke=transparent):', transparentPaths.length);
  
  if (allPaths.length === 0) {
    console.error('❌ 没有Path元素！relations.map()可能没有正确执行。');
  } else {
    console.log('  ✅ Path存在，检查第一条Path...');
    const path = allPaths[0];
    const d = path.getAttribute('d');
    const stroke = path.getAttribute('stroke');
    const strokeWidth = path.getAttribute('stroke-width');
    const strokeDasharray = path.getAttribute('stroke-dasharray');
    const fill = path.getAttribute('fill');
    const markerEnd = path.getAttribute('marker-end');
    
    console.log('📍 第一条Path详情:');
    console.log('  - d属性:', d ? d.substring(0, 120) + (d.length > 120 ? '...' : '') : 'null');
    console.log('  - stroke:', stroke);
    console.log('  - strokeWidth:', strokeWidth);
    console.log('  - strokeDasharray:', strokeDasharray);
    console.log('  - fill:', fill);
    console.log('  - markerEnd:', markerEnd);
    console.log('  - d包含NaN?', d?.includes('NaN') ? '❌ YES' : '✅ NO');
    console.log('  - d包含Infinity?', d?.includes('Infinity') ? '❌ YES' : '✅ NO');
    
    // 检查坐标范围
    if (d && !d.includes('NaN') && !d.includes('Infinity')) {
      const numbers = d.match(/[\d.]+/g)?.map(Number) || [];
      if (numbers.length > 0) {
        const maxCoord = Math.max(...numbers);
        const minCoord = Math.min(...numbers);
        console.log('  - 坐标范围:', `${minCoord.toFixed(0)} ~ ${maxCoord.toFixed(0)}`);
        console.log('  - 坐标是否合理?', (maxCoord < 100000 && minCoord > -1000) ? '✅ YES' : '❌ NO');
      }
    }
  }
  
  // 5. 检查circle元素（连接点）
  const circles = svg.querySelectorAll('circle');
  console.log('5️⃣ Circle元素数量:', circles.length, circles.length > 0 ? '✅' : '⚠️');
  
  // 6. 强制红色测试
  if (allPaths.length > 0) {
    console.log('6️⃣ 🔴 强制改为红色粗线测试...');
    let changedCount = 0;
    allPaths.forEach(path => {
      if (path.getAttribute('fill') === 'none' || path.getAttribute('stroke') === 'transparent') {
        path.setAttribute('stroke', '#FF0000');
        path.setAttribute('stroke-width', '10');
        path.setAttribute('stroke-dasharray', 'none');
        path.setAttribute('opacity', '1');
        changedCount++;
      }
    });
    console.log(`✅ 已将 ${changedCount} 条Path改为红色粗线`);
    console.log('👀 请查看页面，是否能看到红色粗线？');
  } else {
    console.log('6️⃣ ⚠️ 没有Path可以测试');
  }
  
  console.log('========== 检查完成 ==========');
  console.log('');
  console.log('📋 请反馈:');
  console.log('  1. SVG存在? (上面显示)');
  console.log('  2. Path总数量? (上面显示)');
  console.log('  3. 执行红色测试后，能看到红色粗线吗? (是/否)');
}
