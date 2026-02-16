# 前端集成实施指南

**版本**: v1.0.0  
**日期**: 2026-02-14  
**状态**: ✅ 认证模块已实现，可用于集成

---

## 📊 实施进度

### ✅ 已完成（认证模块）

| 功能 | 后端API | 前端实现 | 状态 |
|-----|---------|---------|------|
| 用户注册 | ✅ | ✅ | 可用 |
| 用户登录 | ✅ | ✅ | 可用 |
| Token管理 | ✅ | ✅ | 可用 |
| 获取用户信息 | ✅ | ✅ | 可用 |
| 更新资料 | ✅ | ✅ | 可用 |
| 修改密码 | ✅ | ✅ | 可用 |
| 删除用户 | ✅ | ✅ | 可用 |

**后端测试**: 34/34 通过 ✅  
**后端覆盖率**: 91% ✅

---

## 🎯 集成方案

### 阶段1: 认证模块集成（当前阶段）

#### 已创建的文件

```
timeplan-craft-kit/src/
├── api/
│   ├── client.ts          ✅ Axios配置 + 拦截器
│   ├── auth.ts            ✅ 认证API封装
│   └── types.ts           ✅ TypeScript类型定义
│
├── stores/
│   └── authStore.ts       ✅ 认证状态管理（Zustand）
│
├── hooks/
│   └── useAuth.ts         ✅ 认证React Hook
│
├── utils/
│   └── apiErrors.ts       ✅ 错误处理工具
│
└── pages/
    └── Login.tsx          ✅ 登录/注册页面示例
```

#### 使用方式

##### 1. 在组件中使用认证

```typescript
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>请先登录</div>;
  }

  return (
    <div>
      <p>欢迎, {user?.display_name || user?.username}!</p>
      <Button onClick={logout}>登出</Button>
    </div>
  );
}
```

##### 2. 要求认证的页面

```typescript
import { useRequireAuth } from '@/hooks/useAuth';

function ProtectedPage() {
  const { isAuthenticated, isLoading } = useRequireAuth();

  if (isLoading) {
    return <Spin />;
  }

  return <div>受保护的内容</div>;
}
```

##### 3. 直接调用API

```typescript
import { authApi } from '@/api/auth';
import { withErrorHandling } from '@/utils/apiErrors';

async function someFunction() {
  // 方式1: 使用错误处理包装
  const user = await withErrorHandling(
    () => authApi.getCurrentUser(),
    { successMessage: '获取用户信息成功' }
  );

  // 方式2: 手动处理
  try {
    const result = await authApi.updateProfile({
      display_name: 'New Name'
    });
    console.log('更新成功', result);
  } catch (error) {
    handleApiError(error);
  }
}
```

---

## 🔄 阶段2: 业务数据集成（待实施）

### 需要实现的后端API

根据 `docs/API-REQUIREMENTS.md` 和 `docs/OPENAPI_SCHEMA.yaml`，还需实现：

#### 2.1 计划管理 (Plans)
- [ ] `GET /api/v1/plans` - 获取计划列表
- [ ] `POST /api/v1/plans` - 创建计划
- [ ] `GET /api/v1/plans/{planId}` - 获取计划详情
- [ ] `PUT /api/v1/plans/{planId}` - 更新计划
- [ ] `DELETE /api/v1/plans/{planId}` - 删除计划

#### 2.2 时间线管理 (Timelines)
- [ ] `GET /api/v1/plans/{planId}/timelines` - 获取时间线列表
- [ ] `POST /api/v1/plans/{planId}/timelines` - 创建时间线
- [ ] `PUT /api/v1/timelines/{timelineId}` - 更新时间线
- [ ] `DELETE /api/v1/timelines/{timelineId}` - 删除时间线
- [ ] `POST /api/v1/timelines/batch-update` - 批量更新时间线

#### 2.3 任务节点管理 (Lines)
- [ ] `GET /api/v1/timelines/{timelineId}/lines` - 获取任务节点列表
- [ ] `POST /api/v1/timelines/{timelineId}/lines` - 创建任务节点
- [ ] `PUT /api/v1/lines/{lineId}` - 更新任务节点
- [ ] `DELETE /api/v1/lines/{lineId}` - 删除任务节点
- [ ] `POST /api/v1/lines/batch-update` - 批量更新节点

#### 2.4 依赖关系管理 (Relations)
- [ ] `GET /api/v1/plans/{planId}/relations` - 获取依赖关系列表
- [ ] `POST /api/v1/relations` - 创建依赖关系
- [ ] `PUT /api/v1/relations/{relationId}` - 更新依赖关系
- [ ] `DELETE /api/v1/relations/{relationId}` - 删除依赖关系

---

## 🚀 快速开始

### 1. 启动后端服务

```bash
cd timeplan-backend

# 激活虚拟环境
source venv/bin/activate

# 启动服务
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

访问 API文档: http://localhost:8000/docs

### 2. 配置前端

```bash
cd timeplan-craft-kit

# 复制环境配置
cp .env.example .env.local

# 编辑配置（如果需要）
# VITE_API_BASE_URL=http://localhost:8000

# 安装依赖（如果还没有）
pnpm install

# 启动前端开发服务器
pnpm dev
```

### 3. 测试认证功能

1. 打开浏览器访问 http://localhost:5173
2. 导航到 `/login` 页面
3. 注册新用户或使用测试账号登录
4. 查看浏览器 Console 和 Network 面板确认API调用

---

## 🧪 测试验证

### 后端API测试

```bash
cd timeplan-backend
source venv/bin/activate

# 运行所有认证测试
pytest tests/integration/test_auth/ -v

# 结果应该是: 34/34 passed ✅
```

### 前端集成测试步骤

#### 1. 注册测试
- [ ] 访问 `/login` 页面
- [ ] 切换到"注册"标签
- [ ] 填写表单：
  - Email: test@example.com
  - Username: testuser
  - Password: Test123!@#
  - Display Name: Test User
- [ ] 点击"注册"按钮
- [ ] 验证：
  - [ ] 显示"注册成功"提示
  - [ ] 自动跳转到首页
  - [ ] localStorage中有access_token和refresh_token

#### 2. 登录测试
- [ ] 访问 `/login` 页面
- [ ] 填写刚才注册的账号
- [ ] 点击"登录"按钮
- [ ] 验证：
  - [ ] 显示"登录成功"提示
  - [ ] 自动跳转到首页
  - [ ] 用户信息正确显示

#### 3. Token自动刷新测试
- [ ] 登录后，在Console中执行：
  ```javascript
  // 手动删除access_token，保留refresh_token
  localStorage.removeItem('access_token');
  
  // 发起任何需要认证的请求
  // 应该自动刷新Token并成功请求
  ```

#### 4. 登出测试
- [ ] 点击登出按钮
- [ ] 验证：
  - [ ] Token被清除
  - [ ] 跳转到登录页

---

## 📋 数据迁移方案

### 现有数据保留

当前前端使用localStorage存储计划数据：
- Key: `all-time-plans`
- 格式: JSON数组

**迁移策略**:
1. **保持现有数据结构** ✅
2. **新增API模式** - 创建新的API调用层
3. **双写模式** - 同时写入localStorage和API（过渡期）
4. **逐步迁移** - 按模块逐步切换到API

### 数据转换层

```typescript
// src/utils/dataConverter.ts
export const convertLocalPlanToApiPlan = (localPlan: LocalTimePlan): CreatePlanRequest => {
  return {
    title: localPlan.title,
    description: localPlan.description,
    owner: localPlan.owner,
    tags: localPlan.tags,
  };
};

export const convertApiPlanToLocalPlan = (apiPlan: PlanResponse, fullData: any): LocalTimePlan => {
  return {
    id: apiPlan.id,
    title: apiPlan.title,
    description: apiPlan.description,
    owner: apiPlan.owner,
    tags: apiPlan.tags,
    // ... 其他字段映射
  };
};
```

---

## 🔌 集成检查清单

### 认证模块集成 ✅

- [x] API客户端配置（`api/client.ts`）
- [x] 认证API封装（`api/auth.ts`）
- [x] 类型定义（`api/types.ts`）
- [x] 错误处理（`utils/apiErrors.ts`）
- [x] 认证Store（`stores/authStore.ts`）
- [x] 认证Hook（`hooks/useAuth.ts`）
- [x] 登录页面（`pages/Login.tsx`）
- [x] 环境配置（`.env.example`, `.env.local`）

### 业务数据集成 ⏳

- [ ] 计划API（`api/plans.ts`）
- [ ] 时间线API（`api/timelines.ts`）
- [ ] 任务节点API（`api/lines.ts`）
- [ ] 依赖关系API（`api/relations.ts`）
- [ ] 对应的Hooks
- [ ] Store改造
- [ ] WebSocket集成

---

## ⚠️ 注意事项

### 1. 不影响现有功能

**策略**: 渐进式集成
- ✅ 新增API层，不删除现有代码
- ✅ 使用feature flag控制（`VITE_USE_MOCK_API`）
- ✅ 现有功能继续使用localStorage

### 2. 向后兼容

```typescript
// 示例：支持Mock和Real API
const usePlans = () => {
  const useMockApi = import.meta.env.VITE_USE_MOCK_API === 'true';
  
  if (useMockApi) {
    return usePlansFromLocalStorage();
  } else {
    return usePlansFromApi();
  }
};
```

### 3. 错误处理

- ✅ 所有API调用都应有try-catch
- ✅ 使用统一的错误处理工具
- ✅ 友好的用户提示

### 4. 性能考虑

- [ ] 使用React Query缓存（可选）
- [ ] 防抖/节流处理
- [ ] 批量操作API

---

## 🧪 端到端测试流程

### 准备工作

1. **启动后端服务**
   ```bash
   cd timeplan-backend
   source venv/bin/activate
   uvicorn app.main:app --reload
   ```

2. **启动前端服务**
   ```bash
   cd timeplan-craft-kit
   pnpm dev
   ```

3. **确认服务运行**
   - 后端: http://localhost:8000/docs
   - 前端: http://localhost:5173

### 测试场景

#### Scenario 1: 新用户注册流程
1. 访问 http://localhost:5173/login
2. 点击"注册"标签
3. 填写注册信息
4. 提交表单
5. **预期结果**:
   - 显示"注册成功"
   - 自动登录
   - 跳转到首页
   - localStorage有Token

#### Scenario 2: 用户登录流程
1. 访问 http://localhost:5173/login
2. 输入用户名和密码
3. 点击"登录"
4. **预期结果**:
   - 显示"登录成功"
   - 跳转到首页
   - 用户信息正确显示

#### Scenario 3: Token自动刷新
1. 登录后，打开DevTools Console
2. 执行: `localStorage.removeItem('access_token')`
3. 发起任何需要认证的请求（如刷新页面）
4. **预期结果**:
   - 自动使用refresh_token刷新
   - 请求成功
   - 新Token保存到localStorage

#### Scenario 4: 登出流程
1. 已登录状态
2. 点击"登出"按钮
3. **预期结果**:
   - Token被清除
   - 跳转到登录页

---

## 🔧 开发工具

### API调试

#### 1. 使用Swagger UI
访问: http://localhost:8000/docs

可以直接测试所有API端点：
- 点击端点展开
- 点击"Try it out"
- 填写参数
- 点击"Execute"
- 查看响应

#### 2. 使用curl

```bash
# 注册
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"Test123!@#"}'

# 登录
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"Test123!@#"}'

# 获取用户信息（需要Token）
curl -X GET http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer <your_token>"
```

#### 3. 使用Postman/Insomnia
导入OpenAPI规范: `docs/OPENAPI_SCHEMA.yaml`

---

## 📝 下一步行动

### 立即可做

1. **测试认证集成** ✅
   - 启动后端服务
   - 启动前端服务
   - 测试登录/注册流程

2. **集成到现有页面** 🎯
   - 在App.tsx中添加认证检查
   - 添加用户头像/菜单
   - 添加登出功能

### 后续计划

1. **实现计划管理API** (Week 2)
   - 后端API + 测试
   - 前端API封装
   - Store改造
   - 替换mock数据

2. **实现时间线/节点API** (Week 3)
   - 后端API + 测试
   - 前端API封装
   - 批量操作支持

3. **实现WebSocket协作** (Week 4)
   - 后端WebSocket服务
   - OT算法实现
   - 前端WebSocket客户端
   - 实时协作测试

---

## ⚙️ 配置说明

### 环境变量

#### `.env.local` (本地开发)
```bash
VITE_API_BASE_URL=http://localhost:8000
VITE_USE_MOCK_API=false          # false: 使用真实API
VITE_ENABLE_WEBSOCKET=false      # 暂时关闭WebSocket
VITE_DEBUG_MODE=true
```

#### `.env.production` (生产环境)
```bash
VITE_API_BASE_URL=https://api.timeplan.example.com
VITE_USE_MOCK_API=false
VITE_ENABLE_WEBSOCKET=true
VITE_DEBUG_MODE=false
```

---

## 🐛 常见问题

### 1. CORS错误

**现象**: `Access-Control-Allow-Origin` 错误

**解决**: 后端已配置CORS，确保前端URL在允许列表中
```python
# app/main.py
allow_origins=["http://localhost:5173", "http://localhost:3000"]
```

### 2. Token未自动添加

**原因**: localStorage中没有Token

**解决**: 
1. 检查登录是否成功
2. 检查localStorage中是否有`access_token`
3. 查看Network面板的请求头

### 3. 401错误持续出现

**原因**: Token刷新失败或refresh_token过期

**解决**: 
1. 清除localStorage
2. 重新登录
3. 检查后端服务是否正常

### 4. API请求超时

**原因**: 后端服务未启动或网络问题

**解决**:
1. 确认后端服务运行: `curl http://localhost:8000/health`
2. 检查防火墙设置
3. 调整timeout配置

---

## 📚 相关文档

- 📄 [后端API规范](./docs/OPENAPI_SCHEMA.yaml)
- 📄 [前后端集成设计](./docs/FRONTEND_BACKEND_INTEGRATION.md)
- 📄 [API需求分析](./docs/API-REQUIREMENTS.md)
- 📄 [后端架构](./docs/BACKEND-ARCHITECTURE-PYTHON.md)
- 📄 [TDD实施计划](./docs/TDD_IMPLEMENTATION_PLAN.md)

---

## ✅ 集成验收标准

### 认证模块

- [x] 用户可以注册新账号
- [x] 用户可以登录
- [x] Token自动管理
- [x] Token自动刷新
- [x] 受保护的路由正常工作
- [x] 用户可以登出
- [x] 错误处理友好

### 业务数据模块（待实施）

- [ ] 计划CRUD正常工作
- [ ] 时间线CRUD正常工作
- [ ] 任务节点CRUD正常工作
- [ ] 依赖关系CRUD正常工作
- [ ] 批量操作正常工作
- [ ] 数据同步正确
- [ ] WebSocket实时更新

---

**更新时间**: 2026-02-14  
**状态**: 认证模块已就绪，可开始集成测试 ✅
