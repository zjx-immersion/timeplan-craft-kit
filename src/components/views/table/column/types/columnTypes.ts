/**
 * 列配置相关类型定义
 * @module ColumnTypes
 */

/**
 * 列配置接口
 */
export interface ColumnConfig {
  key: string;                    // 列唯一标识
  label: string;                  // 列显示名称
  dataIndex: string;              // 数据字段名
  visible: boolean;               // 是否显示
  width?: number;                 // 列宽（像素）
  minWidth?: number;              // 最小宽度
  maxWidth?: number;              // 最大宽度
  fixed?: 'left' | 'right';       // 固定列
  order: number;                  // 显示顺序
  sortable: boolean;              // 是否可排序
  filterable: boolean;            // 是否可筛选
  editable: boolean;              // 是否可编辑
  resizable: boolean;             // 是否可调整宽度
}

/**
 * 预设方案接口
 */
export interface TableViewPreset {
  id: string;
  name: string;                   // 方案名称
  description?: string;           // 方案描述
  columns: ColumnConfig[];        // 列配置
  isDefault?: boolean;            // 是否默认
  isSystem?: boolean;             // 是否系统预设
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 默认列配置
 */
export const DEFAULT_COLUMNS: ColumnConfig[] = [
  {
    key: 'timeline',
    label: 'Timeline',
    dataIndex: 'timelineName',
    visible: true,
    width: 150,
    fixed: 'left',
    order: 1,
    sortable: true,
    filterable: true,
    editable: false,
    resizable: true,
  },
  {
    key: 'name',
    label: '任务名称',
    dataIndex: 'label',
    visible: true,
    width: 250,
    fixed: 'left',
    order: 2,
    sortable: true,
    filterable: true,
    editable: true,
    resizable: true,
  },
  {
    key: 'type',
    label: '类型',
    dataIndex: 'type',
    visible: true,
    width: 100,
    order: 3,
    sortable: true,
    filterable: true,
    editable: false,
    resizable: true,
  },
  {
    key: 'owner',
    label: '负责人',
    dataIndex: 'owner',
    visible: true,
    width: 120,
    order: 4,
    sortable: true,
    filterable: true,
    editable: true,
    resizable: true,
  },
  {
    key: 'startDate',
    label: '开始日期',
    dataIndex: 'startDate',
    visible: true,
    width: 120,
    order: 5,
    sortable: true,
    filterable: false,
    editable: true,
    resizable: true,
  },
  {
    key: 'endDate',
    label: '结束日期',
    dataIndex: 'endDate',
    visible: true,
    width: 120,
    order: 6,
    sortable: true,
    filterable: false,
    editable: true,
    resizable: true,
  },
  {
    key: 'duration',
    label: '时长（天）',
    dataIndex: 'duration',
    visible: false,
    width: 100,
    order: 7,
    sortable: true,
    filterable: false,
    editable: false,
    resizable: true,
  },
  {
    key: 'progress',
    label: '进度',
    dataIndex: 'progress',
    visible: true,
    width: 120,
    order: 8,
    sortable: true,
    filterable: false,
    editable: true,
    resizable: true,
  },
  {
    key: 'status',
    label: '状态',
    dataIndex: 'status',
    visible: true,
    width: 100,
    order: 9,
    sortable: true,
    filterable: true,
    editable: true,
    resizable: true,
  },
  {
    key: 'priority',
    label: '优先级',
    dataIndex: 'priority',
    visible: false,
    width: 80,
    order: 10,
    sortable: true,
    filterable: true,
    editable: true,
    resizable: true,
  },
  {
    key: 'tags',
    label: '标签',
    dataIndex: 'tags',
    visible: false,
    width: 150,
    order: 11,
    sortable: false,
    filterable: true,
    editable: false,
    resizable: true,
  },
  {
    key: 'description',
    label: '描述',
    dataIndex: 'description',
    visible: false,
    width: 200,
    order: 12,
    sortable: false,
    filterable: false,
    editable: true,
    resizable: true,
  },
];

/**
 * 系统预设方案
 */
export const SYSTEM_PRESETS: TableViewPreset[] = [
  {
    id: 'default',
    name: '默认视图',
    description: '显示常用的核心字段',
    columns: DEFAULT_COLUMNS.filter(c => c.visible),
    isDefault: true,
    isSystem: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'simple',
    name: '简洁视图',
    description: '只显示最核心的字段',
    columns: DEFAULT_COLUMNS.map(c => ({
      ...c,
      visible: ['name', 'owner', 'startDate', 'endDate', 'status'].includes(c.key),
    })),
    isSystem: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'detailed',
    name: '详细视图',
    description: '显示所有可用字段',
    columns: DEFAULT_COLUMNS.map(c => ({
      ...c,
      visible: true,
    })),
    isSystem: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'planning',
    name: '计划视图',
    description: '适合项目计划管理',
    columns: DEFAULT_COLUMNS.map(c => ({
      ...c,
      visible: ['timeline', 'name', 'type', 'owner', 'startDate', 'endDate', 'duration', 'priority'].includes(c.key),
    })),
    isSystem: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'tracking',
    name: '跟踪视图',
    description: '适合任务进度跟踪',
    columns: DEFAULT_COLUMNS.map(c => ({
      ...c,
      visible: ['name', 'owner', 'startDate', 'endDate', 'progress', 'status'].includes(c.key),
    })),
    isSystem: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

/**
 * 存储键
 */
export const STORAGE_KEYS = {
  PRESETS: 'table-view-presets',
  CURRENT_PRESET: 'table-view-current-preset',
  COLUMN_WIDTHS: 'table-view-column-widths',
};
