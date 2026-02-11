/**
 * DateEditor - 日期编辑器
 * 
 * 功能:
 * - 日期选择
 * - 自动展开
 * - Enter保存，Esc取消
 * 
 * @version 1.0.0
 * @date 2026-02-10
 */

import React, { useRef, useEffect } from 'react';
import { DatePicker } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

export interface DateEditorProps {
  value: string | Date | Dayjs | null;
  onChange: (value: string | null) => void;
  onSave: () => void;
  onCancel: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  autoFocus?: boolean;
  placeholder?: string;
}

const DateEditor: React.FC<DateEditorProps> = ({
  value,
  onChange,
  onSave,
  onCancel,
  onKeyDown,
  autoFocus = true,
  placeholder = '选择日期',
}) => {
  const pickerRef = useRef<any>(null);

  useEffect(() => {
    if (autoFocus && pickerRef.current) {
      setTimeout(() => {
        pickerRef.current?.focus();
      }, 0);
    }
  }, [autoFocus]);

  const handleChange = (date: Dayjs | null, dateString: string | string[]) => {
    if (date) {
      onChange(date.format('YYYY-MM-DD'));
    } else {
      onChange(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  // 转换value为dayjs对象
  const dayjsValue = useMemo(() => {
    if (!value) return null;
    if (dayjs.isDayjs(value)) return value;
    if (value instanceof Date) return dayjs(value);
    if (typeof value === 'string') return dayjs(value);
    return null;
  }, [value]);

  return (
    <DatePicker
      ref={pickerRef}
      value={dayjsValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onBlur={onSave}
      placeholder={placeholder}
      format="YYYY-MM-DD"
      style={{ width: '100%' }}
      open={autoFocus} // 自动展开
    />
  );
};

// 添加缺失的useMemo import
import { useMemo } from 'react';

export default DateEditor;
