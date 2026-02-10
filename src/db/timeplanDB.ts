/**
 * IndexedDB 配置
 * 使用 Dexie 封装 IndexedDB 操作
 */

import Dexie, { type EntityTable } from 'dexie';
import type { TimeplanData } from '../types/timeplanSchema';

// 扩展的 TimePlan 数据结构
export interface TimeplanDataExtended extends TimeplanData {
  // 新增字段
  versions?: Version[];
  iterationTasks?: IterationTask[];
  products?: Product[];
  teams?: Team[];
  modules?: Module[];
  columnConfig?: ColumnConfig[];
}

// 版本
export interface Version {
  id: string;
  name: string;
  type: 'alpha' | 'beta' | 'rc' | 'release';
  releaseDate: Date;
  status: 'planning' | 'in-progress' | 'released' | 'cancelled';
  description?: string;
  milestones: Milestone[];
  gates: Gate[];
  baselineId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Milestone {
  id: string;
  versionId: string;
  name: string;
  date: Date;
  status: 'completed' | 'in-progress' | 'pending';
  linkedLineId?: string;
}

export interface Gate {
  id: string;
  versionId: string;
  name: string;
  type: 'quality' | 'security' | 'performance' | 'release';
  status: 'passed' | 'failed' | 'pending';
  owner: string;
  plannedDate?: Date;
  completedDate?: Date;
}

// 迭代任务
export interface IterationTask {
  id: string;
  mrId: string;
  name: string;
  productId: string;
  teamId: string;
  moduleId: string;
  sprintId: string;
  startDate: string;
  endDate: string;
  effort: number;
  progress: number;
  status: 'todo' | 'in-progress' | 'done';
  owner: string;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  dependencies: string[];
  linkedLineId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 产品
export interface Product {
  id: string;
  name: string;
  code: string;
  icon?: string;
  color: string;
}

// 团队
export interface Team {
  id: string;
  name: string;
  capacity: number;
  members: TeamMember[];
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  capacity: number;
}

// 模块
export interface Module {
  id: string;
  name: string;
  productId: string;
  teamId: string;
}

// 列配置
export interface ColumnConfig {
  id: string;
  visible: boolean;
  width: number;
  order: number;
}

/**
 * TimePlan 数据库
 */
class TimeplanDatabase extends Dexie {
  timeplans!: EntityTable<
    {
      id: string;
      name: string;
      data: TimeplanDataExtended;
      updatedAt: Date;
    },
    'id'
  >;

  constructor() {
    super('TimeplanDB');

    this.version(1).stores({
      timeplans: 'id, name, updatedAt',
    });
  }
}

export const db = new TimeplanDatabase();

/**
 * 保存 TimePlan 数据
 */
export async function saveTimePlan(
  id: string,
  name: string,
  data: TimeplanDataExtended
): Promise<void> {
  await db.timeplans.put({
    id,
    name,
    data,
    updatedAt: new Date(),
  });
}

/**
 * 加载 TimePlan 数据
 */
export async function loadTimePlan(id: string): Promise<TimeplanDataExtended | undefined> {
  const record = await db.timeplans.get(id);
  return record?.data;
}

/**
 * 删除 TimePlan 数据
 */
export async function deleteTimePlan(id: string): Promise<void> {
  await db.timeplans.delete(id);
}

/**
 * 列出所有 TimePlan
 */
export async function listTimePlans(): Promise<Array<{ id: string; name: string; updatedAt: Date }>> {
  return await db.timeplans.toArray();
}

/**
 * 从 localStorage 迁移数据到 IndexedDB
 */
export async function migrateFromLocalStorage(id: string): Promise<void> {
  const key = `timeplan-data-${id}`;
  const data = localStorage.getItem(key);
  
  if (data) {
    try {
      const parsedData = JSON.parse(data) as TimeplanDataExtended;
      await saveTimePlan(id, `TimePlan-${id}`, parsedData);
      console.log(`[DB] 已迁移数据从 localStorage 到 IndexedDB: ${key}`);
    } catch (error) {
      console.error(`[DB] 迁移失败:`, error);
    }
  }
}
