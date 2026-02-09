/**
 * BaselineMarker - 基线标记组件
 * 
 * 功能:
 * - 在时间轴上渲染基线（垂直线）
 * - 显示标签徽章（标签 + 日期）
 * - 编辑模式下显示编辑/删除按钮
 * - z-index: 80 （在时间轴和节点之间）
 * 
 * @version 1.0.0
 * @date 2026-02-07
 * @migrated-from timeline-craft-kit/src/components/timeline/BaselineMarker.tsx
 */

import React, { useState, useMemo } from 'react';
import { Button, Tag, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { Baseline } from '@/types/timeplanSchema';
import type { TimeScale } from '@/utils/dateUtils';
import { getPositionFromDate, parseDateAsLocal } from '@/utils/dateUtils';

/**
 * BaselineMarker 组件属性
 */
export interface BaselineMarkerProps {
  /**
   * 基线数据
   */
  baseline: Baseline;

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
   * 是否编辑模式
   * @default false
   */
  isEditMode?: boolean;

  /**
   * 编辑回调
   */
  onEdit?: () => void;

  /**
   * 删除回调
   */
  onDelete?: () => void;
}

/**
 * 默认颜色映射
 */
const defaultColors: Record<string, string> = {
  release: '#1677ff',    // 发版 - 蓝色
  freeze: '#ff4d4f',     // 封版 - 红色
  milestone: '#52c41a',  // 里程碑 - 绿色
  default: '#8c8c8c',    // 默认 - 灰色
};

/**
 * BaselineMarker 组件
 */
export const BaselineMarker: React.FC<BaselineMarkerProps> = ({
  baseline,
  viewStartDate,
  scale,
  height,
  leftOffset = 200,
  isEditMode = false,
  onEdit,
  onDelete,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // 计算基线位置
  const position = useMemo(() => {
    try {
      // ✅ 使用统一的日期解析逻辑，避免时区导致的日期偏移
      const dateObj = parseDateAsLocal(baseline.date);
      const pos = getPositionFromDate(dateObj, viewStartDate, scale);
      return leftOffset + pos;
    } catch (error) {
      console.error('[BaselineMarker] Error calculating position:', error);
      return 0;
    }
  }, [baseline.date, viewStartDate, scale, leftOffset]);

  // 获取基线颜色
  const baselineColor = useMemo(() => {
    if (baseline.color) {
      return baseline.color;
    }
    // 尝试从 attributes 中获取类型
    const type = baseline.attributes?.type as string | undefined;
    return defaultColors[type || 'default'] || defaultColors.default;
  }, [baseline.color, baseline.attributes]);

  // 格式化日期
  const formattedDate = useMemo(() => {
    try {
      // ✅ 使用统一的日期解析逻辑
      const dateObj = parseDateAsLocal(baseline.date);
      return format(dateObj, 'yyyy-MM-dd', { locale: zhCN });
    } catch (error) {
      console.error('[BaselineMarker] Error formatting date:', error);
      return '';
    }
  }, [baseline.date]);

  return (
    <div
      style={{
        position: 'absolute',
        left: position,
        top: 0,
        height,
        zIndex: 80,
        pointerEvents: isEditMode ? 'auto' : 'none',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 基线垂直线 */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 1,
          height,
          backgroundColor: baselineColor,
          opacity: 0.8,
        }}
      />

      {/* ✅ 标签徽章 - 改为橙色横向布局（参考截图1） */}
      <div
        style={{
          position: 'absolute',
          left: 4,
          top: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 0,
          pointerEvents: 'auto',
        }}
      >
        {/* ✅ 橙色标签卡片 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 12px',
            backgroundColor: 'rgba(250, 140, 22, 0.92)',  // ✅ V11修复：添加透明度（#fa8c16 -> rgba with 0.92 alpha）
            color: '#fff',
            fontSize: 13,
            fontWeight: 600,
            borderRadius: 4,
            whiteSpace: 'nowrap',
            cursor: isEditMode ? 'pointer' : 'default',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          }}
          onClick={isEditMode ? onEdit : undefined}
        >
          {/* 标签名称 + 日期 */}
          <span>{baseline.label || '基线'}</span>
          <span style={{ opacity: 0.9 }}>{formattedDate}</span>
        </div>

        {/* ✅ 编辑模式：hover显示编辑/删除图标按钮（紧贴标签右侧，参考截图1） */}
        {isEditMode && isHovered && (
          <div
            style={{
              display: 'flex',
              gap: 4,  // ✅ 紧凑间距
              marginLeft: 4,  // ✅ 与标签间距
            }}
          >
            {/* ✅ 编辑图标 - 白色背景（参考截图1） */}
            <Tooltip title="编辑">
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.();
                }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 4,
                  backgroundColor: '#fff',  // ✅ 白色背景
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                  border: '1px solid #d9d9d9',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f5f5f5';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#fff';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <EditOutlined style={{ fontSize: 16, color: '#faad14' }} />  {/* ✅ 橙色图标 */}
              </div>
            </Tooltip>
            {/* ✅ 删除图标 - 白色背景（参考截图1） */}
            <Tooltip title="删除">
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.();
                }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 4,
                  backgroundColor: '#fff',  // ✅ 白色背景
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                  border: '1px solid #d9d9d9',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#fff1f0';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#fff';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <DeleteOutlined style={{ fontSize: 16, color: '#ff4d4f' }} />  {/* ✅ 红色图标 */}
              </div>
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  );
};

export default BaselineMarker;
