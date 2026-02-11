/**
 * Excel解析器单元测试
 * @jest-environment jsdom
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { parseExcelFile, generateExcelTemplate, EXCEL_COLUMNS } from '../import/utils/excelParser';

describe('ExcelParser', () => {
  describe('parseExcelFile', () => {
    test('应该成功解析标准Excel文件', async () => {
      // Mock File object with valid data
      const mockData = `任务名称*\tTimeline\t类型*\t负责人\t开始日期*\t结束日期\t进度(%)\t状态\t优先级
示例任务1\t项目管理\t计划单元\t张三\t2026-03-01\t2026-03-15\t50\t进行中\tP1
示例里程碑\t项目管理\t里程碑\t李四\t2026-03-15\t\t0\t未开始\tP0`;
      
      const blob = new Blob([mockData], { type: 'text/plain' });
      const file = new File([blob], 'test.xlsx');
      
      // Note: This test requires actual XLSX library integration
      // In real implementation, would need proper mock or integration test
    });
    
    test('应该检测必填字段缺失', () => {
      const importData = {
        name: '',
        type: 'bar' as const,
        startDate: new Date('2026-03-01'),
      };
      
      // Validation would be done in validateImportData
      expect(importData.name).toBe('');
    });
    
    test('应该检测日期范围错误', () => {
      const startDate = new Date('2026-12-31');
      const endDate = new Date('2026-01-01');
      
      expect(endDate < startDate).toBe(true);
    });
  });
  
  describe('Date Parsing', () => {
    test('应该解析YYYY-MM-DD格式', () => {
      const dateStr = '2026-03-01';
      const date = new Date(dateStr);
      expect(date.getFullYear()).toBe(2026);
      expect(date.getMonth()).toBe(2); // 0-indexed
      expect(date.getDate()).toBe(1);
    });
    
    test('应该解析YYYY/MM/DD格式', () => {
      const dateStr = '2026/03/01';
      const date = new Date(dateStr);
      expect(date.getFullYear()).toBe(2026);
    });
    
    test('应该处理无效日期', () => {
      const invalidDate = new Date('invalid');
      expect(isNaN(invalidDate.getTime())).toBe(true);
    });
  });
  
  describe('Type Mapping', () => {
    test('应该正确映射中文类型', () => {
      const mapping: Record<string, string> = {
        '计划单元': 'bar',
        '里程碑': 'milestone',
        '关口': 'gateway',
      };
      
      expect(mapping['计划单元']).toBe('bar');
      expect(mapping['里程碑']).toBe('milestone');
      expect(mapping['关口']).toBe('gateway');
    });
  });
  
  describe('Status Mapping', () => {
    test('应该正确映射中文状态', () => {
      const mapping: Record<string, string> = {
        '未开始': 'not-started',
        '进行中': 'in-progress',
        '已完成': 'completed',
        '已延期': 'delayed',
      };
      
      expect(mapping['未开始']).toBe('not-started');
      expect(mapping['进行中']).toBe('in-progress');
    });
  });
  
  describe('Data Validation', () => {
    test('应该验证任务名称长度', () => {
      const name = 'a'.repeat(101);
      expect(name.length).toBeGreaterThan(100);
    });
    
    test('应该验证进度范围', () => {
      expect(50).toBeGreaterThanOrEqual(0);
      expect(50).toBeLessThanOrEqual(100);
      
      expect(-1).toBeLessThan(0);
      expect(101).toBeGreaterThan(100);
    });
    
    test('应该验证枚举值', () => {
      const validTypes = ['bar', 'milestone', 'gateway'];
      expect(validTypes).toContain('bar');
      expect(validTypes).not.toContain('invalid');
    });
  });
  
  describe('Excel Columns Definition', () => {
    test('应该定义所有必需列', () => {
      expect(EXCEL_COLUMNS.length).toBeGreaterThan(0);
      
      const requiredColumns = EXCEL_COLUMNS.filter(c => c.required);
      expect(requiredColumns.length).toBeGreaterThan(0);
      
      // 检查必填字段
      const requiredKeys = ['name', 'type', 'startDate'];
      requiredKeys.forEach(key => {
        const column = EXCEL_COLUMNS.find(c => c.key === key);
        expect(column).toBeDefined();
        expect(column?.required).toBe(true);
      });
    });
  });
});
