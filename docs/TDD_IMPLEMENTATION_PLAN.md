# TDD实施计划 - TimePlan Craft Kit

**版本**: v1.0.0  
**日期**: 2026-02-14  
**方法**: Test-Driven Development (红-绿-重构)  
**状态**: 📋 准备启动

---

## 📋 目录

1. [TDD原则](#tdd原则)
2. [实施流程](#实施流程)
3. [Week-by-Week计划](#week-by-week计划)
4. [前后端集成策略](#前后端集成策略)
5. [验收标准](#验收标准)

---

## 🎯 TDD原则

### 核心规则

1. **先写测试，后写代码**
   - 不允许在没有测试的情况下写生产代码
   - 测试先行驱动设计

2. **小步快跑**
   - 每次实现一个小功能
   - 频繁运行测试
   - 快速反馈

3. **红-绿-重构循环**
   - 🔴 **Red**: 编写失败的测试
   - 🟢 **Green**: 实现最小可用代码
   - 🔵 **Refactor**: 重构优化

4. **保持测试独立**
   - 每个测试独立运行
   - 不依赖其他测试
   - 可以任意顺序执行

---

## 🔄 实施流程

### 单个功能的TDD循环

```
1️⃣ 编写API测试 (Red)
   ├─ 参考OpenAPI规范
   ├─ 编写测试用例
   ├─ 运行测试 → 失败（预期）
   └─ Commit: "test: add XXX API tests"

2️⃣ 实现后端代码 (Green)
   ├─ 编写Python代码（FastAPI + SQLAlchemy）
   ├─ 实现最小功能
   ├─ 运行测试 → 通过
   └─ Commit: "feat: implement XXX API"

3️⃣ 重构优化 (Refactor)
   ├─ 优化代码结构
   ├─ 提取公共逻辑
   ├─ 运行测试 → 保持通过
   └─ Commit: "refactor: optimize XXX"

4️⃣ 前端集成
   ├─ 创建API客户端
   ├─ 替换Mock数据
   ├─ 端到端测试
   └─ Commit: "feat: integrate XXX in frontend"

5️⃣ 回归测试
   ├─ 运行所有测试
   ├─ 确保无破坏
   └─ ✅ 功能完成
```

---

## 📅 Week-by-Week计划

### Week 1: 认证模块 (2026-02-17 ~ 2026-02-21)

#### Day 1-2: 测试先行 🔴

**上午: 编写测试用例**
```python
# api-tests/test_auth/test_register.py
def test_register_success():
    """测试: 成功注册"""
    response = await client.post("/api/v1/auth/register", json={
        "email": "test@example.com",
        "username": "testuser",
        "password": "Test123!@#"
    })
    assert response.status_code == 201

# 其他5个测试用例...
```

**下午: 完善测试**
- test_login.py (6个用例)
- test_refresh_token.py (4个用例)
- test_logout.py (3个用例)

**验证**: 运行 `pytest test_auth/` → 所有测试失败 ✓

#### Day 3-4: 实现代码 🟢

**第3天上午: 项目初始化**
```bash
# 创建backend项目
cd timeplan-backend
poetry init
poetry add fastapi uvicorn sqlalchemy asyncpg

# 项目结构
mkdir -p app/{api/v1,models,schemas,services,core}
```

**第3天下午: 实现数据模型**
```python
# app/models/user.py
class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True)
    email = Column(String, unique=True)
    username = Column(String, unique=True)
    hashed_password = Column(String)
    # ...
```

**第4天上午: 实现API路由**
```python
# app/api/v1/auth.py
@router.post("/register")
async def register(user_data: RegisterRequest):
    # 实现注册逻辑
    pass
```

**第4天下午: 完善认证**
- JWT Token生成
- 密码加密 (bcrypt)
- 登录逻辑
- Token刷新

**验证**: 运行 `pytest test_auth/` → 所有测试通过 ✅

#### Day 5: 重构 + 集成 🔵

**上午: 重构后端**
- 提取Service层
- 优化错误处理
- 添加日志

**下午: 前端集成**
```typescript
// src/api/auth.ts
export const authApi = {
  register: (data) => api.post('/api/v1/auth/register', data),
  login: (data) => api.post('/api/v1/auth/login', data),
  // ...
};

// 替换Mock数据
// useAuth.ts: 使用真实API
```

**验收**: 
- ✅ 后端测试全部通过
- ✅ 前端登录注册功能正常
- ✅ Token存储和刷新正常

---

### Week 2: 计划管理 (2026-02-24 ~ 2026-02-28)

#### Day 1: 测试 🔴
```python
# test_plans/test_create_plan.py (5个用例)
# test_plans/test_list_plans.py (4个用例)
# test_plans/test_get_plan.py (3个用例)
# test_plans/test_update_plan.py (4个用例)
# test_plans/test_delete_plan.py (3个用例)
# test_plans/test_permissions.py (6个用例)

总计: 25个测试用例
```

#### Day 2-3: 实现 🟢
```python
# app/models/time_plan.py
class TimePlan(Base):
    __tablename__ = "time_plans"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    # ...

# app/services/time_plan_service.py
class TimePlanService:
    def create_plan(self, data, user):
        # 实现
    def list_plans(self, user, filters):
        # 实现
    # ...
```

#### Day 4: 重构 🔵
- 抽取Repository层
- 优化查询性能
- 添加缓存

#### Day 5: 集成 + 测试
```typescript
// src/hooks/usePlans.ts
export function usePlans() {
  const loadPlan = async (planId) => {
    const plan = await plansApi.get(planId);
    setCurrentPlan(transformPlan(plan));
  };
  // ...
}
```

**验收**:
- ✅ 25个测试全部通过
- ✅ 计划CRUD功能完整
- ✅ 权限控制正常

---

### Week 3-4: 任务节点 + 依赖关系 (2026-03-03 ~ 2026-03-14)

#### Week 3: Line CRUD + 批量操作

**Day 1-2: 测试** 🔴
```python
# test_lines/ (35个测试用例)
test_create_line.py (5个)
test_list_lines.py (6个)
test_update_line.py (5个)
test_delete_line.py (4个)
test_batch_create.py (5个)
test_batch_update.py (7个)
test_line_validation.py (3个)
```

**Day 3-4: 实现** 🟢
```python
# app/models/line.py
class Line(Base):
    __tablename__ = "lines"
    id = Column(String, primary_key=True)
    timeline_id = Column(String, ForeignKey("timelines.id"))
    schema_id = Column(String)
    label = Column(String)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    attributes = Column(JSON)
    # ...

# app/services/line_service.py
class LineService:
    async def create_line(self, plan_id, data):
        # 事务处理
        async with db.begin():
            line = Line(**data)
            db.add(line)
        return line
    
    async def batch_update(self, plan_id, line_ids, updates):
        # 批量更新（事务）
        async with db.begin():
            lines = await db.execute(
                update(Line)
                .where(Line.id.in_(line_ids))
                .values(**updates)
            )
        return lines
```

**Day 5: 重构 + 集成** 🔵
- 优化批量操作性能
- 前端集成Line CRUD
- 测试拖拽创建Line

#### Week 4: Relation + 验证

**Day 1-2: 测试** 🔴
```python
# test_relations/ (20个测试用例)
test_create_relation.py (5个)
test_delete_relation.py (3个)
test_validate_circular.py (8个) ⭐ 重点
test_critical_path.py (4个)
```

**Day 3-4: 实现** 🟢
```python
# app/utils/graph_validator.py
class GraphValidator:
    """图验证器（检测循环依赖）"""
    
    def has_cycle(self, relations: List[Relation]) -> bool:
        """DFS检测循环"""
        graph = self._build_graph(relations)
        visited = set()
        rec_stack = set()
        
        for node in graph:
            if self._has_cycle_util(node, visited, rec_stack, graph):
                return True
        return False
    
    def _has_cycle_util(self, node, visited, rec_stack, graph):
        visited.add(node)
        rec_stack.add(node)
        
        for neighbor in graph.get(node, []):
            if neighbor not in visited:
                if self._has_cycle_util(neighbor, visited, rec_stack, graph):
                    return True
            elif neighbor in rec_stack:
                return True  # 发现循环
        
        rec_stack.remove(node)
        return False

# app/services/relation_service.py
class RelationService:
    async def create_relation(self, plan_id, data):
        # 获取现有关系
        existing = await self.repo.get_all(plan_id)
        
        # 验证循环依赖
        validator = GraphValidator()
        if validator.has_cycle(existing + [data]):
            raise ValidationError("会形成循环依赖")
        
        # 创建
        return await self.repo.create(data)
```

**Day 5: 集成 + 测试** 🔵
- 前端集成依赖关系
- 可视化依赖线
- 测试循环检测

**验收**:
- ✅ 55个测试全部通过
- ✅ Line CRUD + 批量操作完整
- ✅ Relation创建 + 循环检测正常
- ✅ 前端连线功能正常

---

### Week 5-6: WebSocket + OT算法 (2026-03-17 ~ 2026-03-28)

#### Week 5: WebSocket基础

**Day 1-2: 测试** 🔴
```python
# test_websocket/ (15个测试用例)
test_connection.py (3个)
test_join_plan.py (3个)
test_send_operation.py (4个)
test_receive_operation.py (5个)
```

**Day 3-4: 实现** 🟢
```python
# app/api/websocket/collaboration.py
import socketio

sio = socketio.AsyncServer(async_mode='asgi')

@sio.event
async def connect(sid, environ, auth):
    token = auth.get('token')
    user = await verify_token(token)
    async with sio.session(sid) as session:
        session['user_id'] = user.id

@sio.event
async def join_plan(sid, data):
    plan_id = data['plan_id']
    sio.enter_room(sid, plan_id)
    await sio.emit('user_joined', {...}, room=plan_id)

@sio.event
async def operation(sid, data):
    plan_id = data['plan_id']
    operation = data['operation']
    
    # 广播给其他用户
    await sio.emit('operation', operation, room=plan_id, skip_sid=sid)
```

**Day 5: 集成** 🔵
```typescript
// src/api/websocket.ts
export class WebSocketClient {
  connect(planId: string, token: string) {
    this.socket = io(WS_URL, { auth: { token } });
    this.socket.emit('join_plan', { plan_id: planId });
  }
  
  sendOperation(op: Operation) {
    this.socket.emit('operation', { plan_id: this.planId, operation: op });
  }
  
  onOperation(callback: (op: Operation) => void) {
    this.socket.on('operation', (data) => callback(data.operation));
  }
}
```

#### Week 6: OT算法

**Day 1-2: 测试** 🔴
```python
# test_websocket/test_ot_algorithm.py (20个测试用例)
test_transform_concurrent_updates (5个)
test_transform_conflict_resolution (6个)
test_version_tracking (4个)
test_operation_history (5个)
```

**Day 3-4: 实现** 🟢
```python
# app/utils/ot_algorithm.py
class OTEngine:
    """Operational Transformation引擎"""
    
    async def apply_operation(self, op: Operation) -> Operation:
        # 版本检查
        if op.version < self.version:
            op = await self._transform_operation(op)
        
        # 应用操作
        self.version += 1
        op.version = self.version
        
        # 记录历史
        self.history.append(op)
        
        # 持久化
        await self._persist(op)
        
        return op
    
    async def _transform_operation(self, op: Operation) -> Operation:
        """转换操作（OT核心）"""
        concurrent_ops = [
            h for h in self.history 
            if h.version > op.version
        ]
        
        for concurrent_op in concurrent_ops:
            op = self._transform(op, concurrent_op)
        
        return op
    
    def _transform(self, op1: Operation, op2: Operation) -> Operation:
        """转换两个操作"""
        # 检查路径冲突
        if not self._is_conflicting(op1.path, op2.path):
            return op1
        
        # 相同路径冲突处理
        if op1.path == op2.path:
            if op1.type == 'update' and op2.type == 'update':
                # Last Write Wins
                return op1
            elif op1.type == 'delete':
                # 删除优先
                return op1
        
        return op1
```

**Day 5: 集成 + 测试** 🔵
```typescript
// src/hooks/useCollaboration.ts
export function useCollaboration(planId: string) {
  const ws = useWebSocket(planId);
  
  useEffect(() => {
    ws.onOperation((op) => {
      // 应用远程操作到本地
      applyRemoteOperation(op);
    });
  }, [ws]);
  
  const localUpdate = (path: string[], value: any) => {
    // 本地乐观更新
    applyLocalUpdate(path, value);
    
    // 发送操作到服务器
    const op = {
      id: generateId(),
      client_id: clientId,
      type: 'update',
      path,
      value,
      version: currentVersion
    };
    ws.sendOperation(op);
  };
  
  return { localUpdate };
}
```

**验收**:
- ✅ 35个测试全部通过
- ✅ WebSocket连接稳定
- ✅ OT算法正确
- ✅ 多人同时编辑正常
- ✅ 冲突自动解决

---

### Week 7-8: 完善 + 部署 (2026-03-31 ~ 2026-04-11)

#### Week 7: 补充功能

**Day 1-3: Baseline + 导出**
- Baseline快照 (10个测试)
- 导出功能 (8个测试)
- Celery异步任务

**Day 4-5: 搜索 + 统计**
- 全文搜索 (6个测试)
- 统计分析API (4个测试)

#### Week 8: 测试 + 部署

**Day 1-2: 性能测试**
- 负载测试 (100并发用户)
- 压力测试 (1000个Line)
- 优化慢查询

**Day 3-4: 安全测试**
- SQL注入测试
- XSS测试
- CSRF防护
- 权限边界测试

**Day 5: 部署上线**
```bash
# Docker构建
docker build -t timeplan-backend:v1.0.0 .

# 部署到测试环境
kubectl apply -f k8s/deployment.yaml

# 健康检查
curl https://api-dev.timeplan.example.com/health
```

---

## 🎯 前后端集成策略

### 小批量集成原则

1. **认证先行** (Week 1)
   - 后端: 完成认证API
   - 前端: 替换登录/注册Mock
   - 验证: 端到端登录流程

2. **核心CRUD** (Week 2-3)
   - 后端: Plan + Line CRUD
   - 前端: 逐个替换API调用
   - 验证: 每个功能独立测试

3. **实时协同** (Week 5-6)
   - 后端: WebSocket + OT
   - 前端: 实时数据同步
   - 验证: 多浏览器测试

### 集成检查清单

每次集成完成后检查:
- [ ] 后端测试通过 (pytest)
- [ ] API响应时间 < 200ms
- [ ] 前端功能正常
- [ ] 浏览器控制台无错误
- [ ] 数据正确存储到数据库
- [ ] 用户体验流畅

---

## ✅ 验收标准

### 测试覆盖率

| 模块 | 单元测试 | 集成测试 | 总覆盖率 | 状态 |
|------|---------|---------|---------|------|
| 认证 | > 80% | > 90% | > 85% | ⏰ |
| 计划 | > 75% | > 85% | > 80% | ⏰ |
| Line | > 75% | > 85% | > 80% | ⏰ |
| Relation | > 80% | > 90% | > 85% | ⏰ |
| WebSocket | > 65% | > 75% | > 70% | ⏰ |
| **总计** | **> 75%** | **> 85%** | **> 80%** | ⏰ |

### 性能指标

| 指标 | 目标 | 现状 |
|------|------|------|
| API响应时间 (P95) | < 200ms | ⏰ |
| WebSocket延迟 | < 200ms | ⏰ |
| 并发用户数 | > 100 | ⏰ |
| 大数据量 (1000 Lines) | < 1s | ⏰ |

### 功能完整性

- [ ] 用户认证 (注册、登录、JWT)
- [ ] 权限控制 (RBAC)
- [ ] 计划管理 (CRUD)
- [ ] Timeline管理 (CRUD)
- [ ] Line管理 (CRUD + 批量)
- [ ] Relation管理 (CRUD + 验证)
- [ ] Baseline管理 (快照 + 对比)
- [ ] WebSocket实时协同
- [ ] OT算法冲突解决
- [ ] 导出功能 (Excel/PDF)
- [ ] 搜索筛选

---

## 📚 参考资料

- [Test-Driven Development by Example](https://www.amazon.com/Test-Driven-Development-Kent-Beck/dp/0321146530)
- [Clean Code](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
- [FastAPI Testing](https://fastapi.tiangolo.com/tutorial/testing/)

---

**🎯 下一步**: 创建第一个测试用例（test_auth/test_register.py）

**🚀 准备好了！Let's write some tests first！** 🧪
