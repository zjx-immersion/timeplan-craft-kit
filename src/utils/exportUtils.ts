/**
 * exportUtils - 数据导出工具
 * 
 * 🎯 功能:
 * - 导出为 Excel (.xlsx)
 * - 导出为 CSV (.csv)
 * - 支持自定义列配置
 * - 支持日期格式化
 * - 支持批量数据
 */

import * as XLSX from 'xlsx';
import { TimePlan, Timeline, Line } from '@/types/timeplanSchema';
import { format } from 'date-fns';
import { parseDateAsLocal } from './dateUtils';

export interface ExportColumn<T = any> {
  /**
   * 列标题
   */
  header: string;
  
  /**
   * 数据键或提取函数
   */
  key: keyof T | ((item: T) => any);
  
  /**
   * 格式化函数
   */
  format?: (value: any) => string;
  
  /**
   * 宽度（Excel专用）
   */
  width?: number;
}

export interface ExportOptions {
  /**
   * 文件名（不含扩展名）
   */
  filename: string;
  
  /**
   * 工作表名称
   */
  sheetName?: string;
  
  /**
   * 包含列配置
   */
  columns: ExportColumn[];
  
  /**
   * 要导出的数据
   */
  data: any[];
}

/**
 * 格式化日期
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseDateAsLocal(date) : date;
    return format(dateObj, 'yyyy-MM-dd');
  } catch (e) {
    return '';
  }
}

/**
 * 格式化百分比
 */
export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return '';
  return `${value}%`;
}

/**
 * 提取单元格值
 */
function extractValue<T>(item: T, column: ExportColumn<T>): any {
  let value: any;
  
  if (typeof column.key === 'function') {
    value = column.key(item);
  } else {
    value = item[column.key as keyof T];
  }
  
  if (column.format) {
    return column.format(value);
  }
  
  return value ?? '';
}

/**
 * 导出为 Excel
 */
export function exportToExcel(options: ExportOptions): void {
  const { filename, sheetName = 'Sheet1', columns, data } = options;
  
  // 创建表头
  const headers = columns.map(col => col.header);
  
  // 创建数据行
  const rows = data.map(item => {
    return columns.map(col => extractValue(item, col));
  });
  
  // 组合表头和数据
  const sheetData = [headers, ...rows];
  
  // 创建工作表
  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  
  // 设置列宽
  worksheet['!cols'] = columns.map(col => ({
    wch: col.width || 15,
  }));
  
  // 创建工作簿
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  // 导出文件
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

/**
 * 导出为 CSV
 */
export function exportToCSV(options: ExportOptions): void {
  const { filename, columns, data } = options;
  
  // 创建表头
  const headers = columns.map(col => col.header);
  
  // 创建数据行
  const rows = data.map(item => {
    return columns.map(col => {
      const value = extractValue(item, col);
      // CSV 需要处理逗号和引号
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
  });
  
  // 组合表头和数据
  const csvContent = [headers, ...rows]
    .map(row => row.join(','))
    .join('\n');
  
  // 添加 BOM 以支持中文
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // 创建下载链接
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 预定义的列配置 - Timeline
 */
export const TimelineColumns: ExportColumn<Timeline>[] = [
  { header: 'ID', key: 'id', width: 15 },
  { header: '名称', key: 'name', width: 25 },
  { header: '产品线', key: 'productLine', width: 15 },
  { header: '负责人', key: 'owner', width: 15 },
  { header: '团队', key: 'team', width: 15 },
  { header: '颜色', key: 'color', width: 10 },
  { 
    header: '展开状态', 
    key: (item) => item.expanded ? '展开' : '收起',
    width: 10 
  },
  { 
    header: '顺序', 
    key: 'order',
    width: 10 
  },
];

/**
 * 预定义的列配置 - Line (任务/里程碑/网关)
 */
export const LineColumns: ExportColumn<Line>[] = [
  { header: 'ID', key: 'id', width: 15 },
  { header: 'Timeline ID', key: 'timelineId', width: 15 },
  { 
    header: '类型', 
    key: (item: Line) => {
      switch (item.type) {
        case 'lineplan': return '任务';
        case 'milestone': return '里程碑';
        case 'gateway': return '网关';
        default: return item.type;
      }
    },
    width: 10 
  },
  { header: '名称', key: 'name', width: 25 },
  { 
    header: '开始日期', 
    key: 'startDate',
    format: formatDate,
    width: 12 
  },
  { 
    header: '结束日期', 
    key: 'endDate',
    format: formatDate,
    width: 12 
  },
  { 
    header: '进度', 
    key: 'progress',
    format: formatPercent,
    width: 10 
  },
  { header: '负责人', key: 'assignee', width: 15 },
  { header: '状态', key: 'status', width: 10 },
  { header: '优先级', key: 'priority', width: 10 },
  { header: '备注', key: 'notes', width: 30 },
];

/**
 * 导出 TimePlan 为 Excel（多工作表）
 */
export function exportTimePlanToExcel(
  timePlan: TimePlan,
  filename: string = '时间规划'
): void {
  const workbook = XLSX.utils.book_new();
  
  // 工作表1: Timelines
  const timelinesHeaders = TimelineColumns.map(col => col.header);
  const timelinesRows = timePlan.timelines.map(timeline => {
    return TimelineColumns.map(col => extractValue(timeline, col));
  });
  const timelinesSheet = XLSX.utils.aoa_to_sheet([timelinesHeaders, ...timelinesRows]);
  timelinesSheet['!cols'] = TimelineColumns.map(col => ({ wch: col.width || 15 }));
  XLSX.utils.book_append_sheet(workbook, timelinesSheet, 'Timelines');
  
  // 工作表2: Lines
  const linesHeaders = LineColumns.map(col => col.header);
  const linesRows = timePlan.lines.map(line => {
    return LineColumns.map(col => extractValue(line, col));
  });
  const linesSheet = XLSX.utils.aoa_to_sheet([linesHeaders, ...linesRows]);
  linesSheet['!cols'] = LineColumns.map(col => ({ wch: col.width || 15 }));
  XLSX.utils.book_append_sheet(workbook, linesSheet, 'Lines');
  
  // 工作表3: 关系
  if (timePlan.relations && timePlan.relations.length > 0) {
    const relationsHeaders = ['ID', '源节点', '目标节点', '类型'];
    const relationsRows = timePlan.relations.map(relation => [
      relation.id,
      relation.fromLineId,
      relation.toLineId,
      relation.type,
    ]);
    const relationsSheet = XLSX.utils.aoa_to_sheet([relationsHeaders, ...relationsRows]);
    relationsSheet['!cols'] = [
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 10 },
    ];
    XLSX.utils.book_append_sheet(workbook, relationsSheet, 'Relations');
  }
  
  // 导出文件
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

/**
 * 导出 TimePlan 为 CSV（仅 Lines）
 */
export function exportTimePlanToCSV(
  timePlan: TimePlan,
  filename: string = '时间规划'
): void {
  exportToCSV({
    filename,
    columns: LineColumns,
    data: timePlan.lines,
  });
}

/**
 * 导出选中的 Lines 为 Excel
 */
export function exportSelectedLinesToExcel(
  lines: Line[],
  filename: string = '选中任务'
): void {
  exportToExcel({
    filename,
    sheetName: 'Selected Lines',
    columns: LineColumns,
    data: lines,
  });
}

/**
 * 导出选中的 Lines 为 CSV
 */
export function exportSelectedLinesToCSV(
  lines: Line[],
  filename: string = '选中任务'
): void {
  exportToCSV({
    filename,
    columns: LineColumns,
    data: lines,
  });
}
