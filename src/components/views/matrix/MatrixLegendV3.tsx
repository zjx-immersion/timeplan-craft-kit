/**
 * 矩阵图例V3
 * 
 * 显示热力图颜色含义
 * 
 * @version 3.0.0
 * @date 2026-02-11
 */

import React from 'react';
import { Space, Typography } from 'antd';
import { generateHeatmapLegend } from '@/utils/matrix-v3/heatmap';

const { Text } = Typography;

/**
 * 矩阵图例V3
 */
const MatrixLegendV3: React.FC = () => {
  const legend = generateHeatmapLegend();

  return (
    <div>
      <Text strong style={{ marginRight: '16px' }}>负载率图例：</Text>
      <Space size="large">
        {legend.map(item => (
          <Space key={item.label} size="small">
            <div
              style={{
                width: '24px',
                height: '24px',
                backgroundColor: item.color,
                border: '1px solid #d1d5db',
                borderRadius: '4px',
              }}
            />
            <Text>
              {item.label} <Text type="secondary">({item.range})</Text>
            </Text>
          </Space>
        ))}
      </Space>
    </div>
  );
};

export default MatrixLegendV3;
