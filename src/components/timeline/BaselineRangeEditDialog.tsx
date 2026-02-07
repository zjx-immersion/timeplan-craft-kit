/**
 * BaselineRangeEditDialog - 基线范围编辑对话框
 * 
 * 功能:
 * - 编辑基线范围标签
 * - 选择开始和结束日期
 * - 选择颜色
 * - 新增/编辑模式
 * 
 * @version 1.0.0
 * @date 2026-02-07
 * @migrated-from timeline-craft-kit/src/components/timeline/BaselineRangeEditDialog.tsx
 */

import React, { useEffect } from 'react';
import { Modal, Form, Input, DatePicker, Select, Space } from 'antd';
import { startOfDay } from 'date-fns';
import dayjs from 'dayjs';
import type { BaselineRange } from '@/types/timeplanSchema';

const { RangePicker } = DatePicker;

/**
 * BaselineRangeEditDialog 组件属性
 */
export interface BaselineRangeEditDialogProps {
  /**
   * 基线范围数据（null表示新建）
   */
  range: BaselineRange | null;

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
  onSave: (range: BaselineRange) => void;

  /**
   * 是否新建模式
   * @default false
   */
  isNewRange?: boolean;
}

/**
 * 颜色选项
 */
const colorOptions = [
  { value: '#ff4d4f', label: '红色 (封版)' },
  { value: '#1677ff', label: '蓝色 (发布)' },
  { value: '#52c41a', label: '绿色 (里程碑)' },
  { value: '#fa8c16', label: '橙色 (预警)' },
  { value: '#722ed1', label: '紫色 (评审)' },
  { value: '#13c2c2', label: '青色 (测试)' },
];

/**
 * BaselineRangeEditDialog 组件
 */
export const BaselineRangeEditDialog: React.FC<BaselineRangeEditDialogProps> = ({
  range,
  isOpen,
  onClose,
  onSave,
  isNewRange = false,
}) => {
  const [form] = Form.useForm();

  // 初始化表单
  useEffect(() => {
    if (isOpen && range) {
      form.setFieldsValue({
        label: range.label,
        dateRange: [
          range.startDate ? dayjs(range.startDate) : dayjs(),
          range.endDate ? dayjs(range.endDate) : dayjs().add(7, 'day'),
        ],
        color: range.color || colorOptions[1].value,
      });
    }
  }, [isOpen, range, form]);

  /**
   * 保存
   */
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      
      const [startDate, endDate] = values.dateRange;
      
      const newRange: BaselineRange = {
        id: range?.id || `baseline-range-${Date.now()}`,
        label: values.label.trim(),
        startDate: startOfDay(startDate.toDate()),
        endDate: startOfDay(endDate.toDate()),
        color: values.color,
        schemaId: range?.schemaId,
        attributes: {
          ...(range?.attributes || {}),
          description: values.description?.trim() || '',
        },
      };

      onSave(newRange);
      onClose();
      form.resetFields();
    } catch (error) {
      console.error('[BaselineRangeEditDialog] Validation failed:', error);
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
      title={isNewRange ? '添加基线范围' : '编辑基线范围'}
      open={isOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      okText="保存"
      cancelText="取消"
      width={560}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
        label: '',
        dateRange: [dayjs(), dayjs().add(7, 'day')],
        color: colorOptions[1].value,
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
          <Input placeholder="例如：开发阶段、测试阶段" />
        </Form.Item>

        <Form.Item
          label="日期范围"
          name="dateRange"
          rules={[{ required: true, message: '请选择日期范围' }]}
        >
          <RangePicker
            style={{ width: '100%' }}
            format="YYYY-MM-DD"
            placeholder={['开始日期', '结束日期']}
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

        <Form.Item
          label="描述（可选）"
          name="description"
        >
          <Input.TextArea
            rows={3}
            placeholder="描述这个时间范围的用途或注意事项"
            maxLength={200}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default BaselineRangeEditDialog;
