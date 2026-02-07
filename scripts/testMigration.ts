/**
 * 迁移功能测试脚本
 * 
 * 用于验证迁移的功能是否正确工作
 * 
 * 运行方式:
 * ```bash
 * npx tsx scripts/testMigration.ts
 * ```
 */

import { calculateCriticalPath } from '../src/utils/criticalPath';
import { exportToJSON, exportToCSV, exportToExcel } from '../src/utils/dataExport';
import { importFromJSON, validateAndFixPlan, mergePlans } from '../src/utils/dataImport';
import { TimePlan, Line, Relation } from '../src/types/timeplanSchema';

// 测试颜色输出
const green = '\x1b[32m';
const red = '\x1b[31m';
const yellow = '\x1b[33m';
const reset = '\x1b[0m';

function log(message: string, status: 'success' | 'error' | 'info' = 'info') {
  const color = status === 'success' ? green : status === 'error' ? red : yellow;
  console.log(`${color}${message}${reset}`);
}

// 创建测试数据
function createTestPlan(): TimePlan {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  return {
    id: 'test-plan-1',
    title: '测试项目',
    owner: '测试用户',
    schemaId: 'default-schema',
    timelines: [
      {
        id: 'timeline-1',
        name: '开发团队',
        owner: '张三',
        lineIds: ['line-1', 'line-2', 'line-3'],
      },
    ],
    lines: [
      {
        id: 'line-1',
        timelineId: 'timeline-1',
        label: '任务 A',
        startDate: now,
        endDate: tomorrow,
        schemaId: 'bar-schema',
        attributes: {
          status: 'in-progress',
          priority: 'high',
        },
      },
      {
        id: 'line-2',
        timelineId: 'timeline-1',
        label: '任务 B',
        startDate: tomorrow,
        endDate: nextWeek,
        schemaId: 'bar-schema',
        attributes: {
          status: 'pending',
          priority: 'medium',
        },
      },
      {
        id: 'line-3',
        timelineId: 'timeline-1',
        label: '里程碑 1',
        startDate: nextWeek,
        schemaId: 'milestone-schema',
        attributes: {
          importance: 'high',
        },
      },
    ],
    relations: [
      {
        id: 'relation-1',
        type: 'dependency',
        fromLineId: 'line-1',
        toLineId: 'line-2',
        properties: {
          dependencyType: 'finish-to-start',
        },
      },
      {
        id: 'relation-2',
        type: 'dependency',
        fromLineId: 'line-2',
        toLineId: 'line-3',
        properties: {
          dependencyType: 'finish-to-start',
        },
      },
    ],
    baselines: [],
    baselineRanges: [],
    createdAt: now,
    lastAccessTime: now,
  };
}

// 测试 1: 关键路径计算
function testCriticalPath() {
  log('\n🧪 测试 1: 关键路径计算', 'info');
  
  const plan = createTestPlan();
  const criticalPath = calculateCriticalPath(plan.lines, plan.relations);
  
  if (criticalPath.length === 3) {
    log('✅ 关键路径计算正确 (3 个节点)', 'success');
    log(`   关键路径: ${criticalPath.join(' → ')}`, 'info');
    return true;
  } else {
    log(`❌ 关键路径计算错误 (预期 3 个节点，实际 ${criticalPath.length} 个)`, 'error');
    return false;
  }
}

// 测试 2: JSON 导出与导入
function testJSONExportImport() {
  log('\n🧪 测试 2: JSON 导出与导入', 'info');
  
  const plan = createTestPlan();
  
  // 导出
  const json = exportToJSON(plan);
  log('✅ JSON 导出成功', 'success');
  log(`   大小: ${json.length} 字符`, 'info');
  
  // 导入
  const imported = importFromJSON(json);
  
  if (!imported) {
    log('❌ JSON 导入失败', 'error');
    return false;
  }
  
  // 验证数据完整性
  const checks = [
    imported.id === plan.id,
    imported.title === plan.title,
    imported.timelines.length === plan.timelines.length,
    imported.lines.length === plan.lines.length,
    imported.relations.length === plan.relations.length,
  ];
  
  if (checks.every(Boolean)) {
    log('✅ JSON 导入成功，数据完整', 'success');
    log(`   项目: ${imported.title}`, 'info');
    log(`   时间线: ${imported.timelines.length} 个`, 'info');
    log(`   节点: ${imported.lines.length} 个`, 'info');
    log(`   关系: ${imported.relations.length} 个`, 'info');
    return true;
  } else {
    log('❌ 数据完整性验证失败', 'error');
    return false;
  }
}

// 测试 3: CSV 导出
function testCSVExport() {
  log('\n🧪 测试 3: CSV 导出', 'info');
  
  const plan = createTestPlan();
  const csv = exportToCSV(plan);
  
  // 验证 CSV 格式
  const lines = csv.split('\n');
  const headers = lines[0].split(',').length;
  const dataRows = lines.length - 1;
  
  if (headers === 14 && dataRows === plan.lines.length) {
    log('✅ CSV 导出成功', 'success');
    log(`   列数: ${headers} 列`, 'info');
    log(`   行数: ${dataRows} 行数据`, 'info');
    log(`   UTF-8 BOM: ${csv.charCodeAt(0) === 0xFEFF ? '是' : '否'}`, 'info');
    return true;
  } else {
    log('❌ CSV 格式验证失败', 'error');
    return false;
  }
}

// 测试 4: Excel 导出
function testExcelExport() {
  log('\n🧪 测试 4: Excel 导出', 'info');
  
  const plan = createTestPlan();
  const excel = exportToExcel(plan);
  
  // 验证 TSV 格式
  const lines = excel.split('\n');
  const headers = lines[0].split('\t').length;
  const dataRows = lines.length - 1;
  
  if (headers === 14 && dataRows === plan.lines.length) {
    log('✅ Excel 导出成功', 'success');
    log(`   列数: ${headers} 列`, 'info');
    log(`   行数: ${dataRows} 行数据`, 'info');
    return true;
  } else {
    log('❌ Excel 格式验证失败', 'error');
    return false;
  }
}

// 测试 5: ID 冲突处理
function testIDConflictHandling() {
  log('\n🧪 测试 5: ID 冲突处理', 'info');
  
  const plan1 = createTestPlan();
  const plan2 = createTestPlan(); // 相同 ID
  
  const merged = mergePlans([plan1], [plan2]);
  
  if (merged.length === 2 && merged[0].id !== merged[1].id) {
    log('✅ ID 冲突处理正确', 'success');
    log(`   原始 ID: ${plan1.id}`, 'info');
    log(`   新 ID: ${merged[1].id}`, 'info');
    return true;
  } else {
    log('❌ ID 冲突处理失败', 'error');
    return false;
  }
}

// 测试 6: 数据修复
function testDataRepair() {
  log('\n🧪 测试 6: 数据修复', 'info');
  
  const plan = createTestPlan();
  
  // 模拟日期字符串
  const brokenPlan: any = {
    ...plan,
    createdAt: plan.createdAt.toISOString(),
    lines: plan.lines.map(line => ({
      ...line,
      startDate: line.startDate.toISOString(),
      endDate: line.endDate?.toISOString(),
    })),
  };
  
  const fixed = validateAndFixPlan(brokenPlan);
  
  const checks = [
    fixed.createdAt instanceof Date,
    fixed.lines[0].startDate instanceof Date,
    fixed.lines[1].endDate instanceof Date,
  ];
  
  if (checks.every(Boolean)) {
    log('✅ 数据修复成功', 'success');
    log(`   修复日期字段: ${checks.length} 个`, 'info');
    return true;
  } else {
    log('❌ 数据修复失败', 'error');
    return false;
  }
}

// 运行所有测试
async function runAllTests() {
  console.log('');
  console.log('╔════════════════════════════════════════╗');
  console.log('║   迁移功能测试                         ║');
  console.log('╚════════════════════════════════════════╝');
  
  const results = [
    testCriticalPath(),
    testJSONExportImport(),
    testCSVExport(),
    testExcelExport(),
    testIDConflictHandling(),
    testDataRepair(),
  ];
  
  const passed = results.filter(Boolean).length;
  const total = results.length;
  
  console.log('\n' + '═'.repeat(50));
  console.log(`\n测试结果: ${passed}/${total} 通过\n`);
  
  if (passed === total) {
    log('🎉 所有测试通过！', 'success');
    process.exit(0);
  } else {
    log(`⚠️  ${total - passed} 个测试失败`, 'error');
    process.exit(1);
  }
}

// 执行测试
runAllTests();
