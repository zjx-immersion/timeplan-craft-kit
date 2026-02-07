/**
 * uuid 测试
 */

import { describe, it, expect } from 'vitest';
import {
  generateId,
  generatePlanId,
  generateTimelineId,
  generateLineId,
  generateRelationId,
  isValidId,
  extractTimestamp,
  extractPrefix,
  generateShortId,
  generateUUID,
  generateBatchIds,
} from '../uuid';

describe('uuid', () => {
  describe('generateId', () => {
    it('应该生成唯一 ID', () => {
      const id1 = generateId();
      const id2 = generateId();
      
      expect(id1).not.toBe(id2);
      expect(id1).toContain('-');
    });

    it('应该支持前缀', () => {
      const id = generateId('test');
      
      expect(id).toMatch(/^test-\d+-\w+$/);
    });
  });

  describe('专用 ID 生成器', () => {
    it('应该生成正确前缀的项目 ID', () => {
      const id = generatePlanId();
      expect(id).toMatch(/^plan-\d+-\w+$/);
    });

    it('应该生成正确前缀的时间线 ID', () => {
      const id = generateTimelineId();
      expect(id).toMatch(/^tl-\d+-\w+$/);
    });

    it('应该生成正确前缀的 Line ID', () => {
      const id = generateLineId();
      expect(id).toMatch(/^line-\d+-\w+$/);
    });

    it('应该生成正确前缀的关系 ID', () => {
      const id = generateRelationId();
      expect(id).toMatch(/^rel-\d+-\w+$/);
    });
  });

  describe('isValidId', () => {
    it('应该验证有效 ID', () => {
      expect(isValidId('plan-1234567890-abc')).toBe(true);
      expect(isValidId('1234567890')).toBe(true);
      expect(isValidId('test-id')).toBe(true);
    });

    it('应该拒绝无效 ID', () => {
      expect(isValidId('')).toBe(false);
      expect(isValidId(null as any)).toBe(false);
      expect(isValidId(undefined as any)).toBe(false);
    });
  });

  describe('extractTimestamp', () => {
    it('应该提取时间戳', () => {
      const now = Date.now();
      const id = `plan-${now}-abc`;
      
      const timestamp = extractTimestamp(id);
      expect(timestamp).toBe(now);
    });

    it('应该在没有时间戳时返回 null', () => {
      const timestamp = extractTimestamp('simple-id');
      expect(timestamp).toBeNull();
    });
  });

  describe('extractPrefix', () => {
    it('应该提取前缀', () => {
      const prefix = extractPrefix('plan-123-abc');
      expect(prefix).toBe('plan');
    });

    it('应该在没有前缀时返回 null', () => {
      const prefix = extractPrefix('simpleid');
      expect(prefix).toBeNull();
    });
  });

  describe('generateShortId', () => {
    it('应该生成8位ID', () => {
      const id = generateShortId();
      expect(id.length).toBe(8);
    });

    it('应该生成唯一 ID', () => {
      const id1 = generateShortId();
      const id2 = generateShortId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('generateUUID', () => {
    it('应该生成标准 UUID 格式', () => {
      const uuid = generateUUID();
      expect(uuid).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });

    it('应该生成唯一 UUID', () => {
      const uuid1 = generateUUID();
      const uuid2 = generateUUID();
      expect(uuid1).not.toBe(uuid2);
    });
  });

  describe('generateBatchIds', () => {
    it('应该生成指定数量的 ID', () => {
      const ids = generateBatchIds(5);
      expect(ids).toHaveLength(5);
    });

    it('应该生成唯一 ID', () => {
      const ids = generateBatchIds(10, 'test');
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(10);
    });

    it('应该支持前缀', () => {
      const ids = generateBatchIds(3, 'batch');
      ids.forEach((id) => {
        expect(id).toMatch(/^batch-\d+-\w+$/);
      });
    });
  });
});
