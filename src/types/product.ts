/**
 * Product（产品）数据模型
 * 
 * 用于矩阵视图的产品维度管理
 * 
 * @module types/product
 */

/**
 * Product接口
 */
export interface Product {
  /** 唯一标识 */
  id: string;
  
  /** 产品名称 */
  name: string;
  
  /** 产品编码 */
  code: string;
  
  /** 产品描述 */
  description?: string;
  
  /** 关联的团队ID列表 */
  teams: string[];
  
  /** 关联的模块ID列表 */
  modules: string[];
  
  /** 产品负责人 */
  owner?: string;
  
  /** 产品颜色（用于可视化） */
  color?: string;
  
  /** 创建时间 */
  createdAt: Date;
  
  /** 更新时间 */
  updatedAt: Date;
}

/**
 * Product筛选条件
 */
export interface ProductFilter {
  /** 按名称搜索 */
  search?: string;
  
  /** 按团队筛选 */
  teamIds?: string[];
  
  /** 按负责人筛选 */
  owner?: string;
}

/**
 * Product表单数据（创建/编辑）
 */
export interface ProductFormData {
  /** 产品名称 */
  name: string;
  
  /** 产品编码 */
  code: string;
  
  /** 产品描述 */
  description?: string;
  
  /** 关联的团队ID列表 */
  teams: string[];
  
  /** 产品负责人 */
  owner?: string;
  
  /** 产品颜色 */
  color?: string;
}

/**
 * Product验证规则
 */
export interface ProductValidation {
  /** 名称最小长度 */
  nameMinLength: number;
  
  /** 名称最大长度 */
  nameMaxLength: number;
  
  /** 编码格式正则 */
  codePattern: RegExp;
  
  /** 是否必须关联团队 */
  requireTeams: boolean;
}

/**
 * 默认验证规则
 */
export const DEFAULT_PRODUCT_VALIDATION: ProductValidation = {
  nameMinLength: 2,
  nameMaxLength: 50,
  codePattern: /^[A-Z0-9-_]{2,20}$/,
  requireTeams: false,
};

/**
 * 创建Product（不含ID和时间戳）
 */
export type ProductCreate = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * 更新Product（部分字段）
 */
export type ProductUpdate = Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>;
