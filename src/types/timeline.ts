// 基础节点类型（保持向后兼容）
export type BaseNodeType = 'bar' | 'milestone' | 'gateway';

// 计划单元类型（新增）
export type PlanUnitType = 'line'; // 计划单元，可展开为子计划

// 完整节点类型
export type NodeType = BaseNodeType | PlanUnitType;

// 计划模板类型
export type PlanTemplateType = 
  | 'nested-timeplan'        // 普通嵌套计划（有起止时间的完整 timeplan）
  | 'multi-iteration'        // 多迭代计划（固定节奏、多团队）
  | 'custom';                // 自定义模板（未来扩展）

// 多迭代配置（用于 multi-iteration 模板）
export interface MultiIterationConfig {
  teamCount: number;           // 团队数量
  iterationDuration: number;   // 每个迭代的时长（天）
  iterationInterval: number;   // 迭代间隔（天）
  iterationCount: number;      // 迭代次数
  startOffset: number;         // 起始偏移（天）
}

// 嵌套计划引用（前向声明）
export interface NestedPlanReference {
  planId: string;              // 子计划的 ID
  templateType: PlanTemplateType;
  
  // 当 templateType = 'nested-timeplan' 时使用
  nestedPlan?: TimelinePlanData;
  
  // 当 templateType = 'multi-iteration' 时使用
  iterationConfig?: MultiIterationConfig;
  
  // 展开状态
  isExpanded?: boolean;        // 是否已展开
  expandedAt?: Date;           // 展开时间
}

export interface TimelineNode {
  id: string;
  type: NodeType;
  label: string;
  startDate: Date;
  endDate?: Date; // For 'bar' and 'line' types
  timelineId: string;
  color?: string;
  notes?: string; // Markdown notes for the node
  
  // 新增：计划单元特有属性
  planReference?: NestedPlanReference;  // 仅 'line' 类型使用
}

// Baseline time range (e.g., freeze period, release window)
export interface BaselineRange {
  id: string;
  startDate: Date;
  endDate: Date;
  label: string;
  color?: string;
}

export interface Dependency {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  type: 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish';
}

export interface Timeline {
  id: string;
  name: string;
  owner: string;
  description?: string;  // Timeline 描述信息
  color?: string;
  backgroundColor?: string; // 行背景色（支持 rgba/hsla 透明色）
  nodes: TimelineNode[];
}

export interface TimelinePlanData {
  id: string;
  title: string;
  owner?: string;           // 计划负责人
  createdAt?: Date;         // 创建时间
  lastAccessTime?: Date;    // 最近访问时间
  timelines: Timeline[];
  dependencies: Dependency[];
  baselines?: Baseline[];
  baselineRanges?: BaselineRange[]; // Time ranges (e.g., freeze periods)
}

export type TimeScale = 'day' | 'week' | 'biweekly' | 'month' | 'quarter';

export interface Baseline {
  id: string;
  date: Date;
  label: string;
  color?: string;
}

export interface ViewConfig {
  scale: TimeScale;
  startDate: Date;
  endDate: Date;
  isEditMode: boolean;
}
