# 前后端集成设计

**版本**: v1.0.0  
**日期**: 2026-02-14  
**状态**: 📋 设计定稿

---

## 📋 目录

1. [集成架构](#集成架构)
2. [API客户端设计](#api客户端设计)
3. [类型定义](#类型定义)
4. [错误处理](#错误处理)
5. [状态管理集成](#状态管理集成)
6. [WebSocket集成](#websocket集成)
7. [测试策略](#测试策略)

---

## 🏗️ 集成架构

### 技术栈

```
前端:
  - React 18 + TypeScript 5
  - Axios (HTTP客户端)
  - Socket.IO Client (WebSocket)
  - Zustand (状态管理)
  - React Query (可选：缓存与同步)

后端:
  - Python 3.11+ + FastAPI
  - python-socketio
  - PostgreSQL + Redis
```

### 目录结构

```
timeplan-craft-kit/src/
├── api/                     # API客户端层
│   ├── client.ts           # Axios配置
│   ├── auth.ts             # 认证API
│   ├── users.ts            # 用户API
│   ├── plans.ts            # 计划API
│   ├── timelines.ts        # 时间线API
│   ├── lines.ts            # 任务节点API
│   ├── relations.ts        # 依赖关系API
│   ├── websocket.ts        # WebSocket客户端
│   └── types.ts            # API类型定义
│
├── hooks/                   # React Hooks
│   ├── useAuth.ts          # 认证Hook
│   ├── usePlans.ts         # 计划数据Hook
│   ├── useTimelines.ts     # 时间线Hook
│   ├── useLines.ts         # 任务节点Hook
│   └── useWebSocket.ts     # WebSocket Hook
│
├── stores/                  # Zustand Store
│   ├── authStore.ts        # 认证状态
│   ├── timePlanStore.ts    # 计划状态（改造）
│   └── websocketStore.ts   # WebSocket状态
│
└── utils/
    ├── apiErrors.ts        # 错误处理
    └── apiMock.ts          # Mock数据（开发用）
```

---

## 🔌 API客户端设计

### 1. Axios配置 (`api/client.ts`)

```typescript
// src/api/client.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

// API配置
const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// 创建Axios实例
export const apiClient: AxiosInstance = axios.create(API_CONFIG);

// 请求拦截器：添加Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器：处理Token过期
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // 401错误：Token过期
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // 尝试刷新Token
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(
            `${API_CONFIG.baseURL}/api/v1/auth/refresh`,
            { refresh_token: refreshToken }
          );

          const { access_token, refresh_token: newRefreshToken } = response.data;
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', newRefreshToken);

          // 重试原请求
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
          }
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // 刷新失败，清除Token并跳转登录
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// 类型安全的请求方法
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.get<T>(url, config).then((res) => res.data),

  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.post<T>(url, data, config).then((res) => res.data),

  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.put<T>(url, data, config).then((res) => res.data),

  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.delete<T>(url, config).then((res) => res.data),
};
```

### 2. 认证API (`api/auth.ts`)

```typescript
// src/api/auth.ts
import { api } from './client';
import type {
  LoginRequest,
  RegisterRequest,
  TokenResponse,
  UserResponse,
} from './types';

export const authApi = {
  /**
   * 用户注册
   */
  register: (data: RegisterRequest) =>
    api.post<UserResponse>('/api/v1/auth/register', data),

  /**
   * 用户登录
   */
  login: (data: LoginRequest) =>
    api.post<TokenResponse>('/api/v1/auth/login', data),

  /**
   * 刷新Token
   */
  refreshToken: (refreshToken: string) =>
    api.post<TokenResponse>('/api/v1/auth/refresh', { refresh_token: refreshToken }),

  /**
   * 用户登出
   */
  logout: () => api.post('/api/v1/auth/logout'),

  /**
   * 获取当前用户信息
   */
  getCurrentUser: () => api.get<UserResponse>('/api/v1/users/me'),
};
```

### 3. 计划API (`api/plans.ts`)

```typescript
// src/api/plans.ts
import { api } from './client';
import type {
  TimePlanListResponse,
  TimePlanResponse,
  TimePlanDetailResponse,
  CreateTimePlanRequest,
  UpdateTimePlanRequest,
} from './types';

export const plansApi = {
  /**
   * 获取计划列表
   */
  list: (params?: {
    page?: number;
    page_size?: number;
    name?: string;
    owner_id?: string;
  }) => api.get<TimePlanListResponse>('/api/v1/plans', { params }),

  /**
   * 获取计划详情（含所有数据）
   */
  get: (planId: string) =>
    api.get<TimePlanDetailResponse>(`/api/v1/plans/${planId}`),

  /**
   * 创建计划
   */
  create: (data: CreateTimePlanRequest) =>
    api.post<TimePlanResponse>('/api/v1/plans', data),

  /**
   * 更新计划
   */
  update: (planId: string, data: UpdateTimePlanRequest) =>
    api.put<TimePlanResponse>(`/api/v1/plans/${planId}`, data),

  /**
   * 删除计划
   */
  delete: (planId: string) => api.delete(`/api/v1/plans/${planId}`),
};
```

### 4. 任务节点API (`api/lines.ts`)

```typescript
// src/api/lines.ts
import { api } from './client';
import type {
  LineListResponse,
  LineResponse,
  CreateLineRequest,
  UpdateLineRequest,
  BatchUpdateLinesRequest,
} from './types';

export const linesApi = {
  /**
   * 获取任务节点列表
   */
  list: (
    planId: string,
    params?: {
      timeline_id?: string;
      schema_id?: string;
      page?: number;
      page_size?: number;
    }
  ) => api.get<LineListResponse>(`/api/v1/plans/${planId}/lines`, { params }),

  /**
   * 获取单个任务节点
   */
  get: (planId: string, lineId: string) =>
    api.get<LineResponse>(`/api/v1/plans/${planId}/lines/${lineId}`),

  /**
   * 创建任务节点
   */
  create: (planId: string, data: CreateLineRequest) =>
    api.post<LineResponse>(`/api/v1/plans/${planId}/lines`, data),

  /**
   * 更新任务节点
   */
  update: (planId: string, lineId: string, data: UpdateLineRequest) =>
    api.put<LineResponse>(`/api/v1/plans/${planId}/lines/${lineId}`, data),

  /**
   * 删除任务节点
   */
  delete: (planId: string, lineId: string) =>
    api.delete(`/api/v1/plans/${planId}/lines/${lineId}`),

  /**
   * 批量创建
   */
  batchCreate: (planId: string, lines: CreateLineRequest[]) =>
    api.post<{ lines: LineResponse[] }>(
      `/api/v1/plans/${planId}/lines/batch`,
      { lines }
    ),

  /**
   * 批量更新
   */
  batchUpdate: (planId: string, data: BatchUpdateLinesRequest) =>
    api.put<{ updated_count: number; lines: LineResponse[] }>(
      `/api/v1/plans/${planId}/lines/batch`,
      data
    ),
};
```

---

## 📝 类型定义

### API类型 (`api/types.ts`)

```typescript
// src/api/types.ts

// ==================== 认证相关 ====================
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  display_name?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface UserResponse {
  id: string;
  email: string;
  username: string;
  display_name?: string;
  avatar?: string;
  role: 'admin' | 'manager' | 'member' | 'viewer';
  created_at: string;
  updated_at: string;
}

// ==================== 时间规划 ====================
export interface CreateTimePlanRequest {
  name: string;
  description?: string;
  project_id?: string;
}

export interface UpdateTimePlanRequest {
  name?: string;
  description?: string;
  view_config?: Record<string, any>;
}

export interface TimePlanResponse {
  id: string;
  name: string;
  description?: string;
  owner: UserResponse;
  project_id?: string;
  view_config?: Record<string, any>;
  version: number;
  created_at: string;
  updated_at: string;
  last_accessed_at?: string;
}

export interface TimePlanDetailResponse extends TimePlanResponse {
  timelines: TimelineResponse[];
  lines: LineResponse[];
  relations: RelationResponse[];
}

export interface TimePlanListResponse {
  items: TimePlanResponse[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

// ==================== 时间线 ====================
export interface CreateTimelineRequest {
  name: string;
  description?: string;
  color?: string;
  order?: number;
}

export interface UpdateTimelineRequest {
  name?: string;
  description?: string;
  color?: string;
  order?: number;
}

export interface TimelineResponse {
  id: string;
  plan_id: string;
  name: string;
  description?: string;
  color?: string;
  order: number;
  created_at: string;
  updated_at: string;
}

// ==================== 任务节点 ====================
export interface CreateLineRequest {
  timeline_id: string;
  schema_id: 'lineplan' | 'milestone' | 'gateway';
  label: string;
  start_date: string; // ISO 8601
  end_date?: string; // ISO 8601
  attributes?: Record<string, any>;
}

export interface UpdateLineRequest {
  timeline_id?: string;
  label?: string;
  start_date?: string;
  end_date?: string;
  attributes?: Record<string, any>;
}

export interface LineResponse {
  id: string;
  plan_id: string;
  timeline_id: string;
  schema_id: string;
  label: string;
  start_date: string;
  end_date?: string;
  attributes: Record<string, any>;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface LineListResponse {
  items: LineResponse[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface BatchUpdateLinesRequest {
  line_ids: string[];
  mode: 'merge' | 'replace';
  updates: Record<string, any>;
}

// ==================== 依赖关系 ====================
export interface CreateRelationRequest {
  from_line_id: string;
  to_line_id: string;
  type: 'FS' | 'SS' | 'FF' | 'SF';
  lag?: number;
  notes?: string;
}

export interface RelationResponse {
  id: string;
  plan_id: string;
  from_line_id: string;
  to_line_id: string;
  type: 'FS' | 'SS' | 'FF' | 'SF';
  lag: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: Array<{
    type: 'circular' | 'missing_node' | 'duplicate' | 'invalid_type';
    relation_id?: string;
    message: string;
    details?: Record<string, any>;
  }>;
}

export interface CriticalPathResponse {
  critical_path: string[];
  total_duration: number;
  earliest_start: Record<string, string>;
  latest_finish: Record<string, string>;
  slack: Record<string, number>;
}

// ==================== 错误 ====================
export interface ApiError {
  error: string;
  message: string;
  details?: Record<string, any>;
}
```

### 类型转换工具 (`utils/typeConverters.ts`)

```typescript
// src/utils/typeConverters.ts
import type { Line } from '@/types/timeplanSchema';
import type { LineResponse, CreateLineRequest } from '@/api/types';

/**
 * 将API返回的Line转换为前端Line类型
 */
export function apiLineToFrontendLine(apiLine: LineResponse): Line {
  return {
    id: apiLine.id,
    timelineId: apiLine.timeline_id,
    schemaId: apiLine.schema_id as any,
    label: apiLine.label,
    startDate: new Date(apiLine.start_date),
    endDate: apiLine.end_date ? new Date(apiLine.end_date) : undefined,
    ...apiLine.attributes,
  };
}

/**
 * 将前端Line转换为API创建请求
 */
export function frontendLineToApiCreate(line: Partial<Line>): CreateLineRequest {
  const { timelineId, schemaId, label, startDate, endDate, ...attributes } = line;

  return {
    timeline_id: timelineId!,
    schema_id: schemaId!,
    label: label!,
    start_date: startDate!.toISOString(),
    end_date: endDate?.toISOString(),
    attributes,
  };
}
```

---

## ⚠️ 错误处理

### 错误处理工具 (`utils/apiErrors.ts`)

```typescript
// src/utils/apiErrors.ts
import { AxiosError } from 'axios';
import type { ApiError } from '@/api/types';
import { message } from 'antd';

/**
 * 处理API错误
 */
export function handleApiError(error: unknown): void {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiError>;

    if (axiosError.response) {
      // 服务器返回错误
      const apiError = axiosError.response.data;
      const errorMessage = apiError.message || '请求失败';

      switch (axiosError.response.status) {
        case 400:
          message.error(`请求参数错误: ${errorMessage}`);
          break;
        case 401:
          message.error('未登录或登录已过期');
          // Token刷新逻辑在interceptor中处理
          break;
        case 403:
          message.error('无权限执行此操作');
          break;
        case 404:
          message.error('资源不存在');
          break;
        case 409:
          message.error(`冲突: ${errorMessage}`);
          break;
        case 422:
          // 数据验证错误
          message.error(`数据验证失败: ${errorMessage}`);
          break;
        case 500:
          message.error('服务器错误，请稍后重试');
          break;
        default:
          message.error(`错误: ${errorMessage}`);
      }

      console.error('API Error:', apiError);
    } else if (axiosError.request) {
      // 请求已发送但未收到响应
      message.error('网络错误，请检查网络连接');
      console.error('Network Error:', axiosError);
    } else {
      // 请求配置错误
      message.error('请求配置错误');
      console.error('Request Setup Error:', axiosError);
    }
  } else {
    // 其他错误
    message.error('未知错误');
    console.error('Unknown Error:', error);
  }
}

/**
 * 包装异步API调用
 */
export async function withErrorHandling<T>(
  apiCall: () => Promise<T>,
  options?: {
    successMessage?: string;
    errorMessage?: string;
  }
): Promise<T | null> {
  try {
    const result = await apiCall();
    if (options?.successMessage) {
      message.success(options.successMessage);
    }
    return result;
  } catch (error) {
    if (options?.errorMessage) {
      message.error(options.errorMessage);
    } else {
      handleApiError(error);
    }
    return null;
  }
}
```

---

## 🎣 React Hooks集成

### 计划数据Hook (`hooks/usePlans.ts`)

```typescript
// src/hooks/usePlans.ts
import { useState, useEffect, useCallback } from 'react';
import { plansApi } from '@/api/plans';
import { linesApi } from '@/api/lines';
import type { TimePlanDetailResponse } from '@/api/types';
import { handleApiError, withErrorHandling } from '@/utils/apiErrors';
import { useTimePlanStore } from '@/stores/timePlanStore';

export function usePlans() {
  const [loading, setLoading] = useState(false);
  const { currentPlan, setCurrentPlan } = useTimePlanStore();

  /**
   * 加载计划详情
   */
  const loadPlan = useCallback(async (planId: string) => {
    setLoading(true);
    try {
      const plan = await plansApi.get(planId);
      
      // 转换为前端数据格式并存储到Zustand
      setCurrentPlan({
        id: plan.id,
        name: plan.name,
        description: plan.description,
        timelines: plan.timelines.map(t => ({
          id: t.id,
          name: t.name,
          description: t.description,
          color: t.color,
          lineIds: [],
        })),
        lines: plan.lines.map(apiLineToFrontendLine),
        relations: plan.relations.map(r => ({
          id: r.id,
          fromLineId: r.from_line_id,
          toLineId: r.to_line_id,
          type: r.type,
          lag: r.lag,
        })),
        baselines: [],
      });

      return plan;
    } catch (error) {
      handleApiError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [setCurrentPlan]);

  /**
   * 创建Line
   */
  const createLine = useCallback(
    async (planId: string, lineData: CreateLineRequest) => {
      return withErrorHandling(
        () => linesApi.create(planId, lineData),
        { successMessage: '创建成功' }
      );
    },
    []
  );

  /**
   * 更新Line
   */
  const updateLine = useCallback(
    async (planId: string, lineId: string, lineData: UpdateLineRequest) => {
      return withErrorHandling(
        () => linesApi.update(planId, lineId, lineData),
        { successMessage: '更新成功' }
      );
    },
    []
  );

  /**
   * 批量更新Lines
   */
  const batchUpdateLines = useCallback(
    async (planId: string, lineIds: string[], updates: Record<string, any>) => {
      return withErrorHandling(
        () => linesApi.batchUpdate(planId, { line_ids: lineIds, mode: 'merge', updates }),
        { successMessage: `已更新 ${lineIds.length} 个任务` }
      );
    },
    []
  );

  return {
    loading,
    currentPlan,
    loadPlan,
    createLine,
    updateLine,
    batchUpdateLines,
  };
}
```

---

## 🔄 WebSocket集成

### WebSocket客户端 (`api/websocket.ts`)

```typescript
// src/api/websocket.ts
import io, { Socket } from 'socket.io-client';

export interface Operation {
  id: string;
  client_id: string;
  type: 'insert' | 'delete' | 'update' | 'move';
  path: string[];
  value?: any;
  old_value?: any;
  version: number;
}

export interface WebSocketMessage {
  type: 'operation' | 'cursor' | 'online_users' | 'error';
  data: any;
}

export class WebSocketClient {
  private socket: Socket | null = null;
  private planId: string | null = null;

  /**
   * 连接到计划房间
   */
  connect(planId: string, token: string): void {
    const wsUrl = import.meta.env.VITE_WS_BASE_URL || 'http://localhost:8000';

    this.socket = io(wsUrl, {
      auth: { token },
      transports: ['websocket'],
    });

    this.planId = planId;

    this.socket.on('connect', () => {
      console.log('[WebSocket] Connected');
      this.socket?.emit('join_plan', { plan_id: planId });
    });

    this.socket.on('disconnect', () => {
      console.log('[WebSocket] Disconnected');
    });

    this.socket.on('error', (error: any) => {
      console.error('[WebSocket] Error:', error);
    });
  }

  /**
   * 发送操作
   */
  sendOperation(operation: Operation): void {
    if (!this.socket || !this.planId) {
      console.error('[WebSocket] Not connected');
      return;
    }

    this.socket.emit('operation', {
      plan_id: this.planId,
      operation,
    });
  }

  /**
   * 监听操作
   */
  onOperation(callback: (operation: Operation) => void): void {
    this.socket?.on('operation', (data: { operation: Operation }) => {
      callback(data.operation);
    });
  }

  /**
   * 监听在线用户
   */
  onOnlineUsers(callback: (users: any[]) => void): void {
    this.socket?.on('online_users', (data: { users: any[] }) => {
      callback(data.users);
    });
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
    this.planId = null;
  }
}
```

---

## ✅ 测试策略

### 集成测试思路

1. **Mock API在前期**
   - 使用MSW (Mock Service Worker)
   - 模拟完整的API响应
   - 前端独立开发测试

2. **逐步替换为真实API**
   - 认证模块先行
   - TimePlan CRUD
   - Line CRUD
   - Relation + WebSocket

3. **端到端测试**
   - Cypress测试关键流程
   - 前后端完整联调

---

**下一步**: 创建API测试用例集
