/**
 * 矩阵计算V3 - 单元测试
 * 
 * @version 3.0.0
 * @date 2026-02-11
 */

import { describe, it, expect } from 'vitest';
import { calculateMatrixV3, getCell, groupTimeNodesByQuarter } from '../calculateMatrix';
import { orionXTimePlan } from '@/data/orionXTimePlan';
import { GatewaySchema, MilestoneSchema } from '@/schemas/defaultSchemas';

describe('calculateMatrixV3', () => {
  it('应该正确计算Orion X计划的矩阵数据', () => {
    const matrix = calculateMatrixV3(orionXTimePlan);

    // 验证基本结构
    expect(matrix.timelines).toHaveLength(orionXTimePlan.timelines.length);
    expect(matrix.timeNodes.length).toBeGreaterThan(0);
    expect(matrix.totalEffort).toBeGreaterThan(0);

    console.log(`[测试] Timeline数: ${matrix.timelines.length}`);
    console.log(`[测试] 时间节点数: ${matrix.timeNodes.length}`);
    console.log(`[测试] 总工作量: ${matrix.totalEffort.toFixed(1)} 人/天`);
  });

  it('应该只提取Milestone和Gateway类型的Line作为时间节点', () => {
    const matrix = calculateMatrixV3(orionXTimePlan);

    // 所有时间节点都应该是Milestone或Gateway
    matrix.timeNodes.forEach(node => {
      expect(['milestone', 'gateway']).toContain(node.type);
      expect(node.line).toBeDefined();
      expect([MilestoneSchema.id, GatewaySchema.id]).toContain(node.line!.schemaId);
    });
  });

  it('应该按时间顺序排列时间节点', () => {
    const matrix = calculateMatrixV3(orionXTimePlan);

    for (let i = 1; i < matrix.timeNodes.length; i++) {
      const prevDate = matrix.timeNodes[i - 1].date.getTime();
      const currDate = matrix.timeNodes[i].date.getTime();
      expect(currDate).toBeGreaterThanOrEqual(prevDate);
    }
  });

  it('应该正确映射Timeline到时间节点', () => {
    const matrix = calculateMatrixV3(orionXTimePlan);

    // 检查项目管理Timeline
    const pmTimeline = matrix.timelines.find(tl => tl.id === 'tl-project-mgmt');
    expect(pmTimeline).toBeDefined();

    // 检查第一个时间节点 (PTR)
    const ptrNode = matrix.timeNodes.find(node => node.id === 'line-pm-001');
    expect(ptrNode).toBeDefined();

    // 获取单元格
    const cell = getCell(matrix, 'tl-project-mgmt', 'line-pm-001');
    expect(cell).toBeDefined();
    expect(cell!.lines.length).toBe(1);
    expect(cell!.lines[0].label).toBe('PTR 项目技术要求');
  });

  it('应该正确计算单元格的工作量', () => {
    const matrix = calculateMatrixV3(orionXTimePlan);

    // 查找一个有内容的单元格
    const cellsWithContent = Array.from(matrix.cells.values()).filter(cell => cell.lines.length > 0);
    expect(cellsWithContent.length).toBeGreaterThan(0);

    cellsWithContent.forEach(cell => {
      expect(cell.totalEffort).toBeGreaterThan(0);
      expect(cell.loadRate).toBeGreaterThanOrEqual(0);
      expect(cell.loadRate).toBeLessThanOrEqual(1);
    });
  });

  it('应该正确识别单元格状态', () => {
    const matrix = calculateMatrixV3(orionXTimePlan);

    const statuses = Array.from(matrix.cells.values()).map(cell => cell.status);
    const uniqueStatuses = [...new Set(statuses)];

    console.log('[测试] 单元格状态分布:', uniqueStatuses);

    // 至少应该有'empty'状态（空单元格很多）
    expect(uniqueStatuses).toContain('empty');
  });

  it('应该正确计算日期范围', () => {
    const matrix = calculateMatrixV3(orionXTimePlan);

    expect(matrix.dateRange.start).toBeInstanceOf(Date);
    expect(matrix.dateRange.end).toBeInstanceOf(Date);
    expect(matrix.dateRange.end.getTime()).toBeGreaterThanOrEqual(matrix.dateRange.start.getTime());

    console.log(`[测试] 日期范围: ${matrix.dateRange.start.toLocaleDateString()} - ${matrix.dateRange.end.toLocaleDateString()}`);
  });
});

describe('groupTimeNodesByQuarter', () => {
  it('应该正确按季度分组时间节点', () => {
    const matrix = calculateMatrixV3(orionXTimePlan);
    const groups = groupTimeNodesByQuarter(matrix.timeNodes);

    expect(groups.length).toBeGreaterThan(0);

    groups.forEach(group => {
      expect(group.year).toBeGreaterThan(2020);
      expect(group.quarter).toBeGreaterThanOrEqual(1);
      expect(group.quarter).toBeLessThanOrEqual(4);
      expect(group.nodes.length).toBeGreaterThan(0);

      console.log(`[测试] ${group.year}年Q${group.quarter}: ${group.nodes.length}个节点`);
    });
  });

  it('分组应该按时间顺序排列', () => {
    const matrix = calculateMatrixV3(orionXTimePlan);
    const groups = groupTimeNodesByQuarter(matrix.timeNodes);

    for (let i = 1; i < groups.length; i++) {
      const prev = groups[i - 1];
      const curr = groups[i];

      if (prev.year === curr.year) {
        expect(curr.quarter).toBeGreaterThan(prev.quarter);
      } else {
        expect(curr.year).toBeGreaterThan(prev.year);
      }
    }
  });
});

describe('getCell', () => {
  it('应该正确获取指定单元格', () => {
    const matrix = calculateMatrixV3(orionXTimePlan);
    const cell = getCell(matrix, 'tl-project-mgmt', 'line-pm-001');

    expect(cell).toBeDefined();
    expect(cell!.timelineId).toBe('tl-project-mgmt');
    expect(cell!.timeNodeId).toBe('line-pm-001');
  });

  it('应该对不存在的单元格返回undefined', () => {
    const matrix = calculateMatrixV3(orionXTimePlan);
    const cell = getCell(matrix, 'non-existent-timeline', 'non-existent-node');

    expect(cell).toBeUndefined();
  });
});

describe('数据完整性验证', () => {
  it('所有Timeline都应该在矩阵中', () => {
    const matrix = calculateMatrixV3(orionXTimePlan);

    expect(matrix.timelines.length).toBe(orionXTimePlan.timelines.length);

    orionXTimePlan.timelines.forEach(timeline => {
      const found = matrix.timelines.find(tl => tl.id === timeline.id);
      expect(found).toBeDefined();
    });
  });

  it('所有Milestone和Gateway类型的Line都应该被提取为时间节点', () => {
    const matrix = calculateMatrixV3(orionXTimePlan);

    const milestoneAndGatewayLines = orionXTimePlan.lines.filter(
      line => line.schemaId === MilestoneSchema.id || line.schemaId === GatewaySchema.id
    );

    expect(matrix.timeNodes.length).toBe(milestoneAndGatewayLines.length);

    milestoneAndGatewayLines.forEach(line => {
      const node = matrix.timeNodes.find(n => n.id === line.id);
      expect(node).toBeDefined();
      expect(node!.line).toEqual(line);
    });
  });

  it('矩阵单元格数量应该合理（大部分应该是空单元格）', () => {
    const matrix = calculateMatrixV3(orionXTimePlan);

    const expectedMaxCells = matrix.timelines.length * matrix.timeNodes.length;
    
    // 实际单元格数可能小于等于最大值（因为只创建有Line的单元格或空单元格）
    expect(matrix.cells.size).toBeGreaterThan(0);
    expect(matrix.cells.size).toBeLessThanOrEqual(expectedMaxCells);

    // 统计非空单元格
    const nonEmptyCells = Array.from(matrix.cells.values()).filter(cell => cell.lines.length > 0);
    console.log(`[测试] 总单元格数: ${matrix.cells.size}, 非空单元格: ${nonEmptyCells.length}`);
    
    // 非空单元格应该接近（但可能略少于）Milestone和Gateway数量
    // （因为某些Line可能没有正确的timelineId匹配）
    expect(nonEmptyCells.length).toBeGreaterThan(0);
    expect(nonEmptyCells.length).toBeLessThanOrEqual(matrix.timeNodes.length);
  });
});
