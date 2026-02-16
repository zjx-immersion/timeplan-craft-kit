/**
 * NavigationStore 单元测试
 * 
 * 测试范围：
 * - 导航状态管理
 * - 任务跳转
 * - 大量任务优化
 * 
 * @version 1.0.0
 * @date 2026-02-12
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNavigationStore } from '../navigationStore';

describe('NavigationStore', () => {
  beforeEach(() => {
    // 每个测试前重置store
    const { result } = renderHook(() => useNavigationStore());
    act(() => {
      result.current.clearNavigation();
    });
  });

  describe('基础导航功能', () => {
    it('应该正确初始化状态', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      expect(result.current.targetLineIds).toEqual([]);
      expect(result.current.targetTimelineId).toBeUndefined();
      expect(result.current.currentTaskIndex).toBe(0);
      expect(result.current.highlight).toBe(true);
      expect(result.current.autoScroll).toBe(true);
      expect(result.current.isAnimating).toBe(false);
    });

    it('应该能够导航到单个任务', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      act(() => {
        result.current.navigateToLines(['line-1']);
      });
      
      expect(result.current.targetLineIds).toEqual(['line-1']);
      expect(result.current.currentTaskIndex).toBe(0);
      expect(result.current.isAnimating).toBe(true);
    });

    it('应该能够导航到多个任务', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      act(() => {
        result.current.navigateToLines(['line-1', 'line-2', 'line-3']);
      });
      
      expect(result.current.targetLineIds).toHaveLength(3);
      expect(result.current.targetLineIds).toEqual(['line-1', 'line-2', 'line-3']);
    });

    it('应该能够清除导航状态', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      act(() => {
        result.current.navigateToLines(['line-1', 'line-2']);
        result.current.clearNavigation();
      });
      
      expect(result.current.targetLineIds).toEqual([]);
      expect(result.current.currentTaskIndex).toBe(0);
      expect(result.current.isAnimating).toBe(false);
    });
  });

  describe('导航选项', () => {
    it('应该支持自定义高亮选项', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      act(() => {
        result.current.navigateToLines(['line-1'], { highlight: false });
      });
      
      expect(result.current.highlight).toBe(false);
    });

    it('应该支持自定义滚动选项', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      act(() => {
        result.current.navigateToLines(['line-1'], { autoScroll: false });
      });
      
      expect(result.current.autoScroll).toBe(false);
    });

    it('应该支持自定义高亮持续时间', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      act(() => {
        result.current.navigateToLines(['line-1'], { highlightDuration: 3000 });
      });
      
      expect(result.current.highlightDuration).toBe(3000);
    });

    it('应该使用默认选项', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      act(() => {
        result.current.navigateToLines(['line-1']);
      });
      
      expect(result.current.highlight).toBe(true);
      expect(result.current.autoScroll).toBe(true);
      expect(result.current.highlightDuration).toBe(2000);
    });
  });

  describe('任务切换', () => {
    it('应该能够跳转到下一个任务', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      act(() => {
        result.current.navigateToLines(['line-1', 'line-2', 'line-3']);
        result.current.navigateToNextTask();
      });
      
      expect(result.current.currentTaskIndex).toBe(1);
    });

    it('应该在最后一个任务后循环到第一个', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      act(() => {
        result.current.navigateToLines(['line-1', 'line-2', 'line-3']);
        result.current.navigateToTaskIndex(2); // 跳到最后一个
        result.current.navigateToNextTask(); // 应该回到第一个
      });
      
      expect(result.current.currentTaskIndex).toBe(0);
    });

    it('应该能够跳转到上一个任务', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      act(() => {
        result.current.navigateToLines(['line-1', 'line-2', 'line-3']);
        result.current.navigateToTaskIndex(2);
        result.current.navigateToPreviousTask();
      });
      
      expect(result.current.currentTaskIndex).toBe(1);
    });

    it('应该在第一个任务前循环到最后一个', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      act(() => {
        result.current.navigateToLines(['line-1', 'line-2', 'line-3']);
        result.current.navigateToPreviousTask(); // 在index 0时向前
      });
      
      expect(result.current.currentTaskIndex).toBe(2); // 应该跳到最后一个
    });

    it('应该能够跳转到指定索引', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      act(() => {
        result.current.navigateToLines(['line-1', 'line-2', 'line-3']);
        result.current.navigateToTaskIndex(1);
      });
      
      expect(result.current.currentTaskIndex).toBe(1);
    });

    it('应该忽略无效的索引', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      act(() => {
        result.current.navigateToLines(['line-1', 'line-2']);
        result.current.navigateToTaskIndex(5); // 超出范围
      });
      
      expect(result.current.currentTaskIndex).toBe(0); // 保持不变
    });

    it('切换任务时应该启用自动滚动', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      act(() => {
        result.current.navigateToLines(['line-1', 'line-2'], { autoScroll: false });
        result.current.navigateToNextTask();
      });
      
      expect(result.current.autoScroll).toBe(true);
    });
  });

  describe('大量任务优化（Task 3.7）', () => {
    it('应该限制高亮任务数量为20个', () => {
      const { result } = renderHook(() => useNavigationStore());
      const manyTasks = Array.from({ length: 50 }, (_, i) => `line-${i}`);
      
      act(() => {
        result.current.navigateToLines(manyTasks);
      });
      
      expect(result.current.targetLineIds).toHaveLength(20);
      expect(result.current.targetLineIds[0]).toBe('line-0');
      expect(result.current.targetLineIds[19]).toBe('line-19');
    });

    it('少于20个任务时应该全部高亮', () => {
      const { result } = renderHook(() => useNavigationStore());
      const tasks = Array.from({ length: 15 }, (_, i) => `line-${i}`);
      
      act(() => {
        result.current.navigateToLines(tasks);
      });
      
      expect(result.current.targetLineIds).toHaveLength(15);
    });

    it('恰好20个任务时应该全部高亮', () => {
      const { result } = renderHook(() => useNavigationStore());
      const tasks = Array.from({ length: 20 }, (_, i) => `line-${i}`);
      
      act(() => {
        result.current.navigateToLines(tasks);
      });
      
      expect(result.current.targetLineIds).toHaveLength(20);
    });
  });

  describe('动画状态管理', () => {
    it('导航时应该设置动画状态', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      act(() => {
        result.current.navigateToLines(['line-1']);
      });
      
      expect(result.current.isAnimating).toBe(true);
    });

    it('应该能够手动设置动画状态', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      act(() => {
        result.current.setAnimating(true);
      });
      expect(result.current.isAnimating).toBe(true);
      
      act(() => {
        result.current.setAnimating(false);
      });
      expect(result.current.isAnimating).toBe(false);
    });

    it('应该能够设置高亮持续时间', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      act(() => {
        result.current.setHighlightDuration(5000);
      });
      
      expect(result.current.highlightDuration).toBe(5000);
    });
  });

  describe('边界情况', () => {
    it('应该处理空数组', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      act(() => {
        result.current.navigateToLines([]);
      });
      
      expect(result.current.targetLineIds).toEqual([]);
    });

    it('空任务列表时不应该切换任务', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      act(() => {
        result.current.navigateToNextTask();
      });
      
      expect(result.current.currentTaskIndex).toBe(0);
    });

    it('空任务列表时不应该跳转到指定索引', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      act(() => {
        result.current.navigateToTaskIndex(5);
      });
      
      expect(result.current.currentTaskIndex).toBe(0);
    });

    it('应该处理负索引', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      act(() => {
        result.current.navigateToLines(['line-1', 'line-2']);
        result.current.navigateToTaskIndex(-1); // 无效索引
      });
      
      expect(result.current.currentTaskIndex).toBe(0); // 保持不变
    });
  });

  describe('状态重置', () => {
    it('重新导航应该重置当前索引', () => {
      const { result } = renderHook(() => useNavigationStore());
      
      act(() => {
        result.current.navigateToLines(['line-1', 'line-2', 'line-3']);
        result.current.navigateToTaskIndex(2);
        result.current.navigateToLines(['line-4', 'line-5']); // 重新导航
      });
      
      expect(result.current.currentTaskIndex).toBe(0); // 应该重置为0
      expect(result.current.targetLineIds).toEqual(['line-4', 'line-5']);
    });
  });
});
