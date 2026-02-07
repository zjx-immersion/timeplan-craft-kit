/**
 * TimelineHeader - 时间轴表头组件
 * 
 * 📋 复刻自 @timeline-craft-kit/TimelineHeader.tsx
 * - 统一的时间轴计算方式
 * - 基于天的像素计算（PIXELS_PER_DAY * 实际天数）
 * - 双层表头结构：父级（年/月） + 子级（日/周/月/季度）
 * 
 * @version 2.0.0
 * @date 2026-02-07
 */

import React, { useMemo } from 'react';
import { theme } from 'antd';
import { TimeScale } from '@/utils/dateUtils';
import { getPixelsPerDay } from '@/utils/dateUtils';
import { isHoliday } from '@/utils/holidayUtils';
import { 
  format, 
  startOfWeek, 
  eachDayOfInterval, 
  eachWeekOfInterval, 
  eachMonthOfInterval, 
  eachQuarterOfInterval,
  endOfWeek,
  addDays,
  isWeekend,
  getDaysInMonth,
  differenceInCalendarDays,
  endOfMonth,
  endOfQuarter,
} from 'date-fns';
import { zhCN } from 'date-fns/locale';

const { useToken } = theme;

interface TimelineHeaderProps {
  startDate: Date;
  endDate: Date;
  scale: TimeScale;
}

interface HeaderCell {
  date: Date;
  label: string;
  width: number;
  isToday?: boolean;
  isWeekend?: boolean;
  isHoliday?: boolean;
}

/**
 * 获取父级表头数据（年份或月份）
 * CRITICAL: 所有宽度计算必须使用 actualDays * pixelsPerDay 确保完美对齐
 */
const getParentHeaders = (startDate: Date, endDate: Date, scale: TimeScale): HeaderCell[] => {
  const cells: HeaderCell[] = [];
  const pixelsPerDay = getPixelsPerDay(scale);
  
  switch (scale) {
    case 'day': {
      // 父级：月份（2026年1月）
      const months = eachMonthOfInterval({ start: startDate, end: endDate });
      months.forEach((monthStart) => {
        const monthEnd = endOfMonth(monthStart);
        const actualStart = monthStart < startDate ? startDate : monthStart;
        const actualEnd = monthEnd > endDate ? endDate : monthEnd;
        
        // ✅ 统一计算：视图内实际日历天数
        const daysInView = differenceInCalendarDays(actualEnd, actualStart) + 1;
        
        cells.push({
          date: monthStart,
          label: format(monthStart, 'yyyy年M月', { locale: zhCN }),
          width: daysInView * pixelsPerDay,
        });
      });
      break;
    }
    
    case 'week': {
      // 父级：月份（26年1月）
      const months = eachMonthOfInterval({ start: startDate, end: endDate });
      months.forEach((monthStart) => {
        const monthEnd = endOfMonth(monthStart);
        const actualStart = monthStart < startDate ? startDate : monthStart;
        const actualEnd = monthEnd > endDate ? endDate : monthEnd;
        
        const daysInView = differenceInCalendarDays(actualEnd, actualStart) + 1;
        
        cells.push({
          date: monthStart,
          label: format(monthStart, 'yy年M月', { locale: zhCN }),
          width: daysInView * pixelsPerDay,
        });
      });
      break;
    }
    
    case 'biweekly': {
      // 父级：月份（26年1月）
      const months = eachMonthOfInterval({ start: startDate, end: endDate });
      months.forEach((monthStart) => {
        const monthEnd = endOfMonth(monthStart);
        const actualStart = monthStart < startDate ? startDate : monthStart;
        const actualEnd = monthEnd > endDate ? endDate : monthEnd;
        
        const daysInView = differenceInCalendarDays(actualEnd, actualStart) + 1;
        
        cells.push({
          date: monthStart,
          label: format(monthStart, 'yy年M月', { locale: zhCN }),
          width: daysInView * pixelsPerDay,
        });
      });
      break;
    }
    
    case 'month': {
      // 父级：年份（2026）
      const years: { year: number; months: Date[] }[] = [];
      const months = eachMonthOfInterval({ start: startDate, end: endDate });
      let currentYear = -1;
      let currentMonths: Date[] = [];
      
      months.forEach((month, i) => {
        const year = month.getFullYear();
        if (year !== currentYear) {
          if (currentYear !== -1) {
            years.push({ year: currentYear, months: currentMonths });
          }
          currentYear = year;
          currentMonths = [month];
        } else {
          currentMonths.push(month);
        }
        if (i === months.length - 1) {
          years.push({ year: currentYear, months: currentMonths });
        }
      });
      
      years.forEach(({ year, months: yearMonths }) => {
        // ✅ 统一计算：汇总所有月份在视图内的实际天数
        let totalDays = 0;
        yearMonths.forEach(month => {
          const monthEnd = endOfMonth(month);
          const actualStart = month < startDate ? startDate : month;
          const actualEnd = monthEnd > endDate ? endDate : monthEnd;
          totalDays += differenceInCalendarDays(actualEnd, actualStart) + 1;
        });
        
        cells.push({
          date: new Date(year, 0, 1),
          label: String(year),
          width: totalDays * pixelsPerDay,
        });
      });
      break;
    }
    
    case 'quarter': {
      // 父级：年份（2026）
      const quarters = eachQuarterOfInterval({ start: startDate, end: endDate });
      const years: { year: number; quarters: Date[] }[] = [];
      let currentYear = -1;
      let currentQuarters: Date[] = [];
      
      quarters.forEach((q, i) => {
        const year = q.getFullYear();
        if (year !== currentYear) {
          if (currentYear !== -1) {
            years.push({ year: currentYear, quarters: currentQuarters });
          }
          currentYear = year;
          currentQuarters = [q];
        } else {
          currentQuarters.push(q);
        }
        if (i === quarters.length - 1) {
          years.push({ year: currentYear, quarters: currentQuarters });
        }
      });
      
      years.forEach(({ year, quarters: yearQuarters }) => {
        // ✅ 统一计算：汇总所有季度在视图内的实际天数
        let totalDays = 0;
        yearQuarters.forEach(q => {
          const quarterEnd = endOfQuarter(q);
          const actualStart = q < startDate ? startDate : q;
          const actualEnd = quarterEnd > endDate ? endDate : quarterEnd;
          totalDays += differenceInCalendarDays(actualEnd, actualStart) + 1;
        });
        
        cells.push({
          date: new Date(year, 0, 1),
          label: String(year),
          width: totalDays * pixelsPerDay,
        });
      });
      break;
    }
  }
  
  return cells;
};

/**
 * 获取子级表头数据（日/周/月/季度）
 */
const getChildHeaders = (startDate: Date, endDate: Date, scale: TimeScale): HeaderCell[] => {
  const cells: HeaderCell[] = [];
  const pixelsPerDay = getPixelsPerDay(scale);
  
  switch (scale) {
    case 'day': {
      // 子级：日期（1, 2, 3...）
      const days = eachDayOfInterval({ start: startDate, end: endDate });
      days.forEach((day) => {
        const today = new Date();
        const isToday = day.toDateString() === today.toDateString();
        
        cells.push({
          date: day,
          label: format(day, 'd'),
          width: pixelsPerDay,
          isToday,
          isWeekend: isWeekend(day),
          isHoliday: isHoliday(day),
        });
      });
      break;
    }
    
    case 'week': {
      // 子级：周范围（1-7, 8-14...）
      const weeks = eachWeekOfInterval({ start: startDate, end: endDate }, { weekStartsOn: 1 });
      weeks.forEach((weekStart) => {
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
        cells.push({
          date: weekStart,
          label: `${format(weekStart, 'd')}-${format(weekEnd, 'd')}`,
          width: 7 * pixelsPerDay, // 精确7天
        });
      });
      break;
    }
    
    case 'biweekly': {
      // 子级：双周范围（1/1-14, 1/15-28...）
      let current = startOfWeek(startDate, { weekStartsOn: 1 });
      while (current <= endDate) {
        const periodEnd = addDays(current, 13);
        cells.push({
          date: current,
          label: `${format(current, 'M/d')}-${format(periodEnd, 'd')}`,
          width: 14 * pixelsPerDay, // 精确14天
        });
        current = addDays(current, 14);
      }
      break;
    }
    
    case 'month': {
      // 子级：月份（1, 2, 3...12）
      const months = eachMonthOfInterval({ start: startDate, end: endDate });
      months.forEach((month) => {
        // ✅ 使用该月的实际天数
        const daysInMonth = getDaysInMonth(month);
        cells.push({
          date: month,
          label: format(month, 'M'),  // ✅ 只显示数字：1, 2, 3...12
          width: daysInMonth * pixelsPerDay,
        });
      });
      break;
    }
    
    case 'quarter': {
      // 子级：季度（Q1, Q2, Q3, Q4）
      const quarters = eachQuarterOfInterval({ start: startDate, end: endDate });
      quarters.forEach((q) => {
        const quarterNum = Math.ceil((q.getMonth() + 1) / 3);
        
        // ✅ 计算季度的实际天数
        const quarterEnd = endOfQuarter(q);
        const actualStart = q < startDate ? startDate : q;
        const actualEnd = quarterEnd > endDate ? endDate : quarterEnd;
        const daysInQuarter = differenceInCalendarDays(actualEnd, actualStart) + 1;
        
        cells.push({
          date: q,
          label: `Q${quarterNum}`,  // ✅ 显示：Q1, Q2, Q3, Q4
          width: daysInQuarter * pixelsPerDay,
        });
      });
      break;
    }
  }
  
  return cells;
};

/**
 * TimelineHeader 主组件
 */
const TimelineHeader: React.FC<TimelineHeaderProps> = React.memo(({
  startDate,
  endDate,
  scale,
}) => {
  const { token } = useToken();
  
  // ⚡ 性能优化：缓存昂贵的表头计算
  const parentHeaders = useMemo(
    () => getParentHeaders(startDate, endDate, scale),
    [startDate, endDate, scale]
  );
  
  const childHeaders = useMemo(
    () => getChildHeaders(startDate, endDate, scale),
    [startDate, endDate, scale]
  );

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 11,
        backgroundColor: token.colorBgContainer,
        borderBottom: `2px solid ${token.colorBorder}`,
      }}
    >
      {/* 父级表头（年份或月份） */}
      <div style={{ display: 'flex', height: 32 }}>
        {parentHeaders.map((cell, index) => (
          <div
            key={`parent-${index}`}
            style={{
              width: cell.width,
              flexShrink: 0,
              borderRight: `1px solid ${token.colorBorderSecondary}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 600,
              color: token.colorText,
              backgroundColor: token.colorBgContainer,
            }}
          >
            {cell.label}
          </div>
        ))}
      </div>
      
      {/* 子级表头（日/周/月/季度） */}
      <div style={{ display: 'flex', height: 36 }}>
        {childHeaders.map((cell, index) => {
          // 确定背景色和文字颜色
          let backgroundColor = 'transparent';
          let textColor = token.colorText;
          
          if (cell.isHoliday) {
            // 法定节假日 - 红色背景
            backgroundColor = '#fff1f0';
            textColor = '#cf1322';
          } else if (cell.isWeekend) {
            // 周末 - 浅灰背景
            backgroundColor = token.colorBgLayout;
            textColor = token.colorTextSecondary;
          }
          
          if (cell.isToday) {
            // 今天 - 高亮
            backgroundColor = token.colorPrimaryBg;
            textColor = token.colorPrimary;
          }
          
          return (
            <div
              key={`child-${index}`}
              style={{
                width: cell.width,
                flexShrink: 0,
                borderRight: `1px solid ${token.colorBorderSecondary}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: `${token.paddingXS}px 4px`,
                fontSize: 11,
                fontWeight: cell.isToday ? 600 : 500,
                backgroundColor,
                color: textColor,
              }}
            >
              {cell.label}
            </div>
          );
        })}
      </div>
    </div>
  );
});

TimelineHeader.displayName = 'TimelineHeader';

export default TimelineHeader;
