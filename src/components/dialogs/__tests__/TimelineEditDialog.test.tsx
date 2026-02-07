/**
 * TimelineEditDialog 组件单元测试
 * 
 * @version 1.0.0
 * @date 2026-02-03
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TimelineEditDialog } from '../TimelineEditDialog';
import type { Timeline } from '@/types/timeplanSchema';

describe('TimelineEditDialog', () => {
  const mockTimeline: Timeline = {
    id: 'timeline-1',
    name: '测试 Timeline',
    owner: '张三',
    color: '#1890ff',
    productLine: '行车系统',
    description: '测试描述',
    lines: [],
  };

  const defaultProps = {
    open: false,
    timeline: null,
    onSave: vi.fn(),
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('渲染', () => {
    it('关闭时不应该渲染对话框', () => {
      render(<TimelineEditDialog {...defaultProps} open={false} />);
      
      expect(screen.queryByTestId('timeline-edit-dialog')).not.toBeInTheDocument();
    });

    it('打开时应该渲染对话框', () => {
      render(<TimelineEditDialog {...defaultProps} open={true} />);
      
      expect(screen.getByTestId('timeline-edit-dialog')).toBeInTheDocument();
    });

    it('创建模式应该显示"创建 Timeline"标题', () => {
      render(<TimelineEditDialog {...defaultProps} open={true} timeline={null} />);
      
      expect(screen.getByText('创建 Timeline')).toBeInTheDocument();
    });

    it('编辑模式应该显示"编辑 Timeline"标题', () => {
      render(<TimelineEditDialog {...defaultProps} open={true} timeline={mockTimeline} />);
      
      expect(screen.getByText('编辑 Timeline')).toBeInTheDocument();
    });

    it('应该显示所有表单字段', () => {
      render(<TimelineEditDialog {...defaultProps} open={true} />);
      
      expect(screen.getByLabelText('名称')).toBeInTheDocument();
      expect(screen.getByLabelText('负责人')).toBeInTheDocument();
      expect(screen.getByLabelText('产品线')).toBeInTheDocument();
      expect(screen.getByLabelText('背景色')).toBeInTheDocument();
      expect(screen.getByLabelText('描述')).toBeInTheDocument();
    });

    it('编辑模式应该预填充表单数据', async () => {
      render(<TimelineEditDialog {...defaultProps} open={true} timeline={mockTimeline} />);
      
      await waitFor(() => {
        const nameInput = screen.getByLabelText('名称') as HTMLInputElement;
        expect(nameInput.value).toBe('测试 Timeline');
      });
      
      const ownerInput = screen.getByLabelText('负责人') as HTMLInputElement;
      expect(ownerInput.value).toBe('张三');
      
      const descInput = screen.getByLabelText('描述') as HTMLTextAreaElement;
      expect(descInput.value).toBe('测试描述');
    });

    it('应该显示产品线选项', () => {
      const productLineOptions = ['行车系统', '泊车系统', '主动安全'];
      render(
        <TimelineEditDialog
          {...defaultProps}
          open={true}
          productLineOptions={productLineOptions}
        />
      );
      
      expect(screen.getByLabelText('产品线')).toBeInTheDocument();
    });
  });

  describe('交互', () => {
    it('点击取消应该关闭对话框', () => {
      const onClose = vi.fn();
      render(<TimelineEditDialog {...defaultProps} open={true} onClose={onClose} />);
      
      fireEvent.click(screen.getByText('取消'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('点击关闭按钮应该关闭对话框', () => {
      const onClose = vi.fn();
      render(<TimelineEditDialog {...defaultProps} open={true} onClose={onClose} />);
      
      // Ant Design Modal 的关闭按钮
      const cancelButton = screen.getByText('取消');
      fireEvent.click(cancelButton);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('提交有效数据应该触发保存回调', async () => {
      const onSave = vi.fn();
      render(<TimelineEditDialog {...defaultProps} open={true} onSave={onSave} />);
      
      // 填写表单
      const nameInput = screen.getByLabelText('名称');
      fireEvent.change(nameInput, { target: { value: '新 Timeline' } });
      
      const ownerInput = screen.getByLabelText('负责人');
      fireEvent.change(ownerInput, { target: { value: '李四' } });
      
      // 点击保存
      fireEvent.click(screen.getByText('保存'));
      
      await waitFor(() => {
        expect(onSave).toHaveBeenCalledWith('', expect.objectContaining({
          name: '新 Timeline',
          owner: '李四',
        }));
      });
    });

    it('编辑模式提交应该传递 timeline ID', async () => {
      const onSave = vi.fn();
      render(
        <TimelineEditDialog
          {...defaultProps}
          open={true}
          timeline={mockTimeline}
          onSave={onSave}
        />
      );
      
      // 修改名称
      const nameInput = screen.getByLabelText('名称');
      fireEvent.change(nameInput, { target: { value: '修改后的 Timeline' } });
      
      // 点击保存
      fireEvent.click(screen.getByText('保存'));
      
      await waitFor(() => {
        expect(onSave).toHaveBeenCalledWith('timeline-1', expect.objectContaining({
          name: '修改后的 Timeline',
        }));
      });
    });
  });

  describe('表单验证', () => {
    it('名称为空时应该显示错误', async () => {
      render(<TimelineEditDialog {...defaultProps} open={true} />);
      
      // 不填写名称，直接保存
      fireEvent.click(screen.getByText('保存'));
      
      await waitFor(() => {
        expect(screen.getByText('请输入 Timeline 名称')).toBeInTheDocument();
      });
    });

    it('名称过长时应该显示错误', async () => {
      render(<TimelineEditDialog {...defaultProps} open={true} />);
      
      const nameInput = screen.getByLabelText('名称');
      fireEvent.change(nameInput, {
        target: { value: 'a'.repeat(51) }, // 51 个字符，超过最大长度
      });
      
      fireEvent.click(screen.getByText('保存'));
      
      await waitFor(() => {
        expect(screen.getByText('名称长度应为 1-50 个字符')).toBeInTheDocument();
      });
    });

    it('名称有效时不应该显示错误', async () => {
      const onSave = vi.fn();
      render(<TimelineEditDialog {...defaultProps} open={true} onSave={onSave} />);
      
      const nameInput = screen.getByLabelText('名称');
      fireEvent.change(nameInput, { target: { value: '有效的名称' } });
      
      fireEvent.click(screen.getByText('保存'));
      
      await waitFor(() => {
        expect(onSave).toHaveBeenCalled();
      });
    });

    it('可选字段为空时应该允许提交', async () => {
      const onSave = vi.fn();
      render(<TimelineEditDialog {...defaultProps} open={true} onSave={onSave} />);
      
      // 只填写必填字段
      const nameInput = screen.getByLabelText('名称');
      fireEvent.change(nameInput, { target: { value: '最小 Timeline' } });
      
      fireEvent.click(screen.getByText('保存'));
      
      await waitFor(() => {
        expect(onSave).toHaveBeenCalledWith('', expect.objectContaining({
          name: '最小 Timeline',
        }));
      });
    });
  });

  describe('边界情况', () => {
    it('关闭对话框应该重置表单', async () => {
      const { rerender } = render(
        <TimelineEditDialog {...defaultProps} open={true} />
      );
      
      // 填写表单
      const nameInput = screen.getByLabelText('名称');
      fireEvent.change(nameInput, { target: { value: '测试名称' } });
      
      // 关闭对话框
      fireEvent.click(screen.getByText('取消'));
      
      // 重新打开
      rerender(<TimelineEditDialog {...defaultProps} open={false} />);
      rerender(<TimelineEditDialog {...defaultProps} open={true} />);
      
      await waitFor(() => {
        const nameInputAfter = screen.getByLabelText('名称') as HTMLInputElement;
        expect(nameInputAfter.value).toBe('');
      });
    });

    it('从编辑模式切换到创建模式应该清空表单', async () => {
      const { rerender } = render(
        <TimelineEditDialog {...defaultProps} open={true} timeline={mockTimeline} />
      );
      
      await waitFor(() => {
        const nameInput = screen.getByLabelText('名称') as HTMLInputElement;
        expect(nameInput.value).toBe('测试 Timeline');
      });
      
      // 切换到创建模式
      rerender(<TimelineEditDialog {...defaultProps} open={true} timeline={null} />);
      
      await waitFor(() => {
        const nameInput = screen.getByLabelText('名称') as HTMLInputElement;
        expect(nameInput.value).toBe('');
      });
    });

    it('保存成功后应该关闭对话框', async () => {
      const onClose = vi.fn();
      const onSave = vi.fn();
      render(
        <TimelineEditDialog
          {...defaultProps}
          open={true}
          onClose={onClose}
          onSave={onSave}
        />
      );
      
      const nameInput = screen.getByLabelText('名称');
      fireEvent.change(nameInput, { target: { value: '测试' } });
      
      fireEvent.click(screen.getByText('保存'));
      
      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
    });
  });
});
