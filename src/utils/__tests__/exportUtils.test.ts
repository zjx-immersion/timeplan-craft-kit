/**
 * exportUtils 单元测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatDate,
  formatPercent,
  exportToExcel,
  exportToCSV,
  TimelineColumns,
  LineColumns,
} from '../exportUtils';
import * as XLSX from 'xlsx';
import { Timeline, Line } from '@/types/timeplanSchema';

// Mock XLSX
vi.mock('xlsx', () => ({
  utils: {
    aoa_to_sheet: vi.fn(() => ({})),
    book_new: vi.fn(() => ({ SheetNames: [], Sheets: {} })),
    book_append_sheet: vi.fn(),
  },
  writeFile: vi.fn(),
}));

describe('exportUtils', () => {
  describe('formatDate', () => {
    it('应该格式化 Date 对象', () => {
      const date = new Date(2026, 0, 15); // 2026-01-15
      expect(formatDate(date)).toBe('2026-01-15');
    });

    it('应该格式化日期字符串', () => {
      expect(formatDate('2026-02-09')).toBe('2026-02-09');
    });

    it('应该处理 null/undefined', () => {
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
    });

    it('应该处理无效日期', () => {
      expect(formatDate('invalid')).toBe('');
    });
  });

  describe('formatPercent', () => {
    it('应该格式化百分比', () => {
      expect(formatPercent(50)).toBe('50%');
      expect(formatPercent(0)).toBe('0%');
      expect(formatPercent(100)).toBe('100%');
    });

    it('应该处理 null/undefined', () => {
      expect(formatPercent(null)).toBe('');
      expect(formatPercent(undefined)).toBe('');
    });
  });

  describe('exportToExcel', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('应该创建包含表头和数据的工作表', () => {
      const testData = [
        { id: '1', name: 'Task 1', progress: 50 },
        { id: '2', name: 'Task 2', progress: 75 },
      ];

      const columns = [
        { header: 'ID', key: 'id' as const },
        { header: '名称', key: 'name' as const },
        { header: '进度', key: 'progress' as const, format: formatPercent },
      ];

      exportToExcel({
        filename: 'test',
        columns,
        data: testData,
      });

      expect(XLSX.utils.aoa_to_sheet).toHaveBeenCalled();
      const callArgs = (XLSX.utils.aoa_to_sheet as any).mock.calls[0][0];
      
      // 检查表头
      expect(callArgs[0]).toEqual(['ID', '名称', '进度']);
      
      // 检查数据
      expect(callArgs[1]).toEqual(['1', 'Task 1', '50%']);
      expect(callArgs[2]).toEqual(['2', 'Task 2', '75%']);
    });

    it('应该使用自定义提取函数', () => {
      const testData = [
        { id: '1', status: 'active' },
      ];

      const columns = [
        { 
          header: '状态', 
          key: (item: any) => item.status === 'active' ? '活跃' : '不活跃'
        },
      ];

      exportToExcel({
        filename: 'test',
        columns,
        data: testData,
      });

      const callArgs = (XLSX.utils.aoa_to_sheet as any).mock.calls[0][0];
      expect(callArgs[1]).toEqual(['活跃']);
    });

    it('应该调用 writeFile', () => {
      const testData = [{ id: '1' }];
      const columns = [{ header: 'ID', key: 'id' as const }];

      exportToExcel({
        filename: 'test',
        columns,
        data: testData,
      });

      expect(XLSX.writeFile).toHaveBeenCalledWith(
        expect.any(Object),
        'test.xlsx'
      );
    });
  });

  describe('exportToCSV', () => {
    let createElementSpy: any;
    let appendChildSpy: any;
    let removeChildSpy: any;
    let clickSpy: any;

    beforeEach(() => {
      clickSpy = vi.fn();
      const mockLink = {
        setAttribute: vi.fn(),
        style: {},
        click: clickSpy,
      };

      createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
      appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any);
      removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any);
      
      // Mock URL.createObjectURL and URL.revokeObjectURL
      global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
      global.URL.revokeObjectURL = vi.fn();
      
      // Mock Blob
      global.Blob = vi.fn((content, options) => ({
        content,
        options,
      })) as any;
    });

    afterEach(() => {
      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });

    it('应该创建 CSV 内容', () => {
      const testData = [
        { id: '1', name: 'Task 1' },
        { id: '2', name: 'Task 2' },
      ];

      const columns = [
        { header: 'ID', key: 'id' as const },
        { header: '名称', key: 'name' as const },
      ];

      exportToCSV({
        filename: 'test',
        columns,
        data: testData,
      });

      expect(global.Blob).toHaveBeenCalled();
      const blobContent = (global.Blob as any).mock.calls[0][0][0];
      
      // 检查内容（包含 BOM）
      expect(blobContent).toContain('ID,名称');
      expect(blobContent).toContain('1,Task 1');
      expect(blobContent).toContain('2,Task 2');
    });

    it('应该处理包含逗号的值', () => {
      const testData = [
        { id: '1', name: 'Task, with comma' },
      ];

      const columns = [
        { header: 'ID', key: 'id' as const },
        { header: '名称', key: 'name' as const },
      ];

      exportToCSV({
        filename: 'test',
        columns,
        data: testData,
      });

      const blobContent = (global.Blob as any).mock.calls[0][0][0];
      expect(blobContent).toContain('"Task, with comma"');
    });

    it('应该处理包含引号的值', () => {
      const testData = [
        { id: '1', name: 'Task "quoted"' },
      ];

      const columns = [
        { header: 'ID', key: 'id' as const },
        { header: '名称', key: 'name' as const },
      ];

      exportToCSV({
        filename: 'test',
        columns,
        data: testData,
      });

      const blobContent = (global.Blob as any).mock.calls[0][0][0];
      expect(blobContent).toContain('"Task ""quoted"""');
    });

    it('应该触发下载', () => {
      const testData = [{ id: '1' }];
      const columns = [{ header: 'ID', key: 'id' as const }];

      exportToCSV({
        filename: 'test',
        columns,
        data: testData,
      });

      expect(clickSpy).toHaveBeenCalled();
    });
  });

  describe('预定义列配置', () => {
    it('TimelineColumns 应该包含所有必需字段', () => {
      const headers = TimelineColumns.map(col => col.header);
      
      expect(headers).toContain('ID');
      expect(headers).toContain('名称');
      expect(headers).toContain('产品线');
      expect(headers).toContain('负责人');
      expect(headers).toContain('团队');
    });

    it('LineColumns 应该包含所有必需字段', () => {
      const headers = LineColumns.map(col => col.header);
      
      expect(headers).toContain('ID');
      expect(headers).toContain('类型');
      expect(headers).toContain('名称');
      expect(headers).toContain('开始日期');
      expect(headers).toContain('结束日期');
      expect(headers).toContain('进度');
    });

    it('LineColumns 应该正确格式化类型', () => {
      const typeColumn = LineColumns.find(col => col.header === '类型');
      expect(typeColumn).toBeDefined();
      
      if (typeColumn && typeof typeColumn.key === 'function') {
        const mockLine1: Line = { 
          id: '1', 
          timelineId: 't1', 
          type: 'lineplan', 
          name: 'Task',
          startDate: new Date('2026-01-01'),
          endDate: new Date('2026-01-15'),
        };
        const mockLine2: Line = { 
          id: '2', 
          timelineId: 't1', 
          type: 'milestone', 
          name: 'Milestone',
          startDate: new Date('2026-01-10'),
          endDate: new Date('2026-01-10'),
        };
        const mockLine3: Line = { 
          id: '3', 
          timelineId: 't1', 
          type: 'gateway', 
          name: 'Gateway',
          startDate: new Date('2026-01-20'),
          endDate: new Date('2026-01-20'),
        };
        
        expect(typeColumn.key(mockLine1)).toBe('任务');
        expect(typeColumn.key(mockLine2)).toBe('里程碑');
        expect(typeColumn.key(mockLine3)).toBe('网关');
      }
    });
  });

  describe('边界情况', () => {
    it('应该处理空数据', () => {
      const columns = [{ header: 'ID', key: 'id' as const }];

      exportToExcel({
        filename: 'test',
        columns,
        data: [],
      });

      expect(XLSX.utils.aoa_to_sheet).toHaveBeenCalled();
      const callArgs = (XLSX.utils.aoa_to_sheet as any).mock.calls[0][0];
      
      // 应该有表头，空数据数组不会生成额外行
      expect(callArgs.length).toBeGreaterThanOrEqual(1);
      expect(callArgs[0]).toEqual(['ID']);
    });

    it('应该处理缺失的字段', () => {
      // 清除之前的 mock 调用
      vi.clearAllMocks();
      
      const testData = [{ id: '1' }]; // 缺少 name 字段

      const columns = [
        { header: 'ID', key: 'id' as const },
        { header: '名称', key: 'name' as const },
      ];

      exportToExcel({
        filename: 'test',
        columns,
        data: testData,
      });

      const callArgs = (XLSX.utils.aoa_to_sheet as any).mock.calls[0][0];
      // 第一行是表头，第二行是数据
      expect(callArgs[0]).toEqual(['ID', '名称']);
      expect(callArgs[1][0]).toBe('1'); // ID 字段存在
      expect(callArgs[1][1]).toBe(''); // name 字段缺失，应该是空字符串
    });
  });
});
