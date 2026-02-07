/**
 * TimePlan Store With History 单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTimePlanStoreWithHistory } from '@/stores/timePlanStoreWithHistory';
import { generateMinimalTimePlan, generateTimeline, generateLine } from '@/utils/testDataGenerator';

// 重置 store 的辅助函数
const resetStore = () => {
  const { getState } = useTimePlanStoreWithHistory;
  act(() => {
    getState().setPlans([]);
    getState().clearHistory();
  });
};

describe('TimePlanStoreWithHistory', () => {
  beforeEach(() => {
    resetStore();
  });

  describe('基础功能', () => {
    it('应该能够添加项目', () => {
      const { result } = renderHook(() => useTimePlanStoreWithHistory());
      const plan = generateMinimalTimePlan();
      
      act(() => {
        result.current.addPlan(plan);
      });
      
      expect(result.current.plans.length).toBe(1);
      expect(result.current.plans[0].id).toBe(plan.id);
    });

    it('应该能够更新项目', () => {
      const { result } = renderHook(() => useTimePlanStoreWithHistory());
      const plan = generateMinimalTimePlan();
      
      act(() => {
        result.current.addPlan(plan);
        result.current.updatePlan(plan.id, { title: '新标题' });
      });
      
      expect(result.current.plans[0].title).toBe('新标题');
    });

    it('应该能够删除项目', () => {
      const { result } = renderHook(() => useTimePlanStoreWithHistory());
      const plan = generateMinimalTimePlan();
      
      act(() => {
        result.current.addPlan(plan);
        result.current.deletePlan(plan.id);
      });
      
      expect(result.current.plans.length).toBe(0);
    });
  });

  describe('Timeline 管理', () => {
    it('应该能够添加时间线', () => {
      const { result } = renderHook(() => useTimePlanStoreWithHistory());
      const plan = generateMinimalTimePlan();
      const timeline = generateTimeline(99);
      
      act(() => {
        result.current.addPlan(plan);
        result.current.addTimeline(plan.id, timeline);
      });
      
      const updatedPlan = result.current.plans[0];
      expect(updatedPlan.timelines.length).toBe(plan.timelines.length + 1);
    });

    it('应该能够更新时间线', () => {
      const { result } = renderHook(() => useTimePlanStoreWithHistory());
      const plan = generateMinimalTimePlan();
      const timelineId = plan.timelines[0].id;
      
      act(() => {
        result.current.addPlan(plan);
        result.current.updateTimeline(plan.id, timelineId, { name: '新名称' });
      });
      
      const updatedPlan = result.current.plans[0];
      const updatedTimeline = updatedPlan.timelines.find(t => t.id === timelineId);
      expect(updatedTimeline?.name).toBe('新名称');
    });

    it('应该能够删除时间线', () => {
      const { result } = renderHook(() => useTimePlanStoreWithHistory());
      const plan = generateMinimalTimePlan();
      const timelineId = plan.timelines[0].id;
      
      act(() => {
        result.current.addPlan(plan);
        result.current.deleteTimeline(plan.id, timelineId);
      });
      
      const updatedPlan = result.current.plans[0];
      expect(updatedPlan.timelines.length).toBe(0);
      // 关联的节点也应该被删除
      expect(updatedPlan.lines.length).toBe(0);
    });
  });

  describe('Line 管理', () => {
    it('应该能够添加节点', () => {
      const { result } = renderHook(() => useTimePlanStoreWithHistory());
      const plan = generateMinimalTimePlan();
      const line = generateLine(plan.timelines[0].id, 99, new Date());
      
      act(() => {
        result.current.addPlan(plan);
        result.current.addLine(plan.id, line);
      });
      
      const updatedPlan = result.current.plans[0];
      expect(updatedPlan.lines.length).toBe(plan.lines.length + 1);
    });

    it('应该能够更新节点', () => {
      const { result } = renderHook(() => useTimePlanStoreWithHistory());
      const plan = generateMinimalTimePlan();
      const lineId = plan.lines[0].id;
      
      act(() => {
        result.current.addPlan(plan);
        result.current.updateLine(plan.id, lineId, { label: '新标签' });
      });
      
      const updatedPlan = result.current.plans[0];
      const updatedLine = updatedPlan.lines.find(l => l.id === lineId);
      expect(updatedLine?.label).toBe('新标签');
    });

    it('应该能够删除节点', () => {
      const { result } = renderHook(() => useTimePlanStoreWithHistory());
      const plan = generateMinimalTimePlan();
      const lineId = plan.lines[0].id;
      
      act(() => {
        result.current.addPlan(plan);
        result.current.deleteLine(plan.id, lineId);
      });
      
      const updatedPlan = result.current.plans[0];
      expect(updatedPlan.lines.length).toBe(plan.lines.length - 1);
    });
  });

  describe('撤销/重做功能', () => {
    it('初始状态不能撤销或重做', () => {
      const { result } = renderHook(() => useTimePlanStoreWithHistory());
      
      expect(result.current.canUndo()).toBe(false);
      expect(result.current.canRedo()).toBe(false);
    });

    it('操作后应该能够撤销', () => {
      const { result } = renderHook(() => useTimePlanStoreWithHistory());
      const plan = generateMinimalTimePlan();
      
      act(() => {
        result.current.addPlan(plan);
      });
      
      expect(result.current.canUndo()).toBe(true);
      expect(result.current.plans.length).toBe(1);
      
      act(() => {
        result.current.undo();
      });
      
      expect(result.current.plans.length).toBe(0);
    });

    it('撤销后应该能够重做', () => {
      const { result } = renderHook(() => useTimePlanStoreWithHistory());
      const plan = generateMinimalTimePlan();
      
      act(() => {
        result.current.addPlan(plan);
        result.current.undo();
      });
      
      expect(result.current.canRedo()).toBe(true);
      expect(result.current.plans.length).toBe(0);
      
      act(() => {
        result.current.redo();
      });
      
      expect(result.current.plans.length).toBe(1);
    });

    it('多次操作应该保持正确的历史记录', () => {
      const { result } = renderHook(() => useTimePlanStoreWithHistory());
      const plan1 = generateMinimalTimePlan();
      const plan2 = generateMinimalTimePlan();
      plan2.id = 'plan-2';
      
      act(() => {
        result.current.addPlan(plan1);
        result.current.addPlan(plan2);
      });
      
      expect(result.current.plans.length).toBe(2);
      
      act(() => {
        result.current.undo();
      });
      
      expect(result.current.plans.length).toBe(1);
      
      act(() => {
        result.current.undo();
      });
      
      expect(result.current.plans.length).toBe(0);
      
      act(() => {
        result.current.redo();
        result.current.redo();
      });
      
      expect(result.current.plans.length).toBe(2);
    });

    it('新操作应该清除 redo 栈', () => {
      const { result } = renderHook(() => useTimePlanStoreWithHistory());
      const plan1 = generateMinimalTimePlan();
      const plan2 = generateMinimalTimePlan();
      plan2.id = 'plan-2';
      
      act(() => {
        result.current.addPlan(plan1);
        result.current.undo();
        result.current.addPlan(plan2);
      });
      
      expect(result.current.canRedo()).toBe(false);
      expect(result.current.plans.length).toBe(1);
      expect(result.current.plans[0].id).toBe('plan-2');
    });
  });

  describe('批量操作', () => {
    it('应该能够批量更新节点', () => {
      const { result } = renderHook(() => useTimePlanStoreWithHistory());
      const plan = generateMinimalTimePlan();
      
      act(() => {
        result.current.addPlan(plan);
        result.current.batchUpdateLines(plan.id, [
          { lineId: plan.lines[0].id, updates: { label: '批量更新 1' } },
          { lineId: plan.lines[1].id, updates: { label: '批量更新 2' } },
        ]);
      });
      
      const updatedPlan = result.current.plans[0];
      expect(updatedPlan.lines[0].label).toBe('批量更新 1');
      expect(updatedPlan.lines[1].label).toBe('批量更新 2');
    });
  });

  describe('数据一致性', () => {
    it('更新操作应该设置 updatedAt 时间戳', () => {
      const { result } = renderHook(() => useTimePlanStoreWithHistory());
      const plan = generateMinimalTimePlan();
      const originalUpdatedAt = plan.updatedAt;
      
      // 等待一小段时间确保时间戳不同
      setTimeout(() => {
        act(() => {
          result.current.addPlan(plan);
          result.current.updatePlan(plan.id, { title: '新标题' });
        });
        
        const updatedPlan = result.current.plans[0];
        expect(updatedPlan.updatedAt).not.toEqual(originalUpdatedAt);
      }, 10);
    });
  });
});
