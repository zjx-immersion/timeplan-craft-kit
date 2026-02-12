/**
 * 门禁详情对话框
 * 
 * 显示门禁的完整详细信息
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
  Progress,
  Timeline,
  Alert,
} from 'antd';
import {
  SafetyOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  FileProtectOutlined,
  ExportOutlined,
  EyeOutlined,
  UserOutlined,
  CommentOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import type { GatewayContent } from '@/utils/matrix-v3';

const { Title, Text } = Typography;

interface GatewayDetailDialogProps {
  open: boolean;
  onClose: () => void;
  content?: GatewayContent;
  timelineName: string;
  timeNodeName: string;
  date?: Date;
  onViewInGantt?: () => void;
}

/**
 * 获取状态配置
 */
function getStatusConfig(status: string) {
  switch (status) {
    case '已通过':
    case 'approved':
    case 'passed':
      return { color: '#52c41a', bg: '#f6ffed', text: '已通过', icon: <CheckCircleOutlined /> };
    case '未通过':
    case 'rejected':
    case 'failed':
      return { color: '#ff4d4f', bg: '#fff1f0', text: '未通过', icon: <CloseCircleOutlined /> };
    case '审核中':
    case 'in-review':
      return { color: '#faad14', bg: '#fffbe6', text: '审核中', icon: <ClockCircleOutlined /> };
    default:
      return { color: '#bfbfbf', bg: '#f5f5f5', text: '待决策', icon: <ClockCircleOutlined /> };
  }
}

/**
 * 获取检查项状态配置
 */
function getCheckItemStatusConfig(status: string) {
  switch (status) {
    case 'passed':
    case '已通过':
      return { color: '#52c41a', text: '已通过', icon: <CheckCircleOutlined style={{ color: '#52c41a' }} /> };
    case 'failed':
    case '未通过':
      return { color: '#ff4d4f', text: '未通过', icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} /> };
    case 'in-progress':
    case '进行中':
      return { color: '#faad14', text: '进行中', icon: <ClockCircleOutlined style={{ color: '#faad14' }} /> };
    default:
      return { color: '#bfbfbf', text: '待开始', icon: <ClockCircleOutlined style={{ color: '#bfbfbf' }} /> };
  }
}

/**
 * 获取门禁类型中文
 */
function getGatewayTypeText(type: string): string {
  const typeMap: Record<string, string> = {
    'technical': '技术门禁',
    'quality': '质量门禁',
    'process': '流程门禁',
    'milestone': '里程碑门禁',
    'code-review': '代码审查',
    'test': '测试门禁',
    'document': '文档门禁',
  };
  return typeMap[type] || type;
}

/**
 * 门禁详情对话框
 */
export const GatewayDetailDialog: React.FC<GatewayDetailDialogProps> = ({
  open,
  onClose,
  content,
  timelineName,
  timeNodeName,
  date,
  onViewInGantt,
}) => {
  if (!content) return null;

  const statusConfig = getStatusConfig(content.overallStatus);
  const percentage = Math.round(content.completionRate * 100);

  // 模拟检查项数据
  const mockCheckItems = [
    {
      id: '1',
      name: '代码审查完成',
      category: '代码质量',
      status: 'passed',
      owner: '张三',
      date: '2026-03-10',
      required: true,
    },
    {
      id: '2',
      name: '静态分析无高危问题',
      category: '代码质量',
      status: 'passed',
      owner: '李四',
      date: '2026-03-11',
      required: true,
    },
    {
      id: '3',
      name: '代码覆盖率>80%',
      category: '代码质量',
      status: 'in-progress',
      owner: '王五',
      date: null,
      required: true,
    },
    {
      id: '4',
      name: '单元测试通过',
      category: '测试验证',
      status: 'passed',
      owner: '张三',
      date: '2026-03-12',
      required: true,
    },
    {
      id: '5',
      name: '集成测试通过',
      category: '测试验证',
      status: 'passed',
      owner: '李四',
      date: '2026-03-13',
      required: true,
    },
    {
      id: '6',
      name: '性能测试达标',
      category: '测试验证',
      status: content.failedCount > 0 ? 'failed' : 'pending',
      owner: '王五',
      date: content.failedCount > 0 ? '2026-03-14' : null,
      required: true,
      comment: content.failedCount > 0 ? '响应时间超标，需优化' : undefined,
    },
  ].slice(0, content.checkItemCount);

  // 按类别分组
  const categories = Array.from(new Set(mockCheckItems.map((item) => item.category)));

  return (
    <Modal
      data-testid="gateway-detail-dialog"
      title={
        <Space>
          <SafetyOutlined style={{ color: statusConfig.color }} />
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
      {/* 基本信息卡片 */}
      <Card size="small" style={{ marginBottom: '16px', background: statusConfig.bg }}>
        <Row gutter={24}>
          <Col span={6}>
            <Statistic
              title="门禁类型"
              value={getGatewayTypeText(content.gatewayType)}
              valueStyle={{ fontSize: '14px' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="整体状态"
              value={statusConfig.text}
              valueStyle={{ color: statusConfig.color }}
              prefix={statusConfig.icon}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="检查项完成率"
              value={percentage}
              suffix="%"
              valueStyle={{ color: statusConfig.color }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="通过/总数"
              value={`${content.passedCount}/${content.checkItemCount}`}
              valueStyle={{ color: statusConfig.color }}
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

      {/* 风险提示 */}
      {content.failedCount > 0 && (
        <Alert
          type="error"
          showIcon
          icon={<WarningOutlined />}
          message="存在未通过的检查项"
          description={`有 ${content.failedCount} 个检查项未通过，可能影响后续里程碑的达成。请尽快处理。`}
          style={{ marginBottom: '16px' }}
        />
      )}

      {/* 进度概览 */}
      <Card data-testid="progress-overview" size="small" style={{ marginBottom: '16px' }}>
        <div style={{ marginBottom: '12px' }}>
          <Text strong>检查项完成进度</Text>
        </div>
        <Progress
          percent={percentage}
          strokeColor={statusConfig.color}
          format={() => `${content.passedCount}/${content.checkItemCount}`}
          style={{ marginBottom: '16px' }}
        />
        <Row gutter={16}>
          <Col span={8}>
            <div style={{ textAlign: 'center', padding: '8px', background: '#f6ffed', borderRadius: '4px' }}>
              <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
              <div style={{ marginTop: '4px', color: '#52c41a', fontWeight: 'bold' }}>{content.passedCount}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>已通过</div>
            </div>
          </Col>
          {content.failedCount > 0 && (
            <Col span={8}>
              <div style={{ textAlign: 'center', padding: '8px', background: '#fff1f0', borderRadius: '4px' }}>
                <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: '20px' }} />
                <div style={{ marginTop: '4px', color: '#ff4d4f', fontWeight: 'bold' }}>{content.failedCount}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>未通过</div>
              </div>
            </Col>
          )}
          {content.pendingCount > 0 && (
            <Col span={8}>
              <div style={{ textAlign: 'center', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
                <ClockCircleOutlined style={{ color: '#bfbfbf', fontSize: '20px' }} />
                <div style={{ marginTop: '4px', color: '#666', fontWeight: 'bold' }}>{content.pendingCount}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>待完成</div>
              </div>
            </Col>
          )}
        </Row>
      </Card>

      {/* 检查项列表 - 按类别分组 */}
      <Card
        data-testid="checkitems-list"
        size="small"
        title={
          <Space>
            <FileProtectOutlined />
            检查项列表 ({content.checkItemCount}项)
          </Space>
        }
      >
        {categories.map((category) => (
          <div key={category} style={{ marginBottom: '16px' }}>
            <div
              style={{
                background: '#f5f5f5',
                padding: '8px 12px',
                fontWeight: 'bold',
                marginBottom: '8px',
                borderRadius: '4px',
              }}
            >
              {category} (
              {mockCheckItems.filter((item) => item.category === category).length}项)
            </div>
            <List
              size="small"
              dataSource={mockCheckItems.filter((item) => item.category === category)}
              renderItem={(item) => {
                const itemStatus = getCheckItemStatusConfig(item.status);
                return (
                  <List.Item
                    style={{
                      background: item.status === 'failed' ? '#fff1f0' : 'transparent',
                      borderRadius: '4px',
                      marginBottom: '4px',
                    }}
                  >
                    <List.Item.Meta
                      avatar={itemStatus.icon}
                      title={
                        <Space>
                          {item.name}
                          {item.required && <Tag color="red" style={{ fontSize: '10px' }}>必须</Tag>}
                        </Space>
                      }
                      description={
                        item.comment && (
                          <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>
                            <CommentOutlined style={{ marginRight: '4px' }} />
                            {item.comment}
                          </div>
                        )
                      }
                    />
                    <div style={{ textAlign: 'right' }}>
                      <div>
                        <Tag color={itemStatus.color} style={{ fontSize: '11px' }}>
                          {itemStatus.text}
                        </Tag>
                      </div>
                      <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                        <UserOutlined style={{ marginRight: '4px' }} />
                        {item.owner}
                        {item.date && (
                          <span style={{ marginLeft: '8px' }}>
                            <ClockCircleOutlined style={{ marginRight: '4px' }} />
                            {item.date}
                          </span>
                        )}
                      </div>
                    </div>
                  </List.Item>
                );
              }}
            />
          </div>
        ))}
      </Card>
    </Modal>
  );
};

export default GatewayDetailDialog;
