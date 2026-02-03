/**
 * TimePlanList - 项目列表页
 * 
 * 1:1 还原原项目的 TimePlanList 功能
 * 
 * 功能:
 * - 显示所有项目列表
 * - 创建新项目
 * - 编辑/删除项目
 * - 搜索和排序
 * 
 * @version 1.0.0
 * @status 🚧 开发中
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  Empty,
  Input,
  Space,
  Typography,
  Dropdown,
  Modal,
  Form,
  message,
  Row,
  Col,
  Tag,
  theme,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  FolderOpenOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { useTimePlanStore } from '@/stores/timePlanStore';
import { TimePlan } from '@/types/timeplanSchema';
import { format } from 'date-fns';

const { Title, Text, Paragraph } = Typography;

export default function TimePlanList() {
  const navigate = useNavigate();
  const { token } = theme.useToken();
  
  // Store
  const { plans, addPlan, updatePlan, deletePlan } = useTimePlanStore();
  
  // 状态
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<TimePlan | null>(null);
  const [form] = Form.useForm();
  
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
        return dateB.getTime() - dateA.getTime();
      });
  }, [plans, searchQuery]);
  
  // 创建项目
  const handleCreate = async (values: any) => {
    const newPlan: TimePlan = {
      id: `tp-${Date.now()}`,
      title: values.title,
      description: values.description,
      owner: values.owner || '未指定',
      schemaId: 'default-schema',
      timelines: [],
      lines: [],
      relations: [],
      createdAt: new Date(),
      lastAccessTime: new Date(),
      tags: [],
    };
    
    addPlan(newPlan);
    message.success('项目创建成功！');
    setIsCreateModalOpen(false);
    form.resetFields();
    
    // 导航到新项目
    navigate(`/${newPlan.id}`);
  };
  
  // 编辑项目
  const handleEdit = (plan: TimePlan) => {
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
    
    updatePlan(editingPlan.id, {
      title: values.title,
      description: values.description,
      owner: values.owner,
    });
    
    message.success('项目更新成功！');
    setIsCreateModalOpen(false);
    setEditingPlan(null);
    form.resetFields();
  };
  
  // 删除项目
  const handleDelete = (plan: TimePlan) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除项目"${plan.title}"吗？此操作不可恢复。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        deletePlan(plan.id);
        message.success('项目已删除');
      },
    });
  };
  
  // 复制项目
  const handleDuplicate = (plan: TimePlan) => {
    const newPlan: TimePlan = {
      ...plan,
      id: `tp-${Date.now()}`,
      title: `${plan.title} (副本)`,
      createdAt: new Date(),
      lastAccessTime: new Date(),
    };
    
    addPlan(newPlan);
    message.success('项目已复制');
  };
  
  // 打开项目
  const handleOpen = (planId: string) => {
    updatePlan(planId, { lastAccessTime: new Date() });
    navigate(`/${planId}`);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: token.colorBgLayout,
      padding: `${token.paddingLG}px ${token.paddingXL}px`,
    }}>
      {/* 页头 */}
      <div style={{ marginBottom: token.marginXL }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <Title level={2} style={{ margin: 0 }}>
                TimePlan Craft Kit
              </Title>
              <Text type="secondary">
                时间规划和甘特图工具包
              </Text>
            </div>
            
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={() => {
                setEditingPlan(null);
                form.resetFields();
                setIsCreateModalOpen(true);
              }}
            >
              新建项目
            </Button>
          </div>
          
          {/* 搜索栏 */}
          <Input
            size="large"
            placeholder="搜索项目..."
            prefix={<SearchOutlined />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ maxWidth: 600 }}
            allowClear
          />
        </Space>
      </div>
      
      {/* 项目列表 */}
      {filteredPlans.length === 0 ? (
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              searchQuery
                ? '没有找到匹配的项目'
                : '还没有项目，点击"新建项目"开始'
            }
          >
            {!searchQuery && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsCreateModalOpen(true)}
              >
                创建第一个项目
              </Button>
            )}
          </Empty>
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {filteredPlans.map((plan) => (
            <Col key={plan.id} xs={24} sm={12} lg={8} xl={6}>
              <Card
                hoverable
                onClick={() => handleOpen(plan.id)}
                actions={[
                  <EditOutlined
                    key="edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(plan);
                    }}
                  />,
                  <CopyOutlined
                    key="copy"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDuplicate(plan);
                    }}
                  />,
                  <DeleteOutlined
                    key="delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(plan);
                    }}
                  />,
                ]}
              >
                <Card.Meta
                  avatar={<FolderOpenOutlined style={{ fontSize: 24 }} />}
                  title={plan.title}
                  description={
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      {plan.description && (
                        <Paragraph
                          ellipsis={{ rows: 2 }}
                          style={{ margin: 0, fontSize: 12 }}
                        >
                          {plan.description}
                        </Paragraph>
                      )}
                      
                      <div>
                        <Tag color="blue">{plan.timelines.length} 时间线</Tag>
                        <Tag color="green">{plan.lines.length} 任务</Tag>
                      </div>
                      
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        最后访问:{' '}
                        {plan.lastAccessTime
                          ? format(new Date(plan.lastAccessTime), 'yyyy-MM-dd HH:mm')
                          : '未访问'}
                      </Text>
                    </Space>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}
      
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
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={editingPlan ? handleSaveEdit : handleCreate}
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
