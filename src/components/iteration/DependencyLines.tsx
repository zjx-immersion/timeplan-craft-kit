/**
 * MR 依赖关系连线组件 - Ant Design版本
 * 
 * 使用 SVG 绘制 MR 之间的依赖关系线
 * 
 * @version 1.0.0
 * @date 2026-02-07
 */

import React, { useMemo, useRef, useEffect, useState } from 'react';
import { MR, IterationTask } from '@/types/iteration';

interface DependencyLinesProps {
  tasks: IterationTask[];
  mrs: MR[];
  containerRef: React.RefObject<HTMLDivElement>;
}

interface MRPosition {
  mrId: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

const DependencyLines: React.FC<DependencyLinesProps> = ({
  tasks,
  mrs,
  containerRef,
}) => {
  const [mrPositions, setMrPositions] = useState<Map<string, MRPosition>>(new Map());
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null);
  const [hoveredMRId, setHoveredMRId] = useState<string | null>(null);
  
  // 计算所有 MR 卡片的位置
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updatePositions = () => {
      const container = containerRef.current;
      if (!container) return;
      
      const containerRect = container.getBoundingClientRect();
      setContainerRect(containerRect);
      
      const positions = new Map<string, MRPosition>();
      
      // 查找所有 MR 卡片元素
      const mrCards = container.querySelectorAll('[data-mr-id]');
      mrCards.forEach((card) => {
        const mrId = card.getAttribute('data-mr-id');
        if (!mrId) return;
        
        const rect = card.getBoundingClientRect();
        positions.set(mrId, {
          mrId,
          x: rect.left - containerRect.left + container.scrollLeft,
          y: rect.top - containerRect.top + container.scrollTop,
          width: rect.width,
          height: rect.height,
        });
      });
      
      setMrPositions(positions);
    };
    
    // 初始更新
    updatePositions();
    
    // 监听滚动和窗口大小变化
    const container = containerRef.current;
    container.addEventListener('scroll', updatePositions, { passive: true });
    window.addEventListener('resize', updatePositions);
    
    // 使用 MutationObserver 监听 DOM 变化
    const observer = new MutationObserver(updatePositions);
    observer.observe(container, { 
      childList: true, 
      subtree: true,
      attributes: true,
      attributeFilter: ['data-mr-id'],
    });
    
    // 监听鼠标悬停事件
    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const mrId = target.closest('[data-mr-id]')?.getAttribute('data-mr-id');
      if (mrId) {
        setHoveredMRId(mrId);
      }
    };
    
    const handleMouseLeave = () => {
      setHoveredMRId(null);
    };
    
    container.addEventListener('mouseenter', handleMouseEnter, true);
    container.addEventListener('mouseleave', handleMouseLeave, true);
    
    return () => {
      container.removeEventListener('scroll', updatePositions);
      window.removeEventListener('resize', updatePositions);
      container.removeEventListener('mouseenter', handleMouseEnter, true);
      container.removeEventListener('mouseleave', handleMouseLeave, true);
      observer.disconnect();
    };
  }, [containerRef, tasks, mrs]);
  
  // 计算依赖关系连线
  const dependencies = useMemo(() => {
    const lines: Array<{
      from: MRPosition;
      to: MRPosition;
      mr: MR;
    }> = [];
    
    // 遍历所有 MR，找出有依赖关系的
    mrs.forEach((mr) => {
      if (!mr.dependencies || mr.dependencies.length === 0) return;
      
      const toPos = mrPositions.get(mr.id);
      if (!toPos) return;
      
      mr.dependencies.forEach((depId) => {
        const fromPos = mrPositions.get(depId);
        if (!fromPos) return;
        
        lines.push({
          from: fromPos,
          to: toPos,
          mr,
        });
      });
    });
    
    return lines;
  }, [mrs, mrPositions]);
  
  if (!containerRect || dependencies.length === 0) {
    return null;
  }
  
  return (
    <svg
      className="dependency-lines-svg"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        width: '100%',
        height: '100%',
        zIndex: 1,
        overflow: 'visible',
      }}
    >
      <defs>
        {/* 箭头标记 */}
        <marker
          id="arrow-dependency"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L9,3 z" fill="#fa8c16" />
        </marker>
        {/* 高亮箭头标记 */}
        <marker
          id="arrow-dependency-hover"
          markerWidth="12"
          markerHeight="12"
          refX="11"
          refY="4"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,8 L11,4 z" fill="#fa541c" />
        </marker>
      </defs>
      
      {dependencies.map(({ from, to, mr }, index) => {
        // 计算连线的起点和终点
        // 从源 MR 的右侧中点连到目标 MR 的左侧中点
        const x1 = from.x + from.width;
        const y1 = from.y + from.height / 2;
        const x2 = to.x;
        const y2 = to.y + to.height / 2;
        
        // 使用贝塞尔曲线绘制平滑的连线
        const controlX1 = x1 + (x2 - x1) / 3;
        const controlY1 = y1;
        const controlX2 = x1 + (x2 - x1) * 2 / 3;
        const controlY2 = y2;
        
        const path = `M ${x1} ${y1} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${x2} ${y2}`;
        
        // 判断是否高亮（hover 的 MR 或其依赖）
        const isHovered = hoveredMRId === mr.id || hoveredMRId === from.mrId || 
          (mr.dependencies && mr.dependencies.includes(hoveredMRId || ''));
        
        return (
          <g key={`${from.mrId}-${to.mrId}-${index}`}>
            {/* 连线 */}
            <path
              d={path}
              stroke={isHovered ? '#fa541c' : '#fa8c16'}
              strokeWidth={isHovered ? 3 : 2}
              fill="none"
              opacity={isHovered ? 0.9 : 0.6}
              markerEnd={isHovered ? "url(#arrow-dependency-hover)" : "url(#arrow-dependency)"}
              style={{
                transition: 'all 0.2s ease',
              }}
            />
          </g>
        );
      })}
    </svg>
  );
};

export default DependencyLines;
