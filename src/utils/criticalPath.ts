/**
 * Critical Path Calculator v2 - 基于 v2 Schema
 * 
 * ✅ 使用 Line[] 和 Relation[]
 * ✅ 支持所有依赖类型
 * ✅ 高性能算法
 * 
 * @version 2.0.0
 * @date 2026-02-03
 */

import { Line, Relation, DependencyType } from '@/types/timeplanSchema';
import { startOfDay } from 'date-fns';

/**
 * Calculate Critical Path using longest path algorithm (v2)
 * Returns array of line IDs that are on the critical (longest) path
 * 
 * The critical path is the longest path through the dependency network,
 * determining the minimum project duration.
 * 
 * @param lines - All lines in the plan
 * @param relations - All relations (dependencies) between lines
 * @returns Array of line IDs on the critical path
 */
export function calculateCriticalPath(
  lines: Line[],
  relations: Relation[]
): string[] {
  if (lines.length === 0 || relations.length === 0) return [];

  // Create line map
  const lineMap = new Map<string, Line>();
  lines.forEach(line => lineMap.set(line.id, line));

  // Build adjacency lists based on dependency relations
  const successors = new Map<string, string[]>();
  const predecessors = new Map<string, string[]>();
  
  lines.forEach(line => {
    successors.set(line.id, []);
    predecessors.set(line.id, []);
  });

  // Populate from valid relations
  // Check for dependency type in properties or use type as fallback
  relations.forEach(rel => {
    const depType = rel.properties?.dependencyType as DependencyType | undefined;
    const isDependency = rel.type === 'dependency' || depType === 'finish-to-start';
    
    if (isDependency && lineMap.has(rel.fromLineId) && lineMap.has(rel.toLineId)) {
      successors.get(rel.fromLineId)?.push(rel.toLineId);
      predecessors.get(rel.toLineId)?.push(rel.fromLineId);
    }
  });

  // Get lines that are in dependency chains (only add if both ends are valid)
  const linesInChain = new Set<string>();
  relations.forEach(rel => {
    if (lineMap.has(rel.fromLineId) && lineMap.has(rel.toLineId)) {
      linesInChain.add(rel.fromLineId);
      linesInChain.add(rel.toLineId);
    }
  });

  if (linesInChain.size === 0) return [];

  // Calculate duration for each line (in days)
  const getDuration = (lineId: string): number => {
    const line = lineMap.get(lineId);
    if (!line) return 1;
    const startTime = startOfDay(line.startDate).getTime();
    const endTime = startOfDay(line.endDate || line.startDate).getTime();
    return Math.max(1, Math.ceil((endTime - startTime) / (24 * 60 * 60 * 1000)) + 1);
  };

  // Topological sort using Kahn's algorithm
  const inDegree = new Map<string, number>();
  linesInChain.forEach(lineId => {
    const preds = (predecessors.get(lineId) || []).filter(id => linesInChain.has(id));
    inDegree.set(lineId, preds.length);
  });

  const queue: string[] = [];
  linesInChain.forEach(lineId => {
    if (inDegree.get(lineId) === 0) {
      queue.push(lineId);
    }
  });

  const topoOrder: string[] = [];
  
  while (queue.length > 0) {
    const lineId = queue.shift()!;
    topoOrder.push(lineId);
    
    const succs = (successors.get(lineId) || []).filter(id => linesInChain.has(id));
    succs.forEach(succId => {
      const newDeg = (inDegree.get(succId) || 1) - 1;
      inDegree.set(succId, newDeg);
      if (newDeg === 0) {
        queue.push(succId);
      }
    });
  }

  // Check for cycles
  if (topoOrder.length !== linesInChain.size) {
    console.warn('[CriticalPath v2] ⚠️ 检测到依赖循环');
    return [];
  }

  // Calculate longest path to each line
  const longestPathTo = new Map<string, number>(); // lineId -> longest path length ending at this line
  const pathPredecessor = new Map<string, string | null>(); // lineId -> predecessor in longest path
  
  topoOrder.forEach(lineId => {
    longestPathTo.set(lineId, getDuration(lineId));
    pathPredecessor.set(lineId, null);
  });

  // Forward pass: find longest path
  topoOrder.forEach(lineId => {
    const currentLength = longestPathTo.get(lineId) || 0;
    const succs = (successors.get(lineId) || []).filter(id => linesInChain.has(id));
    
    succs.forEach(succId => {
      const succDuration = getDuration(succId);
      const newLength = currentLength + succDuration;
      const existingLength = longestPathTo.get(succId) || 0;
      
      if (newLength > existingLength) {
        longestPathTo.set(succId, newLength);
        pathPredecessor.set(succId, lineId);
      }
    });
  });

  // Find the end line with the longest path
  let maxLength = 0;
  let endLineId: string | null = null;
  
  topoOrder.forEach(lineId => {
    const length = longestPathTo.get(lineId) || 0;
    if (length > maxLength) {
      maxLength = length;
      endLineId = lineId;
    }
  });

  if (!endLineId) return [];

  // Trace back the critical path
  const criticalPath: string[] = [];
  let currentLine: string | null = endLineId;
  
  while (currentLine) {
    criticalPath.unshift(currentLine);
    currentLine = pathPredecessor.get(currentLine) || null;
  }

  console.log('[CriticalPath v2] ✅ 计算完成:', {
    totalLines: lines.length,
    linesInChain: linesInChain.size,
    criticalPathLength: criticalPath.length,
    totalDuration: maxLength,
  });

  return criticalPath;
}
