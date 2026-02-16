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
import { 
  generateMonthsArray, 
  extractLocalDate,
  createLocalDate 
} from '@/utils/timelineCoordinates';

const { useToken } = theme;

interface TimelineHeaderProps {
  startDate: Date;
  endDate: Date;
  scale: TimeScale;
  width?: number;  // ✅ 新增：总宽度，确保表头延伸到滚动区域末尾
}

interface HeaderCell {
  date: Date;
  label: string;
  width: number;
  position: number;  // ✅ 新增：表头在时间轴上的位置（像素）
  isToday?: boolean;
  isWeekend?: boolean;
  isHoliday?: boolean;
}

/**
 * 获取父级表头数据（年份或月份）
 * CRITICAL: 所有宽度计算必须使用 actualDays * pixelsPerDay 确保完美对齐
 * CRITICAL: 使用本地时间避免时区偏移
 */
const getParentHeaders = (startDate: Date, endDate: Date, scale: TimeScale): HeaderCell[] => {
  const cells: HeaderCell[] = [];
  const pixelsPerDay = getPixelsPerDay(scale);
  let cumulativePosition = 0;  // ✅ 累积位置
  
  // ✅ 转换为本地时间，避免时区偏移
  const localStart = createLocalDate(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate()
  );
  const localEnd = createLocalDate(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate()
  );
  
  switch (scale) {
    case 'day': {
      // 父级：月份（2026年1月）
      const months = eachMonthOfInterval({ start: localStart, end: localEnd });
      months.forEach((monthStart) => {
        const monthEnd = endOfMonth(monthStart);
        const actualStart = monthStart < localStart ? localStart : monthStart;
        const actualEnd = monthEnd > localEnd ? localEnd : monthEnd;
        
        // ✅ 统一计算：视图内实际日历天数
        const daysInView = differenceInCalendarDays(actualEnd, actualStart) + 1;
        const width = daysInView * pixelsPerDay;
        
        cells.push({
          date: monthStart,
          label: format(monthStart, 'yyyy年M月', { locale: zhCN }),
          width: width,
          position: cumulativePosition,  // ✅ 添加位置
        });
        
        cumulativePosition += width;  // ✅ 累积位置
      });
      break;
    }
    
    case 'week': {
      // 父级：月份（26年1月）
      const months = eachMonthOfInterval({ start: localStart, end: localEnd });
      months.forEach((monthStart) => {
        const monthEnd = endOfMonth(monthStart);
        const actualStart = monthStart < localStart ? localStart : monthStart;
        const actualEnd = monthEnd > localEnd ? localEnd : monthEnd;
        
        const daysInView = differenceInCalendarDays(actualEnd, actualStart) + 1;
        const width = daysInView * pixelsPerDay;
        
        cells.push({
          date: monthStart,
          label: format(monthStart, 'yy年M月', { locale: zhCN }),
          width: width,
          position: cumulativePosition,  // ✅ 添加位置
        });
        
        cumulativePosition += width;  // ✅ 累积位置
      });
      break;
    }
    
    case 'biweekly': {
      // 父级：月份（26年1月）
      const months = eachMonthOfInterval({ start: localStart, end: localEnd });
      months.forEach((monthStart) => {
        const monthEnd = endOfMonth(monthStart);
        const actualStart = monthStart < localStart ? localStart : monthStart;
        const actualEnd = monthEnd > localEnd ? localEnd : monthEnd;
        
        const daysInView = differenceInCalendarDays(actualEnd, actualStart) + 1;
        const width = daysInView * pixelsPerDay;
        
        cells.push({
          date: monthStart,
          label: format(monthStart, 'yy年M月', { locale: zhCN }),
          width: width,
          position: cumulativePosition,  // ✅ 添加位置
        });
        
        cumulativePosition += width;  // ✅ 累积位置
      });
      break;
    }
    
    case 'month': {
      // 父级：年份（2026）
      const years: { year: number; months: Date[] }[] = [];
      const months = eachMonthOfInterval({ start: localStart, end: localEnd });
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
          const actualStart = month < localStart ? localStart : month;
          const actualEnd = monthEnd > localEnd ? localEnd : monthEnd;
          totalDays += differenceInCalendarDays(actualEnd, actualStart) + 1;
        });
        
        const width = totalDays * pixelsPerDay;
        
        cells.push({
          date: new Date(year, 0, 1),
          label: `${year}年`,  // ✅ 优化：显示 "2026年" 而不是 "2026"
          width: width,
          position: cumulativePosition,  // ✅ 添加位置
        });
        
        cumulativePosition += width;  // ✅ 累积位置
      });
      break;
    }
    
    case 'quarter': {
      // 父级：年份（2026）
      const quarters = eachQuarterOfInterval({ start: localStart, end: localEnd });
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
          const actualStart = q < localStart ? localStart : q;
          const actualEnd = quarterEnd > localEnd ? localEnd : quarterEnd;
          totalDays += differenceInCalendarDays(actualEnd, actualStart) + 1;
        });
        
        const width = totalDays * pixelsPerDay;
        
        cells.push({
          date: new Date(year, 0, 1),
          label: String(year),
          width: width,
          position: cumulativePosition,  // ✅ 添加位置
        });
        
        cumulativePosition += width;  // ✅ 累积位置
      });
      break;
    }
  }
  
  return cells;
};

/**
 * 获取子级表头数据（日/周/月/季度）
 * CRITICAL: 使用本地时间避免时区偏移
 */
const getChildHeaders = (startDate: Date, endDate: Date, scale: TimeScale): HeaderCell[] => {
  const cells: HeaderCell[] = [];
  const pixelsPerDay = getPixelsPerDay(scale);
  let cumulativePosition = 0;  // ✅ 累积位置
  
  // ✅ 转换为本地时间，避免时区偏移
  const localStart = createLocalDate(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate()
  );
  const localEnd = createLocalDate(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate()
  );
  
  switch (scale) {
    case 'day': {
      // 子级：日期（1, 2, 3...）
      const days = eachDayOfInterval({ start: localStart, end: localEnd });
      days.forEach((day) => {
        const today = new Date();
        const isToday = day.toDateString() === today.toDateString();
        
        cells.push({
          date: day,
          label: format(day, 'd'),
          width: pixelsPerDay,
          position: cumulativePosition,  // ✅ 添加位置
          isToday,
          isWeekend: isWeekend(day),
          isHoliday: isHoliday(day),
        });
        
        cumulativePosition += pixelsPerDay;  // ✅ 累积位置
      });
      break;
    }
    
    case 'week': {
      // 子级：周范围（1-7, 8-14...）
      const weeks = eachWeekOfInterval({ start: localStart, end: localEnd }, { weekStartsOn: 1 });
      weeks.forEach((weekStart) => {
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
        const width = 7 * pixelsPerDay;  // ✅ 参考原项目：精确7天
        
        cells.push({
          date: weekStart,
          label: `${format(weekStart, 'd')}-${format(weekEnd, 'd')}`,
          width: width,
          position: cumulativePosition,  // ✅ 添加位置
        });
        
        cumulativePosition += width;  // ✅ 累积位置
      });
      break;
    }
    
    case 'biweekly': {
      // 子级：双周范围（1/1-14, 1/15-28...）
      let current = startOfWeek(localStart, { weekStartsOn: 1 });
      while (current <= localEnd) {
        const periodEnd = addDays(current, 13);
        const width = 14 * pixelsPerDay;  // ✅ 参考原项目：精确14天
        
        cells.push({
          date: current,
          label: `${format(current, 'M/d')}-${format(periodEnd, 'd')}`,
          width: width,
          position: cumulativePosition,  // ✅ 添加位置
        });
        
        cumulativePosition += width;  // ✅ 累积位置
        current = addDays(current, 14);
      }
      break;
    }
    
    case 'month': {
      // 子级：月份（1月, 2月, 3月...12月）
      const months = eachMonthOfInterval({ start: localStart, end: localEnd });
      months.forEach((month, idx) => {
        // ✅ 参考原项目：使用该月的实际天数（28-31天）
        const daysInMonth = getDaysInMonth(month);
        const width = daysInMonth * pixelsPerDay;  // ✅ 使用实际天数：28-31天
        
        // ✅ 调试：输出前3个月的累积位置
        if (idx < 3) {
          console.log(`[getChildHeaders-month] 月份${idx + 1}: cumulativePosition=${cumulativePosition}, width=${width}, daysInMonth=${daysInMonth}, pixelsPerDay=${pixelsPerDay}`);
        }
        
        // ✅ 优化：显示 "1月" 而不是 "1"，更直观
        // 对于跨年第一个月，额外显示年份（例如："1月(2026)"）
        const monthNum = month.getMonth() + 1;
        const year = month.getFullYear();
        const isYearBoundary = idx > 0 && months[idx - 1].getFullYear() !== year;
        const label = isYearBoundary ? `${monthNum}月(${year})` : `${monthNum}月`;
        
        cells.push({
          date: month,
          label: label,
          width: width,
          position: cumulativePosition,  // ✅ 添加位置
        });
        
        cumulativePosition += width;  // ✅ 累积位置
      });
      break;
    }
    
    case 'quarter': {
      // 子级：季度（Q1, Q2, Q3, Q4）
      const quarters = eachQuarterOfInterval({ start: localStart, end: localEnd });
      quarters.forEach((q) => {
        const quarterNum = Math.ceil((q.getMonth() + 1) / 3);
        
        // ✅ 计算季度的实际天数
        const quarterEnd = endOfQuarter(q);
        const actualStart = q < localStart ? localStart : q;
        const actualEnd = quarterEnd > localEnd ? localEnd : quarterEnd;
        const daysInQuarter = differenceInCalendarDays(actualEnd, actualStart) + 1;
        const width = daysInQuarter * pixelsPerDay;
        
        cells.push({
          date: q,
          label: `Q${quarterNum}`,  // ✅ 显示：Q1, Q2, Q3, Q4
          width: width,
          position: cumulativePosition,  // ✅ 添加位置
        });
        
        cumulativePosition += width;  // ✅ 累积位置
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
  width,  // ✅ 新增：总宽度
}) => {
  const { token } = useToken();
  
  // ✅ 使用本地时间格式化日期，避免时区偏移
  console.log('[TimelineHeader] 🎨 渲染开始:', {
    startDate: `${startDate.getFullYear()}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}-${startDate.getDate().toString().padStart(2, '0')}`,
    endDate: `${endDate.getFullYear()}-${(endDate.getMonth() + 1).toString().padStart(2, '0')}-${endDate.getDate().toString().padStart(2, '0')}`,
    startYear: startDate.getFullYear(),
    endYear: endDate.getFullYear(),
    scale,
    width,
  });
  
  // ⚡ 性能优化：缓存昂贵的表头计算
  const parentHeaders = useMemo(() => {
    const headers = getParentHeaders(startDate, endDate, scale);
    console.log('[TimelineHeader] 📊 父级表头计算完成:', {
      count: headers.length,
      labels: headers.map(h => h.label).join(', '),
      widths: headers.map(h => Math.round(h.width)).join(', '),
      totalWidth: headers.reduce((sum, h) => sum + h.width, 0),
    });
    return headers;
  }, [startDate, endDate, scale]);
  
  const childHeaders = useMemo(() => {
    const headers = getChildHeaders(startDate, endDate, scale);
    
    // ✅ 全量日志：输出所有子级表头的详细信息
    console.log(`[TimelineHeader] 📅 子级表头计算完成:`);
    console.log(`  - 总数: ${headers.length}`);
    console.log(`  - 视图范围: ${startDate.toISOString().split('T')[0]} ~ ${endDate.toISOString().split('T')[0]}`);
    console.log(`  - 时间刻度: ${scale}`);
    
    // 输出所有表头的完整列表
    console.log(`  - 完整表头列表 (${headers.length}个):`);
    headers.forEach((h, idx) => {
      const date = h.date;
      const dateStr = date ? `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}` : 'null';
      const isWeekend = h.isWeekend ? '周末' : '';
      const isHoliday = h.isHoliday ? '假日' : '';
      const isToday = h.isToday ? '今天' : '';
      const flags = [isWeekend, isHoliday, isToday].filter(Boolean).join(',') || '-';
      console.log(`    ${(idx + 1).toString().padStart(3)}. ${h.label.padEnd(6)} | 日期: ${dateStr} | 位置: ${Math.round(h.position).toString().padStart(5)}px | 宽度: ${Math.round(h.width).toString().padStart(4)}px | ${flags}`);
    });
    
    // 计算总宽度并验证
    const totalCalculatedWidth = headers.reduce((sum, h) => sum + h.width, 0);
    const lastHeader = headers[headers.length - 1];
    const expectedTotalWidth = lastHeader ? lastHeader.position + lastHeader.width : 0;
    
    console.log('[TimelineHeader] 📊 表头统计:', {
      count: headers.length,
      firstLabel: headers[0]?.label,
      firstDate: headers[0]?.date?.toISOString().split('T')[0],
      lastLabel: lastHeader?.label,
      lastDate: lastHeader?.date?.toISOString().split('T')[0],
      totalCalculatedWidth: Math.round(totalCalculatedWidth),
      expectedTotalWidth: Math.round(expectedTotalWidth),
      widthMatch: Math.abs(totalCalculatedWidth - expectedTotalWidth) < 1,
    });
    
    // ✅ 输出关键月份的位置（用于验证对齐）
    const sampleIndices = [0, Math.floor(headers.length / 2), headers.length - 1];
    console.log(`[TimelineHeader] 🎯 关键位置采样（用于验证）:`);
    sampleIndices.forEach(idx => {
      if (headers[idx]) {
        const h = headers[idx];
        const dateStr = h.date ? `${h.date.getFullYear()}-${(h.date.getMonth() + 1).toString().padStart(2, '0')}-${h.date.getDate().toString().padStart(2, '0')}` : 'null';
        console.log(`  - [${idx}] ${h.label} | 日期: ${dateStr} | 位置: ${Math.round(h.position)}px | 宽度: ${Math.round(h.width)}px`);
      }
    });
    
    return headers;
  }, [startDate, endDate, scale]);

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 11,
        width: width,  // ✅ 设置明确宽度，确保表头延伸到整个滚动区域
        minWidth: width,  // ✅ 确保不会缩小
        backgroundColor: token.colorBgContainer,
        borderBottom: `2px solid ${token.colorBorder}`,
      }}
    >
      {/* 父级表头（年份或月份） */}
      <div style={{ position: 'relative', height: 32 }}>
        {parentHeaders.map((cell, index) => (
          <div
            key={`parent-${index}`}
            style={{
              position: 'absolute',  // ✅ 核心修复：使用绝对定位而不是flex
              left: cell.position,   // ✅ 核心修复：使用计算的position
              width: cell.width,
              height: 32,
              borderRight: `1px solid ${token.colorBorderSecondary}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 600,
              color: token.colorText,
              backgroundColor: token.colorBgContainer,
              boxSizing: 'border-box',
            }}
          >
            {cell.label}
          </div>
        ))}
      </div>
      
      {/* 子级表头（日/周/月/季度） */}
      <div style={{ position: 'relative', height: 36 }}>
        {childHeaders.map((cell, index) => {
          // 确定背景色和文字颜色
          // ✅ 默认使用交替背景色（斑马纹效果）
          let backgroundColor = index % 2 === 0 ? token.colorBgContainer : token.colorBgLayout;
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
                position: 'absolute',  // ✅ 核心修复：使用绝对定位而不是flex
                left: cell.position,   // ✅ 核心修复：使用计算的position
                width: cell.width,
                height: 36,
                borderRight: `1px solid ${token.colorBorderSecondary}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: `${token.paddingXS}px 4px`,
                fontSize: 11,
                boxSizing: 'border-box',
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
