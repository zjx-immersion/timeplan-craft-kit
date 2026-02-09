/**
 * useTimelineDrag - 时间线拖拽 Hook
 * 
 * 📋 迁移信息:
 * - 原文件: src/hooks/useTimelineDrag.ts
 * - 迁移日期: 2026-02-03
 * - 功能: 任务条拖拽移动
 * 
 * 🎯 功能:
 * - 鼠标/触摸拖拽支持
 * - 网格对齐
 * - 拖拽预览
 * - 最小移动阈值
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { TimeScale } from '@/utils/dateUtils';
import { Line } from '@/types/timeplanSchema';
import { getDateFromPosition, getPositionFromDate, snapToGrid, getPixelsPerDay, addDays, parseDateAsLocal } from '@/utils/dateUtils';

interface DragState {
  isDragging: boolean;
  nodeId: string | null;
  startX: number;
  startPosition: number;
  currentX: number;
  hasMoved: boolean;
}

const DRAG_THRESHOLD = 5;

interface UseTimelineDragProps {
  viewStartDate: Date;
  scale: TimeScale;
  onNodeMove: (nodeId: string, newStartDate: Date, newEndDate?: Date) => void;
  isEditMode: boolean;
}

export const useTimelineDrag = ({
  viewStartDate,
  scale,
  onNodeMove,
  isEditMode,
}: UseTimelineDragProps) => {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    nodeId: null,
    startX: 0,
    startPosition: 0,
    currentX: 0,
    hasMoved: false,
  });

  const nodeRef = useRef<Line | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // 视觉日期：用于平滑移动（不带吸附）
  const [visualDates, setVisualDates] = useState<{ start?: Date; end?: Date }>({});
  // 吸附日期：用于持久化（带吸附）
  const [snappedDates, setSnappedDates] = useState<{ start?: Date; end?: Date }>({});

  const handleDragStart = useCallback((
    e: React.MouseEvent | React.TouchEvent,
    line: Line
  ) => {
    if (!isEditMode) return;

    e.preventDefault();
    e.stopPropagation();

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    // ✅ 使用统一的日期解析逻辑
    const initialStart = parseDateAsLocal(line.startDate);
    const position = getPositionFromDate(initialStart, viewStartDate, scale);

    nodeRef.current = line;
    setMousePosition({ x: clientX, y: clientY });

    const initialEnd = line.endDate ? parseDateAsLocal(line.endDate) : undefined;

    setVisualDates({ start: initialStart, end: initialEnd });
    setSnappedDates({ start: initialStart, end: initialEnd });

    setDragState({
      isDragging: true,
      nodeId: line.id,
      startX: clientX,
      startPosition: position,
      currentX: clientX,
      hasMoved: false,
    });
  }, [isEditMode, viewStartDate, scale]);

  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!dragState.isDragging || !nodeRef.current) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const deltaX = clientX - dragState.startX;
    const hasMoved = Math.abs(deltaX) > DRAG_THRESHOLD;

    setMousePosition({ x: clientX, y: clientY });

    if (dragState.hasMoved || hasMoved) {
      const line = nodeRef.current;
      const currentPos = dragState.startPosition + deltaX;

      // 计算视觉日期（平滑渲染）
      const pixelsPerDay = getPixelsPerDay(scale);
      const daysOffset = deltaX / pixelsPerDay;
      
      // ✅ 使用统一的日期解析逻辑
      const originalStart = parseDateAsLocal(line.startDate);
      const newVisualStart = addDays(originalStart, daysOffset);

      // 🎯 计算吸附日期（用于存储）
      // ✅ 修复：始终按天粒度对齐，兼容所有时间轴显示
      const rawDate = getDateFromPosition(currentPos, viewStartDate, scale);
      const newSnappedStart = snapToGrid(rawDate, 'day'); // 强制按天对齐

      if (line.endDate) {
        const originalEnd = parseDateAsLocal(line.endDate);
        const duration = originalEnd.getTime() - originalStart.getTime();

        setVisualDates({
          start: newVisualStart,
          end: new Date(newVisualStart.getTime() + duration)
        });

        setSnappedDates({
          start: newSnappedStart,
          end: new Date(newSnappedStart.getTime() + duration)
        });
      } else {
        setVisualDates({ start: newVisualStart });
        setSnappedDates({ start: newSnappedStart });
      }
    }

    setDragState(prev => ({
      ...prev,
      currentX: clientX,
      hasMoved: prev.hasMoved || hasMoved,
    }));
  }, [dragState.isDragging, dragState.startX, dragState.startPosition, dragState.hasMoved, viewStartDate, scale]);

  const handleDragEnd = useCallback(() => {
    if (!dragState.isDragging || !nodeRef.current) return;

    if (dragState.hasMoved && snappedDates.start) {
      onNodeMove(dragState.nodeId!, snappedDates.start, snappedDates.end);
    }

    setDragState({
      isDragging: false,
      nodeId: null,
      startX: 0,
      startPosition: 0,
      currentX: 0,
      hasMoved: false,
    });

    nodeRef.current = null;
    setVisualDates({});
    setSnappedDates({});
  }, [dragState.isDragging, dragState.hasMoved, dragState.nodeId, snappedDates, onNodeMove]);

  // 添加全局鼠标事件监听
  useEffect(() => {
    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleDragMove, { passive: false });
      document.addEventListener('mouseup', handleDragEnd);
      document.addEventListener('touchmove', handleDragMove, { passive: false });
      document.addEventListener('touchend', handleDragEnd);
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
        document.removeEventListener('touchmove', handleDragMove);
        document.removeEventListener('touchend', handleDragEnd);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [dragState.isDragging, handleDragMove, handleDragEnd]);

  return {
    isDragging: dragState.isDragging,
    draggingNodeId: dragState.nodeId,
    handleDragStart,
    getDragOffset: () => dragState.currentX - dragState.startX,
    dragMousePosition: mousePosition,
    dragVisualDates: visualDates,
    dragSnappedDates: snappedDates,
    isDragActive: dragState.isDragging && dragState.hasMoved,
  };
};
