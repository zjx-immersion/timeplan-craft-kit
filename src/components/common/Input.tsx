/**
 * Input - 输入框组件
 * 
 * 📋 迁移信息:
 * - 原文件: src/components/ui/input.tsx (Shadcn UI)
 * - 迁移日期: 2026-02-03
 * - 对比状态: ⬜ 待验证
 * 
 * 🎯 功能要求:
 * - 封装 Ant Design Input
 * - 提供统一的 API
 * - 支持文本框、文本域、密码框等
 * 
 * 🔄 技术替换:
 * - Shadcn Input → Ant Input
 * - Shadcn Textarea → Ant Input.TextArea
 */

import React from 'react';
import { Input as AntInput, InputProps as AntInputProps, InputRef } from 'antd';
import type { TextAreaProps as AntTextAreaProps } from 'antd/es/input';

/**
 * 扩展的输入框属性
 */
export interface InputProps extends AntInputProps {
  /**
   * 输入框类型
   */
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url';
  
  /**
   * 输入框尺寸
   */
  size?: 'small' | 'middle' | 'large';
  
  /**
   * 是否禁用
   */
  disabled?: boolean;
  
  /**
   * 占位符
   */
  placeholder?: string;
  
  /**
   * 前缀图标
   */
  prefix?: React.ReactNode;
  
  /**
   * 后缀图标
   */
  suffix?: React.ReactNode;
}

/**
 * 文本域属性
 */
export interface TextAreaProps extends AntTextAreaProps {
  /**
   * 行数
   */
  rows?: number;
  
  /**
   * 是否自动调整高度
   */
  autoSize?: boolean | { minRows?: number; maxRows?: number };
  
  /**
   * 占位符
   */
  placeholder?: string;
}

/**
 * 通用输入框组件
 * 
 * @example
 * ```tsx
 * <Input
 *   placeholder="请输入项目名称"
 *   prefix={<SearchOutlined />}
 * />
 * 
 * <Input.Password
 *   placeholder="请输入密码"
 * />
 * 
 * <Input.TextArea
 *   rows={4}
 *   placeholder="请输入描述"
 * />
 * ```
 */
export const Input = React.forwardRef<InputRef, InputProps>(
  (props, ref) => {
    return <AntInput ref={ref} {...props} />;
  }
);

Input.displayName = 'Input';

/**
 * 密码输入框
 */
const Password = React.forwardRef<InputRef, InputProps>(
  (props, ref) => {
    return <AntInput.Password ref={ref} {...props} />;
  }
);

Password.displayName = 'Input.Password';

/**
 * 文本域
 */
const TextArea = React.forwardRef<any, TextAreaProps>(
  (props, ref) => {
    return <AntInput.TextArea ref={ref} {...props} />;
  }
);

TextArea.displayName = 'Input.TextArea';

/**
 * 搜索框
 */
const Search = React.forwardRef<InputRef, InputProps & { onSearch?: (value: string) => void }>(
  (props, ref) => {
    return <AntInput.Search ref={ref} {...props} />;
  }
);

Search.displayName = 'Input.Search';

// 添加子组件
(Input as any).Password = Password;
(Input as any).TextArea = TextArea;
(Input as any).Search = Search;

export default Input;
