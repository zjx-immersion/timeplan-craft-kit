/**
 * Select - 选择器组件
 * 
 * 📋 迁移信息:
 * - 原文件: src/components/ui/select.tsx (Radix UI Select)
 * - 迁移日期: 2026-02-03
 * - 对比状态: ⬜ 待验证
 * 
 * 🎯 功能要求:
 * - 封装 Ant Design Select
 * - 提供统一的 API
 * - 支持单选、多选、搜索等
 * 
 * 🔄 技术替换:
 * - Radix Select → Ant Select
 * - SelectTrigger → Select 组件本身
 * - SelectContent → Select dropdown
 */

import React from 'react';
import { Select as AntSelect, SelectProps as AntSelectProps } from 'antd';

/**
 * 选择器选项类型
 */
export interface SelectOption {
  label: React.ReactNode;
  value: string | number;
  disabled?: boolean;
  children?: SelectOption[];
}

/**
 * 扩展的选择器属性
 * 注意：直接使用 AntSelectProps，不覆盖 onChange 类型
 */
export interface SelectProps<T = any> extends AntSelectProps<T> {
  /**
   * 选项列表
   */
  options?: SelectOption[];
}

/**
 * 通用选择器组件
 * 
 * @example
 * ```tsx
 * // 基础用法
 * <Select
 *   placeholder="请选择"
 *   options={[
 *     { label: '选项1', value: '1' },
 *     { label: '选项2', value: '2' },
 *   ]}
 *   onChange={(value) => console.log(value)}
 * />
 * 
 * // 支持搜索
 * <Select
 *   showSearch
 *   placeholder="搜索并选择"
 *   options={options}
 *   filterOption={(input, option) =>
 *     (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
 *   }
 * />
 * 
 * // 多选
 * <Select
 *   mode="multiple"
 *   placeholder="请选择多个"
 *   options={options}
 * />
 * ```
 */
export function Select<T = any>(props: SelectProps<T>) {
  return (
    <AntSelect
      {...props}
    />
  );
}

Select.displayName = 'Select';

/**
 * 选择器选项组件
 */
export const Option = AntSelect.Option;

/**
 * 选择器选项组
 */
export const OptGroup = AntSelect.OptGroup;

// 添加子组件
(Select as any).Option = Option;
(Select as any).OptGroup = OptGroup;

export default Select;
