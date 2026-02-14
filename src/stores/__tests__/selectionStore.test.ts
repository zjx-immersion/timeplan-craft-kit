/**
 * SelectionStore 单元测试
 * 
 * 测试范围：
 * - 选择状态管理
 * - 批量操作
 * - 选择模式切换
 * 
 * @version 1.0.0
 * @date 2026-02-12
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSelectionStore } from '../selectionStore';

describe('SelectionStore', () => {
  beforeEach(() => {
    // 每个测试前重置store
    const { result } = renderHook(() => useSelectionStore());
    act(() => {
      result.current.clearSelection();
      result.current.exitSelectionMode();
    });
  });

  describe('基础选择功能', () => {
    it('应该正确初始化状态', () => {
      const { result } = renderHook(() => useSelectionStore());
      
      expect(result.current.selectedLineIds.size).toBe(0);
      expect(result.current.selectionMode).toBe(false);
      expect(result.current.getSelectedCount()).toBe(0);
    });

    it('应该能够切换单个任务的选择状态', () => {
      const { result } = renderHook(() => useSelectionStore());
      
      act(() => {
        result.current.toggleSelection('line-1');
      });
      
      expect(result.current.selectedLineIds.has('line-1')).toBe(true);
      expect(result.current.getSelectedCount()).toBe(1);
      
      act(() => {
        result.current.toggleSelection('line-1');
      });
      
      expect(result.current.selectedLineIds.has('line-1')).toBe(false);
      expect(result.current.getSelectedCount()).toBe(0);
    });

    it('应该能够选择多个任务', () => {
      const { result } = renderHook(() => useSelectionStore());
      
      act(() => {
        result.current.toggleSelection('line-1');
        result.current.toggleSelection('line-2');
        result.current.toggleSelection('line-3');
      });
      
      expect(result.current.getSelectedCount()).toBe(3);
      expect(result.current.selectedLineIds.has('line-1')).toBe(true);
      expect(result.current.selectedLineIds.has('line-2')).toBe(true);
      expect(result.current.selectedLineIds.has('line-3')).toBe(true);
    });
  });

  describe('批量操作', () => {
    it('应该能够全选', () => {
      const { result } = renderHook(() => useSelectionStore());
      const lineIds = ['line-1', 'line-2', 'line-3', 'line-4', 'line-5'];
      
      act(() => {
        result.current.selectAll(lineIds);
      });
      
      expect(result.current.getSelectedCount()).toBe(5);
      lineIds.forEach(id => {
        expect(result.current.selectedLineIds.has(id)).toBe(true);
      });
    });

    it('应该能够清除所有选择', () => {
      const { result } = renderHook(() => useSelectionStore());
      
      act(() => {
        result.current.selectAll(['line-1', 'line-2', 'line-3']);
        result.current.clearSelection();
      });
      
      expect(result.current.getSelectedCount()).toBe(0);
      expect(result.current.selectedLineIds.size).toBe(0);
    });

    it('应该能够批量选择', () => {
      const { result } = renderHook(() => useSelectionStore());
      
      act(() => {
        result.current.toggleSelection('line-1');
        result.current.selectMultiple(['line-2', 'line-3', 'line-4']);
      });
      
      expect(result.current.getSelectedCount()).toBe(4);
      expect(result.current.selectedLineIds.has('line-1')).toBe(true);
      expect(result.current.selectedLineIds.has('line-4')).toBe(true);
    });

    it('应该能够批量取消选择', () => {
      const { result } = renderHook(() => useSelectionStore());
      
      act(() => {
        result.current.selectAll(['line-1', 'line-2', 'line-3', 'line-4', 'line-5']);
        result.current.deselectMultiple(['line-2', 'line-4']);
      });
      
      expect(result.current.getSelectedCount()).toBe(3);
      expect(result.current.selectedLineIds.has('line-1')).toBe(true);
      expect(result.current.selectedLineIds.has('line-2')).toBe(false);
      expect(result.current.selectedLineIds.has('line-3')).toBe(true);
      expect(result.current.selectedLineIds.has('line-4')).toBe(false);
      expect(result.current.selectedLineIds.has('line-5')).toBe(true);
    });
  });

  describe('选择模式', () => {
    it('应该能够进入选择模式', () => {
      const { result } = renderHook(() => useSelectionStore());
      
      act(() => {
        result.current.enterSelectionMode();
      });
      
      expect(result.current.selectionMode).toBe(true);
    });

    it('应该能够退出选择模式', () => {
      const { result } = renderHook(() => useSelectionStore());
      
      act(() => {
        result.current.enterSelectionMode();
        result.current.toggleSelection('line-1');
        result.current.exitSelectionMode();
      });
      
      expect(result.current.selectionMode).toBe(false);
      expect(result.current.getSelectedCount()).toBe(0);
    });

    it('退出选择模式应该清除所有选择', () => {
      const { result } = renderHook(() => useSelectionStore());
      
      act(() => {
        result.current.enterSelectionMode();
        result.current.selectAll(['line-1', 'line-2', 'line-3']);
        result.current.exitSelectionMode();
      });
      
      expect(result.current.selectedLineIds.size).toBe(0);
    });
  });

  describe('辅助方法', () => {
    it('isSelected应该正确检查选择状态', () => {
      const { result } = renderHook(() => useSelectionStore());
      
      act(() => {
        result.current.toggleSelection('line-1');
      });
      
      expect(result.current.isSelected('line-1')).toBe(true);
      expect(result.current.isSelected('line-2')).toBe(false);
    });

    it('getSelectedIds应该返回正确的ID数组', () => {
      const { result } = renderHook(() => useSelectionStore());
      
      act(() => {
        result.current.selectAll(['line-1', 'line-2', 'line-3']);
      });
      
      const ids = result.current.getSelectedIds();
      expect(ids).toHaveLength(3);
      expect(ids).toContain('line-1');
      expect(ids).toContain('line-2');
      expect(ids).toContain('line-3');
    });

    it('getSelectedCount应该返回正确的数量', () => {
      const { result } = renderHook(() => useSelectionStore());
      
      expect(result.current.getSelectedCount()).toBe(0);
      
      act(() => {
        result.current.toggleSelection('line-1');
      });
      expect(result.current.getSelectedCount()).toBe(1);
      
      act(() => {
        result.current.toggleSelection('line-2');
      });
      expect(result.current.getSelectedCount()).toBe(2);
    });
  });

  describe('性能测试', () => {
    it('应该高效处理大量选择操作', () => {
      const { result } = renderHook(() => useSelectionStore());
      const largeList = Array.from({ length: 1000 }, (_, i) => `line-${i}`);
      
      const startTime = performance.now();
      
      act(() => {
        result.current.selectAll(largeList);
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(result.current.getSelectedCount()).toBe(1000);
      expect(duration).toBeLessThan(100); // 应该在100ms内完成
    });

    it('应该高效执行查询操作', () => {
      const { result } = renderHook(() => useSelectionStore());
      const largeList = Array.from({ length: 1000 }, (_, i) => `line-${i}`);
      
      act(() => {
        result.current.selectAll(largeList);
      });
      
      const startTime = performance.now();
      
      // 执行1000次查询
      for (let i = 0; i < 1000; i++) {
        result.current.isSelected(`line-${i}`);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(10); // Set查询应该非常快
    });
  });

  describe('边界情况', () => {
    it('应该处理空数组', () => {
      const { result } = renderHook(() => useSelectionStore());
      
      act(() => {
        result.current.selectAll([]);
      });
      
      expect(result.current.getSelectedCount()).toBe(0);
    });

    it('应该处理重复的ID', () => {
      const { result } = renderHook(() => useSelectionStore());
      
      act(() => {
        result.current.selectAll(['line-1', 'line-1', 'line-2']);
      });
      
      expect(result.current.getSelectedCount()).toBe(2); // Set自动去重
    });

    it('应该处理不存在的ID', () => {
      const { result } = renderHook(() => useSelectionStore());
      
      expect(result.current.isSelected('non-existent')).toBe(false);
      
      act(() => {
        result.current.toggleSelection('non-existent');
      });
      
      expect(result.current.isSelected('non-existent')).toBe(true);
    });
  });
});
