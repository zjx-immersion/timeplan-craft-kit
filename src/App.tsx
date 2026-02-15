import { Routes, Route } from 'react-router-dom';
import TimePlanList from './pages/TimePlanList';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import ComponentDemo from './pages/ComponentDemo';
import { Login } from './pages/Login';

/**
 * App - 主应用组件
 * 
 * 路由配置与原项目保持一致
 * Note: AntdApp 已在 main.tsx 中包裹，这里不需要重复
 */
function App() {
  return (
    <Routes>
      <Route path="/" element={<TimePlanList />} />
      <Route path="/login" element={<Login />} />
      <Route path="/:id" element={<Index />} />
      <Route path="/demo/components" element={<ComponentDemo />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
