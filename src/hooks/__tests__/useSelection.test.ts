/**
 * useSelection Hook 单元测试
 */

import { renderHook, act } from '@testing-library/react';
import { useSelection } from '../useSelection';
import { describe, it, expect, vi } from 'vitest';

interface TestItem {
  id: string;
  name: string;
}

describe('useSelection', () => {
  const testItems: TestItem[] = [
    { id: '1', name: 'Item 1' },
    { id: '2', name: 'Item 2' },
    { id: '3', name: 'Item 3' },
    { id: '4', name: 'Item 4' },
    { id: '5', name: 'Item 5' },
  ];

  const getId = (item: TestItem) => item.id;

  describe('基础功能', () => {
    it('应该初始化为空选择', () => {
      const { result } = renderHook(() =>
        useSelection({ getId, items: testItems })
      );

      expect(result.current.selectedIds.size).toBe(0);
      expect(result.current.selectedCount).toBe(0);
      expect(result.current.hasSelection).toBe(false);
      expect(result.current.isAllSelected).toBe(false);
    });

    it('应该支持切换选择', () => {
      const { result } = renderHook(() =>
        useSelection({ getId, items: testItems })
      );

      act(() => {
        result.current.toggleSelection('1');
      });

      expect(result.current.isSelected('1')).toBe(true);
      expect(result.current.selectedCount).toBe(1);

      act(() => {
        result.current.toggleSelection('1');
      });

      expect(result.current.isSelected('1')).toBe(false);
      expect(result.current.selectedCount).toBe(0);
    });

    it('应该支持设置选择', () => {
      const { result } = renderHook(() =>
        useSelection({ getId, items: testItems })
      );

      act(() => {
        result.current.setSelection(['1', '2', '3']);
      });

      expect(result.current.selectedCount).toBe(3);
      expect(result.current.isSelected('1')).toBe(true);
      expect(result.current.isSelected('2')).toBe(true);
      expect(result.current.isSelected('3')).toBe(true);
      expect(result.current.isSelected('4')).toBe(false);
    });

    it('应该支持清除选择', () => {
      const { result } = renderHook(() =>
        useSelection({ getId, items: testItems })
      );

      act(() => {
        result.current.setSelection(['1', '2']);
      });

      expect(result.current.selectedCount).toBe(2);

      act(() => {
        result.current.clearSelection();
      });

      expect(result.current.selectedCount).toBe(0);
      expect(result.current.hasSelection).toBe(false);
    });

    it('应该支持全选', () => {
      const { result } = renderHook(() =>
        useSelection({ getId, items: testItems })
      );

      act(() => {
        result.current.selectAll();
      });

      expect(result.current.selectedCount).toBe(testItems.length);
      expect(result.current.isAllSelected).toBe(true);
      testItems.forEach(item => {
        expect(result.current.isSelected(item.id)).toBe(true);
      });
    });
  });

  describe('点击处理', () => {
    it('应该支持普通点击（单选）', () => {
      const { result } = renderHook(() =>
        useSelection({ getId, items: testItems })
      );

      // 先选择多个
      act(() => {
        result.current.setSelection(['1', '2', '3']);
      });

      expect(result.current.selectedCount).toBe(3);

      // 普通点击应该切换为单选
      act(() => {
        result.current.handleClick('4', {
          ctrlKey: false,
          shiftKey: false,
          metaKey: false,
        } as React.MouseEvent);
      });

      expect(result.current.selectedCount).toBe(1);
      expect(result.current.isSelected('4')).toBe(true);
      expect(result.current.isSelected('1')).toBe(false);
    });

    it('应该支持 Ctrl+点击（多选）', () => {
      const { result } = renderHook(() =>
        useSelection({ getId, items: testItems })
      );

      // Ctrl+点击添加选择
      act(() => {
        result.current.handleClick('1', {
          ctrlKey: true,
          shiftKey: false,
          metaKey: false,
        } as React.MouseEvent);
      });

      expect(result.current.selectedCount).toBe(1);
      expect(result.current.isSelected('1')).toBe(true);

      // Ctrl+点击再添加
      act(() => {
        result.current.handleClick('3', {
          ctrlKey: true,
          shiftKey: false,
          metaKey: false,
        } as React.MouseEvent);
      });

      expect(result.current.selectedCount).toBe(2);
      expect(result.current.isSelected('1')).toBe(true);
      expect(result.current.isSelected('3')).toBe(true);

      // Ctrl+点击取消选择
      act(() => {
        result.current.handleClick('1', {
          ctrlKey: true,
          shiftKey: false,
          metaKey: false,
        } as React.MouseEvent);
      });

      expect(result.current.selectedCount).toBe(1);
      expect(result.current.isSelected('1')).toBe(false);
      expect(result.current.isSelected('3')).toBe(true);
    });

    it('应该支持 Shift+点击（范围选择）', () => {
      const { result } = renderHook(() =>
        useSelection({ getId, items: testItems })
      );

      // 先选择第1项
      act(() => {
        result.current.handleClick('1', {
          ctrlKey: false,
          shiftKey: false,
          metaKey: false,
        } as React.MouseEvent);
      });

      expect(result.current.selectedCount).toBe(1);

      // Shift+点击第4项，应该选中1-4
      act(() => {
        result.current.handleClick('4', {
          ctrlKey: false,
          shiftKey: true,
          metaKey: false,
        } as React.MouseEvent);
      });

      expect(result.current.selectedCount).toBe(4);
      expect(result.current.isSelected('1')).toBe(true);
      expect(result.current.isSelected('2')).toBe(true);
      expect(result.current.isSelected('3')).toBe(true);
      expect(result.current.isSelected('4')).toBe(true);
      expect(result.current.isSelected('5')).toBe(false);
    });

    it('应该支持反向范围选择', () => {
      const { result } = renderHook(() =>
        useSelection({ getId, items: testItems })
      );

      // 先选择第4项
      act(() => {
        result.current.handleClick('4', {
          ctrlKey: false,
          shiftKey: false,
          metaKey: false,
        } as React.MouseEvent);
      });

      // Shift+点击第2项，应该选中2-4
      act(() => {
        result.current.handleClick('2', {
          ctrlKey: false,
          shiftKey: true,
          metaKey: false,
        } as React.MouseEvent);
      });

      expect(result.current.selectedCount).toBe(3);
      expect(result.current.isSelected('2')).toBe(true);
      expect(result.current.isSelected('3')).toBe(true);
      expect(result.current.isSelected('4')).toBe(true);
    });

    it('应该支持 Meta+点击（Mac的Cmd键）', () => {
      const { result } = renderHook(() =>
        useSelection({ getId, items: testItems })
      );

      act(() => {
        result.current.handleClick('1', {
          ctrlKey: false,
          shiftKey: false,
          metaKey: true,
        } as React.MouseEvent);
      });

      expect(result.current.selectedCount).toBe(1);

      act(() => {
        result.current.handleClick('2', {
          ctrlKey: false,
          shiftKey: false,
          metaKey: true,
        } as React.MouseEvent);
      });

      expect(result.current.selectedCount).toBe(2);
    });
  });

  describe('选择回调', () => {
    it('应该在选择变化时触发回调', () => {
      const onSelectionChange = vi.fn();

      const { result } = renderHook(() =>
        useSelection({ getId, items: testItems, onSelectionChange })
      );

      act(() => {
        result.current.toggleSelection('1');
      });

      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      expect(onSelectionChange).toHaveBeenCalledWith(
        expect.any(Set),
        expect.arrayContaining([{ id: '1', name: 'Item 1' }])
      );
    });

    it('应该在全选时触发回调', () => {
      const onSelectionChange = vi.fn();

      const { result } = renderHook(() =>
        useSelection({ getId, items: testItems, onSelectionChange })
      );

      act(() => {
        result.current.selectAll();
      });

      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      const [selectedSet, selectedItems] = onSelectionChange.mock.calls[0];
      expect(selectedSet.size).toBe(testItems.length);
      expect(selectedItems).toHaveLength(testItems.length);
    });

    it('应该在清除选择时触发回调', () => {
      const onSelectionChange = vi.fn();

      const { result } = renderHook(() =>
        useSelection({ getId, items: testItems, onSelectionChange })
      );

      act(() => {
        result.current.setSelection(['1', '2']);
      });

      onSelectionChange.mockClear();

      act(() => {
        result.current.clearSelection();
      });

      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      expect(onSelectionChange).toHaveBeenCalledWith(new Set(), []);
    });
  });

  describe('状态计算', () => {
    it('应该正确计算 selectedCount', () => {
      const { result } = renderHook(() =>
        useSelection({ getId, items: testItems })
      );

      expect(result.current.selectedCount).toBe(0);

      act(() => {
        result.current.setSelection(['1', '2', '3']);
      });

      expect(result.current.selectedCount).toBe(3);
    });

    it('应该正确计算 isAllSelected', () => {
      const { result } = renderHook(() =>
        useSelection({ getId, items: testItems })
      );

      expect(result.current.isAllSelected).toBe(false);

      act(() => {
        result.current.selectAll();
      });

      expect(result.current.isAllSelected).toBe(true);

      act(() => {
        result.current.toggleSelection('1');
      });

      expect(result.current.isAllSelected).toBe(false);
    });

    it('应该正确计算 hasSelection', () => {
      const { result } = renderHook(() =>
        useSelection({ getId, items: testItems })
      );

      expect(result.current.hasSelection).toBe(false);

      act(() => {
        result.current.toggleSelection('1');
      });

      expect(result.current.hasSelection).toBe(true);

      act(() => {
        result.current.clearSelection();
      });

      expect(result.current.hasSelection).toBe(false);
    });
  });

  describe('边界情况', () => {
    it('应该处理空列表', () => {
      const { result } = renderHook(() =>
        useSelection({ getId, items: [] })
      );

      act(() => {
        result.current.selectAll();
      });

      expect(result.current.selectedCount).toBe(0);
      expect(result.current.isAllSelected).toBe(false);
    });

    it('应该处理不存在的ID', () => {
      const { result } = renderHook(() =>
        useSelection({ getId, items: testItems })
      );

      act(() => {
        result.current.toggleSelection('non-existent');
      });

      expect(result.current.selectedCount).toBe(1);
      expect(result.current.isSelected('non-existent')).toBe(true);
    });

    it('应该处理重复选择同一项', () => {
      const { result } = renderHook(() =>
        useSelection({ getId, items: testItems })
      );

      act(() => {
        result.current.setSelection(['1', '1', '2', '2']);
      });

      // Set 会自动去重
      expect(result.current.selectedCount).toBe(2);
    });
  });
});
