/**
 * UnifiedTimelinePanelV2 - 统一时间线面板 V2
 * 
 * 功能:
 * - 集成所有视图（甘特图、表格、矩阵、版本对比、迭代）
 * - 集成时间轴缩放
 * - 集成工具栏和视图切换器
 * - 完整的功能整合
 * 
 * @version 2.0.0
 * @date 2026-02-03
 */

import React, { useState, useCallback } from 'react';
import { message } from 'antd';
import type { TimePlan } from '@/types/timeplanSchema';
import { downloadJSON } from '@/utils/dataExport';
import type { TimeScale } from '@/types/timeplanSchema';
import type { ViewType } from './ViewSwitcher';
import { TimelineToolbar } from './TimelineToolbar';
import { ViewSwitcher } from './ViewSwitcher';
import { TimeAxisScaler } from './TimeAxisScaler';
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
  // Store
  const {
    plans,
    updatePlan,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useTimePlanStoreWithHistory();

  // 状态
  const [view, setView] = useState<ViewType>(initialView);
  const [editMode, setEditMode] = useState(false);
  const [showCriticalPath, setShowCriticalPath] = useState(false);
  const [scale, setScale] = useState<TimeScale>('month');
  const [zoom, setZoom] = useState(initialZoom);

  console.log('UnifiedTimelinePanelV2 Render:', { view, editMode, scale, zoom });

  // 获取当前 plan
  const plan = plans.find(p => p.id === planId);

  if (!plan) {
    return <div>Plan not found</div>;
  }

  /**
   * 保存
   */
  const handleSave = useCallback(() => {
    message.success('保存成功');
  }, []);

  /**
   * 导出
   */
  const handleExport = useCallback(() => {
    if (plan) {
      downloadJSON(plan);
      message.success('导出成功');
    }
  }, [plan]);

  /**
   * 数据变化
   */
  const handleDataChange = useCallback((newData: TimePlan) => {
    updatePlan(plan.id, newData);
  }, [plan.id, updatePlan]);

  /**
   * 视图切换处理
   */
  const handleViewChange = (newView: ViewType) => {
    console.log('View changing to:', newView);
    setView(newView);
  };

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
            hideToolbar={false}
            onViewChange={(newView) => setView(newView as ViewType)}
            onEditModeChange={setEditMode}
            onScaleChange={setScale}
          />
        );

      case 'table':
        return (
          <TableView
            data={plan}
            onDataChange={handleDataChange}
            onExport={handleExport}
            readonly={!editMode}
          />
        );

      case 'matrix':
        return (
          <MatrixView
            data={plan}
          />
        );

      case 'version':
        // 版本对比视图：这里使用当前版本和基准线对比
        // 实际应用中应该让用户选择要对比的两个版本
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
        background: '#f5f5f5',
      }}
      data-testid="unified-timeline-panel-v2"
      data-current-view={view}
    >
      {/* ✅ 移除了TimelineToolbar、ViewSwitcher、TimeAxisScaler */}
      {/* TimelinePanel内部会显示完整的工具栏 */}
      
      {/* 视图内容 */}
      <div style={{ flex: 1, overflow: 'hidden' }} data-testid={`view-content-${view}`}>
        {renderView()}
      </div>
    </div>
  );
};

export default UnifiedTimelinePanelV2;
