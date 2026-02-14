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

import React, { useMemo } from 'react';
import { Card, Descriptions, Tag, Space, Button } from 'antd';
import { ThunderboltOutlined, ClockCircleOutlined, CloseOutlined } from '@ant-design/icons';
import type { Relation, Line } from '@/types/timeplanSchema';
import { parseDateAsLocal } from '@/utils/dateUtils';

export interface RelationTooltipProps {
  relation: Relation;
  fromLine?: Line;
  toLine?: Line;
  position: { x: number; y: number };
  isCriticalPath?: boolean;
  onClose?: () => void; // 新增关闭回调
}

/**
 * RelationTooltip 组件
 * 在选中连线时显示详细信息
 */
export const RelationTooltip: React.FC<RelationTooltipProps> = ({
  relation,
  fromLine,
  toLine,
  position,
  isCriticalPath = false,
  onClose,
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

  // 计算两个任务之间的时间差（天数）
  const timeDifference = useMemo(() => {
    if (!fromLine || !toLine) return null;

    try {
      let fromDate: Date;
      let toDate: Date;

      // 根据依赖类型确定比较的时间点
      switch (dependencyType) {
        case 'finish-to-start':
          // 前置任务结束时间 → 后置任务开始时间
          fromDate = fromLine.endDate ? parseDateAsLocal(fromLine.endDate) : parseDateAsLocal(fromLine.startDate);
          toDate = parseDateAsLocal(toLine.startDate);
          break;
        case 'start-to-start':
          // 前置任务开始时间 → 后置任务开始时间
          fromDate = parseDateAsLocal(fromLine.startDate);
          toDate = parseDateAsLocal(toLine.startDate);
          break;
        case 'finish-to-finish':
          // 前置任务结束时间 → 后置任务结束时间
          fromDate = fromLine.endDate ? parseDateAsLocal(fromLine.endDate) : parseDateAsLocal(fromLine.startDate);
          toDate = toLine.endDate ? parseDateAsLocal(toLine.endDate) : parseDateAsLocal(toLine.startDate);
          break;
        case 'start-to-finish':
          // 前置任务开始时间 → 后置任务结束时间
          fromDate = parseDateAsLocal(fromLine.startDate);
          toDate = toLine.endDate ? parseDateAsLocal(toLine.endDate) : parseDateAsLocal(toLine.startDate);
          break;
        default:
          return null;
      }

      // 计算天数差（toDate - fromDate）
      const diffTime = toDate.getTime() - fromDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch (error) {
      console.error('计算时间差失败:', error);
      return null;
    }
  }, [fromLine, toLine, dependencyType]);

  return (
    <div
      style={{
        position: 'fixed',
        left: position.x + 15,
        top: position.y - 10,
        zIndex: 1000,
        pointerEvents: 'auto', // 允许点击关闭按钮
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
        extra={
          onClose && (
            <Button
              type="text"
              size="small"
              icon={<CloseOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              style={{
                color: '#999',
              }}
            />
          )
        }
        style={{
          width: 320,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
        <Descriptions column={1} size="small" bordered>
          <Descriptions.Item label="依赖类型">
            <Space orientation="vertical" size={0}>
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

          {timeDifference !== null && (
            <Descriptions.Item 
              label={
                <Space size={4}>
                  <ClockCircleOutlined />
                  <span>延迟时间</span>
                </Space>
              }
            >
              <Tag color={timeDifference < 0 ? 'red' : timeDifference === 0 ? 'blue' : 'green'}>
                {timeDifference > 0 ? `+${timeDifference}` : timeDifference} 天
              </Tag>
              <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
                {timeDifference < 0 ? '后置任务开始较早' : timeDifference === 0 ? '无间隔' : '后置任务延后开始'}
              </div>
            </Descriptions.Item>
          )}

          {relation.lag !== undefined && relation.lag !== 0 && (
            <Descriptions.Item label="配置延迟">
              <Tag color={relation.lag > 0 ? 'orange' : 'cyan'}>
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
