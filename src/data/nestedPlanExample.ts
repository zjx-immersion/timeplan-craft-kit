import { TimelinePlanData, TimelineNode, MultiIterationConfig } from '@/types/timeline';
import { addDays } from 'date-fns';

const baseDate = new Date('2026-01-01');

/**
 * 示例1: 普通嵌套计划
 * 一个 line 节点展开后包含完整的子 timeplan
 */
const nestedTimeplanExample: TimelineNode = {
  id: 'node-nested-1',
  type: 'line',
  label: '📋 前端开发计划',
  startDate: addDays(baseDate, 0),
  endDate: addDays(baseDate, 120),
  timelineId: 'tl-main-1',
  color: '#3b82f6', // blue
  planReference: {
    planId: 'nested-plan-frontend',
    templateType: 'nested-timeplan',
    isExpanded: false,
    nestedPlan: {
      id: 'nested-plan-frontend',
      title: '前端开发详细计划',
      owner: 'Frontend Team',
      timelines: [
        {
          id: 'nested-tl-ui',
          name: 'UI 组件库',
          owner: 'UI Team',
          nodes: [
            {
              id: 'nested-node-ui-1',
              type: 'bar',
              label: '基础组件开发',
              startDate: addDays(baseDate, 0),
              endDate: addDays(baseDate, 30),
              timelineId: 'nested-tl-ui',
            },
            {
              id: 'nested-node-ui-2',
              type: 'bar',
              label: '高级组件开发',
              startDate: addDays(baseDate, 35),
              endDate: addDays(baseDate, 60),
              timelineId: 'nested-tl-ui',
            },
            {
              id: 'nested-node-ui-3',
              type: 'milestone',
              label: 'UI 组件库 v1.0 发布',
              startDate: addDays(baseDate, 65),
              timelineId: 'nested-tl-ui',
              color: '#10b981', // green
            },
          ],
        },
        {
          id: 'nested-tl-pages',
          name: '页面开发',
          owner: 'Page Team',
          nodes: [
            {
              id: 'nested-node-pages-1',
              type: 'bar',
              label: '首页开发',
              startDate: addDays(baseDate, 40),
              endDate: addDays(baseDate, 70),
              timelineId: 'nested-tl-pages',
            },
            {
              id: 'nested-node-pages-2',
              type: 'bar',
              label: '详情页开发',
              startDate: addDays(baseDate, 75),
              endDate: addDays(baseDate, 100),
              timelineId: 'nested-tl-pages',
            },
          ],
        },
      ],
      dependencies: [
        {
          id: 'nested-dep-1',
          fromNodeId: 'nested-node-ui-1',
          toNodeId: 'nested-node-ui-2',
          type: 'finish-to-start',
        },
        {
          id: 'nested-dep-2',
          fromNodeId: 'nested-node-ui-2',
          toNodeId: 'nested-node-pages-1',
          type: 'start-to-start',
        },
      ],
    },
  },
};

/**
 * 示例2: 多迭代计划
 * 用于多团队并行迭代的场景
 */
const multiIterationExample: TimelineNode = {
  id: 'node-iteration-1',
  type: 'line',
  label: '🔄 敏捷迭代计划',
  startDate: addDays(baseDate, 0),
  endDate: addDays(baseDate, 180),
  timelineId: 'tl-main-1',
  color: '#8b5cf6', // purple
  planReference: {
    planId: 'iteration-plan-agile',
    templateType: 'multi-iteration',
    isExpanded: false,
    iterationConfig: {
      teamCount: 3,           // 3个团队
      iterationDuration: 14,  // 每个迭代14天（2周）
      iterationInterval: 0,   // 迭代之间无间隔
      iterationCount: 6,      // 6个迭代
      startOffset: 0,         // 从第0天开始
    },
  },
};

/**
 * 示例计划数据
 */
export const nestedPlanExampleData: TimelinePlanData = {
  id: 'nested-plan-example',
  title: '嵌套计划示例',
  owner: 'Demo Team',
  timelines: [
    {
      id: 'tl-main-1',
      name: '主计划',
      owner: 'Project Manager',
      nodes: [
        nestedTimeplanExample,
        multiIterationExample,
        {
          id: 'node-phase-1',
          type: 'bar',
          label: '需求分析',
          startDate: addDays(baseDate, -30),
          endDate: addDays(baseDate, 0),
          timelineId: 'tl-main-1',
        },
        {
          id: 'node-milestone-1',
          type: 'milestone',
          label: '项目启动',
          startDate: baseDate,
          timelineId: 'tl-main-1',
          color: '#f59e0b', // amber
        },
      ],
    },
    {
      id: 'tl-backend',
      name: '后端开发',
      owner: 'Backend Team',
      nodes: [
        {
          id: 'node-backend-1',
          type: 'bar',
          label: 'API 设计',
          startDate: addDays(baseDate, 0),
          endDate: addDays(baseDate, 20),
          timelineId: 'tl-backend',
        },
        {
          id: 'node-backend-2',
          type: 'bar',
          label: '核心功能开发',
          startDate: addDays(baseDate, 25),
          endDate: addDays(baseDate, 80),
          timelineId: 'tl-backend',
        },
        {
          id: 'node-backend-3',
          type: 'gateway',
          label: '后端 v1.0 就绪',
          startDate: addDays(baseDate, 85),
          timelineId: 'tl-backend',
          color: '#10b981', // green
        },
      ],
    },
  ],
  dependencies: [
    {
      id: 'dep-main-1',
      fromNodeId: 'node-phase-1',
      toNodeId: 'node-milestone-1',
      type: 'finish-to-start',
    },
    {
      id: 'dep-main-2',
      fromNodeId: 'node-milestone-1',
      toNodeId: 'node-nested-1',
      type: 'finish-to-start',
    },
    {
      id: 'dep-main-3',
      fromNodeId: 'node-milestone-1',
      toNodeId: 'node-backend-1',
      type: 'finish-to-start',
    },
  ],
};

// ============================================================================
// 工具函数：生成多迭代节点
// ============================================================================

/**
 * 根据多迭代配置生成节点
 * 
 * @param config 多迭代配置
 * @param baseDate 起始日期
 * @param baseId 基础 ID 前缀
 * @returns 生成的节点数组
 */
export function generateIterationNodes(
  config: MultiIterationConfig,
  baseDateParam: Date,
  baseId: string
): TimelineNode[][] {
  const teams: TimelineNode[][] = [];
  
  for (let teamIdx = 0; teamIdx < config.teamCount; teamIdx++) {
    const teamNodes: TimelineNode[] = [];
    
    for (let iterIdx = 0; iterIdx < config.iterationCount; iterIdx++) {
      const startDay = config.startOffset + 
                      iterIdx * (config.iterationDuration + config.iterationInterval);
      const endDay = startDay + config.iterationDuration;
      
      teamNodes.push({
        id: `${baseId}-team${teamIdx + 1}-iter${iterIdx + 1}`,
        type: 'bar',
        label: `T${teamIdx + 1} - Sprint ${iterIdx + 1}`,
        startDate: addDays(baseDateParam, startDay),
        endDate: addDays(baseDateParam, endDay),
        timelineId: `${baseId}-tl-team${teamIdx + 1}`,
      });
    }
    
    teams.push(teamNodes);
  }
  
  return teams;
}

export default nestedPlanExampleData;
