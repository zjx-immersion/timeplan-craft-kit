/**
 * BaselineEditDialog - 基线编辑对话框
 * 
 * 功能:
 * - 编辑基线标签
 * - 选择基线日期
 * - 选择基线颜色
 * - 新增/编辑模式
 * 
 * @version 1.0.0
 * @date 2026-02-07
 * @migrated-from timeline-craft-kit/src/components/timeline/BaselineEditDialog.tsx
 */

import React, { useEffect } from 'react';
import { Modal, Form, Input, DatePicker, Select, Space } from 'antd';
import { startOfDay } from 'date-fns';
import dayjs from 'dayjs';
import type { Baseline } from '@/types/timeplanSchema';

/**
 * BaselineEditDialog 组件属性
 */
export interface BaselineEditDialogProps {
  /**
   * 基线数据（null表示新建）
   */
  baseline: Baseline | null;

  /**
   * 是否打开
   */
  isOpen: boolean;

  /**
   * 关闭回调
   */
  onClose: () => void;

  /**
   * 保存回调
   */
  onSave: (baseline: Baseline) => void;

  /**
   * 是否新建模式
   * @default false
   */
  isNewBaseline?: boolean;
}

/**
 * 颜色选项
 */
const colorOptions = [
  { value: '#ff4d4f', label: '红色 (封版)' },
  { value: '#52c41a', label: '绿色 (里程碑)' },
  { value: '#1677ff', label: '蓝色 (发布)' },
  { value: '#fa8c16', label: '橙色 (预警)' },
  { value: '#722ed1', label: '紫色 (评审)' },
];

/**
 * BaselineEditDialog 组件
 */
export const BaselineEditDialog: React.FC<BaselineEditDialogProps> = ({
  baseline,
  isOpen,
  onClose,
  onSave,
  isNewBaseline = false,
}) => {
  const [form] = Form.useForm();

  // 初始化表单
  useEffect(() => {
    if (isOpen && baseline) {
      form.setFieldsValue({
        label: baseline.label,
        date: baseline.date ? dayjs(baseline.date) : dayjs(),
        color: baseline.color || colorOptions[2].value,
      });
    }
  }, [isOpen, baseline, form]);

  /**
   * 保存
   */
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      
      const newBaseline: Baseline = {
        id: baseline?.id || `baseline-${Date.now()}`,
        label: values.label.trim(),
        date: startOfDay(values.date.toDate()),
        color: values.color,
        schemaId: baseline?.schemaId,
        attributes: baseline?.attributes || {},
      };

      onSave(newBaseline);
      onClose();
      form.resetFields();
    } catch (error) {
      console.error('[BaselineEditDialog] Validation failed:', error);
    }
  };

  /**
   * 取消
   */
  const handleCancel = () => {
    onClose();
    form.resetFields();
  };

  return (
    <Modal
      title={isNewBaseline ? '添加基线' : '编辑基线'}
      open={isOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      okText="保存"
      cancelText="取消"
      width={480}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          label: '',
          date: dayjs(),
          color: colorOptions[2].value,
        }}
      >
        <Form.Item
          label="标签"
          name="label"
          rules={[
            { required: true, message: '请输入标签' },
            { max: 50, message: '标签最多50个字符' },
          ]}
        >
          <Input placeholder="例如：发版日期、封版时间" />
        </Form.Item>

        <Form.Item
          label="日期"
          name="date"
          rules={[{ required: true, message: '请选择日期' }]}
        >
          <DatePicker
            style={{ width: '100%' }}
            format="YYYY-MM-DD"
            placeholder="选择日期"
          />
        </Form.Item>

        <Form.Item
          label="颜色"
          name="color"
          rules={[{ required: true, message: '请选择颜色' }]}
        >
          <Select
            options={colorOptions.map(opt => ({
              value: opt.value,
              label: (
                <Space>
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      backgroundColor: opt.value,
                      borderRadius: 2,
                      border: '1px solid #d9d9d9',
                    }}
                  />
                  <span>{opt.label}</span>
                </Space>
              ),
            }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default BaselineEditDialog;
