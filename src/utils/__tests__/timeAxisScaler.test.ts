/**
 * 时间轴缩放工具单元测试
 * 
 * @version 1.0.0
 * @date 2026-02-03
 */

import { describe, it, expect } from 'vitest';
import {
  calculateTimeAxisConfig,
  getRecommendedZoom,
  calculateZoomFromWidth,
  formatZoom,
  getZoomStep,
  getZoomRange,
  calculateDatePosition,
  calculatePositionDate,
  ZOOM_PRESETS,
} from '../timeAxisScaler';

describe('timeAxisScaler', () => {
  describe('calculateTimeAxisConfig', () => {
    it('应该计算月视图的默认配置', () => {
      const config = calculateTimeAxisConfig('month', 1.0);
      
      expect(config.scale).toBe('month');
      expect(config.zoom).toBe(1.0);
      expect(config.viewportMonths).toBe(6);
      expect(config.pixelsPerMonth).toBe(200);
      expect(config.pixelsPerDay).toBeCloseTo(6.67, 1);
      expect(config.totalWidth).toBe(1200);
    });

    it('应该在缩放 0.5 时显示 6 个月', () => {
      const config = calculateTimeAxisConfig('month', 0.5);
      
      expect(config.viewportMonths).toBe(6);
      expect(config.pixelsPerMonth).toBe(100);
      expect(config.totalWidth).toBe(600);
    });

    it('应该在缩放 2.0 时显示 3 个月', () => {
      const config = calculateTimeAxisConfig('month', 2.0);
      
      expect(config.viewportMonths).toBe(3);
      expect(config.pixelsPerMonth).toBe(400);
      expect(config.totalWidth).toBe(1200);
    });

    it('应该限制缩放范围在 0.5-2.0', () => {
      const tooSmall = calculateTimeAxisConfig('month', 0.1);
      expect(tooSmall.zoom).toBe(0.5);
      
      const tooBig = calculateTimeAxisConfig('month', 5.0);
      expect(tooBig.zoom).toBe(2.0);
    });

    it('应该正确计算日视图配置', () => {
      const config = calculateTimeAxisConfig('day', 1.0);
      
      expect(config.scale).toBe('day');
      expect(config.viewportMonths).toBe(2);
      expect(config.pixelsPerDay).toBe(20);
    });

    it('应该正确计算周视图配置', () => {
      const config = calculateTimeAxisConfig('week', 1.0);
      
      expect(config.scale).toBe('week');
      expect(config.viewportMonths).toBe(4);
      expect(config.pixelsPerWeek).toBeCloseTo(65.33, 1);
    });

    it('应该正确计算双周视图配置', () => {
      const config = calculateTimeAxisConfig('biweekly', 1.0);
      
      expect(config.scale).toBe('biweekly');
      expect(config.viewportMonths).toBe(6);
    });

    it('应该正确计算季度视图配置', () => {
      const config = calculateTimeAxisConfig('quarter', 1.0);
      
      expect(config.scale).toBe('quarter');
      expect(config.viewportMonths).toBe(12);
    });

    it('所有刻度应该等比例缩放', () => {
      const scales = ['day', 'week', 'biweekly', 'month', 'quarter'] as const;
      const zoom = 1.5;
      
      scales.forEach(scale => {
        const config1 = calculateTimeAxisConfig(scale, 1.0);
        const config2 = calculateTimeAxisConfig(scale, zoom);
        
        // 每月像素数应该等比例缩放
        expect(config2.pixelsPerMonth).toBeCloseTo(config1.pixelsPerMonth * zoom, 1);
      });
    });
  });

  describe('getRecommendedZoom', () => {
    it('应该为日视图推荐 1.5', () => {
      expect(getRecommendedZoom('day')).toBe(1.5);
    });

    it('应该为周视图推荐 1.2', () => {
      expect(getRecommendedZoom('week')).toBe(1.2);
    });

    it('应该为月视图推荐 1.0', () => {
      expect(getRecommendedZoom('month')).toBe(1.0);
    });

    it('应该为季度视图推荐 0.8', () => {
      expect(getRecommendedZoom('quarter')).toBe(0.8);
    });
  });

  describe('calculateZoomFromWidth', () => {
    it('应该根据目标宽度计算缩放级别', () => {
      // 月视图: 基准 200px/月，6 个月 = 1200px
      const zoom = calculateZoomFromWidth('month', 1200, 6);
      expect(zoom).toBeCloseTo(1.0, 1);
    });

    it('应该限制缩放范围', () => {
      const tooSmall = calculateZoomFromWidth('month', 300, 6);
      expect(tooSmall).toBe(0.5);
      
      const tooBig = calculateZoomFromWidth('month', 3000, 6);
      expect(tooBig).toBe(2.0);
    });

    it('应该处理不同的月数', () => {
      const zoom3 = calculateZoomFromWidth('month', 1200, 3);
      expect(zoom3).toBeCloseTo(2.0, 1);
      
      const zoom12 = calculateZoomFromWidth('month', 1200, 12);
      expect(zoom12).toBe(0.5);
    });
  });

  describe('formatZoom', () => {
    it('应该格式化缩放级别为百分比', () => {
      expect(formatZoom(0.5)).toBe('50%');
      expect(formatZoom(1.0)).toBe('100%');
      expect(formatZoom(1.5)).toBe('150%');
      expect(formatZoom(2.0)).toBe('200%');
    });

    it('应该四舍五入到整数', () => {
      expect(formatZoom(1.234)).toBe('123%');
      expect(formatZoom(1.567)).toBe('157%');
    });
  });

  describe('getZoomStep', () => {
    it('应该返回 0.1', () => {
      expect(getZoomStep()).toBe(0.1);
    });
  });

  describe('getZoomRange', () => {
    it('应该返回 [0.5, 2.0]', () => {
      const [min, max] = getZoomRange();
      expect(min).toBe(0.5);
      expect(max).toBe(2.0);
    });
  });

  describe('ZOOM_PRESETS', () => {
    it('应该包含 6 个预设', () => {
      expect(ZOOM_PRESETS).toHaveLength(6);
    });

    it('应该从 50% 到 200%', () => {
      expect(ZOOM_PRESETS[0]).toEqual({ label: '50%', value: 0.5 });
      expect(ZOOM_PRESETS[5]).toEqual({ label: '200%', value: 2.0 });
    });

    it('所有预设应该在有效范围内', () => {
      const [min, max] = getZoomRange();
      ZOOM_PRESETS.forEach(preset => {
        expect(preset.value).toBeGreaterThanOrEqual(min);
        expect(preset.value).toBeLessThanOrEqual(max);
      });
    });
  });

  describe('calculateDatePosition', () => {
    it('应该计算起始日期的位置为 0', () => {
      const startDate = new Date('2026-01-01');
      const config = calculateTimeAxisConfig('month', 1.0);
      
      const pos = calculateDatePosition(startDate, startDate, config);
      expect(pos).toBe(0);
    });

    it('应该计算 1 天后的位置', () => {
      const startDate = new Date('2026-01-01');
      const targetDate = new Date('2026-01-02');
      const config = calculateTimeAxisConfig('month', 1.0);
      
      const pos = calculateDatePosition(targetDate, startDate, config);
      expect(pos).toBeCloseTo(config.pixelsPerDay, 1);
    });

    it('应该计算 30 天（1 个月）后的位置', () => {
      const startDate = new Date('2026-01-01');
      const targetDate = new Date('2026-01-31');
      const config = calculateTimeAxisConfig('month', 1.0);
      
      const pos = calculateDatePosition(targetDate, startDate, config);
      expect(pos).toBeCloseTo(config.pixelsPerMonth, 1);
    });

    it('缩放应该影响位置', () => {
      const startDate = new Date('2026-01-01');
      const targetDate = new Date('2026-01-31');
      
      const config1 = calculateTimeAxisConfig('month', 1.0);
      const pos1 = calculateDatePosition(targetDate, startDate, config1);
      
      const config2 = calculateTimeAxisConfig('month', 2.0);
      const pos2 = calculateDatePosition(targetDate, startDate, config2);
      
      expect(pos2).toBeCloseTo(pos1 * 2, 1);
    });
  });

  describe('calculatePositionDate', () => {
    it('应该计算位置 0 对应的日期为起始日期', () => {
      const startDate = new Date('2026-01-01');
      const config = calculateTimeAxisConfig('month', 1.0);
      
      const date = calculatePositionDate(0, startDate, config);
      expect(date.toISOString().split('T')[0]).toBe('2026-01-01');
    });

    it('应该计算 1 个像素对应的日期', () => {
      const startDate = new Date('2026-01-01');
      const config = calculateTimeAxisConfig('month', 1.0);
      
      const date = calculatePositionDate(config.pixelsPerDay, startDate, config);
      expect(date.toISOString().split('T')[0]).toBe('2026-01-02');
    });

    it('应该计算 1 个月对应的日期', () => {
      const startDate = new Date('2026-01-01');
      const config = calculateTimeAxisConfig('month', 1.0);
      
      const date = calculatePositionDate(config.pixelsPerMonth, startDate, config);
      expect(date.toISOString().split('T')[0]).toBe('2026-01-31');
    });

    it('calculateDatePosition 和 calculatePositionDate 应该互为逆运算', () => {
      const startDate = new Date('2026-01-01');
      const targetDate = new Date('2026-02-15');
      const config = calculateTimeAxisConfig('month', 1.0);
      
      const pos = calculateDatePosition(targetDate, startDate, config);
      const calculatedDate = calculatePositionDate(pos, startDate, config);
      
      expect(calculatedDate.toISOString().split('T')[0]).toBe(
        targetDate.toISOString().split('T')[0]
      );
    });
  });

  describe('边界情况', () => {
    it('应该处理缩放为 undefined', () => {
      const config = calculateTimeAxisConfig('month');
      expect(config.zoom).toBe(1.0);
    });

    it('应该处理负数缩放', () => {
      const config = calculateTimeAxisConfig('month', -1.0);
      expect(config.zoom).toBe(0.5);
    });

    it('应该处理零缩放', () => {
      const config = calculateTimeAxisConfig('month', 0);
      expect(config.zoom).toBe(0.5);
    });

    it('应该处理非常大的缩放', () => {
      const config = calculateTimeAxisConfig('month', 100);
      expect(config.zoom).toBe(2.0);
    });
  });
});
