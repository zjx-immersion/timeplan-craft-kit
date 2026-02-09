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
import { getDateFromPosition, getPositionFromDate, getPixelsPerDay, addDays, parseDateAsLocal } from '@/utils/dateUtils';
import { differenceInDays, startOfDay } from 'date-fns';

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
  allLines?: Line[]; // ✅ 新增：所有lines用于磁吸
}

const MINIMUM_BAR_WIDTH_PX = 20;
const MAGNETIC_SNAP_THRESHOLD_DAYS = 1; // ✅ 磁吸阈值：1天内自动吸附

/**
 * ✅ 查找附近的元素并返回吸附日期
 */
const findMagneticSnapDate = (
  targetDate: Date,
  currentLineId: string,
  allLines: Line[],
  edge: 'left' | 'right'
): Date | null => {
  if (!allLines || allLines.length === 0) return null;

  let closestDate: Date | null = null;
  let minDistance = MAGNETIC_SNAP_THRESHOLD_DAYS + 1;

  allLines.forEach(line => {
    if (line.id === currentLineId) return; // 跳过自己

    // ✅ 使用统一的日期解析逻辑
    const lineStartDate = parseDateAsLocal(line.startDate);
    const lineEndDate = line.endDate ? parseDateAsLocal(line.endDate) : lineStartDate;

    // 检查与其他元素的开始和结束日期的距离
    const startDistance = Math.abs(differenceInDays(targetDate, lineStartDate));
    const endDistance = Math.abs(differenceInDays(targetDate, lineEndDate));

    if (startDistance < minDistance) {
      minDistance = startDistance;
      closestDate = lineStartDate;
    }

    if (endDistance < minDistance) {
      minDistance = endDistance;
      closestDate = lineEndDate;
    }
  });

  // 如果在阈值内，返回吸附日期
  return minDistance <= MAGNETIC_SNAP_THRESHOLD_DAYS ? closestDate : null;
};

export const useBarResize = ({
  viewStartDate,
  scale,
  onNodeResize,
  isEditMode,
  allLines = [], // ✅ 接收所有lines
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
  // ✅ 磁吸状态：用于显示视觉反馈
  const [magneticSnapInfo, setMagneticSnapInfo] = useState<{ date: Date; position: number } | null>(null);

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

    // ✅ 使用统一的日期解析逻辑
    const startDate = parseDateAsLocal(line.startDate);
    const endDate = line.endDate ? parseDateAsLocal(line.endDate) : addDays(startDate, 7);

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
    const daysOffset = Math.round(deltaX / pixelsPerDay);  // ✅ 四舍五入到整数天

    if (resizeState.edge === 'left') {
      // ✅ V5 修复：直接按整数天计算，使用startOfDay对齐（不用snapToGrid）
      let snappedStart = addDays(resizeState.originalStartDate, daysOffset);
      snappedStart = startOfDay(snappedStart);  // ✅ 只对齐到天的开始，不跨月/年
      
      // 确保不超过结束日期（至少保持1天）
      const minStart = addDays(resizeState.originalEndDate, -1);
      if (snappedStart > minStart) {
        snappedStart = minStart;
      }

      // ✅ 磁吸到附近元素
      const magneticDate = findMagneticSnapDate(snappedStart, resizeState.nodeId!, allLines, 'left');
      if (magneticDate) {
        snappedStart = magneticDate;
        // ✅ 设置磁吸视觉反馈
        const magneticPosition = getPositionFromDate(magneticDate, viewStartDate, scale);
        setMagneticSnapInfo({ date: magneticDate, position: magneticPosition });
      } else {
        setMagneticSnapInfo(null);
      }

      setVisualDates({ start: snappedStart, end: resizeState.originalEndDate });
      setSnappedDates({ start: snappedStart, end: resizeState.originalEndDate });

    } else if (resizeState.edge === 'right') {
      // ✅ V5 修复：直接按整数天计算，使用startOfDay对齐（不用snapToGrid）
      let snappedEnd = addDays(resizeState.originalEndDate, daysOffset);
      snappedEnd = startOfDay(snappedEnd);  // ✅ 只对齐到天的开始，不跨月/年
      
      // 确保不小于开始日期（至少保持1天）
      const minEnd = addDays(resizeState.originalStartDate, 1);
      if (snappedEnd < minEnd) {
        snappedEnd = minEnd;
      }

      // ✅ 磁吸到附近元素
      const magneticDate = findMagneticSnapDate(snappedEnd, resizeState.nodeId!, allLines, 'right');
      if (magneticDate) {
        snappedEnd = magneticDate;
        // ✅ 设置磁吸视觉反馈
        const magneticPosition = getPositionFromDate(magneticDate, viewStartDate, scale);
        setMagneticSnapInfo({ date: magneticDate, position: magneticPosition });
      } else {
        setMagneticSnapInfo(null);
      }

      setVisualDates({ start: resizeState.originalStartDate, end: snappedEnd });
      setSnappedDates({ start: resizeState.originalStartDate, end: snappedEnd });
    }
  }, [resizeState, viewStartDate, scale, allLines]);

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
    setMagneticSnapInfo(null); // ✅ 清除磁吸反馈
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
    magneticSnapInfo, // ✅ 返回磁吸信息
  };
};
