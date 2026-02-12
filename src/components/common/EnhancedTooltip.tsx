/**
 * EnhancedTooltip - 增强的Tooltip组件
 * 
 * 支持结构化内容展示：
 * - 标题 + 摘要
 * - 统计信息（带图标）
 * - 列表项（带状态标签）
 * - 自定义内容
 * 
 * @version 1.0.0
 */

import React from 'react';
import { Tooltip, Space, Tag } from 'antd';
import type { TooltipProps } from 'antd';

/**
 * Tooltip内容配置
 */
export interface TooltipContent {
  /** 摘要信息 */
  summary?: string;
  
  /** 统计信息列表 */
  stats?: Array<{
    label: string;
    value: string | number;
    icon?: React.ReactNode;
  }>;
  
  /** 列表项 */
  items?: Array<{
    label: string;
    value: string;
    status?: 'success' | 'warning' | 'error' | 'default';
  }>;
  
  /** 自定义内容 */
  extra?: React.ReactNode;
}

/**
 * EnhancedTooltip Props
 */
export interface EnhancedTooltipProps extends Omit<TooltipProps, 'title'> {
  /** 标题 */
  title: string;
  
  /** 结构化内容 */
  content: TooltipContent;
  
  /** 子元素 */
  children: React.ReactNode;
}

/**
 * 获取状态标签颜色
 */
function getStatusColor(status?: 'success' | 'warning' | 'error' | 'default'): string {
  const colors = {
    success: 'success',
    warning: 'warning',
    error: 'error',
    default: 'default',
  };
  return colors[status || 'default'];
}

/**
 * EnhancedTooltip组件
 * 
 * @example
 * ```typescript
 * <EnhancedTooltip
 *   title="任务详情"
 *   content={{
 *     summary: '电子电器架构设计',
 *     stats: [
 *       { label: '工作量', value: '12人/天', icon: <TeamOutlined /> },
 *       { label: '负载率', value: '85%', icon: <DashboardOutlined /> },
 *     ],
 *     items: [
 *       { label: 'SSTS-001', value: '已通过', status: 'success' },
 *     ],
 *   }}
 * >
 *   <div>悬浮我</div>
 * </EnhancedTooltip>
 * ```
 */
export const EnhancedTooltip: React.FC<EnhancedTooltipProps> = React.memo(({
  title,
  content,
  placement = 'top',
  children,
  ...restProps
}) => {
  const tooltipContent = (
    <div style={{ maxWidth: 400, minWidth: 200 }}>
      {/* 标题 */}
      <div
        style={{
          fontWeight: 600,
          fontSize: 14,
          marginBottom: content.summary || content.stats || content.items ? 8 : 0,
          color: '#ffffff',
        }}
      >
        {title}
      </div>
      
      {/* 摘要 */}
      {content.summary && (
        <div
          style={{
            marginBottom: 8,
            color: 'rgba(255, 255, 255, 0.85)',
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          {content.summary}
        </div>
      )}
      
      {/* 统计信息 */}
      {content.stats && content.stats.length > 0 && (
        <Space
          direction="vertical"
          size={4}
          style={{ width: '100%', marginBottom: content.items ? 8 : 0 }}
        >
          {content.stats.map((stat, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: 12,
                color: 'rgba(255, 255, 255, 0.85)',
              }}
            >
              <span>
                {stat.icon && <span style={{ marginRight: 4 }}>{stat.icon}</span>}
                {stat.label}:
              </span>
              <span
                style={{
                  fontWeight: 600,
                  marginLeft: 8,
                  color: '#ffffff',
                }}
              >
                {stat.value}
              </span>
            </div>
          ))}
        </Space>
      )}
      
      {/* 列表项 */}
      {content.items && content.items.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <Space size={[4, 4]} wrap>
            {content.items.map((item, index) => (
              <Tag
                key={index}
                color={getStatusColor(item.status)}
                style={{ margin: 0, fontSize: 11 }}
              >
                {item.label}: {item.value}
              </Tag>
            ))}
          </Space>
        </div>
      )}
      
      {/* 自定义内容 */}
      {content.extra && (
        <div style={{ marginTop: 8 }}>
          {content.extra}
        </div>
      )}
    </div>
  );

  return (
    <Tooltip
      title={tooltipContent}
      placement={placement}
      overlayStyle={{ maxWidth: 450 }}
      {...restProps}
    >
      {children}
    </Tooltip>
  );
});

EnhancedTooltip.displayName = 'EnhancedTooltip';

export default EnhancedTooltip;
