/**
 * TimePlan Store with API Integration
 * 
 * 集成后端 API 的 Zustand Store
 * 使用新的数据结构：TimelinePlanData, Timeline, TimelineNode, Dependency
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { TimelinePlanData, Timeline, TimelineNode, Dependency } from '@/types/timeline';
import {
  planService,
  timelineService,
  nodeService,
  dependencyService,
} from '@/api/services';
import { PlanResponse } from '@/api/types/backend';

/**
 * 加载状态
 */
interface LoadingState {
  plans: boolean;
  timelines: boolean;
  nodes: boolean;
  dependencies: boolean;
}

/**
 * 错误状态
 */
interface ErrorState {
  plans: string | null;
  timelines: string | null;
  nodes: string | null;
  dependencies: string | null;
}

/**
 * Store 状态接口
 */
interface TimePlanStoreState {
  // 数据状态
  plans: TimelinePlanData[];
  currentPlan: TimelinePlanData | null;
  loading: LoadingState;
  error: ErrorState;

  // Plan 操作
  loadPlans: () => Promise<void>;
  loadPlan: (planId: string) => Promise<void>;
  createPlan: (title: string, owner: string, description?: string) => Promise<TimelinePlanData>;
  updatePlan: (planId: string, updates: Partial<TimelinePlanData>) => Promise<void>;
  deletePlan: (planId: string) => Promise<void>;
  setCurrentPlan: (planId: string) => void;

  // Timeline 操作
  loadTimelines: (planId: string) => Promise<void>;
  createTimeline: (planId: string, data: Partial<Timeline>) => Promise<Timeline>;
  updateTimeline: (timelineId: string, updates: Partial<Timeline>) => Promise<void>;
  deleteTimeline: (timelineId: string) => Promise<void>;

  // Node 操作
  loadNodes: (planId: string) => Promise<void>;
  createNode: (timelineId: string, data: Partial<TimelineNode>) => Promise<TimelineNode>;
  updateNode: (nodeId: string, updates: Partial<TimelineNode>) => Promise<void>;
  deleteNode: (nodeId: string) => Promise<void>;
  batchCreateNodes: (timelineId: string, nodes: Partial<TimelineNode>[]) => Promise<void>;

  // Dependency 操作
  loadDependencies: (planId: string) => Promise<void>;
  createDependency: (data: Partial<Dependency>) => Promise<Dependency>;
  updateDependency: (depId: string, updates: Partial<Dependency>) => Promise<void>;
  deleteDependency: (depId: string) => Promise<void>;
  checkCycle: (fromNodeId: string, toNodeId: string) => Promise<boolean>;

  // 辅助方法
  clearError: (key: keyof ErrorState) => void;
  reset: () => void;
}

/**
 * 初始加载状态
 */
const initialLoading: LoadingState = {
  plans: false,
  timelines: false,
  nodes: false,
  dependencies: false,
};

/**
 * 初始错误状态
 */
const initialError: ErrorState = {
  plans: null,
  timelines: null,
  nodes: null,
  dependencies: null,
};

/**
 * 转换后端 PlanResponse 为前端 TimelinePlanData
 */
function transformPlanResponse(plan: PlanResponse): TimelinePlanData {
  return {
    id: plan.id,
    title: plan.title,
    owner: plan.owner || undefined,
    createdAt: new Date(plan.createdAt),
    lastAccessTime: new Date(plan.updatedAt),
    timelines: [],
    dependencies: [],
    baselines: [],
    baselineRanges: [],
  };
}

/**
 * TimePlan Store with API
 */
export const useTimePlanStoreWithAPI = create<TimePlanStoreState>()(
  persist(
    (set, get) => ({
      // 初始状态
      plans: [],
      currentPlan: null,
      loading: initialLoading,
      error: initialError,

      // Plan 操作
      loadPlans: async () => {
        set({ loading: { ...get().loading, plans: true }, error: { ...get().error, plans: null } });
        try {
          const backendPlans = await planService.getPlans();
          const plans = backendPlans.map(transformPlanResponse);
          set({ plans, loading: { ...get().loading, plans: false } });
        } catch (error: any) {
          set({
            loading: { ...get().loading, plans: false },
            error: { ...get().error, plans: error.message },
          });
          throw error;
        }
      },

      loadPlan: async (planId: string) => {
        set({ loading: { ...get().loading, plans: true } });
        try {
          // 加载计划基本信息
          const backendPlan = await planService.getPlan(planId);
          const plan = transformPlanResponse(backendPlan);

          // 加载时间线
          const timelines = await timelineService.getTimelines(planId);
          plan.timelines = timelines;

          // 加载节点
          const nodes = await nodeService.getNodesByPlan(planId);
          // 将节点分配到对应的时间线
          timelines.forEach(timeline => {
            timeline.nodes = nodes.filter(node => node.timelineId === timeline.id);
          });

          // 加载依赖关系
          const dependencies = await dependencyService.getPlanDependencies(planId);
          plan.dependencies = dependencies;

          set({
            currentPlan: plan,
            loading: { ...get().loading, plans: false },
          });
        } catch (error: any) {
          set({
            loading: { ...get().loading, plans: false },
            error: { ...get().error, plans: error.message },
          });
          throw error;
        }
      },

      createPlan: async (title, owner, description) => {
        try {
          const backendPlan = await planService.createPlan({ title, owner, description });
          const plan = transformPlanResponse(backendPlan);
          set(state => ({ plans: [...state.plans, plan] }));
          return plan;
        } catch (error: any) {
          set({ error: { ...get().error, plans: error.message } });
          throw error;
        }
      },

      updatePlan: async (planId, updates) => {
        try {
          await planService.updatePlan(planId, {
            title: updates.title,
            owner: updates.owner,
            description: updates.description,
          });
          set(state => ({
            plans: state.plans.map(p => p.id === planId ? { ...p, ...updates } : p),
            currentPlan: state.currentPlan?.id === planId
              ? { ...state.currentPlan, ...updates }
              : state.currentPlan,
          }));
        } catch (error: any) {
          set({ error: { ...get().error, plans: error.message } });
          throw error;
        }
      },

      deletePlan: async (planId) => {
        try {
          await planService.deletePlan(planId);
          set(state => ({
            plans: state.plans.filter(p => p.id !== planId),
            currentPlan: state.currentPlan?.id === planId ? null : state.currentPlan,
          }));
        } catch (error: any) {
          set({ error: { ...get().error, plans: error.message } });
          throw error;
        }
      },

      setCurrentPlan: (planId) => {
        const plan = get().plans.find(p => p.id === planId);
        set({ currentPlan: plan || null });
      },

      // Timeline 操作
      loadTimelines: async (planId) => {
        set({ loading: { ...get().loading, timelines: true } });
        try {
          const timelines = await timelineService.getTimelines(planId);
          set(state => ({
            currentPlan: state.currentPlan?.id === planId
              ? { ...state.currentPlan, timelines }
              : state.currentPlan,
            loading: { ...get().loading, timelines: false },
          }));
        } catch (error: any) {
          set({
            loading: { ...get().loading, timelines: false },
            error: { ...get().error, timelines: error.message },
          });
          throw error;
        }
      },

      createTimeline: async (planId, data) => {
        try {
          const timeline = await timelineService.createTimeline(planId, data);
          set(state => ({
            currentPlan: state.currentPlan?.id === planId
              ? { ...state.currentPlan, timelines: [...state.currentPlan.timelines, timeline] }
              : state.currentPlan,
          }));
          return timeline;
        } catch (error: any) {
          set({ error: { ...get().error, timelines: error.message } });
          throw error;
        }
      },

      updateTimeline: async (timelineId, updates) => {
        try {
          const updatedTimeline = await timelineService.updateTimeline(timelineId, updates);
          set(state => ({
            currentPlan: state.currentPlan
              ? {
                  ...state.currentPlan,
                  timelines: state.currentPlan.timelines.map(t =>
                    t.id === timelineId ? updatedTimeline : t
                  ),
                }
              : null,
          }));
        } catch (error: any) {
          set({ error: { ...get().error, timelines: error.message } });
          throw error;
        }
      },

      deleteTimeline: async (timelineId) => {
        try {
          await timelineService.deleteTimeline(timelineId);
          set(state => ({
            currentPlan: state.currentPlan
              ? {
                  ...state.currentPlan,
                  timelines: state.currentPlan.timelines.filter(t => t.id !== timelineId),
                }
              : null,
          }));
        } catch (error: any) {
          set({ error: { ...get().error, timelines: error.message } });
          throw error;
        }
      },

      // Node 操作
      loadNodes: async (planId) => {
        set({ loading: { ...get().loading, nodes: true } });
        try {
          const nodes = await nodeService.getNodesByPlan(planId);
          set(state => {
            if (!state.currentPlan || state.currentPlan.id !== planId) return state;

            const timelines = state.currentPlan.timelines.map(timeline => ({
              ...timeline,
              nodes: nodes.filter(node => node.timelineId === timeline.id),
            }));

            return {
              currentPlan: { ...state.currentPlan, timelines },
              loading: { ...get().loading, nodes: false },
            };
          });
        } catch (error: any) {
          set({
            loading: { ...get().loading, nodes: false },
            error: { ...get().error, nodes: error.message },
          });
          throw error;
        }
      },

      createNode: async (timelineId, data) => {
        try {
          const node = await nodeService.createNode(timelineId, data);
          set(state => {
            if (!state.currentPlan) return state;

            const timelines = state.currentPlan.timelines.map(timeline =>
              timeline.id === timelineId
                ? { ...timeline, nodes: [...timeline.nodes, node] }
                : timeline
            );

            return { currentPlan: { ...state.currentPlan, timelines } };
          });
          return node;
        } catch (error: any) {
          set({ error: { ...get().error, nodes: error.message } });
          throw error;
        }
      },

      updateNode: async (nodeId, updates) => {
        try {
          const updatedNode = await nodeService.updateNode(nodeId, updates);
          set(state => {
            if (!state.currentPlan) return state;

            const timelines = state.currentPlan.timelines.map(timeline => ({
              ...timeline,
              nodes: timeline.nodes.map(node =>
                node.id === nodeId ? updatedNode : node
              ),
            }));

            return { currentPlan: { ...state.currentPlan, timelines } };
          });
        } catch (error: any) {
          set({ error: { ...get().error, nodes: error.message } });
          throw error;
        }
      },

      deleteNode: async (nodeId) => {
        try {
          await nodeService.deleteNode(nodeId);
          set(state => {
            if (!state.currentPlan) return state;

            const timelines = state.currentPlan.timelines.map(timeline => ({
              ...timeline,
              nodes: timeline.nodes.filter(node => node.id !== nodeId),
            }));

            return { currentPlan: { ...state.currentPlan, timelines } };
          });
        } catch (error: any) {
          set({ error: { ...get().error, nodes: error.message } });
          throw error;
        }
      },

      batchCreateNodes: async (timelineId, nodes) => {
        try {
          const createdNodes = await nodeService.batchCreateNodes(timelineId, nodes);
          set(state => {
            if (!state.currentPlan) return state;

            const timelines = state.currentPlan.timelines.map(timeline =>
              timeline.id === timelineId
                ? { ...timeline, nodes: [...timeline.nodes, ...createdNodes] }
                : timeline
            );

            return { currentPlan: { ...state.currentPlan, timelines } };
          });
        } catch (error: any) {
          set({ error: { ...get().error, nodes: error.message } });
          throw error;
        }
      },

      // Dependency 操作
      loadDependencies: async (planId) => {
        set({ loading: { ...get().loading, dependencies: true } });
        try {
          const dependencies = await dependencyService.getPlanDependencies(planId);
          set(state => ({
            currentPlan: state.currentPlan?.id === planId
              ? { ...state.currentPlan, dependencies }
              : state.currentPlan,
            loading: { ...get().loading, dependencies: false },
          }));
        } catch (error: any) {
          set({
            loading: { ...get().loading, dependencies: false },
            error: { ...get().error, dependencies: error.message },
          });
          throw error;
        }
      },

      createDependency: async (data) => {
        try {
          const dependency = await dependencyService.createDependency(data);
          set(state => ({
            currentPlan: state.currentPlan
              ? { ...state.currentPlan, dependencies: [...state.currentPlan.dependencies, dependency] }
              : null,
          }));
          return dependency;
        } catch (error: any) {
          set({ error: { ...get().error, dependencies: error.message } });
          throw error;
        }
      },

      updateDependency: async (depId, updates) => {
        try {
          const updatedDep = await dependencyService.updateDependency(depId, updates);
          set(state => ({
            currentPlan: state.currentPlan
              ? {
                  ...state.currentPlan,
                  dependencies: state.currentPlan.dependencies.map(d =>
                    d.id === depId ? updatedDep : d
                  ),
                }
              : null,
          }));
        } catch (error: any) {
          set({ error: { ...get().error, dependencies: error.message } });
          throw error;
        }
      },

      deleteDependency: async (depId) => {
        try {
          await dependencyService.deleteDependency(depId);
          set(state => ({
            currentPlan: state.currentPlan
              ? {
                  ...state.currentPlan,
                  dependencies: state.currentPlan.dependencies.filter(d => d.id !== depId),
                }
              : null,
          }));
        } catch (error: any) {
          set({ error: { ...get().error, dependencies: error.message } });
          throw error;
        }
      },

      checkCycle: async (fromNodeId, toNodeId) => {
        try {
          const result = await dependencyService.checkCycle(fromNodeId, toNodeId);
          return result.hasCycle;
        } catch (error: any) {
          set({ error: { ...get().error, dependencies: error.message } });
          throw error;
        }
      },

      // 辅助方法
      clearError: (key) => {
        set(state => ({ error: { ...state.error, [key]: null } }));
      },

      reset: () => {
        set({ plans: [], currentPlan: null, loading: initialLoading, error: initialError });
      },
    }),
    {
      name: 'timeplan-storage-with-api',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // 只持久化 plans 和 currentPlan，不持久化 loading 和 error
        plans: state.plans,
        currentPlan: state.currentPlan,
      }),
    }
  )
);
