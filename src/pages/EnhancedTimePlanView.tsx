/**
 * 增强版时间计划视图页面
 * 
 * 展示如何使用集成了所有新功能的 TimelinePanelEnhanced
 * 
 * @version 2.0.0
 * @date 2026-02-03
 */

import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Result } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { TimelinePanelEnhanced } from '@/components/timeline';
import { useTimePlanStoreWithHistory } from '@/stores/timePlanStoreWithHistory';

/**
 * 增强版时间计划视图页面
 */
const EnhancedTimePlanView: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const { plans, setCurrentPlan } = useTimePlanStoreWithHistory();

  useEffect(() => {
    if (planId) {
      setCurrentPlan(planId);
    }
  }, [planId, setCurrentPlan]);

  const plan = plans.find(p => p.id === planId);

  if (!planId) {
    return (
      <Result
        status="404"
        title="缺少项目 ID"
        subTitle="请从项目列表选择一个项目"
        extra={
          <Button type="primary" onClick={() => navigate('/plans')}>
            返回项目列表
          </Button>
        }
      />
    );
  }

  if (!plan) {
    return (
      <Result
        status="404"
        title="项目不存在"
        subTitle={`未找到 ID 为 ${planId} 的项目`}
        extra={
          <Button type="primary" onClick={() => navigate('/plans')}>
            返回项目列表
          </Button>
        }
      />
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 顶部导航 */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', background: '#fff' }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/plans')}
        >
          返回列表
        </Button>
        <span style={{ marginLeft: 16, fontSize: 16, fontWeight: 500 }}>
          {plan.title}
        </span>
      </div>

      {/* 增强版时间线面板 */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <TimelinePanelEnhanced planId={planId} />
      </div>
    </div>
  );
};

export default EnhancedTimePlanView;
