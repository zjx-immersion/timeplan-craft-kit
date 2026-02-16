/**
 * 关系数据验证工具
 * @module validation/relationValidator
 * 
 * 功能：
 * 1. 验证关系(Relation)引用的Line是否存在
 * 2. 检测重复的关系定义
 * 3. 检测自引用（circular reference）
 * 4. 自动修复无效关系
 */

import type { Relation, Line } from '@/types/timeplanSchema';
import type {
  ValidationResult,
  RelationWarning,
  AutoFixResult,
} from './types';

/**
 * 验证关系数据的完整性
 * 
 * @param relations - 关系列表
 * @param lines - 任务列表
 * @returns 验证结果，包含警告信息和修复后的关系列表
 * 
 * @example
 * ```typescript
 * const result = validateRelations(plan.relations, plan.lines);
 * if (!result.valid) {
 *   console.warn('发现无效关系:', result.warnings);
 * }
 * ```
 */
export function validateRelations(
  relations: Relation[],
  lines: Line[]
): ValidationResult {
  // 创建Line ID集合，用于快速查找
  const lineIds = new Set(lines.map(l => l.id));
  const warnings: RelationWarning[] = [];
  const validRelations: Relation[] = [];

  // 用于检测重复关系
  const relationKeys = new Map<string, string>(); // key -> relationId

  relations.forEach(relation => {
    let isValid = true;

    // 1. 检查 fromLineId 是否存在
    if (!lineIds.has(relation.fromLineId)) {
      warnings.push({
        relationId: relation.id,
        type: 'missing_from',
        message: `源任务不存在: ${relation.fromLineId}`,
        fromLineId: relation.fromLineId,
        toLineId: relation.toLineId,
      });
      isValid = false;
    }

    // 2. 检查 toLineId 是否存在
    if (!lineIds.has(relation.toLineId)) {
      warnings.push({
        relationId: relation.id,
        type: 'missing_to',
        message: `目标任务不存在: ${relation.toLineId}`,
        fromLineId: relation.fromLineId,
        toLineId: relation.toLineId,
      });
      isValid = false;
    }

    // 3. 检查自引用
    if (relation.fromLineId === relation.toLineId) {
      warnings.push({
        relationId: relation.id,
        type: 'circular',
        message: `关系不能指向自身: ${relation.fromLineId}`,
        fromLineId: relation.fromLineId,
        toLineId: relation.toLineId,
      });
      isValid = false;
    }

    // 4. 检查重复关系
    const relationKey = `${relation.fromLineId}-${relation.toLineId}`;
    const existingRelationId = relationKeys.get(relationKey);
    
    if (existingRelationId) {
      warnings.push({
        relationId: relation.id,
        type: 'duplicate',
        message: `重复关系 (与 ${existingRelationId} 重复): ${relationKey}`,
        fromLineId: relation.fromLineId,
        toLineId: relation.toLineId,
      });
      isValid = false;
    } else {
      relationKeys.set(relationKey, relation.id);
    }

    // 如果关系有效，添加到有效列表
    if (isValid) {
      validRelations.push(relation);
    }
  });

  return {
    valid: warnings.length === 0,
    warnings,
    fixedRelations: validRelations,
  };
}

/**
 * 自动修复关系数据（静默模式）
 * 
 * 移除所有无效关系，保留有效关系
 * 
 * @param relations - 关系列表
 * @param lines - 任务列表
 * @returns 修复结果，包含修复后的关系列表和移除数量
 * 
 * @example
 * ```typescript
 * const { fixed, removed, warnings } = autoFixRelations(
 *   plan.relations,
 *   plan.lines
 * );
 * 
 * if (removed > 0) {
 *   console.warn(`已移除 ${removed} 个无效关系`);
 *   plan.relations = fixed;
 * }
 * ```
 */
export function autoFixRelations(
  relations: Relation[],
  lines: Line[]
): AutoFixResult {
  const result = validateRelations(relations, lines);
  
  if (result.warnings.length > 0) {
    // 输出警告信息到console
    console.warn('[RelationValidator] 发现无效关系:', result.warnings);
    console.info(
      `[RelationValidator] 已移除 ${result.warnings.length} 个无效关系`
    );
    
    // 按警告类型分组统计
    const warningsByType = result.warnings.reduce((acc, warning) => {
      acc[warning.type] = (acc[warning.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.info('[RelationValidator] 警告类型统计:', warningsByType);
  }

  return {
    fixed: result.fixedRelations || relations,
    removed: relations.length - (result.fixedRelations?.length || 0),
    warnings: result.warnings,
  };
}

/**
 * 检测重复的关系定义
 * 
 * 查找具有相同 fromLineId 和 toLineId 的关系
 * 
 * @param relations - 关系列表
 * @returns 重复关系的ID列表
 * 
 * @example
 * ```typescript
 * const duplicates = findDuplicateRelations(plan.relations);
 * if (duplicates.length > 0) {
 *   console.warn('发现重复关系:', duplicates);
 * }
 * ```
 */
export function findDuplicateRelations(relations: Relation[]): string[] {
  const seen = new Map<string, string>(); // key -> relationId
  const duplicates: string[] = [];

  relations.forEach(rel => {
    const key = `${rel.fromLineId}-${rel.toLineId}`;
    const existingId = seen.get(key);
    
    if (existingId) {
      duplicates.push(rel.id);
      console.warn(
        `[RelationValidator] 重复关系: ${rel.id} (与 ${existingId} 重复)`
      );
    } else {
      seen.set(key, rel.id);
    }
  });

  return duplicates;
}

/**
 * 获取关系验证摘要
 * 
 * @param relations - 关系列表
 * @param lines - 任务列表
 * @returns 验证摘要信息
 */
export function getValidationSummary(
  relations: Relation[],
  lines: Line[]
): {
  total: number;
  valid: number;
  invalid: number;
  warningsByType: Record<string, number>;
} {
  const result = validateRelations(relations, lines);
  
  const warningsByType = result.warnings.reduce((acc, warning) => {
    acc[warning.type] = (acc[warning.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    total: relations.length,
    valid: result.fixedRelations?.length || 0,
    invalid: result.warnings.length,
    warningsByType,
  };
}
