/**
 * MatrixTable组件
 * 
 * Product×Team矩阵表格 - MVP版本
 */

import React, { useMemo } from 'react';
import { Table, Typography, Tooltip, Tag } from 'antd';
import { WarningOutlined, FireOutlined } from '@ant-design/icons';
import type { Product } from '@/types/product';
import type { Team } from '@/types/team';
import type { MatrixData, CellData } from '@/types/matrix';
import { generateCellKey } from '@/types/matrix';
import { getBackgroundColor, getBorderColor } from '@/utils/matrix/heatmap';

const { Text } = Typography;

interface Props {
  products: Product[];
  teams: Team[];
  matrixData: MatrixData;
  onCellClick?: (productId: string, teamId: string) => void;
}

export const MatrixTable: React.FC<Props> = ({
  products,
  teams,
  matrixData,
  onCellClick,
}) => {
  const columns = useMemo(() => {
    const cols: any[] = [
      {
        title: 'Product',
        dataIndex: 'name',
        key: 'name',
        fixed: 'left',
        width: 150,
        render: (text: string, record: Product) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {record.color && (
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 2,
                  backgroundColor: record.color,
                }}
              />
            )}
            <Text strong>{text}</Text>
          </div>
        ),
      },
    ];

    // Team列
    teams.forEach(team => {
      cols.push({
        title: (
          <Tooltip title={`容量: ${team.capacity} 人/天`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {team.color && (
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: team.color,
                  }}
                />
              )}
              <span>{team.name}</span>
            </div>
          </Tooltip>
        ),
        dataIndex: team.id,
        key: team.id,
        width: 120,
        align: 'center' as const,
        render: (_: any, product: Product) => {
          const cellKey = generateCellKey(product.id, team.id);
          const cellData = matrixData.cells.get(cellKey);

          if (!cellData || cellData.effort === 0) {
            return <div style={{ padding: '8px 4px', color: '#ccc' }}>-</div>;
          }

          const bgColor = getBackgroundColor(cellData.loadRate);
          const borderColor = getBorderColor(cellData.loadRate);

          return (
            <Tooltip
              title={
                <div>
                  <div>工作量: {cellData.effort.toFixed(1)} 人/天</div>
                  <div>负载率: {cellData.loadRate.toFixed(1)}%</div>
                  <div>任务数: {cellData.taskCount}</div>
                </div>
              }
            >
              <div
                onClick={() => onCellClick?.(product.id, team.id)}
                style={{
                  padding: '8px 4px',
                  cursor: 'pointer',
                  backgroundColor: bgColor,
                  border: `1px solid ${borderColor}`,
                  borderRadius: 4,
                  transition: 'all 0.3s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = `0 2px 8px ${borderColor}40`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 'bold' }}>
                  {cellData.effort.toFixed(1)}
                </div>
                <div style={{ fontSize: 11, color: '#666' }}>
                  {cellData.loadRate.toFixed(0)}%
                </div>
                {cellData.loadStatus === 'overload' && (
                  <FireOutlined style={{ color: '#ff4d4f', fontSize: 12 }} />
                )}
                {cellData.loadStatus === 'warning' && (
                  <WarningOutlined style={{ color: '#faad14', fontSize: 12 }} />
                )}
              </div>
            </Tooltip>
          );
        },
      });
    });

    // 合计列
    cols.push({
      title: '合计',
      key: 'total',
      width: 100,
      align: 'center' as const,
      fixed: 'right',
      render: (_: any, product: Product) => {
        const total = matrixData.productTotals.get(product.id) || 0;
        return <Text strong>{total.toFixed(1)}</Text>;
      },
    });

    return cols;
  }, [teams, matrixData, onCellClick]);

  // 底部合计行
  const summary = () => {
    return (
      <Table.Summary fixed>
        <Table.Summary.Row style={{ backgroundColor: '#fafafa' }}>
          <Table.Summary.Cell index={0}>
            <Text strong>合计</Text>
          </Table.Summary.Cell>
          {teams.map((team, index) => {
            const total = matrixData.teamTotals.get(team.id) || 0;
            return (
              <Table.Summary.Cell key={team.id} index={index + 1} align="center">
                <Text strong>{total.toFixed(1)}</Text>
              </Table.Summary.Cell>
            );
          })}
          <Table.Summary.Cell index={teams.length + 1} align="center">
            <Text strong style={{ color: '#1890ff' }}>
              {matrixData.grandTotal.toFixed(1)}
            </Text>
          </Table.Summary.Cell>
        </Table.Summary.Row>
      </Table.Summary>
    );
  };

  if (products.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
        暂无Product数据，请先创建Product
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
        暂无Team数据，请先创建Team
      </div>
    );
  }

  return (
    <Table
      dataSource={products}
      columns={columns}
      rowKey="id"
      size="small"
      pagination={false}
      scroll={{ x: 'max-content' }}
      summary={summary}
      bordered
    />
  );
};
