/**
 * MR 详情对话框组件（Ant Design版本）
 * 
 * 显示 MR 的完整信息，包括依赖关系
 * 
 * @version 1.0.0
 * @date 2026-02-07
 */

import React from 'react';
import { MR } from '@/types/iteration';
import { Modal, Descriptions, Tag, Space } from 'antd';
import { Clock, ArrowRight, AlertCircle } from 'lucide-react';

interface MRDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mr: MR | null;
  allMrs?: MR[];
}

const priorityLabels = {
  high: '高优先级',
  medium: '中优先级',
  low: '低优先级',
};

const priorityColors = {
  high: 'red',
  medium: 'blue',
  low: 'default',
};

const statusLabels = {
  'todo': '待开始',
  'in-progress': '进行中',
  'done': '已完成',
};

const statusColors = {
  'todo': 'default',
  'in-progress': 'processing',
  'done': 'success',
};

const MRDetailDialog: React.FC<MRDetailDialogProps> = ({
  open,
  onOpenChange,
  mr,
  allMrs = [],
}) => {
  if (!mr) return null;
  
  // 获取依赖的 MR 信息
  const dependencyMRs = mr.dependencies
    ? allMrs.filter(m => mr.dependencies?.includes(m.id))
    : [];
  
  // 获取被依赖的 MR 信息
  const dependentMRs = allMrs.filter(m => m.dependencies?.includes(mr.id));
  
  return (
    <Modal
      title={mr.name}
      open={open}
      onCancel={() => onOpenChange(false)}
      footer={null}
      width={800}
    >
      {mr.description && (
        <p style={{ marginBottom: 16, color: '#8c8c8c' }}>{mr.description}</p>
      )}
      
      <div style={{ marginBottom: 24 }}>
        {/* 状态和优先级 */}
        <Space size="middle" style={{ marginBottom: 16 }}>
          {mr.status && (
            <Tag color={statusColors[mr.status]}>
              {statusLabels[mr.status]}
            </Tag>
          )}
          {mr.priority && (
            <Tag color={priorityColors[mr.priority]}>
              {priorityLabels[mr.priority]}
            </Tag>
          )}
          {mr.estimatedDays && (
            <Space size="small">
              <Clock size={14} />
              <span style={{ fontSize: 14, color: '#8c8c8c' }}>
                预估 {mr.estimatedDays} 天
              </span>
            </Space>
          )}
        </Space>
        
        {/* 依赖关系 */}
        {(dependencyMRs.length > 0 || dependentMRs.length > 0) && (
          <div style={{ 
            border: '1px solid #d9d9d9', 
            borderRadius: 6, 
            padding: 16,
            marginTop: 16
          }}>
            <div style={{ 
              fontWeight: 600, 
              fontSize: 14,
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <ArrowRight size={16} />
              依赖关系
            </div>
            
            {/* 依赖的需求（前置依赖）*/}
            {dependencyMRs.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ 
                  fontSize: 12, 
                  color: '#8c8c8c',
                  marginBottom: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}>
                  <AlertCircle size={12} />
                  该需求依赖以下需求完成：
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 16 }}>
                  {dependencyMRs.map((depMR) => (
                    <div
                      key={depMR.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: 8,
                        background: '#fff7e6',
                        border: '1px solid #ffd591',
                        borderRadius: 4,
                      }}
                    >
                      <span style={{ fontWeight: 500, flex: 1 }}>{depMR.name}</span>
                      {depMR.status && (
                        <Tag color={statusColors[depMR.status]} style={{ fontSize: 12 }}>
                          {statusLabels[depMR.status]}
                        </Tag>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* 被依赖的需求（后置依赖）*/}
            {dependentMRs.length > 0 && (
              <div>
                <div style={{ 
                  fontSize: 12, 
                  color: '#8c8c8c',
                  marginBottom: 8
                }}>
                  以下需求依赖该需求：
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 16 }}>
                  {dependentMRs.map((depMR) => (
                    <div
                      key={depMR.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: 8,
                        background: '#e6f7ff',
                        border: '1px solid #91d5ff',
                        borderRadius: 4,
                      }}
                    >
                      <span style={{ fontWeight: 500, flex: 1 }}>{depMR.name}</span>
                      {depMR.status && (
                        <Tag color={statusColors[depMR.status]} style={{ fontSize: 12 }}>
                          {statusLabels[depMR.status]}
                        </Tag>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* 元数据 */}
        <Descriptions column={2} size="small" style={{ marginTop: 16 }}>
          <Descriptions.Item label="需求 ID">
            <span style={{ fontFamily: 'monospace' }}>{mr.id}</span>
          </Descriptions.Item>
          <Descriptions.Item label="所属子系统">
            {mr.sstsId}
          </Descriptions.Item>
        </Descriptions>
      </div>
    </Modal>
  );
};

export default MRDetailDialog;
