/**
 * RelationContextMenu - 依赖关系连线右键菜单
 * 
 * 📋 功能:
 * - 编辑连线属性（类型、延迟、备注）
 * - 删除连线
 * - 只在编辑模式下显示
 * 
 * @version 1.0.0
 * @date 2026-02-10
 */

import React from 'react';
import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

export interface RelationContextMenuProps {
  children: React.ReactNode;
  relationId: string;
  isEditMode: boolean;
  onEdit?: (relationId: string) => void;
  onDelete?: (relationId: string) => void;
}

/**
 * RelationContextMenu 组件
 * 提供连线的右键菜单功能
 */
export const RelationContextMenu: React.FC<RelationContextMenuProps> = ({
  children,
  relationId,
  isEditMode,
  onEdit,
  onDelete,
}) => {
  // 非编辑模式下直接渲染子元素，不包装菜单
  if (!isEditMode) {
    return <>{children}</>;
  }

  // 构建菜单项
  const menuItems: MenuProps['items'] = [
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: '编辑连线',
      onClick: () => {
        if (onEdit) {
          onEdit(relationId);
        }
      },
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: '删除连线',
      danger: true,
      onClick: () => {
        if (onDelete) {
          onDelete(relationId);
        }
      },
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
