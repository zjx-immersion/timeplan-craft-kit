/**
 * Modal - 对话框组件
 * 
 * 📋 迁移信息:
 * - 原文件: src/components/ui/dialog.tsx (Radix UI Dialog)
 * - 迁移日期: 2026-02-03
 * - 对比状态: ⬜ 待验证
 * 
 * 🎯 功能要求:
 * - 封装 Ant Design Modal
 * - 提供统一的 API
 * - 支持常见对话框场景
 * 
 * 🔄 技术替换:
 * - Radix Dialog → Ant Modal
 * - DialogContent → Modal
 * - DialogHeader → Modal title prop
 */

import React from 'react';
import { Modal as AntModal, ModalProps as AntModalProps } from 'antd';

/**
 * 扩展的对话框属性
 */
export interface ModalProps extends AntModalProps {
  /**
   * 对话框标题
   */
  title?: React.ReactNode;
  
  /**
   * 是否显示对话框
   */
  open: boolean;
  
  /**
   * 关闭对话框的回调
   */
  onClose?: () => void;
  
  /**
   * 确认按钮文本
   */
  okText?: string;
  
  /**
   * 取消按钮文本
   */
  cancelText?: string;
  
  /**
   * 对话框内容
   */
  children?: React.ReactNode;
  
  /**
   * 对话框宽度
   */
  width?: string | number;
  
  /**
   * 是否显示关闭按钮
   */
  closable?: boolean;
  
  /**
   * 是否展示遮罩
   */
  mask?: boolean;
  
  /**
   * 点击遮罩是否关闭
   */
  maskClosable?: boolean;
}

/**
 * 通用对话框组件
 * 
 * @example
 * ```tsx
 * const [open, setOpen] = useState(false);
 * 
 * <Modal
 *   title="编辑项目"
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   onOk={handleSave}
 * >
 *   <Form>...</Form>
 * </Modal>
 * 
 * // 确认对话框
 * <Modal
 *   title="确认删除"
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   okText="删除"
 *   cancelText="取消"
 *   okButtonProps={{ danger: true }}
 * >
 *   确定要删除这个项目吗？
 * </Modal>
 * ```
 */
export const Modal: React.FC<ModalProps> = ({
  onClose,
  onCancel,
  ...props
}) => {
  // 合并 onClose 和 onCancel
  const handleCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClose?.();
    onCancel?.(e);
  };

  return (
    <AntModal
      onCancel={handleCancel}
      destroyOnHidden
      {...props}
    />
  );
};

Modal.displayName = 'Modal';

export default Modal;
