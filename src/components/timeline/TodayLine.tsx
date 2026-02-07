/**
 * TodayLine - 今日标记线
 * 
 * 📋 功能:
 * - 在时间轴上显示今日日期的垂直线
 * - 在顶部显示"今天"标签
 * 
 * 🎯 样式:
 * - 红色虚线
 * - 穿透所有 Timeline 行
 * - 带有"今天"标签
 */

import React, { useMemo } from 'react';
import { TimeScale } from '@/utils/dateUtils';
import { getPositionFromDate } from '@/utils/dateUtils';
import { timelineColors } from '@/theme/timelineColors';

interface TodayLineProps {
  viewStartDate: Date;
  viewEndDate: Date;
  scale: TimeScale;
  height: number;
}

/**
 * TodayLine 组件
 */
export const TodayLine: React.FC<TodayLineProps> = ({
  viewStartDate,
  viewEndDate,
  scale,
  height,
}) => {
  const today = new Date();
  
  // 计算今日线的位置
  const todayPosition = useMemo(() => {
    // 检查今天是否在视图范围内
    if (today < viewStartDate || today > viewEndDate) {
      return null;
    }
    
    return getPositionFromDate(today, viewStartDate, scale);
  }, [today, viewStartDate, viewEndDate, scale]);
  
  // 如果今天不在视图范围内，不渲染
  if (todayPosition === null) {
    return null;
  }
  
  return (
    <div
      style={{
        position: 'absolute',
        left: todayPosition,
        top: 0,
        bottom: 0,
        width: 2,
        zIndex: 5,
        pointerEvents: 'none',
      }}
    >
      {/* 垂直线 - 使用红色 */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 2,
          height,
          backgroundColor: timelineColors.today, // #F87171 红色
          opacity: 0.8,
          boxShadow: `0 0 8px ${timelineColors.todayGlow}`, // 发光效果
        }}
      />
      
      {/* 顶部标签 */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: -24,
          transform: 'translateX(-50%)',
          padding: '2px 8px',
          backgroundColor: timelineColors.today,
          color: '#fff',
          fontSize: 11,
          fontWeight: 500,
          borderRadius: 3,
          whiteSpace: 'nowrap',
          boxShadow: `0 1px 3px rgba(0,0,0,0.2), 0 0 8px ${timelineColors.todayGlow}`, // 发光效果
        }}
      >
        今天
      </div>
      
      {/* 虚线效果 */}
      <svg
        style={{
          position: 'absolute',
          left: -1,
          top: 0,
          width: 2,
          height,
        }}
      >
        <line
          x1="1"
          y1="0"
          x2="1"
          y2={height}
          stroke={timelineColors.today}
          strokeWidth="2"
          strokeDasharray="4,4"
          opacity="0.8"
        />
      </svg>
    </div>
  );
};
