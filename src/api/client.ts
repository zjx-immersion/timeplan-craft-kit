/**
 * API 客户端
 * 
 * 基于 Axios 创建的 HTTP 客户端，处理：
 * - Token 认证
 * - 命名风格转换（camelCase <-> snake_case）
 * - 日期格式转换
 * - 错误处理
 * - Token 自动刷新
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { keysToCamel, keysToSnake } from './utils/caseConverter';

// API 基础 URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Token 存储键名
const ACCESS_TOKEN_KEY = 'timeplan_access_token';
const REFRESH_TOKEN_KEY = 'timeplan_refresh_token';

/**
 * 创建 Axios 实例
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 请求拦截器
 * 
 * 功能：
 * 1. 添加 Authorization Token
 * 2. 转换请求数据：camelCase -> snake_case
 * 3. 转换查询参数
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 1. 添加 Token
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. 转换请求数据：camelCase -> snake_case
    if (config.data && typeof config.data === 'object') {
      config.data = keysToSnake(config.data);
    }

    // 3. 转换查询参数
    if (config.params && typeof config.params === 'object') {
      config.params = keysToSnake(config.params);
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * 响应拦截器
 * 
 * 功能：
 * 1. 转换响应数据：snake_case -> camelCase
 * 2. Token 过期自动刷新
 * 3. 统一错误处理
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // 1. 转换响应数据：snake_case -> camelCase
    if (response.data && typeof response.data === 'object') {
      response.data = keysToCamel(response.data);
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // 2. Token 过期，自动刷新
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // 调用刷新 Token 接口
        const response = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = keysToCamel(response.data);

        // 保存新 Token
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        if (newRefreshToken) {
          localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
        }

        // 重试原请求
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        // 刷新失败，清除 Token 并跳转到登录页
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // 3. 统一错误处理
    return Promise.reject(error);
  }
);

/**
 * 辅助函数：保存 Token
 */
export function saveTokens(accessToken: string, refreshToken?: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

/**
 * 辅助函数：清除 Token
 */
export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/**
 * 辅助函数：获取 Access Token
 */
export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

/**
 * 辅助函数：检查是否已登录
 */
export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

export default apiClient;
