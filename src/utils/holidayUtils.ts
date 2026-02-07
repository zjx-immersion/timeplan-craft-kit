import { isWeekend, format } from 'date-fns';

/**
 * 中国法定节假日 2025-2027
 * 数据来源：国务院办公厅通知
 * 
 * 维护说明：
 * - 每年12月更新下一年度假期安排
 * - 包含调休后的完整假期日期
 */
const CHINESE_HOLIDAYS: string[] = [
  // ===== 2025年 =====
  // 元旦（1月1日）
  '2025-01-01',
  
  // 春节（1月28日-2月4日，共8天）
  '2025-01-28', '2025-01-29', '2025-01-30', '2025-01-31',
  '2025-02-01', '2025-02-02', '2025-02-03', '2025-02-04',
  
  // 清明节（4月4-6日）
  '2025-04-04', '2025-04-05', '2025-04-06',
  
  // 劳动节（5月1-5日）
  '2025-05-01', '2025-05-02', '2025-05-03', '2025-05-04', '2025-05-05',
  
  // 端午节（5月31日-6月2日）
  '2025-05-31', '2025-06-01', '2025-06-02',
  
  // 中秋节（10月6-8日）
  '2025-10-06', '2025-10-07', '2025-10-08',
  
  // 国庆节（10月1-7日）
  '2025-10-01', '2025-10-02', '2025-10-03', '2025-10-04', 
  '2025-10-05', '2025-10-06', '2025-10-07',
  
  // ===== 2026年 =====
  // 元旦（1月1-3日）
  '2026-01-01', '2026-01-02', '2026-01-03',
  
  // 春节（2月17-23日）
  '2026-02-17', '2026-02-18', '2026-02-19', '2026-02-20', 
  '2026-02-21', '2026-02-22', '2026-02-23',
  
  // 清明节（4月5-7日）
  '2026-04-05', '2026-04-06', '2026-04-07',
  
  // 劳动节（5月1-3日）
  '2026-05-01', '2026-05-02', '2026-05-03',
  
  // 端午节（6月19-21日）
  '2026-06-19', '2026-06-20', '2026-06-21',
  
  // 中秋节（9月26-28日）
  '2026-09-26', '2026-09-27', '2026-09-28',
  
  // 国庆节（10月1-7日）
  '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04', 
  '2026-10-05', '2026-10-06', '2026-10-07',
  
  // ===== 2027年（预估，待官方通知） =====
  // 元旦（1月1-3日）
  '2027-01-01', '2027-01-02', '2027-01-03',
  
  // 春节（2月6-12日，预估）
  '2027-02-06', '2027-02-07', '2027-02-08', '2027-02-09',
  '2027-02-10', '2027-02-11', '2027-02-12',
];

/**
 * 判断是否为法定节假日
 * 
 * @param date - 要检查的日期
 * @returns 是否为法定节假日
 * 
 * @example
 * ```typescript
 * isHoliday(new Date('2026-02-03')); // true (春节)
 * isHoliday(new Date('2026-02-04')); // false (工作日)
 * ```
 */
export const isHoliday = (date: Date): boolean => {
  const dateStr = format(date, 'yyyy-MM-dd');
  return CHINESE_HOLIDAYS.includes(dateStr);
};

/**
 * 判断是否为非工作日（周末或节假日）
 * 
 * @param date - 要检查的日期
 * @returns 是否为非工作日
 * 
 * @example
 * ```typescript
 * // 周末
 * isNonWorkingDay(new Date('2026-02-07')); // true (周六)
 * 
 * // 节假日
 * isNonWorkingDay(new Date('2026-02-03')); // true (春节)
 * 
 * // 工作日
 * isNonWorkingDay(new Date('2026-02-05')); // false (周四)
 * ```
 */
export const isNonWorkingDay = (date: Date): boolean => {
  return isWeekend(date) || isHoliday(date);
};

/**
 * 获取日期类型描述
 * 
 * @param date - 要检查的日期
 * @returns 日期类型：'workday' | 'weekend' | 'holiday'
 * 
 * @example
 * ```typescript
 * getDayType(new Date('2026-02-03')); // 'holiday' (春节)
 * getDayType(new Date('2026-02-07')); // 'weekend' (周六)
 * getDayType(new Date('2026-02-05')); // 'workday' (周四)
 * ```
 */
export const getDayType = (date: Date): 'workday' | 'weekend' | 'holiday' => {
  if (isHoliday(date)) return 'holiday';
  if (isWeekend(date)) return 'weekend';
  return 'workday';
};

/**
 * 获取节假日名称（如果是特定节日）
 * 
 * @param date - 要检查的日期
 * @returns 节假日名称或 null
 */
export const getHolidayName = (date: Date): string | null => {
  const dateStr = format(date, 'yyyy-MM-dd');
  const monthDay = format(date, 'MM-dd');
  
  // 固定日期节日
  if (monthDay === '01-01') return '元旦';
  if (monthDay === '05-01') return '劳动节';
  if (monthDay === '10-01') return '国庆节';
  
  // 春节（根据年份判断）
  const year = date.getFullYear();
  if (year === 2025 && dateStr >= '2025-01-28' && dateStr <= '2025-02-04') return '春节';
  if (year === 2026 && dateStr >= '2026-02-17' && dateStr <= '2026-02-23') return '春节';
  if (year === 2027 && dateStr >= '2027-02-06' && dateStr <= '2027-02-12') return '春节';
  
  // 清明节
  if (year === 2025 && dateStr >= '2025-04-04' && dateStr <= '2025-04-06') return '清明节';
  if (year === 2026 && dateStr >= '2026-04-05' && dateStr <= '2026-04-07') return '清明节';
  
  // 端午节
  if (year === 2025 && dateStr >= '2025-05-31' && dateStr <= '2025-06-02') return '端午节';
  if (year === 2026 && dateStr >= '2026-06-19' && dateStr <= '2026-06-21') return '端午节';
  
  // 中秋节
  if (year === 2025 && dateStr >= '2025-10-06' && dateStr <= '2025-10-08') return '中秋节';
  if (year === 2026 && dateStr >= '2026-09-26' && dateStr <= '2026-09-28') return '中秋节';
  
  return null;
};
