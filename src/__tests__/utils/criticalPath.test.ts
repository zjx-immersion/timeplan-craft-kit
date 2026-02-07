/**
 * 关键路径计算单元测试
 */

import { describe, it, expect } from 'vitest';
import { calculateCriticalPath } from '@/utils/criticalPath';
import { generateLine, generateRelations, generateTimePlan } from '@/utils/testDataGenerator';
import type { Line, Relation } from '@/types/timeplanSchema';

describe('calculateCriticalPath', () => {
  describe('基础功能', () => {
    it('空数据应该返回空数组', () => {
      const result = calculateCriticalPath([], []);
      expect(result).toEqual([]);
    });

    it('没有依赖关系应该返回空数组', () => {
      const lines = [
        generateLine('t1', 0, new Date()),
        generateLine('t1', 1, new Date()),
      ];
      
      const result = calculateCriticalPath(lines, []);
      expect(result).toEqual([]);
    });

    it('简单链式依赖应该返回正确的关键路径', () => {
      const lines = [
        generateLine('t1', 0, new Date()), // line-0
        generateLine('t1', 1, new Date()), // line-1
        generateLine('t1', 2, new Date()), // line-2
      ];
      
      const relations: Relation[] = [
        {
          id: 'r1',
          type: 'dependency',
          fromLineId: lines[0].id,
          toLineId: lines[1].id,
          properties: { dependencyType: 'finish-to-start' },
        },
        {
          id: 'r2',
          type: 'dependency',
          fromLineId: lines[1].id,
          toLineId: lines[2].id,
          properties: { dependencyType: 'finish-to-start' },
        },
      ];
      
      const result = calculateCriticalPath(lines, relations);
      
      expect(result.length).toBe(3);
      expect(result).toEqual([lines[0].id, lines[1].id, lines[2].id]);
    });
  });

  describe('复杂场景', () => {
    it('并行任务应该选择最长路径', () => {
      const lines = [
        generateLine('t1', 0, new Date()), // A (5 天)
        generateLine('t1', 3, new Date()), // B (1 天，milestone)
        generateLine('t1', 0, new Date()), // C (5 天)
        generateLine('t1', 0, new Date()), // D (5 天)
      ];
      
      // A -> B (短路径)
      // A -> C -> D (长路径)
      const relations: Relation[] = [
        {
          id: 'r1',
          type: 'dependency',
          fromLineId: lines[0].id,
          toLineId: lines[1].id,
          properties: { dependencyType: 'finish-to-start' },
        },
        {
          id: 'r2',
          type: 'dependency',
          fromLineId: lines[0].id,
          toLineId: lines[2].id,
          properties: { dependencyType: 'finish-to-start' },
        },
        {
          id: 'r3',
          type: 'dependency',
          fromLineId: lines[2].id,
          toLineId: lines[3].id,
          properties: { dependencyType: 'finish-to-start' },
        },
      ];
      
      const result = calculateCriticalPath(lines, relations);
      
      // 应该返回更长的路径 A -> C -> D
      expect(result.length).toBeGreaterThanOrEqual(3);
      expect(result).toContain(lines[0].id);
      expect(result).toContain(lines[2].id);
      expect(result).toContain(lines[3].id);
    });

    it('多个入口多个出口应该找到最长路径', () => {
      const lines = [
        generateLine('t1', 0, new Date()), // A
        generateLine('t1', 0, new Date()), // B
        generateLine('t1', 0, new Date()), // C
        generateLine('t1', 0, new Date()), // D
      ];
      
      const relations: Relation[] = [
        {
          id: 'r1',
          type: 'dependency',
          fromLineId: lines[0].id,
          toLineId: lines[2].id,
          properties: { dependencyType: 'finish-to-start' },
        },
        {
          id: 'r2',
          type: 'dependency',
          fromLineId: lines[1].id,
          toLineId: lines[2].id,
          properties: { dependencyType: 'finish-to-start' },
        },
        {
          id: 'r3',
          type: 'dependency',
          fromLineId: lines[2].id,
          toLineId: lines[3].id,
          properties: { dependencyType: 'finish-to-start' },
        },
      ];
      
      const result = calculateCriticalPath(lines, relations);
      
      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain(lines[3].id); // 最后一个节点必在关键路径上
    });
  });

  describe('循环依赖检测', () => {
    it('应该检测简单循环依赖', () => {
      const lines = [
        generateLine('t1', 0, new Date()),
        generateLine('t1', 1, new Date()),
      ];
      
      // A -> B -> A (循环)
      const relations: Relation[] = [
        {
          id: 'r1',
          type: 'dependency',
          fromLineId: lines[0].id,
          toLineId: lines[1].id,
          properties: { dependencyType: 'finish-to-start' },
        },
        {
          id: 'r2',
          type: 'dependency',
          fromLineId: lines[1].id,
          toLineId: lines[0].id,
          properties: { dependencyType: 'finish-to-start' },
        },
      ];
      
      const result = calculateCriticalPath(lines, relations);
      
      // 循环依赖应该返回空数组
      expect(result).toEqual([]);
    });

    it('应该检测复杂循环依赖', () => {
      const lines = [
        generateLine('t1', 0, new Date()),
        generateLine('t1', 1, new Date()),
        generateLine('t1', 2, new Date()),
      ];
      
      // A -> B -> C -> A (循环)
      const relations: Relation[] = [
        {
          id: 'r1',
          type: 'dependency',
          fromLineId: lines[0].id,
          toLineId: lines[1].id,
          properties: { dependencyType: 'finish-to-start' },
        },
        {
          id: 'r2',
          type: 'dependency',
          fromLineId: lines[1].id,
          toLineId: lines[2].id,
          properties: { dependencyType: 'finish-to-start' },
        },
        {
          id: 'r3',
          type: 'dependency',
          fromLineId: lines[2].id,
          toLineId: lines[0].id,
          properties: { dependencyType: 'finish-to-start' },
        },
      ];
      
      const result = calculateCriticalPath(lines, relations);
      
      expect(result).toEqual([]);
    });
  });

  describe('真实数据测试', () => {
    it('应该处理生成的测试数据', () => {
      const plan = generateTimePlan('测试项目', {
        numTimelines: 3,
        numLinesPerTimeline: 5,
        relationDensity: 0.5,
      });
      
      const result = calculateCriticalPath(plan.lines, plan.relations);
      
      // 应该返回有效的关键路径（如果有依赖关系）
      if (plan.relations.length > 0) {
        expect(Array.isArray(result)).toBe(true);
      }
    });
  });

  describe('性能测试', () => {
    it('应该能够处理大规模数据', () => {
      const plan = generateTimePlan('大项目', {
        numTimelines: 10,
        numLinesPerTimeline: 100,
        relationDensity: 0.1,
      });
      
      const startTime = Date.now();
      const result = calculateCriticalPath(plan.lines, plan.relations);
      const endTime = Date.now();
      
      // 1000 个节点应该在 100ms 内完成
      expect(endTime - startTime).toBeLessThan(100);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('边界条件', () => {
    it('单个节点无依赖应该返回空数组', () => {
      const lines = [generateLine('t1', 0, new Date())];
      const relations: Relation[] = [];
      
      const result = calculateCriticalPath(lines, relations);
      expect(result).toEqual([]);
    });

    it('无效的关系应该被忽略', () => {
      const lines = [
        generateLine('t1', 0, new Date()),
        generateLine('t1', 1, new Date()),
      ];
      
      const relations: Relation[] = [
        {
          id: 'r1',
          type: 'dependency',
          fromLineId: 'invalid-id',
          toLineId: lines[1].id,
          properties: { dependencyType: 'finish-to-start' },
        },
      ];
      
      const result = calculateCriticalPath(lines, relations);
      expect(result).toEqual([]);
    });
  });
});
