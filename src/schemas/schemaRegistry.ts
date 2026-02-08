/**
 * Schema 注册表
 * 
 * 📋 迁移信息:
 * - 原文件: src/schemas/schemaRegistry.ts
 * - 迁移日期: 2026-02-03
 * - 功能: 管理所有 LineSchema 的注册和查找
 * 
 * @version 2.0.0
 */

import { LineSchema } from '@/types/timeplanSchema';
import { LinePlanSchema, MilestoneSchema, GatewaySchema } from './defaultSchemas';

/**
 * Schema 注册表类
 */
class SchemaRegistry {
  private schemas: Map<string, LineSchema> = new Map();

  /**
   * 注册 Schema
   */
  register(schema: LineSchema): void {
    if (this.schemas.has(schema.id)) {
      console.warn(`[SchemaRegistry] Schema ${schema.id} 已存在，将被覆盖`);
    }
    this.schemas.set(schema.id, schema);
    console.log(`[SchemaRegistry] 注册 Schema: ${schema.id} (${schema.visualType})`);
  }

  /**
   * 根据 ID 获取 Schema
   */
  get(id: string): LineSchema | undefined {
    return this.schemas.get(id);
  }

  /**
   * 根据 visualType 获取所有 Schema
   */
  getByVisualType(visualType: string): LineSchema[] {
    return Array.from(this.schemas.values()).filter(
      schema => schema.visualType === visualType
    );
  }

  /**
   * 获取所有 Schema
   */
  getAll(): LineSchema[] {
    return Array.from(this.schemas.values());
  }

  /**
   * 检查 Schema 是否存在
   */
  has(id: string): boolean {
    return this.schemas.has(id);
  }

  /**
   * 取消注册 Schema
   */
  unregister(id: string): boolean {
    const result = this.schemas.delete(id);
    if (result) {
      console.log(`[SchemaRegistry] 取消注册 Schema: ${id}`);
    }
    return result;
  }

  /**
   * 清空所有 Schema
   */
  clear(): void {
    this.schemas.clear();
    console.log('[SchemaRegistry] 清空所有 Schema');
  }
}

// 创建全局单例
export const schemaRegistry = new SchemaRegistry();

/**
 * 初始化默认 Schema
 */
export function initializeDefaultSchemas(): void {
  console.log('[SchemaRegistry] 初始化默认 Schema...');
  
  schemaRegistry.register(LinePlanSchema);
  schemaRegistry.register(MilestoneSchema);
  schemaRegistry.register(GatewaySchema);
  
  console.log('[SchemaRegistry] 默认 Schema 初始化完成');
}

/**
 * 便捷函数：根据 ID 获取 Schema
 */
export function getSchemaById(id: string): LineSchema | undefined {
  return schemaRegistry.get(id);
}

/**
 * 便捷函数：注册 Schema
 */
export function registerSchema(schema: LineSchema): void {
  schemaRegistry.register(schema);
}
