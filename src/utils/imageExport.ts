/**
 * 图片导出工具
 * 
 * 功能:
 * - 导出 PNG 格式
 * - 导出 JPEG 格式
 * - 支持多种分辨率（1x/2x/3x）
 * - 支持导出范围选择（当前视图/完整计划）
 * 
 * @version 1.0.0
 * @date 2026-02-07
 */

import html2canvas from 'html2canvas';
import { message } from 'antd';

/**
 * 导出格式
 */
export type ExportFormat = 'png' | 'jpeg';

/**
 * 导出分辨率
 */
export type ExportScale = 1 | 2 | 3;

/**
 * 导出选项
 */
export interface ExportImageOptions {
  /**
   * 导出格式
   * @default 'png'
   */
  format?: ExportFormat;

  /**
   * 导出分辨率（缩放倍数）
   * @default 1
   */
  scale?: ExportScale;

  /**
   * 文件名（不包含扩展名）
   * @default 'timeline-export'
   */
  filename?: string;

  /**
   * JPEG 质量（0-1）
   * @default 0.92
   */
  quality?: number;

  /**
   * 是否显示加载提示
   * @default true
   */
  showLoading?: boolean;
}

/**
 * 导出为图片
 * 
 * @param element - 要导出的DOM元素
 * @param options - 导出选项
 */
export const exportToImage = async (
  element: HTMLElement,
  options: ExportImageOptions = {}
): Promise<void> => {
  const {
    format = 'png',
    scale = 1,
    filename = 'timeplan-export',
    quality = 0.92,
    showLoading = true,
  } = options;

  let loadingKey: string | undefined;

  try {
    // 显示加载提示
    if (showLoading) {
      loadingKey = `export-loading-${Date.now()}`;
      message.loading({ content: '正在生成图片...', key: loadingKey, duration: 0 });
    }

    // 使用 html2canvas 生成画布
    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      onclone: (clonedDoc) => {
        // 在克隆的文档中隐藏不需要导出的元素
        const clonedElement = clonedDoc.body;
        
        // 隐藏工具栏按钮、快速菜单等UI控件
        const uiElements = clonedElement.querySelectorAll(
          '[data-export-hide="true"], .ant-dropdown, .ant-modal-root, .ant-message'
        );
        uiElements.forEach((el) => {
          (el as HTMLElement).style.display = 'none';
        });
      },
    });

    // 转换为 Blob
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, `image/${format}`, quality);
    });

    if (!blob) {
      throw new Error('Failed to create blob');
    }

    // 下载文件
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // 成功提示
    if (showLoading && loadingKey) {
      message.success({ content: '图片导出成功', key: loadingKey, duration: 2 });
    }
  } catch (error) {
    console.error('[imageExport] Export failed:', error);
    
    if (showLoading && loadingKey) {
      message.error({ content: '图片导出失败', key: loadingKey, duration: 2 });
    }
    
    throw error;
  }
};

/**
 * 导出为 PNG
 */
export const exportToPNG = (
  element: HTMLElement,
  filename?: string,
  scale?: ExportScale
): Promise<void> => {
  return exportToImage(element, {
    format: 'png',
    filename,
    scale,
  });
};

/**
 * 导出为 JPEG
 */
export const exportToJPEG = (
  element: HTMLElement,
  filename?: string,
  scale?: ExportScale,
  quality?: number
): Promise<void> => {
  return exportToImage(element, {
    format: 'jpeg',
    filename,
    scale,
    quality,
  });
};

/**
 * 导出时间轴（获取时间轴容器元素并导出）
 */
export const exportTimeline = async (options: ExportImageOptions = {}): Promise<void> => {
  // 查找时间轴容器
  const timelineContainer = document.querySelector('[data-timeline-container="true"]') as HTMLElement;
  
  if (!timelineContainer) {
    message.error('未找到时间轴元素');
    throw new Error('Timeline container not found');
  }

  return exportToImage(timelineContainer, options);
};
