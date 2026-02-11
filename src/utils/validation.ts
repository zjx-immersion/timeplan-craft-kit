/**
 * 数据校验工具函数
 * 
 * @version 1.0.0
 * @date 2026-02-10
 */

import type { Line, Timeline, Relation } from '@/types/timeplanSchema';

/**
 * 校验结果
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

/**
 * 校验 Line 数据
 */
export function validateLine(line: Partial<Line>): ValidationResult {
  const errors: ValidationError[] = [];

  // 1. 必填字段
  if (!line.label || line.label.trim() === '') {
    errors.push({
      field: 'label',
      message: '任务名称不能为空',
      severity: 'error',
    });
  }

  if (!line.timelineId) {
    errors.push({
      field: 'timelineId',
      message: '必须指定Timeline',
      severity: 'error',
    });
  }

  if (!line.startDate) {
    errors.push({
      field: 'startDate',
      message: '开始日期不能为空',
      severity: 'error',
    });
  }

  // 2. 日期范围验证
  if (line.startDate && line.endDate) {
    const start = new Date(line.startDate);
    const end = new Date(line.endDate);
    
    if (end < start) {
      errors.push({
        field: 'endDate',
        message: '结束日期不能早于开始日期',
        severity: 'error',
      });
    }
  }

  // 3. 字段长度验证
  if (line.label && line.label.length > 100) {
    errors.push({
      field: 'label',
      message: '任务名称不能超过100个字符',
      severity: 'error',
    });
  }

  // 4. 进度范围验证
  const progress = line.attributes?.progress as number;
  if (progress !== undefined && (progress < 0 || progress > 100)) {
    errors.push({
      field: 'progress',
      message: '进度必须在0-100之间',
      severity: 'error',
    });
  }

  return {
    valid: errors.filter((e) => e.severity === 'error').length === 0,
    errors,
  };
}

/**
 * 校验 Timeline 数据
 */
export function validateTimeline(timeline: Partial<Timeline>): ValidationResult {
  const errors: ValidationError[] = [];

  if (!timeline.label || timeline.label.trim() === '') {
    errors.push({
      field: 'label',
      message: 'Timeline名称不能为空',
      severity: 'error',
    });
  }

  if (timeline.label && timeline.label.length > 50) {
    errors.push({
      field: 'label',
      message: 'Timeline名称不能超过50个字符',
      severity: 'error',
    });
  }

  return {
    valid: errors.filter((e) => e.severity === 'error').length === 0,
    errors,
  };
}

/**
 * 校验 Relation 数据
 */
export function validateRelation(
  relation: Partial<Relation>,
  lines: Line[]
): ValidationResult {
  const errors: ValidationError[] = [];

  if (!relation.from || !relation.to) {
    errors.push({
      field: 'relation',
      message: '必须指定连接的起点和终点',
      severity: 'error',
    });
    return { valid: false, errors };
  }

  // 检查 from 和 to 是否存在
  const fromLine = lines.find((l) => l.id === relation.from);
  const toLine = lines.find((l) => l.id === relation.to);

  if (!fromLine) {
    errors.push({
      field: 'from',
      message: '起点任务不存在',
      severity: 'error',
    });
  }

  if (!toLine) {
    errors.push({
      field: 'to',
      message: '终点任务不存在',
      severity: 'error',
    });
  }

  // 检查是否自环
  if (relation.from === relation.to) {
    errors.push({
      field: 'relation',
      message: '不能连接到自己',
      severity: 'error',
    });
  }

  return {
    valid: errors.filter((e) => e.severity === 'error').length === 0,
    errors,
  };
}

/**
 * 批量校验 Lines
 */
export function validateLines(lines: Line[]): ValidationResult {
  const allErrors: ValidationError[] = [];

  lines.forEach((line, index) => {
    const result = validateLine(line);
    if (!result.valid) {
      result.errors.forEach((error) => {
        allErrors.push({
          ...error,
          message: `第 ${index + 1} 行: ${error.message}`,
        });
      });
    }
  });

  return {
    valid: allErrors.filter((e) => e.severity === 'error').length === 0,
    errors: allErrors,
  };
}

/**
 * 检测数据完整性
 */
export function validateDataIntegrity(data: {
  timelines: Timeline[];
  lines: Line[];
  relations: Relation[];
}): ValidationResult {
  const errors: ValidationError[] = [];

  // 1. 检查 Line 的 timelineId 是否存在
  const timelineIds = new Set(data.timelines.map((t) => t.id));
  data.lines.forEach((line, index) => {
    if (!timelineIds.has(line.timelineId)) {
      errors.push({
        field: `lines[${index}].timelineId`,
        message: `任务 "${line.label}" 的Timeline不存在`,
        severity: 'error',
      });
    }
  });

  // 2. 检查 Relation 的 from 和 to 是否存在
  const lineIds = new Set(data.lines.map((l) => l.id));
  data.relations.forEach((relation, index) => {
    if (!lineIds.has(relation.from)) {
      errors.push({
        field: `relations[${index}].from`,
        message: `依赖关系的起点任务不存在`,
        severity: 'error',
      });
    }
    if (!lineIds.has(relation.to)) {
      errors.push({
        field: `relations[${index}].to`,
        message: `依赖关系的终点任务不存在`,
        severity: 'error',
      });
    }
  });

  // 3. 检查循环依赖（简单检测）
  const hasCyclicDependency = detectCyclicDependencies(data.relations);
  if (hasCyclicDependency) {
    errors.push({
      field: 'relations',
      message: '检测到循环依赖',
      severity: 'warning',
    });
  }

  return {
    valid: errors.filter((e) => e.severity === 'error').length === 0,
    errors,
  };
}

/**
 * 检测循环依赖（简单版本）
 */
function detectCyclicDependencies(relations: Relation[]): boolean {
  // 构建邻接表
  const graph = new Map<string, Set<string>>();
  
  relations.forEach((rel) => {
    if (!graph.has(rel.from)) {
      graph.set(rel.from, new Set());
    }
    graph.get(rel.from)!.add(rel.to);
  });

  // DFS检测环
  const visited = new Set<string>();
  const recStack = new Set<string>();

  function hasCycle(node: string): boolean {
    visited.add(node);
    recStack.add(node);

    const neighbors = graph.get(node) || new Set();
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (hasCycle(neighbor)) {
          return true;
        }
      } else if (recStack.has(neighbor)) {
        return true;
      }
    }

    recStack.delete(node);
    return false;
  }

  for (const node of graph.keys()) {
    if (!visited.has(node)) {
      if (hasCycle(node)) {
        return true;
      }
    }
  }

  return false;
}
