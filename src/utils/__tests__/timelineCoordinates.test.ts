/**
 * timelineCoordinates.test.ts - 统一坐标系统单元测试
 * 
 * 目的：验证日期计算和位置计算的准确性
 * 
 * @date 2026-02-09
 */

import {
  getPixelsPerDay,
  createLocalDate,
  getDaysDifference,
  generateMonthsArray,
  getPositionFromLocalDate,
  getRangeWidth,
} from '../timelineCoordinates';

describe('timelineCoordinates - 统一坐标系统', () => {
  describe('getPixelsPerDay', () => {
    it('应返回正确的像素数', () => {
      expect(getPixelsPerDay('day')).toBe(40);
      expect(getPixelsPerDay('week')).toBe(40);
      expect(getPixelsPerDay('biweekly')).toBe(40);
      expect(getPixelsPerDay('month')).toBe(5);
      expect(getPixelsPerDay('quarter')).toBe(2.2);
    });
  });

  describe('createLocalDate', () => {
    it('应创建本地时间日期', () => {
      const date = createLocalDate(2024, 0, 1); // 2024-01-01
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(0); // 0-11
      expect(date.getDate()).toBe(1);
    });
  });

  describe('getDaysDifference', () => {
    it('应正确计算两个日期之间的天数差', () => {
      const start = new Date(2024, 0, 1); // 2024-01-01
      const end = new Date(2024, 0, 31); // 2024-01-31
      expect(getDaysDifference(start, end)).toBe(30); // 1-31日共31天，差30天
    });

    it('应正确处理跨月的日期差', () => {
      const start = new Date(2024, 0, 1); // 2024-01-01
      const end = new Date(2024, 1, 1); // 2024-02-01
      expect(getDaysDifference(start, end)).toBe(31); // 1月有31天
    });

    it('应正确处理跨年的日期差', () => {
      const start = new Date(2024, 0, 1); // 2024-01-01
      const end = new Date(2025, 0, 1); // 2025-01-01
      expect(getDaysDifference(start, end)).toBe(366); // 2024年是闰年
    });
  });

  describe('generateMonthsArray', () => {
    it('应生成2024年1-12月的数组', () => {
      const months = generateMonthsArray(2024, 0, 2024, 11);
      expect(months).toHaveLength(12);
      expect(months[0]).toEqual({
        year: 2024,
        month: 0,
        daysInMonth: 31,
        startDayIndex: 0,
      });
      expect(months[1]).toEqual({
        year: 2024,
        month: 1,
        daysInMonth: 29, // 2024是闰年
        startDayIndex: 31,
      });
      expect(months[11]).toEqual({
        year: 2024,
        month: 11,
        daysInMonth: 31,
        startDayIndex: 366 - 31, // 2024年共366天，12月从335天开始
      });
    });

    it('应正确处理跨年的月份数组', () => {
      const months = generateMonthsArray(2023, 11, 2024, 1); // 2023年12月到2024年2月
      expect(months).toHaveLength(3);
      expect(months[0].year).toBe(2023);
      expect(months[0].month).toBe(11); // 12月
      expect(months[1].year).toBe(2024);
      expect(months[1].month).toBe(0); // 1月
      expect(months[2].year).toBe(2024);
      expect(months[2].month).toBe(1); // 2月
    });
  });

  describe('getPositionFromLocalDate', () => {
    it('应正确计算2024-01-01相对于2024-01-01的位置（应为0）', () => {
      const pos = getPositionFromLocalDate(2024, 0, 1, 2024, 0, 1, 'month');
      expect(pos).toBe(0);
    });

    it('应正确计算2024-02-01相对于2024-01-01的位置', () => {
      const pos = getPositionFromLocalDate(2024, 1, 1, 2024, 0, 1, 'month');
      expect(pos).toBe(31 * 5); // 1月有31天，每天5px
    });

    it('应正确计算2024-03-01相对于2024-01-01的位置', () => {
      const pos = getPositionFromLocalDate(2024, 2, 1, 2024, 0, 1, 'month');
      expect(pos).toBe((31 + 29) * 5); // 1月31天 + 2月29天（闰年），每天5px
    });
  });

  describe('getRangeWidth', () => {
    it('应正确计算2024-01-01到2024-01-31的宽度（31天）', () => {
      const width = getRangeWidth(2024, 0, 1, 2024, 0, 31, 'month');
      expect(width).toBe(31 * 5); // 31天，每天5px
    });

    it('应正确计算2024-01-01到2024-02-29的宽度（60天）', () => {
      const width = getRangeWidth(2024, 0, 1, 2024, 1, 29, 'month');
      expect(width).toBe((31 + 29) * 5); // 1月31天 + 2月29天（闰年），每天5px
    });
  });

  describe('综合测试 - 验证3月应该显示在正确位置', () => {
    it('2024-03-01应该在1月31天+2月29天=60天后的位置', () => {
      const pos = getPositionFromLocalDate(2024, 2, 1, 2024, 0, 1, 'month');
      const expectedPos = 60 * 5; // 300px
      expect(pos).toBe(expectedPos);
    });

    it('2024-03月的宽度应该是31天', () => {
      const width = getRangeWidth(2024, 2, 1, 2024, 2, 31, 'month');
      const expectedWidth = 31 * 5; // 155px
      expect(width).toBe(expectedWidth);
    });
  });
});
