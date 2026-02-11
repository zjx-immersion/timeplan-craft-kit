/**
 * 数据映射验证脚本
 * 
 * 用途：验证orionXTimePlan.ts中的数据是否完整
 * 运行：pnpm tsx scripts/verify-data-mapping.ts
 */

import { orionXTimePlan } from '../src/data/orionXTimePlan';
import { enhanceTimePlan } from '../src/utils/matrix/dataEnhancer';

console.log('🔍 开始验证数据映射...\n');

// 1. 统计基础信息
console.log('📊 基础信息:');
console.log(`  - TimePlan: ${orionXTimePlan.name}`);
console.log(`  - Timeline数量: ${orionXTimePlan.timelines.length}`);
console.log(`  - Line数量: ${orionXTimePlan.lines.length}`);
console.log('');

// 2. 检查所有Line是否都被Timeline包含
console.log('🔗 Line-Timeline关联检查:');
const allLineIdsInTimelines = new Set<string>();
orionXTimePlan.timelines.forEach(tl => {
  tl.lineIds.forEach(lineId => allLineIdsInTimelines.add(lineId));
});

const orphanLines = orionXTimePlan.lines.filter(
  line => !allLineIdsInTimelines.has(line.id)
);

if (orphanLines.length === 0) {
  console.log('  ✅ 所有Line都被Timeline包含');
} else {
  console.log(`  ⚠️  发现 ${orphanLines.length} 个孤立Line（未被任何Timeline包含）:`);
  orphanLines.forEach(line => {
    console.log(`    - ${line.id}: ${line.name}`);
  });
}
console.log('');

// 3. 运行数据增强
console.log('🚀 运行数据增强...');
const enhanced = enhanceTimePlan(orionXTimePlan);
console.log('');

// 4. 统计Product分布
console.log('📦 Product分布:');
const productStats: Record<string, number> = {};
enhanced.lines.forEach(line => {
  productStats[line.productId] = (productStats[line.productId] || 0) + 1;
});
Object.entries(productStats).forEach(([productId, count]) => {
  console.log(`  - ${productId}: ${count}`);
});
console.log('');

// 5. 统计Team分布
console.log('👥 Team分布:');
const teamStats: Record<string, number> = {};
enhanced.lines.forEach(line => {
  teamStats[line.teamId] = (teamStats[line.teamId] || 0) + 1;
});
Object.entries(teamStats)
  .sort((a, b) => b[1] - a[1])
  .forEach(([teamId, count]) => {
    console.log(`  - ${teamId}: ${count}`);
  });
console.log('');

// 6. 统计工作量
console.log('💼 工作量统计:');
const totalEffort = enhanced.lines.reduce((sum, line) => sum + line.effort, 0);
console.log(`  - 总工作量: ${totalEffort.toFixed(1)} 人/天`);
console.log(`  - 平均工作量: ${(totalEffort / enhanced.lines.length).toFixed(2)} 人/天/任务`);
console.log('');

// 7. 验证结果
console.log('✅ 验证结果:');
const allOrionX = enhanced.lines.every(l => l.productId === 'product-orion-x');
const noOrphanTeams = enhanced.lines.filter(l => l.teamId === 'team-demo').length;

if (allOrionX) {
  console.log('  ✅ 所有Line都归属于 product-orion-x');
} else {
  console.log('  ❌ 有Line不属于 product-orion-x');
}

if (noOrphanTeams === orphanLines.length) {
  console.log(`  ✅ 孤立Line正确使用默认Team（${noOrphanTeams}个）`);
} else {
  console.log(`  ⚠️  默认Team数量 (${noOrphanTeams}) 与孤立Line数量 (${orphanLines.length}) 不匹配`);
}

// 8. 检查Timeline覆盖率
console.log('');
console.log('📊 Timeline覆盖率:');
orionXTimePlan.timelines.forEach(tl => {
  const linesInTimeline = enhanced.lines.filter(l => l.teamId === `team-${tl.id.replace('tl-', '')}`);
  const expectedLineIds = tl.lineIds.length;
  console.log(`  - ${tl.name}: ${linesInTimeline.length} / ${expectedLineIds}`);
});

console.log('');
console.log('🎉 验证完成！');
