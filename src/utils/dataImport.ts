/**
 * 数据导入工具
 * 
 * 支持从 JSON 格式导入数据
 * 
 * @version 1.0.0
 * @date 2026-02-03
 */

import { TimePlan } from '@/types/timeplanSchema';

/**
 * 验证导入的数据是否符合 TimePlan 结构
 */
function validateTimePlan(data: unknown): data is TimePlan {
  try {
    // 基本结构检查
    if (typeof data !== 'object' || data === null) {
      return false;
    }

    const plan = data as any;

    // 必需字段检查
    if (!plan.id || typeof plan.id !== 'string') return false;
    if (!plan.title || typeof plan.title !== 'string') return false;
    if (!Array.isArray(plan.timelines)) return false;
    if (!Array.isArray(plan.lines)) return false;
    if (!Array.isArray(plan.relations)) return false;

    // 日期字段转换
    if (plan.createdAt && typeof plan.createdAt === 'string') {
      plan.createdAt = new Date(plan.createdAt);
    }
    if (plan.lastAccessTime && typeof plan.lastAccessTime === 'string') {
      plan.lastAccessTime = new Date(plan.lastAccessTime);
    }

    // 转换 lines 中的日期
    plan.lines.forEach((line: any) => {
      if (line.startDate && typeof line.startDate === 'string') {
        line.startDate = new Date(line.startDate);
      }
      if (line.endDate && typeof line.endDate === 'string') {
        line.endDate = new Date(line.endDate);
      }
      if (line.createdAt && typeof line.createdAt === 'string') {
        line.createdAt = new Date(line.createdAt);
      }
      if (line.updatedAt && typeof line.updatedAt === 'string') {
        line.updatedAt = new Date(line.updatedAt);
      }
    });

    // 转换 baselines 中的日期
    if (plan.baselines && Array.isArray(plan.baselines)) {
      plan.baselines.forEach((baseline: any) => {
        if (baseline.date && typeof baseline.date === 'string') {
          baseline.date = new Date(baseline.date);
        }
      });
    }

    // 转换 baselineRanges 中的日期
    if (plan.baselineRanges && Array.isArray(plan.baselineRanges)) {
      plan.baselineRanges.forEach((range: any) => {
        if (range.startDate && typeof range.startDate === 'string') {
          range.startDate = new Date(range.startDate);
        }
        if (range.endDate && typeof range.endDate === 'string') {
          range.endDate = new Date(range.endDate);
        }
      });
    }

    return true;
  } catch (error) {
    console.error('[dataImport] 验证失败:', error);
    return false;
  }
}

/**
 * 从 JSON 字符串导入计划
 */
export function importFromJSON(jsonString: string): TimePlan | null {
  try {
    const data = JSON.parse(jsonString);
    
    if (validateTimePlan(data)) {
      console.log('[dataImport] ✅ JSON 数据验证通过');
      return data as TimePlan;
    } else {
      console.error('[dataImport] ❌ JSON 数据验证失败：不符合 TimePlan 结构');
      return null;
    }
  } catch (error) {
    console.error('[dataImport] ❌ JSON 解析失败:', error);
    return null;
  }
}

/**
 * 从文件导入计划
 */
export function importFromFile(file: File): Promise<TimePlan | null> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const plan = importFromJSON(content);
        resolve(plan);
      } catch (error) {
        console.error('[dataImport] ❌ 文件读取失败:', error);
        reject(error);
      }
    };

    reader.onerror = () => {
      console.error('[dataImport] ❌ 文件读取错误');
      reject(new Error('文件读取失败'));
    };

    reader.readAsText(file);
  });
}

/**
 * 从 JSON 字符串导入多个计划
 */
export function importMultiplePlansFromJSON(jsonString: string): TimePlan[] | null {
  try {
    const data = JSON.parse(jsonString);
    
    if (Array.isArray(data)) {
      const validPlans = data.filter(validateTimePlan);
      
      if (validPlans.length === data.length) {
        console.log(`[dataImport] ✅ 所有计划验证通过（${validPlans.length} 个）`);
        return validPlans as TimePlan[];
      } else {
        console.warn(`[dataImport] ⚠️ 部分计划验证失败：${validPlans.length}/${data.length}`);
        return validPlans as TimePlan[];
      }
    } else if (validateTimePlan(data)) {
      // 单个计划
      return [data as TimePlan];
    } else {
      console.error('[dataImport] ❌ 数据格式错误：既不是数组也不是单个计划');
      return null;
    }
  } catch (error) {
    console.error('[dataImport] ❌ JSON 解析失败:', error);
    return null;
  }
}

/**
 * 合并计划（解决 ID 冲突）
 */
export function mergePlans(existingPlans: TimePlan[], newPlans: TimePlan[]): TimePlan[] {
  const merged = [...existingPlans];
  
  newPlans.forEach((newPlan) => {
    const existingIndex = merged.findIndex(p => p.id === newPlan.id);
    
    if (existingIndex >= 0) {
      // ID 冲突，生成新 ID
      const newId = `${newPlan.id}-imported-${Date.now()}`;
      console.log(`[dataImport] ⚠️ ID 冲突，重命名：${newPlan.id} → ${newId}`);
      merged.push({
        ...newPlan,
        id: newId,
        title: `${newPlan.title} (导入)`,
      });
    } else {
      // 无冲突，直接添加
      merged.push(newPlan);
    }
  });
  
  return merged;
}

/**
 * 验证并修复数据
 */
export function validateAndFixPlan(plan: TimePlan): TimePlan {
  // 确保所有必需字段存在
  const fixed: TimePlan = {
    ...plan,
    timelines: plan.timelines || [],
    lines: plan.lines || [],
    relations: plan.relations || [],
    baselines: plan.baselines || [],
    baselineRanges: plan.baselineRanges || [],
    schemaId: plan.schemaId || 'default-schema',
    createdAt: plan.createdAt || new Date(),
    lastAccessTime: plan.lastAccessTime || new Date(),
  };

  // 修复顶层日期字段
  if (fixed.createdAt && !(fixed.createdAt instanceof Date)) {
    fixed.createdAt = new Date(fixed.createdAt);
  }
  if (fixed.lastAccessTime && !(fixed.lastAccessTime instanceof Date)) {
    fixed.lastAccessTime = new Date(fixed.lastAccessTime);
  }

  // 修复 lines 中的日期
  fixed.lines = fixed.lines.map(line => ({
    ...line,
    startDate: line.startDate instanceof Date ? line.startDate : new Date(line.startDate),
    endDate: line.endDate ? (line.endDate instanceof Date ? line.endDate : new Date(line.endDate)) : undefined,
    createdAt: line.createdAt ? (line.createdAt instanceof Date ? line.createdAt : new Date(line.createdAt)) : undefined,
    updatedAt: line.updatedAt ? (line.updatedAt instanceof Date ? line.updatedAt : new Date(line.updatedAt)) : undefined,
  }));

  // 修复 baselines 中的日期
  if (fixed.baselines) {
    fixed.baselines = fixed.baselines.map(baseline => ({
      ...baseline,
      date: baseline.date instanceof Date ? baseline.date : new Date(baseline.date),
    }));
  }

  // 修复 baselineRanges 中的日期
  if (fixed.baselineRanges) {
    fixed.baselineRanges = fixed.baselineRanges.map(range => ({
      ...range,
      startDate: range.startDate instanceof Date ? range.startDate : new Date(range.startDate),
      endDate: range.endDate instanceof Date ? range.endDate : new Date(range.endDate),
    }));
  }

  // 修复 viewConfig 中的日期（如果存在）
  if (fixed.viewConfig) {
    fixed.viewConfig = {
      ...fixed.viewConfig,
      startDate: fixed.viewConfig.startDate instanceof Date ? fixed.viewConfig.startDate : new Date(fixed.viewConfig.startDate),
      endDate: fixed.viewConfig.endDate instanceof Date ? fixed.viewConfig.endDate : new Date(fixed.viewConfig.endDate),
    };
  }

  return fixed;
}
