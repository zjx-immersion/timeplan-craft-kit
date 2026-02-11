/**
 * 导入预览组件
 * @module ImportPreview
 */

import React from 'react';
import { Table, Tag, Checkbox, Select, Alert, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CheckCircleOutlined, CloseCircleOutlined, WarningOutlined } from '@ant-design/icons';
import type { ParsedRow, ImportOptions, ImportStats } from './types/importTypes';
import type { Timeline } from '@/types/timeplanSchema';
import { format } from 'date-fns';

export interface ImportPreviewProps {
  data: ParsedRow[];
  stats: ImportStats;
  options: ImportOptions;
  timelines: Timeline[];
  onOptionsChange: (options: ImportOptions) => void;
}

/**
 * 导入预览组件
 */
const ImportPreview: React.FC<ImportPreviewProps> = ({
  data,
  stats,
  options,
  timelines,
  onOptionsChange,
}) => {
  // 表格列定义
  const columns: ColumnsType<ParsedRow> = [
    {
      title: '行号',
      dataIndex: 'rowNumber',
      key: 'rowNumber',
      width: 60,
      fixed: 'left',
    },
    {
      title: '状态',
      key: 'status',
      width: 80,
      fixed: 'left',
      render: (_, record) => {
        const errorCount = record.errors.filter(e => e.severity === 'error').length;
        const warningCount = record.errors.filter(e => e.severity === 'warning').length;
        
        if (errorCount > 0) {
          return <Tag icon={<CloseCircleOutlined />} color="error">错误</Tag>;
        }
        if (warningCount > 0) {
          return <Tag icon={<WarningOutlined />} color="warning">警告</Tag>;
        }
        return <Tag icon={<CheckCircleOutlined />} color="success">正常</Tag>;
      },
    },
    {
      title: '任务名称',
      key: 'name',
      width: 200,
      render: (_, record) => (
        <div>
          {record.data.name || <span style={{ color: '#999' }}>（空）</span>}
          {record.errors.some(e => e.field === 'name') && (
            <Tag color="error" style={{ marginLeft: 8 }}>必填</Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Timeline',
      key: 'timeline',
      width: 120,
      render: (_, record) => record.data.timeline || <span style={{ color: '#999' }}>默认</span>,
    },
    {
      title: '类型',
      key: 'type',
      width: 100,
      render: (_, record) => {
        const typeMap: Record<string, string> = {
          'bar': '计划单元',
          'milestone': '里程碑',
          'gateway': '关口',
        };
        return typeMap[record.data.type] || record.data.type;
      },
    },
    {
      title: '负责人',
      dataIndex: ['data', 'owner'],
      key: 'owner',
      width: 100,
    },
    {
      title: '开始日期',
      key: 'startDate',
      width: 120,
      render: (_, record) => {
        if (!record.data.startDate) {
          return <Tag color="error">缺失</Tag>;
        }
        return format(record.data.startDate, 'yyyy-MM-dd');
      },
    },
    {
      title: '结束日期',
      key: 'endDate',
      width: 120,
      render: (_, record) => {
        if (!record.data.endDate) return '-';
        return format(record.data.endDate, 'yyyy-MM-dd');
      },
    },
    {
      title: '进度',
      key: 'progress',
      width: 80,
      render: (_, record) => `${record.data.progress || 0}%`,
    },
    {
      title: '状态',
      key: 'dataStatus',
      width: 100,
      render: (_, record) => record.data.status || '-',
    },
    {
      title: '优先级',
      dataIndex: ['data', 'priority'],
      key: 'priority',
      width: 80,
    },
    {
      title: '错误信息',
      key: 'errors',
      width: 200,
      render: (_, record) => {
        if (record.errors.length === 0) {
          return <span style={{ color: '#52c41a' }}>✓ 验证通过</span>;
        }
        
        return (
          <div>
            {record.errors.map((error, index) => (
              <div key={index} style={{ marginBottom: 4 }}>
                <Tag 
                  color={error.severity === 'error' ? 'error' : 'warning'}
                  style={{ marginBottom: 4 }}
                >
                  {error.field}: {error.message}
                </Tag>
              </div>
            ))}
          </div>
        );
      },
    },
  ];
  
  return (
    <div>
      {/* 统计信息 */}
      <Alert
        message={
          <Space size="large">
            <span>总计: <strong>{stats.total}</strong> 条</span>
            <span style={{ color: '#52c41a' }}>有效: <strong>{stats.valid}</strong> 条</span>
            <span style={{ color: '#ff4d4f' }}>错误: <strong>{stats.invalid}</strong> 条</span>
          </Space>
        }
        type={stats.invalid > 0 ? 'warning' : 'success'}
        showIcon
        style={{ marginBottom: 16 }}
      />
      
      {/* 导入选项 */}
      <div style={{ 
        padding: 16, 
        background: '#fafafa', 
        borderRadius: 4,
        marginBottom: 16,
      }}>
        <h4 style={{ marginBottom: 12 }}>导入选项</h4>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Checkbox
            checked={options.ignoreErrors}
            onChange={e => onOptionsChange({ ...options, ignoreErrors: e.target.checked })}
          >
            忽略警告继续导入（仅跳过有错误的行，警告行仍会导入）
          </Checkbox>
          
          <Checkbox
            checked={options.checkDuplicates}
            onChange={e => onOptionsChange({ ...options, checkDuplicates: e.target.checked })}
          >
            检查重复任务（按任务名称）
          </Checkbox>
          
          <div>
            <span style={{ marginRight: 8 }}>默认Timeline:</span>
            <Select
              value={options.defaultTimeline}
              onChange={value => {
                const timeline = timelines.find(t => t.id === value);
                onOptionsChange({ 
                  ...options, 
                  defaultTimeline: value,
                  defaultTimelineName: timeline?.name || timeline?.label,
                });
              }}
              style={{ width: 200 }}
            >
              {timelines.map(timeline => (
                <Select.Option key={timeline.id} value={timeline.id}>
                  {timeline.name || timeline.label}
                </Select.Option>
              ))}
            </Select>
            <span style={{ marginLeft: 8, color: '#999', fontSize: 12 }}>
              （用于Excel中未指定Timeline的任务）
            </span>
          </div>
        </Space>
      </div>
      
      {/* 数据预览表格 */}
      <Table
        columns={columns}
        dataSource={data}
        rowKey="rowNumber"
        size="small"
        scroll={{ x: 1400, y: 400 }}
        pagination={{
          pageSize: 50,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
        rowClassName={record => 
          record.errors.some(e => e.severity === 'error') ? 'error-row' : ''
        }
      />
      
      <style>{`
        .error-row {
          background-color: #fff1f0 !important;
        }
        .error-row:hover > td {
          background-color: #ffccc7 !important;
        }
      `}</style>
    </div>
  );
};

export default ImportPreview;
