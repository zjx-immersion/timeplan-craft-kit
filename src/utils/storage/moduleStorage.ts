/**
 * Module存储工具
 * 
 * 使用localStorage持久化Module数据
 * 
 * @module utils/storage/moduleStorage
 */

import type { Module } from '@/types/module';

const STORAGE_KEY = 'timeplan-modules';
const STORAGE_VERSION = '1.0.0';

interface ModuleStorageData {
  version: string;
  modules: Module[];
  lastUpdated: string;
}

export function saveModules(modules: Module[]): void {
  try {
    const data: ModuleStorageData = {
      version: STORAGE_VERSION,
      modules,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('[ModuleStorage] 保存失败:', error);
    throw new Error('保存Module数据失败');
  }
}

export function loadModules(): Module[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const data: ModuleStorageData = JSON.parse(stored);
    return data.modules.map(module => ({
      ...module,
      createdAt: new Date(module.createdAt),
      updatedAt: new Date(module.updatedAt),
    }));
  } catch (error) {
    console.error('[ModuleStorage] 加载失败:', error);
    return [];
  }
}

export function clearModules(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getModuleById(id: string): Module | undefined {
  return loadModules().find(m => m.id === id);
}

export function getModulesByProductId(productId: string): Module[] {
  return loadModules().filter(m => m.productId === productId);
}

export function addModule(module: Module): void {
  const modules = loadModules();
  modules.push(module);
  saveModules(modules);
}

export function updateModule(id: string, updates: Partial<Module>): void {
  const modules = loadModules();
  const index = modules.findIndex(m => m.id === id);
  if (index === -1) throw new Error(`Module ${id} 不存在`);
  
  modules[index] = {
    ...modules[index],
    ...updates,
    updatedAt: new Date(),
  };
  saveModules(modules);
}

export function deleteModule(id: string): void {
  const modules = loadModules();
  saveModules(modules.filter(m => m.id !== id));
}
