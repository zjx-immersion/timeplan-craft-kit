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
 * @version 1.0.0
 * @status 🚧 开发中 - 待实现甘特图组件
 */

import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Result, Button, Spin, theme } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { useTimePlanStore } from '@/stores/timePlanStore';

export default function Index() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = theme.useToken();
  
  // Store
  const { currentPlan, setCurrentPlan, getPlanById } = useTimePlanStore();
  
  // 加载项目
  useEffect(() => {
    if (id) {
      setCurrentPlan(id);
    }
  }, [id, setCurrentPlan]);
  
  // 项目不存在
  if (id && !getPlanById(id)) {
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
        <Spin size="large" tip="加载项目中..." />
      </div>
    );
  }
  
  // TODO: 实现甘特图组件
  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: token.colorBgLayout,
    }}>
      {/* 工具栏 */}
      <div style={{
        padding: token.padding,
        borderBottom: `1px solid ${token.colorBorder}`,
        backgroundColor: token.colorBgContainer,
      }}>
        <h2 style={{ margin: 0 }}>{currentPlan.title}</h2>
      </div>
      
      {/* 主内容区 */}
      <div style={{
        flex: 1,
        padding: token.paddingLG,
        overflow: 'auto',
      }}>
        <Result
          status="info"
          title="甘特图组件开发中"
          subTitle="TimelinePanel 组件正在迁移中，敬请期待"
          extra={
            <Button type="primary" onClick={() => navigate('/')}>
              返回项目列表
            </Button>
          }
        />
      </div>
    </div>
  );
}
