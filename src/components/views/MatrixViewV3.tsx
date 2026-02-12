/**
 * 矩阵视图V3 - 主组件
 * 
 * 架构：Timeline(产品) × TimeNode(里程碑/门禁)
 * 
 * @version 3.0.0
 * @date 2026-02-11
 */

import React, { useMemo, useState } from 'react';
import { Card, Space, Typography, Tag, Statistic, Alert } from 'antd';
import { CalendarOutlined, ProjectOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { TimePlan } from '@/types/timeplanSchema';
import { 
  calculateMatrixV3, 
  MatrixDataV3,
  groupTimeNodesByQuarter 
} from '@/utils/matrix-v3';
import MatrixTableV3 from './matrix/MatrixTableV3';
import MatrixLegendV3 from './matrix/MatrixLegendV3';
import MilestoneDetailDialog from './matrix/MilestoneDetailDialog';
import GatewayDetailDialog from './matrix/GatewayDetailDialog';

const { Title, Text } = Typography;

interface MatrixViewV3Props {
  data: TimePlan;
}

/**
 * 矩阵视图V3
 */
const MatrixViewV3: React.FC<MatrixViewV3Props> = ({ data }) => {
  const [selectedCell, setSelectedCell] = useState<{
    timelineId: string;
    timeNodeId: string;
    timeNodeType: 'milestone' | 'gateway';
  } | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // 计算矩阵数据
  const matrixData = useMemo<MatrixDataV3>(() => {
    const result = calculateMatrixV3(data);
    
    // 开发环境：打印统计信息
    if (process.env.NODE_ENV === 'development') {
      console.log(`[MatrixViewV3] 计划: ${data.name || data.id}`);
      console.log(`[MatrixViewV3] Timeline数: ${result.timelines.length}`);
      console.log(`[MatrixViewV3] 时间节点数: ${result.timeNodes.length}`);
      console.log(`[MatrixViewV3] 总工作量: ${result.totalEffort.toFixed(1)} 人/天`);
      console.log(`[MatrixViewV3] 日期范围: ${result.dateRange.start.toLocaleDateString()} - ${result.dateRange.end.toLocaleDateString()}`);
      
      // 打印Timeline分布
      const timelineStats = result.timelines.map(tl => {
        const cells = Array.from(result.cells.values()).filter(c => c.timelineId === tl.id);
        const effort = cells.reduce((sum, c) => sum + c.totalEffort, 0);
        return { name: tl.name, effort };
      });
      console.log('[MatrixViewV3] Timeline分布:', timelineStats);
      
      // 打印时间节点类型分布
      const nodeTypeStats = result.timeNodes.reduce((acc, node) => {
        acc[node.type] = (acc[node.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      console.log('[MatrixViewV3] 时间节点类型分布:', nodeTypeStats);
    }

    return result;
  }, [data]);

  // 时间节点分组（按季度）
  const timeNodeGroups = useMemo(() => {
    return groupTimeNodesByQuarter(matrixData.timeNodes);
  }, [matrixData.timeNodes]);

  // 格式化日期范围
  const dateRangeText = `${matrixData.dateRange.start.toLocaleDateString('zh-CN')} - ${matrixData.dateRange.end.toLocaleDateString('zh-CN')}`;

  return (
    <div style={{ padding: '24px' }}>
      {/* 标题和统计信息 */}
      <Card variant="borderless" style={{ marginBottom: '16px' }}>
        <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={3} style={{ margin: 0 }}>
              <ProjectOutlined style={{ marginRight: '8px' }} />
              {data.name || '矩阵视图'}
            </Title>
            <Space size="large">
              <Statistic 
                title="产品线" 
                value={matrixData.timelines.length} 
                suffix="个"
                styles={{ content: { fontSize: '20px' } }}
              />
              <Statistic 
                title="时间节点" 
                value={matrixData.timeNodes.length} 
                suffix="个"
                styles={{ content: { fontSize: '20px' } }}
              />
              <Statistic 
                title="总工作量" 
                value={matrixData.totalEffort.toFixed(1)} 
                suffix="人/天"
                styles={{ content: { fontSize: '20px', color: '#1890ff' } }}
              />
            </Space>
          </div>

          <div>
            <Space size="middle">
              <Tag icon={<CalendarOutlined />} color="blue">
                {dateRangeText}
              </Tag>
              <Tag icon={<ClockCircleOutlined />} color="green">
                {timeNodeGroups.length} 个季度
              </Tag>
            </Space>
          </div>

          {data.description && (
            <Text type="secondary">{data.description}</Text>
          )}
        </Space>
      </Card>

      {/* 提示信息 */}
      <Alert
        type="info"
        title="矩阵说明"
        description="矩阵展示每个产品线（Timeline）在各个时间节点（里程碑/门禁）的任务分布和工作量情况。颜色越深表示负载越高。"
        style={{ marginBottom: '16px' }}
        showIcon
      />

      {/* 矩阵表格 */}
      <Card variant="borderless" style={{ marginBottom: '16px' }}>
        <MatrixTableV3 
          matrixData={matrixData}
          onCellClick={(timelineId, timeNodeId) => {
            const cell = matrixData.cells.get(`${timelineId}-${timeNodeId}`);
            if (cell) {
              setSelectedCell({ 
                timelineId, 
                timeNodeId, 
                timeNodeType: cell.timeNodeType 
              });
              setDetailDialogOpen(true);
            }
          }}
        />
      </Card>

      {/* 里程碑详情对话框 */}
      {selectedCell?.timeNodeType === 'milestone' && (
        <MilestoneDetailDialog
          open={detailDialogOpen}
          onClose={() => setDetailDialogOpen(false)}
          content={matrixData.cells.get(`${selectedCell.timelineId}-${selectedCell.timeNodeId}`)?.milestoneContent}
          timelineName={matrixData.timelines.find(t => t.id === selectedCell.timelineId)?.name || ''}
          timeNodeName={matrixData.timeNodes.find(n => n.id === selectedCell.timeNodeId)?.label || ''}
          date={matrixData.timeNodes.find(n => n.id === selectedCell.timeNodeId)?.date}
          onViewInGantt={() => {
            console.log('View milestone in gantt:', selectedCell.timeNodeId);
          }}
        />
      )}

      {/* 门禁详情对话框 */}
      {selectedCell?.timeNodeType === 'gateway' && (
        <GatewayDetailDialog
          open={detailDialogOpen}
          onClose={() => setDetailDialogOpen(false)}
          content={matrixData.cells.get(`${selectedCell.timelineId}-${selectedCell.timeNodeId}`)?.gatewayContent}
          timelineName={matrixData.timelines.find(t => t.id === selectedCell.timelineId)?.name || ''}
          timeNodeName={matrixData.timeNodes.find(n => n.id === selectedCell.timeNodeId)?.label || ''}
          date={matrixData.timeNodes.find(n => n.id === selectedCell.timeNodeId)?.date}
          onViewInGantt={() => {
            console.log('View gateway in gantt:', selectedCell.timeNodeId);
          }}
        />
      )}

      {/* 热力图图例 */}
      <Card variant="borderless">
        <MatrixLegendV3 />
      </Card>
    </div>
  );
};

export default MatrixViewV3;
