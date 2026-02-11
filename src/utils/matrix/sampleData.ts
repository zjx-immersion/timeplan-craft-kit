/**
 * 矩阵视图示例数据
 * 
 * 用于初始化和演示
 */

import type { Product } from '@/types/product';
import type { Team, TeamMember } from '@/types/team';
import { saveProducts } from '@/utils/storage/productStorage';
import { saveTeams } from '@/utils/storage/teamStorage';

/**
 * 创建示例Products
 */
export function createSampleProducts(): Product[] {
  const now = new Date();
  
  return [
    {
      id: 'product-orion-x',
      name: 'Orion X',
      code: 'ORION-X',
      description: 'Orion X 智能驾驶平台项目',
      teams: [],
      modules: [],
      owner: '项目经理A',
      color: '#1890ff',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'product-demo',
      name: '演示产品',
      code: 'DEMO',
      description: '用于演示的示例产品',
      teams: [],
      modules: [],
      owner: '项目经理B',
      color: '#52c41a',
      createdAt: now,
      updatedAt: now,
    },
  ];
}

/**
 * 创建示例Teams（对应Orion X项目的各个模块团队）
 */
export function createSampleTeams(): Team[] {
  const now = new Date();
  
  return [
    {
      id: 'team-project-office',
      name: '项目办',
      description: '整车项目管理团队',
      capacity: 3.0,
      members: [
        { id: 'mem-po-1', name: '项目经理', role: 'PM', capacity: 1.0, active: true },
        { id: 'mem-po-2', name: '计划专员', role: '计划', capacity: 1.0, active: true },
      ],
      color: '#1890ff',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'team-ee-arch',
      name: '电子电器架构',
      description: 'E0-E4架构设计团队',
      capacity: 8.0,
      members: [
        { id: 'mem-ee-1', name: '架构师A', role: '架构师', capacity: 1.0, active: true },
        { id: 'mem-ee-2', name: '架构师B', role: '架构师', capacity: 1.0, active: true },
      ],
      color: '#52c41a',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'team-perception',
      name: '感知算法',
      description: '视觉、雷达、融合算法团队',
      capacity: 10.0,
      members: [
        { id: 'mem-per-1', name: '算法工程师', role: '算法', capacity: 1.0, active: true },
      ],
      color: '#14B8A6',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'team-planning',
      name: '规划决策',
      description: '路径规划和决策团队',
      capacity: 8.0,
      members: [
        { id: 'mem-pln-1', name: '规划工程师', role: '规划', capacity: 1.0, active: true },
      ],
      color: '#722ed1',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'team-control',
      name: '控制执行',
      description: '横纵向控制团队',
      capacity: 6.0,
      members: [
        { id: 'mem-ctl-1', name: '控制工程师', role: '控制', capacity: 1.0, active: true },
      ],
      color: '#fa8c16',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'team-hmi',
      name: '座舱HMI',
      description: '座舱人机交互团队',
      capacity: 5.0,
      members: [
        { id: 'mem-hmi-1', name: 'HMI工程师', role: 'HMI', capacity: 1.0, active: true },
      ],
      color: '#eb2f96',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'team-platform',
      name: '平台基础',
      description: '基础平台和中间件团队',
      capacity: 6.0,
      members: [
        { id: 'mem-plat-1', name: '平台工程师', role: '平台', capacity: 1.0, active: true },
      ],
      color: '#13c2c2',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'team-testing',
      name: '测试验证',
      description: '系统测试团队',
      capacity: 7.0,
      members: [
        { id: 'mem-test-1', name: '测试工程师', role: '测试', capacity: 1.0, active: true },
      ],
      color: '#faad14',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'team-integration',
      name: '系统集成',
      description: '系统集成团队',
      capacity: 5.0,
      members: [
        { id: 'mem-int-1', name: '集成工程师', role: '集成', capacity: 1.0, active: true },
      ],
      color: '#fa541c',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'team-quality',
      name: '质量保证',
      description: '质量管理团队',
      capacity: 4.0,
      members: [
        { id: 'mem-qa-1', name: 'QA工程师', role: 'QA', capacity: 1.0, active: true },
      ],
      color: '#2f54eb',
      createdAt: now,
      updatedAt: now,
    },
    // 保留演示团队
    {
      id: 'team-demo',
      name: '演示团队',
      description: '用于演示和默认映射',
      capacity: 2.0,
      members: [
        { id: 'mem-demo-1', name: '演示成员', role: '开发', capacity: 1.0, active: true },
      ],
      color: '#8c8c8c',
      createdAt: now,
      updatedAt: now,
    },
  ];
}

/**
 * 初始化示例数据
 */
export function initializeSampleData() {
  try {
    const products = createSampleProducts();
    const teams = createSampleTeams();
    
    saveProducts(products);
    saveTeams(teams);
    
    console.log('[SampleData] 示例数据初始化成功');
    console.log(`  - Products: ${products.length}`);
    console.log(`  - Teams: ${teams.length}`);
    
    return { products, teams };
  } catch (error) {
    console.error('[SampleData] 初始化失败:', error);
    throw error;
  }
}

/**
 * 检查是否需要初始化
 */
export function shouldInitialize(): boolean {
  const stored = localStorage.getItem('timeplan-products');
  return !stored;
}
