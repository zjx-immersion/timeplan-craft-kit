/**
 * 数据迁移脚本：v1 → v2
 * 
 * 将现有的 v1 格式数据（TimelinePlanData）转换为 v2 格式（TimePlan）
 * 
 * @version 2.1.0
 * @date 2026-01-25
 */

import { TimelinePlanData, TimelineNode } from '../src/types/timeline';
import { TimePlan, Line, Timeline, Relation } from '../src/types/timeplanSchema';
import { BarSchema, MilestoneSchema, GatewaySchema } from '../src/schemas/defaultSchemas';

// ============================================================================
// 迁移函数
// ============================================================================

/**
 * 将 v1 Node 类型映射到 v2 Schema ID
 */
function getSchemaIdForNodeType(nodeType: string): string {
  const typeToSchemaId: Record<string, string> = {
    bar: BarSchema.id,
    milestone: MilestoneSchema.id,
    gateway: GatewaySchema.id,
  };
  
  return typeToSchemaId[nodeType] || BarSchema.id;
}

/**
 * 迁移 v1 Node → v2 Line
 */
function migrateNodeToLine(node: TimelineNode): Line {
  const line: Line = {
    id: node.id,
    schemaId: getSchemaIdForNodeType(node.type),
    timelineId: node.timelineId,
    label: node.label || '',
    startDate: node.startDate,
    endDate: (node as any).endDate,
    attributes: {
      color: (node as any).color,
      owner: (node as any).owner,
      description: (node as any).description,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  return line;
}

/**
 * 迁移 v1 Timeline → v2 Timeline（仅元数据，不包含 lines）
 */
function migrateTimelineMetadata(v1Timeline: any): Timeline {
  return {
    id: v1Timeline.id,
    name: v1Timeline.name,
    owner: v1Timeline.owner || '',
    description: v1Timeline.description || '',
    order: 0, // 将在后续设置
    lineIds: [],
    attributes: {},
  };
}

/**
 * 迁移完整的 v1 Plan → v2 Plan
 */
export function migratePlanDataToTimePlan(v1Plan: TimelinePlanData): TimePlan {
  // 1. 迁移 timelines 元数据
  const timelines: Timeline[] = v1Plan.timelines.map((t, index) => ({
    ...migrateTimelineMetadata(t),
    order: index + 1,
  }));
  
  // 2. 迁移所有 nodes → lines
  const lines: Line[] = v1Plan.timelines.flatMap(t => 
    (t.nodes || []).map(node => migrateNodeToLine(node))
  );
  
  // 3. 更新 timeline.lineIds
  timelines.forEach(tl => {
    tl.lineIds = lines.filter(l => l.timelineId === tl.id).map(l => l.id);
  });
  
  // 4. 构建 v2 TimePlan
  const v2Plan: TimePlan = {
    id: v1Plan.id,
    title: v1Plan.title,
    description: `从 v1 迁移: ${v1Plan.title}`,
    owner: v1Plan.owner,
    schemaId: 'default-schema',
    createdAt: v1Plan.createdAt,
    lastAccessTime: v1Plan.lastAccessTime,
    timelines,
    lines,
    relations: v1Plan.dependencies?.map(dep => ({
      id: dep.id,
      fromLineId: dep.fromNodeId,
      toLineId: dep.toNodeId,
      type: 'dependency' as const,
      properties: {
        dependencyType: dep.type,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    })) || [],
  };
  
  // 5. 迁移 baselines
  if (v1Plan.baselines) {
    v2Plan.baselines = v1Plan.baselines.map(baseline => ({
      id: baseline.id,
      date: baseline.date,
      label: baseline.label,
      color: baseline.color,
    }));
  }
  
  return v2Plan;
}

/**
 * 批量迁移多个 Plans
 */
export function migrateAllPlans(v1Plans: TimelinePlanData[]): TimePlan[] {
  console.log(`🔄 开始迁移 ${v1Plans.length} 个计划...`);
  
  const v2Plans = v1Plans.map(v1Plan => {
    const v2Plan = migratePlanDataToTimePlan(v1Plan);
    console.log(`  ✓ 已迁移: ${v1Plan.title} (${v1Plan.timelines.length} 条时间轴, ${v1Plan.timelines.reduce((sum, t) => sum + t.nodes.length, 0)} 个节点)`);
    return v2Plan;
  });
  
  console.log(`✅ 迁移完成！`);
  return v2Plans;
}

// ============================================================================
// 导出统计信息
// ============================================================================

export function printMigrationStats(v1Plans: TimelinePlanData[], v2Plans: TimePlan[]) {
  console.log('\n📊 迁移统计:');
  console.log(`  计划数: ${v1Plans.length} → ${v2Plans.length}`);
  
  const v1TotalTimelines = v1Plans.reduce((sum, p) => sum + p.timelines.length, 0);
  const v2TotalTimelines = v2Plans.reduce((sum, p) => sum + p.timelines.length, 0);
  console.log(`  时间轴总数: ${v1TotalTimelines} → ${v2TotalTimelines}`);
  
  const v1TotalNodes = v1Plans.reduce((sum, p) => 
    sum + p.timelines.reduce((s, t) => s + t.nodes.length, 0), 0
  );
  const v2TotalLines = v2Plans.reduce((sum, p) => sum + p.lines.length, 0);
  console.log(`  节点/线总数: ${v1TotalNodes} (nodes) → ${v2TotalLines} (lines)`);
  
  const v1TotalDeps = v1Plans.reduce((sum, p) => sum + (p.dependencies?.length || 0), 0);
  const v2TotalRelations = v2Plans.reduce((sum, p) => sum + p.relations.length, 0);
  console.log(`  依赖/关系总数: ${v1TotalDeps} (dependencies) → ${v2TotalRelations} (relations)`);
}
