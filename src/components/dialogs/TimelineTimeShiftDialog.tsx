/**
 * TimelineTimeShiftDialog - Timeline时间平移对话框
 * 
 * 功能:
 * - 选择Timeline
 * - 输入偏移天数（正数=延后，负数=提前）
 * - 预览变更
 * - 批量调整该Timeline下所有节点的日期
 * - 可选：保持依赖关系一致性
 * 
 * @version 1.0.0
 * @date 2026-02-07
 * @migrated-from timeline-craft-kit/src/components/timeline/TimelineTimeShiftDialog.tsx
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Modal, Form, Select, InputNumber, Switch, Table, Alert, Space } from 'antd';
import { format, addDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { Timeline, Line } from '@/types/timeplanSchema';

/**
 * TimelineTimeShiftDialog 组件属性
 */
export interface TimelineTimeShiftDialogProps {
  /**
   * 是否打开
   */
  open: boolean;

  /**
   * 关闭回调
   */
  onClose: () => void;

  /**
   * 可用的Timeline列表
   */
  timelines: Timeline[];

  /**
   * 所有节点列表
   */
  lines: Line[];

  /**
   * 确认回调
   */
  onConfirm: (timelineId: string, offsetDays: number, keepRelations: boolean) => void;
}

/**
 * 预览数据项
 */
interface PreviewItem {
  key: string;
  nodeName: string;
  oldStartDate: string;
  newStartDate: string;
  oldEndDate?: string;
  newEndDate?: string;
}

/**
 * TimelineTimeShiftDialog 组件
 */
export const TimelineTimeShiftDialog: React.FC<TimelineTimeShiftDialogProps> = ({
  open,
  onClose,
  timelines,
  lines,
  onConfirm,
}) => {
  const [form] = Form.useForm();
  const [selectedTimelineId, setSelectedTimelineId] = useState<string | null>(null);
  const [offsetDays, setOffsetDays] = useState<number>(0);

  /**
   * 预览数据
   */
  const previewData = useMemo((): PreviewItem[] => {
    if (!selectedTimelineId || offsetDays === 0) {
      return [];
    }

    // 查找选中Timeline下的所有节点
    const timeline = timelines.find(t => t.id === selectedTimelineId);
    if (!timeline) return [];

    const affectedLines = lines.filter(line => line.timelineId === timeline.id);

    return affectedLines.map(line => {
      const newStartDate = addDays(line.startDate, offsetDays);
      const newEndDate = line.endDate ? addDays(line.endDate, offsetDays) : undefined;

      return {
        key: line.id,
        nodeName: line.label,
        oldStartDate: format(line.startDate, 'yyyy-MM-dd', { locale: zhCN }),
        newStartDate: format(newStartDate, 'yyyy-MM-dd', { locale: zhCN }),
        oldEndDate: line.endDate ? format(line.endDate, 'yyyy-MM-dd', { locale: zhCN }) : undefined,
        newEndDate: newEndDate ? format(newEndDate, 'yyyy-MM-dd', { locale: zhCN }) : undefined,
      };
    });
  }, [selectedTimelineId, offsetDays, timelines, lines]);

  /**
   * 影响的节点数量
   */
  const affectedCount = previewData.length;

  /**
   * 处理确认
   */
  const handleOk = useCallback(async () => {
    try {
      const values = await form.validateFields();
      
      onConfirm(
        values.timelineId,
        values.offsetDays,
        values.keepRelations ?? true
      );

      onClose();
      form.resetFields();
      setSelectedTimelineId(null);
      setOffsetDays(0);
    } catch (error) {
      console.error('[TimelineTimeShiftDialog] Validation failed:', error);
    }
  }, [form, onConfirm, onClose]);

  /**
   * 处理取消
   */
  const handleCancel = useCallback(() => {
    onClose();
    form.resetFields();
    setSelectedTimelineId(null);
    setOffsetDays(0);
  }, [onClose, form]);

  /**
   * 预览表格列定义
   */
  const columns = [
    {
      title: '节点名称',
      dataIndex: 'nodeName',
      key: 'nodeName',
      width: 200,
    },
    {
      title: '原开始日期',
      dataIndex: 'oldStartDate',
      key: 'oldStartDate',
      width: 120,
    },
    {
      title: '新开始日期',
      dataIndex: 'newStartDate',
      key: 'newStartDate',
      width: 120,
      render: (text: string) => (
        <span style={{ color: '#1677ff', fontWeight: 500 }}>{text}</span>
      ),
    },
    {
      title: '原结束日期',
      dataIndex: 'oldEndDate',
      key: 'oldEndDate',
      width: 120,
      render: (text?: string) => text || '-',
    },
    {
      title: '新结束日期',
      dataIndex: 'newEndDate',
      key: 'newEndDate',
      width: 120,
      render: (text?: string) => (
        text ? <span style={{ color: '#1677ff', fontWeight: 500 }}>{text}</span> : '-'
      ),
    },
  ];

  return (
    <Modal
      title="Timeline时间平移"
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      okText="确认平移"
      cancelText="取消"
      width={900}
      okButtonProps={{ disabled: affectedCount === 0 }}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          timelineId: undefined,
          offsetDays: 0,
          keepRelations: true,
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* 选择Timeline */}
          <Form.Item
            label="选择Timeline"
            name="timelineId"
            rules={[{ required: true, message: '请选择Timeline' }]}
          >
            <Select
              placeholder="请选择要平移的Timeline"
              options={timelines.map(t => ({
                value: t.id,
                label: t.name,
              }))}
              onChange={(value) => setSelectedTimelineId(value)}
            />
          </Form.Item>

          {/* 偏移天数 */}
          <Form.Item
            label="偏移天数"
            name="offsetDays"
            rules={[
              { required: true, message: '请输入偏移天数' },
              { type: 'number', min: -365, max: 365, message: '偏移天数必须在-365到365之间' },
            ]}
            tooltip="正数=延后，负数=提前"
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="输入偏移天数（正数=延后，负数=提前）"
              addonAfter="天"
              onChange={(value) => setOffsetDays(value || 0)}
            />
          </Form.Item>

          {/* 保持依赖关系 */}
          <Form.Item
            label="保持依赖关系"
            name="keepRelations"
            valuePropName="checked"
            tooltip="启用后，会同时调整相关依赖节点的日期"
          >
            <Switch />
          </Form.Item>

          {/* 预览提示 */}
          {affectedCount > 0 && (
            <Alert
              message={`将影响 ${affectedCount} 个节点`}
              description={`${offsetDays > 0 ? '延后' : '提前'} ${Math.abs(offsetDays)} 天`}
              type="info"
              showIcon
            />
          )}

          {/* 预览表格 */}
          {previewData.length > 0 && (
            <div>
              <div style={{ marginBottom: 8, fontWeight: 500 }}>预览变更：</div>
              <Table
                columns={columns}
                dataSource={previewData}
                pagination={false}
                size="small"
                scroll={{ y: 300 }}
                bordered
              />
            </div>
          )}

          {/* 提示信息 */}
          <Alert
            message="注意事项"
            description={
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>时间平移会同时调整该Timeline下所有节点的日期</li>
                <li>如果启用"保持依赖关系"，相关的依赖节点也会被调整</li>
                <li>建议在平移前先保存当前状态，以便需要时撤销</li>
              </ul>
            }
            type="warning"
            showIcon
          />
        </Space>
      </Form>
    </Modal>
  );
};

export default TimelineTimeShiftDialog;
