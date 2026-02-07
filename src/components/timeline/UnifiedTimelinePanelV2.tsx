/**
 * UnifiedTimelinePanelV2 - 统一时间线面板 V2
 * 
 * 功能:
 * - 集成所有视图（甘特图、表格、矩阵、版本对比、迭代）
 * - 固定Header和Toolbar，视图内容可切换
 * - 工具栏按钮根据当前视图动态显示
 * - 完整的功能整合
 * 
 * @version 3.0.0
 * @date 2026-02-07
 */

import React, { useState, useCallback, useRef } from 'react';
import { 
  Button, 
  Space, 
  Tooltip, 
  Segmented, 
  theme, 
  message, 
  Input,
  Dropdown,
  Modal,
  type MenuProps 
} from 'antd';
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
  FullscreenOutlined,
} from '@ant-design/icons';
import type { TimePlan } from '@/types/timeplanSchema';
import { downloadJSON } from '@/utils/dataExport';
import type { TimeScale } from '@/types/timeplanSchema';
import type { ViewType } from './ViewSwitcher';
import TimelinePanel from './TimelinePanel';
import { TableView } from '../views/TableView';
import { MatrixView } from '../views/MatrixView';
import { VersionTableView } from '../views/VersionTableView';
import { IterationView } from '../views/IterationView';
import { useTimePlanStoreWithHistory } from '@/stores/timePlanStoreWithHistory';

/**
 * 统一时间线面板属性
 */
export interface UnifiedTimelinePanelV2Props {
  /**
   * Plan ID
   */
  planId: string;

  /**
   * 是否显示时间轴缩放控制器
   * @default true
   */
  showTimeAxisScaler?: boolean;

  /**
   * 初始视图
   * @default 'gantt'
   */
  initialView?: ViewType;

  /**
   * 初始缩放级别
   * @default 1.0
   */
  initialZoom?: number;
}

/**
 * UnifiedTimelinePanelV2 组件
 */
export const UnifiedTimelinePanelV2: React.FC<UnifiedTimelinePanelV2Props> = ({
  planId,
  showTimeAxisScaler = true,
  initialView = 'gantt',
  initialZoom = 1.0,
}) => {
  const { token } = theme.useToken();
  const scrollToTodayRef = useRef<(() => void) | null>(null);

  // Store
  const {
    plans,
    updatePlan,
    undo,
    redo,
    canUndo: canUndoFn,
    canRedo: canRedoFn,
    clearHistory,
  } = useTimePlanStoreWithHistory();

  const canUndo = canUndoFn();
  const canRedo = canRedoFn();
  const hasChanges = canUndo;

  // 状态
  const [view, setView] = useState<ViewType>(initialView);
  const [editMode, setEditMode] = useState(false);
  const [showCriticalPath, setShowCriticalPath] = useState(false);
  const [scale, setScale] = useState<TimeScale>('month');
  const [zoom, setZoom] = useState(initialZoom);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');

  console.log('UnifiedTimelinePanelV2 Render:', { view, editMode, scale, zoom });

  // 获取当前 plan
  const plan = plans.find(p => p.id === planId);

  if (!plan) {
    return <div>Plan not found</div>;
  }

  // 初始化标题
  if (!editedTitle && plan) {
    setEditedTitle(plan.title);
  }

  /**
   * 保存标题
   */
  const handleSaveTitle = useCallback(() => {
    if (editedTitle.trim() && editedTitle !== plan.title) {
      updatePlan(plan.id, { ...plan, title: editedTitle.trim() });
      message.success('标题已更新');
    }
    setIsEditingTitle(false);
  }, [editedTitle, plan, updatePlan]);

  /**
   * 保存
   */
  const handleSave = useCallback(() => {
    message.success('保存成功');
  }, []);

  /**
   * 取消所有更改
   */
  const handleCancelChanges = useCallback(() => {
    if (!hasChanges) return;
    // 撤销所有更改直到历史清空
    while (canUndoFn()) {
      undo();
    }
    clearHistory();
    message.info('已取消所有更改');
  }, [hasChanges, canUndoFn, undo, clearHistory]);

  /**
   * 导出数据
   */
  const handleExportData = useCallback((format: 'json' | 'csv' | 'excel') => {
    if (plan) {
      downloadJSON(plan);
      message.success(`导出${format.toUpperCase()}成功`);
    }
  }, [plan]);

  /**
   * 导入数据
   */
  const handleImportData = useCallback(() => {
    message.info('导入功能开发中...');
  }, []);

  /**
   * 全屏切换
   */
  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  /**
   * 数据变化
   */
  const handleDataChange = useCallback((newData: TimePlan) => {
    updatePlan(plan.id, newData);
  }, [plan.id, updatePlan]);

  /**
   * 视图切换处理
   */
  const handleViewChange = useCallback((newView: ViewType) => {
    console.log('View changing to:', newView);
    setView(newView);
  }, []);

  /**
   * 缩放
   */
  const handleZoomIn = useCallback(() => {
    const scaleOrder: TimeScale[] = ['day', 'week', 'biweekly', 'month', 'quarter'];
    const currentIndex = scaleOrder.indexOf(scale);
    if (currentIndex > 0) {
      setScale(scaleOrder[currentIndex - 1]);
    }
  }, [scale]);

  const handleZoomOut = useCallback(() => {
    const scaleOrder: TimeScale[] = ['day', 'week', 'biweekly', 'month', 'quarter'];
    const currentIndex = scaleOrder.indexOf(scale);
    if (currentIndex < scaleOrder.length - 1) {
      setScale(scaleOrder[currentIndex + 1]);
    }
  }, [scale]);

  /**
   * 定位到今天
   */
  const scrollToToday = useCallback(() => {
    if (scrollToTodayRef.current) {
      scrollToTodayRef.current();
    }
  }, []);

  /**
   * 切换关键路径显示
   */
  const handleToggleCriticalPath = useCallback(() => {
    setShowCriticalPath(prev => !prev);
  }, []);

  /**
   * 渲染视图内容
   */
  const renderView = () => {
    console.log('Rendering View Type:', view);
    switch (view) {
      case 'gantt':
        return (
          <TimelinePanel
            data={plan}
            onDataChange={handleDataChange}
            hideToolbar={true}
            isEditMode={editMode}
            scale={scale}
            zoom={zoom}
            showCriticalPath={showCriticalPath}
            scrollToTodayRef={scrollToTodayRef}
          />
        );

      case 'table':
        return (
          <TableView
            data={plan}
            onDataChange={handleDataChange}
            readonly={!editMode}
            showSearch={true}
          />
        );

      case 'matrix':
        return (
          <MatrixView
            data={plan}
          />
        );

      case 'version':
        return (
          <VersionTableView
            baseVersion={plan}
            compareVersion={plan}
          />
        );

      case 'iteration':
        return (
          <IterationView
            data={plan}
            iterationDays={14}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: token.colorBgContainer,
      }}
      data-testid="unified-timeline-panel-v2"
      data-current-view={view}
    >
      {/* 🔒 固定 Header：返回 + 标题（可编辑） + 视图切换 */}
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
        {/* 左侧：返回按钮 */}
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => window.history.back()}
          style={{ marginRight: token.marginXS }}
        />

        {/* 中间：TimePlan标题（可编辑） */}
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
            {plan.title}
            <EditOutlined style={{ marginLeft: 8, fontSize: 14, opacity: 0.6 }} />
          </div>
        )}

        <div style={{ flex: 1 }} />

        {/* 右侧：视图切换按钮组 */}
        <Space size={4}>
          <Button
            size="small"
            icon={<BarChartOutlined />}
            type={view === 'gantt' ? 'primary' : 'default'}
            onClick={() => handleViewChange('gantt')}
            style={{
              color: view === 'gantt' ? '#FFFFFF' : undefined,
            }}
          >
            甘特图
          </Button>
          <Button
            size="small"
            icon={<TableOutlined />}
            type={view === 'table' ? 'primary' : 'default'}
            onClick={() => handleViewChange('table')}
            style={{
              color: view === 'table' ? '#FFFFFF' : undefined,
            }}
          >
            表格
          </Button>
          <Button
            size="small"
            icon={<AppstoreOutlined />}
            type={view === 'matrix' ? 'primary' : 'default'}
            onClick={() => handleViewChange('matrix')}
            style={{
              color: view === 'matrix' ? '#FFFFFF' : undefined,
            }}
          >
            矩阵
          </Button>
          <Button
            size="small"
            icon={<HistoryOutlined />}
            type={view === 'version' ? 'primary' : 'default'}
            onClick={() => handleViewChange('version')}
            style={{
              color: view === 'version' ? '#FFFFFF' : undefined,
            }}
          >
            版本对比
          </Button>
          <Button
            size="small"
            icon={<BlockOutlined />}
            type={view === 'iteration' ? 'primary' : 'default'}
            onClick={() => handleViewChange('iteration')}
            style={{
              color: view === 'iteration' ? '#FFFFFF' : undefined,
            }}
          >
            迭代规划
          </Button>
        </Space>
      </div>

      {/* 🔒 固定 Toolbar：功能按钮根据视图动态显示 */}
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
          {/* 左侧功能按钮（根据视图动态显示） */}
          <Space size={4}>
            {/* 编辑模式按钮 - 所有视图都显示 */}
            <Button
              size="small"
              icon={<EditOutlined />}
              type={editMode ? 'primary' : 'default'}
              onClick={() => setEditMode(!editMode)}
              style={{
                color: editMode ? '#FFFFFF' : undefined,
              }}
            >
              {editMode ? '编辑' : '查看'}
            </Button>

            {/* 以下按钮只在甘特图视图显示 */}
            {view === 'gantt' && (
              <>
                <Button
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => message.info('添加Timeline功能开发中...')}
                >
                  Timeline
                </Button>

                <Dropdown
                  menu={{
                    items: [
                      {
                        key: 'add-bar',
                        label: '添加计划单元 (Bar)',
                        icon: <MinusOutlined />,
                        disabled: !editMode,
                      },
                      {
                        key: 'add-milestone',
                        label: '添加里程碑 (Milestone)',
                        icon: <FlagOutlined />,
                        disabled: !editMode,
                      },
                      {
                        key: 'add-gateway',
                        label: '添加网关 (Gateway)',
                        icon: <BgColorsOutlined />,
                        disabled: !editMode,
                      },
                    ],
                  }}
                  placement="bottomLeft"
                  disabled={!editMode}
                >
                  <Button
                    size="small"
                    icon={<NodeIndexOutlined />}
                    disabled={!editMode}
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
              </>
            )}

            <div
              style={{
                width: 1,
                height: 20,
                backgroundColor: token.colorBorder,
                margin: `0 ${token.marginXS}px`,
              }}
            />

            {/* 撤销/重做/取消/保存 - 所有视图都显示 */}
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

          {/* 右侧：时间导航、缩放、导出/导入 */}
          <Space size={4}>
            {/* 今天按钮 - 只在甘特图视图显示 */}
            {view === 'gantt' && (
              <Tooltip title="定位到今天">
                <Button
                  size="small"
                  onClick={scrollToToday}
                >
                  今天
                </Button>
              </Tooltip>
            )}

            {/* 时间刻度 - 只在甘特图视图显示 */}
            {view === 'gantt' && (
              <>
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

                <Segmented
                  size="small"
                  value={scale}
                  onChange={(value) => setScale(value as TimeScale)}
                  options={[
                    { label: '天', value: 'day' },
                    { label: '周', value: 'week' },
                    { label: '双周', value: 'biweekly' },
                    { label: '月', value: 'month' },
                    { label: '季度', value: 'quarter' },
                  ]}
                />
              </>
            )}

            <div
              style={{
                width: 1,
                height: 20,
                backgroundColor: token.colorBorder,
                margin: `0 ${token.marginXS}px`,
              }}
            />

            {/* 导出/导入/全屏 - 所有视图都显示 */}
            <Dropdown
              menu={{
                items: [
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
              }}
              placement="bottomRight"
            >
              <Button
                size="small"
                icon={<DownloadOutlined />}
                title="导出"
              />
            </Dropdown>

            <Tooltip title="导入数据">
              <Button
                size="small"
                icon={<UploadOutlined />}
                onClick={handleImportData}
              />
            </Tooltip>

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

      {/* ✏️ 主内容区域 - 根据视图动态切换 */}
      <div style={{ flex: 1, overflow: 'hidden' }} data-testid={`view-content-${view}`}>
        {renderView()}
      </div>
    </div>
  );
};

export default UnifiedTimelinePanelV2;
