/**
 * EditableCell - 可编辑单元格组件
 * 
 * 功能:
 * - 双击进入编辑模式
 * - Enter保存，Esc取消
 * - 失焦自动保存
 * - 支持多种编辑器类型
 * - 数据校验
 * 
 * @version 1.0.0
 * @date 2026-02-10
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { message } from 'antd';
import TextEditor from './editors/TextEditor';
import DateEditor from './editors/DateEditor';
import SelectEditor from './editors/SelectEditor';
import './EditableCell.css';

/**
 * 编辑器类型
 */
export type EditorType = 'text' | 'date' | 'select' | 'number';

/**
 * 选项类型（用于Select）
 */
export interface SelectOption {
  label: string;
  value: string;
}

/**
 * 验证规则
 */
export interface ValidationRule {
  required?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: RegExp;
  validator?: (value: any) => string | null;
}

/**
 * EditableCell 属性
 */
export interface EditableCellProps<T = any> {
  /**
   * 单元格值
   */
  value: T;
  
  /**
   * 行ID
   */
  rowId: string;
  
  /**
   * 列ID
   */
  columnId: string;
  
  /**
   * 编辑器类型
   */
  editorType: EditorType;
  
  /**
   * 选项（用于select类型）
   */
  options?: SelectOption[];
  
  /**
   * 保存回调
   */
  onSave: (rowId: string, columnId: string, value: T) => Promise<boolean>;
  
  /**
   * 验证规则
   */
  validate?: ValidationRule;
  
  /**
   * 是否只读
   */
  readonly?: boolean;
  
  /**
   * 格式化显示
   */
  formatDisplay?: (value: T) => string;
  
  /**
   * 占位符
   */
  placeholder?: string;
  
  /**
   * 自定义样式
   */
  style?: React.CSSProperties;
}

/**
 * EditableCell 组件
 */
export function EditableCell<T = any>({
  value,
  rowId,
  columnId,
  editorType,
  options,
  onSave,
  validate,
  readonly = false,
  formatDisplay,
  placeholder,
  style,
}: EditableCellProps<T>) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState<T>(value);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const cellRef = useRef<HTMLDivElement>(null);

  // 同步外部value变化
  useEffect(() => {
    if (!isEditing) {
      setEditValue(value);
    }
  }, [value, isEditing]);

  /**
   * 双击进入编辑模式
   */
  const handleDoubleClick = useCallback(() => {
    if (readonly) return;
    
    setIsEditing(true);
    setEditValue(value);
    setError(null);
  }, [readonly, value]);

  /**
   * 验证数据
   */
  const validateValue = useCallback((val: T): string | null => {
    if (!validate) return null;

    // 必填验证
    if (validate.required && (val === null || val === undefined || val === '')) {
      return '此字段为必填项';
    }

    // 字符串长度验证
    if (typeof val === 'string') {
      if (validate.maxLength && val.length > validate.maxLength) {
        return `最大长度为 ${validate.maxLength} 个字符`;
      }
      if (validate.minLength && val.length < validate.minLength) {
        return `最小长度为 ${validate.minLength} 个字符`;
      }
      if (validate.pattern && !validate.pattern.test(val)) {
        return '格式不正确';
      }
    }

    // 自定义验证
    if (validate.validator) {
      return validate.validator(val);
    }

    return null;
  }, [validate]);

  /**
   * 保存数据
   */
  const handleSave = useCallback(async () => {
    // 1. 验证
    const errorMsg = validateValue(editValue);
    if (errorMsg) {
      setError(errorMsg);
      message.error(errorMsg);
      return false;
    }

    // 2. 保存
    setIsSaving(true);
    try {
      const success = await onSave(rowId, columnId, editValue);
      if (success) {
        setIsEditing(false);
        setError(null);
        message.success('保存成功');
        return true;
      } else {
        message.error('保存失败');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '保存失败';
      message.error(errorMessage);
      setError(errorMessage);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [rowId, columnId, editValue, onSave, validateValue]);

  /**
   * 取消编辑
   */
  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setEditValue(value);
    setError(null);
  }, [value]);

  /**
   * 键盘事件处理
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  }, [handleSave, handleCancel]);

  /**
   * 渲染编辑器
   */
  const renderEditor = () => {
    const commonProps = {
      value: editValue,
      onChange: setEditValue,
      onSave: handleSave,
      onCancel: handleCancel,
      onKeyDown: handleKeyDown,
      autoFocus: true,
      placeholder,
    };

    switch (editorType) {
      case 'text':
        return <TextEditor {...commonProps} />;
      
      case 'date':
        return <DateEditor {...commonProps} />;
      
      case 'select':
        return <SelectEditor {...commonProps} options={options || []} />;
      
      case 'number':
        return <TextEditor {...commonProps} type="number" />;
      
      default:
        return <TextEditor {...commonProps} />;
    }
  };

  /**
   * 渲染显示内容
   */
  const renderDisplay = () => {
    if (formatDisplay) {
      return formatDisplay(value);
    }

    // 默认格式化
    if (value === null || value === undefined) {
      return <span style={{ color: '#bbb' }}>-</span>;
    }

    if (editorType === 'date' && typeof value === 'string') {
      try {
        return format(new Date(value), 'yyyy-MM-dd');
      } catch {
        return String(value);
      }
    }

    return String(value);
  };

  // 编辑模式
  if (isEditing) {
    return (
      <div 
        ref={cellRef}
        className="editable-cell editable-cell-editing"
        style={style}
      >
        <div className="editable-cell-editor">
          {renderEditor()}
          {error && (
            <div className="editable-cell-error">
              {error}
            </div>
          )}
          {isSaving && (
            <div className="editable-cell-saving">
              保存中...
            </div>
          )}
        </div>
      </div>
    );
  }

  // 显示模式
  return (
    <div
      className={`editable-cell editable-cell-display ${readonly ? 'readonly' : 'editable'}`}
      onDoubleClick={handleDoubleClick}
      title={readonly ? '' : '双击编辑'}
      style={style}
    >
      {renderDisplay()}
    </div>
  );
}

export default EditableCell;
