/**
 * Mock Data 生成器
 * 
 * 📋 迁移信息:
 * - 基于原项目的 sampleTimelineData.ts
 * - 迁移日期: 2026-02-03
 * - 功能: 生成基于 Schema 的丰富示例数据
 * 
 * 🎯 特性:
 * - 支持 bar/milestone/gateway 三种类型
 * - 包含丰富的属性数据
 * - 包含依赖关系
 * - 包含基线标记
 */

import { TimePlan, Timeline, Line, Relation } from '@/types/timeplanSchema';
import { addDays, addMonths, subMonths } from 'date-fns';
import { generateId } from './uuid';
import { DEFAULT_SCHEMAS } from '@/schemas/defaultSchemas';

// 基准日期设置为 3 个月前，确保数据在当前视图中可见
const baseDate = subMonths(new Date(), 3);

// 颜色方案
const COLORS = {
  primary: '#1677ff',
  success: '#52c41a',
  warning: '#faad14',
  error: '#ff4d4f',
  purple: '#722ed1',
  cyan: '#13c2c2',
  magenta: '#eb2f96',
  orange: '#fa8c16',
};

/**
 * 生成示例 TimePlan
 */
export function generateMockTimePlan(includeData: boolean = true): TimePlan {
  const plan: TimePlan = {
    id: generateId('plan'),
    title: '工程效能提升计划',
    owner: 'System Admin',
    description: '2025年度工程效能提升项目规划',
    schemas: DEFAULT_SCHEMAS,
    timelines: [],
    lines: [],
    relations: [],
    baselines: [],
    baselineRanges: [],
    createdAt: new Date(),
    lastAccessTime: new Date(),
    tags: ['工程效能', 'DevOps', '2025'],
  };

  if (!includeData) {
    return plan;
  }

  // 生成 Timelines
  const timelines: Timeline[] = [
    {
      id: generateId('timeline'),
      title: '统一包管理工具 - NixPkg',
      description: '负责人：Kai MAN',
      owner: 'Kai MAN',
      color: COLORS.primary,
      collapsed: false,
      order: 1,
    },
    {
      id: generateId('timeline'),
      title: '统一的服务自动化测试',
      description: '负责人：Albert CHENG',
      owner: 'Albert CHENG',
      color: COLORS.success,
      collapsed: false,
      order: 2,
    },
    {
      id: generateId('timeline'),
      title: '统一标准开发集成体验',
      description: '负责人：Ganggang YU',
      owner: 'Ganggang YU',
      color: COLORS.warning,
      collapsed: false,
      order: 3,
    },
    {
      id: generateId('timeline'),
      title: '统一的平台发布管理系统',
      description: '负责人：Haisong ZOU',
      owner: 'Haisong ZOU',
      color: COLORS.purple,
      collapsed: false,
      order: 4,
    },
    {
      id: generateId('timeline'),
      title: '精准化自研台架',
      description: '负责人：Qinghua MA',
      owner: 'Qinghua MA',
      color: COLORS.cyan,
      collapsed: false,
      order: 5,
    },
    {
      id: generateId('timeline'),
      title: 'NVOS Simulator/Emulator',
      description: '负责人：Wei wei WANG',
      owner: 'Wei wei WANG',
      color: COLORS.magenta,
      collapsed: false,
      order: 6,
    },
  ];

  plan.timelines = timelines;

  // 生成 Lines
  const lines: Line[] = [];

  // Timeline 1: NixPkg
  lines.push(
    {
      id: generateId('line'),
      timelineId: timelines[0].id,
      title: '统一的软件管理方案和dpam工具POC',
      startDate: addDays(baseDate, 0),
      endDate: addDays(baseDate, 60),
      schemaId: 'bar-schema',
      attributes: {
        progress: 85,
        status: 'in-progress',
        priority: 'high',
        assignee: 'Kai MAN',
        color: COLORS.primary,
      },
      notes: 'POC阶段，验证技术可行性',
    },
    {
      id: generateId('line'),
      timelineId: timelines[0].id,
      title: 'Peanut V1.0',
      startDate: addDays(baseDate, 70),
      endDate: null,
      schemaId: 'milestone-schema',
      attributes: {
        type: 'release',
        status: 'planned',
        color: COLORS.success,
      },
      notes: 'Peanut 工具首个正式版本发布',
    },
    {
      id: generateId('line'),
      timelineId: timelines[0].id,
      title: 'NVOS/Zone支持NixPkg',
      startDate: addDays(baseDate, 100),
      endDate: addDays(baseDate, 150),
      schemaId: 'bar-schema',
      attributes: {
        progress: 30,
        status: 'in-progress',
        priority: 'high',
        assignee: 'Dev Team',
        color: COLORS.primary,
      },
    },
    {
      id: generateId('line'),
      timelineId: timelines[0].id,
      title: 'G1',
      startDate: addDays(baseDate, 180),
      endDate: null,
      schemaId: 'gateway-schema',
      attributes: {
        type: 'gate',
        status: 'pending',
        color: COLORS.error,
      },
      notes: '第一个质量门禁检查点',
    },
  );

  // Timeline 2: 自动化测试
  lines.push(
    {
      id: generateId('line'),
      timelineId: timelines[1].id,
      title: 'V0.1高昂接口协议',
      startDate: addDays(baseDate, -20),
      endDate: addDays(baseDate, 30),
      schemaId: 'bar-schema',
      attributes: {
        progress: 100,
        status: 'completed',
        priority: 'medium',
        assignee: 'Albert CHENG',
        color: COLORS.success,
      },
    },
    {
      id: generateId('line'),
      timelineId: timelines[1].id,
      title: 'ZoneVDF simulator协作调试',
      startDate: addDays(baseDate, 60),
      endDate: addDays(baseDate, 110),
      schemaId: 'bar-schema',
      attributes: {
        progress: 60,
        status: 'in-progress',
        priority: 'high',
        assignee: 'Test Team',
        color: COLORS.success,
      },
    },
    {
      id: generateId('line'),
      timelineId: timelines[1].id,
      title: 'V2.0',
      startDate: addDays(baseDate, 130),
      endDate: null,
      schemaId: 'milestone-schema',
      attributes: {
        type: 'release',
        status: 'planned',
        color: COLORS.success,
      },
    },
  );

  // Timeline 3: 开发集成体验
  lines.push(
    {
      id: generateId('line'),
      timelineId: timelines[2].id,
      title: 'NTsapi技术标准',
      startDate: addDays(baseDate, 80),
      endDate: addDays(baseDate, 140),
      schemaId: 'bar-schema',
      attributes: {
        progress: 45,
        status: 'in-progress',
        priority: 'medium',
        assignee: 'Ganggang YU',
        color: COLORS.warning,
      },
    },
    {
      id: generateId('line'),
      timelineId: timelines[2].id,
      title: '对接认证管理平台',
      startDate: addDays(baseDate, 160),
      endDate: addDays(baseDate, 220),
      schemaId: 'bar-schema',
      attributes: {
        progress: 0,
        status: 'not-started',
        priority: 'medium',
        assignee: 'Platform Team',
        color: COLORS.warning,
      },
    },
    {
      id: generateId('line'),
      timelineId: timelines[2].id,
      title: 'G2',
      startDate: addDays(baseDate, 240),
      endDate: null,
      schemaId: 'gateway-schema',
      attributes: {
        type: 'checkpoint',
        status: 'pending',
        color: COLORS.warning,
      },
    },
  );

  // Timeline 4: 发布管理
  lines.push(
    {
      id: generateId('line'),
      timelineId: timelines[3].id,
      title: 'V0.2力变型POC',
      startDate: addDays(baseDate, -40),
      endDate: addDays(baseDate, 0),
      schemaId: 'bar-schema',
      attributes: {
        progress: 100,
        status: 'completed',
        priority: 'high',
        assignee: 'Haisong ZOU',
        color: COLORS.purple,
      },
    },
    {
      id: generateId('line'),
      timelineId: timelines[3].id,
      title: 'V0.2流水线包服务',
      startDate: addDays(baseDate, 20),
      endDate: addDays(baseDate, 80),
      schemaId: 'bar-schema',
      attributes: {
        progress: 70,
        status: 'in-progress',
        priority: 'high',
        assignee: 'Pipeline Team',
        color: COLORS.purple,
      },
    },
    {
      id: generateId('line'),
      timelineId: timelines[3].id,
      title: 'V1.0',
      startDate: addDays(baseDate, 100),
      endDate: null,
      schemaId: 'milestone-schema',
      attributes: {
        type: 'release',
        status: 'planned',
        color: COLORS.success,
      },
    },
    {
      id: generateId('line'),
      timelineId: timelines[3].id,
      title: 'V1.0发布平台API',
      startDate: addDays(baseDate, 140),
      endDate: addDays(baseDate, 210),
      schemaId: 'bar-schema',
      attributes: {
        progress: 20,
        status: 'not-started',
        priority: 'medium',
        assignee: 'API Team',
        color: COLORS.purple,
      },
    },
  );

  // Timeline 5: 自研台架
  lines.push(
    {
      id: generateId('line'),
      timelineId: timelines[4].id,
      title: '平台自测试用',
      startDate: addDays(baseDate, 40),
      endDate: addDays(baseDate, 90),
      schemaId: 'bar-schema',
      attributes: {
        progress: 55,
        status: 'in-progress',
        priority: 'medium',
        assignee: 'Qinghua MA',
        color: COLORS.cyan,
      },
    },
    {
      id: generateId('line'),
      timelineId: timelines[4].id,
      title: 'CCC验证',
      startDate: addDays(baseDate, 110),
      endDate: null,
      schemaId: 'milestone-schema',
      attributes: {
        type: 'review',
        status: 'planned',
        color: COLORS.warning,
      },
    },
    {
      id: generateId('line'),
      timelineId: timelines[4].id,
      title: 'CI/Zone全车测试',
      startDate: addDays(baseDate, 160),
      endDate: addDays(baseDate, 240),
      schemaId: 'bar-schema',
      attributes: {
        progress: 0,
        status: 'not-started',
        priority: 'high',
        assignee: 'QA Team',
        color: COLORS.cyan,
      },
    },
  );

  // Timeline 6: NVOS Simulator
  lines.push(
    {
      id: generateId('line'),
      timelineId: timelines[5].id,
      title: 'MCU(Cortex-MT) PoC',
      startDate: addDays(baseDate, 60),
      endDate: addDays(baseDate, 120),
      schemaId: 'bar-schema',
      attributes: {
        progress: 40,
        status: 'in-progress',
        priority: 'high',
        assignee: 'Wei wei WANG',
        color: COLORS.magenta,
      },
    },
    {
      id: generateId('line'),
      timelineId: timelines[5].id,
      title: 'MCU V1.0',
      startDate: addDays(baseDate, 160),
      endDate: null,
      schemaId: 'milestone-schema',
      attributes: {
        type: 'delivery',
        status: 'planned',
        color: COLORS.primary,
      },
    },
    {
      id: generateId('line'),
      timelineId: timelines[5].id,
      title: 'MPU(A55) PoC',
      startDate: addDays(baseDate, 220),
      endDate: addDays(baseDate, 280),
      schemaId: 'bar-schema',
      attributes: {
        progress: 0,
        status: 'not-started',
        priority: 'medium',
        assignee: 'Hardware Team',
        color: COLORS.magenta,
      },
    },
  );

  plan.lines = lines;

  // 生成 Relations (依赖关系)
  const relations: Relation[] = [];

  // Timeline 1 内部依赖链
  if (lines.length >= 4) {
    relations.push(
      {
        id: generateId('relation'),
        type: 'dependency',
        fromLineId: lines[0].id,
        toLineId: lines[1].id,
        properties: {
          dependencyType: 'finish-to-start',
          lag: 0,
        },
        displayConfig: {
          visible: true,
          lineStyle: 'solid',
          lineColor: '#64748b',
          lineWidth: 2,
          showArrow: true,
        },
      },
      {
        id: generateId('relation'),
        type: 'dependency',
        fromLineId: lines[1].id,
        toLineId: lines[2].id,
        properties: {
          dependencyType: 'finish-to-start',
          lag: 0,
        },
        displayConfig: {
          visible: true,
          lineStyle: 'solid',
          lineColor: '#64748b',
          lineWidth: 2,
          showArrow: true,
        },
      },
      {
        id: generateId('relation'),
        type: 'dependency',
        fromLineId: lines[2].id,
        toLineId: lines[3].id,
        properties: {
          dependencyType: 'finish-to-start',
          lag: 0,
        },
        displayConfig: {
          visible: true,
          lineStyle: 'solid',
          lineColor: '#64748b',
          lineWidth: 2,
          showArrow: true,
        },
      },
    );
  }

  // Timeline 4 内部依赖链
  if (lines.length >= 14) {
    relations.push(
      {
        id: generateId('relation'),
        type: 'dependency',
        fromLineId: lines[10].id,
        toLineId: lines[11].id,
        properties: {
          dependencyType: 'finish-to-start',
        },
        displayConfig: {
          visible: true,
          lineStyle: 'solid',
          lineColor: '#64748b',
          lineWidth: 2,
          showArrow: true,
        },
      },
      {
        id: generateId('relation'),
        type: 'dependency',
        fromLineId: lines[11].id,
        toLineId: lines[12].id,
        properties: {
          dependencyType: 'finish-to-start',
        },
        displayConfig: {
          visible: true,
          lineStyle: 'solid',
          lineColor: '#64748b',
          lineWidth: 2,
          showArrow: true,
        },
      },
    );
  }

  // 跨 Timeline 依赖
  if (lines.length >= 18) {
    relations.push(
      {
        id: generateId('relation'),
        type: 'dependency',
        fromLineId: lines[5].id, // ZoneVDF simulator
        toLineId: lines[7].id,   // NTsapi技术标准
        properties: {
          dependencyType: 'finish-to-start',
        },
        displayConfig: {
          visible: true,
          lineStyle: 'dashed',
          lineColor: '#64748b',
          lineWidth: 1,
          showArrow: true,
        },
      },
      {
        id: generateId('relation'),
        type: 'dependency',
        fromLineId: lines[15].id, // CCC验证
        toLineId: lines[16].id,  // CI/Zone全车测试
        properties: {
          dependencyType: 'finish-to-start',
        },
        displayConfig: {
          visible: true,
          lineStyle: 'solid',
          lineColor: '#64748b',
          lineWidth: 2,
          showArrow: true,
        },
      },
    );
  }

  plan.relations = relations;

  // 生成基线
  plan.baselines = [
    {
      id: generateId('baseline'),
      date: addDays(baseDate, 90),
      label: 'G1 封版',
      color: COLORS.error,
    },
    {
      id: generateId('baseline'),
      date: addDays(baseDate, 180),
      label: 'V1.0 发布',
      color: COLORS.success,
    },
    {
      id: generateId('baseline'),
      date: addDays(baseDate, 270),
      label: 'G2 封版',
      color: COLORS.primary,
    },
  ];

  return plan;
}

/**
 * 给现有计划添加 mock 数据
 */
export function addMockDataToPlan(plan: TimePlan): TimePlan {
  const mockPlan = generateMockTimePlan(true);
  
  return {
    ...plan,
    schemas: mockPlan.schemas,
    timelines: mockPlan.timelines,
    lines: mockPlan.lines,
    relations: mockPlan.relations,
    baselines: mockPlan.baselines,
  };
}
