/**
 * API 集成测试
 * 
 * 测试前后端集成功能：
 * - 认证流程
 * - CRUD 操作
 * - 数据转换
 * - 错误处理
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  authService,
  planService,
  timelineService,
  nodeService,
  dependencyService,
} from '../services';
import { clearTokens } from '../client';

// 测试用户信息
const TEST_USER = {
  username: `test_user_${Date.now()}`,
  email: `test${Date.now()}@example.com`,
  password: 'TestPassword123!',
};

// 测试数据 IDs
let testPlanId: string;
let testTimelineId: string;
let testNodeIds: string[] = [];

describe('API Integration Tests', () => {
  describe('Authentication', () => {
    it('should register a new user', async () => {
      const user = await authService.register(
        TEST_USER.username,
        TEST_USER.email,
        TEST_USER.password
      );

      expect(user).toBeDefined();
      expect(user.username).toBe(TEST_USER.username);
      expect(user.email).toBe(TEST_USER.email);
    });

    it('should login and get tokens', async () => {
      const response = await authService.login(TEST_USER.username, TEST_USER.password);

      expect(response).toBeDefined();
      expect(response.accessToken).toBeDefined();
      expect(response.refreshToken).toBeDefined();
      expect(response.tokenType).toBe('bearer');
    });

    it('should get current user info', async () => {
      const user = await authService.getCurrentUser();

      expect(user).toBeDefined();
      expect(user.username).toBe(TEST_USER.username);
    });
  });

  describe('Plan Operations', () => {
    it('should create a plan', async () => {
      const plan = await planService.createPlan({
        title: 'Integration Test Plan',
        owner: TEST_USER.username,
        description: 'Test plan for API integration',
      });

      expect(plan).toBeDefined();
      expect(plan.title).toBe('Integration Test Plan');
      expect(plan.owner).toBe(TEST_USER.username);

      testPlanId = plan.id;
    });

    it('should get plans list', async () => {
      const plans = await planService.getPlans();

      expect(plans).toBeDefined();
      expect(Array.isArray(plans)).toBe(true);
      expect(plans.length).toBeGreaterThan(0);
    });

    it('should get plan by id', async () => {
      const plan = await planService.getPlan(testPlanId);

      expect(plan).toBeDefined();
      expect(plan.id).toBe(testPlanId);
      expect(plan.title).toBe('Integration Test Plan');
    });

    it('should update plan', async () => {
      const updated = await planService.updatePlan(testPlanId, {
        description: 'Updated description',
      });

      expect(updated).toBeDefined();
      expect(updated.description).toBe('Updated description');
    });
  });

  describe('Timeline Operations', () => {
    it('should create a timeline', async () => {
      const timeline = await timelineService.createTimeline(testPlanId, {
        name: 'Test Timeline',
        owner: 'Test Owner',
        color: '#1677ff',
      });

      expect(timeline).toBeDefined();
      expect(timeline.name).toBe('Test Timeline');

      testTimelineId = timeline.id;
    });

    it('should get timelines for plan', async () => {
      const timelines = await timelineService.getTimelines(testPlanId);

      expect(timelines).toBeDefined();
      expect(Array.isArray(timelines)).toBe(true);
      expect(timelines.length).toBeGreaterThan(0);
    });
  });

  describe('Node Operations', () => {
    it('should create bar node', async () => {
      const node = await nodeService.createNode(testTimelineId, {
        type: 'bar',
        label: 'Test Task',
        startDate: new Date('2026-03-01'),
        endDate: new Date('2026-03-15'),
        color: '#52c41a',
      });

      expect(node).toBeDefined();
      expect(node.type).toBe('bar');
      expect(node.label).toBe('Test Task');

      testNodeIds.push(node.id);
    });

    it('should create milestone node', async () => {
      const node = await nodeService.createNode(testTimelineId, {
        type: 'milestone',
        label: 'Test Milestone',
        startDate: new Date('2026-03-16'),
        color: '#ff4d4f',
      });

      expect(node).toBeDefined();
      expect(node.type).toBe('milestone');
      expect(node.endDate).toBeUndefined();

      testNodeIds.push(node.id);
    });

    it('should create gateway node', async () => {
      const node = await nodeService.createNode(testTimelineId, {
        type: 'gateway',
        label: 'Test Gateway',
        startDate: new Date('2026-03-17'),
        color: '#faad14',
      });

      expect(node).toBeDefined();
      expect(node.type).toBe('gateway');

      testNodeIds.push(node.id);
    });

    it('should get nodes by timeline', async () => {
      const nodes = await nodeService.getNodesByTimeline(testTimelineId);

      expect(nodes).toBeDefined();
      expect(Array.isArray(nodes)).toBe(true);
      expect(nodes.length).toBe(3);
    });
  });

  describe('Dependency Operations', () => {
    it('should create dependency', async () => {
      const dep = await dependencyService.createDependency({
        fromNodeId: testNodeIds[0],
        toNodeId: testNodeIds[1],
        type: 'finish-to-start',
      });

      expect(dep).toBeDefined();
      expect(dep.fromNodeId).toBe(testNodeIds[0]);
      expect(dep.toNodeId).toBe(testNodeIds[1]);
      expect(dep.type).toBe('finish-to-start');
    });

    it('should detect cycle dependency', async () => {
      // Create A -> B -> C
      await dependencyService.createDependency({
        fromNodeId: testNodeIds[1],
        toNodeId: testNodeIds[2],
        type: 'finish-to-start',
      });

      // Try to create C -> A (would create cycle)
      const hasCycle = await dependencyService.checkCycle(testNodeIds[2], testNodeIds[0]);

      expect(hasCycle).toBe(true);
    });

    it('should get plan dependencies', async () => {
      const deps = await dependencyService.getPlanDependencies(testPlanId);

      expect(deps).toBeDefined();
      expect(Array.isArray(deps)).toBe(true);
      expect(deps.length).toBeGreaterThan(0);
    });
  });

  describe('Data Transformation', () => {
    it('should transform node type correctly', async () => {
      // Frontend 'line' type should be stored as 'bar' with attributes
      const lineNode = await nodeService.createNode(testTimelineId, {
        type: 'line',
        label: 'Nested Plan',
        startDate: new Date('2026-04-01'),
        endDate: new Date('2026-04-30'),
      });

      expect(lineNode.type).toBe('line');
      testNodeIds.push(lineNode.id);

      // Retrieve and verify
      const retrieved = await nodeService.getNode(lineNode.id);
      expect(retrieved.type).toBe('line');
    });

    it('should handle date conversions', async () => {
      const startDate = new Date('2026-05-01T00:00:00');
      const endDate = new Date('2026-05-15T00:00:00');

      const node = await nodeService.createNode(testTimelineId, {
        type: 'bar',
        label: 'Date Test',
        startDate,
        endDate,
      });

      expect(node.startDate).toBeInstanceOf(Date);
      expect(node.endDate).toBeInstanceOf(Date);
      expect(node.startDate.getTime()).toBe(startDate.getTime());
    });
  });

  // Cleanup
  afterAll(async () => {
    try {
      // Delete test plan (cascades to timelines, nodes, dependencies)
      await planService.deletePlan(testPlanId);
      // Logout
      await authService.logout();
      clearTokens();
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  });
});
