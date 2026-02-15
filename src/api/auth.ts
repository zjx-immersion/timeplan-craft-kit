/**
 * 认证API
 * 
 * 对应后端认证API端点
 */
import { api } from './client';
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
    api.post<UserResponse>('/api/v1/auth/register', data),

  /**
   * 用户登录
   * POST /api/v1/auth/login
   */
  login: (data: LoginRequest) =>
    api.post<TokenResponse>('/api/v1/auth/login', data),

  /**
   * 获取当前用户信息
   * GET /api/v1/auth/me
   */
  getCurrentUser: () =>
    api.get<UserResponse>('/api/v1/auth/me'),

  /**
   * 更新用户资料
   * PATCH /api/v1/auth/me
   */
  updateProfile: (data: UpdateProfileRequest) =>
    api.patch<UserResponse>('/api/v1/auth/me', data),

  /**
   * 修改密码
   * POST /api/v1/auth/change-password
   */
  changePassword: (data: ChangePasswordRequest) =>
    api.post<MessageResponse>('/api/v1/auth/change-password', data),

  /**
   * 删除用户
   * DELETE /api/v1/auth/me
   */
  deleteUser: () =>
    api.delete<MessageResponse>('/api/v1/auth/me'),

  /**
   * 刷新Token
   * POST /api/v1/auth/refresh
   */
  refreshToken: (data: RefreshTokenRequest) =>
    api.post<TokenResponse>('/api/v1/auth/refresh', data),
};

/**
 * Token管理工具
 */
export const tokenManager = {
  /**
   * 保存Token到localStorage
   */
  saveTokens: (tokenResponse: TokenResponse) => {
    localStorage.setItem('access_token', tokenResponse.access_token);
    localStorage.setItem('refresh_token', tokenResponse.refresh_token);
    localStorage.setItem('token_expires_in', String(tokenResponse.expires_in));
    localStorage.setItem('token_saved_at', String(Date.now()));
  },

  /**
   * 获取Token
   */
  getAccessToken: () => localStorage.getItem('access_token'),
  getRefreshToken: () => localStorage.getItem('refresh_token'),

  /**
   * 清除Token
   */
  clearTokens: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
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
