/**
 * 图像导出器
 * 
 * 支持导出：
 * - PNG图片
 * - PDF文档
 * 
 * 使用html2canvas和jspdf实现
 * 
 * @version 1.0.0
 */

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { format } from 'date-fns';

/**
 * PNG导出配置
 */
export interface PngExportOptions {
  /** 导出文件名（不含扩展名） */
  filename?: string;
  /** 图片质量 (0-1) */
  quality?: number;
  /** 背景颜色 */
  backgroundColor?: string;
  /** 缩放比例 */
  scale?: number;
}

/**
 * PDF导出配置
 */
export interface PdfExportOptions {
  /** 导出文件名（不含扩展名） */
  filename?: string;
  /** 页面方向 */
  orientation?: 'portrait' | 'landscape';
  /** 页面格式 */
  format?: 'a4' | 'a3' | 'letter';
  /** 图片质量 */
  imageQuality?: number;
  /** 是否适应页面 */
  fitToPage?: boolean;
}

/**
 * 默认PNG配置
 */
const DEFAULT_PNG_OPTIONS: Required<PngExportOptions> = {
  filename: 'TimePlan导出',
  quality: 0.95,
  backgroundColor: '#ffffff',
  scale: 2,
};

/**
 * 默认PDF配置
 */
const DEFAULT_PDF_OPTIONS: Required<PdfExportOptions> = {
  filename: 'TimePlan导出',
  orientation: 'landscape',
  format: 'a4',
  imageQuality: 0.95,
  fitToPage: true,
};

/**
 * 捕获DOM元素为Canvas
 */
async function captureElement(
  element: HTMLElement,
  options: {
    backgroundColor?: string;
    scale?: number;
  }
): Promise<HTMLCanvasElement> {
  const { backgroundColor = '#ffffff', scale = 2 } = options;
  
  try {
    const canvas = await html2canvas(element, {
      backgroundColor,
      scale,
      useCORS: true,
      logging: false,
      allowTaint: true,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });
    
    return canvas;
  } catch (error) {
    console.error('[ImageExporter] 捕获元素失败:', error);
    throw new Error('捕获元素失败');
  }
}

/**
 * 导出元素为PNG图片
 * 
 * @param element - 要导出的DOM元素
 * @param options - 导出配置
 * 
 * @example
 * ```typescript
 * const matrixElement = document.querySelector('.matrix-view');
 * await exportToPng(matrixElement, {
 *   filename: '矩阵视图',
 *   quality: 0.95,
 *   scale: 2,
 * });
 * ```
 */
export async function exportToPng(
  element: HTMLElement,
  options: PngExportOptions = {}
): Promise<void> {
  const opts = { ...DEFAULT_PNG_OPTIONS, ...options };
  
  try {
    // 捕获元素
    const canvas = await captureElement(element, {
      backgroundColor: opts.backgroundColor,
      scale: opts.scale,
    });
    
    // 转换为Blob
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('转换为Blob失败'));
          }
        },
        'image/png',
        opts.quality
      );
    });
    
    // 生成文件名
    const timestamp = format(new Date(), 'yyyyMMdd-HHmmss');
    const filename = `${opts.filename}_${timestamp}.png`;
    
    // 下载文件
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log(`[ImageExporter] PNG文件已导出: ${filename}`);
  } catch (error) {
    console.error('[ImageExporter] PNG导出失败:', error);
    throw error;
  }
}

/**
 * 导出元素为PDF文档
 * 
 * @param element - 要导出的DOM元素
 * @param options - 导出配置
 * 
 * @example
 * ```typescript
 * const matrixElement = document.querySelector('.matrix-view');
 * await exportToPdf(matrixElement, {
 *   filename: '矩阵视图',
 *   orientation: 'landscape',
 *   format: 'a4',
 * });
 * ```
 */
export async function exportToPdf(
  element: HTMLElement,
  options: PdfExportOptions = {}
): Promise<void> {
  const opts = { ...DEFAULT_PDF_OPTIONS, ...options };
  
  try {
    // 捕获元素
    const canvas = await captureElement(element, {
      backgroundColor: '#ffffff',
      scale: 2,
    });
    
    // 获取图片数据
    const imgData = canvas.toDataURL('image/jpeg', opts.imageQuality);
    
    // 创建PDF
    const pdf = new jsPDF({
      orientation: opts.orientation,
      unit: 'mm',
      format: opts.format,
    });
    
    // 获取PDF页面尺寸
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // 计算图片尺寸
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = imgWidth / imgHeight;
    
    let finalWidth: number;
    let finalHeight: number;
    
    if (opts.fitToPage) {
      // 适应页面
      if (ratio > pageWidth / pageHeight) {
        // 宽图
        finalWidth = pageWidth;
        finalHeight = pageWidth / ratio;
      } else {
        // 高图
        finalHeight = pageHeight;
        finalWidth = pageHeight * ratio;
      }
    } else {
      // 保持原始尺寸（可能需要多页）
      finalWidth = pageWidth;
      finalHeight = pageWidth / ratio;
    }
    
    // 居中显示
    const x = (pageWidth - finalWidth) / 2;
    const y = (pageHeight - finalHeight) / 2;
    
    // 添加图片到PDF
    pdf.addImage(imgData, 'JPEG', x, y, finalWidth, finalHeight);
    
    // 生成文件名
    const timestamp = format(new Date(), 'yyyyMMdd-HHmmss');
    const filename = `${opts.filename}_${timestamp}.pdf`;
    
    // 保存PDF
    pdf.save(filename);
    
    console.log(`[ImageExporter] PDF文件已导出: ${filename}`);
  } catch (error) {
    console.error('[ImageExporter] PDF导出失败:', error);
    throw error;
  }
}

/**
 * 批量导出多个元素为单个PDF
 * 
 * @param elements - 要导出的DOM元素数组
 * @param options - 导出配置
 * 
 * @example
 * ```typescript
 * const matrixElement = document.querySelector('.matrix-view');
 * const ganttElement = document.querySelector('.gantt-view');
 * 
 * await exportMultipleToPdf([matrixElement, ganttElement], {
 *   filename: '完整计划视图',
 *   orientation: 'landscape',
 * });
 * ```
 */
export async function exportMultipleToPdf(
  elements: HTMLElement[],
  options: PdfExportOptions = {}
): Promise<void> {
  const opts = { ...DEFAULT_PDF_OPTIONS, ...options };
  
  try {
    // 创建PDF
    const pdf = new jsPDF({
      orientation: opts.orientation,
      unit: 'mm',
      format: opts.format,
    });
    
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // 逐个处理元素
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      
      // 捕获元素
      const canvas = await captureElement(element, {
        backgroundColor: '#ffffff',
        scale: 2,
      });
      
      // 获取图片数据
      const imgData = canvas.toDataURL('image/jpeg', opts.imageQuality);
      
      // 计算图片尺寸
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = imgWidth / imgHeight;
      
      let finalWidth: number;
      let finalHeight: number;
      
      if (opts.fitToPage) {
        if (ratio > pageWidth / pageHeight) {
          finalWidth = pageWidth;
          finalHeight = pageWidth / ratio;
        } else {
          finalHeight = pageHeight;
          finalWidth = pageHeight * ratio;
        }
      } else {
        finalWidth = pageWidth;
        finalHeight = pageWidth / ratio;
      }
      
      // 居中显示
      const x = (pageWidth - finalWidth) / 2;
      const y = (pageHeight - finalHeight) / 2;
      
      // 第一页不需要添加新页
      if (i > 0) {
        pdf.addPage();
      }
      
      // 添加图片
      pdf.addImage(imgData, 'JPEG', x, y, finalWidth, finalHeight);
    }
    
    // 生成文件名
    const timestamp = format(new Date(), 'yyyyMMdd-HHmmss');
    const filename = `${opts.filename}_${timestamp}.pdf`;
    
    // 保存PDF
    pdf.save(filename);
    
    console.log(`[ImageExporter] PDF文件已导出: ${filename} (${elements.length}页)`);
  } catch (error) {
    console.error('[ImageExporter] PDF批量导出失败:', error);
    throw error;
  }
}

export default {
  exportToPng,
  exportToPdf,
  exportMultipleToPdf,
};
