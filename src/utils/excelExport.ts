/**
 * Excel导出工具（使用xlsx库）
 * 
 * 支持多Sheet导出，格式化和样式
 * 
 * @version 2.0.0 - Task 2.3增强
 * @date 2026-02-12
 */

import * as XLSX from 'xlsx';
import { TimePlan, Timeline, Line, Relation } from '@/types/timeplanSchema';
import { format } from 'date-fns';

/**
 * 导出TimePlan为Excel文件（多Sheet）
 */
export function exportTimePlanToExcel(plan: TimePlan, filename?: string) {
  console.log('[ExcelExport] 🚀 开始导出Excel:', {
    planName: plan.name || plan.title,
    timelines: plan.timelines.length,
    lines: plan.lines.length,
    relations: plan.relations.length,
  });

  // 创建工作簿
  const workbook = XLSX.utils.book_new();

  // Sheet 1: 项目概览
  const overviewData = createOverviewSheet(plan);
  const overviewWS = XLSX.utils.aoa_to_sheet(overviewData);
  XLSX.utils.book_append_sheet(workbook, overviewWS, '项目概览');

  // Sheet 2: Timeline列表
  const timelinesData = createTimelinesSheet(plan.timelines);
  const timelinesWS = XLSX.utils.aoa_to_sheet(timelinesData);
  XLSX.utils.book_append_sheet(workbook, timelinesWS, 'Timeline列表');

  // Sheet 3: 任务列表
  const linesData = createLinesSheet(plan);
  const linesWS = XLSX.utils.aoa_to_sheet(linesData);
  XLSX.utils.book_append_sheet(workbook, linesWS, '任务列表');

  // Sheet 4: 依赖关系
  if (plan.relations && plan.relations.length > 0) {
    const relationsData = createRelationsSheet(plan);
    const relationsWS = XLSX.utils.aoa_to_sheet(relationsData);
    XLSX.utils.book_append_sheet(workbook, relationsWS, '依赖关系');
  }

  // 生成文件名
  const finalFilename = filename || 
    `${plan.name || plan.title || 'timeplan'}_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`;

  // 导出文件
  XLSX.writeFile(workbook, finalFilename);

  console.log('[ExcelExport] ✅ Excel导出完成:', finalFilename);
}

/**
 * 创建项目概览Sheet
 */
function createOverviewSheet(plan: TimePlan): any[][] {
  const overview: any[][] = [
    ['项目概览'],
    [],
    ['项目信息', ''],
    ['项目名称', plan.name || plan.title || '未命名项目'],
    ['项目ID', plan.id],
    ['项目描述', plan.description || '无'],
    ['创建时间', plan.createdAt ? format(new Date(plan.createdAt), 'yyyy-MM-dd HH:mm:ss') : ''],
    ['更新时间', plan.updatedAt ? format(new Date(plan.updatedAt), 'yyyy-MM-dd HH:mm:ss') : ''],
    [],
    ['统计信息', ''],
    ['Timeline数量', plan.timelines.length],
    ['任务数量', plan.lines.length],
    ['依赖关系数量', plan.relations.length],
    [],
    ['导出信息', ''],
    ['导出时间', format(new Date(), 'yyyy-MM-dd HH:mm:ss')],
    ['导出工具', 'TimePlan Craft Kit v2.0'],
  ];

  return overview;
}

/**
 * 创建Timeline列表Sheet
 */
function createTimelinesSheet(timelines: Timeline[]): any[][] {
  const data: any[][] = [
    // 表头
    [
      'Timeline ID',
      'Timeline名称',
      '负责人',
      '颜色',
      '任务数量',
      '创建时间',
      '更新时间',
    ],
  ];

  // 数据行
  timelines.forEach((timeline) => {
    data.push([
      timeline.id,
      timeline.name || timeline.label,
      timeline.owner || '',
      timeline.color || '',
      timeline.lineIds?.length || 0,
      timeline.createdAt ? format(new Date(timeline.createdAt), 'yyyy-MM-dd HH:mm:ss') : '',
      timeline.updatedAt ? format(new Date(timeline.updatedAt), 'yyyy-MM-dd HH:mm:ss') : '',
    ]);
  });

  return data;
}

/**
 * 创建任务列表Sheet
 */
function createLinesSheet(plan: TimePlan): any[][] {
  const data: any[][] = [
    // 表头
    [
      'Timeline',
      '任务ID',
      '任务名称',
      '类型',
      '开始日期',
      '结束日期',
      '工期(天)',
      '状态',
      '优先级',
      '负责人',
      '进度(%)',
      '描述',
      '备注',
      '颜色',
      '创建时间',
      '更新时间',
    ],
  ];

  // 数据行
  plan.timelines.forEach((timeline) => {
    const lines = plan.lines.filter(line => line.timelineId === timeline.id);
    
    lines.forEach((line) => {
      // 计算工期
      let duration = '';
      if (line.startDate && line.endDate) {
        const start = new Date(line.startDate);
        const end = new Date(line.endDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        duration = days.toString();
      }

      data.push([
        timeline.name || timeline.label,
        line.id,
        line.label,
        getSchemaLabel(line.schemaId),
        line.startDate ? format(new Date(line.startDate), 'yyyy-MM-dd') : '',
        line.endDate ? format(new Date(line.endDate), 'yyyy-MM-dd') : '',
        duration,
        line.attributes?.status as string || '',
        line.attributes?.priority as string || '',
        line.attributes?.owner as string || '',
        line.attributes?.progress as number || 0,
        line.attributes?.description as string || '',
        line.notes || '',
        line.attributes?.color as string || '',
        line.createdAt ? format(new Date(line.createdAt), 'yyyy-MM-dd HH:mm:ss') : '',
        line.updatedAt ? format(new Date(line.updatedAt), 'yyyy-MM-dd HH:mm:ss') : '',
      ]);
    });
  });

  return data;
}

/**
 * 创建依赖关系Sheet
 */
function createRelationsSheet(plan: TimePlan): any[][] {
  const data: any[][] = [
    // 表头
    [
      '关系ID',
      '前置任务ID',
      '前置任务名称',
      '后续任务ID',
      '后续任务名称',
      '关系类型',
      '创建时间',
      '更新时间',
    ],
  ];

  // 数据行
  plan.relations.forEach((relation) => {
    const fromLine = plan.lines.find(l => l.id === relation.from);
    const toLine = plan.lines.find(l => l.id === relation.to);

    data.push([
      relation.id,
      relation.from,
      fromLine?.label || '',
      relation.to,
      toLine?.label || '',
      relation.type || 'finish-to-start',
      relation.createdAt ? format(new Date(relation.createdAt), 'yyyy-MM-dd HH:mm:ss') : '',
      relation.updatedAt ? format(new Date(relation.updatedAt), 'yyyy-MM-dd HH:mm:ss') : '',
    ]);
  });

  return data;
}

/**
 * 获取Schema类型标签
 */
function getSchemaLabel(schemaId: string): string {
  const schemaMap: Record<string, string> = {
    'lineplan-schema': '计划单元',
    'bar-schema': '计划单元',
    'milestone-schema': '里程碑',
    'gateway-schema': '关口',
  };
  return schemaMap[schemaId] || schemaId;
}

/**
 * 导出选中的任务为Excel
 */
export function exportSelectedLinesToExcel(
  plan: TimePlan,
  selectedLineIds: string[],
  filename?: string
) {
  console.log('[ExcelExport] 🚀 开始导出选中任务:', selectedLineIds.length);

  // 过滤选中的任务
  const selectedLines = plan.lines.filter(line => selectedLineIds.includes(line.id));
  
  // 创建工作簿
  const workbook = XLSX.utils.book_new();

  // Sheet 1: 元数据
  const metadata: any[][] = [
    ['导出信息'],
    [],
    ['导出时间', format(new Date(), 'yyyy-MM-dd HH:mm:ss')],
    ['项目名称', plan.name || plan.title],
    ['选中任务数', selectedLineIds.length],
    ['导出工具', 'TimePlan Craft Kit v2.0'],
  ];
  const metadataWS = XLSX.utils.aoa_to_sheet(metadata);
  XLSX.utils.book_append_sheet(workbook, metadataWS, '导出信息');

  // Sheet 2: 选中任务
  const linesData: any[][] = [
    // 表头
    [
      'Timeline',
      '任务ID',
      '任务名称',
      '类型',
      '开始日期',
      '结束日期',
      '工期(天)',
      '状态',
      '优先级',
      '负责人',
      '进度(%)',
      '描述',
      '备注',
    ],
  ];

  selectedLines.forEach((line) => {
    const timeline = plan.timelines.find(t => t.id === line.timelineId);
    
    // 计算工期
    let duration = '';
    if (line.startDate && line.endDate) {
      const start = new Date(line.startDate);
      const end = new Date(line.endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      duration = days.toString();
    }

    linesData.push([
      timeline?.name || timeline?.label || '',
      line.id,
      line.label,
      getSchemaLabel(line.schemaId),
      line.startDate ? format(new Date(line.startDate), 'yyyy-MM-dd') : '',
      line.endDate ? format(new Date(line.endDate), 'yyyy-MM-dd') : '',
      duration,
      line.attributes?.status as string || '',
      line.attributes?.priority as string || '',
      line.attributes?.owner as string || '',
      line.attributes?.progress as number || 0,
      line.attributes?.description as string || '',
      line.notes || '',
    ]);
  });

  const linesWS = XLSX.utils.aoa_to_sheet(linesData);
  XLSX.utils.book_append_sheet(workbook, linesWS, '任务列表');

  // 生成文件名
  const finalFilename = filename || 
    `selected_tasks_${selectedLineIds.length}_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`;

  // 导出文件
  XLSX.writeFile(workbook, finalFilename);

  console.log('[ExcelExport] ✅ 选中任务导出完成:', finalFilename);
}
