/**
 * Iteration Service - 迭代计划管理服务
 * 
 * 提供迭代计划相关的所有API调用：
 * - 迭代计划CRUD
 * - 模块/迭代/特性/SSTS/MR/Task管理
 * - 同步到TimePlan
 */

import apiClient from '../client';
import { MessageResponse } from '../types';

// ======== Types ========

export interface IterationPlan {
  id: string;
  name: string;
  description?: string;
  productId?: string;
  status: 'draft' | 'active' | 'archived';
  syncedTimeplanId?: string;
  lastSyncedAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  iterationCount: number;
  moduleCount: number;
  featureCount: number;
  sstsCount: number;
  mrCount: number;
  taskCount: number;
}

export interface IterationPlanListResponse {
  items: IterationPlan[];
  total: number;
}

export interface Module {
  id: string;
  planId: string;
  name: string;
  description?: string;
  teamId?: string;
  teamName?: string;
  order: number;
  taskCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Iteration {
  id: string;
  planId: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: 'planning' | 'active' | 'completed';
  order: number;
  syncedTimelineId?: string;
  taskCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Feature {
  id: string;
  planId: string;
  name: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'draft' | 'in_progress' | 'completed';
  sstsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SSTS {
  id: string;
  planId: string;
  featureId: string;
  name: string;
  description?: string;
  sstsCode?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'draft' | 'in_progress' | 'completed';
  mrCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MR {
  id: string;
  planId: string;
  sstsId: string;
  name: string;
  description?: string;
  externalId?: string;
  externalUrl?: string;
  mrType: 'development' | 'bugfix' | 'refactor' | 'docs';
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'completed';
  progress: number;
  estimatedDays: number;
  actualDays?: number;
  assigneeId?: string;
  assigneeName?: string;
  taskCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface IterationTask {
  id: string;
  planId: string;
  moduleId: string;
  iterationId: string;
  mrId: string;
  mr: MR;
  module: Module;
  iteration: Iteration;
  status: 'todo' | 'in_progress' | 'completed';
  plannedStartDate?: string;
  plannedEndDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Request Types
export interface CreateIterationPlanRequest {
  name: string;
  description?: string;
  productId?: string;
}

export interface CreateModuleRequest {
  name: string;
  description?: string;
  teamId?: string;
  teamName?: string;
  order?: number;
}

export interface CreateIterationRequest {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  order?: number;
}

export interface CreateFeatureRequest {
  name: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface CreateSSTSRequest {
  featureId: string;
  name: string;
  description?: string;
  sstsCode?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface CreateMRRequest {
  sstsId: string;
  name: string;
  description?: string;
  estimatedDays: number;
  externalId?: string;
  externalUrl?: string;
  mrType?: 'development' | 'bugfix' | 'refactor' | 'docs';
  priority?: 'low' | 'medium' | 'high';
  assigneeId?: string;
  assigneeName?: string;
}

export interface AssignTaskRequest {
  moduleId: string;
  iterationId: string;
  mrIds: string[];
  plannedStartDate?: string;
  plannedEndDate?: string;
  notes?: string;
}

export interface UpdateTaskStatusRequest {
  status: 'todo' | 'in_progress' | 'completed';
  notes?: string;
}

export interface SyncToTimeplanRequest {
  timeplanId?: string;
  timeplanTitle?: string;
  createNewTimeplan?: boolean;
  schemaTemplateId?: string;
}

export interface SyncToTimeplanResponse {
  success: boolean;
  timeplanId?: string;
  timelinesCreated: number;
  linesCreated: number;
  message: string;
}

// ======== Service Object ========

export const iterationService = {
  // ========== Iteration Plan ==========
  getIterationPlans: async (): Promise<IterationPlan[]> => {
    const response = await apiClient.get<IterationPlanListResponse>('/api/v1/iteration-plans');
    return response.data.items;
  },
  
  getIterationPlan: async (planId: string): Promise<IterationPlan> => {
    const response = await apiClient.get<IterationPlan>(`/api/v1/iteration-plans/${planId}`);
    return response.data;
  },
  
  createIterationPlan: async (data: CreateIterationPlanRequest): Promise<IterationPlan> => {
    const response = await apiClient.post<IterationPlan>('/api/v1/iteration-plans', data);
    return response.data;
  },
  
  updateIterationPlan: async (planId: string, data: Partial<CreateIterationPlanRequest>): Promise<IterationPlan> => {
    const response = await apiClient.put<IterationPlan>(`/api/v1/iteration-plans/${planId}`, data);
    return response.data;
  },
  
  deleteIterationPlan: async (planId: string): Promise<void> => {
    await apiClient.delete<MessageResponse>(`/api/v1/iteration-plans/${planId}`);
  },
  
  // ========== Module ==========
  getModules: async (planId: string): Promise<Module[]> => {
    const response = await apiClient.get<{ items: Module[] }>(`/api/v1/iteration-plans/${planId}/modules`);
    return response.data.items;
  },
  
  createModule: async (planId: string, data: CreateModuleRequest): Promise<Module> => {
    const response = await apiClient.post<Module>(`/api/v1/iteration-plans/${planId}/modules`, data);
    return response.data;
  },
  
  deleteModule: async (moduleId: string): Promise<void> => {
    await apiClient.delete<MessageResponse>(`/api/v1/modules/${moduleId}`);
  },
  
  // ========== Iteration ==========
  getIterations: async (planId: string): Promise<Iteration[]> => {
    const response = await apiClient.get<{ items: Iteration[] }>(`/api/v1/iteration-plans/${planId}/iterations`);
    return response.data.items;
  },
  
  createIteration: async (planId: string, data: CreateIterationRequest): Promise<Iteration> => {
    const response = await apiClient.post<Iteration>(`/api/v1/iteration-plans/${planId}/iterations`, {
      ...data,
      start_date: data.startDate,
      end_date: data.endDate,
    });
    return response.data;
  },
  
  updateIteration: async (iterationId: string, data: Partial<CreateIterationRequest>): Promise<Iteration> => {
    const response = await apiClient.put<Iteration>(`/api/v1/iterations/${iterationId}`, {
      ...data,
      start_date: data.startDate,
      end_date: data.endDate,
    });
    return response.data;
  },
  
  deleteIteration: async (iterationId: string): Promise<void> => {
    await apiClient.delete<MessageResponse>(`/api/v1/iterations/${iterationId}`);
  },
  
  // ========== Feature ==========
  getFeatures: async (planId: string): Promise<Feature[]> => {
    const response = await apiClient.get<{ items: Feature[] }>(`/api/v1/iteration-plans/${planId}/features`);
    return response.data.items;
  },
  
  createFeature: async (planId: string, data: CreateFeatureRequest): Promise<Feature> => {
    const response = await apiClient.post<Feature>(`/api/v1/iteration-plans/${planId}/features`, data);
    return response.data;
  },
  
  updateFeature: async (featureId: string, data: Partial<CreateFeatureRequest>): Promise<Feature> => {
    const response = await apiClient.put<Feature>(`/api/v1/features/${featureId}`, data);
    return response.data;
  },
  
  deleteFeature: async (featureId: string): Promise<void> => {
    await apiClient.delete<MessageResponse>(`/api/v1/features/${featureId}`);
  },
  
  // ========== SSTS ==========
  getSSTSList: async (planId: string, featureId?: string): Promise<SSTS[]> => {
    const params = featureId ? { feature_id: featureId } : {};
    const response = await apiClient.get<{ items: SSTS[] }>(
      `/api/v1/iteration-plans/${planId}/ssts`,
      { params }
    );
    return response.data.items;
  },
  
  createSSTS: async (planId: string, data: CreateSSTSRequest): Promise<SSTS> => {
    const response = await apiClient.post<SSTS>(`/api/v1/iteration-plans/${planId}/ssts`, {
      ...data,
      feature_id: data.featureId,
      ssts_code: data.sstsCode,
    });
    return response.data;
  },
  
  updateSSTS: async (sstsId: string, data: Partial<CreateSSTSRequest>): Promise<SSTS> => {
    const response = await apiClient.put<SSTS>(`/api/v1/ssts/${sstsId}`, data);
    return response.data;
  },
  
  deleteSSTS: async (sstsId: string): Promise<void> => {
    await apiClient.delete<MessageResponse>(`/api/v1/ssts/${sstsId}`);
  },
  
  // ========== MR ==========
  getMRs: async (planId: string): Promise<MR[]> => {
    const response = await apiClient.get<{ items: MR[] }>(`/api/v1/iteration-plans/${planId}/mrs`);
    return response.data.items;
  },
  
  createMR: async (planId: string, data: CreateMRRequest): Promise<MR> => {
    const response = await apiClient.post<MR>(`/api/v1/iteration-plans/${planId}/mrs`, {
      ...data,
      ssts_id: data.sstsId,
      external_id: data.externalId,
      external_url: data.externalUrl,
      mr_type: data.mrType,
      estimated_days: data.estimatedDays,
      assignee_id: data.assigneeId,
      assignee_name: data.assigneeName,
    });
    return response.data;
  },
  
  updateMR: async (mrId: string, data: Partial<CreateMRRequest>): Promise<MR> => {
    const response = await apiClient.put<MR>(`/api/v1/mrs/${mrId}`, data);
    return response.data;
  },
  
  deleteMR: async (mrId: string): Promise<void> => {
    await apiClient.delete<MessageResponse>(`/api/v1/mrs/${mrId}`);
  },
  
  updateMRProgress: async (mrId: string, progress: number, actualDays?: number, status?: string): Promise<MR> => {
    const response = await apiClient.post<MR>(`/api/v1/mrs/${mrId}/progress`, {
      progress,
      actual_days: actualDays,
      status,
    });
    return response.data;
  },
  
  // ========== Task ==========
  getTasks: async (planId: string, filters?: { moduleId?: string; iterationId?: string; status?: string }): Promise<IterationTask[]> => {
    const params: Record<string, string> = {};
    if (filters?.moduleId) params.module_id = filters.moduleId;
    if (filters?.iterationId) params.iteration_id = filters.iterationId;
    if (filters?.status) params.status = filters.status;
    
    const response = await apiClient.get<{ items: IterationTask[] }>(
      `/api/v1/iteration-plans/${planId}/tasks`,
      { params }
    );
    return response.data.items;
  },
  
  assignTask: async (planId: string, data: AssignTaskRequest): Promise<IterationTask[]> => {
    const response = await apiClient.post<{ items: IterationTask[] }>(
      `/api/v1/iteration-plans/${planId}/tasks`,
      {
        ...data,
        module_id: data.moduleId,
        iteration_id: data.iterationId,
        mr_ids: data.mrIds,
        planned_start_date: data.plannedStartDate,
        planned_end_date: data.plannedEndDate,
      }
    );
    return response.data.items;
  },
  
  updateTaskStatus: async (taskId: string, data: UpdateTaskStatusRequest): Promise<IterationTask> => {
    const response = await apiClient.put<IterationTask>(`/api/v1/tasks/${taskId}/status`, data);
    return response.data;
  },
  
  deleteTask: async (taskId: string): Promise<void> => {
    await apiClient.delete<MessageResponse>(`/api/v1/tasks/${taskId}`);
  },
  
  // ========== Sync ==========
  syncToTimeplan: async (planId: string, data: SyncToTimeplanRequest): Promise<SyncToTimeplanResponse> => {
    const response = await apiClient.post<SyncToTimeplanResponse>(
      `/api/v1/iteration-plans/${planId}/sync-to-timeplan`,
      {
        timeplan_id: data.timeplanId,
        timeplan_title: data.timeplanTitle,
        create_new_timeplan: data.createNewTimeplan,
        schema_template_id: data.schemaTemplateId,
      }
    );
    return response.data;
  },
};

export default iterationService;
