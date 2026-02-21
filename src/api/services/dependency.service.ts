/**
 * 依赖关系服务
 */

import apiClient from '../client';
import { DependencyResponse, CreateDependencyRequest } from '../types/backend';
import { Dependency } from '@/types/timeline';
import {
  transformDependencyFromBackend,
  transformDependencyToBackend,
  transformDependenciesFromBackend,
} from '../transformers/dependency.transformer';

export class DependencyService {
  /**
   * 获取节点的依赖关系
   */
  async getNodeDependencies(
    nodeId: string,
    direction?: 'from' | 'to' | 'both'
  ): Promise<Dependency[]> {
    const response = await apiClient.get<{ items: DependencyResponse[] }>(
      `/api/v1/nodes/${nodeId}/dependencies`,
      { params: { direction } }
    );
    return transformDependenciesFromBackend(response.data.items);
  }

  /**
   * 获取计划的所有依赖关系
   * 注意：后端依赖API使用 /api/v1/plans 路径
   */
  async getPlanDependencies(planId: string): Promise<Dependency[]> {
    const response = await apiClient.get<{ items: DependencyResponse[] }>(
      `/api/v1/plans/${planId}/dependencies`
    );
    return transformDependenciesFromBackend(response.data.items);
  }

  /**
   * 创建依赖关系
   */
  async createDependency(data: Partial<Dependency>): Promise<Dependency> {
    const requestData = transformDependencyToBackend(data) as CreateDependencyRequest;
    const response = await apiClient.post<DependencyResponse>('/api/v1/dependencies', requestData);
    return transformDependencyFromBackend(response.data);
  }

  /**
   * 更新依赖关系
   */
  async updateDependency(id: string, data: Partial<Dependency>): Promise<Dependency> {
    const requestData = transformDependencyToBackend(data);
    const response = await apiClient.put<DependencyResponse>(`/api/v1/dependencies/${id}`, requestData);
    return transformDependencyFromBackend(response.data);
  }

  /**
   * 删除依赖关系
   */
  async deleteDependency(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/dependencies/${id}`);
  }

  /**
   * 检查循环依赖
   */
  async checkCycle(fromNodeId: string, toNodeId: string): Promise<{ hasCycle: boolean; cyclePath?: string[] }> {
    const response = await apiClient.post<{ hasCycle: boolean; cyclePath?: string[] }>(
      '/api/v1/dependencies/check-cycle',
      { fromNodeId, toNodeId }
    );
    return response.data;
  }
}

export const dependencyService = new DependencyService();
