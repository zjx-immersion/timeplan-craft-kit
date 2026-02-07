/**
 * BaselineRangeDragCreator - 基线范围拖拽创建器
 * 
 * 功能:
 * - 覆盖整个时间轴区域
 * - 点击并拖拽创建时间范围
 * - 实时预览（背景 + 边界线 + 日期提示）
 * - 支持 ESC 取消
 * - 最小拖拽距离：20px
 * 
 * @version 1.0.0
 * @date 2026-02-07
 * @migrated-from timeline-craft-kit/src/components/timeline/BaselineRangeDragCreator.tsx
 */

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { format, startOfDay } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { TimeScale } from '@/utils/dateUtils';
import { getDateFromPosition } from '@/utils/dateUtils';

/**
 * BaselineRangeDragCreator 组件属性
 */
export interface BaselineRangeDragCreatorProps {
  /**
   * 是否激活
   */
  isActive: boolean;

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
   * 滚动容器引用
   */
  scrollContainerRef: React.RefObject<HTMLDivElement>;

  /**
   * 完成回调
   */
  onComplete: (startDate: Date, endDate: Date) => void;

  /**
   * 取消回调
   */
  onCancel: () => void;
}

/**
 * 最小拖拽距离（像素）
 */
const MIN_DRAG_DISTANCE = 20;

/**
 * BaselineRangeDragCreator 组件
 */
export const BaselineRangeDragCreator: React.FC<BaselineRangeDragCreatorProps> = ({
  isActive,
  viewStartDate,
  scale,
  height,
  leftOffset = 200,
  scrollContainerRef,
  onComplete,
  onCancel,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragCurrentX, setDragCurrentX] = useState(0);
  const [previewStartDate, setPreviewStartDate] = useState<Date | null>(null);
  const [previewEndDate, setPreviewEndDate] = useState<Date | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * 获取滚动位置
   */
  const getScrollLeft = useCallback(() => {
    return scrollContainerRef.current?.scrollLeft || 0;
  }, [scrollContainerRef]);

  /**
   * 鼠标按下
   */
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isActive) return;

    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const rect = scrollContainer.getBoundingClientRect();
    const scrollLeft = getScrollLeft();
    const relativeToContainer = e.clientX - rect.left;
    
    // 忽略侧边栏内的点击
    if (relativeToContainer < leftOffset) {
      return;
    }

    const timelineX = relativeToContainer - leftOffset + scrollLeft;
    
    console.log('[BaselineRangeDragCreator] Mouse down:', {
      clientX: e.clientX,
      rectLeft: rect.left,
      relativeToContainer,
      leftOffset,
      scrollLeft,
      timelineX,
    });

    setIsDragging(true);
    setDragStartX(timelineX);
    setDragCurrentX(timelineX);

    // 计算开始日期
    const startDate = startOfDay(getDateFromPosition(timelineX, viewStartDate, scale));
    setPreviewStartDate(startDate);
    setPreviewEndDate(startDate);
  }, [isActive, scrollContainerRef, getScrollLeft, leftOffset, viewStartDate, scale]);

  /**
   * 鼠标移动
   */
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const rect = scrollContainer.getBoundingClientRect();
    const scrollLeft = getScrollLeft();
    const relativeToContainer = e.clientX - rect.left;
    const timelineX = Math.max(0, relativeToContainer - leftOffset + scrollLeft);

    setDragCurrentX(timelineX);

    // 计算日期范围
    const minX = Math.min(dragStartX, timelineX);
    const maxX = Math.max(dragStartX, timelineX);

    const startDate = startOfDay(getDateFromPosition(minX, viewStartDate, scale));
    const endDate = startOfDay(getDateFromPosition(maxX, viewStartDate, scale));

    setPreviewStartDate(startDate);
    setPreviewEndDate(endDate);
  }, [isDragging, dragStartX, scrollContainerRef, getScrollLeft, leftOffset, viewStartDate, scale]);

  /**
   * 鼠标松开
   */
  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;

    setIsDragging(false);

    // 检查拖拽距离
    const distance = Math.abs(dragCurrentX - dragStartX);
    if (distance < MIN_DRAG_DISTANCE) {
      console.log('[BaselineRangeDragCreator] Drag distance too small, cancelled');
      setPreviewStartDate(null);
      setPreviewEndDate(null);
      return;
    }

    // 完成拖拽
    if (previewStartDate && previewEndDate) {
      console.log('[BaselineRangeDragCreator] Drag complete:', {
        startDate: previewStartDate,
        endDate: previewEndDate,
      });
      onComplete(previewStartDate, previewEndDate);
    }

    setPreviewStartDate(null);
    setPreviewEndDate(null);
  }, [isDragging, dragStartX, dragCurrentX, previewStartDate, previewEndDate, onComplete]);

  /**
   * ESC 键取消
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isActive) {
        setIsDragging(false);
        setPreviewStartDate(null);
        setPreviewEndDate(null);
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, onCancel]);

  /**
   * 全局鼠标事件监听
   */
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // 计算预览显示位置
  const previewStyle = useMemo(() => {
    if (!isDragging || !previewStartDate || !previewEndDate) return null;

    const minX = Math.min(dragStartX, dragCurrentX);
    const maxX = Math.max(dragStartX, dragCurrentX);
    const width = maxX - minX;

    // 计算显示位置（考虑滚动）
    const scrollLeft = scrollContainerRef.current?.scrollLeft || 0;
    const displayMinX = minX - scrollLeft;
    const visualLeft = leftOffset + displayMinX;

    return {
      left: visualLeft,
      width,
    };
  }, [isDragging, dragStartX, dragCurrentX, previewStartDate, previewEndDate, leftOffset, scrollContainerRef]);

  if (!isActive) return null;

  return (
    <>
      {/* 覆盖层 */}
      <div
        ref={containerRef}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 50,
          cursor: isDragging ? 'grabbing' : 'crosshair',
        }}
        onMouseDown={handleMouseDown}
      />

      {/* 预览显示 */}
      {isDragging && previewStyle && (
        <div
          style={{
            position: 'absolute',
            left: previewStyle.left,
            top: 0,
            width: previewStyle.width,
            height,
            backgroundColor: 'rgba(22, 119, 255, 0.25)',
            border: '2px dashed #1677ff',
            pointerEvents: 'none',
            zIndex: 51,
          }}
        >
          {/* 日期提示 */}
          {previewStartDate && previewEndDate && (
            <div
              style={{
                position: 'absolute',
                left: 8,
                top: 64,
                padding: '4px 8px',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                color: '#fff',
                fontSize: 11,
                borderRadius: 4,
                whiteSpace: 'nowrap',
              }}
            >
              {format(previewStartDate, 'yyyy-MM-dd', { locale: zhCN })} ~ {format(previewEndDate, 'yyyy-MM-dd', { locale: zhCN })}
            </div>
          )}
        </div>
      )}

      {/* 操作提示 */}
      {isActive && (
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
          {isDragging ? '拖拽鼠标创建范围...' : '点击并拖拽创建基线范围，按 ESC 取消'}
        </div>
      )}
    </>
  );
};

export default BaselineRangeDragCreator;
