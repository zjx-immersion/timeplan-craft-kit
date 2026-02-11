/**
 * RelationEditDialog - 依赖关系编辑对话框
 * 
 * @version 1.0.0
 * @date 2026-02-03
 */

import React, { useEffect } from 'react';
import { Modal, Form, Select, InputNumber, Input } from 'antd';
import type { Relation } from '@/types/timeplanSchema';

export interface RelationEditDialogProps {
  open: boolean;
  relation: Relation | null;
  onSave: (id: string, updates: Partial<Relation>) => void;
  onClose: () => void;
}

interface RelationFormData {
  type: 'FS' | 'SS' | 'FF' | 'SF';
  lag?: number;
  notes?: string;
}

const RELATION_TYPES = [
  { label: 'FS (结束-开始)', value: 'FS' },
  { label: 'SS (开始-开始)', value: 'SS' },
  { label: 'FF (结束-结束)', value: 'FF' },
  { label: 'SF (开始-结束)', value: 'SF' },
];

export const RelationEditDialog: React.FC<RelationEditDialogProps> = ({
  open,
  relation,
  onSave,
  onClose,
}) => {
  const [form] = Form.useForm<RelationFormData>();

  useEffect(() => {
    if (open && relation) {
      form.setFieldsValue({
        type: relation.type,
        lag: relation.lag,
        notes: relation.notes,
      });
    } else if (open && !relation) {
      form.resetFields();
    }
  }, [open, relation, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (relation) {
        onSave(relation.id, values);
      }
      form.resetFields();
      onClose();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  return (
    <Modal
      title="编辑依赖关系"
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      okText="保存"
      cancelText="取消"
      okButtonProps={{ 
        style: { color: '#fff', backgroundColor: '#1890ff' }
      }}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="依赖类型"
          name="type"
          rules={[{ required: true }]}
        >
          <Select options={RELATION_TYPES} />
        </Form.Item>

        <Form.Item
          label="延迟天数"
          name="lag"
          help="正数表示延后，负数表示提前"
        >
          <InputNumber min={-365} max={365} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item label="备注" name="notes">
          <Input.TextArea rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  );
};
