import { ThemeConfig } from 'antd';

/**
 * Ant Design 主题配置
 * 
 * 目标: 与原项目视觉效果保持一致
 * - 使用 Design Token 替代 Tailwind CSS
 * - 保持颜色、间距、圆角等视觉一致
 */
export const theme: ThemeConfig = {
  token: {
    // ==================== 主色调 ====================
    // 🎨 参考源项目：使用Teal/青蓝色系（更现代、清新）
    colorPrimary: '#14B8A6',      // Teal-500（源项目主色）
    colorPrimaryHover: '#0F9F94',  // Teal-600
    colorPrimaryActive: '#0D9488', // Teal-700
    colorPrimaryBg: 'rgba(20, 184, 166, 0.1)',
    
    colorSuccess: '#52C41A',      // green-500
    colorWarning: '#F59E0B',      // Amber-500（源项目）
    colorError: '#EF4444',        // Red-500（源项目）
    colorInfo: '#14B8A6',         // 与主色一致
    
    // ==================== 背景色系 ====================
    // 📐 参考源项目：使用蓝灰色背景（210 20% 98%）
    colorBgContainer: '#FFFFFF',
    colorBgLayout: '#F8FAFC',     // Slate-50（源项目background）
    colorBgElevated: '#FFFFFF',
    
    // ==================== 文本色系 ====================
    // 📝 参考源项目：Slate色系文本
    colorText: '#1E293B',         // Slate-900（源项目foreground）
    colorTextSecondary: '#64748B', // Slate-500
    colorTextTertiary: '#94A3B8',  // Slate-400
    colorTextQuaternary: '#CBD5E1', // Slate-300
    
    // ==================== 边框色系 ====================
    // 🔲 参考源项目：Slate色系边框
    colorBorder: '#E2E8F0',       // Slate-200（源项目border）
    colorBorderSecondary: '#E8EDF2', // 更浅的蓝灰
    
    // ==================== 字体 ====================
    fontSize: 14,
    fontSizeSM: 12,               // text-xs
    fontSizeHeading1: 32,
    fontSizeHeading2: 24,
    fontSizeHeading3: 20,
    fontSizeHeading4: 16,
    fontSizeHeading5: 14,
    
    // ==================== 圆角 ====================
    // 📐 参考源项目：0.5rem (8px)
    borderRadius: 8,              // 从6px改为8px
    borderRadiusLG: 12,           // 从8px改为12px
    borderRadiusSM: 6,            // 保持6px
    borderRadiusXS: 4,            // 从2px改为4px
    
    // ==================== 间距 ====================
    margin: 16,
    marginXS: 4,              // gap-1
    marginSM: 8,              // gap-2
    marginMD: 16,
    marginLG: 24,
    marginXL: 32,
    marginXXL: 48,
    
    padding: 16,
    paddingXS: 4,             // p-1
    paddingSM: 8,             // p-2
    paddingMD: 12,            // p-3
    paddingLG: 24,
    paddingXL: 32,
    
    // ==================== 阴影 ====================
    // 📦 参考源项目：subtle阴影
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',  // shadow-sm
    boxShadowSecondary: '0 2px 4px rgba(0, 0, 0, 0.1)',  // shadow
  },
  components: {
    // ==================== Button组件 ====================
    // 🔘 参考源项目：更小的按钮尺寸
    Button: {
      controlHeight: 32,
      controlHeightSM: 28,      // h-7（源项目工具栏按钮高度）
      fontSize: 14,
      fontSizeSM: 12,           // text-xs
      paddingContentHorizontal: 12,  // px-3
      borderRadius: 8,          // 与token一致
      primaryColor: '#14B8A6',
      // ✅ 修复：确保按钮文字在Teal背景上清晰可见
      colorText: '#000000',             // 默认按钮文字为黑色
      colorTextLightSolid: '#FFFFFF',   // 亮色实心按钮文字为白色
      colorPrimary: '#14B8A6',          // primary背景色
      colorPrimaryHover: '#0F9F94',     // hover背景色
      colorPrimaryActive: '#0D9488',    // active背景色
      // 关键：primary按钮的文字颜色
      primaryColor: '#14B8A6',
      algorithm: true,                  // 使用算法自动计算文字颜色
    },
    
    // ==================== Input组件 ====================
    Input: {
      controlHeight: 32,
      borderRadius: 8,
    },
    
    // ==================== Select组件 ====================
    Select: {
      controlHeight: 32,
      controlHeightSM: 28,
      borderRadius: 8,
    },
    
    // ==================== DatePicker组件 ====================
    DatePicker: {
      controlHeight: 32,
      borderRadius: 8,
    },
    
    // ==================== Table组件 ====================
    // 📊 参考源项目：浅灰蓝背景
    Table: {
      headerBg: '#F2F5F9',      // timeline-header色
      headerColor: '#1E293B',
      borderColor: '#E2E8F0',
      rowHoverBg: '#F5F8FA',    // timeline-row-hover色
    },
    
    // ==================== Space组件 ====================
    Space: {
      size: 4,                  // gap-1
    },
  },
};
