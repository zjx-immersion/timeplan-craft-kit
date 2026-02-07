/**
 * uuid - ID 生成工具
 * 
 * 📋 迁移信息:
 * - 原项目使用: Date.now() 生成 ID
 * - 迁移日期: 2026-02-03
 * - 对比状态: ⬜ 待验证
 * 
 * 🎯 功能要求:
 * - 生成唯一 ID
 * - 保持与原项目兼容的格式
 * - 支持带前缀的 ID 生成
 * 
 * 📝 说明:
 * 原项目使用 `${prefix}-${Date.now()}` 格式生成 ID
 * 为了更好的唯一性，我们增强了生成算法
 */

/**
 * 生成唯一 ID
 * 
 * @param prefix - ID 前缀（可选）
 * @returns 唯一 ID
 * 
 * @example
 * ```typescript
 * generateId(); // "1706925600000-abc123"
 * generateId('plan'); // "plan-1706925600000-abc123"
 * generateId('tl'); // "tl-1706925600000-abc123"
 * ```
 */
export const generateId = (prefix?: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  
  if (prefix) {
    return `${prefix}-${timestamp}-${random}`;
  }
  
  return `${timestamp}-${random}`;
};

/**
 * 生成项目 ID
 * 
 * @returns 项目 ID（格式：plan-{timestamp}-{random}）
 */
export const generatePlanId = (): string => {
  return generateId('plan');
};

/**
 * 生成时间线 ID
 * 
 * @returns 时间线 ID（格式：tl-{timestamp}-{random}）
 */
export const generateTimelineId = (): string => {
  return generateId('tl');
};

/**
 * 生成 Line ID
 * 
 * @returns Line ID（格式：line-{timestamp}-{random}）
 */
export const generateLineId = (): string => {
  return generateId('line');
};

/**
 * 生成关系 ID
 * 
 * @returns 关系 ID（格式：rel-{timestamp}-{random}）
 */
export const generateRelationId = (): string => {
  return generateId('rel');
};

/**
 * 生成基线 ID
 * 
 * @returns 基线 ID（格式：baseline-{timestamp}-{random}）
 */
export const generateBaselineId = (): string => {
  return generateId('baseline');
};

/**
 * 生成基线范围 ID
 * 
 * @returns 基线范围 ID（格式：range-{timestamp}-{random}）
 */
export const generateRangeId = (): string => {
  return generateId('range');
};

/**
 * 生成任务 ID
 * 
 * @returns 任务 ID（格式：task-{timestamp}-{random}）
 */
export const generateTaskId = (): string => {
  return generateId('task');
};

/**
 * 检查 ID 是否有效
 * 
 * @param id - 要检查的 ID
 * @returns 是否有效
 */
export const isValidId = (id: string): boolean => {
  if (!id || typeof id !== 'string') {
    return false;
  }
  
  // ID 应该包含时间戳或随机字符
  return id.length > 0 && (id.includes('-') || /^\d+$/.test(id));
};

/**
 * 从 ID 中提取时间戳
 * 
 * @param id - ID
 * @returns 时间戳（如果存在）
 */
export const extractTimestamp = (id: string): number | null => {
  if (!id) return null;
  
  const parts = id.split('-');
  
  // 尝试找到时间戳部分
  for (const part of parts) {
    const num = parseInt(part, 10);
    if (!isNaN(num) && num > 1000000000000) {
      // 看起来像时间戳（13位数字）
      return num;
    }
  }
  
  return null;
};

/**
 * 从 ID 中提取前缀
 * 
 * @param id - ID
 * @returns 前缀（如果存在）
 */
export const extractPrefix = (id: string): string | null => {
  if (!id || !id.includes('-')) return null;
  
  return id.split('-')[0];
};

/**
 * 生成简短 ID（用于临时或内部使用）
 * 
 * @returns 简短 ID（8位随机字符）
 */
export const generateShortId = (): string => {
  return Math.random().toString(36).substring(2, 10);
};

/**
 * 生成 UUID v4（标准 UUID 格式）
 * 
 * @returns UUID v4
 */
export const generateUUID = (): string => {
  // 如果浏览器支持 crypto.randomUUID，使用它
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // 否则使用兼容实现
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * 批量生成 ID
 * 
 * @param count - 要生成的数量
 * @param prefix - ID 前缀（可选）
 * @returns ID 数组
 */
export const generateBatchIds = (count: number, prefix?: string): string[] => {
  return Array.from({ length: count }, () => generateId(prefix));
};

// 默认导出
export default {
  generateId,
  generatePlanId,
  generateTimelineId,
  generateLineId,
  generateRelationId,
  generateBaselineId,
  generateRangeId,
  generateTaskId,
  isValidId,
  extractTimestamp,
  extractPrefix,
  generateShortId,
  generateUUID,
  generateBatchIds,
};
