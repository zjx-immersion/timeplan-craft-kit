/**
 * TimePlan Store - Zustand 状态管理
 * 
 * 功能对标原项目的 TimePlanContext
 * - 管理所有 TimePlan 数据
 * - 提供 CRUD 操作
 * - 持久化到 LocalStorage
 * 
 * @version 1.0.0
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { TimePlan, Timeline, Line, Relation } from '@/types/timeplanSchema';

/**
 * TimePlan Store 状态接口
 */
interface TimePlanState {
  // 状态
  plans: TimePlan[];
  currentPlan: TimePlan | null;
  
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
}

/**
 * TimePlan Store
 * 
 * 使用 Zustand + persist 中间件实现持久化
 */
export const useTimePlanStore = create<TimePlanState>()(
  persist(
    (set, get) => ({
      // 初始状态
      plans: [],
      currentPlan: null,
      
      // 项目管理
      setPlans: (plans) => set({ plans }),
      
      addPlan: (plan) => set((state) => ({
        plans: [...state.plans, plan],
      })),
      
      updatePlan: (planId, updates) => set((state) => ({
        plans: state.plans.map((p) =>
          p.id === planId ? { ...p, ...updates } : p
        ),
        currentPlan: state.currentPlan?.id === planId
          ? { ...state.currentPlan, ...updates }
          : state.currentPlan,
      })),
      
      deletePlan: (planId) => set((state) => ({
        plans: state.plans.filter((p) => p.id !== planId),
        currentPlan: state.currentPlan?.id === planId ? null : state.currentPlan,
      })),
      
      getPlanById: (planId) => {
        return get().plans.find((p) => p.id === planId);
      },
      
      setCurrentPlan: (planId) => {
        const plan = planId ? get().getPlanById(planId) : null;
        set({ currentPlan: plan || null });
      },
      
      // Timeline 管理
      addTimeline: (planId, timeline) => set((state) => ({
        plans: state.plans.map((p) =>
          p.id === planId
            ? { ...p, timelines: [...p.timelines, timeline] }
            : p
        ),
      })),
      
      updateTimeline: (planId, timelineId, updates) => set((state) => ({
        plans: state.plans.map((p) =>
          p.id === planId
            ? {
                ...p,
                timelines: p.timelines.map((t) =>
                  t.id === timelineId ? { ...t, ...updates } : t
                ),
              }
            : p
        ),
      })),
      
      deleteTimeline: (planId, timelineId) => set((state) => ({
        plans: state.plans.map((p) =>
          p.id === planId
            ? {
                ...p,
                timelines: p.timelines.filter((t) => t.id !== timelineId),
                lines: p.lines.filter((l) => l.timelineId !== timelineId),
              }
            : p
        ),
      })),
      
      reorderTimelines: (planId, timelineIds) => set((state) => ({
        plans: state.plans.map((p) =>
          p.id === planId
            ? {
                ...p,
                timelines: timelineIds
                  .map((id) => p.timelines.find((t) => t.id === id))
                  .filter((t): t is Timeline => t !== undefined),
              }
            : p
        ),
      })),
      
      // Line 管理
      addLine: (planId, line) => set((state) => ({
        plans: state.plans.map((p) =>
          p.id === planId
            ? { ...p, lines: [...p.lines, line] }
            : p
        ),
      })),
      
      updateLine: (planId, lineId, updates) => set((state) => ({
        plans: state.plans.map((p) =>
          p.id === planId
            ? {
                ...p,
                lines: p.lines.map((l) =>
                  l.id === lineId ? { ...l, ...updates } : l
                ),
              }
            : p
        ),
      })),
      
      deleteLine: (planId, lineId) => set((state) => ({
        plans: state.plans.map((p) =>
          p.id === planId
            ? {
                ...p,
                lines: p.lines.filter((l) => l.id !== lineId),
                relations: p.relations.filter(
                  (r) => r.fromLineId !== lineId && r.toLineId !== lineId
                ),
              }
            : p
        ),
      })),
      
      // Relation 管理
      addRelation: (planId, relation) => set((state) => ({
        plans: state.plans.map((p) =>
          p.id === planId
            ? { ...p, relations: [...p.relations, relation] }
            : p
        ),
      })),
      
      deleteRelation: (planId, relationId) => set((state) => ({
        plans: state.plans.map((p) =>
          p.id === planId
            ? {
                ...p,
                relations: p.relations.filter((r) => r.id !== relationId),
              }
            : p
        ),
      })),
      
      updateRelation: (planId, relationId, updates) => set((state) => ({
        plans: state.plans.map((p) =>
          p.id === planId
            ? {
                ...p,
                relations: p.relations.map((r) =>
                  r.id === relationId ? { ...r, ...updates } : r
                ),
              }
            : p
        ),
      })),
      
      // 批量操作
      batchUpdateLines: (planId, updates) => set((state) => ({
        plans: state.plans.map((p) => {
          if (p.id !== planId) return p;
          
          const updatesMap = new Map(updates.map((u) => [u.lineId, u.updates]));
          
          return {
            ...p,
            lines: p.lines.map((l) => {
              const update = updatesMap.get(l.id);
              return update ? { ...l, ...update } : l;
            }),
          };
        }),
      })),
    }),
    {
      name: 'timeplan-craft-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
