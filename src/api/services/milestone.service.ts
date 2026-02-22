/**
 * Milestone Service - 里程碑管理服务
 * 
 * 提供里程碑相关的所有API调用：
 * - 里程碑CRUD
 * - 进度更新
 * - 基线对比
 * - 退出准则检查
 */

import apiClient from '../client';
import { MessageResponse } from '../types';

// ======== Types ========

export interface Milestone {
  id: string;
  timeplanId: string;
  name: string;
  description?: string;
  type: 'milestone' | 'gate' | 'checkpoint';
  targetDate: string;
  actualDate?: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'delayed';
  progress: number;
  owner?: string;
  dependencies?: string[];
  attributes?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface MilestoneListResponse {
  items: Milestone[];
  total: number;
}

export interface MilestoneProgress {
  milestoneId: string;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'delayed';
  updatedAt: string;
  updatedBy?: string;
  notes?: string;
  history: MilestoneProgressHistoryItem[];
}

export interface MilestoneProgressHistoryItem {
  id: string;
  progress: number;
  status: string;
  notes?: string;
  createdAt: string;
  createdBy?: string;
}

export interface MilestoneComparisonResult {
  milestoneId: string;
  baselineId: string;
  current: {
    targetDate: string;
    status: string;
    progress: number;
  };
  baseline: {
    targetDate: string;
    status: string;
    progress: number;
  };
  variance: {
    daysDiff: number;
    statusChanged: boolean;
    progressDiff: number;
  };
}

export interface ExitCriterion {
  id: string;
  milestoneId: string;
  category: string;
  title: string;
  description?: string;
  required: boolean;
  status: 'pending' | 'in_progress' | 'completed' | 'waived';
  evidence?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  order: number;
}

export interface ExitCriteriaCheckResult {
  milestoneId: string;
  overallStatus: 'not_ready' | 'partial' | 'ready';
  totalCriteria: number;
  completedCriteria: number;
  waivedCriteria: number;
  pendingCriteria: number;
  criteria: ExitCriterion[];
  canExit: boolean;
  blockers: string[];
}

export interface TargetItem {
  id: string;
  milestoneId: string;
  type: 'feature' | 'ssts' | 'mr' | 'deliverable';
  title: string;
  description?: string;
  targetDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  assignee?: string;
  progress: number;
  dependencies?: string[];
}

// Request Types
export interface CreateMilestoneRequest {
  name: string;
  description?: string;
  type?: 'milestone' | 'gate' | 'checkpoint';
  targetDate: string;
  owner?: string;
  dependencies?: string[];
  attributes?: Record<string, any>;
}

export interface UpdateMilestoneRequest {
  name?: string;
  description?: string;
  type?: 'milestone' | 'gate' | 'checkpoint';
  targetDate?: string;
  actualDate?: string;
  status?: 'not_started' | 'in_progress' | 'completed' | 'delayed';
  progress?: number;
  owner?: string;
  dependencies?: string[];
  attributes?: Record<string, any>;
}

export interface UpdateMilestoneProgressRequest {
  progress: number;
  status?: 'not_started' | 'in_progress' | 'completed' | 'delayed';
  actualDate?: string;
  notes?: string;
}

export interface UpdateTargetItemStatusRequest {
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  progress?: number;
  notes?: string;
}

// ======== Service Object ========

export const milestoneService = {
  // ========== CRUD ==========
  getMilestones: async (timeplanId: string): Promise<Milestone[]> => {
    const response = await apiClient.get<MilestoneListResponse>(
      `/api/v1/timeplans/${timeplanId}/milestones`
    );
    return response.data.items;
  },
  
  createMilestone: async (timeplanId: string, data: CreateMilestoneRequest): Promise<Milestone> => {
    const response = await apiClient.post<Milestone>(
      `/api/v1/timeplans/${timeplanId}/milestones`,
      {
        ...data,
        target_date: data.targetDate,
      }
    );
    return response.data;
  },
  
  getMilestone: async (milestoneId: string): Promise<Milestone> => {
    const response = await apiClient.get<Milestone>(`/api/v1/milestones/${milestoneId}`);
    return response.data;
  },
  
  updateMilestone: async (milestoneId: string, data: UpdateMilestoneRequest): Promise<Milestone> => {
    const response = await apiClient.put<Milestone>(`/api/v1/milestones/${milestoneId}`, {
      ...data,
      target_date: data.targetDate,
      actual_date: data.actualDate,
    });
    return response.data;
  },
  
  deleteMilestone: async (milestoneId: string): Promise<void> => {
    await apiClient.delete<MessageResponse>(`/api/v1/milestones/${milestoneId}`);
  },
  
  // ========== Progress ==========
  getProgress: async (milestoneId: string): Promise<MilestoneProgress> => {
    const response = await apiClient.get<MilestoneProgress>(
      `/api/v1/milestones/${milestoneId}/progress`
    );
    return response.data;
  },
  
  updateProgress: async (
    milestoneId: string, 
    data: UpdateMilestoneProgressRequest
  ): Promise<Milestone> => {
    const response = await apiClient.post<Milestone>(
      `/api/v1/milestones/${milestoneId}/progress`,
      {
        progress: data.progress,
        status: data.status,
        actual_date: data.actualDate,
        notes: data.notes,
      }
    );
    return response.data;
  },
  
  // ========== Comparison ==========
  compareWithBaseline: async (milestoneId: string, baselineId?: string): Promise<MilestoneComparisonResult> => {
    const params = baselineId ? { baseline_id: baselineId } : {};
    const response = await apiClient.get<MilestoneComparisonResult>(
      `/api/v1/milestones/${milestoneId}/compare-with-baseline`,
      { params }
    );
    return response.data;
  },
  
  // ========== Exit Criteria ==========
  getExitCriteria: async (milestoneId: string): Promise<ExitCriteriaCheckResult> => {
    const response = await apiClient.get<ExitCriteriaCheckResult>(
      `/api/v1/milestones/${milestoneId}/exit-criteria`
    );
    return response.data;
  },
  
  // ========== Target Items ==========
  getTargetItems: async (milestoneId: string): Promise<TargetItem[]> => {
    const response = await apiClient.get<{ items: TargetItem[] }>(
      `/api/v1/milestones/${milestoneId}/target-items`
    );
    return response.data.items;
  },
  
  updateTargetItemStatus: async (
    milestoneId: string,
    itemId: string,
    data: UpdateTargetItemStatusRequest
  ): Promise<TargetItem> => {
    const response = await apiClient.post<TargetItem>(
      `/api/v1/milestones/${milestoneId}/target-items/${itemId}/status`,
      data
    );
    return response.data;
  },
};

export default milestoneService;
