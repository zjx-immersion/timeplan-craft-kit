/**
 * 测试数据生成器
 * 
 * 基于完整的 TimePlan Schema 生成测试数据
 * 与 UI 组件完全解耦
 * 
 * @version 1.0.0
 * @date 2026-02-03
 */

import { 
  TimePlan, 
  Timeline, 
  Line, 
  Relation,
  Baseline,
  BaselineRange,
  DependencyType 
} from '@/types/timeplanSchema';
import { v4 as uuidv4 } from 'uuid';
import { addDays, addWeeks, addMonths } from 'date-fns';

/**
 * 生成选项
 */
export interface GeneratorOptions {
  numTimelines?: number;      // 时间线数量
  numLinesPerTimeline?: number; // 每个时间线的节点数量
  relationDensity?: number;    // 依赖关系密度（0-1）
  includeBaselines?: boolean;  // 是否包含基线
  startDate?: Date;            // 开始日期
}

/**
 * 默认选项
 */
const DEFAULT_OPTIONS: GeneratorOptions = {
  numTimelines: 3,
  numLinesPerTimeline: 5,
  relationDensity: 0.3,
  includeBaselines: true,
  startDate: new Date(),
};

/**
 * 生成时间线
 */
export function generateTimeline(index: number): Timeline {
  const teams = ['前端团队', '后端团队', '测试团队', '产品团队', '设计团队'];
  const owners = ['张三', '李四', '王五', '赵六', '钱七'];
  
  return {
    id: uuidv4(),
    name: teams[index % teams.length],
    owner: owners[index % owners.length],
    lineIds: [],
    attributes: {
      department: '研发中心',
      location: '北京',
      capacity: 10,
    },
  };
}

/**
 * 生成节点（Line）
 */
export function generateLine(
  timelineId: string,
  index: number,
  startDate: Date
): Line {
  const types = ['bar', 'milestone', 'gateway'] as const;
  const type = types[index % 3];
  const schemaId = `${type}-schema`;
  
  const start = addDays(startDate, index * 7);
  const end = type === 'bar' ? addWeeks(start, 2) : undefined;
  
  const statuses = ['pending', 'in-progress', 'completed', 'blocked'];
  const priorities = ['low', 'medium', 'high', 'critical'];
  const colors = ['#1890ff', '#52c41a', '#fa8c16', '#f5222d'];
  
  return {
    id: uuidv4(),
    timelineId,
    label: type === 'bar' 
      ? `任务 ${index + 1}`
      : type === 'milestone'
      ? `里程碑 ${index + 1}`
      : `网关 ${index + 1}`,
    startDate: start,
    endDate: end,
    schemaId,
    attributes: {
      status: statuses[index % statuses.length],
      priority: priorities[index % priorities.length],
      color: colors[index % colors.length],
      description: `这是一个测试${type === 'bar' ? '任务' : type === 'milestone' ? '里程碑' : '网关'}`,
      assignee: ['张三', '李四', '王五'][index % 3],
      progress: type === 'bar' ? Math.floor(Math.random() * 100) : undefined,
    },
    notes: `备注信息 ${index + 1}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * 生成依赖关系
 */
export function generateRelations(
  lines: Line[],
  density: number = 0.3
): Relation[] {
  const relations: Relation[] = [];
  const dependencyTypes: DependencyType[] = [
    'finish-to-start',
    'start-to-start',
    'finish-to-finish',
    'start-to-finish',
  ];
  
  for (let i = 0; i < lines.length - 1; i++) {
    // 根据密度决定是否创建关系
    if (Math.random() > density) continue;
    
    const fromLine = lines[i];
    const toLine = lines[i + 1];
    
    relations.push({
      id: uuidv4(),
      type: 'dependency',
      fromLineId: fromLine.id,
      toLineId: toLine.id,
      properties: {
        dependencyType: dependencyTypes[i % dependencyTypes.length],
        lag: 0,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  
  return relations;
}

/**
 * 生成基线
 */
export function generateBaselines(lines: Line[]): Baseline[] {
  const baselines: Baseline[] = [];
  const colors = ['#ff4d4f', '#52c41a', '#1890ff', '#fa8c16'];
  
  // 为每个里程碑生成基线
  const milestones = lines.filter(line => line.schemaId === 'milestone-schema');
  
  milestones.forEach((milestone, index) => {
    baselines.push({
      id: uuidv4(),
      label: `基线 ${index + 1}`,
      date: milestone.startDate,
      color: colors[index % colors.length],
      lineId: milestone.id,
      description: `${milestone.label} 的基线标记`,
    });
  });
  
  return baselines;
}

/**
 * 生成基线范围
 */
export function generateBaselineRanges(lines: Line[]): BaselineRange[] {
  const ranges: BaselineRange[] = [];
  const colors = ['rgba(255, 77, 79, 0.1)', 'rgba(82, 196, 26, 0.1)', 'rgba(24, 144, 255, 0.1)'];
  
  // 每3个节点创建一个基线范围
  for (let i = 0; i < lines.length; i += 3) {
    const startLine = lines[i];
    const endLine = lines[Math.min(i + 2, lines.length - 1)];
    
    if (startLine && endLine) {
      ranges.push({
        id: uuidv4(),
        label: `阶段 ${Math.floor(i / 3) + 1}`,
        startDate: startLine.startDate,
        endDate: endLine.endDate || addWeeks(endLine.startDate, 2),
        color: colors[Math.floor(i / 3) % colors.length],
        description: `项目阶段 ${Math.floor(i / 3) + 1}`,
      });
    }
  }
  
  return ranges;
}

/**
 * 生成完整的 TimePlan
 */
export function generateTimePlan(
  title: string = '测试项目',
  options: GeneratorOptions = {}
): TimePlan {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const now = opts.startDate!;
  
  // 生成时间线
  const timelines: Timeline[] = [];
  for (let i = 0; i < opts.numTimelines!; i++) {
    timelines.push(generateTimeline(i));
  }
  
  // 生成节点
  const lines: Line[] = [];
  timelines.forEach((timeline, tIndex) => {
    const timelineLines: Line[] = [];
    for (let i = 0; i < opts.numLinesPerTimeline!; i++) {
      const line = generateLine(
        timeline.id,
        tIndex * opts.numLinesPerTimeline! + i,
        now
      );
      lines.push(line);
      timelineLines.push(line);
    }
    // 更新时间线的 lineIds
    timeline.lineIds = timelineLines.map(l => l.id);
  });
  
  // 生成依赖关系
  const relations = generateRelations(lines, opts.relationDensity);
  
  // 生成基线
  const baselines = opts.includeBaselines ? generateBaselines(lines) : [];
  const baselineRanges = opts.includeBaselines ? generateBaselineRanges(lines) : [];
  
  return {
    id: uuidv4(),
    title,
    owner: '项目经理',
    schemaId: 'default-schema',
    timelines,
    lines,
    relations,
    baselines,
    baselineRanges,
    viewConfig: {
      startDate: now,
      endDate: addMonths(now, 6),
      zoomLevel: 'week',
      showWeekends: true,
      showHolidays: true,
    },
    createdAt: now,
    lastAccessTime: now,
    updatedAt: now,
  };
}

/**
 * 生成多个 TimePlan
 */
export function generateMultiplePlans(count: number = 3): TimePlan[] {
  const plans: TimePlan[] = [];
  const projectNames = [
    'Orion X 项目',
    '猎户座平台',
    'Apollo 系统',
    'Phoenix 重构',
    'Dragon 新功能',
  ];
  
  for (let i = 0; i < count; i++) {
    plans.push(
      generateTimePlan(projectNames[i % projectNames.length], {
        numTimelines: 2 + i,
        numLinesPerTimeline: 3 + i * 2,
        relationDensity: 0.2 + i * 0.1,
        startDate: addWeeks(new Date(), i * 4),
      })
    );
  }
  
  return plans;
}

/**
 * 生成大规模测试数据（性能测试）
 */
export function generateLargeTimePlan(
  numTimelines: number = 10,
  numLinesPerTimeline: number = 100
): TimePlan {
  return generateTimePlan('大规模测试项目', {
    numTimelines,
    numLinesPerTimeline,
    relationDensity: 0.1,
    includeBaselines: false,
  });
}

/**
 * 生成最小测试数据
 */
export function generateMinimalTimePlan(): TimePlan {
  return generateTimePlan('最小测试项目', {
    numTimelines: 1,
    numLinesPerTimeline: 3,
    relationDensity: 0.5,
    includeBaselines: false,
  });
}

/**
 * 生成包含所有节点类型的测试数据
 */
export function generateFullFeaturedPlan(): TimePlan {
  const plan = generateTimePlan('完整功能测试项目', {
    numTimelines: 3,
    numLinesPerTimeline: 9, // 确保包含所有类型
    relationDensity: 0.5,
    includeBaselines: true,
  });
  
  return plan;
}
