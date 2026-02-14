# TimePlan Craft Kit - 统一设计文档

**版本**: v2.0.0  
**日期**: 2026-02-14  
**状态**: 📘 设计定稿

---

## 📋 文档导航

### 核心设计文档
- 📘 **UNIFIED-DESIGN.md** (本文档) - 统一设计文档
- 📊 **CORE-DESIGN.md** - 核心技术设计
- 📋 **PRODUCT-REQUIREMENTS-DOCUMENT.md** - 产品需求文档

### API与后端
- 🔌 **API-REQUIREMENTS.md** - API需求分析
- 🐍 **BACKEND-ARCHITECTURE-PYTHON.md** - Python后端架构

### 专项设计
- 🎨 **PLAN-VIEW-ENHANCEMENT-DESIGN.md** - 计划视图增强设计
- 📊 **ITERATION-VIEW-DESIGN.md** - 迭代规划视图设计
- 🔢 **TIMELINE-CALCULATION-ANALYSIS.md** - 时间轴计算分析

### 实施与指南
- 🛠️ **IMPLEMENTATION-GUIDE.md** - 实施指南
- 📖 **QUICK-START.md** - 快速开始
- ❓ **FAQ.md** - 常见问题

---

## 🎯 产品概览

### 产品定位
**TimePlan Craft Kit** 是一个面向复杂项目管理的智能时间线管理平台，支持多团队协作和敏捷开发场景。

### 核心价值
1. **多视角管理** - 甘特图、表格、矩阵、迭代规划
2. **灵活数据模型** - 基于Schema的扩展架构
3. **实时协同** - 多人同时编辑，冲突自动解决
4. **智能依赖** - 关键路径计算、循环检测
5. **版本管理** - 基线快照、差异对比

---

## 🏗️ 技术架构

### 前端技术栈 (已实现)

```
框架: React 18 + TypeScript 5
UI库: Ant Design 5
状态: Zustand + persist middleware
路由: React Router 6
日期: date-fns
导出: xlsx, jsPDF, html2canvas
测试: Vitest + @testing-library/react
构建: Vite
```

**核心特性**:
- ✅ 撤销/重做系统
- ✅ 批量选择与操作
- ✅ 拖拽与调整大小
- ✅ 多视图切换
- ✅ 导出功能（Excel/PNG/PDF）
- ✅ 用户配置持久化
- ✅ 数据验证器

---

### 后端技术栈 (待实现)

```
语言: Python 3.11+
框架: FastAPI
数据库: PostgreSQL 15
ORM: SQLAlchemy 2.0
缓存: Redis 7
队列: Celery
实时: python-socketio
认证: JWT (python-jose)
```

**目标特性**:
- ⏰ RESTful API (CRUD)
- ⏰ WebSocket实时同步
- ⏰ Operational Transformation算法
- ⏰ JWT认证 + RBAC权限
- ⏰ 异步任务队列
- ⏰ 全文搜索

---

## 📊 数据模型总览

### 核心实体

```
TimePlan (时间规划)
  ├── id, name, description
  ├── owner_id, project_id
  ├── view_config (JSON)
  ├── version (版本号)
  └── timestamps

Timeline (时间线/泳道)
  ├── id, name, description
  ├── plan_id (所属计划)
  ├── color, order
  └── timestamps

Line (任务节点)
  ├── id, label
  ├── plan_id, timeline_id
  ├── schema_id ('lineplan' | 'milestone' | 'gateway')
  ├── start_date, end_date
  ├── attributes (JSON扩展属性)
  └── timestamps

Relation (依赖关系)
  ├── id, from_line_id, to_line_id
  ├── type ('FS' | 'SS' | 'FF' | 'SF')
  ├── lag (延迟天数)
  └── timestamps

Baseline (基线快照)
  ├── id, name, description
  ├── plan_id, date
  ├── snapshot (JSON完整快照)
  └── timestamps

User (用户)
  ├── id, email, username
  ├── hashed_password
  ├── role ('admin' | 'manager' | 'member' | 'viewer')
  └── timestamps

Team (团队)
  ├── id, name, description
  └── members (多对多)

Project (项目)
  ├── id, name, description
  ├── team_id
  └── members (多对多)
```

### ER关系图

```
User ─────┐
          │ 1
          │
          │ n
TimePlan ─┴─── Project ──── Team
  │ 1
  │
  │ n
  ├─── Timeline
  │      │ 1
  │      │
  │      │ n
  ├─── Line ────┬──── Relation (from/to)
  │             │
  │             └──── Baseline (snapshot)
  │
  └─── Collaboration (操作历史)
```

---

## 🔌 API设计总览

### RESTful API结构

```
/api/v1/
├── /auth                      认证相关
│   ├── POST /register        注册
│   ├── POST /login           登录
│   ├── POST /refresh         刷新Token
│   └── POST /logout          登出
│
├── /users                     用户管理
│   ├── GET /me               当前用户信息
│   ├── PUT /me               更新用户信息
│   └── GET /me/preferences   用户配置
│
├── /teams                     团队管理
│   ├── GET /                 团队列表
│   ├── POST /                创建团队
│   ├── GET /:id              团队详情
│   └── POST /:id/members     添加成员
│
├── /projects                  项目管理
│   ├── GET /                 项目列表
│   ├── POST /                创建项目
│   └── GET /:id              项目详情
│
├── /plans                     计划管理（核心）
│   ├── GET /                 计划列表
│   ├── POST /                创建计划
│   ├── GET /:id              计划详情
│   ├── PUT /:id              更新计划
│   ├── DELETE /:id           删除计划
│   │
│   ├── /plans/:id/timelines  Timeline操作
│   │   ├── GET /             列表
│   │   ├── POST /            创建
│   │   ├── PUT /:tid         更新
│   │   └── DELETE /:tid      删除
│   │
│   ├── /plans/:id/lines      Line操作
│   │   ├── GET /             列表（支持筛选）
│   │   ├── POST /            创建
│   │   ├── PUT /:lid         更新
│   │   ├── DELETE /:lid      删除
│   │   ├── POST /batch       批量操作
│   │   └── GET /search       搜索
│   │
│   ├── /plans/:id/relations  依赖关系
│   │   ├── GET /             列表
│   │   ├── POST /            创建
│   │   ├── DELETE /:rid      删除
│   │   ├── POST /validate    验证（循环检测）
│   │   └── GET /critical-path 关键路径
│   │
│   ├── /plans/:id/baselines  基线管理
│   │   ├── GET /             列表
│   │   ├── POST /            创建快照
│   │   ├── GET /:bid/compare 对比差异
│   │   └── POST /:bid/restore 恢复
│   │
│   └── /plans/:id/export     导出功能
│       ├── POST /excel       Excel导出
│       ├── POST /pdf         PDF导出
│       └── POST /image       图片导出
│
└── /ws                        WebSocket
    └── /plans/:id            计划协同
```

---

## 🔄 实时协同设计

### WebSocket协议

```python
# 连接建立
ws://api.example.com/api/ws/plans/{plan_id}?token={jwt_token}

# 消息类型
{
  "type": "operation" | "cursor" | "online_users" | "heartbeat",
  "data": { ... }
}
```

### OT算法核心流程

```
客户端操作流程:
1. 用户编辑 → 生成Operation
2. 本地立即应用（乐观更新）
3. 发送到服务器（带版本号）
4. 服务器确认 → 更新本地版本
5. 接收其他用户操作 → 应用到本地

服务器处理流程:
1. 接收Operation（版本V）
2. 获取服务器当前版本（V'）
3. 如果V < V'：转换Operation（OT算法）
4. 应用到服务器状态
5. 版本号+1
6. 广播给其他用户

冲突解决:
- 相同字段：Last Write Wins
- 删除vs更新：删除优先
- 移动vs更新：分别应用
```

---

## 🎯 功能模块设计

### 1. 用户认证与权限

**角色定义**:
```python
class UserRole(Enum):
    ADMIN = "admin"       # 系统管理员（所有权限）
    MANAGER = "manager"   # 项目经理（管理项目）
    MEMBER = "member"     # 团队成员（编辑）
    VIEWER = "viewer"     # 访客（只读）

class ProjectRole(Enum):
    OWNER = "owner"       # 项目所有者
    EDITOR = "editor"     # 编辑者
    VIEWER = "viewer"     # 查看者
```

**权限矩阵**:
| 操作 | Admin | Manager | Member | Viewer |
|------|-------|---------|--------|--------|
| 创建计划 | ✅ | ✅ | ✅ | ❌ |
| 查看计划 | ✅ | ✅ | ✅ | ✅ |
| 编辑计划 | ✅ | ✅ | Owner/Editor | ❌ |
| 删除计划 | ✅ | ✅ | Owner | ❌ |
| 管理权限 | ✅ | ✅ | Owner | ❌ |

---

### 2. 批量操作设计

**批量更新策略**:
```python
class BatchUpdateMode(Enum):
    MERGE = "merge"       # 合并更新（只更新提供的字段）
    REPLACE = "replace"   # 完全替换

# 批量更新API
PUT /api/plans/{plan_id}/lines/batch
{
  "line_ids": ["line1", "line2", "line3"],
  "mode": "merge",
  "updates": {
    "attributes.owner": "张三",
    "attributes.status": "进行中"
  }
}

# 事务保证
- 使用数据库事务
- 全部成功或全部回滚
- 返回成功数量和失败详情
```

---

### 3. 搜索与筛选

**全文搜索**:
```python
# PostgreSQL全文搜索
from sqlalchemy import func

query = db.query(Line).filter(
    func.to_tsvector('chinese', Line.label).match('关键词')
)

# 高级筛选
GET /api/plans/{plan_id}/lines?
  timeline_ids=t1,t2&
  owner=张三&
  status=进行中,已完成&
  start_date_after=2026-01-01&
  tags=重要,紧急&
  page=1&
  page_size=20
```

---

### 4. 导出服务设计

**异步导出流程**:
```
1. 客户端发起导出请求
2. 服务器创建ExportTask
3. 返回task_id给客户端
4. Celery Worker异步处理导出
5. 客户端轮询任务状态
6. 完成后下载文件

// 客户端代码
const response = await api.post(`/plans/${planId}/export/excel`);
const taskId = response.data.task_id;

// 轮询状态
const checkStatus = setInterval(async () => {
  const status = await api.get(`/export-tasks/${taskId}`);
  if (status.data.status === 'completed') {
    clearInterval(checkStatus);
    window.location.href = status.data.file_url;
  }
}, 2000);
```

**导出实现**:
```python
# app/tasks/export_tasks.py
from celery import shared_task
from openpyxl import Workbook
from reportlab.pdfgen import canvas

@shared_task(bind=True)
def export_plan_to_excel(self, plan_id: str, options: dict):
    """导出计划为Excel"""
    try:
        # 1. 获取计划数据
        plan = get_plan_with_all_data(plan_id)
        
        # 2. 创建Workbook
        wb = Workbook()
        
        # 3. 创建多个Sheet
        ws_overview = wb.active
        ws_overview.title = "项目概览"
        
        ws_timelines = wb.create_sheet("时间线")
        ws_lines = wb.create_sheet("任务")
        ws_relations = wb.create_sheet("依赖关系")
        
        # 4. 填充数据
        fill_overview_sheet(ws_overview, plan)
        fill_timelines_sheet(ws_timelines, plan.timelines)
        fill_lines_sheet(ws_lines, plan.lines)
        fill_relations_sheet(ws_relations, plan.relations)
        
        # 5. 保存文件
        filename = f"plan_{plan_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
        filepath = f"/tmp/exports/{filename}"
        wb.save(filepath)
        
        # 6. 上传到S3/OSS或本地存储
        file_url = upload_file(filepath)
        
        # 7. 更新任务状态
        update_export_task(self.request.id, 'completed', file_url)
        
    except Exception as e:
        logger.error(f"Export failed: {e}")
        update_export_task(self.request.id, 'failed', error=str(e))
```

---

## 🔄 实时协同核心设计

### 数据同步流程

```
┌─────────────┐                  ┌─────────────┐
│  Client A   │                  │  Client B   │
└──────┬──────┘                  └──────┬──────┘
       │                                │
       │ 1. Edit: line.label = "新任务" │
       │ 2. Generate Op(v=5)            │
       │                                │
       │ 3. Send Op ──────┐             │
       ▼                  │             ▼
┌──────────────────────────┴─────────────────┐
│            Server (v=5)                    │
│  4. Receive Op(v=5)                        │
│  5. Apply Op → v=6                         │
│  6. Persist to DB                          │
│  7. Broadcast Op(v=6) ─────────────────┐   │
└────────────────────────────────────────┼───┘
                                         │
       ┌─────────────────────────────────┘
       │
       │ 8. Receive Op(v=6)
       │ 9. Transform if needed
       │ 10. Apply to local state
       ▼
┌─────────────┐
│  Client B   │
│  (Updated)  │
└─────────────┘
```

### 冲突解决策略

**1. 字段级冲突**:
```python
# 相同字段的并发更新
Client A: line.label = "任务A" (v=5)
Client B: line.label = "任务B" (v=5)

→ Last Write Wins (后到达的胜出)
→ 通知冲突给两个客户端
→ 提供撤销选项
```

**2. 结构冲突**:
```python
# 删除vs更新
Client A: delete line (v=5)
Client B: update line.label (v=5)

→ 删除优先
→ 更新操作被忽略
→ 通知Client B: Line已被删除
```

**3. 关系冲突**:
```python
# 循环依赖
Client A: add relation (A→B)
Client B: add relation (B→A)

→ 服务器检测循环
→ 拒绝第二个操作
→ 返回错误: "会形成循环依赖"
```

---

## ⚡ 性能优化策略

### 数据库优化

**1. 索引策略**:
```sql
-- Line表关键索引
CREATE INDEX idx_line_plan_timeline ON lines(plan_id, timeline_id);
CREATE INDEX idx_line_dates ON lines(start_date, end_date);
CREATE INDEX idx_line_schema ON lines(schema_id);
CREATE INDEX idx_line_owner ON lines((attributes->>'owner'));

-- Relation表索引
CREATE INDEX idx_relation_from ON relations(from_line_id);
CREATE INDEX idx_relation_to ON relations(to_line_id);
CREATE INDEX idx_relation_plan ON relations(plan_id);

-- 复合索引
CREATE INDEX idx_line_search ON lines USING gin(to_tsvector('chinese', label));
```

**2. 查询优化**:
```python
# 预加载关系（避免N+1查询）
from sqlalchemy.orm import joinedload

plan = db.query(TimePlan).options(
    joinedload(TimePlan.timelines),
    joinedload(TimePlan.lines),
    joinedload(TimePlan.relations)
).filter(TimePlan.id == plan_id).first()

# 分页查询
from sqlalchemy import func

total = db.query(func.count(Line.id)).filter(Line.plan_id == plan_id).scalar()
lines = db.query(Line).filter(Line.plan_id == plan_id).offset(skip).limit(limit).all()
```

**3. 缓存策略**:
```python
# Redis缓存
import redis
import json

redis_client = redis.Redis(host='localhost', port=6379, db=0)

def get_plan_cached(plan_id: str):
    """获取计划（带缓存）"""
    cache_key = f"plan:{plan_id}"
    
    # 尝试从缓存获取
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)
    
    # 从数据库获取
    plan = db.query(TimePlan).filter(TimePlan.id == plan_id).first()
    
    # 写入缓存（TTL 5分钟）
    redis_client.setex(cache_key, 300, json.dumps(plan.to_dict()))
    
    return plan

def invalidate_plan_cache(plan_id: str):
    """使缓存失效"""
    redis_client.delete(f"plan:{plan_id}")
```

---

### API性能指标

| API类型 | 目标 (P95) | 优化手段 |
|---------|-----------|----------|
| GET /plans/:id | < 100ms | 预加载关系、Redis缓存 |
| GET /plans | < 50ms | 分页、索引优化 |
| POST /lines | < 200ms | 批量插入、异步处理 |
| PUT /lines/batch | < 500ms | 事务、批量更新 |
| WS延迟 | < 200ms | Redis Pub/Sub |

---

## 🛠️ 开发工具与规范

### 开发环境

```bash
# 1. 安装Python 3.11+
python --version  # 确保 >= 3.11

# 2. 安装Poetry（包管理）
pip install poetry

# 3. 克隆项目
git clone <repo>
cd timeplan-backend

# 4. 安装依赖
poetry install

# 5. 启动数据库
docker-compose up -d db redis

# 6. 运行迁移
poetry run alembic upgrade head

# 7. 创建管理员
poetry run python scripts/create_admin.py

# 8. 启动开发服务器
poetry run uvicorn app.main:app --reload
```

### 代码规范

```bash
# 格式化
poetry run black app/

# Linter
poetry run ruff check app/

# 类型检查
poetry run mypy app/

# 测试
poetry run pytest tests/ --cov=app --cov-report=html

# Pre-commit钩子
poetry run pre-commit install
```

---

## 📋 实施路线图

### Week 1-2: 项目初始化 + 核心API

**Sprint 1.1: 项目脚手架** (2天)
- [ ] 创建项目结构
- [ ] 配置Poetry + pyproject.toml
- [ ] 设置Docker Compose
- [ ] 配置Pre-commit钩子

**Sprint 1.2: 数据库设计** (3天)
- [ ] SQLAlchemy模型定义
- [ ] Alembic迁移脚本
- [ ] 种子数据脚本
- [ ] 数据库索引优化

**Sprint 1.3: 核心API** (3天)
- [ ] FastAPI应用配置
- [ ] TimePlan CRUD API
- [ ] Line CRUD API
- [ ] Relation CRUD API
- [ ] 健康检查 + Swagger文档

---

### Week 3-4: 认证授权

**Sprint 2.1: JWT认证** (3天)
- [ ] 用户注册/登录API
- [ ] JWT生成与验证
- [ ] 密码加密（bcrypt）
- [ ] Token刷新机制

**Sprint 2.2: 权限系统** (2天)
- [ ] RBAC权限模型
- [ ] 权限检查装饰器
- [ ] 团队/项目成员管理
- [ ] 权限测试

---

### Week 5-6: WebSocket + OT

**Sprint 3.1: WebSocket基础** (2天)
- [ ] python-socketio集成
- [ ] 连接认证
- [ ] 房间管理
- [ ] 心跳检测

**Sprint 3.2: OT算法** (4天)
- [ ] Operation数据结构
- [ ] Transform算法实现
- [ ] 版本控制
- [ ] 冲突检测与解决
- [ ] 操作历史存储

---

### Week 7-8: 测试 + 部署

**Sprint 4.1: 测试** (3天)
- [ ] 单元测试（覆盖率>80%）
- [ ] 集成测试
- [ ] 性能测试
- [ ] 安全测试

**Sprint 4.2: 部署** (2天)
- [ ] Docker镜像构建
- [ ] Kubernetes配置
- [ ] CI/CD流水线
- [ ] 监控告警

---

## 📚 参考资料

### Python生态
- FastAPI官方文档: https://fastapi.tiangolo.com/
- SQLAlchemy 2.0: https://docs.sqlalchemy.org/en/20/
- Pydantic V2: https://docs.pydantic.dev/latest/
- python-socketio: https://python-socketio.readthedocs.io/

### 算法与架构
- Operational Transformation: https://en.wikipedia.org/wiki/Operational_transformation
- ShareDB (参考): https://github.com/share/sharedb

---

## ✅ 下一步行动

1. **阅读本文档** - 理解整体架构
2. **阅读API-REQUIREMENTS.md** - 了解API需求
3. **阅读BACKEND-ARCHITECTURE-PYTHON.md** - 了解实现细节
4. **开始项目初始化** - 创建backend目录，配置Poetry

---

**准备启动Python后端开发！** 🐍🚀
