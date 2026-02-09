/**
 * RelationRenderer - 依赖关系线渲染器
 * 
 * 📋 功能:
 * - 渲染 Line 之间的依赖关系线
 * - 支持不同的线条样式（实线/虚线）
 * - 支持箭头显示
 * 
 * 🎯 依赖类型:
 * - finish-to-start (FS): 前任务完成 → 后任务开始
 * - start-to-start (SS): 前任务开始 → 后任务开始
 * - finish-to-finish (FF): 前任务完成 → 后任务完成
 * - start-to-finish (SF): 前任务开始 → 后任务完成
 */

import React, { useMemo, memo } from 'react';
import { Relation, Line } from '@/types/timeplanSchema';
import { TimeScale } from '@/utils/dateUtils';
import { getPositionFromDate, getBarWidthPrecise, parseDateAsLocal } from '@/utils/dateUtils';

interface RelationRendererProps {
  relations: Relation[];
  lines: Line[];
  timelines: Array<{ id: string }>;
  viewStartDate: Date;
  scale: TimeScale;
  rowHeight: number;
  // 交互相关
  selectedRelationId?: string | null;
  isEditMode?: boolean;
  onRelationClick?: (relationId: string) => void;
  onRelationDelete?: (relationId: string) => void;
  // 关键路径
  criticalPathNodeIds?: Set<string>;
}

interface LinePosition {
  x: number;
  y: number;
  width: number;
  timelineIndex: number;
  rowY: number; // ✅ 新增：行的顶部Y坐标（用于避障计算）
}

/**
 * RelationRenderer 组件
 * ✅ 增强版：明显的视觉效果 + 交互反馈
 * ✅ 性能优化：使用React.memo避免不必要的重渲染
 */
export const RelationRenderer: React.FC<RelationRendererProps> = memo(({
  relations,
  lines,
  timelines,
  viewStartDate,
  scale,
  rowHeight,
  selectedRelationId = null,
  isEditMode = false,
  onRelationClick,
  onRelationDelete,
  criticalPathNodeIds = new Set(),
}) => {
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);
  
  // 构建 Line 位置映射
  const linePositions = useMemo(() => {
    const positions = new Map<string, LinePosition>();
    const topOffset = 50; // ✅ SVG向上偏移量，所有Y坐标需要补偿
    
    lines.forEach((line, idx) => {
      const timelineIndex = timelines.findIndex(t => t.id === line.timelineId);
      if (timelineIndex === -1) {
        console.warn(`[RelationRenderer] ⚠️ Timeline未找到:`, line.id);
        return;
      }
      
      // ✅ 使用 parseDateAsLocal 避免时区导致的日期偏移
      const startPos = getPositionFromDate(
        parseDateAsLocal(line.startDate),
        viewStartDate,
        scale
      );
      
      const endDate = line.endDate ? parseDateAsLocal(line.endDate) : parseDateAsLocal(line.startDate);
      const width = line.endDate
        ? getBarWidthPrecise(parseDateAsLocal(line.startDate), endDate, scale)
        : 0;
      
      positions.set(line.id, {
        x: startPos,
        y: timelineIndex * rowHeight + rowHeight / 2 + topOffset,  // ✅ Y坐标补偿SVG偏移
        width,
        timelineIndex,
        rowY: timelineIndex * rowHeight + topOffset, // ✅ 行顶部Y坐标也需要补偿
      });
    });
    
    // ✅ 只在开发模式输出关键信息
    if (lines.length === 0) {
      console.warn('[RelationRenderer] ⚠️ 没有lines数据');
    }
    return positions;
  }, [lines, timelines, viewStartDate, scale, rowHeight]);
  
  // ✅ 简化：只在出现错误时输出日志
  const validationResult = useMemo(() => {
    let invalidCount = 0;
    const invalidRelations: string[] = [];
    
    relations.forEach((relation) => {
      const fromPos = linePositions.get(relation.fromLineId);
      const toPos = linePositions.get(relation.toLineId);
      const visible = relation.displayConfig?.visible !== false;
      
      if (!visible || !fromPos || !toPos) {
        invalidCount++;
        invalidRelations.push(`${relation.fromLineId} → ${relation.toLineId}`);
      }
    });
    
    // 只在有错误时输出
    if (invalidCount > 0) {
      console.warn(`[RelationRenderer] ⚠️ 发现 ${invalidCount} 个无效连线:`, invalidRelations);
    }
    
    return { total: relations.length, invalid: invalidCount };
  }, [relations, linePositions]);
  
  // ✅ 计算SVG实际需要的高度（包含向上/下延伸的空间）
  const extraSpace = 100;  // 上下各预留50px
  const svgHeight = (timelines.length || 1) * rowHeight + extraSpace;
  
  return (
    <svg
      style={{
        position: 'absolute',
        top: -50,  // ✅ 向上偏移50px，为上方绕行路径留空间
        left: 0,
        width: '100%',
        height: svgHeight,  // ✅ 动态高度
        pointerEvents: 'none',
        zIndex: 5,  // ✅ 降低层级，确保被左侧timeline列表（z-index: 100）覆盖
        overflow: 'visible',  // ✅ 允许路径超出SVG边界
      }}
    >
      <defs>
        {/* ✅ 箭头定义：6x4尺寸，refX=6使箭头尖端对准终点 */}
        <marker
          id="arrowhead"
          markerWidth="6"
          markerHeight="4"
          refX="6"
          refY="2"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <polygon
            points="0 0, 6 2, 0 4"
            fill="#14B8A6"
          />
        </marker>
        {/* 🎯 关键路径箭头：红色 */}
        <marker
          id="arrowhead-critical"
          markerWidth="6"
          markerHeight="4"
          refX="6"
          refY="2"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <polygon
            points="0 0, 6 2, 0 4"
            fill="#ef4444"
          />
        </marker>
        
        {/* Hover状态的箭头 */}
        <marker
          id="arrowhead-hover"
          markerWidth="6"
          markerHeight="4"
          refX="6"
          refY="2"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <polygon
            points="0 0, 6 2, 0 4"
            fill="#0F9F94"
          />
        </marker>
      </defs>
      
      {/* ✅ 第一层：连线路径（可以相互覆盖） */}
      <g>
        {relations.map((relation) => {
          // ✅ 只有明确设置为false才跳过，undefined默认为true
          if (relation.displayConfig?.visible === false) return null;
          
          const fromPos = linePositions.get(relation.fromLineId);
          const toPos = linePositions.get(relation.toLineId);
          
          if (!fromPos || !toPos) return null;
          
          // 计算起点和终点
          const dependencyType = relation.properties?.dependencyType || 'finish-to-start';
          let startX = fromPos.x;
          let startY = fromPos.y;
          let endX = toPos.x;
          let endY = toPos.y;
          
          // ✅ 根据依赖类型调整起点和终点
          // 箭头长度约8px，终点需要回退8px避免覆盖line边缘
          const arrowLength = 8;
          
          switch (dependencyType) {
            case 'finish-to-start':
              startX = fromPos.x + fromPos.width; // 前任务结束点
              endX = toPos.x - arrowLength; // 后任务开始点（回退箭头长度）
              break;
            case 'start-to-start':
              startX = fromPos.x; // 前任务开始点
              endX = toPos.x - arrowLength; // 后任务开始点（回退箭头长度）
              break;
            case 'finish-to-finish':
              startX = fromPos.x + fromPos.width; // 前任务结束点
              endX = toPos.x + toPos.width + arrowLength; // 后任务结束点（延伸箭头长度）
              break;
            case 'start-to-finish':
              startX = fromPos.x; // 前任务开始点
              endX = toPos.x + toPos.width + arrowLength; // 后任务结束点（延伸箭头长度）
              break;
          }
          
          // 计算路径（传递更多信息用于避障）
          const path = calculatePath(
            startX, startY, endX, endY,
            fromPos.timelineIndex, toPos.timelineIndex,
            fromPos.rowY, toPos.rowY,
            rowHeight
          );
          
          const isHovered = hoveredId === relation.id;
          
          // 🎯 检查是否在关键路径中
          const isCriticalPath = criticalPathNodeIds.has(relation.fromLineId) && 
                                 criticalPathNodeIds.has(relation.toLineId);
          
          // 计算标签位置（路径中点）
          const midX = (startX + endX) / 2;
          const midY = (startY + endY) / 2;
          
          return (
            <g key={`line-${relation.id}`}>
              {/* ✅ 透明宽路径用于hover和点击 */}
              <path
                d={path}
                fill="none"
                stroke="transparent"
                strokeWidth="16"
                style={{ 
                  cursor: isEditMode ? 'pointer' : 'default',
                  pointerEvents: 'auto',
                }}
                onMouseEnter={() => setHoveredId(relation.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={(e) => {
                  if (isEditMode && onRelationClick) {
                    e.stopPropagation();
                    onRelationClick(relation.id);
                  }
                }}
              />
              
              {/* ✅ 实际显示的依赖线 */}
              {/* 🎯 关键路径：红色加粗实线 */}
              <path
                d={path}
                fill="none"
                stroke={isCriticalPath 
                  ? '#ef4444'  // 关键路径：红色
                  : (selectedRelationId === relation.id ? '#3B82F6' : (isHovered ? '#0F9F94' : '#14B8A6'))}
                strokeWidth={isCriticalPath 
                  ? 3  // 关键路径：加粗
                  : (selectedRelationId === relation.id || isHovered ? 3 : 2)}
                strokeDasharray={isCriticalPath ? 'none' : '6 3'}  // 关键路径：实线
                style={{ pointerEvents: 'none' }}
              />
              
              {/* ✅ Hover时显示关系类型标签 */}
              {isHovered && (
                <g>
                  {/* 标签背景 */}
                  <rect
                    x={midX - 20}
                    y={midY - 12}
                    width="40"
                    height="24"
                    rx="4"
                    fill="#ffffff"
                    stroke="#14B8A6"
                    strokeWidth="2"
                  />
                  {/* 标签文字 */}
                  <text
                    x={midX}
                    y={midY + 4}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="600"
                    fill="#14B8A6"
                    style={{ pointerEvents: 'none' }}
                  >
                    {(() => {
                      const typeLabels: Record<string, string> = {
                        'finish-to-start': 'FS',
                        'start-to-start': 'SS',
                        'finish-to-finish': 'FF',
                        'start-to-finish': 'SF',
                      };
                      return typeLabels[dependencyType] || 'FS';
                    })()}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </g>
      
      {/* ✅ 第二层：箭头和连接点（永远在最上层，不被线条覆盖） */}
      <g style={{ isolation: 'isolate' }}>
        {relations.map((relation) => {
          if (relation.displayConfig?.visible === false) return null;
          
          const fromPos = linePositions.get(relation.fromLineId);
          const toPos = linePositions.get(relation.toLineId);
          
          if (!fromPos || !toPos) return null;
          
          const dependencyType = relation.properties?.dependencyType || 'finish-to-start';
          const isHovered = hoveredId === relation.id;
          const arrowLength = 8;
          
          // 🎯 检查是否在关键路径中
          const isCriticalPath = criticalPathNodeIds.has(relation.fromLineId) && 
                                 criticalPathNodeIds.has(relation.toLineId);
          
          let endX = toPos.x;
          let endY = toPos.y;
          
          // 计算箭头终点位置（用于绘制箭头路径）
          switch (dependencyType) {
            case 'finish-to-start':
            case 'start-to-start':
              endX = toPos.x - arrowLength;
              break;
            case 'finish-to-finish':
            case 'start-to-finish':
              endX = toPos.x + toPos.width + arrowLength;
              break;
          }
          
          // 箭头路径：短直线 + 箭头marker
          const arrowPath = `M ${endX - 6} ${endY} L ${endX} ${endY}`;
          
          return (
            <g key={`arrow-${relation.id}`}>
              {/* ✅ 连接点（起点） - 在line边缘 */}
              <circle
                cx={dependencyType === 'finish-to-start' || dependencyType === 'finish-to-finish' 
                  ? fromPos.x + fromPos.width 
                  : fromPos.x}
                cy={fromPos.y}
                r={isHovered ? 4 : 3}
                fill={isHovered ? '#0F9F94' : '#14B8A6'}
              />
              
              {/* ✅ 连接点（终点） - 在line边缘，不包含箭头偏移 */}
              <circle
                cx={dependencyType === 'finish-to-start' || dependencyType === 'start-to-start'
                  ? toPos.x
                  : toPos.x + toPos.width}
                cy={toPos.y}
                r={isHovered ? 4 : 3}
                fill={isHovered ? '#0F9F94' : '#14B8A6'}
              />
              
              {/* ✅ 箭头（单独渲染，确保不被其他线覆盖） */}
              {/* 🎯 关键路径：红色箭头 */}
              <path
                d={arrowPath}
                fill="none"
                stroke={isCriticalPath 
                  ? '#ef4444'  // 关键路径：红色
                  : (isHovered ? '#0F9F94' : '#14B8A6')}
                strokeWidth={isCriticalPath 
                  ? 3  // 关键路径：加粗
                  : (isHovered ? 3 : 2)}
                markerEnd={isCriticalPath 
                  ? 'url(#arrowhead-critical)'  // 关键路径箭头
                  : (isHovered ? 'url(#arrowhead-hover)' : 'url(#arrowhead)')}
                style={{ pointerEvents: 'none' }}
              />
            </g>
          );
        })}
      </g>
    </svg>
  );
};

/**
 * 计算连接路径（优化版 - 利用行间空白区域）
 * 
 * ✅ 新策略：
 * 1. 跨timeline：使用行间空白区域（行底部边界），简单直线，水平接入
 * 2. 同timeline内：短距离直接连接，长距离通过上方空白区域绕过
 * 3. 避免被line元素覆盖
 */
function calculatePath(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  startRowIndex: number,
  endRowIndex: number,
  startRowY: number,  // ✅ 起点行的顶部Y坐标
  endRowY: number,    // ✅ 终点行的顶部Y坐标
  rowHeight: number   // ✅ 行高
): string {
  // ✅ 配置参数
  const horizontalExtension = 30; // 水平延伸距离
  const cornerRadius = 6;          // 圆角半径（减小以更灵活）
  
  // ✅ 判断是否在同一timeline（同一行）
  const sameTimeline = startRowIndex === endRowIndex;
  
  if (sameTimeline) {
    // ========== 同一Timeline内的连接 ==========
    // 策略：如果距离近直接连，距离远则从上方绕过
    const distance = Math.abs(endX - startX);
    
    if (distance < 200) {
      // 距离近：直接连接
      return `M ${startX} ${startY} L ${endX} ${endY}`;
    } else {
      // 距离远：从上方绕过，避开中间的文字和line
      const x1 = startX + horizontalExtension;
      const x2 = endX - horizontalExtension;
      const topY = startRowY - 35; // 在行上方35px处通过（避开文字标签）
      
      return `
        M ${startX} ${startY}
        L ${x1} ${startY}
        Q ${x1 + cornerRadius} ${startY} ${x1 + cornerRadius} ${topY + cornerRadius}
        L ${x1 + cornerRadius} ${topY}
        L ${x2 - cornerRadius} ${topY}
        Q ${x2 - cornerRadius} ${topY} ${x2 - cornerRadius} ${endY - cornerRadius}
        L ${x2 - cornerRadius} ${endY}
        L ${endX} ${endY}
      `.replace(/\s+/g, ' ').trim();
    }
  } else {
    // ========== 跨Timeline的连接 ==========
    // 策略：利用行间空白区域（行边界），使用简单的正交路径
    
    const goingDown = endRowIndex > startRowIndex;
    const rowGap = 8; // 行间空白区域的中间位置（距离行边界的偏移）
    
    // ✅ 使用行间空白区域的Y坐标
    // 向下：从起点行的底部边界通过
    // 向上：从终点行的顶部边界通过
    const routingY = goingDown
      ? startRowY + rowHeight + rowGap  // 起点行底部 + 偏移
      : endRowY - rowGap;                // 终点行顶部 - 偏移
    
    const x1 = startX + horizontalExtension;
    const x2 = endX - 20; // 终点前20px转折
    
    // ✅ 简化的正交路径（水平-垂直-水平），利用行间空白
    return `
      M ${startX} ${startY}
      L ${x1} ${startY}
      Q ${x1 + cornerRadius} ${startY} ${x1 + cornerRadius} ${goingDown ? startY + cornerRadius : startY - cornerRadius}
      L ${x1 + cornerRadius} ${goingDown ? routingY - cornerRadius : routingY + cornerRadius}
      Q ${x1 + cornerRadius} ${routingY} ${x1 + cornerRadius * 2} ${routingY}
      L ${x2 - cornerRadius} ${routingY}
      Q ${x2 - cornerRadius} ${routingY} ${x2 - cornerRadius} ${goingDown ? routingY + cornerRadius : routingY - cornerRadius}
      L ${x2 - cornerRadius} ${endY + (goingDown ? -cornerRadius : cornerRadius)}
      Q ${x2 - cornerRadius} ${endY} ${x2} ${endY}
      L ${endX} ${endY}
    `.replace(/\s+/g, ' ').trim();
  }
}, (prevProps, nextProps) => {
  // ✅ 自定义比较函数：只在关键属性变化时才重渲染
  return (
    prevProps.relations.length === nextProps.relations.length &&
    prevProps.lines.length === nextProps.lines.length &&
    prevProps.timelines.length === nextProps.timelines.length &&
    prevProps.selectedRelationId === nextProps.selectedRelationId &&
    prevProps.isEditMode === nextProps.isEditMode &&
    prevProps.scale === nextProps.scale &&
    prevProps.rowHeight === nextProps.rowHeight &&
    prevProps.viewStartDate.getTime() === nextProps.viewStartDate.getTime() &&
    prevProps.criticalPathNodeIds.size === nextProps.criticalPathNodeIds.size
  );
});
