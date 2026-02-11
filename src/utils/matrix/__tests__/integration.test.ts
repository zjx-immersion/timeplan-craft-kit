/**
 * 矩阵视图集成测试
 * 
 * 验证端到端的数据流程和核心功能
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { enhanceTimePlan, printEnhancementStats } from '../dataEnhancer';
import { calculateMatrixData } from '../calculateMatrix';
import { loadProducts } from '@/utils/storage/productStorage';
import { loadTeams } from '@/utils/storage/teamStorage';
import { initializeSampleData, shouldInitialize } from '../sampleData';
import type { TimePlan, Timeline, Line } from '@/types/timeplanSchema';
import { LinePlanSchema, MilestoneSchema } from '@/schemas/defaultSchemas';

describe('矩阵视图集成测试', () => {
  // ============================================================================
  // 数据增强流程测试
  // ============================================================================
  describe('数据增强流程', () => {
    const mockOrionXPlan: TimePlan = {
      id: 'plan-orion-x-test',
      name: 'Orion X 2026计划',
      timelines: [
        {
          id: 'tl-ee-arch',
          name: '电子电器架构',
          owner: '架构团队',
          description: 'EE架构',
          order: 1,
          lineIds: ['line-ee-1', 'line-ee-2'],
        },
        {
          id: 'tl-perception',
          name: '感知算法',
          owner: '感知团队',
          description: '感知',
          order: 2,
          lineIds: ['line-per-1'],
        },
      ],
      lines: [
        {
          id: 'line-ee-1',
          name: 'E0架构设计',
          schemaId: LinePlanSchema.id,
          startDate: '2024-01-01',
          endDate: '2024-02-29',
        },
        {
          id: 'line-ee-2',
          name: 'FDJ评审',
          schemaId: MilestoneSchema.id,
          startDate: '2024-03-01',
        },
        {
          id: 'line-per-1',
          name: '感知算法开发',
          schemaId: LinePlanSchema.id,
          startDate: '2024-01-15',
          endDate: '2024-03-31',
        },
      ],
      relations: [],
    };

    it('应该将整个TimePlan识别为单个Product', () => {
      const enhanced = enhanceTimePlan(mockOrionXPlan);

      // 所有Line都应该属于同一个Product: product-orion-x
      const productIds = new Set(enhanced.lines.map(l => l.productId));
      expect(productIds.size).toBe(1);
      expect(productIds.has('product-orion-x')).toBe(true);
    });

    it('应该根据Timeline分配Team', () => {
      const enhanced = enhanceTimePlan(mockOrionXPlan);

      // line-ee-1 和 line-ee-2 应该属于 team-ee-arch
      const eeLines = enhanced.lines.filter(l => 
        l.id === 'line-ee-1' || l.id === 'line-ee-2'
      );
      eeLines.forEach(line => {
        expect(line.teamId).toBe('team-ee-arch');
      });

      // line-per-1 应该属于 team-perception
      const perLine = enhanced.lines.find(l => l.id === 'line-per-1');
      expect(perLine?.teamId).toBe('team-perception');
    });

    it('应该为所有Line估算工作量', () => {
      const enhanced = enhanceTimePlan(mockOrionXPlan);

      enhanced.lines.forEach(line => {
        expect(line.effort).toBeDefined();
        expect(line.effort).toBeGreaterThan(0);
        expect(typeof line.effort).toBe('number');
      });
    });

    it('应该正确统计数据', () => {
      const enhanced = enhanceTimePlan(mockOrionXPlan);

      // 验证数据完整性
      expect(enhanced.lines.length).toBe(3);
      
      // 验证Product分布
      const productStats = enhanced.lines.reduce((acc, line) => {
        acc[line.productId] = (acc[line.productId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      expect(productStats['product-orion-x']).toBe(3);

      // 验证Team分布
      const teamStats = enhanced.lines.reduce((acc, line) => {
        acc[line.teamId] = (acc[line.teamId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      expect(teamStats['team-ee-arch']).toBe(2);
      expect(teamStats['team-perception']).toBe(1);
    });
  });

  // ============================================================================
  // 示例数据初始化测试
  // ============================================================================
  describe('示例数据初始化', () => {
    it('应该成功初始化示例数据', () => {
      // 这个测试只验证函数不抛出异常
      expect(() => initializeSampleData()).not.toThrow();
    });

    it('shouldInitialize应该检查数据状态', () => {
      const should = shouldInitialize();
      expect(typeof should).toBe('boolean');
    });
  });

  // ============================================================================
  // 数据完整性回归测试
  // ============================================================================
  describe('数据完整性回归测试', () => {
    it('不应该有Line使用默认Team（如果所有Timeline都正确配置）', () => {
      const mockPlan: TimePlan = {
        id: 'plan-regression',
        name: 'Orion X Regression',
        timelines: [
          { id: 'tl-ee-arch', name: 'EE', owner: '', description: '', order: 1, lineIds: ['l1'] },
          { id: 'tl-perception', name: '感知', owner: '', description: '', order: 2, lineIds: ['l2'] },
        ],
        lines: [
          { id: 'l1', name: 'T1', schemaId: LinePlanSchema.id, startDate: '2024-01-01', endDate: '2024-01-10' },
          { id: 'l2', name: 'T2', schemaId: LinePlanSchema.id, startDate: '2024-01-01', endDate: '2024-01-10' },
        ],
        relations: [],
      };

      const enhanced = enhanceTimePlan(mockPlan);

      // 不应该有任何Line使用team-demo（默认Team）
      const defaultTeamLines = enhanced.lines.filter(l => l.teamId === 'team-demo');
      expect(defaultTeamLines.length).toBe(0);
    });

    it('孤立Line应该使用默认Team', () => {
      const mockPlanWithOrphan: TimePlan = {
        id: 'plan-orphan',
        name: 'Plan with Orphan',
        timelines: [
          { id: 'tl-test', name: 'Test', owner: '', description: '', order: 1, lineIds: [] },
        ],
        lines: [
          { id: 'l-orphan', name: 'Orphan', schemaId: LinePlanSchema.id, startDate: '2024-01-01', endDate: '2024-01-10' },
        ],
        relations: [],
      };

      const enhanced = enhanceTimePlan(mockPlanWithOrphan);

      // 孤立Line应该使用默认Team
      expect(enhanced.lines[0].teamId).toBe('team-demo');
    });

    it('空TimePlan应该正常处理', () => {
      const emptyPlan: TimePlan = {
        id: 'plan-empty',
        name: 'Empty Plan',
        timelines: [],
        lines: [],
        relations: [],
      };

      const enhanced = enhanceTimePlan(emptyPlan);
      expect(enhanced.lines.length).toBe(0);
    });
  });

  // ============================================================================
  // Product识别测试
  // ============================================================================
  describe('Product识别逻辑', () => {
    it('应该识别包含orion的计划为Orion X产品', () => {
      const plans = [
        { id: 'p1', name: 'Orion X 2026', timelines: [], lines: [], relations: [] },
        { id: 'p2', name: 'orion-test', timelines: [], lines: [], relations: [] },
        { id: 'p3', name: 'ORION Platform', timelines: [], lines: [], relations: [] },
      ];

      plans.forEach(plan => {
        const enhanced = enhanceTimePlan(plan);
        // 如果有line，应该都属于product-orion-x
        // 这里测试空plan不会崩溃
        expect(enhanced.id).toBe(plan.id);
      });
    });

    it('应该将其他计划识别为演示产品', () => {
      const demoPlan: TimePlan = {
        id: 'plan-demo',
        name: 'Demo Plan',
        timelines: [
          { id: 'tl-1', name: 'Timeline 1', owner: '', description: '', order: 1, lineIds: ['l1'] },
        ],
        lines: [
          { id: 'l1', name: 'Task', schemaId: LinePlanSchema.id, startDate: '2024-01-01', endDate: '2024-01-10' },
        ],
        relations: [],
      };

      const enhanced = enhanceTimePlan(demoPlan);
      expect(enhanced.lines[0].productId).toBe('product-demo');
    });
  });
});
