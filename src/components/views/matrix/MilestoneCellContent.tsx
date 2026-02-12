/**
 * 里程碑单元格内容组件
 * 
 * 在矩阵单元格中显示里程碑特定信息
 * 
 * @version 3.2.0
 * @date 2026-02-12
 */

import React from 'react';
import { Tooltip, Tag, Space } from 'antd';
import { 
  FlagOutlined, 
  FileTextOutlined, 
  CarOutlined, 
  AimOutlined,
  TagOutlined
} from '@ant-design/icons';
import type { MilestoneContent } from '@/utils/matrix-v3';

interface MilestoneCellContentProps {
  content?: MilestoneContent;
  compact?: boolean;
}

/**
 * 紧凑视图 - 在矩阵单元格中显示
 */
const CompactView: React.FC<{ content: MilestoneContent }> = ({ content }) => {
  return (
    <div data-testid="milestone-cell-content" style={{ textAlign: 'center' }}>
      {/* 图标和SSTS数量 */}
      <div data-testid="milestone-icon" style={{ marginBottom: '4px' }}>
        <FlagOutlined style={{ fontSize: '16px', color: '#1890ff' }} />
      </div>
      
      {/* SSTS数量 */}
      <div data-testid="ssts-count" style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '2px' }}>
        <FileTextOutlined style={{ fontSize: '10px', marginRight: '2px' }} />
        {content.sstsCount}个SSTS
      </div>
      
      {/* 交付版本 */}
      {content.deliverableVersion && (
        <div data-testid="deliverable-version" style={{ fontSize: '10px', color: '#666', marginBottom: '2px' }}>
          <TagOutlined style={{ fontSize: '9px', marginRight: '2px' }} />
          {content.deliverableVersion}
        </div>
      )}
      
      {/* 车型节点 */}
      {content.vehicleNodes.length > 0 && (
        <div data-testid="vehicle-nodes" style={{ fontSize: '10px', color: '#666' }}>
          <CarOutlined style={{ fontSize: '9px', marginRight: '2px' }} />
          {content.vehicleNodes.join(',')}
        </div>
      )}
    </div>
  );
};

/**
 * 详细Tooltip内容
 */
const DetailTooltip: React.FC<{ content: MilestoneContent }> = ({ content }) => {
  return (
    <div style={{ maxWidth: '300px' }}>
      <div style={{ fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>
        🎯 里程碑详情
      </div>
      
      {/* SSTS列表 */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '4px' }}>
          <FileTextOutlined style={{ marginRight: '4px' }} />
          SSTS需求 ({content.sstsCount}个)
        </div>
        {content.sstsList.length > 0 ? (
          <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11px' }}>
            {content.sstsList.map((ssts, index) => (
              <li key={index}>{ssts}</li>
            ))}
            {content.sstsCount > content.sstsList.length && (
              <li style={{ color: '#999' }}>...还有{content.sstsCount - content.sstsList.length}个</li>
            )}
          </ul>
        ) : (
          <div style={{ fontSize: '11px', color: '#999' }}>暂无SSTS数据</div>
        )}
      </div>
      
      {/* 目标摘要 */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '4px' }}>
          <AimOutlined style={{ marginRight: '4px' }} />
          目标
        </div>
        <div style={{ fontSize: '11px', color: '#666' }}>{content.objectiveSummary}</div>
      </div>
      
      {/* 交付版本 */}
      {content.deliverableVersion && (
        <div style={{ marginBottom: '8px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '4px' }}>
            <TagOutlined style={{ marginRight: '4px' }} />
            交付版本
          </div>
          <Tag color="blue" style={{ fontSize: '11px' }}>{content.deliverableVersion}</Tag>
        </div>
      )}
      
      {/* 车型节点 */}
      {content.vehicleNodes.length > 0 && (
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '4px' }}>
            <CarOutlined style={{ marginRight: '4px' }} />
            车型节点 ({content.vehicleNodes.length}个)
          </div>
          <Space size={4} wrap>
            {content.vehicleNodes.map((node, index) => (
              <Tag key={index} color="cyan" style={{ fontSize: '10px' }}>{node}</Tag>
            ))}
          </Space>
        </div>
      )}
    </div>
  );
};

/**
 * 里程碑单元格内容组件
 */
export const MilestoneCellContent: React.FC<MilestoneCellContentProps> = ({ 
  content,
  compact = true 
}) => {
  if (!content) {
    return (
      <div data-testid="milestone-cell-content" style={{ textAlign: 'center', color: '#999' }}>
        <FlagOutlined style={{ fontSize: '16px' }} />
        <div style={{ fontSize: '10px' }}>暂无数据</div>
      </div>
    );
  }

  if (compact) {
    return (
      <Tooltip title={<DetailTooltip content={content} />} placement="top">
        <div style={{ cursor: 'pointer' }}>
          <CompactView content={content} />
        </div>
      </Tooltip>
    );
  }

  // 详细视图（用于对话框等）
  return <DetailTooltip content={content} />;
};

export default MilestoneCellContent;
