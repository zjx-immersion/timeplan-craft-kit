/**
 * 矩阵视图V3 - 热力图工具
 * 
 * 根据负载率生成颜色映射
 * 
 * @version 3.0.0
 * @date 2026-02-11
 */

import { MatrixCellV3 } from './types';

/**
 * 负载状态
 */
export type LoadStatus = 'empty' | 'low' | 'normal' | 'high' | 'overload';

/**
 * 热力图配置
 */
export interface HeatmapConfig {
  colors: {
    empty: string;
    low: string;
    normal: string;
    high: string;
    overload: string;
  };
  thresholds: {
    low: number;      // < low: 低负载
    normal: number;   // low ~ normal: 正常负载
    high: number;     // normal ~ high: 高负载
    overload: number; // >= overload: 超载
  };
}

/**
 * 默认热力图配置
 */
export const DEFAULT_HEATMAP_CONFIG: HeatmapConfig = {
  colors: {
    empty: '#f3f4f6',      // 灰色 - 空白
    low: '#dbeafe',        // 浅蓝 - 低负载
    normal: '#86efac',     // 浅绿 - 正常
    high: '#fde047',       // 黄色 - 高负载
    overload: '#fca5a5',   // 红色 - 超载
  },
  thresholds: {
    low: 0.3,
    normal: 0.6,
    high: 0.85,
    overload: 1.0,
  },
};

/**
 * 获取负载状态
 */
export function getLoadStatus(loadRate: number, config: HeatmapConfig = DEFAULT_HEATMAP_CONFIG): LoadStatus {
  if (loadRate === 0) return 'empty';
  if (loadRate < config.thresholds.low) return 'low';
  if (loadRate < config.thresholds.normal) return 'normal';
  if (loadRate < config.thresholds.high) return 'high';
  return 'overload';
}

/**
 * 获取热力图颜色
 */
export function getHeatmapColor(
  cell: MatrixCellV3, 
  config: HeatmapConfig = DEFAULT_HEATMAP_CONFIG
): string {
  const status = getLoadStatus(cell.loadRate, config);
  return config.colors[status];
}

/**
 * 获取文本颜色（根据背景色自动选择）
 */
export function getTextColor(backgroundColor: string): string {
  // 简单的亮度判断
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  return brightness > 128 ? '#1f2937' : '#ffffff';
}

/**
 * 生成热力图图例数据
 */
export function generateHeatmapLegend(config: HeatmapConfig = DEFAULT_HEATMAP_CONFIG) {
  return [
    { label: '空白', color: config.colors.empty, range: '0%' },
    { label: '低负载', color: config.colors.low, range: `< ${config.thresholds.low * 100}%` },
    { label: '正常', color: config.colors.normal, range: `${config.thresholds.low * 100}% - ${config.thresholds.normal * 100}%` },
    { label: '高负载', color: config.colors.high, range: `${config.thresholds.normal * 100}% - ${config.thresholds.high * 100}%` },
    { label: '超载', color: config.colors.overload, range: `≥ ${config.thresholds.overload * 100}%` },
  ];
}
