/**
 * 门禁单元格内容组件
 * 
 * 在矩阵单元格中显示门禁特定信息
 * 
 * @version 3.2.0
 * @date 2026-02-12
 */

import React from 'react';
import { Tag, Progress, Space } from 'antd';
import { 
  SafetyOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  ClockCircleOutlined,
  FileProtectOutlined
} from '@ant-design/icons';
import type { GatewayContent } from '@/utils/matrix-v3';

interface GatewayCellContentProps {
  content?: GatewayContent;
  compact?: boolean;
}

/**
 * 获取状态颜色和图标
 */
function getStatusInfo(status: string) {
  switch (status) {
    case '已通过':
    case 'approved':
    case 'passed':
      return { color: '#52c41a', icon: <CheckCircleOutlined />, text: '已通过' };
    case '未通过':
    case 'rejected':
    case 'failed':
      return { color: '#ff4d4f', icon: <CloseCircleOutlined />, text: '未通过' };
    case '审核中':
    case 'in-review':
      return { color: '#faad14', icon: <ClockCircleOutlined />, text: '审核中' };
    case '待决策':
    case 'pending':
    default:
      return { color: '#bfbfbf', icon: <ClockCircleOutlined />, text: '待决策' };
  }
}

/**
 * 获取门禁类型中文
 */
function getGatewayTypeText(type: string): string {
  const typeMap: Record<string, string> = {
    'technical': '技术',
    'quality': '质量',
    'process': '流程',
    'milestone': '里程碑',
    'code-review': '代码审查',
    'test': '测试',
    'document': '文档',
  };
  return typeMap[type] || type;
}

/**
 * 紧凑视图 - 在矩阵单元格中显示
 */
const CompactView: React.FC<{ content: GatewayContent }> = ({ content }) => {
  const statusInfo = getStatusInfo(content.overallStatus);
  const percentage = Math.round(content.completionRate * 100);
  
  return (
    <div data-testid="gateway-cell-content" style={{ textAlign: 'center' }}>
      {/* 图标和类型 */}
      <div data-testid="gateway-icon" style={{ marginBottom: '4px' }}>
        <SafetyOutlined style={{ fontSize: '16px', color: statusInfo.color }} />
      </div>
      
      {/* 门禁类型 */}
      <div data-testid="gateway-type" style={{ fontSize: '10px', color: '#666', marginBottom: '2px' }}>
        {getGatewayTypeText(content.gatewayType)}门禁
      </div>
      
      {/* 检查项进度 */}
      <div data-testid="checkitem-progress" style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '2px' }}>
        {content.passedCount}/{content.checkItemCount}通过
      </div>
      
      {/* 进度条 */}
      <div style={{ width: '60px', margin: '0 auto' }}>
        <Progress 
          percent={percentage} 
          size="small" 
          strokeColor={statusInfo.color}
          showInfo={false}
          style={{ margin: 0 }}
        />
      </div>
      
      {/* 状态标签 */}
      <div data-testid="gateway-status" style={{ marginTop: '2px' }}>
        <Tag 
          color={statusInfo.color} 
          style={{ fontSize: '9px', padding: '0 4px', margin: 0, lineHeight: '14px' }}
        >
          {statusInfo.text}
        </Tag>
      </div>
    </div>
  );
};

/**
 * 详细Tooltip内容
 */
const DetailTooltip: React.FC<{ content: GatewayContent }> = ({ content }) => {
  const statusInfo = getStatusInfo(content.overallStatus);
  const percentage = Math.round(content.completionRate * 100);
  
  return (
    <div style={{ maxWidth: '280px' }}>
      <div style={{ fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>
        🚪 门禁详情
      </div>
      
      {/* 类型和状态 */}
      <div style={{ marginBottom: '8px' }}>
        <Space>
          <Tag color="blue">{getGatewayTypeText(content.gatewayType)}门禁</Tag>
          <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
        </Space>
      </div>
      
      {/* 检查项统计 */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '4px' }}>
          <FileProtectOutlined style={{ marginRight: '4px' }} />
          检查项进度
        </div>
        <Progress 
          percent={percentage} 
          size="small" 
          strokeColor={statusInfo.color}
          format={() => `${content.passedCount}/${content.checkItemCount}`}
        />
      </div>
      
      {/* 统计详情 */}
      <div style={{ fontSize: '11px', color: '#666' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
          <span>✅ 已通过</span>
          <span style={{ color: '#52c41a', fontWeight: 'bold' }}>{content.passedCount}项</span>
        </div>
        {content.failedCount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
            <span>❌ 未通过</span>
            <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>{content.failedCount}项</span>
          </div>
        )}
        {content.pendingCount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
            <span>⏳ 待完成</span>
            <span style={{ color: '#faad14', fontWeight: 'bold' }}>{content.pendingCount}项</span>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * 门禁单元格内容组件
 */
export const GatewayCellContent: React.FC<GatewayCellContentProps> = ({ 
  content,
  compact = true 
}) => {
  if (!content) {
    return (
      <div data-testid="gateway-cell-content" style={{ textAlign: 'center', color: '#999' }}>
        <SafetyOutlined style={{ fontSize: '16px' }} />
        <div style={{ fontSize: '10px' }}>暂无数据</div>
      </div>
    );
  }

  if (compact) {
    // 注意：外层 MatrixTableV3 已经使用了 EnhancedTooltip 包裹单元格
    // 这里不再使用 Tooltip，避免双重 tooltip 重叠问题
    return (
      <div style={{ cursor: 'pointer' }}>
        <CompactView content={content} />
      </div>
    );
  }

  // 详细视图（用于对话框等）
  return <DetailTooltip content={content} />;
};

export default GatewayCellContent;
