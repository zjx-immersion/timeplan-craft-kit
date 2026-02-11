/**
 * 列配置存储单元测试
 * @jest-environment jsdom
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  loadPresets, 
  savePreset, 
  deletePreset,
  getCurrentPresetId,
  setCurrentPreset,
  getCurrentColumns,
  saveColumnWidths,
  loadColumnWidths,
  resetToDefault,
} from '../column/utils/columnStorage';
import { SYSTEM_PRESETS, DEFAULT_COLUMNS } from '../column/types/columnTypes';
import type { TableViewPreset } from '../column/types/columnTypes';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('ColumnStorage', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });
  
  describe('loadPresets', () => {
    test('应该加载系统预设', () => {
      const presets = loadPresets();
      expect(presets.length).toBeGreaterThanOrEqual(SYSTEM_PRESETS.length);
      
      const systemPresets = presets.filter(p => p.isSystem);
      expect(systemPresets.length).toBe(SYSTEM_PRESETS.length);
    });
    
    test('应该加载用户预设', () => {
      const userPreset: TableViewPreset = {
        id: 'user-test',
        name: '测试预设',
        columns: DEFAULT_COLUMNS,
        isSystem: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      savePreset(userPreset);
      
      const presets = loadPresets();
      const loaded = presets.find(p => p.id === 'user-test');
      expect(loaded).toBeDefined();
      expect(loaded?.name).toBe('测试预设');
    });
  });
  
  describe('savePreset', () => {
    test('应该保存新预设', () => {
      const newPreset: TableViewPreset = {
        id: 'test-1',
        name: '新预设',
        columns: DEFAULT_COLUMNS,
        isSystem: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      savePreset(newPreset);
      
      const presets = loadPresets();
      const saved = presets.find(p => p.id === 'test-1');
      expect(saved).toBeDefined();
    });
    
    test('应该更新现有预设', () => {
      const preset: TableViewPreset = {
        id: 'test-2',
        name: '原名称',
        columns: DEFAULT_COLUMNS,
        isSystem: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      savePreset(preset);
      
      // 更新
      preset.name = '新名称';
      savePreset(preset);
      
      const presets = loadPresets();
      const updated = presets.find(p => p.id === 'test-2');
      expect(updated?.name).toBe('新名称');
    });
    
    test('不应该允许修改系统预设', () => {
      const systemPreset: TableViewPreset = {
        ...SYSTEM_PRESETS[0],
        name: '修改后的名称',
      };
      
      expect(() => savePreset(systemPreset)).toThrow('不能修改系统预设');
    });
  });
  
  describe('deletePreset', () => {
    test('应该删除用户预设', () => {
      const preset: TableViewPreset = {
        id: 'test-delete',
        name: '待删除',
        columns: DEFAULT_COLUMNS,
        isSystem: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      savePreset(preset);
      let presets = loadPresets();
      expect(presets.find(p => p.id === 'test-delete')).toBeDefined();
      
      deletePreset('test-delete');
      presets = loadPresets();
      expect(presets.find(p => p.id === 'test-delete')).toBeUndefined();
    });
    
    test('不应该允许删除系统预设', () => {
      expect(() => deletePreset('default')).toThrow('不能删除系统预设');
    });
  });
  
  describe('getCurrentPresetId', () => {
    test('应该返回默认预设ID', () => {
      const id = getCurrentPresetId();
      expect(id).toBe('default');
    });
    
    test('应该返回设置的预设ID', () => {
      setCurrentPreset('simple');
      const id = getCurrentPresetId();
      expect(id).toBe('simple');
    });
  });
  
  describe('getCurrentColumns', () => {
    test('应该返回当前预设的列配置', () => {
      setCurrentPreset('default');
      const columns = getCurrentColumns();
      expect(columns.length).toBeGreaterThan(0);
    });
  });
  
  describe('Column Widths', () => {
    test('应该保存和加载列宽', () => {
      const widths = {
        'name': 300,
        'owner': 150,
      };
      
      saveColumnWidths(widths);
      const loaded = loadColumnWidths();
      
      expect(loaded.name).toBe(300);
      expect(loaded.owner).toBe(150);
    });
  });
  
  describe('resetToDefault', () => {
    test('应该清除所有自定义配置', () => {
      setCurrentPreset('simple');
      saveColumnWidths({ 'name': 300 });
      
      resetToDefault();
      
      const id = getCurrentPresetId();
      const widths = loadColumnWidths();
      
      expect(id).toBe('default');
      expect(Object.keys(widths).length).toBe(0);
    });
  });
});
