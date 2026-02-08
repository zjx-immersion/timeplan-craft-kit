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

  // ✅ 预定义颜色列表
  const colorOptions = [
    { key: '#52c41a', label: '绿色', color: '#52c41a' },
    { key: '#1890ff', label: '蓝色', color: '#1890ff' },
    { key: '#9254de', label: '紫色', color: '#9254de' },
    { key: '#13c2c2', label: '青色', color: '#13c2c2' },
    { key: '#fa8c16', label: '橙色', color: '#fa8c16' },
    { key: '#eb2f96', label: '粉色', color: '#eb2f96' },
    { key: '#fadb14', label: '黄色', color: '#fadb14' },
    { key: '#f5222d', label: '红色', color: '#f5222d' },
  ];

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

    // ✅ 更换背景颜色子菜单
    if (onBackgroundColorChange) {
      menuItems.push({
        key: 'change-color',
        label: '更换背景颜色',
        icon: <BgColorsOutlined />,
        children: colorOptions.map(({ key, label, color }) => ({
          key,
          label: (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  backgroundColor: color,
                  border: '1px solid rgba(0,0,0,0.1)',
                }}
              />
              <span>{label}</span>
            </div>
          ),
          onClick: () => onBackgroundColorChange(timelineId, color),
        })),
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
