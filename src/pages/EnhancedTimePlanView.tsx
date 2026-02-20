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
import { UnifiedTimelinePanelV2 } from '@/components/timeline/UnifiedTimelinePanelV2';
import { useTimePlanStoreWithAPI } from '@/stores/timePlanStoreWithAPI';
import { Spin } from 'antd';

/**
 * 增强版时间计划视图页面
 */
const EnhancedTimePlanView: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const { currentPlan, loading, error, loadPlan } = useTimePlanStoreWithAPI();

  useEffect(() => {
    if (planId) {
      loadPlan(planId);
    }
  }, [planId, loadPlan]);

  // 加载中
  if (loading.plans || loading.timelines) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Spin size="large" tip="加载项目中..." />
      </div>
    );
  }

  if (!planId) {
    return (
      <Result
        status="404"
        title="缺少项目 ID"
        subTitle="请从项目列表选择一个项目"
        extra={
          <Button type="primary" onClick={() => navigate('/')}>
            返回项目列表
          </Button>
        }
      />
    );
  }

  if (!currentPlan || error.plans || error.timelines) {
    return (
      <Result
        status="404"
        title="项目不存在"
        subTitle={`未找到 ID 为 ${planId} 的项目${error.plans ? ': ' + error.plans : ''}`}
        extra={
          <Button type="primary" onClick={() => navigate('/')}>
            返回项目列表
          </Button>
        }
      />
    );
  }

  return (
    <UnifiedTimelinePanelV2 planId={planId} />
  );
};

export default EnhancedTimePlanView;
