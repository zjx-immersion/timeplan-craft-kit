/**
 * Excel导入相关类型定义
 * @module ImportTypes
 */

import type { Line } from '@/types/timeplanSchema';

/**
 * 导入数据接口
 */
export interface ImportData {
  name: string;                    // 任务名称
  timeline?: string;               // Timeline名称
  type: 'bar' | 'milestone' | 'gateway';  // 类型
  owner?: string;                  // 负责人
  startDate: Date | null;          // 开始日期
  endDate?: Date | null;           // 结束日期
  progress?: number;               // 进度
  status?: string;                 // 状态
  priority?: string;               // 优先级
  description?: string;            // 描述
}

/**
 * 校验错误
 */
export interface ValidationError {
  field: string;                   // 字段名
  message: string;                 // 错误信息
  severity: 'error' | 'warning' | 'info';  // 严重程度
}

/**
 * 解析后的行数据
 */
export interface ParsedRow {
  rowNumber: number;               // Excel行号
  data: ImportData;                // 解析后的数据
  errors: ValidationError[];       // 校验错误
  isValid: boolean;                // 是否有效
}

/**
 * 导入选项
 */
export interface ImportOptions {
  ignoreErrors: boolean;           // 忽略错误继续导入
  checkDuplicates: boolean;        // 检查重复
  defaultTimeline?: string;        // 默认Timeline ID
  defaultTimelineName?: string;    // 默认Timeline名称
  overwriteExisting?: boolean;     // 覆盖已存在的任务
}

/**
 * 导入统计
 */
export interface ImportStats {
  total: number;                   // 总行数
  valid: number;                   // 有效行数
  invalid: number;                 // 无效行数
  imported: number;                // 已导入行数
  skipped: number;                 // 跳过行数
  errors: ValidationError[];       // 错误列表
}

/**
 * Excel列定义
 */
export interface ExcelColumnDef {
  key: string;                     // 字段key
  header: string;                  // Excel列名
  required: boolean;               // 是否必填
  description?: string;            // 描述
  example?: string;                // 示例值
  values?: string[];               // 枚举值
  format?: string;                 // 格式说明
  validator?: (value: any) => string | null;  // 自定义校验器
}

/**
 * 类型映射
 */
export const TYPE_MAPPING: Record<string, 'bar' | 'milestone' | 'gateway'> = {
  '计划单元': 'bar',
  '里程碑': 'milestone',
  '关口': 'gateway',
  'bar': 'bar',
  'milestone': 'milestone',
  'gateway': 'gateway',
};

/**
 * 状态映射
 */
export const STATUS_MAPPING: Record<string, string> = {
  '未开始': 'not-started',
  '进行中': 'in-progress',
  '已完成': 'completed',
  '已延期': 'delayed',
  '已取消': 'cancelled',
};

/**
 * Schema ID映射
 */
export const SCHEMA_MAPPING: Record<string, string> = {
  'bar': 'lineplan-schema',
  'milestone': 'milestone-schema',
  'gateway': 'gateway-schema',
};
