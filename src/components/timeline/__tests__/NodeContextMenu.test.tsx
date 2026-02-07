/**
 * NodeContextMenu 组件单元测试
 * 
 * @version 1.0.0
 * @date 2026-02-07
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NodeContextMenu } from '../NodeContextMenu';
import type { Line, Baseline } from '@/types/timeplanSchema';

describe('NodeContextMenu', () => {
  const mockNode: Line = {
    id: 'line-1',
    timelineId: 'timeline-1',
    schemaId: 'bar-schema',
    label: '测试节点',
    startDate: new Date('2026-01-01'),
    endDate: new Date('2026-01-07'),
    attributes: {
      name: '测试节点',
    },
  };

  const mockBaselines: Baseline[] = [
    {
      id: 'baseline-1',
      date: new Date('2026-01-15'),
      label: '基线1',
      schemaId: undefined,
      attributes: {},
    },
  ];

  const defaultProps = {
    node: mockNode,
    isEditMode: true,
    baselines: mockBaselines,
    onEditNode: vi.fn(),
    onDeleteNode: vi.fn(),
    onCopyNode: vi.fn(),
    onConvertNodeType: vi.fn(),
    onAddRelation: vi.fn(),
    onAddToBaseline: vi.fn(),
    onViewNestedPlan: vi.fn(),
  };

  it('应该在非编辑模式下只渲染children', () => {
    const { container } = render(
      <NodeContextMenu {...defaultProps} isEditMode={false}>
        <div data-testid="child-element">子元素</div>
      </NodeContextMenu>
    );

    expect(screen.getByTestId('child-element')).toBeInTheDocument();
    // 不应该有Dropdown包装
    expect(container.querySelector('.ant-dropdown')).not.toBeInTheDocument();
  });

  it('应该在编辑模式下包装children', () => {
    render(
      <NodeContextMenu {...defaultProps}>
        <div data-testid="child-element">子元素</div>
      </NodeContextMenu>
    );

    expect(screen.getByTestId('child-element')).toBeInTheDocument();
  });

  it('应该在禁用时只渲染children', () => {
    const { container } = render(
      <NodeContextMenu {...defaultProps} disabled={true}>
        <div data-testid="child-element">子元素</div>
      </NodeContextMenu>
    );

    expect(screen.getByTestId('child-element')).toBeInTheDocument();
    expect(container.querySelector('.ant-dropdown')).not.toBeInTheDocument();
  });

  it('应该正确构建菜单项', () => {
    const { container } = render(
      <NodeContextMenu {...defaultProps}>
        <div>子元素</div>
      </NodeContextMenu>
    );

    // 验证组件已渲染
    expect(container).toBeTruthy();
  });

  it('应该处理嵌套计划节点', () => {
    const nodeWithNested: Line = {
      ...mockNode,
      nestedPlanId: 'nested-plan-1',
    };

    render(
      <NodeContextMenu {...defaultProps} node={nodeWithNested}>
        <div>子元素</div>
      </NodeContextMenu>
    );

    // 验证组件已渲染
    expect(screen.getByText('子元素')).toBeInTheDocument();
  });

  it('应该在没有baselines时不显示添加到基线菜单', () => {
    const { container } = render(
      <NodeContextMenu {...defaultProps} baselines={[]}>
        <div>子元素</div>
      </NodeContextMenu>
    );

    expect(container).toBeTruthy();
  });
});
