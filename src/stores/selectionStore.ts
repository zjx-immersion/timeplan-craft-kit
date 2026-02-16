/**
 * SelectionStore - 批量操作选择状态管理
 * 
 * 用于管理表格视图和矩阵视图中的任务选择状态，支持批量操作
 * 
 * @version 1.0.0
 * @date 2026-02-12
 */

import { create } from 'zustand';

/**
 * 选择状态接口
 */
interface SelectionState {
  // ========== 选择状态 ==========
  /** 已选中的Line ID集合（使用Set提高查询性能） */
  selectedLineIds: Set<string>;
  
  /** 是否处于选择模式 */
  selectionMode: boolean;
  
  // ========== Actions ==========
  /**
   * 切换单个任务的选择状态
   * @param lineId - Line ID
   */
  toggleSelection: (lineId: string) => void;
  
  /**
   * 全选任务
   * @param lineIds - 要选中的Line ID数组
   */
  selectAll: (lineIds: string[]) => void;
  
  /**
   * 清除所有选择
   */
  clearSelection: () => void;
  
  /**
   * 进入选择模式
   */
  enterSelectionMode: () => void;
  
  /**
   * 退出选择模式（同时清除选择）
   */
  exitSelectionMode: () => void;
  
  /**
   * 批量选择任务（用于按条件选择）
   * @param lineIds - 要选中的Line ID数组
   */
  selectMultiple: (lineIds: string[]) => void;
  
  /**
   * 批量取消选择任务
   * @param lineIds - 要取消选中的Line ID数组
   */
  deselectMultiple: (lineIds: string[]) => void;
  
  /**
   * 检查是否已选中指定任务
   * @param lineId - Line ID
   * @returns 是否已选中
   */
  isSelected: (lineId: string) => boolean;
  
  /**
   * 获取选中数量
   * @returns 选中的任务数量
   */
  getSelectedCount: () => number;
  
  /**
   * 获取选中的ID数组（用于批量操作）
   * @returns 选中的Line ID数组
   */
  getSelectedIds: () => string[];
}

/**
 * 默认状态
 */
const defaultState = {
  selectedLineIds: new Set<string>(),
  selectionMode: false,
};

/**
 * 创建SelectionStore
 */
export const useSelectionStore = create<SelectionState>((set, get) => ({
  ...defaultState,
  
  /**
   * 切换单个任务的选择状态
   */
  toggleSelection: (lineId: string) => {
    const currentSelected = get().selectedLineIds;
    const newSelected = new Set(currentSelected);
    
    if (newSelected.has(lineId)) {
      newSelected.delete(lineId);
      console.log('[SelectionStore] ❌ 取消选择:', lineId);
    } else {
      newSelected.add(lineId);
      console.log('[SelectionStore] ✅ 选中:', lineId);
    }
    
    set({ selectedLineIds: newSelected });
    
    console.log('[SelectionStore] 📊 当前选中数量:', newSelected.size);
  },
  
  /**
   * 全选任务
   */
  selectAll: (lineIds: string[]) => {
    const newSelected = new Set(lineIds);
    
    console.log('[SelectionStore] 🔘 全选:', {
      count: newSelected.size,
      lineIds: lineIds.slice(0, 5), // 只显示前5个
      hasMore: lineIds.length > 5,
    });
    
    set({ selectedLineIds: newSelected });
  },
  
  /**
   * 清除所有选择
   */
  clearSelection: () => {
    const currentCount = get().selectedLineIds.size;
    
    console.log('[SelectionStore] 🔄 清除选择:', { previousCount: currentCount });
    
    set({ selectedLineIds: new Set<string>() });
  },
  
  /**
   * 进入选择模式
   */
  enterSelectionMode: () => {
    console.log('[SelectionStore] 🎯 进入选择模式');
    set({ selectionMode: true });
  },
  
  /**
   * 退出选择模式
   */
  exitSelectionMode: () => {
    console.log('[SelectionStore] 🚪 退出选择模式');
    set({ 
      selectionMode: false,
      selectedLineIds: new Set<string>(), // 退出时清除选择
    });
  },
  
  /**
   * 批量选择任务
   */
  selectMultiple: (lineIds: string[]) => {
    const currentSelected = get().selectedLineIds;
    const newSelected = new Set([...currentSelected, ...lineIds]);
    
    console.log('[SelectionStore] ➕ 批量选择:', {
      added: lineIds.length,
      totalSelected: newSelected.size,
    });
    
    set({ selectedLineIds: newSelected });
  },
  
  /**
   * 批量取消选择任务
   */
  deselectMultiple: (lineIds: string[]) => {
    const currentSelected = get().selectedLineIds;
    const newSelected = new Set(currentSelected);
    
    lineIds.forEach(id => newSelected.delete(id));
    
    console.log('[SelectionStore] ➖ 批量取消选择:', {
      removed: lineIds.length,
      totalSelected: newSelected.size,
    });
    
    set({ selectedLineIds: newSelected });
  },
  
  /**
   * 检查是否已选中指定任务
   */
  isSelected: (lineId: string) => {
    return get().selectedLineIds.has(lineId);
  },
  
  /**
   * 获取选中数量
   */
  getSelectedCount: () => {
    return get().selectedLineIds.size;
  },
  
  /**
   * 获取选中的ID数组
   */
  getSelectedIds: () => {
    return Array.from(get().selectedLineIds);
  },
}));

/**
 * 导出类型定义
 */
export type { SelectionState };
