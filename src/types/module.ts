/**
 * Module（模块）数据模型
 * 
 * 用于产品下的模块管理
 * 
 * @module types/module
 */

/**
 * Module接口
 */
export interface Module {
  /** 唯一标识 */
  id: string;
  
  /** 模块名称 */
  name: string;
  
  /** 所属产品ID */
  productId: string;
  
  /** 模块描述 */
  description?: string;
  
  /** 负责人 */
  owner?: string;
  
  /** 创建时间 */
  createdAt: Date;
  
  /** 更新时间 */
  updatedAt: Date;
}

/**
 * Module筛选条件
 */
export interface ModuleFilter {
  /** 按产品ID筛选 */
  productId?: string;
  
  /** 按名称搜索 */
  search?: string;
  
  /** 按负责人筛选 */
  owner?: string;
}

/**
 * Module表单数据（创建/编辑）
 */
export interface ModuleFormData {
  /** 模块名称 */
  name: string;
  
  /** 所属产品ID */
  productId: string;
  
  /** 模块描述 */
  description?: string;
  
  /** 负责人 */
  owner?: string;
}

/**
 * 创建Module（不含ID和时间戳）
 */
export type ModuleCreate = Omit<Module, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * 更新Module（部分字段）
 */
export type ModuleUpdate = Partial<Omit<Module, 'id' | 'createdAt' | 'updatedAt'>>;
