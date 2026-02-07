/**
 * BaselineRangeMarker - 基线范围标记组件
 * 
 * 功能:
 * - 在时间轴上渲染基线范围（时间区间）
 * - 支持拖拽移动整个范围
 * - 支持左右边缘调整大小
 * - 显示标签徽章
 * - 编辑模式下显示编辑/删除按钮
 * - z-index: 10 （背景层）
 * 
 * @version 1.0.0
 * @date 2026-02-07
 * @migrated-from timeline-craft-kit/src/components/timeline/BaselineRangeMarker.tsx
 */

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Button, Tag, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, DragOutlined } from '@ant-design/icons';
import { format, startOfDay, addDays, differenceInDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { BaselineRange } from '@/types/timeplanSchema';
import type { TimeScale } from '@/utils/dateUtils';
import { getPositionFromDate, getPixelsPerDay } from '@/utils/dateUtils';

/**
 * BaselineRangeMarker 组件属性
 */
export interface BaselineRangeMarkerProps {
  /**
   * 基线范围数据
   */
  range: BaselineRange;

  /**
   * 视图起始日期
   */
  viewStartDate: Date;

  /**
   * 时间刻度
   */
  scale: TimeScale;

  /**
   * 高度
   */
  height: number;

  /**
   * 左侧偏移（侧边栏宽度）
   * @default 200
   */
  leftOffset?: number;

  /**
   * 是否编辑模式
   * @default false
   */
  isEditMode?: boolean;

  /**
   * 编辑回调
   */
  onEdit?: () => void;

  /**
   * 删除回调
   */
  onDelete?: () => void;

  /**
   * 更新回调（用于拖拽）
   */
  onUpdate?: (range: BaselineRange) => void;
}

/**
 * 解析颜色，添加透明度
 */
const parseColor = (color: string, opacity: number = 0.35): string => {
  if (color.startsWith('rgba')) {
    // 替换现有的透明度
    return color.replace(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/, `rgba($1, $2, $3, ${opacity})`);
  } else if (color.startsWith('rgb')) {
    // 转换为 rgba
    return color.replace('rgb(', 'rgba(').replace(')', `, ${opacity})`);
  } else if (color.startsWith('#')) {
    // hex 转 rgba
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  } else if (color.startsWith('hsl')) {
    // hsl 保持原样，添加透明度（CSS会自动处理）
    return color;
  }
  return color;
};

/**
 * BaselineRangeMarker 组件
 */
export const BaselineRangeMarker: React.FC<BaselineRangeMarkerProps> = ({
  range,
  viewStartDate,
  scale,
  height,
  leftOffset = 200,
  isEditMode = false,
  onEdit,
  onDelete,
  onUpdate,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);
  const [previewStartDate, setPreviewStartDate] = useState<Date | null>(null);
  const [previewEndDate, setPreviewEndDate] = useState<Date | null>(null);

  const dragStartXRef = useRef<number>(0);
  const originalStartDateRef = useRef<Date>(range.startDate);
  const originalEndDateRef = useRef<Date>(range.endDate);

  // 计算位置和宽度
  const { startPos, width, displayStartDate, displayEndDate } = useMemo(() => {
    const startDate = previewStartDate || range.startDate;
    const endDate = previewEndDate || range.endDate;
    
    const start = getPositionFromDate(startDate, viewStartDate, scale);
    const end = getPositionFromDate(endDate, viewStartDate, scale);
    
    return {
      startPos: leftOffset + start,
      width: end - start,
      displayStartDate: startDate,
      displayEndDate: endDate,
    };
  }, [range.startDate, range.endDate, previewStartDate, previewEndDate, viewStartDate, scale, leftOffset]);

  // 获取背景颜色和边框颜色
  const { backgroundColor, borderColor } = useMemo(() => {
    const color = range.color || '#1677ff';
    return {
      backgroundColor: parseColor(color, 0.35),
      borderColor: color,
    };
  }, [range.color]);

  // 格式化日期范围
  const dateRangeText = useMemo(() => {
    try {
      const start = format(displayStartDate, 'yyyy-MM-dd', { locale: zhCN });
      const end = format(displayEndDate, 'yyyy-MM-dd', { locale: zhCN });
      return `${start} ~ ${end}`;
    } catch (error) {
      console.error('[BaselineRangeMarker] Error formatting dates:', error);
      return '';
    }
  }, [displayStartDate, displayEndDate]);

  /**
   * 拖拽移动 - 开始
   */
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if (!isEditMode || !onUpdate) return;
    e.stopPropagation();
    setIsDragging(true);
    dragStartXRef.current = e.clientX;
    originalStartDateRef.current = range.startDate;
    originalEndDateRef.current = range.endDate;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - dragStartXRef.current;
      const pixelsPerDay = getPixelsPerDay(scale);
      const deltaDays = Math.round(deltaX / pixelsPerDay);
      
      const newStart = startOfDay(addDays(originalStartDateRef.current, deltaDays));
      const newEnd = startOfDay(addDays(originalEndDateRef.current, deltaDays));
      
      setPreviewStartDate(newStart);
      setPreviewEndDate(newEnd);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      if (previewStartDate && previewEndDate && onUpdate) {
        onUpdate({
          ...range,
          startDate: previewStartDate,
          endDate: previewEndDate,
        });
      }
      setPreviewStartDate(null);
      setPreviewEndDate(null);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [isEditMode, onUpdate, range, scale, previewStartDate, previewEndDate]);

  /**
   * 调整大小 - 左边缘
   */
  const handleResizeLeftStart = useCallback((e: React.MouseEvent) => {
    if (!isEditMode || !onUpdate) return;
    e.stopPropagation();
    setIsResizingLeft(true);
    dragStartXRef.current = e.clientX;
    originalStartDateRef.current = range.startDate;
    originalEndDateRef.current = range.endDate;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - dragStartXRef.current;
      const pixelsPerDay = getPixelsPerDay(scale);
      const deltaDays = Math.round(deltaX / pixelsPerDay);
      
      const newStart = startOfDay(addDays(originalStartDateRef.current, deltaDays));
      
      // 限制：开始日期必须 < 结束日期
      if (newStart < originalEndDateRef.current) {
        setPreviewStartDate(newStart);
      }
    };

    const handleMouseUp = () => {
      setIsResizingLeft(false);
      if (previewStartDate && onUpdate) {
        onUpdate({
          ...range,
          startDate: previewStartDate,
        });
      }
      setPreviewStartDate(null);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [isEditMode, onUpdate, range, scale, previewStartDate]);

  /**
   * 调整大小 - 右边缘
   */
  const handleResizeRightStart = useCallback((e: React.MouseEvent) => {
    if (!isEditMode || !onUpdate) return;
    e.stopPropagation();
    setIsResizingRight(true);
    dragStartXRef.current = e.clientX;
    originalStartDateRef.current = range.startDate;
    originalEndDateRef.current = range.endDate;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - dragStartXRef.current;
      const pixelsPerDay = getPixelsPerDay(scale);
      const deltaDays = Math.round(deltaX / pixelsPerDay);
      
      const newEnd = startOfDay(addDays(originalEndDateRef.current, deltaDays));
      
      // 限制：结束日期必须 > 开始日期
      if (newEnd > originalStartDateRef.current) {
        setPreviewEndDate(newEnd);
      }
    };

    const handleMouseUp = () => {
      setIsResizingRight(false);
      if (previewEndDate && onUpdate) {
        onUpdate({
          ...range,
          endDate: previewEndDate,
        });
      }
      setPreviewEndDate(null);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [isEditMode, onUpdate, range, scale, previewEndDate]);

  return (
    <div
      style={{
        position: 'absolute',
        left: startPos,
        top: 0,
        width,
        height,
        zIndex: 10,
        pointerEvents: isEditMode ? 'auto' : 'none',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 背景区域 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor,
          cursor: isDragging ? 'grabbing' : (isEditMode ? 'grab' : 'default'),
        }}
        onMouseDown={handleDragStart}
      />

      {/* 左边界虚线 */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 2,
          height,
          borderLeft: `2px dashed ${borderColor}`,
          cursor: isEditMode ? 'ew-resize' : 'default',
        }}
        onMouseDown={handleResizeLeftStart}
      />

      {/* 右边界虚线 */}
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          width: 2,
          height,
          borderRight: `2px dashed ${borderColor}`,
          cursor: isEditMode ? 'ew-resize' : 'default',
        }}
        onMouseDown={handleResizeRightStart}
      />

      {/* 标签徽章 */}
      <div
        style={{
          position: 'absolute',
          left: 8,
          top: 64,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          pointerEvents: 'auto',
          zIndex: 60,
        }}
      >
        {/* 拖拽手柄 + 标签 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {isEditMode && <DragOutlined style={{ color: borderColor, cursor: 'grab' }} />}
          <Tag
            color={borderColor}
            style={{
              margin: 0,
              fontSize: 11,
              lineHeight: '16px',
              padding: '0 6px',
              whiteSpace: 'nowrap',
              cursor: isEditMode ? 'pointer' : 'default',
            }}
            onClick={isEditMode ? onEdit : undefined}
          >
            {range.label || '基线范围'}
          </Tag>
        </div>

        {/* 日期范围 */}
        <div
          style={{
            fontSize: 10,
            color: '#8c8c8c',
            whiteSpace: 'nowrap',
          }}
        >
          {dateRangeText}
        </div>

        {/* 编辑模式：显示编辑/删除按钮 */}
        {isEditMode && isHovered && (
          <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
            <Tooltip title="编辑范围">
              <Button
                type="primary"
                size="small"
                icon={<EditOutlined />}
                onClick={onEdit}
                style={{
                  fontSize: 10,
                  height: 20,
                  padding: '0 6px',
                }}
              />
            </Tooltip>
            <Tooltip title="删除范围">
              <Button
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={onDelete}
                style={{
                  fontSize: 10,
                  height: 20,
                  padding: '0 6px',
                }}
              />
            </Tooltip>
          </div>
        )}
      </div>

      {/* 拖拽/调整提示 */}
      {(isDragging || isResizingLeft || isResizingRight) && (
        <div
          style={{
            position: 'fixed',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '8px 16px',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: '#fff',
            borderRadius: 4,
            fontSize: 12,
            zIndex: 9999,
            whiteSpace: 'nowrap',
          }}
        >
          {isDragging && `移动中: ${differenceInDays(displayEndDate, displayStartDate)}天`}
          {isResizingLeft && `调整开始日期: ${format(displayStartDate, 'yyyy-MM-dd')}`}
          {isResizingRight && `调整结束日期: ${format(displayEndDate, 'yyyy-MM-dd')}`}
        </div>
      )}
    </div>
  );
};

export default BaselineRangeMarker;
