/**
 * 数据导出对话框
 * 
 * 支持导出为 JSON/CSV/Excel 格式
 * 
 * @version 1.0.0
 * @date 2026-02-03
 */

import React, { useState } from 'react';
import { Modal, Radio, Space, Button, message, Typography } from 'antd';
import { DownloadOutlined, FileTextOutlined, TableOutlined } from '@ant-design/icons';
import { TimePlan } from '@/types/timeplanSchema';
import { downloadJSON, downloadCSV, downloadExcel } from '@/utils/dataExport';

const { Text } = Typography;

export interface ExportDialogProps {
  open: boolean;
  plan: TimePlan | null;
  onClose: () => void;
}

export type ExportFormat = 'json' | 'csv' | 'excel';

/**
 * 导出对话框组件
 */
export const ExportDialog: React.FC<ExportDialogProps> = ({
  open,
  plan,
  onClose,
}) => {
  const [format, setFormat] = useState<ExportFormat>('json');
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (!plan) {
      message.error('没有可导出的项目');
      return;
    }

    setLoading(true);

    try {
      switch (format) {
        case 'json':
          downloadJSON(plan);
          message.success('JSON 文件导出成功');
          break;
        case 'csv':
          downloadCSV(plan);
          message.success('CSV 文件导出成功');
          break;
        case 'excel':
          downloadExcel(plan);
          message.success('Excel 文件导出成功');
          break;
      }

      // 延迟关闭对话框
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error('导出失败:', error);
      message.error('导出失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="导出项目数据"
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          取消
        </Button>,
        <Button
          key="export"
          type="primary"
          icon={<DownloadOutlined />}
          loading={loading}
          onClick={handleExport}
          style={{ color: '#fff' }}
        >
          导出
        </Button>,
      ]}
      width={520}
    >
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        {/* 项目信息 */}
        {plan && (
          <div>
            <Text strong>项目名称：</Text>
            <Text>{plan.title}</Text>
            <br />
            <Text strong>时间线数量：</Text>
            <Text>{plan.timelines.length} 个</Text>
            <br />
            <Text strong>节点数量：</Text>
            <Text>{plan.lines.length} 个</Text>
            <br />
            <Text strong>依赖关系：</Text>
            <Text>{plan.relations.length} 个</Text>
          </div>
        )}

        {/* 格式选择 */}
        <div>
          <Text strong style={{ display: 'block', marginBottom: 12 }}>
            选择导出格式：
          </Text>
          <Radio.Group
            value={format}
            onChange={(e) => setFormat(e.target.value)}
          >
            <Space orientation="vertical">
              <Radio value="json">
                <Space>
                  <FileTextOutlined />
                  <span>
                    <strong>JSON 格式</strong>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      完整数据，可重新导入，推荐备份使用
                    </Text>
                  </span>
                </Space>
              </Radio>
              <Radio value="csv">
                <Space>
                  <TableOutlined />
                  <span>
                    <strong>CSV 格式</strong>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      表格数据（14 个字段），Excel 可直接打开
                    </Text>
                  </span>
                </Space>
              </Radio>
              <Radio value="excel">
                <Space>
                  <TableOutlined />
                  <span>
                    <strong>Excel 格式</strong>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Excel 兼容格式（TSV），适合报表导出
                    </Text>
                  </span>
                </Space>
              </Radio>
            </Space>
          </Radio.Group>
        </div>

        {/* 格式说明 */}
        <div
          style={{
            padding: 12,
            background: '#f5f5f5',
            borderRadius: 4,
            fontSize: 12,
          }}
        >
          {format === 'json' && (
            <Text type="secondary">
              JSON 格式包含所有数据（时间线、节点、依赖关系、基线等），可以完整恢复项目数据。
            </Text>
          )}
          {format === 'csv' && (
            <Text type="secondary">
              CSV 格式包含 14 个字段：Timeline、Timeline Owner、Line ID、Label、Schema、
              Start Date、End Date、Status、Priority、Description、Notes、Color、
              Created At、Updated At。支持 UTF-8 编码，中文显示正常。
            </Text>
          )}
          {format === 'excel' && (
            <Text type="secondary">
              Excel 格式使用 TSV（制表符分隔）格式，兼容 Excel 2016+，
              包含与 CSV 相同的 14 个字段。
            </Text>
          )}
        </div>
      </Space>
    </Modal>
  );
};
