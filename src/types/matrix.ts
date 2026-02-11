/**
 * Matrix（矩阵）数据模型
 * 
 * 用于矩阵视图的数据结构定义
 * 
 * @module types/matrix
 */

import type { Line } from './timeplan';

/**
 * 负载状态
 */
export type LoadStatus = 'idle' | 'normal' | 'warning' | 'overload';

/**
 * 日期范围
 */
export interface DateRange {
  /** 开始日期 */
  start: Date;
  
  /** 结束日期 */
  end: Date;
}

/**
 * 单元格数据
 */
export interface CellData {
  /** 产品ID */
  productId: string;
  
  /** 团队ID */
  teamId: string;
  
  /** 工作量（人/天） */
  effort: number;
  
  /** 负载率（%） */
  loadRate: number;
  
  /** 负载状态 */
  loadStatus: LoadStatus;
  
  /** 任务列表 */
  tasks: Line[];
  
  /** 按优先级分类的工作量 */
  byPriority: {
    P0: number;
    P1: number;
    P2: number;
    P3: number;
  };
  
  /** 任务数量 */
  taskCount: number;
}

/**
 * 矩阵数据
 */
export interface MatrixData {
  /** 单元格数据映射 (key: productId-teamId) */
  cells: Map<string, CellData>;
  
  /** 产品维度合计 (key: productId, value: total effort) */
  productTotals: Map<string, number>;
  
  /** 团队维度合计 (key: teamId, value: total effort) */
  teamTotals: Map<string, number>;
  
  /** 总计 */
  grandTotal: number;
  
  /** 资源预警列表 */
  warnings: ResourceWarning[];
}

/**
 * 资源预警
 */
export interface ResourceWarning {
  /** 预警ID */
  id: string;
  
  /** 预警类型 */
  type: 'overload' | 'idle';
  
  /** 产品ID */
  productId: string;
  
  /** 团队ID */
  teamId: string;
  
  /** 负载率 */
  loadRate: number;
  
  /** 预警消息 */
  message: string;
  
  /** 严重程度 */
  severity: 'low' | 'medium' | 'high';
}

/**
 * 预警配置
 */
export interface WarningConfig {
  /** 过载阈值（%） */
  overloadThreshold: number;
  
  /** 警告阈值（%） */
  warningThreshold: number;
  
  /** 空闲阈值（%） */
  idleThreshold: number;
}

/**
 * 默认预警配置
 */
export const DEFAULT_WARNING_CONFIG: WarningConfig = {
  overloadThreshold: 100,
  warningThreshold: 80,
  idleThreshold: 30,
};

/**
 * 矩阵筛选条件
 */
export interface MatrixFilters {
  /** 时间范围 */
  timeRange: {
    start: Date;
    end: Date;
    preset?: 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'custom';
  };
  
  /** 优先级筛选 */
  priority: 'all' | 'P0' | 'P1' | 'P2' | 'P3';
  
  /** 状态筛选 */
  status: 'all' | 'not-started' | 'in-progress' | 'completed';
  
  /** 选中的产品ID列表 */
  products?: string[];
  
  /** 选中的团队ID列表 */
  teams?: string[];
}

/**
 * 导出选项
 */
export interface ExportOptions {
  /** 导出格式 */
  format: 'excel' | 'csv' | 'pdf';
  
  /** 文件名 */
  filename?: string;
  
  /** 是否包含详情 */
  includeDetails: boolean;
  
  /** 是否包含图表 */
  includeCharts: boolean;
}

/**
 * 单元格统计信息
 */
export interface CellStats {
  /** 总工作量 */
  totalEffort: number;
  
  /** 任务数量 */
  taskCount: number;
  
  /** 负载率 */
  loadRate: number;
  
  /** 负载状态 */
  loadStatus: LoadStatus;
  
  /** 平均进度 */
  avgProgress: number;
  
  /** 已完成任务数 */
  completedTasks: number;
  
  /** 进行中任务数 */
  inProgressTasks: number;
  
  /** 未开始任务数 */
  notStartedTasks: number;
}

/**
 * 扩展的Line接口（包含Product和Team关联）
 */
export interface LineExtended extends Line {
  /** 产品ID */
  productId?: string;
  
  /** 团队ID */
  teamId?: string;
  
  /** 工作量（人/天） */
  effort?: number;
}

/**
 * 生成单元格key
 */
export function generateCellKey(productId: string, teamId: string): string {
  return `${productId}-${teamId}`;
}

/**
 * 解析单元格key
 */
export function parseCellKey(key: string): { productId: string; teamId: string } | null {
  const parts = key.split('-');
  if (parts.length !== 2) return null;
  return {
    productId: parts[0],
    teamId: parts[1],
  };
}
