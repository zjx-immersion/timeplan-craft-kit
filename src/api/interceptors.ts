/**
 * API 拦截器实现
 * 
 * 功能：
 * 1. 请求拦截器 - 添加 Authorization header，转换 camelCase -> snake_case
 * 2. 响应拦截器 - 转换 snake_case -> camelCase，token 刷新，错误处理
 */

import { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { keysToCamel, keysToSnake } from './utils/caseConverter';

// Token 存储键名
const ACCESS_TOKEN_KEY = 'timeplan_access_token';
const REFRESH_TOKEN_KEY = 'timeplan_refresh_token';

/**
 * 获取 API 基础 URL
 */
function getBaseURL(): string {
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
}

/**
 * 获取 Access Token
 */
function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

/**
 * 获取 Refresh Token
 */
function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * 保存 Tokens
 */
function saveTokens(accessToken: string, refreshToken?: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

/**
 * 清除 Tokens
 */
function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/**
 * 是否正在刷新 token
 */
let isRefreshing = false;

/**
 * 等待刷新完成的请求队列
 */
let refreshSubscribers: Array<(token: string) => void> = [];

/**
 * 订阅 token 刷新
 */
function subscribeTokenRefresh(callback: (token: string) => void): void {
  refreshSubscribers.push(callback);
}

/**
 * 通知所有订阅者 token 已刷新
 */
function onTokenRefreshed(token: string): void {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
}

/**
 * 刷新 Access Token
 */
async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    // 使用 axios 直接调用，避免循环拦截
    const { default: axios } = await import('axios');
    const response = await axios.post(`${getBaseURL()}/api/v1/auth/refresh`, {
      refresh_token: refreshToken,
    });

    const data = keysToCamel(response.data);
    const { accessToken, refreshToken: newRefreshToken } = data;

    saveTokens(accessToken, newRefreshToken || refreshToken);
    return accessToken;
  } catch (error) {
    clearTokens();
    throw error;
  }
}

/**
 * 设置请求拦截器
 * 
 * 功能：
 * 1. 添加 Authorization Token
 * 2. 转换请求数据：camelCase -> snake_case
 * 3. 转换查询参数
 * 
 * @param apiClient Axios 实例
 */
export function setupRequestInterceptor(apiClient: AxiosInstance): void {
  apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // 1. 添加 Authorization Token
      const token = getAccessToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // 2. 转换请求数据：camelCase -> snake_case
      if (config.data && typeof config.data === 'object' && !(config.data instanceof FormData)) {
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
}

/**
 * 设置响应拦截器
 * 
 * 功能：
 * 1. 转换响应数据：snake_case -> camelCase
 * 2. Token 过期自动刷新
 * 3. 统一错误处理
 * 
 * @param apiClient Axios 实例
 */
export function setupResponseInterceptor(apiClient: AxiosInstance): void {
  apiClient.interceptors.response.use(
    // 成功响应处理
    (response: AxiosResponse) => {
      // 1. 转换响应数据：snake_case -> camelCase
      if (response.data && typeof response.data === 'object') {
        response.data = keysToCamel(response.data);
      }

      return response;
    },

    // 错误响应处理
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      if (!originalRequest) {
        return Promise.reject(error);
      }

      // 2. Token 过期 (401)，自动刷新
      if (error.response?.status === 401 && !originalRequest._retry) {
        // 标记为重试请求，避免无限循环
        originalRequest._retry = true;

        // 如果已经在刷新中，将请求加入队列等待
        if (isRefreshing) {
          return new Promise((resolve) => {
            subscribeTokenRefresh((token: string) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(apiClient(originalRequest));
            });
          });
        }

        isRefreshing = true;

        try {
          const newToken = await refreshAccessToken();
          
          // 更新请求头
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }

          // 通知所有等待的请求
          onTokenRefreshed(newToken);
          
          // 重试原请求
          return apiClient(originalRequest);
        } catch (refreshError) {
          // 刷新失败，清除 token 并重定向到登录页
          clearTokens();
          
          // 只在浏览器环境中重定向
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // 3. 统一错误处理
      handleApiError(error);

      return Promise.reject(error);
    }
  );
}

/**
 * API 错误处理
 * 
 * 根据错误状态码进行不同的处理
 */
function handleApiError(error: AxiosError): void {
  if (!error.response) {
    // 网络错误或请求被取消
    console.error('Network Error or Request Cancelled:', error.message);
    return;
  }

  const { status, data } = error.response;
  const errorData = data as { detail?: string | { message: string }; message?: string };

  switch (status) {
    case 400:
      console.error('Bad Request:', errorData?.detail || errorData?.message || '请求参数错误');
      break;

    case 401:
      // Token 失效，已经在上面处理了自动刷新
      console.error('Unauthorized: 未授权或登录已过期');
      break;

    case 403:
      console.error('Forbidden: 没有权限执行此操作');
      break;

    case 404:
      console.error('Not Found:', errorData?.detail || errorData?.message || '请求的资源不存在');
      break;

    case 409:
      console.error('Conflict:', errorData?.detail || errorData?.message || '资源冲突');
      break;

    case 422:
      console.error('Validation Error:', errorData?.detail || errorData?.message || '数据验证失败');
      break;

    case 429:
      console.error('Too Many Requests: 请求过于频繁，请稍后再试');
      break;

    case 500:
    case 502:
    case 503:
    case 504:
      console.error('Server Error:', errorData?.detail || errorData?.message || '服务器错误');
      break;

    default:
      console.error(`API Error (${status}):`, errorData?.detail || errorData?.message || '未知错误');
  }
}

/**
 * 移除所有拦截器
 * 
 * 用于测试或重置客户端
 * @param apiClient Axios 实例
 */
export function removeInterceptors(apiClient: AxiosInstance): void {
  apiClient.interceptors.request.clear();
  apiClient.interceptors.response.clear();
}

/**
 * 重新配置拦截器
 * 
 * 用于测试或重置客户端
 * @param apiClient Axios 实例
 */
export function reconfigureInterceptors(apiClient: AxiosInstance): void {
  removeInterceptors(apiClient);
  setupRequestInterceptor(apiClient);
  setupResponseInterceptor(apiClient);
}
