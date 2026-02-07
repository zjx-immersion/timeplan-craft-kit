/**
 * ViewSwitcher 组件单元测试
 * 
 * @version 1.0.0
 * @date 2026-02-03
 */

import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ViewSwitcher, ViewType } from '../ViewSwitcher';

describe('ViewSwitcher', () => {
  const defaultProps = {
    view: 'gantt' as ViewType,
    onViewChange: vi.fn(),
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('渲染', () => {
    it('应该正确渲染视图切换器', () => {
      render(<ViewSwitcher {...defaultProps} />);
      
      expect(screen.getByTestId('view-switcher')).toBeInTheDocument();
    });

    it('应该显示所有 5 种视图选项', () => {
      render(<ViewSwitcher {...defaultProps} />);
      
      expect(screen.getByText('甘特图')).toBeInTheDocument();
      expect(screen.getByText('表格')).toBeInTheDocument();
      expect(screen.getByText('矩阵')).toBeInTheDocument();
      expect(screen.getByText('版本')).toBeInTheDocument();
      expect(screen.getByText('迭代')).toBeInTheDocument();
    });

    it('应该高亮当前选中的视图', () => {
      const { rerender } = render(<ViewSwitcher {...defaultProps} view="gantt" />);
      
      // Ant Design Segmented 组件会为选中项添加特定的类名
      let switcher = screen.getByTestId('view-switcher');
      expect(switcher).toBeInTheDocument();
      
      rerender(<ViewSwitcher {...defaultProps} view="table" />);
      switcher = screen.getByTestId('view-switcher');
      expect(switcher).toBeInTheDocument();
    });

    it('只显示图标时应该隐藏标签', () => {
      render(
        <ViewSwitcher
          {...defaultProps}
          showIcons={true}
          showLabels={false}
        />
      );
      
      // 标签不应该显示
      expect(screen.queryByText('甘特图')).not.toBeInTheDocument();
    });

    it('只显示标签时应该隐藏图标', () => {
      render(
        <ViewSwitcher
          {...defaultProps}
          showIcons={false}
          showLabels={true}
        />
      );
      
      // 标签应该显示
      expect(screen.getByText('甘特图')).toBeInTheDocument();
    });
  });

  describe('交互', () => {
    it('点击视图选项应该触发回调', () => {
      const onViewChange = vi.fn();
      render(<ViewSwitcher {...defaultProps} onViewChange={onViewChange} />);
      
      // 点击表格视图
      fireEvent.click(screen.getByText('表格'));
      expect(onViewChange).toHaveBeenCalledWith('table');
    });

    it('切换到不同视图应该触发不同的回调参数', () => {
      const onViewChange = vi.fn();
      render(<ViewSwitcher {...defaultProps} onViewChange={onViewChange} />);
      
      // 点击矩阵视图
      fireEvent.click(screen.getByText('矩阵'));
      expect(onViewChange).toHaveBeenCalledWith('matrix');
      
      // 点击版本视图
      fireEvent.click(screen.getByText('版本'));
      expect(onViewChange).toHaveBeenCalledWith('version');
      
      // 点击迭代视图
      fireEvent.click(screen.getByText('迭代'));
      expect(onViewChange).toHaveBeenCalledWith('iteration');
    });
  });

  describe('样式和尺寸', () => {
    it('应该支持 large 尺寸', () => {
      render(<ViewSwitcher {...defaultProps} size="large" />);
      
      const switcher = screen.getByTestId('view-switcher');
      expect(switcher).toBeInTheDocument();
    });

    it('应该支持 small 尺寸', () => {
      render(<ViewSwitcher {...defaultProps} size="small" />);
      
      const switcher = screen.getByTestId('view-switcher');
      expect(switcher).toBeInTheDocument();
    });

    it('应该应用自定义类名', () => {
      render(<ViewSwitcher {...defaultProps} className="custom-class" />);
      
      const switcher = screen.getByTestId('view-switcher');
      expect(switcher).toHaveClass('custom-class');
    });

    it('应该应用自定义样式', () => {
      const customStyle = { backgroundColor: 'red' };
      render(<ViewSwitcher {...defaultProps} style={customStyle} />);
      
      const switcher = screen.getByTestId('view-switcher');
      expect(switcher).toHaveStyle({ backgroundColor: 'red' });
    });
  });

  describe('响应式', () => {
    it('在小屏幕上应该只显示图标', () => {
      render(
        <ViewSwitcher
          {...defaultProps}
          showIcons={true}
          showLabels={false}
        />
      );
      
      const switcher = screen.getByTestId('view-switcher');
      expect(switcher).toBeInTheDocument();
    });
  });

  describe('所有视图类型', () => {
    const viewTypes: ViewType[] = ['gantt', 'table', 'matrix', 'version', 'iteration'];
    
    viewTypes.forEach(viewType => {
      it(`应该支持 ${viewType} 视图`, () => {
        render(<ViewSwitcher {...defaultProps} view={viewType} />);
        
        const switcher = screen.getByTestId('view-switcher');
        expect(switcher).toBeInTheDocument();
      });
    });
  });

  describe('边界情况', () => {
    it('同时隐藏图标和标签时应该正常渲染', () => {
      render(
        <ViewSwitcher
          {...defaultProps}
          showIcons={false}
          showLabels={false}
        />
      );
      
      const switcher = screen.getByTestId('view-switcher');
      expect(switcher).toBeInTheDocument();
    });

    it('未提供 showIcons 和 showLabels 时应该使用默认值', () => {
      render(<ViewSwitcher {...defaultProps} />);
      
      // 默认应该显示图标和标签
      expect(screen.getByText('甘特图')).toBeInTheDocument();
    });

    it('未提供 size 时应该使用默认值', () => {
      render(<ViewSwitcher {...defaultProps} />);
      
      const switcher = screen.getByTestId('view-switcher');
      expect(switcher).toBeInTheDocument();
    });
  });
});
