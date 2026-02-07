/**
 * useBarResize - 任务条调整大小 Hook
 * 
 * 📋 迁移信息:
 * - 原文件: src/hooks/useBarResize.ts
 * - 迁移日期: 2026-02-03
 * - 功能: 任务条左右拖拽调整大小
 * 
 * 🎯 功能:
 * - 左右边缘拖拽
 * - 最小宽度限制
 * - 网格对齐
 * - 调整预览
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { Line } from '@/types/timeplanSchema';
import { TimeScale } from '@/utils/dateUtils';
import { getDateFromPosition, getPositionFromDate, snapToGrid, getPixelsPerDay, addDays } from '@/utils/dateUtils';

interface ResizeState {
  isResizing: boolean;
  nodeId: string | null;
  edge: 'left' | 'right' | null;
  startX: number;
  originalStartDate: Date;
  originalEndDate: Date;
  originalStartPosition: number;
  originalEndPosition: number;
}

interface UseBarResizeProps {
  viewStartDate: Date;
  scale: TimeScale;
  onNodeResize: (nodeId: string, newStartDate: Date, newEndDate: Date) => void;
  isEditMode: boolean;
}

const MINIMUM_BAR_WIDTH_PX = 20;

export const useBarResize = ({
  viewStartDate,
  scale,
  onNodeResize,
  isEditMode,
}: UseBarResizeProps) => {
  const [resizeState, setResizeState] = useState<ResizeState>({
    isResizing: false,
    nodeId: null,
    edge: null,
    startX: 0,
    originalStartDate: new Date(),
    originalEndDate: new Date(),
    originalStartPosition: 0,
    originalEndPosition: 0,
  });

  const nodeRef = useRef<Line | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // 视觉日期：用于平滑移动（不带吸附）
  const [visualDates, setVisualDates] = useState<{ start?: Date; end?: Date }>({});
  // 吸附日期：用于持久化（带吸附）
  const [snappedDates, setSnappedDates] = useState<{ start?: Date; end?: Date }>({});

  const handleResizeStart = useCallback((
    e: React.MouseEvent,
    line: Line,
    edge: 'left' | 'right'
  ) => {
    const isBar = line.schemaId?.includes('bar');
    if (!isEditMode || !isBar) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    const endDate = line.endDate ? new Date(line.endDate) : new Date(new Date(line.startDate).getTime() + 7 * 24 * 60 * 60 * 1000);
    const startDate = new Date(line.startDate);

    nodeRef.current = line;
    setResizeState({
      isResizing: true,
      nodeId: line.id,
      edge,
      startX: e.clientX,
      originalStartDate: startDate,
      originalEndDate: endDate,
      originalStartPosition: getPositionFromDate(startDate, viewStartDate, scale),
      originalEndPosition: getPositionFromDate(endDate, viewStartDate, scale),
    });

    setVisualDates({ start: startDate, end: endDate });
    setSnappedDates({ start: startDate, end: endDate });
    setMousePosition({ x: e.clientX, y: e.clientY });
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
  }, [isEditMode, viewStartDate, scale]);

  const handleResizeMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!resizeState.isResizing || !nodeRef.current) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const deltaX = clientX - resizeState.startX;

    setMousePosition({ x: clientX, y: clientY });

    const pixelsPerDay = getPixelsPerDay(scale);
    const daysOffset = deltaX / pixelsPerDay;

    if (resizeState.edge === 'left') {
      const newVisualStart = addDays(resizeState.originalStartDate, daysOffset);
      const minVisualStart = addDays(resizeState.originalEndDate, -(MINIMUM_BAR_WIDTH_PX / pixelsPerDay));
      const visualStart = newVisualStart > minVisualStart ? minVisualStart : newVisualStart;

      // 吸附日期
      const newSnappedPosition = resizeState.originalStartPosition + deltaX;
      const minSnappedPosition = resizeState.originalEndPosition - MINIMUM_BAR_WIDTH_PX;
      const clampedPosition = Math.min(newSnappedPosition, minSnappedPosition);
      const snappedStart = snapToGrid(getDateFromPosition(clampedPosition, viewStartDate, scale), scale);

      setVisualDates({ start: visualStart, end: resizeState.originalEndDate });
      setSnappedDates({ start: snappedStart, end: resizeState.originalEndDate });

    } else if (resizeState.edge === 'right') {
      const newVisualEnd = addDays(resizeState.originalEndDate, daysOffset);
      const minVisualEnd = addDays(resizeState.originalStartDate, (MINIMUM_BAR_WIDTH_PX / pixelsPerDay));
      const visualEnd = newVisualEnd < minVisualEnd ? minVisualEnd : newVisualEnd;

      // 吸附日期
      const newSnappedPosition = resizeState.originalEndPosition + deltaX;
      const minSnappedPosition = resizeState.originalStartPosition + MINIMUM_BAR_WIDTH_PX;
      const clampedPosition = Math.max(newSnappedPosition, minSnappedPosition);
      const snappedEnd = snapToGrid(getDateFromPosition(clampedPosition, viewStartDate, scale), scale);

      setVisualDates({ start: resizeState.originalStartDate, end: visualEnd });
      setSnappedDates({ start: resizeState.originalStartDate, end: snappedEnd });
    }
  }, [resizeState, viewStartDate, scale]);

  const handleResizeEnd = useCallback(() => {
    if (!resizeState.isResizing || !nodeRef.current) return;

    if (snappedDates.start && snappedDates.end) {
      onNodeResize(resizeState.nodeId!, snappedDates.start, snappedDates.end);
    }

    setResizeState({
      isResizing: false,
      nodeId: null,
      edge: null,
      startX: 0,
      originalStartDate: new Date(),
      originalEndDate: new Date(),
      originalStartPosition: 0,
      originalEndPosition: 0,
    });

    nodeRef.current = null;
    setVisualDates({});
    setSnappedDates({});
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, [resizeState, snappedDates, onNodeResize]);

  // 添加全局鼠标事件监听
  useEffect(() => {
    if (resizeState.isResizing) {
      document.addEventListener('mousemove', handleResizeMove, { passive: false });
      document.addEventListener('mouseup', handleResizeEnd);
      document.addEventListener('touchmove', handleResizeMove, { passive: false });
      document.addEventListener('touchend', handleResizeEnd);

      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
        document.removeEventListener('touchmove', handleResizeMove);
        document.removeEventListener('touchend', handleResizeEnd);
      };
    }
  }, [resizeState.isResizing, handleResizeMove, handleResizeEnd]);

  return {
    resizingNodeId: resizeState.nodeId,
    handleResizeStart,
    resizeMousePosition: mousePosition,
    resizeVisualDates: visualDates,
    resizeSnappedDates: snappedDates,
    isResizing: resizeState.isResizing,
  };
};
