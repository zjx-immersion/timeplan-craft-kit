/**
 * useSelection - 批量选择 Hook
 * 
 * 🎯 功能:
 * - 支持单选、多选、范围选择
 * - Ctrl+点击：切换选择状态
 * - Shift+点击：范围选择
 * - Ctrl+A：全选
 * - 选择状态管理
 * 
 * 📋 使用场景:
 * - 批量删除
 * - 批量编辑
 * - 批量移动
 */

import { useState, useCallback, useMemo } from 'react';

export interface UseSelectionOptions<T> {
  /**
   * 获取项目ID的函数
   */
  getId: (item: T) => string;
  
  /**
   * 所有可选项目列表
   */
  items: T[];
  
  /**
   * 选择变化回调
   */
  onSelectionChange?: (selectedIds: Set<string>, selectedItems: T[]) => void;
}

export interface UseSelectionResult {
  /**
   * 选中的ID集合
   */
  selectedIds: Set<string>;
  
  /**
   * 是否选中
   */
  isSelected: (id: string) => boolean;
  
  /**
   * 切换选择状态
   */
  toggleSelection: (id: string) => void;
  
  /**
   * 设置选择
   */
  setSelection: (ids: string[]) => void;
  
  /**
   * 清除选择
   */
  clearSelection: () => void;
  
  /**
   * 全选
   */
  selectAll: () => void;
  
  /**
   * 处理点击（支持 Ctrl 和 Shift）
   */
  handleClick: (id: string, event: React.MouseEvent | MouseEvent) => void;
  
  /**
   * 选中的数量
   */
  selectedCount: number;
  
  /**
   * 是否全选
   */
  isAllSelected: boolean;
  
  /**
   * 是否有选中
   */
  hasSelection: boolean;
}

export function useSelection<T>({
  getId,
  items,
  onSelectionChange,
}: UseSelectionOptions<T>): UseSelectionResult {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);

  /**
   * 判断是否选中
   */
  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds]
  );

  /**
   * 切换选择状态
   */
  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      
      // 触发回调
      if (onSelectionChange) {
        const selectedItems = items.filter(item => newSet.has(getId(item)));
        onSelectionChange(newSet, selectedItems);
      }
      
      return newSet;
    });
    
    setLastSelectedId(id);
  }, [items, getId, onSelectionChange]);

  /**
   * 设置选择
   */
  const setSelection = useCallback((ids: string[]) => {
    const newSet = new Set(ids);
    setSelectedIds(newSet);
    
    // 触发回调
    if (onSelectionChange) {
      const selectedItems = items.filter(item => newSet.has(getId(item)));
      onSelectionChange(newSet, selectedItems);
    }
  }, [items, getId, onSelectionChange]);

  /**
   * 清除选择
   */
  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setLastSelectedId(null);
    
    // 触发回调
    if (onSelectionChange) {
      onSelectionChange(new Set(), []);
    }
  }, [onSelectionChange]);

  /**
   * 全选
   */
  const selectAll = useCallback(() => {
    const allIds = items.map(getId);
    const newSet = new Set(allIds);
    setSelectedIds(newSet);
    
    // 触发回调
    if (onSelectionChange) {
      onSelectionChange(newSet, items);
    }
  }, [items, getId, onSelectionChange]);

  /**
   * 范围选择（从 lastSelectedId 到 currentId）
   */
  const selectRange = useCallback((currentId: string) => {
    if (!lastSelectedId) {
      toggleSelection(currentId);
      return;
    }

    const allIds = items.map(getId);
    const lastIndex = allIds.indexOf(lastSelectedId);
    const currentIndex = allIds.indexOf(currentId);

    if (lastIndex === -1 || currentIndex === -1) {
      toggleSelection(currentId);
      return;
    }

    const startIndex = Math.min(lastIndex, currentIndex);
    const endIndex = Math.max(lastIndex, currentIndex);
    const rangeIds = allIds.slice(startIndex, endIndex + 1);

    setSelectedIds(prev => {
      const newSet = new Set(prev);
      rangeIds.forEach(id => newSet.add(id));
      
      // 触发回调
      if (onSelectionChange) {
        const selectedItems = items.filter(item => newSet.has(getId(item)));
        onSelectionChange(newSet, selectedItems);
      }
      
      return newSet;
    });
  }, [lastSelectedId, items, getId, toggleSelection, onSelectionChange]);

  /**
   * 处理点击（支持 Ctrl 和 Shift 修饰键）
   */
  const handleClick = useCallback(
    (id: string, event: React.MouseEvent | MouseEvent) => {
      if (event.ctrlKey || event.metaKey) {
        // Ctrl/Cmd + 点击：切换选择
        toggleSelection(id);
      } else if (event.shiftKey) {
        // Shift + 点击：范围选择
        selectRange(id);
      } else {
        // 普通点击：单选
        setSelection([id]);
        setLastSelectedId(id);
      }
    },
    [toggleSelection, selectRange, setSelection]
  );

  /**
   * 计算选中数量
   */
  const selectedCount = useMemo(() => selectedIds.size, [selectedIds]);

  /**
   * 是否全选
   */
  const isAllSelected = useMemo(
    () => items.length > 0 && selectedIds.size === items.length,
    [items.length, selectedIds.size]
  );

  /**
   * 是否有选中
   */
  const hasSelection = useMemo(() => selectedIds.size > 0, [selectedIds.size]);

  return {
    selectedIds,
    isSelected,
    toggleSelection,
    setSelection,
    clearSelection,
    selectAll,
    handleClick,
    selectedCount,
    isAllSelected,
    hasSelection,
  };
}
