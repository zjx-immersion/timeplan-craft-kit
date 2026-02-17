/**
 * Node 数据转换器
 * 
 * 处理前端 TimelineNode 和后端 NodeResponse 之间的转换
 */

import { TimelineNode } from '@/types/timeline';
import { NodeResponse, CreateNodeRequest, UpdateNodeRequest, NodeType } from '../types/backend';

/**
 * 依赖类型映射：前端 -> 后端
 */
const DEPENDENCY_TYPE_MAP = {
  'finish-to-start': 'FS',
  'start-to-start': 'SS',
  'finish-to-finish': 'FF',
  'start-to-finish': 'SF',
} as const;

/**
 * 依赖类型映射：后端 -> 前端
 */
const DEPENDENCY_TYPE_REVERSE_MAP = {
  'FS': 'finish-to-start',
  'SS': 'start-to-start',
  'FF': 'finish-to-finish',
  'SF': 'start-to-finish',
} as const;

/**
 * 后端 NodeResponse 转换为前端 TimelineNode
 */
export function transformNodeFromBackend(backendNode: NodeResponse): TimelineNode {
  const { 
    id, 
    label, 
    startDate, 
    endDate, 
    timelineId, 
    type, 
    color, 
    notes, 
    attributes 
  } = backendNode;

  // 处理前端的 'line' 类型（存储在 attributes 中）
  const frontendType = attributes?.frontendType || type;

  return {
    id,
    type: frontendType as TimelineNode['type'],
    label,
    startDate: new Date(startDate),
    endDate: endDate ? new Date(endDate) : undefined,
    timelineId,
    color: color || undefined,
    notes: notes || undefined,
    // 如果是嵌套计划（line 类型），恢复 planReference
    planReference: attributes?.planReference ? {
      planId: attributes.planReference.planId,
      templateType: attributes.planReference.templateType,
      isExpanded: attributes.planReference.isExpanded,
      expandedAt: attributes.planReference.expandedAt 
        ? new Date(attributes.planReference.expandedAt) 
        : undefined,
      nestedPlan: attributes.planReference.nestedPlan,
      iterationConfig: attributes.planReference.iterationConfig,
    } : undefined,
  };
}

/**
 * 前端 TimelineNode 转换为后端 CreateNodeRequest
 */
export function transformNodeToBackend(
  node: Partial<TimelineNode>, 
  timelineId: string
): Omit<CreateNodeRequest, 'timelineId'> {
  // 前端 'line' 类型映射到后端 'bar'
  const backendType: NodeType = node.type === 'line' ? 'bar' : (node.type as NodeType);

  const attributes: Record<string, any> = {};

  // 如果是 line 类型，标记并保存嵌套计划信息
  if (node.type === 'line') {
    attributes.frontendType = 'line';
    attributes.isNestedPlan = true;
    if (node.planReference) {
      attributes.planReference = node.planReference;
    }
  }

  // 合并用户自定义的 attributes
  if (node.attributes) {
    Object.assign(attributes, node.attributes);
  }

  return {
    type: backendType,
    label: node.label || '',
    description: node.description,
    notes: node.notes,
    startDate: node.startDate ? node.startDate.toISOString() : new Date().toISOString(),
    endDate: node.endDate?.toISOString(),
    color: node.color,
    attributes,
  };
}

/**
 * 转换多个节点（从后端）
 */
export function transformNodesFromBackend(backendNodes: NodeResponse[]): TimelineNode[] {
  return backendNodes.map(transformNodeFromBackend);
}

/**
 * 创建更新请求数据
 */
export function createNodeUpdateRequest(updates: Partial<TimelineNode>): UpdateNodeRequest {
  const request: UpdateNodeRequest = {};

  if (updates.type) {
    request.type = updates.type === 'line' ? 'bar' : (updates.type as NodeType);
  }
  if (updates.label !== undefined) request.label = updates.label;
  if (updates.description !== undefined) request.description = updates.description;
  if (updates.notes !== undefined) request.notes = updates.notes;
  if (updates.startDate) request.startDate = updates.startDate.toISOString();
  if (updates.endDate) request.endDate = updates.endDate.toISOString();
  if (updates.color !== undefined) request.color = updates.color;

  // 处理 attributes
  if (updates.type === 'line' || updates.planReference) {
    request.attributes = {
      frontendType: 'line',
      isNestedPlan: true,
      planReference: updates.planReference,
    };
  }

  return request;
}

/**
 * 依赖类型转换：前端 -> 后端
 */
export function transformDependencyTypeToBackend(
  frontendType: 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish'
): 'FS' | 'SS' | 'FF' | 'SF' {
  return DEPENDENCY_TYPE_MAP[frontendType];
}

/**
 * 依赖类型转换：后端 -> 前端
 */
export function transformDependencyTypeFromBackend(
  backendType: 'FS' | 'SS' | 'FF' | 'SF'
): 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish' {
  return DEPENDENCY_TYPE_REVERSE_MAP[backendType];
}
