/**
 * LineRenderer - Line 渲染器
 * 
 * 📋 功能:
 * - 根据 schemaId 渲染不同类型的 Line (bar/milestone/gateway)
 * - 支持拖拽和调整大小
 * - 支持选中和交互状态
 * 
 * 🎯 类型:
 * - bar: 横条（矩形）
 * - milestone: 里程碑（菱形）
 * - gateway: 网关（六边形）
 */

import React from 'react';
import { Line } from '@/types/timeplanSchema';
import { timelineColors, timelineShadows, timelineTransitions } from '@/theme/timelineColors';
import ConnectionPoints from './ConnectionPoints';

interface LineRendererProps {
  line: Line;
  startPos: number;
  width: number;
  isSelected: boolean;
  isInteracting: boolean;
  isEditMode: boolean;
  onMouseDown?: (e: React.MouseEvent) => void;
  onClick?: () => void;
  onResizeStart?: (e: React.MouseEvent, edge: 'left' | 'right') => void;
  // 连线相关
  isHovered?: boolean;
  connectionMode?: { lineId: string | null; direction: 'from' | 'to' };
  onStartConnection?: (lineId: string, direction: 'from' | 'to') => void;
  onCompleteConnection?: (targetLineId: string) => void;
}

/**
 * 渲染 Bar 类型（横条）
 */
const BarRenderer: React.FC<LineRendererProps> = ({
  line,
  startPos,
  width,
  isSelected,
  isInteracting,
  isEditMode,
  onMouseDown,
  onClick,
  onResizeStart,
  isHovered = false,
  connectionMode = { lineId: null, direction: 'from' },
  onStartConnection,
  onCompleteConnection,
}) => {
  // 🎨 获取节点颜色（优先级：attributes.color > line.color > 默认Teal色）
  // ✅ 修复：使用透明度版本，参考源项目
  const barColor = line.attributes?.color || line.color || timelineColors.barTransparent;
  const hoverColor = timelineColors.barHoverTransparent;
  
  // 悬停状态
  const [isHovering, setIsHovering] = React.useState(false);
  
  return (
    <div
      onClick={onClick}
      onMouseDown={onMouseDown}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={{
        position: 'absolute',
        left: startPos,
        top: '50%',
        transform: isInteracting 
          ? 'translateY(-50%) scale(1.08)' 
          : (isSelected ? 'translateY(-50%) scale(1.02)' : 'translateY(-50%)'),
        width,
        height: 20,
        // 🎨 颜色：选中时更亮，hover时有提示
        backgroundColor: isInteracting 
          ? timelineColors.barDragging
          : (isSelected 
              ? `color-mix(in srgb, ${barColor} 85%, white 15%)`  // 选中时更亮
              : (isHovering && isEditMode ? hoverColor : barColor)),
        borderRadius: 4,
        // 🎯 选中样式：双层ring效果
        border: isSelected
          ? `2px solid ${timelineColors.selected}`
          : `1px solid rgba(0,0,0,0.04)`,
        boxShadow: isSelected 
          ? `0 0 0 2px ${timelineColors.selected}, 0 0 0 5px ${timelineColors.selectedRing}, 0 4px 12px rgba(0,0,0,0.15)` // 增强ring + 阴影
          : (isInteracting
              ? timelineShadows.dragging
              : (isHovering ? timelineShadows.nodeMd : timelineShadows.nodeSm)),
        cursor: isEditMode ? (isInteracting ? 'grabbing' : 'grab') : 'pointer',
        display: 'flex',
        alignItems: 'center',
        padding: `0 6px`,
        transition: isInteracting ? 'none' : `${timelineTransitions.normal}, transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)`,
        zIndex: isSelected ? 10 : (isInteracting ? 5 : 1),  // ✅ 选中时更高zIndex
        opacity: isInteracting ? 0.7 : (isSelected ? 0.85 : 0.6),  // ✅ 选中时降低透明度
      }}
    >
      {/* 左侧调整手柄 */}
      {isEditMode && isSelected && onResizeStart && (
        <div
          onMouseDown={(e) => {
            e.stopPropagation();
            onResizeStart(e, 'left');
          }}
          style={{
            position: 'absolute',
            left: -4,
            top: 0,
            bottom: 0,
            width: 8,
            cursor: 'ew-resize',
            zIndex: 20,
          }}
        />
      )}
      
      {/* ✅ 标题标签 - 显示在Bar上方，对准左边缘 */}
      <div
        style={{
          position: 'absolute',
          left: 0,                       // 与bar左边缘对齐
          top: -20,                      // 上方20px
          whiteSpace: 'nowrap',
          fontSize: 12,
          fontWeight: 600,
          color: '#1E293B',              // Slate-900
          pointerEvents: 'none',
          textShadow: '0 0 3px rgba(255,255,255,0.9)',
          padding: '2px 4px',
          backgroundColor: 'transparent', // ✅ 背景透明
          borderRadius: 3,
          maxWidth: width > 0 ? `${width}px` : 'auto', // 限制最大宽度为bar宽度
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {line.label || line.title}
      </div>
      
      {/* 右侧调整手柄 */}
      {isEditMode && isSelected && onResizeStart && (
        <div
          onMouseDown={(e) => {
            e.stopPropagation();
            onResizeStart(e, 'right');
          }}
          style={{
            position: 'absolute',
            right: -4,
            top: 0,
            bottom: 0,
            width: 8,
            cursor: 'ew-resize',
            zIndex: 20,
          }}
        />
      )}

      {/* 连接点 - 在连线模式下显示所有连接点，或在选中/hover时显示 */}
      {isEditMode && (connectionMode.lineId || isSelected || isHovered) && onStartConnection && onCompleteConnection && (
        <ConnectionPoints
          nodeId={line.id}
          isVisible={true}
          connectionMode={connectionMode}
          onStartConnection={onStartConnection}
          onCompleteConnection={onCompleteConnection}
        />
      )}
    </div>
  );
};

/**
 * 渲染 Milestone 类型（菱形）
 */
const MilestoneRenderer: React.FC<LineRendererProps> = ({
  line,
  startPos,
  isSelected,
  isInteracting,
  isEditMode,
  onMouseDown,
  onClick,
  isHovered = false,
  connectionMode = { lineId: null, direction: 'from' },
  onStartConnection,
  onCompleteConnection,
}) => {
  const size = 12;  // ✅ 更小的菱形：16px → 12px
  // 🎨 Milestone 使用黄色（源项目：#FCD34D）
  const color = line.attributes?.color || line.color || timelineColors.milestone;
  const hoverColor = timelineColors.milestoneHover;
  
  const [isHovering, setIsHovering] = React.useState(false);
  
  return (
    <div
      onClick={onClick}
      onMouseDown={onMouseDown}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={{
        position: 'absolute',
        left: startPos - size / 2,
        top: '50%',
        transform: isInteracting 
          ? 'translateY(-50%) scale(1.12)' 
          : (isSelected ? 'translateY(-50%) scale(1.05)' : 'translateY(-50%)'),
        width: size,
        height: size,
        cursor: isEditMode ? (isInteracting ? 'grabbing' : 'grab') : 'pointer',
        zIndex: isSelected ? 12 : (isInteracting ? 10 : 2),
        opacity: isInteracting ? 0.7 : 0.95,
        transition: isInteracting ? 'none' : `${timelineTransitions.normal}, transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)`,
        filter: isSelected ? 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' : 'none',
      }}
    >
      {/* 菱形 - ✅ 改为空心 */}
      <div
        style={{
          width: size,
          height: size,
          backgroundColor: 'transparent',
          border: isSelected
            ? `3px solid ${timelineColors.selected}`  // ✅ 选中时更粗
            : `2px solid ${color}`,
          transform: 'rotate(45deg)',
          // 🎯 选中时使用增强ring效果
          boxShadow: isSelected 
            ? `0 0 0 2px ${timelineColors.selected}, 0 0 0 5px ${timelineColors.selectedRing}`
            : (isHovering && isEditMode ? '0 0 0 1px rgba(0,0,0,0.1)' : 'none'),
        }}
      />
      
      {/* ✅ 标签 - 显示在Milestone上方，居中对齐 */}
      <div
        style={{
          position: 'absolute',
          left: '50%',                   // 居中
          transform: 'translateX(-50%)', // 水平居中
          top: -24,                      // 上方24px
          whiteSpace: 'nowrap',
          fontSize: 12,
          fontWeight: 600,
          color: '#1E293B',
          pointerEvents: 'none',
          textShadow: '0 0 3px rgba(255,255,255,0.9)',
          padding: '2px 6px',
          backgroundColor: 'transparent', // ✅ 背景透明
          borderRadius: 3,
        }}
      >
        {line.label || line.title}
      </div>

      {/* 连接点 - 在连线模式下显示所有连接点，或在选中/hover时显示 */}
      {isEditMode && (connectionMode.lineId || isSelected || isHovered) && onStartConnection && onCompleteConnection && (
        <ConnectionPoints
          nodeId={line.id}
          isVisible={true}
          connectionMode={connectionMode}
          onStartConnection={onStartConnection}
          onCompleteConnection={onCompleteConnection}
        />
      )}
    </div>
  );
};

/**
 * 渲染 Gateway 类型（六边形）
 */
const GatewayRenderer: React.FC<LineRendererProps> = ({
  line,
  startPos,
  isSelected,
  isInteracting,
  isEditMode,
  onMouseDown,
  onClick,
  isHovered = false,
  connectionMode = { lineId: null, direction: 'from' },
  onStartConnection,
  onCompleteConnection,
}) => {
  const size = 14;  // ✅ 更小的六边形：18px → 14px
  // 🎨 Gateway 使用紫色（源项目：#A855F7）
  const color = line.attributes?.color || line.color || timelineColors.gateway;
  const hoverColor = timelineColors.gatewayHover;
  
  const [isHovering, setIsHovering] = React.useState(false);
  
  return (
    <div
      onClick={onClick}
      onMouseDown={onMouseDown}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={{
        position: 'absolute',
        left: startPos - size / 2,
        top: '50%',
        transform: isInteracting 
          ? 'translateY(-50%) scale(1.12)' 
          : (isSelected ? 'translateY(-50%) scale(1.05)' : 'translateY(-50%)'),
        width: size,
        height: size,
        cursor: isEditMode ? (isInteracting ? 'grabbing' : 'grab') : 'pointer',
        zIndex: isSelected ? 12 : (isInteracting ? 10 : 1),
        opacity: isInteracting ? 0.7 : 0.95,
        transition: isInteracting ? 'none' : `${timelineTransitions.normal}, transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)`,
        filter: isSelected ? 'drop-shadow(0 4px 16px rgba(0,0,0,0.2))' : 'none',
      }}
    >
      {/* 六边形使用SVG - ✅ 改为空心 */}
      <svg width={size} height={size} viewBox="0 0 24 24">
        <polygon
          points="12,2 21,7 21,17 12,22 3,17 3,7"
          fill="transparent"
          stroke={isSelected ? timelineColors.selected : color}
          strokeWidth={isSelected ? 3 : 2}
        />
        {/* 选中时的增强ring效果 */}
        {isSelected && (
          <rect
            x="-3"
            y="-3"
            width="30"
            height="30"
            fill="none"
            stroke={timelineColors.selectedRing}
            strokeWidth="3"
            rx="2"
            style={{
              filter: `drop-shadow(0 0 6px ${timelineColors.selectedRing})`,
            }}
          />
        )}
      </svg>
      
      {/* ✅ 标签 - 显示在Gateway上方，居中对齐 */}
      <div
        style={{
          position: 'absolute',
          left: '50%',                   // 居中对齐
          transform: 'translateX(-50%)', // 水平居中
          top: -28,                      // 上方28px（gateway比milestone大）
          whiteSpace: 'nowrap',
          fontSize: 12,
          fontWeight: 600,
          color: '#1E293B',              // Slate-900
          pointerEvents: 'none',
          textShadow: '0 0 3px rgba(255,255,255,0.9)',
          padding: '2px 6px',
          backgroundColor: 'transparent', // ✅ 背景透明
          borderRadius: 3,
        }}
      >
        {line.label || line.title}
      </div>

      {/* 连接点 - 在连线模式下显示所有连接点，或在选中/hover时显示 */}
      {isEditMode && (connectionMode.lineId || isSelected || isHovered) && onStartConnection && onCompleteConnection && (
        <ConnectionPoints
          nodeId={line.id}
          isVisible={true}
          connectionMode={connectionMode}
          onStartConnection={onStartConnection}
          onCompleteConnection={onCompleteConnection}
        />
      )}
    </div>
  );
};

/**
 * LineRenderer 主组件 - 根据类型渲染不同的 Line
 */
export const LineRenderer: React.FC<LineRendererProps> = (props) => {
  const { line } = props;
  
  // 根据 schemaId 判断类型
  const isMilestone = line.schemaId?.includes('milestone');
  const isGateway = line.schemaId?.includes('gateway');
  
  if (isMilestone) {
    return <MilestoneRenderer {...props} />;
  }
  
  if (isGateway) {
    return <GatewayRenderer {...props} />;
  }
  
  // 默认渲染为 Bar
  return <BarRenderer {...props} />;
};
