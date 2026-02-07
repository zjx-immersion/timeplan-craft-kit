import { Routes, Route } from 'react-router-dom';
import { App as AntdApp } from 'antd';
import TimePlanList from './pages/TimePlanList';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import ComponentDemo from './pages/ComponentDemo';

/**
 * App - 主应用组件
 * 
 * 路由配置与原项目保持一致
 */
function App() {
  return (
    <AntdApp>
      <Routes>
        <Route path="/" element={<TimePlanList />} />
        <Route path="/:id" element={<Index />} />
        <Route path="/demo/components" element={<ComponentDemo />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AntdApp>
  );
}

export default App;
