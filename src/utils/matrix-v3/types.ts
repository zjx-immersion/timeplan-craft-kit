/**
 * 矩阵视图V3 - 类型定义
 * 
 * 架构：Timeline(产品) × TimeNode(里程碑/门禁)
 * 
 * @version 3.0.0
 * @date 2026-02-11
 */

import { Line, Timeline } from '@/types/timeplanSchema';

/**
 * 时间节点类型（列）
 */
export type TimeNodeType = 'milestone' | 'gateway' | 'baseline';

/**
 * 时间节点（矩阵的列）
 */
export interface TimeNode {
  id: string;
  label: string;
  date: Date;
  type: TimeNodeType;
  line?: Line; // 关联的Line（如果是Milestone或Gateway）
}

/**
 * 优先级类型
 */
export type PriorityType = 'P0' | 'P1' | 'P2' | 'P3';

/**
 * 优先级分布
 */
export interface PriorityDistribution {
  P0: number;  // P0任务数量
  P1: number;  // P1任务数量
  P2: number;  // P2任务数量
  P3: number;  // P3任务数量
}

/**
 * 按优先级的工作量分布
 */
export interface EffortByPriority {
  P0: number;
  P1: number;
  P2: number;
  P3: number;
}

/**
 * 里程碑单元格内容
 */
export interface MilestoneContent {
  sstsCount: number;           // SSTS数量
  sstsList: string[];          // SSTS名称列表（摘要）
  objectiveSummary: string;    // 目标摘要
  deliverableVersion?: string; // 交付版本
  vehicleNodes: string[];      // 涉及车型节点
  deliverableCount: number;    // 交付物数量
}

/**
 * 门禁单元格内容
 */
export interface GatewayContent {
  gatewayType: string;         // 门禁类型
  checkItemCount: number;      // 检查项总数
  passedCount: number;         // 已通过数
  failedCount: number;         // 失败数
  pendingCount: number;        // 待检查数
  overallStatus: string;       // 整体状态
  completionRate: number;      // 完成率
}

/**
 * 矩阵单元格数据
 */
export interface MatrixCellV3 {
  timelineId: string;   // Timeline ID（产品）
  timeNodeId: string;   // 时间节点ID
  lines: Line[];        // 该产品在该时间节点的所有Line
  totalEffort: number;  // 总工作量（人/天）
  status: 'completed' | 'in-progress' | 'planned' | 'empty';
  loadRate: number;     // 负载率（0-1）
  
  // 新增：时间节点类型
  timeNodeType: 'milestone' | 'gateway';
  
  // 新增：优先级分布
  priorityDistribution: PriorityDistribution;
  // 新增：按优先级的工作量分布
  effortByPriority: EffortByPriority;
  
  // 新增：里程碑特定内容
  milestoneContent?: MilestoneContent;
  // 新增：门禁特定内容
  gatewayContent?: GatewayContent;
}

/**
 * 矩阵数据
 */
export interface MatrixDataV3 {
  timelines: Timeline[];      // 所有产品线（行）
  timeNodes: TimeNode[];      // 所有时间节点（列），按时间排序
  cells: Map<string, MatrixCellV3>; // key: `${timelineId}-${timeNodeId}`
  totalEffort: number;        // 总工作量
  dateRange: {
    start: Date;
    end: Date;
  };
}

/**
 * 时间节点分组（用于列头分组显示）
 */
export interface TimeNodeGroup {
  year: number;
  quarter: number;
  nodes: TimeNode[];
}
