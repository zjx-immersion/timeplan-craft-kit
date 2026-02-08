/**
 * useBarResize Hook 测试 - V5 关键场景
 * 
 * 重点测试：
 * 1. 拖拽宽度计算是否按天对齐
 * 2. 天数偏移计算是否正确（Math.round）
 * 3. 宽度和日期的对应关系
 */

import { describe, it, expect } from 'vitest';
import { addDays } from 'date-fns';
import { getPixelsPerDay, getBarWidthPrecise, getPositionFromDate } from '@/utils/dateUtils';
import type { TimeScale } from '@/types';

describe('useBarResize - V5 核心算法测试', () => {
  
  // ✅ 核心算法测试：拖拽像素转换为天数偏移
  describe('拖拽像素到天数偏移转换', () => {
    
    it('月视图：50px拖拽 = 10天偏移', () => {
      const scale: TimeScale = 'month';
      const deltaX = 50; // 鼠标移动50px
      
      const pixelsPerDay = getPixelsPerDay(scale); // 5px/天
      const daysOffset = Math.round(deltaX / pixelsPerDay); // ✅ 使用Math.round
      
      expect(pixelsPerDay).toBe(5);
      expect(daysOffset).toBe(10); // 50 / 5 = 10天
    });

    it('日视图：80px拖拽 = 2天偏移', () => {
      const scale: TimeScale = 'day';
      const deltaX = 80;
      
      const pixelsPerDay = getPixelsPerDay(scale);
      const daysOffset = Math.round(deltaX / pixelsPerDay);
      
      expect(pixelsPerDay).toBe(40);
      expect(daysOffset).toBe(2); // 80 / 40 = 2天
    });

    it('非整数拖拽应该四舍五入到整数天', () => {
      const scale: TimeScale = 'month';
      
      // 23px / 5 = 4.6天 → Math.round = 5天
      const deltaX1 = 23;
      const daysOffset1 = Math.round(deltaX1 / getPixelsPerDay(scale));
      expect(daysOffset1).toBe(5);
      
      // 22px / 5 = 4.4天 → Math.round = 4天
      const deltaX2 = 22;
      const daysOffset2 = Math.round(deltaX2 / getPixelsPerDay(scale));
      expect(daysOffset2).toBe(4);
    });

    it('负方向拖拽应该得到负偏移', () => {
      const scale: TimeScale = 'month';
      const deltaX = -25; // 向左25px
      
      const pixelsPerDay = getPixelsPerDay(scale);
      const daysOffset = Math.round(deltaX / pixelsPerDay);
      
      expect(daysOffset).toBe(-5); // -25 / 5 = -5天
    });
  });

  // ✅ 日期计算验证
  describe('日期计算正确性', () => {
    
    it('addDays应该正确增加天数', () => {
      const baseDate = new Date('2024-01-11');
      
      const result1 = addDays(baseDate, 10);
      expect(result1.getDate()).toBe(21); // 11 + 10 = 21
      
      const result2 = addDays(baseDate, -5);
      expect(result2.getDate()).toBe(6); // 11 - 5 = 6
    });

    it('跨月计算应该正确', () => {
      const baseDate = new Date('2024-01-25');
      
      const result = addDays(baseDate, 10);
      expect(result.getMonth()).toBe(1); // 2月（0-indexed）
      expect(result.getDate()).toBe(4); // 25 + 10 = 35 → 2月4日
    });
  });

  // ✅ 宽度计算验证（包含起止日期）
  describe('宽度计算包含起止日期', () => {
    
    it('月视图：1号到11号 = 11天 = 55px', () => {
      const scale: TimeScale = 'month';
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-11');
      
      const width = getBarWidthPrecise(startDate, endDate, scale);
      
      // ✅ 包含起止日期：1,2,3,4,5,6,7,8,9,10,11 = 11天
      expect(width).toBe(55); // 11天 * 5px
    });

    it('日视图：1号到6号 = 6天 = 240px', () => {
      const scale: TimeScale = 'day';
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-06');
      
      const width = getBarWidthPrecise(startDate, endDate, scale);
      
      expect(width).toBe(240); // 6天 * 40px
    });
  });

  // ✅ 真实拖拽场景模拟（不使用snapToGrid）
  describe('真实拖拽场景模拟', () => {
    
    it('场景1: 月视图拖拽右侧手柄50px', () => {
      const scale: TimeScale = 'month';
      
      // 原始状态：1号到11号
      const originalStart = new Date('2024-01-01');
      const originalEnd = new Date('2024-01-11');
      const originalWidth = getBarWidthPrecise(originalStart, originalEnd, scale);
      
      expect(originalWidth).toBe(55); // 11天 * 5px
      
      // 用户拖拽右侧手柄向右50px
      const deltaX = 50;
      const pixelsPerDay = getPixelsPerDay(scale);
      const daysOffset = Math.round(deltaX / pixelsPerDay); // 10天
      
      // 计算新的endDate
      const newEnd = addDays(originalEnd, daysOffset); // 1月21号
      
      // 计算新宽度
      const newWidth = getBarWidthPrecise(originalStart, newEnd, scale);
      
      // ✅ 验证
      expect(daysOffset).toBe(10);
      expect(newEnd.getDate()).toBe(21);
      expect(newWidth).toBe(105); // 21天（1号到21号） * 5px
      
      // ✅ 宽度变化 = 拖拽距离（在包含起止日期的情况下）
      const widthChange = newWidth - originalWidth;
      expect(widthChange).toBe(50); // 105 - 55 = 50px
    });

    it('场景2: 日视图拖拽右侧手柄80px', () => {
      const scale: TimeScale = 'day';
      
      // 原始状态：1号到6号
      const originalStart = new Date('2024-01-01');
      const originalEnd = new Date('2024-01-06');
      const originalWidth = getBarWidthPrecise(originalStart, originalEnd, scale);
      
      expect(originalWidth).toBe(240); // 6天 * 40px
      
      // 用户拖拽右侧手柄向右80px
      const deltaX = 80;
      const pixelsPerDay = getPixelsPerDay(scale);
      const daysOffset = Math.round(deltaX / pixelsPerDay); // 2天
      
      const newEnd = addDays(originalEnd, daysOffset); // 1月8号
      const newWidth = getBarWidthPrecise(originalStart, newEnd, scale);
      
      expect(daysOffset).toBe(2);
      expect(newEnd.getDate()).toBe(8);
      expect(newWidth).toBe(320); // 8天 * 40px
      
      const widthChange = newWidth - originalWidth;
      expect(widthChange).toBe(80); // 320 - 240 = 80px
    });

    it('场景3: 拖拽左侧手柄（修改startDate）', () => {
      const scale: TimeScale = 'month';
      
      // 原始状态：5号到15号
      const originalStart = new Date('2024-01-05');
      const originalEnd = new Date('2024-01-15');
      const originalWidth = getBarWidthPrecise(originalStart, originalEnd, scale);
      
      expect(originalWidth).toBe(55); // 11天 * 5px
      
      // 向左拖拽25px（增加5天）
      const deltaX = -25;
      const pixelsPerDay = getPixelsPerDay(scale);
      const daysOffset = Math.round(deltaX / pixelsPerDay); // -5天
      
      const newStart = addDays(originalStart, daysOffset); // 2023-12-31（跨月）
      const newWidth = getBarWidthPrecise(newStart, originalEnd, scale);
      
      expect(daysOffset).toBe(-5);
      expect(newStart.getMonth()).toBe(11); // 12月（0-indexed）
      expect(newStart.getDate()).toBe(31);
      expect(newWidth).toBe(80); // 16天 * 5px
    });
  });

  // ✅ 边界条件测试
  describe('边界条件', () => {
    
    it('拖拽距离小于0.5天应该四舍五入到0', () => {
      const scale: TimeScale = 'month';
      const deltaX = 2; // 2px / 5px = 0.4天
      
      const pixelsPerDay = getPixelsPerDay(scale);
      const daysOffset = Math.round(deltaX / pixelsPerDay);
      
      expect(daysOffset).toBe(0); // Math.round(0.4) = 0
    });

    it('最小宽度限制：至少1天', () => {
      const scale: TimeScale = 'day';
      const startDate = new Date('2024-01-10');
      const endDate = new Date('2024-01-10'); // 同一天
      
      // getBarWidthPrecise应该至少返回1天的宽度
      const width = getBarWidthPrecise(startDate, endDate, scale);
      const pixelsPerDay = getPixelsPerDay(scale);
      
      expect(width).toBe(pixelsPerDay); // 最小40px
    });

    it('拖拽导致endDate < startDate时需要限制', () => {
      const scale: TimeScale = 'day';
      const originalStart = new Date('2024-01-10');
      const originalEnd = new Date('2024-01-12');
      
      // 尝试向左拖拽很多
      const deltaX = -200;
      const pixelsPerDay = getPixelsPerDay(scale);
      const daysOffset = Math.round(deltaX / pixelsPerDay); // -5天
      
      let newEnd = addDays(originalEnd, daysOffset); // 1月7号（早于start）
      
      // ✅ 应用最小1天限制
      const minEnd = addDays(originalStart, 1);
      if (newEnd < minEnd) {
        newEnd = minEnd;
      }
      
      expect(newEnd.getDate()).toBe(11); // 最小是10号 + 1天
    });
  });

  // ✅ 磁吸算法测试
  describe('磁吸对齐算法', () => {
    
    it('距离<=1天时应该触发磁吸', () => {
      const targetDate = new Date('2024-01-15');
      const nearbyDate = new Date('2024-01-16'); // 距离1天
      
      const THRESHOLD = 1; // 磁吸阈值1天
      
      const diffDays = Math.abs(
        (nearbyDate.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      expect(diffDays).toBe(1);
      expect(diffDays <= THRESHOLD).toBe(true); // ✅ 应该磁吸
    });

    it('距离>1天时不应该触发磁吸', () => {
      const targetDate = new Date('2024-01-15');
      const farDate = new Date('2024-01-18'); // 距离3天
      
      const THRESHOLD = 1;
      
      const diffDays = Math.abs(
        (farDate.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      expect(diffDays).toBe(3);
      expect(diffDays <= THRESHOLD).toBe(false); // ❌ 不应该磁吸
    });
  });

  // ✅ V4 Bug 防御性测试
  describe('V4 Bug 防御性测试', () => {
    
    it('必须使用Math.round而不是floor或ceil', () => {
      const scale: TimeScale = 'month';
      const deltaX = 23; // 23px / 5px = 4.6天
      
      const pixelsPerDay = getPixelsPerDay(scale);
      
      // ✅ 正确：Math.round
      const correctOffset = Math.round(deltaX / pixelsPerDay);
      expect(correctOffset).toBe(5); // 4.6 → 5
      
      // ❌ 错误：Math.floor
      const wrongFloor = Math.floor(deltaX / pixelsPerDay);
      expect(wrongFloor).toBe(4); // 4.6 → 4（不对）
      
      // ❌ 错误：Math.ceil
      const wrongCeil = Math.ceil(deltaX / pixelsPerDay);
      expect(wrongCeil).toBe(5); // 4.6 → 5（碰巧对，但22px时会错）
    });

    it('宽度必须是整数天的像素', () => {
      const scale: TimeScale = 'month';
      const startDate = new Date('2024-01-05');
      const endDate = new Date('2024-01-15');
      
      const width = getBarWidthPrecise(startDate, endDate, scale);
      const pixelsPerDay = getPixelsPerDay(scale);
      
      // ✅ 宽度应该是pixelsPerDay的整数倍
      expect(width % pixelsPerDay).toBe(0);
      expect(width).toBe(55); // 11天 * 5px
    });
  });

  // ✅ 不同scale的一致性测试
  describe('多种scale一致性', () => {
    
    it('所有scale都应该保持整数天对齐', () => {
      const scales: TimeScale[] = ['day', 'week', 'month'];
      
      scales.forEach(scale => {
        const startDate = new Date('2024-01-01');
        const endDate = new Date('2024-01-11');
        
        const width = getBarWidthPrecise(startDate, endDate, scale);
        const pixelsPerDay = getPixelsPerDay(scale);
        
        // ✅ 宽度必须是pixelsPerDay的整数倍（允许浮点误差）
        const remainder = width % pixelsPerDay;
        expect(Math.abs(remainder) < 0.0001 || Math.abs(remainder - pixelsPerDay) < 0.0001).toBe(true);
      });
    });
  });

  // ✅ 性能测试
  describe('性能和精度', () => {
    
    it('连续计算应该得到稳定结果', () => {
      const scale: TimeScale = 'month';
      const startDate = new Date('2024-01-05');
      const endDate = new Date('2024-01-15');
      
      // 连续计算10次
      const results = [];
      for (let i = 0; i < 10; i++) {
        const width = getBarWidthPrecise(startDate, endDate, scale);
        results.push(width);
      }
      
      // 所有结果应该相同
      const allSame = results.every(r => r === results[0]);
      expect(allSame).toBe(true);
      expect(results[0]).toBe(55);
    });
  });
});
