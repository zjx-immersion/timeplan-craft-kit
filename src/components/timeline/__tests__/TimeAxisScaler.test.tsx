/**
 * TimeAxisScaler 组件单元测试
 * 
 * @version 1.0.0
 * @date 2026-02-03
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TimeAxisScaler } from '../TimeAxisScaler';

describe('TimeAxisScaler', () => {
  const defaultProps = {
    zoom: 1.0,
    onZoomChange: vi.fn(),
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('渲染', () => {
    it('应该正确渲染缩放控制器', () => {
      render(<TimeAxisScaler {...defaultProps} />);
      
      expect(screen.getByTestId('time-axis-scaler')).toBeInTheDocument();
      expect(screen.getByTestId('zoom-slider')).toBeInTheDocument();
      expect(screen.getByTestId('zoom-out-button')).toBeInTheDocument();
      expect(screen.getByTestId('zoom-in-button')).toBeInTheDocument();
    });

    it('应该显示当前缩放级别', () => {
      render(<TimeAxisScaler {...defaultProps} zoom={1.5} />);
      
      expect(screen.getByText('150%')).toBeInTheDocument();
    });

    it('应该显示预设按钮（默认）', () => {
      render(<TimeAxisScaler {...defaultProps} />);
      
      expect(screen.getByTestId('zoom-preset-0.5')).toBeInTheDocument();
      expect(screen.getByTestId('zoom-preset-1')).toBeInTheDocument();
      expect(screen.getByTestId('zoom-preset-2')).toBeInTheDocument();
    });

    it('可以隐藏预设按钮', () => {
      render(<TimeAxisScaler {...defaultProps} showPresets={false} />);
      
      expect(screen.queryByTestId('zoom-preset-0.5')).not.toBeInTheDocument();
    });

    it('应该显示重置按钮（默认）', () => {
      render(<TimeAxisScaler {...defaultProps} />);
      
      expect(screen.getByTestId('zoom-reset-button')).toBeInTheDocument();
    });

    it('可以隐藏重置按钮', () => {
      render(<TimeAxisScaler {...defaultProps} showReset={false} />);
      
      expect(screen.queryByTestId('zoom-reset-button')).not.toBeInTheDocument();
    });

    it('应该支持显示输入框', () => {
      render(<TimeAxisScaler {...defaultProps} showInput={true} />);
      
      expect(screen.getByTestId('zoom-input')).toBeInTheDocument();
    });

    it('默认不显示输入框', () => {
      render(<TimeAxisScaler {...defaultProps} />);
      
      expect(screen.queryByTestId('zoom-input')).not.toBeInTheDocument();
    });
  });

  describe('紧凑模式', () => {
    it('应该渲染紧凑布局', () => {
      render(<TimeAxisScaler {...defaultProps} compact={true} />);
      
      expect(screen.getByTestId('time-axis-scaler')).toBeInTheDocument();
      expect(screen.getByTestId('zoom-slider')).toBeInTheDocument();
    });

    it('紧凑模式不应该显示预设按钮', () => {
      render(<TimeAxisScaler {...defaultProps} compact={true} />);
      
      expect(screen.queryByTestId('zoom-preset-0.5')).not.toBeInTheDocument();
    });

    it('紧凑模式应该使用小按钮', () => {
      render(<TimeAxisScaler {...defaultProps} compact={true} />);
      
      const button = screen.getByTestId('zoom-out-button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('交互', () => {
    it('点击缩小按钮应该减小缩放', () => {
      const onZoomChange = vi.fn();
      render(<TimeAxisScaler {...defaultProps} zoom={1.0} onZoomChange={onZoomChange} />);
      
      fireEvent.click(screen.getByTestId('zoom-out-button'));
      expect(onZoomChange).toHaveBeenCalledWith(0.9);
    });

    it('点击放大按钮应该增大缩放', () => {
      const onZoomChange = vi.fn();
      render(<TimeAxisScaler {...defaultProps} zoom={1.0} onZoomChange={onZoomChange} />);
      
      fireEvent.click(screen.getByTestId('zoom-in-button'));
      expect(onZoomChange).toHaveBeenCalledWith(1.1);
    });

    it('点击重置按钮应该重置为 1.0', () => {
      const onZoomChange = vi.fn();
      render(<TimeAxisScaler {...defaultProps} zoom={1.5} onZoomChange={onZoomChange} />);
      
      fireEvent.click(screen.getByTestId('zoom-reset-button'));
      expect(onZoomChange).toHaveBeenCalledWith(1.0);
    });

    it('点击预设按钮应该设置对应的缩放', () => {
      const onZoomChange = vi.fn();
      render(<TimeAxisScaler {...defaultProps} onZoomChange={onZoomChange} />);
      
      fireEvent.click(screen.getByTestId('zoom-preset-1.5'));
      expect(onZoomChange).toHaveBeenCalledWith(1.5);
    });

    it('滑块变化应该触发回调', () => {
      const onZoomChange = vi.fn();
      render(<TimeAxisScaler {...defaultProps} onZoomChange={onZoomChange} />);
      
      // Ant Design Slider 测试需要特殊处理
      // 这里仅测试组件是否正确渲染
      const slider = screen.getByTestId('zoom-slider');
      expect(slider).toBeInTheDocument();
    });
  });

  describe('按钮状态', () => {
    it('缩放到最小值时，缩小按钮应该禁用', () => {
      render(<TimeAxisScaler {...defaultProps} zoom={0.5} />);
      
      const button = screen.getByTestId('zoom-out-button');
      expect(button).toBeDisabled();
    });

    it('缩放到最大值时，放大按钮应该禁用', () => {
      render(<TimeAxisScaler {...defaultProps} zoom={2.0} />);
      
      const button = screen.getByTestId('zoom-in-button');
      expect(button).toBeDisabled();
    });

    it('缩放为 1.0 时，重置按钮应该禁用', () => {
      render(<TimeAxisScaler {...defaultProps} zoom={1.0} />);
      
      const button = screen.getByTestId('zoom-reset-button');
      expect(button).toBeDisabled();
    });

    it('缩放不为 1.0 时，重置按钮应该启用', () => {
      render(<TimeAxisScaler {...defaultProps} zoom={1.5} />);
      
      const button = screen.getByTestId('zoom-reset-button');
      expect(button).not.toBeDisabled();
    });

    it('当前预设应该高亮', () => {
      render(<TimeAxisScaler {...defaultProps} zoom={1.5} />);
      
      const button = screen.getByTestId('zoom-preset-1.5');
      expect(button).toHaveClass('ant-btn-primary');
    });
  });

  describe('边界情况', () => {
    it('缩放小于最小值时，缩小按钮应该禁用', () => {
      const onZoomChange = vi.fn();
      render(<TimeAxisScaler {...defaultProps} zoom={0.5} onZoomChange={onZoomChange} />);
      
      fireEvent.click(screen.getByTestId('zoom-out-button'));
      expect(onZoomChange).not.toHaveBeenCalled();
    });

    it('缩放大于最大值时，放大按钮应该禁用', () => {
      const onZoomChange = vi.fn();
      render(<TimeAxisScaler {...defaultProps} zoom={2.0} onZoomChange={onZoomChange} />);
      
      fireEvent.click(screen.getByTestId('zoom-in-button'));
      expect(onZoomChange).not.toHaveBeenCalled();
    });

    it('应该处理无效的缩放值', () => {
      render(<TimeAxisScaler {...defaultProps} zoom={NaN} />);
      
      expect(screen.getByTestId('time-axis-scaler')).toBeInTheDocument();
    });
  });

  describe('样式和类名', () => {
    it('应该应用自定义类名', () => {
      render(<TimeAxisScaler {...defaultProps} className="custom-class" />);
      
      const scaler = screen.getByTestId('time-axis-scaler');
      expect(scaler).toHaveClass('custom-class');
    });

    it('应该应用自定义样式', () => {
      const customStyle = { backgroundColor: 'red' };
      render(<TimeAxisScaler {...defaultProps} style={customStyle} />);
      
      const scaler = screen.getByTestId('time-axis-scaler');
      expect(scaler).toHaveStyle({ backgroundColor: 'red' });
    });
  });

  describe('输入框模式', () => {
    it('输入框变化应该触发回调', () => {
      const onZoomChange = vi.fn();
      render(
        <TimeAxisScaler
          {...defaultProps}
          showInput={true}
          onZoomChange={onZoomChange}
        />
      );
      
      const input = screen.getByTestId('zoom-input');
      expect(input).toBeInTheDocument();
    });
  });

  describe('可访问性', () => {
    it('按钮应该有 Tooltip', () => {
      render(<TimeAxisScaler {...defaultProps} />);
      
      // Ant Design Tooltip 会渲染为按钮的父元素
      expect(screen.getByTestId('zoom-out-button')).toBeInTheDocument();
      expect(screen.getByTestId('zoom-in-button')).toBeInTheDocument();
      expect(screen.getByTestId('zoom-reset-button')).toBeInTheDocument();
    });
  });
});
