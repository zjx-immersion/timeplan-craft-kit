/**
 * 里程碑详情对话框
 * 
 * 显示里程碑的完整详细信息
 * 
 * @version 3.2.0
 * @date 2026-02-12
 */

import React from 'react';
import {
  Modal,
  Card,
  Statistic,
  Row,
  Col,
  List,
  Tag,
  Space,
  Typography,
  Button,
  Divider,
  Timeline,
} from 'antd';
import {
  FlagOutlined,
  FileTextOutlined,
  CarOutlined,
  AimOutlined,
  TagOutlined,
  ExportOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import type { MilestoneContent } from '@/utils/matrix-v3';

const { Title, Text, Paragraph } = Typography;

interface MilestoneDetailDialogProps {
  open: boolean;
  onClose: () => void;
  content?: MilestoneContent;
  timelineName: string;
  timeNodeName: string;
  date?: Date;
  onViewInGantt?: () => void;
}

/**
 * 获取SSTS状态图标
 */
function getSstsStatusIcon(status: string) {
  switch (status) {
    case 'approved':
    case '已通过':
      return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
    case 'in-review':
    case '评审中':
      return <ClockCircleOutlined style={{ color: '#faad14' }} />;
    case 'rejected':
    case '已拒绝':
      return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
    default:
      return <ClockCircleOutlined style={{ color: '#bfbfbf' }} />;
  }
}

/**
 * 获取SSTS状态颜色
 */
function getSstsStatusColor(status: string): string {
  switch (status) {
    case 'approved':
    case '已通过':
      return 'success';
    case 'in-review':
    case '评审中':
      return 'warning';
    case 'rejected':
    case '已拒绝':
      return 'error';
    default:
      return 'default';
  }
}

/**
 * 获取SSTS状态文本
 */
function getSstsStatusText(status: string): string {
  switch (status) {
    case 'approved':
    case '已通过':
      return '已通过';
    case 'in-review':
    case '评审中':
      return '评审中';
    case 'rejected':
    case '已拒绝':
      return '已拒绝';
    default:
      return '待开始';
  }
}

/**
 * 里程碑详情对话框
 */
export const MilestoneDetailDialog: React.FC<MilestoneDetailDialogProps> = ({
  open,
  onClose,
  content,
  timelineName,
  timeNodeName,
  date,
  onViewInGantt,
}) => {
  if (!content) return null;

  // 模拟SSTS数据（实际应从API获取）
  const mockSstsList = content.sstsList.map((name, index) => ({
    id: `SSTS-${String(index + 1).padStart(3, '0')}`,
    name,
    status: index < 2 ? 'approved' : index === 2 ? 'in-review' : 'pending',
    owner: ['张三', '李四', '王五', '赵六'][index % 4],
  }));

  // 模拟交付物数据
  const mockDeliverables = content.vehicleNodes.flatMap((node, nodeIndex) => [
    {
      node,
      name: '需求规格书',
      type: 'document',
      status: nodeIndex === 0 ? 'completed' : 'in-progress',
    },
    {
      node,
      name: '架构设计文档',
      type: 'document',
      status: nodeIndex === 0 ? 'completed' : 'pending',
    },
    {
      node,
      name: '测试用例',
      type: 'document',
      status: 'pending',
    },
  ]);

  return (
    <Modal
      data-testid="milestone-detail-dialog"
      title={
        <Space>
          <FlagOutlined style={{ color: '#1890ff' }} />
          <span>{timeNodeName}</span>
          <span style={{ color: '#999' }}>-</span>
          <span>{timelineName}</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="export" icon={<ExportOutlined />}>
          导出报告
        </Button>,
        <Button key="gantt" icon={<EyeOutlined />} onClick={onViewInGantt}>
          在甘特图查看
        </Button>,
        <Button key="close" type="primary" onClick={onClose}>
          关闭
        </Button>,
      ]}
      width={900}
      styles={{ body: { maxHeight: '70vh', overflow: 'auto', padding: '20px' } }}
    >
      {/* 基本信息 */}
      <Card size="small" style={{ marginBottom: '16px' }}>
        <Row gutter={24}>
          <Col span={8}>
            <Statistic
              title="SSTS需求数量"
              value={content.sstsCount}
              prefix={<FileTextOutlined />}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="交付物数量"
              value={content.deliverableCount}
              prefix={<CarOutlined />}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="涉及车型节点"
              value={content.vehicleNodes.length}
              prefix={<TagOutlined />}
              suffix="个"
            />
          </Col>
        </Row>
        {date && (
          <div style={{ marginTop: '12px', color: '#666' }}>
            <ClockCircleOutlined style={{ marginRight: '8px' }} />
            计划日期: {date.toLocaleDateString('zh-CN')}
          </div>
        )}
      </Card>

      {/* 交付版本 */}
      {content.deliverableVersion && (
        <Card size="small" style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <TagOutlined style={{ fontSize: '18px', color: '#1890ff', marginRight: '12px' }} />
            <div>
              <div style={{ fontSize: '12px', color: '#999' }}>交付版本</div>
              <Tag color="blue" style={{ fontSize: '14px', marginTop: '4px' }}>
                {content.deliverableVersion}
              </Tag>
            </div>
          </div>
        </Card>
      )}

      {/* 目标摘要 */}
      <Card size="small" title={<><AimOutlined /> 目标</>} style={{ marginBottom: '16px' }}>
        <Paragraph>{content.objectiveSummary}</Paragraph>
      </Card>

      <Row gutter={16}>
        {/* SSTS需求列表 */}
        <Col span={12}>
          <Card
            size="small"
            title={
              <Space>
                <FileTextOutlined />
                SSTS需求列表 ({content.sstsCount}个)
              </Space>
            }
            style={{ marginBottom: '16px' }}
          >
            <List
              data-testid="ssts-list"
              size="small"
              dataSource={mockSstsList}
              renderItem={(ssts) => (
                <List.Item
                  actions={[
                    <Tag color={getSstsStatusColor(ssts.status)} key="status">
                      {getSstsStatusText(ssts.status)}
                    </Tag>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={getSstsStatusIcon(ssts.status)}
                    title={ssts.id}
                    description={ssts.name}
                  />
                  <div style={{ fontSize: '12px', color: '#999' }}>{ssts.owner}</div>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* 车型节点交付物 */}
        <Col span={12}>
          <Card
            size="small"
            title={
              <Space>
                <CarOutlined />
                车型节点交付物
              </Space>
            }
            style={{ marginBottom: '16px' }}
          >
            <Timeline data-testid="deliverables-timeline" mode="left">
              {content.vehicleNodes.map((node, index) => (
                <Timeline.Item key={node}>
                  <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                    {node}节点
                  </div>
                  <Space direction="vertical" size={4}>
                    {mockDeliverables
                      .filter((d) => d.node === node)
                      .map((deliverable, dIndex) => (
                        <div key={dIndex} style={{ fontSize: '13px' }}>
                          {deliverable.status === 'completed' ? (
                            <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                          ) : deliverable.status === 'in-progress' ? (
                            <ClockCircleOutlined style={{ color: '#faad14', marginRight: '8px' }} />
                          ) : (
                            <ClockCircleOutlined style={{ color: '#bfbfbf', marginRight: '8px' }} />
                          )}
                          {deliverable.name}
                        </div>
                      ))}
                  </Space>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Col>
      </Row>
    </Modal>
  );
};

export default MilestoneDetailDialog;
