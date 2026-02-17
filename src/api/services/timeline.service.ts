/**
 * 时间线服务
 */

import apiClient from '../client';
import { TimelineResponse, CreateTimelineRequest, UpdateTimelineRequest } from '../types/backend';
import { Timeline } from '@/types/timeline';
import { transformTimelineFromBackend, transformTimelineToBackend, createTimelineUpdateRequest } from '../transformers/timeline.transformer';

export class TimelineService {
  /**
   * 获取计划的所有时间线
   */
  async getTimelines(planId: string): Promise<Timeline[]> {
    const response = await apiClient.get<{ items: TimelineResponse[] }>(
      `/api/v1/plans/${planId}/timelines`
    );
    return response.data.items.map(t => transformTimelineFromBackend(t));
  }

  /**
   * 获取单个时间线
   */
  async getTimeline(id: string): Promise<Timeline> {
    const response = await apiClient.get<TimelineResponse>(`/api/v1/timelines/${id}`);
    return transformTimelineFromBackend(response.data);
  }

  /**
   * 创建时间线
   */
  async createTimeline(planId: string, data: Partial<Timeline>): Promise<Timeline> {
    const requestData = transformTimelineToBackend(data, planId);
    const response = await apiClient.post<TimelineResponse>(
      `/api/v1/plans/${planId}/timelines`,
      { ...requestData, planId }
    );
    return transformTimelineFromBackend(response.data);
  }

  /**
   * 更新时间线
   */
  async updateTimeline(id: string, data: Partial<Timeline>): Promise<Timeline> {
    const requestData = createTimelineUpdateRequest(data);
    const response = await apiClient.put<TimelineResponse>(`/api/v1/timelines/${id}`, requestData);
    return transformTimelineFromBackend(response.data);
  }

  /**
   * 删除时间线
   */
  async deleteTimeline(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/timelines/${id}`);
  }
}

export const timelineService = new TimelineService();
