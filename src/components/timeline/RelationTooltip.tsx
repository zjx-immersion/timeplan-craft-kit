/**
 * RelationTooltip - 依赖关系连线详情提示
 * 
 * 📋 功能:
 * - 显示完整的连线信息
 * - 前置/后置任务名称
 * - 延迟时间（lag）
 * - 是否为关键路径
 * - 备注信息
 * 
 * @version 1.0.0
 * @date 2026-02-10
 */

import React from 'react';
import { Card, Descriptions, Tag, Space } from 'antd';
import { ThunderboltOutlined, ClockCircleOutlined } from '@ant-design/icons';
import type { Relation, Line } from '@/types/timeplanSchema';

export interface RelationTooltipProps {
  relation: Relation;
  fromLine?: Line;
  toLine?: Line;
  position: { x: number; y: number };
  isCriticalPath?: boolean;
}

/**
 * RelationTooltip 组件
 * 在鼠标悬停连线时显示详细信息
 */
export const RelationTooltip: React.FC<RelationTooltipProps> = ({
  relation,
  fromLine,
  toLine,
  position,
  isCriticalPath = false,
}) => {
  // 依赖类型标签映射
  const typeLabels: Record<string, string> = {
    'FS': '结束-开始 (FS)',
    'SS': '开始-开始 (SS)',
    'FF': '结束-结束 (FF)',
    'SF': '开始-结束 (SF)',
  };

  // 依赖类型说明
  const typeDescriptions: Record<string, string> = {
    'FS': '前置任务结束后，后置任务才能开始',
    'SS': '前置任务开始后，后置任务才能开始',
    'FF': '前置任务结束后，后置任务才能结束',
    'SF': '前置任务开始后，后置任务才能结束',
  };

  const dependencyType = relation.properties?.dependencyType || 'finish-to-start';
  const typeKey = dependencyType === 'finish-to-start' ? 'FS' 
    : dependencyType === 'start-to-start' ? 'SS'
    : dependencyType === 'finish-to-finish' ? 'FF'
    : 'SF';

  return (
    <div
      style={{
        position: 'fixed',
        left: position.x + 15,
        top: position.y - 10,
        zIndex: 1000,
        pointerEvents: 'none',
      }}
    >
      <Card
        size="small"
        title={
          <Space>
            <span>依赖关系详情</span>
            {isCriticalPath && (
              <Tag color="red" icon={<ThunderboltOutlined />}>
                关键路径
              </Tag>
            )}
          </Space>
        }
        style={{
          width: 320,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
        <Descriptions column={1} size="small" bordered>
          <Descriptions.Item label="依赖类型">
            <Space direction="vertical" size={0}>
              <Tag color="blue">{typeLabels[typeKey] || typeKey}</Tag>
              <span style={{ fontSize: 12, color: '#666' }}>
                {typeDescriptions[typeKey]}
              </span>
            </Space>
          </Descriptions.Item>

          <Descriptions.Item label="前置任务">
            <div>
              <div style={{ fontWeight: 500 }}>
                {fromLine?.label || '未知任务'}
              </div>
              {fromLine?.attributes?.owner && (
                <div style={{ fontSize: 12, color: '#666' }}>
                  负责人: {fromLine.attributes.owner}
                </div>
              )}
            </div>
          </Descriptions.Item>

          <Descriptions.Item label="后置任务">
            <div>
              <div style={{ fontWeight: 500 }}>
                {toLine?.label || '未知任务'}
              </div>
              {toLine?.attributes?.owner && (
                <div style={{ fontSize: 12, color: '#666' }}>
                  负责人: {toLine.attributes.owner}
                </div>
              )}
            </div>
          </Descriptions.Item>

          {relation.lag !== undefined && relation.lag !== 0 && (
            <Descriptions.Item 
              label={
                <Space size={4}>
                  <ClockCircleOutlined />
                  <span>延迟时间</span>
                </Space>
              }
            >
              <Tag color={relation.lag > 0 ? 'orange' : 'green'}>
                {relation.lag > 0 ? `+${relation.lag}` : relation.lag} 天
              </Tag>
            </Descriptions.Item>
          )}

          {relation.notes && (
            <Descriptions.Item label="备注">
              <div style={{ 
                fontSize: 12, 
                color: '#666',
                maxHeight: 60,
                overflow: 'auto',
              }}>
                {relation.notes}
              </div>
            </Descriptions.Item>
          )}
        </Descriptions>

        {!fromLine || !toLine ? (
          <div style={{ 
            marginTop: 8, 
            padding: 8, 
            background: '#fff7e6', 
            borderRadius: 4,
            fontSize: 12,
            color: '#d46b08',
          }}>
            ⚠️ 部分任务信息缺失
          </div>
        ) : null}
      </Card>
    </div>
  );
};
