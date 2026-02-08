/**
 * Orion X 智能驾驶平台 2026 年度计划（完整版 v4）
 * 
 * v4 改进（2026-02-08）：
 * 1. 类型重命名：bar-schema → lineplan-schema
 * 2. 更细粒度的任务拆解（适用于迭代规划视图）
 * 3. 增加更多模块间依赖关系
 * 4. 完善Timeline描述和分类
 * 
 * v3 改进：
 * 1. 符合 schema 定义：lineplan 有 endDate，milestone/gateway 只有 startDate
 * 2. 确保每个 timeline 内的 line 时间不重叠
 * 3. 每个 lineplan 后都添加 gateway 或 milestone
 * 4. 完整的跨 timeline 依赖关系
 * 5. 修复 timeline.lineIds 字段，确保正确关联所有 line
 * 
 * @date 2026-02-08
 */

import { TimePlan, Timeline, Line, Relation, Baseline } from '@/types/timeplanSchema';
import { LinePlanSchema, MilestoneSchema, GatewaySchema } from '@/schemas/defaultSchemas';

// ============================================================================
// Timeline 定义
// ============================================================================

const timelines: Timeline[] = [
  // 1. 项目管理
  {
    id: 'tl-project-mgmt',
    name: '项目管理',
    owner: '项目办',
    description: '整车项目里程碑和门禁',
    order: 1,
    lineIds: [
      'line-pm-001',
      'line-pm-002',
      'line-pm-003',
      'line-pm-004',
      'line-pm-005',
      'line-pm-006',
    ],
    attributes: {
      category: '项目管理',
      productLine: '整车项目',
    },
  },
  // 2. 电子电器架构
  {
    id: 'tl-ee-arch',
    name: '电子电器架构',
    owner: '架构团队',
    description: 'E0-E4架构设计和FDJ',
    order: 2,
    lineIds: [
      'line-ee-001',
      'line-ee-001-mr2',
      'line-ee-001-mr3',
      'line-ee-001-gate',
      'line-ee-002',
      'line-ee-002-gate',
      'line-ee-003',
      'line-ee-003-milestone',
      'line-ee-004',
      'line-ee-004-gate',
      'line-ee-005',
      'line-ee-005-milestone',
    ],
    attributes: {
      category: 'ECU开发计划',
    },
  },
  // 3. 感知算法
  {
    id: 'tl-perception',
    name: '感知算法',
    owner: '感知团队',
    description: '视觉、雷达、融合算法开发',
    order: 3,
    lineIds: [
      'line-p-001-mr1',
      'line-p-001-mr2',
      'line-p-001-mr3',
      'line-p-001-mr4',
      'line-p-001-gate',
      'line-p-002',
      'line-p-002-milestone',
      'line-p-003',
      'line-p-003-gate',
      'line-p-004',
      'line-p-004-milestone',
    ],
    attributes: {
      category: '软件产品计划',
    },
  },
  // 4. 规划决策
  {
    id: 'tl-planning',
    name: '规划决策',
    owner: '规划团队',
    description: '路径规划和决策算法',
    order: 4,
    lineIds: [
      'line-pl-001-mr1',
      'line-pl-001-mr2',
      'line-pl-001-mr3',
      'line-pl-001-gate',
      'line-pl-002-mr1',
      'line-pl-002-mr2',
      'line-pl-002-milestone',
      'line-pl-003',
      'line-pl-003-gate',
    ],
    attributes: {
      category: '软件产品计划',
    },
  },
  // 5. 控制执行
  {
    id: 'tl-control',
    name: '控制执行',
    owner: '控制团队',
    description: '横纵向控制和执行',
    order: 5,
    lineIds: [
      'line-c-001',
      'line-c-001-gate',
      'line-c-002',
      'line-c-002-milestone',
      'line-c-003',
      'line-c-003-gate',
    ],
    attributes: {
      category: '软件产品计划',
    },
  },
  // 6. 软件集成
  {
    id: 'tl-integration',
    name: '软件集成',
    owner: '集成团队',
    description: '模块集成和联调',
    order: 6,
    lineIds: [
      'line-i-001',
      'line-i-001-gate',
      'line-i-002',
      'line-i-002-milestone',
      'line-i-003',
      'line-i-003-gate',
    ],
    attributes: {
      category: '集成发版计划',
    },
  },
  // 7. 整车测试
  {
    id: 'tl-testing',
    name: '整车测试',
    owner: '测试团队',
    description: 'VP样车测试和验证',
    order: 7,
    lineIds: [
      'line-t-001',
      'line-t-001-milestone',
      'line-t-002',
      'line-t-002-gate',
      'line-t-003',
      'line-t-003-milestone',
      'line-t-004',
      'line-t-004-gate',
    ],
    attributes: {
      category: '平台支撑计划',
    },
  },
];

// ============================================================================
// Line 定义（计划单元）- 按 timeline 分组，确保时间不重叠
// ============================================================================

const lines: Line[] = [
  // ========================================================================
  // Timeline 1: 项目管理（整车里程碑 - 只有gateway/milestone，无bar）
  // ========================================================================
  {
    id: 'line-pm-001',
    timelineId: 'tl-project-mgmt',
    label: 'PTR 项目技术要求',
    startDate: new Date('2026-01-15'),
    schemaId: GatewaySchema.id,
    attributes: {
      color: '#8b5cf6',
      status: '已通过',
      priority: '高',
      owner: '项目办',
      description: '技术要求评审',
    },
  },
  {
    id: 'line-pm-002',
    timelineId: 'tl-project-mgmt',
    label: 'FC3 功能需求锁定',
    startDate: new Date('2026-03-31'),
    schemaId: GatewaySchema.id,
    attributes: {
      color: '#f59e0b',
      status: '计划中',
      priority: '高',
      owner: '需求团队',
      description: '功能需求锁定门禁',
    },
  },
  {
    id: 'line-pm-003',
    timelineId: 'tl-project-mgmt',
    label: 'PC 项目团队',
    startDate: new Date('2026-04-30'),
    schemaId: MilestoneSchema.id,
    attributes: {
      color: '#3b82f6',
      status: '计划中',
      priority: '高',
      owner: '项目办',
      description: '项目团队组建完成',
    },
  },
  {
    id: 'line-pm-004',
    timelineId: 'tl-project-mgmt',
    label: 'PA 项目批准',
    startDate: new Date('2026-06-30'),
    schemaId: MilestoneSchema.id,
    attributes: {
      color: '#10b981',
      status: '计划中',
      priority: '高',
      owner: '项目办',
      description: '项目正式批准',
    },
  },
  {
    id: 'line-pm-005',
    timelineId: 'tl-project-mgmt',
    label: 'MRD-CRB 变更审查',
    startDate: new Date('2026-08-31'),
    schemaId: GatewaySchema.id,
    attributes: {
      color: '#ef4444',
      status: '计划中',
      priority: '高',
      owner: '项目办',
      description: '变更控制审查板',
    },
  },
  {
    id: 'line-pm-006',
    timelineId: 'tl-project-mgmt',
    label: 'LR 投产准备',
    startDate: new Date('2026-10-15'),
    schemaId: MilestoneSchema.id,
    attributes: {
      color: '#10b981',
      status: '计划中',
      priority: '高',
      owner: '生产团队',
      description: '量产准备就绪',
    },
  },

  // ========================================================================
  // Timeline 2: 电子电器架构（E0-E4 + FDJ）
  // ========================================================================
  // E0 架构概念设计（拆分为3个MR）
  {
    id: 'line-ee-001',
    timelineId: 'tl-ee-arch',
    label: 'E0.1 域控架构方案设计',
    startDate: new Date('2026-01-15'),
    endDate: new Date('2026-01-31'),
    schemaId: LinePlanSchema.id,
    attributes: {
      color: '#3b82f6',
      progress: 0,
      status: '未开始',
      priority: '高',
      owner: '架构师A',
      description: '域控制器架构方案设计',
      module: 'E0架构',
      productLine: '电子架构',
    },
  },
  {
    id: 'line-ee-001-mr2',
    timelineId: 'tl-ee-arch',
    label: 'E0.2 传感器配置方案',
    startDate: new Date('2026-02-03'),
    endDate: new Date('2026-02-17'),
    schemaId: LinePlanSchema.id,
    attributes: {
      color: '#3b82f6',
      progress: 0,
      status: '未开始',
      priority: '高',
      owner: '架构师B',
      description: '传感器配置和布局方案',
      module: 'E0架构',
      productLine: '电子架构',
    },
  },
  {
    id: 'line-ee-001-mr3',
    timelineId: 'tl-ee-arch',
    label: 'E0.3 系统通信架构',
    startDate: new Date('2026-02-19'),
    endDate: new Date('2026-02-28'),
    schemaId: LinePlanSchema.id,
    attributes: {
      color: '#3b82f6',
      progress: 0,
      status: '未开始',
      priority: '高',
      owner: '架构师C',
      description: 'CAN/Ethernet通信架构',
      module: 'E0架构',
      productLine: '电子架构',
    },
  },
  {
    id: 'line-ee-001-gate',
    timelineId: 'tl-ee-arch',
    label: 'E0 评审',
    startDate: new Date('2026-03-05'),
    schemaId: GatewaySchema.id,
    attributes: {
      color: '#3b82f6',
      status: '待决策',
      priority: '高',
      owner: '架构团队',
      description: 'E0架构评审门禁',
    },
  },
  // E1 架构方案设计
  {
    id: 'line-ee-002',
    timelineId: 'tl-ee-arch',
    label: 'E1 架构方案设计',
    startDate: new Date('2026-03-10'),
    endDate: new Date('2026-04-30'),
    schemaId: LinePlanSchema.id,
    attributes: {
      color: '#3b82f6',
      progress: 0,
      status: '未开始',
      priority: '高',
      owner: '架构师',
      description: '详细架构方案设计',
    },
  },
  {
    id: 'line-ee-002-gate',
    timelineId: 'tl-ee-arch',
    label: 'E1 评审',
    startDate: new Date('2026-05-05'),
    schemaId: GatewaySchema.id,
    attributes: {
      color: '#3b82f6',
      status: '待决策',
      priority: '高',
      owner: '架构团队',
      description: 'E1架构评审门禁',
    },
  },
  // E2 架构开发
  {
    id: 'line-ee-003',
    timelineId: 'tl-ee-arch',
    label: 'E2 架构开发（0-10）',
    startDate: new Date('2026-05-10'),
    endDate: new Date('2026-07-15'),
    schemaId: LinePlanSchema.id,
    attributes: {
      color: '#3b82f6',
      progress: 0,
      status: '未开始',
      priority: '高',
      owner: '架构团队',
      description: 'E2架构开发',
    },
  },
  {
    id: 'line-ee-003-milestone',
    timelineId: 'tl-ee-arch',
    label: 'E2 完成',
    startDate: new Date('2026-07-20'),
    schemaId: MilestoneSchema.id,
    attributes: {
      color: '#10b981',
      status: '计划中',
      priority: '高',
      owner: '架构团队',
      description: 'E2架构开发完成',
    },
  },
  // E3 信号架构改造
  {
    id: 'line-ee-004',
    timelineId: 'tl-ee-arch',
    label: 'E3 信号架构改造',
    startDate: new Date('2026-07-25'),
    endDate: new Date('2026-09-10'),
    schemaId: LinePlanSchema.id,
    attributes: {
      color: '#3b82f6',
      progress: 0,
      status: '未开始',
      priority: '高',
      owner: '架构团队',
      description: '信号架构改造',
    },
  },
  {
    id: 'line-ee-004-gate',
    timelineId: 'tl-ee-arch',
    label: 'E3 评审',
    startDate: new Date('2026-09-15'),
    schemaId: GatewaySchema.id,
    attributes: {
      color: '#3b82f6',
      status: '待决策',
      priority: '高',
      owner: '架构团队',
      description: 'E3评审门禁',
    },
  },
  // E4 满足VP造车
  {
    id: 'line-ee-005',
    timelineId: 'tl-ee-arch',
    label: 'E4 满足VP造车',
    startDate: new Date('2026-09-20'),
    endDate: new Date('2026-10-31'),
    schemaId: LinePlanSchema.id,
    attributes: {
      color: '#3b82f6',
      progress: 0,
      status: '未开始',
      priority: '高',
      owner: '架构团队',
      description: 'E4架构满足VP',
    },
  },
  {
    id: 'line-ee-005-milestone',
    timelineId: 'tl-ee-arch',
    label: 'FDJ 图纸发布',
    startDate: new Date('2026-11-05'),
    schemaId: MilestoneSchema.id,
    attributes: {
      color: '#f59e0b',
      status: '计划中',
      priority: '高',
      owner: '架构团队',
      description: '最终数据判定',
    },
  },

  // ========================================================================
  // Timeline 3: 感知算法（细粒度拆解）
  // ========================================================================
  // 视觉感知算法（拆分为4个MR）
  {
    id: 'line-p-001-mr1',
    timelineId: 'tl-perception',
    label: 'P1.1 图像预处理模块',
    startDate: new Date('2026-02-01'),
    endDate: new Date('2026-02-20'),
    schemaId: LinePlanSchema.id,
    attributes: {
      color: '#10b981',
      progress: 0,
      status: '未开始',
      priority: '高',
      owner: '张工',
      description: '图像去畸变、增强、ROI提取',
      module: '视觉感知',
      productLine: '感知算法',
    },
  },
  {
    id: 'line-p-001-mr2',
    timelineId: 'tl-perception',
    label: 'P1.2 目标检测算法',
    startDate: new Date('2026-02-22'),
    endDate: new Date('2026-03-20'),
    schemaId: LinePlanSchema.id,
    attributes: {
      color: '#10b981',
      progress: 0,
      status: '未开始',
      priority: '高',
      owner: '张工',
      description: 'YOLO/Transformer目标检测',
      module: '视觉感知',
      productLine: '感知算法',
    },
  },
  {
    id: 'line-p-001-mr3',
    timelineId: 'tl-perception',
    label: 'P1.3 多帧跟踪融合',
    startDate: new Date('2026-03-22'),
    endDate: new Date('2026-04-15'),
    schemaId: LinePlanSchema.id,
    attributes: {
      color: '#10b981',
      progress: 0,
      status: '未开始',
      priority: '高',
      owner: '张工',
      description: 'Kalman滤波多帧跟踪',
      module: '视觉感知',
      productLine: '感知算法',
    },
  },
  {
    id: 'line-p-001-mr4',
    timelineId: 'tl-perception',
    label: 'P1.4 环境语义理解',
    startDate: new Date('2026-04-17'),
    endDate: new Date('2026-04-30'),
    schemaId: LinePlanSchema.id,
    attributes: {
      color: '#10b981',
      progress: 0,
      status: '未开始',
      priority: '中',
      owner: '张工',
      description: '车道线、交通标志识别',
      module: '视觉感知',
      productLine: '感知算法',
    },
  },
  {
    id: 'line-p-001-gate',
    timelineId: 'tl-perception',
    label: '视觉算法评审',
    startDate: new Date('2026-05-05'),
    schemaId: GatewaySchema.id,
    attributes: {
      color: '#10b981',
      status: '待决策',
      priority: '高',
      owner: '感知团队',
      description: '视觉算法质量门禁',
    },
  },
  // 激光雷达点云处理
  {
    id: 'line-p-002',
    timelineId: 'tl-perception',
    label: '激光雷达点云处理',
    startDate: new Date('2026-05-10'),
    endDate: new Date('2026-07-31'),
    schemaId: LinePlanSchema.id,
    attributes: {
      color: '#10b981',
      progress: 0,
      status: '未开始',
      priority: '高',
      owner: '李工',
      description: '多线激光雷达融合',
    },
  },
  {
    id: 'line-p-002-milestone',
    timelineId: 'tl-perception',
    label: '雷达算法完成',
    startDate: new Date('2026-08-05'),
    schemaId: MilestoneSchema.id,
    attributes: {
      color: '#10b981',
      status: '计划中',
      priority: '高',
      owner: '感知团队',
      description: '雷达算法交付',
    },
  },
  // 感知算法集成测试
  {
    id: 'line-p-003',
    timelineId: 'tl-perception',
    label: '感知算法集成测试',
    startDate: new Date('2026-08-10'),
    endDate: new Date('2026-09-30'),
    schemaId: LinePlanSchema.id,
    attributes: {
      color: '#10b981',
      progress: 0,
      status: '未开始',
      priority: '高',
      owner: '感知团队',
      description: '感知模块集成测试',
    },
  },
  {
    id: 'line-p-003-gate',
    timelineId: 'tl-perception',
    label: '感知算法验收',
    startDate: new Date('2026-10-05'),
    schemaId: GatewaySchema.id,
    attributes: {
      color: '#10b981',
      status: '待决策',
      priority: '高',
      owner: '感知团队',
      description: '感知算法验收门禁',
    },
  },
  // FDJ 感知算法终版
  {
    id: 'line-p-004',
    timelineId: 'tl-perception',
    label: 'FDJ 感知算法终版',
    startDate: new Date('2026-10-10'),
    endDate: new Date('2026-11-15'),
    schemaId: LinePlanSchema.id,
    attributes: {
      color: '#10b981',
      progress: 0,
      status: '未开始',
      priority: '高',
      owner: '感知团队',
      description: '感知算法最终优化',
    },
  },
  {
    id: 'line-p-004-milestone',
    timelineId: 'tl-perception',
    label: '感知算法v1.0发布',
    startDate: new Date('2026-11-20'),
    schemaId: MilestoneSchema.id,
    attributes: {
      color: '#10b981',
      status: '计划中',
      priority: '高',
      owner: '感知团队',
      description: '感知算法正式发布',
    },
  },

  // ========================================================================
  // Timeline 4: 规划决策（细粒度拆解）
  // ========================================================================
  // 行为决策算法开发（拆分为3个MR）
  {
    id: 'line-pl-001-mr1',
    timelineId: 'tl-planning',
    label: 'PL1.1 决策状态机设计',
    startDate: new Date('2026-04-01'),
    endDate: new Date('2026-04-30'),
    schemaId: LinePlanSchema.id,
    attributes: {
      color: '#8b5cf6',
      progress: 0,
      status: '未开始',
      priority: '高',
      owner: '王工',
      description: '有限状态机和场景切换',
      module: '行为决策',
      productLine: '规划决策',
    },
  },
  {
    id: 'line-pl-001-mr2',
    timelineId: 'tl-planning',
    label: 'PL1.2 强化学习策略',
    startDate: new Date('2026-05-05'),
    endDate: new Date('2026-05-31'),
    schemaId: LinePlanSchema.id,
    attributes: {
      color: '#8b5cf6',
      progress: 0,
      status: '未开始',
      priority: '高',
      owner: '王工',
      description: 'DQN/PPO策略训练',
      module: '行为决策',
      productLine: '规划决策',
    },
  },
  {
    id: 'line-pl-001-mr3',
    timelineId: 'tl-planning',
    label: 'PL1.3 决策评估验证',
    startDate: new Date('2026-06-03'),
    endDate: new Date('2026-06-30'),
    schemaId: LinePlanSchema.id,
    attributes: {
      color: '#8b5cf6',
      progress: 0,
      status: '未开始',
      priority: '高',
      owner: '王工',
      description: '决策算法测试和优化',
      module: '行为决策',
      productLine: '规划决策',
    },
  },
  {
    id: 'line-pl-001-gate',
    timelineId: 'tl-planning',
    label: '决策算法评审',
    startDate: new Date('2026-07-05'),
    schemaId: GatewaySchema.id,
    attributes: {
      color: '#8b5cf6',
      status: '待决策',
      priority: '高',
      owner: '规划团队',
      description: '决策算法门禁',
    },
  },
  // 路径规划算法开发（拆分为2个MR）
  {
    id: 'line-pl-002-mr1',
    timelineId: 'tl-planning',
    label: 'PL2.1 全局路径规划',
    startDate: new Date('2026-07-10'),
    endDate: new Date('2026-08-10'),
    schemaId: LinePlanSchema.id,
    attributes: {
      color: '#8b5cf6',
      progress: 0,
      status: '未开始',
      priority: '高',
      owner: '刘工',
      description: 'A*全局路径规划',
      module: '路径规划',
      productLine: '规划决策',
    },
  },
  {
    id: 'line-pl-002-mr2',
    timelineId: 'tl-planning',
    label: 'PL2.2 局部路径规划',
    startDate: new Date('2026-08-12'),
    endDate: new Date('2026-09-15'),
    schemaId: LinePlanSchema.id,
    attributes: {
      color: '#8b5cf6',
      progress: 0,
      status: '未开始',
      priority: '高',
      owner: '刘工',
      description: 'RRT局部避障规划',
      module: '路径规划',
      productLine: '规划决策',
    },
  },
  {
    id: 'line-pl-002-milestone',
    timelineId: 'tl-planning',
    label: '规划算法完成',
    startDate: new Date('2026-09-20'),
    schemaId: MilestoneSchema.id,
    attributes: {
      color: '#8b5cf6',
      status: '计划中',
      priority: '高',
      owner: '规划团队',
      description: '规划算法交付',
    },
  },
  // 规划决策集成测试
  {
    id: 'line-pl-003',
    timelineId: 'tl-planning',
    label: '规划决策集成测试',
    startDate: new Date('2026-09-25'),
    endDate: new Date('2026-10-31'),
    schemaId: LinePlanSchema.id,
    attributes: {
      color: '#8b5cf6',
      progress: 0,
      status: '未开始',
      priority: '高',
      owner: '规划团队',
      description: '决策规划模块集成',
    },
  },
  {
    id: 'line-pl-003-gate',
    timelineId: 'tl-planning',
    label: 'FDJ 规划决策完成',
    startDate: new Date('2026-11-05'),
    schemaId: GatewaySchema.id,
    attributes: {
      color: '#8b5cf6',
      status: '待决策',
      priority: '高',
      owner: '规划团队',
      description: 'FDJ门禁',
    },
  },

  // ========================================================================
  // Timeline 5: 控制执行
  // ========================================================================
  // 横向控制算法
  {
    id: 'line-c-001',
    timelineId: 'tl-control',
    label: '横向控制算法开发',
    startDate: new Date('2026-05-01'),
    endDate: new Date('2026-07-15'),
    schemaId: LinePlanSchema.id,
    attributes: {
      color: '#ef4444',
      progress: 0,
      status: '未开始',
      priority: '高',
      owner: '赵工',
      description: 'MPC横向控制',
    },
  },
  {
    id: 'line-c-001-gate',
    timelineId: 'tl-control',
    label: '横向控制评审',
    startDate: new Date('2026-07-20'),
    schemaId: GatewaySchema.id,
    attributes: {
      color: '#ef4444',
      status: '待决策',
      priority: '高',
      owner: '控制团队',
      description: '横向控制门禁',
    },
  },
  // 纵向控制算法
  {
    id: 'line-c-002',
    timelineId: 'tl-control',
    label: '纵向控制算法开发',
    startDate: new Date('2026-07-25'),
    endDate: new Date('2026-09-30'),
    schemaId: LinePlanSchema.id,
    attributes: {
      color: '#ef4444',
      progress: 0,
      status: '未开始',
      priority: '高',
      owner: '孙工',
      description: 'PID纵向控制',
    },
  },
  {
    id: 'line-c-002-milestone',
    timelineId: 'tl-control',
    label: '控制算法完成',
    startDate: new Date('2026-10-05'),
    schemaId: MilestoneSchema.id,
    attributes: {
      color: '#ef4444',
      status: '计划中',
      priority: '高',
      owner: '控制团队',
      description: '控制算法交付',
    },
  },
  // 控制模块集成测试
  {
    id: 'line-c-003',
    timelineId: 'tl-control',
    label: '控制模块集成测试',
    startDate: new Date('2026-10-10'),
    endDate: new Date('2026-11-15'),
    schemaId: LinePlanSchema.id,
    attributes: {
      color: '#ef4444',
      progress: 0,
      status: '未开始',
      priority: '高',
      owner: '控制团队',
      description: '控制模块集成',
    },
  },
  {
    id: 'line-c-003-gate',
    timelineId: 'tl-control',
    label: 'FDJ 控制完成',
    startDate: new Date('2026-11-20'),
    schemaId: GatewaySchema.id,
    attributes: {
      color: '#ef4444',
      status: '待决策',
      priority: '高',
      owner: '控制团队',
      description: 'FDJ门禁',
    },
  },

  // ========================================================================
  // Timeline 6: 软件集成
  // ========================================================================
  // 感知模块集成
  {
    id: 'line-i-001',
    timelineId: 'tl-integration',
    label: '感知模块集成',
    startDate: new Date('2026-08-01'),
    endDate: new Date('2026-08-31'),
    schemaId: LinePlanSchema.id,
    attributes: {
      color: '#f59e0b',
      progress: 0,
      status: '未开始',
      priority: '高',
      owner: '集成团队',
      description: '感知算法模块集成',
    },
  },
  {
    id: 'line-i-001-gate',
    timelineId: 'tl-integration',
    label: '感知集成验收',
    startDate: new Date('2026-09-05'),
    schemaId: GatewaySchema.id,
    attributes: {
      color: '#f59e0b',
      status: '待决策',
      priority: '高',
      owner: '集成团队',
      description: '感知集成门禁',
    },
  },
  // 规划决策模块集成
  {
    id: 'line-i-002',
    timelineId: 'tl-integration',
    label: '规划决策模块集成',
    startDate: new Date('2026-09-10'),
    endDate: new Date('2026-10-10'),
    schemaId: LinePlanSchema.id,
    attributes: {
      color: '#f59e0b',
      progress: 0,
      status: '未开始',
      priority: '高',
      owner: '集成团队',
      description: '规划决策模块集成',
    },
  },
  {
    id: 'line-i-002-milestone',
    timelineId: 'tl-integration',
    label: '规划集成完成',
    startDate: new Date('2026-10-15'),
    schemaId: MilestoneSchema.id,
    attributes: {
      color: '#f59e0b',
      status: '计划中',
      priority: '高',
      owner: '集成团队',
      description: '规划模块集成完成',
    },
  },
  // 控制模块集成
  {
    id: 'line-i-003',
    timelineId: 'tl-integration',
    label: '控制模块集成',
    startDate: new Date('2026-10-20'),
    endDate: new Date('2026-11-15'),
    schemaId: LinePlanSchema.id,
    attributes: {
      color: '#f59e0b',
      progress: 0,
      status: '未开始',
      priority: '高',
      owner: '集成团队',
      description: '控制执行模块集成',
    },
  },
  {
    id: 'line-i-003-gate',
    timelineId: 'tl-integration',
    label: 'SDB 软件交付基线',
    startDate: new Date('2026-11-20'),
    schemaId: GatewaySchema.id,
    attributes: {
      color: '#f59e0b',
      status: '待决策',
      priority: '高',
      owner: '集成团队',
      description: '软件交付基线门禁',
    },
  },

  // ========================================================================
  // Timeline 7: 整车测试
  // ========================================================================
  // VP1样车准备
  {
    id: 'line-t-001',
    timelineId: 'tl-testing',
    label: 'VP1 样车准备',
    startDate: new Date('2026-09-01'),
    endDate: new Date('2026-09-30'),
    schemaId: LinePlanSchema.id,
    attributes: {
      color: '#06b6d4',
      progress: 0,
      status: '未开始',
      priority: '高',
      owner: '测试团队',
      description: 'VP1样车准备和集成',
    },
  },
  {
    id: 'line-t-001-milestone',
    timelineId: 'tl-testing',
    label: 'VP1 样车准备完成',
    startDate: new Date('2026-10-05'),
    schemaId: MilestoneSchema.id,
    attributes: {
      color: '#06b6d4',
      status: '计划中',
      priority: '高',
      owner: '测试团队',
      description: 'VP1样车就绪',
    },
  },
  // VP1验证测试
  {
    id: 'line-t-002',
    timelineId: 'tl-testing',
    label: 'VP1 验证测试',
    startDate: new Date('2026-10-10'),
    endDate: new Date('2026-10-31'),
    schemaId: LinePlanSchema.id,
    attributes: {
      color: '#06b6d4',
      progress: 0,
      status: '未开始',
      priority: '高',
      owner: '测试团队',
      description: 'VP1功能验证',
    },
  },
  {
    id: 'line-t-002-gate',
    timelineId: 'tl-testing',
    label: 'VP1 验收',
    startDate: new Date('2026-11-05'),
    schemaId: GatewaySchema.id,
    attributes: {
      color: '#06b6d4',
      status: '待决策',
      priority: '高',
      owner: '测试团队',
      description: 'VP1验收门禁',
    },
  },
  // VP2样车准备
  {
    id: 'line-t-003',
    timelineId: 'tl-testing',
    label: 'VP2 样车准备',
    startDate: new Date('2026-11-10'),
    endDate: new Date('2026-11-30'),
    schemaId: LinePlanSchema.id,
    attributes: {
      color: '#06b6d4',
      progress: 0,
      status: '未开始',
      priority: '高',
      owner: '测试团队',
      description: 'VP2样车准备',
    },
  },
  {
    id: 'line-t-003-milestone',
    timelineId: 'tl-testing',
    label: 'VP2 样车准备完成',
    startDate: new Date('2026-12-05'),
    schemaId: MilestoneSchema.id,
    attributes: {
      color: '#06b6d4',
      status: '计划中',
      priority: '高',
      owner: '测试团队',
      description: 'VP2样车就绪',
    },
  },
  // VP2验证测试
  {
    id: 'line-t-004',
    timelineId: 'tl-testing',
    label: 'VP2 验证测试',
    startDate: new Date('2026-12-10'),
    endDate: new Date('2026-12-31'),
    schemaId: LinePlanSchema.id,
    attributes: {
      color: '#06b6d4',
      progress: 0,
      status: '未开始',
      priority: '高',
      owner: '测试团队',
      description: 'VP2功能和性能验证',
    },
  },
  {
    id: 'line-t-004-gate',
    timelineId: 'tl-testing',
    label: 'VP2 验收',
    startDate: new Date('2027-01-05'),
    schemaId: GatewaySchema.id,
    attributes: {
      color: '#06b6d4',
      status: '待决策',
      priority: '高',
      owner: '测试团队',
      description: 'VP2验收门禁',
    },
  },
];

// ============================================================================
// Relation 定义（依赖关系）- 跨 timeline 和同 timeline 内
// ============================================================================

const relations: Relation[] = [
  // ========================================================================
  // 项目管理 → 其他timeline的依赖
  // ========================================================================
  {
    id: 'rel-pm-to-ee-001',
    type: 'dependency',
    fromLineId: 'line-pm-002', // FC3需求锁定
    toLineId: 'line-ee-001',    // E0架构设计
    properties: {
      dependencyType: 'finish-to-start',
      lag: -45, // 可以提前开始
    },
    attributes: {
      critical: true,
    },
  },

  // ========================================================================
  // 电子电器架构 → 感知算法
  // ========================================================================
  {
    id: 'rel-ee-to-p-001',
    type: 'dependency',
    fromLineId: 'line-ee-001-gate', // E0评审
    toLineId: 'line-p-001-mr1',      // 图像预处理模块
    properties: {
      dependencyType: 'finish-to-start',
      lag: -10, // 可以并行开始
    },
    attributes: {
      critical: true,
    },
  },

  // E0 内部 MR 依赖
  {
    id: 'rel-ee-mr-001',
    type: 'dependency',
    fromLineId: 'line-ee-001',     // 域控架构
    toLineId: 'line-ee-001-mr2',   // 传感器配置
    properties: {
      dependencyType: 'finish-to-start',
      lag: 1,
    },
    attributes: {
      critical: true,
    },
  },
  {
    id: 'rel-ee-mr-002',
    type: 'dependency',
    fromLineId: 'line-ee-001-mr2', // 传感器配置
    toLineId: 'line-ee-001-mr3',   // 系统通信
    properties: {
      dependencyType: 'finish-to-start',
      lag: 1,
    },
    attributes: {
      critical: true,
    },
  },

  // 感知算法内部 MR 依赖
  {
    id: 'rel-p-mr-001',
    type: 'dependency',
    fromLineId: 'line-p-001-mr1',  // 图像预处理
    toLineId: 'line-p-001-mr2',    // 目标检测
    properties: {
      dependencyType: 'finish-to-start',
      lag: 1,
    },
    attributes: {
      critical: true,
    },
  },
  {
    id: 'rel-p-mr-002',
    type: 'dependency',
    fromLineId: 'line-p-001-mr2',  // 目标检测
    toLineId: 'line-p-001-mr3',    // 多帧跟踪
    properties: {
      dependencyType: 'finish-to-start',
      lag: 1,
    },
    attributes: {
      critical: true,
    },
  },
  {
    id: 'rel-p-mr-003',
    type: 'dependency',
    fromLineId: 'line-p-001-mr3',  // 多帧跟踪
    toLineId: 'line-p-001-mr4',    // 语义理解
    properties: {
      dependencyType: 'finish-to-start',
      lag: 1,
    },
    attributes: {
      critical: false, // 可以并行
    },
  },
  {
    id: 'rel-p-mr-to-gate',
    type: 'dependency',
    fromLineId: 'line-p-001-mr4',  // 最后一个MR
    toLineId: 'line-p-001-gate',   // 视觉算法评审
    properties: {
      dependencyType: 'finish-to-start',
      lag: 2,
    },
    attributes: {
      critical: true,
    },
  },

  // ========================================================================
  // 感知算法 → 规划决策
  // ========================================================================
  {
    id: 'rel-p-to-pl-001',
    type: 'dependency',
    fromLineId: 'line-p-001-gate', // 视觉算法评审
    toLineId: 'line-pl-001',        // 行为决策算法
    properties: {
      dependencyType: 'finish-to-start',
      lag: -60, // 可以并行
    },
    attributes: {
      critical: false,
    },
  },

  // ========================================================================
  // 规划决策 → 控制执行
  // ========================================================================
  {
    id: 'rel-pl-to-c-001',
    type: 'dependency',
    fromLineId: 'line-pl-001-gate', // 决策算法评审
    toLineId: 'line-c-001',          // 横向控制
    properties: {
      dependencyType: 'finish-to-start',
      lag: -15, // 可以略微提前
    },
    attributes: {
      critical: true,
    },
  },

  // ========================================================================
  // 各模块 → 软件集成
  // ========================================================================
  {
    id: 'rel-p-to-i-001',
    type: 'dependency',
    fromLineId: 'line-p-003-gate', // 感知算法验收
    toLineId: 'line-i-001',         // 感知模块集成
    properties: {
      dependencyType: 'finish-to-start',
      lag: -5,
    },
    attributes: {
      critical: true,
    },
  },
  {
    id: 'rel-pl-to-i-002',
    type: 'dependency',
    fromLineId: 'line-pl-002-milestone', // 规划算法完成
    toLineId: 'line-i-002',               // 规划模块集成
    properties: {
      dependencyType: 'finish-to-start',
      lag: -10,
    },
    attributes: {
      critical: true,
    },
  },
  {
    id: 'rel-c-to-i-003',
    type: 'dependency',
    fromLineId: 'line-c-002-milestone', // 控制算法完成
    toLineId: 'line-i-003',              // 控制模块集成
    properties: {
      dependencyType: 'finish-to-start',
      lag: 5,
    },
    attributes: {
      critical: true,
    },
  },

  // ========================================================================
  // 软件集成 → 整车测试
  // ========================================================================
  {
    id: 'rel-i-to-t-001',
    type: 'dependency',
    fromLineId: 'line-i-001-gate', // 感知集成验收
    toLineId: 'line-t-001',         // VP1样车准备
    properties: {
      dependencyType: 'finish-to-start',
      lag: -3,
    },
    attributes: {
      critical: true,
    },
  },
  {
    id: 'rel-i-to-t-002',
    type: 'dependency',
    fromLineId: 'line-i-003-gate', // SDB软件交付基线
    toLineId: 'line-t-003',         // VP2样车准备
    properties: {
      dependencyType: 'finish-to-start',
      lag: -10,
    },
    attributes: {
      critical: true,
    },
  },

  // ========================================================================
  // 同Timeline内的顺序依赖（确保不重叠）
  // ========================================================================
  // 电子电器架构内部依赖
  {
    id: 'rel-ee-internal-001',
    type: 'dependency',
    fromLineId: 'line-ee-001-gate',
    toLineId: 'line-ee-002',
    properties: {
      dependencyType: 'finish-to-start',
      lag: 2,
    },
    attributes: {
      critical: true,
    },
  },
  {
    id: 'rel-ee-internal-002',
    type: 'dependency',
    fromLineId: 'line-ee-002-gate',
    toLineId: 'line-ee-003',
    properties: {
      dependencyType: 'finish-to-start',
      lag: 2,
    },
    attributes: {
      critical: true,
    },
  },
  {
    id: 'rel-ee-internal-003',
    type: 'dependency',
    fromLineId: 'line-ee-003-milestone',
    toLineId: 'line-ee-004',
    properties: {
      dependencyType: 'finish-to-start',
      lag: 2,
    },
    attributes: {
      critical: true,
    },
  },
  {
    id: 'rel-ee-internal-004',
    type: 'dependency',
    fromLineId: 'line-ee-004-gate',
    toLineId: 'line-ee-005',
    properties: {
      dependencyType: 'finish-to-start',
      lag: 2,
    },
    attributes: {
      critical: true,
    },
  },

  // 感知算法内部依赖
  {
    id: 'rel-p-internal-001',
    type: 'dependency',
    fromLineId: 'line-p-001-gate',
    toLineId: 'line-p-002',
    properties: {
      dependencyType: 'finish-to-start',
      lag: 2,
    },
    attributes: {
      critical: true,
    },
  },
  {
    id: 'rel-p-internal-002',
    type: 'dependency',
    fromLineId: 'line-p-002-milestone',
    toLineId: 'line-p-003',
    properties: {
      dependencyType: 'finish-to-start',
      lag: 2,
    },
    attributes: {
      critical: true,
    },
  },
  {
    id: 'rel-p-internal-003',
    type: 'dependency',
    fromLineId: 'line-p-003-gate',
    toLineId: 'line-p-004',
    properties: {
      dependencyType: 'finish-to-start',
      lag: 2,
    },
    attributes: {
      critical: true,
    },
  },

  // 规划决策内部依赖
  {
    id: 'rel-pl-internal-001',
    type: 'dependency',
    fromLineId: 'line-pl-001-gate',
    toLineId: 'line-pl-002',
    properties: {
      dependencyType: 'finish-to-start',
      lag: 2,
    },
    attributes: {
      critical: true,
    },
  },
  {
    id: 'rel-pl-internal-002',
    type: 'dependency',
    fromLineId: 'line-pl-002-milestone',
    toLineId: 'line-pl-003',
    properties: {
      dependencyType: 'finish-to-start',
      lag: 2,
    },
    attributes: {
      critical: true,
    },
  },

  // 控制执行内部依赖
  {
    id: 'rel-c-internal-001',
    type: 'dependency',
    fromLineId: 'line-c-001-gate',
    toLineId: 'line-c-002',
    properties: {
      dependencyType: 'finish-to-start',
      lag: 2,
    },
    attributes: {
      critical: true,
    },
  },
  {
    id: 'rel-c-internal-002',
    type: 'dependency',
    fromLineId: 'line-c-002-milestone',
    toLineId: 'line-c-003',
    properties: {
      dependencyType: 'finish-to-start',
      lag: 2,
    },
    attributes: {
      critical: true,
    },
  },

  // 软件集成内部依赖
  {
    id: 'rel-i-internal-001',
    type: 'dependency',
    fromLineId: 'line-i-001-gate',
    toLineId: 'line-i-002',
    properties: {
      dependencyType: 'finish-to-start',
      lag: 2,
    },
    attributes: {
      critical: true,
    },
  },
  {
    id: 'rel-i-internal-002',
    type: 'dependency',
    fromLineId: 'line-i-002-milestone',
    toLineId: 'line-i-003',
    properties: {
      dependencyType: 'finish-to-start',
      lag: 2,
    },
    attributes: {
      critical: true,
    },
  },

  // 整车测试内部依赖
  {
    id: 'rel-t-internal-001',
    type: 'dependency',
    fromLineId: 'line-t-001-milestone',
    toLineId: 'line-t-002',
    properties: {
      dependencyType: 'finish-to-start',
      lag: 2,
    },
    attributes: {
      critical: true,
    },
  },
  {
    id: 'rel-t-internal-002',
    type: 'dependency',
    fromLineId: 'line-t-002-gate',
    toLineId: 'line-t-003',
    properties: {
      dependencyType: 'finish-to-start',
      lag: 2,
    },
    attributes: {
      critical: true,
    },
  },
  {
    id: 'rel-t-internal-003',
    type: 'dependency',
    fromLineId: 'line-t-003-milestone',
    toLineId: 'line-t-004',
    properties: {
      dependencyType: 'finish-to-start',
      lag: 2,
    },
    attributes: {
      critical: true,
    },
  },
];

// ============================================================================
// Baseline 定义（整车开发关键基线）
// ============================================================================

const baselines: Baseline[] = [
  // 项目启动基线
  {
    id: 'baseline-001',
    date: new Date('2026-01-15'),
    label: 'PTR 技术要求评审',
    color: '#8b5cf6',
    attributes: {
      type: '项目启动',
      critical: true,
      description: '项目技术要求评审通过，正式启动',
    },
  },
  // 需求锁定基线
  {
    id: 'baseline-002',
    date: new Date('2026-03-31'),
    label: 'FC3 需求锁定',
    color: '#f59e0b',
    attributes: {
      type: '需求锁定',
      critical: true,
      description: '功能需求完全锁定',
    },
  },
  // 架构冻结基线
  {
    id: 'baseline-003',
    date: new Date('2026-05-05'),
    label: 'E1 架构冻结',
    color: '#3b82f6',
    attributes: {
      type: '架构冻结',
      critical: true,
      description: '电子架构方案冻结',
    },
  },
  // 项目批准基线
  {
    id: 'baseline-004',
    date: new Date('2026-06-30'),
    label: 'PA 项目批准',
    color: '#10b981',
    attributes: {
      type: '项目批准',
      critical: true,
      description: '项目正式批准，全面启动开发',
    },
  },
  // 软件集成基线
  {
    id: 'baseline-005',
    date: new Date('2026-09-05'),
    label: '感知算法集成基线',
    color: '#10b981',
    attributes: {
      type: '软件集成',
      critical: true,
      description: '感知算法模块集成完成',
    },
  },
  // VP1交付基线
  {
    id: 'baseline-006',
    date: new Date('2026-10-05'),
    label: 'VP1 样车交付',
    color: '#06b6d4',
    attributes: {
      type: '样车交付',
      critical: true,
      description: 'VP1样车准备完成，开始测试',
    },
  },
  // 生产准备基线
  {
    id: 'baseline-007',
    date: new Date('2026-10-15'),
    label: 'LR 投产准备就绪',
    color: '#10b981',
    attributes: {
      type: '生产准备',
      critical: true,
      description: '量产准备就绪',
    },
  },
  // VP1验收基线
  {
    id: 'baseline-008',
    date: new Date('2026-11-05'),
    label: 'VP1 验收通过',
    color: '#06b6d4',
    attributes: {
      type: '验收',
      critical: true,
      description: 'VP1样车验收通过',
    },
  },
  // FDJ基线
  {
    id: 'baseline-009',
    date: new Date('2026-11-05'),
    label: 'FDJ 数据判定',
    color: '#f59e0b',
    attributes: {
      type: '数据冻结',
      critical: true,
      description: '最终数据判定完成',
    },
  },
  // SDB基线
  {
    id: 'baseline-010',
    date: new Date('2026-11-20'),
    label: 'SDB 软件交付基线',
    color: '#f59e0b',
    attributes: {
      type: '软件交付',
      critical: true,
      description: '软件交付基线达成',
    },
  },
  // VP2交付基线
  {
    id: 'baseline-011',
    date: new Date('2026-12-05'),
    label: 'VP2 样车交付',
    color: '#06b6d4',
    attributes: {
      type: '样车交付',
      critical: true,
      description: 'VP2样车准备完成，开始测试',
    },
  },
  // 最终验收基线
  {
    id: 'baseline-012',
    date: new Date('2027-01-05'),
    label: 'VP2 最终验收',
    color: '#10b981',
    attributes: {
      type: '最终验收',
      critical: true,
      description: 'VP2样车最终验收，项目完成',
    },
  },
];

// ============================================================================
// 导出完整的 TimePlan
// ============================================================================

export const orionXTimePlan: TimePlan = {
  id: 'orion-x-2026-full-v3',
  title: 'Orion X 智能驾驶平台 2026 年度计划（完整版）',
  owner: '项目办',
  description: 'Orion X 平台年度开发计划 - v3优化版：时间不重叠，每个bar后都有门禁/里程碑，完整基线数据',
  schemaId: 'default-timeplan-schema',
  timelines,
  lines,
  relations,
  baselines,
  viewConfig: {
    scale: 'month',
    startDate: new Date('2025-12-01'),
    endDate: new Date('2027-01-31'),
    isEditMode: false,
  },
  createdAt: new Date('2026-01-01'),
  lastAccessTime: new Date('2026-01-27'),
  createdBy: '系统管理员',
  tags: ['智能驾驶', 'Orion X', '2026年度计划', 'v3优化版', '完整基线'],
};
