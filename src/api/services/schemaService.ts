/**
 * Schema 服务
 * 
 * 提供 Schema 模板相关的 API 调用
 */

import apiClient from '../client';
import { LineSchema, TimePlanSchema } from '@/types/timeplanSchema';

// ============================================================================
// 类型定义
// ============================================================================

/**
 * Schema 模板响应
 */
export interface SchemaTemplateResponse {
  id: string;
  name: string;
  description: string | null;
  version: string;
  type: 'timeplan' | 'timeline' | 'line' | 'baseline' | 'baselineRange' | 'relation';
  category: string;
  isBuiltin: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Schema 模板详情响应
 */
export interface SchemaTemplateDetailResponse extends SchemaTemplateResponse {
  schemaData: TimePlanSchema | LineSchema | Record<string, unknown>;
  attributeDefinitions: AttributeDefinitionResponse[];
}

/**
 * 属性定义响应
 */
export interface AttributeDefinitionResponse {
  key: string;
  label: string;
  type: string;
  required: boolean;
  defaultValue: unknown;
  validationRules: ValidationRuleResponse[];
  enumOptions: EnumOptionResponse[];
  displayInTable: boolean;
  displayInGantt: boolean;
  displayInMatrix: boolean;
  editable: boolean;
  editorType: string;
}

/**
 * 验证规则响应
 */
export interface ValidationRuleResponse {
  type: string;
  value: unknown;
  message: string;
}

/**
 * 枚举选项响应
 */
export interface EnumOptionResponse {
  value: string | number;
  label: string;
  color: string | null;
  icon: string | null;
}

/**
 * 属性验证请求
 */
export interface ValidateAttributesRequest {
  attributes: Record<string, unknown>;
}

/**
 * 属性验证响应
 */
export interface ValidateAttributesResponse {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * 验证错误
 */
export interface ValidationError {
  field: string;
  message: string;
  rule: string;
}

/**
 * 创建 Schema 模板请求
 */
export interface CreateSchemaTemplateRequest {
  name: string;
  description?: string;
  version?: string;
  type: 'timeplan' | 'timeline' | 'line' | 'baseline' | 'baselineRange' | 'relation';
  category?: string;
  schemaData: Record<string, unknown>;
}

/**
 * 更新 Schema 模板请求
 */
export interface UpdateSchemaTemplateRequest {
  name?: string;
  description?: string;
  version?: string;
  category?: string;
  schemaData?: Record<string, unknown>;
  isActive?: boolean;
}

// ============================================================================
// Schema 服务类
// ============================================================================

export class SchemaService {
  /**
   * 获取 Schema 模板列表
   * 
   * @param params 查询参数
   * @returns Schema 模板列表
   */
  async getSchemaTemplates(params?: {
    type?: string;
    category?: string;
    isBuiltin?: boolean;
    isActive?: boolean;
  }): Promise<SchemaTemplateResponse[]> {
    const response = await apiClient.get<{ items: SchemaTemplateResponse[] }>('/api/v1/schemas', {
      params,
    });
    return response.data.items || [];
  }

  /**
   * 获取单个 Schema 模板详情
   * 
   * @param id Schema 模板 ID
   * @returns Schema 模板详情
   */
  async getSchemaTemplate(id: string): Promise<SchemaTemplateDetailResponse> {
    const response = await apiClient.get<SchemaTemplateDetailResponse>(`/api/v1/schemas/${id}`);
    return response.data;
  }

  /**
   * 根据类型获取 Schema 模板
   * 
   * @param type Schema 类型
   * @returns Schema 模板列表
   */
  async getSchemaTemplatesByType(
    type: 'timeplan' | 'timeline' | 'line' | 'baseline' | 'baselineRange' | 'relation'
  ): Promise<SchemaTemplateResponse[]> {
    return this.getSchemaTemplates({ type });
  }

  /**
   * 获取内置 Schema 模板
   * 
   * @returns 内置 Schema 模板列表
   */
  async getBuiltinSchemaTemplates(): Promise<SchemaTemplateResponse[]> {
    return this.getSchemaTemplates({ isBuiltin: true });
  }

  /**
   * 创建 Schema 模板
   * 
   * @param data 创建请求数据
   * @returns 创建的 Schema 模板
   */
  async createSchemaTemplate(data: CreateSchemaTemplateRequest): Promise<SchemaTemplateDetailResponse> {
    const response = await apiClient.post<SchemaTemplateDetailResponse>('/api/v1/schemas', data);
    return response.data;
  }

  /**
   * 更新 Schema 模板
   * 
   * @param id Schema 模板 ID
   * @param data 更新请求数据
   * @returns 更新后的 Schema 模板
   */
  async updateSchemaTemplate(
    id: string,
    data: UpdateSchemaTemplateRequest
  ): Promise<SchemaTemplateDetailResponse> {
    const response = await apiClient.put<SchemaTemplateDetailResponse>(`/api/v1/schemas/${id}`, data);
    return response.data;
  }

  /**
   * 删除 Schema 模板
   * 
   * @param id Schema 模板 ID
   */
  async deleteSchemaTemplate(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/schemas/${id}`);
  }

  /**
   * 验证属性
   * 
   * 根据 Schema 定义验证属性值是否合法
   * 
   * @param schemaId Schema 模板 ID
   * @param attributes 要验证的属性
   * @returns 验证结果
   */
  async validateAttributes(
    schemaId: string,
    attributes: Record<string, unknown>
  ): Promise<ValidateAttributesResponse> {
    const response = await apiClient.post<ValidateAttributesResponse>(
      `/api/v1/schemas/${schemaId}/validate`,
      { attributes }
    );
    return response.data;
  }

  /**
   * 批量验证属性
   * 
   * @param schemaId Schema 模板 ID
   * @param attributesList 属性列表
   * @returns 验证结果列表
   */
  async batchValidateAttributes(
    schemaId: string,
    attributesList: Record<string, unknown>[]
  ): Promise<ValidateAttributesResponse[]> {
    const response = await apiClient.post<{ results: ValidateAttributesResponse[] }>(
      `/api/v1/schemas/${schemaId}/validate/batch`,
      { items: attributesList }
    );
    return response.data.results || [];
  }

  /**
   * 获取 Schema 的 Line Schema 列表（用于 TimePlanSchema）
   * 
   * @param schemaId TimePlan Schema ID
   * @returns Line Schema 列表
   */
  async getLineSchemas(schemaId: string): Promise<SchemaTemplateResponse[]> {
    const response = await apiClient.get<{ items: SchemaTemplateResponse[] }>(
      `/api/v1/schemas/${schemaId}/line-schemas`
    );
    return response.data.items || [];
  }

  /**
   * 克隆 Schema 模板
   * 
   * @param id 要克隆的 Schema 模板 ID
   * @param newName 新模板名称
   * @returns 克隆的 Schema 模板
   */
  async cloneSchemaTemplate(id: string, newName: string): Promise<SchemaTemplateDetailResponse> {
    const response = await apiClient.post<SchemaTemplateDetailResponse>(`/api/v1/schemas/${id}/clone`, {
      name: newName,
    });
    return response.data;
  }

  /**
   * 发布 Schema 模板
   * 
   * @param id Schema 模板 ID
   * @returns 发布后的 Schema 模板
   */
  async publishSchemaTemplate(id: string): Promise<SchemaTemplateDetailResponse> {
    const response = await apiClient.post<SchemaTemplateDetailResponse>(`/api/v1/schemas/${id}/publish`);
    return response.data;
  }

  /**
   * 弃用 Schema 模板
   * 
   * @param id Schema 模板 ID
   * @returns 弃用后的 Schema 模板
   */
  async deprecateSchemaTemplate(id: string): Promise<SchemaTemplateDetailResponse> {
    const response = await apiClient.post<SchemaTemplateDetailResponse>(`/api/v1/schemas/${id}/deprecate`);
    return response.data;
  }
}

// ============================================================================
// 导出服务实例
// ============================================================================

export const schemaService = new SchemaService();
