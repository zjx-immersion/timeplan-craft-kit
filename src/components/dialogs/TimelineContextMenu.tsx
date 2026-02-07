/**
 * TimelineContextMenu - Timeline 右键菜单
 * 
 * @version 1.0.0
 * @date 2026-02-03
 */

import React from 'react';
import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import type { Timeline } from '@/types/timeplanSchema';

export interface TimelineContextMenuProps {
  timeline: Timeline;
  children: React.ReactElement;
  onEdit: (timeline: Timeline) => void;
  onDelete: (timeline: Timeline) => void;
  onAddLine: (timeline: Timeline) => void;
  onTimeShift?: (timeline: Timeline) => void;
}

export const TimelineContextMenu: React.FC<TimelineContextMenuProps> = ({
  timeline,
  children,
  onEdit,
  onDelete,
  onAddLine,
  onTimeShift,
}) => {
  const items: MenuProps['items'] = [
    {
      key: 'edit',
      label: '编辑 Timeline',
      icon: <EditOutlined />,
      onClick: () => onEdit(timeline),
    },
    {
      key: 'addLine',
      label: '添加节点',
      icon: <PlusOutlined />,
      onClick: () => onAddLine(timeline),
    },
    ...(onTimeShift ? [{
      key: 'timeShift',
      label: '时间平移',
      icon: <ClockCircleOutlined />,
      onClick: () => onTimeShift(timeline),
    }] : []),
    { type: 'divider' as const },
    {
      key: 'delete',
      label: '删除 Timeline',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => onDelete(timeline),
    },
  ];

  return (
    <Dropdown menu={{ items }} trigger={['contextMenu']}>
      {children}
    </Dropdown>
  );
};
