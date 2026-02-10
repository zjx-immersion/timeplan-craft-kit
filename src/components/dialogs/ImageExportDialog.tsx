/**
 * ImageExportDialog - 图片导出对话框
 * 
 * 功能:
 * - 选择导出格式（PNG/JPEG）
 * - 选择导出分辨率（1x/2x/3x）
 * - 自定义文件名
 * - JPEG质量调整
 * 
 * @version 1.0.0
 * @date 2026-02-07
 */

import React, { useState, useCallback } from 'react';
import { Modal, Form, Input, Select, Slider, Space, Row, Col } from 'antd';
import { exportToImage, type ExportFormat, type ExportScale } from '@/utils/imageExport';

/**
 * ImageExportDialog 组件属性
 */
export interface ImageExportDialogProps {
  /**
   * 是否打开
   */
  open: boolean;

  /**
   * 关闭回调
   */
  onClose: () => void;

  /**
   * 要导出的DOM元素
   */
  targetElement?: HTMLElement | null;

  /**
   * 默认文件名
   * @default 'timeplan-export'
   */
  defaultFilename?: string;
}

/**
 * ImageExportDialog 组件
 */
export const ImageExportDialog: React.FC<ImageExportDialogProps> = ({
  open,
  onClose,
  targetElement,
  defaultFilename = 'timeplan-export',
}) => {
  const [form] = Form.useForm();
  const [exporting, setExporting] = useState(false);
  const [format, setFormat] = useState<ExportFormat>('png');

  /**
   * 处理导出
   */
  const handleExport = useCallback(async () => {
    if (!targetElement) {
      Modal.error({
        title: '导出失败',
        content: '未找到要导出的元素',
      });
      return;
    }

    try {
      const values = await form.validateFields();
      setExporting(true);

      await exportToImage(targetElement, {
        format: values.format,
        scale: values.scale,
        filename: values.filename.trim() || defaultFilename,
        quality: values.quality / 100,
        showLoading: true,
      });

      onClose();
      form.resetFields();
    } catch (error) {
      console.error('[ImageExportDialog] Export failed:', error);
    } finally {
      setExporting(false);
    }
  }, [targetElement, form, defaultFilename, onClose]);

  /**
   * 处理取消
   */
  const handleCancel = useCallback(() => {
    onClose();
    form.resetFields();
  }, [onClose, form]);

  return (
    <Modal
      title="导出为图片"
      open={open}
      onOk={handleExport}
      onCancel={handleCancel}
      okText="导出"
      cancelText="取消"
      confirmLoading={exporting}
      width={520}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          format: 'png',
          scale: 2,
          filename: defaultFilename,
          quality: 92,
        }}
      >
        <Form.Item
          label="文件名"
          name="filename"
          rules={[
            { required: true, message: '请输入文件名' },
            { max: 100, message: '文件名最多100个字符' },
          ]}
        >
          <Input placeholder="请输入文件名（不含扩展名）" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="导出格式"
              name="format"
              rules={[{ required: true, message: '请选择导出格式' }]}
            >
              <Select
                options={[
                  { value: 'png', label: 'PNG（推荐，无损）' },
                  { value: 'jpeg', label: 'JPEG（较小体积）' },
                ]}
                onChange={(value) => setFormat(value as ExportFormat)}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="分辨率"
              name="scale"
              rules={[{ required: true, message: '请选择分辨率' }]}
              tooltip="更高分辨率导出的图片更清晰，但文件更大"
            >
              <Select
                options={[
                  { value: 1, label: '标准（1x）' },
                  { value: 2, label: '高清（2x，推荐）' },
                  { value: 3, label: '超高清（3x）' },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* JPEG 质量调整 */}
        {format === 'jpeg' && (
          <Form.Item
            label="图片质量"
            name="quality"
            tooltip="质量越高，图片越清晰，但文件越大"
          >
            <Slider
              min={50}
              max={100}
              marks={{
                50: '50%',
                75: '75%',
                92: '92%（推荐）',
                100: '100%',
              }}
            />
          </Form.Item>
        )}

        <Space direction="vertical" size="small" style={{ width: '100%', marginTop: 16 }}>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>
            💡 提示：
          </div>
          <ul style={{ fontSize: 12, color: '#8c8c8c', margin: 0, paddingLeft: 20 }}>
            <li>PNG格式适合需要透明背景或高质量的场景</li>
            <li>JPEG格式适合需要较小文件体积的场景</li>
            <li>推荐使用2x分辨率，兼顾清晰度和文件大小</li>
            <li>导出时会自动隐藏工具栏等UI控件</li>
          </ul>
        </Space>
      </Form>
    </Modal>
  );
};

export default ImageExportDialog;
