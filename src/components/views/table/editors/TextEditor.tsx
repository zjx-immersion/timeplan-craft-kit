/**
 * TextEditor - 文本编辑器
 * 
 * 功能:
 * - 单行文本输入
 * - 支持number类型
 * - 自动聚焦
 * - Enter保存，Esc取消
 * 
 * @version 1.0.0
 * @date 2026-02-10
 */

import React, { useRef, useEffect } from 'react';
import { Input, InputNumber } from 'antd';

export interface TextEditorProps {
  value: string | number;
  onChange: (value: any) => void;
  onSave: () => void;
  onCancel: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  autoFocus?: boolean;
  placeholder?: string;
  type?: 'text' | 'number';
  min?: number;
  max?: number;
}

const TextEditor: React.FC<TextEditorProps> = ({
  value,
  onChange,
  onSave,
  onCancel,
  onKeyDown,
  autoFocus = true,
  placeholder,
  type = 'text',
  min,
  max,
}) => {
  const inputRef = useRef<any>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      // 延迟聚焦，确保DOM已渲染
      setTimeout(() => {
        inputRef.current?.focus();
        // 如果是文本，选中所有内容
        if (type === 'text' && inputRef.current?.select) {
          inputRef.current.select();
        }
      }, 0);
    }
  }, [autoFocus, type]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  if (type === 'number') {
    return (
      <InputNumber
        ref={inputRef}
        value={value as number}
        onChange={(val) => onChange(val)}
        onPressEnter={onSave}
        onKeyDown={handleKeyDown}
        onBlur={onSave}
        placeholder={placeholder}
        min={min}
        max={max}
        style={{ width: '100%' }}
      />
    );
  }

  return (
    <Input
      ref={inputRef}
      value={value as string}
      onChange={(e) => onChange(e.target.value)}
      onPressEnter={onSave}
      onKeyDown={handleKeyDown}
      onBlur={onSave}
      placeholder={placeholder}
      style={{ width: '100%' }}
    />
  );
};

export default TextEditor;
