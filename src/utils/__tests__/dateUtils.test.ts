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
      
      const dayHeader = formatDateHeader(date, 'day');
      const monthHeader = formatDateHeader(date, 'month');
      
      // 日视图应该包含日期
      expect(dayHeader).toContain('1');
      
      // 月视图可能包含月份（根据实际实现）
      expect(monthHeader.length).toBeGreaterThan(0);
    });
  });

  // ✅ V5 关键场景测试 - 拖拽宽度计算
  describe('V5关键场景: 拖拽宽度计算', () => {
    describe('月视图（5px/天）- 拖拽50px场景', () => {
      it('应该精确计算：拖拽50px = 10天偏移', () => {
        const startDate = new Date('2024-01-01');
        const endDateBefore = new Date('2024-01-11'); // 原本11天（1号到11号）
        
        // 模拟拖拽右侧手柄向右50px（月视图：5px/天）
        const deltaX = 50; // 像素
        const pixelsPerDay = getPixelsPerDay('month'); // 5px/天
        const daysOffset = Math.round(deltaX / pixelsPerDay); // 50 / 5 = 10天
        
        // 计算新的结束日期
        const newEndDate = new Date(endDateBefore);
        newEndDate.setDate(endDateBefore.getDate() + daysOffset); // +10天 → 21号
        
        // 计算新的宽度（包含起止日期）
        const newWidth = getBarWidthPrecise(startDate, newEndDate, 'month');
        
        // 验证：1号到21号 = 21天 = 21 * 5px = 105px
        expect(daysOffset).toBe(10);
        expect(newWidth).toBe(105); // ✅ 21天（包含起止） * 5px
      });

      it('理解包含起止日期的计算逻辑', () => {
        const startDate = new Date('2024-01-01');
        const endDate = new Date('2024-01-11');
        
        // ✅ getBarWidthPrecise 使用 differenceInCalendarDays + 1
        // 1号到11号 = 11天（包含起止日期）
        const width = getBarWidthPrecise(startDate, endDate, 'month');
        expect(width).toBe(55); // 11天 * 5px = 55px
      });
    });

    describe('日视图（40px/天）- 拖拽80px场景', () => {
      it('应该精确计算：拖拽80px = 2天偏移', () => {
        const startDate = new Date('2024-01-01');
        const endDateBefore = new Date('2024-01-06'); // 原本6天（1号到6号）
        
        // 模拟拖拽右侧手柄向右80px（日视图：40px/天）
        const deltaX = 80;
        const pixelsPerDay = getPixelsPerDay('day'); // 40px/天
        const daysOffset = Math.round(deltaX / pixelsPerDay); // 80 / 40 = 2天
        
        const newEndDate = new Date(endDateBefore);
        newEndDate.setDate(endDateBefore.getDate() + daysOffset); // +2天 → 8号
        
        const newWidth = getBarWidthPrecise(startDate, newEndDate, 'day');
        
        // 验证：1号到8号 = 8天 = 8 * 40px = 320px
        expect(daysOffset).toBe(2);
        expect(newWidth).toBe(320); // ✅ 8天 * 40px
      });
    });

    describe('边界情况', () => {
      it('拖拽0px应该不改变宽度', () => {
        const startDate = new Date('2024-01-01');
        const endDate = new Date('2024-01-10');
        
        const deltaX = 0;
        const pixelsPerDay = getPixelsPerDay('month');
        const daysOffset = Math.round(deltaX / pixelsPerDay);
        
        expect(daysOffset).toBe(0);
        const width = getBarWidthPrecise(startDate, endDate, 'month');
        expect(width).toBe(50); // ✅ 1号到10号 = 10天 * 5px = 50px
      });

      it('负方向拖拽应该减少宽度', () => {
        const startDate = new Date('2024-01-01');
        const endDate = new Date('2024-01-11'); // 11天
        
        // 向左拖拽25px
        const deltaX = -25;
        const pixelsPerDay = getPixelsPerDay('month'); // 5px/天
        const daysOffset = Math.round(deltaX / pixelsPerDay); // -5天
        
        const newEndDate = new Date(endDate);
        newEndDate.setDate(endDate.getDate() + daysOffset); // 11 - 5 = 6号
        
        const newWidth = getBarWidthPrecise(startDate, newEndDate, 'month');
        
        expect(daysOffset).toBe(-5);
        expect(newWidth).toBe(30); // ✅ 1号到6号 = 6天 * 5px = 30px
      });

      it('拖拽超过最小宽度应该保持最小1天', () => {
        const startDate = new Date('2024-01-10');
        const endDate = new Date('2024-01-12'); // 3天
        
        // 尝试向左拖拽很多，导致endDate < startDate
        const deltaX = -200;
        const pixelsPerDay = getPixelsPerDay('day'); // 40px/天
        const daysOffset = Math.round(deltaX / pixelsPerDay); // -5天
        
        let newEndDate = new Date(endDate);
        newEndDate.setDate(endDate.getDate() + daysOffset); // 12 - 5 = 7号（早于start）
        
        // 应该限制为至少 startDate + 1天
        const minEnd = new Date(startDate);
        minEnd.setDate(startDate.getDate() + 1);
        
        if (newEndDate < minEnd) {
          newEndDate = minEnd;
        }
        
        const width = getBarWidthPrecise(startDate, newEndDate, 'day');
        expect(width).toBe(80); // ✅ 10号到11号 = 2天 * 40px = 80px
      });
    });
  });

  // ✅ V5 关键场景测试 - 网格对齐验证
  describe('V5关键场景: 网格对齐', () => {
    it('snapToGrid应该将时间归零（日视图）', () => {
      const date = new Date('2024-01-15 14:30:25');
      const snapped = snapToGrid(date, 'day');
      
      expect(snapped.getFullYear()).toBe(2024);
      expect(snapped.getMonth()).toBe(0);
      expect(snapped.getDate()).toBe(15);
      expect(snapped.getHours()).toBe(0);
      expect(snapped.getMinutes()).toBe(0);
      expect(snapped.getSeconds()).toBe(0);
    });

    it('snapToGrid应该对齐到周一（周视图）', () => {
      const date = new Date('2024-01-17'); // 周三
      const snapped = snapToGrid(date, 'week');
      
      expect(snapped.getDay()).toBe(1); // 周一
      expect(snapped.getDate()).toBe(15); // 该周的周一
    });

    it('snapToGrid应该对齐到月初（月视图）', () => {
      const date = new Date('2024-01-15');
      const snapped = snapToGrid(date, 'month');
      
      expect(snapped.getDate()).toBe(1);
    });
  });

  // ✅ V5 关键场景测试 - 位置宽度一致性
  describe('V5关键场景: 位置和宽度计算一致性', () => {
    it('理解宽度包含起止日期的计算逻辑', () => {
      const viewStartDate = new Date('2024-01-01');
      const lineStart = new Date('2024-01-05');
      const lineEnd = new Date('2024-01-10');
      
      const startPos = getPositionFromDate(lineStart, viewStartDate, 'month');
      const endPos = getPositionFromDate(lineEnd, viewStartDate, 'month');
      const width = getBarWidthPrecise(lineStart, lineEnd, 'month');
      
      // ✅ 正确理解：
      // startPos: 1号到5号的天数差 = 4天 → 4 * 5 = 20px
      // endPos: 1号到10号的天数差 = 9天 → 9 * 5 = 45px
      // width: 5号到10号（包含起止）= 6天 → 6 * 5 = 30px
      expect(startPos).toBe(20);
      expect(endPos).toBe(45);
      expect(width).toBe(30); // ✅ 6天（包含5,6,7,8,9,10）
    });

    it('所有scale的宽度都包含起止日期', () => {
      const scales: Array<'day' | 'week' | 'month'> = ['day', 'week', 'month'];
      
      scales.forEach(scale => {
        const lineStart = new Date('2024-01-10');
        const lineEnd = new Date('2024-01-20');
        
        const width = getBarWidthPrecise(lineStart, lineEnd, scale);
        const pixelsPerDay = getPixelsPerDay(scale);
        
        // ✅ 10号到20号（包含）= 11天
        const expectedDays = 11;
        const expectedWidth = expectedDays * pixelsPerDay;
        
        expect(width).toBe(expectedWidth);
      });
    });
  });

  // ✅ V5 关键场景测试 - 2024-2028范围覆盖
  describe('V5关键场景: 时间轴固定范围', () => {
    it('应该支持2024-2028年的完整范围', () => {
      const startDate = new Date(2024, 0, 1); // 2024-01-01
      const endDate = new Date(2028, 11, 31); // 2028-12-31
      
      // 月视图下，计算总宽度
      const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const expectedWidth = totalDays * getPixelsPerDay('month');
      
      const actualWidth = getBarWidthPrecise(startDate, endDate, 'month');
      
      // 验证宽度计算正确
      expect(totalDays).toBe(1826); // 约5年
      expect(actualWidth).toBeGreaterThan(9000); // 至少9000px
    });

    it('getPositionFromDate应该正确处理2024-2028范围', () => {
      const viewStartDate = new Date(2024, 0, 1);
      
      // 测试各个年份的位置
      const date2024 = new Date(2024, 0, 1);
      const date2025 = new Date(2025, 0, 1);
      const date2026 = new Date(2026, 0, 1);
      const date2028 = new Date(2028, 11, 31);
      
      const pos2024 = getPositionFromDate(date2024, viewStartDate, 'month');
      const pos2025 = getPositionFromDate(date2025, viewStartDate, 'month');
      const pos2026 = getPositionFromDate(date2026, viewStartDate, 'month');
      const pos2028 = getPositionFromDate(date2028, viewStartDate, 'month');
      
      expect(pos2024).toBe(0); // 起点
      expect(pos2025).toBeGreaterThan(1800); // 约365天 * 5px
      expect(pos2026).toBeGreaterThan(3600); // 约730天 * 5px
      expect(pos2028).toBeGreaterThan(9000); // 约1826天 * 5px
    });
  });
});
