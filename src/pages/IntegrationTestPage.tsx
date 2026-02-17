/**
 * 前后端集成测试页面
 * 
 * 用于验证 API 集成功能
 */

import { useState } from 'react';
import { Button, Card, Space, Input, message, Typography, Divider, Alert } from 'antd';
import {
  UserAddOutlined,
  LoginOutlined,
  PlusOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useTimePlanStoreWithAPI } from '@/stores/timePlanStoreWithAPI';
import { authService } from '@/api/services';

const { Title, Text, Paragraph } = Typography;

export function IntegrationTestPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const {
    plans,
    currentPlan,
    loadPlans,
    createPlan,
    loadPlan,
    createTimeline,
    createNode,
    createDependency,
    checkCycle,
  } = useTimePlanStoreWithAPI();

  // 测试用例状态
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});

  const runTest = async (name: string, testFn: () => Promise<void>) => {
    setLoading(true);
    try {
      await testFn();
      setTestResults(prev => ({ ...prev, [name]: true }));
      message.success(`✅ ${name} 通过`);
    } catch (error: any) {
      setTestResults(prev => ({ ...prev, [name]: false }));
      message.error(`❌ ${name} 失败: ${error.message}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 测试 1: 注册和登录
  const handleRegisterAndLogin = async () => {
    await runTest('认证流程', async () => {
      // 注册
      const testUsername = `test_${Date.now()}`;
      const testPassword = 'Test123!';
      
      await authService.register(
        testUsername,
        `${testUsername}@test.com`,
        testPassword
      );

      // 登录
      await authService.login(testUsername, testPassword);
      setIsLoggedIn(true);
      setUsername(testUsername);
      setPassword(testPassword);
    });
  };

  // 测试 2: 创建计划
  const handleCreatePlan = async () => {
    await runTest('创建计划', async () => {
      await createPlan('集成测试计划', username, '前后端集成测试');
      await loadPlans();
    });
  };

  // 测试 3: 加载计划详情
  const handleLoadPlan = async () => {
    await runTest('加载计划详情', async () => {
      if (plans.length === 0) throw new Error('没有可用的计划');
      await loadPlan(plans[0].id);
    });
  };

  // 测试 4: 创建时间线
  const handleCreateTimeline = async () => {
    await runTest('创建时间线', async () => {
      if (!currentPlan) throw new Error('请先加载计划');
      await createTimeline(currentPlan.id, {
        name: '开发阶段',
        owner: '张三',
        color: '#1677ff',
      });
    });
  };

  // 测试 5: 创建节点
  const handleCreateNodes = async () => {
    await runTest('创建节点', async () => {
      if (!currentPlan || currentPlan.timelines.length === 0) {
        throw new Error('请先创建时间线');
      }

      const timelineId = currentPlan.timelines[0].id;

      // 创建 3 个节点
      await createNode(timelineId, {
        type: 'bar',
        label: '需求分析',
        startDate: new Date('2026-03-01'),
        endDate: new Date('2026-03-15'),
      });

      await createNode(timelineId, {
        type: 'milestone',
        label: '需求评审',
        startDate: new Date('2026-03-16'),
      });

      await createNode(timelineId, {
        type: 'gateway',
        label: '技术评审',
        startDate: new Date('2026-03-17'),
      });
    });
  };

  // 测试 6: 创建依赖并测试循环检测
  const handleTestDependencies = async () => {
    await runTest('依赖关系和循环检测', async () => {
      if (!currentPlan || currentPlan.timelines.length === 0) {
        throw new Error('请先创建节点');
      }

      const nodes = currentPlan.timelines[0].nodes;
      if (nodes.length < 3) throw new Error('节点数量不足');

      // 创建 A -> B
      await createDependency({
        fromNodeId: nodes[0].id,
        toNodeId: nodes[1].id,
        type: 'finish-to-start',
      });

      // 创建 B -> C
      await createDependency({
        fromNodeId: nodes[1].id,
        toNodeId: nodes[2].id,
        type: 'finish-to-start',
      });

      // 测试循环检测：C -> A（应该检测到循环）
      const hasCycle = await checkCycle(nodes[2].id, nodes[0].id);
      if (!hasCycle) throw new Error('循环检测失败');
    });
  };

  // 运行所有测试
  const handleRunAllTests = async () => {
    setTestResults({});
    await handleRegisterAndLogin();
    await new Promise(resolve => setTimeout(resolve, 500));
    await handleCreatePlan();
    await new Promise(resolve => setTimeout(resolve, 500));
    await handleLoadPlan();
    await new Promise(resolve => setTimeout(resolve, 500));
    await handleCreateTimeline();
    await new Promise(resolve => setTimeout(resolve, 500));
    await handleCreateNodes();
    await new Promise(resolve => setTimeout(resolve, 500));
    await handleTestDependencies();
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2}>🧪 前后端集成测试</Title>
      <Paragraph>
        这个页面用于验证前后端 API 集成功能。确保后端服务运行在 http://localhost:8000
      </Paragraph>

      <Alert
        message="后端服务状态"
        description="请确保后端服务正在运行：uvicorn app.main:app --reload"
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Divider />

      {/* 快速测试 */}
      <Card title="🚀 快速测试" style={{ marginBottom: 24 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button
            type="primary"
            size="large"
            loading={loading}
            onClick={handleRunAllTests}
            block
          >
            运行所有测试
          </Button>
        </Space>
      </Card>

      {/* 分步测试 */}
      <Card title="📝 分步测试" style={{ marginBottom: 24 }}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Space wrap>
            <Button
              icon={<UserAddOutlined />}
              loading={loading}
              onClick={handleRegisterAndLogin}
              disabled={isLoggedIn}
            >
              1. 注册和登录
            </Button>
            {testResults['认证流程'] !== undefined && (
              testResults['认证流程'] ? <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} /> : <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 20 }} />
            )}
          </Space>

          <Space wrap>
            <Button
              icon={<PlusOutlined />}
              loading={loading}
              onClick={handleCreatePlan}
              disabled={!isLoggedIn}
            >
              2. 创建计划
            </Button>
            {testResults['创建计划'] !== undefined && (
              testResults['创建计划'] ? <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} /> : <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 20 }} />
            )}
          </Space>

          <Space wrap>
            <Button
              loading={loading}
              onClick={handleLoadPlan}
              disabled={plans.length === 0}
            >
              3. 加载计划
            </Button>
            {testResults['加载计划详情'] !== undefined && (
              testResults['加载计划详情'] ? <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} /> : <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 20 }} />
            )}
          </Space>

          <Space wrap>
            <Button
              loading={loading}
              onClick={handleCreateTimeline}
              disabled={!currentPlan}
            >
              4. 创建时间线
            </Button>
            {testResults['创建时间线'] !== undefined && (
              testResults['创建时间线'] ? <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} /> : <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 20 }} />
            )}
          </Space>

          <Space wrap>
            <Button
              loading={loading}
              onClick={handleCreateNodes}
              disabled={!currentPlan || currentPlan.timelines.length === 0}
            >
              5. 创建节点（3种类型）
            </Button>
            {testResults['创建节点'] !== undefined && (
              testResults['创建节点'] ? <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} /> : <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 20 }} />
            )}
          </Space>

          <Space wrap>
            <Button
              loading={loading}
              onClick={handleTestDependencies}
              disabled={!currentPlan || currentPlan.timelines.length === 0}
            >
              6. 依赖关系 + 循环检测 🔥
            </Button>
            {testResults['依赖关系和循环检测'] !== undefined && (
              testResults['依赖关系和循环检测'] ? <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} /> : <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 20 }} />
            )}
          </Space>
        </Space>
      </Card>

      {/* 当前状态 */}
      <Card title="📊 当前状态">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text>
            <strong>已登录:</strong> {isLoggedIn ? '✅ 是' : '❌ 否'}
          </Text>
          <Text>
            <strong>计划数量:</strong> {plans.length}
          </Text>
          <Text>
            <strong>当前计划:</strong> {currentPlan?.title || '未选择'}
          </Text>
          {currentPlan && (
            <>
              <Text>
                <strong>时间线数量:</strong> {currentPlan.timelines.length}
              </Text>
              <Text>
                <strong>节点数量:</strong>{' '}
                {currentPlan.timelines.reduce((sum, t) => sum + t.nodes.length, 0)}
              </Text>
              <Text>
                <strong>依赖数量:</strong> {currentPlan.dependencies.length}
              </Text>
            </>
          )}
        </Space>
      </Card>
    </div>
  );
}
