/**
 * 矩阵计算工具
 * 
 * 核心算法：计算Product×Team矩阵数据
 * 
 * @module utils/matrix/calculateMatrix
 */

import type { Line } from '@/types/timeplan';
import type { Product } from '@/types/product';
import type { Team } from '@/types/team';
import type {
  MatrixData,
  CellData,
  DateRange,
  LoadStatus,
  LineExtended,
  ResourceWarning,
  WarningConfig,
} from '@/types/matrix';
import { generateCellKey, DEFAULT_WARNING_CONFIG } from '@/types/matrix';
import { differenceInDays, isWithinInterval } from 'date-fns';

/**
 * 判断任务是否在时间范围内
 */
export function isInTimeRange(line: Line, timeRange: DateRange): boolean {
  const lineStart = new Date(line.startDate);
  const lineEnd = line.endDate ? new Date(line.endDate) : lineStart;
  
  return (
    isWithinInterval(lineStart, { start: timeRange.start, end: timeRange.end }) ||
    isWithinInterval(lineEnd, { start: timeRange.start, end: timeRange.end }) ||
    (lineStart < timeRange.start && lineEnd > timeRange.end)
  );
}

/**
 * 计算工作日数（简化版，不考虑节假日）
 */
export function calculateWorkingDays(timeRange: DateRange): number {
  const days = differenceInDays(timeRange.end, timeRange.start) + 1;
  // 简化：假设70%为工作日
  return Math.ceil(days * 0.7);
}

/**
 * 计算负载率
 */
export function calculateLoadRate(
  effort: number,
  team: Team,
  timeRange: DateRange
): number {
  if (team.capacity <= 0) return 0;
  
  const workingDays = calculateWorkingDays(timeRange);
  const totalCapacity = team.capacity * workingDays;
  
  if (totalCapacity === 0) return 0;
  
  return (effort / totalCapacity) * 100;
}

/**
 * 获取负载状态
 */
export function getLoadStatus(loadRate: number, config = DEFAULT_WARNING_CONFIG): LoadStatus {
  if (loadRate > config.overloadThreshold) return 'overload';
  if (loadRate >= config.warningThreshold) return 'warning';
  if (loadRate < config.idleThreshold) return 'idle';
  return 'normal';
}

/**
 * 计算单元格数据
 */
export function calculateCellData(
  productId: string,
  teamId: string,
  lines: LineExtended[],
  team: Team,
  timeRange: DateRange
): CellData {
  // 筛选属于该Product和Team的任务
  const tasks = lines.filter(
    line =>
      line.productId === productId &&
      line.teamId === teamId &&
      isInTimeRange(line, timeRange)
  );
  
  // 计算总工作量
  const effort = tasks.reduce((sum, task) => sum + (task.effort || 0), 0);
  
  // 按优先级分类
  const byPriority = {
    P0: 0,
    P1: 0,
    P2: 0,
    P3: 0,
  };
  
  tasks.forEach(task => {
    const priority = (task.priority as 'P0' | 'P1' | 'P2' | 'P3') || 'P3';
    byPriority[priority] += task.effort || 0;
  });
  
  // 计算负载率
  const loadRate = calculateLoadRate(effort, team, timeRange);
  const loadStatus = getLoadStatus(loadRate);
  
  return {
    productId,
    teamId,
    effort,
    loadRate,
    loadStatus,
    tasks,
    byPriority,
    taskCount: tasks.length,
  };
}

/**
 * 计算完整矩阵数据
 */
export function calculateMatrixData(
  lines: LineExtended[],
  products: Product[],
  teams: Team[],
  timeRange: DateRange,
  config = DEFAULT_WARNING_CONFIG
): MatrixData {
  const cells = new Map<string, CellData>();
  const productTotals = new Map<string, number>();
  const teamTotals = new Map<string, number>();
  const warnings: ResourceWarning[] = [];
  
  let grandTotal = 0;
  
  // 计算每个单元格的数据
  products.forEach(product => {
    let productTotal = 0;
    
    teams.forEach(team => {
      const cellData = calculateCellData(
        product.id,
        team.id,
        lines,
        team,
        timeRange
      );
      
      const cellKey = generateCellKey(product.id, team.id);
      cells.set(cellKey, cellData);
      
      productTotal += cellData.effort;
      teamTotals.set(team.id, (teamTotals.get(team.id) || 0) + cellData.effort);
      
      // 生成资源预警
      if (cellData.loadStatus === 'overload') {
        warnings.push({
          id: `warning-${cellKey}`,
          type: 'overload',
          productId: product.id,
          teamId: team.id,
          loadRate: cellData.loadRate,
          message: `${product.name} × ${team.name}: 负载率 ${cellData.loadRate.toFixed(1)}% (过载)`,
          severity: 'high',
        });
      } else if (cellData.loadStatus === 'idle' && cellData.tasks.length > 0) {
        warnings.push({
          id: `warning-${cellKey}`,
          type: 'idle',
          productId: product.id,
          teamId: team.id,
          loadRate: cellData.loadRate,
          message: `${product.name} × ${team.name}: 负载率 ${cellData.loadRate.toFixed(1)}% (空闲)`,
          severity: 'low',
        });
      }
    });
    
    productTotals.set(product.id, productTotal);
    grandTotal += productTotal;
  });
  
  return {
    cells,
    productTotals,
    teamTotals,
    grandTotal,
    warnings,
  };
}
