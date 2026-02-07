/**
 * 迭代矩阵组件 - Ant Design版本
 * 
 * 功能：
 * - 纵轴：团队和团队负责的模块（1:N关系）
 * - 横轴：迭代（对应具体日期，每个迭代2周）
 * - 显示 TimePlan 的 gateway/milestone 在迭代上方
 * - 支持点击单元格添加 MR
 * - 支持拖拽移动 MR
 * 
 * @version 1.0.0
 * @date 2026-02-07
 */

import React, { useMemo, useRef, useState, useCallback } from 'react';
import { Product, Team, Module, Iteration, IterationTask, MR } from '@/types/iteration';
import { TimePlan, Line } from '@/types/timeplanSchema';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { PlusOutlined } from '@ant-design/icons';
import MRCard from './MRCard';
import DependencyLines from './DependencyLines';
import IterationMarkers from './IterationMarkers';
import { type IterationWidthLevel } from './IterationWidthSelector';

interface IterationMatrixProps {
  product: Product;
  teams: Team[];
  modules: Module[];
  iterations: Iteration[];
  timePlan: TimePlan | null;
  tasks?: IterationTask[];
  mrs?: MR[];
  widthLevel?: IterationWidthLevel;
  onCellClick: (moduleId: string, iterationId: string) => void;
  onMRClick?: (mr: MR) => void;
  onMRMove?: (mrId: string, fromModuleId: string, fromIterationId: string, toModuleId: string, toIterationId: string) => void;
}

const IterationMatrix: React.FC<IterationMatrixProps> = ({
  product,
  teams,
  modules,
  iterations,
  timePlan,
  tasks = [],
  mrs = [],
  widthLevel = 1,
  onCellClick,
  onMRClick,
  onMRMove,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggedMR, setDraggedMR] = useState<{ mr: MR; moduleId: string; iterationId: string } | null>(null);
  const [dragOverCell, setDragOverCell] = useState<{ moduleId: string; iterationId: string } | null>(null);
  
  // 根据宽度档位计算单元格宽度
  const CELL_WIDTH = useMemo(() => {
    const widths: Record<IterationWidthLevel, number> = {
      1: 150,
      2: 300,
      3: 450,
      4: 600,
      5: 795, // 假设屏幕宽度 1920px，减去固定列后 ≈ 1590px，1590/2 ≈ 795px
    };
    return widths[widthLevel];
  }, [widthLevel]);
  
  // 按团队分组模块
  const modulesByTeam = useMemo(() => {
    const grouped = new Map<string, Module[]>();
    
    teams.forEach(team => {
      const teamModules = modules
        .filter(m => m.teamId === team.id)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      grouped.set(team.id, teamModules);
    });
    
    return grouped;
  }, [teams, modules]);
  
  // 获取迭代对应的 gateway/milestone
  const iterationMarkers = useMemo(() => {
    if (!timePlan) return new Map<string, Line[]>();
    
    const markers = new Map<string, Line[]>();
    
    iterations.forEach(iter => {
      const iterLines: Line[] = [];
      
      // 查找在该迭代时间范围内的 gateway 和 milestone
      timePlan.lines.forEach(line => {
        if (line.schemaId === 'gateway-schema' || line.schemaId === 'milestone-schema') {
          const lineDate = new Date(line.startDate);
          if (lineDate >= iter.startDate && lineDate <= iter.endDate) {
            iterLines.push(line);
          }
        }
      });
      
      // 按日期排序
      iterLines.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
      
      markers.set(iter.id, iterLines);
    });
    
    return markers;
  }, [timePlan, iterations]);
  
  // 布局常量
  const MIN_ROW_HEIGHT = 60;
  const MR_CARD_HEIGHT = 45; // 每个 MR 卡片的高度
  const CELL_PADDING = 12; // 单元格内边距
  const TEAM_HEADER_WIDTH = 200;
  const MODULE_NAME_WIDTH = 200;
  const MARKER_HEIGHT = 40;
  
  // 判断是否使用横排布局（宽度档位 >= 3）
  const useHorizontalLayout = widthLevel >= 3;
  
  // 处理拖拽开始
  const handleDragStart = useCallback((mr: MR, moduleId: string, iterationId: string) => {
    setDraggedMR({ mr, moduleId, iterationId });
  }, []);
  
  // 处理拖拽结束
  const handleDragEnd = useCallback(() => {
    setDraggedMR(null);
    setDragOverCell(null);
  }, []);
  
  // 处理拖拽悬停
  const handleDragOver = useCallback((e: React.DragEvent, moduleId: string, iterationId: string) => {
    if (draggedMR) {
      e.preventDefault();
      e.stopPropagation();
      setDragOverCell({ moduleId, iterationId });
    }
  }, [draggedMR]);
  
  // 处理拖拽离开
  const handleDragLeave = useCallback(() => {
    setDragOverCell(null);
  }, []);
  
  // 处理放置
  const handleDrop = useCallback((e: React.DragEvent, moduleId: string, iterationId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedMR && onMRMove) {
      // 移动 MR 到新的单元格
      onMRMove(
        draggedMR.mr.id,
        draggedMR.moduleId,
        draggedMR.iterationId,
        moduleId,
        iterationId
      );
    }
    
    setDraggedMR(null);
    setDragOverCell(null);
  }, [draggedMR, onMRMove]);
  
  return (
    <div 
      ref={containerRef} 
      style={{
        height: '100%',
        overflow: 'auto',
        background: '#fff',
        position: 'relative',
      }}
    >
      {/* 依赖关系连线 */}
      <DependencyLines
        tasks={tasks}
        mrs={mrs}
        containerRef={containerRef}
      />
      
      <div style={{ display: 'inline-block', minWidth: '100%', position: 'relative', zIndex: 10 }}>
        {/* Header: 迭代标题行 */}
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          background: '#fff',
          borderBottom: '1px solid #d9d9d9',
        }}>
          <div style={{ display: 'flex' }}>
            {/* 团队标题 - 不固定 */}
            <div 
              style={{
                flexShrink: 0,
                background: '#fff',
                borderRight: '1px solid #d9d9d9',
                width: TEAM_HEADER_WIDTH,
              }}
            >
              <div style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px',
              }}>
                <span style={{
                  fontWeight: 600,
                  fontSize: '14px',
                  color: '#8c8c8c',
                }}>
                  团队
                </span>
              </div>
            </div>
            
            {/* 模块标题 - 固定定位 */}
            <div 
              style={{
                flexShrink: 0,
                background: '#fff',
                borderRight: '1px solid #d9d9d9',
                position: 'sticky',
                left: 0,
                zIndex: 30,
                width: MODULE_NAME_WIDTH,
              }}
            >
              <div style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px',
              }}>
                <span style={{
                  fontWeight: 600,
                  fontSize: '14px',
                  color: '#8c8c8c',
                }}>
                  模块
                </span>
              </div>
            </div>
            
            {/* 迭代列 */}
            {iterations.map((iter) => (
              <div
                key={iter.id}
                style={{
                  flexShrink: 0,
                  borderRight: '1px solid #d9d9d9',
                  background: '#fff',
                  width: CELL_WIDTH,
                }}
              >
                <div style={{ padding: '8px 12px', textAlign: 'center' }}>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>{iter.name}</div>
                  <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: 4 }}>
                    {format(iter.startDate, 'M/d', { locale: zhCN })} - {format(iter.endDate, 'M/d', { locale: zhCN })}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* TimePlan Markers Row（gateway 和 milestone）*/}
          {timePlan && (
            <div style={{
              display: 'flex',
              borderTop: '1px solid #d9d9d9',
              background: '#fafafa',
              height: MARKER_HEIGHT,
            }}>
              {/* 团队列占位 - 不固定 */}
              <div 
                style={{
                  flexShrink: 0,
                  borderRight: '1px solid #d9d9d9',
                  background: '#fff',
                  width: TEAM_HEADER_WIDTH,
                }}
              />
              
              {/* 模块列占位 - 固定定位，显示"里程碑/门禁"标签 */}
              <div 
                style={{
                  flexShrink: 0,
                  borderRight: '1px solid #d9d9d9',
                  background: '#fff',
                  position: 'sticky',
                  left: 0,
                  zIndex: 10,
                  width: MODULE_NAME_WIDTH,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '2px 8px',
                  borderRadius: 4,
                  fontSize: '12px',
                  fontWeight: 500,
                  background: '#e6f7ff',
                  color: '#0958d9',
                  border: '1px solid #91d5ff',
                }}>
                  里程碑/门禁
                </span>
              </div>
              
              {iterations.map((iter) => {
                const markers = iterationMarkers.get(iter.id) || [];
                // 根据单元格宽度动态调整显示的标记数量
                // 1档(150px): 显示1个, 2-3档(300-450px): 显示2个, 4-5档(600-795px): 显示3个
                const maxVisible = CELL_WIDTH <= 150 ? 1 : (CELL_WIDTH <= 450 ? 2 : 3);
                
                return (
                  <div
                    key={iter.id}
                    style={{
                      flexShrink: 0,
                      borderRight: '1px solid #d9d9d9',
                      position: 'relative',
                      width: CELL_WIDTH,
                    }}
                  >
                    <IterationMarkers markers={markers} maxVisible={maxVisible} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Body: 团队和模块行 */}
        <div>
          {teams.map((team) => {
            const teamModules = modulesByTeam.get(team.id) || [];
            
            // 计算团队行的总高度
            const teamRowHeights = teamModules.map(module => {
              const maxMRsInRow = Math.max(
                ...iterations.map(iter => {
                  const task = tasks.find(t => t.moduleId === module.id && t.iterationId === iter.id);
                  return task ? task.mrIds.length : 0;
                }),
                1
              );
              return Math.max(
                MIN_ROW_HEIGHT,
                CELL_PADDING * 2 + maxMRsInRow * MR_CARD_HEIGHT + (maxMRsInRow - 1) * 4 + 30
              );
            });
            
            const totalTeamHeight = teamRowHeights.reduce((sum, h) => sum + h, 0);
            
            return (
              <div key={team.id} style={{ display: 'flex' }}>
                {/* 团队名称列 - 不固定，可滚动 */}
                <div
                  style={{
                    flexShrink: 0,
                    background: '#fafafa',
                    borderRight: '1px solid #d9d9d9',
                    borderBottom: '1px solid #d9d9d9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 16px',
                    fontWeight: 600,
                    width: TEAM_HEADER_WIDTH,
                    height: totalTeamHeight,
                  }}
                >
                  <span style={{ fontSize: '14px' }}>{team.name}</span>
                </div>
                
                {/* 模块行 */}
                <div style={{ flex: 1 }}>
                  {teamModules.map((module, moduleIndex) => {
                    // 计算该模块行的最大 MR 数量，用于确定行高
                    const maxMRsInRow = Math.max(
                      ...iterations.map(iter => {
                        const task = tasks.find(t => t.moduleId === module.id && t.iterationId === iter.id);
                        return task ? task.mrIds.length : 0;
                      }),
                      1 // 最少为 1，保证最小高度
                    );
                    
                    // 动态计算行高：基础高度 + (MR数量 * 卡片高度) + padding
                    const rowHeight = Math.max(
                      MIN_ROW_HEIGHT,
                      CELL_PADDING * 2 + maxMRsInRow * MR_CARD_HEIGHT + (maxMRsInRow - 1) * 4 + 30 // 30 是添加按钮高度
                    );
                    
                    return (
                      <div 
                        key={module.id} 
                        style={{
                          display: 'flex',
                          borderBottom: '1px solid #d9d9d9',
                        }}
                        className="iteration-matrix-row"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#fafafa';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#fff';
                        }}
                      >
                        {/* 模块名称列 - 固定在最左侧 */}
                        <div
                          style={{
                            flexShrink: 0,
                            background: '#fff',
                            borderRight: '1px solid #d9d9d9',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '8px 16px',
                            position: 'sticky',
                            left: 0,
                            zIndex: 10,
                            width: MODULE_NAME_WIDTH,
                            minHeight: rowHeight,
                          }}
                        >
                          <span style={{ fontSize: '14px', fontWeight: 500 }}>{module.name}</span>
                        </div>
                    
                        {/* 迭代单元格 */}
                        {iterations.map((iter) => {
                          const task = tasks.find(t => t.moduleId === module.id && t.iterationId === iter.id);
                          const cellMRs = task ? mrs.filter(mr => task.mrIds.includes(mr.id)) : [];
                          const hasMRs = cellMRs.length > 0;
                          const isDragOver = dragOverCell?.moduleId === module.id && dragOverCell?.iterationId === iter.id;
                          
                          return (
                            <div
                              key={iter.id}
                              style={{
                                flexShrink: 0,
                                borderRight: '1px solid #d9d9d9',
                                position: 'relative',
                                width: CELL_WIDTH,
                                minHeight: rowHeight,
                                cursor: !hasMRs ? 'pointer' : draggedMR ? 'move' : 'default',
                                background: isDragOver ? '#e6f7ff' : '#fff',
                                transition: 'background-color 0.2s',
                              }}
                              onClick={(e) => {
                                // 只有在空单元格时才触发添加
                                if (!hasMRs && e.target === e.currentTarget) {
                                  onCellClick(module.id, iter.id);
                                }
                              }}
                              onDragOver={(e) => handleDragOver(e, module.id, iter.id)}
                              onDragLeave={handleDragLeave}
                              onDrop={(e) => handleDrop(e, module.id, iter.id)}
                            >
                              {hasMRs ? (
                                <div 
                                  style={{
                                    position: 'absolute',
                                    inset: 0,
                                    padding: '6px',
                                    display: 'flex',
                                    gap: 4,
                                    overflow: 'auto',
                                    flexDirection: useHorizontalLayout ? 'row' : 'column',
                                    flexWrap: useHorizontalLayout ? 'wrap' : 'nowrap',
                                    alignContent: 'flex-start',
                                  }}
                                >
                                  {cellMRs.map((mr) => (
                                    <div
                                      key={mr.id}
                                      draggable
                                      style={{
                                        flexShrink: 0,
                                        ...(useHorizontalLayout ? {
                                          width: 'calc(50% - 2px)',
                                          minWidth: '200px',
                                        } : {
                                          width: '100%',
                                        }),
                                      }}
                                      onDragStart={() => handleDragStart(mr, module.id, iter.id)}
                                      onDragEnd={handleDragEnd}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onMRClick?.(mr);
                                      }}
                                    >
                                      <MRCard
                                        mr={mr}
                                        isDragging={draggedMR?.mr.id === mr.id}
                                        hasDependencyIssue={
                                          mr.dependencies 
                                            ? mr.dependencies.some(depId => !task.mrIds.includes(depId))
                                            : false
                                        }
                                      />
                                    </div>
                                  ))}
                                  {/* 添加更多按钮 */}
                                  <button
                                    style={{
                                      width: '100%',
                                      padding: '6px',
                                      fontSize: '12px',
                                      color: '#8c8c8c',
                                      border: '1px dashed #d9d9d9',
                                      borderRadius: 4,
                                      background: 'transparent',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: 4,
                                      opacity: 0,
                                      transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.opacity = '1';
                                      e.currentTarget.style.background = '#f5f5f5';
                                      e.currentTarget.style.borderColor = '#1890ff';
                                      e.currentTarget.style.color = '#1890ff';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.opacity = '0';
                                      e.currentTarget.style.background = 'transparent';
                                      e.currentTarget.style.borderColor = '#d9d9d9';
                                      e.currentTarget.style.color = '#8c8c8c';
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onCellClick(module.id, iter.id);
                                    }}
                                  >
                                    <PlusOutlined />
                                    <span>添加</span>
                                  </button>
                                </div>
                              ) : (
                                <div style={{
                                  position: 'absolute',
                                  inset: 0,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}>
                                  <button
                                    style={{
                                      opacity: 0,
                                      transition: 'opacity 0.2s',
                                      padding: '8px',
                                      borderRadius: '50%',
                                      border: 'none',
                                      background: 'transparent',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.opacity = '1';
                                      e.currentTarget.style.background = '#f5f5f5';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.opacity = '0';
                                      e.currentTarget.style.background = 'transparent';
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onCellClick(module.id, iter.id);
                                    }}
                                    title="点击添加MR"
                                  >
                                    <PlusOutlined style={{ fontSize: 20, color: '#8c8c8c' }} />
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default IterationMatrix;
