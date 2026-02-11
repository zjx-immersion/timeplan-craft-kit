/**
 * Team存储工具
 * 
 * 使用localStorage持久化Team数据
 * 
 * @module utils/storage/teamStorage
 */

import type { Team, TeamMember } from '@/types/team';

const STORAGE_KEY = 'timeplan-teams';
const STORAGE_VERSION = '1.0.0';

/**
 * 存储数据结构
 */
interface TeamStorageData {
  version: string;
  teams: Team[];
  lastUpdated: string;
}

/**
 * 保存Teams到localStorage
 */
export function saveTeams(teams: Team[]): void {
  try {
    const data: TeamStorageData = {
      version: STORAGE_VERSION,
      teams,
      lastUpdated: new Date().toISOString(),
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('[TeamStorage] 保存失败:', error);
    throw new Error('保存Team数据失败');
  }
}

/**
 * 从localStorage加载Teams
 */
export function loadTeams(): Team[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (!stored) {
      return [];
    }
    
    const data: TeamStorageData = JSON.parse(stored);
    
    // 版本检查
    if (data.version !== STORAGE_VERSION) {
      console.warn('[TeamStorage] 版本不匹配，尝试迁移...');
    }
    
    // 转换Date字段
    return data.teams.map(team => ({
      ...team,
      createdAt: new Date(team.createdAt),
      updatedAt: new Date(team.updatedAt),
      members: team.members.map(member => ({
        ...member,
        startDate: member.startDate ? new Date(member.startDate) : undefined,
        endDate: member.endDate ? new Date(member.endDate) : undefined,
      })),
    }));
  } catch (error) {
    console.error('[TeamStorage] 加载失败:', error);
    return [];
  }
}

/**
 * 清除Teams数据
 */
export function clearTeams(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('[TeamStorage] 清除失败:', error);
  }
}

/**
 * 根据ID获取Team
 */
export function getTeamById(id: string): Team | undefined {
  const teams = loadTeams();
  return teams.find(t => t.id === id);
}

/**
 * 添加Team
 */
export function addTeam(team: Team): void {
  const teams = loadTeams();
  teams.push(team);
  saveTeams(teams);
}

/**
 * 更新Team
 */
export function updateTeam(id: string, updates: Partial<Team>): void {
  const teams = loadTeams();
  const index = teams.findIndex(t => t.id === id);
  
  if (index === -1) {
    throw new Error(`Team ${id} 不存在`);
  }
  
  teams[index] = {
    ...teams[index],
    ...updates,
    updatedAt: new Date(),
  };
  
  saveTeams(teams);
}

/**
 * 删除Team
 */
export function deleteTeam(id: string): void {
  const teams = loadTeams();
  const filtered = teams.filter(t => t.id !== id);
  
  if (filtered.length === teams.length) {
    throw new Error(`Team ${id} 不存在`);
  }
  
  saveTeams(filtered);
}

/**
 * 添加团队成员
 */
export function addTeamMember(teamId: string, member: TeamMember): void {
  const teams = loadTeams();
  const team = teams.find(t => t.id === teamId);
  
  if (!team) {
    throw new Error(`Team ${teamId} 不存在`);
  }
  
  team.members.push(member);
  team.updatedAt = new Date();
  
  saveTeams(teams);
}

/**
 * 更新团队成员
 */
export function updateTeamMember(
  teamId: string,
  memberId: string,
  updates: Partial<TeamMember>
): void {
  const teams = loadTeams();
  const team = teams.find(t => t.id === teamId);
  
  if (!team) {
    throw new Error(`Team ${teamId} 不存在`);
  }
  
  const memberIndex = team.members.findIndex(m => m.id === memberId);
  
  if (memberIndex === -1) {
    throw new Error(`Member ${memberId} 不存在`);
  }
  
  team.members[memberIndex] = {
    ...team.members[memberIndex],
    ...updates,
  };
  team.updatedAt = new Date();
  
  saveTeams(teams);
}

/**
 * 删除团队成员
 */
export function removeTeamMember(teamId: string, memberId: string): void {
  const teams = loadTeams();
  const team = teams.find(t => t.id === teamId);
  
  if (!team) {
    throw new Error(`Team ${teamId} 不存在`);
  }
  
  team.members = team.members.filter(m => m.id !== memberId);
  team.updatedAt = new Date();
  
  saveTeams(teams);
}

/**
 * 批量导入Teams
 */
export function importTeams(teams: Team[], mode: 'merge' | 'replace' = 'merge'): void {
  if (mode === 'replace') {
    saveTeams(teams);
  } else {
    const existing = loadTeams();
    const existingIds = new Set(existing.map(t => t.id));
    
    const newTeams = teams.filter(t => !existingIds.has(t.id));
    
    saveTeams([...existing, ...newTeams]);
  }
}

/**
 * 导出Teams
 */
export function exportTeams(): Team[] {
  return loadTeams();
}

/**
 * 获取存储统计信息
 */
export function getStorageStats() {
  const teams = loadTeams();
  const stored = localStorage.getItem(STORAGE_KEY);
  const size = stored ? new Blob([stored]).size : 0;
  
  return {
    count: teams.length,
    memberCount: teams.reduce((sum, t) => sum + t.members.length, 0),
    size,
    sizeKB: (size / 1024).toFixed(2),
    lastUpdated: stored ? JSON.parse(stored).lastUpdated : null,
  };
}
