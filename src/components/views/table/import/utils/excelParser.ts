/**
 * Excel文件解析工具
 * @module ExcelParser
 */

import * as XLSX from 'xlsx';
import type { 
  ImportData, 
  ParsedRow, 
  ValidationError,
  ExcelColumnDef,
  TYPE_MAPPING,
  STATUS_MAPPING,
} from '../types/importTypes';

/**
 * Excel列定义
 */
export const EXCEL_COLUMNS: ExcelColumnDef[] = [
  {
    key: 'name',
    header: '任务名称*',
    required: true,
    description: '任务的名称',
    example: 'PTR 项目技术要求',
  },
  {
    key: 'timeline',
    header: 'Timeline',
    required: false,
    description: '所属Timeline，不填则使用默认',
    example: '项目管理',
  },
  {
    key: 'type',
    header: '类型*',
    required: true,
    description: '任务类型',
    example: '计划单元',
    values: ['计划单元', '里程碑', '关口'],
  },
  {
    key: 'owner',
    header: '负责人',
    required: false,
    description: '任务负责人',
    example: '张三',
  },
  {
    key: 'startDate',
    header: '开始日期*',
    required: true,
    description: '任务开始日期',
    example: '2026-03-01',
    format: 'YYYY-MM-DD',
  },
  {
    key: 'endDate',
    header: '结束日期',
    required: false,
    description: '任务结束日期',
    example: '2026-03-15',
    format: 'YYYY-MM-DD',
  },
  {
    key: 'progress',
    header: '进度(%)',
    required: false,
    description: '任务进度，0-100',
    example: '50',
  },
  {
    key: 'status',
    header: '状态',
    required: false,
    description: '任务状态',
    example: '进行中',
    values: ['未开始', '进行中', '已完成', '已延期', '已取消'],
  },
  {
    key: 'priority',
    header: '优先级',
    required: false,
    description: '任务优先级',
    example: 'P1',
    values: ['P0', 'P1', 'P2', 'P3'],
  },
  {
    key: 'description',
    header: '描述',
    required: false,
    description: '任务描述',
    example: '详细的任务描述',
  },
];

/**
 * 解析Excel文件
 */
export async function parseExcelFile(file: File): Promise<ParsedRow[]> {
  try {
    // 1. 读取文件
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { 
      type: 'array',
      cellDates: true,  // 自动解析日期
    });
    
    // 2. 获取第一个sheet
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      throw new Error('Excel文件中没有工作表');
    }
    
    const sheet = workbook.Sheets[sheetName];
    
    // 3. 转换为JSON
    const rawData: any[] = XLSX.utils.sheet_to_json(sheet, {
      raw: false,  // 不使用原始值
      defval: '',  // 空值默认为空字符串
    });
    
    if (rawData.length === 0) {
      throw new Error('Excel文件中没有数据');
    }
    
    // 4. 解析并校验每一行
    const parsedRows: ParsedRow[] = rawData.map((row, index) => {
      const data = parseRow(row);
      const errors = validateImportData(data);
      
      return {
        rowNumber: index + 2,  // Excel行号（跳过表头）
        data,
        errors,
        isValid: errors.filter(e => e.severity === 'error').length === 0,
      };
    });
    
    return parsedRows;
  } catch (error) {
    console.error('[ExcelParser] 解析失败:', error);
    throw new Error(`Excel解析失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 解析单行数据
 */
function parseRow(rawRow: any): ImportData {
  return {
    name: String(rawRow['任务名称*'] || '').trim(),
    timeline: String(rawRow['Timeline'] || '').trim() || undefined,
    type: mapTypeFromExcel(rawRow['类型*']),
    owner: String(rawRow['负责人'] || '').trim() || undefined,
    startDate: parseDateString(rawRow['开始日期*']),
    endDate: parseDateString(rawRow['结束日期']),
    progress: parseNumber(rawRow['进度(%)'], 0),
    status: mapStatusFromExcel(rawRow['状态']),
    priority: String(rawRow['优先级'] || 'P2').trim(),
    description: String(rawRow['描述'] || '').trim() || undefined,
  };
}

/**
 * 日期解析（支持多种格式）
 */
function parseDateString(dateStr: any): Date | null {
  if (!dateStr) return null;
  
  // 如果已经是Date对象
  if (dateStr instanceof Date) {
    return isNaN(dateStr.getTime()) ? null : dateStr;
  }
  
  const str = String(dateStr).trim();
  if (!str) return null;
  
  // 支持格式: YYYY-MM-DD, YYYY/MM/DD, YYYY.MM.DD
  const formats = [
    /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
    /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/,
    /^(\d{4})\.(\d{1,2})\.(\d{1,2})$/,
  ];
  
  for (const format of formats) {
    const match = str.match(format);
    if (match) {
      const [, year, month, day] = match;
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return isNaN(date.getTime()) ? null : date;
    }
  }
  
  // 尝试Date构造函数
  const date = new Date(str);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * 数字解析
 */
function parseNumber(value: any, defaultValue: number): number {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }
  
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
}

/**
 * 类型映射
 */
function mapTypeFromExcel(typeStr: any): 'bar' | 'milestone' | 'gateway' {
  const str = String(typeStr || '').trim();
  
  const mapping: Record<string, 'bar' | 'milestone' | 'gateway'> = {
    '计划单元': 'bar',
    '里程碑': 'milestone',
    '关口': 'gateway',
    'bar': 'bar',
    'milestone': 'milestone',
    'gateway': 'gateway',
  };
  
  return mapping[str] || 'bar';
}

/**
 * 状态映射
 */
function mapStatusFromExcel(statusStr: any): string | undefined {
  const str = String(statusStr || '').trim();
  if (!str) return undefined;
  
  const mapping: Record<string, string> = {
    '未开始': 'not-started',
    '进行中': 'in-progress',
    '已完成': 'completed',
    '已延期': 'delayed',
    '已取消': 'cancelled',
  };
  
  return mapping[str] || str;
}

/**
 * 校验导入数据
 */
function validateImportData(data: ImportData): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // 1. 必填字段校验
  if (!data.name) {
    errors.push({
      field: 'name',
      message: '任务名称不能为空',
      severity: 'error',
    });
  }
  
  if (!data.type) {
    errors.push({
      field: 'type',
      message: '类型不能为空',
      severity: 'error',
    });
  }
  
  if (!data.startDate) {
    errors.push({
      field: 'startDate',
      message: '开始日期不能为空',
      severity: 'error',
    });
  }
  
  // 2. 格式校验
  if (data.name && data.name.length > 100) {
    errors.push({
      field: 'name',
      message: '名称不能超过100个字符',
      severity: 'error',
    });
  }
  
  if (data.progress !== undefined && (data.progress < 0 || data.progress > 100)) {
    errors.push({
      field: 'progress',
      message: '进度必须在0-100之间',
      severity: 'error',
    });
  }
  
  // 3. 枚举值校验
  const validTypes = ['bar', 'milestone', 'gateway'];
  if (data.type && !validTypes.includes(data.type)) {
    errors.push({
      field: 'type',
      message: `类型必须是: ${validTypes.join('/')}`,
      severity: 'error',
    });
  }
  
  const validPriorities = ['P0', 'P1', 'P2', 'P3'];
  if (data.priority && !validPriorities.includes(data.priority)) {
    errors.push({
      field: 'priority',
      message: `优先级必须是: ${validPriorities.join('/')}`,
      severity: 'warning',
    });
  }
  
  // 4. 业务逻辑校验
  if (data.startDate && data.endDate && data.endDate < data.startDate) {
    errors.push({
      field: 'endDate',
      message: '结束日期不能早于开始日期',
      severity: 'error',
    });
  }
  
  return errors;
}

/**
 * 生成Excel模板
 */
export function generateExcelTemplate(): void {
  // 创建示例数据
  const templateData = [
    {
      '任务名称*': '示例任务1',
      'Timeline': '项目管理',
      '类型*': '计划单元',
      '负责人': '张三',
      '开始日期*': '2026-03-01',
      '结束日期': '2026-03-15',
      '进度(%)': 0,
      '状态': '未开始',
      '优先级': 'P1',
      '描述': '这是一个示例任务',
    },
    {
      '任务名称*': '示例里程碑',
      'Timeline': '项目管理',
      '类型*': '里程碑',
      '负责人': '李四',
      '开始日期*': '2026-03-15',
      '结束日期': '',
      '进度(%)': 0,
      '状态': '未开始',
      '优先级': 'P0',
      '描述': '重要里程碑节点',
    },
  ];
  
  // 创建工作簿
  const worksheet = XLSX.utils.json_to_sheet(templateData);
  
  // 设置列宽
  worksheet['!cols'] = [
    { wch: 20 },  // 任务名称
    { wch: 15 },  // Timeline
    { wch: 12 },  // 类型
    { wch: 12 },  // 负责人
    { wch: 12 },  // 开始日期
    { wch: 12 },  // 结束日期
    { wch: 10 },  // 进度
    { wch: 12 },  // 状态
    { wch: 10 },  // 优先级
    { wch: 30 },  // 描述
  ];
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '任务列表');
  
  // 添加说明sheet
  const instructions = EXCEL_COLUMNS.map(col => ({
    '列名': col.header,
    '说明': col.description || '',
    '是否必填': col.required ? '是' : '否',
    '可选值': col.values?.join('/') || '',
    '示例': col.example || '',
    '格式': col.format || '',
  }));
  
  const instructionSheet = XLSX.utils.json_to_sheet(instructions);
  instructionSheet['!cols'] = [
    { wch: 15 },  // 列名
    { wch: 30 },  // 说明
    { wch: 10 },  // 是否必填
    { wch: 25 },  // 可选值
    { wch: 20 },  // 示例
    { wch: 15 },  // 格式
  ];
  
  XLSX.utils.book_append_sheet(workbook, instructionSheet, '使用说明');
  
  // 下载文件
  XLSX.writeFile(workbook, 'TimePlan导入模板.xlsx');
}
