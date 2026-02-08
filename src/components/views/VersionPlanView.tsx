/**
 * VersionPlanView - 版本计划视图
 * 
 * 功能:
 * - 类似甘特图的简化视图
 * - 纵轴：产品平台（从TimePlan的timelines提取）
 * - 横轴：时间线（月份）
 * - 单元格：显示gate和milestone标签
 * 
 * 📋 设计参考: 用户提供的截图2
 * 
 * @version 1.0.0
 * @date 2026-02-07
 */

import React, { useMemo } from 'react';
import { theme } from 'antd';
import { TimePlan, Line, Timeline } from '@/types/timeplanSchema';
import { format, eachMonthOfInterval, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const { useToken } = theme;

export interface VersionPlanViewProps {
  data: TimePlan;
  onDataChange?: (newData: TimePlan) => void;
  className?: string;
  style?: React.CSSProperties;
}

interface MonthColumn {
  date: Date;
  label: string;
}

interface ProductRow {
  timeline: Timeline;
  gates: Line[];
  milestones: Line[];
}

/**
 * VersionPlanView 组件
 */
export const VersionPlanView: React.FC<VersionPlanViewProps> = ({
  data,
  className,
  style,
}) => {
  const { token } = useToken();

  // 计算时间范围
  const timeRange = useMemo(() => {
    if (!data.lines || data.lines.length === 0) {
      // 默认显示当前年份
      const today = new Date();
      return {
        start: new Date(today.getFullYear(), 0, 1),
        end: new Date(today.getFullYear(), 11, 31),
      };
    }

    // 从所有lines中找出最小和最大日期
    const dates = data.lines
      .map(line => new Date(line.startDate))
      .filter(date => !isNaN(date.getTime()));

    if (dates.length === 0) {
      const today = new Date();
      return {
        start: new Date(today.getFullYear(), 0, 1),
        end: new Date(today.getFullYear(), 11, 31),
      };
    }

    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

    return {
      start: startOfMonth(minDate),
      end: endOfMonth(maxDate),
    };
  }, [data.lines]);

  // 生成月份列
  const monthColumns = useMemo<MonthColumn[]>(() => {
    const months = eachMonthOfInterval({
      start: timeRange.start,
      end: timeRange.end,
    });

    return months.map(date => ({
      date,
      label: format(date, 'yyyy-MM-dd', { locale: zhCN }),
    }));
  }, [timeRange]);

  // 按Timeline分组lines（产品平台行）
  const productRows = useMemo<ProductRow[]>(() => {
    if (!data.timelines || !data.lines) return [];

    return data.timelines.map(timeline => {
      const timelineLines = data.lines.filter(line => line.timelineId === timeline.id);

      const gates = timelineLines.filter(line => line.schemaId === 'gateway-schema');
      const milestones = timelineLines.filter(line => line.schemaId === 'milestone-schema');

      return {
        timeline,
        gates,
        milestones,
      };
    });
  }, [data.timelines, data.lines]);

  // 判断某个line是否在某个月份内
  const isLineInMonth = (line: Line, monthStart: Date): boolean => {
    const lineDate = new Date(line.startDate);
    const monthEnd = endOfMonth(monthStart);
    return isWithinInterval(lineDate, { start: monthStart, end: monthEnd });
  };

  // 布局常量
  const PLATFORM_COL_WIDTH = 200;
  const OWNER_COL_WIDTH = 150;
  const MONTH_COL_WIDTH = 150;
  const ROW_HEIGHT = 60;
  const HEADER_HEIGHT = 48;

  return (
    <div
      className={className}
      style={{
        height: '100%',
        overflow: 'auto',
        background: '#fff',
        ...style,
      }}
    >
      <div style={{ display: 'inline-block', minWidth: '100%' }}>
        {/* Header: 月份标题行 */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            background: '#fff',
            borderBottom: `2px solid ${token.colorBorder}`,
          }}
        >
          <div style={{ display: 'flex', height: HEADER_HEIGHT }}>
            {/* 产品平台标题 */}
            <div
              style={{
                flexShrink: 0,
                width: PLATFORM_COL_WIDTH,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRight: `1px solid ${token.colorBorder}`,
                fontWeight: 600,
                fontSize: 14,
                color: token.colorTextSecondary,
                background: token.colorBgContainer,
                position: 'sticky',
                left: 0,
                zIndex: 11,
              }}
            >
              产品平台
            </div>

            {/* 负责人标题 */}
            <div
              style={{
                flexShrink: 0,
                width: OWNER_COL_WIDTH,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRight: `1px solid ${token.colorBorder}`,
                fontWeight: 600,
                fontSize: 14,
                color: token.colorTextSecondary,
                background: token.colorBgContainer,
              }}
            >
              负责人
            </div>

            {/* 月份列 */}
            {monthColumns.map((month, index) => (
              <div
                key={index}
                style={{
                  flexShrink: 0,
                  width: MONTH_COL_WIDTH,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderLeft: index === 0 ? 'none' : `1px solid ${token.colorBorderSecondary}`,
                  fontWeight: 600,
                  fontSize: 13,
                  color: token.colorText,
                  boxSizing: 'border-box',
                }}
              >
                {month.label}
              </div>
            ))}
          </div>
        </div>

        {/* Body: 产品平台行 */}
        <div>
          {productRows.map((row, rowIndex) => (
            <div
              key={row.timeline.id}
              style={{
                display: 'flex',
                borderBottom: `1px solid ${token.colorBorderSecondary}`,
                minHeight: ROW_HEIGHT,
              }}
            >
              {/* 产品平台名称 */}
              <div
                style={{
                  flexShrink: 0,
                  width: PLATFORM_COL_WIDTH,
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 16px',
                  borderRight: `1px solid ${token.colorBorder}`,
                  fontWeight: 500,
                  fontSize: 14,
                  background: token.colorBgContainer,
                  position: 'sticky',
                  left: 0,
                  zIndex: 1,
                }}
              >
                {row.timeline.title || row.timeline.name}
              </div>

              {/* 负责人 */}
              <div
                style={{
                  flexShrink: 0,
                  width: OWNER_COL_WIDTH,
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 12px',
                  borderRight: `1px solid ${token.colorBorder}`,
                  fontSize: 13,
                  color: token.colorTextSecondary,
                  background: token.colorBgContainer,
                }}
              >
                {row.timeline.owner || row.timeline.description || '-'}
              </div>

              {/* 月份单元格 */}
              {monthColumns.map((month, colIndex) => {
                // 找到该月份内的gates和milestones
                const monthGates = row.gates.filter(gate => isLineInMonth(gate, month.date));
                const monthMilestones = row.milestones.filter(ms => isLineInMonth(ms, month.date));

                return (
                  <div
                    key={colIndex}
                    style={{
                      flexShrink: 0,
                      width: MONTH_COL_WIDTH,
                      padding: '8px',
                      borderLeft: colIndex === 0 ? 'none' : `1px solid ${token.colorBorderSecondary}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxSizing: 'border-box',
                    }}
                  >
                    {/* 显示Milestones */}
                    {monthMilestones.map(ms => (
                      <div
                        key={ms.id}
                        style={{
                          padding: '4px 8px',
                          borderRadius: 4,
                          fontSize: 12,
                          fontWeight: 500,
                          background: '#e6f7ff',
                          color: '#0958d9',
                          border: '1px solid #91d5ff',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '100%',
                        }}
                        title={ms.label}
                      >
                        {ms.label}
                      </div>
                    ))}

                    {/* 显示Gateways */}
                    {monthGates.map(gate => (
                      <div
                        key={gate.id}
                        style={{
                          padding: '4px 8px',
                          borderRadius: 4,
                          fontSize: 12,
                          fontWeight: 500,
                          background: '#fff1e6',
                          color: '#d46b08',
                          border: '1px solid #ffd591',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '100%',
                        }}
                        title={gate.label}
                      >
                        {gate.label}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VersionPlanView;
