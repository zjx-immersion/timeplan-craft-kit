/**
 * TimelinePanelEnhanced - 集成所有新功能的时间线面板
 * 
 * 新增功能：
 * - 导出/导入对话框
 * - 节点编辑对话框
 * - 右键菜单
 * - 撤销/重做功能
 * - 快捷键支持
 * 
 * @version 2.0.0
 * @date 2026-02-03
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Button, Space, Tooltip, message, Modal } from 'antd';
import {
  ExportOutlined,
  ImportOutlined,
  UndoOutlined,
  RedoOutlined,
  SaveOutlined,
  DeleteOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import { TimePlan, Line } from '@/types/timeplanSchema';
import { useTimePlanStoreWithHistory } from '@/stores/timePlanStoreWithHistory';
import { 
  ExportDialog, 
  ImportDialog, 
  NodeEditDialog, 
  NodeContextMenu 
} from '@/components/dialogs';
import TimelinePanel from './TimelinePanel';
import { calculateCriticalPath } from '@/utils/criticalPath';

/**
 * TimelinePanelEnhanced 组件属性
 */
interface TimelinePanelEnhancedProps {
  /**
   * 项目 ID
   */
  planId: string;
}

/**
 * TimelinePanelEnhanced 主组件
 */
export const TimelinePanelEnhanced: React.FC<TimelinePanelEnhancedProps> = ({
  planId,
}) => {
  // ==================== Store ====================
  
  const {
    plans,
    currentPlan,
    setCurrentPlan,
    updatePlan,
    updateLine,
    deleteLine,
    undo,
    redo,
    canUndo,
    canRedo,
    setPlans,
  } = useTimePlanStoreWithHistory();

  // 设置当前项目
  useEffect(() => {
    if (planId) {
      setCurrentPlan(planId);
    }
  }, [planId, setCurrentPlan]);

  const plan = currentPlan || plans.find(p => p.id === planId);

  // ==================== 对话框状态 ====================
  
  const [exportOpen, setExportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [nodeEditOpen, setNodeEditOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Line | null>(null);

  // ==================== 快捷键支持 ====================
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Z - 撤销
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo()) {
          undo();
          message.success('已撤销');
        }
      }
      
      // Ctrl/Cmd + Shift + Z 或 Ctrl/Cmd + Y - 重做
      if ((e.ctrlKey || e.metaKey) && (e.shiftKey && e.key === 'z' || e.key === 'y')) {
        e.preventDefault();
        if (canRedo()) {
          redo();
          message.success('已重做');
        }
      }
      
      // Ctrl/Cmd + S - 保存
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      
      // Ctrl/Cmd + E - 导出
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        setExportOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo]);

  // ==================== 操作处理 ====================
  
  const handleSave = useCallback(() => {
    if (plan) {
      // 更新时间戳
      updatePlan(plan.id, { updatedAt: new Date() });
      message.success('保存成功');
    }
  }, [plan, updatePlan]);

  const handleImport = useCallback((importedPlans: TimePlan[]) => {
    setPlans(importedPlans);
    message.success(`成功导入 ${importedPlans.length} 个项目`);
  }, [setPlans]);

  const handleNodeEdit = useCallback((node: Line) => {
    setSelectedNode(node);
    setNodeEditOpen(true);
  }, []);

  const handleNodeSave = useCallback((nodeId: string, updates: Partial<Line>) => {
    if (plan) {
      updateLine(plan.id, nodeId, updates);
      message.success('节点已更新');
    }
  }, [plan, updateLine]);

  const handleNodeDelete = useCallback((node: Line) => {
    if (!plan) return;
    
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除"${node.label}"吗？此操作不可撤销。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        deleteLine(plan.id, node.id);
        message.success('节点已删除');
      },
    });
  }, [plan, deleteLine]);

  const handleNodeCopy = useCallback((node: Line) => {
    // 复制节点数据到剪贴板
    const nodeData = JSON.stringify(node, null, 2);
    navigator.clipboard.writeText(nodeData);
    message.success('节点数据已复制到剪贴板');
  }, []);

  const handleNodeViewDetails = useCallback((node: Line) => {
    Modal.info({
      title: '节点详情',
      width: 600,
      content: (
        <div>
          <p><strong>ID:</strong> {node.id}</p>
          <p><strong>名称:</strong> {node.label}</p>
          <p><strong>类型:</strong> {node.schemaId}</p>
          <p><strong>开始日期:</strong> {node.startDate.toLocaleDateString()}</p>
          {node.endDate && (
            <p><strong>结束日期:</strong> {node.endDate.toLocaleDateString()}</p>
          )}
          {node.attributes && (
            <div>
              <p><strong>属性:</strong></p>
              <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
                {JSON.stringify(node.attributes, null, 2)}
              </pre>
            </div>
          )}
        </div>
      ),
    });
  }, []);

  const handleCalculateCriticalPath = useCallback(() => {
    if (!plan) return;
    
    const criticalPath = calculateCriticalPath(plan.lines, plan.relations);
    
    if (criticalPath.length > 0) {
      const criticalLines = plan.lines
        .filter(line => criticalPath.includes(line.id))
        .map(line => line.label);
      
      Modal.info({
        title: '关键路径分析',
        width: 600,
        content: (
          <div>
            <p><strong>关键路径节点数:</strong> {criticalPath.length}</p>
            <p><strong>关键路径:</strong></p>
            <ol>
              {criticalLines.map((label, index) => (
                <li key={index}>{label}</li>
              ))}
            </ol>
          </div>
        ),
      });
    } else {
      message.info('未找到关键路径（可能没有依赖关系或存在循环依赖）');
    }
  }, [plan]);

  // ==================== 渲染 ====================
  
  if (!plan) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p>未找到项目数据</p>
        <Button type="primary" onClick={() => setImportOpen(true)}>
          导入项目
        </Button>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 增强工具栏 */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid #f0f0f0',
          background: '#fff',
        }}
      >
        <Space>
          {/* 文件操作 */}
          <Space.Compact>
            <Tooltip title="导出项目 (Ctrl+E)">
              <Button
                icon={<ExportOutlined />}
                onClick={() => setExportOpen(true)}
              >
                导出
              </Button>
            </Tooltip>
            <Tooltip title="导入项目">
              <Button
                icon={<ImportOutlined />}
                onClick={() => setImportOpen(true)}
              >
                导入
              </Button>
            </Tooltip>
          </Space.Compact>

          {/* 历史操作 */}
          <Space.Compact>
            <Tooltip title="撤销 (Ctrl+Z)">
              <Button
                icon={<UndoOutlined />}
                onClick={undo}
                disabled={!canUndo()}
              />
            </Tooltip>
            <Tooltip title="重做 (Ctrl+Shift+Z)">
              <Button
                icon={<RedoOutlined />}
                onClick={redo}
                disabled={!canRedo()}
              />
            </Tooltip>
          </Space.Compact>

          {/* 保存 */}
          <Tooltip title="保存 (Ctrl+S)">
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
            >
              保存
            </Button>
          </Tooltip>

          {/* 分析 */}
          <Button onClick={handleCalculateCriticalPath}>
            关键路径分析
          </Button>
        </Space>
      </div>

      {/* 原始 TimelinePanel */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <TimelinePanel
          data={plan}
          onDataChange={(newData) => updatePlan(plan.id, newData)}
          onNodeDoubleClick={handleNodeEdit}
        />
      </div>

      {/* 对话框 */}
      <ExportDialog
        open={exportOpen}
        plan={plan}
        onClose={() => setExportOpen(false)}
      />

      <ImportDialog
        open={importOpen}
        existingPlans={plans}
        onImport={handleImport}
        onClose={() => setImportOpen(false)}
      />

      {selectedNode && (
        <NodeEditDialog
          open={nodeEditOpen}
          node={selectedNode}
          onSave={handleNodeSave}
          onClose={() => {
            setNodeEditOpen(false);
            setSelectedNode(null);
          }}
        />
      )}
    </div>
  );
};

/**
 * 包装的节点渲染器，支持右键菜单
 */
interface EnhancedLineRendererProps {
  line: Line;
  children: React.ReactElement;
  onEdit: (line: Line) => void;
  onDelete: (line: Line) => void;
  onCopy: (line: Line) => void;
  onViewDetails: (line: Line) => void;
}

export const EnhancedLineRenderer: React.FC<EnhancedLineRendererProps> = ({
  line,
  children,
  onEdit,
  onDelete,
  onCopy,
  onViewDetails,
}) => {
  return (
    <NodeContextMenu
      node={line}
      onEdit={onEdit}
      onDelete={onDelete}
      onCopy={onCopy}
      onViewDetails={onViewDetails}
    >
      {children}
    </NodeContextMenu>
  );
};
