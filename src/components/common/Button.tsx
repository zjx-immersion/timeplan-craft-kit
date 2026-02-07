/**
 * Button - 按钮组件
 * 
 * 📋 迁移信息:
 * - 原文件: src/components/ui/button.tsx (Shadcn UI)
 * - 迁移日期: 2026-02-03
 * - 对比状态: ⬜ 待验证
 * 
 * 🎯 功能要求:
 * - 封装 Ant Design Button
 * - 提供统一的 API
 * - 支持常见按钮变体
 * 
 * 🔄 技术替换:
 * - Shadcn Button → Ant Button
 * - class-variance-authority → Ant Design variant props
 */

import React from 'react';
import { Button as AntButton, ButtonProps as AntButtonProps } from 'antd';

/**
 * 扩展的按钮属性
 */
export interface ButtonProps extends AntButtonProps {
  /**
   * 按钮变体
   * - outlined: 默认按钮（Ant Design 5.x）
   * - solid: 实心按钮
   * - filled: 填充按钮
   * - dashed: 虚线按钮
   * - text: 文本按钮
   * - link: 链接按钮
   */
  variant?: 'outlined' | 'solid' | 'filled' | 'dashed' | 'text' | 'link';
  
  /**
   * 按钮尺寸
   */
  size?: 'small' | 'middle' | 'large';
  
  /**
   * 是否为危险按钮
   */
  danger?: boolean;
  
  /**
   * 是否为幽灵按钮
   */
  ghost?: boolean;
}

/**
 * 通用按钮组件
 * 
 * @example
 * ```tsx
 * <Button variant="primary" size="large">
 *   提交
 * </Button>
 * 
 * <Button variant="text" danger>
 *   删除
 * </Button>
 * 
 * <Button loading icon={<PlusOutlined />}>
 *   添加
 * </Button>
 * ```
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'outlined', ...props }, ref) => {
    // 将 variant 映射到 Ant Design 的 type/variant
    // Ant Design 5.x使用variant prop而不是type
    const variantMap: Record<string, AntButtonProps['variant']> = {
      outlined: 'outlined',
      solid: 'solid',
      filled: 'filled',
      dashed: 'dashed',
      text: 'text',
      link: 'link',
    };

    return (
      <AntButton
        ref={ref as any}
        variant={variantMap[variant]}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export default Button;
