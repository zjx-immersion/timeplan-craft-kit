/**
 * TimelineEditDialog - Timeline 编辑对话框
 * 
 * 功能:
 * - 编辑 Timeline 名称、负责人、颜色等属性
 * - 表单验证
 * - 支持创建和更新模式
 * 
 * @version 1.0.0
 * @date 2026-02-03
 */

import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, ColorPicker } from 'antd';
import type { Timeline } from '@/types/timeplanSchema';
import type { Color } from 'antd/es/color-picker';

/**
 * Timeline 编辑对话框属性
 */
export interface TimelineEditDialogProps {
  /**
   * 是否显示对话框
   */
  open: boolean;
  
  /**
   * 要编辑的 Timeline（null 表示创建新的）
   */
  timeline: Timeline | null;
  
  /**
   * 保存回调
   */
  onSave: (id: string, updates: Partial<Timeline>) => void;
  
  /**
   * 关闭回调
   */
  onClose: () => void;
  
  /**
   * 产品线选项
   */
  productLineOptions?: string[];
}

/**
 * 表单数据接口
 */
interface TimelineFormData {
  name: string;
  owner?: string;
  color?: string;
  productLine?: string;
  description?: string;
}

/**
 * TimelineEditDialog 组件
 */
export const TimelineEditDialog: React.FC<TimelineEditDialogProps> = ({
  open,
  timeline,
  onSave,
  onClose,
  productLineOptions = [],
}) => {
  const [form] = Form.useForm<TimelineFormData>();

  // 当 timeline 改变时更新表单
  useEffect(() => {
    if (open && timeline) {
      form.setFieldsValue({
        name: timeline.name,
        owner: timeline.owner,
        color: timeline.color,
        productLine: timeline.productLine,
        description: timeline.description,
      });
    } else if (open && !timeline) {
      form.resetFields();
    }
  }, [open, timeline, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (timeline) {
        // 更新现有 Timeline
        onSave(timeline.id, values);
      } else {
        // 创建新 Timeline（在父组件中处理）
        onSave('', values);
      }
      
      form.resetFields();
      onClose();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={timeline ? '编辑 Timeline' : '创建 Timeline'}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      okText="保存"
      cancelText="取消"
      destroyOnClose
      data-testid="timeline-edit-dialog"
    >
      <Form
        form={form}
        layout="vertical"
        data-testid="timeline-form"
      >
        <Form.Item
          label="名称"
          name="name"
          rules={[
            { required: true, message: '请输入 Timeline 名称' },
            { min: 1, max: 50, message: '名称长度应为 1-50 个字符' },
          ]}
        >
          <Input placeholder="请输入 Timeline 名称" />
        </Form.Item>

        <Form.Item
          label="负责人"
          name="owner"
        >
          <Input placeholder="请输入负责人" />
        </Form.Item>

        <Form.Item
          label="产品线"
          name="productLine"
        >
          <Select
            placeholder="请选择产品线"
            options={productLineOptions.map(line => ({
              label: line,
              value: line,
            }))}
            allowClear
          />
        </Form.Item>

        <Form.Item
          label="背景色"
          name="color"
        >
          <ColorPicker
            showText
            format="hex"
            onChange={(value: Color) => {
              form.setFieldValue('color', value.toHexString());
            }}
          />
        </Form.Item>

        <Form.Item
          label="描述"
          name="description"
        >
          <Input.TextArea
            placeholder="请输入描述"
            rows={3}
            maxLength={200}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TimelineEditDialog;
