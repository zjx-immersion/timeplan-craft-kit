/**
 * 数据验证相关类型定义
 * @module validation/types
 */

import type { Relation, Line } from '@/types/timeplanSchema';

/**
 * 关系警告类型
 */
export type RelationWarningType = 'missing_from' | 'missing_to' | 'duplicate' | 'circular';

/**
 * 关系警告信息
 */
export interface RelationWarning {
  /** 关系ID */
  relationId: string;
  
  /** 警告类型 */
  type: RelationWarningType;
  
  /** 警告消息 */
  message: string;
  
  /** 源任务ID */
  fromLineId?: string;
  
  /** 目标任务ID */
  toLineId?: string;
}

/**
 * 验证结果
 */
export interface ValidationResult {
  /** 是否验证通过 */
  valid: boolean;
  
  /** 警告列表 */
  warnings: RelationWarning[];
  
  /** 修复后的关系列表 */
  fixedRelations?: Relation[];
}

/**
 * 自动修复结果
 */
export interface AutoFixResult {
  /** 修复后的关系列表 */
  fixed: Relation[];
  
  /** 被移除的关系数量 */
  removed: number;
  
  /** 警告列表 */
  warnings: RelationWarning[];
}
