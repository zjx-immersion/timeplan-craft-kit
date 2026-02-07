/**
 * ViewSwitcher - 视图切换器组件
 * 
 * 功能:
 * - 5 种视图模式切换
 * - 甘特图、表格、矩阵、版本对比、迭代规划
 * - 响应式设计
 * 
 * @version 1.0.0
 * @date 2026-02-03
 */

import React from 'react';
import { Segmented } from 'antd';
import {
  BarChartOutlined,
  TableOutlined,
  AppstoreOutlined,
  HistoryOutlined,
  BlockOutlined,
} from '@ant-design/icons';

/**
 * 视图类型
 */
export type ViewType = 'gantt' | 'table' | 'matrix' | 'version' | 'iteration';

/**
 * 视图切换器属性
 */
export interface ViewSwitcherProps {
  /**
   * 当前视图
   */
  view: ViewType;
  
  /**
   * 视图变化回调
   */
  onViewChange: (view: ViewType) => void;
  
  /**
   * 是否显示图标
   * @default true
   */
  showIcons?: boolean;
  
  /**
   * 是否显示标签
   * @default true
   */
  showLabels?: boolean;
  
  /**
   * 大小
   * @default 'middle'
   */
  size?: 'large' | 'middle' | 'small';
  
  /**
   * 自定义类名
   */
  className?: string;
  
  /**
   * 自定义样式
   */
  style?: React.CSSProperties;
}

/**
 * 视图选项配置
 */
const VIEW_OPTIONS = [
  {
    value: 'gantt' as ViewType,
    label: '甘特图',
    icon: <BarChartOutlined />,
  },
  {
    value: 'table' as ViewType,
    label: '表格',
    icon: <TableOutlined />,
  },
  {
    value: 'matrix' as ViewType,
    label: '矩阵',
    icon: <AppstoreOutlined />,
  },
  {
    value: 'version' as ViewType,
    label: '版本',
    icon: <HistoryOutlined />,
  },
  {
    value: 'iteration' as ViewType,
    label: '迭代',
    icon: <BlockOutlined />,
  },
];

/**
 * ViewSwitcher 组件
 */
export const ViewSwitcher: React.FC<ViewSwitcherProps> = ({
  view,
  onViewChange,
  showIcons = true,
  showLabels = true,
  size = 'middle',
  className,
  style,
}) => {
  // 构建选项
  const options = VIEW_OPTIONS.map(option => {
    // 只显示图标
    if (showIcons && !showLabels) {
      return {
        value: option.value,
        icon: option.icon,
      };
    }
    
    // 只显示标签
    if (!showIcons && showLabels) {
      return {
        value: option.value,
        label: option.label,
      };
    }
    
    // 显示图标和标签
    return {
      value: option.value,
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {option.icon}
          <span>{option.label}</span>
        </span>
      ),
    };
  });

  return (
    <Segmented
      value={view}
      onChange={(value) => onViewChange(value as ViewType)}
      options={options}
      size={size}
      className={className}
      style={style}
      data-testid="view-switcher"
    />
  );
};

export default ViewSwitcher;
