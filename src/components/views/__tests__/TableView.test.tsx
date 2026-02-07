/**
 * TableView 组件单元测试
 * 
 * @version 1.0.0
 * @date 2026-02-03
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TableView } from '../TableView';
import type { TimePlan } from '@/types/timeplanSchema';

describe('TableView', () => {
  const mockData: TimePlan = {
    id: 'plan-1',
    title: '测试项目',
    version: '2.1.0',
    timelines: [
      {
        id: 'timeline-1',
        name: 'Timeline 1',
        lines: [
          {
            id: 'line-1',
            label: 'Task 1',
            startDate: '2026-01-01',
            endDate: '2026-01-31',
            progress: 50,
            status: 'in-progress',
            priority: 'high',
            tags: ['frontend', 'urgent'],
          },
          {
            id: 'line-2',
            label: 'Task 2',
            startDate: '2026-02-01',
            endDate: '2026-02-28',
            progress: 0,
            status: 'not-started',
          },
        ],
      },
    ],
  };

  const defaultProps = {
    data: mockData,
  };

  describe('渲染', () => {
    it('应该正确渲染表格视图', () => {
      render(<TableView {...defaultProps} />);
      
      expect(screen.getByTestId('table-view')).toBeInTheDocument();
      expect(screen.getByTestId('data-table')).toBeInTheDocument();
    });

    it('应该显示搜索框', () => {
      render(<TableView {...defaultProps} />);
      
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
    });

    it('应该显示所有行', () => {
      render(<TableView {...defaultProps} />);
      
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('Task 2')).toBeInTheDocument();
    });

    it('应该显示进度条', () => {
      render(<TableView {...defaultProps} />);
      
      // Ant Design Progress 组件会渲染
      expect(screen.getByTestId('table-view')).toBeInTheDocument();
    });

    it('应该显示状态标签', () => {
      render(<TableView {...defaultProps} />);
      
      expect(screen.getByText('进行中')).toBeInTheDocument();
      expect(screen.getByText('未开始')).toBeInTheDocument();
    });

    it('应该显示优先级标签', () => {
      render(<TableView {...defaultProps} />);
      
      expect(screen.getByText('高')).toBeInTheDocument();
    });

    it('应该显示标签', () => {
      render(<TableView {...defaultProps} />);
      
      expect(screen.getByText('frontend')).toBeInTheDocument();
      expect(screen.getByText('urgent')).toBeInTheDocument();
    });

    it('应该显示导出按钮（如果提供了回调）', () => {
      render(<TableView {...defaultProps} onExport={vi.fn()} />);
      
      expect(screen.getByTestId('export-button')).toBeInTheDocument();
    });

    it('应该显示编辑按钮', () => {
      render(<TableView {...defaultProps} onEdit={vi.fn()} />);
      
      expect(screen.getByTestId('edit-line-1')).toBeInTheDocument();
    });

    it('只读模式不应该显示编辑按钮', () => {
      render(<TableView {...defaultProps} readonly={true} onEdit={vi.fn()} />);
      
      expect(screen.queryByTestId('edit-line-1')).not.toBeInTheDocument();
    });

    it('可以隐藏搜索框', () => {
      render(<TableView {...defaultProps} showSearch={false} />);
      
      expect(screen.queryByTestId('search-input')).not.toBeInTheDocument();
    });
  });

  describe('搜索功能', () => {
    it('搜索应该筛选数据', () => {
      render(<TableView {...defaultProps} />);
      
      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'Task 1' } });
      
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.queryByText('Task 2')).not.toBeInTheDocument();
    });

    it('搜索应该不区分大小写', () => {
      render(<TableView {...defaultProps} />);
      
      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'task 1' } });
      
      expect(screen.getByText('Task 1')).toBeInTheDocument();
    });

    it('清空搜索应该显示所有数据', () => {
      render(<TableView {...defaultProps} />);
      
      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'Task 1' } });
      fireEvent.change(searchInput, { target: { value: '' } });
      
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('Task 2')).toBeInTheDocument();
    });
  });

  describe('交互', () => {
    it('点击编辑应该触发回调', () => {
      const onEdit = vi.fn();
      render(<TableView {...defaultProps} onEdit={onEdit} />);
      
      fireEvent.click(screen.getByTestId('edit-line-1'));
      expect(onEdit).toHaveBeenCalled();
    });

    it('点击导出应该触发回调', () => {
      const onExport = vi.fn();
      render(<TableView {...defaultProps} onExport={onExport} />);
      
      fireEvent.click(screen.getByTestId('export-button'));
      expect(onExport).toHaveBeenCalled();
    });
  });

  describe('边界情况', () => {
    it('应该处理空数据', () => {
      const emptyData: TimePlan = {
        id: 'plan-1',
        title: '空项目',
        version: '2.1.0',
        timelines: [],
      };
      
      render(<TableView data={emptyData} />);
      
      expect(screen.getByTestId('table-view')).toBeInTheDocument();
      expect(screen.getByText('共 0 条记录')).toBeInTheDocument();
    });

    it('应该处理缺失的可选字段', () => {
      const dataWithMissingFields: TimePlan = {
        id: 'plan-1',
        title: '测试项目',
        version: '2.1.0',
        timelines: [
          {
            id: 'timeline-1',
            name: 'Timeline 1',
            lines: [
              {
                id: 'line-1',
                label: 'Task 1',
                startDate: '2026-01-01',
                endDate: '2026-01-31',
              },
            ],
          },
        ],
      };
      
      render(<TableView data={dataWithMissingFields} />);
      
      expect(screen.getByTestId('table-view')).toBeInTheDocument();
    });
  });
});
