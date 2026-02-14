/**
 * 数据验证工具
 * @module validation
 */

export {
  validateRelations,
  autoFixRelations,
  findDuplicateRelations,
  getValidationSummary,
} from './relationValidator';

export type {
  RelationWarning,
  RelationWarningType,
  ValidationResult,
  AutoFixResult,
} from './types';
