/**
 * 数据导出导入单元测试
 */

import { describe, it, expect } from 'vitest';
import {
  exportToJSON,
  exportToCSV,
  exportToExcel,
} from '@/utils/dataExport';
import {
  importFromJSON,
  mergePlans,
  validateAndFixPlan,
} from '@/utils/dataImport';
import { generateMinimalTimePlan, generateTimePlan } from '@/utils/testDataGenerator';

describe('数据导出导入', () => {
  describe('exportToJSON', () => {
    it('应该导出有效的 JSON 字符串', () => {
      const plan = generateMinimalTimePlan();
      const json = exportToJSON(plan);
      
      expect(typeof json).toBe('string');
      expect(() => JSON.parse(json)).not.toThrow();
    });

    it('导出的 JSON 应该包含所有字段', () => {
      const plan = generateMinimalTimePlan();
      const json = exportToJSON(plan);
      const parsed = JSON.parse(json);
      
      expect(parsed).toHaveProperty('id');
      expect(parsed).toHaveProperty('title');
      expect(parsed).toHaveProperty('timelines');
      expect(parsed).toHaveProperty('lines');
      expect(parsed).toHaveProperty('relations');
    });
  });

  describe('exportToCSV', () => {
    it('应该导出有效的 CSV 字符串', () => {
      const plan = generateMinimalTimePlan();
      const csv = exportToCSV(plan);
      
      expect(typeof csv).toBe('string');
      expect(csv.includes(',')).toBe(true);
    });

    it('CSV 应该包含正确的表头', () => {
      const plan = generateMinimalTimePlan();
      const csv = exportToCSV(plan);
      const lines = csv.split('\n');
      const headers = lines[0];
      
      expect(headers).toContain('Timeline');
      expect(headers).toContain('Label');
      expect(headers).toContain('Start Date');
      expect(headers).toContain('Status');
    });

    it('CSV 应该包含正确的行数', () => {
      const plan = generateMinimalTimePlan();
      const csv = exportToCSV(plan);
      const lines = csv.split('\n');
      
      // 表头 + 数据行
      expect(lines.length).toBe(plan.lines.length + 1);
    });
  });

  describe('exportToExcel', () => {
    it('应该导出有效的 TSV 字符串', () => {
      const plan = generateMinimalTimePlan();
      const excel = exportToExcel(plan);
      
      expect(typeof excel).toBe('string');
      expect(excel.includes('\t')).toBe(true);
    });

    it('Excel 应该包含正确的行数', () => {
      const plan = generateMinimalTimePlan();
      const excel = exportToExcel(plan);
      const lines = excel.split('\n');
      
      expect(lines.length).toBe(plan.lines.length + 1);
    });
  });

  describe('importFromJSON', () => {
    it('应该成功导入有效的 JSON', () => {
      const plan = generateMinimalTimePlan();
      const json = exportToJSON(plan);
      const imported = importFromJSON(json);
      
      expect(imported).not.toBeNull();
      expect(imported?.id).toBe(plan.id);
      expect(imported?.title).toBe(plan.title);
    });

    it('应该处理日期字段', () => {
      const plan = generateMinimalTimePlan();
      const json = exportToJSON(plan);
      const imported = importFromJSON(json);
      
      expect(imported).not.toBeNull();
      expect(imported!.lines[0].startDate).toBeInstanceOf(Date);
    });

    it('应该拒绝无效的 JSON', () => {
      const invalid = '{ invalid json }';
      const imported = importFromJSON(invalid);
      
      expect(imported).toBeNull();
    });

    it('应该拒绝不符合 schema 的数据', () => {
      const invalid = JSON.stringify({ foo: 'bar' });
      const imported = importFromJSON(invalid);
      
      expect(imported).toBeNull();
    });
  });

  describe('导出导入往返测试', () => {
    it('JSON 导出导入应该保持数据完整性', () => {
      const plan = generateTimePlan('测试项目', {
        numTimelines: 2,
        numLinesPerTimeline: 5,
        relationDensity: 0.5,
        includeBaselines: true,
      });
      
      const json = exportToJSON(plan);
      const imported = importFromJSON(json);
      
      expect(imported).not.toBeNull();
      expect(imported!.id).toBe(plan.id);
      expect(imported!.title).toBe(plan.title);
      expect(imported!.timelines.length).toBe(plan.timelines.length);
      expect(imported!.lines.length).toBe(plan.lines.length);
      expect(imported!.relations.length).toBe(plan.relations.length);
    });

    it('应该保持节点属性完整性', () => {
      const plan = generateMinimalTimePlan();
      const json = exportToJSON(plan);
      const imported = importFromJSON(json);
      
      expect(imported).not.toBeNull();
      const originalLine = plan.lines[0];
      const importedLine = imported!.lines[0];
      
      expect(importedLine.id).toBe(originalLine.id);
      expect(importedLine.label).toBe(originalLine.label);
      expect(importedLine.schemaId).toBe(originalLine.schemaId);
      expect(importedLine.attributes?.status).toBe(originalLine.attributes?.status);
    });
  });

  describe('mergePlans', () => {
    it('应该合并无冲突的项目', () => {
      const plan1 = generateMinimalTimePlan();
      const plan2 = generateMinimalTimePlan();
      plan2.id = 'different-id';
      
      const merged = mergePlans([plan1], [plan2]);
      
      expect(merged.length).toBe(2);
      expect(merged[0].id).toBe(plan1.id);
      expect(merged[1].id).toBe(plan2.id);
    });

    it('应该处理 ID 冲突', () => {
      const plan1 = generateMinimalTimePlan();
      const plan2 = generateMinimalTimePlan();
      plan2.id = plan1.id; // 相同 ID
      
      const merged = mergePlans([plan1], [plan2]);
      
      expect(merged.length).toBe(2);
      expect(merged[0].id).toBe(plan1.id);
      expect(merged[1].id).not.toBe(plan1.id); // ID 应该被重命名
      expect(merged[1].id).toContain('imported');
    });
  });

  describe('validateAndFixPlan', () => {
    it('应该修复日期字段', () => {
      const plan: any = {
        ...generateMinimalTimePlan(),
        createdAt: new Date().toISOString(), // 字符串格式
        lines: [
          {
            ...generateMinimalTimePlan().lines[0],
            startDate: new Date().toISOString(),
          },
        ],
      };
      
      const fixed = validateAndFixPlan(plan);
      
      expect(fixed.createdAt).toBeInstanceOf(Date);
      expect(fixed.lines[0].startDate).toBeInstanceOf(Date);
    });

    it('应该补充缺失的字段', () => {
      const plan: any = {
        id: 'test-1',
        title: '测试项目',
        owner: '测试用户',
        schemaId: 'default',
        // 缺少 timelines, lines, relations
      };
      
      const fixed = validateAndFixPlan(plan);
      
      expect(Array.isArray(fixed.timelines)).toBe(true);
      expect(Array.isArray(fixed.lines)).toBe(true);
      expect(Array.isArray(fixed.relations)).toBe(true);
      expect(fixed.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('性能测试', () => {
    it('应该能够处理大规模数据导出', () => {
      const plan = generateTimePlan('大项目', {
        numTimelines: 10,
        numLinesPerTimeline: 100,
      });
      
      const startTime = Date.now();
      const json = exportToJSON(plan);
      const endTime = Date.now();
      
      expect(json.length).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(1000); // 应该在 1 秒内完成
    });

    it('应该能够处理大规模数据导入', () => {
      const plan = generateTimePlan('大项目', {
        numTimelines: 10,
        numLinesPerTimeline: 100,
      });
      
      const json = exportToJSON(plan);
      
      const startTime = Date.now();
      const imported = importFromJSON(json);
      const endTime = Date.now();
      
      expect(imported).not.toBeNull();
      expect(endTime - startTime).toBeLessThan(2000); // 应该在 2 秒内完成
    });
  });
});
