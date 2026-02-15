/**
 * API错误处理工具
 */
import { AxiosError } from 'axios';
import type { ApiError } from '@/api/types';
import { message } from 'antd';

/**
 * 处理API错误并显示友好消息
 */
export function handleApiError(error: unknown): void {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const detail = error.response?.data?.detail as ApiError | undefined;

    switch (status) {
      case 400:
        message.error(detail?.message || '请求参数错误');
        break;
      case 401:
        message.error('未授权，请重新登录');
        break;
      case 403:
        message.error(detail?.message || '无权限访问');
        break;
      case 404:
        message.error('请求的资源不存在');
        break;
      case 409:
        message.error(detail?.message || '数据冲突');
        break;
      case 422:
        // Pydantic验证错误
        const validationErrors = error.response?.data?.detail;
        if (Array.isArray(validationErrors)) {
          const errorMsg = validationErrors
            .map((err: any) => `${err.loc?.join('.')}: ${err.msg}`)
            .join('; ');
          message.error(`数据验证失败: ${errorMsg}`);
        } else {
          message.error('数据验证失败');
        }
        break;
      case 500:
        message.error('服务器错误，请稍后重试');
        break;
      default:
        message.error(detail?.message || error.message || '请求失败');
    }
  } else if (error instanceof Error) {
    message.error(error.message);
  } else {
    message.error('未知错误');
  }
}

/**
 * 包装异步API调用，自动处理错误
 */
export async function withErrorHandling<T>(
  apiCall: () => Promise<T>,
  options?: {
    successMessage?: string;
    errorMessage?: string;
    silent?: boolean;  // 静默模式，不显示错误
  }
): Promise<T | null> {
  try {
    const result = await apiCall();
    if (options?.successMessage) {
      message.success(options.successMessage);
    }
    return result;
  } catch (error) {
    if (!options?.silent) {
      if (options?.errorMessage) {
        message.error(options.errorMessage);
      } else {
        handleApiError(error);
      }
    }
    return null;
  }
}

/**
 * 获取错误消息
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const detail = error.response?.data?.detail as ApiError | undefined;
    return detail?.message || error.message || '请求失败';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return '未知错误';
}
