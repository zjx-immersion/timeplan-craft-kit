# TimePlan Craft Kit - API测试用例集

**版本**: v1.0.0  
**日期**: 2026-02-14  
**测试框架**: pytest + httpx (Python)  
**状态**: 📋 待实施

---

## 📋 目录

1. [测试策略](#测试策略)
2. [测试用例结构](#测试用例结构)
3. [测试数据管理](#测试数据管理)
4. [TDD实施流程](#tdd实施流程)
5. [持续集成](#持续集成)

---

## 🎯 测试策略

### 测试金字塔

```
         /\
        /  \  E2E测试 (10%)
       /----\
      /      \  集成测试 (30%)
     /--------\
    /          \ 单元测试 (60%)
   /------------\
```

### 测试范围

#### 1. **单元测试** (60%)
- 数据验证 (Pydantic)
- 业务逻辑 (Service层)
- 工具函数
- OT算法

#### 2. **集成测试** (30%) ⭐ 本测试集重点
- API端点测试
- 数据库交互
- 认证授权
- WebSocket通信

#### 3. **端到端测试** (10%)
- 关键用户流程
- 前后端联调
- 性能测试

---

## 📁 测试用例结构

```
timeplan-craft-kit/api-tests/
├── README.md                    # 本文档
├── requirements.txt             # Python依赖
├── pytest.ini                   # pytest配置
├── conftest.py                  # pytest fixtures
├── .env.test                    # 测试环境配置
│
├── fixtures/                    # 测试数据
│   ├── users.json              # 用户数据
│   ├── plans.json              # 计划数据
│   ├── timelines.json          # 时间线数据
│   ├── lines.json              # 任务节点数据
│   └── relations.json          # 依赖关系数据
│
├── test_auth/                   # 认证测试
│   ├── test_register.py
│   ├── test_login.py
│   ├── test_refresh_token.py
│   └── test_logout.py
│
├── test_users/                  # 用户测试
│   ├── test_get_current_user.py
│   ├── test_update_user.py
│   └── test_preferences.py
│
├── test_plans/                  # 计划测试
│   ├── test_create_plan.py
│   ├── test_list_plans.py
│   ├── test_get_plan.py
│   ├── test_update_plan.py
│   ├── test_delete_plan.py
│   └── test_plan_permissions.py
│
├── test_timelines/              # 时间线测试
│   ├── test_create_timeline.py
│   ├── test_update_timeline.py
│   ├── test_delete_timeline.py
│   └── test_reorder_timelines.py
│
├── test_lines/                  # 任务节点测试
│   ├── test_create_line.py
│   ├── test_list_lines.py
│   ├── test_update_line.py
│   ├── test_delete_line.py
│   ├── test_batch_create.py
│   ├── test_batch_update.py
│   └── test_line_validation.py
│
├── test_relations/              # 依赖关系测试
│   ├── test_create_relation.py
│   ├── test_delete_relation.py
│   ├── test_validate_circular.py
│   ├── test_critical_path.py
│   └── test_relation_types.py
│
├── test_baselines/              # 基线测试
│   ├── test_create_baseline.py
│   ├── test_compare_baseline.py
│   └── test_restore_baseline.py
│
├── test_websocket/              # WebSocket测试
│   ├── test_connection.py
│   ├── test_join_plan.py
│   ├── test_send_operation.py
│   ├── test_receive_operation.py
│   └── test_ot_algorithm.py
│
└── utils/                       # 测试工具
    ├── api_client.py           # API客户端封装
    ├── test_data.py            # 测试数据生成
    ├── assertions.py           # 自定义断言
    └── helpers.py              # 辅助函数
```

---

## 🧪 测试用例示例

### 1. 认证测试 (`test_auth/test_login.py`)

```python
"""
测试用例: 用户登录
"""
import pytest
from httpx import AsyncClient


class TestLogin:
    """登录功能测试"""

    @pytest.mark.asyncio
    async def test_login_success(self, client: AsyncClient, test_user):
        """
        测试: 成功登录
        Given: 已注册的用户
        When: 使用正确的用户名和密码登录
        Then: 返回200和Token
        """
        response = await client.post(
            "/api/v1/auth/login",
            json={
                "username": test_user["username"],
                "password": test_user["password"],
            },
        )

        assert response.status_code == 200
        data = response.json()
        
        # 验证响应结构
        assert "access_token" in data
        assert "refresh_token" in data
        assert "token_type" in data
        assert data["token_type"] == "bearer"
        assert "expires_in" in data
        assert data["expires_in"] > 0

    @pytest.mark.asyncio
    async def test_login_wrong_password(self, client: AsyncClient, test_user):
        """
        测试: 错误的密码
        Given: 已注册的用户
        When: 使用错误的密码登录
        Then: 返回401错误
        """
        response = await client.post(
            "/api/v1/auth/login",
            json={
                "username": test_user["username"],
                "password": "wrong_password",
            },
        )

        assert response.status_code == 401
        data = response.json()
        assert "error" in data
        assert "message" in data

    @pytest.mark.asyncio
    async def test_login_nonexistent_user(self, client: AsyncClient):
        """
        测试: 不存在的用户
        Given: 系统中不存在的用户名
        When: 尝试登录
        Then: 返回401错误
        """
        response = await client.post(
            "/api/v1/auth/login",
            json={
                "username": "nonexistent_user",
                "password": "any_password",
            },
        )

        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_login_invalid_input(self, client: AsyncClient):
        """
        测试: 无效的输入
        Given: 缺少必要字段
        When: 尝试登录
        Then: 返回400错误
        """
        response = await client.post(
            "/api/v1/auth/login",
            json={"username": "test"},  # 缺少password
        )

        assert response.status_code == 400
        data = response.json()
        assert "error" in data

    @pytest.mark.asyncio
    async def test_login_rate_limiting(self, client: AsyncClient, test_user):
        """
        测试: 登录速率限制
        Given: 已注册的用户
        When: 短时间内多次尝试登录
        Then: 触发速率限制
        """
        # 连续尝试10次登录
        for _ in range(10):
            response = await client.post(
                "/api/v1/auth/login",
                json={
                    "username": test_user["username"],
                    "password": "wrong_password",
                },
            )
        
        # 第11次应该被限制
        response = await client.post(
            "/api/v1/auth/login",
            json={
                "username": test_user["username"],
                "password": "wrong_password",
            },
        )
        
        assert response.status_code == 429  # Too Many Requests
```

### 2. 计划测试 (`test_plans/test_create_plan.py`)

```python
"""
测试用例: 创建计划
"""
import pytest
from httpx import AsyncClient


class TestCreatePlan:
    """创建计划测试"""

    @pytest.mark.asyncio
    async def test_create_plan_success(
        self, authenticated_client: AsyncClient
    ):
        """
        测试: 成功创建计划
        Given: 已认证的用户
        When: 提供有效的计划数据
        Then: 返回201和计划详情
        """
        plan_data = {
            "name": "Q1 2026产品规划",
            "description": "2026年第一季度产品开发计划",
        }

        response = await authenticated_client.post(
            "/api/v1/plans", json=plan_data
        )

        assert response.status_code == 201
        data = response.json()

        # 验证响应
        assert "id" in data
        assert data["name"] == plan_data["name"]
        assert data["description"] == plan_data["description"]
        assert "owner" in data
        assert "created_at" in data
        assert "updated_at" in data
        assert data["version"] == 1

    @pytest.mark.asyncio
    async def test_create_plan_minimal(
        self, authenticated_client: AsyncClient
    ):
        """
        测试: 最小化数据创建计划
        Given: 已认证的用户
        When: 只提供必要字段（name）
        Then: 成功创建计划
        """
        plan_data = {"name": "最小化计划"}

        response = await authenticated_client.post(
            "/api/v1/plans", json=plan_data
        )

        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "最小化计划"
        assert data["description"] is None

    @pytest.mark.asyncio
    async def test_create_plan_invalid_name(
        self, authenticated_client: AsyncClient
    ):
        """
        测试: 无效的计划名称
        Given: 已认证的用户
        When: 提供空名称或过长的名称
        Then: 返回400错误
        """
        # 空名称
        response = await authenticated_client.post(
            "/api/v1/plans", json={"name": ""}
        )
        assert response.status_code == 400

        # 超长名称
        response = await authenticated_client.post(
            "/api/v1/plans", json={"name": "a" * 201}
        )
        assert response.status_code == 400

    @pytest.mark.asyncio
    async def test_create_plan_unauthorized(self, client: AsyncClient):
        """
        测试: 未认证创建计划
        Given: 未认证的请求
        When: 尝试创建计划
        Then: 返回401错误
        """
        plan_data = {"name": "测试计划"}

        response = await client.post("/api/v1/plans", json=plan_data)

        assert response.status_code == 401
```

### 3. 批量操作测试 (`test_lines/test_batch_update.py`)

```python
"""
测试用例: 批量更新任务节点
"""
import pytest
from httpx import AsyncClient


class TestBatchUpdateLines:
    """批量更新测试"""

    @pytest.mark.asyncio
    async def test_batch_update_merge_mode(
        self,
        authenticated_client: AsyncClient,
        test_plan_with_lines,
    ):
        """
        测试: 批量更新（合并模式）
        Given: 已存在的计划和任务节点
        When: 使用merge模式批量更新属性
        Then: 成功更新所有节点，其他属性不变
        """
        plan_id = test_plan_with_lines["id"]
        line_ids = [line["id"] for line in test_plan_with_lines["lines"][:3]]

        # 批量更新owner
        update_data = {
            "line_ids": line_ids,
            "mode": "merge",
            "updates": {
                "attributes.owner": "张三",
                "attributes.status": "进行中",
            },
        }

        response = await authenticated_client.put(
            f"/api/v1/plans/{plan_id}/lines/batch", json=update_data
        )

        assert response.status_code == 200
        data = response.json()

        # 验证响应
        assert data["updated_count"] == 3
        assert len(data["lines"]) == 3

        # 验证每个节点的属性
        for line in data["lines"]:
            assert line["attributes"]["owner"] == "张三"
            assert line["attributes"]["status"] == "进行中"
            # 其他属性应该保持不变
            assert "priority" in line["attributes"]  # 原有属性保留

    @pytest.mark.asyncio
    async def test_batch_update_performance(
        self,
        authenticated_client: AsyncClient,
        test_plan_with_many_lines,  # fixture: 100个节点
    ):
        """
        测试: 批量更新性能
        Given: 包含100个节点的计划
        When: 批量更新所有节点
        Then: 在500ms内完成
        """
        import time

        plan_id = test_plan_with_many_lines["id"]
        line_ids = [line["id"] for line in test_plan_with_many_lines["lines"]]

        update_data = {
            "line_ids": line_ids,
            "mode": "merge",
            "updates": {"attributes.batch_updated": True},
        }

        start_time = time.time()

        response = await authenticated_client.put(
            f"/api/v1/plans/{plan_id}/lines/batch", json=update_data
        )

        elapsed_time = (time.time() - start_time) * 1000  # ms

        # 断言
        assert response.status_code == 200
        assert elapsed_time < 500  # 500ms内完成
        assert response.json()["updated_count"] == 100
```

### 4. 依赖关系验证测试 (`test_relations/test_validate_circular.py`)

```python
"""
测试用例: 循环依赖检测
"""
import pytest
from httpx import AsyncClient


class TestCircularDependencyValidation:
    """循环依赖检测测试"""

    @pytest.mark.asyncio
    async def test_detect_simple_circular(
        self,
        authenticated_client: AsyncClient,
        test_plan_with_lines,
    ):
        """
        测试: 检测简单循环依赖
        Given: 已有A→B的依赖
        When: 尝试创建B→A的依赖
        Then: 验证失败，返回循环依赖错误
        """
        plan_id = test_plan_with_lines["id"]
        line_a = test_plan_with_lines["lines"][0]
        line_b = test_plan_with_lines["lines"][1]

        # 创建A→B依赖
        response = await authenticated_client.post(
            f"/api/v1/plans/{plan_id}/relations",
            json={
                "from_line_id": line_a["id"],
                "to_line_id": line_b["id"],
                "type": "FS",
            },
        )
        assert response.status_code == 201

        # 尝试创建B→A依赖（会形成循环）
        response = await authenticated_client.post(
            f"/api/v1/plans/{plan_id}/relations",
            json={
                "from_line_id": line_b["id"],
                "to_line_id": line_a["id"],
                "type": "FS",
            },
        )

        # 应该被拒绝
        assert response.status_code == 400
        data = response.json()
        assert "error" in data
        assert data["error"] == "validation_error"
        assert any(err["type"] == "circular" for err in data["errors"])

    @pytest.mark.asyncio
    async def test_detect_complex_circular(
        self,
        authenticated_client: AsyncClient,
        test_plan_with_lines,
    ):
        """
        测试: 检测复杂循环依赖
        Given: 已有A→B→C的依赖链
        When: 尝试创建C→A的依赖
        Then: 验证失败，检测到A→B→C→A循环
        """
        plan_id = test_plan_with_lines["id"]
        lines = test_plan_with_lines["lines"][:3]

        # 创建A→B→C依赖链
        for i in range(2):
            await authenticated_client.post(
                f"/api/v1/plans/{plan_id}/relations",
                json={
                    "from_line_id": lines[i]["id"],
                    "to_line_id": lines[i + 1]["id"],
                    "type": "FS",
                },
            )

        # 尝试创建C→A（形成循环）
        response = await authenticated_client.post(
            f"/api/v1/plans/{plan_id}/relations",
            json={
                "from_line_id": lines[2]["id"],
                "to_line_id": lines[0]["id"],
                "type": "FS",
            },
        )

        assert response.status_code == 400
        data = response.json()
        assert any(err["type"] == "circular" for err in data["errors"])
```

---

## 🛠️ 测试配置

### requirements.txt

```text
pytest==8.0.0
pytest-asyncio==0.23.0
httpx==0.26.0
python-dotenv==1.0.0
faker==22.0.0
pytest-cov==4.1.0
pytest-xdist==3.5.0
```

### pytest.ini

```ini
[pytest]
testpaths = .
python_files = test_*.py
python_classes = Test*
python_functions = test_*
asyncio_mode = auto

# 标记
markers =
    auth: 认证相关测试
    plans: 计划管理测试
    lines: 任务节点测试
    relations: 依赖关系测试
    websocket: WebSocket测试
    slow: 慢速测试
    integration: 集成测试

# 输出
addopts =
    -v
    --tb=short
    --strict-markers
    --cov=app
    --cov-report=html
    --cov-report=term-missing
```

### conftest.py (核心Fixtures)

```python
"""
pytest fixtures
"""
import pytest
import asyncio
from httpx import AsyncClient
from typing import AsyncGenerator

# 测试配置
API_BASE_URL = "http://localhost:8000"


@pytest.fixture(scope="session")
def event_loop():
    """创建事件循环"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    """未认证的API客户端"""
    async with AsyncClient(base_url=API_BASE_URL) as client:
        yield client


@pytest.fixture
async def test_user(client: AsyncClient):
    """创建测试用户"""
    user_data = {
        "email": "test@example.com",
        "username": "testuser",
        "password": "Test123!@#",
        "display_name": "Test User",
    }

    response = await client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 201

    return {**user_data, "id": response.json()["id"]}


@pytest.fixture
async def authenticated_client(
    client: AsyncClient, test_user
) -> AsyncGenerator[AsyncClient, None]:
    """已认证的API客户端"""
    # 登录获取Token
    response = await client.post(
        "/api/v1/auth/login",
        json={
            "username": test_user["username"],
            "password": test_user["password"],
        },
    )
    assert response.status_code == 200

    token = response.json()["access_token"]

    # 创建带Token的客户端
    async with AsyncClient(
        base_url=API_BASE_URL,
        headers={"Authorization": f"Bearer {token}"},
    ) as auth_client:
        yield auth_client


@pytest.fixture
async def test_plan(authenticated_client: AsyncClient):
    """创建测试计划"""
    plan_data = {
        "name": "测试计划",
        "description": "用于测试的计划",
    }

    response = await authenticated_client.post(
        "/api/v1/plans", json=plan_data
    )
    assert response.status_code == 201

    return response.json()


@pytest.fixture
async def test_plan_with_lines(
    authenticated_client: AsyncClient, test_plan
):
    """创建包含任务节点的测试计划"""
    plan_id = test_plan["id"]

    # 创建时间线
    timeline_response = await authenticated_client.post(
        f"/api/v1/plans/{plan_id}/timelines",
        json={"name": "测试时间线"},
    )
    timeline_id = timeline_response.json()["id"]

    # 创建5个任务节点
    lines = []
    for i in range(5):
        line_data = {
            "timeline_id": timeline_id,
            "schema_id": "lineplan",
            "label": f"任务{i+1}",
            "start_date": f"2026-02-{14+i:02d}T00:00:00Z",
            "end_date": f"2026-02-{15+i:02d}T23:59:59Z",
            "attributes": {
                "owner": "测试用户",
                "status": "待开始",
                "priority": "medium",
            },
        }

        response = await authenticated_client.post(
            f"/api/v1/plans/{plan_id}/lines", json=line_data
        )
        lines.append(response.json())

    return {**test_plan, "lines": lines}
```

---

## 🔄 TDD实施流程

### Red-Green-Refactor循环

```
1. 🔴 Red: 编写失败的测试
   ├─ 根据API规范编写测试用例
   ├─ 测试应该失败（功能未实现）
   └─ 确保测试本身正确

2. 🟢 Green: 实现最小可用代码
   ├─ 编写Python后端代码
   ├─ 让测试通过
   └─ 不考虑优化

3. 🔵 Refactor: 重构优化
   ├─ 优化代码结构
   ├─ 提取公共逻辑
   ├─ 保持测试通过
   └─ 提交代码

4. 🔁 重复: 下一个功能
```

### 小批量集成流程

```
Week 1: 认证模块
  ├─ Day 1-2: 编写认证API测试
  ├─ Day 3-4: 实现后端认证
  ├─ Day 5: 前端集成（替换Mock）
  └─ ✅ 前后端联调通过

Week 2: 计划CRUD
  ├─ Day 1-2: 编写计划API测试
  ├─ Day 3-4: 实现后端CRUD
  ├─ Day 5: 前端集成
  └─ ✅ 计划管理功能完整

Week 3-4: Line + Relation
  ├─ 编写Line API测试
  ├─ 实现后端Line逻辑
  ├─ 前端集成Line
  ├─ 编写Relation测试
  ├─ 实现依赖关系
  └─ ✅ 核心功能完成

Week 5-6: WebSocket + OT
  ├─ 编写WebSocket测试
  ├─ 实现OT算法
  ├─ 前端集成实时协同
  └─ ✅ 多人协同完成
```

---

## 📊 测试覆盖率目标

| 模块 | 单元测试 | 集成测试 | 总覆盖率 |
|------|---------|---------|---------|
| 认证授权 | > 80% | > 90% | > 85% |
| 计划管理 | > 70% | > 80% | > 75% |
| 任务节点 | > 75% | > 85% | > 80% |
| 依赖关系 | > 80% | > 90% | > 85% |
| WebSocket | > 60% | > 70% | > 65% |
| **总体** | **> 70%** | **> 80%** | **> 75%** |

---

## 🚀 执行测试

### 运行全部测试

```bash
# 进入测试目录
cd timeplan-craft-kit/api-tests

# 安装依赖
pip install -r requirements.txt

# 运行所有测试
pytest

# 带覆盖率报告
pytest --cov=app --cov-report=html

# 并行运行
pytest -n auto
```

### 运行特定模块

```bash
# 只测试认证
pytest -m auth

# 只测试计划
pytest -m plans

# 只测试慢速测试
pytest -m slow
```

### 持续监控

```bash
# 监控文件变化，自动运行测试
pytest-watch
```

---

## 📚 参考资料

- [pytest文档](https://docs.pytest.org/)
- [httpx文档](https://www.python-httpx.org/)
- [TDD实践指南](https://testdriven.io/)

---

**下一步**: 创建测试数据Fixtures
