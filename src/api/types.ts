/**
 * API类型定义
 * 
 * 与后端OpenAPI Schema对应
 */

// ==================== 通用类型 ====================

export interface ApiError {
  error: string;
  message: string;
}

export interface MessageResponse {
  message: string;
}

// ==================== 认证相关 ====================

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  display_name?: string;
}

export interface LoginRequest {
  username: string;  // 可以是username或email
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;  // 秒
}

export interface UserResponse {
  id: string;
  email: string;
  username: string;
  display_name: string | null;
  avatar: string | null;
  role: 'admin' | 'manager' | 'member' | 'viewer';
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileRequest {
  display_name?: string;
  avatar?: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

// ==================== 计划相关 ====================

export interface CreatePlanRequest {
  title: string;
  description?: string;
  owner: string;
  tags?: string[];
}

export interface UpdatePlanRequest {
  title?: string;
  description?: string;
  owner?: string;
  tags?: string[];
}

export interface PlanResponse {
  id: string;
  title: string;
  description: string | null;
  owner: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  created_by: string;
}

// ==================== 时间线相关 ====================

export interface CreateTimelineRequest {
  plan_id: string;
  title: string;
  description?: string;
  owner: string;
  color?: string;
  order?: number;
}

export interface UpdateTimelineRequest {
  title?: string;
  description?: string;
  owner?: string;
  color?: string;
  order?: number;
  collapsed?: boolean;
}

export interface TimelineResponse {
  id: string;
  plan_id: string;
  title: string;
  description: string | null;
  owner: string;
  color: string;
  order: number;
  collapsed: boolean;
  created_at: string;
  updated_at: string;
}

// ==================== 任务节点相关 ====================

export interface CreateLineRequest {
  timeline_id: string;
  type: 'bar' | 'milestone' | 'gateway';
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  properties?: Record<string, unknown>;
  style?: Record<string, unknown>;
  order?: number;
}

export interface UpdateLineRequest {
  title?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  properties?: Record<string, unknown>;
  style?: Record<string, unknown>;
  order?: number;
}

export interface LineResponse {
  id: string;
  timeline_id: string;
  type: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  properties: Record<string, unknown>;
  style: Record<string, unknown>;
  order: number;
  version: number;
  created_at: string;
  updated_at: string;
}

// ==================== 依赖关系相关 ====================

export interface CreateRelationRequest {
  source_line_id: string;
  target_line_id: string;
  type: 'FS' | 'FF' | 'SS' | 'SF';
  lag_days?: number;
  description?: string;
  style?: Record<string, unknown>;
}

export interface UpdateRelationRequest {
  type?: 'FS' | 'FF' | 'SS' | 'SF';
  lag_days?: number;
  description?: string;
  style?: Record<string, unknown>;
}

export interface RelationResponse {
  id: string;
  source_line_id: string;
  target_line_id: string;
  type: string;
  lag_days: number;
  description: string | null;
  style: Record<string, unknown>;
  version: number;
  created_at: string;
  updated_at: string;
}

// ==================== WebSocket相关 ====================

export interface Operation {
  op: 'create' | 'update' | 'delete';
  entity: 'line' | 'relation' | 'timeline';
  data: unknown;
  version: number;
  user_id: string;
  timestamp: string;
}

export interface WebSocketMessage {
  type: 'operation' | 'online_users' | 'error';
  data: unknown;
}
