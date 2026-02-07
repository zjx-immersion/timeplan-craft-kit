/**
 * BaselineMarker 组件单元测试
 * 
 * @version 1.0.0
 * @date 2026-02-07
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BaselineMarker } from '../BaselineMarker';
import type { Baseline } from '@/types/timeplanSchema';
import type { TimeScale } from '@/utils/dateUtils';

// Mock date utils
vi.mock('@/utils/dateUtils', () => ({
  getPositionFromDate: vi.fn(() => 100),
}));

describe('BaselineMarker', () => {
  const mockBaseline: Baseline = {
    id: 'baseline-1',
    date: new Date('2026-01-15'),
    label: '发版日期',
    color: '#1677ff',
    schemaId: undefined,
    attributes: {},
  };

  const defaultProps = {
    baseline: mockBaseline,
    viewStartDate: new Date('2026-01-01'),
    scale: 'week' as TimeScale,
    height: 500,
    leftOffset: 200,
    isEditMode: false,
  };

  it('应该渲染基线标记', () => {
    render(<BaselineMarker {...defaultProps} />);

    expect(screen.getByText('发版日期')).toBeInTheDocument();
  });

  it('应该显示格式化的日期', () => {
    render(<BaselineMarker {...defaultProps} />);

    expect(screen.getByText('2026-01-15')).toBeInTheDocument();
  });

  it('应该在编辑模式下显示编辑按钮', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <BaselineMarker
        {...defaultProps}
        isEditMode={true}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    // 验证基线已渲染
    expect(screen.getByText('发版日期')).toBeInTheDocument();
  });

  it('应该应用自定义颜色', () => {
    const { container } = render(<BaselineMarker {...defaultProps} />);

    const marker = container.querySelector('div[style*="backgroundColor"]');
    expect(marker).toBeInTheDocument();
  });

  it('应该使用默认颜色', () => {
    const baselineWithoutColor: Baseline = {
      ...mockBaseline,
      color: undefined,
    };

    const { container } = render(
      <BaselineMarker {...defaultProps} baseline={baselineWithoutColor} />
    );

    expect(container).toBeTruthy();
  });

  it('应该正确计算位置', () => {
    const { getPositionFromDate } = await import('@/utils/dateUtils');

    render(<BaselineMarker {...defaultProps} />);

    expect(getPositionFromDate).toHaveBeenCalledWith(
      mockBaseline.date,
      defaultProps.viewStartDate,
      defaultProps.scale
    );
  });
});
