/**
 * DatePicker - 日期选择器组件
 * 
 * 📋 迁移信息:
 * - 原文件: src/components/ui/calendar.tsx (Shadcn UI + Radix Popover)
 * - 迁移日期: 2026-02-03
 * - 对比状态: ⬜ 待验证
 * 
 * 🎯 功能要求:
 * - 封装 Ant Design DatePicker
 * - 提供统一的 API
 * - 支持日期、日期范围、时间选择
 * 
 * 🔄 技术替换:
 * - Shadcn Calendar + Popover → Ant DatePicker
 * - react-day-picker → Ant DatePicker 内置日历
 */

import React from 'react';
import {
  DatePicker as AntDatePicker,
  DatePickerProps as AntDatePickerProps,
} from 'antd';
import type { RangePickerProps as AntRangePickerProps } from 'antd/es/date-picker';
import type { Dayjs } from 'dayjs';

/**
 * 扩展的日期选择器属性
 */
export interface DatePickerProps extends AntDatePickerProps {
  /**
   * 占位符
   */
  placeholder?: string;
  
  /**
   * 日期格式
   */
  format?: string;
  
  /**
   * 选择器尺寸
   */
  size?: 'small' | 'middle' | 'large';
  
  /**
   * 是否禁用
   */
  disabled?: boolean;
  
  /**
   * 是否允许清空
   */
  allowClear?: boolean;
  
  /**
   * 选中的日期
   */
  value?: Dayjs | null;
  
  /**
   * 日期变化时的回调
   */
  onChange?: (date: Dayjs | null, dateString: string | string[]) => void;
  
  /**
   * 不可选择的日期
   */
  disabledDate?: (currentDate: Dayjs) => boolean;
}

/**
 * 日期范围选择器属性
 */
export interface RangePickerProps extends AntRangePickerProps {
  /**
   * 占位符
   */
  placeholder?: [string, string];
  
  /**
   * 日期格式
   */
  format?: string;
  
  /**
   * 选择器尺寸
   */
  size?: 'small' | 'middle' | 'large';
  
  /**
   * 选中的日期范围
   */
  value?: [Dayjs | null, Dayjs | null] | null;
  
  /**
   * 日期范围变化时的回调
   */
  onChange?: (
    dates: [Dayjs | null, Dayjs | null] | null,
    dateStrings: [string, string]
  ) => void;
}

/**
 * 通用日期选择器组件
 * 
 * @example
 * ```tsx
 * import dayjs from 'dayjs';
 * 
 * // 基础日期选择
 * <DatePicker
 *   placeholder="选择日期"
 *   onChange={(date) => console.log(date)}
 * />
 * 
 * // 带时间的日期选择
 * <DatePicker
 *   showTime
 *   format="YYYY-MM-DD HH:mm:ss"
 *   placeholder="选择日期时间"
 * />
 * 
 * // 日期范围选择
 * <DatePicker.RangePicker
 *   placeholder={['开始日期', '结束日期']}
 *   onChange={(dates) => console.log(dates)}
 * />
 * 
 * // 禁用特定日期
 * <DatePicker
 *   disabledDate={(current) => {
 *     return current && current < dayjs().startOf('day');
 *   }}
 * />
 * ```
 */
export const DatePicker: React.FC<DatePickerProps> & {
  RangePicker: React.FC<RangePickerProps>;
  TimePicker: typeof AntDatePicker.TimePicker;
  MonthPicker: React.FC<DatePickerProps>;
  YearPicker: React.FC<DatePickerProps>;
  WeekPicker: React.FC<DatePickerProps>;
  QuarterPicker: React.FC<DatePickerProps>;
} = (props) => {
  return <AntDatePicker {...props} />;
};

DatePicker.displayName = 'DatePicker';

/**
 * 日期范围选择器
 */
const RangePicker: React.FC<RangePickerProps> = (props) => {
  return <AntDatePicker.RangePicker {...props} />;
};

RangePicker.displayName = 'DatePicker.RangePicker';

/**
 * 时间选择器
 */
const TimePicker = AntDatePicker.TimePicker;

/**
 * 月份选择器
 */
const MonthPicker: React.FC<DatePickerProps> = (props) => {
  return <AntDatePicker picker="month" {...props} />;
};

MonthPicker.displayName = 'DatePicker.MonthPicker';

/**
 * 年份选择器
 */
const YearPicker: React.FC<DatePickerProps> = (props) => {
  return <AntDatePicker picker="year" {...props} />;
};

YearPicker.displayName = 'DatePicker.YearPicker';

/**
 * 周选择器
 */
const WeekPicker: React.FC<DatePickerProps> = (props) => {
  return <AntDatePicker picker="week" {...props} />;
};

WeekPicker.displayName = 'DatePicker.WeekPicker';

/**
 * 季度选择器
 */
const QuarterPicker: React.FC<DatePickerProps> = (props) => {
  return <AntDatePicker picker="quarter" {...props} />;
};

QuarterPicker.displayName = 'DatePicker.QuarterPicker';

// 添加子组件
DatePicker.RangePicker = RangePicker;
DatePicker.TimePicker = TimePicker;
DatePicker.MonthPicker = MonthPicker;
DatePicker.YearPicker = YearPicker;
DatePicker.WeekPicker = WeekPicker;
DatePicker.QuarterPicker = QuarterPicker;

export default DatePicker;
