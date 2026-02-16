/**
 * relationValidator单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import type { Relation, Line } from '@/types/timeplanSchema';
import {
  validateRelations,
  autoFixRelations,
  findDuplicateRelations,
  getValidationSummary,
} from '../relationValidator';

describe('relationValidator', () => {
  let validLines: Line[];
  let validRelations: Relation[];

  beforeEach(() => {
    // 准备测试数据
    validLines = [
      { id: 'line-1', name: 'Task 1', timelineId: 'tl-1', startDate: new Date(), endDate: new Date() } as Line,
      { id: 'line-2', name: 'Task 2', timelineId: 'tl-1', startDate: new Date(), endDate: new Date() } as Line,
      { id: 'line-3', name: 'Task 3', timelineId: 'tl-1', startDate: new Date(), endDate: new Date() } as Line,
    ];

    validRelations = [
      {
        id: 'rel-1',
        type: 'dependency',
        fromLineId: 'line-1',
        toLineId: 'line-2',
      } as Relation,
      {
        id: 'rel-2',
        type: 'dependency',
        fromLineId: 'line-2',
        toLineId: 'line-3',
      } as Relation,
    ];
  });

  describe('validateRelations', () => {
    it('should pass validation with all valid relations', () => {
      const result = validateRelations(validRelations, validLines);

      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(0);
      expect(result.fixedRelations).toHaveLength(2);
    });

    it('should detect missing fromLineId', () => {
      const relations: Relation[] = [
        {
          id: 'rel-1',
          type: 'dependency',
          fromLineId: 'line-999', // 不存在
          toLineId: 'line-1',
        } as Relation,
      ];

      const result = validateRelations(relations, validLines);

      expect(result.valid).toBe(false);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].type).toBe('missing_from');
      expect(result.warnings[0].fromLineId).toBe('line-999');
      expect(result.fixedRelations).toHaveLength(0);
    });

    it('should detect missing toLineId', () => {
      const relations: Relation[] = [
        {
          id: 'rel-1',
          type: 'dependency',
          fromLineId: 'line-1',
          toLineId: 'line-999', // 不存在
        } as Relation,
      ];

      const result = validateRelations(relations, validLines);

      expect(result.valid).toBe(false);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].type).toBe('missing_to');
      expect(result.warnings[0].toLineId).toBe('line-999');
      expect(result.fixedRelations).toHaveLength(0);
    });

    it('should detect circular reference (self-loop)', () => {
      const relations: Relation[] = [
        {
          id: 'rel-1',
          type: 'dependency',
          fromLineId: 'line-1',
          toLineId: 'line-1', // 自引用
        } as Relation,
      ];

      const result = validateRelations(relations, validLines);

      expect(result.valid).toBe(false);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].type).toBe('circular');
      expect(result.warnings[0].message).toContain('不能指向自身');
      expect(result.fixedRelations).toHaveLength(0);
    });

    it('should detect duplicate relations', () => {
      const relations: Relation[] = [
        {
          id: 'rel-1',
          type: 'dependency',
          fromLineId: 'line-1',
          toLineId: 'line-2',
        } as Relation,
        {
          id: 'rel-2',
          type: 'dependency',
          fromLineId: 'line-1',
          toLineId: 'line-2', // 重复
        } as Relation,
      ];

      const result = validateRelations(relations, validLines);

      expect(result.valid).toBe(false);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].type).toBe('duplicate');
      expect(result.warnings[0].relationId).toBe('rel-2');
      expect(result.fixedRelations).toHaveLength(1); // 只保留第一个
    });

    it('should detect multiple issues in one relation', () => {
      const relations: Relation[] = [
        {
          id: 'rel-1',
          type: 'dependency',
          fromLineId: 'line-999',
          toLineId: 'line-888',
        } as Relation,
      ];

      const result = validateRelations(relations, validLines);

      expect(result.valid).toBe(false);
      expect(result.warnings).toHaveLength(2); // missing_from + missing_to
      expect(result.warnings.some(w => w.type === 'missing_from')).toBe(true);
      expect(result.warnings.some(w => w.type === 'missing_to')).toBe(true);
      expect(result.fixedRelations).toHaveLength(0);
    });

    it('should handle empty relations array', () => {
      const result = validateRelations([], validLines);

      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(0);
      expect(result.fixedRelations).toHaveLength(0);
    });

    it('should handle empty lines array', () => {
      const result = validateRelations(validRelations, []);

      expect(result.valid).toBe(false);
      expect(result.warnings.length).toBeGreaterThan(0); // 所有关系都无效
    });
  });

  describe('autoFixRelations', () => {
    it('should return original relations if all valid', () => {
      const result = autoFixRelations(validRelations, validLines);

      expect(result.fixed).toEqual(validRelations);
      expect(result.removed).toBe(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('should remove invalid relations', () => {
      const relations: Relation[] = [
        ...validRelations,
        {
          id: 'rel-invalid',
          type: 'dependency',
          fromLineId: 'line-999',
          toLineId: 'line-1',
        } as Relation,
      ];

      const result = autoFixRelations(relations, validLines);

      expect(result.fixed).toHaveLength(2); // 只保留有效的
      expect(result.removed).toBe(1);
      expect(result.warnings).toHaveLength(1);
    });

    it('should remove all invalid relations', () => {
      const relations: Relation[] = [
        {
          id: 'rel-1',
          type: 'dependency',
          fromLineId: 'line-999',
          toLineId: 'line-1',
        } as Relation,
        {
          id: 'rel-2',
          type: 'dependency',
          fromLineId: 'line-1',
          toLineId: 'line-888',
        } as Relation,
      ];

      const result = autoFixRelations(relations, validLines);

      expect(result.fixed).toHaveLength(0);
      expect(result.removed).toBe(2);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should handle empty relations', () => {
      const result = autoFixRelations([], validLines);

      expect(result.fixed).toHaveLength(0);
      expect(result.removed).toBe(0);
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe('findDuplicateRelations', () => {
    it('should return empty array if no duplicates', () => {
      const duplicates = findDuplicateRelations(validRelations);

      expect(duplicates).toHaveLength(0);
    });

    it('should find duplicate relations', () => {
      const relations: Relation[] = [
        {
          id: 'rel-1',
          type: 'dependency',
          fromLineId: 'line-1',
          toLineId: 'line-2',
        } as Relation,
        {
          id: 'rel-2',
          type: 'dependency',
          fromLineId: 'line-1',
          toLineId: 'line-2', // 重复
        } as Relation,
        {
          id: 'rel-3',
          type: 'dependency',
          fromLineId: 'line-1',
          toLineId: 'line-2', // 重复
        } as Relation,
      ];

      const duplicates = findDuplicateRelations(relations);

      expect(duplicates).toHaveLength(2); // rel-2 和 rel-3
      expect(duplicates).toContain('rel-2');
      expect(duplicates).toContain('rel-3');
      expect(duplicates).not.toContain('rel-1'); // 第一个不算重复
    });

    it('should handle different direction as different relations', () => {
      const relations: Relation[] = [
        {
          id: 'rel-1',
          type: 'dependency',
          fromLineId: 'line-1',
          toLineId: 'line-2',
        } as Relation,
        {
          id: 'rel-2',
          type: 'dependency',
          fromLineId: 'line-2',
          toLineId: 'line-1', // 反向，不算重复
        } as Relation,
      ];

      const duplicates = findDuplicateRelations(relations);

      expect(duplicates).toHaveLength(0);
    });

    it('should handle empty relations', () => {
      const duplicates = findDuplicateRelations([]);

      expect(duplicates).toHaveLength(0);
    });
  });

  describe('getValidationSummary', () => {
    it('should return correct summary for valid relations', () => {
      const summary = getValidationSummary(validRelations, validLines);

      expect(summary.total).toBe(2);
      expect(summary.valid).toBe(2);
      expect(summary.invalid).toBe(0);
      expect(Object.keys(summary.warningsByType)).toHaveLength(0);
    });

    it('should return correct summary with invalid relations', () => {
      const relations: Relation[] = [
        ...validRelations,
        {
          id: 'rel-bad-1',
          type: 'dependency',
          fromLineId: 'line-999',
          toLineId: 'line-1',
        } as Relation,
        {
          id: 'rel-bad-2',
          type: 'dependency',
          fromLineId: 'line-1',
          toLineId: 'line-888',
        } as Relation,
      ];

      const summary = getValidationSummary(relations, validLines);

      expect(summary.total).toBe(4);
      expect(summary.valid).toBe(2);
      expect(summary.invalid).toBe(2);
      expect(summary.warningsByType['missing_from']).toBe(1);
      expect(summary.warningsByType['missing_to']).toBe(1);
    });

    it('should count warnings by type correctly', () => {
      const relations: Relation[] = [
        {
          id: 'rel-1',
          type: 'dependency',
          fromLineId: 'line-999',
          toLineId: 'line-1',
        } as Relation,
        {
          id: 'rel-2',
          type: 'dependency',
          fromLineId: 'line-888',
          toLineId: 'line-2',
        } as Relation,
        {
          id: 'rel-3',
          type: 'dependency',
          fromLineId: 'line-1',
          toLineId: 'line-1',
        } as Relation,
      ];

      const summary = getValidationSummary(relations, validLines);

      expect(summary.warningsByType['missing_from']).toBe(2);
      expect(summary.warningsByType['circular']).toBe(1);
    });

    it('should handle empty relations', () => {
      const summary = getValidationSummary([], validLines);

      expect(summary.total).toBe(0);
      expect(summary.valid).toBe(0);
      expect(summary.invalid).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle relations with undefined fromLineId', () => {
      const relations: Relation[] = [
        {
          id: 'rel-1',
          type: 'dependency',
          fromLineId: undefined as any,
          toLineId: 'line-1',
        } as Relation,
      ];

      const result = validateRelations(relations, validLines);

      expect(result.valid).toBe(false);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should handle relations with null toLineId', () => {
      const relations: Relation[] = [
        {
          id: 'rel-1',
          type: 'dependency',
          fromLineId: 'line-1',
          toLineId: null as any,
        } as Relation,
      ];

      const result = validateRelations(relations, validLines);

      expect(result.valid).toBe(false);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should handle large number of relations efficiently', () => {
      // 创建1000个有效关系
      const manyLines: Line[] = Array.from({ length: 1000 }, (_, i) => ({
        id: `line-${i}`,
        name: `Task ${i}`,
        timelineId: 'tl-1',
        startDate: new Date(),
        endDate: new Date(),
      } as Line));

      const manyRelations: Relation[] = Array.from({ length: 999 }, (_, i) => ({
        id: `rel-${i}`,
        type: 'dependency',
        fromLineId: `line-${i}`,
        toLineId: `line-${i + 1}`,
      } as Relation));

      const start = Date.now();
      const result = validateRelations(manyRelations, manyLines);
      const duration = Date.now() - start;

      expect(result.valid).toBe(true);
      expect(result.fixedRelations).toHaveLength(999);
      expect(duration).toBeLessThan(100); // 应该在100ms内完成
    });
  });
});
