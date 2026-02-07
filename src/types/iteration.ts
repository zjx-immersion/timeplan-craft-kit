/**
 * 迭代计划相关类型定义
 * 
 * @version 1.0.0
 * @date 2026-01-27
 */

// ============================================================================
// 产品和团队相关类型
// ============================================================================

/**
 * 产品类型
 */
export type ProductType = 'driving' | 'parking' | 'active-safety' | 'other';

/**
 * 产品信息
 */
export interface Product {
  id: string;
  name: string;
  type: ProductType;
  description?: string;
}

/**
 * 团队信息
 */
export interface Team {
  id: string;
  name: string;
  description?: string;
  productId: string;  // 所属产品
}

/**
 * 模块信息（团队负责的模块，1:N关系）
 */
export interface Module {
  id: string;
  name: string;
  description?: string;
  teamId: string;  // 所属团队
  order?: number;  // 显示顺序
}

// ============================================================================
// 迭代相关类型
// ============================================================================

/**
 * 迭代信息
 */
export interface Iteration {
  id: string;
  name: string;           // 如 "Sprint 1", "迭代 1"
  startDate: Date;
  endDate: Date;
  duration: number;       // 天数，通常是14天（2周）
  productId: string;      // 所属产品
  order: number;          // 迭代顺序
}

// ============================================================================
// MR（需求）相关类型
// ============================================================================

/**
 * 特性
 */
export interface Feature {
  id: string;
  name: string;
  description?: string;
}

/**
 * SSTS（子系统）
 */
export interface SSTS {
  id: string;
  name: string;
  description?: string;
  featureId: string;  // 所属特性
}

/**
 * MR（模块需求）
 */
export interface MR {
  id: string;
  name: string;
  description?: string;
  sstsId: string;       // 所属 SSTS
  dependencies?: string[]; // 依赖的其他 MR ID 列表
  estimatedDays?: number;  // 预估工作量（天）
  priority?: 'high' | 'medium' | 'low';
  status?: 'todo' | 'in-progress' | 'done';
}

// ============================================================================
// 迭代计划相关类型
// ============================================================================

/**
 * 迭代任务（模块-迭代交叉处的任务）
 */
export interface IterationTask {
  id: string;
  moduleId: string;
  iterationId: string;
  mrIds: string[];      // 该任务包含的 MR ID 列表
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * 迭代计划
 */
export interface IterationPlan {
  id: string;
  name: string;
  productId: string;    // 所属产品
  description?: string;
  
  // 关联的 TimePlan ID（用于获取 gateway 和 milestone）
  timePlanId?: string;
  
  // 数据
  teams: Team[];
  modules: Module[];
  iterations: Iteration[];
  tasks: IterationTask[];
  
  // 需求树
  features: Feature[];
  sstsList: SSTS[];
  mrs: MR[];
  
  // 元数据
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
}

// ============================================================================
// 视图相关类型
// ============================================================================

/**
 * 迭代矩阵单元格数据
 */
export interface IterationCell {
  moduleId: string;
  iterationId: string;
  task?: IterationTask;
  mrs: MR[];
}

/**
 * 迭代视图配置
 */
export interface IterationViewConfig {
  showDependencies: boolean;    // 是否显示依赖关系
  showTimePlanMarkers: boolean; // 是否显示 TimePlan 的 gateway/milestone
  cellHeight: number;           // 单元格高度
  iterationWidth: number;       // 迭代列宽度
}
