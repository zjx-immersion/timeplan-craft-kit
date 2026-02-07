/**
 * dateUtils 测试
 */

import { describe, it, expect } from 'vitest';
import {
  getScaleUnit,
  getPixelsPerDay,
  normalizeViewStartDate,
  normalizeViewEndDate,
  getPositionFromDate,
  getDateFromPosition,
  getBarWidthPrecise,
  snapToGrid,
  formatDateHeader,
} from '../dateUtils';

describe('dateUtils', () => {
  describe('getScaleUnit', () => {
    it('应该返回正确的刻度单位', () => {
      expect(getScaleUnit('day')).toBe(40);
      expect(getScaleUnit('week')).toBe(280);
      expect(getScaleUnit('biweekly')).toBe(560);
      expect(getScaleUnit('month')).toBe(1200);
      expect(getScaleUnit('quarter')).toBe(3640);
    });
  });

  describe('getPixelsPerDay', () => {
    it('应该返回正确的每天像素数', () => {
      expect(getPixelsPerDay('day')).toBe(40);
      expect(getPixelsPerDay('week')).toBe(40);
      expect(getPixelsPerDay('month')).toBe(5);
      expect(getPixelsPerDay('quarter')).toBe(2.2);
    });
  });

  describe('normalizeViewStartDate', () => {
    it('应该正确规范化日期到刻度开始', () => {
      const date = new Date('2024-01-15'); // 周一
      
      const dayNormalized = normalizeViewStartDate(date, 'day');
      expect(dayNormalized.getHours()).toBe(0);
      
      const weekNormalized = normalizeViewStartDate(date, 'week');
      expect(weekNormalized.getDay()).toBe(1); // 周一
      
      const monthNormalized = normalizeViewStartDate(date, 'month');
      expect(monthNormalized.getDate()).toBe(1);
    });
  });

  describe('getPositionFromDate', () => {
    it('应该正确计算位置', () => {
      const startDate = new Date('2024-01-01');
      const targetDate = new Date('2024-01-11'); // 10天后
      
      const position = getPositionFromDate(targetDate, startDate, 'day');
      expect(position).toBe(400); // 10天 * 40px
    });

    it('应该在月视图中正确计算位置', () => {
      const startDate = new Date('2024-01-01');
      const targetDate = new Date('2024-01-11'); // 10天后
      
      const position = getPositionFromDate(targetDate, startDate, 'month');
      expect(position).toBe(50); // 10天 * 5px
    });
  });

  describe('getDateFromPosition', () => {
    it('应该正确从位置计算日期', () => {
      const startDate = new Date('2024-01-01');
      const position = 400; // 10天 * 40px
      
      const date = getDateFromPosition(position, startDate, 'day');
      expect(date.getDate()).toBe(11);
    });

    it('应该使用 floor 而不是 round', () => {
      const startDate = new Date('2024-01-01');
      const position = 159; // 在第3天的范围内（120-159）
      
      const date = getDateFromPosition(position, startDate, 'day');
      expect(date.getDate()).toBe(4); // 应该是第4天（0-based：3天）
    });
  });

  describe('getBarWidthPrecise', () => {
    it('应该正确计算条形宽度', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-05'); // 5天
      
      const width = getBarWidthPrecise(startDate, endDate, 'day');
      expect(width).toBe(200); // 5天 * 40px
    });

    it('应该有最小宽度', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-01'); // 同一天
      
      const width = getBarWidthPrecise(startDate, endDate, 'day');
      expect(width).toBe(40); // 最小一天
    });
  });

  describe('snapToGrid', () => {
    it('应该对齐到天的开始', () => {
      const date = new Date('2024-01-15 15:30:00');
      
      const snapped = snapToGrid(date, 'day');
      expect(snapped.getHours()).toBe(0);
      expect(snapped.getMinutes()).toBe(0);
      expect(snapped.getSeconds()).toBe(0);
    });
  });

  describe('formatDateHeader', () => {
    it('应该正确格式化日期表头', () => {
      const date = new Date('2024-01-15');
      
      expect(formatDateHeader(date, 'day')).toContain('1');
      expect(formatDateHeader(date, 'month')).toContain('2024');
      expect(formatDateHeader(date, 'month')).toContain('1');
    });
  });
});
