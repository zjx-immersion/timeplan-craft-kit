/**
 * TimeAxisScaler - 时间轴缩放控制器组件
 * 
 * 功能:
 * - 缩放滑块控制
 * - 快捷缩放按钮
 * - 实时显示缩放级别
 * - 重置功能
 * 
 * @version 1.0.0
 * @date 2026-02-03
 */

import React from 'react';
import { Slider, Button, Space, Tooltip, InputNumber } from 'antd';
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  ReloadOutlined,
  MinusOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  getZoomRange,
  getZoomStep,
  formatZoom,
  ZOOM_PRESETS,
} from '@/utils/timeAxisScaler';

/**
 * 时间轴缩放控制器属性
 */
export interface TimeAxisScalerProps {
  /**
   * 当前缩放级别
   */
  zoom: number;
  
  /**
   * 缩放变化回调
   */
  onZoomChange: (zoom: number) => void;
  
  /**
   * 是否显示预设按钮
   * @default true
   */
  showPresets?: boolean;
  
  /**
   * 是否显示输入框
   * @default false
   */
  showInput?: boolean;
  
  /**
   * 是否显示重置按钮
   * @default true
   */
  showReset?: boolean;
  
  /**
   * 是否紧凑模式
   * @default false
   */
  compact?: boolean;
  
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
 * TimeAxisScaler 组件
 */
export const TimeAxisScaler: React.FC<TimeAxisScalerProps> = ({
  zoom,
  onZoomChange,
  showPresets = true,
  showInput = false,
  showReset = true,
  compact = false,
  className,
  style,
}) => {
  const [min, max] = getZoomRange();
  const step = getZoomStep();

  // Helper to fix floating point numbers
  const fixFloat = (num: number) => Math.round(num * 100) / 100;

  /**
   * 缩小
   */
  const handleZoomOut = () => {
    const newZoom = Math.max(min, zoom - step);
    onZoomChange(fixFloat(newZoom));
  };

  /**
   * 放大
   */
  const handleZoomIn = () => {
    const newZoom = Math.min(max, zoom + step);
    onZoomChange(fixFloat(newZoom));
  };

  /**
   * 重置
   */
  const handleReset = () => {
    onZoomChange(1.0);
  };

  /**
   * 紧凑模式布局
   */
  if (compact) {
    return (
      <div
        className={className}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          ...style,
        }}
        data-testid="time-axis-scaler"
      >
        <Tooltip title="缩小 (Ctrl + -)">
          <Button
            size="small"
            icon={<MinusOutlined />}
            onClick={handleZoomOut}
            disabled={fixFloat(zoom) <= min}
            data-testid="zoom-out-button"
          />
        </Tooltip>

        <Slider
          min={min}
          max={max}
          step={step}
          value={zoom}
          onChange={(val) => onZoomChange(fixFloat(val))}
          style={{ width: 100, margin: 0 }}
          tooltip={{ formatter: formatZoom }}
          data-testid="zoom-slider"
        />

        <Tooltip title="放大 (Ctrl + +)">
          <Button
            size="small"
            icon={<PlusOutlined />}
            onClick={handleZoomIn}
            disabled={fixFloat(zoom) >= max}
            data-testid="zoom-in-button"
          />
        </Tooltip>

        <span style={{ fontSize: 12, color: '#666', minWidth: 40 }}>
          {formatZoom(zoom)}
        </span>
      </div>
    );
  }

  /**
   * 标准模式布局
   */
  return (
    <div
      className={className}
      style={{
        padding: '12px 16px',
        borderBottom: '1px solid #f0f0f0',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        ...style,
      }}
      data-testid="time-axis-scaler"
    >
      {/* 左侧：滑块控制 */}
      <Space size="middle" style={{ flex: 1, maxWidth: 600 }}>
        <Tooltip title="缩小 (Ctrl + -)">
          <Button
            icon={<ZoomOutOutlined />}
            onClick={handleZoomOut}
            disabled={fixFloat(zoom) <= min}
            data-testid="zoom-out-button"
          >
            缩小
          </Button>
        </Tooltip>

        <Slider
          min={min}
          max={max}
          step={step}
          value={zoom}
          onChange={(val) => onZoomChange(fixFloat(val))}
          style={{ flex: 1, minWidth: 200 }}
          tooltip={{ formatter: formatZoom }}
          data-testid="zoom-slider"
        />

        <Tooltip title="放大 (Ctrl + +)">
          <Button
            icon={<ZoomInOutlined />}
            onClick={handleZoomIn}
            disabled={fixFloat(zoom) >= max}
            data-testid="zoom-in-button"
          >
            放大
          </Button>
        </Tooltip>

        <span style={{ minWidth: 60, textAlign: 'center', fontWeight: 500 }}>
          {formatZoom(zoom)}
        </span>

        {showInput && (
          <InputNumber
            min={min * 100}
            max={max * 100}
            step={step * 100}
            value={fixFloat(zoom) * 100}
            onChange={(value) => value && onZoomChange(fixFloat(value / 100))}
            formatter={(value) => `${value}%`}
            parser={(value) => Number(value?.replace('%', '') || 100)}
            style={{ width: 80 }}
            data-testid="zoom-input"
          />
        )}
      </Space>

      {/* 右侧：预设和重置 */}
      <Space size="small">
        {showPresets && (
          <Space.Compact>
            {ZOOM_PRESETS.map((preset) => (
              <Button
                key={preset.value}
                size="small"
                type={fixFloat(zoom) === preset.value ? 'primary' : 'default'}
                onClick={() => onZoomChange(preset.value)}
                data-testid={`zoom-preset-${preset.value}`}
              >
                {preset.label}
              </Button>
            ))}
          </Space.Compact>
        )}

        {showReset && (
          <Tooltip title="重置为 100%">
            <Button
              icon={<ReloadOutlined />}
              onClick={handleReset}
              disabled={fixFloat(zoom) === 1.0}
              data-testid="zoom-reset-button"
            >
              重置
            </Button>
          </Tooltip>
        )}
      </Space>
    </div>
  );
};

export default TimeAxisScaler;
