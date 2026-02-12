/**
 * 单元格详情对话框
 * 
 * 显示矩阵单元格的详细任务列表
 * 
 * @version 3.1.0
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
  Progress,
  Space,
  Typography,
  Button,
  Tooltip,
} from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  PlayCircleOutlined,
  CalendarOutlined,
  UserOutlined,
  ExportOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import type { MatrixCellV3, PriorityType } from '@/utils/matrix-v3';

const { Title, Text } = Typography;

interface CellDetailDialogProps {
  open: boolean;
  onClose: () => void;
  cell: MatrixCellV3 | null;
  timelineName: string;
  timeNodeName: string;
  onViewInGantt?: (lineId: string) => void;
}

/**
 * 优先级配置
 */
const PRIORITY_CONFIG: Record<PriorityType, { color: string; label: string; bg: string }> = {
  P0: { color: '#ff4d4f', label: '最高', bg: '#fff1f0' },
  P1: { color: '#fa8c16', label: '高', bg: '#fff7e6' },
  P2: { color: '#1890ff', label: '中', bg: '#e6f7ff' },
  P3: { color: '#52c41a', label: '低', bg: '#f6ffed' },
};

/**
 * 从Line提取优先级
 */
function extractPriority(line: any): PriorityType {
  const priority = line.attributes?.priority;
  if (priority === 'P0' || priority === 'P1' || priority === 'P2' || priority === 'P3') {
    return priority;
  }
  if (line.attributes?.importance === 'high') return 'P1';
  if (line.attributes?.importance === 'medium') return 'P2';
  return 'P3';
}

/**
 * 从Line提取进度
 */
function extractProgress(line: any): number {
  if (typeof line.attributes?.progress === 'number') {
    return Math.min(100, Math.max(0, line.attributes.progress));
  }
  // 根据状态推断
  const status = line.attributes?.status;
  if (status === '已完成' || status === '已通过') return 100;
  if (status === '进行中' || status === '开发中') return 50;
  return 0;
}

/**
 * 从Line提取负责人
 */
function extractOwner(line: any): string {
  return line.attributes?.owner || line.attributes?.assignee || '未分配';
}

/**
 * 格式化日期范围
 */
function formatDateRange(line: any): string {
  const start = line.startDate ? new Date(line.startDate).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }) : '?';
  const end = line.endDate ? new Date(line.endDate).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }) : '?';
  return `${start} ~ ${end}`;
}

/**
 * 计算平均进度
 */
function calculateAverageProgress(lines: any[]): number {
  if (lines.length === 0) return 0;
  const totalProgress = lines.reduce((sum, line) => sum + extractProgress(line), 0);
  return Math.round(totalProgress / lines.length);
}

/**
 * 单元格详情对话框
 */
export const CellDetailDialog: React.FC<CellDetailDialogProps> = ({
  open,
  onClose,
  cell,
  timelineName,
  timeNodeName,
  onViewInGantt,
}) => {
  if (!cell) return null;

  const averageProgress = calculateAverageProgress(cell.lines);
  
  // 计算负载状态
  const loadStatus = cell.loadRate >= 0.85 ? 'overload' : cell.loadRate >= 0.6 ? 'high' : cell.loadRate >= 0.3 ? 'normal' : 'low';
  const loadStatusText = {
    overload: { text: '超载', color: '#ff4d4f' },
    high: { text: '高负载', color: '#fa8c16' },
    normal: { text: '正常', color: '#52c41a' },
    low: { text: '低负载', color: '#1890ff' },
  }[loadStatus];

  return (
    <Modal
      title={
        <Space>
          <span>📊 {timelineName}</span>
          <span style={{ color: '#999' }}>-</span>
          <span>{timeNodeName}</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="export" icon={<ExportOutlined />}>
          导出Excel
        </Button>,
        <Button key="close" type="primary" onClick={onClose}>
          关闭
        </Button>,
      ]}
      width={800}
      styles={{ body: { maxHeight: '600px', overflow: 'auto' } }}
    >
      {/* 统计概览 */}
      <Card size="small" style={{ marginBottom: '16px' }}>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic
              title="总工作量"
              value={cell.totalEffort.toFixed(1)}
              suffix="人/天"
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="任务数"
              value={cell.lines.length}
              suffix="个"
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="平均进度"
              value={averageProgress}
              suffix="%"
              valueStyle={{ color: averageProgress >= 80 ? '#52c41a' : averageProgress >= 50 ? '#fa8c16' : '#ff4d4f' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="负载状态"
              value={loadStatusText.text}
              valueStyle={{ color: loadStatusText.color }}
              suffix={`(${(cell.loadRate * 100).toFixed(0)}%)`}
            />
          </Col>
        </Row>
      </Card>

      {/* 优先级分布 */}
      <Card 
        size="small" 
        title="优先级分布" 
        style={{ marginBottom: '16px' }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          {(['P0', 'P1', 'P2', 'P3'] as PriorityType[]).map(priority => {
            const count = cell.priorityDistribution[priority];
            const effort = cell.effortByPriority[priority];
            if (count === 0) return null;
            
            const config = PRIORITY_CONFIG[priority];
            const percentage = (count / cell.lines.length) * 100;
            
            return (
              <div key={priority}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <Space>
                    <Tag color={config.color} style={{ margin: 0 }}>
                      {priority} {config.label}
                    </Tag>
                    <Text>{count}个任务 ({effort.toFixed(1)}人天)</Text>
                  </Space>
                  <Text type="secondary">{percentage.toFixed(0)}%</Text>
                </div>
                <Progress 
                  percent={percentage} 
                  size="small" 
                  strokeColor={config.color}
                  showInfo={false}
                />
              </div>
            );
          })}
        </Space>
      </Card>

      {/* 任务列表 */}
      <Card 
        size="small" 
        title={`任务列表 (${cell.lines.length}个)`}
      >
        <List
          dataSource={cell.lines}
          renderItem={(line) => {
            const priority = extractPriority(line);
            const progress = extractProgress(line);
            const owner = extractOwner(line);
            const priorityConfig = PRIORITY_CONFIG[priority];
            
            return (
              <List.Item
                actions={[
                  <Tooltip title="在甘特图中查看" key="view">
                    <Button
                      type="text"
                      icon={<EyeOutlined />}
                      size="small"
                      onClick={() => onViewInGantt?.(line.id)}
                    />
                  </Tooltip>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Tag 
                        color={priorityConfig.color}
                        style={{ margin: 0 }}
                      >
                        {priority}
                      </Tag>
                      <Text strong>{line.label || line.title || '未命名任务'}</Text>
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size={0} style={{ marginTop: '4px' }}>
                      <Space split={<Text type="secondary">|</Text>}>
                        <Text type="secondary">
                          <UserOutlined style={{ marginRight: '4px' }} />
                          {owner}
                        </Text>
                        <Text type="secondary">
                          <CalendarOutlined style={{ marginRight: '4px' }} />
                          {formatDateRange(line)}
                        </Text>
                        <Text type="secondary">
                          <ClockCircleOutlined style={{ marginRight: '4px' }} />
                          {line.attributes?.effort || 1}人天
                        </Text>
                      </Space>
                      <div style={{ marginTop: '4px' }}>
                        <Progress 
                          percent={progress} 
                          size="small" 
                          style={{ width: '200px' }}
                          status={progress === 100 ? 'success' : 'active'}
                        />
                      </div>
                    </Space>
                  }
                />
              </List.Item>
            );
          }}
        />
      </Card>
    </Modal>
  );
};

export default CellDetailDialog;
