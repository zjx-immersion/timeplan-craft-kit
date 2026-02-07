/**
 * 节点编辑对话框
 * 
 * 支持编辑节点的所有属性
 * 
 * @version 1.0.0
 * @date 2026-02-03
 */

import React, { useEffect } from 'react';
import { Modal, Form, Input, DatePicker, Select, ColorPicker, InputNumber, Button } from 'antd';
import type { Color } from 'antd/es/color-picker';
import { Line } from '@/types/timeplanSchema';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

export interface NodeEditDialogProps {
  open: boolean;
  node: Line | null;
  onSave: (nodeId: string, updates: Partial<Line>) => void;
  onClose: () => void;
}

/**
 * 节点编辑对话框组件
 */
export const NodeEditDialog: React.FC<NodeEditDialogProps> = ({
  open,
  node,
  onSave,
  onClose,
}) => {
  const [form] = Form.useForm();

  // 当节点变化时，更新表单
  useEffect(() => {
    if (node && open) {
      form.setFieldsValue({
        label: node.label,
        startDate: node.startDate ? dayjs(node.startDate) : null,
        endDate: node.endDate ? dayjs(node.endDate) : null,
        status: node.attributes?.status || 'pending',
        priority: node.attributes?.priority || 'medium',
        color: node.attributes?.color || '#1890ff',
        assignee: node.attributes?.assignee || '',
        progress: node.attributes?.progress || 0,
        description: node.attributes?.description || '',
        notes: node.notes || '',
      });
    }
  }, [node, open, form]);

  const handleSubmit = async () => {
    if (!node) return;

    try {
      const values = await form.validateFields();
      
      // 构建更新对象
      const updates: Partial<Line> = {
        label: values.label,
        startDate: values.startDate ? values.startDate.toDate() : node.startDate,
        endDate: values.endDate ? values.endDate.toDate() : undefined,
        attributes: {
          ...node.attributes,
          status: values.status,
          priority: values.priority,
          color: typeof values.color === 'string' ? values.color : values.color?.toHexString(),
          assignee: values.assignee,
          progress: values.progress,
          description: values.description,
        },
        notes: values.notes,
      };

      onSave(node.id, updates);
      onClose();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const nodeType = node?.schemaId?.replace('-schema', '') || 'bar';
  const isBar = nodeType === 'bar';

  return (
    <Modal
      title={`编辑${nodeType === 'bar' ? '任务' : nodeType === 'milestone' ? '里程碑' : '网关'}`}
      open={open}
      onCancel={handleClose}
      onOk={handleSubmit}
      width={600}
      okText="保存"
      cancelText="取消"
    >
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
      >
        {/* 基本信息 */}
        <Form.Item
          label="名称"
          name="label"
          rules={[{ required: true, message: '请输入名称' }]}
        >
          <Input placeholder="请输入名称" />
        </Form.Item>

        {/* 日期 */}
        <Form.Item
          label="开始日期"
          name="startDate"
          rules={[{ required: true, message: '请选择开始日期' }]}
        >
          <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
        </Form.Item>

        {isBar && (
          <Form.Item
            label="结束日期"
            name="endDate"
          >
            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>
        )}

        {/* 状态和优先级 */}
        <div style={{ display: 'flex', gap: 16 }}>
          <Form.Item
            label="状态"
            name="status"
            style={{ flex: 1 }}
          >
            <Select>
              <Option value="pending">待开始</Option>
              <Option value="in-progress">进行中</Option>
              <Option value="completed">已完成</Option>
              <Option value="blocked">已阻塞</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="优先级"
            name="priority"
            style={{ flex: 1 }}
          >
            <Select>
              <Option value="low">低</Option>
              <Option value="medium">中</Option>
              <Option value="high">高</Option>
              <Option value="critical">紧急</Option>
            </Select>
          </Form.Item>
        </div>

        {/* 颜色和负责人 */}
        <div style={{ display: 'flex', gap: 16 }}>
          <Form.Item
            label="颜色"
            name="color"
            style={{ flex: 1 }}
          >
            <ColorPicker
              showText
              format="hex"
              presets={[
                {
                  label: '推荐色',
                  colors: [
                    '#1890ff',
                    '#52c41a',
                    '#fa8c16',
                    '#f5222d',
                    '#722ed1',
                    '#13c2c2',
                  ],
                },
              ]}
            />
          </Form.Item>

          <Form.Item
            label="负责人"
            name="assignee"
            style={{ flex: 1 }}
          >
            <Input placeholder="请输入负责人" />
          </Form.Item>
        </div>

        {/* 进度（仅任务） */}
        {isBar && (
          <Form.Item
            label="进度 (%)"
            name="progress"
          >
            <InputNumber
              min={0}
              max={100}
              style={{ width: '100%' }}
              formatter={value => `${value}%`}
              parser={value => value?.replace('%', '') as unknown as number}
            />
          </Form.Item>
        )}

        {/* 描述 */}
        <Form.Item
          label="描述"
          name="description"
        >
          <TextArea
            rows={3}
            placeholder="请输入描述"
            maxLength={500}
            showCount
          />
        </Form.Item>

        {/* 备注 */}
        <Form.Item
          label="备注"
          name="notes"
        >
          <TextArea
            rows={3}
            placeholder="请输入备注"
            maxLength={1000}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
