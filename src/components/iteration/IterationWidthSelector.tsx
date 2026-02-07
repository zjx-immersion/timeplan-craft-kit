/**
 * 迭代宽度选择器（Ant Design版本）
 * 
 * 功能：
 * - 支持 1-5 档宽度调节
 * - 第5档时，一个屏幕显示2个完整迭代
 * 
 * @version 1.0.0
 * @date 2026-02-07
 */

import React from 'react';
import { Segmented, Tooltip } from 'antd';
import { ExpandOutlined } from '@ant-design/icons';

export type IterationWidthLevel = 1 | 2 | 3 | 4 | 5;

interface IterationWidthSelectorProps {
  value: IterationWidthLevel;
  onChange: (value: IterationWidthLevel) => void;
}

const IterationWidthSelector: React.FC<IterationWidthSelectorProps> = ({ 
  value, 
  onChange 
}) => {
  const descriptions: Record<IterationWidthLevel, string> = {
    1: '紧凑 (150px)',
    2: '标准 (300px)',
    3: '舒适 (450px)',
    4: '宽松 (600px)',
    5: '超宽 (屏幕显示2个迭代)',
  };

  const options = ([1, 2, 3, 4, 5] as IterationWidthLevel[]).map((level) => ({
    label: (
      <Tooltip title={descriptions[level]} key={level}>
        <span>{level}</span>
      </Tooltip>
    ),
    value: level.toString(),
  }));

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <ExpandOutlined style={{ color: '#8c8c8c', fontSize: 14 }} />
      <span style={{ fontSize: 14, color: '#8c8c8c' }}>迭代宽度:</span>
      <Segmented
        value={value.toString()}
        onChange={(v) => onChange(parseInt(v as string) as IterationWidthLevel)}
        options={options}
        size="small"
      />
    </div>
  );
};

export default IterationWidthSelector;
