/**
 * 时间轴缩放工具
 * 
 * 功能:
 * - 计算缩放后的时间轴参数
 * - 月视图显示 3-6 个月范围
 * - 所有刻度等比例缩放
 * - 缩放范围: 0.5x - 2.0x
 * 
 * @version 1.0.0
 * @date 2026-02-03
 */

import type { TimeScale } from '@/types/timeplanSchema';

/**
 * 时间轴缩放配置
 */
export interface TimeAxisConfig {
  /**
   * 当前刻度
   */
  scale: TimeScale;
  
  /**
   * 缩放级别 (0.5 - 2.0)
   */
  zoom: number;
  
  /**
   * 视口显示月数 (3-6)
   */
  viewportMonths: number;
  
  /**
   * 每天像素数
   */
  pixelsPerDay: number;
  
  /**
   * 每周像素数
   */
  pixelsPerWeek: number;
  
  /**
   * 每月像素数
   */
  pixelsPerMonth: number;
  
  /**
   * 总宽度（像素）
   */
  totalWidth: number;
}

/**
 * 刻度基准配置
 */
interface ScaleBase {
  /**
   * 基准每月像素数
   */
  pixelsPerMonth: number;
  
  /**
   * 基准显示月数
   */
  baseMonths: number;
}

/**
 * 各刻度的基准配置
 * 确保等比例缩放
 */
const SCALE_BASES: Record<TimeScale, ScaleBase> = {
  day: {
    pixelsPerMonth: 600,  // 1 个月 = 600px (20px/天)
    baseMonths: 2,        // 默认显示 2 个月
  },
  week: {
    pixelsPerMonth: 280,  // 1 个月 ≈ 280px (70px/周)
    baseMonths: 4,        // 默认显示 4 个月
  },
  biweekly: {
    pixelsPerMonth: 140,  // 1 个月 ≈ 140px (70px/双周)
    baseMonths: 6,        // 默认显示 6 个月
  },
  month: {
    pixelsPerMonth: 200,  // 1 个月 = 200px
    baseMonths: 6,        // 默认显示 6 个月
  },
  quarter: {
    pixelsPerMonth: 67,   // 1 个月 ≈ 67px (200px/季度)
    baseMonths: 12,       // 默认显示 12 个月
  },
};

/**
 * 计算缩放后的时间轴参数
 * 
 * @param scale - 时间刻度
 * @param zoom - 缩放级别 (0.5 - 2.0)
 * @returns 缩放配置
 */
export function calculateTimeAxisConfig(
  scale: TimeScale,
  zoom: number = 1.0
): TimeAxisConfig {
  // 限制缩放范围
  const clampedZoom = Math.max(0.5, Math.min(2.0, zoom));
  
  // 获取刻度基准
  const base = SCALE_BASES[scale];
  
  // 计算缩放后的每月像素数
  const pixelsPerMonth = base.pixelsPerMonth * clampedZoom;
  
  // 计算视口显示月数（月视图限制为 3-6 个月）
  let viewportMonths: number;
  if (scale === 'month') {
    // 月视图: 根据缩放调整显示月数
    // zoom = 0.5 → 6 个月
    // zoom = 1.0 → 6 个月
    // zoom = 1.5 → 4 个月
    // zoom = 2.0 → 3 个月
    if (clampedZoom <= 1.0) {
      viewportMonths = 6;
    } else if (clampedZoom <= 1.5) {
      viewportMonths = 5;
    } else if (clampedZoom <= 1.75) {
      viewportMonths = 4;
    } else {
      viewportMonths = 3;
    }
  } else {
    // 其他刻度: 保持基准月数
    viewportMonths = base.baseMonths;
  }
  
  // 计算每天、每周像素数
  const pixelsPerDay = pixelsPerMonth / 30;
  const pixelsPerWeek = pixelsPerDay * 7;
  
  // 计算总宽度
  const totalWidth = pixelsPerMonth * viewportMonths;
  
  return {
    scale,
    zoom: clampedZoom,
    viewportMonths,
    pixelsPerDay,
    pixelsPerWeek,
    pixelsPerMonth,
    totalWidth,
  };
}

/**
 * 获取推荐的缩放级别
 * 
 * @param scale - 时间刻度
 * @returns 推荐的缩放级别
 */
export function getRecommendedZoom(scale: TimeScale): number {
  const recommendations: Record<TimeScale, number> = {
    day: 1.5,      // 日视图建议放大
    week: 1.2,     // 周视图建议稍微放大
    biweekly: 1.0, // 双周视图标准
    month: 1.0,    // 月视图标准
    quarter: 0.8,  // 季度视图建议缩小
  };
  
  return recommendations[scale];
}

/**
 * 计算给定宽度下的缩放级别
 * 
 * @param scale - 时间刻度
 * @param targetWidth - 目标宽度（像素）
 * @param months - 显示月数
 * @returns 缩放级别
 */
export function calculateZoomFromWidth(
  scale: TimeScale,
  targetWidth: number,
  months: number = 6
): number {
  const base = SCALE_BASES[scale];
  const requiredPixelsPerMonth = targetWidth / months;
  const zoom = requiredPixelsPerMonth / base.pixelsPerMonth;
  
  return Math.max(0.5, Math.min(2.0, zoom));
}

/**
 * 格式化缩放级别显示
 * 
 * @param zoom - 缩放级别
 * @returns 格式化字符串
 */
export function formatZoom(zoom: number): string {
  return `${(zoom * 100).toFixed(0)}%`;
}

/**
 * 获取缩放步长
 * 
 * @returns 缩放步长
 */
export function getZoomStep(): number {
  return 0.1;
}

/**
 * 获取缩放范围
 * 
 * @returns [最小值, 最大值]
 */
export function getZoomRange(): [number, number] {
  return [0.5, 2.0];
}

/**
 * 缩放预设
 */
export const ZOOM_PRESETS = [
  { label: '50%', value: 0.5 },
  { label: '75%', value: 0.75 },
  { label: '100%', value: 1.0 },
  { label: '125%', value: 1.25 },
  { label: '150%', value: 1.5 },
  { label: '200%', value: 2.0 },
] as const;

/**
 * 计算日期在时间轴上的位置
 * 
 * @param date - 日期
 * @param startDate - 时间轴起始日期
 * @param config - 时间轴配置
 * @returns X 坐标（像素）
 */
export function calculateDatePosition(
  date: Date,
  startDate: Date,
  config: TimeAxisConfig
): number {
  const daysDiff = Math.floor(
    (date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  return daysDiff * config.pixelsPerDay;
}

/**
 * 计算位置对应的日期
 * 
 * @param x - X 坐标（像素）
 * @param startDate - 时间轴起始日期
 * @param config - 时间轴配置
 * @returns 日期
 */
export function calculatePositionDate(
  x: number,
  startDate: Date,
  config: TimeAxisConfig
): Date {
  const days = Math.round(x / config.pixelsPerDay);
  const result = new Date(startDate);
  result.setDate(result.getDate() + days);
  
  return result;
}
