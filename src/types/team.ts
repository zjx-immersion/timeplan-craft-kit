/**
 * Team（团队）数据模型
 * 
 * 用于矩阵视图的团队维度管理
 * 
 * @module types/team
 */

/**
 * TeamMember接口（团队成员）
 */
export interface TeamMember {
  /** 成员唯一标识 */
  id: string;
  
  /** 成员姓名 */
  name: string;
  
  /** 成员角色 */
  role: string;
  
  /** 成员容量（人/天） */
  capacity: number;
  
  /** 开始日期 */
  startDate?: Date;
  
  /** 结束日期 */
  endDate?: Date;
  
  /** 是否激活 */
  active: boolean;
}

/**
 * Team接口
 */
export interface Team {
  /** 唯一标识 */
  id: string;
  
  /** 团队名称 */
  name: string;
  
  /** 团队描述 */
  description?: string;
  
  /** 团队总容量（人/天） */
  capacity: number;
  
  /** 团队成员列表 */
  members: TeamMember[];
  
  /** 团队颜色（用于可视化） */
  color?: string;
  
  /** 创建时间 */
  createdAt: Date;
  
  /** 更新时间 */
  updatedAt: Date;
}

/**
 * Team筛选条件
 */
export interface TeamFilter {
  /** 按名称搜索 */
  search?: string;
  
  /** 按最小容量筛选 */
  minCapacity?: number;
  
  /** 按最大容量筛选 */
  maxCapacity?: number;
}

/**
 * Team表单数据（创建/编辑）
 */
export interface TeamFormData {
  /** 团队名称 */
  name: string;
  
  /** 团队描述 */
  description?: string;
  
  /** 团队总容量 */
  capacity: number;
  
  /** 团队颜色 */
  color?: string;
}

/**
 * TeamMember表单数据（创建/编辑）
 */
export interface TeamMemberFormData {
  /** 成员姓名 */
  name: string;
  
  /** 成员角色 */
  role: string;
  
  /** 成员容量 */
  capacity: number;
  
  /** 开始日期 */
  startDate?: Date;
  
  /** 结束日期 */
  endDate?: Date;
  
  /** 是否激活 */
  active: boolean;
}

/**
 * Team验证规则
 */
export interface TeamValidation {
  /** 名称最小长度 */
  nameMinLength: number;
  
  /** 名称最大长度 */
  nameMaxLength: number;
  
  /** 最小容量 */
  minCapacity: number;
  
  /** 最大容量 */
  maxCapacity: number;
  
  /** 成员最小容量 */
  memberMinCapacity: number;
  
  /** 成员最大容量 */
  memberMaxCapacity: number;
}

/**
 * 默认验证规则
 */
export const DEFAULT_TEAM_VALIDATION: TeamValidation = {
  nameMinLength: 2,
  nameMaxLength: 50,
  minCapacity: 0.5,
  maxCapacity: 100,
  memberMinCapacity: 0.1,
  memberMaxCapacity: 10,
};

/**
 * 创建Team（不含ID和时间戳）
 */
export type TeamCreate = Omit<Team, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * 更新Team（部分字段）
 */
export type TeamUpdate = Partial<Omit<Team, 'id' | 'createdAt' | 'updatedAt'>>;

/**
 * 创建TeamMember（不含ID）
 */
export type TeamMemberCreate = Omit<TeamMember, 'id'>;

/**
 * 更新TeamMember（部分字段）
 */
export type TeamMemberUpdate = Partial<Omit<TeamMember, 'id'>>;
