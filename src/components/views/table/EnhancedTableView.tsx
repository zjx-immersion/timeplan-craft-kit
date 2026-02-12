/**
 * EnhancedTableView - 增强的表格视图
 * 
 * 功能:
 * - 行内编辑（双击单元格）
 * - 批量选择和操作
 * - 完整的排序、筛选、搜索
 * - 列自定义
 * 
 * @version 2.0.0
 * @date 2026-02-10
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Table, Input, Button, Space, Tag, Tooltip, Progress, message, Checkbox } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import {
  SearchOutlined,
  CheckSquareOutlined,
  BorderOutlined,
} from '@ant-design/icons';
import type { TimePlan, Line } from '@/types/timeplanSchema';
import { format, differenceInDays } from 'date-fns';
import EditableCell from './EditableCell';
import type { SelectOption } from './EditableCell';
import BatchOperationBar from './BatchOperationBar';
import BatchEditDialog from '@/components/dialogs/BatchEditDialog';
import BatchDeleteDialog from '@/components/dialogs/BatchDeleteDialog';
import type { ColumnConfig } from './column';
import { getCurrentColumns } from './column';
import { useSelectionStore } from '@/stores/selectionStore';

export interface EnhancedTableViewProps {
  data: TimePlan;
  onDataChange?: (data: TimePlan) => void;
  readonly?: boolean;
  showSearch?: boolean;
  className?: string;
  style?: React.CSSProperties;
  columnConfig?: ColumnConfig[];
  onSelectedRowsChange?: (selectedKeys: string[]) => void;
}

interface TableRow {
  key: string;
  id: string;
  timelineId: string;
  timelineName: string;
  label: string;
  type: string;
  schemaId: string;
  owner?: string;
  startDate: string;
  endDate: string;
  duration?: number;
  progress: number;
  status?: string;
  priority?: string;
  line: Line;
}

export const EnhancedTableView: React.FC<EnhancedTableViewProps> = ({
  data,
  onDataChange,
  readonly = false,
  showSearch = true,
  className,
  style,
  columnConfig: externalColumnConfig,
  onSelectedRowsChange,
}) => {
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 50,
    showSizeChanger: true,
    showTotal: (total) => `共 ${total} 条`,
  });
  // Task 4.4: 批量编辑对话框状态
  const [batchEditVisible, setBatchEditVisible] = useState(false);
  
  // Task 4.6: 批量删除对话框状态
  const [batchDeleteVisible, setBatchDeleteVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // 使用外部列配置或默认配置
  const columnConfig = externalColumnConfig || getCurrentColumns();
  
  // ========== Task 4.2: 集成SelectionStore ==========
  const {
    selectedLineIds,
    selectionMode,
    toggleSelection,
    selectAll,
    clearSelection,
    enterSelectionMode,
    exitSelectionMode,
    getSelectedIds,
  } = useSelectionStore();
  
  // 将Set转换为数组用于Table的rowSelection
  const selectedRowKeys = useMemo(() => {
    return Array.from(selectedLineIds);
  }, [selectedLineIds]);
  
  // 当选中行变化时通知父组件
  useEffect(() => {
    if (onSelectedRowsChange) {
      onSelectedRowsChange(selectedRowKeys);
    }
  }, [selectedRowKeys, onSelectedRowsChange]);

  // 辅助函数
  const getTypeLabel = (schemaId: string): string => {
    if (schemaId === 'lineplan-schema' || schemaId === 'bar-schema') return '计划单元';
    if (schemaId === 'milestone-schema') return '里程碑';
    if (schemaId === 'gateway-schema') return '关口';
    return '未知';
  };

  const calculateDuration = (line: Line): number | undefined => {
    if (!line.endDate || !line.startDate) return undefined;
    return differenceInDays(new Date(line.endDate), new Date(line.startDate));
  };

  // 转换为表格行数据
  const tableData = useMemo(() => {
    const timelines = data.timelines || [];
    const lines = data.lines || [];

    console.log('[EnhancedTableView] 数据转换:', {
      timelinesCount: timelines.length,
      linesCount: lines.length,
      firstTimeline: timelines[0],
      firstLine: lines[0],
    });

    return lines.map((line) => {
      try {
        const timeline = timelines.find((t) => t.id === line.timelineId);
        
        // 安全地格式化日期
        let startDateStr = '';
        let endDateStr = '';
        try {
          startDateStr = line.startDate ? format(new Date(line.startDate), 'yyyy-MM-dd') : '';
        } catch (e) {
          console.error('[EnhancedTableView] 格式化开始日期失败:', line.startDate, e);
          startDateStr = String(line.startDate || '');
        }
        
        try {
          endDateStr = line.endDate ? format(new Date(line.endDate), 'yyyy-MM-dd') : '';
        } catch (e) {
          console.error('[EnhancedTableView] 格式化结束日期失败:', line.endDate, e);
          endDateStr = String(line.endDate || '');
        }

        return {
          key: line.id,
          id: line.id,
          timelineId: line.timelineId,
          timelineName: timeline?.label || timeline?.name || '未分组',
          label: line.label,
          type: getTypeLabel(line.schemaId),
          schemaId: line.schemaId,
          owner: line.attributes?.owner as string,
          startDate: startDateStr,
          endDate: endDateStr,
          duration: calculateDuration(line),
          progress: (line.attributes?.progress as number) || 0,
          status: line.attributes?.status as string,
          priority: line.attributes?.priority as string,
          line,
        };
      } catch (error) {
        console.error('[EnhancedTableView] 转换行数据失败:', line, error);
        // 返回一个最小可用的行数据
        return {
          key: line.id,
          id: line.id,
          timelineId: line.timelineId,
          timelineName: '错误',
          label: line.label || '未命名',
          type: '未知',
          schemaId: line.schemaId || '',
          owner: '',
          startDate: '',
          endDate: '',
          duration: 0,
          progress: 0,
          status: '',
          priority: '',
          line,
        };
      }
    });
  }, [data]);

  // 搜索过滤
  const filteredData = useMemo(() => {
    if (!searchText.trim()) {
      console.log('[EnhancedTableView] 无搜索，显示全部数据:', tableData.length, '行');
      return tableData;
    }
    
    const lowerSearch = searchText.toLowerCase();
    const filtered = tableData.filter(
      (row) =>
        row.label.toLowerCase().includes(lowerSearch) ||
        row.timelineName.toLowerCase().includes(lowerSearch) ||
        row.owner?.toLowerCase().includes(lowerSearch)
    );
    console.log('[EnhancedTableView] 搜索结果:', filtered.length, '行（关键词:', searchText, '）');
    return filtered;
  }, [tableData, searchText]);

  /**
   * 保存单元格数据
   */
  const handleCellSave = useCallback(async (
    rowId: string,
    columnId: string,
    value: any
  ): Promise<boolean> => {
    if (!onDataChange) return false;

    try {
      // 找到要更新的Line
      const lineIndex = data.lines.findIndex((l) => l.id === rowId);
      if (lineIndex === -1) {
        throw new Error('未找到对应的任务');
      }

      const updatedLines = [...data.lines];
      const line = { ...updatedLines[lineIndex] };

      // 更新对应字段
      switch (columnId) {
        case 'label':
          line.label = value;
          break;
        case 'startDate':
          line.startDate = new Date(value);
          break;
        case 'endDate':
          line.endDate = new Date(value);
          break;
        case 'owner':
        case 'status':
        case 'priority':
          line.attributes = {
            ...line.attributes,
            [columnId]: value,
          };
          break;
        case 'progress':
          line.attributes = {
            ...line.attributes,
            progress: value,
          };
          break;
        default:
          console.warn(`未知的字段: ${columnId}`);
          return false;
      }

      updatedLines[lineIndex] = line;

      // 更新数据
      onDataChange({
        ...data,
        lines: updatedLines,
      });

      return true;
    } catch (error) {
      console.error('[EnhancedTableView] 保存失败:', error);
      return false;
    }
  }, [data, onDataChange]);

  /**
   * Task 4.6: 打开批量删除确认对话框
   */
  const handleBatchDelete = useCallback(() => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要删除的任务');
      return;
    }
    console.log('[EnhancedTableView] 🗑️ 打开批量删除对话框:', selectedRowKeys.length);
    setBatchDeleteVisible(true);
  }, [selectedRowKeys]);

  /**
   * Task 4.6: 确认批量删除
   */
  const handleConfirmBatchDelete = useCallback(async () => {
    if (!onDataChange || selectedRowKeys.length === 0) return;

    setIsDeleting(true);
    
    try {
      console.log('[EnhancedTableView] 🗑️ 执行批量删除:', selectedRowKeys.length);
      
      const selectedIdSet = new Set(selectedRowKeys);
      
      // 删除选中的任务
      const updatedLines = data.lines.filter((l) => !selectedIdSet.has(l.id));
      
      // 删除相关的关系
      const updatedRelations = data.relations.filter(
        (r) => !selectedIdSet.has(r.from) && !selectedIdSet.has(r.to)
      );

      const deletedRelationCount = data.relations.length - updatedRelations.length;

      onDataChange({
        ...data,
        lines: updatedLines,
        relations: updatedRelations,
      });

      // 清除选择
      clearSelection();

      message.success(`已删除 ${selectedRowKeys.length} 个任务${deletedRelationCount > 0 ? `和 ${deletedRelationCount} 个关系` : ''}`);
      
      console.log('[EnhancedTableView] ✅ 批量删除完成');
      
      // 关闭对话框
      setBatchDeleteVisible(false);
    } catch (error) {
      console.error('[EnhancedTableView] ❌ 批量删除失败:', error);
      message.error('删除失败，请重试');
    } finally {
      setIsDeleting(false);
    }
  }, [data, onDataChange, selectedRowKeys, clearSelection]);

  /**
   * Task 4.7: 批量导出选中的任务
   */
  const handleBatchExport = useCallback(() => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要导出的任务');
      return;
    }

    try {
      console.log('[EnhancedTableView] 📤 批量导出任务:', selectedRowKeys.length);
      
      const selectedIdSet = new Set(selectedRowKeys);
      
      // Task 4.7: 过滤选中的任务
      const selectedLines = data.lines.filter((line) => selectedIdSet.has(line.id));
      
      // Task 4.7: 构建导出数据（包含元数据）
      const exportData = {
        metadata: {
          exportDate: new Date().toISOString(),
          count: selectedLines.length,
          planName: data.name || 'TimePlan',
          exportedBy: 'TimePlan Craft Kit',
          version: '1.0.0',
        },
        lines: selectedLines,
      };
      
      // Task 4.7: 导出为JSON文件
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Task 4.7: 文件命名规范
      const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
      const filename = `timeplan_export_${selectedLines.length}tasks_${timestamp}.json`;
      
      // 创建下载链接
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // 释放URL对象
      URL.revokeObjectURL(url);
      
      message.success(`已导出 ${selectedLines.length} 个任务到 ${filename}`);
      
      console.log('[EnhancedTableView] ✅ 批量导出完成:', filename);
    } catch (error) {
      console.error('[EnhancedTableView] ❌ 批量导出失败:', error);
      message.error('导出失败，请重试');
    }
  }, [data, selectedRowKeys]);

  /**
   * 批量设置状态
   */
  const handleBatchSetStatus = useCallback((status: string) => {
    if (!onDataChange || selectedRowKeys.length === 0) return;

    const updatedLines = data.lines.map((line) => {
      if (selectedRowKeys.includes(line.id)) {
        return {
          ...line,
          attributes: {
            ...line.attributes,
            status,
          },
        };
      }
      return line;
    });

    onDataChange({
      ...data,
      lines: updatedLines,
    });

    message.success(`已设置 ${selectedRowKeys.length} 个任务的状态`);
  }, [data, onDataChange, selectedRowKeys]);

  /**
   * 批量设置优先级
   */
  const handleBatchSetPriority = useCallback((priority: string) => {
    if (!onDataChange || selectedRowKeys.length === 0) return;

    const updatedLines = data.lines.map((line) => {
      if (selectedRowKeys.includes(line.id)) {
        return {
          ...line,
          attributes: {
            ...line.attributes,
            priority,
          },
        };
      }
      return line;
    });

    onDataChange({
      ...data,
      lines: updatedLines,
    });

    message.success(`已设置 ${selectedRowKeys.length} 个任务的优先级`);
  }, [data, onDataChange, selectedRowKeys]);

  /**
   * 批量分配负责人
   */
  const handleBatchAssignOwner = useCallback((owner: string) => {
    if (!onDataChange || selectedRowKeys.length === 0) return;

    const updatedLines = data.lines.map((line) => {
      if (selectedRowKeys.includes(line.id)) {
        return {
          ...line,
          attributes: {
            ...line.attributes,
            owner,
          },
        };
      }
      return line;
    });

    onDataChange({
      ...data,
      lines: updatedLines,
    });

    message.success(`已分配负责人给 ${selectedRowKeys.length} 个任务`);
  }, [data, onDataChange, selectedRowKeys]);

  /**
   * Task 4.4: 打开批量编辑对话框
   */
  const handleOpenBatchEdit = useCallback(() => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要编辑的任务');
      return;
    }
    console.log('[EnhancedTableView] 📝 打开批量编辑对话框:', selectedRowKeys.length);
    setBatchEditVisible(true);
  }, [selectedRowKeys]);

  /**
   * Task 4.4: 批量更新任务
   */
  const handleBatchUpdate = useCallback(async (updates: Partial<Line>) => {
    if (!onDataChange || selectedRowKeys.length === 0) {
      throw new Error('无法更新：缺少必要的参数');
    }

    console.log('[EnhancedTableView] 🔄 批量更新任务:', {
      count: selectedRowKeys.length,
      updates,
    });

    const selectedIdSet = new Set(selectedRowKeys);
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

    console.log('[EnhancedTableView] ✅ 批量更新完成');
  }, [data, onDataChange, selectedRowKeys]);

  // 定义列
  const columns: ColumnsType<TableRow> = useMemo(() => {
    const statusOptions: SelectOption[] = [
      { label: '未开始', value: 'not-started' },
      { label: '进行中', value: 'in-progress' },
      { label: '已完成', value: 'completed' },
      { label: '已延期', value: 'delayed' },
    ];

    const priorityOptions: SelectOption[] = [
      { label: 'P0', value: 'P0' },
      { label: 'P1', value: 'P1' },
      { label: 'P2', value: 'P2' },
      { label: 'P3', value: 'P3' },
    ];

    // 所有列的定义
    const allColumns = [
      {
        title: 'Timeline',
        dataIndex: 'timelineName',
        key: 'timeline',  // ← 修复：使用与DEFAULT_COLUMNS一致的key
        width: 120,
        fixed: 'left',
        sorter: (a, b) => a.timelineName.localeCompare(b.timelineName),
      },
      {
        title: '任务名称',
        dataIndex: 'label',
        key: 'name',  // ← 修复：使用与DEFAULT_COLUMNS一致的key
        width: 200,
        fixed: 'left',
        render: (text, record) => (
          <EditableCell
            value={text}
            rowId={record.id}
            columnId="label"
            editorType="text"
            onSave={handleCellSave}
            readonly={readonly}
            validate={{
              required: true,
              maxLength: 100,
            }}
          />
        ),
      },
      {
        title: '类型',
        dataIndex: 'type',
        key: 'type',
        width: 100,
        render: (text) => <Tag>{text}</Tag>,
      },
      {
        title: '负责人',
        dataIndex: 'owner',
        key: 'owner',
        width: 120,
        render: (text, record) => (
          <EditableCell
            value={text || ''}
            rowId={record.id}
            columnId="owner"
            editorType="text"
            onSave={handleCellSave}
            readonly={readonly}
            placeholder="未分配"
          />
        ),
      },
      {
        title: '开始日期',
        dataIndex: 'startDate',
        key: 'startDate',
        width: 140,
        render: (text, record) => (
          <EditableCell
            value={text}
            rowId={record.id}
            columnId="startDate"
            editorType="date"
            onSave={handleCellSave}
            readonly={readonly}
            validate={{
              required: true,
              validator: (val) => {
                const endDate = record.line.endDate;
                if (endDate && new Date(val) > new Date(endDate)) {
                  return '开始日期不能晚于结束日期';
                }
                return null;
              },
            }}
          />
        ),
      },
      {
        title: '结束日期',
        dataIndex: 'endDate',
        key: 'endDate',
        width: 140,
        render: (text, record) => (
          <EditableCell
            value={text}
            rowId={record.id}
            columnId="endDate"
            editorType="date"
            onSave={handleCellSave}
            readonly={readonly}
            validate={{
              validator: (val) => {
                if (!val) return null;
                const startDate = record.line.startDate;
                if (new Date(val) < new Date(startDate)) {
                  return '结束日期不能早于开始日期';
                }
                return null;
              },
            }}
          />
        ),
      },
      {
        title: '时长',
        dataIndex: 'duration',
        key: 'duration',
        width: 80,
        render: (text) => (text ? `${text}天` : '-'),
      },
      {
        title: '进度',
        dataIndex: 'progress',
        key: 'progress',
        width: 150,
        render: (text, record) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Progress percent={text} size="small" style={{ flex: 1, margin: 0 }} />
            <EditableCell
              value={text}
              rowId={record.id}
              columnId="progress"
              editorType="number"
              onSave={handleCellSave}
              readonly={readonly}
              formatDisplay={(val) => `${val}%`}
              validate={{
                validator: (val) => {
                  if (val < 0 || val > 100) {
                    return '进度必须在0-100之间';
                  }
                  return null;
                },
              }}
            />
          </div>
        ),
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 120,
        render: (text, record) => (
          <EditableCell
            value={text || 'not-started'}
            rowId={record.id}
            columnId="status"
            editorType="select"
            options={statusOptions}
            onSave={handleCellSave}
            readonly={readonly}
            formatDisplay={(val) => {
              const option = statusOptions.find((o) => o.value === val);
              const colorMap: Record<string, string> = {
                'not-started': 'default',
                'in-progress': 'processing',
                'completed': 'success',
                'delayed': 'error',
              };
              return <Tag color={colorMap[val]}>{option?.label || val}</Tag>;
            }}
          />
        ),
      },
      {
        title: '优先级',
        dataIndex: 'priority',
        key: 'priority',
        width: 100,
        render: (text, record) => (
          <EditableCell
            value={text || 'P2'}
            rowId={record.id}
            columnId="priority"
            editorType="select"
            options={priorityOptions}
            onSave={handleCellSave}
            readonly={readonly}
            formatDisplay={(val) => {
              const colorMap: Record<string, string> = {
                P0: 'red',
                P1: 'orange',
                P2: 'blue',
                P3: 'default',
              };
              return <Tag color={colorMap[val]}>{val}</Tag>;
            }}
          />
        ),
      },
    ];
    
    // 根据columnConfig过滤和排序列
    if (columnConfig && columnConfig.length > 0) {
      // 创建列key到列定义的映射
      const columnMap = new Map<string, any>();
      allColumns.forEach(col => {
        if (col.key) {
          columnMap.set(col.key as string, col);
        }
      });
      
      // 根据columnConfig过滤visible的列，并按order排序
      const visibleConfigs = columnConfig
        .filter(config => config.visible)
        .sort((a, b) => a.order - b.order);
      
      const filteredColumns = visibleConfigs
        .map(config => columnMap.get(config.key))
        .filter(Boolean);
      
      console.log('[EnhancedTableView] 应用列配置:', {
        totalColumns: allColumns.length,
        visibleColumns: filteredColumns.length,
        columnKeys: filteredColumns.map(c => c.key),
      });
      
      return filteredColumns;
    }
    
    // 没有配置时返回所有列
    return allColumns;
  }, [handleCellSave, readonly, columnConfig]);

  // ========== Task 4.2: 更新行选择配置 ==========
  // 处理全选/取消全选
  const handleSelectAll = useCallback((selected: boolean) => {
    if (selected) {
      const allLineIds = filteredData.map(row => row.id);
      selectAll(allLineIds);
      console.log('[EnhancedTableView] ✅ 全选:', allLineIds.length, '个任务');
    } else {
      clearSelection();
      console.log('[EnhancedTableView] ❌ 取消全选');
    }
  }, [filteredData, selectAll, clearSelection]);
  
  // 行选择配置（使用SelectionStore）
  const rowSelection = useMemo(() => {
    // 如果不在选择模式或只读模式，不显示复选框
    if (readonly || !selectionMode) {
      return undefined;
    }
    
    return {
      selectedRowKeys,
      onChange: (newSelectedRowKeys: React.Key[]) => {
        console.log('[EnhancedTableView] 🔄 选中行变更:', newSelectedRowKeys.length);
        
        // 计算新增和移除的项
        const currentSet = new Set(selectedRowKeys);
        const newSet = new Set(newSelectedRowKeys);
        
        newSelectedRowKeys.forEach(key => {
          if (!currentSet.has(key)) {
            toggleSelection(key as string);
          }
        });
        
        selectedRowKeys.forEach(key => {
          if (!newSet.has(key)) {
            toggleSelection(key as string);
          }
        });
      },
      // 自定义全选复选框
      columnTitle: (
        <Checkbox
          checked={selectedRowKeys.length > 0 && selectedRowKeys.length === filteredData.length}
          indeterminate={selectedRowKeys.length > 0 && selectedRowKeys.length < filteredData.length}
          onChange={(e) => handleSelectAll(e.target.checked)}
        />
      ),
      // 固定复选框列在左侧
      fixed: true,
    };
  }, [selectedRowKeys, filteredData, readonly, selectionMode, toggleSelection, handleSelectAll]);

  // Task 4.2: 调试输出
  console.log('[EnhancedTableView] 渲染状态:', {
    readonly,
    showSearch,
    selectionMode,
    dataSourceCount: filteredData.length,
    selectedCount: selectedRowKeys.length,
    hasRowSelection: !readonly && selectionMode,
  });

  return (
    <div 
      className={className} 
      style={{ 
        ...style, 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 工具栏 */}
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between', flexShrink: 0 }}>
        <Space>
          {showSearch && (
            <Input
              placeholder="搜索任务名称、Timeline、负责人"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
              allowClear
            />
          )}
        </Space>

        {/* Task 4.2: 选择模式切换按钮 */}
        <Space>
          {!readonly && (
            <Tooltip title={selectionMode ? '退出选择模式' : '进入选择模式'}>
              <Button
                type={selectionMode ? 'primary' : 'default'}
                icon={selectionMode ? <CheckSquareOutlined /> : <BorderOutlined />}
                onClick={() => {
                  if (selectionMode) {
                    exitSelectionMode();
                    console.log('[EnhancedTableView] 🚪 退出选择模式');
                  } else {
                    enterSelectionMode();
                    console.log('[EnhancedTableView] 🎯 进入选择模式');
                  }
                }}
              >
                {selectionMode ? '退出选择' : '批量选择'}
              </Button>
            </Tooltip>
          )}
        </Space>
      </Space>

      {/* Task 4.2 & 4.4 & 4.7: 批量操作栏（仅在选择模式下显示） */}
      {!readonly && selectionMode && selectedRowKeys.length > 0 && (
        <div style={{ marginBottom: 16, flexShrink: 0 }}>
          <BatchOperationBar
            selectedCount={selectedRowKeys.length}
            onBatchDelete={handleBatchDelete}
            onBatchSetStatus={handleBatchSetStatus}
            onBatchSetPriority={handleBatchSetPriority}
            onBatchAssignOwner={handleBatchAssignOwner}
            onBatchEdit={handleOpenBatchEdit}
            onBatchExport={handleBatchExport}
          />
        </div>
      )}

      {/* 表格容器 - 填充所有剩余空间 */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <Table<TableRow>
          rowSelection={rowSelection}
          columns={columns}
          dataSource={filteredData}
          pagination={{
            ...pagination,
            style: { marginBottom: 8, marginTop: 8 },
          }}
          onChange={(newPagination) => setPagination(newPagination)}
          scroll={{ 
            x: 1500, 
            y: selectionMode && selectedRowKeys.length > 0 
              ? 'calc(100vh - 340px)'  // 有批量操作栏时减去更多高度
              : 'calc(100vh - 240px)'   // 没有批量操作栏时
          }}
          size="small"
          sticky
        />
      </div>

      {/* Task 4.4: 批量编辑对话框 */}
      <BatchEditDialog
        visible={batchEditVisible}
        selectedLineIds={selectedRowKeys as string[]}
        onClose={() => setBatchEditVisible(false)}
        onBatchUpdate={handleBatchUpdate}
      />

      {/* Task 4.6: 批量删除确认对话框 */}
      <BatchDeleteDialog
        visible={batchDeleteVisible}
        selectedLineIds={selectedRowKeys as string[]}
        data={data}
        onClose={() => setBatchDeleteVisible(false)}
        onConfirm={handleConfirmBatchDelete}
        loading={isDeleting}
      />
    </div>
  );
};

export default EnhancedTableView;
