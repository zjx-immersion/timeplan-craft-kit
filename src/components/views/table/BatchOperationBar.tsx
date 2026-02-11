/**
 * BatchOperationBar - 批量操作栏
 * 
 * 功能:
 * - 批量删除
 * - 批量设置状态
 * - 批量设置优先级
 * - 批量分配负责人
 * 
 * @version 1.0.0
 * @date 2026-02-10
 */

import React, { useState } from 'react';
import { Space, Button, Tag, Popconfirm, Select, Input, message, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import {
  DeleteOutlined,
  CheckSquareOutlined,
  UserOutlined,
  FlagOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';

export interface BatchOperationBarProps {
  selectedCount: number;
  onBatchDelete: () => void;
  onBatchSetStatus: (status: string) => void;
  onBatchSetPriority: (priority: string) => void;
  onBatchAssignOwner: (owner: string) => void;
}

const BatchOperationBar: React.FC<BatchOperationBarProps> = ({
  selectedCount,
  onBatchDelete,
  onBatchSetStatus,
  onBatchSetPriority,
  onBatchAssignOwner,
}) => {
  const [isAssignOwnerVisible, setIsAssignOwnerVisible] = useState(false);
  const [ownerName, setOwnerName] = useState('');

  if (selectedCount === 0) {
    return null;
  }

  // 状态菜单
  const statusMenuItems: MenuProps['items'] = [
    {
      key: 'not-started',
      label: '未开始',
      icon: <CheckCircleOutlined />,
      onClick: () => onBatchSetStatus('not-started'),
    },
    {
      key: 'in-progress',
      label: '进行中',
      icon: <CheckCircleOutlined />,
      onClick: () => onBatchSetStatus('in-progress'),
    },
    {
      key: 'completed',
      label: '已完成',
      icon: <CheckCircleOutlined />,
      onClick: () => onBatchSetStatus('completed'),
    },
    {
      key: 'delayed',
      label: '已延期',
      icon: <CheckCircleOutlined />,
      onClick: () => onBatchSetStatus('delayed'),
    },
  ];

  // 优先级菜单
  const priorityMenuItems: MenuProps['items'] = [
    {
      key: 'P0',
      label: <Tag color="red">P0</Tag>,
      onClick: () => onBatchSetPriority('P0'),
    },
    {
      key: 'P1',
      label: <Tag color="orange">P1</Tag>,
      onClick: () => onBatchSetPriority('P1'),
    },
    {
      key: 'P2',
      label: <Tag color="blue">P2</Tag>,
      onClick: () => onBatchSetPriority('P2'),
    },
    {
      key: 'P3',
      label: <Tag color="default">P3</Tag>,
      onClick: () => onBatchSetPriority('P3'),
    },
  ];

  return (
    <Space
      style={{
        padding: '12px 16px',
        background: '#e6f4ff',
        borderRadius: 4,
        border: '1px solid #91caff',
      }}
    >
      <Tag color="blue" icon={<CheckSquareOutlined />}>
        已选 {selectedCount} 项
      </Tag>

      <Popconfirm
        title={`确定要删除选中的 ${selectedCount} 个任务吗？`}
        description="此操作不可恢复，相关的依赖关系也会被删除。"
        onConfirm={onBatchDelete}
        okText="确定删除"
        cancelText="取消"
        okButtonProps={{ danger: true }}
      >
        <Button type="primary" danger size="small" icon={<DeleteOutlined />}>
          批量删除
        </Button>
      </Popconfirm>

      <Dropdown menu={{ items: statusMenuItems }} placement="bottomLeft">
        <Button size="small" icon={<CheckCircleOutlined />}>
          批量设置状态
        </Button>
      </Dropdown>

      <Dropdown menu={{ items: priorityMenuItems }} placement="bottomLeft">
        <Button size="small" icon={<FlagOutlined />}>
          批量设置优先级
        </Button>
      </Dropdown>

      <Popconfirm
        title="批量分配负责人"
        description={
          <Input
            placeholder="输入负责人姓名"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            onPressEnter={() => {
              if (ownerName.trim()) {
                onBatchAssignOwner(ownerName.trim());
                setOwnerName('');
                setIsAssignOwnerVisible(false);
              }
            }}
            autoFocus
          />
        }
        open={isAssignOwnerVisible}
        onOpenChange={(visible) => {
          setIsAssignOwnerVisible(visible);
          if (!visible) {
            setOwnerName('');
          }
        }}
        onConfirm={() => {
          if (ownerName.trim()) {
            onBatchAssignOwner(ownerName.trim());
            setOwnerName('');
          } else {
            message.warning('请输入负责人姓名');
            return Promise.reject();
          }
        }}
        okText="确定"
        cancelText="取消"
      >
        <Button size="small" icon={<UserOutlined />}>
          批量分配负责人
        </Button>
      </Popconfirm>
    </Space>
  );
};

export default BatchOperationBar;
