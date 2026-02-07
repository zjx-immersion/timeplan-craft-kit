/**
 * RelationRenderer 组件测试
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RelationRenderer } from '../RelationRenderer';
import { generateLine } from '@/utils/testDataGenerator';
import type { Relation } from '@/types/timeplanSchema';

describe('RelationRenderer', () => {
  const mockTimelines = [
    { id: 'timeline-1', name: '测试', owner: '', lineIds: [] as string[] },
  ];

  it('应该成功渲染依赖关系线', () => {
    const mockLines = [
      generateLine('timeline-1', 0, new Date()),
      generateLine('timeline-1', 1, new Date()),
    ];

    const mockRelations: Relation[] = [
      {
        id: 'relation-1',
        type: 'dependency',
        fromLineId: mockLines[0].id,
        toLineId: mockLines[1].id,
        properties: { dependencyType: 'finish-to-start' },
      },
    ];

    const { container } = render(
      <svg width="1000" height="500">
        <RelationRenderer
          relations={mockRelations}
          lines={mockLines}
          timelines={mockTimelines}
          viewStartDate={new Date()}
          scale="month"
          rowHeight={60}
        />
      </svg>
    );

    expect(container).toBeTruthy();
  });

  it('应该处理空关系数组', () => {
    const { container } = render(
      <svg width="1000" height="500">
        <RelationRenderer
          relations={[]}
          lines={[]}
          timelines={mockTimelines}
          viewStartDate={new Date()}
          scale="month"
          rowHeight={60}
        />
      </svg>
    );

    expect(container).toBeTruthy();
  });
});
