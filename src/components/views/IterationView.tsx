/**
 * IterationView - 迭代规划视图
 * 
 * 功能:
 * - 按迭代/Sprint 分组
 * - 显示容量和负载
 * - 支持拖拽调整
 * 
 * @version 1.0.0
 * @date 2026-02-03
 */

import React, { useMemo } from 'react';
import { Card, Row, Col, Progress, Tag, List, Space, Statistic } from 'antd';
import type { TimePlan, Line } from '@/types/timeplanSchema';
import { format, differenceInDays } from 'date-fns';

export interface IterationViewProps {
  data: TimePlan;
  iterationDays?: number;
  onLineClick?: (line: Line) => void;
  className?: string;
  style?: React.CSSProperties;
}

interface Iteration {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  lines: Line[];
  totalDays: number;
  completedDays: number;
  progress: number;
}

export const IterationView: React.FC<IterationViewProps> = ({
  data,
  iterationDays = 14,
  onLineClick,
  className,
  style,
}) => {
  const iterations = useMemo<Iteration[]>(() => {
    const allLines: Line[] = data.lines || [];

    if (allLines.length === 0) return [];

    // 找到最早和最晚的日期
    const allDates = allLines.flatMap(line => [
      new Date(line.startDate),
      new Date(line.endDate),
    ]);
    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));

    // 创建迭代
    const iterations: Iteration[] = [];
    let iterationStart = new Date(minDate);
    let iterationNum = 1;

    while (iterationStart <= maxDate) {
      const iterationEnd = new Date(iterationStart);
      iterationEnd.setDate(iterationEnd.getDate() + iterationDays - 1);

      // 找到属于此迭代的 lines
      const iterationLines = allLines.filter(line => {
        const lineStart = new Date(line.startDate);
        const lineEnd = new Date(line.endDate || line.startDate);
        return lineStart <= iterationEnd && lineEnd >= iterationStart;
      });

      const totalDays = iterationLines.reduce((sum, line) => {
        return sum + differenceInDays(new Date(line.endDate || line.startDate), new Date(line.startDate)) + 1;
      }, 0);

      const completedDays = iterationLines.reduce((sum, line) => {
        const days = differenceInDays(new Date(line.endDate || line.startDate), new Date(line.startDate)) + 1;
        const progress = line.attributes?.progress || 0;
        return sum + days * (progress / 100);
      }, 0);

      const progress = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;

      iterations.push({
        id: `iteration-${iterationNum}`,
        name: `迭代 ${iterationNum}`,
        startDate: new Date(iterationStart),
        endDate: iterationEnd,
        lines: iterationLines,
        totalDays,
        completedDays,
        progress,
      });

      iterationStart = new Date(iterationEnd);
      iterationStart.setDate(iterationStart.getDate() + 1);
      iterationNum++;
    }

    return iterations;
  }, [data, iterationDays]);

  return (
    <div
      className={className}
      style={{
        padding: 16,
        background: '#f5f5f5',
        height: '100%',
        overflow: 'auto',
        ...style,
      }}
      data-testid="iteration-view"
    >
      <Row gutter={[16, 16]}>
        {iterations.map((iteration) => (
          <Col span={24} key={iteration.id}>
            <Card
              title={
                <Space>
                  <span>{iteration.name}</span>
                  <Tag color="blue">
                    {format(iteration.startDate, 'MM/dd')} - {format(iteration.endDate, 'MM/dd')}
                  </Tag>
                </Space>
              }
              extra={
                <Space>
                  <Statistic
                    title="任务数"
                    value={iteration.lines.length}
                    suffix="个"
                    valueStyle={{ fontSize: 16 }}
                  />
                  <Statistic
                    title="总工作量"
                    value={iteration.totalDays}
                    suffix="天"
                    valueStyle={{ fontSize: 16 }}
                  />
                </Space>
              }
              data-testid={`iteration-${iteration.id}`}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <div style={{ marginBottom: 8 }}>
                    整体进度: {iteration.progress.toFixed(1)}%
                  </div>
                  <Progress percent={iteration.progress} status="active" />
                </div>

                <List
                  dataSource={iteration.lines}
                  renderItem={(line) => (
                    <List.Item
                      key={line.id}
                      onClick={() => onLineClick?.(line)}
                      style={{
                        cursor: onLineClick ? 'pointer' : 'default',
                        padding: '8px 0',
                      }}
                      data-testid={`line-${line.id}`}
                    >
                      <List.Item.Meta
                        title={line.label}
                        description={
                          <Space>
                            <Tag>{format(new Date(line.startDate), 'MM/dd')}</Tag>
                            <span>→</span>
                            <Tag>{format(new Date(line.endDate), 'MM/dd')}</Tag>
                            <Progress
                              percent={line.attributes?.progress || 0}
                              size="small"
                              style={{ width: 100 }}
                            />
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default IterationView;
