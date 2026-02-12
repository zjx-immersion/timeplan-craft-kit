/**
 * 矩阵视图V3 - 矩阵计算逻辑
 * 
 * 根据TimePlan数据计算Timeline × TimeNode矩阵
 * 
 * @version 3.0.0
 * @date 2026-02-11
 */

import { TimePlan, Line, Timeline } from '@/types/timeplanSchema';
import { GatewaySchema, MilestoneSchema } from '@/schemas/defaultSchemas';
import { 
  TimeNode, 
  TimeNodeType, 
  MatrixCellV3, 
  MatrixDataV3,
  TimeNodeGroup,
  PriorityDistribution,
  EffortByPriority,
  PriorityType,
  MilestoneContent,
  GatewayContent
} from './types';

/**
 * 从Line提取时间节点
 */
function extractTimeNode(line: Line): TimeNode | null {
  const date = line.startDate || line.endDate;
  if (!date) return null;

  let type: TimeNodeType;
  if (line.schemaId === MilestoneSchema.id) {
    type = 'milestone';
  } else if (line.schemaId === GatewaySchema.id) {
    type = 'gateway';
  } else {
    return null; // 只提取Milestone和Gateway
  }

  return {
    id: line.id,
    label: line.label,
    date: new Date(date),
    type,
    line,
  };
}

/**
 * 估算Line的工作量（人/天）
 */
function estimateEffort(line: Line): number {
  // 优先使用attributes中的effort
  if (line.attributes?.effort && typeof line.attributes.effort === 'number') {
    return line.attributes.effort;
  }

  // 根据schemaId估算
  if (line.schemaId === GatewaySchema.id) {
    return 0.5; // Gateway通常较轻量
  }
  
  if (line.schemaId === MilestoneSchema.id) {
    return 1.0; // Milestone默认1人/天
  }

  // 根据时间跨度估算
  if (line.startDate && line.endDate) {
    const start = new Date(line.startDate);
    const end = new Date(line.endDate);
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    return days * 0.5; // 假设0.5人/天的强度
  }

  return 1.0; // 默认值
}

/**
 * 计算单元格状态
 */
function calculateCellStatus(lines: Line[]): MatrixCellV3['status'] {
  if (lines.length === 0) return 'empty';

  const statuses = lines.map(line => line.attributes?.status || 'planned');
  
  if (statuses.every(s => s === '已完成' || s === '已通过')) return 'completed';
  if (statuses.some(s => s === '进行中' || s === '开发中')) return 'in-progress';
  
  return 'planned';
}

/**
 * 从Line提取优先级
 */
function extractPriority(line: Line): PriorityType {
  const priority = line.attributes?.priority;
  if (priority === 'P0' || priority === 'P1' || priority === 'P2' || priority === 'P3') {
    return priority;
  }
  // 根据其他字段推断优先级
  if (line.attributes?.importance === 'high') return 'P1';
  if (line.attributes?.importance === 'medium') return 'P2';
  return 'P3'; // 默认P3
}

/**
 * 计算优先级分布
 */
function calculatePriorityDistribution(lines: Line[]): PriorityDistribution {
  const distribution: PriorityDistribution = {
    P0: 0,
    P1: 0,
    P2: 0,
    P3: 0,
  };
  
  lines.forEach(line => {
    const priority = extractPriority(line);
    distribution[priority]++;
  });
  
  return distribution;
}

/**
 * 计算按优先级的工作量分布
 */
function calculateEffortByPriority(lines: Line[]): EffortByPriority {
  const effort: EffortByPriority = {
    P0: 0,
    P1: 0,
    P2: 0,
    P3: 0,
  };
  
  lines.forEach(line => {
    const priority = extractPriority(line);
    effort[priority] += estimateEffort(line);
  });
  
  return effort;
}

/**
 * 从Line提取里程碑内容
 */
function extractMilestoneContent(line: Line): MilestoneContent {
  const attrs = line.attributes || {};
  
  // 提取SSTS列表
  const sstsList = attrs.sstsList || [];
  
  // 提取车型节点
  const vehicleDeliverables = attrs.vehicleDeliverables || [];
  const vehicleNodes = vehicleDeliverables.map((v: any) => v.node).filter(Boolean);
  
  // 计算交付物数量
  const deliverableCount = vehicleDeliverables.reduce(
    (sum: number, v: any) => sum + (v.items?.length || 0), 0
  );
  
  return {
    sstsCount: sstsList.length,
    sstsList: sstsList.slice(0, 3).map((s: any) => s.name || s.id || '未命名'),
    objectiveSummary: attrs.objectives?.[0] || attrs.description || attrs.goal || '暂无目标描述',
    deliverableVersion: attrs.deliverableVersion?.version || attrs.version,
    vehicleNodes: vehicleNodes.slice(0, 3),
    deliverableCount,
  };
}

/**
 * 从Line提取门禁内容
 */
function extractGatewayContent(line: Line): GatewayContent {
  const attrs = line.attributes || {};
  const checkItems = attrs.checkItems || [];
  
  // 如果没有预定义的检查项，基于状态推断
  if (checkItems.length === 0) {
    const status = attrs.status || attrs.gatewayStatus || 'pending';
    return {
      gatewayType: attrs.gatewayType || attrs.type || 'technical',
      checkItemCount: 1,
      passedCount: status === '已通过' || status === 'approved' ? 1 : 0,
      failedCount: status === '未通过' || status === 'rejected' ? 1 : 0,
      pendingCount: status === '待决策' || status === 'pending' ? 1 : 0,
      overallStatus: status,
      completionRate: status === '已通过' ? 1 : status === '未通过' ? 0 : 0.5,
    };
  }
  
  // 有详细检查项的情况
  const passed = checkItems.filter((c: any) => c.status === 'passed' || c.status === '已通过').length;
  const failed = checkItems.filter((c: any) => c.status === 'failed' || c.status === '未通过').length;
  const pending = checkItems.filter((c: any) => 
    c.status === 'pending' || c.status === 'in-progress' || c.status === '待决策'
  ).length;
  
  return {
    gatewayType: attrs.gatewayType || 'technical',
    checkItemCount: checkItems.length,
    passedCount: passed,
    failedCount: failed,
    pendingCount: pending,
    overallStatus: attrs.overallStatus || attrs.status || 'pending',
    completionRate: checkItems.length > 0 ? passed / checkItems.length : 0,
  };
}

/**
 * 计算负载率
 * 
 * 简单版本：基于工作量与时间窗口的比率
 */
function calculateLoadRate(totalEffort: number, timeWindow: number = 30): number {
  // timeWindow默认30天
  const baseCapacity = timeWindow * 1.0; // 假设1人满负荷
  return Math.min(1, totalEffort / baseCapacity);
}

/**
 * 按时间排序时间节点
 */
function sortTimeNodes(nodes: TimeNode[]): TimeNode[] {
  return [...nodes].sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * 分组时间节点（按季度）
 */
export function groupTimeNodesByQuarter(nodes: TimeNode[]): TimeNodeGroup[] {
  const groups = new Map<string, TimeNodeGroup>();

  nodes.forEach(node => {
    const year = node.date.getFullYear();
    const quarter = Math.ceil((node.date.getMonth() + 1) / 3);
    const key = `${year}-Q${quarter}`;

    if (!groups.has(key)) {
      groups.set(key, { year, quarter, nodes: [] });
    }
    groups.get(key)!.nodes.push(node);
  });

  return Array.from(groups.values()).sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.quarter - b.quarter;
  });
}

/**
 * 计算矩阵数据
 * 
 * @param timePlan - TimePlan数据
 * @returns 矩阵数据
 */
export function calculateMatrixV3(timePlan: TimePlan): MatrixDataV3 {
  const { timelines, lines } = timePlan;

  // 1. 提取所有时间节点（Milestone和Gateway）
  const timeNodes: TimeNode[] = [];
  const lineMap = new Map<string, Line>();

  lines.forEach(line => {
    lineMap.set(line.id, line);
    const node = extractTimeNode(line);
    if (node) {
      timeNodes.push(node);
    }
  });

  // 2. 按时间排序
  const sortedTimeNodes = sortTimeNodes(timeNodes);

  // 3. 构建单元格数据
  const cells = new Map<string, MatrixCellV3>();
  let totalEffort = 0;

  timelines.forEach(timeline => {
    sortedTimeNodes.forEach(timeNode => {
      const cellKey = `${timeline.id}-${timeNode.id}`;
      
      // 查找该Timeline在该TimeNode时间点的所有Line
      // 逻辑：如果Line的timelineId匹配，且Line就是该TimeNode对应的Line
      const cellLines: Line[] = [];
      
      if (timeNode.line && timeNode.line.timelineId === timeline.id) {
        cellLines.push(timeNode.line);
      }

      // 计算工作量
      const cellEffort = cellLines.reduce((sum, line) => sum + estimateEffort(line), 0);
      totalEffort += cellEffort;

      // 计算状态和负载率
      const status = calculateCellStatus(cellLines);
      const loadRate = calculateLoadRate(cellEffort);

      // 确定时间节点类型
      const timeNodeType: 'milestone' | 'gateway' = 
        timeNode.line?.schemaId === MilestoneSchema.id ? 'milestone' : 'gateway';
      
      // 提取特定内容
      let milestoneContent: MilestoneContent | undefined;
      let gatewayContent: GatewayContent | undefined;
      
      if (timeNodeType === 'milestone' && cellLines.length > 0) {
        milestoneContent = extractMilestoneContent(cellLines[0]);
      } else if (timeNodeType === 'gateway' && cellLines.length > 0) {
        gatewayContent = extractGatewayContent(cellLines[0]);
      }
      
      cells.set(cellKey, {
        timelineId: timeline.id,
        timeNodeId: timeNode.id,
        lines: cellLines,
        totalEffort: cellEffort,
        status,
        loadRate,
        timeNodeType,
        priorityDistribution: calculatePriorityDistribution(cellLines),
        effortByPriority: calculateEffortByPriority(cellLines),
        milestoneContent,
        gatewayContent,
      });
    });
  });

  // 4. 计算日期范围
  const dates = sortedTimeNodes.map(n => n.date);
  const dateRange = {
    start: dates[0] || new Date(),
    end: dates[dates.length - 1] || new Date(),
  };

  return {
    timelines,
    timeNodes: sortedTimeNodes,
    cells,
    totalEffort,
    dateRange,
  };
}

/**
 * 获取单元格数据
 */
export function getCell(
  matrix: MatrixDataV3, 
  timelineId: string, 
  timeNodeId: string
): MatrixCellV3 | undefined {
  return matrix.cells.get(`${timelineId}-${timeNodeId}`);
}

/**
 * 获取Timeline的所有单元格
 */
export function getTimelineCells(
  matrix: MatrixDataV3, 
  timelineId: string
): MatrixCellV3[] {
  return matrix.timeNodes
    .map(node => getCell(matrix, timelineId, node.id))
    .filter((cell): cell is MatrixCellV3 => cell !== undefined);
}

/**
 * 获取TimeNode的所有单元格
 */
export function getTimeNodeCells(
  matrix: MatrixDataV3, 
  timeNodeId: string
): MatrixCellV3[] {
  return matrix.timelines
    .map(timeline => getCell(matrix, timeline.id, timeNodeId))
    .filter((cell): cell is MatrixCellV3 => cell !== undefined);
}
