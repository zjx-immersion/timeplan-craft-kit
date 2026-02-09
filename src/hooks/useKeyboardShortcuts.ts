/**
 * useKeyboardShortcuts - 全局键盘快捷键 Hook
 * 
 * 🎯 功能:
 * - 支持常用快捷键（Ctrl+Z/Y/S等）
 * - 自动忽略输入框中的按键
 * - 可配置的快捷键映射
 * - 防止浏览器默认行为
 * 
 * 📋 支持的快捷键:
 * - Ctrl+Z: 撤销
 * - Ctrl+Y / Ctrl+Shift+Z: 重做
 * - Ctrl+S: 保存
 * - Ctrl+A: 全选
 * - Delete: 删除
 * - Escape: 取消
 * - Space: 自定义操作（如定位今日）
 * - Ctrl+1~5: 自定义操作（如切换视图）
 */

import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  handler: (event: KeyboardEvent) => void;
  preventDefault?: boolean;
}

export interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  ignoreInputs?: boolean;
  shortcuts?: KeyboardShortcut[];
}

/**
 * 检查是否应该忽略键盘事件
 */
function shouldIgnoreEvent(event: KeyboardEvent, ignoreInputs: boolean): boolean {
  if (!ignoreInputs) return false;
  
  const target = event.target as HTMLElement;
  
  // 安全检查：确保 target 和 tagName 存在
  if (!target || !target.tagName) return false;
  
  const tagName = target.tagName.toUpperCase();
  
  // 忽略输入框、文本框、内容可编辑元素
  return (
    tagName === 'INPUT' ||
    tagName === 'TEXTAREA' ||
    tagName === 'SELECT' ||
    target.isContentEditable
  );
}

/**
 * 检查快捷键是否匹配
 */
function isShortcutMatch(event: KeyboardEvent, shortcut: KeyboardShortcut): boolean {
  // 检查按键
  if (event.key.toLowerCase() !== shortcut.key.toLowerCase()) {
    return false;
  }
  
  // 检查修饰键
  if (shortcut.ctrl !== undefined && event.ctrlKey !== shortcut.ctrl) {
    return false;
  }
  if (shortcut.shift !== undefined && event.shiftKey !== shortcut.shift) {
    return false;
  }
  if (shortcut.alt !== undefined && event.altKey !== shortcut.alt) {
    return false;
  }
  if (shortcut.meta !== undefined && event.metaKey !== shortcut.meta) {
    return false;
  }
  
  return true;
}

/**
 * 全局键盘快捷键 Hook
 */
export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions = {}) {
  const {
    enabled = true,
    ignoreInputs = true,
    shortcuts = []
  } = options;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // 如果禁用，直接返回
    if (!enabled) return;
    
    // 检查是否应该忽略此事件
    if (shouldIgnoreEvent(event, ignoreInputs)) {
      return;
    }

    // 遍历所有快捷键，查找匹配的
    for (const shortcut of shortcuts) {
      if (isShortcutMatch(event, shortcut)) {
        // 如果需要阻止默认行为
        if (shortcut.preventDefault !== false) {
          event.preventDefault();
        }
        
        // 执行处理函数
        shortcut.handler(event);
        
        // 找到匹配的快捷键后停止
        break;
      }
    }
  }, [enabled, ignoreInputs, shortcuts]);

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown]);
}

/**
 * 预定义的快捷键配置
 */
export const CommonShortcuts = {
  /**
   * 撤销 (Ctrl+Z)
   */
  undo: (handler: () => void): KeyboardShortcut => ({
    key: 'z',
    ctrl: true,
    shift: false,
    handler,
  }),

  /**
   * 重做 (Ctrl+Y 或 Ctrl+Shift+Z)
   */
  redo: (handler: () => void): KeyboardShortcut[] => [
    {
      key: 'y',
      ctrl: true,
      handler,
    },
    {
      key: 'z',
      ctrl: true,
      shift: true,
      handler,
    },
  ],

  /**
   * 保存 (Ctrl+S)
   */
  save: (handler: () => void): KeyboardShortcut => ({
    key: 's',
    ctrl: true,
    handler,
  }),

  /**
   * 全选 (Ctrl+A)
   */
  selectAll: (handler: () => void): KeyboardShortcut => ({
    key: 'a',
    ctrl: true,
    handler,
  }),

  /**
   * 复制 (Ctrl+C)
   */
  copy: (handler: () => void): KeyboardShortcut => ({
    key: 'c',
    ctrl: true,
    handler,
  }),

  /**
   * 粘贴 (Ctrl+V)
   */
  paste: (handler: () => void): KeyboardShortcut => ({
    key: 'v',
    ctrl: true,
    handler,
  }),

  /**
   * 剪切 (Ctrl+X)
   */
  cut: (handler: () => void): KeyboardShortcut => ({
    key: 'x',
    ctrl: true,
    handler,
  }),

  /**
   * 删除 (Delete)
   */
  delete: (handler: () => void): KeyboardShortcut => ({
    key: 'Delete',
    handler,
  }),

  /**
   * 取消 (Escape)
   */
  escape: (handler: () => void): KeyboardShortcut => ({
    key: 'Escape',
    handler,
  }),

  /**
   * 空格 (Space)
   */
  space: (handler: () => void): KeyboardShortcut => ({
    key: ' ',
    handler,
  }),

  /**
   * 数字键 (Ctrl+1~9)
   */
  number: (num: number, handler: () => void): KeyboardShortcut => ({
    key: num.toString(),
    ctrl: true,
    handler,
  }),
};
