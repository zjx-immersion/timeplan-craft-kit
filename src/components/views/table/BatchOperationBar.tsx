/**
 * BatchOperationBar - 批量操作栏
 * 
 * 功能:
 * - 显示选中数量
 * - 取消选择
 * - 批量编辑（打开对话框）
 * - 批量删除
 * - 批量设置状态
 * - 批量设置优先级
 * - 批量分配负责人
 * - 导出选中任务
 * 
 * @version 2.0.0 - Task 4.3增强
 * @date 2026-02-12
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
  EditOutlined,
  ExportOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useSelectionStore } from '@/stores/selectionStore';

export interface BatchOperationBarProps {
  selectedCount: number;
  onBatchDelete: () => void;
  onBatchSetStatus: (status: string) => void;
  onBatchSetPriority: (priority: string) => void;
  onBatchAssignOwner: (owner: string) => void;
  onBatchEdit?: () => void; // Task 4.3: 新增批量编辑回调
  onBatchExport?: () => void; // Task 4.3: 新增导出回调
}

const BatchOperationBar: React.FC<BatchOperationBarProps> = ({
  selectedCount,
  onBatchDelete,
  onBatchSetStatus,
  onBatchSetPriority,
  onBatchAssignOwner,
  onBatchEdit,
  onBatchExport,
}) => {
  const [isAssignOwnerVisible, setIsAssignOwnerVisible] = useState(false);
  const [ownerName, setOwnerName] = useState('');
  
  // Task 4.3: 集成SelectionStore
  const { clearSelection } = useSelectionStore();

  if (selectedCount === 0) {
    return null;
  }
  
  // Task 4.3: 取消选择处理
  const handleClearSelection = () => {
    clearSelection();
    message.info('已取消选择');
  };

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
    <div
      style={{
        padding: '12px 16px',
        background: '#e6f4ff',
        borderRadius: 4,
        border: '1px solid #91caff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {/* Task 4.3: 左侧 - 选中数量和取消按钮 */}
      <Space>
        <Tag color="blue" icon={<CheckSquareOutlined />}>
          已选中 {selectedCount} 个任务
        </Tag>
        <Button 
          type="text" 
          size="small" 
          icon={<CloseCircleOutlined />}
          onClick={handleClearSelection}
        >
          取消选择
        </Button>
      </Space>

      {/* Task 4.3: 右侧 - 操作按钮组 */}
      <Space>
        {/* 批量编辑按钮 */}
        {onBatchEdit && (
          <Button 
            type="primary" 
            size="small" 
            icon={<EditOutlined />}
            onClick={onBatchEdit}
          >
            批量编辑
          </Button>
        )}

        {/* 导出按钮 */}
        {onBatchExport && (
          <Button 
            size="small" 
            icon={<ExportOutlined />}
            onClick={onBatchExport}
          >
            导出
          </Button>
        )}

        {/* 快捷操作：状态、优先级、负责人 */}
        <Dropdown menu={{ items: statusMenuItems }} placement="bottomLeft">
          <Button size="small" icon={<CheckCircleOutlined />}>
            设置状态
          </Button>
        </Dropdown>

        <Dropdown menu={{ items: priorityMenuItems }} placement="bottomLeft">
          <Button size="small" icon={<FlagOutlined />}>
            设置优先级
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
            分配负责人
          </Button>
        </Popconfirm>

        {/* Task 4.6: 批量删除按钮（打开详细确认对话框） */}
        <Button 
          danger 
          size="small" 
          icon={<DeleteOutlined />}
          onClick={onBatchDelete}
        >
          删除
        </Button>
      </Space>
    </div>
  );
};

export default BatchOperationBar;
