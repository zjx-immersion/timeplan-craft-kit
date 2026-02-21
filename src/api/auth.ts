/**
 * 认证API
 * 
 * 对应后端认证API端点
 */
import apiClient from './client';
import type {
  RegisterRequest,
  LoginRequest,
  TokenResponse,
  UserResponse,
  UpdateProfileRequest,
  ChangePasswordRequest,
  RefreshTokenRequest,
  MessageResponse,
} from './types';

/**
 * 认证API接口
 */
export const authApi = {
  /**
   * 用户注册
   * POST /api/v1/auth/register
   */
  register: (data: RegisterRequest) =>
    apiClient.post<UserResponse>('/api/v1/auth/register', data),

  /**
   * 用户登录
   * POST /api/v1/auth/login
   */
  login: (data: LoginRequest) =>
    apiClient.post<TokenResponse>('/api/v1/auth/login', data),

  /**
   * 获取当前用户信息
   * GET /api/v1/auth/me
   */
  getCurrentUser: () =>
    apiClient.get<UserResponse>('/api/v1/auth/me'),

  /**
   * 更新用户资料
   * PATCH /api/v1/auth/me
   */
  updateProfile: (data: UpdateProfileRequest) =>
    apiClient.patch<UserResponse>('/api/v1/auth/me', data),

  /**
   * 修改密码
   * POST /api/v1/auth/change-password
   */
  changePassword: (data: ChangePasswordRequest) =>
    apiClient.post<MessageResponse>('/api/v1/auth/change-password', data),

  /**
   * 删除用户
   * DELETE /api/v1/auth/me
   */
  deleteUser: () =>
    apiClient.delete<MessageResponse>('/api/v1/auth/me'),

  /**
   * 刷新Token
   * POST /api/v1/auth/refresh
   */
  refreshToken: (data: RefreshTokenRequest) =>
    apiClient.post<TokenResponse>('/api/v1/auth/refresh', data),
};

/**
 * Token管理工具
 */
export const tokenManager = {
  /**
   * 保存Token到localStorage
   * 使用与 api/client.ts 一致的键名
   * 注意：tokenResponse 已经被 keysToCamel 转换为 camelCase
   */
  saveTokens: (tokenResponse: TokenResponse) => {
    // 处理 Axios 响应对象 - 实际数据在 .data 属性中
    const data = (tokenResponse as any).data || tokenResponse;
    
    // TokenResponse 类型定义是 snake_case，但 apiClient 的响应拦截器已将数据转换为 camelCase
    // @ts-ignore - 实际数据是 camelCase (accessToken) 或 snake_case (access_token)
    const accessToken = data.accessToken || data.access_token;
    // @ts-ignore
    const refreshToken = data.refreshToken || data.refresh_token;
    // @ts-ignore
    const expiresIn = data.expiresIn || data.expires_in;
    
    localStorage.setItem('timeplan_access_token', accessToken);
    localStorage.setItem('timeplan_refresh_token', refreshToken);
    localStorage.setItem('token_expires_in', String(expiresIn));
    localStorage.setItem('token_saved_at', String(Date.now()));
  },

  /**
   * 获取Token
   */
  getAccessToken: () => localStorage.getItem('timeplan_access_token'),
  getRefreshToken: () => localStorage.getItem('timeplan_refresh_token'),

  /**
   * 清除Token
   */
  clearTokens: () => {
    localStorage.removeItem('timeplan_access_token');
    localStorage.removeItem('timeplan_refresh_token');
    localStorage.removeItem('token_expires_in');
    localStorage.removeItem('token_saved_at');
  },

  /**
   * 检查Token是否过期
   */
  isTokenExpired: (): boolean => {
    const expiresIn = localStorage.getItem('token_expires_in');
    const savedAt = localStorage.getItem('token_saved_at');
    
    if (!expiresIn || !savedAt) {
      return true;
    }

    const expiresAt = parseInt(savedAt) + parseInt(expiresIn) * 1000;
    return Date.now() > expiresAt;
  },
};
