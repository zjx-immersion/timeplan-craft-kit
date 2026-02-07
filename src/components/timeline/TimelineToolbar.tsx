/**
 * TimelineToolbar - 时间线工具栏组件
 * 
 * 功能:
 * - 编辑模式切换
 * - 时间刻度选择
 * - 关键路径显示切换
 * - 撤销/重做
 * - 保存操作
 * - 添加 Timeline/Line
 * 
 * @version 1.0.0
 * @date 2026-02-03
 */

import React from 'react';
import { Button, Space, Tooltip, Select } from 'antd';
import {
  Edit3,
  Eye,
  Plus as PlusIcon,
  GitBranch,
  Undo2,
  RotateCcw,
  Save,
  Download,
  Minus,
} from 'lucide-react';
import { TimeScale } from '@/types/timeplanSchema';

/**
 * 工具栏属性
 */
export interface TimelineToolbarProps {
  /**
   * 是否编辑模式
   */
  isEditMode: boolean;

  /**
   * 编辑模式切换回调
   */
  onToggleEditMode: () => void;

  /**
   * 是否显示关键路径
   */
  showCriticalPath: boolean;

  /**
   * 关键路径显示切换回调
   */
  onToggleCriticalPath: () => void;

  /**
   * 当前时间刻度
   */
  scale: TimeScale;

  /**
   * 时间刻度变化回调
   */
  onScaleChange: (scale: TimeScale) => void;

  /**
   * 撤销回调
   */
  onUndo?: () => void;

  /**
   * 重做回调
   */
  onRedo?: () => void;

  /**
   * 是否可撤销
   */
  canUndo?: boolean;

  /**
   * 是否可重做
   */
  canRedo?: boolean;

  /**
   * 保存回调
   */
  onSave?: () => void;

  /**
   * 导出回调
   */
  onExport?: () => void;

  /**
   * 添加 Timeline 回调
   */
  onAddTimeline?: () => void;

  /**
   * 添加 Line 回调
   */
  onAddLine?: () => void;

  /**
   * 自定义类名
   */
  className?: string;

  /**
   * 自定义样式
   */
  style?: React.CSSProperties;
}

/**
 * 时间刻度选项
 */
const SCALE_OPTIONS = [
  { label: '日', value: 'day' as TimeScale },
  { label: '周', value: 'week' as TimeScale },
  { label: '双周', value: 'biweekly' as TimeScale },
  { label: '月', value: 'month' as TimeScale },
  { label: '季度', value: 'quarter' as TimeScale },
];

/**
 * TimelineToolbar 组件
 */
export const TimelineToolbar: React.FC<TimelineToolbarProps> = ({
  isEditMode,
  onToggleEditMode,
  showCriticalPath,
  onToggleCriticalPath,
  scale,
  onScaleChange,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onSave,
  onExport,
  onAddTimeline,
  onAddLine,
  className,
  style,
}) => {
  return (
    <div
      className={className}
      style={{
        padding: '8px 12px',            // 更紧凑（参考源项目 px-2 py-1）
        borderBottom: '1px solid #E2E8F0',  // Slate-200
        background: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '4px',                     // gap-1
        ...style,
      }}
      data-testid="timeline-toolbar"
    >
      {/* 左侧：编辑操作 */}
      <Space size={4}>                  {/* gap-1 */}
        {/* 编辑模式切换 */}
        <Tooltip title={isEditMode ? '切换到查看模式' : '切换到编辑模式'}>
          <Button
            type={isEditMode ? 'primary' : 'default'}
            size="small"
            icon={isEditMode ? <Edit3 size={14} /> : <Eye size={14} />}
            onClick={onToggleEditMode}
            data-testid="toggle-edit-mode"
            style={{
              height: '28px',           // h-7
              fontSize: '12px',         // text-xs
              gap: '4px',               // gap-1
              color: isEditMode ? '#FFFFFF' : undefined, // ✅ primary按钮白色文字
            }}
          >
            {isEditMode ? '编辑' : '查看'}
          </Button>
        </Tooltip>

        {/* 添加操作（编辑模式下） */}
        {isEditMode && (
          <Space.Compact>
            {onAddTimeline && (
              <Tooltip title="添加 Timeline">
                <Button
                  size="small"
                  icon={<PlusIcon size={14} />}
                  onClick={onAddTimeline}
                  data-testid="add-timeline"
                  style={{
                    height: '28px',
                    fontSize: '12px',
                    gap: '4px',
                  }}
                >
                  Timeline
                </Button>
              </Tooltip>
            )}
            {onAddLine && (
              <Tooltip title="添加节点">
                <Button
                  size="small"
                  icon={<Minus size={14} />}
                  onClick={onAddLine}
                  data-testid="add-line"
                  style={{
                    height: '28px',
                    fontSize: '12px',
                    gap: '4px',
                  }}
                >
                  节点
                </Button>
              </Tooltip>
            )}
          </Space.Compact>
        )}

        {/* 关键路径 */}
        <Tooltip title={showCriticalPath ? '隐藏关键路径' : '显示关键路径'}>
          <Button
            type={showCriticalPath ? 'primary' : 'default'}
            size="small"
            danger={showCriticalPath}
            icon={<GitBranch size={14} />}
            onClick={onToggleCriticalPath}
            data-testid="toggle-critical-path"
            style={{
              height: '28px',
              fontSize: '12px',
              gap: '4px',
              color: showCriticalPath ? '#FFFFFF' : undefined, // ✅ primary按钮白色文字
            }}
          >
            关键路径
          </Button>
        </Tooltip>
      </Space>

      {/* 右侧：时间刻度、历史操作、保存 */}
      <Space size={4}>
        {/* 时间刻度选择 */}
        <Space>
          <span style={{ color: '#666' }}>刻度:</span>
          <Select
            value={scale}
            onChange={onScaleChange}
            options={SCALE_OPTIONS}
            style={{ width: 100 }}
            data-testid="scale-select"
          />
        </Space>

        {/* 历史操作 */}
        {(onUndo || onRedo) && (
          <Space.Compact>
            {onUndo && (
              <Tooltip title="撤销 (Ctrl+Z)">
                <Button
                  size="small"
                  icon={<Undo2 size={14} />}
                  onClick={onUndo}
                  disabled={!canUndo}
                  data-testid="undo-button"
                  style={{
                    height: '28px',
                  }}
                />
              </Tooltip>
            )}
            {onRedo && (
              <Tooltip title="重做 (Ctrl+Shift+Z)">
                <Button
                  size="small"
                  icon={<RotateCcw size={14} />}
                  onClick={onRedo}
                  disabled={!canRedo}
                  data-testid="redo-button"
                  style={{
                    height: '28px',
                  }}
                />
              </Tooltip>
            )}
          </Space.Compact>
        )}

        {/* 保存 */}
        {onSave && (
          <Tooltip title="保存 (Ctrl+S)">
            <Button
              type="primary"
              size="small"
              icon={<Save size={14} />}
              onClick={onSave}
              data-testid="save-button"
              style={{
                height: '28px',
                fontSize: '12px',
                gap: '4px',
                color: '#FFFFFF',  // ✅ 强制白色文字
              }}
            >
              保存
            </Button>
          </Tooltip>
        )}

        {/* 导出 */}
        {onExport && (
          <Tooltip title="导出 JSON">
            <Button
              size="small"
              icon={<Download size={14} />}
              onClick={onExport}
              data-testid="export-button"
              style={{
                height: '28px',
                fontSize: '12px',
                gap: '4px',
              }}
            >
              导出
            </Button>
          </Tooltip>
        )}
      </Space>
    </div>
  );
};

export default TimelineToolbar;
