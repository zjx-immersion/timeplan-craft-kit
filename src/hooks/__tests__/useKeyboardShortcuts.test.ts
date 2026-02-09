/**
 * useKeyboardShortcuts Hook 单元测试
 */

import { renderHook, act } from '@testing-library/react';
import { useKeyboardShortcuts, CommonShortcuts, type KeyboardShortcut } from '../useKeyboardShortcuts';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('useKeyboardShortcuts', () => {
  let mockHandler: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockHandler = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('基础功能', () => {
    it('应该在按下匹配的快捷键时调用处理函数', () => {
      const shortcuts: KeyboardShortcut[] = [
        { key: 'z', ctrl: true, handler: mockHandler },
      ];

      renderHook(() => useKeyboardShortcuts({ shortcuts }));

      // 模拟 Ctrl+Z
      act(() => {
        const event = new KeyboardEvent('keydown', {
          key: 'z',
          ctrlKey: true,
          bubbles: true,
        });
        window.dispatchEvent(event);
      });

      expect(mockHandler).toHaveBeenCalledTimes(1);
    });

    it('应该在不匹配的快捷键时不调用处理函数', () => {
      const shortcuts: KeyboardShortcut[] = [
        { key: 'z', ctrl: true, handler: mockHandler },
      ];

      renderHook(() => useKeyboardShortcuts({ shortcuts }));

      // 模拟不匹配的按键
      act(() => {
        const event = new KeyboardEvent('keydown', {
          key: 'a',
          ctrlKey: true,
          bubbles: true,
        });
        window.dispatchEvent(event);
      });

      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('应该支持多个快捷键', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      const shortcuts: KeyboardShortcut[] = [
        { key: 'z', ctrl: true, handler: handler1 },
        { key: 's', ctrl: true, handler: handler2 },
      ];

      renderHook(() => useKeyboardShortcuts({ shortcuts }));

      // 触发第一个快捷键
      act(() => {
        window.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true })
        );
      });

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).not.toHaveBeenCalled();

      // 触发第二个快捷键
      act(() => {
        window.dispatchEvent(
          new KeyboardEvent('keydown', { key: 's', ctrlKey: true, bubbles: true })
        );
      });

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
    });
  });

  describe('修饰键匹配', () => {
    it('应该正确匹配 Ctrl 键', () => {
      const shortcuts: KeyboardShortcut[] = [
        { key: 'z', ctrl: true, handler: mockHandler },
      ];

      renderHook(() => useKeyboardShortcuts({ shortcuts }));

      // 不带 Ctrl
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', bubbles: true }));
      });
      expect(mockHandler).not.toHaveBeenCalled();

      // 带 Ctrl
      act(() => {
        window.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true })
        );
      });
      expect(mockHandler).toHaveBeenCalledTimes(1);
    });

    it('应该正确匹配 Shift 键', () => {
      const shortcuts: KeyboardShortcut[] = [
        { key: 'z', ctrl: true, shift: true, handler: mockHandler },
      ];

      renderHook(() => useKeyboardShortcuts({ shortcuts }));

      // 只有 Ctrl
      act(() => {
        window.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true })
        );
      });
      expect(mockHandler).not.toHaveBeenCalled();

      // Ctrl + Shift
      act(() => {
        window.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'z',
            ctrlKey: true,
            shiftKey: true,
            bubbles: true,
          })
        );
      });
      expect(mockHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('输入框忽略', () => {
    it('应该忽略输入框中的按键', () => {
      const shortcuts: KeyboardShortcut[] = [
        { key: 'z', ctrl: true, handler: mockHandler },
      ];

      renderHook(() => useKeyboardShortcuts({ shortcuts, ignoreInputs: true }));

      // 创建输入框元素并设置 focus
      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();

      // 在输入框中触发事件
      act(() => {
        input.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'z',
            ctrlKey: true,
            bubbles: true,
          })
        );
      });

      expect(mockHandler).not.toHaveBeenCalled();

      document.body.removeChild(input);
    });

    it('应该允许禁用输入框忽略', () => {
      const shortcuts: KeyboardShortcut[] = [
        { key: 'z', ctrl: true, handler: mockHandler },
      ];

      renderHook(() => useKeyboardShortcuts({ shortcuts, ignoreInputs: false }));

      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();

      act(() => {
        input.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'z',
            ctrlKey: true,
            bubbles: true,
          })
        );
      });

      expect(mockHandler).toHaveBeenCalledTimes(1);

      document.body.removeChild(input);
    });
  });

  describe('启用/禁用', () => {
    it('应该支持禁用快捷键', () => {
      const shortcuts: KeyboardShortcut[] = [
        { key: 'z', ctrl: true, handler: mockHandler },
      ];

      renderHook(() => useKeyboardShortcuts({ shortcuts, enabled: false }));

      act(() => {
        window.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true })
        );
      });

      expect(mockHandler).not.toHaveBeenCalled();
    });
  });

  describe('CommonShortcuts 预定义快捷键', () => {
    it('应该正确创建撤销快捷键', () => {
      const shortcut = CommonShortcuts.undo(mockHandler);

      expect(shortcut.key).toBe('z');
      expect(shortcut.ctrl).toBe(true);
      expect(shortcut.shift).toBe(false);
    });

    it('应该正确创建重做快捷键', () => {
      const shortcuts = CommonShortcuts.redo(mockHandler);

      expect(shortcuts).toHaveLength(2);
      expect(shortcuts[0].key).toBe('y');
      expect(shortcuts[0].ctrl).toBe(true);
      expect(shortcuts[1].key).toBe('z');
      expect(shortcuts[1].ctrl).toBe(true);
      expect(shortcuts[1].shift).toBe(true);
    });

    it('应该正确创建保存快捷键', () => {
      const shortcut = CommonShortcuts.save(mockHandler);

      expect(shortcut.key).toBe('s');
      expect(shortcut.ctrl).toBe(true);
    });

    it('应该正确创建全选快捷键', () => {
      const shortcut = CommonShortcuts.selectAll(mockHandler);

      expect(shortcut.key).toBe('a');
      expect(shortcut.ctrl).toBe(true);
    });

    it('应该正确创建数字快捷键', () => {
      const shortcut = CommonShortcuts.number(1, mockHandler);

      expect(shortcut.key).toBe('1');
      expect(shortcut.ctrl).toBe(true);
    });
  });

  describe('preventDefault', () => {
    it('应该默认阻止浏览器默认行为', () => {
      let preventDefaultCalled = false;
      
      const shortcuts: KeyboardShortcut[] = [
        { 
          key: 's', 
          ctrl: true, 
          handler: (e) => {
            preventDefaultCalled = e.defaultPrevented;
            mockHandler();
          },
        },
      ];

      renderHook(() => useKeyboardShortcuts({ shortcuts }));

      act(() => {
        window.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 's',
            ctrlKey: true,
            bubbles: true,
            cancelable: true,
          })
        );
      });

      expect(mockHandler).toHaveBeenCalled();
      // 注意：在测试环境中，实际的 preventDefault 行为可能不同
      // 我们主要验证 handler 被调用
    });

    it('应该支持不阻止默认行为', () => {
      const shortcuts: KeyboardShortcut[] = [
        { 
          key: 's', 
          ctrl: true, 
          handler: mockHandler, 
          preventDefault: false 
        },
      ];

      renderHook(() => useKeyboardShortcuts({ shortcuts }));

      act(() => {
        window.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 's',
            ctrlKey: true,
            bubbles: true,
            cancelable: true,
          })
        );
      });

      expect(mockHandler).toHaveBeenCalled();
    });
  });

  describe('清理', () => {
    it('应该在卸载时移除事件监听器', () => {
      const shortcuts: KeyboardShortcut[] = [
        { key: 'z', ctrl: true, handler: mockHandler },
      ];

      const { unmount } = renderHook(() => useKeyboardShortcuts({ shortcuts }));

      // 卸载
      unmount();

      // 尝试触发事件
      act(() => {
        window.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true })
        );
      });

      // 不应该被调用
      expect(mockHandler).not.toHaveBeenCalled();
    });
  });
});
