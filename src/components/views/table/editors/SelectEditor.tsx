/**
 * SelectEditor - 下拉选择编辑器
 * 
 * 功能:
 * - 下拉选择
 * - 支持搜索
 * - 自动展开
 * - Enter保存，Esc取消
 * 
 * @version 1.0.0
 * @date 2026-02-10
 */

import React, { useRef, useEffect } from 'react';
import { Select } from 'antd';
import type { SelectOption } from '../EditableCell';

export interface SelectEditorProps {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  autoFocus?: boolean;
  placeholder?: string;
  showSearch?: boolean;
}

const SelectEditor: React.FC<SelectEditorProps> = ({
  value,
  options,
  onChange,
  onSave,
  onCancel,
  onKeyDown,
  autoFocus = true,
  placeholder = '请选择',
  showSearch = true,
}) => {
  const selectRef = useRef<any>(null);

  useEffect(() => {
    if (autoFocus && selectRef.current) {
      setTimeout(() => {
        selectRef.current?.focus();
      }, 0);
    }
  }, [autoFocus]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  return (
    <Select
      ref={selectRef}
      value={value}
      onChange={onChange}
      onKeyDown={handleKeyDown}
      onBlur={onSave}
      placeholder={placeholder}
      showSearch={showSearch}
      optionFilterProp="label"
      options={options}
      style={{ width: '100%' }}
      open={autoFocus} // 自动展开
    />
  );
};

export default SelectEditor;
