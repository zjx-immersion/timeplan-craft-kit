/**
 * 列设置对话框（简化版 - 核心功能）
 * @module ColumnSettingsDialog
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Modal, Checkbox, Select, Button, Space, Input, message, Divider, Alert } from 'antd';
import type { ColumnConfig, TableViewPreset } from './types/columnTypes';
import { loadPresets, savePreset, getCurrentPresetId, setCurrentPreset, resetToDefault } from './utils/columnStorage';

export interface ColumnSettingsDialogProps {
  visible: boolean;
  onClose: () => void;
  columns: ColumnConfig[];
  onColumnsChange: (columns: ColumnConfig[]) => void;
}

/**
 * 列设置对话框组件
 */
const ColumnSettingsDialog: React.FC<ColumnSettingsDialogProps> = ({
  visible,
  onClose,
  columns,
  onColumnsChange,
}) => {
  const [presets, setPresets] = useState<TableViewPreset[]>([]);
  const [currentPresetId, setCurrentPresetId] = useState<string>('default');
  const [editingColumns, setEditingColumns] = useState<ColumnConfig[]>(columns);
  const [presetName, setPresetName] = useState('');
  const [saving, setSaving] = useState(false);
  
  // 加载预设
  useEffect(() => {
    if (visible) {
      const loadedPresets = loadPresets();
      const currentId = getCurrentPresetId();
      setPresets(loadedPresets);
      setCurrentPresetId(currentId);
      setEditingColumns(columns);
    }
  }, [visible, columns]);
  
  // 切换预设
  const handlePresetChange = useCallback((presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      setEditingColumns(preset.columns);
      setCurrentPresetId(presetId);
    }
  }, [presets]);
  
  // 切换列显示/隐藏
  const handleColumnVisibilityChange = useCallback((checkedKeys: string[]) => {
    setEditingColumns(prev =>
      prev.map(col => ({
        ...col,
        visible: checkedKeys.includes(col.key),
      }))
    );
  }, []);
  
  // 保存为新预设
  const handleSaveAsPreset = useCallback(async () => {
    if (!presetName.trim()) {
      message.warning('请输入方案名称');
      return;
    }
    
    try {
      setSaving(true);
      
      const newPreset: TableViewPreset = {
        id: `user-${Date.now()}`,
        name: presetName.trim(),
        description: `用户自定义方案 - ${new Date().toLocaleDateString()}`,
        columns: editingColumns,
        isSystem: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      savePreset(newPreset);
      
      // 重新加载预设
      const updatedPresets = loadPresets();
      setPresets(updatedPresets);
      setCurrentPresetId(newPreset.id);
      setPresetName('');
      
      message.success('方案已保存');
    } catch (error) {
      message.error(`保存失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setSaving(false);
    }
  }, [presetName, editingColumns]);
  
  // 应用配置
  const handleApply = useCallback(() => {
    try {
      setCurrentPreset(currentPresetId);
      onColumnsChange(editingColumns);
      message.success('列配置已应用');
      onClose();
    } catch (error) {
      message.error(`应用失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }, [currentPresetId, editingColumns, onColumnsChange, onClose]);
  
  // 重置为默认
  const handleReset = useCallback(() => {
    Modal.confirm({
      title: '重置为默认配置',
      content: '此操作将清除所有自定义配置，是否继续？',
      okText: '确定',
      cancelText: '取消',
      okButtonProps: {
        danger: true,
        style: { color: '#fff', backgroundColor: '#ff4d4f' }
      },
      onOk: () => {
        resetToDefault();
        const defaultPreset = presets.find(p => p.id === 'default');
        if (defaultPreset) {
          setEditingColumns(defaultPreset.columns);
          setCurrentPresetId('default');
        }
        message.success('已重置为默认配置');
      },
    });
  }, [presets]);
  
  const visibleColumns = editingColumns.filter(c => c.visible);
  
  return (
    <Modal
      title="列设置"
      open={visible}
      onCancel={onClose}
      onOk={handleApply}
      width={700}
      okText="应用"
      cancelText="取消"
      okButtonProps={{ 
        style: { 
          backgroundColor: '#14B8A6',
          borderColor: '#14B8A6',
          color: '#fff'
        } 
      }}
    >
      <div>
        {/* 预设方案选择 */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 8 }}>
            <strong>预设方案:</strong>
          </div>
          <Select
            value={currentPresetId}
            onChange={handlePresetChange}
            style={{ width: '100%' }}
            options={presets.map(p => ({
              label: `${p.name}${p.isSystem ? ' (系统)' : ''}`,
              value: p.id,
            }))}
          />
        </div>
        
        <Divider />
        
        {/* 显示的列 */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 8 }}>
            <strong>显示的列:</strong>
            <span style={{ marginLeft: 8, color: '#666', fontSize: 12 }}>
              （已选中 {visibleColumns.length} / {editingColumns.length} 列）
            </span>
          </div>
          
          <Checkbox.Group
            value={editingColumns.filter(c => c.visible).map(c => c.key)}
            onChange={(checkedKeys) => handleColumnVisibilityChange(checkedKeys as string[])}
          >
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr 1fr', 
              gap: '8px 16px',
              maxHeight: 200,
              overflowY: 'auto',
              padding: 8,
              border: '1px solid #f0f0f0',
              borderRadius: 4,
            }}>
              {editingColumns.map(col => (
                <Checkbox key={col.key} value={col.key}>
                  {col.label}
                </Checkbox>
              ))}
            </div>
          </Checkbox.Group>
          
          {visibleColumns.length === 0 && (
            <Alert 
              message="请至少选择一列" 
              type="warning" 
              showIcon 
              style={{ marginTop: 8 }}
            />
          )}
        </div>
        
        <Divider />
        
        {/* 保存为新方案 */}
        <div>
          <div style={{ marginBottom: 8 }}>
            <strong>保存为新方案:</strong>
          </div>
          <Space.Compact style={{ width: '100%' }}>
            <Input
              placeholder="输入方案名称"
              value={presetName}
              onChange={e => setPresetName(e.target.value)}
              onPressEnter={handleSaveAsPreset}
            />
            <Button 
              type="primary" 
              onClick={handleSaveAsPreset}
              loading={saving}
              style={{ backgroundColor: '#14B8A6', borderColor: '#14B8A6', color: '#fff' }}
            >
              保存
            </Button>
          </Space.Compact>
          <div style={{ marginTop: 4, color: '#999', fontSize: 12 }}>
            保存当前的列配置为新的预设方案
          </div>
        </div>
        
        <Divider />
        
        {/* 底部操作 */}
        <div style={{ textAlign: 'right' }}>
          <Button 
            onClick={handleReset} 
            danger
            style={{ color: '#fff', backgroundColor: '#ff4d4f' }}
          >
            重置为默认
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ColumnSettingsDialog;
