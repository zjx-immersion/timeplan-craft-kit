/**
 * timelineCoordinates - 统一的时间轴坐标系统
 * 
 * 核心原则：
 * 1. 所有计算都基于"天"为最小单位
 * 2. 使用本地时间（年、月、日），避免时区转换
 * 3. 统一的坐标计算公式：position = 天数差 × 每天像素数
 * 
 * @version 1.0.0
 * @date 2026-02-09
 */

import { 
  differenceInCalendarDays,
  getDaysInMonth,
  addMonths,
} from 'date-fns';
import { TimeScale } from './dateUtils';

/**
 * 获取每天的像素数（根据视图类型）
 */
export const getPixelsPerDay = (scale: TimeScale): number => {
  switch (scale) {
    case 'day':
      return 40;
    case 'week':
      return 40;
    case 'biweekly':
      return 40;
    case 'month':
      return 5; // 压缩视图
    case 'quarter':
      return 2.2; // 进一步压缩
    default:
      return 40;
  }
};

/**
 * 创建本地日期（避免时区转换）
 */
export const createLocalDate = (year: number, month: number, day: number): Date => {
  return new Date(year, month, day);
};

/**
 * 从 Date 对象提取本地日期（年月日）
 */
export const extractLocalDate = (date: Date): { year: number; month: number; day: number } => {
  return {
    year: date.getFullYear(),
    month: date.getMonth(),
    day: date.getDate(),
  };
};

/**
 * 计算两个日期之间的天数差（基于本地时间）
 */
export const getDaysDifference = (startDate: Date, endDate: Date): number => {
  const start = createLocalDate(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate()
  );
  const end = createLocalDate(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate()
  );
  return differenceInCalendarDays(end, start);
};

/**
 * 生成月份数组（基于本地时间）
 * 返回格式：[{ year, month, daysInMonth }, ...]
 */
export interface MonthInfo {
  year: number;
  month: number; // 0-11
  daysInMonth: number;
  startDayIndex: number; // 从时间轴起点开始的累积天数
}

export const generateMonthsArray = (
  startYear: number,
  startMonth: number,
  endYear: number,
  endMonth: number
): MonthInfo[] => {
  const months: MonthInfo[] = [];
  let currentYear = startYear;
  let currentMonth = startMonth;
  let startDayIndex = 0;

  while (
    currentYear < endYear ||
    (currentYear === endYear && currentMonth <= endMonth)
  ) {
    const date = createLocalDate(currentYear, currentMonth, 1);
    const daysInMonth = getDaysInMonth(date);

    months.push({
      year: currentYear,
      month: currentMonth,
      daysInMonth,
      startDayIndex,
    });

    startDayIndex += daysInMonth;

    // 移动到下一个月
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
  }

  return months;
};

/**
 * 计算日期在时间轴上的位置（像素）
 */
export const getPositionFromLocalDate = (
  year: number,
  month: number,
  day: number,
  baseYear: number,
  baseMonth: number,
  baseDay: number,
  scale: TimeScale
): number => {
  const targetDate = createLocalDate(year, month, day);
  const baseDate = createLocalDate(baseYear, baseMonth, baseDay);
  const daysDiff = getDaysDifference(baseDate, targetDate);
  return daysDiff * getPixelsPerDay(scale);
};

/**
 * 计算时间范围的宽度（像素）
 */
export const getRangeWidth = (
  startYear: number,
  startMonth: number,
  startDay: number,
  endYear: number,
  endMonth: number,
  endDay: number,
  scale: TimeScale
): number => {
  const startDate = createLocalDate(startYear, startMonth, startDay);
  const endDate = createLocalDate(endYear, endMonth, endDay);
  const daysDiff = getDaysDifference(startDate, endDate) + 1; // +1 包含结束日
  return daysDiff * getPixelsPerDay(scale);
};
