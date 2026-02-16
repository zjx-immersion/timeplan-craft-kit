/**
 * 认证状态管理
 * 
 * 使用Zustand管理用户认证状态
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, tokenManager } from '@/api/auth';
import type { UserResponse } from '@/api/types';
import { handleApiError } from '@/utils/apiErrors';

interface AuthState {
  // 状态
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (username: string, password: string) => Promise<boolean>;
  register: (email: string, username: string, password: string, displayName?: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (displayName?: string, avatar?: string) => Promise<boolean>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
  getCurrentUser: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // 初始状态
      user: null,
      isAuthenticated: false,
      isLoading: false,

      /**
       * 用户登录
       */
      login: async (username: string, password: string) => {
        set({ isLoading: true });
        try {
          const tokenResponse = await authApi.login({ username, password });
          
          // 保存Token
          tokenManager.saveTokens(tokenResponse);
          
          // 获取用户信息
          const user = await authApi.getCurrentUser();
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
          
          return true;
        } catch (error) {
          handleApiError(error);
          set({ isLoading: false });
          return false;
        }
      },

      /**
       * 用户注册
       */
      register: async (email: string, username: string, password: string, displayName?: string) => {
        set({ isLoading: true });
        try {
          await authApi.register({
            email,
            username,
            password,
            display_name: displayName,
          });
          
          // 注册成功后自动登录
          const success = await get().login(username, password);
          
          set({ isLoading: false });
          return success;
        } catch (error) {
          handleApiError(error);
          set({ isLoading: false });
          return false;
        }
      },

      /**
       * 用户登出
       */
      logout: () => {
        tokenManager.clearTokens();
        set({
          user: null,
          isAuthenticated: false,
        });
      },

      /**
       * 更新用户资料
       */
      updateProfile: async (displayName?: string, avatar?: string) => {
        set({ isLoading: true });
        try {
          const updatedUser = await authApi.updateProfile({
            display_name: displayName,
            avatar,
          });
          
          set({
            user: updatedUser,
            isLoading: false,
          });
          
          return true;
        } catch (error) {
          handleApiError(error);
          set({ isLoading: false });
          return false;
        }
      },

      /**
       * 修改密码
       */
      changePassword: async (oldPassword: string, newPassword: string) => {
        set({ isLoading: true });
        try {
          await authApi.changePassword({
            old_password: oldPassword,
            new_password: newPassword,
          });
          
          set({ isLoading: false });
          return true;
        } catch (error) {
          handleApiError(error);
          set({ isLoading: false });
          return false;
        }
      },

      /**
       * 获取当前用户信息
       */
      getCurrentUser: async () => {
        try {
          const user = await authApi.getCurrentUser();
          set({
            user,
            isAuthenticated: true,
          });
        } catch (error) {
          // Token无效，清除认证状态
          tokenManager.clearTokens();
          set({
            user: null,
            isAuthenticated: false,
          });
        }
      },

      /**
       * 检查认证状态
       */
      checkAuth: async () => {
        const token = tokenManager.getAccessToken();
        if (!token) {
          return false;
        }

        // 如果Token未过期且有用户信息，直接返回true
        if (!tokenManager.isTokenExpired() && get().user) {
          return true;
        }

        // 否则重新获取用户信息验证Token
        await get().getCurrentUser();
        return get().isAuthenticated;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
