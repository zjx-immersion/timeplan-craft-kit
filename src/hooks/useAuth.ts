/**
 * 认证Hook
 * 
 * 提供认证相关的React Hook
 */
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

/**
 * 使用认证状态
 */
export function useAuth() {
  const {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    getCurrentUser,
    checkAuth,
  } = useAuthStore();

  // 组件挂载时检查认证状态
  useEffect(() => {
    if (!isAuthenticated) {
      checkAuth();
    }
  }, []);

  return {
    // 状态
    user,
    isAuthenticated,
    isLoading,

    // Actions
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    getCurrentUser,
    checkAuth,
  };
}

/**
 * 要求认证的Hook
 * 
 * 如果用户未认证，自动跳转到登录页
 */
export function useRequireAuth() {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    const verify = async () => {
      const authenticated = await checkAuth();
      if (!authenticated && !isLoading) {
        // 跳转到登录页
        window.location.href = '/login';
      }
    };
    verify();
  }, []);

  return { isAuthenticated, isLoading };
}
