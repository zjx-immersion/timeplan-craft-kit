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
import { Tooltip } from 'antd';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { parseDateAsLocal } from '@/utils/dateUtils';

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
  // 关键路径
  isCriticalPath?: boolean;
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
  isCriticalPath = false,
}) => {
  // 🎨 获取节点颜色（优先级：attributes.color > line.color > 默认Teal色）
  // ✅ 修复：使用透明度版本，参考源项目
  const barColor = line.attributes?.color || line.color || timelineColors.barTransparent;
  const hoverColor = timelineColors.barHoverTransparent;
  
  // 悬停状态
  const [isHovering, setIsHovering] = React.useState(false);
  
  // ✅ 格式化日期范围用于Tooltip（使用统一的日期解析）
  const dateRangeText = React.useMemo(() => {
    try {
      const startDate = parseDateAsLocal(line.startDate);
      const endDate = parseDateAsLocal(line.endDate);
      return `${format(startDate, 'yyyy-MM-dd', { locale: zhCN })} ~ ${format(endDate, 'yyyy-MM-dd', { locale: zhCN })}`;
    } catch (error) {
      return '';
    }
  }, [line.startDate, line.endDate]);
  
  return (
    <Tooltip 
      title={dateRangeText} 
      placement="top"
      mouseEnterDelay={0.5}
    >
    <div
      onClick={onClick}
      onMouseDown={onMouseDown}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={{
        position: 'absolute',
        left: startPos,
        top: '50%',
        // ✅ V8修复：移除scale变换，避免视觉边界超出实际日期范围
        transform: 'translateY(-50%)',
        width,
        height: 20,
        // ✅ V8修复：使用border-box确保border包含在width内
        boxSizing: 'border-box',
        // 🎨 颜色：选中时更亮，hover时有提示
        backgroundColor: isInteracting 
          ? timelineColors.barDragging
          : (isSelected 
              ? `color-mix(in srgb, ${barColor} 85%, white 15%)`  // 选中时更亮
              : (isHovering && isEditMode ? hoverColor : barColor)),
        borderRadius: 4,
        // 🎯 选中样式：双层ring效果
        // 🎯 关键路径样式：加粗红色边框 + 红色阴影
        border: isCriticalPath
          ? `3px solid #ef4444` // 红色加粗边框
          : (isSelected
              ? `2px solid ${timelineColors.selected}`
              : `1px solid rgba(0,0,0,0.04)`),
        boxShadow: isCriticalPath
          ? `0 0 8px rgba(239, 68, 68, 0.5), 0 0 16px rgba(239, 68, 68, 0.3)` // 红色阴影
          : (isSelected 
              ? `0 0 0 2px ${timelineColors.selected}, 0 0 0 5px ${timelineColors.selectedRing}, 0 4px 12px rgba(0,0,0,0.15)` // 增强ring + 阴影
              : (isInteracting
                  ? timelineShadows.dragging
                  : (isHovering ? timelineShadows.nodeMd : timelineShadows.nodeSm))),
        cursor: isEditMode ? (isInteracting ? 'grabbing' : 'grab') : 'pointer',
        display: 'flex',
        alignItems: 'center',
        padding: `0 6px`,
        transition: isInteracting ? 'none' : `${timelineTransitions.normal}, transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)`,
        zIndex: isSelected ? 10 : (isInteracting ? 5 : 1),  // ✅ 选中时更高zIndex
        opacity: isInteracting ? 0.7 : (isSelected ? 0.85 : 0.6),  // ✅ 选中时降低透明度
      }}
    >
      {/* ✅ 左侧调整手柄 - 放在连线点右侧 */}
      {isEditMode && isSelected && onResizeStart && (
        <div
          onMouseDown={(e) => {
            e.stopPropagation();
            onResizeStart(e, 'left');
          }}
          style={{
            position: 'absolute',
            left: 8,  // ✅ 向右移动，为连线点留空间
            top: -4,
            bottom: -4,
            width: 12,  // ✅ 缩小宽度
            cursor: 'ew-resize',
            zIndex: 15,  // ✅ 降低zIndex，让连线点(zIndex: 20)显示在上面
            backgroundColor: '#1890ff',
            borderRadius: '4px',
            boxShadow: '0 0 8px rgba(24, 144, 255, 0.8)',
            border: '2px solid rgba(255, 255, 255, 0.9)',
            transition: 'all 0.2s',
            pointerEvents: 'auto',  // ✅ 确保可以点击
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.width = '16px';
            e.currentTarget.style.boxShadow = '0 0 12px rgba(24, 144, 255, 1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.width = '12px';
            e.currentTarget.style.boxShadow = '0 0 8px rgba(24, 144, 255, 0.8)';
          }}
        />
      )}
      
      {/* ✅ 标题标签 - 显示在Bar上方，完整显示文字 */}
      <div
        style={{
          position: 'absolute',
          left: 0,                       // 与bar左边缘对齐
          top: -20,                      // 上方20px
          whiteSpace: 'nowrap',          // ✅ 不换行，完整显示
          fontSize: 12,
          fontWeight: 600,
          color: '#1E293B',              // Slate-900
          pointerEvents: 'none',
          textShadow: '0 0 3px rgba(255,255,255,0.9)',
          padding: '2px 4px',
          backgroundColor: 'transparent', // ✅ 背景透明
          borderRadius: 3,
          // ✅ 移除maxWidth限制，让文字完整显示
          minWidth: width > 0 ? `${width}px` : 'auto', // 最小宽度为bar宽度
          // ✅ 移除overflow和textOverflow，不裁剪文字
        }}
      >
        {line.label || line.title || line.name}
      </div>
      
      {/* ✅ 右侧调整手柄 - 放在连线点左侧 */}
      {isEditMode && isSelected && onResizeStart && (
        <div
          onMouseDown={(e) => {
            e.stopPropagation();
            onResizeStart(e, 'right');
          }}
          style={{
            position: 'absolute',
            right: 8,  // ✅ 向左移动，为连线点留空间
            top: -4,
            bottom: -4,
            width: 12,  // ✅ 缩小宽度
            cursor: 'ew-resize',
            zIndex: 15,  // ✅ 降低zIndex，让连线点(zIndex: 20)显示在上面
            backgroundColor: '#1890ff',
            borderRadius: '4px',
            boxShadow: '0 0 8px rgba(24, 144, 255, 0.8)',
            border: '2px solid rgba(255, 255, 255, 0.9)',
            transition: 'all 0.2s',
            pointerEvents: 'auto',  // ✅ 确保可以点击
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.width = '16px';
            e.currentTarget.style.boxShadow = '0 0 12px rgba(24, 144, 255, 1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.width = '12px';
            e.currentTarget.style.boxShadow = '0 0 8px rgba(24, 144, 255, 0.8)';
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
    </Tooltip>
  );
};

/**
 * 渲染 Milestone 类型（菱形）
 */
const MilestoneRenderer: React.FC<LineRendererProps> = ({
  line,
  startPos,
  isSelected,
  isCriticalPath = false,
  isInteracting,
  isEditMode,
  onMouseDown,
  onClick,
  isHovered = false,
  connectionMode = { lineId: null, direction: 'from' },
  onStartConnection,
  onCompleteConnection,
}) => {
  const size = 24;  // ✅ 增大尺寸到24px
  const hitAreaSize = 48;  // ✅ 可点击区域48px
  // 🎨 Milestone 使用黄色
  const color = line.attributes?.color || line.color || timelineColors.milestone;
  
  const [isHovering, setIsHovering] = React.useState(false);
  
  // ✅ 格式化日期用于Tooltip（使用统一的日期解析）
  const dateText = React.useMemo(() => {
    try {
      const startDate = parseDateAsLocal(line.startDate);
      return format(startDate, 'yyyy-MM-dd', { locale: zhCN });
    } catch (error) {
      return '';
    }
  }, [line.startDate]);
  
  return (
    <Tooltip 
      title={dateText} 
      placement="top"
      mouseEnterDelay={0.5}
    >
    <div
      onClick={onClick}
      onMouseDown={onMouseDown}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={{
        position: 'absolute',
        left: startPos - hitAreaSize / 2,  // ✅ 使用大的可点击区域
        top: '50%',
        transform: 'translateY(-50%)',
        width: hitAreaSize,
        height: hitAreaSize,
        cursor: isEditMode ? (isInteracting ? 'grabbing' : 'grab') : 'pointer',
        zIndex: isSelected ? 12 : (isInteracting ? 10 : 2),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: isInteracting ? 'none' : `${timelineTransitions.normal}`,
      }}
    >
      {/* ✅ 选中时的外圈（参考截图3） */}
      {isSelected && (
        <div
          style={{
            position: 'absolute',
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: '2px solid #13c2c2',  // ✅ 青色边框
            backgroundColor: 'rgba(19, 194, 194, 0.1)',  // ✅ 淡青色背景
            zIndex: -1,
          }}
        />
      )}
      {/* ✅ 倒三角形 - 使用SVG，空心、边粗 */}
      <svg width={size} height={size} viewBox="0 0 24 24" style={{ position: 'relative', zIndex: 1 }}>
        <polygon
          points="12,20 2,4 22,4"  // ✅ 放大后的坐标
          fill="transparent"
          stroke={isCriticalPath ? '#ef4444' : color}
          strokeWidth={isCriticalPath ? 3 : 3}  // ✅ 统一粗边
          strokeLinejoin="round"
        />
      </svg>
      
      {/* ✅ 标签 - 显示在Milestone上方，居中对齐，完整显示 */}
      <div
        style={{
          position: 'absolute',
          left: '50%',                   // 居中
          transform: 'translateX(-50%)', // 水平居中
          top: -24,                      // 上方24px
          whiteSpace: 'nowrap',          // ✅ 不换行，完整显示
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
        {line.label || line.title || line.name}
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
    </Tooltip>
  );
};

/**
 * 渲染 Gateway 类型（六边形）
 */
const GatewayRenderer: React.FC<LineRendererProps> = ({
  line,
  startPos,
  isSelected,
  isCriticalPath = false,
  isInteracting,
  isEditMode,
  onMouseDown,
  onClick,
  isHovered = false,
  connectionMode = { lineId: null, direction: 'from' },
  onStartConnection,
  onCompleteConnection,
}) => {
  const size = 24;  // ✅ 增大尺寸到24px
  const hitAreaSize = 48;  // ✅ 可点击区域48px
  // 🎨 Gateway 使用紫色
  const color = line.attributes?.color || line.color || timelineColors.gateway;
  
  const [isHovering, setIsHovering] = React.useState(false);
  
  // ✅ 格式化日期用于Tooltip（使用统一的日期解析）
  const dateText = React.useMemo(() => {
    try {
      const startDate = parseDateAsLocal(line.startDate);
      return format(startDate, 'yyyy-MM-dd', { locale: zhCN });
    } catch (error) {
      return '';
    }
  }, [line.startDate]);
  
  return (
    <Tooltip 
      title={dateText} 
      placement="top"
      mouseEnterDelay={0.5}
    >
    <div
      onClick={onClick}
      onMouseDown={onMouseDown}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={{
        position: 'absolute',
        left: startPos - hitAreaSize / 2,  // ✅ 使用大的可点击区域
        top: '50%',
        transform: 'translateY(-50%)',
        width: hitAreaSize,
        height: hitAreaSize,
        cursor: isEditMode ? (isInteracting ? 'grabbing' : 'grab') : 'pointer',
        zIndex: isSelected ? 12 : (isInteracting ? 10 : 1),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: isInteracting ? 'none' : `${timelineTransitions.normal}`,
      }}
    >
      {/* ✅ 选中时的外圈（参考截图3） */}
      {isSelected && (
        <div
          style={{
            position: 'absolute',
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: '2px solid #13c2c2',  // ✅ 青色边框
            backgroundColor: 'rgba(19, 194, 194, 0.1)',  // ✅ 淡青色背景
            zIndex: -1,
          }}
        />
      )}
      {/* ✅ 菱形 - 使用SVG，实心 */}
      <svg width={size} height={size} viewBox="0 0 24 24" style={{ position: 'relative', zIndex: 1 }}>
        <polygon
          points="12,0 24,12 12,24 0,12"  // ✅ 放大后的坐标
          fill={isCriticalPath ? '#ef4444' : color}
          stroke="transparent"
          strokeWidth={0}
        />
      </svg>
      
      {/* ✅ 标签 - 显示在Gateway上方，居中对齐，完整显示 */}
      <div
        style={{
          position: 'absolute',
          left: '50%',                   // 居中对齐
          transform: 'translateX(-50%)', // 水平居中
          top: -28,                      // 上方28px（gateway比milestone大）
          whiteSpace: 'nowrap',          // ✅ 不换行，完整显示
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
        {line.label || line.title || line.name}
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
    </Tooltip>
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
