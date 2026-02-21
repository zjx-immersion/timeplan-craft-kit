/**
 * 后端 API 类型定义
 * 
 * 这些类型对应后端返回的数据结构
 * 注意：后端使用 snake_case，但这里定义为 camelCase
 * 因为在 API 客户端的拦截器中会自动转换
 */

/**
 * 认证相关类型
 */
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Plan 相关类型
 */
export interface CreatePlanRequest {
  title: string;
  owner: string;
  description?: string;
  tags?: string[];
}

export interface UpdatePlanRequest {
  title?: string;
  owner?: string;
  description?: string;
  tags?: string[];
}

export interface PlanResponse {
  id: string;
  title: string;
  description: string | null;
  owner: string;
  tags: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Timeline 相关类型
 */
export interface CreateTimelineRequest {
  planId: string;
  title: string;
  owner: string;
  description?: string;
  color?: string;
  backgroundColor?: string;
  order?: number;
  collapsed?: boolean;
}

export interface UpdateTimelineRequest {
  title?: string;
  owner?: string;
  description?: string;
  color?: string;
  backgroundColor?: string;
  order?: number;
  collapsed?: boolean;
}

export interface TimelineResponse {
  id: string;
  planId: string;
  title: string;
  description: string | null;
  owner: string;
  color: string;
  backgroundColor: string | null;
  order: number;
  collapsed: boolean;
  createdAt: string;
  updatedAt: string;
  nodeCount?: number;
}

/**
 * Node 相关类型
 */
export type NodeType = 'bar' | 'milestone' | 'gateway';

export interface CreateNodeRequest {
  timelineId: string;
  type: NodeType;
  label: string;
  description?: string;
  notes?: string;
  startDate: string; // ISO format
  endDate?: string; // ISO format
  color?: string;
  attributes?: Record<string, any>;
}

export interface UpdateNodeRequest {
  type?: NodeType;
  label?: string;
  description?: string;
  notes?: string;
  startDate?: string;
  endDate?: string;
  color?: string;
  attributes?: Record<string, any>;
}

export interface NodeResponse {
  id: string;
  timelineId: string;
  planId: string;
  type: NodeType;
  label: string;
  description: string | null;
  notes: string | null;
  startDate: string;
  endDate: string | null;
  color: string | null;
  attributes: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  timelineTitle?: string;
  dependencyCount?: number;
}

/**
 * Dependency 相关类型
 */
export type DependencyType = 'FS' | 'FF' | 'SS' | 'SF';

export interface CreateDependencyRequest {
  fromNodeId: string;
  toNodeId: string;
  type: DependencyType;
  lagDays?: number;
  description?: string;
}

export interface UpdateDependencyRequest {
  type?: DependencyType;
  lagDays?: number;
  description?: string;
}

export interface DependencyResponse {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  type: DependencyType;
  lagDays: number;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  fromNodeLabel?: string;
  toNodeLabel?: string;
}

/**
 * Baseline 相关类型
 */
export interface CreateBaselineRequest {
  name: string;
  description?: string;
  tags?: string[];
}

export interface UpdateBaselineRequest {
  name?: string;
  description?: string;
  tags?: string[];
}

export interface BaselineStatistics {
  totalTimelines: number;
  totalNodes: number;
  totalDependencies: number;
  nodeTypes: Record<string, number>;
}

export interface BaselineResponse {
  id: string;
  planId: string;
  name: string;
  description: string | null;
  tags: string[];
  statistics: BaselineStatistics;
  snapshot?: any; // 完整快照数据
  snapshotData?: any; // 兼容字段
  createdAt: string;
  createdBy: string;
}

/**
 * API 错误响应
 */
export interface ApiError {
  detail: string | { message: string; [key: string]: any };
}
