/**
 * 迭代标记组件（Gateway/Milestone）- Ant Design版本
 * 
 * 功能：
 * - 显示迭代中的 gateway 和 milestone
 * - 支持折叠：超过显示数量时显示"+N"展开按钮
 * - 支持搜索：在展开对话框中搜索
 * 
 * @version 1.0.0
 * @date 2026-02-07
 */

import React, { useState, useMemo } from 'react';
import { Line } from '@/types/timeplanSchema';
import { format } from 'date-fns';
import { Tag, Badge, Modal, Input, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

interface IterationMarkersProps {
  markers: Line[];
  maxVisible?: number; // 最多显示多少个标记，根据单元格宽度动态调整（1-3个）
}

const IterationMarkers: React.FC<IterationMarkersProps> = ({ 
  markers,
  maxVisible = 2 
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  if (markers.length === 0) return null;

  const visibleMarkers = markers.slice(0, maxVisible);
  const hasMore = markers.length > maxVisible;
  const moreCount = markers.length - maxVisible;

  // 搜索过滤
  const filteredMarkers = useMemo(() => {
    if (!searchQuery) return markers;
    return markers.filter(marker => 
      marker.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [markers, searchQuery]);

  // 统计信息
  const gatewayCount = useMemo(() => 
    markers.filter(m => m.schemaId === 'gateway-schema').length,
    [markers]
  );
  const milestoneCount = useMemo(() => 
    markers.filter(m => m.schemaId === 'milestone-schema').length,
    [markers]
  );

  const renderMarker = (marker: Line, compact: boolean = false) => {
    const isGateway = marker.schemaId === 'gateway-schema';
    const color = isGateway ? 'success' : 'purple';
    
    return (
      <Tag
        key={marker.id}
        color={color}
        style={{
          margin: 0,
          fontSize: compact ? '11px' : '12px',
          padding: compact ? '2px 6px' : '4px 8px',
          maxWidth: compact ? '60px' : 'none',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
        title={`${marker.label} - ${format(new Date(marker.startDate), 'M/d')}`}
      >
        {compact ? (
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {marker.label}
          </span>
        ) : (
          <Space size={4}>
            <span>{marker.label}</span>
            <span style={{ fontSize: '10px', opacity: 0.7 }}>
              {format(new Date(marker.startDate), 'M/d')}
            </span>
          </Space>
        )}
      </Tag>
    );
  };

  return (
    <>
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        padding: 4,
        overflow: 'hidden',
      }}>
        {visibleMarkers.map(marker => renderMarker(marker, true))}
        
        {hasMore && (
          <Badge
            count={moreCount}
            overflowCount={999}
            style={{
              cursor: 'pointer',
            }}
            onClick={(e) => {
              e.stopPropagation();
              setDialogOpen(true);
            }}
          >
            <Tag
              color="processing"
              style={{
                margin: 0,
                fontSize: '11px',
                padding: '2px 6px',
                cursor: 'pointer',
              }}
              title={`还有 ${moreCount} 个标记`}
              onClick={(e) => {
                e.stopPropagation();
                setDialogOpen(true);
              }}
            >
              +{moreCount}
            </Tag>
          </Badge>
        )}
      </div>

      {/* 展开对话框 */}
      <Modal
        open={dialogOpen}
        onCancel={() => {
          setDialogOpen(false);
          setSearchQuery('');
        }}
        footer={null}
        title="迭代标记"
        width={600}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          {/* 搜索框 */}
          <Input
            placeholder="搜索标记名称..."
            prefix={<SearchOutlined />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            allowClear
          />

          {/* 统计 */}
          <div style={{ display: 'flex', gap: 16, fontSize: '12px', color: '#8c8c8c' }}>
            <Space>
              <Tag color="success">Gateway</Tag>
              <span>{gatewayCount}</span>
            </Space>
            <Space>
              <Tag color="purple">Milestone</Tag>
              <span>{milestoneCount}</span>
            </Space>
          </div>

          {/* 标记列表 */}
          <div style={{
            maxHeight: '400px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}>
            {filteredMarkers.length > 0 ? (
              filteredMarkers.map(marker => renderMarker(marker, false))
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '32px 0',
                color: '#8c8c8c',
              }}>
                未找到匹配的标记
              </div>
            )}
          </div>
        </Space>
      </Modal>
    </>
  );
};

export default IterationMarkers;
