/**
 * Matrix Service - 矩阵视图管理服务
 * 
 * 提供矩阵视图相关的所有API调用：
 * - 矩阵数据获取/计算
 * - 产品/团队管理
 * - 矩阵配置/缓存
 */

import apiClient from '../client';
import { MessageResponse } from '../types';

// ======== Types ========

export interface MatrixData {
  timeplanId: string;
  rowHeaders: MatrixRowHeader[];
  colHeaders: MatrixColHeader[];
  cells: MatrixCell[][];
  metadata: {
    totalRows: number;
    totalCols: number;
    generatedAt: string;
    cacheHit: boolean;
  };
}

export interface MatrixRowHeader {
  id: string;
  type: 'timeline' | 'product' | 'team';
  label: string;
  metadata?: Record<string, any>;
}

export interface MatrixColHeader {
  id: string;
  type: 'timeNode' | 'month' | 'quarter' | 'iteration';
  label: string;
  startDate: string;
  endDate: string;
  metadata?: Record<string, any>;
}

export interface MatrixCell {
  rowId: string;
  colId: string;
  lines: MatrixLineItem[];
  summary?: {
    totalLines: number;
    totalWorkload: number;
    completedWorkload: number;
    progress: number;
  };
}

export interface MatrixLineItem {
  id: string;
  name: string;
  type: 'bar' | 'milestone' | 'gateway';
  startDate: string;
  endDate: string;
  progress: number;
  status: string;
  assignee?: string;
  metadata?: Record<string, any>;
}

export interface MatrixConfig {
  rowType: 'timeline' | 'product' | 'team';
  colType: 'timeNode' | 'month' | 'quarter';
  showEmptyCells: boolean;
  showSummary: boolean;
  cellWidth: number;
  cellHeight: number;
  timeRange?: {
    start: string;
    end: string;
  };
}

export interface MatrixStatistics {
  totalCells: number;
  occupiedCells: number;
  totalLines: number;
  totalWorkload: number;
  averageProgress: number;
  resourceUtilization: number;
}

export interface ResourceWarning {
  type: 'overAllocation' | 'conflict' | 'delay';
  level: 'info' | 'warning' | 'critical';
  message: string;
  cellCoords?: { row: number; col: number };
  relatedLineIds?: string[];
  suggestedAction?: string;
}

export interface MatrixProduct {
  id: string;
  timeplanId: string;
  name: string;
  code?: string;
  description?: string;
  platform?: string;
  attributes?: Record<string, any>;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface MatrixTeam {
  id: string;
  timeplanId: string;
  name: string;
  code?: string;
  description?: string;
  capacity?: number;
  members?: string[];
  attributes?: Record<string, any>;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CacheStats {
  cacheEnabled: boolean;
  cachedAt?: string;
  expiresAt?: string;
  hitCount: number;
  missCount: number;
}

// Request Types
export interface CreateMatrixProductRequest {
  name: string;
  code?: string;
  description?: string;
  platform?: string;
  attributes?: Record<string, any>;
  order?: number;
}

export interface CreateMatrixTeamRequest {
  name: string;
  code?: string;
  description?: string;
  capacity?: number;
  members?: string[];
  attributes?: Record<string, any>;
  order?: number;
}

export interface UpdateMatrixConfigRequest {
  rowType?: 'timeline' | 'product' | 'team';
  colType?: 'timeNode' | 'month' | 'quarter';
  showEmptyCells?: boolean;
  showSummary?: boolean;
  cellWidth?: number;
  cellHeight?: number;
  timeRange?: {
    start: string;
    end: string;
  };
}

// ======== Service Object ========

export const matrixService = {
  // ========== Matrix Data ==========
  getMatrixData: async (timeplanId: string, config?: Partial<MatrixConfig>): Promise<MatrixData> => {
    const response = await apiClient.get<MatrixData>(`/api/v1/timeplans/${timeplanId}/matrix`, {
      params: config,
    });
    return response.data;
  },
  
  calculateMatrix: async (timeplanId: string, config?: Partial<MatrixConfig>): Promise<MatrixData> => {
    const response = await apiClient.post<MatrixData>(`/api/v1/timeplans/${timeplanId}/matrix/calculate`, config || {});
    return response.data;
  },
  
  // ========== Statistics & Warnings ==========
  getStatistics: async (timeplanId: string): Promise<MatrixStatistics> => {
    const response = await apiClient.get<MatrixStatistics>(`/api/v1/timeplans/${timeplanId}/matrix/statistics`);
    return response.data;
  },
  
  getWarnings: async (timeplanId: string): Promise<ResourceWarning[]> => {
    const response = await apiClient.get<{ warnings: ResourceWarning[] }>(
      `/api/v1/timeplans/${timeplanId}/matrix/warnings`
    );
    return response.data.warnings;
  },
  
  // ========== Config ==========
  getConfig: async (timeplanId: string): Promise<MatrixConfig> => {
    const response = await apiClient.get<MatrixConfig>(`/api/v1/timeplans/${timeplanId}/matrix/config`);
    return response.data;
  },
  
  updateConfig: async (timeplanId: string, config: UpdateMatrixConfigRequest): Promise<MatrixConfig> => {
    const response = await apiClient.put<MatrixConfig>(`/api/v1/timeplans/${timeplanId}/matrix/config`, config);
    return response.data;
  },
  
  // ========== Cache ==========
  clearCache: async (timeplanId: string): Promise<void> => {
    await apiClient.delete<MessageResponse>(`/api/v1/timeplans/${timeplanId}/matrix/cache`);
  },
  
  getCacheStats: async (timeplanId: string): Promise<CacheStats> => {
    const response = await apiClient.get<CacheStats>(`/api/v1/timeplans/${timeplanId}/matrix/cache`);
    return response.data;
  },
  
  // ========== Products ==========
  getProducts: async (timeplanId: string): Promise<MatrixProduct[]> => {
    const response = await apiClient.get<{ items: MatrixProduct[] }>(
      `/api/v1/timeplans/${timeplanId}/matrix/products`
    );
    return response.data.items;
  },
  
  createProduct: async (timeplanId: string, data: CreateMatrixProductRequest): Promise<MatrixProduct> => {
    const response = await apiClient.post<MatrixProduct>(
      `/api/v1/timeplans/${timeplanId}/matrix/products`,
      data
    );
    return response.data;
  },
  
  getProduct: async (productId: string): Promise<MatrixProduct> => {
    const response = await apiClient.get<MatrixProduct>(`/api/v1/matrix/products/${productId}`);
    return response.data;
  },
  
  updateProduct: async (productId: string, data: Partial<CreateMatrixProductRequest>): Promise<MatrixProduct> => {
    const response = await apiClient.put<MatrixProduct>(`/api/v1/matrix/products/${productId}`, data);
    return response.data;
  },
  
  deleteProduct: async (productId: string): Promise<void> => {
    await apiClient.delete<MessageResponse>(`/api/v1/matrix/products/${productId}`);
  },
  
  // ========== Teams ==========
  getTeams: async (timeplanId: string): Promise<MatrixTeam[]> => {
    const response = await apiClient.get<{ items: MatrixTeam[] }>(
      `/api/v1/timeplans/${timeplanId}/matrix/teams`
    );
    return response.data.items;
  },
  
  createTeam: async (timeplanId: string, data: CreateMatrixTeamRequest): Promise<MatrixTeam> => {
    const response = await apiClient.post<MatrixTeam>(
      `/api/v1/timeplans/${timeplanId}/matrix/teams`,
      data
    );
    return response.data;
  },
  
  getTeam: async (teamId: string): Promise<MatrixTeam> => {
    const response = await apiClient.get<MatrixTeam>(`/api/v1/matrix/teams/${teamId}`);
    return response.data;
  },
  
  updateTeam: async (teamId: string, data: Partial<CreateMatrixTeamRequest>): Promise<MatrixTeam> => {
    const response = await apiClient.put<MatrixTeam>(`/api/v1/matrix/teams/${teamId}`, data);
    return response.data;
  },
  
  deleteTeam: async (teamId: string): Promise<void> => {
    await apiClient.delete<MessageResponse>(`/api/v1/matrix/teams/${teamId}`);
  },
};

export default matrixService;
