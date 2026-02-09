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
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { TimeScale } from '@/utils/dateUtils';
import { getPositionFromDate, parseDateAsLocal } from '@/utils/dateUtils';
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
  // ✅ 使用本地日期（仅年月日），避免时间部分干扰
  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);
  
  // 计算今日线的位置
  const todayPosition = useMemo(() => {
    // 检查今天是否在视图范围内
    if (today < viewStartDate || today > viewEndDate) {
      console.log('[TodayLine] 今天不在视图范围内，不渲染');
      return null;
    }
    
    const position = getPositionFromDate(today, viewStartDate, scale);
    
    // ✅ 调试日志：今日标记位置计算（更详细）
    const todayStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    const viewStartStr = `${viewStartDate.getFullYear()}-${(viewStartDate.getMonth() + 1).toString().padStart(2, '0')}-${viewStartDate.getDate().toString().padStart(2, '0')}`;
    const viewEndStr = `${viewEndDate.getFullYear()}-${(viewEndDate.getMonth() + 1).toString().padStart(2, '0')}-${viewEndDate.getDate().toString().padStart(2, '0')}`;
    
    console.log(`[TodayLine] 🕐 今日标记位置计算:
  - 今天: ${todayStr}
  - 视图范围: ${viewStartStr} ~ ${viewEndStr}
  - scale: ${scale}
  - 计算位置: ${position}px`);
    
    console.log(`[TodayLine] 🧮 验证：今日红线应该在 TimelineHeader 中 ${today.getFullYear()}年${today.getMonth() + 1}月的位置 + ${today.getDate() - 1}天 × 5px 处`);
    
    return position;
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
        zIndex: 200, // ✅ 提高层级，确保在所有内容之上（sidebar: 100, header: 101）
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
      
      {/* 顶部标签 - 显示"今日：日期" */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: -24,
          transform: 'translateX(-50%)',
          padding: '3px 10px',
          backgroundColor: 'rgba(248, 113, 113, 0.92)', // ✅ V11修复：添加透明度（#F87171 -> rgba with 0.92 alpha）
          color: '#fff',
          fontSize: 12,
          fontWeight: 600,
          borderRadius: 4,
          whiteSpace: 'nowrap',
          boxShadow: `0 2px 4px rgba(0,0,0,0.25), 0 0 10px ${timelineColors.todayGlow}`, // 增强发光效果
          border: '1px solid rgba(255, 255, 255, 0.3)', // 添加边框增强可见性
        }}
      >
        今日：{format(today, 'yyyy-MM-dd', { locale: zhCN })}
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
