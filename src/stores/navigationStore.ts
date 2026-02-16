/**
 * NavigationStore - 甘特图跳转导航状态管理
 * 
 * 用于从矩阵视图跳转到甘特图视图时的状态传递和动画控制
 * 
 * @version 1.0.0
 * @date 2026-02-12
 */

import { create } from 'zustand';

/**
 * 导航选项
 */
export interface NavigationOptions {
  /** 是否高亮目标Line，默认true */
  highlight?: boolean;
  /** 是否自动滚动到目标，默认true */
  autoScroll?: boolean;
  /** 是否自动计算并调整日期范围，默认true */
  calculateDateRange?: boolean;
  /** 高亮持续时间（毫秒），默认2000 */
  highlightDuration?: number;
}

/**
 * 导航状态接口
 */
interface NavigationState {
  // ========== 导航目标 ==========
  /** 要跳转的Line ID列表 */
  targetLineIds: string[];
  /** 目标Timeline ID（可选，用于过滤显示） */
  targetTimelineId?: string;
  /** 当前导航到的任务索引（用于批量跳转时的任务切换） */
  currentTaskIndex: number;
  
  // ========== 视图状态 ==========
  /** 是否高亮 */
  highlight: boolean;
  /** 是否自动滚动 */
  autoScroll: boolean;
  /** 自动调整的日期范围 */
  dateRange?: {
    start: Date;
    end: Date;
  };
  
  // ========== 动画状态 ==========
  /** 是否正在执行动画 */
  isAnimating: boolean;
  /** 高亮持续时间（毫秒） */
  highlightDuration: number;
  
  // ========== Actions ==========
  /**
   * 导航到指定Line
   * @param lineIds - Line ID数组
   * @param options - 导航选项
   */
  navigateToLines: (lineIds: string[], options?: NavigationOptions) => void;
  
  /**
   * 清除导航状态
   */
  clearNavigation: () => void;
  
  /**
   * 设置高亮持续时间
   * @param ms - 持续时间（毫秒）
   */
  setHighlightDuration: (ms: number) => void;
  
  /**
   * 设置动画状态
   * @param isAnimating - 是否正在动画
   */
  setAnimating: (isAnimating: boolean) => void;
  
  /**
   * 跳转到下一个任务
   */
  navigateToNextTask: () => void;
  
  /**
   * 跳转到上一个任务
   */
  navigateToPreviousTask: () => void;
  
  /**
   * 跳转到指定索引的任务
   * @param index - 任务索引
   */
  navigateToTaskIndex: (index: number) => void;
}

/**
 * 默认状态
 */
const defaultState = {
  targetLineIds: [],
  targetTimelineId: undefined,
  currentTaskIndex: 0,
  highlight: true,
  autoScroll: true,
  dateRange: undefined,
  isAnimating: false,
  highlightDuration: 2000,
};

/**
 * 最大高亮任务数量（Task 3.7：优化大量任务跳转）
 */
const MAX_HIGHLIGHT_COUNT = 20;

/**
 * 创建NavigationStore
 */
export const useNavigationStore = create<NavigationState>((set, get) => ({
  ...defaultState,
  
  /**
   * 导航到指定Line
   */
  navigateToLines: (lineIds: string[], options?: NavigationOptions) => {
    console.log('[NavigationStore] 🎯 navigateToLines:', {
      lineIds,
      options,
      count: lineIds.length,
    });
    
    // 合并选项（使用默认值）
    const {
      highlight = true,
      autoScroll = true,
      calculateDateRange = true,
      highlightDuration = 2000,
    } = options || {};
    
    // Task 3.7：优化大量任务跳转
    // 如果任务数量超过MAX_HIGHLIGHT_COUNT，只高亮前MAX_HIGHLIGHT_COUNT个
    let effectiveLineIds = lineIds;
    if (lineIds.length > MAX_HIGHLIGHT_COUNT) {
      console.warn(`[NavigationStore] ⚠️ 任务数量过多 (${lineIds.length})，仅高亮前${MAX_HIGHLIGHT_COUNT}个`);
      effectiveLineIds = lineIds.slice(0, MAX_HIGHLIGHT_COUNT);
    }
    
    // 计算日期范围（如果需要）
    let dateRange: { start: Date; end: Date } | undefined = undefined;
    
    if (calculateDateRange && lineIds.length > 0) {
      // 注意：这里只是设置标志，实际日期范围由TimelinePanel根据Line数据计算
      // 因为NavigationStore不应该依赖TimePlan数据
      dateRange = undefined; // 由TimelinePanel计算
    }
    
    set({
      targetLineIds: effectiveLineIds,
      currentTaskIndex: 0, // 重置为第一个任务
      highlight,
      autoScroll,
      dateRange,
      highlightDuration,
      isAnimating: true,
    });
    
    console.log('[NavigationStore] ✅ 导航状态已更新:', {
      targetLineIds: effectiveLineIds,
      currentTaskIndex: 0,
      highlight,
      autoScroll,
      highlightDuration,
    });
  },
  
  /**
   * 清除导航状态
   */
  clearNavigation: () => {
    console.log('[NavigationStore] 🔄 clearNavigation - 清除导航状态');
    set(defaultState);
  },
  
  /**
   * 设置高亮持续时间
   */
  setHighlightDuration: (ms: number) => {
    console.log('[NavigationStore] ⏱️ setHighlightDuration:', ms);
    set({ highlightDuration: ms });
  },
  
  /**
   * 设置动画状态
   */
  setAnimating: (isAnimating: boolean) => {
    set({ isAnimating });
  },
  
  /**
   * 跳转到下一个任务（Task 3.7）
   */
  navigateToNextTask: () => {
    const state = get();
    if (state.targetLineIds.length === 0) return;
    
    const nextIndex = (state.currentTaskIndex + 1) % state.targetLineIds.length;
    console.log('[NavigationStore] ➡️ navigateToNextTask:', {
      currentIndex: state.currentTaskIndex,
      nextIndex,
      total: state.targetLineIds.length,
    });
    
    set({ 
      currentTaskIndex: nextIndex,
      autoScroll: true, // 切换任务时自动滚动
    });
  },
  
  /**
   * 跳转到上一个任务（Task 3.7）
   */
  navigateToPreviousTask: () => {
    const state = get();
    if (state.targetLineIds.length === 0) return;
    
    const prevIndex = state.currentTaskIndex === 0 
      ? state.targetLineIds.length - 1 
      : state.currentTaskIndex - 1;
      
    console.log('[NavigationStore] ⬅️ navigateToPreviousTask:', {
      currentIndex: state.currentTaskIndex,
      prevIndex,
      total: state.targetLineIds.length,
    });
    
    set({ 
      currentTaskIndex: prevIndex,
      autoScroll: true, // 切换任务时自动滚动
    });
  },
  
  /**
   * 跳转到指定索引的任务（Task 3.7）
   */
  navigateToTaskIndex: (index: number) => {
    const state = get();
    if (state.targetLineIds.length === 0) return;
    if (index < 0 || index >= state.targetLineIds.length) return;
    
    console.log('[NavigationStore] 🔢 navigateToTaskIndex:', {
      currentIndex: state.currentTaskIndex,
      newIndex: index,
      total: state.targetLineIds.length,
    });
    
    set({ 
      currentTaskIndex: index,
      autoScroll: true, // 切换任务时自动滚动
    });
  },
}));

/**
 * 导出类型定义
 */
export type { NavigationState };
