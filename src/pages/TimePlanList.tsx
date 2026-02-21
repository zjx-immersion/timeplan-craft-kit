/**
 * TimePlanList - 项目列表页
 * 
 * 📋 迁移信息:
 * - 原文件: src/pages/TimePlanList.tsx
 * - 迁移日期: 2026-02-03
 * - 布局: 表格视图（原项目设计）
 * - 对比状态: ⏳ 待验证
 * 
 * 🎯 功能要求:
 * - 表格布局显示项目列表
 * - 支持拖拽排序
 * - 支持创建/编辑/删除项目
 * - 支持搜索过滤
 * 
 * 🔄 技术替换:
 * - Tailwind → Ant Design Token
 * - Lucide Icons → Ant Design Icons
 */

import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Input,
  Space,
  Typography,
  Table,
  Modal,
  Form,
  message,
  theme,
  Dropdown,
  Spin,
} from 'antd';
import type { MenuProps, TableColumnsType } from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  FolderOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  HolderOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { useTimePlanStoreWithAPI } from '@/stores/timePlanStoreWithAPI';
import { TimelinePlanData } from '@/types/timeline';
import { format } from 'date-fns';

const { Title, Text } = Typography;

export default function TimePlanList() {
  const navigate = useNavigate();
  const { token } = theme.useToken();

  // Store - 使用 API 集成的 Store
  const { 
    plans, 
    loading,
    error,
    loadPlans,
    createPlan, 
    updatePlan, 
    deletePlan 
  } = useTimePlanStoreWithAPI();

  // 加载计划列表 - 只在组件挂载时加载一次
  const hasLoadedRef = useRef(false);
  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadPlans();
    }
  }, []);

  // 状态
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<TimelinePlanData | null>(null);
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 过滤和排序
  const filteredPlans = useMemo(() => {
    return plans
      .filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        const dateA = a.lastAccessTime || a.createdAt || new Date(0);
        const dateB = b.lastAccessTime || b.createdAt || new Date(0);

        // 处理日期类型（可能是 Date 对象或字符串）
        const timeA = dateA instanceof Date ? dateA.getTime() : new Date(dateA).getTime();
        const timeB = dateB instanceof Date ? dateB.getTime() : new Date(dateB).getTime();

        return timeB - timeA;
      });
  }, [plans, searchQuery]);

  // 创建项目
  const handleCreate = async (values: any) => {
    setIsSubmitting(true);
    try {
      const newPlan = await createPlan(
        values.title,
        values.owner || '未指定',
        values.description
      );
      
      message.success('项目创建成功！');
      setIsCreateModalOpen(false);
      form.resetFields();

      // 导航到新项目
      navigate(`/${newPlan.id}`);
    } catch (error: any) {
      message.error(error.message || '创建项目失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 编辑项目
  const handleEdit = (plan: TimelinePlanData) => {
    setEditingPlan(plan);
    form.setFieldsValue({
      title: plan.title,
      description: plan.description,
      owner: plan.owner,
    });
    setIsCreateModalOpen(true);
  };

  // 保存编辑
  const handleSaveEdit = async (values: any) => {
    if (!editingPlan) return;

    setIsSubmitting(true);
    try {
      await updatePlan(editingPlan.id, {
        title: values.title,
        description: values.description,
        owner: values.owner,
      });

      message.success('项目更新成功！');
      setIsCreateModalOpen(false);
      setEditingPlan(null);
      form.resetFields();
    } catch (error: any) {
      message.error(error.message || '更新项目失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 删除项目
  const handleDelete = (plan: TimelinePlanData) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除项目 "${plan.title}" 吗？此操作不可恢复。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deletePlan(plan.id);
          message.success('项目已删除');
        } catch (error: any) {
          message.error(error.message || '删除项目失败');
        }
      },
    });
  };

  // 打开项目
  const handleOpen = (planId: string) => {
    navigate(`/${planId}`);
  };

  // 操作菜单
  const getActionMenu = (record: TimelinePlanData): MenuProps => ({
    items: [
      {
        key: 'edit',
        label: '编辑',
        icon: <EditOutlined />,
        onClick: () => handleEdit(record),
      },
      {
        key: 'copy',
        label: '复制',
        icon: <CopyOutlined />,
        disabled: true,
      },
      {
        type: 'divider',
      },
      {
        key: 'delete',
        label: '删除',
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () => handleDelete(record),
      },
    ],
  });

  // 表格列定义
  const columns: TableColumnsType<TimelinePlanData> = [
    {
      key: 'drag',
      width: 40,
      render: () => (
        <HolderOutlined
          style={{
            cursor: 'move',
            color: token.colorTextSecondary,
          }}
        />
      ),
    },
    {
      title: 'Time Plan',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: TimelinePlanData) => (
        <div
          onClick={() => handleOpen(record.id)}
          style={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: token.marginSM,
          }}
        >
          <FolderOutlined
            style={{
              fontSize: 24,
              color: token.colorPrimary,
            }}
          />
          <div>
            <div
              style={{
                fontWeight: 500,
                marginBottom: 4,
              }}
            >
              {title}
            </div>
            <Text
              type="secondary"
              style={{
                fontSize: 12,
              }}
            >
              {record.timelines?.length || 0} 条 Timeline
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: '所有人',
      dataIndex: 'owner',
      key: 'owner',
      width: 200,
      render: (owner: string) => <Text>{owner}</Text>,
    },
    {
      title: '最近访问',
      dataIndex: 'lastAccessTime',
      key: 'lastAccessTime',
      width: 200,
      render: (time: Date) =>
        time ? (
          <Text type="secondary">
            {format(new Date(time), 'yyyy-MM-dd HH:mm')}
          </Text>
        ) : (
          <Text type="secondary">未访问</Text>
        ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 60,
      render: (_, record) => (
        <Dropdown menu={getActionMenu(record)} trigger={['click']}>
          <Button
            type="text"
            icon={<MoreOutlined />}
            onClick={(e) => e.stopPropagation()}
          />
        </Dropdown>
      ),
    },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: token.colorBgLayout,
        padding: token.paddingLG,
      }}
    >
      {/* 页面标题 */}
      <div style={{ marginBottom: token.marginLG }}>
        <Title level={3} style={{ margin: 0 }}>
          Time Plan
        </Title>
        <Text type="secondary">管理和查看所有项目计划</Text>
      </div>

      {/* 搜索和操作栏 */}
      <div
        style={{
          marginBottom: token.marginLG,
          display: 'flex',
          gap: token.margin,
          alignItems: 'center',
        }}
      >
        <Input
          placeholder="搜索计划名称或负责人..."
          prefix={<SearchOutlined />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          allowClear
          style={{ maxWidth: 400 }}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingPlan(null);
            form.resetFields();
            setIsCreateModalOpen(true);
          }}
          style={{
            color: '#FFFFFF',  // ✅ 强制白色文字
          }}
        >
          新建计划
        </Button>
      </div>

      {/* 项目表格 */}
      <Spin spinning={loading.plans} tip="加载中...">
        <Table
          dataSource={filteredPlans}
          columns={columns}
          rowKey="id"
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 个项目`,
          }}
          locale={{
            emptyText: (
              <div style={{ padding: token.paddingLG }}>
                <Text type="secondary">暂无项目，点击"新建计划"开始</Text>
              </div>
            ),
          }}
          style={{
            backgroundColor: token.colorBgContainer,
          }}
        />
      </Spin>

      {/* 创建/编辑对话框 */}
      <Modal
        title={editingPlan ? '编辑项目' : '新建项目'}
        open={isCreateModalOpen}
        onOk={editingPlan ? form.submit : form.submit}
        onCancel={() => {
          setIsCreateModalOpen(false);
          setEditingPlan(null);
          form.resetFields();
        }}
        okText={editingPlan ? '保存' : '创建'}
        cancelText="取消"
        confirmLoading={isSubmitting}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={editingPlan ? handleSaveEdit : handleCreate}
          style={{ marginTop: token.marginLG }}
        >
          <Form.Item
            name="title"
            label="项目名称"
            rules={[{ required: true, message: '请输入项目名称' }]}
          >
            <Input placeholder="输入项目名称" />
          </Form.Item>

          <Form.Item
            name="description"
            label="项目描述"
          >
            <Input.TextArea
              placeholder="输入项目描述（可选）"
              rows={4}
            />
          </Form.Item>

          <Form.Item
            name="owner"
            label="负责人"
          >
            <Input placeholder="输入负责人（可选）" />
          </Form.Item>


        </Form>
      </Modal>
    </div>
  );
}
