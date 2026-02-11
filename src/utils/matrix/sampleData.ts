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
 * 创建示例Teams
 */
export function createSampleTeams(): Team[] {
  const now = new Date();
  
  const members1: TeamMember[] = [
    {
      id: 'member-1',
      name: '张三',
      role: '开发工程师',
      capacity: 1.0,
      active: true,
    },
    {
      id: 'member-2',
      name: '李四',
      role: '测试工程师',
      capacity: 0.8,
      active: true,
    },
  ];
  
  const members2: TeamMember[] = [
    {
      id: 'member-3',
      name: '王五',
      role: '架构师',
      capacity: 1.0,
      active: true,
    },
  ];
  
  return [
    {
      id: 'team-chenghzhi',
      name: '承知',
      description: '承知团队',
      capacity: 4.0,
      members: members1,
      color: '#14B8A6',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'team-demo',
      name: '演示团队',
      description: '用于演示的示例团队',
      capacity: 2.0,
      members: members2,
      color: '#faad14',
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
