/**
 * VersionTableView - 版本对比视图
 * 
 * 功能:
 * - 并排对比两个版本
 * - 高亮差异
 * - 支持基准线对比
 * - 显示类型、依赖、负责人等详细信息
 * 
 * @version 2.0.0
 * @date 2026-02-08
 */

import React, { useMemo } from 'react';
import { Table, Tag, Space, Card, Tooltip } from 'antd';
import { 
  CheckCircleOutlined, 
  FlagOutlined, 
  BorderOutlined,
  ClockCircleOutlined,
  UserOutlined,
  LinkOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { TimePlan, Line } from '@/types/timeplanSchema';
import { format, differenceInDays } from 'date-fns';

export interface VersionTableViewProps {
  baseVersion: TimePlan;
  compareVersion: TimePlan;
  onDiffClick?: (lineId: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

interface DiffRow {
  key: string;
  id: string;
  label: string;
  type: string; // ✅ 新增：类型（bar/milestone/gateway）
  schemaId: string; // ✅ 新增：schema ID
  timelineId: string; // ✅ 新增：所属timeline
  timelineName?: string; // ✅ 新增：所属timeline名称
  owner?: string; // ✅ 新增：负责人
  dependencies?: string[]; // ✅ 新增：依赖关系
  baseStartDate?: string;
  compareStartDate?: string;
  baseEndDate?: string;
  compareEndDate?: string;
  baseProgress?: number;
  compareProgress?: number;
  baseDuration?: number; // ✅ 新增：基准版本时长（天）
  compareDuration?: number; // ✅ 新增：对比版本时长（天）
  hasChanges: boolean;
}

export const VersionTableView: React.FC<VersionTableViewProps> = ({
  baseVersion,
  compareVersion,
  onDiffClick,
  className,
  style,
}) => {
  // ✅ 辅助函数：获取类型显示名称
  const getTypeLabel = (schemaId: string): string => {
    if (schemaId === 'lineplan-schema' || schemaId === 'bar-schema') return '计划单元';
    if (schemaId === 'milestone-schema') return '里程碑';
    if (schemaId === 'gateway-schema') return '关口';
    return '未知';
  };

  // ✅ 辅助函数：获取类型图标
  const getTypeIcon = (schemaId: string) => {
    if (schemaId === 'lineplan-schema' || schemaId === 'bar-schema') return <ClockCircleOutlined style={{ color: '#1890ff' }} />;
    if (schemaId === 'milestone-schema') return <FlagOutlined style={{ color: '#52c41a' }} />;
    if (schemaId === 'gateway-schema') return <BorderOutlined style={{ color: '#faad14' }} />;
    return <CheckCircleOutlined />;
  };

  // ✅ 辅助函数：计算时长（天）
  const calculateDuration = (line: Line): number | undefined => {
    if (!line.endDate || !line.startDate) return undefined;
    return differenceInDays(new Date(line.endDate), new Date(line.startDate));
  };

  // ✅ 辅助函数：获取依赖关系
  const getDependencies = (lineId: string, plan: TimePlan): string[] => {
    return (plan.relations || [])
      .filter(rel => rel.toLineId === lineId)
      .map(rel => {
        const fromLine = plan.lines?.find(l => l.id === rel.fromLineId);
        return fromLine?.label || rel.fromLineId;
      });
  };

  // ✅ 辅助函数：获取Timeline名称
  const getTimelineName = (timelineId: string, plan: TimePlan): string | undefined => {
    const timeline = plan.timelines?.find(tl => tl.id === timelineId);
    return timeline?.title || timeline?.name;
  };

  const diffData = useMemo<DiffRow[]>(() => {
    const baseLines = new Map<string, Line>();
    const compareLines = new Map<string, Line>();
    
    // 从TimePlan的lines数组中获取lines
    baseVersion.lines?.forEach(line => {
      baseLines.set(line.id, line);
    });
    
    compareVersion.lines?.forEach(line => {
      compareLines.set(line.id, line);
    });
    
    const allIds = new Set([...baseLines.keys(), ...compareLines.keys()]);
    
    return Array.from(allIds).map(id => {
      const base = baseLines.get(id);
      const compare = compareLines.get(id);
      
      const hasChanges = base && compare && (
        base.startDate !== compare.startDate ||
        base.endDate !== compare.endDate ||
        base.progress !== compare.progress
      );
      
      const line = base || compare;
      
      return {
        key: id,
        id,
        label: line?.label || '',
        type: getTypeLabel(line?.schemaId || ''),
        schemaId: line?.schemaId || '',
        timelineId: line?.timelineId || '',
        timelineName: getTimelineName(line?.timelineId || '', baseVersion),
        owner: line?.attributes?.owner || undefined,
        dependencies: getDependencies(id, baseVersion),
        baseStartDate: base?.startDate ? format(new Date(base.startDate), 'yyyy-MM-dd') : undefined,
        compareStartDate: compare?.startDate ? format(new Date(compare.startDate), 'yyyy-MM-dd') : undefined,
        baseEndDate: base?.endDate ? format(new Date(base.endDate), 'yyyy-MM-dd') : undefined,
        compareEndDate: compare?.endDate ? format(new Date(compare.endDate), 'yyyy-MM-dd') : undefined,
        baseProgress: base?.progress,
        compareProgress: compare?.progress,
        baseDuration: base ? calculateDuration(base) : undefined,
        compareDuration: compare ? calculateDuration(compare) : undefined,
        hasChanges: !!hasChanges,
      };
    });
  }, [baseVersion, compareVersion]);

  const columns: ColumnsType<DiffRow> = [
    {
      title: '任务名称',
      dataIndex: 'label',
      key: 'label',
      width: 200,
      fixed: 'left',
      render: (text, record) => (
        <Space>
          {getTypeIcon(record.schemaId)}
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      fixed: 'left',
      render: (type, record) => {
        let color = 'default';
        if (record.schemaId === 'lineplan-schema' || record.schemaId === 'bar-schema') color = 'blue';
        if (record.schemaId === 'milestone-schema') color = 'green';
        if (record.schemaId === 'gateway-schema') color = 'orange';
        return <Tag color={color}>{type}</Tag>;
      },
    },
    {
      title: '所属阶段',
      dataIndex: 'timelineName',
      key: 'timelineName',
      width: 150,
      fixed: 'left',
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <span>{text || '-'}</span>
        </Tooltip>
      ),
    },
    {
      title: '负责人',
      dataIndex: 'owner',
      key: 'owner',
      width: 100,
      render: (owner) => owner ? (
        <Space>
          <UserOutlined style={{ color: '#8c8c8c' }} />
          <span>{owner}</span>
        </Space>
      ) : '-',
    },
    {
      title: '依赖',
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
      title: '基准版本',
      children: [
        {
          title: '开始日期',
          dataIndex: 'baseStartDate',
          key: 'baseStartDate',
          width: 120,
          render: (date, record) => (
            <span style={{ color: record.hasChanges ? '#ff4d4f' : undefined }}>
              {date || '-'}
            </span>
          ),
        },
        {
          title: '结束日期',
          dataIndex: 'baseEndDate',
          key: 'baseEndDate',
          width: 120,
          render: (date, record) => (
            <span style={{ color: record.hasChanges ? '#ff4d4f' : undefined }}>
              {date || '-'}
            </span>
          ),
        },
        {
          title: '时长(天)',
          dataIndex: 'baseDuration',
          key: 'baseDuration',
          width: 100,
          render: (duration) => duration !== undefined ? `${duration}天` : '-',
        },
        {
          title: '进度',
          dataIndex: 'baseProgress',
          key: 'baseProgress',
          width: 80,
          render: (progress) => progress !== undefined ? `${progress}%` : '-',
        },
      ],
    },
    {
      title: '对比版本',
      children: [
        {
          title: '开始日期',
          dataIndex: 'compareStartDate',
          key: 'compareStartDate',
          width: 120,
          render: (date, record) => (
            <span style={{ color: record.hasChanges ? '#52c41a' : undefined }}>
              {date || '-'}
            </span>
          ),
        },
        {
          title: '结束日期',
          dataIndex: 'compareEndDate',
          key: 'compareEndDate',
          width: 120,
          render: (date, record) => (
            <span style={{ color: record.hasChanges ? '#52c41a' : undefined }}>
              {date || '-'}
            </span>
          ),
        },
        {
          title: '时长(天)',
          dataIndex: 'compareDuration',
          key: 'compareDuration',
          width: 100,
          render: (duration) => duration !== undefined ? `${duration}天` : '-',
        },
        {
          title: '进度',
          dataIndex: 'compareProgress',
          key: 'compareProgress',
          width: 80,
          render: (progress) => progress !== undefined ? `${progress}%` : '-',
        },
      ],
    },
  ];

  return (
    <div
      className={className}
      style={{
        padding: 16,
        background: '#fff',
        height: '100%',
        overflow: 'auto',
        ...style,
      }}
      data-testid="version-table-view"
    >
      <Card title="版本对比">
        <Table
          columns={columns}
          dataSource={diffData}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 项`,
          }}
          scroll={{ x: 1800 }}
          bordered
          size="middle"
          data-testid="version-table"
        />
      </Card>
    </div>
  );
};

export default VersionTableView;
