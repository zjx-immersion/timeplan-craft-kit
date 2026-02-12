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

import React, { useState, useCallback, useRef, useEffect } from 'react';
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
  SettingOutlined,
} from '@ant-design/icons';
import type { TimePlan } from '@/types/timeplanSchema';
import { downloadJSON } from '@/utils/dataExport';
import type { TimeScale } from '@/types/timeplanSchema';
import type { ViewType } from './ViewSwitcher';
import TimelinePanel from './TimelinePanel';
import { EnhancedTableView } from '../views/table'; // ✅ 使用增强的表格视图
import { MatrixView } from '../views/MatrixView'; // ✅ V1 - Timeline × 月份 矩阵
import { MatrixViewV2 } from '../views/MatrixViewV2'; // ✅ V2 - Product × Team 矩阵
import MatrixViewV3 from '../views/MatrixViewV3'; // ✅ V3 - Timeline × TimeNode 架构
import { VersionTableView } from '../views/VersionTableView';
import { VersionPlanView } from '../views/VersionPlanView'; // ✅ 版本计划视图
import IterationView from '../iteration/IterationView'; // 原时间迭代视图
import { ModuleIterationView } from '../views/ModuleIterationView'; // ✅ 模块迭代视图
import { useTimePlanStoreWithHistory } from '@/stores/timePlanStoreWithHistory';
import type { Timeline } from '@/types/timeplanSchema';
import { ImageExportDialog } from '../dialogs/ImageExportDialog';
import ImportDialog from '../views/table/import/ImportDialog';
import ExportDialog from '../views/table/export/ExportDialog';
import ColumnSettingsDialog from '../views/table/column/ColumnSettingsDialog';
import type { ColumnConfig } from '../views/table/column';
import { getCurrentColumns, saveColumnWidths } from '../views/table/column';

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
  const [imageExportDialogOpen, setImageExportDialogOpen] = useState(false);
  const [importDialogVisible, setImportDialogVisible] = useState(false);
  const [exportDialogVisible, setExportDialogVisible] = useState(false);
  const [columnSettingsVisible, setColumnSettingsVisible] = useState(false);
  const [columnConfig, setColumnConfig] = useState<ColumnConfig[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  
  // 加载列配置
  useEffect(() => {
    const config = getCurrentColumns();
    setColumnConfig(config);
  }, []);
  const timelineContainerRef = useRef<HTMLDivElement>(null);

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
   * 添加Timeline
   */
  const handleAddTimeline = useCallback(() => {
    if (!plan) return;

    const newTimeline: Timeline = {
      id: `timeline-${Date.now()}`,
      name: '新 Timeline',
      title: '新 Timeline',  // ✅ 同时设置title字段，确保数据结构一致
      description: '未指定',
      color: '#1677ff',
      lineIds: [],
      owner: '',
    };

    const updatedPlan = {
      ...plan,
      timelines: [...(plan.timelines || []), newTimeline],
    };

    updatePlan(plan.id, updatedPlan);
    message.success('Timeline 已添加');
  }, [plan, updatePlan]);

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
    if (format === 'excel') {
      // 使用新的Excel导出对话框（仅表格视图）
      if (view === 'table') {
        setExportDialogVisible(true);
      } else {
        // 其他视图使用简单导出
        message.info('Excel导出功能仅在表格视图可用');
      }
    } else if (plan) {
      downloadJSON(plan);
      message.success(`导出${format.toUpperCase()}成功`);
    }
  }, [plan, view]);
  
  /**
   * 导入数据处理
   */
  const handleImportLines = useCallback((newLines: any[]) => {
    if (!plan) return;
    
    try {
      const updatedData = {
        ...plan,
        lines: [...(plan.lines || []), ...newLines],
      };
      
      updatePlan(updatedData);
      setImportDialogVisible(false);
      message.success(`成功导入 ${newLines.length} 条任务`);
    } catch (error) {
      console.error('[UnifiedTimelinePanelV2] 导入失败:', error);
      message.error('导入失败');
    }
  }, [plan, updatePlan]);
  
  /**
   * 列配置变更
   */
  const handleColumnsChange = useCallback((newColumns: ColumnConfig[]) => {
    setColumnConfig(newColumns);
    
    // 保存列宽
    const widths: Record<string, number> = {};
    newColumns.forEach(col => {
      if (col.width) {
        widths[col.key] = col.width;
      }
    });
    saveColumnWidths(widths);
    
    message.success('列配置已更新');
  }, []);

  /**
   * 导入数据
   */
  const handleImportData = useCallback(() => {
    // 仅在表格视图可用
    if (view === 'table') {
      setImportDialogVisible(true);
    } else {
      message.info('导入功能仅在表格视图可用');
    }
  }, [view]);

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
    switch (view) {
      case 'gantt':
        return (
          <div
            ref={timelineContainerRef}
            data-timeline-container="true"
            style={{ width: '100%', height: '100%' }}
          >
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
          </div>
        );

      case 'table':
        return (
          <EnhancedTableView
            data={plan}
            onDataChange={handleDataChange}
            readonly={!editMode}
            showSearch={true}
            columnConfig={columnConfig}
            onSelectedRowsChange={setSelectedRowKeys}
          />
        );

      case 'matrix-v1':
        // V1版本：Timeline × 月份 矩阵
        return <MatrixView data={plan} />;
        
      case 'matrix-v2':
        // V2版本：Product × Team 矩阵
        return <MatrixViewV2 data={plan} />;
        
      case 'matrix':
        // V3版本（默认）：Timeline × TimeNode(里程碑/门禁) 架构
        return <MatrixViewV3 data={plan} onViewChange={setView} />;

      case 'version':
        return (
          <VersionTableView
            baseVersion={plan}
            compareVersion={plan}
          />
        );

      case 'versionPlan':
        return (
          <VersionPlanView
            data={plan}
            onDataChange={handleDataChange}
          />
        );

      case 'iteration':
        return (
          <IterationView
            data={plan}
            onDataChange={handleDataChange}
          />
        );

      case 'moduleIteration':
        return (
          <ModuleIterationView
            data={plan}
            onLineClick={(line) => {
              message.info(`点击了: ${line.label}`);
            }}
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
        overflow: 'hidden',  // ✅ 去掉最外层滚动条，只在甘特图内滚动
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
          <Dropdown
            menu={{
              items: [
                {
                  key: 'matrix',
                  label: '矩阵 V3 (Timeline × 里程碑)',
                  icon: <AppstoreOutlined />,
                  onClick: () => handleViewChange('matrix'),
                },
                {
                  key: 'matrix-v2',
                  label: '矩阵 V2 (Product × Team)',
                  icon: <AppstoreOutlined />,
                  onClick: () => handleViewChange('matrix-v2'),
                },
                {
                  key: 'matrix-v1',
                  label: '矩阵 V1 (Timeline × 月份)',
                  icon: <AppstoreOutlined />,
                  onClick: () => handleViewChange('matrix-v1'),
                },
              ],
            }}
            placement="bottomRight"
          >
            <Button
              size="small"
              icon={<AppstoreOutlined />}
              type={view.startsWith('matrix') ? 'primary' : 'default'}
              style={{
                color: view.startsWith('matrix') ? '#FFFFFF' : undefined,
              }}
            >
              矩阵 {view === 'matrix' ? 'V3' : view === 'matrix-v2' ? 'V2' : view === 'matrix-v1' ? 'V1' : ''}
              <DownOutlined style={{ fontSize: 10, marginLeft: 4 }} />
            </Button>
          </Dropdown>
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
            icon={<CalendarOutlined />}
            type={view === 'versionPlan' ? 'primary' : 'default'}
            onClick={() => handleViewChange('versionPlan')}
            style={{
              color: view === 'versionPlan' ? '#FFFFFF' : undefined,
            }}
          >
            版本计划
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
            时间迭代
          </Button>
          <Button
            size="small"
            icon={<NodeIndexOutlined />}
            type={view === 'moduleIteration' ? 'primary' : 'default'}
            onClick={() => handleViewChange('moduleIteration')}
            style={{
              color: view === 'moduleIteration' ? '#FFFFFF' : undefined,
            }}
          >
            模块规划
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
              title={editMode ? '点击切换到查看模式' : '点击切换到编辑模式'}
            >
              {editMode ? '查看模式' : '编辑模式'}
            </Button>

            {/* 以下按钮只在甘特图视图显示 */}
            {view === 'gantt' && (
              <>
                <Button
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={handleAddTimeline}
                  disabled={!editMode}
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
                    key: 'export-image',
                    label: '导出为图片',
                    icon: <DownloadOutlined />,
                    onClick: () => setImageExportDialogOpen(true),
                  },
                  {
                    type: 'divider',
                  },
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
            
            {/* 列设置 - 仅表格视图显示 */}
            {view === 'table' && (
              <Tooltip title="列设置">
                <Button
                  size="small"
                  icon={<SettingOutlined />}
                  onClick={() => setColumnSettingsVisible(true)}
                />
              </Tooltip>
            )}

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
      <div 
        style={{ 
          flex: 1, 
          // 甘特图需要overflow: hidden（有自己的滚动机制）
          // 其他视图需要overflow: auto（允许内容滚动）
          overflow: view === 'gantt' ? 'hidden' : 'auto' 
        }} 
        data-testid={`view-content-${view}`}
      >
        {renderView()}
      </div>

      {/* 图片导出对话框 */}
      <ImageExportDialog
        open={imageExportDialogOpen}
        onClose={() => setImageExportDialogOpen(false)}
        targetElement={timelineContainerRef.current}
        defaultFilename={plan ? `${plan.title}-export` : 'timeplan-export'}
      />
      
      {/* Excel导入对话框 */}
      {plan && (
        <ImportDialog
          visible={importDialogVisible}
          onClose={() => setImportDialogVisible(false)}
          onImport={handleImportLines}
          data={plan}
        />
      )}
      
      {/* Excel导出对话框 */}
      {plan && (
        <ExportDialog
          visible={exportDialogVisible}
          onClose={() => setExportDialogVisible(false)}
          lines={plan.lines || []}
          timelines={plan.timelines || []}
          selectedRowKeys={selectedRowKeys}
          filteredData={undefined}
        />
      )}
      
      {/* 列设置对话框 */}
      <ColumnSettingsDialog
        visible={columnSettingsVisible}
        onClose={() => setColumnSettingsVisible(false)}
        columns={columnConfig}
        onColumnsChange={handleColumnsChange}
      />
    </div>
  );
};

export default UnifiedTimelinePanelV2;
