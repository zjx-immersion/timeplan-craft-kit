/**
 * 验证关系数据脚本
 * 
 * 用于检查数据源中的无效关系并生成修复报告
 */

import { allTimePlans } from '../src/data/allTimePlans.js';
import { validateRelations } from '../src/utils/validation/relationValidator.js';

console.log('🔍 开始验证关系数据...\n');

let totalRelations = 0;
let totalInvalid = 0;
const issues: Array<{
  planName: string;
  warnings: any[];
}> = [];

allTimePlans.forEach(plan => {
  if (!plan.relations || plan.relations.length === 0) {
    return;
  }
  
  totalRelations += plan.relations.length;
  
  const result = validateRelations(plan.relations, plan.lines);
  
  if (!result.valid) {
    totalInvalid += result.warnings.length;
    issues.push({
      planName: plan.name,
      warnings: result.warnings,
    });
    
    console.log(`❌ 计划: ${plan.name}`);
    console.log(`   发现 ${result.warnings.length} 个无效关系:\n`);
    
    result.warnings.forEach(warning => {
      console.log(`   - [${warning.type}] ${warning.message}`);
      console.log(`     关系ID: ${warning.relationId}`);
      console.log(`     ${warning.fromLineId} → ${warning.toLineId}\n`);
    });
  }
});

console.log('\n📊 验证汇总:');
console.log(`   总关系数: ${totalRelations}`);
console.log(`   无效关系: ${totalInvalid}`);
console.log(`   有问题的计划: ${issues.length}`);

if (issues.length === 0) {
  console.log('\n✅ 所有关系都有效！');
} else {
  console.log('\n⚠️  需要修复以下问题:');
  issues.forEach(({ planName, warnings }) => {
    console.log(`\n计划: ${planName}`);
    warnings.forEach(w => {
      console.log(`  - ${w.message}`);
    });
  });
}
