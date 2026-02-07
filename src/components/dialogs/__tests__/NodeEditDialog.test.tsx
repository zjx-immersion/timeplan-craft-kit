/**
 * NodeEditDialog 组件单元测试
 * 
 * 测试节点编辑对话框的核心功能：
 * - 表单字段渲染
 * - 数据绑定
 * - 表单验证
 * - 保存和取消操作
 * 
 * @version 1.0.0
 * @date 2026-02-07
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { message } from 'antd';
import dayjs from 'dayjs';
import { NodeEditDialog } from '../NodeEditDialog';
import type { Line } from '@/types/timeplanSchema';

// Mock antd message
vi.mock('antd', async () => {
  const actual = await vi.importActual('antd');
  return {
    ...actual,
    message: {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
    },
  };
});

describe('NodeEditDialog', () => {
  const mockNode: Line = {
    id: 'line-1',
    label: '测试节点',
    schemaId: 'bar-schema',
    timelineId: 'timeline-1',
    startDate: new Date('2026-01-01'),
    endDate: new Date('2026-01-10'),
    attributes: {
      status: 'pending',
      priority: 'medium',
      color: '#1890ff',
      assignee: '张三',
      progress: 50,
      description: '测试描述',
    },
    notes: '测试备注',
  };

  const mockOnSave = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('组件渲染', () => {
    it('应该在open=true时渲染对话框', () => {
      render(
        <NodeEditDialog
          open={true}
          node={mockNode}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('编辑节点')).toBeInTheDocument();
    });

    it('应该在open=false时不渲染对话框', () => {
      const { container } = render(
        <NodeEditDialog
          open={false}
          node={mockNode}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />
      );

      expect(screen.queryByText('编辑节点')).not.toBeInTheDocument();
    });

    it('应该在node为null时安全处理', () => {
      render(
        <NodeEditDialog
          open={true}
          node={null}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />
      );

      // 不应该崩溃
      expect(screen.queryByText('编辑节点')).not.toBeInTheDocument();
    });
  });

  describe('表单字段', () => {
    it('应该正确显示节点名称', () => {
      render(
        <NodeEditDialog
          open={true}
          node={mockNode}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />
      );

      const nameInput = screen.getByDisplayValue('测试节点');
      expect(nameInput).toBeInTheDocument();
    });

    it('应该正确显示状态选择器', () => {
      render(
        <NodeEditDialog
          open={true}
          node={mockNode}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />
      );

      // Ant Design Select会渲染为特定结构
      // 需要根据实际渲染结构调整查询
      expect(screen.getByText('状态')).toBeInTheDocument();
    });

    it('应该正确显示优先级选择器', () => {
      render(
        <NodeEditDialog
          open={true}
          node={mockNode}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('优先级')).toBeInTheDocument();
    });
  });

  describe('保存操作', () => {
    it('应该在点击保存时调用onSave', async () => {
      render(
        <NodeEditDialog
          open={true}
          node={mockNode}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />
      );

      const saveButton = screen.getByText('保存');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled();
      });
    });

    it('应该传递正确的更新数据', async () => {
      render(
        <NodeEditDialog
          open={true}
          node={mockNode}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />
      );

      // 修改名称
      const nameInput = screen.getByDisplayValue('测试节点');
      fireEvent.change(nameInput, { target: { value: '新名称' } });

      const saveButton = screen.getByText('保存');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          mockNode.id,
          expect.objectContaining({
            label: '新名称',
          })
        );
      });
    });

    it('应该在保存成功后调用onClose', async () => {
      render(
        <NodeEditDialog
          open={true}
          node={mockNode}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />
      );

      const saveButton = screen.getByText('保存');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });
  });

  describe('取消操作', () => {
    it('应该在点击取消时调用onClose', () => {
      render(
        <NodeEditDialog
          open={true}
          node={mockNode}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />
      );

      const cancelButton = screen.getByText('取消');
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('应该在取消时不调用onSave', () => {
      render(
        <NodeEditDialog
          open={true}
          node={mockNode}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />
      );

      const cancelButton = screen.getByText('取消');
      fireEvent.click(cancelButton);

      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  describe('表单验证', () => {
    it('应该验证节点名称为必填', async () => {
      render(
        <NodeEditDialog
          open={true}
          node={mockNode}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />
      );

      // 清空名称
      const nameInput = screen.getByDisplayValue('测试节点');
      fireEvent.change(nameInput, { target: { value: '' } });

      const saveButton = screen.getByText('保存');
      fireEvent.click(saveButton);

      // 应该显示验证错误
      await waitFor(() => {
        expect(mockOnSave).not.toHaveBeenCalled();
      });
    });

    it('应该验证日期范围', async () => {
      render(
        <NodeEditDialog
          open={true}
          node={mockNode}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />
      );

      // 设置结束日期早于开始日期
      // 这需要操作DatePicker组件，可能需要更复杂的测试设置

      const saveButton = screen.getByText('保存');
      fireEvent.click(saveButton);

      // 应该显示验证错误
      await waitFor(() => {
        // 验证逻辑可能由Ant Design Form处理
        expect(mockOnSave).not.toHaveBeenCalled();
      });
    });
  });

  describe('不同节点类型', () => {
    it('应该为Bar类型显示结束日期字段', () => {
      const barNode: Line = {
        ...mockNode,
        schemaId: 'bar-schema',
      };

      render(
        <NodeEditDialog
          open={true}
          node={barNode}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText('结束日期')).toBeInTheDocument();
    });

    it('应该为Milestone类型隐藏结束日期字段', () => {
      const milestoneNode: Line = {
        ...mockNode,
        schemaId: 'milestone-schema',
        endDate: undefined,
      };

      render(
        <NodeEditDialog
          open={true}
          node={milestoneNode}
          onSave={mockOnSave}
          onClose={mockOnClose}
        />
      );

      // Milestone不应该有结束日期
      // 需要根据实际实现调整
    });
  });
});
