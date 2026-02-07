/**
 * MR 卡片组件（Ant Design版本）
 * 
 * 显示 MR 的详细信息，支持拖拽
 * 
 * @version 1.0.0
 * @date 2026-02-07
 */

import React from 'react';
import { MR } from '@/types/iteration';
import { Tooltip } from 'antd';
import { GripVertical, AlertCircle, Clock } from 'lucide-react';

interface MRCardProps {
  mr: MR;
  isDragging?: boolean;
  hasDependencyIssue?: boolean;
  onClick?: () => void;
}

const priorityColors = {
  high: { border: '#ffccc7', background: '#fff1f0', text: '#a8071a' },
  medium: { border: '#91d5ff', background: '#e6f7ff', text: '#0958d9' },
  low: { border: '#d9d9d9', background: '#fafafa', text: '#595959' },
};

const statusColors = {
  'todo': { background: '#f5f5f5', text: '#595959' },
  'in-progress': { background: '#e6f7ff', text: '#0958d9' },
  'done': { background: '#f6ffed', text: '#389e0d' },
};

const MRCard: React.FC<MRCardProps> = ({
  mr,
  isDragging = false,
  hasDependencyIssue = false,
  onClick,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const priorityColor = mr.priority ? priorityColors[mr.priority] : priorityColors.medium;
  const statusColor = mr.status ? statusColors[mr.status] : statusColors.todo;
  
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', mr.id);
  };

  const statusLabels = {
    'todo': '待开始',
    'in-progress': '进行中',
    'done': '已完成',
  };

  const priorityLabels = {
    'high': '高优先级',
    'medium': '中优先级',
    'low': '低优先级',
  };

  return (
    <Tooltip
      title={
        <div style={{ maxWidth: 300 }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{mr.name}</div>
          {mr.description && (
            <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>
              {mr.description}
            </div>
          )}
          {mr.dependencies && mr.dependencies.length > 0 && (
            <div style={{ fontSize: 12, color: '#fa8c16', marginBottom: 4 }}>
              依赖 {mr.dependencies.length} 个需求
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, fontSize: 12 }}>
            {mr.priority && (
              <span style={{
                padding: '2px 6px',
                borderRadius: 4,
                background: priorityColor.background,
                color: priorityColor.text,
                border: `1px solid ${priorityColor.border}`,
              }}>
                {priorityLabels[mr.priority]}
              </span>
            )}
            {mr.estimatedDays && (
              <span style={{ color: '#8c8c8c' }}>
                预估 {mr.estimatedDays} 天
              </span>
            )}
          </div>
        </div>
      }
      placement="right"
    >
      <div
        data-mr-id={mr.id}
        draggable
        onDragStart={handleDragStart}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position: 'relative',
          borderRadius: 4,
          borderLeft: `2px solid ${priorityColor.border}`,
          padding: 8,
          cursor: 'move',
          transition: 'all 0.2s',
          background: priorityColor.background,
          color: priorityColor.text,
          opacity: isDragging ? 0.5 : 1,
          transform: isDragging ? 'scale(0.95)' : isHovered ? 'scale(1.02)' : 'scale(1)',
          boxShadow: isHovered ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
        }}
      >
        {/* 拖拽手柄 */}
        <div style={{
          position: 'absolute',
          left: 4,
          top: '50%',
          transform: 'translateY(-50%)',
          opacity: isHovered ? 0.5 : 0,
          transition: 'opacity 0.2s',
        }}>
          <GripVertical size={16} />
        </div>
        
        {/* MR 信息 */}
        <div style={{ paddingLeft: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ 
                fontSize: 12, 
                fontWeight: 500,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {mr.name}
              </div>
            </div>
            
            {/* 依赖警告 */}
            {hasDependencyIssue && (
              <AlertCircle size={12} style={{ color: '#fa8c16', flexShrink: 0 }} />
            )}
          </div>
          
          {/* 底部信息 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            {/* 状态 */}
            {mr.status && (
              <span style={{
                fontSize: 10,
                padding: '2px 6px',
                borderRadius: 4,
                background: statusColor.background,
                color: statusColor.text,
              }}>
                {statusLabels[mr.status]}
              </span>
            )}
            
            {/* 工作量 */}
            {mr.estimatedDays && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#8c8c8c' }}>
                <Clock size={10} />
                <span>{mr.estimatedDays}d</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Tooltip>
  );
};

export default MRCard;
