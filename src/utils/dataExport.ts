/**
 * 数据导出工具
 * 
 * 支持导出为 JSON, CSV, Excel 格式
 * 
 * @version 1.0.0
 * @date 2026-02-03
 */

import { TimePlan } from '@/types/timeplanSchema';
import { format } from 'date-fns';

/**
 * 导出为 JSON 格式
 */
export function exportToJSON(plan: TimePlan): string {
  return JSON.stringify(plan, null, 2);
}

/**
 * 下载 JSON 文件
 */
export function downloadJSON(plan: TimePlan, filename?: string) {
  const json = exportToJSON(plan);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `${plan.title}-${format(new Date(), 'yyyy-MM-dd')}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 导出为 CSV 格式（增强版，包含更多字段）
 */
export function exportToCSV(plan: TimePlan): string {
  const rows: string[][] = [
    // Header - 添加更多字段
    [
      'Timeline', 
      'Timeline Owner',
      'Line ID', 
      'Label', 
      'Schema', 
      'Start Date', 
      'End Date', 
      'Status', 
      'Priority',
      'Description',
      'Notes',
      'Color',
      'Created At',
      'Updated At',
    ],
  ];

  // Data rows
  plan.timelines.forEach((timeline) => {
    const lines = plan.lines.filter(line => line.timelineId === timeline.id);
    lines.forEach((line) => {
      rows.push([
        timeline.name,
        timeline.owner || '',
        line.id,
        line.label,
        line.schemaId,
        format(line.startDate, 'yyyy-MM-dd'),
        line.endDate ? format(line.endDate, 'yyyy-MM-dd') : '',
        line.attributes?.status as string || '',
        line.attributes?.priority as string || '',
        line.attributes?.description as string || '',
        line.notes || '',
        line.attributes?.color as string || '',
        line.createdAt ? format(new Date(line.createdAt), 'yyyy-MM-dd HH:mm:ss') : '',
        line.updatedAt ? format(new Date(line.updatedAt), 'yyyy-MM-dd HH:mm:ss') : '',
      ]);
    });
  });

  // Convert to CSV
  return rows.map(row => 
    row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  ).join('\n');
}

/**
 * 下载 CSV 文件
 */
export function downloadCSV(plan: TimePlan, filename?: string) {
  const csv = exportToCSV(plan);
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }); // \uFEFF for UTF-8 BOM
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `${plan.title}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 导出为 Excel 格式（TSV 格式，Excel 可以直接打开）
 */
export function exportToExcel(plan: TimePlan): string {
  const rows: string[][] = [
    // Header
    [
      'Timeline', 
      'Timeline Owner',
      'Line ID', 
      'Label', 
      'Schema', 
      'Start Date', 
      'End Date', 
      'Status', 
      'Priority',
      'Description',
      'Notes',
      'Color',
      'Created At',
      'Updated At',
    ],
  ];

  // Data rows
  plan.timelines.forEach((timeline) => {
    const lines = plan.lines.filter(line => line.timelineId === timeline.id);
    lines.forEach((line) => {
      rows.push([
        timeline.name,
        timeline.owner || '',
        line.id,
        line.label,
        line.schemaId,
        format(line.startDate, 'yyyy-MM-dd'),
        line.endDate ? format(line.endDate, 'yyyy-MM-dd') : '',
        line.attributes?.status as string || '',
        line.attributes?.priority as string || '',
        line.attributes?.description as string || '',
        line.notes || '',
        line.attributes?.color as string || '',
        line.createdAt ? format(new Date(line.createdAt), 'yyyy-MM-dd HH:mm:ss') : '',
        line.updatedAt ? format(new Date(line.updatedAt), 'yyyy-MM-dd HH:mm:ss') : '',
      ]);
    });
  });

  // Convert to TSV (Tab-separated values)
  return rows.map(row => row.join('\t')).join('\n');
}

/**
 * 下载 Excel 文件
 */
export function downloadExcel(plan: TimePlan, filename?: string) {
  const tsv = exportToExcel(plan);
  const blob = new Blob(['\uFEFF' + tsv], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `${plan.title}-${format(new Date(), 'yyyy-MM-dd')}.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 导出所有计划为 JSON
 */
export function exportAllPlansToJSON(plans: TimePlan[]): string {
  return JSON.stringify(plans, null, 2);
}

/**
 * 下载所有计划为 JSON
 */
export function downloadAllPlansJSON(plans: TimePlan[], filename?: string) {
  const json = exportAllPlansToJSON(plans);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `all-plans-${format(new Date(), 'yyyy-MM-dd')}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
