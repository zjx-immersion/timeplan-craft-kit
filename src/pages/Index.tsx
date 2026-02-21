/**
 * Index - 项目详情页（甘特图主页面）
 * 
 * 1:1 还原原项目的 Index 功能
 * 
 * 功能:
 * - 甘特图视图
 * - 时间线管理
 * - 任务管理
 * - 依赖关系
 * 
 * @version 1.0.1
 * @status ✅ TimelinePanel 已集成
 */

import { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Result, Button, Spin, theme } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { useTimePlanStoreWithAPI } from '@/stores/timePlanStoreWithAPI';
import { UnifiedTimelinePanelV2 } from '@/components/timeline/UnifiedTimelinePanelV2';

export default function Index() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = theme.useToken();

  // Store - 使用 API 集成的 Store
  const { currentPlan, loading, error, loadPlan, setCurrentPlan } = useTimePlanStoreWithAPI();

  // 加载项目 - 只在 id 变化时加载，避免无限循环
  const isLoadingRef = useRef(false);
  useEffect(() => {
    if (id && !isLoadingRef.current) {
      isLoadingRef.current = true;
      loadPlan(id).finally(() => {
        isLoadingRef.current = false;
      });
    }
  }, [id]);

  // 显示加载状态
  if (loading.plans || loading.timelines) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Spin size="large" tip="加载项目中..." />
      </div>
    );
  }

  // 项目不存在或加载错误
  if (id && !currentPlan && (error.plans || error.timelines)) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Result
          status="404"
          title="项目不存在"
          subTitle={`未找到 ID 为 ${id} 的项目`}
          extra={
            <Button
              type="primary"
              icon={<HomeOutlined />}
              onClick={() => navigate('/')}
            >
              返回项目列表
            </Button>
          }
        />
      </div>
    );
  }

  // 加载中
  if (!currentPlan) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Spin size="large">
          <div style={{ padding: 50 }} />
        </Spin>
      </div>
    );
  }

  // 渲染 UnifiedTimelinePanelV2
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <UnifiedTimelinePanelV2
        planId={currentPlan.id}
        initialView="gantt"
        showTimeAxisScaler={true}
      />
    </div>
  );
}
