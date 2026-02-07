/**
 * 节点右键菜单
 * 
 * 提供编辑、删除、复制等快捷操作
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
  CopyOutlined,
  InfoCircleOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import { Line } from '@/types/timeplanSchema';

export interface NodeContextMenuProps {
  node: Line;
  children: React.ReactElement;
  onEdit: (node: Line) => void;
  onDelete: (node: Line) => void;
  onCopy: (node: Line) => void;
  onViewDetails: (node: Line) => void;
  onAddDependency?: (node: Line) => void;
}

/**
 * 节点右键菜单组件
 */
export const NodeContextMenu: React.FC<NodeContextMenuProps> = ({
  node,
  children,
  onEdit,
  onDelete,
  onCopy,
  onViewDetails,
  onAddDependency,
}) => {
  const menuItems: MenuProps['items'] = [
    {
      key: 'edit',
      label: '编辑',
      icon: <EditOutlined />,
      onClick: () => onEdit(node),
    },
    {
      key: 'copy',
      label: '复制',
      icon: <CopyOutlined />,
      onClick: () => onCopy(node),
    },
    {
      type: 'divider',
    },
    {
      key: 'view-details',
      label: '查看详情',
      icon: <InfoCircleOutlined />,
      onClick: () => onViewDetails(node),
    },
    ...(onAddDependency
      ? [
          {
            key: 'add-dependency',
            label: '添加依赖',
            icon: <LinkOutlined />,
            onClick: () => onAddDependency(node),
          },
        ]
      : []),
    {
      type: 'divider',
    },
    {
      key: 'delete',
      label: '删除',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => onDelete(node),
    },
  ];

  return (
    <Dropdown
      menu={{ items: menuItems }}
      trigger={['contextMenu']}
    >
      {children}
    </Dropdown>
  );
};
