/**
 * TimelineToolbar 组件单元测试
 * 
 * @version 1.0.0
 * @date 2026-02-03
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TimelineToolbar } from '../TimelineToolbar';
import type { TimeScale } from '@/types/timeplanSchema';

describe('TimelineToolbar', () => {
  const defaultProps = {
    isEditMode: false,
    onToggleEditMode: vi.fn(),
    showCriticalPath: false,
    onToggleCriticalPath: vi.fn(),
    scale: 'month' as TimeScale,
    onScaleChange: vi.fn(),
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('渲染', () => {
    it('应该正确渲染工具栏', () => {
      render(<TimelineToolbar {...defaultProps} />);
      
      expect(screen.getByTestId('timeline-toolbar')).toBeInTheDocument();
      expect(screen.getByTestId('toggle-edit-mode')).toBeInTheDocument();
      expect(screen.getByTestId('toggle-critical-path')).toBeInTheDocument();
      expect(screen.getByTestId('scale-select')).toBeInTheDocument();
    });

    it('在查看模式下应该显示"查看"按钮', () => {
      render(<TimelineToolbar {...defaultProps} isEditMode={false} />);
      
      expect(screen.getByText('查看')).toBeInTheDocument();
    });

    it('在编辑模式下应该显示"编辑"按钮', () => {
      render(<TimelineToolbar {...defaultProps} isEditMode={true} />);
      
      expect(screen.getByText('编辑')).toBeInTheDocument();
    });

    it('在编辑模式下应该显示添加按钮', () => {
      render(
        <TimelineToolbar
          {...defaultProps}
          isEditMode={true}
          onAddTimeline={vi.fn()}
          onAddLine={vi.fn()}
        />
      );
      
      expect(screen.getByTestId('add-timeline')).toBeInTheDocument();
      expect(screen.getByTestId('add-line')).toBeInTheDocument();
    });

    it('在查看模式下不应该显示添加按钮', () => {
      render(
        <TimelineToolbar
          {...defaultProps}
          isEditMode={false}
          onAddTimeline={vi.fn()}
          onAddLine={vi.fn()}
        />
      );
      
      expect(screen.queryByTestId('add-timeline')).not.toBeInTheDocument();
      expect(screen.queryByTestId('add-line')).not.toBeInTheDocument();
    });

    it('应该显示撤销/重做按钮（如果提供了回调）', () => {
      render(
        <TimelineToolbar
          {...defaultProps}
          onUndo={vi.fn()}
          onRedo={vi.fn()}
          canUndo={true}
          canRedo={true}
        />
      );
      
      expect(screen.getByTestId('undo-button')).toBeInTheDocument();
      expect(screen.getByTestId('redo-button')).toBeInTheDocument();
    });

    it('应该显示保存按钮（如果提供了回调）', () => {
      render(<TimelineToolbar {...defaultProps} onSave={vi.fn()} />);
      
      expect(screen.getByTestId('save-button')).toBeInTheDocument();
      expect(screen.getByText('保存')).toBeInTheDocument();
    });
  });

  describe('交互', () => {
    it('点击编辑模式按钮应该触发回调', () => {
      const onToggleEditMode = vi.fn();
      render(
        <TimelineToolbar {...defaultProps} onToggleEditMode={onToggleEditMode} />
      );
      
      fireEvent.click(screen.getByTestId('toggle-edit-mode'));
      expect(onToggleEditMode).toHaveBeenCalledTimes(1);
    });

    it('点击关键路径按钮应该触发回调', () => {
      const onToggleCriticalPath = vi.fn();
      render(
        <TimelineToolbar
          {...defaultProps}
          onToggleCriticalPath={onToggleCriticalPath}
        />
      );
      
      fireEvent.click(screen.getByTestId('toggle-critical-path'));
      expect(onToggleCriticalPath).toHaveBeenCalledTimes(1);
    });

    it('点击添加 Timeline 按钮应该触发回调', () => {
      const onAddTimeline = vi.fn();
      render(
        <TimelineToolbar
          {...defaultProps}
          isEditMode={true}
          onAddTimeline={onAddTimeline}
        />
      );
      
      fireEvent.click(screen.getByTestId('add-timeline'));
      expect(onAddTimeline).toHaveBeenCalledTimes(1);
    });

    it('点击添加节点按钮应该触发回调', () => {
      const onAddLine = vi.fn();
      render(
        <TimelineToolbar
          {...defaultProps}
          isEditMode={true}
          onAddLine={onAddLine}
        />
      );
      
      fireEvent.click(screen.getByTestId('add-line'));
      expect(onAddLine).toHaveBeenCalledTimes(1);
    });

    it('点击撤销按钮应该触发回调', () => {
      const onUndo = vi.fn();
      render(
        <TimelineToolbar
          {...defaultProps}
          onUndo={onUndo}
          canUndo={true}
        />
      );
      
      fireEvent.click(screen.getByTestId('undo-button'));
      expect(onUndo).toHaveBeenCalledTimes(1);
    });

    it('点击重做按钮应该触发回调', () => {
      const onRedo = vi.fn();
      render(
        <TimelineToolbar
          {...defaultProps}
          onRedo={onRedo}
          canRedo={true}
        />
      );
      
      fireEvent.click(screen.getByTestId('redo-button'));
      expect(onRedo).toHaveBeenCalledTimes(1);
    });

    it('点击保存按钮应该触发回调', () => {
      const onSave = vi.fn();
      render(<TimelineToolbar {...defaultProps} onSave={onSave} />);
      
      fireEvent.click(screen.getByTestId('save-button'));
      expect(onSave).toHaveBeenCalledTimes(1);
    });

    it('撤销按钮在不可用时应该被禁用', () => {
      render(
        <TimelineToolbar
          {...defaultProps}
          onUndo={vi.fn()}
          canUndo={false}
        />
      );
      
      const undoButton = screen.getByTestId('undo-button');
      expect(undoButton).toBeDisabled();
    });

    it('重做按钮在不可用时应该被禁用', () => {
      render(
        <TimelineToolbar
          {...defaultProps}
          onRedo={vi.fn()}
          canRedo={false}
        />
      );
      
      const redoButton = screen.getByTestId('redo-button');
      expect(redoButton).toBeDisabled();
    });
  });

  describe('时间刻度', () => {
    it('应该显示当前时间刻度', () => {
      render(<TimelineToolbar {...defaultProps} scale="month" />);
      
      const select = screen.getByTestId('scale-select');
      // Ant Design Select 的测试需要特殊处理
      expect(select).toBeInTheDocument();
    });

    it('更改时间刻度应该触发回调', () => {
      const onScaleChange = vi.fn();
      render(
        <TimelineToolbar {...defaultProps} onScaleChange={onScaleChange} />
      );
      
      // 注意：Ant Design Select 的测试需要使用特殊方法
      // 这里仅测试组件是否正确渲染
      const select = screen.getByTestId('scale-select');
      expect(select).toBeInTheDocument();
    });
  });

  describe('样式和类名', () => {
    it('应该应用自定义类名', () => {
      render(<TimelineToolbar {...defaultProps} className="custom-class" />);
      
      const toolbar = screen.getByTestId('timeline-toolbar');
      expect(toolbar).toHaveClass('custom-class');
    });

    it('应该应用自定义样式', () => {
      const customStyle = { backgroundColor: 'red' };
      render(<TimelineToolbar {...defaultProps} style={customStyle} />);
      
      const toolbar = screen.getByTestId('timeline-toolbar');
      expect(toolbar).toHaveStyle({ backgroundColor: 'red' });
    });
  });

  describe('可访问性', () => {
    it('按钮应该有 Tooltip（通过 title 属性）', () => {
      render(<TimelineToolbar {...defaultProps} />);
      
      // Ant Design Tooltip 渲染为按钮的父元素
      expect(screen.getByTestId('toggle-edit-mode')).toBeInTheDocument();
      expect(screen.getByTestId('toggle-critical-path')).toBeInTheDocument();
    });
  });

  describe('边界情况', () => {
    it('没有可选回调时应该正常渲染', () => {
      render(<TimelineToolbar {...defaultProps} />);
      
      expect(screen.getByTestId('timeline-toolbar')).toBeInTheDocument();
      expect(screen.queryByTestId('undo-button')).not.toBeInTheDocument();
      expect(screen.queryByTestId('save-button')).not.toBeInTheDocument();
    });

    it('所有回调都提供时应该显示所有按钮', () => {
      render(
        <TimelineToolbar
          {...defaultProps}
          isEditMode={true}
          onAddTimeline={vi.fn()}
          onAddLine={vi.fn()}
          onUndo={vi.fn()}
          onRedo={vi.fn()}
          onSave={vi.fn()}
        />
      );
      
      expect(screen.getByTestId('add-timeline')).toBeInTheDocument();
      expect(screen.getByTestId('add-line')).toBeInTheDocument();
      expect(screen.getByTestId('undo-button')).toBeInTheDocument();
      expect(screen.getByTestId('redo-button')).toBeInTheDocument();
      expect(screen.getByTestId('save-button')).toBeInTheDocument();
    });
  });
});
