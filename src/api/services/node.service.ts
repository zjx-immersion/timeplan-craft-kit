/**
 * 节点服务
 */

import apiClient from '../client';
import { NodeResponse, CreateNodeRequest, UpdateNodeRequest } from '../types/backend';
import { TimelineNode } from '@/types/timeline';
import {
  transformNodeFromBackend,
  transformNodeToBackend,
  transformNodesFromBackend,
  createNodeUpdateRequest,
} from '../transformers/node.transformer';

export class NodeService {
  /**
   * 获取计划的所有节点
   */
  async getNodesByPlan(planId: string): Promise<TimelineNode[]> {
    const response = await apiClient.get<{ items: NodeResponse[] }>(
      `/api/v1/plans/${planId}/nodes`
    );
    return transformNodesFromBackend(response.data.items);
  }

  /**
   * 获取时间线的所有节点
   */
  async getNodesByTimeline(timelineId: string): Promise<TimelineNode[]> {
    const response = await apiClient.get<{ items: NodeResponse[] }>(
      `/api/v1/timelines/${timelineId}/nodes`
    );
    return transformNodesFromBackend(response.data.items);
  }

  /**
   * 获取单个节点
   */
  async getNode(id: string): Promise<TimelineNode> {
    const response = await apiClient.get<NodeResponse>(`/api/v1/nodes/${id}`);
    return transformNodeFromBackend(response.data);
  }

  /**
   * 创建节点
   */
  async createNode(timelineId: string, data: Partial<TimelineNode>): Promise<TimelineNode> {
    const requestData = transformNodeToBackend(data, timelineId);
    const response = await apiClient.post<NodeResponse>(
      `/api/v1/timelines/${timelineId}/nodes`,
      { ...requestData, timelineId }
    );
    return transformNodeFromBackend(response.data);
  }

  /**
   * 更新节点
   */
  async updateNode(id: string, data: Partial<TimelineNode>): Promise<TimelineNode> {
    const requestData = createNodeUpdateRequest(data);
    const response = await apiClient.put<NodeResponse>(`/api/v1/nodes/${id}`, requestData);
    return transformNodeFromBackend(response.data);
  }

  /**
   * 删除节点
   */
  async deleteNode(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/nodes/${id}`);
  }

  /**
   * 批量创建节点
   */
  async batchCreateNodes(
    timelineId: string,
    nodes: Partial<TimelineNode>[]
  ): Promise<TimelineNode[]> {
    const requestData = nodes.map(node => transformNodeToBackend(node, timelineId));
    const response = await apiClient.post<{ items: NodeResponse[] }>(
      `/api/v1/timelines/${timelineId}/nodes/batch`,
      { nodes: requestData }
    );
    return transformNodesFromBackend(response.data.items);
  }

  /**
   * 批量更新节点
   */
  async batchUpdateNodes(updates: Array<{ id: string; data: Partial<TimelineNode> }>): Promise<TimelineNode[]> {
    const requestData = updates.map(({ id, data }) => ({
      id,
      ...createNodeUpdateRequest(data),
    }));
    const response = await apiClient.put<{ items: NodeResponse[] }>(
      '/api/v1/nodes/batch',
      { updates: requestData }
    );
    return transformNodesFromBackend(response.data.items);
  }
}

export const nodeService = new NodeService();
