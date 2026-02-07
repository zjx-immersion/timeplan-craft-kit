/**
 * imageExport 工具单元测试
 * 
 * @version 1.0.0
 * @date 2026-02-07
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exportToImage, exportToPNG, exportToJPEG } from '../imageExport';

// Mock html2canvas
vi.mock('html2canvas', () => ({
  default: vi.fn(() => Promise.resolve({
    toBlob: (callback: (blob: Blob | null) => void) => {
      const blob = new Blob(['fake-image-data'], { type: 'image/png' });
      callback(blob);
    },
  })),
}));

// Mock ant design message
vi.mock('antd', () => ({
  message: {
    loading: vi.fn(() => 'loading-key'),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('imageExport', () => {
  let mockElement: HTMLElement;
  let createElementSpy: any;
  let appendChildSpy: any;
  let removeChildSpy: any;

  beforeEach(() => {
    // 创建模拟元素
    mockElement = document.createElement('div');
    mockElement.setAttribute('data-testid', 'test-element');

    // Mock DOM方法
    createElementSpy = vi.spyOn(document, 'createElement');
    appendChildSpy = vi.spyOn(document.body, 'appendChild');
    removeChildSpy = vi.spyOn(document.body, 'removeChild');

    // Mock URL对象
    global.URL.createObjectURL = vi.fn(() => 'mock-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('exportToImage', () => {
    it('应该成功导出PNG格式', async () => {
      await exportToImage(mockElement, {
        format: 'png',
        filename: 'test-export',
        showLoading: false,
      });

      // 验证创建了下载链接
      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(appendChildSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();
    });

    it('应该支持自定义分辨率', async () => {
      const html2canvas = await import('html2canvas');
      
      await exportToImage(mockElement, {
        scale: 2,
        showLoading: false,
      });

      expect(html2canvas.default).toHaveBeenCalledWith(
        mockElement,
        expect.objectContaining({ scale: 2 })
      );
    });

    it('应该支持JPEG格式和质量设置', async () => {
      await exportToImage(mockElement, {
        format: 'jpeg',
        quality: 0.8,
        filename: 'test-jpeg',
        showLoading: false,
      });

      expect(createElementSpy).toHaveBeenCalledWith('a');
    });

    it('应该使用默认文件名', async () => {
      await exportToImage(mockElement, {
        showLoading: false,
      });

      const link = document.createElement('a');
      expect(link.download).toContain('timeplan-export');
    });
  });

  describe('exportToPNG', () => {
    it('应该以PNG格式导出', async () => {
      await exportToPNG(mockElement, 'test-png');

      expect(createElementSpy).toHaveBeenCalled();
    });

    it('应该支持自定义分辨率', async () => {
      const html2canvas = await import('html2canvas');
      
      await exportToPNG(mockElement, 'test-png', 3);

      expect(html2canvas.default).toHaveBeenCalledWith(
        mockElement,
        expect.objectContaining({ scale: 3 })
      );
    });
  });

  describe('exportToJPEG', () => {
    it('应该以JPEG格式导出', async () => {
      await exportToJPEG(mockElement, 'test-jpeg');

      expect(createElementSpy).toHaveBeenCalled();
    });

    it('应该支持质量参数', async () => {
      await exportToJPEG(mockElement, 'test-jpeg', 2, 0.9);

      expect(createElementSpy).toHaveBeenCalled();
    });
  });

  describe('错误处理', () => {
    it('应该处理导出失败的情况', async () => {
      const html2canvas = await import('html2canvas');
      vi.mocked(html2canvas.default).mockRejectedValueOnce(new Error('Export failed'));

      await expect(exportToImage(mockElement, { showLoading: false }))
        .rejects.toThrow('Export failed');
    });
  });
});
