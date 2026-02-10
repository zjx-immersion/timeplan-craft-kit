/**
 * Excel导出工具
 * @module ExcelExporter
 */

import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import type { Line, Timeline } from '@/types/timeplanSchema';

export interface ExportOptions {
  range: 'all' | 'selected' | 'filtered';
  selectedRowKeys?: string[];
  filteredData?: any[];
  columns: string[];
  includeHeader: boolean;
  dateFormat: string;
  filename: string;
}

/**
 * 导出表格数据到Excel
 */
export function exportToExcel(
  lines: Line[],
  timelines: Timeline[],
  options: ExportOptions
): void {
  try {
    // 1. 筛选数据
    let exportData = lines;
    
    if (options.range === 'selected' && options.selectedRowKeys) {
      exportData = lines.filter(line => options.selectedRowKeys!.includes(line.id));
    } else if (options.range === 'filtered' && options.filteredData) {
      const filteredIds = new Set(options.filteredData.map((d: any) => d.id));
      exportData = lines.filter(line => filteredIds.has(line.id));
    }
    
    if (exportData.length === 0) {
      throw new Error('没有可导出的数据');
    }
    
    // 2. 转换为Excel格式
    const excelData = exportData.map(line => {
      const timeline = timelines.find(t => t.id === line.timelineId);
      const row: Record<string, any> = {};
      
      // 根据选择的列进行导出
      options.columns.forEach(col => {
        switch (col) {
          case 'timeline':
            row['Timeline'] = timeline?.name || timeline?.label || '';
            break;
          case 'name':
            row['任务名称'] = line.label;
            break;
          case 'type':
            row['类型'] = getTypeLabel(line.schemaId);
            break;
          case 'owner':
            row['负责人'] = line.attributes?.owner || '';
            break;
          case 'startDate':
            row['开始日期'] = formatDate(line.startDate, options.dateFormat);
            break;
          case 'endDate':
            row['结束日期'] = line.endDate ? formatDate(line.endDate, options.dateFormat) : '';
            break;
          case 'duration':
            if (line.endDate) {
              const days = Math.ceil(
                (new Date(line.endDate).getTime() - new Date(line.startDate).getTime()) / (1000 * 60 * 60 * 24)
              );
              row['时长（天）'] = days;
            } else {
              row['时长（天）'] = '';
            }
            break;
          case 'progress':
            row['进度(%)'] = line.attributes?.progress || 0;
            break;
          case 'status':
            row['状态'] = mapStatusToExcel(line.attributes?.status);
            break;
          case 'priority':
            row['优先级'] = line.attributes?.priority || '';
            break;
          case 'description':
            row['描述'] = line.attributes?.description || '';
            break;
          case 'tags':
            row['标签'] = line.attributes?.tags?.join(', ') || '';
            break;
        }
      });
      
      return row;
    });
    
    // 3. 创建工作簿
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // 4. 设置列宽
    const colWidths = [
      { wch: 15 },  // Timeline
      { wch: 30 },  // 任务名称
      { wch: 12 },  // 类型
      { wch: 12 },  // 负责人
      { wch: 12 },  // 开始日期
      { wch: 12 },  // 结束日期
      { wch: 10 },  // 时长
      { wch: 10 },  // 进度
      { wch: 12 },  // 状态
      { wch: 10 },  // 优先级
      { wch: 30 },  // 描述
      { wch: 20 },  // 标签
    ];
    
    worksheet['!cols'] = colWidths.slice(0, Object.keys(excelData[0] || {}).length);
    
    // 5. 创建工作簿并导出
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '任务列表');
    
    // 6. 添加统计信息sheet
    const statsData = [
      { '统计项': '导出时间', '值': format(new Date(), 'yyyy-MM-dd HH:mm:ss') },
      { '统计项': '导出范围', '值': getRangeLabel(options.range) },
      { '统计项': '任务总数', '值': exportData.length },
      { '统计项': '计划单元', '值': exportData.filter(l => l.schemaId === 'lineplan-schema').length },
      { '统计项': '里程碑', '值': exportData.filter(l => l.schemaId === 'milestone-schema').length },
      { '统计项': '关口', '值': exportData.filter(l => l.schemaId === 'gateway-schema').length },
    ];
    
    const statsSheet = XLSX.utils.json_to_sheet(statsData);
    statsSheet['!cols'] = [{ wch: 15 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(workbook, statsSheet, '导出统计');
    
    // 7. 下载文件
    XLSX.writeFile(workbook, `${options.filename}.xlsx`);
    
    console.log('[ExcelExporter] 导出成功:', {
      filename: options.filename,
      rows: exportData.length,
      columns: options.columns.length,
    });
  } catch (error) {
    console.error('[ExcelExporter] 导出失败:', error);
    throw new Error(`Excel导出失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 格式化日期
 */
function formatDate(dateStr: string, dateFormat: string): string {
  try {
    return format(new Date(dateStr), dateFormat);
  } catch {
    return dateStr;
  }
}

/**
 * 获取类型标签
 */
function getTypeLabel(schemaId: string): string {
  const mapping: Record<string, string> = {
    'lineplan-schema': '计划单元',
    'bar-schema': '计划单元',
    'milestone-schema': '里程碑',
    'gateway-schema': '关口',
  };
  return mapping[schemaId] || '未知';
}

/**
 * 状态映射到Excel
 */
function mapStatusToExcel(status?: string): string {
  if (!status) return '未开始';
  
  const mapping: Record<string, string> = {
    'not-started': '未开始',
    'in-progress': '进行中',
    'completed': '已完成',
    'delayed': '已延期',
    'cancelled': '已取消',
  };
  
  return mapping[status] || status;
}

/**
 * 获取范围标签
 */
function getRangeLabel(range: string): string {
  const mapping: Record<string, string> = {
    'all': '全部数据',
    'selected': '选中行',
    'filtered': '筛选结果',
  };
  return mapping[range] || range;
}

/**
 * 导出选中行
 */
export function exportSelectedRows(
  lines: Line[],
  timelines: Timeline[],
  selectedRowKeys: string[],
  filename?: string
): void {
  const options: ExportOptions = {
    range: 'selected',
    selectedRowKeys,
    columns: ['timeline', 'name', 'type', 'owner', 'startDate', 'endDate', 'progress', 'status', 'priority'],
    includeHeader: true,
    dateFormat: 'yyyy-MM-dd',
    filename: filename || `任务列表_选中行_${format(new Date(), 'yyyyMMdd_HHmmss')}`,
  };
  
  exportToExcel(lines, timelines, options);
}
