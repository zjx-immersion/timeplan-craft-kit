/**
 * TableView - 表格视图组件
 * 
 * 功能:
 * - 以表格形式展示所有 Timeline 和 Line
 * - 支持排序、筛选、搜索
 * - 可编辑（双击）
 * - 支持导出
 * 
 * @version 1.0.0
 * @date 2026-02-03
 */

import React, { useState, useMemo } from 'react';
import { Table, Input, Button, Space, Tag, Tooltip, Progress } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import {
  SearchOutlined,
  ExportOutlined,
  EditOutlined,
  ClockCircleOutlined,
  FlagOutlined,
  BorderOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import type { TimePlan, Line, Timeline } from '@/types/timeplanSchema';
import { format, differenceInDays } from 'date-fns';

/**
 * 表格视图属性
 */
export interface TableViewProps {
  /**
   * TimePlan 数据
   */
  data: TimePlan;

  /**
   * 数据变化回调
   */
  onDataChange?: (data: TimePlan) => void;

  /**
   * 行编辑回调
   */
  onEdit?: (line: Line) => void;

  /**
   * 导出回调
   */
  onExport?: () => void;

  /**
   * 是否只读
   * @default false
   */
  readonly?: boolean;

  /**
   * 是否显示搜索
   * @default true
   */
  showSearch?: boolean;

  /**
   * 自定义类名
   */
  className?: string;

  /**
   * 自定义样式
   */
  style?: React.CSSProperties;
}

/**
 * 表格行数据
 */
interface TableRow {
  key: string;
  id: string;
  timelineId: string;
  timelineName: string;
  label: string;
  type: string; // 类型（计划单元/里程碑/关口）
  schemaId: string; // schema ID
  owner?: string;
  startDate: string;
  endDate: string;
  duration?: number; // 时长（天）
  dependencies?: string[]; // 依赖关系
  progress: number;
  status?: string;
  priority?: string;
  tags?: string[];
  line: Line;
}

/**
 * TableView 组件
 */
export const TableView: React.FC<TableViewProps> = ({
  data,
  onDataChange,
  onEdit,
  onExport,
  readonly = false,
  showSearch = true,
  className,
  style,
}) => {
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 50,
    showSizeChanger: true,
    showTotal: (total) => `共 ${total} 条`,
  });

  // 辅助函数：获取类型显示名称
  const getTypeLabel = (schemaId: string): string => {
    if (schemaId === 'lineplan-schema' || schemaId === 'bar-schema') return '计划单元';
    if (schemaId === 'milestone-schema') return '里程碑';
    if (schemaId === 'gateway-schema') return '关口';
    return '未知';
  };

  // 辅助函数：获取类型图标
  const getTypeIcon = (schemaId: string) => {
    if (schemaId === 'lineplan-schema' || schemaId === 'bar-schema') return <ClockCircleOutlined style={{ color: '#1890ff' }} />;
    if (schemaId === 'milestone-schema') return <FlagOutlined style={{ color: '#52c41a' }} />;
    if (schemaId === 'gateway-schema') return <BorderOutlined style={{ color: '#faad14' }} />;
    return null;
  };

  // 辅助函数：计算时长
  const calculateDuration = (line: Line): number | undefined => {
    if (!line.endDate || !line.startDate) return undefined;
    return differenceInDays(new Date(line.endDate), new Date(line.startDate));
  };

  // 辅助函数：获取依赖关系
  const getDependencies = (lineId: string): string[] => {
    return (data.relations || [])
      .filter(rel => rel.toLineId === lineId)
      .map(rel => {
        const fromLine = data.lines?.find(l => l.id === rel.fromLineId);
        return fromLine?.label || rel.fromLineId;
      });
  };

  /**
   * 将 TimePlan 数据转换为表格行
   */
  const tableData = useMemo<TableRow[]>(() => {
    const rows: TableRow[] = [];

    // 创建 timeline 映射以便快速查找
    const timelineMap = new Map<string, Timeline>(data.timelines?.map(t => [t.id, t]) || []);

    data.lines?.forEach((line: Line) => {
      const timeline = timelineMap.get(line.timelineId);

      rows.push({
        key: line.id,
        id: line.id,
        timelineId: line.timelineId,
        timelineName: timeline?.name || 'Unknown',
        label: line.label,
        type: getTypeLabel(line.schemaId),
        schemaId: line.schemaId,
        // 从 attributes 中提取属性
        owner: line.attributes?.owner || '-',
        startDate: line.startDate ? format(new Date(line.startDate), 'yyyy-MM-dd') : '-',
        endDate: line.endDate ? format(new Date(line.endDate), 'yyyy-MM-dd') : '-',
        duration: calculateDuration(line),
        dependencies: getDependencies(line.id),
        progress: line.attributes?.progress || 0,
        status: line.attributes?.status,
        priority: line.attributes?.priority,
        tags: line.attributes?.tags || [],
        line,
      });
    });

    return rows;
  }, [data]);

  /**
   * 筛选后的数据
   */
  const filteredData = useMemo(() => {
    if (!searchText) {
      return tableData;
    }

    const lowerSearch = searchText.toLowerCase();
    return tableData.filter((row) =>
      row.label.toLowerCase().includes(lowerSearch) ||
      row.timelineName.toLowerCase().includes(lowerSearch) ||
      row.owner?.toLowerCase().includes(lowerSearch) ||
      row.status?.toLowerCase().includes(lowerSearch)
    );
  }, [tableData, searchText]);

  /**
   * 表格列定义
   */
  const columns = useMemo<ColumnsType<TableRow>>(() => [
    {
      title: 'Timeline',
      dataIndex: 'timelineName',
      key: 'timelineName',
      width: 150,
      fixed: 'left',
      sorter: (a, b) => a.timelineName.localeCompare(b.timelineName),
      filters: Array.from(new Set(tableData.map(row => row.timelineName))).map(name => ({
        text: name,
        value: name,
      })),
      onFilter: (value, record) => record.timelineName === value,
    },
    {
      title: '名称',
      dataIndex: 'label',
      key: 'label',
      width: 200,
      fixed: 'left',
      sorter: (a, b) => a.label.localeCompare(b.label),
      render: (text, record) => (
        <Space>
          {getTypeIcon(record.schemaId)}
          <Tooltip title={text}>
            <span>{text}</span>
          </Tooltip>
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      fixed: 'left',
      filters: [
        { text: '计划单元', value: '计划单元' },
        { text: '里程碑', value: '里程碑' },
        { text: '关口', value: '关口' },
      ],
      onFilter: (value, record) => record.type === value,
      render: (type, record) => {
        let color = 'default';
        if (record.schemaId === 'lineplan-schema' || record.schemaId === 'bar-schema') color = 'blue';
        if (record.schemaId === 'milestone-schema') color = 'green';
        if (record.schemaId === 'gateway-schema') color = 'orange';
        return <Tag color={color}>{type}</Tag>;
      },
    },
    {
      title: '负责人',
      dataIndex: 'owner',
      key: 'owner',
      width: 100,
      sorter: (a, b) => (a.owner || '').localeCompare(b.owner || ''),
      filters: Array.from(new Set(tableData.map(row => row.owner).filter(Boolean))).map(owner => ({
        text: owner!,
        value: owner!,
      })),
      onFilter: (value, record) => record.owner === value,
    },
    {
      title: '开始日期',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 120,
      sorter: (a, b) => a.startDate.localeCompare(b.startDate),
    },
    {
      title: '结束日期',
      dataIndex: 'endDate',
      key: 'endDate',
      width: 120,
      sorter: (a, b) => a.endDate.localeCompare(b.endDate),
    },
    {
      title: '时长(天)',
      dataIndex: 'duration',
      key: 'duration',
      width: 100,
      sorter: (a, b) => (a.duration || 0) - (b.duration || 0),
      render: (duration?: number) => duration !== undefined ? `${duration}天` : '-',
    },
    {
      title: '依赖关系',
      dataIndex: 'dependencies',
      key: 'dependencies',
      width: 150,
      render: (deps: string[]) => {
        if (!deps || deps.length === 0) return '-';
        if (deps.length === 1) {
          return (
            <Space size={4}>
              <LinkOutlined style={{ color: '#1890ff', fontSize: 12 }} />
              <Tooltip title={deps[0]}>
                <span style={{ color: '#1890ff', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block' }}>
                  {deps[0]}
                </span>
              </Tooltip>
            </Space>
          );
        }
        return (
          <Tooltip title={deps.join(', ')}>
            <Tag color="blue" icon={<LinkOutlined />}>
              {deps.length} 个依赖
            </Tag>
          </Tooltip>
        );
      },
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      width: 150,
      sorter: (a, b) => a.progress - b.progress,
      render: (progress: number) => (
        <Progress
          percent={progress}
          size="small"
          status={progress >= 100 ? 'success' : 'active'}
        />
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      filters: [
        { text: '未开始', value: 'not-started' },
        { text: '进行中', value: 'in-progress' },
        { text: '已完成', value: 'completed' },
        { text: '已取消', value: 'cancelled' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status?: string) => {
        const statusConfig: Record<string, { color: string; text: string }> = {
          'not-started': { color: 'default', text: '未开始' },
          'in-progress': { color: 'processing', text: '进行中' },
          'completed': { color: 'success', text: '已完成' },
          'cancelled': { color: 'error', text: '已取消' },
        };

        const config = statusConfig[status || ''] || { color: 'default', text: status || '-' };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      filters: [
        { text: '高', value: 'high' },
        { text: '中', value: 'medium' },
        { text: '低', value: 'low' },
      ],
      onFilter: (value, record) => record.priority === value,
      sorter: (a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return (priorityOrder[a.priority as keyof typeof priorityOrder] || 0) -
          (priorityOrder[b.priority as keyof typeof priorityOrder] || 0);
      },
      render: (priority?: string) => {
        const priorityConfig: Record<string, { color: string; text: string }> = {
          high: { color: 'red', text: '高' },
          medium: { color: 'orange', text: '中' },
          low: { color: 'green', text: '低' },
        };

        const config = priorityConfig[priority || ''] || { color: 'default', text: priority || '-' };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          {!readonly && onEdit && (
            <Tooltip title="编辑">
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                onClick={() => onEdit(record.line)}
                data-testid={`edit-${record.id}`}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ], [tableData, readonly, onEdit]);

  return (
    <div
      className={className}
      style={{
        padding: 16,
        background: '#fff',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
      data-testid="table-view"
    >
      {/* 工具栏 */}
      <Space style={{ marginBottom: 16 }}>
        {showSearch && (
          <Input
            placeholder="搜索 Timeline、名称、负责人..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
            data-testid="search-input"
          />
        )}

        {onExport && (
          <Button
            icon={<ExportOutlined />}
            onClick={onExport}
            data-testid="export-button"
          >
            导出
          </Button>
        )}

        <span style={{ color: '#666' }}>
          共 {filteredData.length} 条记录
        </span>
      </Space>

      {/* 表格 */}
      <Table
        columns={columns}
        dataSource={filteredData}
        pagination={pagination}
        onChange={(newPagination) => setPagination(newPagination)}
        scroll={{ x: 1400, y: 'calc(100vh - 300px)' }}
        size="middle"
        bordered
        data-testid="data-table"
      />
    </div>
  );
};

export default TableView;
