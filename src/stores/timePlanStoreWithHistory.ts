/**
 * TimePlan Store With History - 支持撤销/重做的状态管理
 * 
 * 在原有 timePlanStore 基础上添加历史记录功能
 * 
 * @version 2.0.0
 * @date 2026-02-03
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { TimePlan, Timeline, Line, Relation } from '@/types/timeplanSchema';
import { autoFixRelations } from '@/utils/validation';

/**
 * 历史记录项
 */
interface HistoryEntry {
  plans: TimePlan[];
  timestamp: number;
}

/**
 * TimePlan Store 状态接口（扩展版）
 */
interface TimePlanStateWithHistory {
  // 状态
  plans: TimePlan[];
  currentPlan: TimePlan | null;
  
  // 历史记录
  history: HistoryEntry[];      // 历史栈
  historyIndex: number;         // 当前历史位置
  maxHistorySize: number;       // 最大历史记录数
  
  // Actions - 项目管理
  setPlans: (plans: TimePlan[]) => void;
  addPlan: (plan: TimePlan) => void;
  updatePlan: (planId: string, updates: Partial<TimePlan>) => void;
  deletePlan: (planId: string) => void;
  getPlanById: (planId: string) => TimePlan | undefined;
  setCurrentPlan: (planId: string | null) => void;
  
  // Actions - Timeline 管理
  addTimeline: (planId: string, timeline: Timeline) => void;
  updateTimeline: (planId: string, timelineId: string, updates: Partial<Timeline>) => void;
  deleteTimeline: (planId: string, timelineId: string) => void;
  reorderTimelines: (planId: string, timelineIds: string[]) => void;
  
  // Actions - Line 管理
  addLine: (planId: string, line: Line) => void;
  updateLine: (planId: string, lineId: string, updates: Partial<Line>) => void;
  deleteLine: (planId: string, lineId: string) => void;
  
  // Actions - Relation 管理
  addRelation: (planId: string, relation: Relation) => void;
  deleteRelation: (planId: string, relationId: string) => void;
  updateRelation: (planId: string, relationId: string, updates: Partial<Relation>) => void;
  
  // Actions - 批量操作
  batchUpdateLines: (planId: string, updates: Array<{ lineId: string; updates: Partial<Line> }>) => void;
  
  // Actions - 历史记录管理
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clearHistory: () => void;
  saveSnapshot: () => void;
}

/**
 * 创建历史记录项
 */
function createHistoryEntry(plans: TimePlan[]): HistoryEntry {
  return {
    plans: JSON.parse(JSON.stringify(plans)), // 深拷贝
    timestamp: Date.now(),
  };
}

/**
 * TimePlan Store (支持撤销/重做)
 */
export const useTimePlanStoreWithHistory = create<TimePlanStateWithHistory>()(
  persist(
    (set, get) => ({
      // 初始状态
      plans: [],
      currentPlan: null,
      history: [],
      historyIndex: -1,
      maxHistorySize: 50,
      
      // 保存快照
      saveSnapshot: () => {
        const state = get();
        const newEntry = createHistoryEntry(state.plans);
        
        // 清除当前位置之后的历史
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(newEntry);
        
        // 限制历史大小
        if (newHistory.length > state.maxHistorySize) {
          newHistory.shift();
        }
        
        set({
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });
      },
      
      // 撤销
      undo: () => {
        const state = get();
        if (!state.canUndo()) return;
        
        const newIndex = state.historyIndex - 1;
        const entry = state.history[newIndex];
        
        if (entry) {
          set({
            plans: entry.plans,
            historyIndex: newIndex,
            currentPlan: state.currentPlan 
              ? entry.plans.find(p => p.id === state.currentPlan!.id) || null
              : null,
          });
        }
      },
      
      // 重做
      redo: () => {
        const state = get();
        if (!state.canRedo()) return;
        
        const newIndex = state.historyIndex + 1;
        const entry = state.history[newIndex];
        
        if (entry) {
          set({
            plans: entry.plans,
            historyIndex: newIndex,
            currentPlan: state.currentPlan 
              ? entry.plans.find(p => p.id === state.currentPlan!.id) || null
              : null,
          });
        }
      },
      
      // 检查是否可以撤销
      canUndo: () => {
        const state = get();
        return state.historyIndex > 0;
      },
      
      // 检查是否可以重做
      canRedo: () => {
        const state = get();
        return state.historyIndex < state.history.length - 1;
      },
      
      // 清除历史
      clearHistory: () => {
        set({
          history: [],
          historyIndex: -1,
        });
      },
      
      // 项目管理
      setPlans: (plans) => {
        get().saveSnapshot();
        
        // 验证并修复每个计划的关系数据
        const validatedPlans = plans.map(plan => {
          if (!plan.relations || plan.relations.length === 0) {
            return plan;
          }
          
          // 自动修复无效关系
          const { fixed, removed, warnings } = autoFixRelations(
            plan.relations,
            plan.lines
          );
          
          if (removed > 0) {
            console.warn(
              `[TimePlanStore] 计划 "${plan.name}" 已移除 ${removed} 个无效关系`
            );
          }
          
          return {
            ...plan,
            relations: fixed,
          };
        });
        
        set({ plans: validatedPlans });
      },
      
      addPlan: (plan) => {
        get().saveSnapshot();
        set((state) => ({
          plans: [...state.plans, plan],
        }));
      },
      
      updatePlan: (planId, updates) => {
        get().saveSnapshot();
        set((state) => ({
          plans: state.plans.map((p) =>
            p.id === planId ? { ...p, ...updates, updatedAt: new Date() } : p
          ),
          currentPlan: state.currentPlan?.id === planId
            ? { ...state.currentPlan, ...updates, updatedAt: new Date() }
            : state.currentPlan,
        }));
      },
      
      deletePlan: (planId) => {
        get().saveSnapshot();
        set((state) => ({
          plans: state.plans.filter((p) => p.id !== planId),
          currentPlan: state.currentPlan?.id === planId ? null : state.currentPlan,
        }));
      },
      
      getPlanById: (planId) => {
        return get().plans.find((p) => p.id === planId);
      },
      
      setCurrentPlan: (planId) => {
        const plan = planId ? get().getPlanById(planId) : null;
        set({ currentPlan: plan || null });
      },
      
      // Timeline 管理
      addTimeline: (planId, timeline) => {
        get().saveSnapshot();
        set((state) => ({
          plans: state.plans.map((p) =>
            p.id === planId
              ? { ...p, timelines: [...p.timelines, timeline], updatedAt: new Date() }
              : p
          ),
        }));
      },
      
      updateTimeline: (planId, timelineId, updates) => {
        get().saveSnapshot();
        set((state) => ({
          plans: state.plans.map((p) =>
            p.id === planId
              ? {
                  ...p,
                  timelines: p.timelines.map((t) =>
                    t.id === timelineId ? { ...t, ...updates } : t
                  ),
                  updatedAt: new Date(),
                }
              : p
          ),
        }));
      },
      
      deleteTimeline: (planId, timelineId) => {
        get().saveSnapshot();
        set((state) => ({
          plans: state.plans.map((p) =>
            p.id === planId
              ? {
                  ...p,
                  timelines: p.timelines.filter((t) => t.id !== timelineId),
                  lines: p.lines.filter((l) => l.timelineId !== timelineId),
                  updatedAt: new Date(),
                }
              : p
          ),
        }));
      },
      
      reorderTimelines: (planId, timelineIds) => {
        get().saveSnapshot();
        set((state) => ({
          plans: state.plans.map((p) =>
            p.id === planId
              ? {
                  ...p,
                  timelines: timelineIds
                    .map((id) => p.timelines.find((t) => t.id === id))
                    .filter((t): t is Timeline => t !== undefined),
                  updatedAt: new Date(),
                }
              : p
          ),
        }));
      },
      
      // Line 管理
      addLine: (planId, line) => {
        get().saveSnapshot();
        set((state) => ({
          plans: state.plans.map((p) =>
            p.id === planId
              ? { ...p, lines: [...p.lines, line], updatedAt: new Date() }
              : p
          ),
        }));
      },
      
      updateLine: (planId, lineId, updates) => {
        get().saveSnapshot();
        set((state) => ({
          plans: state.plans.map((p) =>
            p.id === planId
              ? {
                  ...p,
                  lines: p.lines.map((l) =>
                    l.id === lineId ? { ...l, ...updates, updatedAt: new Date() } : l
                  ),
                  updatedAt: new Date(),
                }
              : p
          ),
        }));
      },
      
      deleteLine: (planId, lineId) => {
        get().saveSnapshot();
        set((state) => ({
          plans: state.plans.map((p) =>
            p.id === planId
              ? {
                  ...p,
                  lines: p.lines.filter((l) => l.id !== lineId),
                  relations: p.relations.filter(
                    (r) => r.fromLineId !== lineId && r.toLineId !== lineId
                  ),
                  updatedAt: new Date(),
                }
              : p
          ),
        }));
      },
      
      // Relation 管理
      addRelation: (planId, relation) => {
        get().saveSnapshot();
        set((state) => ({
          plans: state.plans.map((p) =>
            p.id === planId
              ? { ...p, relations: [...p.relations, relation], updatedAt: new Date() }
              : p
          ),
        }));
      },
      
      deleteRelation: (planId, relationId) => {
        get().saveSnapshot();
        set((state) => ({
          plans: state.plans.map((p) =>
            p.id === planId
              ? {
                  ...p,
                  relations: p.relations.filter((r) => r.id !== relationId),
                  updatedAt: new Date(),
                }
              : p
          ),
        }));
      },
      
      updateRelation: (planId, relationId, updates) => {
        get().saveSnapshot();
        set((state) => ({
          plans: state.plans.map((p) =>
            p.id === planId
              ? {
                  ...p,
                  relations: p.relations.map((r) =>
                    r.id === relationId ? { ...r, ...updates, updatedAt: new Date() } : r
                  ),
                  updatedAt: new Date(),
                }
              : p
          ),
        }));
      },
      
      // 批量操作
      batchUpdateLines: (planId, updates) => {
        get().saveSnapshot();
        set((state) => ({
          plans: state.plans.map((p) => {
            if (p.id !== planId) return p;
            
            const updatesMap = new Map(updates.map((u) => [u.lineId, u.updates]));
            
            return {
              ...p,
              lines: p.lines.map((l) => {
                const update = updatesMap.get(l.id);
                return update ? { ...l, ...update, updatedAt: new Date() } : l;
              }),
              updatedAt: new Date(),
            };
          }),
        }));
      },
    }),
    {
      name: 'timeplan-craft-storage-with-history',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        plans: state.plans,
        currentPlan: state.currentPlan,
        // 不持久化历史记录（避免存储过大）
      }),
      // 自定义序列化/反序列化，处理 Date 对象
      serialize: (state) => {
        return JSON.stringify(state);
      },
      deserialize: (str) => {
        const state = JSON.parse(str);
        
        // 将日期字符串转换回 Date 对象
        if (state?.state?.plans) {
          state.state.plans = state.state.plans.map((plan: any) => ({
            ...plan,
            createdAt: plan.createdAt ? new Date(plan.createdAt) : undefined,
            lastAccessTime: plan.lastAccessTime ? new Date(plan.lastAccessTime) : undefined,
            updatedAt: plan.updatedAt ? new Date(plan.updatedAt) : undefined,
            lines: plan.lines?.map((line: any) => ({
              ...line,
              startDate: line.startDate ? new Date(line.startDate) : undefined,
              endDate: line.endDate ? new Date(line.endDate) : undefined,
              createdAt: line.createdAt ? new Date(line.createdAt) : undefined,
              updatedAt: line.updatedAt ? new Date(line.updatedAt) : undefined,
            })),
            relations: plan.relations?.map((relation: any) => ({
              ...relation,
              createdAt: relation.createdAt ? new Date(relation.createdAt) : undefined,
              updatedAt: relation.updatedAt ? new Date(relation.updatedAt) : undefined,
            })),
            baselines: plan.baselines?.map((baseline: any) => ({
              ...baseline,
              date: baseline.date ? new Date(baseline.date) : undefined,
            })),
            viewConfig: plan.viewConfig ? {
              ...plan.viewConfig,
              startDate: plan.viewConfig.startDate ? new Date(plan.viewConfig.startDate) : undefined,
              endDate: plan.viewConfig.endDate ? new Date(plan.viewConfig.endDate) : undefined,
            } : undefined,
          }));
        }
        
        // 处理 currentPlan
        if (state?.state?.currentPlan) {
          const plan = state.state.currentPlan;
          state.state.currentPlan = {
            ...plan,
            createdAt: plan.createdAt ? new Date(plan.createdAt) : undefined,
            lastAccessTime: plan.lastAccessTime ? new Date(plan.lastAccessTime) : undefined,
            updatedAt: plan.updatedAt ? new Date(plan.updatedAt) : undefined,
            lines: plan.lines?.map((line: any) => ({
              ...line,
              startDate: line.startDate ? new Date(line.startDate) : undefined,
              endDate: line.endDate ? new Date(line.endDate) : undefined,
              createdAt: line.createdAt ? new Date(line.createdAt) : undefined,
              updatedAt: line.updatedAt ? new Date(line.updatedAt) : undefined,
            })),
            relations: plan.relations?.map((relation: any) => ({
              ...relation,
              createdAt: relation.createdAt ? new Date(relation.createdAt) : undefined,
              updatedAt: relation.updatedAt ? new Date(relation.updatedAt) : undefined,
            })),
            baselines: plan.baselines?.map((baseline: any) => ({
              ...baseline,
              date: baseline.date ? new Date(baseline.date) : undefined,
            })),
            viewConfig: plan.viewConfig ? {
              ...plan.viewConfig,
              startDate: plan.viewConfig.startDate ? new Date(plan.viewConfig.startDate) : undefined,
              endDate: plan.viewConfig.endDate ? new Date(plan.viewConfig.endDate) : undefined,
            } : undefined,
          };
        }
        
        return state;
      },
    }
  )
);
