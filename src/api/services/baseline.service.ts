/**
 * Baseline Service - 基线管理服务
 * 
 * 提供基线相关的所有API调用：
 * - 基线CRUD操作
 * - 基线激活/对比
 * - 基线统计/需求项
 */

import apiClient from '../client';
import { MessageResponse } from '../types';

// ======== Types ========

export interface Baseline {
  id: string;
  timeplanId: string;
  name: string;
  description?: string;
  version: string;
  status: 'draft' | 'active' | 'archived';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  snapshotData?: Record<string, any>;
}

export interface BaselineListResponse {
  items: Baseline[];
  total: number;
}

export interface CreateBaselineRequest {
  name: string;
  description?: string;
  version?: string;
  snapshotData?: Record<string, any>;
}

export interface UpdateBaselineRequest {
  name?: string;
  description?: string;
  version?: string;
  status?: 'draft' | 'active' | 'archived';
}

export interface BaselineStatistics {
  totalTimelines: number;
  totalNodes: number;
  totalDependencies: number;
  startDate: string;
  endDate: string;
  durationDays: number;
}

export interface BaselineComparisonResult {
  baselineId1: string;
  baselineId2: string;
  added: Array<{
    type: 'timeline' | 'node' | 'dependency';
    id: string;
    data: Record<string, any>;
  }>;
  removed: Array<{
    type: 'timeline' | 'node' | 'dependency';
    id: string;
    data: Record<string, any>;
  }>;
  modified: Array<{
    type: 'timeline' | 'node' | 'dependency';
    id: string;
    oldData: Record<string, any>;
    newData: Record<string, any>;
    changes: string[];
  }>;
  summary: {
    totalAdded: number;
    totalRemoved: number;
    totalModified: number;
  };
}

export interface RequirementItem {
  id: string;
  baselineId: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
  dueDate?: string;
  completedAt?: string;
}

// ======== API Methods ========

const BASELINE_API = {
  // 基线列表/创建
  getBaselines: (timeplanId: string) => 
    apiClient.get<BaselineListResponse>(`/api/v1/timeplans/${timeplanId}/baselines`),
  
  createBaseline: (timeplanId: string, data: CreateBaselineRequest) =>
    apiClient.post<Baseline>(`/api/v1/timeplans/${timeplanId}/baselines`, data),
  
  // 基线详情/更新/删除
  getBaseline: (baselineId: string) =>
    apiClient.get<Baseline>(`/api/v1/baselines/${baselineId}`),
  
  updateBaseline: (baselineId: string, data: UpdateBaselineRequest) =>
    apiClient.put<Baseline>(`/api/v1/baselines/${baselineId}`, data),
  
  deleteBaseline: (baselineId: string) =>
    apiClient.delete<MessageResponse>(`/api/v1/baselines/${baselineId}`),
  
  // 基线激活
  activateBaseline: (baselineId: string) =>
    apiClient.post<MessageResponse>(`/api/v1/baselines/${baselineId}/activate`),
  
  // 基线对比
  compareBaselines: (baselineId1: string, baselineId2: string) =>
    apiClient.post<BaselineComparisonResult>('/api/v1/baselines/compare', {
      baseline_id_1: baselineId1,
      baseline_id_2: baselineId2,
    }),
  
  // 基线统计
  getBaselineStatistics: (baselineId: string) =>
    apiClient.get<BaselineStatistics>(`/api/v1/baselines/${baselineId}/statistics`),
  
  // 需求项
  getRequirementItems: (baselineId: string) =>
    apiClient.get<{ items: RequirementItem[]; total: number }>(
      `/api/v1/baselines/${baselineId}/requirement-items`
    ),
};

// ======== Service Object ========

export const baselineService = {
  // List
  getBaselines: async (timeplanId: string): Promise<Baseline[]> => {
    const response = await BASELINE_API.getBaselines(timeplanId);
    return response.data.items;
  },
  
  // Create
  createBaseline: async (timeplanId: string, data: CreateBaselineRequest): Promise<Baseline> => {
    const response = await BASELINE_API.createBaseline(timeplanId, data);
    return response.data;
  },
  
  // Read
  getBaseline: async (baselineId: string): Promise<Baseline> => {
    const response = await BASELINE_API.getBaseline(baselineId);
    return response.data;
  },
  
  // Update
  updateBaseline: async (baselineId: string, data: UpdateBaselineRequest): Promise<Baseline> => {
    const response = await BASELINE_API.updateBaseline(baselineId, data);
    return response.data;
  },
  
  // Delete
  deleteBaseline: async (baselineId: string): Promise<void> => {
    await BASELINE_API.deleteBaseline(baselineId);
  },
  
  // Activate
  activateBaseline: async (baselineId: string): Promise<void> => {
    await BASELINE_API.activateBaseline(baselineId);
  },
  
  // Compare
  compareBaselines: async (
    baselineId1: string, 
    baselineId2: string
  ): Promise<BaselineComparisonResult> => {
    const response = await BASELINE_API.compareBaselines(baselineId1, baselineId2);
    return response.data;
  },
  
  // Statistics
  getStatistics: async (baselineId: string): Promise<BaselineStatistics> => {
    const response = await BASELINE_API.getBaselineStatistics(baselineId);
    return response.data;
  },
  
  // Requirement Items
  getRequirementItems: async (baselineId: string): Promise<RequirementItem[]> => {
    const response = await BASELINE_API.getRequirementItems(baselineId);
    return response.data.items;
  },
};

export default baselineService;
