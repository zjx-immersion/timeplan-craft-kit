/**
 * 默认 Schema 定义
 * 
 * 📋 迁移信息:
 * - 原文件: src/schemas/defaultSchemas.ts
 * - 迁移日期: 2026-02-03
 * - 功能: 提供开箱即用的 Schema，兼容 bar/milestone/gateway 类型
 * 
 * @version 2.0.0
 */

import { LineSchema } from '@/types/timeplanSchema';

/**
 * Bar Schema - 计划单元（横条）
 * 
 * 用于表示有起止时间的计划单元
 */
export const BarSchema: LineSchema = {
  id: 'bar-schema',
  name: '计划单元',
  description: '有起止时间的计划单元（横条）',
  version: '1.0.0',
  visualType: 'bar',
  
  attributes: [
    {
      key: 'title',
      label: '名称',
      type: 'string',
      required: true,
      defaultValue: '新计划单元',
      displayInTable: true,
      displayInGantt: true,
      displayInMatrix: true,
      displayOrder: 1,
      editable: true,
      editorType: 'text',
    },
    {
      key: 'startDate',
      label: '开始日期',
      type: 'date',
      required: true,
      displayInTable: true,
      displayInGantt: true,
      displayInMatrix: true,
      displayOrder: 2,
      editable: true,
      editorType: 'date',
    },
    {
      key: 'endDate',
      label: '结束日期',
      type: 'date',
      required: true,
      displayInTable: true,
      displayInGantt: true,
      displayInMatrix: true,
      displayOrder: 3,
      editable: true,
      editorType: 'date',
      validation: [
        {
          type: 'custom',
          message: '结束日期必须晚于开始日期',
          validator: (value: any) => {
            return true;
          },
        },
      ],
    },
    {
      key: 'progress',
      label: '进度',
      type: 'number',
      required: false,
      defaultValue: 0,
      displayInTable: true,
      displayInGantt: true,
      displayInMatrix: false,
      displayOrder: 4,
      editable: true,
      editorType: 'number',
      validation: [
        {
          type: 'min',
          value: 0,
          message: '进度不能小于 0',
        },
        {
          type: 'max',
          value: 100,
          message: '进度不能大于 100',
        },
      ],
    },
    {
      key: 'status',
      label: '状态',
      type: 'enum',
      required: false,
      defaultValue: 'not-started',
      displayInTable: true,
      displayInGantt: false,
      displayInMatrix: true,
      displayOrder: 5,
      editable: true,
      editorType: 'select',
      enumOptions: [
        { value: 'not-started', label: '未开始', color: '#94a3b8' },
        { value: 'in-progress', label: '进行中', color: '#3b82f6' },
        { value: 'completed', label: '已完成', color: '#10b981' },
        { value: 'blocked', label: '已阻塞', color: '#ef4444' },
      ],
    },
    {
      key: 'priority',
      label: '优先级',
      type: 'enum',
      required: false,
      defaultValue: 'medium',
      displayInTable: true,
      displayInGantt: false,
      displayInMatrix: true,
      displayOrder: 6,
      editable: true,
      editorType: 'select',
      enumOptions: [
        { value: 'low', label: '低', color: '#94a3b8' },
        { value: 'medium', label: '中', color: '#f59e0b' },
        { value: 'high', label: '高', color: '#ef4444' },
      ],
    },
    {
      key: 'assignee',
      label: '负责人',
      type: 'string',
      required: false,
      displayInTable: true,
      displayInGantt: false,
      displayInMatrix: true,
      displayOrder: 7,
      editable: true,
      editorType: 'text',
    },
    {
      key: 'color',
      label: '颜色',
      type: 'string',
      required: false,
      displayInTable: false,
      displayInGantt: true,
      displayInMatrix: false,
      displayOrder: 99,
      editable: true,
      editorType: 'color',
    },
    {
      key: 'notes',
      label: '备注',
      type: 'string',
      required: false,
      displayInTable: false,
      displayInGantt: false,
      displayInMatrix: false,
      displayOrder: 100,
      editable: true,
      editorType: 'textarea',
    },
  ],
  
  relations: [
    {
      id: 'dependency-relation',
      name: '依赖关系',
      type: 'dependency',
      cardinality: 'n:n',
      visualize: true,
      lineStyle: 'solid',
      lineColor: '#64748b',
      lineWidth: 2,
      allowCycles: false,
    },
  ],
  
  canNest: true,
  
  displayConfig: {
    icon: '📊',
    color: '#3b82f6',
    gantt: {
      shape: 'bar',
      height: 32,
      borderStyle: 'solid',
      borderWidth: 1,
      borderRadius: 4,
      showProgress: true,
    },
    table: {
      icon: '📊',
      highlight: false,
    },
    matrix: {
      cellType: 'line',
      aggregation: 'count',
    },
    clickable: true,
    draggable: true,
    resizable: true,
    conditionalStyles: [
      {
        id: 'high-priority-style',
        condition: 'priority === "high"',
        priority: 10,
        style: {
          color: '#ef4444',
          gantt: {
            borderStyle: 'solid',
            borderWidth: 2,
          },
        },
      },
      {
        id: 'completed-style',
        condition: 'status === "completed"',
        priority: 5,
        style: {
          color: '#10b981',
          gantt: {
            borderStyle: 'solid',
          },
        },
      },
    ],
  },
};

/**
 * Milestone Schema - 里程碑
 * 
 * 用于表示重要的时间点
 */
export const MilestoneSchema: LineSchema = {
  id: 'milestone-schema',
  name: '里程碑',
  description: '重要的时间点标记',
  version: '1.0.0',
  visualType: 'milestone',
  
  attributes: [
    {
      key: 'title',
      label: '里程碑名称',
      type: 'string',
      required: true,
      defaultValue: '新里程碑',
      displayInTable: true,
      displayInGantt: true,
      displayInMatrix: true,
      displayOrder: 1,
      editable: true,
      editorType: 'text',
    },
    {
      key: 'startDate',
      label: '日期',
      type: 'date',
      required: true,
      displayInTable: true,
      displayInGantt: true,
      displayInMatrix: true,
      displayOrder: 2,
      editable: true,
      editorType: 'date',
    },
    {
      key: 'type',
      label: '类型',
      type: 'enum',
      required: false,
      defaultValue: 'delivery',
      displayInTable: true,
      displayInGantt: false,
      displayInMatrix: true,
      displayOrder: 3,
      editable: true,
      editorType: 'select',
      enumOptions: [
        { value: 'delivery', label: '交付', color: '#3b82f6', icon: '📦' },
        { value: 'review', label: '评审', color: '#f59e0b', icon: '👀' },
        { value: 'release', label: '发布', color: '#10b981', icon: '🚀' },
        { value: 'decision', label: '决策', color: '#8b5cf6', icon: '🎯' },
      ],
    },
    {
      key: 'status',
      label: '状态',
      type: 'enum',
      required: false,
      defaultValue: 'planned',
      displayInTable: true,
      displayInGantt: false,
      displayInMatrix: true,
      displayOrder: 4,
      editable: true,
      editorType: 'select',
      enumOptions: [
        { value: 'planned', label: '计划中', color: '#94a3b8' },
        { value: 'achieved', label: '已达成', color: '#10b981' },
        { value: 'missed', label: '已错过', color: '#ef4444' },
      ],
    },
    {
      key: 'color',
      label: '颜色',
      type: 'string',
      required: false,
      displayInTable: false,
      displayInGantt: true,
      displayInMatrix: false,
      displayOrder: 99,
      editable: true,
      editorType: 'color',
    },
    {
      key: 'notes',
      label: '备注',
      type: 'string',
      required: false,
      displayInTable: false,
      displayInGantt: false,
      displayInMatrix: false,
      displayOrder: 100,
      editable: true,
      editorType: 'textarea',
    },
  ],
  
  relations: [
    {
      id: 'dependency-relation',
      name: '依赖关系',
      type: 'dependency',
      cardinality: 'n:n',
      visualize: true,
      lineStyle: 'solid',
      lineColor: '#64748b',
      lineWidth: 2,
      allowCycles: false,
    },
  ],
  
  canNest: false,
  
  displayConfig: {
    icon: '💎',
    color: '#8b5cf6',
    gantt: {
      shape: 'diamond',
      height: 20,
      borderStyle: 'solid',
      borderWidth: 2,
      borderRadius: 0,
      showProgress: false,
    },
    table: {
      icon: '💎',
      highlight: true,
    },
    matrix: {
      cellType: 'milestone',
      aggregation: 'count',
    },
    clickable: true,
    draggable: true,
    resizable: false,
    conditionalStyles: [
      {
        id: 'achieved-style',
        condition: 'status === "achieved"',
        priority: 10,
        style: {
          color: '#10b981',
        },
      },
      {
        id: 'missed-style',
        condition: 'status === "missed"',
        priority: 10,
        style: {
          color: '#ef4444',
        },
      },
    ],
  },
};

/**
 * Gateway Schema - 网关
 * 
 * 用于表示关键决策点或检查点
 */
export const GatewaySchema: LineSchema = {
  id: 'gateway-schema',
  name: '网关',
  description: '关键决策点或检查点',
  version: '1.0.0',
  visualType: 'gateway',
  
  attributes: [
    {
      key: 'title',
      label: '网关名称',
      type: 'string',
      required: true,
      defaultValue: '新网关',
      displayInTable: true,
      displayInGantt: true,
      displayInMatrix: true,
      displayOrder: 1,
      editable: true,
      editorType: 'text',
    },
    {
      key: 'startDate',
      label: '日期',
      type: 'date',
      required: true,
      displayInTable: true,
      displayInGantt: true,
      displayInMatrix: true,
      displayOrder: 2,
      editable: true,
      editorType: 'date',
    },
    {
      key: 'type',
      label: '类型',
      type: 'enum',
      required: false,
      defaultValue: 'decision',
      displayInTable: true,
      displayInGantt: false,
      displayInMatrix: true,
      displayOrder: 3,
      editable: true,
      editorType: 'select',
      enumOptions: [
        { value: 'decision', label: '决策点', color: '#3b82f6', icon: '🎯' },
        { value: 'checkpoint', label: '检查点', color: '#f59e0b', icon: '✓' },
        { value: 'gate', label: '质量门禁', color: '#ef4444', icon: '🚪' },
        { value: 'sync', label: '同步点', color: '#10b981', icon: '🔄' },
      ],
    },
    {
      key: 'status',
      label: '状态',
      type: 'enum',
      required: false,
      defaultValue: 'pending',
      displayInTable: true,
      displayInGantt: false,
      displayInMatrix: true,
      displayOrder: 4,
      editable: true,
      editorType: 'select',
      enumOptions: [
        { value: 'pending', label: '待决策', color: '#94a3b8' },
        { value: 'approved', label: '已通过', color: '#10b981' },
        { value: 'rejected', label: '已拒绝', color: '#ef4444' },
      ],
    },
    {
      key: 'color',
      label: '颜色',
      type: 'string',
      required: false,
      displayInTable: false,
      displayInGantt: true,
      displayInMatrix: false,
      displayOrder: 99,
      editable: true,
      editorType: 'color',
    },
    {
      key: 'notes',
      label: '备注',
      type: 'string',
      required: false,
      displayInTable: false,
      displayInGantt: false,
      displayInMatrix: false,
      displayOrder: 100,
      editable: true,
      editorType: 'textarea',
    },
  ],
  
  relations: [
    {
      id: 'dependency-relation',
      name: '依赖关系',
      type: 'dependency',
      cardinality: 'n:n',
      visualize: true,
      lineStyle: 'dashed',
      lineColor: '#64748b',
      lineWidth: 2,
      allowCycles: false,
    },
  ],
  
  canNest: false,
  
  displayConfig: {
    icon: '🚪',
    color: '#ef4444',
    gantt: {
      shape: 'hexagon',
      height: 24,
      borderStyle: 'solid',
      borderWidth: 2,
      borderRadius: 0,
      showProgress: false,
    },
    table: {
      icon: '🚪',
      highlight: true,
    },
    matrix: {
      cellType: 'milestone',
      aggregation: 'count',
    },
    clickable: true,
    draggable: true,
    resizable: false,
    conditionalStyles: [
      {
        id: 'approved-style',
        condition: 'status === "approved"',
        priority: 10,
        style: {
          color: '#10b981',
        },
      },
      {
        id: 'rejected-style',
        condition: 'status === "rejected"',
        priority: 10,
        style: {
          color: '#ef4444',
        },
      },
    ],
  },
};

/**
 * 所有默认 Schema
 */
export const DEFAULT_SCHEMAS: LineSchema[] = [
  BarSchema,
  MilestoneSchema,
  GatewaySchema,
];

/**
 * 根据 Visual Type 获取默认 Schema
 */
export function getDefaultSchemaByVisualType(visualType: string): LineSchema | undefined {
  return DEFAULT_SCHEMAS.find(schema => schema.visualType === visualType);
}

/**
 * 根据 ID 获取默认 Schema
 */
export function getDefaultSchemaById(id: string): LineSchema | undefined {
  return DEFAULT_SCHEMAS.find(schema => schema.id === id);
}
