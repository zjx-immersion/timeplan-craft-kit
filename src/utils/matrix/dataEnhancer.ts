/**
 * 数据增强工具
 * 
 * 为现有的TimePlan数据添加矩阵视图所需的字段
 * 
 * @module utils/matrix/dataEnhancer
 */

import type { TimePlan, Line, Timeline } from '@/types/timeplan';
import type { LineExtended } from '@/types/matrix';

/**
 * TimePlan到Product的映射规则
 * 
 * 1个TimePlan = 1个Product
 */
function getProductIdFromPlan(plan: TimePlan): string {
  // 根据plan的ID或名称判断Product
  const planName = plan.name?.toLowerCase() || '';
  
  if (planName.includes('orion') || plan.id?.includes('orion')) {
    return 'product-orion-x';
  }
  
  // 其他产品可以在这里扩展
  
  return 'product-demo';
}

/**
 * Timeline到Team的映射规则
 * 
 * 每个Timeline = 1个Team（模块团队）
 */
const TIMELINE_TO_TEAM_MAP: Record<string, string> = {
  // Orion X项目的模块团队
  'tl-project-mgmt': 'team-project-office',      // 项目办
  'tl-ee-arch': 'team-ee-arch',                  // 电子电器架构团队
  'tl-perception': 'team-perception',            // 感知团队
  'tl-sensing': 'team-perception',               // 感知团队（别名）
  'tl-planning': 'team-planning',                // 规划团队
  'tl-decision': 'team-planning',                // 规划团队（别名）
  'tl-control': 'team-control',                  // 控制团队
  'tl-hmi': 'team-hmi',                          // 座舱HMI团队
  'tl-platform': 'team-platform',                // 平台团队
  'tl-testing': 'team-testing',                  // 测试团队
  'tl-integration': 'team-integration',          // 集成团队
  'tl-quality': 'team-quality',                  // 质量团队
  
  // 默认团队
  'default': 'team-demo',
};

/**
 * 根据Line类型估算工作量（人/天）
 * 
 * @public 导出供单元测试使用
 */
export function estimateEffort(line: Line): number {
  // 如果已有effort字段，直接使用
  if ((line as any).effort) {
    return (line as any).effort;
  }
  
  // 根据schemaId估算
  const schemaId = line.schemaId;
  
  if (schemaId === 'milestone-schema' || schemaId === 'gateway-schema') {
    // 里程碑和门禁通常工作量较小
    return 0.5;
  }
  
  if (schemaId === 'lineplan-schema') {
    // 根据时间跨度估算
    const startDate = new Date(line.startDate);
    const endDate = line.endDate ? new Date(line.endDate) : startDate;
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // 简化计算：天数 / 10（假设一个人10天完成）
    const effort = Math.max(0.5, days / 10);
    
    // 限制最大值
    return Math.min(effort, 20);
  }
  
  // 默认
  return 1.0;
}

/**
 * 增强单个Line数据
 */
export function enhanceLine(
  line: Line,
  timeline: Timeline,
  productId: string
): LineExtended {
  // Product来自TimePlan层级（整个计划）
  // Team来自Timeline（模块团队）
  const teamId = TIMELINE_TO_TEAM_MAP[timeline.id] || TIMELINE_TO_TEAM_MAP['default'];
  
  // 估算工作量
  const effort = estimateEffort(line);
  
  return {
    ...line,
    productId,
    teamId,
    effort,
  } as LineExtended;
}

/**
 * 增强整个TimePlan数据
 */
export function enhanceTimePlan(plan: TimePlan): TimePlan & { lines: LineExtended[] } {
  // 步骤1：确定Product（整个TimePlan = 1个Product）
  const productId = getProductIdFromPlan(plan);
  
  // 步骤2：为每个Line分配Team（根据所属的Timeline）
  const enhancedLines = plan.lines.map(line => {
    // 找到line所属的timeline
    const timeline = plan.timelines.find(tl => tl.lineIds.includes(line.id));
    
    if (!timeline) {
      console.warn(`[dataEnhancer] Line ${line.id} 未找到所属timeline，使用默认映射`);
      return {
        ...line,
        productId,
        teamId: TIMELINE_TO_TEAM_MAP['default'],
        effort: estimateEffort(line),
      } as LineExtended;
    }
    
    return enhanceLine(line, timeline, productId);
  });
  
  return {
    ...plan,
    lines: enhancedLines,
  };
}

/**
 * 打印增强统计信息
 */
export function printEnhancementStats(plan: TimePlan): void {
  const enhancedPlan = enhanceTimePlan(plan);
  
  const productCounts = new Map<string, number>();
  const teamCounts = new Map<string, number>();
  let totalEffort = 0;
  
  enhancedPlan.lines.forEach(line => {
    const extLine = line as LineExtended;
    productCounts.set(extLine.productId || 'unknown', (productCounts.get(extLine.productId || 'unknown') || 0) + 1);
    teamCounts.set(extLine.teamId || 'unknown', (teamCounts.get(extLine.teamId || 'unknown') || 0) + 1);
    totalEffort += extLine.effort || 0;
  });
  
  console.log('[dataEnhancer] 数据增强统计:');
  console.log(`  - 总任务数: ${enhancedPlan.lines.length}`);
  console.log(`  - 总工作量: ${totalEffort.toFixed(1)} 人/天`);
  console.log('  - Product分布:', Object.fromEntries(productCounts));
  console.log('  - Team分布:', Object.fromEntries(teamCounts));
}

/**
 * 自定义映射规则
 */
export function setCustomMapping(
  timelineId: string,
  _productId: string,
  teamId: string
): void {
  // Product映射在getProductIdFromPlan函数中处理（基于plan名称）
  // Team映射基于timelineId
  TIMELINE_TO_TEAM_MAP[timelineId] = teamId;
}
