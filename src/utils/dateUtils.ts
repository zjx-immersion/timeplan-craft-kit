/**
 * dateUtils - 日期计算工具函数
 * 
 * 📋 迁移信息:
 * - 原文件: src/utils/dateUtils.ts
 * - 迁移日期: 2026-02-03
 * - 对比状态: ⬜ 待验证
 * 
 * 🎯 功能要求:
 * - 1:1 还原所有日期计算功能
 * - 保持时间线定位算法一致
 * - 支持多种时间刻度
 * 
 * 🔄 技术替换:
 * - 保持 date-fns 库不变
 * - 类型定义可能需要调整
 */

import {
  format,
  addDays,
  addWeeks,
  addMonths,
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
  differenceInCalendarDays,
  differenceInCalendarWeeks,
  differenceInCalendarMonths,
  startOfDay,
  startOfWeek,
  startOfMonth,
  startOfQuarter,
  startOfYear,
  endOfMonth,
  endOfQuarter,
  endOfYear,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  eachQuarterOfInterval,
  isToday,
  isSameDay,
  getDaysInMonth,
} from 'date-fns';
import { zhCN } from 'date-fns/locale';

/**
 * 时间刻度类型
 */
export type TimeScale = 'day' | 'week' | 'biweekly' | 'month' | 'quarter';

/**
 * 基础单位：每天的像素数 - 这是坐标系统的基础
 * 所有刻度都从此派生以确保完美对齐
 */
const PIXELS_PER_DAY = 40;

/**
 * 获取刻度单位宽度
 * 用于显示目的（表头列宽度）
 */
export const getScaleUnit = (scale: TimeScale): number => {
  switch (scale) {
    case 'day':
      return PIXELS_PER_DAY; // 1 天 = 40px
    case 'week':
      return PIXELS_PER_DAY * 7; // 1 周 = 280px
    case 'biweekly':
      return PIXELS_PER_DAY * 14; // 2 周 = 560px
    case 'month':
      return PIXELS_PER_DAY * 30; // 名义月份 = 1200px（实际会变化）
    case 'quarter':
      return PIXELS_PER_DAY * 91; // 名义季度 = 3640px
    default:
      return PIXELS_PER_DAY * 7;
  }
};

/**
 * 获取每天的像素数 - 用于元素定位
 * 不同刻度下的缩放因子
 */
export const getPixelsPerDay = (scale: TimeScale): number => {
  switch (scale) {
    case 'day':
      return 40;
    case 'week':
      return 40; // 与日视图相同 - 周视图只是分组列
    case 'biweekly':
      return 40; // 与日视图相同
    case 'month':
      return 5; // 压缩：每天 5px
    case 'quarter':
      return 2.2; // 进一步压缩
    default:
      return 40;
  }
};

/**
 * 将视图起始日期规范化到当前刻度周期的开始
 * 确保表头列和元素位置使用相同的基准点
 * 
 * ⚠️ 重要：在将 viewStartDate 传递给表头渲染和元素定位函数之前
 * 必须使用此函数进行规范化
 */
export const normalizeViewStartDate = (date: Date, scale: TimeScale): Date => {
  switch (scale) {
    case 'day':
      return startOfDay(date);
    case 'week':
    case 'biweekly':
      return startOfWeek(date, { weekStartsOn: 1 });
    case 'month':
      // ✅ V7修复：月视图规范化到月初（参考原项目）
      // 确保时间刻度和节点位置使用相同基准
      return startOfMonth(date);
    case 'quarter':
      return startOfQuarter(date);
    default:
      return startOfMonth(date);
  }
};

/**
 * 将视图结束日期规范化到当前刻度周期的结束
 */
export const normalizeViewEndDate = (date: Date, scale: TimeScale): Date => {
  switch (scale) {
    case 'day':
      return startOfDay(date);
    case 'week':
    case 'biweekly':
      // 结束于包含该日期的周的结束
      return addDays(startOfWeek(date, { weekStartsOn: 1 }), 6);
    case 'month':
      // ✅ V7修复：月视图规范化到月末（参考原项目）
      return endOfMonth(date);
    case 'quarter':
      return endOfQuarter(date);
    default:
      return endOfMonth(date);
  }
};

/**
 * 获取表头单位数量 - 用于宽度计算
 */
export const getHeaderCount = (
  startDate: Date,
  endDate: Date,
  scale: TimeScale
): number => {
  switch (scale) {
    case 'day':
      return eachDayOfInterval({ start: startDate, end: endDate }).length;
    case 'week':
      return eachWeekOfInterval(
        { start: startDate, end: endDate },
        { weekStartsOn: 1 }
      ).length;
    case 'biweekly': {
      // 计算双周周期
      const days = differenceInDays(endDate, startDate);
      return Math.ceil(days / 14);
    }
    case 'month':
      return eachMonthOfInterval({ start: startDate, end: endDate }).length;
    case 'quarter':
      return eachQuarterOfInterval({ start: startDate, end: endDate }).length;
    default:
      return eachMonthOfInterval({ start: startDate, end: endDate }).length;
  }
};

/**
 * 获取日期表头数组
 */
export const getDateHeaders = (
  startDate: Date,
  endDate: Date,
  scale: TimeScale
): Date[] => {
  switch (scale) {
    case 'day':
      return eachDayOfInterval({ start: startDate, end: endDate });
    case 'week':
      return eachWeekOfInterval(
        { start: startDate, end: endDate },
        { weekStartsOn: 1 }
      );
    case 'biweekly': {
      // 生成双周日期
      const result: Date[] = [];
      let current = startOfWeek(startDate, { weekStartsOn: 1 });
      while (current <= endDate) {
        result.push(current);
        current = addDays(current, 14);
      }
      return result;
    }
    case 'month':
      return eachMonthOfInterval({ start: startDate, end: endDate });
    case 'quarter':
      return eachQuarterOfInterval({ start: startDate, end: endDate });
    default:
      return eachMonthOfInterval({ start: startDate, end: endDate });
  }
};

/**
 * 格式化日期表头文本
 * 根据原项目截图实现不同刻度的日期显示
 */
export const formatDateHeader = (date: Date, scale: TimeScale): string => {
  switch (scale) {
    case 'day':
      // 日视图：显示日期数字（1-31）
      return format(date, 'd', { locale: zhCN });

    case 'week': {
      // 周视图：显示周范围（如 12-18, 19-25）
      const weekEnd = addDays(date, 6);
      const startDay = format(date, 'd');
      const endDay = format(weekEnd, 'd');
      return `${startDay}-${endDay}`;
    }

    case 'biweekly': {
      // 双周视图：显示双周范围（如 1/12-25）
      const biweekEnd = addDays(date, 13);
      const startDate = format(date, 'M/d');
      const endDay = format(biweekEnd, 'd');
      return `${startDate}-${endDay}`;
    }

    case 'month':
      // ✅ 月视图：只显示月份（1月、2月...）
      return format(date, 'M月', { locale: zhCN });

    case 'quarter': {
      // 季度视图：显示季度（Q1, Q2）
      const quarter = Math.ceil((date.getMonth() + 1) / 3);
      return `Q${quarter}`;
    }

    default:
      return format(date, 'yyyy年M月', { locale: zhCN });
  }
};

/**
 * 统一的位置计算
 * 
 * 所有位置都基于精确的日历天数差异计算
 * 确保表头列和元素之间完美对齐
 */
export const getPositionFromDate = (
  date: Date,
  viewStartDate: Date,
  scale: TimeScale
): number => {
  const pixelsPerDay = getPixelsPerDay(scale);

  // 使用日历天数差异进行精确对齐
  // startOfDay 确保我们在日边界进行比较
  const normalizedDate = startOfDay(date);
  const normalizedStart = startOfDay(viewStartDate);
  const diffDays = differenceInCalendarDays(normalizedDate, normalizedStart);

  return diffDays * pixelsPerDay;
};

/**
 * 高精度位置计算 - 允许分数天数
 * 用于拖拽和调整大小的平滑视觉反馈
 */
export const getPositionFromDatePrecise = (
  date: Date,
  viewStartDate: Date,
  scale: TimeScale
): number => {
  const pixelsPerDay = getPixelsPerDay(scale);
  const diffMs = date.getTime() - viewStartDate.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays * pixelsPerDay;
};

/**
 * 统一的日期计算（从位置）
 * 
 * getPositionFromDate 的逆运算 - 将像素位置转换回日期
 * 
 * ⚠️ 重要：使用 Math.floor() 而不是 Math.round()，以确保点击
 * 某天像素范围内的任何位置都返回该天（而不是下一天）
 * 这对于基线绘制和节点定位精度至关重要
 */
export const getDateFromPosition = (
  position: number,
  viewStartDate: Date,
  scale: TimeScale
): Date => {
  const pixelsPerDay = getPixelsPerDay(scale);
  const daysOffset = position / pixelsPerDay;
  const normalizedStart = startOfDay(viewStartDate);

  // 使用 Math.floor 将像素位置映射到包含它的天
  // 例如：在日视图（40px/天）中，位置 120-159px 都映射到第 3 天
  const resultDate = addDays(normalizedStart, Math.floor(daysOffset));

  return resultDate;
};

/**
 * 根据实际日期跨度计算表头列的像素宽度
 * 确保不同天数的月份（28-31）具有成比例的正确宽度
 */
export const getHeaderColumnWidth = (
  columnDate: Date,
  scale: TimeScale
): number => {
  const pixelsPerDay = getPixelsPerDay(scale);

  switch (scale) {
    case 'day':
      return pixelsPerDay; // 1 天
    case 'week':
      return pixelsPerDay * 7; // 7 天
    case 'biweekly':
      return pixelsPerDay * 14; // 14 天
    case 'month':
      // 使用月份中的实际天数进行精确对齐
      return getDaysInMonth(columnDate) * pixelsPerDay;
    case 'quarter': {
      // 计算季度中的实际天数
      const quarterStart = startOfQuarter(columnDate);
      const nextQuarter = startOfQuarter(addMonths(quarterStart, 3));
      const daysInQuarter = differenceInCalendarDays(
        nextQuarter,
        quarterStart
      );
      return daysInQuarter * pixelsPerDay;
    }
    default:
      return getDaysInMonth(columnDate) * pixelsPerDay;
  }
};

/**
 * 基于实际日历天数计算总时间线宽度
 */
export const getTotalTimelineWidth = (
  startDate: Date,
  endDate: Date,
  scale: TimeScale
): number => {
  const pixelsPerDay = getPixelsPerDay(scale);
  const totalDays = differenceInCalendarDays(endDate, startDate) + 1;
  return totalDays * pixelsPerDay;
};

/**
 * 根据精确的天数计算条形图宽度（像素）
 */
export const getBarWidthPrecise = (
  startDate: Date,
  endDate: Date,
  scale: TimeScale
): number => {
  const pixelsPerDay = getPixelsPerDay(scale);
  const daysDiff =
    differenceInCalendarDays(startOfDay(endDate), startOfDay(startDate)) + 1;
  const width = daysDiff * pixelsPerDay;

  // 最小宽度以确保可见性
  return Math.max(width, pixelsPerDay);
};

/**
 * 真正高精度的宽度计算
 * 用于平滑调整大小的视觉反馈
 */
export const getBarWidthTruePrecise = (
  startDate: Date,
  endDate: Date,
  scale: TimeScale
): number => {
  const pixelsPerDay = getPixelsPerDay(scale);
  const diffMs = endDate.getTime() - startDate.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  // 对于条形图，我们通常认为是包含开始和结束的，所以如果是同一天的 0 点到 24 点应该是 1 天
  // 但对于连续坐标系统，这种处理比较微妙。
  // 在这里我们直接使用天数差异。
  return Math.max(diffDays * pixelsPerDay, pixelsPerDay);
};

/**
 * 传统函数 - 使用 getBarWidthPrecise 以获得更好的精度
 */
export const getBarWidth = (
  startDate: Date,
  endDate: Date,
  scale: TimeScale
): number => {
  return getBarWidthPrecise(startDate, endDate, scale);
};

/**
 * 网格对齐 - 将日期对齐到指定刻度的网格点
 */
export const snapToGrid = (date: Date, scale: TimeScale): Date => {
  const normalized = normalizeViewStartDate(date, scale);
  return normalized;
};

/**
 * 获取适合刻度的对齐（仅用于视觉网格对齐）
 */
export const snapToScaleGrid = (date: Date, scale: TimeScale): Date => {
  switch (scale) {
    case 'day':
      return startOfDay(date);
    case 'week':
      return startOfWeek(date, { weekStartsOn: 1 });
    case 'biweekly':
      return startOfWeek(date, { weekStartsOn: 1 });
    case 'month':
      return startOfMonth(date);
    case 'quarter':
      return startOfQuarter(date);
    default:
      return startOfDay(date);
  }
};

// 导出常用的 date-fns 函数
export { isToday, isSameDay, format, addDays, addWeeks, addMonths };
