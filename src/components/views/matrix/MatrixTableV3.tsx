/**
 * 矩阵表格V3
 * 
 * 渲染Timeline × TimeNode矩阵
 * 
 * @version 3.0.0
 * @date 2026-02-11
 */

import React, { useMemo } from 'react';
import { Table, Tag, Tooltip, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  TeamOutlined,
  DashboardOutlined,
  ProgressOutlined,
  FlagOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { 
  MatrixDataV3, 
  TimeNode, 
  getCell 
} from '@/utils/matrix-v3';
import { getHeatmapColor, getTextColor } from '@/utils/matrix-v3/heatmap';
import { EnhancedTooltip } from '@/components/common/EnhancedTooltip';
import type { TooltipContent } from '@/components/common/EnhancedTooltip';

import { MilestoneCellContent } from './MilestoneCellContent';
import { GatewayCellContent } from './GatewayCellContent';

interface MatrixTableV3Props {
  matrixData: MatrixDataV3;
  onCellClick?: (timelineId: string, timeNodeId: string) => void;
}

/**
 * 渲染时间节点标签
 */
const TimeNodeLabel: React.FC<{ node: TimeNode }> = ({ node }) => {
  const color = node.type === 'milestone' ? 'blue' : 'orange';
  const icon = node.type === 'milestone' ? '🎯' : '🚪';
  
  return (
    <Tooltip title={`${node.type === 'milestone' ? '里程碑' : '门禁'} - ${node.date.toLocaleDateString('zh-CN')}`}>
      <Space orientation="vertical" size={0} style={{ textAlign: 'center', width: '100%' }}>
        <div style={{ fontSize: '16px' }}>{icon}</div>
        <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{node.label}</div>
        <Tag color={color} style={{ margin: 0, fontSize: '10px' }}>
          {node.date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
        </Tag>
      </Space>
    </Tooltip>
  );
};



/**
 * 生成单元格Tooltip内容
 */
const generateTooltipContent = (
  cell: any,
  timeNodeType: 'milestone' | 'gateway',
  timelineName: string,
  timeNodeName: string
): TooltipContent => {
  if (timeNodeType === 'milestone' && cell.milestoneContent) {
    const content = cell.milestoneContent;
    return {
      summary: content.objectiveSummary || '完成本阶段里程碑目标',
      stats: [
        {
          label: 'SSTS需求数',
          value: content.sstsCount,
          icon: <FileTextOutlined />,
        },
        {
          label: '交付版本',
          value: content.deliverableVersion || '待定',
          icon: <FlagOutlined />,
        },
        {
          label: '交付物数量',
          value: content.deliverableCount,
          icon: <FileTextOutlined />,
        },
      ],
      items: content.sstsList.slice(0, 3).map((ssts: string) => ({
        label: ssts,
        value: '待评审',
        status: 'default' as const,
      })),
      extra: content.sstsList.length > 3 ? (
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>
          还有 {content.sstsList.length - 3} 个需求...
        </div>
      ) : undefined,
    };
  } else if (timeNodeType === 'gateway' && cell.gatewayContent) {
    const content = cell.gatewayContent;
    const statusLabels = {
      pending: '待决策',
      'in-review': '审核中',
      approved: '已通过',
      rejected: '未通过',
    };
    
    return {
      summary: `${content.gatewayType}质量门禁`,
      stats: [
        {
          label: '检查项总数',
          value: content.checkItemCount,
          icon: <FileTextOutlined />,
        },
        {
          label: '已通过',
          value: content.passedCount,
          icon: <TeamOutlined />,
        },
        {
          label: '完成率',
          value: `${Math.round(content.completionRate * 100)}%`,
          icon: <ProgressOutlined />,
        },
      ],
      items: [
        {
          label: '整体状态',
          value: statusLabels[content.overallStatus] || content.overallStatus,
          status: content.overallStatus === 'approved' ? 'success' : 'warning',
        },
        {
          label: '已通过',
          value: `${content.passedCount}项`,
          status: 'success',
        },
        content.failedCount > 0 ? {
          label: '未通过',
          value: `${content.failedCount}项`,
          status: 'error',
        } : null,
        content.pendingCount > 0 ? {
          label: '待完成',
          value: `${content.pendingCount}项`,
          status: 'default',
        } : null,
      ].filter(Boolean) as any,
    };
  }
  
  // 默认Tooltip
  return {
    summary: '暂无详细信息',
    stats: [
      {
        label: '任务数',
        value: cell.lines.length,
        icon: <FileTextOutlined />,
      },
    ],
  };
};

/**
 * 渲染单元格内容 - 根据时间节点类型差异化显示
 */
const CellContent: React.FC<{
  timelineId: string;
  timeNodeId: string;
  matrixData: MatrixDataV3;
  timeNodeType: 'milestone' | 'gateway';
  timelineName: string;
  timeNodeName: string;
  onClick?: () => void;
}> = ({ timelineId, timeNodeId, matrixData, timeNodeType, timelineName, timeNodeName, onClick }) => {
  const cell = getCell(matrixData, timelineId, timeNodeId);

  if (!cell || cell.lines.length === 0) {
    return (
      <div
        style={{
          padding: '8px',
          textAlign: 'center',
          color: '#d1d5db',
          backgroundColor: '#f9fafb',
          minHeight: '90px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
        onClick={onClick}
      >
        -
      </div>
    );
  }

  const bgColor = getHeatmapColor(cell);
  const textColor = getTextColor(bgColor);
  
  // 生成Tooltip内容
  const tooltipContent = generateTooltipContent(cell, timeNodeType, timelineName, timeNodeName);

  return (
    <EnhancedTooltip
      title={`${timelineName} × ${timeNodeName}`}
      content={tooltipContent}
      placement="top"
    >
      <div
        style={{
          padding: '6px',
          backgroundColor: bgColor,
          color: textColor,
          minHeight: '90px',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onClick={onClick}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {timeNodeType === 'milestone' ? (
          <MilestoneCellContent content={cell.milestoneContent} compact />
        ) : (
          <GatewayCellContent content={cell.gatewayContent} compact />
        )}
      </div>
    </EnhancedTooltip>
  );
};

/**
 * 矩阵表格V3
 */
const MatrixTableV3: React.FC<MatrixTableV3Props> = ({ matrixData, onCellClick }) => {
  // 构建表格列
  const columns = useMemo<ColumnsType<any>>(() => {
    const cols: ColumnsType<any> = [
      {
        title: '产品线',
        dataIndex: 'name',
        key: 'name',
        fixed: 'left',
        width: 180,
        render: (name: string, record: any) => (
          <div style={{ fontWeight: 'bold', padding: '8px 0' }}>
            <div>{name}</div>
            {record.owner && (
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                负责人: {record.owner}
              </div>
            )}
          </div>
        ),
      },
    ];

    // 为每个时间节点创建一列
    matrixData.timeNodes.forEach(node => {
      cols.push({
        title: <TimeNodeLabel node={node} />,
        key: node.id,
        width: 120,
        align: 'center',
        render: (_: any, record: any) => (
          <CellContent
            timelineId={record.id}
            timeNodeId={node.id}
            matrixData={matrixData}
            timeNodeType={node.type}
            timelineName={record.name}
            timeNodeName={node.label}
            onClick={() => onCellClick?.(record.id, node.id)}
          />
        ),
      });
    });

    return cols;
  }, [matrixData, onCellClick]);

  // 构建表格数据
  const dataSource = useMemo(() => {
    return matrixData.timelines.map(timeline => ({
      key: timeline.id,
      id: timeline.id,
      name: timeline.name,
      owner: timeline.owner,
      description: timeline.description,
    }));
  }, [matrixData.timelines]);

  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      pagination={false}
      scroll={{ x: 'max-content' }}
      bordered
      size="small"
      style={{
        '--ant-table-border-color': '#e5e7eb',
      } as any}
    />
  );
};

export default MatrixTableV3;
