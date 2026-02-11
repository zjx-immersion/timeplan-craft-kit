/**
 * Excel导出对话框
 * @module ExportDialog
 */

import React, { useState, useCallback } from 'react';
import { Modal, Radio, Checkbox, Input, Button, Space, Alert, Form } from 'antd';
import type { RadioChangeEvent } from 'antd';
import { format } from 'date-fns';
import { exportToExcel } from './excelExporter';
import type { ExportOptions } from './excelExporter';
import type { Line, Timeline } from '@/types/timeplanSchema';

export interface ExportDialogProps {
  visible: boolean;
  onClose: () => void;
  lines: Line[];
  timelines: Timeline[];
  selectedRowKeys: string[];
  filteredData?: any[];
}

/**
 * 导出对话框组件
 */
const ExportDialog: React.FC<ExportDialogProps> = ({
  visible,
  onClose,
  lines,
  timelines,
  selectedRowKeys,
  filteredData,
}) => {
  const [range, setRange] = useState<'all' | 'selected' | 'filtered'>('all');
  const [columns, setColumns] = useState<string[]>([
    'timeline',
    'name',
    'type',
    'owner',
    'startDate',
    'endDate',
    'progress',
    'status',
  ]);
  const [dateFormat, setDateFormat] = useState('yyyy-MM-dd');
  const [filename, setFilename] = useState(
    `Orion X 任务列表_${format(new Date(), 'yyyyMMdd_HHmmss')}`
  );
  const [exporting, setExporting] = useState(false);
  
  // 所有可用列
  const availableColumns = [
    { key: 'timeline', label: 'Timeline' },
    { key: 'name', label: '任务名称' },
    { key: 'type', label: '类型' },
    { key: 'owner', label: '负责人' },
    { key: 'startDate', label: '开始日期' },
    { key: 'endDate', label: '结束日期' },
    { key: 'duration', label: '时长（天）' },
    { key: 'progress', label: '进度' },
    { key: 'status', label: '状态' },
    { key: 'priority', label: '优先级' },
    { key: 'description', label: '描述' },
    { key: 'tags', label: '标签' },
  ];
  
  // 处理导出
  const handleExport = useCallback(async () => {
    try {
      setExporting(true);
      
      const options: ExportOptions = {
        range,
        selectedRowKeys: range === 'selected' ? selectedRowKeys : undefined,
        filteredData: range === 'filtered' ? filteredData : undefined,
        columns,
        includeHeader: true,
        dateFormat,
        filename,
      };
      
      exportToExcel(lines, timelines, options);
      
      // 延迟关闭对话框
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error('[ExportDialog] 导出失败:', error);
      Modal.error({
        title: '导出失败',
        content: error instanceof Error ? error.message : '未知错误',
      });
    } finally {
      setExporting(false);
    }
  }, [range, selectedRowKeys, filteredData, columns, dateFormat, filename, lines, timelines, onClose]);
  
  // 计算导出数量
  const getExportCount = (): number => {
    if (range === 'all') return lines.length;
    if (range === 'selected') return selectedRowKeys.length;
    if (range === 'filtered') return filteredData?.length || 0;
    return 0;
  };
  
  const exportCount = getExportCount();
  
  return (
    <Modal
      title="导出Excel"
      open={visible}
      onCancel={onClose}
      onOk={handleExport}
      confirmLoading={exporting}
      okText="导出"
      cancelText="取消"
      okButtonProps={{ 
        style: { 
          backgroundColor: '#14B8A6',
          borderColor: '#14B8A6',
          color: '#fff'
        } 
      }}
      width={600}
    >
      <Form layout="vertical">
        {/* 导出范围 */}
        <Form.Item label="导出范围">
          <Radio.Group 
            value={range} 
            onChange={(e: RadioChangeEvent) => setRange(e.target.value)}
          >
            <Space direction="vertical">
              <Radio value="all">
                全部数据 ({lines.length}条)
              </Radio>
              <Radio value="selected" disabled={selectedRowKeys.length === 0}>
                选中行 ({selectedRowKeys.length}条)
                {selectedRowKeys.length === 0 && (
                  <span style={{ color: '#999', marginLeft: 8 }}>（未选中任何行）</span>
                )}
              </Radio>
              <Radio value="filtered" disabled={!filteredData || filteredData.length === 0}>
                当前筛选结果 ({filteredData?.length || 0}条)
                {(!filteredData || filteredData.length === 0) && (
                  <span style={{ color: '#999', marginLeft: 8 }}>（未应用筛选）</span>
                )}
              </Radio>
            </Space>
          </Radio.Group>
        </Form.Item>
        
        {/* 导出列 */}
        <Form.Item label="导出列">
          <Checkbox.Group
            value={columns}
            onChange={(checkedValues) => setColumns(checkedValues as string[])}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px 16px' }}>
              {availableColumns.map(col => (
                <Checkbox key={col.key} value={col.key}>
                  {col.label}
                </Checkbox>
              ))}
            </div>
          </Checkbox.Group>
          {columns.length === 0 && (
            <Alert 
              message="请至少选择一列" 
              type="warning" 
              showIcon 
              style={{ marginTop: 8 }}
            />
          )}
        </Form.Item>
        
        {/* 日期格式 */}
        <Form.Item label="日期格式">
          <Radio.Group value={dateFormat} onChange={(e) => setDateFormat(e.target.value)}>
            <Space>
              <Radio value="yyyy-MM-dd">2026-03-01</Radio>
              <Radio value="yyyy/MM/dd">2026/03/01</Radio>
              <Radio value="yyyy.MM.dd">2026.03.01</Radio>
              <Radio value="MM-dd">03-01</Radio>
            </Space>
          </Radio.Group>
        </Form.Item>
        
        {/* 文件名 */}
        <Form.Item label="文件名">
          <Input
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            placeholder="请输入文件名"
            suffix=".xlsx"
          />
        </Form.Item>
        
        {/* 导出信息 */}
        <Alert
          message={`将导出 ${exportCount} 条数据，包含 ${columns.length} 列`}
          type="info"
          showIcon
        />
      </Form>
    </Modal>
  );
};

export default ExportDialog;
