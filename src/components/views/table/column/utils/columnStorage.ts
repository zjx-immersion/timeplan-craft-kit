/**
 * 列配置存储工具
 * @module ColumnStorage
 */

import type { ColumnConfig, TableViewPreset } from '../types/columnTypes';
import { SYSTEM_PRESETS, STORAGE_KEYS, DEFAULT_COLUMNS } from '../types/columnTypes';

/**
 * 加载所有预设方案
 */
export function loadPresets(): TableViewPreset[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PRESETS);
    if (!stored) {
      return [...SYSTEM_PRESETS];
    }
    
    const userPresets: TableViewPreset[] = JSON.parse(stored);
    
    // 合并系统预设和用户预设
    return [...SYSTEM_PRESETS, ...userPresets.filter(p => !p.isSystem)];
  } catch (error) {
    console.error('[ColumnStorage] 加载预设失败:', error);
    return [...SYSTEM_PRESETS];
  }
}

/**
 * 保存预设方案
 */
export function savePreset(preset: TableViewPreset): void {
  try {
    const presets = loadPresets();
    
    // 不允许修改系统预设
    if (preset.isSystem) {
      throw new Error('不能修改系统预设');
    }
    
    const index = presets.findIndex(p => p.id === preset.id);
    
    if (index >= 0) {
      presets[index] = {
        ...preset,
        updatedAt: new Date(),
      };
    } else {
      presets.push({
        ...preset,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    
    // 只保存用户预设
    const userPresets = presets.filter(p => !p.isSystem);
    localStorage.setItem(STORAGE_KEYS.PRESETS, JSON.stringify(userPresets));
    
    console.log('[ColumnStorage] 保存预设成功:', preset.name);
  } catch (error) {
    console.error('[ColumnStorage] 保存预设失败:', error);
    throw error;
  }
}

/**
 * 删除预设方案
 */
export function deletePreset(presetId: string): void {
  try {
    const presets = loadPresets();
    const preset = presets.find(p => p.id === presetId);
    
    // 不允许删除系统预设
    if (preset?.isSystem) {
      throw new Error('不能删除系统预设');
    }
    
    const userPresets = presets.filter(p => !p.isSystem && p.id !== presetId);
    localStorage.setItem(STORAGE_KEYS.PRESETS, JSON.stringify(userPresets));
    
    console.log('[ColumnStorage] 删除预设成功:', presetId);
  } catch (error) {
    console.error('[ColumnStorage] 删除预设失败:', error);
    throw error;
  }
}

/**
 * 获取当前预设ID
 */
export function getCurrentPresetId(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_PRESET);
    return stored || 'default';
  } catch (error) {
    console.error('[ColumnStorage] 获取当前预设失败:', error);
    return 'default';
  }
}

/**
 * 设置当前预设
 */
export function setCurrentPreset(presetId: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_PRESET, presetId);
    console.log('[ColumnStorage] 设置当前预设:', presetId);
  } catch (error) {
    console.error('[ColumnStorage] 设置当前预设失败:', error);
    throw error;
  }
}

/**
 * 获取当前列配置
 */
export function getCurrentColumns(): ColumnConfig[] {
  try {
    const presetId = getCurrentPresetId();
    const presets = loadPresets();
    const preset = presets.find(p => p.id === presetId);
    
    if (preset) {
      return preset.columns;
    }
    
    return DEFAULT_COLUMNS;
  } catch (error) {
    console.error('[ColumnStorage] 获取当前列配置失败:', error);
    return DEFAULT_COLUMNS;
  }
}

/**
 * 保存列宽
 */
export function saveColumnWidths(widths: Record<string, number>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.COLUMN_WIDTHS, JSON.stringify(widths));
  } catch (error) {
    console.error('[ColumnStorage] 保存列宽失败:', error);
  }
}

/**
 * 加载列宽
 */
export function loadColumnWidths(): Record<string, number> {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.COLUMN_WIDTHS);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('[ColumnStorage] 加载列宽失败:', error);
    return {};
  }
}

/**
 * 重置为默认配置
 */
export function resetToDefault(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_PRESET);
    localStorage.removeItem(STORAGE_KEYS.COLUMN_WIDTHS);
    console.log('[ColumnStorage] 已重置为默认配置');
  } catch (error) {
    console.error('[ColumnStorage] 重置失败:', error);
    throw error;
  }
}

/**
 * 导出配置
 */
export function exportConfig(): string {
  try {
    const config = {
      presets: loadPresets().filter(p => !p.isSystem),
      currentPreset: getCurrentPresetId(),
      columnWidths: loadColumnWidths(),
    };
    
    return JSON.stringify(config, null, 2);
  } catch (error) {
    console.error('[ColumnStorage] 导出配置失败:', error);
    throw error;
  }
}

/**
 * 导入配置
 */
export function importConfig(configJson: string): void {
  try {
    const config = JSON.parse(configJson);
    
    // 验证配置格式
    if (!config.presets || !Array.isArray(config.presets)) {
      throw new Error('无效的配置格式');
    }
    
    // 保存用户预设
    localStorage.setItem(STORAGE_KEYS.PRESETS, JSON.stringify(config.presets));
    
    // 保存当前预设
    if (config.currentPreset) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_PRESET, config.currentPreset);
    }
    
    // 保存列宽
    if (config.columnWidths) {
      localStorage.setItem(STORAGE_KEYS.COLUMN_WIDTHS, JSON.stringify(config.columnWidths));
    }
    
    console.log('[ColumnStorage] 导入配置成功');
  } catch (error) {
    console.error('[ColumnStorage] 导入配置失败:', error);
    throw error;
  }
}
