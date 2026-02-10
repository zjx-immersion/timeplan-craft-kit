/**
 * Zustand 状态管理 Store
 * 使用 immer 中间件实现不可变数据更新
 * 使用 persist 中间件实现数据持久化
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { TimeplanDataExtended } from '../db/timeplanDB';
import type { Line, Timeline, Relation } from '../types/timeplanSchema';
import { saveTimePlan, loadTimePlan } from '../db/timeplanDB';

/**
 * 视图类型
 */
export type ViewType = 'gantt' | 'table' | 'matrix' | 'version' | 'iteration';

/**
 * 视图状态
 */
export interface ViewState {
  currentView: ViewType;
  editMode: boolean;
  selectedIds: string[];
  hoveredId: string | null;
}

/**
 * TimePlan Store 接口
 */
interface TimeplanStore {
  // 数据
  data: TimeplanDataExtended;
  
  // 视图状态
  viewState: ViewState;
  
  // 加载状态
  isLoading: boolean;
  currentPlanId: string | null;
  
  // ===== 数据操作 Actions =====
  
  /**
   * 设置完整数据
   */
  setData: (data: TimeplanDataExtended) => void;
  
  /**
   * 加载 TimePlan
   */
  loadPlan: (id: string) => Promise<void>;
  
  /**
   * 保存 TimePlan
   */
  savePlan: () => Promise<void>;
  
  // ----- Timeline 操作 -----
  
  /**
   * 添加 Timeline
   */
  addTimeline: (timeline: Timeline) => void;
  
  /**
   * 更新 Timeline
   */
  updateTimeline: (id: string, updates: Partial<Timeline>) => void;
  
  /**
   * 删除 Timeline
   */
  deleteTimeline: (id: string) => void;
  
  // ----- Line 操作 -----
  
  /**
   * 添加 Line
   */
  addLine: (line: Line) => void;
  
  /**
   * 更新 Line
   */
  updateLine: (id: string, updates: Partial<Line>) => void;
  
  /**
   * 批量更新 Line
   */
  updateLines: (updates: Array<{ id: string; updates: Partial<Line> }>) => void;
  
  /**
   * 删除 Line
   */
  deleteLine: (id: string) => void;
  
  /**
   * 批量删除 Line
   */
  deleteLines: (ids: string[]) => void;
  
  // ----- Relation 操作 -----
  
  /**
   * 添加 Relation
   */
  addRelation: (relation: Relation) => void;
  
  /**
   * 更新 Relation
   */
  updateRelation: (id: string, updates: Partial<Relation>) => void;
  
  /**
   * 删除 Relation
   */
  deleteRelation: (id: string) => void;
  
  // ===== 视图状态 Actions =====
  
  /**
   * 切换视图
   */
  setView: (view: ViewType) => void;
  
  /**
   * 切换编辑模式
   */
  setEditMode: (editMode: boolean) => void;
  
  /**
   * 设置选中项
   */
  setSelectedIds: (ids: string[]) => void;
  
  /**
   * 设置悬停项
   */
  setHoveredId: (id: string | null) => void;
  
  // ===== 工具函数 =====
  
  /**
   * 重置状态
   */
  reset: () => void;
}

/**
 * 初始状态
 */
const initialState: Pick<TimeplanStore, 'data' | 'viewState' | 'isLoading' | 'currentPlanId'> = {
  data: {
    timelines: [],
    lines: [],
    relations: [],
    baselines: [],
    baselineRanges: [],
    versions: [],
    iterationTasks: [],
    products: [],
    teams: [],
    modules: [],
    columnConfig: [],
  },
  viewState: {
    currentView: 'gantt',
    editMode: false,
    selectedIds: [],
    hoveredId: null,
  },
  isLoading: false,
  currentPlanId: null,
};

/**
 * 创建 Zustand Store
 */
export const useTimeplanStore = create<TimeplanStore>()(
  immer(
    persist(
      (set, get) => ({
        ...initialState,
        
        // ===== 数据操作 =====
        
        setData: (data) =>
          set((state) => {
            state.data = data;
          }),
        
        loadPlan: async (id) => {
          set((state) => {
            state.isLoading = true;
          });
          
          try {
            const data = await loadTimePlan(id);
            if (data) {
              set((state) => {
                state.data = data;
                state.currentPlanId = id;
                state.isLoading = false;
              });
            } else {
              console.warn(`[Store] TimePlan ${id} 不存在`);
              set((state) => {
                state.isLoading = false;
              });
            }
          } catch (error) {
            console.error('[Store] 加载失败:', error);
            set((state) => {
              state.isLoading = false;
            });
          }
        },
        
        savePlan: async () => {
          const { data, currentPlanId } = get();
          if (!currentPlanId) {
            console.warn('[Store] 没有当前计划ID，无法保存');
            return;
          }
          
          try {
            await saveTimePlan(currentPlanId, `TimePlan-${currentPlanId}`, data);
            console.log(`[Store] 已保存 TimePlan: ${currentPlanId}`);
          } catch (error) {
            console.error('[Store] 保存失败:', error);
          }
        },
        
        // ----- Timeline 操作 -----
        
        addTimeline: (timeline) =>
          set((state) => {
            state.data.timelines.push(timeline);
          }),
        
        updateTimeline: (id, updates) =>
          set((state) => {
            const index = state.data.timelines.findIndex((t) => t.id === id);
            if (index !== -1) {
              state.data.timelines[index] = {
                ...state.data.timelines[index],
                ...updates,
              };
            }
          }),
        
        deleteTimeline: (id) =>
          set((state) => {
            state.data.timelines = state.data.timelines.filter((t) => t.id !== id);
            // 同时删除该 Timeline 下的所有 Line
            state.data.lines = state.data.lines.filter((l) => l.timelineId !== id);
          }),
        
        // ----- Line 操作 -----
        
        addLine: (line) =>
          set((state) => {
            state.data.lines.push(line);
          }),
        
        updateLine: (id, updates) =>
          set((state) => {
            const index = state.data.lines.findIndex((l) => l.id === id);
            if (index !== -1) {
              state.data.lines[index] = {
                ...state.data.lines[index],
                ...updates,
              };
            }
          }),
        
        updateLines: (updates) =>
          set((state) => {
            updates.forEach(({ id, updates: lineUpdates }) => {
              const index = state.data.lines.findIndex((l) => l.id === id);
              if (index !== -1) {
                state.data.lines[index] = {
                  ...state.data.lines[index],
                  ...lineUpdates,
                };
              }
            });
          }),
        
        deleteLine: (id) =>
          set((state) => {
            state.data.lines = state.data.lines.filter((l) => l.id !== id);
            // 同时删除相关的 Relation
            state.data.relations = state.data.relations.filter(
              (r) => r.from !== id && r.to !== id
            );
          }),
        
        deleteLines: (ids) =>
          set((state) => {
            state.data.lines = state.data.lines.filter((l) => !ids.includes(l.id));
            // 同时删除相关的 Relation
            state.data.relations = state.data.relations.filter(
              (r) => !ids.includes(r.from) && !ids.includes(r.to)
            );
          }),
        
        // ----- Relation 操作 -----
        
        addRelation: (relation) =>
          set((state) => {
            state.data.relations.push(relation);
          }),
        
        updateRelation: (id, updates) =>
          set((state) => {
            const index = state.data.relations.findIndex((r) => r.id === id);
            if (index !== -1) {
              state.data.relations[index] = {
                ...state.data.relations[index],
                ...updates,
              };
            }
          }),
        
        deleteRelation: (id) =>
          set((state) => {
            state.data.relations = state.data.relations.filter((r) => r.id !== id);
          }),
        
        // ===== 视图状态 =====
        
        setView: (view) =>
          set((state) => {
            state.viewState.currentView = view;
          }),
        
        setEditMode: (editMode) =>
          set((state) => {
            state.viewState.editMode = editMode;
          }),
        
        setSelectedIds: (ids) =>
          set((state) => {
            state.viewState.selectedIds = ids;
          }),
        
        setHoveredId: (id) =>
          set((state) => {
            state.viewState.hoveredId = id;
          }),
        
        // ===== 工具函数 =====
        
        reset: () => set(initialState),
      }),
      {
        name: 'timeplan-store',
        storage: createJSONStorage(() => localStorage), // 先用 localStorage，后续可以迁移到 IndexedDB
      }
    )
  )
);
