/**
 * TimePlan 服务
 * 
 * 提供 TimePlan 相关的 API 调用
 */

import apiClient from '../client';
import { 
  PlanResponse, 
  CreatePlanRequest, 
  UpdatePlanRequest,
  TimelineResponse,
  CreateTimelineRequest,
  UpdateTimelineRequest,
  NodeResponse,
  CreateNodeRequest,
  DependencyResponse,
  CreateDependencyRequest,
} from '../types/backend';

// ============================================================================
// 扩展类型定义
// ============================================================================

/**
 * TimePlan 列表查询参数
 */
export interface GetTimePlansParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  tags?: string[];
  owner?: string;
}

/**
 * 分页响应
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Timeline 列表响应
 */
export interface TimelineListResponse {
  items: TimelineResponse[];
}

/**
 * Node 列表响应
 */
export interface NodeListResponse {
  items: NodeResponse[];
}

/**
 * Dependency 列表响应
 */
export interface DependencyListResponse {
  items: DependencyResponse[];
}

/**
 * 创建 Timeline 请求
 */
export interface CreateTimelineData {
  title: string;
  owner?: string;
  description?: string;
  color?: string;
  backgroundColor?: string;
  order?: number;
}

/**
 * 创建 Line (Node) 请求
 */
export interface CreateLineData {
  type: 'bar' | 'milestone' | 'gateway';
  label: string;
  description?: string;
  notes?: string;
  startDate: string;
  endDate?: string;
  color?: string;
  attributes?: Record<string, unknown>;
}

/**
 * 创建 Relation 请求
 */
export interface CreateRelationData {
  fromLineId: string;
  toLineId: string;
  type: 'FS' | 'FF' | 'SS' | 'SF';
  lagDays?: number;
  description?: string;
}

// ============================================================================
// TimePlan 服务类
// ============================================================================

export class TimeplanService {
  // ========================================================================
  // TimePlan CRUD 操作
  // ========================================================================

  /**
   * 获取 TimePlan 列表
   * 
   * @param params 查询参数
   * @returns 分页的 TimePlan 列表
   */
  async getTimePlans(params?: GetTimePlansParams): Promise<PaginatedResponse<PlanResponse>> {
    const response = await apiClient.get<PaginatedResponse<PlanResponse>>('/api/v1/timeplans', {
      params,
    });
    return response.data;
  }

  /**
   * 获取单个 TimePlan 详情
   * 
   * @param id TimePlan ID
   * @returns TimePlan 详情
   */
  async getTimePlan(id: string): Promise<PlanResponse> {
    const response = await apiClient.get<PlanResponse>(`/api/v1/timeplans/${id}`);
    return response.data;
  }

  /**
   * 创建 TimePlan
   * 
   * @param data 创建请求数据
   * @returns 创建的 TimePlan
   */
  async createTimePlan(data: CreatePlanRequest): Promise<PlanResponse> {
    const response = await apiClient.post<PlanResponse>('/api/v1/timeplans', data);
    return response.data;
  }

  /**
   * 更新 TimePlan
   * 
   * @param id TimePlan ID
   * @param data 更新请求数据
   * @returns 更新后的 TimePlan
   */
  async updateTimePlan(id: string, data: UpdatePlanRequest): Promise<PlanResponse> {
    const response = await apiClient.put<PlanResponse>(`/api/v1/timeplans/${id}`, data);
    return response.data;
  }

  /**
   * 删除 TimePlan
   * 
   * @param id TimePlan ID
   */
  async deleteTimePlan(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/timeplans/${id}`);
  }

  /**
   * 复制 TimePlan
   * 
   * @param id 要复制的 TimePlan ID
   * @param newTitle 新 TimePlan 标题
   * @returns 复制的 TimePlan
   */
  async duplicateTimePlan(id: string, newTitle?: string): Promise<PlanResponse> {
    const response = await apiClient.post<PlanResponse>(`/api/v1/timeplans/${id}/duplicate`, {
      newTitle,
    });
    return response.data;
  }

  // ========================================================================
  // Timeline 操作
  // ========================================================================

  /**
   * 获取 TimePlan 的所有 Timeline
   * 
   * @param timeplanId TimePlan ID
   * @returns Timeline 列表
   */
  async getTimelines(timeplanId: string): Promise<TimelineResponse[]> {
    const response = await apiClient.get<TimelineListResponse>(`/api/v1/timeplans/${timeplanId}/timelines`);
    return response.data.items || [];
  }

  /**
   * 创建 Timeline
   * 
   * @param timeplanId TimePlan ID
   * @param data 创建请求数据
   * @returns 创建的 Timeline
   */
  async createTimeline(timeplanId: string, data: CreateTimelineData): Promise<TimelineResponse> {
    const requestData: CreateTimelineRequest = {
      planId: timeplanId,
      title: data.title,
      owner: data.owner || '',
      description: data.description,
      color: data.color,
      backgroundColor: data.backgroundColor,
      order: data.order,
    };

    const response = await apiClient.post<TimelineResponse>(
      `/api/v1/timeplans/${timeplanId}/timelines`,
      requestData
    );
    return response.data;
  }

  /**
   * 批量创建 Timeline
   * 
   * @param timeplanId TimePlan ID
   * @param dataList Timeline 数据列表
   * @returns 创建的 Timeline 列表
   */
  async batchCreateTimelines(
    timeplanId: string,
    dataList: CreateTimelineData[]
  ): Promise<TimelineResponse[]> {
    const requestData = dataList.map((data, index) => ({
      planId: timeplanId,
      title: data.title,
      owner: data.owner || '',
      description: data.description,
      color: data.color,
      backgroundColor: data.backgroundColor,
      order: data.order ?? index,
    }));

    const response = await apiClient.post<TimelineListResponse>(
      `/api/v1/timeplans/${timeplanId}/timelines/batch`,
      { items: requestData }
    );
    return response.data.items || [];
  }

  // ========================================================================
  // Line (Node) 操作
  // ========================================================================

  /**
   * 获取 Timeline 的所有 Line
   * 
   * @param timelineId Timeline ID
   * @returns Line (Node) 列表
   */
  async getLines(timelineId: string): Promise<NodeResponse[]> {
    const response = await apiClient.get<NodeListResponse>(`/api/v1/timelines/${timelineId}/nodes`);
    return response.data.items || [];
  }

  /**
   * 创建 Line
   * 
   * @param timelineId Timeline ID
   * @param data 创建请求数据
   * @returns 创建的 Line
   */
  async createLine(timelineId: string, data: CreateLineData): Promise<NodeResponse> {
    const requestData: CreateNodeRequest = {
      timelineId,
      type: data.type,
      label: data.label,
      description: data.description,
      notes: data.notes,
      startDate: data.startDate,
      endDate: data.endDate,
      color: data.color,
      attributes: data.attributes,
    };

    const response = await apiClient.post<NodeResponse>(
      `/api/v1/timelines/${timelineId}/nodes`,
      requestData
    );
    return response.data;
  }

  /**
   * 批量创建 Line
   * 
   * @param timelineId Timeline ID
   * @param dataList Line 数据列表
   * @returns 创建的 Line 列表
   */
  async batchCreateLines(timelineId: string, dataList: CreateLineData[]): Promise<NodeResponse[]> {
    const requestData = dataList.map(data => ({
      timelineId,
      type: data.type,
      label: data.label,
      description: data.description,
      notes: data.notes,
      startDate: data.startDate,
      endDate: data.endDate,
      color: data.color,
      attributes: data.attributes,
    }));

    const response = await apiClient.post<NodeListResponse>(
      `/api/v1/timelines/${timelineId}/nodes/batch`,
      { items: requestData }
    );
    return response.data.items || [];
  }

  // ========================================================================
  // Relation (Dependency) 操作
  // ========================================================================

  /**
   * 获取 TimePlan 的所有 Relation
   * 
   * @param timeplanId TimePlan ID
   * @returns Relation (Dependency) 列表
   */
  async getRelations(timeplanId: string): Promise<DependencyResponse[]> {
    const response = await apiClient.get<DependencyListResponse>(
      `/api/v1/timeplans/${timeplanId}/dependencies`
    );
    return response.data.items || [];
  }

  /**
   * 创建 Relation
   * 
   * @param timeplanId TimePlan ID
   * @param data 创建请求数据
   * @returns 创建的 Relation
   */
  async createRelation(timeplanId: string, data: CreateRelationData): Promise<DependencyResponse> {
    const requestData: CreateDependencyRequest = {
      fromNodeId: data.fromLineId,
      toNodeId: data.toLineId,
      type: data.type,
      lagDays: data.lagDays,
      description: data.description,
    };

    const response = await apiClient.post<DependencyResponse>(
      `/api/v1/timeplans/${timeplanId}/dependencies`,
      requestData
    );
    return response.data;
  }

  /**
   * 批量创建 Relation
   * 
   * @param timeplanId TimePlan ID
   * @param dataList Relation 数据列表
   * @returns 创建的 Relation 列表
   */
  async batchCreateRelations(
    timeplanId: string,
    dataList: CreateRelationData[]
  ): Promise<DependencyResponse[]> {
    const requestData = dataList.map(data => ({
      fromNodeId: data.fromLineId,
      toNodeId: data.toLineId,
      type: data.type,
      lagDays: data.lagDays,
      description: data.description,
    }));

    const response = await apiClient.post<DependencyListResponse>(
      `/api/v1/timeplans/${timeplanId}/dependencies/batch`,
      { items: requestData }
    );
    return response.data.items || [];
  }

  // ========================================================================
  // 导入导出操作
  // ========================================================================

  /**
   * 导出 TimePlan 为 JSON
   * 
   * @param id TimePlan ID
   * @returns JSON 数据
   */
  async exportAsJSON(id: string): Promise<unknown> {
    const response = await apiClient.get<unknown>(`/api/v1/timeplans/${id}/export/json`);
    return response.data;
  }

  /**
   * 导出 TimePlan 为 Excel
   * 
   * @param id TimePlan ID
   * @returns Excel 文件 Blob
   */
  async exportAsExcel(id: string): Promise<Blob> {
    const response = await apiClient.get<Blob>(`/api/v1/timeplans/${id}/export/excel`, {
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * 从 JSON 导入 TimePlan
   * 
   * @param data JSON 数据
   * @returns 导入的 TimePlan
   */
  async importFromJSON(data: unknown): Promise<PlanResponse> {
    const response = await apiClient.post<PlanResponse>('/api/v1/timeplans/import/json', data);
    return response.data;
  }

  /**
   * 从 Excel 导入 TimePlan
   * 
   * @param file Excel 文件
   * @returns 导入的 TimePlan
   */
  async importFromExcel(file: File): Promise<PlanResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<PlanResponse>('/api/v1/timeplans/import/excel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

// ============================================================================
// 导出服务实例
// ============================================================================

export const timeplanService = new TimeplanService();
