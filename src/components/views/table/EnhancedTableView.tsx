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

import React, { useState, useMemo, useCallback } from 'react';
import { Table, Input, Button, Space, Tag, Tooltip, Progress, message } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import {
  SearchOutlined,
  ExportOutlined,
} from '@ant-design/icons';
import type { TimePlan, Line } from '@/types/timeplanSchema';
import { format, differenceInDays } from 'date-fns';
import EditableCell from './EditableCell';
import type { SelectOption } from './EditableCell';
import BatchOperationBar from './BatchOperationBar';

export interface EnhancedTableViewProps {
  data: TimePlan;
  onDataChange?: (data: TimePlan) => void;
  readonly?: boolean;
  showSearch?: boolean;
  className?: string;
  style?: React.CSSProperties;
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
}) => {
  const [searchText, setSearchText] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 50,
    showSizeChanger: true,
    showTotal: (total) => `共 ${total} 条`,
  });

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

    return lines.map((line) => {
      const timeline = timelines.find((t) => t.id === line.timelineId);
      return {
        key: line.id,
        id: line.id,
        timelineId: line.timelineId,
        timelineName: timeline?.label || '未知',
        label: line.label,
        type: getTypeLabel(line.schemaId),
        schemaId: line.schemaId,
        owner: line.attributes?.owner,
        startDate: format(new Date(line.startDate), 'yyyy-MM-dd'),
        endDate: line.endDate ? format(new Date(line.endDate), 'yyyy-MM-dd') : '',
        duration: calculateDuration(line),
        progress: (line.attributes?.progress as number) || 0,
        status: line.attributes?.status as string,
        priority: line.attributes?.priority as string,
        line,
      };
    });
  }, [data]);

  // 搜索过滤
  const filteredData = useMemo(() => {
    if (!searchText.trim()) return tableData;
    
    const lowerSearch = searchText.toLowerCase();
    return tableData.filter(
      (row) =>
        row.label.toLowerCase().includes(lowerSearch) ||
        row.timelineName.toLowerCase().includes(lowerSearch) ||
        row.owner?.toLowerCase().includes(lowerSearch)
    );
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
   * 批量删除
   */
  const handleBatchDelete = useCallback(() => {
    if (!onDataChange || selectedRowKeys.length === 0) return;

    const updatedLines = data.lines.filter((l) => !selectedRowKeys.includes(l.id));
    const updatedRelations = data.relations.filter(
      (r) => !selectedRowKeys.includes(r.from) && !selectedRowKeys.includes(r.to)
    );

    onDataChange({
      ...data,
      lines: updatedLines,
      relations: updatedRelations,
    });

    setSelectedRowKeys([]);
    message.success(`已删除 ${selectedRowKeys.length} 个任务`);
  }, [data, onDataChange, selectedRowKeys]);

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

    return [
      {
        title: 'Timeline',
        dataIndex: 'timelineName',
        key: 'timelineName',
        width: 120,
        fixed: 'left',
        sorter: (a, b) => a.timelineName.localeCompare(b.timelineName),
      },
      {
        title: '名称',
        dataIndex: 'label',
        key: 'label',
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
  }, [handleCellSave, readonly]);

  // 行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  return (
    <div className={className} style={style}>
      {/* 工具栏 */}
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
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

        <Space>
          <Button icon={<ExportOutlined />}>
            导出
          </Button>
        </Space>
      </Space>

      {/* 批量操作栏 */}
      {!readonly && (
        <div style={{ marginBottom: 16 }}>
          <BatchOperationBar
            selectedCount={selectedRowKeys.length}
            onBatchDelete={handleBatchDelete}
            onBatchSetStatus={handleBatchSetStatus}
            onBatchSetPriority={handleBatchSetPriority}
            onBatchAssignOwner={handleBatchAssignOwner}
          />
        </div>
      )}

      {/* 表格 */}
      <Table<TableRow>
        rowSelection={readonly ? undefined : rowSelection}
        columns={columns}
        dataSource={filteredData}
        pagination={pagination}
        onChange={(newPagination) => setPagination(newPagination)}
        scroll={{ x: 1500 }}
        size="small"
      />
    </div>
  );
};

export default EnhancedTableView;
