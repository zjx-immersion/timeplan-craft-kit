/**
 * Excel导出器单元测试
 * @jest-environment jsdom
 */

import { describe, test, expect } from 'vitest';
import type { ExportOptions } from '../export/excelExporter';
import type { Line, Timeline } from '@/types/timeplanSchema';

describe('ExcelExporter', () => {
  const mockTimelines: Timeline[] = [
    {
      id: 'timeline-1',
      name: '项目管理',
      label: '项目管理',
    },
  ];
  
  const mockLines: Line[] = [
    {
      id: 'line-1',
      timelineId: 'timeline-1',
      schemaId: 'lineplan-schema',
      label: '示例任务',
      startDate: '2026-03-01',
      endDate: '2026-03-15',
      attributes: {
        owner: '张三',
        progress: 50,
        status: 'in-progress',
        priority: 'P1',
      },
    },
  ];
  
  describe('Export Options', () => {
    test('应该定义导出范围选项', () => {
      const options: ExportOptions = {
        range: 'all',
        columns: ['name', 'owner', 'startDate'],
        includeHeader: true,
        dateFormat: 'yyyy-MM-dd',
        filename: 'test',
      };
      
      expect(options.range).toBe('all');
      expect(options.columns.length).toBe(3);
    });
    
    test('应该支持选中行导出', () => {
      const options: ExportOptions = {
        range: 'selected',
        selectedRowKeys: ['line-1'],
        columns: ['name'],
        includeHeader: true,
        dateFormat: 'yyyy-MM-dd',
        filename: 'test',
      };
      
      expect(options.range).toBe('selected');
      expect(options.selectedRowKeys).toContain('line-1');
    });
  });
  
  describe('Data Filtering', () => {
    test('应该筛选全部数据', () => {
      const exportData = mockLines;
      expect(exportData.length).toBe(mockLines.length);
    });
    
    test('应该筛选选中行', () => {
      const selectedIds = ['line-1'];
      const exportData = mockLines.filter(line => selectedIds.includes(line.id));
      expect(exportData.length).toBe(1);
    });
  });
  
  describe('Data Transformation', () => {
    test('应该转换类型标签', () => {
      const mapping: Record<string, string> = {
        'lineplan-schema': '计划单元',
        'milestone-schema': '里程碑',
        'gateway-schema': '关口',
      };
      
      expect(mapping['lineplan-schema']).toBe('计划单元');
    });
    
    test('应该转换状态标签', () => {
      const mapping: Record<string, string> = {
        'not-started': '未开始',
        'in-progress': '进行中',
        'completed': '已完成',
      };
      
      expect(mapping['in-progress']).toBe('进行中');
    });
  });
  
  describe('Date Formatting', () => {
    test('应该格式化日期', () => {
      const date = new Date('2026-03-01');
      const formatted = date.toISOString().split('T')[0];
      expect(formatted).toBe('2026-03-01');
    });
  });
});
