/**
 * BatchEditDialog - 批量编辑对话框
 * 
 * 功能:
 * - 可选字段更新（优先级、负责人、状态、工作量）
 * - Checkbox控制是否更新字段
 * - 未选中的字段保持不变
 * - 显示更新进度
 * - 表单验证
 * 
 * @version 1.0.0 - Task 4.4
 * @date 2026-02-12
 */

import React, { useState } from 'react';
import {
  Modal,
  Form,
  Checkbox,
  Select,
  Input,
  InputNumber,
  Alert,
  Progress,
  Space,
  message,
} from 'antd';
import type { Line } from '@/types/timeplanSchema';

export interface BatchEditDialogProps {
  /** 是否显示对话框 */
  visible: boolean;
  /** 选中的任务ID列表 */
  selectedLineIds: string[];
  /** 关闭对话框回调 */
  onClose: () => void;
  /** 批量更新回调 */
  onBatchUpdate: (updates: Partial<Line>) => Promise<void>;
}

/**
 * 批量编辑表单数据
 */
interface BatchEditFormData {
  updatePriority: boolean;
  priority?: string;
  updateOwner: boolean;
  owner?: string;
  updateStatus: boolean;
  status?: string;
  updateEffort: boolean;
  effort?: number;
}

const BatchEditDialog: React.FC<BatchEditDialogProps> = ({
  visible,
  selectedLineIds,
  onClose,
  onBatchUpdate,
}) => {
  const [form] = Form.useForm<BatchEditFormData>();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // 状态选项
  const statusOptions = [
    { label: '未开始', value: 'not-started' },
    { label: '进行中', value: 'in-progress' },
    { label: '已完成', value: 'completed' },
    { label: '已延期', value: 'delayed' },
  ];

  // 优先级选项
  const priorityOptions = [
    { label: 'P0', value: 'P0' },
    { label: 'P1', value: 'P1' },
    { label: 'P2', value: 'P2' },
    { label: 'P3', value: 'P3' },
  ];

  /**
   * 处理确定按钮
   */
  const handleOk = async () => {
    try {
      // 验证表单
      const values = await form.validateFields();
      
      // 构建更新对象（只包含选中要更新的字段）
      const updates: Partial<Line> = {};
      const attributes: Record<string, any> = {};

      if (values.updatePriority && values.priority) {
        attributes.priority = values.priority;
      }

      if (values.updateOwner && values.owner) {
        attributes.owner = values.owner;
      }

      if (values.updateStatus && values.status) {
        attributes.status = values.status;
      }

      if (values.updateEffort && values.effort !== undefined) {
        attributes.effort = values.effort;
      }

      // 如果有字段需要更新，添加到updates
      if (Object.keys(attributes).length > 0) {
        updates.attributes = attributes;
      }

      // 检查是否有字段需要更新
      if (Object.keys(updates).length === 0) {
        message.warning('请至少选择一个要更新的字段');
        return;
      }

      // 开始更新
      setLoading(true);
      setProgress(0);

      console.log('[BatchEditDialog] 🔄 开始批量更新:', {
        selectedCount: selectedLineIds.length,
        updates,
      });

      // 模拟进度（如果任务多的话）
      if (selectedLineIds.length > 10) {
        const progressInterval = setInterval(() => {
          setProgress(prev => Math.min(prev + 10, 90));
        }, 100);

        await onBatchUpdate(updates);

        clearInterval(progressInterval);
        setProgress(100);
      } else {
        await onBatchUpdate(updates);
        setProgress(100);
      }

      message.success(`成功更新 ${selectedLineIds.length} 个任务`);
      
      console.log('[BatchEditDialog] ✅ 批量更新完成');

      // 延迟关闭，让用户看到成功提示
      setTimeout(() => {
        handleClose();
      }, 500);
    } catch (error) {
      console.error('[BatchEditDialog] ❌ 批量更新失败:', error);
      if (error instanceof Error) {
        message.error(`更新失败: ${error.message}`);
      }
      setLoading(false);
      setProgress(0);
    }
  };

  /**
   * 处理取消按钮
   */
  const handleClose = () => {
    form.resetFields();
    setLoading(false);
    setProgress(0);
    onClose();
  };

  return (
    <Modal
      title={`批量编辑 (${selectedLineIds.length} 个任务)`}
      open={visible}
      onOk={handleOk}
      onCancel={handleClose}
      confirmLoading={loading}
      okText="确定"
      cancelText="取消"
      width={600}
      maskClosable={false}
    >
      <Alert
        message="选择要更新的字段，未选中的字段将保持不变"
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          updatePriority: false,
          updateOwner: false,
          updateStatus: false,
          updateEffort: false,
        }}
      >
        {/* 优先级 */}
        <Space direction="horizontal" style={{ width: '100%', marginBottom: 16 }} align="start">
          <Form.Item name="updatePriority" valuePropName="checked" style={{ marginBottom: 0 }}>
            <Checkbox>更新优先级</Checkbox>
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.updatePriority !== currentValues.updatePriority
            }
          >
            {({ getFieldValue }) => {
              const updatePriority = getFieldValue('updatePriority');
              return (
                <Form.Item
                  name="priority"
                  rules={[
                    {
                      required: updatePriority,
                      message: '请选择优先级',
                    },
                  ]}
                  style={{ marginBottom: 0, flex: 1 }}
                >
                  <Select
                    placeholder="选择优先级"
                    options={priorityOptions}
                    disabled={!updatePriority}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              );
            }}
          </Form.Item>
        </Space>

        {/* 负责人 */}
        <Space direction="horizontal" style={{ width: '100%', marginBottom: 16 }} align="start">
          <Form.Item name="updateOwner" valuePropName="checked" style={{ marginBottom: 0 }}>
            <Checkbox>更新负责人</Checkbox>
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.updateOwner !== currentValues.updateOwner
            }
          >
            {({ getFieldValue }) => {
              const updateOwner = getFieldValue('updateOwner');
              return (
                <Form.Item
                  name="owner"
                  rules={[
                    {
                      required: updateOwner,
                      message: '请输入负责人',
                    },
                    {
                      max: 50,
                      message: '负责人名称不能超过50个字符',
                    },
                  ]}
                  style={{ marginBottom: 0, flex: 1 }}
                >
                  <Input
                    placeholder="输入负责人姓名"
                    disabled={!updateOwner}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              );
            }}
          </Form.Item>
        </Space>

        {/* 状态 */}
        <Space direction="horizontal" style={{ width: '100%', marginBottom: 16 }} align="start">
          <Form.Item name="updateStatus" valuePropName="checked" style={{ marginBottom: 0 }}>
            <Checkbox>更新状态</Checkbox>
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.updateStatus !== currentValues.updateStatus
            }
          >
            {({ getFieldValue }) => {
              const updateStatus = getFieldValue('updateStatus');
              return (
                <Form.Item
                  name="status"
                  rules={[
                    {
                      required: updateStatus,
                      message: '请选择状态',
                    },
                  ]}
                  style={{ marginBottom: 0, flex: 1 }}
                >
                  <Select
                    placeholder="选择状态"
                    options={statusOptions}
                    disabled={!updateStatus}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              );
            }}
          </Form.Item>
        </Space>

        {/* 工作量 */}
        <Space direction="horizontal" style={{ width: '100%', marginBottom: 16 }} align="start">
          <Form.Item name="updateEffort" valuePropName="checked" style={{ marginBottom: 0 }}>
            <Checkbox>更新工作量</Checkbox>
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.updateEffort !== currentValues.updateEffort
            }
          >
            {({ getFieldValue }) => {
              const updateEffort = getFieldValue('updateEffort');
              return (
                <Form.Item
                  name="effort"
                  rules={[
                    {
                      required: updateEffort,
                      message: '请输入工作量',
                    },
                    {
                      type: 'number',
                      min: 0,
                      max: 1000,
                      message: '工作量必须在0-1000之间',
                    },
                  ]}
                  style={{ marginBottom: 0, flex: 1 }}
                >
                  <InputNumber
                    placeholder="输入工作量"
                    disabled={!updateEffort}
                    style={{ width: '100%' }}
                    min={0}
                    max={1000}
                    step={0.5}
                    precision={1}
                    addonAfter="人/天"
                  />
                </Form.Item>
              );
            }}
          </Form.Item>
        </Space>
      </Form>

      {/* 进度条（任务多时显示） */}
      {loading && selectedLineIds.length > 10 && (
        <div style={{ marginTop: 16 }}>
          <Progress percent={progress} status={progress === 100 ? 'success' : 'active'} />
        </div>
      )}
    </Modal>
  );
};

export default BatchEditDialog;
