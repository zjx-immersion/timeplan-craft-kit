/**
 * PreferencesDialog - 用户偏好设置对话框
 * 
 * 功能：
 * - 查看和编辑用户配置
 * - 导入/导出配置文件
 * - 重置为默认配置
 * 
 * @version 1.0.0
 */

import React, { useState, useRef } from 'react';
import {
  Modal,
  Tabs,
  Form,
  Switch,
  Select,
  InputNumber,
  Button,
  Space,
  Divider,
  message,
  Upload,
  Alert,
  Radio,
} from 'antd';
import {
  SettingOutlined,
  DownloadOutlined,
  UploadOutlined,
  ReloadOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { UserPreferencesManager } from '@/utils/preferences/UserPreferencesManager';
import type { UserPreferences } from '@/utils/preferences/UserPreferencesManager';

/**
 * PreferencesDialog Props
 */
export interface PreferencesDialogProps {
  /** 是否显示对话框 */
  visible: boolean;
  /** 关闭对话框回调 */
  onClose: () => void;
  /** 配置变更回调 */
  onChange?: (preferences: UserPreferences) => void;
}

/**
 * PreferencesDialog组件
 */
export const PreferencesDialog: React.FC<PreferencesDialogProps> = ({
  visible,
  onClose,
  onChange,
}) => {
  const [form] = Form.useForm();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentPrefs, setCurrentPrefs] = useState<UserPreferences>(
    UserPreferencesManager.getAll()
  );

  /**
   * 加载当前配置到表单
   */
  React.useEffect(() => {
    if (visible) {
      const prefs = UserPreferencesManager.getAll();
      setCurrentPrefs(prefs);
      form.setFieldsValue(prefs);
    }
  }, [visible, form]);

  /**
   * 保存配置
   */
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      UserPreferencesManager.update(values);
      const newPrefs = UserPreferencesManager.getAll();
      setCurrentPrefs(newPrefs);
      onChange?.(newPrefs);
      message.success('配置已保存');
    } catch (error) {
      console.error('保存配置失败:', error);
      message.error('保存配置失败');
    }
  };

  /**
   * 重置配置
   */
  const handleReset = () => {
    Modal.confirm({
      title: '确认重置',
      content: '将恢复所有默认配置，此操作不可撤销。是否继续？',
      okText: '确认重置',
      cancelText: '取消',
      okType: 'danger',
      onOk: () => {
        UserPreferencesManager.reset();
        const newPrefs = UserPreferencesManager.getAll();
        setCurrentPrefs(newPrefs);
        form.setFieldsValue(newPrefs);
        onChange?.(newPrefs);
        message.success('已重置为默认配置');
      },
    });
  };

  /**
   * 导出配置
   */
  const handleExport = () => {
    UserPreferencesManager.downloadConfig();
    message.success('配置文件已下载');
  };

  /**
   * 导入配置
   */
  const handleImport = async (file: File) => {
    const success = await UserPreferencesManager.uploadConfig(file);
    if (success) {
      const newPrefs = UserPreferencesManager.getAll();
      setCurrentPrefs(newPrefs);
      form.setFieldsValue(newPrefs);
      onChange?.(newPrefs);
      message.success('配置导入成功');
    } else {
      message.error('配置导入失败，请检查文件格式');
    }
    return false; // 阻止自动上传
  };

  return (
    <Modal
      title={
        <Space>
          <SettingOutlined />
          用户偏好设置
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={700}
      footer={
        <Space>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>
            导出配置
          </Button>
          <Upload
            accept=".json"
            showUploadList={false}
            beforeUpload={handleImport}
          >
            <Button icon={<UploadOutlined />}>导入配置</Button>
          </Upload>
          <Button danger icon={<ReloadOutlined />} onClick={handleReset}>
            重置
          </Button>
          <Divider type="vertical" />
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
            保存
          </Button>
        </Space>
      }
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={currentPrefs}
      >
        <Tabs
          defaultActiveKey="view"
          items={[
            {
              key: 'view',
              label: '视图设置',
              children: (
                <div>
                  <Form.Item label="默认视图" name={['view', 'defaultView']}>
                    <Radio.Group>
                      <Radio.Button value="matrix">矩阵视图</Radio.Button>
                      <Radio.Button value="gantt">甘特图</Radio.Button>
                      <Radio.Button value="table">表格视图</Radio.Button>
                    </Radio.Group>
                  </Form.Item>

                  <Divider orientation="left">矩阵视图</Divider>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Form.Item name={['view', 'matrix', 'showHeatmap']} valuePropName="checked" noStyle>
                      <Switch /> 显示热力图
                    </Form.Item>
                    <Form.Item name={['view', 'matrix', 'showMilestones']} valuePropName="checked" noStyle>
                      <Switch /> 显示里程碑
                    </Form.Item>
                    <Form.Item name={['view', 'matrix', 'showGateways']} valuePropName="checked" noStyle>
                      <Switch /> 显示门禁
                    </Form.Item>
                    <Form.Item label="单元格尺寸" name={['view', 'matrix', 'cellSize']}>
                      <Select style={{ width: 200 }}>
                        <Select.Option value="compact">紧凑</Select.Option>
                        <Select.Option value="normal">标准</Select.Option>
                        <Select.Option value="large">宽松</Select.Option>
                      </Select>
                    </Form.Item>
                  </Space>

                  <Divider orientation="left">甘特图</Divider>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Form.Item name={['view', 'gantt', 'showRelations']} valuePropName="checked" noStyle>
                      <Switch /> 显示关系线
                    </Form.Item>
                    <Form.Item name={['view', 'gantt', 'showCriticalPath']} valuePropName="checked" noStyle>
                      <Switch /> 显示关键路径
                    </Form.Item>
                    <Form.Item name={['view', 'gantt', 'showTodayLine']} valuePropName="checked" noStyle>
                      <Switch /> 显示今日线
                    </Form.Item>
                    <Form.Item label="时间缩放" name={['view', 'gantt', 'timeScale']}>
                      <Select style={{ width: 200 }}>
                        <Select.Option value="day">按天</Select.Option>
                        <Select.Option value="week">按周</Select.Option>
                        <Select.Option value="month">按月</Select.Option>
                      </Select>
                    </Form.Item>
                  </Space>

                  <Divider orientation="left">表格视图</Divider>
                  <Form.Item label="每页显示数量" name={['view', 'table', 'pageSize']}>
                    <InputNumber min={10} max={100} step={10} style={{ width: 200 }} />
                  </Form.Item>
                </div>
              ),
            },
            {
              key: 'export',
              label: '导出设置',
              children: (
                <div>
                  <Form.Item label="默认导出格式" name={['export', 'defaultFormat']}>
                    <Radio.Group>
                      <Radio.Button value="excel">Excel</Radio.Button>
                      <Radio.Button value="png">PNG</Radio.Button>
                      <Radio.Button value="pdf">PDF</Radio.Button>
                    </Radio.Group>
                  </Form.Item>

                  <Divider orientation="left">Excel导出</Divider>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Form.Item name={['export', 'excel', 'includeTasks']} valuePropName="checked" noStyle>
                      <Switch /> 包含任务列表
                    </Form.Item>
                    <Form.Item name={['export', 'excel', 'includeMilestones']} valuePropName="checked" noStyle>
                      <Switch /> 包含里程碑详情
                    </Form.Item>
                    <Form.Item name={['export', 'excel', 'includeGateways']} valuePropName="checked" noStyle>
                      <Switch /> 包含门禁详情
                    </Form.Item>
                  </Space>

                  <Divider orientation="left">PNG导出</Divider>
                  <Form.Item label="图片质量" name={['export', 'png', 'quality']}>
                    <Select style={{ width: 200 }}>
                      <Select.Option value={1.0}>最高 (1.0)</Select.Option>
                      <Select.Option value={0.95}>高 (0.95)</Select.Option>
                      <Select.Option value={0.9}>中 (0.9)</Select.Option>
                      <Select.Option value={0.8}>低 (0.8)</Select.Option>
                    </Select>
                  </Form.Item>
                  <Form.Item label="缩放倍数" name={['export', 'png', 'scale']}>
                    <Select style={{ width: 200 }}>
                      <Select.Option value={3}>3x（超清）</Select.Option>
                      <Select.Option value={2}>2x（高清）</Select.Option>
                      <Select.Option value={1}>1x（标准）</Select.Option>
                    </Select>
                  </Form.Item>

                  <Divider orientation="left">PDF导出</Divider>
                  <Form.Item label="页面方向" name={['export', 'pdf', 'orientation']}>
                    <Radio.Group>
                      <Radio.Button value="landscape">横向</Radio.Button>
                      <Radio.Button value="portrait">纵向</Radio.Button>
                    </Radio.Group>
                  </Form.Item>
                  <Form.Item label="页面格式" name={['export', 'pdf', 'format']}>
                    <Select style={{ width: 200 }}>
                      <Select.Option value="a4">A4</Select.Option>
                      <Select.Option value="a3">A3</Select.Option>
                      <Select.Option value="letter">Letter</Select.Option>
                    </Select>
                  </Form.Item>
                  <Form.Item name={['export', 'pdf', 'fitToPage']} valuePropName="checked">
                    <Switch /> 自动适应页面大小
                  </Form.Item>
                </div>
              ),
            },
            {
              key: 'editor',
              label: '编辑器',
              children: (
                <div>
                  <Form.Item name={['editor', 'autoSave']} valuePropName="checked">
                    <Switch /> 自动保存
                  </Form.Item>
                  <Form.Item label="自动保存间隔（秒）" name={['editor', 'autoSaveInterval']}>
                    <InputNumber min={10} max={300} step={10} style={{ width: 200 }} />
                  </Form.Item>
                  <Form.Item label="撤销步数限制" name={['editor', 'maxUndoSteps']}>
                    <InputNumber min={10} max={100} step={10} style={{ width: 200 }} />
                  </Form.Item>
                </div>
              ),
            },
            {
              key: 'other',
              label: '其他',
              children: (
                <div>
                  <Divider orientation="left">主题</Divider>
                  <Form.Item label="主题模式" name={['theme', 'mode']}>
                    <Radio.Group>
                      <Radio.Button value="light">浅色</Radio.Button>
                      <Radio.Button value="dark">深色</Radio.Button>
                      <Radio.Button value="auto">跟随系统</Radio.Button>
                    </Radio.Group>
                  </Form.Item>

                  <Divider orientation="left">通知</Divider>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Form.Item name={['notifications', 'enabled']} valuePropName="checked" noStyle>
                      <Switch /> 启用通知
                    </Form.Item>
                    <Form.Item name={['notifications', 'showSuccess']} valuePropName="checked" noStyle>
                      <Switch /> 显示成功消息
                    </Form.Item>
                    <Form.Item name={['notifications', 'showWarning']} valuePropName="checked" noStyle>
                      <Switch /> 显示警告消息
                    </Form.Item>
                  </Space>

                  <Divider />
                  <Alert
                    message="配置说明"
                    description="所有设置将自动保存到本地浏览器。您可以导出配置文件备份，或在其他设备上导入。"
                    type="info"
                    showIcon
                  />
                </div>
              ),
            },
          ]}
        />
      </Form>
    </Modal>
  );
};

export default PreferencesDialog;
