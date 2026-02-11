/**
 * Product管理对话框
 * 
 * 简化版MVP - 提供基础CRUD功能
 */

import React, { useState } from 'react';
import {
  Modal,
  Table,
  Button,
  Form,
  Input,
  Space,
  Popconfirm,
  message,
  Tag,
  ColorPicker,
  type Color,
} from 'antd';
import {  PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Product, ProductFormData } from '@/types/product';
import { useProduct } from '@/hooks/useProduct';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const ProductManagementDialog: React.FC<Props> = ({ visible, onClose }) => {
  const { products, createProduct, updateProduct, deleteProduct } = useProduct();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [form] = Form.useForm();

  const handleAdd = () => {
    form.resetFields();
    setEditingId(null);
    setFormVisible(true);
  };

  const handleEdit = (product: Product) => {
    form.setFieldsValue({
      name: product.name,
      code: product.code,
      description: product.description,
      owner: product.owner,
      color: product.color || '#1890ff',
    });
    setEditingId(product.id);
    setFormVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data: ProductFormData = {
        ...values,
        teams: [],
        color: typeof values.color === 'string' ? values.color : values.color?.toHexString(),
      };

      if (editingId) {
        updateProduct(editingId, data);
      } else {
        createProduct(data);
      }

      setFormVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const columns = [
    {
      title: '产品名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Product) => (
        <Space>
          {record.color && (
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 2,
                backgroundColor: record.color,
              }}
            />
          )}
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: '产品编码',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: '负责人',
      dataIndex: 'owner',
      key: 'owner',
      render: (text: string) => text || '-',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string) => text || '-',
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      render: (_: any, record: Product) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="确认删除?"
            onConfirm={() => deleteProduct(record.id)}
            okText="删除"
            cancelText="取消"
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Modal
        title="Product管理"
        open={visible}
        onCancel={onClose}
        width={900}
        footer={[
          <Button key="close" onClick={onClose}>
            关闭
          </Button>,
        ]}
      >
        <div style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} style={{ backgroundColor: '#14B8A6', borderColor: '#14B8A6', color: '#fff' }}>
            新建Product
          </Button>
        </div>

        <Table
          dataSource={products}
          columns={columns}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 10 }}
        />
      </Modal>

      <Modal
        title={editingId ? '编辑Product' : '新建Product'}
        open={formVisible}
        onCancel={() => setFormVisible(false)}
        onOk={handleSubmit}
        okText="保存"
        cancelText="取消"
        okButtonProps={{ style: { backgroundColor: '#14B8A6', borderColor: '#14B8A6', color: '#fff' } }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="产品名称"
            name="name"
            rules={[{ required: true, message: '请输入产品名称' }]}
          >
            <Input placeholder="例如: Orion X" />
          </Form.Item>

          <Form.Item
            label="产品编码"
            name="code"
            rules={[
              { required: true, message: '请输入产品编码' },
              { pattern: /^[A-Z0-9-_]{2,20}$/, message: '编码格式：大写字母、数字、-、_，2-20位' },
            ]}
          >
            <Input placeholder="例如: ORION-X" />
          </Form.Item>

          <Form.Item label="负责人" name="owner">
            <Input placeholder="例如: 张三" />
          </Form.Item>

          <Form.Item label="产品颜色" name="color">
            <ColorPicker showText />
          </Form.Item>

          <Form.Item label="描述" name="description">
            <Input.TextArea rows={3} placeholder="产品描述..." />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
