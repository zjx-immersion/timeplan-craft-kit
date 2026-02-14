/**
 * BatchDeleteDialog - 批量删除确认对话框
 * 
 * 功能:
 * - 显示删除数量
 * - 显示相关关系数量
 * - 警告提示（不可撤销）
 * - 二次确认
 * 
 * @version 1.0.0 - Task 4.6
 * @date 2026-02-12
 */

import React, { useMemo } from 'react';
import { Modal, Alert, Space, Typography } from 'antd';
import { ExclamationCircleOutlined, DeleteOutlined, LinkOutlined } from '@ant-design/icons';
import type { TimePlan } from '@/types/timeplanSchema';

const { Text } = Typography;

export interface BatchDeleteDialogProps {
  /** 是否显示对话框 */
  visible: boolean;
  /** 选中的任务ID列表 */
  selectedLineIds: string[];
  /** TimePlan数据（用于计算相关关系数量） */
  data: TimePlan;
  /** 关闭对话框回调 */
  onClose: () => void;
  /** 确认删除回调 */
  onConfirm: () => void;
  /** 删除中状态 */
  loading?: boolean;
}

const BatchDeleteDialog: React.FC<BatchDeleteDialogProps> = ({
  visible,
  selectedLineIds,
  data,
  onClose,
  onConfirm,
  loading = false,
}) => {
  // Task 4.6: 计算相关关系数量
  const relatedRelationCount = useMemo(() => {
    const lineIdSet = new Set(selectedLineIds);
    return data.relations.filter(
      (relation) => lineIdSet.has(relation.from) || lineIdSet.has(relation.to)
    ).length;
  }, [selectedLineIds, data.relations]);

  return (
    <Modal
      title={
        <Space>
          <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
          <span>确认删除</span>
        </Space>
      }
      open={visible}
      onOk={onConfirm}
      onCancel={onClose}
      confirmLoading={loading}
      okText="确定删除"
      cancelText="取消"
      okButtonProps={{ danger: true, icon: <DeleteOutlined /> }}
      width={500}
      maskClosable={false}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 主要提示信息 */}
        <Alert
          message={
            <Text>
              您确定要删除选中的 <Text strong style={{ color: '#ff4d4f' }}>{selectedLineIds.length}</Text> 个任务吗？
            </Text>
          }
          type="warning"
          showIcon
        />

        {/* 警告：不可撤销 */}
        <Alert
          message="此操作不可撤销！"
          description="删除后将无法恢复这些任务，请谨慎操作。"
          type="error"
          showIcon
          icon={<ExclamationCircleOutlined />}
        />

        {/* 相关关系提示 */}
        {relatedRelationCount > 0 && (
          <Alert
            message={
              <Space>
                <LinkOutlined />
                <Text>
                  相关的 <Text strong>{relatedRelationCount}</Text> 个依赖关系也将被删除。
                </Text>
              </Space>
            }
            type="info"
            showIcon={false}
          />
        )}

        {/* 详细说明 */}
        <div style={{ paddingLeft: 24 }}>
          <Text type="secondary">
            删除操作将包括：
          </Text>
          <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: 20 }}>
            <li>
              <Text type="secondary">删除 {selectedLineIds.length} 个任务</Text>
            </li>
            {relatedRelationCount > 0 && (
              <li>
                <Text type="secondary">删除 {relatedRelationCount} 个相关依赖关系</Text>
              </li>
            )}
          </ul>
        </div>
      </Space>
    </Modal>
  );
};

export default BatchDeleteDialog;
