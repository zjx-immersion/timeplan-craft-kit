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
    // 主色调
    colorPrimary: '#1890FF', // blue-500
    colorSuccess: '#52C41A', // green-500
    colorWarning: '#FAAD14', // yellow-500
    colorError: '#FF4D4F', // red-500
    colorInfo: '#1890FF',
    
    // 字体
    fontSize: 14,
    fontSizeHeading1: 32,
    fontSizeHeading2: 24,
    fontSizeHeading3: 20,
    fontSizeHeading4: 16,
    fontSizeHeading5: 14,
    
    // 圆角
    borderRadius: 6,
    borderRadiusLG: 8,
    borderRadiusSM: 4,
    borderRadiusXS: 2,
    
    // 间距
    margin: 16,
    marginXS: 8,
    marginSM: 12,
    marginMD: 16,
    marginLG: 24,
    marginXL: 32,
    marginXXL: 48,
    
    padding: 16,
    paddingXS: 8,
    paddingSM: 12,
    paddingMD: 16,
    paddingLG: 24,
    paddingXL: 32,
    
    // 阴影
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
    boxShadowSecondary: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
  components: {
    Button: {
      controlHeight: 32,
      fontSize: 14,
    },
    Input: {
      controlHeight: 32,
    },
    Select: {
      controlHeight: 32,
    },
    DatePicker: {
      controlHeight: 32,
    },
    Table: {
      headerBg: '#FAFAFA',
    },
  },
};
