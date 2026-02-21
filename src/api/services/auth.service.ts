/**
 * 认证服务
 */

import apiClient, { saveTokens, clearTokens, isAuthenticated } from '../client';
import { LoginRequest, LoginResponse, RegisterRequest, UserResponse } from '../types/backend';

export class AuthService {
  /**
   * 用户注册
   */
  async register(username: string, email: string, password: string): Promise<UserResponse> {
    const response = await apiClient.post<UserResponse>('/api/v1/auth/register', {
      username,
      email,
      password,
    });
    return response.data;
  }

  /**
   * 用户登录
   */
  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/api/v1/auth/login', {
      username,
      password,
    });

    const { accessToken, refreshToken } = response.data;
    saveTokens(accessToken, refreshToken);

    return response.data;
  }

  /**
   * 登出
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/api/v1/auth/logout');
    } finally {
      clearTokens();
    }
  }

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(): Promise<UserResponse> {
    const response = await apiClient.get<UserResponse>('/api/v1/auth/me');
    return response.data;
  }

  /**
   * 检查是否已登录
   */
  isAuthenticated(): boolean {
    return isAuthenticated();
  }

  /**
   * 清除认证信息
   */
  clearAuth(): void {
    clearTokens();
  }
}

export const authService = new AuthService();
