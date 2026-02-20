/**
 * Store 导出统一管理
 * 
 * 迁移指南：
 * - 旧：useTimePlanStoreWithHistory (localStorage)
 * - 新：useTimePlanStoreWithAPI (后端 API)
 */

// 导出 API 集成的 Store（新的默认 Store）
export { useTimePlanStoreWithAPI } from './timePlanStoreWithAPI';

// 导出历史 Store（用于兼容，逐步废弃）
export { useTimePlanStoreWithHistory } from './timePlanStoreWithHistory';

// 导出其他 Store
export { useAuthStore } from './authStore';
export { useSchemaRegistryStore } from './schemaRegistryStore';
export { useUIStore } from './uiStore';
