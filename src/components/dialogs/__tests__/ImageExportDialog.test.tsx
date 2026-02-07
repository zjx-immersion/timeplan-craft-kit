/**
 * ImageExportDialog 组件单元测试
 * 
 * 测试图片导出对话框的核心功能：
 * - 对话框打开和关闭
 * - 格式选择（PNG/JPEG）
 * - 分辨率选择（1x/2x/3x）
 * - 文件名输入
 * - JPEG质量调整
 * - 导出功能调用
 * 
 * @version 1.0.0
 * @date 2026-02-07
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ImageExportDialog } from '../ImageExportDialog';
import { exportToImage } from '@/utils/imageExport';

// Mock imageExport工具
vi.mock('@/utils/imageExport', () => ({
  exportToImage: vi.fn().mockResolvedValue(undefined),
}));

describe('ImageExportDialog', () => {
  const mockTargetElement = document.createElement('div');
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('对话框打开和关闭', () => {
    it('应该在open=true时显示对话框', () => {
      render(
        <ImageExportDialog
          open={true}
          onClose={mockOnClose}
          targetElement={mockTargetElement}
        />
      );

      expect(screen.getByText('导出为图片')).toBeInTheDocument();
    });

    it('应该在open=false时不显示对话框', () => {
      render(
        <ImageExportDialog
          open={false}
          onClose={mockOnClose}
          targetElement={mockTargetElement}
        />
      );

      expect(screen.queryByText('导出为图片')).not.toBeInTheDocument();
    });
  });

  describe('表单字段', () => {
    it('应该显示文件名输入框', () => {
      render(
        <ImageExportDialog
          open={true}
          onClose={mockOnClose}
          targetElement={mockTargetElement}
        />
      );

      expect(screen.getByLabelText('文件名')).toBeInTheDocument();
    });

    it('应该显示格式选择器', () => {
      render(
        <ImageExportDialog
          open={true}
          onClose={mockOnClose}
          targetElement={mockTargetElement}
        />
      );

      expect(screen.getByText('导出格式')).toBeInTheDocument();
    });

    it('应该显示分辨率选择器', () => {
      render(
        <ImageExportDialog
          open={true}
          onClose={mockOnClose}
          targetElement={mockTargetElement}
        />
      );

      expect(screen.getByText('分辨率')).toBeInTheDocument();
    });

    it('应该使用默认文件名', () => {
      render(
        <ImageExportDialog
          open={true}
          onClose={mockOnClose}
          targetElement={mockTargetElement}
          defaultFilename="test-export"
        />
      );

      const filenameInput = screen.getByDisplayValue('test-export');
      expect(filenameInput).toBeInTheDocument();
    });
  });

  describe('格式选择', () => {
    it('应该在选择JPEG时显示质量滑块', async () => {
      render(
        <ImageExportDialog
          open={true}
          onClose={mockOnClose}
          targetElement={mockTargetElement}
        />
      );

      // 选择JPEG格式
      const formatSelect = screen.getByText('导出格式').closest('.ant-form-item')?.querySelector('select');
      if (formatSelect) {
        fireEvent.change(formatSelect, { target: { value: 'jpeg' } });
      }

      await waitFor(() => {
        expect(screen.getByText('图片质量')).toBeInTheDocument();
      });
    });

    it('应该在选择PNG时隐藏质量滑块', () => {
      render(
        <ImageExportDialog
          open={true}
          onClose={mockOnClose}
          targetElement={mockTargetElement}
        />
      );

      // PNG格式不应该显示质量滑块
      expect(screen.queryByText('图片质量')).not.toBeInTheDocument();
    });
  });

  describe('导出功能', () => {
    it('应该在点击导出时调用exportToImage', async () => {
      render(
        <ImageExportDialog
          open={true}
          onClose={mockOnClose}
          targetElement={mockTargetElement}
        />
      );

      const exportButton = screen.getByText('导出');
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(exportToImage).toHaveBeenCalled();
      });
    });

    it('应该传递正确的参数给exportToImage', async () => {
      render(
        <ImageExportDialog
          open={true}
          onClose={mockOnClose}
          targetElement={mockTargetElement}
          defaultFilename="test-export"
        />
      );

      const exportButton = screen.getByText('导出');
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(exportToImage).toHaveBeenCalledWith(
          mockTargetElement,
          expect.objectContaining({
            format: expect.any(String),
            scale: expect.any(Number),
            filename: expect.stringContaining('test-export'),
          })
        );
      });
    });

    it('应该在导出成功后调用onClose', async () => {
      render(
        <ImageExportDialog
          open={true}
          onClose={mockOnClose}
          targetElement={mockTargetElement}
        />
      );

      const exportButton = screen.getByText('导出');
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });
  });

  describe('取消功能', () => {
    it('应该在点击取消时调用onClose', () => {
      render(
        <ImageExportDialog
          open={true}
          onClose={mockOnClose}
          targetElement={mockTargetElement}
        />
      );

      const cancelButton = screen.getByText('取消');
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('应该在取消时不调用exportToImage', () => {
      render(
        <ImageExportDialog
          open={true}
          onClose={mockOnClose}
          targetElement={mockTargetElement}
        />
      );

      const cancelButton = screen.getByText('取消');
      fireEvent.click(cancelButton);

      expect(exportToImage).not.toHaveBeenCalled();
    });
  });

  describe('targetElement处理', () => {
    it('应该在targetElement为null时安全处理', () => {
      render(
        <ImageExportDialog
          open={true}
          onClose={mockOnClose}
          targetElement={null}
        />
      );

      // 不应该崩溃
      expect(screen.getByText('导出为图片')).toBeInTheDocument();
    });

    it('应该在targetElement为undefined时安全处理', () => {
      render(
        <ImageExportDialog
          open={true}
          onClose={mockOnClose}
          targetElement={undefined}
        />
      );

      // 不应该崩溃
      expect(screen.getByText('导出为图片')).toBeInTheDocument();
    });
  });
});
