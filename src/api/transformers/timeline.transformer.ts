/**
 * Timeline 数据转换器
 * 
 * 处理前端 Timeline 和后端 TimelineResponse 之间的转换
 */

import { Timeline } from '@/types/timeline';
import { TimelineResponse, CreateTimelineRequest, UpdateTimelineRequest } from '../types/backend';
import { transformNodesFromBackend } from './node.transformer';

/**
 * 后端 TimelineResponse 转换为前端 Timeline
 */
export function transformTimelineFromBackend(
  backendTimeline: TimelineResponse,
  nodes?: any[]
): Timeline {
  return {
    id: backendTimeline.id,
    name: backendTimeline.title, // 后端用 title，前端用 name
    owner: backendTimeline.owner,
    description: backendTimeline.description || undefined,
    color: backendTimeline.color,
    backgroundColor: backendTimeline.backgroundColor || undefined,
    nodes: nodes ? transformNodesFromBackend(nodes) : [],
  };
}

/**
 * 前端 Timeline 转换为后端 CreateTimelineRequest
 */
export function transformTimelineToBackend(
  timeline: Partial<Timeline>,
  planId: string
): Omit<CreateTimelineRequest, 'planId'> {
  return {
    title: timeline.name || '', // 前端用 name，后端用 title
    owner: timeline.owner || '',
    description: timeline.description,
    color: timeline.color,
    backgroundColor: timeline.backgroundColor,
  };
}

/**
 * 转换多个时间线（从后端）
 */
export function transformTimelinesFromBackend(
  backendTimelines: TimelineResponse[]
): Timeline[] {
  return backendTimelines.map(t => transformTimelineFromBackend(t));
}

/**
 * 创建更新请求数据
 */
export function createTimelineUpdateRequest(updates: Partial<Timeline>): UpdateTimelineRequest {
  const request: UpdateTimelineRequest = {};

  if (updates.name !== undefined) request.title = updates.name;
  if (updates.owner !== undefined) request.owner = updates.owner;
  if (updates.description !== undefined) request.description = updates.description;
  if (updates.color !== undefined) request.color = updates.color;
  if (updates.backgroundColor !== undefined) request.backgroundColor = updates.backgroundColor;

  return request;
}
