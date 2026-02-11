/**
 * 数据导入对话框
 * 
 * 支持从 JSON 文件导入项目数据
 * 
 * @version 1.0.0
 * @date 2026-02-03
 */

import React, { useState } from 'react';
import { Modal, Upload, Radio, Space, Button, message, Typography, Alert } from 'antd';
import { UploadOutlined, InboxOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import { TimePlan } from '@/types/timeplanSchema';
import { importFromFile, mergePlans, validateAndFixPlan } from '@/utils/dataImport';

const { Text } = Typography;
const { Dragger } = Upload;

export interface ImportDialogProps {
  open: boolean;
  existingPlans: TimePlan[];
  onImport: (plans: TimePlan[]) => void;
  onClose: () => void;
}

export type ImportMode = 'merge' | 'replace';

/**
 * 导入对话框组件
 */
export const ImportDialog: React.FC<ImportDialogProps> = ({
  open,
  existingPlans,
  onImport,
  onClose,
}) => {
  const [mode, setMode] = useState<ImportMode>('merge');
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [importedPlan, setImportedPlan] = useState<TimePlan | null>(null);

  const handleUpload: UploadProps['customRequest'] = async (options) => {
    const { file } = options;
    
    if (!(file instanceof File)) {
      message.error('无效的文件');
      return;
    }

    setLoading(true);

    try {
      const plan = await importFromFile(file);
      
      if (plan) {
        // 验证并修复数据
        const fixed = validateAndFixPlan(plan);
        setImportedPlan(fixed);
        message.success('文件解析成功');
      } else {
        message.error('文件解析失败，请检查文件格式');
        setFileList([]);
      }
    } catch (error) {
      console.error('导入失败:', error);
      message.error('导入失败，请检查文件格式');
      setFileList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = () => {
    if (!importedPlan) {
      message.error('请先选择文件');
      return;
    }

    let resultPlans: TimePlan[];

    if (mode === 'merge') {
      // 合并模式：处理 ID 冲突
      resultPlans = mergePlans(existingPlans, [importedPlan]);
    } else {
      // 替换模式：直接使用导入的数据
      resultPlans = [importedPlan];
    }

    onImport(resultPlans);
    message.success('导入成功');
    
    // 重置状态
    setFileList([]);
    setImportedPlan(null);
    onClose();
  };

  const handleClose = () => {
    setFileList([]);
    setImportedPlan(null);
    setMode('merge');
    onClose();
  };

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    accept: '.json',
    fileList,
    customRequest: handleUpload,
    onChange(info) {
      setFileList(info.fileList.slice(-1)); // 只保留最新的文件
    },
    onRemove() {
      setImportedPlan(null);
      setFileList([]);
    },
  };

  return (
    <Modal
      title="导入项目数据"
      open={open}
      onCancel={handleClose}
      footer={[
        <Button key="cancel" onClick={handleClose}>
          取消
        </Button>,
        <Button
          key="import"
          type="primary"
          icon={<UploadOutlined />}
          disabled={!importedPlan}
          loading={loading}
          onClick={handleImport}
          style={{ color: '#fff' }}
        >
          导入
        </Button>,
      ]}
      width={640}
    >
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        {/* 说明 */}
        <Alert
          message="支持的格式"
          description="仅支持 JSON 格式文件。请确保文件是通过本系统导出的，或符合 TimePlan Schema v2.1.0 规范。"
          type="info"
          showIcon
        />

        {/* 导入模式选择 */}
        <div>
          <Text strong style={{ display: 'block', marginBottom: 12 }}>
            导入模式：
          </Text>
          <Radio.Group value={mode} onChange={(e) => setMode(e.target.value)}>
            <Space orientation="vertical">
              <Radio value="merge">
                <span>
                  <strong>合并模式</strong>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    导入的项目将添加到现有项目列表中。如果 ID 冲突，将自动重命名。
                  </Text>
                </span>
              </Radio>
              <Radio value="replace">
                <span>
                  <strong>替换模式</strong>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    ⚠️ 导入的项目将替换所有现有项目。请谨慎使用。
                  </Text>
                </span>
              </Radio>
            </Space>
          </Radio.Group>
        </div>

        {/* 文件上传 */}
        <div>
          <Text strong style={{ display: 'block', marginBottom: 12 }}>
            选择文件：
          </Text>
          <Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
            <p className="ant-upload-hint">
              支持 JSON 格式文件（.json）
            </p>
          </Dragger>
        </div>

        {/* 导入预览 */}
        {importedPlan && (
          <div
            style={{
              padding: 12,
              background: '#f0f9ff',
              border: '1px solid #91caff',
              borderRadius: 4,
            }}
          >
            <Text strong>导入预览：</Text>
            <br />
            <Text>项目名称：{importedPlan.title}</Text>
            <br />
            <Text>时间线：{importedPlan.timelines.length} 个</Text>
            <br />
            <Text>节点：{importedPlan.lines.length} 个</Text>
            <br />
            <Text>依赖关系：{importedPlan.relations.length} 个</Text>
            <br />
            {importedPlan.baselines && importedPlan.baselines.length > 0 && (
              <>
                <Text>基线：{importedPlan.baselines.length} 个</Text>
                <br />
              </>
            )}
          </div>
        )}

        {/* 警告提示 */}
        {mode === 'replace' && (
          <Alert
            message="警告"
            description={`替换模式将删除现有的 ${existingPlans.length} 个项目。此操作不可撤销，请确保已备份重要数据。`}
            type="warning"
            showIcon
          />
        )}
      </Space>
    </Modal>
  );
};
