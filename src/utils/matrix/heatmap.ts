/**
 * 热力图工具
 * 
 * 根据负载率生成热力图颜色
 * 
 * @module utils/matrix/heatmap
 */

import type { LoadStatus } from '@/types/matrix';

/**
 * 热力图颜色配置
 */
export const HEATMAP_COLORS = {
  idle: '#1890ff',      // 蓝色 - 空闲
  normal: '#52c41a',    // 绿色 - 正常
  warning: '#faad14',   // 黄色 - 警告
  overload: '#ff4d4f',  // 红色 - 过载
  empty: '#f0f0f0',     // 灰色 - 无数据
};

/**
 * 根据负载状态获取颜色
 */
export function getColorByStatus(status: LoadStatus): string {
  return HEATMAP_COLORS[status];
}

/**
 * 根据负载率获取颜色（渐变）
 */
export function getColorByLoadRate(loadRate: number): string {
  if (loadRate === 0) return HEATMAP_COLORS.empty;
  if (loadRate > 100) return HEATMAP_COLORS.overload;
  if (loadRate >= 80) return HEATMAP_COLORS.warning;
  if (loadRate >= 50) return HEATMAP_COLORS.normal;
  return HEATMAP_COLORS.idle;
}

/**
 * 获取背景色（带透明度）
 */
export function getBackgroundColor(loadRate: number, alpha = 0.15): string {
  const color = getColorByLoadRate(loadRate);
  
  // 转换为rgba
  const hex = color.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * 获取边框颜色
 */
export function getBorderColor(loadRate: number): string {
  const color = getColorByLoadRate(loadRate);
  return color;
}

/**
 * 热力图图例数据
 */
export const HEATMAP_LEGEND = [
  { status: 'idle' as LoadStatus, label: '空闲 (<30%)', color: HEATMAP_COLORS.idle },
  { status: 'normal' as LoadStatus, label: '正常 (30%-80%)', color: HEATMAP_COLORS.normal },
  { status: 'warning' as LoadStatus, label: '警告 (80%-100%)', color: HEATMAP_COLORS.warning },
  { status: 'overload' as LoadStatus, label: '过载 (>100%)', color: HEATMAP_COLORS.overload },
];
