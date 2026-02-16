/**
 * 关系验证工具面板
 * 
 * 用于开发者手动验证和修复关系数据
 */

import React, { useState } from 'react';
import { Card, Button, Space, Alert, List, Tag, Statistic, Row, Col, Modal, message } from 'antd';
import {
  CheckCircleOutlined,
  WarningOutlined,
  ReloadOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import type { TimePlan } from '@/types/timeplanSchema';
import { validateRelations, autoFixRelations } from '@/utils/validation/index';
import type { ValidationResult, RelationWarning } from '@/utils/validation/index';

export interface RelationValidatorPanelProps {
  plan: TimePlan;
  onFixApplied?: (fixedPlan: TimePlan) => void;
}

/**
 * 获取警告类型的显示文本
 */
function getWarningTypeLabel(type: RelationWarning['type']): string {
  const labels = {
    missing_from: '源任务缺失',
    missing_to: '目标任务缺失',
    circular: '自引用',
    duplicate: '重复关系',
  };
  return labels[type] || type;
}

/**
 * 获取警告类型的颜色
 */
function getWarningTypeColor(type: RelationWarning['type']): string {
  const colors = {
    missing_from: 'error',
    missing_to: 'error',
    circular: 'warning',
    duplicate: 'warning',
  };
  return colors[type] || 'default';
}

/**
 * 关系验证面板组件
 */
export const RelationValidatorPanel: React.FC<RelationValidatorPanelProps> = ({
  plan,
  onFixApplied,
}) => {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  /**
   * 执行验证
   */
  const handleValidate = () => {
    setIsValidating(true);
    
    // 模拟异步操作，给用户反馈
    setTimeout(() => {
      if (!plan.relations || plan.relations.length === 0) {
        message.info('该计划没有关系数据');
        setValidationResult({
          valid: true,
          warnings: [],
          fixedRelations: [],
        });
        setIsValidating(false);
        return;
      }

      const result = validateRelations(plan.relations, plan.lines);
      setValidationResult(result);
      setIsValidating(false);

      if (result.valid) {
        message.success('✅ 验证通过，所有关系都有效！');
      } else {
        message.warning(`⚠️ 发现 ${result.warnings.length} 个问题`);
      }
    }, 300);
  };

  /**
   * 自动修复
   */
  const handleAutoFix = () => {
    if (!validationResult || validationResult.valid) {
      return;
    }

    Modal.confirm({
      title: '确认自动修复',
      content: `将移除 ${validationResult.warnings.length} 个无效关系，此操作不可撤销。是否继续？`,
      okText: '确认修复',
      cancelText: '取消',
      okType: 'primary',
      onOk: () => {
        const { fixed, removed } = autoFixRelations(plan.relations, plan.lines);
        
        const fixedPlan = {
          ...plan,
          relations: fixed,
        };

        if (onFixApplied) {
          onFixApplied(fixedPlan);
        }

        message.success(`✅ 已移除 ${removed} 个无效关系`);
        
        // 重新验证
        handleValidate();
      },
    });
  };

  /**
   * 按类型分组警告
   */
  const warningsByType = validationResult?.warnings.reduce((acc, warning) => {
    const type = warning.type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(warning);
    return acc;
  }, {} as Record<string, RelationWarning[]>) || {};

  return (
    <Card
      title={
        <Space>
          <span>关系验证工具</span>
          {validationResult && (
            validationResult.valid ? (
              <Tag icon={<CheckCircleOutlined />} color="success">
                验证通过
              </Tag>
            ) : (
              <Tag icon={<WarningOutlined />} color="warning">
                发现问题
              </Tag>
            )
          )}
        </Space>
      }
      extra={
        <Space>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={handleValidate}
            loading={isValidating}
          >
            验证关系
          </Button>
          {validationResult && !validationResult.valid && (
            <Button
              danger
              onClick={handleAutoFix}
            >
              自动修复
            </Button>
          )}
        </Space>
      }
    >
      {/* 统计信息 */}
      {validationResult && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Statistic
              title="总关系数"
              value={plan.relations?.length || 0}
              prefix="📊"
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="有效关系"
              value={validationResult.fixedRelations?.length || 0}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="无效关系"
              value={validationResult.warnings.length}
              valueStyle={{ color: validationResult.warnings.length > 0 ? '#ff4d4f' : '#52c41a' }}
              prefix={validationResult.warnings.length > 0 ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="问题类型"
              value={Object.keys(warningsByType).length}
              prefix="🏷️"
            />
          </Col>
        </Row>
      )}

      {/* 验证结果 */}
      {validationResult && (
        <>
          {validationResult.valid ? (
            <Alert
              message="验证通过"
              description="所有关系都有效，没有发现问题。"
              type="success"
              showIcon
              icon={<CheckCircleOutlined />}
            />
          ) : (
            <>
              <Alert
                message={`发现 ${validationResult.warnings.length} 个问题`}
                description="以下关系存在问题，建议使用自动修复功能移除无效关系。"
                type="warning"
                showIcon
                icon={<WarningOutlined />}
                style={{ marginBottom: 16 }}
              />

              {/* 按类型分组显示警告 */}
              {Object.entries(warningsByType).map(([type, warnings]) => (
                <div key={type} style={{ marginBottom: 16 }}>
                  <div style={{ marginBottom: 8 }}>
                    <Tag color={getWarningTypeColor(type as RelationWarning['type'])}>
                      {getWarningTypeLabel(type as RelationWarning['type'])} ({warnings.length})
                    </Tag>
                  </div>

                  <List
                    size="small"
                    bordered
                    dataSource={warnings}
                    renderItem={(warning) => (
                      <List.Item>
                        <List.Item.Meta
                          title={
                            <Space>
                              <Tag color="blue">{warning.relationId}</Tag>
                              <span>{warning.message}</span>
                            </Space>
                          }
                          description={
                            <Space size="small">
                              <span style={{ fontSize: 12, color: '#8c8c8c' }}>
                                从: <code>{warning.fromLineId}</code>
                              </span>
                              <span>→</span>
                              <span style={{ fontSize: 12, color: '#8c8c8c' }}>
                                到: <code>{warning.toLineId}</code>
                              </span>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </div>
              ))}
            </>
          )}
        </>
      )}

      {/* 初始提示 */}
      {!validationResult && !isValidating && (
        <Alert
          message='点击"验证关系"开始检查'
          description="验证工具将检查所有关系的完整性，包括：源任务是否存在、目标任务是否存在、是否有自引用、是否有重复关系。"
          type="info"
          showIcon
        />
      )}
    </Card>
  );
};

export default RelationValidatorPanel;
