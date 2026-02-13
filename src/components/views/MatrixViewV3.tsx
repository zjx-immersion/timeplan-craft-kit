/**
 * 矩阵视图V3 - 主组件
 * 
 * 架构：Timeline(产品) × TimeNode(里程碑/门禁)
 * 
 * @version 3.0.0
 * @date 2026-02-11
 */

import React, { useMemo, useState, useCallback } from 'react';
import { Card, Space, Typography, Tag, Statistic, Alert, Button, Tooltip, message, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { 
  CalendarOutlined, 
  ProjectOutlined, 
  ClockCircleOutlined,
  CheckSquareOutlined,
  BorderOutlined,
  ExportOutlined,
  FileTextOutlined,
  FileExcelOutlined,
} from '@ant-design/icons';
import { format } from 'date-fns';
import { TimePlan, Line } from '@/types/timeplanSchema';
import { 
  calculateMatrixV3, 
  MatrixDataV3,
  groupTimeNodesByQuarter 
} from '@/utils/matrix-v3';
import MatrixTableV3 from './matrix/MatrixTableV3';
import MatrixLegendV3 from './matrix/MatrixLegendV3';
import MilestoneDetailDialog from './matrix/MilestoneDetailDialog';
import GatewayDetailDialog from './matrix/GatewayDetailDialog';
import BatchEditDialog from '@/components/dialogs/BatchEditDialog';
import { useNavigationStore } from '@/stores/navigationStore';
import { useSelectionStore } from '@/stores/selectionStore';
import { exportSelectedLinesToExcel } from '@/utils/excelExport';

const { Title, Text } = Typography;

interface MatrixViewV3Props {
  data: TimePlan;
  onViewChange?: (view: string) => void;
  onDataChange?: (data: TimePlan) => void; // Task 4.8: 用于批量编辑
}

/**
 * 矩阵视图V3
 */
const MatrixViewV3: React.FC<MatrixViewV3Props> = ({ data, onViewChange, onDataChange }) => {
  const [selectedCell, setSelectedCell] = useState<{
    timelineId: string;
    timeNodeId: string;
    timeNodeType: 'milestone' | 'gateway';
  } | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  
  // Task 4.8: 批量编辑对话框状态
  const [batchEditVisible, setBatchEditVisible] = useState(false);
  
  // 导航Store
  const { navigateToLines } = useNavigationStore();
  
  // Task 4.8: 选择Store
  const {
    selectionMode,
    selectedLineIds,
    enterSelectionMode,
    exitSelectionMode,
    clearSelection,
    selectMultiple,
    getSelectedIds,
  } = useSelectionStore();

  // Task 2.3: 导出格式菜单
  const exportMenuItems: MenuProps['items'] = [
    {
      key: 'json',
      label: 'JSON格式',
      icon: <FileTextOutlined />,
      onClick: handleBatchExportJSON,
    },
    {
      key: 'excel',
      label: 'Excel格式',
      icon: <FileExcelOutlined />,
      onClick: handleBatchExportExcel,
    },
  ];

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

  /**
   * 处理导航到甘特图
   */
  const handleNavigateToGantt = (lineIds: string[]) => {
    console.log('[MatrixViewV3] 导航到甘特图:', { lineIds, count: lineIds.length });
    
    // 1. 设置导航状态（目标Line IDs + 选项）
    navigateToLines(lineIds, {
      highlight: true,
      autoScroll: true,
      calculateDateRange: true,
      highlightDuration: 2000,
    });
    
    // 2. 切换到甘特图视图
    if (onViewChange) {
      onViewChange('gantt');
    }
  };

  /**
   * Task 4.8: 处理单元格点击
   * 在选择模式下：选择单元格中的所有任务
   * 在正常模式下：打开详情对话框
   */
  const handleCellClick = useCallback((timelineId: string, timeNodeId: string) => {
    const cell = matrixData.cells.get(`${timelineId}-${timeNodeId}`);
    if (!cell) return;

    if (selectionMode) {
      // Task 4.8: 选择模式 - 选择单元格中的所有任务
      const lineIds = cell.lines.map(line => line.id);
      selectMultiple(lineIds);
      console.log('[MatrixViewV3] ✅ 选中单元格任务:', lineIds.length);
      message.success(`已选中 ${lineIds.length} 个任务`);
    } else {
      // 正常模式 - 打开详情对话框
      setSelectedCell({ 
        timelineId, 
        timeNodeId, 
        timeNodeType: cell.timeNodeType 
      });
      setDetailDialogOpen(true);
    }
  }, [selectionMode, matrixData.cells, selectMultiple]);

  /**
   * Task 4.8: 打开批量编辑对话框
   */
  const handleOpenBatchEdit = useCallback(() => {
    if (selectedLineIds.size === 0) {
      message.warning('请先选择要编辑的任务');
      return;
    }
    console.log('[MatrixViewV3] 📝 打开批量编辑对话框:', selectedLineIds.size);
    setBatchEditVisible(true);
  }, [selectedLineIds]);

  /**
   * Task 4.8: 批量更新任务
   */
  const handleBatchUpdate = useCallback(async (updates: Partial<Line>) => {
    if (!onDataChange || selectedLineIds.size === 0) {
      throw new Error('无法更新：缺少必要的参数');
    }

    console.log('[MatrixViewV3] 🔄 批量更新任务:', {
      count: selectedLineIds.size,
      updates,
    });

    const selectedIdSet = selectedLineIds;
    const updatedLines = data.lines.map((line) => {
      if (selectedIdSet.has(line.id)) {
        return {
          ...line,
          attributes: {
            ...line.attributes,
            ...(updates.attributes || {}),
          },
        };
      }
      return line;
    });

    onDataChange({
      ...data,
      lines: updatedLines,
    });

    console.log('[MatrixViewV3] ✅ 批量更新完成');
  }, [data, onDataChange, selectedLineIds]);

  /**
   * Task 4.8: 批量导出任务（JSON格式）
   */
  const handleBatchExportJSON = useCallback(() => {
    if (selectedLineIds.size === 0) {
      message.warning('请先选择要导出的任务');
      return;
    }

    try {
      console.log('[MatrixViewV3] 📤 批量导出任务(JSON):', selectedLineIds.size);
      
      const selectedIdSet = selectedLineIds;
      const selectedLines = data.lines.filter((line) => selectedIdSet.has(line.id));
      
      // 构建导出数据
      const exportData = {
        metadata: {
          exportDate: new Date().toISOString(),
          count: selectedLines.length,
          planName: data.name || 'TimePlan',
          source: 'MatrixView',
          exportedBy: 'TimePlan Craft Kit',
          version: '1.0.0',
        },
        lines: selectedLines,
      };
      
      // 导出为JSON文件
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // 文件命名
      const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
      const filename = `matrix_export_${selectedLines.length}tasks_${timestamp}.json`;
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      message.success(`已导出 ${selectedLines.length} 个任务到 ${filename}`);
      console.log('[MatrixViewV3] ✅ JSON导出完成:', filename);
    } catch (error) {
      console.error('[MatrixViewV3] ❌ JSON导出失败:', error);
      message.error('导出失败，请重试');
    }
  }, [data, selectedLineIds]);

  /**
   * Task 2.3: 批量导出任务（Excel格式）
   */
  const handleBatchExportExcel = useCallback(() => {
    if (selectedLineIds.size === 0) {
      message.warning('请先选择要导出的任务');
      return;
    }

    try {
      console.log('[MatrixViewV3] 📊 批量导出任务(Excel):', selectedLineIds.size);
      
      const selectedIds = Array.from(selectedLineIds);
      exportSelectedLinesToExcel(data, selectedIds);
      
      message.success(`已导出 ${selectedIds.length} 个任务到Excel文件`);
      console.log('[MatrixViewV3] ✅ Excel导出完成');
    } catch (error) {
      console.error('[MatrixViewV3] ❌ Excel导出失败:', error);
      message.error('导出失败，请重试');
    }
  }, [data, selectedLineIds]);

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
            <Space size="middle">
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
              
              {/* Task 4.8: 选择模式切换按钮 */}
              <Tooltip title={selectionMode ? '退出选择模式' : '进入选择模式'}>
                <Button
                  type={selectionMode ? 'primary' : 'default'}
                  icon={selectionMode ? <CheckSquareOutlined /> : <BorderOutlined />}
                  onClick={() => {
                    if (selectionMode) {
                      exitSelectionMode();
                      console.log('[MatrixViewV3] 🚪 退出选择模式');
                    } else {
                      enterSelectionMode();
                      console.log('[MatrixViewV3] 🎯 进入选择模式');
                    }
                  }}
                >
                  {selectionMode ? '退出选择' : '批量选择'}
                </Button>
              </Tooltip>
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

      {/* Task 4.8: 批量操作栏（选择模式下显示） */}
      {selectionMode && selectedLineIds.size > 0 && (
        <Card 
          style={{ 
            marginBottom: '16px',
            background: '#e6f4ff',
            border: '1px solid #91caff',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
              <Tag color="blue" icon={<CheckSquareOutlined />}>
                已选中 {selectedLineIds.size} 个任务
              </Tag>
              <Button 
                type="text" 
                size="small"
                onClick={() => {
                  clearSelection();
                  message.info('已取消选择');
                }}
              >
                取消选择
              </Button>
            </Space>
            
            <Space>
              <Button 
                type="primary" 
                size="small"
                onClick={handleOpenBatchEdit}
              >
                批量编辑
              </Button>
              {/* Task 2.3: 导出按钮（支持多种格式） */}
              <Dropdown menu={{ items: exportMenuItems }} placement="bottomLeft">
                <Button size="small" icon={<ExportOutlined />}>
                  导出
                </Button>
              </Dropdown>
            </Space>
          </div>
        </Card>
      )}

      {/* 提示信息 */}
      <Alert
        type="info"
        title="矩阵说明"
        description={
          selectionMode
            ? '【选择模式】点击单元格选择其中的所有任务。选择完成后可以进行批量编辑或导出。'
            : '矩阵展示每个产品线（Timeline）在各个时间节点（里程碑/门禁）的任务分布和工作量情况。颜色越深表示负载越高。'
        }
        style={{ marginBottom: '16px' }}
        showIcon
      />

      {/* 矩阵表格 */}
      <Card variant="borderless" style={{ marginBottom: '16px' }}>
        <MatrixTableV3 
          matrixData={matrixData}
          onCellClick={handleCellClick}
          onNavigateToGantt={handleNavigateToGantt}
          selectionMode={selectionMode}
          selectedLineIds={selectedLineIds}
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
            const cell = matrixData.cells.get(`${selectedCell.timelineId}-${selectedCell.timeNodeId}`);
            if (cell && cell.lines.length > 0) {
              const lineIds = cell.lines.map(line => line.id);
              console.log('[MilestoneDetailDialog] 在甘特图中查看:', lineIds);
              handleNavigateToGantt(lineIds);
              setDetailDialogOpen(false); // 关闭对话框
            }
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
            const cell = matrixData.cells.get(`${selectedCell.timelineId}-${selectedCell.timeNodeId}`);
            if (cell && cell.lines.length > 0) {
              const lineIds = cell.lines.map(line => line.id);
              console.log('[GatewayDetailDialog] 在甘特图中查看:', lineIds);
              handleNavigateToGantt(lineIds);
              setDetailDialogOpen(false); // 关闭对话框
            }
          }}
        />
      )}

      {/* 热力图图例 */}
      <Card variant="borderless">
        <MatrixLegendV3 />
      </Card>

      {/* Task 4.8: 批量编辑对话框 */}
      <BatchEditDialog
        visible={batchEditVisible}
        selectedLineIds={Array.from(selectedLineIds)}
        onClose={() => setBatchEditVisible(false)}
        onBatchUpdate={handleBatchUpdate}
      />
    </div>
  );
};

export default MatrixViewV3;
