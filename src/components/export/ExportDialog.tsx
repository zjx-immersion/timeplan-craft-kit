/**
 * ExportDialog - 导出对话框
 * 
 * 统一的导出功能入口：
 * - Excel导出（矩阵/任务/里程碑/门禁）
 * - PNG图片导出
 * - PDF文档导出
 * 
 * @version 1.0.0
 */

import React, { useState } from 'react';
import {
  Modal,
  Tabs,
  Form,
  Input,
  Switch,
  Select,
  Button,
  Space,
  message,
  Divider,
  Alert,
} from 'antd';
import {
  FileExcelOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import type { TimePlan } from '@/types/timeplanSchema';
import type { MatrixDataV3 } from '@/utils/matrix-v3';
import {
  exportMatrixToExcel,
  exportTasksToExcel,
  type ExportOptions,
} from '@/utils/export/matrixExporter';
import {
  exportToPng,
  exportToPdf,
  type PngExportOptions,
  type PdfExportOptions,
} from '@/utils/export/imageExporter';

/**
 * ExportDialog Props
 */
export interface ExportDialogProps {
  /** 是否显示对话框 */
  visible: boolean;
  /** 关闭对话框回调 */
  onClose: () => void;
  /** TimePlan数据 */
  plan: TimePlan;
  /** 矩阵数据（可选） */
  matrixData?: MatrixDataV3;
  /** 要导出的DOM元素（用于图像导出） */
  targetElement?: HTMLElement | null;
}

/**
 * ExportDialog组件
 */
export const ExportDialog: React.FC<ExportDialogProps> = ({
  visible,
  onClose,
  plan,
  matrixData,
  targetElement,
}) => {
  const [exporting, setExporting] = useState(false);
  const [excelForm] = Form.useForm();
  const [pngForm] = Form.useForm();
  const [pdfForm] = Form.useForm();

  /**
   * 导出Excel
   */
  const handleExportExcel = async () => {
    try {
      const values = await excelForm.validateFields();
      
      if (!matrixData) {
        message.warning('矩阵数据不可用，仅导出任务列表');
        await exportTasksToExcel(plan.lines, plan.timelines, values.filename);
        message.success('Excel导出成功！');
        return;
      }
      
      setExporting(true);
      
      const options: ExportOptions = {
        filename: values.filename || plan.name || '时间计划',
        includeTasks: values.includeTasks,
        includeMilestones: values.includeMilestones,
        includeGateways: values.includeGateways,
      };
      
      await exportMatrixToExcel(matrixData, plan, options);
      
      message.success('Excel导出成功！');
    } catch (error) {
      console.error('Excel导出失败:', error);
      message.error('Excel导出失败');
    } finally {
      setExporting(false);
    }
  };

  /**
   * 导出PNG
   */
  const handleExportPng = async () => {
    if (!targetElement) {
      message.warning('未找到要导出的元素');
      return;
    }
    
    try {
      const values = await pngForm.validateFields();
      setExporting(true);
      
      const options: PngExportOptions = {
        filename: values.filename || plan.name || '时间计划',
        quality: values.quality,
        scale: values.scale,
        backgroundColor: values.backgroundColor,
      };
      
      await exportToPng(targetElement, options);
      
      message.success('PNG导出成功！');
    } catch (error) {
      console.error('PNG导出失败:', error);
      message.error('PNG导出失败');
    } finally {
      setExporting(false);
    }
  };

  /**
   * 导出PDF
   */
  const handleExportPdf = async () => {
    if (!targetElement) {
      message.warning('未找到要导出的元素');
      return;
    }
    
    try {
      const values = await pdfForm.validateFields();
      setExporting(true);
      
      const options: PdfExportOptions = {
        filename: values.filename || plan.name || '时间计划',
        orientation: values.orientation,
        format: values.format,
        imageQuality: values.imageQuality,
        fitToPage: values.fitToPage,
      };
      
      await exportToPdf(targetElement, options);
      
      message.success('PDF导出成功！');
    } catch (error) {
      console.error('PDF导出失败:', error);
      message.error('PDF导出失败');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Modal
      title="导出数据"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Tabs
        defaultActiveKey="excel"
        items={[
          {
            key: 'excel',
            label: (
              <span>
                <FileExcelOutlined /> Excel
              </span>
            ),
            children: (
              <div>
                <Alert
                  message="导出为Excel格式，包含矩阵视图、任务列表、里程碑和门禁详情。"
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
                
                <Form
                  form={excelForm}
                  layout="vertical"
                  initialValues={{
                    filename: plan.name || '时间计划',
                    includeTasks: true,
                    includeMilestones: true,
                    includeGateways: true,
                  }}
                >
                  <Form.Item
                    label="文件名"
                    name="filename"
                    rules={[{ required: true, message: '请输入文件名' }]}
                  >
                    <Input placeholder="请输入文件名（不含扩展名）" />
                  </Form.Item>
                  
                  <Form.Item label="包含内容" style={{ marginBottom: 8 }}>
                    <Space direction="vertical">
                      <Form.Item name="includeTasks" valuePropName="checked" noStyle>
                        <Switch /> 任务列表
                      </Form.Item>
                      <Form.Item name="includeMilestones" valuePropName="checked" noStyle>
                        <Switch /> 里程碑详情
                      </Form.Item>
                      <Form.Item name="includeGateways" valuePropName="checked" noStyle>
                        <Switch /> 门禁详情
                      </Form.Item>
                    </Space>
                  </Form.Item>
                  
                  <Divider />
                  
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={handleExportExcel}
                    loading={exporting}
                    block
                  >
                    导出Excel
                  </Button>
                </Form>
              </div>
            ),
          },
          {
            key: 'png',
            label: (
              <span>
                <FileImageOutlined /> PNG图片
              </span>
            ),
            children: (
              <div>
                <Alert
                  message="导出当前视图为高清PNG图片。"
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
                
                <Form
                  form={pngForm}
                  layout="vertical"
                  initialValues={{
                    filename: plan.name || '时间计划',
                    quality: 0.95,
                    scale: 2,
                    backgroundColor: '#ffffff',
                  }}
                >
                  <Form.Item
                    label="文件名"
                    name="filename"
                    rules={[{ required: true, message: '请输入文件名' }]}
                  >
                    <Input placeholder="请输入文件名（不含扩展名）" />
                  </Form.Item>
                  
                  <Form.Item label="图片质量" name="quality">
                    <Select>
                      <Select.Option value={1.0}>最高 (1.0)</Select.Option>
                      <Select.Option value={0.95}>高 (0.95)</Select.Option>
                      <Select.Option value={0.9}>中 (0.9)</Select.Option>
                      <Select.Option value={0.8}>低 (0.8)</Select.Option>
                    </Select>
                  </Form.Item>
                  
                  <Form.Item label="缩放倍数" name="scale">
                    <Select>
                      <Select.Option value={3}>3x（超清）</Select.Option>
                      <Select.Option value={2}>2x（高清）</Select.Option>
                      <Select.Option value={1}>1x（标准）</Select.Option>
                    </Select>
                  </Form.Item>
                  
                  <Form.Item label="背景颜色" name="backgroundColor">
                    <Select>
                      <Select.Option value="#ffffff">白色</Select.Option>
                      <Select.Option value="#f9fafb">浅灰</Select.Option>
                      <Select.Option value="transparent">透明</Select.Option>
                    </Select>
                  </Form.Item>
                  
                  <Divider />
                  
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={handleExportPng}
                    loading={exporting}
                    block
                    disabled={!targetElement}
                  >
                    {targetElement ? '导出PNG' : '请先打开视图'}
                  </Button>
                </Form>
              </div>
            ),
          },
          {
            key: 'pdf',
            label: (
              <span>
                <FilePdfOutlined /> PDF文档
              </span>
            ),
            children: (
              <div>
                <Alert
                  message="导出当前视图为PDF文档，支持自定义页面格式和方向。"
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
                
                <Form
                  form={pdfForm}
                  layout="vertical"
                  initialValues={{
                    filename: plan.name || '时间计划',
                    orientation: 'landscape',
                    format: 'a4',
                    imageQuality: 0.95,
                    fitToPage: true,
                  }}
                >
                  <Form.Item
                    label="文件名"
                    name="filename"
                    rules={[{ required: true, message: '请输入文件名' }]}
                  >
                    <Input placeholder="请输入文件名（不含扩展名）" />
                  </Form.Item>
                  
                  <Form.Item label="页面方向" name="orientation">
                    <Select>
                      <Select.Option value="landscape">横向</Select.Option>
                      <Select.Option value="portrait">纵向</Select.Option>
                    </Select>
                  </Form.Item>
                  
                  <Form.Item label="页面格式" name="format">
                    <Select>
                      <Select.Option value="a4">A4</Select.Option>
                      <Select.Option value="a3">A3</Select.Option>
                      <Select.Option value="letter">Letter</Select.Option>
                    </Select>
                  </Form.Item>
                  
                  <Form.Item label="图片质量" name="imageQuality">
                    <Select>
                      <Select.Option value={1.0}>最高 (1.0)</Select.Option>
                      <Select.Option value={0.95}>高 (0.95)</Select.Option>
                      <Select.Option value={0.9}>中 (0.9)</Select.Option>
                      <Select.Option value={0.8}>低 (0.8)</Select.Option>
                    </Select>
                  </Form.Item>
                  
                  <Form.Item name="fitToPage" valuePropName="checked">
                    <Space>
                      <Switch /> 自动适应页面大小
                    </Space>
                  </Form.Item>
                  
                  <Divider />
                  
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={handleExportPdf}
                    loading={exporting}
                    block
                    disabled={!targetElement}
                  >
                    {targetElement ? '导出PDF' : '请先打开视图'}
                  </Button>
                </Form>
              </div>
            ),
          },
        ]}
      />
    </Modal>
  );
};

export default ExportDialog;
