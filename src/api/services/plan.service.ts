/**
 * 计划服务
 */

import apiClient from '../client';
import { PlanResponse, CreatePlanRequest, UpdatePlanRequest } from '../types/backend';

export class PlanService {
  /**
   * 获取计划列表
   */
  async getPlans(): Promise<PlanResponse[]> {
    const response = await apiClient.get<{ items: PlanResponse[] }>('/api/v1/timeplans');
    return response.data.items || [];
  }

  /**
   * 获取单个计划
   */
  async getPlan(id: string): Promise<PlanResponse> {
    const response = await apiClient.get<PlanResponse>(`/api/v1/timeplans/${id}`);
    return response.data;
  }

  /**
   * 创建计划
   */
  async createPlan(data: CreatePlanRequest): Promise<PlanResponse> {
    const response = await apiClient.post<PlanResponse>('/api/v1/timeplans', data);
    return response.data;
  }

  /**
   * 更新计划
   */
  async updatePlan(id: string, data: UpdatePlanRequest): Promise<PlanResponse> {
    const response = await apiClient.put<PlanResponse>(`/api/v1/timeplans/${id}`, data);
    return response.data;
  }

  /**
   * 删除计划
   */
  async deletePlan(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/timeplans/${id}`);
  }
}

export const planService = new PlanService();
