/**
 * MatrixView - 矩阵视图组件
 * 
 * 功能:
 * - 按产品线 × Timeline 矩阵展示
 * - 单元格显示 Line 计数和进度
 * - 悬停显示详情
 * - 点击跳转
 * 
 * @version 1.0.0
 * @date 2026-02-03
 */

import React, { useMemo } from 'react';
import { Card, Table, Progress, Tag, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { TimePlan, Timeline } from '@/types/timeplanSchema';

export interface MatrixViewProps {
  data: TimePlan;
  onCellClick?: (timelineId: string, productLine: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

interface MatrixRow {
  key: string;
  productLine: string;
  [timelineId: string]: any;
}

interface CellData {
  count: number;
  avgProgress: number;
  lines: any[];
}

export const MatrixView: React.FC<MatrixViewProps> = ({
  data,
  onCellClick,
  className,
  style,
}) => {
  const { matrixData, timelines, productLines } = useMemo(() => {
    const timelines = data.timelines || [];
    const lines = data.lines || [];
    const productLineSet = new Set<string>();

    // 收集所有产品线
    lines.forEach(line => {
      const productLine = line.attributes?.productLine;
      if (productLine) {
        productLineSet.add(productLine);
      }
    });

    const productLines = Array.from(productLineSet);
    if (productLines.length === 0) {
      productLines.push('Default'); // 如果没有产品线，显示一个默认的
    }

    // 构建矩阵数据
    const matrix: Record<string, Record<string, CellData>> = {};

    productLines.forEach(productLine => {
      matrix[productLine] = {};
      timelines.forEach(timeline => {
        const filteredLines = lines.filter(line =>
          line.timelineId === timeline.id &&
          (line.attributes?.productLine === productLine || (productLine === 'Default' && !line.attributes?.productLine))
        );

        const avgProgress = filteredLines.length > 0
          ? filteredLines.reduce((sum, line) => sum + (line.attributes?.progress || 0), 0) / filteredLines.length
          : 0;

        matrix[productLine][timeline.id] = {
          count: filteredLines.length,
          avgProgress,
          lines: filteredLines,
        };
      });
    });

    const matrixData: MatrixRow[] = productLines.map(productLine => ({
      key: productLine,
      productLine,
      ...matrix[productLine],
    }));

    return { matrixData, timelines, productLines };
  }, [data]);

  const columns: ColumnsType<MatrixRow> = useMemo(() => [
    {
      title: '产品线',
      dataIndex: 'productLine',
      key: 'productLine',
      width: 150,
      fixed: 'left',
      render: (text) => <strong>{text}</strong>,
    },
    ...timelines.map((timeline: Timeline) => ({
      title: timeline.name,
      dataIndex: timeline.id,
      key: timeline.id,
      width: 150,
      render: (cellData: CellData, record: MatrixRow) => {
        if (!cellData || cellData.count === 0) {
          return <span style={{ color: '#ccc' }}>-</span>;
        }

        return (
          <Tooltip title={`${cellData.count} 个任务，平均进度 ${cellData.avgProgress.toFixed(0)}%`}>
            <div
              onClick={() => onCellClick?.(timeline.id, record.productLine)}
              style={{
                cursor: onCellClick ? 'pointer' : 'default',
                padding: 4,
              }}
              data-testid={`cell-${timeline.id}-${record.productLine}`}
            >
              <Tag color="blue">{cellData.count} 个任务</Tag>
              <Progress
                percent={cellData.avgProgress}
                size="small"
                showInfo={false}
                style={{ marginTop: 4 }}
              />
            </div>
          </Tooltip>
        );
      },
    })),
  ], [timelines, onCellClick]);

  return (
    <div
      className={className}
      style={{
        padding: 16,
        background: '#fff',
        height: '100%',
        overflow: 'auto',
        ...style,
      }}
      data-testid="matrix-view"
    >
      <Card title={`产品线 × Timeline 矩阵`}>
        <Table
          columns={columns}
          dataSource={matrixData}
          pagination={false}
          scroll={{ x: 'max-content' }}
          bordered
          data-testid="matrix-table"
        />
      </Card>
    </div>
  );
};

export default MatrixView;
