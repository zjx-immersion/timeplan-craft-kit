/**
 * 矩阵数据Excel导出器
 * 
 * 支持导出：
 * - 矩阵视图数据（Timeline × TimeNode）
 * - 任务列表
 * - 里程碑/门禁详情
 * 
 * @version 1.0.0
 */

import * as XLSX from 'xlsx';
import type { TimePlan, Line, Timeline } from '@/types/timeplanSchema';
import type { MatrixDataV3 } from '@/utils/matrix-v3';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

/**
 * 导出配置
 */
export interface ExportOptions {
  /** 导出文件名（不含扩展名） */
  filename?: string;
  /** 是否包含任务列表 */
  includeTasks?: boolean;
  /** 是否包含里程碑详情 */
  includeMilestones?: boolean;
  /** 是否包含门禁详情 */
  includeGateways?: boolean;
}

/**
 * 默认配置
 */
const DEFAULT_OPTIONS: Required<ExportOptions> = {
  filename: 'TimePlan矩阵导出',
  includeTasks: true,
  includeMilestones: true,
  includeGateways: true,
};

/**
 * 格式化日期
 */
function formatDate(date: Date | string | undefined): string {
  if (!date) return '-';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return format(d, 'yyyy-MM-dd', { locale: zhCN });
  } catch {
    return '-';
  }
}

/**
 * 导出矩阵视图数据
 */
function exportMatrixSheet(matrixData: MatrixDataV3, workbook: XLSX.WorkBook) {
  const headers = ['产品线', '负责人', ...matrixData.timeNodes.map(node => node.label)];
  
  const rows = matrixData.timelines.map(timeline => {
    const row: any[] = [
      timeline.name,
      timeline.owner || '-',
    ];
    
    // 为每个时间节点添加单元格数据
    matrixData.timeNodes.forEach(node => {
      const cellKey = `${timeline.id}-${node.id}`;
      const cell = matrixData.cells.get(cellKey);
      
      if (!cell || cell.lines.length === 0) {
        row.push('-');
      } else {
        // 根据时间节点类型显示不同内容
        if (node.type === 'milestone' && cell.milestoneContent) {
          const content = cell.milestoneContent;
          row.push(
            `SSTS: ${content.sstsCount}\n` +
            `版本: ${content.deliverableVersion || '-'}\n` +
            `交付物: ${content.deliverableCount}`
          );
        } else if (node.type === 'gateway' && cell.gatewayContent) {
          const content = cell.gatewayContent;
          row.push(
            `检查项: ${content.checkItemCount}\n` +
            `已通过: ${content.passedCount}\n` +
            `完成率: ${Math.round(content.completionRate * 100)}%`
          );
        } else {
          row.push(`${cell.lines.length}个任务`);
        }
      }
    });
    
    return row;
  });
  
  const data = [headers, ...rows];
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  
  // 设置列宽
  const colWidths = [
    { wch: 20 }, // 产品线
    { wch: 12 }, // 负责人
    ...matrixData.timeNodes.map(() => ({ wch: 18 })), // 时间节点列
  ];
  worksheet['!cols'] = colWidths;
  
  XLSX.utils.book_append_sheet(workbook, worksheet, '矩阵视图');
}

/**
 * 导出任务列表
 */
function exportTasksSheet(plan: TimePlan, workbook: XLSX.WorkBook) {
  const headers = [
    '任务ID',
    '任务名称',
    '产品线',
    '开始日期',
    '结束日期',
    '负责人',
    '优先级',
    '状态',
    '工作量',
    '描述',
  ];
  
  const rows = plan.lines.map(line => {
    const timeline = plan.timelines.find(t => t.id === line.timelineId);
    
    return [
      line.id,
      line.name || line.label || '-',
      timeline?.name || '-',
      formatDate(line.startDate),
      formatDate(line.endDate),
      line.attributes?.owner || '-',
      line.attributes?.priority || '-',
      line.attributes?.status || '-',
      line.attributes?.effort ? `${line.attributes.effort}人/天` : '-',
      line.description || '-',
    ];
  });
  
  const data = [headers, ...rows];
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  
  // 设置列宽
  worksheet['!cols'] = [
    { wch: 15 }, // 任务ID
    { wch: 25 }, // 任务名称
    { wch: 15 }, // 产品线
    { wch: 12 }, // 开始日期
    { wch: 12 }, // 结束日期
    { wch: 10 }, // 负责人
    { wch: 8 },  // 优先级
    { wch: 10 }, // 状态
    { wch: 12 }, // 工作量
    { wch: 30 }, // 描述
  ];
  
  XLSX.utils.book_append_sheet(workbook, worksheet, '任务列表');
}

/**
 * 导出里程碑详情
 */
function exportMilestonesSheet(plan: TimePlan, workbook: XLSX.WorkBook) {
  const milestones = plan.lines.filter(line =>
    line.schemaId?.includes('milestone') || line.type === 'milestone'
  );
  
  if (milestones.length === 0) {
    return;
  }
  
  const headers = [
    '里程碑ID',
    '里程碑名称',
    '产品线',
    '日期',
    '负责人',
    '描述',
    '交付物',
  ];
  
  const rows = milestones.map(milestone => {
    const timeline = plan.timelines.find(t => t.id === milestone.timelineId);
    
    return [
      milestone.id,
      milestone.name || milestone.label || '-',
      timeline?.name || '-',
      formatDate(milestone.startDate),
      milestone.attributes?.owner || '-',
      milestone.description || '-',
      milestone.attributes?.deliverable || '-',
    ];
  });
  
  const data = [headers, ...rows];
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  
  // 设置列宽
  worksheet['!cols'] = [
    { wch: 15 },
    { wch: 25 },
    { wch: 15 },
    { wch: 12 },
    { wch: 10 },
    { wch: 30 },
    { wch: 25 },
  ];
  
  XLSX.utils.book_append_sheet(workbook, worksheet, '里程碑');
}

/**
 * 导出门禁详情
 */
function exportGatewaysSheet(plan: TimePlan, workbook: XLSX.WorkBook) {
  const gateways = plan.lines.filter(line =>
    line.schemaId?.includes('gateway') || line.type === 'gateway'
  );
  
  if (gateways.length === 0) {
    return;
  }
  
  const headers = [
    '门禁ID',
    '门禁名称',
    '产品线',
    '日期',
    '负责人',
    '状态',
    '描述',
  ];
  
  const rows = gateways.map(gateway => {
    const timeline = plan.timelines.find(t => t.id === gateway.timelineId);
    
    return [
      gateway.id,
      gateway.name || gateway.label || '-',
      timeline?.name || '-',
      formatDate(gateway.startDate),
      gateway.attributes?.owner || '-',
      gateway.attributes?.status || '待审核',
      gateway.description || '-',
    ];
  });
  
  const data = [headers, ...rows];
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  
  // 设置列宽
  worksheet['!cols'] = [
    { wch: 15 },
    { wch: 25 },
    { wch: 15 },
    { wch: 12 },
    { wch: 10 },
    { wch: 10 },
    { wch: 30 },
  ];
  
  XLSX.utils.book_append_sheet(workbook, worksheet, '门禁');
}

/**
 * 导出矩阵数据到Excel
 * 
 * @param matrixData - 矩阵数据
 * @param plan - TimePlan数据
 * @param options - 导出配置
 * 
 * @example
 * ```typescript
 * exportMatrixToExcel(matrixData, plan, {
 *   filename: '产品计划-2026',
 *   includeTasks: true,
 *   includeMilestones: true,
 * });
 * ```
 */
export async function exportMatrixToExcel(
  matrixData: MatrixDataV3,
  plan: TimePlan,
  options: ExportOptions = {}
): Promise<void> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // 创建工作簿
  const workbook = XLSX.utils.book_new();
  
  // 添加矩阵视图
  exportMatrixSheet(matrixData, workbook);
  
  // 添加任务列表
  if (opts.includeTasks) {
    exportTasksSheet(plan, workbook);
  }
  
  // 添加里程碑详情
  if (opts.includeMilestones) {
    exportMilestonesSheet(plan, workbook);
  }
  
  // 添加门禁详情
  if (opts.includeGateways) {
    exportGatewaysSheet(plan, workbook);
  }
  
  // 生成文件名
  const timestamp = format(new Date(), 'yyyyMMdd-HHmmss');
  const filename = `${opts.filename}_${timestamp}.xlsx`;
  
  // 导出文件
  XLSX.writeFile(workbook, filename);
  
  console.log(`[MatrixExporter] Excel文件已导出: ${filename}`);
}

/**
 * 导出任务列表到Excel
 * 
 * @param lines - 任务列表
 * @param timelines - 产品线列表
 * @param filename - 文件名（不含扩展名）
 */
export async function exportTasksToExcel(
  lines: Line[],
  timelines: Timeline[],
  filename = '任务列表'
): Promise<void> {
  const workbook = XLSX.utils.book_new();
  
  const headers = [
    '任务ID',
    '任务名称',
    '产品线',
    '开始日期',
    '结束日期',
    '负责人',
    '优先级',
    '状态',
    '工作量',
    '描述',
  ];
  
  const rows = lines.map(line => {
    const timeline = timelines.find(t => t.id === line.timelineId);
    
    return [
      line.id,
      line.name || line.label || '-',
      timeline?.name || '-',
      formatDate(line.startDate),
      formatDate(line.endDate),
      line.attributes?.owner || '-',
      line.attributes?.priority || '-',
      line.attributes?.status || '-',
      line.attributes?.effort ? `${line.attributes.effort}人/天` : '-',
      line.description || '-',
    ];
  });
  
  const data = [headers, ...rows];
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  
  // 设置列宽
  worksheet['!cols'] = [
    { wch: 15 },
    { wch: 25 },
    { wch: 15 },
    { wch: 12 },
    { wch: 12 },
    { wch: 10 },
    { wch: 8 },
    { wch: 10 },
    { wch: 12 },
    { wch: 30 },
  ];
  
  XLSX.utils.book_append_sheet(workbook, worksheet, '任务列表');
  
  // 生成文件名
  const timestamp = format(new Date(), 'yyyyMMdd-HHmmss');
  const fullFilename = `${filename}_${timestamp}.xlsx`;
  
  // 导出文件
  XLSX.writeFile(workbook, fullFilename);
  
  console.log(`[MatrixExporter] Excel文件已导出: ${fullFilename}`);
}

export default {
  exportMatrixToExcel,
  exportTasksToExcel,
};
