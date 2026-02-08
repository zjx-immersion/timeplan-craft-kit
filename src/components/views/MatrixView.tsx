/**
 * MatrixView - 矩阵视图组件
 * 
 * 功能:
 * - 按 Timeline × 月份 矩阵展示（参考原项目）
 * - 单元格显示节点列表
 * - 支持bar、milestone、gateway类型
 * 
 * @version 2.0.0
 * @date 2026-02-08
 * @reference 原项目 timeline-craft-kit/MatrixView.tsx
 */

import React, { useMemo } from 'react';
import { Tag, Tooltip, theme } from 'antd';
import type { TimePlan, Timeline, Line } from '@/types/timeplanSchema';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  addMonths, 
  isWithinInterval 
} from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { 
  MinusOutlined,
  FlagOutlined,
  BgColorsOutlined,
} from '@ant-design/icons';

export interface MatrixViewProps {
  data: TimePlan;
  onCellClick?: (timelineId: string, month: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const MatrixView: React.FC<MatrixViewProps> = ({
  data,
  onCellClick,
  className,
  style,
}) => {
  const { token } = theme.useToken();

  // ✅ 参考原项目：生成 Timeline × 月份 矩阵
  const { columns, matrixData } = useMemo(() => {
    const timelines = data.timelines || [];
    const lines = data.lines || [];

    // 1. 找到日期范围
    let minDate = new Date();
    let maxDate = new Date();
    
    if (lines.length > 0) {
      lines.forEach(line => {
        if (line.startDate < minDate) minDate = line.startDate;
        const endDate = line.endDate || line.startDate;
        if (endDate > maxDate) maxDate = endDate;
      });
    }

    // 2. 生成12个月的列（从minDate开始）
    const cols: Date[] = [];
    let currentMonth = startOfMonth(minDate);
    for (let i = 0; i < 12; i++) {
      cols.push(currentMonth);
      currentMonth = addMonths(currentMonth, 1);
    }

    // 3. 构建矩阵数据：timeline × month
    const matrix: Record<string, Record<string, Line[]>> = {};
    
    timelines.forEach(timeline => {
      matrix[timeline.id] = {};
      cols.forEach(col => {
        const monthStart = startOfMonth(col);
        const monthEnd = endOfMonth(col);
        
        // 找到该timeline在该月的所有nodes
        const nodesInMonth = lines.filter(line => {
          if (line.timelineId !== timeline.id) return false;
          
          const nodeStart = line.startDate;
          const nodeEnd = line.endDate || line.startDate;
          
          // 节点与月份有交集
          return isWithinInterval(nodeStart, { start: monthStart, end: monthEnd }) ||
                 isWithinInterval(nodeEnd, { start: monthStart, end: monthEnd }) ||
                 (nodeStart <= monthStart && nodeEnd >= monthEnd);
        });
        
        matrix[timeline.id][col.toISOString()] = nodesInMonth;
      });
    });

    return { columns: cols, matrixData: matrix };
  }, [data]);

  // ✅ 参考原项目：获取节点类型图标和颜色（基于schemaId）
  const getTypeIcon = (schemaId: string) => {
    switch (schemaId) {
      case 'bar-schema': 
        return <MinusOutlined style={{ fontSize: 12 }} />;
      case 'milestone-schema': 
        return <FlagOutlined style={{ fontSize: 12 }} />;
      case 'gateway-schema': 
        return <BgColorsOutlined style={{ fontSize: 12 }} />;
      default: 
        return null;
    }
  };

  const getTypeColor = (schemaId: string) => {
    switch (schemaId) {
      case 'bar-schema': return 'blue';
      case 'milestone-schema': return 'green';
      case 'gateway-schema': return 'orange';
      default: return 'default';
    }
  };

  const getTypeName = (schemaId: string) => {
    switch (schemaId) {
      case 'bar-schema': return '任务';
      case 'milestone-schema': return '里程碑';
      case 'gateway-schema': return '关口';
      default: return '其他';
    }
  };

  return (
    <div 
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: token.colorBgContainer,
        ...style,
      }}
    >
      {/* 标题栏 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `${token.paddingSM}px ${token.padding}px`,
          borderBottom: `1px solid ${token.colorBorder}`,
          backgroundColor: token.colorBgContainer,
        }}
      >
        <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>迭代矩阵视图</h2>
        <span style={{ fontSize: 14, color: token.colorTextSecondary }}>
          {data.timelines?.length || 0} 条时间线 × {columns.length} 个月
        </span>
      </div>

      {/* 可滚动容器 */}
      <div style={{ flex: 1, overflow: 'auto', padding: token.padding }}>
        <table
          style={{
            borderCollapse: 'collapse',
            minWidth: `${200 + columns.length * 150}px`,
            width: '100%',
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  position: 'sticky',
                  left: 0,
                  zIndex: 20,
                  backgroundColor: token.colorBgContainer,
                  border: `1px solid ${token.colorBorder}`,
                  padding: token.paddingSM,
                  textAlign: 'left',
                  minWidth: 200,
                  width: 200,
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 500, color: token.colorTextSecondary }}>
                  团队/时间线
                </span>
              </th>
              {columns.map(col => (
                <th
                  key={col.toISOString()}
                  style={{
                    border: `1px solid ${token.colorBorder}`,
                    padding: token.paddingSM,
                    textAlign: 'center',
                    backgroundColor: token.colorBgLayout,
                    minWidth: 150,
                    width: 150,
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 500 }}>
                    {format(col, 'yyyy年M月', { locale: zhCN })}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.timelines?.map((timeline, idx) => (
              <tr key={timeline.id}>
                <td
                  style={{
                    position: 'sticky',
                    left: 0,
                    zIndex: 10,
                    backgroundColor: token.colorBgContainer,
                    border: `1px solid ${token.colorBorder}`,
                    padding: token.paddingSM,
                    minWidth: 200,
                    width: 200,
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span
                      style={{
                        fontWeight: 500,
                        fontSize: 14,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: 180,
                      }}
                      title={timeline.name}
                    >
                      {timeline.name}
                    </span>
                    <span style={{ fontSize: 12, color: token.colorTextSecondary }}>
                      {timeline.owner || timeline.description || ''}
                    </span>
                  </div>
                </td>
                {columns.map(col => {
                  const nodes = matrixData[timeline.id]?.[col.toISOString()] || [];
                  return (
                    <td
                      key={col.toISOString()}
                      style={{
                        border: `1px solid ${token.colorBorder}`,
                        padding: token.paddingXS,
                        verticalAlign: 'top',
                        backgroundColor: nodes.length > 0 ? token.colorBgLayout : 'transparent',
                        minWidth: 150,
                        width: 150,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 4,
                          minHeight: 60,
                        }}
                      >
                        {nodes.map(node => (
                          <Tooltip
                            key={node.id}
                            title={`${node.title || node.label} (${format(node.startDate, 'MM/dd')} ~ ${node.endDate ? format(node.endDate, 'MM/dd') : ''})`}
                          >
                            <div
                              style={{
                                padding: '4px 8px',
                                borderRadius: token.borderRadius,
                                border: `1px solid ${token.colorBorder}`,
                                fontSize: 12,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                                backgroundColor: token.colorBgContainer,
                                cursor: 'pointer',
                              }}
                              onClick={() => onCellClick?.(timeline.id, col.toISOString())}
                            >
                              {getTypeIcon(node.schemaId)}
                              <span
                                style={{
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  flex: 1,
                                }}
                              >
                                {node.title || node.label}
                              </span>
                              <Tag color={getTypeColor(node.schemaId)} style={{ margin: 0, fontSize: 10 }}>
                                {getTypeName(node.schemaId)}
                              </Tag>
                            </div>
                          </Tooltip>
                        ))}
                        {nodes.length === 0 && (
                          <span style={{ color: token.colorTextDisabled, fontSize: 12 }}>-</span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MatrixView;
