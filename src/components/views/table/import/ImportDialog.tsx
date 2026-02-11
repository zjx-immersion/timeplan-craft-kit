/**
 * Excel导入对话框
 * @module ImportDialog
 */

import React, { useState, useCallback } from 'react';
import { Modal, Upload, Button, message, Steps, Space, Alert } from 'antd';
import { UploadOutlined, DownloadOutlined, InboxOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { parseExcelFile, generateExcelTemplate } from './utils/excelParser';
import ImportPreview from './ImportPreview';
import type { ParsedRow, ImportOptions, ImportStats } from './types/importTypes';
import type { Line, TimePlan } from '@/types/timeplanSchema';

const { Dragger } = Upload;

export interface ImportDialogProps {
  visible: boolean;
  onClose: () => void;
  onImport: (lines: Line[]) => void;
  data: TimePlan;
}

/**
 * 导入对话框组件
 */
const ImportDialog: React.FC<ImportDialogProps> = ({
  visible,
  onClose,
  onImport,
  data,
}) => {
  const [step, setStep] = useState(0);  // 0:选择文件 1:预览 2:导入中
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [options, setOptions] = useState<ImportOptions>({
    ignoreErrors: false,
    checkDuplicates: false,
    defaultTimeline: data.timelines?.[0]?.id,
    defaultTimelineName: data.timelines?.[0]?.name || data.timelines?.[0]?.label,
  });
  const [importing, setImporting] = useState(false);
  
  // 下载模板
  const handleDownloadTemplate = useCallback(() => {
    generateExcelTemplate();
    message.success('模板已下载');
  }, []);
  
  // 文件上传前的处理
  const beforeUpload = useCallback(async (uploadFile: File) => {
    const isExcel = uploadFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                    uploadFile.type === 'application/vnd.ms-excel' ||
                    uploadFile.name.endsWith('.xlsx') ||
                    uploadFile.name.endsWith('.xls');
    
    if (!isExcel) {
      message.error('只能上传Excel文件(.xlsx, .xls)');
      return Upload.LIST_IGNORE;
    }
    
    const isLt10M = uploadFile.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error('文件大小不能超过10MB');
      return Upload.LIST_IGNORE;
    }
    
    // 解析文件
    try {
      message.loading({ content: '正在解析Excel文件...', key: 'parsing' });
      const parsed = await parseExcelFile(uploadFile);
      
      console.log('[ImportDialog] Excel解析完成:', {
        total: parsed.length,
        valid: parsed.filter(r => r.isValid).length,
        invalid: parsed.filter(r => !r.isValid).length,
      });
      
      setParsedData(parsed);
      setFile(uploadFile);
      setStep(1);  // 进入预览步骤
      
      message.success({ 
        content: `文件解析成功，共 ${parsed.length} 条数据`, 
        key: 'parsing' 
      });
    } catch (error) {
      console.error('[ImportDialog] 文件解析失败:', error);
      message.error({ 
        content: `文件解析失败: ${error instanceof Error ? error.message : '未知错误'}`,
        key: 'parsing' 
      });
    }
    
    return Upload.LIST_IGNORE;  // 阻止自动上传
  }, []);
  
  // 执行导入
  const handleImport = useCallback(async () => {
    setImporting(true);
    
    try {
      // 筛选有效数据
      let validData = parsedData.filter(row => row.isValid);
      
      if (options.ignoreErrors) {
        // 如果忽略错误，也包含警告级别的数据
        validData = parsedData.filter(row => 
          row.errors.filter(e => e.severity === 'error').length === 0
        );
      }
      
      if (validData.length === 0) {
        message.error('没有有效数据可导入');
        setImporting(false);
        return;
      }
      
      // 转换为Line对象
      const newLines: Line[] = validData.map(row => {
        const { data: importData } = row;
        
        // 确定Timeline
        let timelineId = options.defaultTimeline;
        if (importData.timeline) {
          // 尝试匹配现有Timeline
          const matchedTimeline = data.timelines?.find(
            t => t.name === importData.timeline || t.label === importData.timeline
          );
          if (matchedTimeline) {
            timelineId = matchedTimeline.id;
          }
        }
        
        // 确定Schema ID
        const schemaIdMap: Record<string, string> = {
          'bar': 'lineplan-schema',
          'milestone': 'milestone-schema',
          'gateway': 'gateway-schema',
        };
        
        const line: Line = {
          id: `import-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timelineId: timelineId || '',
          schemaId: schemaIdMap[importData.type] || 'lineplan-schema',
          label: importData.name,
          startDate: importData.startDate!.toISOString(),
          endDate: importData.endDate?.toISOString(),
          attributes: {
            owner: importData.owner,
            progress: importData.progress,
            status: importData.status,
            priority: importData.priority,
            description: importData.description,
          },
        };
        
        return line;
      });
      
      // 检查重复
      if (options.checkDuplicates) {
        const existingNames = new Set(
          data.lines?.map(l => l.label.toLowerCase()) || []
        );
        
        const duplicates = newLines.filter(line => 
          existingNames.has(line.label.toLowerCase())
        );
        
        if (duplicates.length > 0) {
          const confirmed = await new Promise<boolean>(resolve => {
            Modal.confirm({
              title: '发现重复任务',
              content: `有 ${duplicates.length} 个任务名称已存在，是否继续导入？`,
              okText: '继续导入',
              cancelText: '取消',
              onOk: () => resolve(true),
              onCancel: () => resolve(false),
            });
          });
          
          if (!confirmed) {
            setImporting(false);
            return;
          }
        }
      }
      
      // 执行导入
      setStep(2);
      
      // 模拟导入进度
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onImport(newLines);
      
      message.success(`成功导入 ${newLines.length} 条任务`);
      
      // 重置状态
      setTimeout(() => {
        handleClose();
      }, 1000);
      
    } catch (error) {
      console.error('[ImportDialog] 导入失败:', error);
      message.error(`导入失败: ${error instanceof Error ? error.message : '未知错误'}`);
      setStep(1);  // 回到预览步骤
    } finally {
      setImporting(false);
    }
  }, [parsedData, options, data, onImport]);
  
  // 关闭对话框
  const handleClose = useCallback(() => {
    setStep(0);
    setFile(null);
    setParsedData([]);
    setImporting(false);
    onClose();
  }, [onClose]);
  
  // 返回上一步
  const handleBack = useCallback(() => {
    setStep(0);
    setFile(null);
    setParsedData([]);
  }, []);
  
  // 计算统计信息
  const stats: ImportStats = {
    total: parsedData.length,
    valid: parsedData.filter(r => r.isValid).length,
    invalid: parsedData.filter(r => !r.isValid).length,
    imported: 0,
    skipped: 0,
    errors: parsedData.flatMap(r => r.errors),
  };
  
  return (
    <Modal
      title="批量导入"
      open={visible}
      onCancel={handleClose}
      width={1000}
      footer={null}
      destroyOnHidden
    >
      <div style={{ marginBottom: 24 }}>
        <Steps
          current={step}
          items={[
            { title: '选择文件' },
            { title: '预览数据' },
            { title: '导入完成' },
          ]}
        />
      </div>
      
      {/* Step 0: 选择文件 */}
      {step === 0 && (
        <div>
          <Alert
            message="导入前准备"
            description="请先下载Excel模板，填写任务数据后再上传。模板中已包含详细的使用说明。"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          
          <div style={{ marginBottom: 24, textAlign: 'center' }}>
            <Button 
              icon={<DownloadOutlined />} 
              onClick={handleDownloadTemplate}
              size="large"
              type="primary"
            >
              下载Excel模板
            </Button>
          </div>
          
          <Dragger
            accept=".xlsx,.xls"
            beforeUpload={beforeUpload}
            showUploadList={false}
            style={{ marginBottom: 16 }}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">点击或拖拽文件到这里上传</p>
            <p className="ant-upload-hint">
              支持 .xlsx 和 .xls 格式，文件大小不超过10MB
            </p>
          </Dragger>
          
          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <Button onClick={handleClose}>取消</Button>
          </div>
        </div>
      )}
      
      {/* Step 1: 预览数据 */}
      {step === 1 && (
        <div>
          <ImportPreview
            data={parsedData}
            stats={stats}
            options={options}
            timelines={data.timelines || []}
            onOptionsChange={setOptions}
          />
          
          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <Space>
              <Button onClick={handleBack}>返回</Button>
              <Button 
                type="primary" 
                onClick={handleImport}
                disabled={stats.valid === 0}
                loading={importing}
                style={{ backgroundColor: '#14B8A6', borderColor: '#14B8A6', color: '#fff' }}
              >
                开始导入 ({stats.valid}条)
              </Button>
            </Space>
          </div>
        </div>
      )}
      
      {/* Step 2: 导入中 */}
      {step === 2 && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Alert
            message="导入成功"
            description={`已成功导入 ${stats.valid} 条任务`}
            type="success"
            showIcon
          />
        </div>
      )}
    </Modal>
  );
};

export default ImportDialog;
