/**
 * Timeline组件专用颜色
 * 
 * 参考源项目 timeline-craft-kit 的设计系统
 * 使用相同的配色方案以保持视觉一致性
 * 
 * @version 1.0.0
 * @date 2026-02-06
 */

/**
 * Timeline颜色配置
 * 
 * 基于源项目的CSS变量：
 * - --timeline-bar: 187 85% 50%
 * - --timeline-milestone: 43 96% 56%
 * - --timeline-gateway: 271 81% 56%
 * - --timeline-dependency: 187 70% 50%
 * - --timeline-today: 0 84% 60%
 * - --timeline-grid: 210 15% 92%
 * - --timeline-header: 210 15% 96%
 */
export const timelineColors = {
  // ==================== 节点颜色 ====================
  
  /**
   * Bar节点颜色 - Teal/青蓝色
   * 🎨 修复：添加透明度版本，参考源项目
   */
  bar: '#14B8A6',                    // hsl(187, 85%, 50%) - Teal-500
  barTransparent: 'rgba(20, 184, 166, 0.7)',  // ✅ 70%透明度（参考源项目）
  barHover: '#0F9F94',               // hsl(187, 90%, 45%) - Teal-600
  barHoverTransparent: 'rgba(15, 159, 148, 0.8)', // 80%透明度
  barSelected: '#0D9488',            // Teal-600
  barDragging: '#0F766E',            // Teal-700
  
  /**
   * Milestone节点颜色 - 黄色
   */
  milestone: '#FCD34D',     // hsl(43, 96%, 56%) - Yellow-300
  milestoneHover: '#FBBF24', // Yellow-400
  
  /**
   * Gateway节点颜色 - 紫色
   */
  gateway: '#A855F7',       // hsl(271, 81%, 56%) - Purple-500
  gatewayHover: '#9333EA',  // Purple-600
  
  // ==================== 连线颜色 ====================
  
  /**
   * 依赖关系线 - Teal/青蓝色
   */
  dependency: '#14B8A6',    // hsl(187, 70%, 50%)
  dependencyHover: '#0F9F94',
  dependencyCritical: '#EF4444',  // Red-500 - 关键路径
  
  /**
   * 今日线 - 红色
   */
  today: '#F87171',         // hsl(0, 84%, 60%) - Red-400
  todayGlow: 'rgba(248, 113, 113, 0.5)',
  
  // ==================== 背景和网格 ====================
  
  /**
   * 网格线 - 浅灰蓝
   */
  grid: '#E8EDF2',          // hsl(210, 15%, 92%)
  gridSecondary: '#F2F5F9',
  
  /**
   * 时间轴表头背景
   */
  header: '#F2F5F9',        // hsl(210, 15%, 96%)
  headerBorder: '#E2E8F0',
  
  /**
   * Timeline行背景
   */
  rowBackground: '#FFFFFF',
  rowHover: '#F5F8FA',      // hsl(210, 20%, 97%)
  rowSelected: 'rgba(20, 184, 166, 0.05)',
  
  // ==================== 边框和分隔线 ====================
  
  border: '#E2E8F0',        // hsl(214, 20%, 90%) - Slate-200
  borderLight: '#E8EDF2',
  borderDark: '#CBD5E1',    // Slate-300
  
  // ==================== 状态颜色 ====================
  
  /**
   * 选中状态
   */
  selected: '#14B8A6',
  selectedRing: 'rgba(20, 184, 166, 0.2)',
  
  /**
   * 警告/未保存
   */
  warning: '#F59E0B',       // Amber-500
  warningLight: '#FCD34D',
};

/**
 * 阴影配置
 */
export const timelineShadows = {
  // 节点阴影
  nodeSm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  nodeMd: '0 2px 4px rgba(0, 0, 0, 0.1)',
  nodeLg: '0 4px 12px rgba(0, 0, 0, 0.15)',
  
  // 拖拽阴影
  dragging: '0 8px 16px rgba(0, 0, 0, 0.2)',
  
  // 下拉阴影
  dropShadowSm: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))',
  dropShadowMd: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15))',
  
  // 发光效果
  glowTeal: '0 0 8px rgba(20, 184, 166, 0.5)',
  glowRed: '0 0 8px rgba(248, 113, 113, 0.5)',
};

/**
 * 尺寸配置
 */
export const timelineSizes = {
  // 高度
  rowHeight: 120,           // Timeline行高（与源项目一致）
  toolbarHeight: 28,        // 工具栏按钮高度 (h-7)
  iconSize: 14,             // 图标尺寸 (w-3.5 h-3.5)
  
  // 间距
  gap: 4,                   // gap-1
  gapSm: 2,                 // gap-0.5
  gapMd: 8,                 // gap-2
  
  // 内边距
  paddingXs: 4,             // p-1
  paddingSm: 8,             // p-2
  paddingMd: 12,            // p-3
  
  // 圆角
  borderRadius: 8,          // 0.5rem
  borderRadiusSm: 6,        // 0.375rem
  borderRadiusLg: 12,       // 0.75rem
  
  // 字体
  fontSizeXs: 12,           // text-xs
  fontSizeSm: 14,           // text-sm
  fontSizeBase: 16,         // text-base
};

/**
 * 过渡动画配置
 */
export const timelineTransitions = {
  fast: 'all 0.15s ease',
  normal: 'all 0.2s ease',
  slow: 'all 0.3s ease',
  transform: 'transform 0.2s ease',
  opacity: 'opacity 0.2s ease',
  color: 'color 0.2s ease, background-color 0.2s ease',
};

export default {
  colors: timelineColors,
  shadows: timelineShadows,
  sizes: timelineSizes,
  transitions: timelineTransitions,
};
