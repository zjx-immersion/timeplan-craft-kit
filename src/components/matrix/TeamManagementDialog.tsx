/**
 * Team管理对话框
 * 
 * 简化版MVP - 提供基础CRUD功能和成员管理
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
  InputNumber,
  ColorPicker,
  Tabs,
  Switch,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Team, TeamFormData, TeamMember, TeamMemberFormData } from '@/types/team';
import { useTeam } from '@/hooks/useTeam';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const TeamManagementDialog: React.FC<Props> = ({ visible, onClose }) => {
  const { teams, createTeam, updateTeam, deleteTeam, addMember, updateMember, removeMember } = useTeam();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [memberFormVisible, setMemberFormVisible] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [memberForm] = Form.useForm();

  const handleAdd = () => {
    form.resetFields();
    setEditingId(null);
    setFormVisible(true);
  };

  const handleEdit = (team: Team) => {
    form.setFieldsValue({
      name: team.name,
      description: team.description,
      capacity: team.capacity,
      color: team.color || '#1890ff',
    });
    setEditingId(team.id);
    setFormVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data: TeamFormData = {
        ...values,
        color: typeof values.color === 'string' ? values.color : values.color?.toHexString(),
      };

      if (editingId) {
        updateTeam(editingId, { ...data, members: teams.find(t => t.id === editingId)?.members || [] });
      } else {
        createTeam({ ...data, members: [] });
      }

      setFormVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleAddMember = (teamId: string) => {
    memberForm.resetFields();
    memberForm.setFieldsValue({ active: true, capacity: 1.0 });
    setSelectedTeamId(teamId);
    setEditingMemberId(null);
    setMemberFormVisible(true);
  };

  const handleEditMember = (teamId: string, member: TeamMember) => {
    memberForm.setFieldsValue(member);
    setSelectedTeamId(teamId);
    setEditingMemberId(member.id);
    setMemberFormVisible(true);
  };

  const handleSubmitMember = async () => {
    if (!selectedTeamId) return;

    try {
      const values = await memberForm.validateFields();
      const data: TeamMemberFormData = values;

      if (editingMemberId) {
        updateMember(selectedTeamId, editingMemberId, data);
      } else {
        addMember(selectedTeamId, data);
      }

      setMemberFormVisible(false);
      memberForm.resetFields();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const teamColumns = [
    {
      title: '团队名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Team) => (
        <Space>
          {record.color && (
            <div style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: record.color }} />
          )}
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: '容量(人/天)',
      dataIndex: 'capacity',
      key: 'capacity',
    },
    {
      title: '成员数',
      key: 'members',
      render: (_: any, record: Team) => record.members.length,
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
      width: 200,
      render: (_: any, record: Team) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button size="small" onClick={() => handleAddMember(record.id)}>成员</Button>
          <Popconfirm title="确认删除?" onConfirm={() => deleteTeam(record.id)} okText="删除" cancelText="取消">
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const memberColumns = (teamId: string) => [
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '角色', dataIndex: 'role', key: 'role' },
    { title: '容量', dataIndex: 'capacity', key: 'capacity' },
    {
      title: '状态',
      dataIndex: 'active',
      key: 'active',
      render: (active: boolean) => (active ? '激活' : '停用'),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, record: TeamMember) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEditMember(teamId, record)} />
          <Popconfirm title="确认删除?" onConfirm={() => removeMember(teamId, record.id)} okText="删除" cancelText="取消">
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Modal
        title="Team管理"
        open={visible}
        onCancel={onClose}
        width={1000}
        footer={[
          <Button key="close" onClick={onClose}>关闭</Button>,
        ]}
      >
        <div style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} style={{ backgroundColor: '#14B8A6', borderColor: '#14B8A6', color: '#fff' }}>
            新建Team
          </Button>
        </div>

        <Tabs
          items={[
            {
              key: 'list',
              label: '团队列表',
              children: <Table dataSource={teams} columns={teamColumns} rowKey="id" size="small" pagination={{ pageSize: 10 }} />,
            },
            ...teams.map(team => ({
              key: team.id,
              label: `${team.name} 成员`,
              children: (
                <div>
                  <Button size="small" onClick={() => handleAddMember(team.id)} style={{ marginBottom: 8 }}>
                    添加成员
                  </Button>
                  <Table dataSource={team.members} columns={memberColumns(team.id)} rowKey="id" size="small" />
                </div>
              ),
            })),
          ]}
        />
      </Modal>

      <Modal
        title={editingId ? '编辑Team' : '新建Team'}
        open={formVisible}
        onCancel={() => setFormVisible(false)}
        onOk={handleSubmit}
        okText="保存"
        cancelText="取消"
        okButtonProps={{ style: { backgroundColor: '#14B8A6', borderColor: '#14B8A6', color: '#fff' } }}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="团队名称" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="容量(人/天)" name="capacity" rules={[{ required: true }]}>
            <InputNumber min={0.5} max={100} step={0.5} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="颜色" name="color">
            <ColorPicker showText />
          </Form.Item>
          <Form.Item label="描述" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingMemberId ? '编辑成员' : '添加成员'}
        open={memberFormVisible}
        onCancel={() => setMemberFormVisible(false)}
        onOk={handleSubmitMember}
        okText="保存"
        cancelText="取消"
        okButtonProps={{ style: { backgroundColor: '#14B8A6', borderColor: '#14B8A6', color: '#fff' } }}
      >
        <Form form={memberForm} layout="vertical">
          <Form.Item label="姓名" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="角色" name="role" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="容量(人/天)" name="capacity" rules={[{ required: true }]}>
            <InputNumber min={0.1} max={10} step={0.1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="激活" name="active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
