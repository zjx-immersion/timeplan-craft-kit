/**
 * 基准线管理器
 * 
 * 功能:
 * - 创建基准线快照
 * - 对比当前进度与基准
 * - 管理多个基准线
 * 
 * @version 1.0.0
 * @date 2026-02-03
 */

import type { TimePlan, Baseline } from '@/types/timeplanSchema';
import { v4 as uuidv4 } from 'uuid';

/**
 * 基准线差异
 */
export interface BaselineDiff {
  lineId: string;
  field: 'startDate' | 'endDate' | 'progress';
  baselineValue: any;
  currentValue: any;
  diff: number; // 天数差异或百分比差异
}

/**
 * 创建基准线
 */
export function createBaseline(
  plan: TimePlan,
  name: string,
  description?: string
): Baseline {
  return {
    id: uuidv4(),
    name,
    description,
    createdAt: new Date().toISOString(),
    snapshot: JSON.parse(JSON.stringify(plan)), // 深拷贝
  };
}

/**
 * 对比基准线
 */
export function compareWithBaseline(
  current: TimePlan,
  baseline: Baseline
): BaselineDiff[] {
  const diffs: BaselineDiff[] = [];
  const baselineSnapshot = baseline.snapshot;
  
  // 创建 Line 映射
  const currentLines = new Map();
  const baselineLines = new Map();
  
  current.timelines?.forEach(timeline => {
    timeline.lines?.forEach(line => {
      currentLines.set(line.id, line);
    });
  });
  
  baselineSnapshot.timelines?.forEach(timeline => {
    timeline.lines?.forEach(line => {
      baselineLines.set(line.id, line);
    });
  });
  
  // 比较每个 Line
  currentLines.forEach((currentLine, id) => {
    const baselineLine = baselineLines.get(id);
    if (!baselineLine) return;
    
    // 比较开始日期
    if (currentLine.startDate !== baselineLine.startDate) {
      const currentDate = new Date(currentLine.startDate);
      const baselineDate = new Date(baselineLine.startDate);
      const diffDays = Math.floor(
        (currentDate.getTime() - baselineDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      diffs.push({
        lineId: id,
        field: 'startDate',
        baselineValue: baselineLine.startDate,
        currentValue: currentLine.startDate,
        diff: diffDays,
      });
    }
    
    // 比较结束日期
    if (currentLine.endDate !== baselineLine.endDate) {
      const currentDate = new Date(currentLine.endDate);
      const baselineDate = new Date(baselineLine.endDate);
      const diffDays = Math.floor(
        (currentDate.getTime() - baselineDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      diffs.push({
        lineId: id,
        field: 'endDate',
        baselineValue: baselineLine.endDate,
        currentValue: currentLine.endDate,
        diff: diffDays,
      });
    }
    
    // 比较进度
    if ((currentLine.progress || 0) !== (baselineLine.progress || 0)) {
      diffs.push({
        lineId: id,
        field: 'progress',
        baselineValue: baselineLine.progress || 0,
        currentValue: currentLine.progress || 0,
        diff: (currentLine.progress || 0) - (baselineLine.progress || 0),
      });
    }
  });
  
  return diffs;
}

/**
 * 获取基准线摘要
 */
export function getBaselineSummary(baseline: Baseline) {
  const snapshot = baseline.snapshot;
  let totalLines = 0;
  let totalProgress = 0;
  
  snapshot.timelines?.forEach(timeline => {
    totalLines += timeline.lines?.length || 0;
    timeline.lines?.forEach(line => {
      totalProgress += line.progress || 0;
    });
  });
  
  return {
    name: baseline.name,
    createdAt: baseline.createdAt,
    totalLines,
    averageProgress: totalLines > 0 ? totalProgress / totalLines : 0,
  };
}

/**
 * 格式化差异
 */
export function formatDiff(diff: BaselineDiff): string {
  if (diff.field === 'progress') {
    return `${diff.diff > 0 ? '+' : ''}${diff.diff}%`;
  }
  
  return `${diff.diff > 0 ? '+' : ''}${diff.diff} 天`;
}

/**
 * 基准线存储键
 */
const BASELINES_STORAGE_KEY = 'timeplan-baselines';

/**
 * 保存基准线到 LocalStorage
 */
export function saveBaselines(planId: string, baselines: Baseline[]): void {
  const storage = localStorage.getItem(BASELINES_STORAGE_KEY);
  const allBaselines = storage ? JSON.parse(storage) : {};
  allBaselines[planId] = baselines;
  localStorage.setItem(BASELINES_STORAGE_KEY, JSON.stringify(allBaselines));
}

/**
 * 从 LocalStorage 加载基准线
 */
export function loadBaselines(planId: string): Baseline[] {
  const storage = localStorage.getItem(BASELINES_STORAGE_KEY);
  if (!storage) return [];
  
  const allBaselines = JSON.parse(storage);
  return allBaselines[planId] || [];
}
