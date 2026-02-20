/**
 * TimelinePanel - 时间线面板（甘特图核心组件）
 * 
 * 📋 迁移信息:
 * - 原文件: src/components/timeline/TimelinePanel.tsx
 * - 迁移日期: 2026-02-03
 * - 布局: 按原项目效果图实现
 * - 对比状态: ⏳ 待验证
 * 
 * 🎯 布局要求（基于效果图）:
 * - 顶部工具栏：编辑图、Timeline、节点、关键路径等按钮
 * - 右上角视图切换：甘特图、表格、矩阵、版本对比、选代规划等
 * - 左侧Timeline列表：折叠图标、颜色、名称、负责人、产品线等信息
 * - 右侧时间轴区域：时间刻度、网格、任务条、里程碑、依赖关系
 * 
 * 🔄 技术替换:
 * - Radix UI → Ant Design
 * - Context → Zustand Store
 * - Tailwind → Ant Design Token
 */

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Button, Space, Tooltip, Segmented, theme, message, Input, Dropdown, Modal, App, type MenuProps } from 'antd';
import {
  EditOutlined,
  PlusOutlined,
  NodeIndexOutlined,
  ShareAltOutlined,
  CalendarOutlined,
  DownOutlined,
  RightOutlined,
  TableOutlined,
  AppstoreOutlined,
  BarChartOutlined,
  HistoryOutlined,
  BlockOutlined,
  SaveOutlined,
  UndoOutlined,
  RedoOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  ArrowLeftOutlined,
  MinusOutlined,
  FlagOutlined,
  BgColorsOutlined,
  CloseOutlined,
  DownloadOutlined,
  UploadOutlined,
  SearchOutlined,
  FullscreenOutlined,
} from '@ant-design/icons';
import { TimePlan, Timeline, Line, Relation, Baseline, BaselineRange } from '@/types/timeplanSchema';
import { TimeScale } from '@/utils/dateUtils';
import {
  getDateHeaders,
  getTotalTimelineWidth,
  normalizeViewStartDate,
  normalizeViewEndDate,
  getPositionFromDate,
  getDateFromPosition,  // ✅ 添加：从位置计算日期
  getPositionFromDatePrecise,
  getBarWidthPrecise,
  getBarWidthTruePrecise,
  getScaleUnit,
  getPixelsPerDay,
  parseDateAsLocal,
} from '@/utils/dateUtils';
import {
  format,
  addDays,
  startOfWeek,
  startOfDay,
  getDaysInMonth,
} from 'date-fns';
// addDays已在上面导入
import { isHoliday, isNonWorkingDay, getHolidayName } from '@/utils/holidayUtils';
import { useTimelineDrag } from '@/hooks/useTimelineDrag';
import { useBarResize } from '@/hooks/useBarResize';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import { useKeyboardShortcuts, CommonShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useSelection } from '@/hooks/useSelection';
import { 
  exportTimePlanToExcel, 
  exportTimePlanToCSV, 
  exportSelectedLinesToExcel, 
  exportSelectedLinesToCSV 
} from '@/utils/exportUtils';
import { addMonths, subMonths } from 'date-fns';
import { LineRenderer } from './LineRenderer';
import { RelationRenderer } from './RelationRenderer';
import { TodayLine } from './TodayLine';
import TimelineHeader from './TimelineHeader';
import TimelineQuickMenu from './TimelineQuickMenu';
import { TimelineEditDialog } from '../dialogs/TimelineEditDialog';
import { downloadJSON, downloadCSV, downloadExcel } from '@/utils/dataExport';
import ConnectionPoints from './ConnectionPoints';
import { ConnectionMode } from './ConnectionMode';
import BaselineMarker from './BaselineMarker';
import BaselineRangeMarker from './BaselineRangeMarker';
import BaselineEditDialog from './BaselineEditDialog';
import BaselineRangeEditDialog from './BaselineRangeEditDialog';
import BaselineRangeDragCreator from './BaselineRangeDragCreator';
import NodeContextMenu from './NodeContextMenu';
import { NodeEditDialog } from '../dialogs/NodeEditDialog';
import { RelationEditDialog } from '../dialogs/RelationEditDialog';
import { TimelineTimeShiftDialog } from '../dialogs/TimelineTimeShiftDialog';
import { calculateCriticalPath } from '@/utils/criticalPath';
import { useNavigationStore } from '@/stores/navigationStore';

/**
 * TimelinePanel 组件属性
 */
interface TimelinePanelProps {
  /**
   * 时间计划数据
   */
  data: TimePlan;

  /**
   * 数据变化回调
   */
  onDataChange?: (data: TimePlan) => void;

  /**
   * 节点双击回调
   */
  onNodeDoubleClick?: (line: Line) => void;

  /**
   * 导入示例数据回调
   */
  onImportSampleData?: () => void;

  /**
   * 标题变化回调
   */
  onTitleChange?: (newTitle: string) => void;

  /**
   * 是否隐藏内置工具栏和页头
   * @default false
   */
  hideToolbar?: boolean;

  /**
   * 时间刻度（外部控制）
   */
  scale?: TimeScale;

  /**
   * 缩放比例（外部控制）
   */
  zoom?: number;

  /**
   * 是否显示关键路径（外部控制）
   */
  showCriticalPath?: boolean;

  /**
   * 是否只读（外部控制）
   */
  readonly?: boolean;

  /**
   * 是否编辑模式（外部控制）
   */
  isEditMode?: boolean;

  /**
   * 视图切换回调
   */
  onViewChange?: (view: string) => void;

  /**
   * 编辑模式切换回调
   */
  onEditModeChange?: (editMode: boolean) => void;

  /**
   * 时间刻度切换回调
   */
  onScaleChange?: (scale: TimeScale) => void;

  /**
   * 滚动到今天的回调函数引用
   */
  scrollToTodayRef?: React.MutableRefObject<(() => void) | null>;
}

/**
 * 行高度常量
 */
// 🎨 行高调整：与源项目一致（120px）
const ROW_HEIGHT = 120; // 源项目：timeline-craft-kit 使用 120px

/**
 * 头部高度常量
 */
const HEADER_HEIGHT = 72; // TimelineHeader的高度（2行header，每行36px）

/**
 * 侧边栏宽度
 */
const SIDEBAR_WIDTH = 200;

/**
 * ✅ 性能优化：默认颜色列表移到组件外部，避免每次渲染创建新数组
 */
const DEFAULT_TIMELINE_COLORS = [
  '#52c41a', // 绿色
  '#1890ff', // 蓝色
  '#9254de', // 紫色
  '#13c2c2', // 青色
  '#fa8c16', // 橙色
  '#eb2f96', // 粉色
  '#fadb14', // 黄色
] as const;

/**
 * 视图类型
 */
type ViewType = 'gantt' | 'table' | 'matrix' | 'iteration' | 'baseline' | 'version' | 'versionPlan';

/**
 * TimelinePanel 主组件
 */
const TimelinePanel: React.FC<TimelinePanelProps> = ({
  data: initialData,
  onDataChange,
  onNodeDoubleClick,
  onImportSampleData,
  onTitleChange,
  hideToolbar = false,
  scale: externalScale,
  zoom: externalZoom,
  showCriticalPath: externalShowCriticalPath,
  readonly: externalReadonly,
  isEditMode: externalIsEditMode,
  onViewChange,
  onEditModeChange,
  onScaleChange,
  scrollToTodayRef,
}) => {
  const { token } = theme.useToken();

  /**
   * ✅ V11.1修复：使用App.useApp()获取modal实例（避免context问题）
   */
  const { modal } = App.useApp();

  // ==================== 标题编辑状态 ====================

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(initialData.title);

  // ==================== 关键路径状态 ====================
  
  const [internalShowCriticalPath, setInternalShowCriticalPath] = useState(false);
  const showCriticalPath = externalShowCriticalPath !== undefined ? externalShowCriticalPath : internalShowCriticalPath;

  // ==================== 防止重复滚动 ====================
  
  const isScrollingRef = useRef(false);
  const lastScrollTargetRef = useRef<string | null>(null);

  const handleSaveTitle = useCallback(() => {
    if (editedTitle.trim() && editedTitle !== initialData.title) {
      onTitleChange?.(editedTitle.trim());
      message.success('标题已更新');
    }
    setIsEditingTitle(false);
  }, [editedTitle, initialData.title, onTitleChange]);

  const handleCancelEditTitle = useCallback(() => {
    setEditedTitle(initialData.title);
    setIsEditingTitle(false);
  }, [initialData.title]);

  // ==================== 撤销/重做状态管理 ====================

  const {
    state: data,
    setState: setData,
    undo,
    redo,
    canUndo,
    canRedo,
    hasChanges,
    save: saveChanges,
    reset: resetChanges,
  } = useUndoRedo<TimePlan>(initialData);

  // ==================== 批量选择 ====================
  
  const selection = useSelection({
    getId: (line: Line) => line.id,
    items: data.lines,
    onSelectionChange: (selectedIds, selectedLines) => {
    },
  });

  // 同步外部数据变化
  const prevInitialDataRef = useRef(initialData);

  useEffect(() => {
    const initialDataChanged = JSON.stringify(prevInitialDataRef.current) !== JSON.stringify(initialData);

    if (initialDataChanged) {
      setData(initialData);
      prevInitialDataRef.current = initialData;
    }
  }, [initialData, setData]);

  // 自动保存
  useEffect(() => {
    if (!onDataChange) return;
    if (JSON.stringify(data) === JSON.stringify(initialData)) return;

    const timeoutId = setTimeout(() => {
      onDataChange(data);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [data, onDataChange, initialData]);

  // ==================== 导航Store ====================
  
  const { 
    targetLineIds, 
    currentTaskIndex,
    highlight, 
    autoScroll, 
    highlightDuration,
    clearNavigation,
    navigateToNextTask,
    navigateToPreviousTask,
  } = useNavigationStore();
  
  // 高亮的Line IDs（用于动画）
  const [highlightedLineIds, setHighlightedLineIds] = useState<Set<string>>(new Set());

  // ==================== 状态管理 ====================

  // 视图相关状态
  const [internalScale, setInternalScale] = useState<TimeScale>(initialData.viewConfig?.scale || 'month');
  const scale = externalScale || internalScale;
  const handleScaleChange = useCallback((newScale: TimeScale) => {
    setInternalScale(newScale);
    onScaleChange?.(newScale);
  }, [onScaleChange]);

  const [viewType, setViewType] = useState<ViewType>('gantt');
  const handleViewTypeChange = useCallback((newView: ViewType) => {
    setViewType(newView);
    onViewChange?.(newView);
  }, [onViewChange]);
  const [viewStartDate, setViewStartDate] = useState(() => {
    // ⚠️ 临时禁用 viewConfig，避免使用错误的缓存范围
    // TODO: 后续需要验证 viewConfig 的有效性
    // if (initialData.viewConfig?.startDate) {
    //   const date = initialData.viewConfig.startDate instanceof Date
    //     ? initialData.viewConfig.startDate
    //     : new Date(initialData.viewConfig.startDate);
    //   console.log('[TimelinePanel] 使用 viewConfig startDate:', date);
    //   return date;
    // }
    
    // ✅ 固定范围：2024年1月1日
    console.log('[TimelinePanel] 使用默认 startDate: 2024-01-01（已忽略viewConfig）');
    return new Date(2024, 0, 1);
  });
  const [viewEndDate, setViewEndDate] = useState(() => {
    // ⚠️ 临时禁用 viewConfig，避免使用错误的缓存范围
    // if (initialData.viewConfig?.endDate) {
    //   const date = initialData.viewConfig.endDate instanceof Date
    //     ? initialData.viewConfig.endDate
    //     : new Date(initialData.viewConfig.endDate);
    //   console.log('[TimelinePanel] 使用 viewConfig endDate:', date);
    //   return date;
    // }
    
    // ✅ 固定范围：2028年12月31日
    console.log('[TimelinePanel] 使用默认 endDate: 2028-12-31（已忽略viewConfig）');
    return new Date(2028, 11, 31);
  });
  
  // ✅ 移除自动调整范围的逻辑，所有视图都使用2024-2028固定范围
  // useEffect(() => {
  //   // 不再需要，所有scale都使用固定的2024-2028范围
  // }, [scale]);
  
  const [internalIsEditMode, setInternalIsEditMode] = useState(false);
  // ✅ 修复：优先使用 externalIsEditMode，然后是 readonly 反转，最后是内部状态
  const isEditMode = externalIsEditMode !== undefined 
    ? externalIsEditMode 
    : (externalReadonly !== undefined ? !externalReadonly : internalIsEditMode);
  const handleIsEditModeChange = useCallback((newMode: boolean) => {
    setInternalIsEditMode(newMode);
    onEditModeChange?.(newMode);
  }, [onEditModeChange]);

  // ✅ V10: 注入磁吸脉冲动画CSS
  // ✅ Task 3.4: 注入高亮动画CSS
  useEffect(() => {
    // 磁吸脉冲动画
    const styleId = 'magnetic-pulse-animation';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes magneticPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.3);
            opacity: 0.7;
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    // 高亮动画（Task 3.4）
    const highlightStyleId = 'highlight-pulse-animation';
    if (!document.getElementById(highlightStyleId)) {
      const highlightStyle = document.createElement('style');
      highlightStyle.id = highlightStyleId;
      highlightStyle.textContent = `
        @keyframes highlight-pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(24, 144, 255, 0);
            background-color: transparent;
          }
          50% {
            box-shadow: 0 0 20px 5px rgba(24, 144, 255, 0.6);
            background-color: rgba(24, 144, 255, 0.1);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }
        
        .line-highlighted {
          animation: highlight-pulse 2s ease-in-out;
          z-index: 100;
        }
      `;
      document.head.appendChild(highlightStyle);
    }
  }, []);

  // 选择相关状态
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);
  const [hoveredLineId, setHoveredLineId] = useState<string | null>(null);
  const [selectedRelationId, setSelectedRelationId] = useState<string | null>(null);
  const [collapsedTimelines, setCollapsedTimelines] = useState<Set<string>>(new Set());

  // Timeline编辑状态
  const [editingTimeline, setEditingTimeline] = useState<Timeline | null>(null);
  const [isTimelineEditDialogOpen, setIsTimelineEditDialogOpen] = useState(false);

  // Relation编辑状态
  const [editingRelation, setEditingRelation] = useState<Relation | null>(null);
  const [isRelationEditDialogOpen, setIsRelationEditDialogOpen] = useState(false);

  // 连线模式状态
  const [connectionMode, setConnectionMode] = useState<{
    lineId: string | null;
    direction: 'from' | 'to';
  }>({ lineId: null, direction: 'from' });

  // 基线系统状态
  const [editingBaseline, setEditingBaseline] = useState<Baseline | null>(null);
  const [isBaselineDialogOpen, setIsBaselineDialogOpen] = useState(false);
  const [isNewBaseline, setIsNewBaseline] = useState(false);
  
  const [editingBaselineRange, setEditingBaselineRange] = useState<BaselineRange | null>(null);
  const [isBaselineRangeDialogOpen, setIsBaselineRangeDialogOpen] = useState(false);
  const [isNewBaselineRange, setIsNewBaselineRange] = useState(false);
  const [isRangeDragMode, setIsRangeDragMode] = useState(false);

  // 节点编辑状态
  const [editingNode, setEditingNode] = useState<Line | null>(null);
  const [nodeEditDialogOpen, setNodeEditDialogOpen] = useState(false);

  // 时间平移状态
  const [timeShiftDialogOpen, setTimeShiftDialogOpen] = useState(false);
  const [timeShiftTimelineId, setTimeShiftTimelineId] = useState<string | null>(null);

  // Refs
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const prevScaleRef = useRef<TimeScale>(scale);
  const prevTotalWidthRef = useRef<number>(0);
  
  /**
   * ✅ 滚动对齐：整体滚动，左侧固定
   * 注意：现在使用外层统一滚动容器，无需单独同步
   */

  // ==================== 规范化的视图日期 ====================

  const normalizedViewStartDate = useMemo(() => {
    const normalized = normalizeViewStartDate(viewStartDate, scale);
    console.log('[TimelinePanel] 规范化 viewStartDate:', {
      原始: viewStartDate,
      规范化后: normalized,
      scale,
    });
    return normalized;
  }, [viewStartDate, scale]);

  const normalizedViewEndDate = useMemo(() => {
    const normalized = normalizeViewEndDate(viewEndDate, scale);
    console.log('[TimelinePanel] 规范化 viewEndDate:', {
      原始: viewEndDate,
      规范化后: normalized,
      scale,
    });
    return normalized;
  }, [viewEndDate, scale]);

  // ==================== 时间轴相关计算 ====================

  // 获取日期表头
  const dateHeaders = useMemo(
    () => getDateHeaders(normalizedViewStartDate, normalizedViewEndDate, scale),
    [normalizedViewStartDate, normalizedViewEndDate, scale]
  );

  // 计算时间轴总宽度
  const totalWidth = useMemo(
    () => getTotalTimelineWidth(normalizedViewStartDate, normalizedViewEndDate, scale),
    [normalizedViewStartDate, normalizedViewEndDate, scale]
  );

  // ✅ 简化：只在视图切换或错误时输出
  // 详细日志可通过设置 localStorage.setItem('DEBUG_TIMELINE', 'true') 启用

  // ==================== 视图切换时保持滚动位置相对比例 ====================
  
  useEffect(() => {
    // 检测 scale 是否发生变化
    if (prevScaleRef.current !== scale) {
      const scrollContainer = scrollContainerRef.current;
      const prevScale = prevScaleRef.current;
      const prevTotalWidth = prevTotalWidthRef.current;

      if (scrollContainer && prevTotalWidth > 0) {
        // 计算切换前的滚动位置相对比例
        const currentScrollLeft = scrollContainer.scrollLeft;
        const scrollRatio = currentScrollLeft / prevTotalWidth;

        console.log(`[TimelinePanel] 📊 视图切换 - 保持滚动位置相对比例:
  - 旧视图: ${prevScale}, 旧总宽度: ${prevTotalWidth}px, 旧滚动位置: ${currentScrollLeft}px
  - 相对比例: ${(scrollRatio * 100).toFixed(2)}%
  - 新视图: ${scale}, 新总宽度: ${totalWidth}px`);

        // 使用 requestAnimationFrame 确保在 DOM 更新后应用新的滚动位置
        requestAnimationFrame(() => {
          const newScrollLeft = Math.round(scrollRatio * totalWidth);
          
          console.log(`  - 新滚动位置: ${newScrollLeft}px`);
          
          scrollContainer.scrollTo({
            left: newScrollLeft,
            behavior: 'auto', // 使用 'auto' 实现即时切换
          });
        });
      }

      // 更新 refs
      prevScaleRef.current = scale;
    }

    // 始终更新 totalWidth ref
    prevTotalWidthRef.current = totalWidth;
  }, [scale, totalWidth]);

  // ==================== 辅助函数 ====================

  /**
   * 处理 Line 移动
   */
  const handleLineMove = useCallback((lineId: string, newStartDate: Date, newEndDate?: Date) => {
    const updatedLines = data.lines.map((line) =>
      line.id === lineId
        ? { ...line, startDate: newStartDate, endDate: newEndDate ?? line.endDate }
        : line
    );

    setData({
      ...data,
      lines: updatedLines,
    });

    message.success('任务已移动');
  }, [data, setData]);

  /**
   * 处理 Line 调整大小
   */
  const handleLineResize = useCallback((lineId: string, newStartDate: Date, newEndDate: Date) => {
    const updatedLines = data.lines.map((line) =>
      line.id === lineId
        ? { ...line, startDate: newStartDate, endDate: newEndDate }
        : line
    );

    setData({
      ...data,
      lines: updatedLines,
    });

    message.success('任务时间已调整');
  }, [data, setData]);

  /**
   * 处理保存
   */
  const handleSave = useCallback(() => {
    saveChanges();
    if (onDataChange) {
      onDataChange(data);
    }
    message.success('保存成功');
  }, [saveChanges, data, onDataChange]);

  /**
   * 定位到今天
   */
  const scrollToToday = useCallback(() => {
    if (!scrollContainerRef.current) return;

    const today = new Date();
    const position = getPositionFromDate(today, normalizedViewStartDate, scale);

    // 滚动到今天的位置，居中显示
    const containerWidth = scrollContainerRef.current.clientWidth;
    const scrollLeft = Math.max(0, position - containerWidth / 2 + SIDEBAR_WIDTH);

    scrollContainerRef.current.scrollTo({
      left: scrollLeft,
      behavior: 'smooth',
    });
  }, [normalizedViewStartDate, scale]);

  // 将scrollToToday暴露给外部
  useEffect(() => {
    if (scrollToTodayRef) {
      scrollToTodayRef.current = scrollToToday;
    }
  }, [scrollToToday, scrollToTodayRef]);

  // ==================== 初次加载和视图切换时自动定位到今日 ====================
  
  const hasInitialScrolledRef = useRef(false);
  const prevViewTypeRef = useRef<ViewType>(viewType);

  useEffect(() => {
    // 场景1: 初次加载时自动滚动到今日
    if (!hasInitialScrolledRef.current && scrollContainerRef.current && totalWidth > 0) {
      console.log('[TimelinePanel] 📍 初次加载 - 自动定位到今日');
      
      // 延迟执行，确保 DOM 已完全渲染
      setTimeout(() => {
        scrollToToday();
        hasInitialScrolledRef.current = true;
      }, 100);
    }
  }, [totalWidth, scrollToToday]);

  useEffect(() => {
    // 场景2: 从其他视图切换回甘特图时自动滚动到今日
    if (prevViewTypeRef.current !== 'gantt' && viewType === 'gantt' && hasInitialScrolledRef.current) {
      console.log('[TimelinePanel] 📍 切换回甘特图 - 自动定位到今日');
      
      // 延迟执行，确保视图已切换完成
      setTimeout(() => {
        scrollToToday();
      }, 100);
    }
    
    prevViewTypeRef.current = viewType;
  }, [viewType, scrollToToday]);

  // ==================== 导航响应逻辑（Task 3.3） ====================
  
  /**
   * 响应从矩阵视图跳转到甘特图的导航请求
   * ✅ 修复：保持完整视图范围（2024-2028），只滚动到目标位置，不调整视图范围
   */
  useEffect(() => {
    // 如果没有目标Line IDs，不执行任何操作
    if (targetLineIds.length === 0) return;
    
    console.log('[TimelinePanel] 🎯 响应导航请求:', {
      targetLineIds,
      currentTaskIndex,
      highlight,
      autoScroll,
      highlightDuration,
      currentViewStart: normalizedViewStartDate.toISOString(),
      currentViewEnd: normalizedViewEndDate.toISOString(),
    });
    
    // ✅ 修复：不再调整视图范围，保持完整的 2024-2028 时间轴
    // 只获取目标Line信息用于滚动和高亮
    const targetLines = data.lines.filter(line => targetLineIds.includes(line.id));
    
    if (targetLines.length > 0) {
      console.log('[TimelinePanel] 📍 目标Line信息:', {
        targetLines: targetLines.length,
        lineNames: targetLines.map(l => l.label).join(', '),
        // 保持当前视图范围，不调整
        viewStart: normalizedViewStartDate.toISOString().split('T')[0],
        viewEnd: normalizedViewEndDate.toISOString().split('T')[0],
      });
    }
    
    // 1. 滚动到当前任务索引对应的Line（使用当前视图范围）
    if (autoScroll && targetLineIds.length > 0 && scrollContainerRef.current && targetLines.length > 0) {
      const currentLineId = targetLineIds[currentTaskIndex] || targetLineIds[0];
      // 使用当前视图范围进行滚动，不传递自定义范围
      setTimeout(() => {
        scrollToLine(currentLineId);
      }, 100);
    }
    
    // 2. 触发高亮动画
    if (highlight) {
      setHighlightedLineIds(new Set(targetLineIds));
      
      // highlightDuration毫秒后清除高亮（但不清除导航状态，保留任务列表用于导航）
      setTimeout(() => {
        setHighlightedLineIds(new Set());
      }, highlightDuration);
    }
  }, [targetLineIds, currentTaskIndex, highlight, autoScroll, highlightDuration, data.lines, normalizedViewStartDate, normalizedViewEndDate]);
  
  /**
   * Task 3.7：响应任务索引变化（用户点击上一个/下一个任务）
   */
  useEffect(() => {
    if (targetLineIds.length === 0) return;
    
    // 滚动到当前索引的任务
    const currentLineId = targetLineIds[currentTaskIndex];
    if (currentLineId && scrollContainerRef.current) {
      setTimeout(() => {
        // ✅ 使用当前视图范围进行滚动
        scrollToLine(currentLineId);
      }, 100);
    }
  }, [currentTaskIndex, targetLineIds]);
  
  /**
   * 滚动到指定Line（居中显示）
   * ✅ 修复：使用基于日期的计算，而不是DOM位置，确保视图范围改变后仍能正确定位
   * ✅ 修复：防止重复滚动到同一目标
   * @param lineId - 要滚动到的Line ID
   * @param customViewStartDate - 可选，自定义视图开始日期（用于在调整视图范围后立即滚动）
   */
  const scrollToLine = useCallback((lineId: string, customViewStartDate?: Date) => {
    // ✅ 防重复：如果正在滚动到相同目标，跳过
    if (isScrollingRef.current && lastScrollTargetRef.current === lineId) {
      console.log('[TimelinePanel] ⏭️ 跳过重复滚动:', lineId);
      return;
    }

    const line = data.lines.find(l => l.id === lineId);
    const container = scrollContainerRef.current;
    
    if (!line || !container) {
      console.warn('[TimelinePanel] 滚动失败 - Line或容器未找到:', lineId);
      return;
    }

    // ✅ 标记正在滚动
    isScrollingRef.current = true;
    lastScrollTargetRef.current = lineId;
    
    // 使用传入的自定义视图开始日期，或当前的 state
    const effectiveViewStartDate = customViewStartDate || normalizedViewStartDate;
    
    // 使用基于日期的计算获取Line的水平位置
    const lineStartDate = new Date(line.startDate);
    const linePosition = getPositionFromDate(lineStartDate, effectiveViewStartDate, scale);
    
    // 估算Line宽度（用于居中计算）
    const lineWidth = line.endDate 
      ? getPositionFromDate(new Date(line.endDate), effectiveViewStartDate, scale) - linePosition
      : 100; // 默认宽度
    
    // 获取Line的垂直位置（通过查找timeline索引）
    const timelineIndex = data.timelines.findIndex(t => t.id === line.timelineId);
    const rowHeight = ROW_HEIGHT;
    const lineTop = timelineIndex >= 0 ? timelineIndex * rowHeight + rowHeight / 2 : 0;
    
    // 计算目标滚动位置（使Line居中）
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    const targetScrollLeft = Math.max(0, linePosition + lineWidth / 2 - containerWidth / 2);
    const targetScrollTop = Math.max(0, lineTop - containerHeight / 2);
    
    console.log('[TimelinePanel] 📍 滚动到Line:', {
      lineId,
      lineLabel: line.label,
      lineDate: line.startDate,
      linePosition,
      targetScrollTop,
      targetScrollLeft,
      viewStart: effectiveViewStartDate,
      customViewStartDate: customViewStartDate ? format(customViewStartDate, 'yyyy-MM-dd') : undefined,
      scale,
    });
    
    // 平滑滚动
    container.scrollTo({
      top: targetScrollTop,
      left: targetScrollLeft,
      behavior: 'smooth',
    });

    // ✅ 500ms 后解除锁定（平滑滚动动画时间）
    setTimeout(() => {
      isScrollingRef.current = false;
    }, 500);
  }, [data.lines, data.timelines, normalizedViewStartDate, scale]);

  // ==================== 全局快捷键 ====================
  
  useKeyboardShortcuts({
    enabled: true,
    ignoreInputs: true,
    shortcuts: [
      // Ctrl+Z: 撤销
      CommonShortcuts.undo(() => {
        if (canUndo) {
          undo();
          message.info('已撤销');
        }
      }),
      
      // Ctrl+Y / Ctrl+Shift+Z: 重做
      ...CommonShortcuts.redo(() => {
        if (canRedo) {
          redo();
          message.info('已重做');
        }
      }),
      
      // Ctrl+S: 保存
      CommonShortcuts.save(() => {
        handleSave();
      }),
      
      // Space: 定位今日
      CommonShortcuts.space(() => {
        scrollToToday();
        message.info('已定位到今日');
      }),
      
      // Ctrl+1~5: 切换视图刻度
      CommonShortcuts.number(1, () => handleScaleChange('day')),
      CommonShortcuts.number(2, () => handleScaleChange('week')),
      CommonShortcuts.number(3, () => handleScaleChange('month')),
      CommonShortcuts.number(4, () => handleScaleChange('quarter')),
      CommonShortcuts.number(5, () => handleScaleChange('biweekly')),
      
      // Ctrl+A: 全选
      CommonShortcuts.selectAll(() => {
        selection.selectAll();
        message.info(`已选中 ${data.lines.length} 个任务`);
      }),
      
      // Delete: 删除选中
      CommonShortcuts.delete(() => {
        if (selection.hasSelection && isEditMode) {
          const selectedLines = data.lines.filter(line => selection.isSelected(line.id));
          const lineNames = selectedLines.map(l => l.name).join('、');
          
          modal.confirm({
            title: '确认删除',
            content: `确定要删除 ${selectedLines.length} 个任务吗？（${lineNames}）`,
            onOk: () => {
              const newLines = data.lines.filter(line => !selection.isSelected(line.id));
              const newRelations = data.relations?.filter(
                rel => !selection.isSelected(rel.fromLineId) && !selection.isSelected(rel.toLineId)
              );
              
              updateData({
                ...data,
                lines: newLines,
                relations: newRelations,
              });
              
              selection.clearSelection();
              message.success(`已删除 ${selectedLines.length} 个任务`);
            },
          });
        }
      }),
      
      // Escape: 取消选择
      CommonShortcuts.escape(() => {
        if (selection.hasSelection) {
          selection.clearSelection();
          message.info('已取消选择');
        }
      }),
      
      // Task 3.7: 左箭头 - 上一个任务
      {
        key: 'ArrowLeft',
        handler: () => {
          if (targetLineIds.length > 1) {
            navigateToPreviousTask();
          }
        },
      },
      
      // Task 3.7: 右箭头 - 下一个任务
      {
        key: 'ArrowRight',
        handler: () => {
          if (targetLineIds.length > 1) {
            navigateToNextTask();
          }
        },
      },
    ],
  });

  // ✅ 修复：动态更新viewEndDate，确保时间轴覆盖所有节点
  useEffect(() => {
    // 如果viewConfig中有endDate，不自动更新
    if (data.viewConfig?.endDate) {
      return;
    }

    // 计算所有节点的最大结束日期
    if (data.lines && data.lines.length > 0) {
      const allEndDates = data.lines
        .map(line => new Date(line.endDate || line.startDate))
        .filter(date => !isNaN(date.getTime()));
      
      if (allEndDates.length > 0) {
        const maxDate = new Date(Math.max(...allEndDates.map(d => d.getTime())));
        const calculatedEndDate = addMonths(maxDate, 6); // 最后节点后延伸6个月
        
        // 只有当计算出的日期比当前viewEndDate更远时才更新
        if (calculatedEndDate > viewEndDate) {
          setViewEndDate(calculatedEndDate);
        }
      }
    }
  }, [data.lines, data.viewConfig?.endDate, viewEndDate]);

  /**
   * 缩放 - 放大（增加精度）
   */
  const handleZoomIn = useCallback(() => {
    const scaleOrder: TimeScale[] = ['quarter', 'month', 'biweekly', 'week', 'day'];
    const currentIndex = scaleOrder.indexOf(scale);
    if (currentIndex < scaleOrder.length - 1) {
      handleScaleChange(scaleOrder[currentIndex + 1]);
    }
  }, [scale, handleScaleChange]);

  /**
   * 缩放 - 缩小（减少精度）
   */
  const handleZoomOut = useCallback(() => {
    const scaleOrder: TimeScale[] = ['day', 'week', 'biweekly', 'month', 'quarter'];
    const currentIndex = scaleOrder.indexOf(scale);
    if (currentIndex < scaleOrder.length - 1) {
      handleScaleChange(scaleOrder[currentIndex + 1]);
    }
  }, [scale, handleScaleChange]);


  // ==================== 拖拽和调整大小 Hooks ====================

  const {
    isDragging,
    draggingNodeId,
    handleDragStart,
    dragVisualDates,
    dragSnappedDates,
    dragMousePosition,
    isDragActive
  } = useTimelineDrag({
    viewStartDate: normalizedViewStartDate,
    scale,
    onNodeMove: handleLineMove,
    isEditMode,
  });

  const {
    resizingNodeId,
    handleResizeStart,
    resizeVisualDates,
    resizeSnappedDates,
    resizeMousePosition,
    isResizing,
    magneticSnapInfo, // ✅ 磁吸信息用于显示视觉反馈
  } = useBarResize({
    viewStartDate: normalizedViewStartDate,
    scale,
    onNodeResize: handleLineResize,
    isEditMode,
    allLines: data.lines, // ✅ 传入所有lines用于磁吸
  });

  // ==================== 其他辅助函数 ====================

  /**
   * 根据 Timeline ID 获取其 Lines
   */
  const getLinesByTimelineId = useCallback((timelineId: string): Line[] => {
    return data.lines.filter((line) => line.timelineId === timelineId);
  }, [data.lines]);

  /**
   * 切换 Timeline 折叠状态
   */
  const toggleTimelineCollapse = useCallback((timelineId: string) => {
    setCollapsedTimelines((prev) => {
      const next = new Set(prev);
      if (next.has(timelineId)) {
        next.delete(timelineId);
      } else {
        next.add(timelineId);
      }
      return next;
    });
  }, []);

  /**
   * 处理 Line 点击（集成批量选择）
   */
  const handleLineClick = useCallback((line: Line, e?: React.MouseEvent) => {
    // 如果有事件对象，使用selection.handleClick处理批量选择
    if (e && isEditMode) {
      selection.handleClick(line.id, e);
    }
    
    // 同时保持单选逻辑（兼容非编辑模式）
    setSelectedLineId(line.id === selectedLineId ? null : line.id);
    
    // ✅ 点击任务节点时，取消连线选中
    if (selectedRelationId) {
      setSelectedRelationId(null);
      console.log('[TimelinePanel] 🔗 取消连线选中（点击任务节点）');
    }
  }, [selectedLineId, isEditMode, selection, selectedRelationId]);

  /**
   * 编辑 Timeline
   */
  const handleEditTimeline = useCallback((timelineId: string) => {
    const timeline = data.timelines.find(t => t.id === timelineId);
    if (timeline) {
      setEditingTimeline(timeline);
      setIsTimelineEditDialogOpen(true);
    }
  }, [data.timelines]);

  /**
   * 保存 Timeline 编辑
   */
  const handleSaveTimeline = useCallback((id: string, updates: Partial<Timeline>) => {
    if (id) {
      // 更新现有Timeline
      const updatedTimelines = data.timelines.map(t =>
        t.id === id ? { ...t, ...updates } : t
      );
      setData({
        ...data,
        timelines: updatedTimelines,
      });
      message.success('Timeline 已更新');
    } else {
      // 创建新Timeline (暂未实现)
      message.info('创建新Timeline功能待实现');
    }
    setIsTimelineEditDialogOpen(false);
    setEditingTimeline(null);
  }, [data, setData]);

  /**
   * 删除 Timeline
   */
  const handleDeleteTimeline = useCallback((timelineId: string) => {
    // 删除Timeline及其所有Lines
    const updatedTimelines = data.timelines.filter(t => t.id !== timelineId);
    const updatedLines = data.lines.filter(l => l.timelineId !== timelineId);
    
    // 删除相关的Relations
    const lineIds = new Set(data.lines.filter(l => l.timelineId === timelineId).map(l => l.id));
    const updatedRelations = data.relations.filter(
      rel => !lineIds.has(rel.fromLineId) && !lineIds.has(rel.toLineId)
    );
    
    setData({
      ...data,
      timelines: updatedTimelines,
      lines: updatedLines,
      relations: updatedRelations,
    });
    
    message.success('Timeline 已删除');
  }, [data, setData]);

  /**
   * ✅ 更换Timeline背景颜色
   */
  const handleBackgroundColorChange = useCallback((timelineId: string, color: string) => {
    const updatedTimelines = data.timelines.map(t =>
      t.id === timelineId ? { ...t, color } : t
    );
    
    setData({
      ...data,
      timelines: updatedTimelines,
    });
    
    message.success('背景颜色已更新');
  }, [data, setData]);

  /**
   * 打开时间平移对话框
   */
  const handleOpenTimeShift = useCallback((timelineId: string) => {
    setTimeShiftTimelineId(timelineId);
    setTimeShiftDialogOpen(true);
  }, []);

  /**
   * 确认时间平移
   */
  const handleConfirmTimeShift = useCallback((timelineId: string, offsetDays: number, keepRelations: boolean) => {
    const updatedLines = data.lines.map(line => {
      if (line.timelineId === timelineId) {
        const newLine = { ...line };
        
        // 调整开始日期
        if (newLine.startDate) {
          newLine.startDate = addDays(new Date(newLine.startDate), offsetDays).toISOString();
        }
        
        // 调整结束日期（如果有）
        if (newLine.endDate) {
          newLine.endDate = addDays(new Date(newLine.endDate), offsetDays).toISOString();
        }
        
        return newLine;
      }
      return line;
    });

    setData({
      ...data,
      lines: updatedLines,
    });

    message.success(`Timeline时间已调整 ${offsetDays > 0 ? '延后' : '提前'} ${Math.abs(offsetDays)} 天`);
    setTimeShiftDialogOpen(false);
    setTimeShiftTimelineId(null);
  }, [data, setData]);

  /**
   * 复制 Timeline
   * ✅ 修复：复制Timeline及其所有Lines和Relations
   */
  const handleCopyTimeline = useCallback((timelineId: string) => {
    const timeline = data.timelines.find(t => t.id === timelineId);
    if (!timeline) return;
    
    // 1. 获取该Timeline下的所有Lines
    const timelineLines = data.lines.filter(line => line.timelineId === timelineId);
    
    // 2. 创建新Timeline ID
    const newTimelineId = `timeline-${Date.now()}`;
    
    // 3. 创建Line ID映射（旧ID -> 新ID）
    const lineIdMap = new Map<string, string>();
    const copiedLines: Line[] = timelineLines.map(line => {
      const newLineId = `line-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      lineIdMap.set(line.id, newLineId);
      
      return {
        ...line,
        id: newLineId,
        timelineId: newTimelineId,
      };
    });
    
    // 4. 复制该Timeline内部的Relations（只复制起点和终点都在同一Timeline内的关系）
    const timelineLineIds = new Set(timelineLines.map(l => l.id));
    const copiedRelations: Relation[] = (data.relations || [])
      .filter(rel => 
        timelineLineIds.has(rel.fromLineId) && 
        timelineLineIds.has(rel.toLineId)
      )
      .map(rel => ({
        ...rel,
        id: `rel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        fromLineId: lineIdMap.get(rel.fromLineId) || rel.fromLineId,
        toLineId: lineIdMap.get(rel.toLineId) || rel.toLineId,
      }));
    
    // 5. 创建新Timeline
    const newTimeline: Timeline = {
      ...timeline,
      id: newTimelineId,
      name: `${timeline.name} (副本)`,
      title: `${timeline.title || timeline.name} (副本)`,  // ✅ 同时更新title字段
      lineIds: copiedLines.map(l => l.id),
    };
    
    // 6. 更新数据
    setData({
      ...data,
      timelines: [...data.timelines, newTimeline],
      lines: [...data.lines, ...copiedLines],
      relations: [...(data.relations || []), ...copiedRelations],
    });
    
    message.success(`Timeline 已复制（包含 ${copiedLines.length} 个元素和 ${copiedRelations.length} 条依赖关系）`);
  }, [data, setData]);

  /**
   * 开始连线
   */
  const handleStartConnection = useCallback((lineId: string, direction: 'from' | 'to') => {
    const line = data.lines.find(l => l.id === lineId);
    if (!line) return;
    
    setConnectionMode({ lineId, direction });
    console.log('[TimelinePanel] 🔗 开始连线', { lineId, direction, lineTitle: line.title });
    message.info(`连线模式：${direction === 'from' ? '从' : '到'} "${line.title}"`);
  }, [data.lines]);

  /**
   * 完成连线
   */
  const handleCompleteConnection = useCallback((targetLineId: string) => {
    if (!connectionMode.lineId) return;
    
    // 防止自连接
    if (connectionMode.lineId === targetLineId) {
      message.warning('不能连接到自己');
      setConnectionMode({ lineId: null, direction: 'from' });
      return;
    }
    
    // 确定起点和终点
    const fromLineId = connectionMode.direction === 'from' ? connectionMode.lineId : targetLineId;
    const toLineId = connectionMode.direction === 'from' ? targetLineId : connectionMode.lineId;
    
    // 检查是否已存在相同的连线
    const isDuplicate = data.relations?.some(
      r => r.fromLineId === fromLineId && r.toLineId === toLineId
    );
    
    if (isDuplicate) {
      message.warning('该连线已存在');
      setConnectionMode({ lineId: null, direction: 'from' });
      return;
    }
    
    // 创建新的relation
    const newRelation: Relation = {
      id: `rel-${Date.now()}`,
      fromLineId,
      toLineId,
      type: 'dependency',
    };
    
    console.log('[TimelinePanel] ✅ 创建新连线', newRelation);
    
    setData({
      ...data,
      relations: [...(data.relations || []), newRelation],
    });
    
    message.success('连线创建成功');
    setConnectionMode({ lineId: null, direction: 'from' });
  }, [connectionMode, data, setData]);

  /**
   * 取消连线
   */
  const handleCancelConnection = useCallback(() => {
    setConnectionMode({ lineId: null, direction: 'from' });
    console.log('[TimelinePanel] ❌ 取消连线');
  }, []);

  /**
   * 点击连线
   */
  const handleRelationClick = useCallback((relationId: string) => {
    setSelectedRelationId(prev => prev === relationId ? null : relationId);
    console.log('[TimelinePanel] 🔗 选中连线:', relationId);
  }, []);

  /**
   * 删除连线
   */
  const handleRelationDelete = useCallback((relationId: string) => {
    modal.confirm({
      title: '删除连线',
      content: '确定要删除这条依赖连线吗？',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        const updatedRelations = data.relations.filter(r => r.id !== relationId);
        setData({
          ...data,
          relations: updatedRelations,
        });
        setSelectedRelationId(null);
        message.success('连线已删除');
        console.log('[TimelinePanel] 🗑️ 删除连线:', relationId);
      },
    });
  }, [data, setData, modal]);

  /**
   * 编辑连线
   */
  const handleRelationEdit = useCallback((relationId: string) => {
    const relation = data.relations.find(r => r.id === relationId);
    if (relation) {
      setEditingRelation(relation);
      setIsRelationEditDialogOpen(true);
      console.log('[TimelinePanel] ✏️ 编辑连线:', relationId);
    }
  }, [data.relations]);

  /**
   * 保存连线编辑
   */
  const handleRelationSave = useCallback((id: string, updates: Partial<Relation>) => {
    setData(prev => ({
      ...prev,
      relations: prev.relations.map(r =>
        r.id === id ? { ...r, ...updates } : r
      ),
    }));
    setIsRelationEditDialogOpen(false);
    setEditingRelation(null);
    message.success('连线已更新');
    console.log('[TimelinePanel] 💾 保存连线:', id, updates);
  }, [setData]);

  /**
   * 添加节点到Timeline
   */
  const handleAddNodeToTimeline = useCallback((timelineId: string, type: 'lineplan' | 'milestone' | 'gateway') => {
    // ✅ 获取当前滚动位置，计算对应的日期
    const scrollLeft = scrollContainerRef.current?.scrollLeft || 0;
    const containerWidth = scrollContainerRef.current?.clientWidth || 800;
    
    // ✅ 计算可视区域中心位置对应的日期
    const centerPosition = scrollLeft + (containerWidth / 2);
    const startDate = getDateFromPosition(centerPosition, normalizedViewStartDate, scale);
    
    // ✅ 根据类型设置默认周期
    // lineplan: 2周（14天）
    // milestone: 单点，无endDate
    // gateway: 单点，无endDate
    const endDate = type === 'lineplan' ? addDays(startDate, 14) : undefined;
    
    console.log('[handleAddNodeToTimeline] 📍 创建新节点:', {
      type,
      scrollLeft,
      centerPosition,
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: endDate ? format(endDate, 'yyyy-MM-dd') : 'N/A',
      duration: type === 'lineplan' ? '14天（2周）' : '单点',
    });
    
    // 根据类型创建对应的schemaId
    const schemaId = type === 'lineplan' ? 'lineplan-schema' :
                    type === 'milestone' ? 'milestone-schema' :
                    type === 'gateway' ? 'gateway-schema' : 'lineplan-schema';
    
    // 创建新Line
    const lineName = type === 'lineplan' ? '新计划单元' : type === 'milestone' ? '新里程碑' : '新网关';
    const newLine: Line = {
      id: `line-${Date.now()}`,
      timelineId,
      schemaId,
      label: lineName,
      title: lineName,  // ✅ 同时设置title和label
      name: lineName,   // ✅ 同时设置name
      startDate,        // ✅ 使用计算的日期，而非today
      endDate,          // ✅ lineplan默认14天
      attributes: {
        name: lineName,
      },
    };
    
    console.log('[handleAddNodeToTimeline] ✅ 新节点已创建:', {
      id: newLine.id,
      type,
      schemaId,
      startDate: newLine.startDate,
      endDate: newLine.endDate,
      hasEndDate: !!newLine.endDate,
    });
    
    setData({
      ...data,
      lines: [...data.lines, newLine],
    });
    
    message.success(`节点已添加: ${lineName}${type === 'lineplan' ? ' (2周)' : ''}`);
  }, [data, setData, normalizedViewStartDate, scale]);

  /**
   * 添加Timeline
   */
  const handleAddTimeline = useCallback(() => {
    const newTimeline: Timeline = {
      id: `timeline-${Date.now()}`,
      name: '新 Timeline',
      description: '未指定',
      color: '#1677ff',
      lineIds: [],
      owner: '',
    };
    
    setData({
      ...data,
      timelines: [...data.timelines, newTimeline],
    });
    
    message.success('Timeline 已添加');
  }, [data, setData]);

  /**
   * 添加节点（到当前选中的Timeline或第一个Timeline）
   */
  const handleAddNode = useCallback((type: 'lineplan' | 'milestone' | 'gateway') => {
    // 获取第一个Timeline作为目标
    const targetTimeline = data.timelines[0];
    
    if (!targetTimeline) {
      message.warning('请先添加 Timeline');
      return;
    }
    
    handleAddNodeToTimeline(targetTimeline.id, type);
  }, [data.timelines, handleAddNodeToTimeline]);

  /**
   * 切换关键路径显示
   */
  const handleToggleCriticalPath = useCallback(() => {
    const newValue = !showCriticalPath;
    setInternalShowCriticalPath(newValue);
    message.info(newValue ? '已显示关键路径' : '已关闭关键路径');
  }, [showCriticalPath]);

  // 计算关键路径节点
  const criticalPathNodeIds = useMemo(() => {
    if (!showCriticalPath) return new Set<string>();
    const pathLines = calculateCriticalPath(data.lines, data.relations || []);
    console.log('[TimelinePanel] 🎯 关键路径:', pathLines.length, '个元素');
    return new Set(pathLines);
  }, [data.lines, data.relations, showCriticalPath]);

  // ==================== 基线系统事件处理 ====================

  /**
   * 添加基线
   */
  const handleAddBaseline = useCallback(() => {
    setEditingBaseline({
      id: `baseline-${Date.now()}`,
      date: new Date(),
      label: '',
      schemaId: undefined,
      attributes: {},
    });
    setIsNewBaseline(true);
    setIsBaselineDialogOpen(true);
  }, []);

  /**
   * 编辑基线
   */
  const handleEditBaseline = useCallback((baseline: Baseline) => {
    setEditingBaseline(baseline);
    setIsNewBaseline(false);
    setIsBaselineDialogOpen(true);
  }, []);

  /**
   * 删除基线
   */
  const handleDeleteBaseline = useCallback((baselineId: string) => {
    modal.confirm({
      title: '删除基线',
      content: '确定要删除这条基线吗？',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        const updatedBaselines = (data.baselines || []).filter(b => b.id !== baselineId);
        setData({
          ...data,
          baselines: updatedBaselines,
        });
        message.success('基线已删除');
      },
    });
  }, [data, setData, modal]);

  /**
   * 保存基线
   */
  const handleSaveBaseline = useCallback((baseline: Baseline) => {
    const existingBaselines = data.baselines || [];
    const exists = existingBaselines.some(b => b.id === baseline.id);
    const updatedBaselines = exists
      ? existingBaselines.map(b => b.id === baseline.id ? baseline : b)
      : [...existingBaselines, baseline];
    
    setData({
      ...data,
      baselines: updatedBaselines,
    });
    
    message.success(exists ? '基线已更新' : '基线已添加');
    setIsBaselineDialogOpen(false);
    setEditingBaseline(null);
  }, [data, setData]);

  /**
   * 开始拖拽创建基线范围
   */
  const handleStartRangeDrag = useCallback(() => {
    setIsRangeDragMode(true);
  }, []);

  /**
   * 拖拽完成 - 创建基线范围
   */
  const handleRangeDragComplete = useCallback((startDate: Date, endDate: Date) => {
    setEditingBaselineRange({
      id: `baseline-range-${Date.now()}`,
      startDate,
      endDate,
      label: '',
      schemaId: undefined,
      attributes: {},
    });
    setIsNewBaselineRange(true);
    setIsBaselineRangeDialogOpen(true);
    setIsRangeDragMode(false);
  }, []);

  /**
   * 拖拽取消
   */
  const handleRangeDragCancel = useCallback(() => {
    setIsRangeDragMode(false);
  }, []);

  /**
   * 编辑基线范围
   */
  const handleEditBaselineRange = useCallback((range: BaselineRange) => {
    setEditingBaselineRange(range);
    setIsNewBaselineRange(false);
    setIsBaselineRangeDialogOpen(true);
  }, []);

  /**
   * 删除基线范围
   */
  const handleDeleteBaselineRange = useCallback((rangeId: string) => {
    modal.confirm({
      title: '删除基线范围',
      content: '确定要删除这个时间区间吗？',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        const updatedRanges = (data.baselineRanges || []).filter(r => r.id !== rangeId);
        setData({
          ...data,
          baselineRanges: updatedRanges,
        });
        message.success('时间区间已删除');
      },
    });
  }, [data, setData, modal]);

  /**
   * 保存/更新基线范围
   */
  const handleSaveBaselineRange = useCallback((range: BaselineRange) => {
    const existingRanges = data.baselineRanges || [];
    const exists = existingRanges.some(r => r.id === range.id);
    const updatedRanges = exists
      ? existingRanges.map(r => r.id === range.id ? range : r)
      : [...existingRanges, range];
    
    setData({
      ...data,
      baselineRanges: updatedRanges,
    });
    
    message.success(exists ? '时间区间已更新' : '时间区间已添加');
    setIsBaselineRangeDialogOpen(false);
    setEditingBaselineRange(null);
  }, [data, setData]);

  // ==================== 节点右键菜单事件处理 ====================

  /**
   * 编辑节点
   */
  const handleEditNode = useCallback((node: Line) => {
    setEditingNode(node);
    setNodeEditDialogOpen(true);
  }, []);

  /**
   * 保存节点编辑
   */
  const handleSaveNode = useCallback((nodeId: string, updates: Partial<Line>) => {
    const updatedLines = data.lines.map(line => {
      if (line.id === nodeId) {
        return {
          ...line,
          ...updates,
          attributes: {
            ...line.attributes,
            ...(updates.attributes || {}),
          },
        };
      }
      return line;
    });

    setData({
      ...data,
      lines: updatedLines,
    });

    message.success('节点已更新');
    setNodeEditDialogOpen(false);
    setEditingNode(null);
  }, [data, setData]);

  /**
   * 删除节点（✅ V11修复：真正删除，支持撤销）
   */
  const handleDeleteNode = useCallback((nodeId: string) => {
    const node = data.lines.find(l => l.id === nodeId);
    if (!node) return;

    modal.confirm({
      title: '删除节点',
      content: `确定要删除节点"${node.label}"吗？此操作可以通过撤销恢复。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        // ✅ V11修复：使用deleteLineFromPlan工具函数，确保完整删除
        // 包括：从lines中删除、从timeline的lineIds中删除、删除相关relations
        const updatedPlan: TimePlan = {
          ...data,
          lines: data.lines.filter(l => l.id !== nodeId),
          timelines: data.timelines.map(t => ({
            ...t,
            lineIds: t.lineIds.filter(id => id !== nodeId)
          })),
          relations: data.relations.filter(
            r => r.fromLineId !== nodeId && r.toLineId !== nodeId
          ),
        };
        
        // ✅ 通过setData更新，自动记录到历史（支持撤销）
        setData(updatedPlan);
        
        // ✅ 清除选中状态
        setSelectedLineId(null);
        
        message.success('节点已删除（可通过撤销恢复）');
      },
    });
  }, [data, setData, modal]);

  /**
   * 复制节点
   */
  const handleCopyNode = useCallback((node: Line) => {
    const newLine: Line = {
      ...node,
      id: `line-${Date.now()}`,
      label: `${node.label} (副本)`,
      attributes: {
        ...node.attributes,
        name: `${node.attributes?.name || node.label} (副本)`,
      },
    };
    
    setData({
      ...data,
      lines: [...data.lines, newLine],
    });
    
    message.success('节点已复制');
  }, [data, setData]);

  /**
   * 转换节点类型
   */
  const handleConvertNodeType = useCallback((nodeId: string, newSchemaId: string) => {
    const updatedLines = data.lines.map(line => {
      if (line.id === nodeId) {
        // 转换为 milestone 或 gateway 时，移除 endDate
        const newLine = { ...line, schemaId: newSchemaId };
        if (newSchemaId === 'milestone-schema' || newSchemaId === 'gateway-schema') {
          delete newLine.endDate;
        }
        // 转换为 lineplan 时，如果没有 endDate，添加默认的 7天
        if ((newSchemaId === 'lineplan-schema' || newSchemaId === 'bar-schema') && !newLine.endDate) {
          newLine.endDate = addDays(newLine.startDate, 7);
        }
        return newLine;
      }
      return line;
    });
    
    setData({
      ...data,
      lines: updatedLines,
    });
  }, [data, setData]);

  /**
   * 添加节点到基线（待实现）
   */
  const handleAddNodeToBaseline = useCallback((nodeId: string, baselineId: string) => {
    // TODO: 实现将节点添加到基线的逻辑
    message.info('添加到基线功能待实现');
  }, []);

  /**
   * 查看嵌套计划
   */
  const handleViewNestedPlan = useCallback((nestedPlanId: string) => {
    // TODO: 实现导航到嵌套计划
    message.info(`查看嵌套计划: ${nestedPlanId}`);
  }, []);

  /**
   * 取消所有未保存的更改
   */
  const handleCancelChanges = useCallback(() => {
    if (!hasChanges) return;
    
    // ✅ 直接调用reset()重置到最后保存的状态
    // resetChanges 已经实现了清空历史并恢复到savedState
    resetChanges();
    
    message.info('已取消所有更改');
  }, [hasChanges, resetChanges]);

  /**
   * 导出数据
   */
  const handleExportData = useCallback((format: 'json' | 'csv' | 'excel') => {
    const filename = data.title || '时间规划';
    
    switch (format) {
      case 'json':
        downloadJSON(data);
        message.success('JSON 数据已导出');
        break;
      case 'csv':
        exportTimePlanToCSV(data, filename);
        message.success('CSV 数据已导出');
        break;
      case 'excel':
        exportTimePlanToExcel(data, filename);
        message.success('Excel 数据已导出');
        break;
    }
  }, [data]);

  /**
   * 导出选中的任务
   */
  const handleExportSelected = useCallback((format: 'excel' | 'csv') => {
    if (!selection.hasSelection) {
      message.warning('请先选择要导出的任务');
      return;
    }

    const selectedLines = data.lines.filter(line => selection.isSelected(line.id));
    const filename = `选中任务_${selectedLines.length}个`;

    switch (format) {
      case 'excel':
        exportSelectedLinesToExcel(selectedLines, filename);
        message.success(`已导出 ${selectedLines.length} 个任务（Excel）`);
        break;
      case 'csv':
        exportSelectedLinesToCSV(selectedLines, filename);
        message.success(`已导出 ${selectedLines.length} 个任务（CSV）`);
        break;
    }
  }, [data.lines, selection]);

  /**
   * 导入数据
   */
  const handleImportData = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      try {
        const text = await file.text();
        const importedData = JSON.parse(text) as TimePlan;
        
        // 验证数据结构
        if (!importedData.timelines || !importedData.lines) {
          message.error('数据格式不正确');
          return;
        }
        
        setData(importedData);
        message.success('数据导入成功');
      } catch (error) {
        message.error('数据解析失败');
        console.error('Import error:', error);
      }
    };
    
    input.click();
  }, [setData]);

  /**
   * ✅ 键盘Delete删除选中节点
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 只有在编辑模式且有选中节点时才响应Delete键
      if (!isEditMode || !selectedLineId) return;
      
      // 检查是否在输入框中（避免干扰表单输入）
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }
      
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        handleDeleteNode(selectedLineId);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditMode, selectedLineId, handleDeleteNode]);

  /**
   * ✅ V11新增：全局快捷键支持（Ctrl+S保存、Ctrl+Z撤销、Ctrl+Shift+Z重做）
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 检查是否在输入框中（避免干扰表单输入）
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Ctrl+S 保存
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (hasChanges) {
          handleSave();
        }
      }

      // Ctrl+Z 撤销
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') {
        e.preventDefault();
        if (canUndo) {
          undo();
        }
      }

      // Ctrl+Shift+Z 或 Ctrl+Y 重做
      if ((e.ctrlKey || e.metaKey) && ((e.shiftKey && e.key === 'z') || e.key === 'y')) {
        e.preventDefault();
        if (canRedo) {
          redo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasChanges, handleSave, canUndo, undo, canRedo, redo]);

  /**
   * 切换全屏
   */
  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        message.error(`无法进入全屏: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }, []);

  // ==================== 视图切换菜单 ====================

  const viewMenuItems: MenuProps['items'] = [
    {
      key: 'gantt',
      label: '甘特图',
      icon: <BarChartOutlined />,
    },
    {
      key: 'table',
      label: '表格',
      icon: <TableOutlined />,
    },
    {
      key: 'matrix',
      label: '矩阵',
      icon: <AppstoreOutlined />,
    },
    {
      key: 'iteration',
      label: '选代规划',
      icon: <BlockOutlined />,
    },
    {
      key: 'baseline',
      label: '版本对比',
      icon: <HistoryOutlined />,
    },
  ];

  // ==================== 渲染 ====================

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        maxHeight: '100%',  // ✅ 限制最大高度
        overflow: 'hidden',  // ✅ 防止外层滚动条
        backgroundColor: token.colorBgContainer,
      }}
    >
      {/* ✅ 顶部 Header：返回 + TimeP标题（可编辑） + 视图切换 */}
      {!hideToolbar && (
        <div
          style={{
            padding: `${token.paddingSM}px ${token.padding}px`,
            borderBottom: `1px solid ${token.colorBorder}`,
            backgroundColor: token.colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            gap: token.marginSM,
          }}
        >
          {/* 左侧：返回按钮（只显示图标） */}
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => window.history.back()}
            style={{ marginRight: token.marginXS }}
          />

          {/* 中间：TimePlan标题（可编辑，更大字号） */}
          {isEditingTitle ? (
            <Input
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onPressEnter={handleSaveTitle}
              onBlur={handleSaveTitle}
              autoFocus
              style={{ width: 400, fontWeight: 600, fontSize: 20 }}
            />
          ) : (
            <div
              onClick={() => setIsEditingTitle(true)}
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: token.colorText,
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: token.borderRadius,
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = token.colorBgTextHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {data.title}
              <EditOutlined style={{ marginLeft: 8, fontSize: 14, opacity: 0.6 }} />
            </div>
          )}

          <div style={{ flex: 1 }} />

          {/* ✅ 右侧：视图切换按钮组（参考截图3） */}
          <Space size={4}>
            <Button
              size="small"
              icon={<BarChartOutlined />}
              type={viewType === 'gantt' ? 'primary' : 'default'}
              onClick={() => handleViewTypeChange('gantt')}
              style={{
                color: viewType === 'gantt' ? '#FFFFFF' : undefined,
              }}
            >
              甘特图
            </Button>
            <Button
              size="small"
              icon={<TableOutlined />}
              type={viewType === 'table' ? 'primary' : 'default'}
              onClick={() => handleViewTypeChange('table')}
              style={{
                color: viewType === 'table' ? '#FFFFFF' : undefined,
              }}
            >
              表格
            </Button>
            <Button
              size="small"
              icon={<AppstoreOutlined />}
              type={viewType === 'matrix' ? 'primary' : 'default'}
              onClick={() => handleViewTypeChange('matrix')}
              style={{
                color: viewType === 'matrix' ? '#FFFFFF' : undefined,
              }}
            >
              矩阵
            </Button>
            <Button
              size="small"
              icon={<HistoryOutlined />}
              type={viewType === 'version' ? 'primary' : 'default'}
              onClick={() => handleViewTypeChange('version')}
              style={{
                color: viewType === 'version' ? '#FFFFFF' : undefined,
              }}
            >
              版本对比
            </Button>
            <Button
              size="small"
              icon={<BlockOutlined />}
              type={viewType === 'iteration' ? 'primary' : 'default'}
              onClick={() => handleViewTypeChange('iteration')}
              style={{
                color: viewType === 'iteration' ? '#FFFFFF' : undefined,
              }}
            >
              迭代规划
            </Button>
          </Space>
        </div>
      )}

      {/* ✅ 工具栏：左侧功能按钮 + 右侧缩放和时间刻度 */}
      {!hideToolbar && (
        <div
          style={{
            padding: `${token.paddingSM}px ${token.padding}px`,
            borderBottom: `1px solid ${token.colorBorder}`,
            backgroundColor: token.colorBgContainer,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {/* 左侧功能按钮 */}
            <Space size={4}>
              <Button
                size="small"
                icon={<EditOutlined />}
                type={isEditMode ? 'primary' : 'default'}
                onClick={() => handleIsEditModeChange(!isEditMode)}
                style={{
                  color: isEditMode ? '#FFFFFF' : undefined,
                }}
              >
                {isEditMode ? '编辑' : '查看'}
              </Button>

              <Button
                size="small"
                icon={<PlusOutlined />}
                onClick={handleAddTimeline}
              >
                Timeline
              </Button>

              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'add-bar',
                      label: '添加计划单元',
                      icon: <MinusOutlined />,
                      onClick: () => handleAddNode('lineplan'),
                      disabled: !isEditMode,
                    },
                    {
                      key: 'add-milestone',
                      label: '添加里程碑 (Milestone)',
                      icon: <FlagOutlined />,
                      onClick: () => handleAddNode('milestone'),
                      disabled: !isEditMode,
                    },
                    {
                      key: 'add-gateway',
                      label: '添加网关 (Gateway)',
                      icon: <BgColorsOutlined />,
                      onClick: () => handleAddNode('gateway'),
                      disabled: !isEditMode,
                    },
                  ],
                }}
                placement="bottomLeft"
                disabled={!isEditMode}
              >
                <Button
                  size="small"
                  icon={<NodeIndexOutlined />}
                  disabled={!isEditMode}
                >
                  节点 <DownOutlined style={{ fontSize: 10, marginLeft: 4 }} />
                </Button>
              </Dropdown>

              <Button
                size="small"
                icon={<ShareAltOutlined />}
                type={showCriticalPath ? 'primary' : 'default'}
                onClick={handleToggleCriticalPath}
                style={{
                  color: showCriticalPath ? '#FFFFFF' : undefined,
                }}
              >
                关键路径
              </Button>

              <div
                style={{
                  width: 1,
                  height: 20,
                  backgroundColor: token.colorBorder,
                  margin: `0 ${token.marginXS}px`,
                }}
              />

              <Tooltip title="撤销 (Ctrl+Z)">
                <Button size="small" icon={<UndoOutlined />} disabled={!canUndo} onClick={undo} />
              </Tooltip>

              <Tooltip title="重做 (Ctrl+Shift+Z)">
                <Button size="small" icon={<RedoOutlined />} disabled={!canRedo} onClick={redo} />
              </Tooltip>

              <Tooltip title="取消所有更改">
                <Button
                  size="small"
                  icon={<CloseOutlined />}
                  disabled={!hasChanges}
                  onClick={handleCancelChanges}
                  danger
                />
              </Tooltip>

              <Tooltip title="保存 (Ctrl+S)">
                <Button
                  size="small"
                  icon={<SaveOutlined />}
                  type="primary"
                  onClick={handleSave}
                  disabled={!hasChanges}
                  style={{
                    color: '#FFFFFF',
                  }}
                />
              </Tooltip>
            </Space>

            {/* ✅ 右侧：时间导航、缩放、导出/导入 */}
            <Space size={4}>
              <Tooltip title="定位到今天">
                <Button
                  size="small"
                  onClick={scrollToToday}
                >
                  今天
                </Button>
              </Tooltip>

              <div
                style={{
                  width: 1,
                  height: 20,
                  backgroundColor: token.colorBorder,
                  margin: `0 ${token.marginXS}px`,
                }}
              />

              <Tooltip title="放大">
                <Button
                  size="small"
                  icon={<ZoomInOutlined />}
                  onClick={handleZoomIn}
                />
              </Tooltip>

              <Tooltip title="缩小">
                <Button
                  size="small"
                  icon={<ZoomOutOutlined />}
                  onClick={handleZoomOut}
                />
              </Tooltip>

              {/* 时间刻度选择 */}
              <Segmented
                size="small"
                value={scale}
                onChange={(value) => handleScaleChange(value as TimeScale)}
                options={[
                  { label: '天', value: 'day' },
                  { label: '周', value: 'week' },
                  { label: '双周', value: 'biweekly' },
                  { label: '月', value: 'month' },
                  { label: '季度', value: 'quarter' },
                ]}
              />

              <div
                style={{
                  width: 1,
                  height: 20,
                  backgroundColor: token.colorBorder,
                  margin: `0 ${token.marginXS}px`,
                }}
              />

              {/* 导出下拉菜单 */}
              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'export-all',
                      label: '导出全部',
                      type: 'group',
                      children: [
                        {
                          key: 'export-json',
                          label: '导出为 JSON',
                          icon: <DownloadOutlined />,
                          onClick: () => handleExportData('json'),
                        },
                        {
                          key: 'export-csv',
                          label: '导出为 CSV',
                          icon: <DownloadOutlined />,
                          onClick: () => handleExportData('csv'),
                        },
                        {
                          key: 'export-excel',
                          label: '导出为 Excel',
                          icon: <DownloadOutlined />,
                          onClick: () => handleExportData('excel'),
                        },
                      ],
                    },
                    {
                      type: 'divider',
                    },
                    {
                      key: 'export-selected',
                      label: `导出选中 (${selection.selectedCount})`,
                      type: 'group',
                      children: [
                        {
                          key: 'export-selected-excel',
                          label: '导出为 Excel',
                          icon: <DownloadOutlined />,
                          disabled: !selection.hasSelection,
                          onClick: () => handleExportSelected('excel'),
                        },
                        {
                          key: 'export-selected-csv',
                          label: '导出为 CSV',
                          icon: <DownloadOutlined />,
                          disabled: !selection.hasSelection,
                          onClick: () => handleExportSelected('csv'),
                        },
                      ],
                    },
                  ],
                }}
                placement="bottomRight"
              >
                <Button
                  size="small"
                  icon={<DownloadOutlined />}
                  title="导出"
                >
                  {selection.hasSelection && `(${selection.selectedCount})`}
                </Button>
              </Dropdown>

              {/* 导入按钮 */}
              <Tooltip title="导入数据">
                <Button
                  size="small"
                  icon={<UploadOutlined />}
                  onClick={handleImportData}
                />
              </Tooltip>

              {/* 全屏按钮 */}
              <Tooltip title="全屏">
                <Button
                  size="small"
                  icon={<FullscreenOutlined />}
                  onClick={handleToggleFullscreen}
                />
              </Tooltip>
            </Space>
          </div>
        </div>
      )}

      {/* 主内容区域 - 统一滚动容器 */}
      <div
        ref={scrollContainerRef}
        style={{
          display: 'flex',
          flex: 1,
          overflow: 'auto',
          position: 'relative',
          width: '100%',  // ✅ 限制宽度
          maxWidth: '100%',  // ✅ 防止水平扩展
        }}
      >
        {/* 左侧边栏 - Timeline 列表 */}
        <div
          ref={sidebarRef}
          style={{
            width: SIDEBAR_WIDTH,
            flexShrink: 0,
            backgroundColor: token.colorBgLayout,
            borderRight: `1px solid ${token.colorBorder}`,
            position: 'sticky',
            left: 0,
            zIndex: 100,  // ✅ 提高到最高层级，确保不被连线覆盖
            alignSelf: 'flex-start', // ✅ 确保sidebar从顶部开始
            minHeight: '100%', // ✅ 确保sidebar至少与容器一样高，显示完整右边框
          }}
        >
          {/* 表头占位（与右侧时间轴表头等高） */}
          <div
            style={{
              height: 68, // 两层表头：32 + 36
              display: 'flex',
              alignItems: 'center',
              padding: `0 ${token.paddingSM}px`,
              borderBottom: `1px solid ${token.colorBorder}`,
              backgroundColor: token.colorBgContainer,
              position: 'sticky',
              top: 0,
              zIndex: 101,  // ✅ 比sidebar更高，确保表头在最顶层
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            Timeline 列表
          </div>

          {/* Timeline 列表 */}
          {data.timelines.map((timeline, index) => {
            const isCollapsed = collapsedTimelines.has(timeline.id);
            const lines = getLinesByTimelineId(timeline.id);
            
            // ✅ 获取Timeline背景颜色（使用timeline.color或默认颜色）
            const timelineColor = timeline.color || DEFAULT_TIMELINE_COLORS[index % DEFAULT_TIMELINE_COLORS.length];
            
            // ✅ 获取负责人和分类信息
            const owner = timeline.owner || timeline.description || '';
            const category = timeline.attributes?.category || 'ECU开发计划';

            return (
              <div 
                key={timeline.id}
                style={{
                  height: ROW_HEIGHT,  // ✅ 外层容器也固定高度，确保完全对齐
                  boxSizing: 'border-box',
                  margin: 0,
                  padding: 0,
                }}
              >
                <div
                  style={{
                    height: ROW_HEIGHT,  // ✅ 固定高度120px
                    display: 'flex',
                    alignItems: 'center',
                    padding: `0 ${token.paddingSM}px`,  // ✅ 关键：垂直padding为0
                    borderBottom: `1px solid ${token.colorBorderSecondary}`,
                    cursor: 'pointer',
                    backgroundColor: '#fff',  // ✅ 左侧列表保持白色背景
                    boxSizing: 'border-box',  // ✅ 确保border不影响高度
                    margin: 0,  // ✅ 确保没有额外margin
                    transition: 'background-color 0.2s',
                  }}
                  onClick={() => toggleTimelineCollapse(timeline.id)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${token.colorBgTextHover}`; // 悬停时浅灰色
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#fff'; // 恢复白色
                  }}
                >
                  {/* ✅ 序号图标（圆形，带数字） */}
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      backgroundColor: timelineColor,
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      fontWeight: 600,
                      marginRight: token.marginSM,
                      flexShrink: 0,
                      boxShadow: `0 2px 4px ${timelineColor}40`,
                    }}
                  >
                    {index + 1}
                  </div>

                  {/* ✅ 折叠图标（小型） */}
                  <div style={{ marginRight: token.marginXS, flexShrink: 0, color: token.colorTextSecondary }}>
                    {isCollapsed ? <RightOutlined style={{ fontSize: 10 }} /> : <DownOutlined style={{ fontSize: 10 }} />}
                  </div>

                  {/* Timeline 信息 */}
                  <div style={{ flex: 1, overflow: 'hidden', minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    {/* ✅ 标题 */}
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        color: token.colorText,
                        lineHeight: '20px',
                      }}
                    >
                      {timeline.title || timeline.name}
                    </div>
                    {/* ✅ 副标题（负责人 | 分类） */}
                    <div
                      style={{
                        fontSize: 12,
                        color: token.colorTextSecondary,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        lineHeight: '16px',
                        marginTop: 2,
                      }}
                    >
                      {owner} {owner && category && '|'} {category}
                    </div>
                  </div>

                  {/* Timeline 快捷菜单 */}
                  <TimelineQuickMenu
                    timelineId={timeline.id}
                    timelineName={timeline.title || timeline.name}
                    isEditMode={isEditMode}
                    onAddNode={handleAddNodeToTimeline}
                    onEditTimeline={handleEditTimeline}
                    onDeleteTimeline={handleDeleteTimeline}
                    onCopyTimeline={handleCopyTimeline}
                    onBackgroundColorChange={handleBackgroundColorChange}
                    onTimeShift={handleOpenTimeShift}
                  />
                </div>
              </div>
            );
          })}

          {/* 空状态 */}
          {data.timelines.length === 0 && (
            <div
              style={{
                padding: token.paddingLG,
                textAlign: 'center',
                color: token.colorTextSecondary,
                fontSize: 12,
              }}
            >
              暂无时间线
            </div>
          )}
        </div>

        {/* 右侧内容区域 - 时间轴和内容 */}
        <div
          style={{
            // flex: 1,  // ❌ 移除：flex会导致自动扩展，与固定宽度冲突
            flex: '0 0 auto',  // ✅ 修复：使用flex-shrink为0，固定宽度
            position: 'relative',
            backgroundColor: '#fff',  // ✅ 修复：与左侧背景色一致，统一为白色
            width: totalWidth,  // ✅ 固定宽度，防止右侧过多空白
            maxWidth: totalWidth,  // ✅ 限制最大宽度
            minWidth: totalWidth,  // ✅ 保持最小宽度
          }}
        >
          {/* ✅ 时间轴表头（使用独立的TimelineHeader组件） */}
          <TimelineHeader
            startDate={normalizedViewStartDate}
            endDate={normalizedViewEndDate}
            scale={scale}
            width={totalWidth}  // ✅ 传入总宽度，确保表头覆盖整个可滚动区域
          />

          {/* 网格背景（含节假日标记） */}
          <div
            style={{
              position: 'absolute',
              top: 68, // 两层表头高度：32 + 36
              left: 0,
              width: totalWidth,
              height: data.timelines.length * ROW_HEIGHT || 400,
              pointerEvents: 'none',
              zIndex: 0,
            }}
          >
            {/* 节假日/周末背景块（在天视图中） */}
            {scale === 'day' && dateHeaders.map((date, index) => {
              const columnWidth = getScaleUnit(scale);
              const isWeekendDay = date.getDay() === 0 || date.getDay() === 6;
              const isHolidayDay = isHoliday(date);

              if (!isWeekendDay && !isHolidayDay) return null;

              return (
                <div
                  key={`bg-${index}`}
                  style={{
                    position: 'absolute',
                    left: index * columnWidth,
                    top: 0,
                    bottom: 0,
                    width: columnWidth,
                    backgroundColor: isHolidayDay
                      ? 'rgba(255, 77, 79, 0.05)'  // 节假日 - 淡红色
                      : 'rgba(0, 0, 0, 0.02)',     // 周末 - 淡灰色
                  }}
                />
              );
            })}

            {/* ✅ 垂直网格线 - 月视图和季度视图特殊处理 */}
            {scale === 'month' || scale === 'quarter' ? (
              // 月视图和季度视图：根据月份/季度的实际累积宽度绘制网格线
              dateHeaders.map((date, index) => {
                // ✅ 计算累积宽度：累加前面所有月份的实际宽度
                let accumulatedWidth = 0;
                for (let i = 0; i < index; i++) {
                  const monthDate = dateHeaders[i];
                  const daysInMonth = getDaysInMonth(monthDate);
                  accumulatedWidth += daysInMonth * getPixelsPerDay(scale);
                }
                
                return (
                  <div
                    key={`line-${index}`}
                    style={{
                      position: 'absolute',
                      left: accumulatedWidth,  // ✅ 使用累积宽度而不是固定宽度
                      top: 0,
                      bottom: 0,
                      width: 1,
                      backgroundColor: token.colorBorderSecondary,
                    }}
                  />
                );
              })
            ) : (
              // 其他视图：保持原有逻辑
              dateHeaders.map((date, index) => {
                const columnWidth = getScaleUnit(scale);
                const isMonthStart = date.getDate() === 1;

                return (
                  <div
                    key={`line-${index}`}
                    style={{
                      position: 'absolute',
                      left: index * columnWidth,
                      top: 0,
                      bottom: 0,
                      width: isMonthStart ? 2 : 1,  // 月初线条加粗
                      backgroundColor: isMonthStart
                        ? token.colorBorder
                        : token.colorBorderSecondary,
                    }}
                  />
                );
              })
            )}

            {/* ✅ 水平分隔线已移除：使用Timeline行的borderBottom代替，避免重复渲染 */}
          </div>

          {/* Timeline 行内容 */}
          <div
            style={{
              position: 'relative',
              width: totalWidth,
              minWidth: '100%',
              paddingTop: 0,
            }}
            onClick={(e) => {
              // 点击空白画布或其他元素时，取消连线选中
              // 确保点击的是画布本身，而不是子元素
              if (e.target === e.currentTarget) {
                if (selectedRelationId) {
                  setSelectedRelationId(null);
                  console.log('[TimelinePanel] 🔗 取消连线选中（点击空白区域）');
                }
              }
            }}
          >
            {/* 依赖关系线 */}
            {data.relations && data.relations.length > 0 && (
              <RelationRenderer
                relations={data.relations}
                lines={data.lines}
                timelines={data.timelines}
                viewStartDate={normalizedViewStartDate}
                scale={scale}
                rowHeight={ROW_HEIGHT}
                selectedRelationId={selectedRelationId}
                isEditMode={isEditMode}
                criticalPathNodeIds={criticalPathNodeIds}
                onRelationClick={handleRelationClick}
                onRelationEdit={handleRelationEdit}
                onRelationDelete={handleRelationDelete}
                // ✅ 传递拖拽状态，使连线实时跟随
                draggingNodeId={draggingNodeId}
                dragSnappedDates={dragSnappedDates}
                resizingNodeId={resizingNodeId}
                resizeSnappedDates={resizeSnappedDates}
              />
            )}

            {/* ==================== 基线系统渲染 ==================== */}
            
            {/* 1. 基线范围标记（背景层，z-index: 10） */}
            {data.baselineRanges?.map((range) => (
              <BaselineRangeMarker
                key={range.id}
                range={range}
                viewStartDate={normalizedViewStartDate}
                scale={scale}
                height={data.timelines.length * ROW_HEIGHT + 52}
                leftOffset={SIDEBAR_WIDTH}
                isEditMode={isEditMode}
                onEdit={() => handleEditBaselineRange(range)}
                onDelete={() => handleDeleteBaselineRange(range.id)}
                onUpdate={handleSaveBaselineRange}
              />
            ))}

            {/* 2. 基线标记（前景层，z-index: 80） */}
            {data.baselines?.map((baseline) => (
              <BaselineMarker
                key={baseline.id}
                baseline={baseline}
                viewStartDate={normalizedViewStartDate}
                scale={scale}
                height={data.timelines.length * ROW_HEIGHT + 52}
                leftOffset={SIDEBAR_WIDTH}
                isEditMode={isEditMode}
                onEdit={() => handleEditBaseline(baseline)}
                onDelete={() => handleDeleteBaseline(baseline.id)}
              />
            ))}

            {/* 3. Today 线 */}
            <TodayLine
              viewStartDate={normalizedViewStartDate}
              viewEndDate={normalizedViewEndDate}
              scale={scale}
              height={data.timelines.length * ROW_HEIGHT}
            />

            {/* ✅ V10 磁吸提示 - 局部效果（仅在调整的line上显示） */}
            {magneticSnapInfo && isResizing && resizingNodeId && (() => {
              // 查找正在调整大小的line的timeline索引
              const resizingLine = data.lines.find(l => l.id === resizingNodeId);
              if (!resizingLine) return null;
              
              const timelineIndex = data.timelines.findIndex(t => t.id === resizingLine.timelineId);
              if (timelineIndex === -1) return null;
              
              const topOffset = timelineIndex * ROW_HEIGHT + HEADER_HEIGHT + ROW_HEIGHT / 2;
              
              return (
                <>
                  {/* 磁吸点指示器 */}
                  <div
                    style={{
                      position: 'absolute',
                      left: magneticSnapInfo.position - 8,
                      top: topOffset - 8,
                      width: 16,
                      height: 16,
                      backgroundColor: '#52c41a',  // ✅ 绿色表示对齐成功
                      borderRadius: '50%',
                      border: '2px solid #fff',
                      boxShadow: '0 2px 8px rgba(82, 196, 26, 0.6)',
                      zIndex: 100,
                      pointerEvents: 'none',
                      animation: 'magneticPulse 1s ease-in-out infinite',
                    }}
                  />
                  {/* 磁吸提示短线（局部） */}
                  <div
                    style={{
                      position: 'absolute',
                      left: magneticSnapInfo.position,
                      top: topOffset - 20,
                      width: 2,
                      height: 40,
                      backgroundColor: '#52c41a',
                      opacity: 0.5,
                      zIndex: 99,
                      pointerEvents: 'none',
                    }}
                  />
                </>
              );
            })()}

            {/* 4. 基线范围拖拽创建器（覆盖层，z-index: 50） */}
            <BaselineRangeDragCreator
              isActive={isRangeDragMode}
              viewStartDate={normalizedViewStartDate}
              scale={scale}
              height={data.timelines.length * ROW_HEIGHT + 52}
              leftOffset={SIDEBAR_WIDTH}
              scrollContainerRef={scrollContainerRef}
              onComplete={handleRangeDragComplete}
              onCancel={handleRangeDragCancel}
            />

            {/* ✅ 全量日志：输出所有任务位置计算信息 */}
            {(() => {
              console.log('[TimelinePanel] 📋 任务位置计算全量日志:');
              console.log(`  - 视图起始日期: ${normalizedViewStartDate.toISOString().split('T')[0]}`);
              console.log(`  - 时间刻度: ${scale}`);
              console.log(`  - Timeline数量: ${data.timelines.length}`);
              console.log(`  - 总任务数: ${data.lines.length}`);
              console.log('  - 各Timeline任务分布:');
              data.timelines.forEach((t, i) => {
                const tLines = data.lines.filter(l => l.timelineId === t.id);
                console.log(`    ${i + 1}. ${t.label || t.name}: ${tLines.length}个任务`);
              });
              console.log('  - 任务位置计算详情:');
              data.lines.forEach((line, idx) => {
                const startPos = getPositionFromDate(parseDateAsLocal(line.startDate), normalizedViewStartDate, scale);
                const endPos = line.endDate ? getPositionFromDate(parseDateAsLocal(line.endDate), normalizedViewStartDate, scale) : startPos;
                const width = endPos - startPos;
                const startDateStr = typeof line.startDate === 'string' ? line.startDate : String(line.startDate);
                console.log(`    ${(idx + 1).toString().padStart(3)}. ${(line.label || '未命名').padEnd(20)} | 开始: ${startDateStr.split('T')[0]} | 位置: ${Math.round(startPos).toString().padStart(5)}px | 宽度: ${Math.round(width).toString().padStart(5)}px | 高亮: ${highlightedLineIds.has(line.id) ? '✓' : ' '}`);
              });
              return null;
            })()}

            {data.timelines.map((timeline, index) => {
              const lines = getLinesByTimelineId(timeline.id);
              
              // ✅ 获取timeline颜色（与左侧一致）
              const timelineColor = timeline.color || DEFAULT_TIMELINE_COLORS[index % DEFAULT_TIMELINE_COLORS.length];

              return (
                <div
                  key={timeline.id}
                  style={{
                    height: ROW_HEIGHT,  // ✅ 外层容器也固定高度，与左侧结构完全一致
                    boxSizing: 'border-box',
                    margin: 0,
                    padding: 0,
                  }}
                >
                  <div
                    style={{
                      position: 'relative',
                      height: ROW_HEIGHT,  // ✅ 固定高度120px，与左侧一致
                      width: totalWidth,  // ✅ 固定宽度，确保背景色覆盖整个时间轴
                      borderBottom: `1px solid ${token.colorBorderSecondary}`,
                      backgroundColor: `${timelineColor}08`,  // ✅ 右侧甘特图区域背景色（8%透明度）
                      boxSizing: 'border-box',  // ✅ 确保border包含在高度内，与左侧一致
                      margin: 0,  // ✅ 确保没有额外margin
                      padding: 0,  // ✅ 确保没有额外padding（内容使用绝对定位）
                      transition: 'background-color 0.2s',  // ✅ 平滑过渡
                    }}
                  >
                  {/* 渲染该 Timeline 的所有 Lines */}
                  {lines.map((line, lineIndex) => {
                    const isDraggingThis = draggingNodeId === line.id;
                    const isResizingThis = resizingNodeId === line.id;

                    // ✅ 修复：使用snappedDates而不是visualDates，确保按天对齐
                    // ✅ 关键修复：使用 parseDateAsLocal 避免时区导致的日期偏移
                    const displayStartDate = isDraggingThis && dragSnappedDates.start
                      ? dragSnappedDates.start
                      : isResizingThis && resizeSnappedDates.start
                        ? resizeSnappedDates.start
                        : parseDateAsLocal(line.startDate);

                    const displayEndDate = isDraggingThis && dragSnappedDates.end
                      ? dragSnappedDates.end
                      : isResizingThis && resizeSnappedDates.end
                        ? resizeSnappedDates.end
                        : line.endDate ? parseDateAsLocal(line.endDate) : parseDateAsLocal(line.startDate);

                    // ✅ 修复：统一使用Precise计算，确保对齐
                    const startPos = getPositionFromDate(
                      displayStartDate,
                      normalizedViewStartDate,
                      scale
                    );

                    const width = getBarWidthPrecise(
                      displayStartDate,
                      displayEndDate,
                      scale
                    );
                    
                    const isSelected = line.id === selectedLineId;
                    const isInteracting = isDraggingThis || isResizingThis;

                    return (
                      <NodeContextMenu
                        key={line.id}
                        node={line}
                        isEditMode={isEditMode}
                        baselines={data.baselines || []}
                        onEditNode={handleEditNode}
                        onDeleteNode={handleDeleteNode}
                        onCopyNode={handleCopyNode}
                        onConvertNodeType={handleConvertNodeType}
                        onAddRelation={handleStartConnection}
                        onAddToBaseline={handleAddNodeToBaseline}
                        onViewNestedPlan={handleViewNestedPlan}
                      >
                        <LineRenderer
                          line={line}
                          startPos={startPos}
                          width={width}
                          isSelected={isSelected}
                          isInteracting={isInteracting}
                          isEditMode={isEditMode}
                          isHovered={line.id === hoveredLineId}
                          connectionMode={connectionMode}
                          isCriticalPath={criticalPathNodeIds.has(line.id)}
                          isHighlighted={highlightedLineIds.has(line.id)}
            onMouseDown={(e) => {
              if (isEditMode) {
                handleDragStart(e, line);
              }
            }}
            onClick={(e) => {
              handleLineClick(line, e);
            }}
                          onResizeStart={(e, edge) => handleResizeStart(e, line, edge)}
                          onStartConnection={handleStartConnection}
                          onCompleteConnection={handleCompleteConnection}
                        />
                      </NodeContextMenu>
                    );
                  })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 空状态 */}
          {data.timelines.length === 0 && (
            <div
              style={{
                position: 'absolute',
                top: 68, // 两层表头：32 + 36
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: token.colorTextSecondary,
              }}
            >
              <Space orientation="vertical" align="center" size="large">
                <CalendarOutlined style={{ fontSize: 64, color: token.colorTextTertiary }} />
                <div>
                  <div style={{ fontSize: 16, fontWeight: 500, color: token.colorText, marginBottom: 8 }}>
                    暂无时间线数据
                  </div>
                  <div style={{ color: token.colorTextSecondary, textAlign: 'center' }}>
                    您可以添加 Timeline 来开始规划项目，或导入示例数据快速体验
                  </div>
                </div>
                <Space>
                  <Button type="primary" icon={<PlusOutlined />}>
                    添加 Timeline
                  </Button>
                  {onImportSampleData && (
                    <Button icon={<PlusOutlined />} onClick={onImportSampleData}>
                      导入示例数据
                    </Button>
                  )}
                </Space>
              </Space>
            </div>
          )}
        </div>

        {/* 拖拽/调整大小时的浮动日期提示 */}
        {(isDragActive || isResizing) && (
          <div
            style={{
              position: 'fixed',
              left: (isDragActive ? dragMousePosition.x : resizeMousePosition.x) + 15,
              top: (isDragActive ? dragMousePosition.y : resizeMousePosition.y) - 35,
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              color: '#fff',
              padding: '4px 8px',
              borderRadius: 4,
              fontSize: 12,
              zIndex: 9999,
              pointerEvents: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              whiteSpace: 'nowrap',
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 2 }}>
              {isDragActive ? '移动中' : '调整中'}
            </div>
            <div style={{ fontSize: 11, opacity: 0.9 }}>
              {(() => {
                // 安全地格式化日期，避免无效日期导致崩溃
                const formatSafe = (date: Date | undefined | null): string => {
                  if (!date) return '---';
                  try {
                    // 检查日期是否有效
                    if (isNaN(date.getTime())) return '---';
                    return format(date, 'yyyy-MM-dd');
                  } catch (e) {
                    console.error('[TimelinePanel] 日期格式化失败:', date, e);
                    return '---';
                  }
                };

                const dates = isDragActive ? dragSnappedDates : resizeSnappedDates;
                const startStr = formatSafe(dates.start);
                const endStr = formatSafe(dates.end);
                
                return `${startStr} ~ ${endStr}`;
              })()}
            </div>
          </div>
        )}
      </div>

      {/* Timeline 编辑对话框 */}
      <TimelineEditDialog
        open={isTimelineEditDialogOpen}
        timeline={editingTimeline}
        onSave={handleSaveTimeline}
        onClose={() => {
          setIsTimelineEditDialogOpen(false);
          setEditingTimeline(null);
        }}
      />

      {/* 基线编辑对话框 */}
      <BaselineEditDialog
        baseline={editingBaseline}
        isOpen={isBaselineDialogOpen}
        onClose={() => {
          setIsBaselineDialogOpen(false);
          setEditingBaseline(null);
        }}
        onSave={handleSaveBaseline}
        isNewBaseline={isNewBaseline}
      />

      {/* 基线范围编辑对话框 */}
      <BaselineRangeEditDialog
        range={editingBaselineRange}
        isOpen={isBaselineRangeDialogOpen}
        onClose={() => {
          setIsBaselineRangeDialogOpen(false);
          setEditingBaselineRange(null);
        }}
        onSave={handleSaveBaselineRange}
        isNewRange={isNewBaselineRange}
      />

      {/* 节点编辑对话框 */}
      <NodeEditDialog
        open={nodeEditDialogOpen}
        node={editingNode}
        onSave={handleSaveNode}
        onClose={() => {
          setNodeEditDialogOpen(false);
          setEditingNode(null);
        }}
      />

      {/* 连线编辑对话框 */}
      <RelationEditDialog
        open={isRelationEditDialogOpen}
        relation={editingRelation}
        onSave={handleRelationSave}
        onClose={() => {
          setIsRelationEditDialogOpen(false);
          setEditingRelation(null);
        }}
      />

      {/* 时间平移对话框 */}
      <TimelineTimeShiftDialog
        open={timeShiftDialogOpen}
        onClose={() => {
          setTimeShiftDialogOpen(false);
          setTimeShiftTimelineId(null);
        }}
        timelines={data.timelines}
        lines={data.lines}
        onConfirm={handleConfirmTimeShift}
      />

      {/* Task 3.7: 批量跳转导航控制面板 */}
      {targetLineIds.length > 1 && (
        <div
          style={{
            position: 'fixed',
            right: 24,
            bottom: 24,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            borderRadius: 8,
            padding: '12px 16px',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
            zIndex: 1000,
          }}
        >
          {/* 上一个任务按钮 */}
          <Tooltip title="上一个任务 (←)">
            <Button
              type="text"
              size="small"
              icon={<ArrowLeftOutlined style={{ color: '#fff' }} />}
              onClick={navigateToPreviousTask}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#fff',
              }}
            />
          </Tooltip>
          
          {/* 当前任务指示器 */}
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              minWidth: 60,
              textAlign: 'center',
            }}
          >
            {currentTaskIndex + 1} / {targetLineIds.length}
          </div>
          
          {/* 下一个任务按钮 */}
          <Tooltip title="下一个任务 (→)">
            <Button
              type="text"
              size="small"
              icon={<RightOutlined style={{ color: '#fff' }} />}
              onClick={navigateToNextTask}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#fff',
              }}
            />
          </Tooltip>
          
          {/* 关闭按钮 */}
          <Tooltip title="关闭导航">
            <Button
              type="text"
              size="small"
              icon={<CloseOutlined style={{ color: '#fff' }} />}
              onClick={clearNavigation}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#fff',
                marginLeft: 8,
              }}
            />
          </Tooltip>
        </div>
      )}

      {/* 连线模式指示器 */}
      <ConnectionMode
        isActive={!!connectionMode.lineId}
        sourceNode={
          connectionMode.lineId
            ? {
                id: connectionMode.lineId,
                label: data.lines.find(l => l.id === connectionMode.lineId)?.title || '',
              }
            : undefined
        }
        connectionType="FS"
        onCancel={handleCancelConnection}
      />
    </div>
  );
};

export default TimelinePanel;
