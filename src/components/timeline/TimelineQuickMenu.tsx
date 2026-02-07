/**
 * TimelineQuickMenu - Timeline 快捷菜单
 * 
 * 显示Timeline名称后的"..."菜单按钮,提供快速操作入口
 * 
 * @version 1.0.0
 * @date 2026-02-07
 */

import React from 'react';
import { Dropdown, type MenuProps } from 'antd';
import {
  MoreOutlined,
  PlusOutlined,
  MinusOutlined,
  FlagOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  BgColorsOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';

/**
 * TimelineQuickMenu 属性
 */
export interface TimelineQuickMenuProps {
  /**
   * Timeline ID
   */
  timelineId: string;
  
  /**
   * Timeline 名称
   */
  timelineName: string;
  
  /**
   * 是否为编辑模式
   */
  isEditMode: boolean;
  
  /**
   * 添加节点回调
   */
  onAddNode?: (timelineId: string, type: 'bar' | 'milestone' | 'gateway') => void;
  
  /**
   * 编辑Timeline回调
   */
  onEditTimeline?: (timelineId: string) => void;
  
  /**
   * 删除Timeline回调
   */
  onDeleteTimeline?: (timelineId: string) => void;
  
  /**
   * 复制Timeline回调
   */
  onCopyTimeline?: (timelineId: string) => void;
  
  /**
   * 设置背景色回调
   */
  onBackgroundColorChange?: (timelineId: string, color: string) => void;

  /**
   * 整体时间调整回调
   */
  onTimeShift?: (timelineId: string) => void;
}

/**
 * TimelineQuickMenu 组件
 */
export const TimelineQuickMenu: React.FC<TimelineQuickMenuProps> = ({
  timelineId,
  timelineName,
  isEditMode,
  onAddNode,
  onEditTimeline,
  onDeleteTimeline,
  onCopyTimeline,
  onBackgroundColorChange,
  onTimeShift,
}) => {
  // 构建菜单项
  const menuItems: MenuProps['items'] = [];

  // 编辑模式菜单
  if (isEditMode) {
    // 添加节点子菜单
    if (onAddNode) {
      menuItems.push({
        key: 'add-node',
        label: '添加节点',
        icon: <PlusOutlined />,
        children: [
          {
            key: 'add-bar',
            label: '计划单元 (Bar)',
            icon: <MinusOutlined />,
            onClick: () => onAddNode(timelineId, 'bar'),
          },
          {
            key: 'add-milestone',
            label: '里程碑 (Milestone)',
            icon: <FlagOutlined />,
            onClick: () => onAddNode(timelineId, 'milestone'),
          },
          {
            key: 'add-gateway',
            label: '网关 (Gateway)',
            icon: <BgColorsOutlined />,
            onClick: () => onAddNode(timelineId, 'gateway'),
          },
        ],
      });
    }

    // 编辑Timeline
    if (onEditTimeline) {
      menuItems.push({
        key: 'edit',
        label: '编辑 Timeline',
        icon: <EditOutlined />,
        onClick: () => onEditTimeline(timelineId),
      });
    }

    // 复制Timeline
    if (onCopyTimeline) {
      menuItems.push({
        key: 'copy',
        label: '复制 Timeline',
        icon: <CopyOutlined />,
        onClick: () => onCopyTimeline(timelineId),
      });
    }

    // 整体时间调整
    if (onTimeShift) {
      menuItems.push({
        key: 'time-shift',
        label: '整体时间调整',
        icon: <ClockCircleOutlined />,
        onClick: () => onTimeShift(timelineId),
      });
    }

    // 分隔线
    if (onDeleteTimeline && menuItems.length > 0) {
      menuItems.push({
        type: 'divider',
      });
    }

    // 删除Timeline
    if (onDeleteTimeline) {
      menuItems.push({
        key: 'delete',
        label: '删除 Timeline',
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () => onDeleteTimeline(timelineId),
      });
    }
  }

  // 如果没有任何菜单项，返回null
  if (menuItems.length === 0) {
    return null;
  }

  return (
    <Dropdown
      menu={{ items: menuItems }}
      trigger={['click']}
      placement="bottomRight"
    >
      <div
        style={{
          width: 24,
          height: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          borderRadius: 4,
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.04)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <MoreOutlined style={{ fontSize: 16 }} />
      </div>
    </Dropdown>
  );
};

export default TimelineQuickMenu;
