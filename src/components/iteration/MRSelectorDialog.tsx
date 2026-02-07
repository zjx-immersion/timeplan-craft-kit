/**
 * MR 选择对话框组件（Ant Design版本）
 * 
 * 功能：
 * - 显示特性-SSTS-MR 树形结构
 * - 支持多选 MR
 * - 显示 MR 依赖关系
 * 
 * @version 1.0.0
 * @date 2026-02-07
 */

import React, { useState, useMemo } from 'react';
import { Feature, SSTS, MR } from '@/types/iteration';
import { Modal, Checkbox, Input, Tree, Button, Space } from 'antd';
import { Search, AlertCircle } from 'lucide-react';
import type { DataNode } from 'antd/es/tree';

interface MRSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (mrIds: string[]) => void;
  features?: Feature[];
  sstsList?: SSTS[];
  mrs?: MR[];
}

// Mock 数据（临时）
const mockFeatures: Feature[] = [
  { id: 'feat-1', name: '智能驾驶功能', description: 'L2+ 智能驾驶功能' },
  { id: 'feat-2', name: '智能泊车功能', description: '自动泊车相关功能' },
];

const mockSSTSList: SSTS[] = [
  { id: 'ssts-1-1', name: 'SSTS-001 感知系统', featureId: 'feat-1' },
  { id: 'ssts-1-2', name: 'SSTS-002 规划系统', featureId: 'feat-1' },
  { id: 'ssts-2-1', name: 'SSTS-003 泊车系统', featureId: 'feat-2' },
];

const mockMRs: MR[] = [
  { 
    id: 'mr-1-1-1', 
    name: 'MR-001 车辆检测算法优化', 
    sstsId: 'ssts-1-1',
    estimatedDays: 5,
    priority: 'high',
    status: 'todo',
  },
  { 
    id: 'mr-1-1-2', 
    name: 'MR-002 行人检测算法优化', 
    sstsId: 'ssts-1-1',
    estimatedDays: 3,
    priority: 'medium',
    status: 'todo',
    dependencies: ['mr-1-1-1'],
  },
  { 
    id: 'mr-1-1-3', 
    name: 'MR-003 障碍物融合', 
    sstsId: 'ssts-1-1',
    estimatedDays: 4,
    priority: 'high',
    status: 'todo',
    dependencies: ['mr-1-1-1', 'mr-1-1-2'],
  },
  { 
    id: 'mr-1-2-1', 
    name: 'MR-004 路径规划算法', 
    sstsId: 'ssts-1-2',
    estimatedDays: 6,
    priority: 'high',
    status: 'todo',
  },
  { 
    id: 'mr-1-2-2', 
    name: 'MR-005 决策树优化', 
    sstsId: 'ssts-1-2',
    estimatedDays: 4,
    priority: 'medium',
    status: 'todo',
  },
  { 
    id: 'mr-2-1-1', 
    name: 'MR-006 泊车位检测', 
    sstsId: 'ssts-2-1',
    estimatedDays: 5,
    priority: 'high',
    status: 'todo',
  },
];

const MRSelectorDialog: React.FC<MRSelectorDialogProps> = ({
  open,
  onOpenChange,
  onSelect,
  features = mockFeatures,
  sstsList = mockSSTSList,
  mrs = mockMRs,
}) => {
  const [selectedMRs, setSelectedMRs] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  
  // 按 SSTS 分组 MR
  const mrsBySsts = useMemo(() => {
    const grouped = new Map<string, MR[]>();
    
    sstsList.forEach(ssts => {
      const sstsMRs = mrs.filter(mr => mr.sstsId === ssts.id);
      grouped.set(ssts.id, sstsMRs);
    });
    
    return grouped;
  }, [sstsList, mrs]);
  
  // 按 Feature 分组 SSTS
  const sstsByFeature = useMemo(() => {
    const grouped = new Map<string, SSTS[]>();
    
    features.forEach(feature => {
      const featureSsts = sstsList.filter(ssts => ssts.featureId === feature.id);
      grouped.set(feature.id, featureSsts);
    });
    
    return grouped;
  }, [features, sstsList]);
  
  // 检查 MR 是否有依赖警告
  const getMRDependencyWarning = (mr: MR): string | null => {
    if (!mr.dependencies || mr.dependencies.length === 0) return null;
    
    const unselectedDeps = mr.dependencies.filter(depId => !selectedMRs.has(depId));
    if (unselectedDeps.length === 0) return null;
    
    return `依赖 ${unselectedDeps.length} 个未选中的 MR`;
  };
  
  // 切换 MR 选中状态
  const toggleMR = React.useCallback((mrId: string) => {
    setSelectedMRs(prev => {
      const next = new Set(prev);
      if (next.has(mrId)) {
        next.delete(mrId);
      } else {
        next.add(mrId);
      }
      return next;
    });
  }, []);
  
  // 构建树形数据
  const treeData: DataNode[] = useMemo(() => {
    const filteredFeatures = searchQuery
      ? features.filter(feature => {
          const query = searchQuery.toLowerCase();
          if (feature.name.toLowerCase().includes(query)) return true;
          
          const featureSsts = sstsByFeature.get(feature.id) || [];
          if (featureSsts.some(ssts => ssts.name.toLowerCase().includes(query))) return true;
          
          return featureSsts.some(ssts => {
            const sstsMRs = mrsBySsts.get(ssts.id) || [];
            return sstsMRs.some(mr => mr.name.toLowerCase().includes(query));
          });
        })
      : features;

    return filteredFeatures.map((feature) => {
      const featureSsts = sstsByFeature.get(feature.id) || [];
      
      const children: DataNode[] = featureSsts.map((ssts) => {
        const sstsMRs = mrsBySsts.get(ssts.id) || [];
        
        const mrChildren: DataNode[] = sstsMRs.map((mr) => {
          const warning = getMRDependencyWarning(mr);
          
          return {
            title: (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  padding: '4px 0',
                  cursor: 'pointer',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMR(mr.id);
                }}
              >
                <Checkbox
                  checked={selectedMRs.has(mr.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleMR(mr.id);
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 500, fontSize: 14 }}>{mr.name}</span>
                    {mr.estimatedDays && (
                      <span style={{ fontSize: 12, color: '#8c8c8c' }}>
                        {mr.estimatedDays}天
                      </span>
                    )}
                    {mr.priority === 'high' && (
                      <span style={{
                        fontSize: 12,
                        background: '#fff1f0',
                        color: '#a8071a',
                        padding: '2px 6px',
                        borderRadius: 4,
                      }}>
                        高优
                      </span>
                    )}
                  </div>
                  {warning && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      marginTop: 4,
                      fontSize: 12,
                      color: '#fa8c16'
                    }}>
                      <AlertCircle size={12} />
                      <span>{warning}</span>
                    </div>
                  )}
                </div>
              </div>
            ),
            key: `mr-${mr.id}`,
            isLeaf: true,
          };
        });
        
        return {
          title: ssts.name,
          key: `ssts-${ssts.id}`,
          children: mrChildren,
        };
      });
      
      return {
        title: (
          <div>
            <span style={{ fontWeight: 600 }}>{feature.name}</span>
            {feature.description && (
              <span style={{ fontSize: 12, color: '#8c8c8c', marginLeft: 8 }}>
                ({feature.description})
              </span>
            )}
          </div>
        ),
        key: `feat-${feature.id}`,
        children: children,
      };
    });
  }, [features, sstsByFeature, mrsBySsts, selectedMRs, searchQuery, toggleMR]);
  
  // 处理确认
  const handleConfirm = () => {
    onSelect(Array.from(selectedMRs));
    setSelectedMRs(new Set());
    setSearchQuery('');
    setExpandedKeys([]);
  };
  
  // 处理取消
  const handleCancel = () => {
    onOpenChange(false);
    setSelectedMRs(new Set());
    setSearchQuery('');
    setExpandedKeys([]);
  };
  
  return (
    <Modal
      title="选择模块需求（MR）"
      open={open}
      onCancel={handleCancel}
      width={800}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 14, color: '#8c8c8c' }}>
            已选择 {selectedMRs.size} 个 MR
          </span>
          <Space>
            <Button onClick={handleCancel}>取消</Button>
            <Button type="primary" onClick={handleConfirm} disabled={selectedMRs.size === 0}>
              确定
            </Button>
          </Space>
        </div>
      }
    >
      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="搜索特性、SSTS 或 MR..."
          prefix={<Search size={16} style={{ color: '#8c8c8c' }} />}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            // 搜索时自动展开所有节点
            if (e.target.value) {
              const allKeys: React.Key[] = [];
              treeData.forEach(feature => {
                allKeys.push(feature.key);
                feature.children?.forEach(ssts => {
                  allKeys.push(ssts.key);
                });
              });
              setExpandedKeys(allKeys);
            }
          }}
          style={{ marginBottom: 16 }}
        />
      </div>
      
      {/* MR 树 */}
      <div style={{
        border: '1px solid #d9d9d9',
        borderRadius: 6,
        padding: 16,
        maxHeight: '60vh',
        overflow: 'auto'
      }}>
        <Tree
          treeData={treeData}
          expandedKeys={expandedKeys}
          onExpand={setExpandedKeys}
          defaultExpandAll={false}
          showLine={{ showLeafIcon: false }}
        />
      </div>
    </Modal>
  );
};

export default MRSelectorDialog;
