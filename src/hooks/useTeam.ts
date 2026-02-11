/**
 * useTeam Hook
 * 
 * Team数据管理Hook
 * 
 * @module hooks/useTeam
 */

import { useState, useCallback, useEffect } from 'react';
import { message } from 'antd';
import type { Team, TeamCreate, TeamUpdate, TeamMember, TeamMemberCreate } from '@/types/team';
import * as TeamStorage from '@/utils/storage/teamStorage';

export function useTeam() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);

  // 加载Teams
  const loadTeams = useCallback(() => {
    try {
      const loaded = TeamStorage.loadTeams();
      setTeams(loaded);
    } catch (error) {
      message.error('加载Team失败');
      console.error(error);
    }
  }, []);

  // 创建Team
  const createTeam = useCallback((data: TeamCreate): Team => {
    try {
      const team: Team = {
        id: `team-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      TeamStorage.addTeam(team);
      setTeams(prev => [...prev, team]);
      message.success(`Team "${team.name}" 创建成功`);
      
      return team;
    } catch (error) {
      message.error('创建Team失败');
      throw error;
    }
  }, []);

  // 更新Team
  const updateTeam = useCallback((id: string, updates: TeamUpdate) => {
    try {
      TeamStorage.updateTeam(id, updates);
      setTeams(prev =>
        prev.map(t => (t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t))
      );
      message.success('Team更新成功');
    } catch (error) {
      message.error('更新Team失败');
      throw error;
    }
  }, []);

  // 删除Team
  const deleteTeam = useCallback((id: string) => {
    try {
      TeamStorage.deleteTeam(id);
      setTeams(prev => prev.filter(t => t.id !== id));
      message.success('Team删除成功');
    } catch (error) {
      message.error('删除Team失败');
      throw error;
    }
  }, []);

  // 添加成员
  const addMember = useCallback((teamId: string, memberData: TeamMemberCreate) => {
    try {
      const member: TeamMember = {
        id: `member-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        ...memberData,
      };
      
      TeamStorage.addTeamMember(teamId, member);
      setTeams(prev =>
        prev.map(t =>
          t.id === teamId
            ? { ...t, members: [...t.members, member], updatedAt: new Date() }
            : t
        )
      );
      message.success(`成员 "${member.name}" 添加成功`);
    } catch (error) {
      message.error('添加成员失败');
      throw error;
    }
  }, []);

  // 更新成员
  const updateMember = useCallback(
    (teamId: string, memberId: string, updates: Partial<TeamMember>) => {
      try {
        TeamStorage.updateTeamMember(teamId, memberId, updates);
        setTeams(prev =>
          prev.map(t =>
            t.id === teamId
              ? {
                  ...t,
                  members: t.members.map(m =>
                    m.id === memberId ? { ...m, ...updates } : m
                  ),
                  updatedAt: new Date(),
                }
              : t
          )
        );
        message.success('成员更新成功');
      } catch (error) {
        message.error('更新成员失败');
        throw error;
      }
    },
    []
  );

  // 删除成员
  const removeMember = useCallback((teamId: string, memberId: string) => {
    try {
      TeamStorage.removeTeamMember(teamId, memberId);
      setTeams(prev =>
        prev.map(t =>
          t.id === teamId
            ? {
                ...t,
                members: t.members.filter(m => m.id !== memberId),
                updatedAt: new Date(),
              }
            : t
        )
      );
      message.success('成员删除成功');
    } catch (error) {
      message.error('删除成员失败');
      throw error;
    }
  }, []);

  // 根据ID获取Team
  const getTeamById = useCallback(
    (id: string): Team | undefined => {
      return teams.find(t => t.id === id);
    },
    [teams]
  );

  // 初始加载
  useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  return {
    teams,
    loading,
    setLoading,
    createTeam,
    updateTeam,
    deleteTeam,
    addMember,
    updateMember,
    removeMember,
    getTeamById,
    refreshTeams: loadTeams,
  };
}
