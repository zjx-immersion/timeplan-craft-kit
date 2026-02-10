import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { theme } from './theme';
import { initializeDefaultSchemas } from './schemas/schemaRegistry';
import { allTimePlans } from './data/allTimePlans';
import { useTimePlanStoreWithHistory } from './stores/timePlanStoreWithHistory';

// 初始化 Schema Registry
initializeDefaultSchemas();

// 加载所有 TimePlan 数据到 store
console.log('[main] 📥 加载原项目数据...');
console.log('[main] 共有', allTimePlans.length, '个计划');

// 数据版本号 - 当数据结构变化时更新此版本号
const DATA_VERSION = '2.0.1'; // 修复日期序列化问题
const VERSION_KEY = 'timeplan-data-version';

// 检查数据版本
const currentVersion = localStorage.getItem(VERSION_KEY);
const existingData = localStorage.getItem('timeplan-craft-storage-with-history');

if (!existingData || currentVersion !== DATA_VERSION) {
  if (existingData && currentVersion !== DATA_VERSION) {
    console.log('[main] 🔄 数据版本不匹配，清空旧数据');
    console.log('[main] 旧版本:', currentVersion, '→ 新版本:', DATA_VERSION);
    localStorage.removeItem('timeplan-craft-storage-with-history');
  }

  console.log('[main] 🆕 导入所有原项目数据');
  // 导入数据
  useTimePlanStoreWithHistory.getState().setPlans(allTimePlans);
  // 保存版本号
  localStorage.setItem(VERSION_KEY, DATA_VERSION);
  console.log('[main] ✅ 数据导入完成，共', allTimePlans.length, '个计划');
} else {
  console.log('[main] ✅ 从 localStorage 恢复数据');
  const plans = useTimePlanStoreWithHistory.getState().plans;
  console.log('[main] 恢复了', plans.length, '个计划');
}

// 创建 React Query 客户端
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider 
          locale={zhCN} 
          theme={theme}
          modal={{
            // Ant Design 6: 启用遮罩模糊效果（默认）
            mask: {
              blur: true,
            },
          }}
        >
          <AntdApp>
            <App />
          </AntdApp>
        </ConfigProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
