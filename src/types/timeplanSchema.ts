/**
 * TimePlan Schema 类型定义
 * 
 * Schema 系统覆盖整个 TimePlan，包括：
 * - TimePlan 本身
 * - Timeline 列表
 * - Line（原 bar/milestone/gateway）
 * - Baseline（基线）
 * - BaselineRange（时间范围基线）
 * 
 * 形成一套可扩展的 schema，方便实例化填充数据，
 * 和基于表格、甘特图等不同可视化逻辑来解读标准化、可扩展的 schema 数据
 * 
 * @version 2.1.0
 * @date 2026-01-24
 */

// ============================================================================
// Core Schema Types
// ============================================================================

/**
 * TimePlanSchema - TimePlan 的完整 Schema 定义
 * 
 * 定义整个计划的结构，包括所有子元素的 Schema
 */
export interface TimePlanSchema {
  // 基础信息
  id: string;
  name: string;                       // Schema 名称（如 "项目计划模板"）
  description?: string;               // 描述
  version: string;                    // Schema 版本（如 "1.0.0"）
  
  // 子元素 Schema 定义
  timelineSchema: TimelineSchema;     // Timeline 的 Schema
  lineSchemas: LineSchema[];         // Line 的 Schema 列表（bar/milestone/gateway等）
  baselineSchema?: BaselineSchema;    // Baseline 的 Schema（可选）
  baselineRangeSchema?: BaselineRangeSchema;  // BaselineRange 的 Schema（可选）
  
  // 关系 Schema
  relationSchemas: RelationSchema[];  // 关系类型的 Schema
  
  // 视图配置 Schema
  viewConfigSchema?: ViewConfigSchema;  // 视图配置的 Schema
  
  // 元数据
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * TimelineSchema - Timeline 的 Schema 定义
 * 
 * 定义 Timeline 列表的结构和展示方式
 */
export interface TimelineSchema {
  // 基础信息
  id: string;
  name: string;                       // Schema 名称（如 "时间线"）
  description?: string;
  
  // Timeline 属性定义
  attributes: AttributeDefinition[];  // Timeline 包含哪些属性
  
  // 展示配置
  displayConfig: TimelineDisplayConfig;
  
  // 嵌套能力
  canContainLines: boolean;           // 是否可以包含 Line
  allowedLineSchemaIds?: string[];    // 允许包含的 Line Schema ID 列表
}

/**
 * LineSchema - Line 的 Schema 定义
 * 
 * 定义 Line（原 bar/milestone/gateway）的结构和展示方式
 */
export interface LineSchema {
  // 基础信息
  id: string;
  name: string;                       // Schema 名称（如 "计划单元"、"里程碑"、"网关"）
  description?: string;               // 描述
  version: string;                    // Schema 版本（如 "1.0.0"）
  
  // 可视化类型
  visualType: VisualType;             // 如何在 UI 上展示
  
  // 数据属性定义
  attributes: AttributeDefinition[];  // Line 包含哪些属性
  
  // 关系定义
  relations: RelationDefinition[];    // Line 与其他 Line 的关系
  
  // 嵌套能力
  canNest: boolean;                   // 是否可以包含子 Line（子计划）
  
  // 展示配置
  displayConfig: DisplayConfig;       // UI 展示配置
  
  // 元数据
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * BaselineSchema - Baseline 的 Schema 定义
 * 
 * 定义基线（时间点）的结构和展示方式
 */
export interface BaselineSchema {
  // 基础信息
  id: string;
  name: string;                       // Schema 名称（如 "基线"）
  description?: string;
  
  // Baseline 属性定义
  attributes: AttributeDefinition[];  // Baseline 包含哪些属性
  
  // 展示配置
  displayConfig: BaselineDisplayConfig;
}

/**
 * BaselineRangeSchema - BaselineRange 的 Schema 定义
 * 
 * 定义时间范围基线的结构和展示方式
 */
export interface BaselineRangeSchema {
  // 基础信息
  id: string;
  name: string;                       // Schema 名称（如 "时间范围基线"）
  description?: string;
  
  // BaselineRange 属性定义
  attributes: AttributeDefinition[];  // BaselineRange 包含哪些属性
  
  // 展示配置
  displayConfig: BaselineRangeDisplayConfig;
}

/**
 * RelationSchema - 关系类型的 Schema 定义
 * 
 * 定义关系类型的结构和展示方式
 */
export interface RelationSchema {
  // 基础信息
  id: string;
  name: string;                       // Schema 名称（如 "依赖关系"）
  description?: string;
  
  // 关系类型
  type: RelationType;                 // 关系类型
  
  // 关系属性定义
  attributes: AttributeDefinition[];   // 关系包含哪些属性（如 lag, duration 等）
  
  // 展示配置
  displayConfig: RelationDisplayConfig;
}

/**
 * ViewConfigSchema - 视图配置的 Schema 定义
 * 
 * 定义视图配置的结构
 */
export interface ViewConfigSchema {
  // 基础信息
  id: string;
  name: string;                       // Schema 名称（如 "视图配置"）
  description?: string;
  
  // 视图配置属性定义
  attributes: AttributeDefinition[];  // 视图配置包含哪些属性
}

// ============================================================================
// Visual Types
// ============================================================================

/**
 * VisualType - 可视化类型
 * 
 * 定义 Line 在不同视图中的展示方式
 */
export type VisualType = 
  | 'bar'          // 计划单元（有起止时间）
  | 'milestone'    // 里程碑（单点时间，菱形）
  | 'gateway'      // 网关（关键节点）
  | 'event'        // 事件（未来扩展）
  | 'phase'        // 阶段（未来扩展）
  | 'custom';      // 自定义（扩展点）

// ============================================================================
// Attribute Definitions
// ============================================================================

/**
 * AttributeDefinition - 属性定义
 * 
 * 定义任何元素的一个属性（字段）
 */
export interface AttributeDefinition {
  // 基础信息
  key: string;                      // 属性键（如 "priority", "status"）
  label: string;                    // 显示名称（如 "优先级", "状态"）
  type: AttributeType;              // 数据类型
  
  // 验证
  required: boolean;                // 是否必填
  defaultValue?: any;               // 默认值
  validation?: ValidationRule[];    // 验证规则
  
  // 枚举选项（当 type = 'enum' 时）
  enumOptions?: EnumOption[];
  
  // 引用配置（当 type = 'reference' 时）
  referenceConfig?: ReferenceConfig;
  
  // UI 展示
  displayInTable: boolean;          // 是否在表格视图中显示
  displayInGantt: boolean;          // 是否在甘特图视图中显示
  displayInMatrix: boolean;         // 是否在矩阵视图中显示
  displayOrder?: number;            // 显示顺序（越小越靠前）
  
  // 编辑器配置
  editable: boolean;                // 是否可编辑
  editorType?: EditorType;          // 编辑器类型
}

/**
 * AttributeType - 属性数据类型
 */
export type AttributeType = 
  | 'string'
  | 'number'
  | 'date'
  | 'boolean'
  | 'enum'
  | 'reference'    // 引用其他 Line
  | 'array'
  | 'object';

/**
 * ValidationRule - 验证规则
 */
export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;                      // 规则值（如最小值、正则表达式等）
  message?: string;                 // 错误提示信息
  validator?: (value: any) => boolean | string;  // 自定义验证函数
}

/**
 * EnumOption - 枚举选项
 */
export interface EnumOption {
  value: string | number;
  label: string;
  color?: string;                   // 颜色标记
  icon?: string;                    // 图标
}

/**
 * ReferenceConfig - 引用配置
 */
export interface ReferenceConfig {
  targetSchemaId: string;           // 引用的目标 Schema ID
  displayAttribute: string;         // 显示哪个属性（如 "label"）
  allowMultiple: boolean;           // 是否允许多选
}

/**
 * EditorType - 编辑器类型
 */
export type EditorType = 
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'datetime'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  | 'color'
  | 'reference';

// ============================================================================
// Relation Definitions
// ============================================================================

/**
 * RelationDefinition - 关系定义
 * 
 * 定义 Line 之间的关系（如依赖、层级等）
 */
export interface RelationDefinition {
  id: string;
  name: string;                     // 关系名称（如 "依赖", "包含"）
  type: RelationType;               // 关系类型
  fromAttribute?: string;           // 源属性（可选）
  toAttribute?: string;             // 目标属性（可选）
  cardinality: Cardinality;         // 基数关系
  
  // 可视化
  visualize: boolean;               // 是否在 UI 上显示
  lineStyle?: 'solid' | 'dashed' | 'dotted';
  lineColor?: string;
  lineWidth?: number;
  
  // 约束
  allowCycles?: boolean;            // 是否允许循环依赖
}

/**
 * RelationType - 关系类型
 */
export type RelationType = 
  | 'dependency'        // 依赖关系（finish-to-start等）
  | 'hierarchy'         // 层级关系（父子）
  | 'association'       // 关联关系
  | 'composition'       // 组合关系
  | 'aggregation';      // 聚合关系

/**
 * Cardinality - 基数关系
 */
export type Cardinality = 
  | '1:1'    // 一对一
  | '1:n'    // 一对多
  | 'n:1'    // 多对一
  | 'n:n';   // 多对多

/**
 * DependencyType - 依赖类型（兼容 v1.x）
 */
export type DependencyType = 
  | 'finish-to-start'    // FS: 前 Line 完成后，后 Line 才能开始
  | 'start-to-start'     // SS: 前 Line 开始后，后 Line 才能开始
  | 'finish-to-finish'   // FF: 前 Line 完成后，后 Line 才能完成
  | 'start-to-finish';   // SF: 前 Line 开始后，后 Line 才能完成

// ============================================================================
// Display Configs
// ============================================================================

/**
 * DisplayConfig - Line 展示配置
 * 
 * 定义 Line 在 UI 上的展示样式和交互
 */
export interface DisplayConfig {
  // 图标和颜色
  icon?: string;                    // 图标（emoji 或图标类名）
  color?: string;                   // 主色调
  backgroundColor?: string;         // 背景色
  borderColor?: string;             // 边框色
  
  // 甘特图特定
  gantt?: {
    shape?: 'bar' | 'diamond' | 'circle' | 'hexagon' | 'custom';
    height?: number;                // 高度（像素）
    borderStyle?: 'solid' | 'dashed' | 'dotted';
    borderWidth?: number;
    borderRadius?: number;
    showProgress?: boolean;         // 是否显示进度条
  };
  
  // 表格特定
  table?: {
    icon?: string;                  // 表格中的图标
    badge?: string;                 // 徽章文本
    highlight?: boolean;            // 是否高亮
    rowColor?: string;              // 行背景色
  };
  
  // 矩阵特定
  matrix?: {
    cellType?: 'line' | 'milestone' | 'summary';  // ✅ 修复：task -> line
    aggregation?: 'sum' | 'count' | 'avg' | 'min' | 'max';
    heatmap?: boolean;              // 是否使用热力图
  };
  
  // 文本格式
  labelFormat?: string;             // 标签格式（如 "{name} - {progress}%"）
  tooltipTemplate?: string;         // 提示信息模板
  
  // 交互
  clickable: boolean;               // 是否可点击
  draggable: boolean;               // 是否可拖拽
  resizable: boolean;               // 是否可调整大小
  
  // 条件样式
  conditionalStyles?: ConditionalStyle[];
}

/**
 * TimelineDisplayConfig - Timeline 展示配置
 */
export interface TimelineDisplayConfig {
  // 图标和颜色
  icon?: string;
  color?: string;
  backgroundColor?: string;
  
  // 表格特定
  table?: {
    icon?: string;
    badge?: string;
    highlight?: boolean;
    rowColor?: string;
  };
  
  // 甘特图特定
  gantt?: {
    height?: number;                // Timeline 行高度
    showHeader?: boolean;           // 是否显示表头
    collapsible?: boolean;          // 是否可折叠
  };
  
  // 文本格式
  labelFormat?: string;
  tooltipTemplate?: string;
  
  // 交互
  clickable: boolean;
  draggable: boolean;               // 是否可拖拽排序
}

/**
 * BaselineDisplayConfig - Baseline 展示配置
 */
export interface BaselineDisplayConfig {
  // 图标和颜色
  icon?: string;
  color?: string;
  
  // 甘特图特定
  gantt?: {
    lineStyle?: 'solid' | 'dashed' | 'dotted';
    lineWidth?: number;
    showLabel?: boolean;            // 是否显示标签
    labelPosition?: 'top' | 'bottom' | 'left' | 'right';
  };
  
  // 表格特定
  table?: {
    icon?: string;
    badge?: string;
  };
  
  // 文本格式
  labelFormat?: string;
  tooltipTemplate?: string;
}

/**
 * BaselineRangeDisplayConfig - BaselineRange 展示配置
 */
export interface BaselineRangeDisplayConfig {
  // 图标和颜色
  icon?: string;
  color?: string;
  backgroundColor?: string;         // 背景色（支持透明度）
  
  // 甘特图特定
  gantt?: {
    borderStyle?: 'solid' | 'dashed' | 'dotted';
    borderWidth?: number;
    borderRadius?: number;
    showLabel?: boolean;
    labelPosition?: 'top' | 'bottom' | 'center';
  };
  
  // 表格特定
  table?: {
    icon?: string;
    badge?: string;
  };
  
  // 文本格式
  labelFormat?: string;
  tooltipTemplate?: string;
}

/**
 * RelationDisplayConfig - 关系展示配置
 */
export interface RelationDisplayConfig {
  visible: boolean;
  lineStyle?: 'solid' | 'dashed' | 'dotted';
  lineColor?: string;
  lineWidth?: number;
  label?: string;                   // 关系标签（显示在连线上）
  showArrow?: boolean;              // 是否显示箭头
}

/**
 * ConditionalStyle - 条件样式
 * 
 * 根据条件应用不同的样式
 */
export interface ConditionalStyle {
  id: string;
  condition: string;                // 条件表达式（如 "progress > 80"）
  priority: number;                 // 优先级（数字越大优先级越高）
  style: Partial<DisplayConfig>;    // 满足条件时的样式
}

// ============================================================================
// Data Model (v2.1.0)
// ============================================================================

/**
 * Line - 统一的节点类型
 * 
 * 所有的"计划单元"、"里程碑"、"网关"都是 Line，通过 schema 决定如何展示
 */
export interface Line {
  // 基础标识
  id: string;
  timelineId: string;               // 所属 Timeline ID
  
  // 基础信息
  label: string;                    // 显示名称
  startDate: Date;                  // 开始日期
  endDate?: Date;                   // 结束日期（milestone/gateway 可能没有）
  
  // Schema 引用
  schemaId: string;                 // 关联的 LineSchema ID
  
  // 动态属性（基于 schema.attributes 定义）
  attributes: Record<string, any>;  // 如 { priority: 'high', status: 'in-progress' }
  
  // 嵌套计划
  nestedPlanId?: string;            // 子计划 ID（如果有）
  
  // 元数据
  notes?: string;                   // 备注（Markdown）
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
}

/**
 * Relation - 关系
 * 
 * 替代原来的 Dependency，更通用的关系模型
 */
export interface Relation {
  id: string;
  type: RelationType;               // 关系类型
  fromLineId: string;               // 源 Line ID
  toLineId: string;                 // 目标 Line ID
  
  // Schema 引用
  schemaId?: string;                // 关联的 RelationSchema ID
  
  // 关系特定属性（基于 type）
  properties?: Record<string, any>; // 如 { dependencyType: 'finish-to-start', lag: 2 }
  
  // 显示配置
  displayConfig?: RelationDisplayConfig;
  
  // 元数据
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Timeline - 时间线
 * 
 * 一组 Line 的容器
 */
export interface Timeline {
  id: string;
  name: string;
  owner: string;
  description?: string;
  color?: string;
  backgroundColor?: string;         // 行背景色（支持 rgba/hsla 透明色）
  
  // Schema 引用
  schemaId?: string;                // 关联的 TimelineSchema ID
  
  // 动态属性（基于 schema.attributes 定义）
  attributes?: Record<string, any>;
  
  // Line 引用
  lineIds: string[];                // 包含的 Line ID 列表
  
  // 显示控制
  collapsed?: boolean;              // 是否折叠
  order?: number;                   // 显示顺序
}

/**
 * Baseline - 基线（时间点）
 */
export interface Baseline {
  id: string;
  date: Date;
  label: string;
  color?: string;
  
  // Schema 引用
  schemaId?: string;                // 关联的 BaselineSchema ID
  
  // 动态属性（基于 schema.attributes 定义）
  attributes?: Record<string, any>;
}

/**
 * BaselineRange - 基线区间
 */
export interface BaselineRange {
  id: string;
  startDate: Date;
  endDate: Date;
  label: string;
  color?: string;
  
  // Schema 引用
  schemaId?: string;                // 关联的 BaselineRangeSchema ID
  
  // 动态属性（基于 schema.attributes 定义）
  attributes?: Record<string, any>;
}

/**
 * TimePlan - 计划
 * 
 * v2.1.0 的核心数据结构，基于完整的 Schema 系统
 */
export interface TimePlan {
  // 基础信息
  id: string;
  title: string;
  owner?: string;
  description?: string;
  
  // Schema 引用
  schemaId: string;                 // 关联的 TimePlanSchema ID
  
  // 数据内容
  timelines: Timeline[];
  lines: Line[];                    // 所有的 Line
  relations: Relation[];            // 所有的关系
  
  // 基线
  baselines?: Baseline[];
  baselineRanges?: BaselineRange[];
  
  // 视图配置
  viewConfig?: ViewConfig;
  
  // 元数据
  createdAt?: Date;
  lastAccessTime?: Date;
  createdBy?: string;
  tags?: string[];
}

/**
 * ViewConfig - 视图配置
 */
export interface ViewConfig {
  scale: TimeScale;
  startDate: Date;
  endDate: Date;
  isEditMode: boolean;
}

/**
 * TimeScale - 时间刻度
 */
export type TimeScale = 'day' | 'week' | 'biweekly' | 'month' | 'quarter';

// ============================================================================
// Helper Types
// ============================================================================

/**
 * SchemaRegistry - Schema 注册表
 * 
 * 管理所有的 Schema
 */
export interface SchemaRegistry {
  timePlanSchemas: Map<string, TimePlanSchema>;
  lineSchemas: Map<string, LineSchema>;
  timelineSchemas: Map<string, TimelineSchema>;
  baselineSchemas: Map<string, BaselineSchema>;
  baselineRangeSchemas: Map<string, BaselineRangeSchema>;
  relationSchemas: Map<string, RelationSchema>;
  
  registerTimePlanSchema(schema: TimePlanSchema): void;
  registerLineSchema(schema: LineSchema): void;
  registerTimelineSchema(schema: TimelineSchema): void;
  registerBaselineSchema(schema: BaselineSchema): void;
  registerBaselineRangeSchema(schema: BaselineRangeSchema): void;
  registerRelationSchema(schema: RelationSchema): void;
  
  getTimePlanSchema(id: string): TimePlanSchema | undefined;
  getLineSchema(id: string): LineSchema | undefined;
  getTimelineSchema(id: string): TimelineSchema | undefined;
  getBaselineSchema(id: string): BaselineSchema | undefined;
  getBaselineRangeSchema(id: string): BaselineRangeSchema | undefined;
  getRelationSchema(id: string): RelationSchema | undefined;
}

/**
 * RenderContext - 渲染上下文
 */
export interface RenderContext {
  view: 'gantt' | 'table' | 'matrix';
  scale?: TimeScale;
  viewStartDate?: Date;
  viewEndDate?: Date;
  isEditMode?: boolean;
}

/**
 * Position - 位置
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Size - 大小
 */
export interface Size {
  width: number;
  height: number;
}
