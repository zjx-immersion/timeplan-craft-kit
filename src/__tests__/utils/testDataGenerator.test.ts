/**
 * 测试数据生成器单元测试
 */

import { describe, it, expect } from 'vitest';
import {
  generateTimeline,
  generateLine,
  generateRelations,
  generateBaselines,
  generateBaselineRanges,
  generateTimePlan,
  generateMultiplePlans,
  generateLargeTimePlan,
  generateMinimalTimePlan,
  generateFullFeaturedPlan,
} from '@/utils/testDataGenerator';

describe('testDataGenerator', () => {
  describe('generateTimeline', () => {
    it('应该生成有效的时间线', () => {
      const timeline = generateTimeline(0);
      
      expect(timeline).toHaveProperty('id');
      expect(timeline).toHaveProperty('name');
      expect(timeline).toHaveProperty('owner');
      expect(timeline).toHaveProperty('lineIds');
      expect(Array.isArray(timeline.lineIds)).toBe(true);
      expect(timeline.attributes).toBeDefined();
    });

    it('应该为不同索引生成不同的时间线', () => {
      const timeline1 = generateTimeline(0);
      const timeline2 = generateTimeline(1);
      
      expect(timeline1.name).not.toBe(timeline2.name);
      expect(timeline1.owner).not.toBe(timeline2.owner);
    });
  });

  describe('generateLine', () => {
    it('应该生成有效的任务节点', () => {
      const line = generateLine('timeline-1', 0, new Date());
      
      expect(line).toHaveProperty('id');
      expect(line.timelineId).toBe('timeline-1');
      expect(line).toHaveProperty('label');
      expect(line).toHaveProperty('startDate');
      expect(line).toHaveProperty('schemaId');
      expect(line.attributes).toBeDefined();
    });

    it('应该循环生成不同类型的节点', () => {
      const date = new Date();
      const line0 = generateLine('t1', 0, date); // bar
      const line1 = generateLine('t1', 1, date); // milestone
      const line2 = generateLine('t1', 2, date); // gateway
      
      expect(line0.schemaId).toBe('bar-schema');
      expect(line1.schemaId).toBe('milestone-schema');
      expect(line2.schemaId).toBe('gateway-schema');
    });

    it('Bar 类型应该有结束日期', () => {
      const line = generateLine('t1', 0, new Date());
      expect(line.endDate).toBeDefined();
    });

    it('Milestone 类型不应该有结束日期', () => {
      const line = generateLine('t1', 1, new Date());
      expect(line.endDate).toBeUndefined();
    });
  });

  describe('generateRelations', () => {
    it('应该根据密度生成依赖关系', () => {
      const lines = Array.from({ length: 10 }, (_, i) => 
        generateLine('t1', i, new Date())
      );
      
      const relations = generateRelations(lines, 1.0); // 100% 密度
      expect(relations.length).toBeGreaterThan(0);
      expect(relations.length).toBeLessThanOrEqual(lines.length - 1);
    });

    it('生成的关系应该有有效的属性', () => {
      const lines = Array.from({ length: 5 }, (_, i) => 
        generateLine('t1', i, new Date())
      );
      
      const relations = generateRelations(lines, 1.0);
      
      relations.forEach(relation => {
        expect(relation).toHaveProperty('id');
        expect(relation.type).toBe('dependency');
        expect(relation).toHaveProperty('fromLineId');
        expect(relation).toHaveProperty('toLineId');
        expect(relation.properties).toBeDefined();
        expect(relation.properties?.dependencyType).toBeDefined();
      });
    });
  });

  describe('generateBaselines', () => {
    it('应该为里程碑生成基线', () => {
      const lines = [
        generateLine('t1', 0, new Date()), // bar
        generateLine('t1', 1, new Date()), // milestone
        generateLine('t1', 2, new Date()), // gateway
        generateLine('t1', 3, new Date()), // bar
        generateLine('t1', 4, new Date()), // milestone
      ];
      
      const baselines = generateBaselines(lines);
      expect(baselines.length).toBe(2); // 2 个里程碑
      
      baselines.forEach(baseline => {
        expect(baseline).toHaveProperty('id');
        expect(baseline).toHaveProperty('label');
        expect(baseline).toHaveProperty('date');
        expect(baseline).toHaveProperty('color');
        expect(baseline).toHaveProperty('lineId');
      });
    });
  });

  describe('generateBaselineRanges', () => {
    it('应该生成基线范围', () => {
      const lines = Array.from({ length: 9 }, (_, i) => 
        generateLine('t1', i, new Date())
      );
      
      const ranges = generateBaselineRanges(lines);
      expect(ranges.length).toBeGreaterThan(0);
      
      ranges.forEach(range => {
        expect(range).toHaveProperty('id');
        expect(range).toHaveProperty('label');
        expect(range).toHaveProperty('startDate');
        expect(range).toHaveProperty('endDate');
        expect(range).toHaveProperty('color');
      });
    });
  });

  describe('generateTimePlan', () => {
    it('应该生成完整的 TimePlan', () => {
      const plan = generateTimePlan('测试项目');
      
      expect(plan).toHaveProperty('id');
      expect(plan.title).toBe('测试项目');
      expect(plan).toHaveProperty('owner');
      expect(plan).toHaveProperty('schemaId');
      expect(Array.isArray(plan.timelines)).toBe(true);
      expect(Array.isArray(plan.lines)).toBe(true);
      expect(Array.isArray(plan.relations)).toBe(true);
      expect(plan).toHaveProperty('createdAt');
      expect(plan).toHaveProperty('updatedAt');
    });

    it('应该根据选项生成不同规模的数据', () => {
      const smallPlan = generateTimePlan('小项目', {
        numTimelines: 2,
        numLinesPerTimeline: 3,
      });
      
      expect(smallPlan.timelines.length).toBe(2);
      expect(smallPlan.lines.length).toBe(6); // 2 * 3
    });

    it('生成的时间线应该包含正确的 lineIds', () => {
      const plan = generateTimePlan('测试项目');
      
      plan.timelines.forEach(timeline => {
        const timelineLines = plan.lines.filter(l => l.timelineId === timeline.id);
        expect(timeline.lineIds.length).toBe(timelineLines.length);
        expect(timeline.lineIds).toEqual(timelineLines.map(l => l.id));
      });
    });
  });

  describe('generateMultiplePlans', () => {
    it('应该生成多个项目', () => {
      const plans = generateMultiplePlans(3);
      
      expect(plans.length).toBe(3);
      plans.forEach(plan => {
        expect(plan).toHaveProperty('id');
        expect(plan).toHaveProperty('title');
      });
    });

    it('生成的项目应该有不同的 ID', () => {
      const plans = generateMultiplePlans(5);
      const ids = plans.map(p => p.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(5);
    });
  });

  describe('generateLargeTimePlan', () => {
    it('应该生成大规模测试数据', () => {
      const plan = generateLargeTimePlan(10, 100);
      
      expect(plan.timelines.length).toBe(10);
      expect(plan.lines.length).toBe(1000); // 10 * 100
    });
  });

  describe('generateMinimalTimePlan', () => {
    it('应该生成最小测试数据', () => {
      const plan = generateMinimalTimePlan();
      
      expect(plan.timelines.length).toBe(1);
      expect(plan.lines.length).toBe(3);
    });
  });

  describe('generateFullFeaturedPlan', () => {
    it('应该生成包含所有功能的测试数据', () => {
      const plan = generateFullFeaturedPlan();
      
      expect(plan.timelines.length).toBeGreaterThan(0);
      expect(plan.lines.length).toBeGreaterThan(0);
      expect(plan.relations.length).toBeGreaterThan(0);
      expect(plan.baselines).toBeDefined();
      expect(plan.baselineRanges).toBeDefined();
    });
  });

  describe('数据一致性', () => {
    it('所有节点的 timelineId 应该指向有效的时间线', () => {
      const plan = generateTimePlan('测试项目');
      const timelineIds = new Set(plan.timelines.map(t => t.id));
      
      plan.lines.forEach(line => {
        expect(timelineIds.has(line.timelineId)).toBe(true);
      });
    });

    it('所有关系的 fromLineId 和 toLineId 应该指向有效的节点', () => {
      const plan = generateTimePlan('测试项目');
      const lineIds = new Set(plan.lines.map(l => l.id));
      
      plan.relations.forEach(relation => {
        expect(lineIds.has(relation.fromLineId)).toBe(true);
        expect(lineIds.has(relation.toLineId)).toBe(true);
      });
    });

    it('所有基线的 lineId 应该指向有效的节点', () => {
      const plan = generateTimePlan('测试项目');
      const lineIds = new Set(plan.lines.map(l => l.id));
      
      plan.baselines?.forEach(baseline => {
        if (baseline.lineId) {
          expect(lineIds.has(baseline.lineId)).toBe(true);
        }
      });
    });
  });
});
