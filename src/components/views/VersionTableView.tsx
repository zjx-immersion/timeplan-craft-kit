/**
 * VersionTableView - 版本对比视图
 * 
 * 功能:
 * - 并排对比两个版本
 * - 高亮差异
 * - 支持基准线对比
 * 
 * @version 1.0.0
 * @date 2026-02-03
 */

import React, { useMemo } from 'react';
import { Table, Tag, Space, Card } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { TimePlan } from '@/types/timeplanSchema';
import { format } from 'date-fns';

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
  baseStartDate?: string;
  compareStartDate?: string;
  baseEndDate?: string;
  compareEndDate?: string;
  baseProgress?: number;
  compareProgress?: number;
  hasChanges: boolean;
}

export const VersionTableView: React.FC<VersionTableViewProps> = ({
  baseVersion,
  compareVersion,
  onDiffClick,
  className,
  style,
}) => {
  const diffData = useMemo<DiffRow[]>(() => {
    const baseLines = new Map();
    const compareLines = new Map();
    
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
      
      return {
        key: id,
        id,
        label: base?.label || compare?.label || '',
        baseStartDate: base?.startDate ? format(new Date(base.startDate), 'yyyy-MM-dd') : undefined,
        compareStartDate: compare?.startDate ? format(new Date(compare.startDate), 'yyyy-MM-dd') : undefined,
        baseEndDate: base?.endDate ? format(new Date(base.endDate), 'yyyy-MM-dd') : undefined,
        compareEndDate: compare?.endDate ? format(new Date(compare.endDate), 'yyyy-MM-dd') : undefined,
        baseProgress: base?.progress,
        compareProgress: compare?.progress,
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
          title: '进度',
          dataIndex: 'compareProgress',
          key: 'compareProgress',
          width: 80,
          render: (progress) => progress !== undefined ? `${progress}%` : '-',
        },
      ],
    },
    {
      title: '状态',
      key: 'status',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          {record.hasChanges && <Tag color="warning">已变更</Tag>}
          {!record.baseStartDate && <Tag color="success">新增</Tag>}
          {!record.compareStartDate && <Tag color="error">删除</Tag>}
        </Space>
      ),
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
          pagination={false}
          scroll={{ x: 1200 }}
          bordered
          data-testid="version-table"
        />
      </Card>
    </div>
  );
};

export default VersionTableView;
