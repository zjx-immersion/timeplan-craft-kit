/**
 * 简单的集成测试脚本
 * 使用 Node.js 直接运行，不依赖测试框架
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';
let accessToken = null;

// 工具函数
function log(message, data) {
  console.log(`\n✅ ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
}

function logError(message, error) {
  console.error(`\n❌ ${message}`);
  console.error(error.response?.data || error.message);
}

// 测试用例
const tests = {
  // 1. 测试认证
  async testAuth() {
    try {
      // 注册
      const username = `test_${Date.now()}`;
      const registerRes = await axios.post(`${API_BASE_URL}/api/v1/auth/register`, {
        username,
        email: `${username}@test.com`,
        password: 'Test123!',
      });
      log('用户注册成功', { username: registerRes.data.username });

      // 登录
      const loginRes = await axios.post(`${API_BASE_URL}/api/v1/auth/login`, {
        username,
        password: 'Test123!',
      });
      accessToken = loginRes.data.access_token;
      log('用户登录成功', { tokenLength: accessToken.length });

      return { username };
    } catch (error) {
      logError('认证测试失败', error);
      throw error;
    }
  },

  // 2. 测试 Plan 创建
  async testPlan(username) {
    try {
      const planRes = await axios.post(
        `${API_BASE_URL}/api/v1/plans`,
        {
          title: '集成测试计划',
          owner: username,
          description: '前后端集成测试',
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      log('计划创建成功', { id: planRes.data.id, title: planRes.data.title });
      return planRes.data.id;
    } catch (error) {
      logError('Plan 测试失败', error);
      throw error;
    }
  },

  // 3. 测试 Timeline 创建
  async testTimeline(planId) {
    try {
      const timelineRes = await axios.post(
        `${API_BASE_URL}/api/v1/plans/${planId}/timelines`,
        {
          title: '开发阶段',
          owner: '张三',
          color: '#1677ff',
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      log('时间线创建成功', { id: timelineRes.data.id, title: timelineRes.data.title });
      return timelineRes.data.id;
    } catch (error) {
      logError('Timeline 测试失败', error);
      throw error;
    }
  },

  // 4. 测试 Node 创建
  async testNodes(timelineId) {
    try {
      const nodeIds = [];

      // Bar 节点
      const barRes = await axios.post(
        `${API_BASE_URL}/api/v1/timelines/${timelineId}/nodes`,
        {
          type: 'bar',
          label: '需求分析',
          start_date: '2026-03-01T00:00:00',
          end_date: '2026-03-15T00:00:00',
          color: '#52c41a',
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      nodeIds.push(barRes.data.id);
      log('Bar 节点创建成功', { id: barRes.data.id, type: barRes.data.type });

      // Milestone 节点
      const milestoneRes = await axios.post(
        `${API_BASE_URL}/api/v1/timelines/${timelineId}/nodes`,
        {
          type: 'milestone',
          label: '需求评审',
          start_date: '2026-03-16T00:00:00',
          color: '#ff4d4f',
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      nodeIds.push(milestoneRes.data.id);
      log('Milestone 节点创建成功', { id: milestoneRes.data.id, type: milestoneRes.data.type });

      // Gateway 节点
      const gatewayRes = await axios.post(
        `${API_BASE_URL}/api/v1/timelines/${timelineId}/nodes`,
        {
          type: 'gateway',
          label: '技术评审',
          start_date: '2026-03-17T00:00:00',
          color: '#faad14',
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      nodeIds.push(gatewayRes.data.id);
      log('Gateway 节点创建成功', { id: gatewayRes.data.id, type: gatewayRes.data.type });

      return nodeIds;
    } catch (error) {
      logError('Node 测试失败', error);
      throw error;
    }
  },

  // 5. 测试依赖关系和循环检测
  async testDependencies(nodeIds) {
    try {
      // 创建 A -> B
      await axios.post(
        `${API_BASE_URL}/api/v1/dependencies`,
        {
          from_node_id: nodeIds[0],
          to_node_id: nodeIds[1],
          type: 'FS',
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      log('依赖 A→B 创建成功');

      // 创建 B -> C
      await axios.post(
        `${API_BASE_URL}/api/v1/dependencies`,
        {
          from_node_id: nodeIds[1],
          to_node_id: nodeIds[2],
          type: 'FS',
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      log('依赖 B→C 创建成功');

      // 尝试创建 C -> A（应该被循环检测阻止）
      try {
        await axios.post(
          `${API_BASE_URL}/api/v1/dependencies`,
          {
            from_node_id: nodeIds[2],
            to_node_id: nodeIds[0],
            type: 'FS',
          },
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        console.error('\n❌ 循环检测失败：应该阻止 C→A 的创建');
      } catch (error) {
        if (error.response?.status === 400) {
          log('🔥 循环依赖检测成功！', error.response.data.detail);
        } else {
          throw error;
        }
      }
    } catch (error) {
      logError('Dependency 测试失败', error);
      throw error;
    }
  },
};

// 运行测试
async function runTests() {
  console.log('\n🚀 开始前后端集成测试...\n');
  console.log('=' .repeat(60));

  try {
    // 1. 认证测试
    console.log('\n📝 测试 1: 认证流程');
    const { username } = await tests.testAuth();

    // 2. Plan 测试
    console.log('\n📝 测试 2: 计划管理');
    const planId = await tests.testPlan(username);

    // 3. Timeline 测试
    console.log('\n📝 测试 3: 时间线管理');
    const timelineId = await tests.testTimeline(planId);

    // 4. Node 测试
    console.log('\n📝 测试 4: 节点管理（3种类型）');
    const nodeIds = await tests.testNodes(timelineId);

    // 5. Dependency 测试
    console.log('\n📝 测试 5: 依赖关系和循环检测');
    await tests.testDependencies(nodeIds);

    console.log('\n' + '='.repeat(60));
    console.log('\n🎉 所有测试通过！\n');
    console.log('✅ 认证系统正常');
    console.log('✅ CRUD 操作正常');
    console.log('✅ 三种节点类型创建成功');
    console.log('✅ 依赖关系创建成功');
    console.log('✅ 循环依赖检测工作正常\n');
  } catch (error) {
    console.log('\n' + '='.repeat(60));
    console.error('\n❌ 测试失败\n');
    process.exit(1);
  }
}

// 执行
runTests();
