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
 * Timeline到Product的映射规则
 */
const TIMELINE_TO_PRODUCT_MAP: Record<string, string> = {
  // Orion X相关的timeline
  'tl-project-mgmt': 'product-orion-x',
  'tl-ee-arch': 'product-orion-x',
  'tl-sensing': 'product-orion-x',
  'tl-decision': 'product-orion-x',
  'tl-control': 'product-orion-x',
  'tl-hmi': 'product-orion-x',
  'tl-platform': 'product-orion-x',
  'tl-testing': 'product-orion-x',
  'tl-integration': 'product-orion-x',
  'tl-quality': 'product-orion-x',
  
  // 默认产品
  'default': 'product-demo',
};

/**
 * Timeline到Team的映射规则
 * 
 * 根据timeline的owner或category判断
 */
const TIMELINE_TO_TEAM_MAP: Record<string, string> = {
  // 按timeline ID映射
  'tl-project-mgmt': 'team-demo',
  'tl-ee-arch': 'team-chenghzhi',
  'tl-sensing': 'team-chenghzhi',
  'tl-decision': 'team-chenghzhi',
  'tl-control': 'team-chenghzhi',
  'tl-hmi': 'team-chenghzhi',
  'tl-platform': 'team-chenghzhi',
  'tl-testing': 'team-demo',
  'tl-integration': 'team-demo',
  'tl-quality': 'team-demo',
  
  // 默认团队
  'default': 'team-demo',
};

/**
 * 根据Line类型估算工作量（人/天）
 */
function estimateEffort(line: Line): number {
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
  timeline: Timeline
): LineExtended {
  // 获取productId
  const productId = TIMELINE_TO_PRODUCT_MAP[timeline.id] || TIMELINE_TO_PRODUCT_MAP['default'];
  
  // 获取teamId
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
  // 创建timeline映射，方便查找
  const timelineMap = new Map<string, Timeline>();
  plan.timelines.forEach(tl => timelineMap.set(tl.id, tl));
  
  // 增强所有line
  const enhancedLines = plan.lines.map(line => {
    // 找到line所属的timeline
    const timeline = plan.timelines.find(tl => tl.lineIds.includes(line.id));
    
    if (!timeline) {
      console.warn(`[dataEnhancer] Line ${line.id} 未找到所属timeline，使用默认映射`);
      return {
        ...line,
        productId: TIMELINE_TO_PRODUCT_MAP['default'],
        teamId: TIMELINE_TO_TEAM_MAP['default'],
        effort: estimateEffort(line),
      } as LineExtended;
    }
    
    return enhanceLine(line, timeline);
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
  productId: string,
  teamId: string
): void {
  TIMELINE_TO_PRODUCT_MAP[timelineId] = productId;
  TIMELINE_TO_TEAM_MAP[timelineId] = teamId;
}
