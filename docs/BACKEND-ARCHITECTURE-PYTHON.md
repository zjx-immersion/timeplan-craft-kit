# TimePlan Craft Kit - Python后端架构设计

**版本**: v1.0.0  
**日期**: 2026-02-14  
**技术栈**: Python 3.11+ + FastAPI  
**状态**: 📋 架构设计

---

## 📋 目录

1. [技术栈选择](#技术栈选择)
2. [架构设计](#架构设计)
3. [项目结构](#项目结构)
4. [数据库设计](#数据库设计)
5. [核心模块设计](#核心模块设计)
6. [实时协同方案](#实时协同方案)
7. [部署方案](#部署方案)

---

## 🎯 技术栈选择

### Python 3.11+ 核心优势

```
✅ 性能提升
- 相比3.10提升10-60%性能
- 更好的异步性能
- 优化的字典和函数调用

✅ 类型系统增强
- Self类型
- TypeVarTuple
- LiteralString
- Better type hints

✅ 错误信息改进
- 更清晰的异常追踪
- 精确的错误位置

✅ 生态丰富
- FastAPI原生支持
- SQLAlchemy 2.0
- Pydantic V2
```

---

## 🏗️ 推荐技术栈

### 核心框架与库

```python
# Web框架
fastapi = "^0.109.0"          # 现代化Web框架
uvicorn = "^0.27.0"           # ASGI服务器
python-multipart = "^0.0.9"   # 文件上传支持

# 数据库
sqlalchemy = "^2.0.25"        # ORM（2.0新版本）
alembic = "^1.13.1"           # 数据库迁移
psycopg2-binary = "^2.9.9"    # PostgreSQL驱动
asyncpg = "^0.29.0"           # 异步PostgreSQL

# 缓存与消息队列
redis = "^5.0.1"              # 缓存和会话
celery = "^5.3.6"             # 异步任务队列
flower = "^2.0.1"             # Celery监控

# 实时通信
python-socketio = "^5.11.0"   # WebSocket
aioredis = "^2.0.1"           # 异步Redis

# 数据验证与序列化
pydantic = "^2.5.3"           # 数据验证（V2）
pydantic-settings = "^2.1.0"  # 配置管理

# 认证与安全
python-jose = "^3.3.0"        # JWT
passlib = "^1.7.4"            # 密码哈希
bcrypt = "^4.1.2"             # Bcrypt
python-multipart = "^0.0.9"   # OAuth2支持

# 工具库
python-dotenv = "^1.0.0"      # 环境变量
httpx = "^0.26.0"             # HTTP客户端
loguru = "^0.7.2"             # 日志
typer = "^0.9.0"              # CLI工具

# 测试
pytest = "^7.4.4"             # 测试框架
pytest-asyncio = "^0.23.3"    # 异步测试
pytest-cov = "^4.1.0"         # 覆盖率
httpx = "^0.26.0"             # 测试HTTP客户端

# 代码质量
ruff = "^0.1.14"              # 超快Linter
black = "^24.1.1"             # 代码格式化
mypy = "^1.8.0"               # 类型检查
pre-commit = "^3.6.0"         # Git钩子

# 监控
prometheus-client = "^0.19.0"  # Prometheus
sentry-sdk = "^1.40.0"        # 错误追踪

# 导出功能
openpyxl = "^3.1.2"           # Excel
reportlab = "^4.0.8"          # PDF
pillow = "^10.2.0"            # 图片处理
```

---

## 🏗️ 架构设计

### 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                    前端 (React 18)                      │
│  ├─ REST API调用 (axios)                               │
│  └─ WebSocket连接 (Socket.IO Client)                   │
└────────────┬────────────────────────────┬───────────────┘
             │                            │
             │ HTTPS/WSS                  │
             ▼                            ▼
┌─────────────────────────────────────────────────────────┐
│              Nginx (反向代理 + 负载均衡)                │
└────────────┬────────────────────────────┬───────────────┘
             │                            │
             ▼                            ▼
┌─────────────────────┐      ┌──────────────────────────┐
│   FastAPI (REST)    │      │  Socket.IO (WebSocket)   │
│  ├─ API路由         │      │  ├─ 实时同步引擎         │
│  ├─ 认证中间件      │      │  ├─ 在线状态管理         │
│  ├─ 权限检查        │      │  └─ OT算法实现           │
│  └─ 数据验证        │      └──────────────────────────┘
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────┐
│                   业务逻辑层 (Services)                  │
│  ├─ TimePlanService       (计划管理)                    │
│  ├─ TimelineService       (时间线)                      │
│  ├─ LineService           (任务节点)                    │
│  ├─ RelationService       (依赖关系)                    │
│  ├─ BaselineService       (基线管理)                    │
│  ├─ UserService           (用户管理)                    │
│  ├─ AuthService           (认证授权)                    │
│  ├─ CollaborationService  (协同)                        │
│  └─ ExportService         (导出)                        │
└──────────┬──────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────┐
│               数据访问层 (Repositories)                  │
│  ├─ SQLAlchemy ORM                                      │
│  ├─ 数据库连接池                                         │
│  └─ 查询优化                                            │
└──────────┬──────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────┬──────────────────┬───────────────┐
│    PostgreSQL        │      Redis       │    Celery     │
│  (主数据存储)        │  (缓存/会话)     │ (异步任务)    │
│  ├─ 计划数据         │  ├─ 用户会话     │  ├─ 导出任务  │
│  ├─ 用户权限         │  ├─ 查询缓存     │  ├─ 邮件发送  │
│  └─ 协同记录         │  └─ 在线状态     │  └─ 数据清理  │
└──────────────────────┴──────────────────┴───────────────┘
```

---

## 📁 项目结构

```
timeplan-backend/
├── app/
│   ├── __init__.py
│   ├── main.py                    # FastAPI应用入口
│   ├── config.py                  # 配置管理
│   │
│   ├── api/                       # API路由层
│   │   ├── __init__.py
│   │   ├── deps.py               # 依赖注入
│   │   ├── v1/                   # API版本1
│   │   │   ├── __init__.py
│   │   │   ├── router.py         # 主路由
│   │   │   ├── auth.py           # 认证路由
│   │   │   ├── users.py          # 用户路由
│   │   │   ├── teams.py          # 团队路由
│   │   │   ├── projects.py       # 项目路由
│   │   │   ├── plans.py          # 计划路由
│   │   │   ├── timelines.py      # 时间线路由
│   │   │   ├── lines.py          # 任务节点路由
│   │   │   ├── relations.py      # 依赖关系路由
│   │   │   ├── baselines.py      # 基线路由
│   │   │   └── exports.py        # 导出路由
│   │   │
│   │   └── websocket/            # WebSocket路由
│   │       ├── __init__.py
│   │       └── collaboration.py  # 协同WebSocket
│   │
│   ├── core/                     # 核心功能
│   │   ├── __init__.py
│   │   ├── security.py          # 安全相关（JWT、密码）
│   │   ├── auth.py              # 认证授权
│   │   ├── permissions.py       # 权限控制
│   │   ├── exceptions.py        # 自定义异常
│   │   └── logger.py            # 日志配置
│   │
│   ├── db/                       # 数据库
│   │   ├── __init__.py
│   │   ├── base.py              # Base Model
│   │   ├── session.py           # 数据库会话
│   │   └── init_db.py           # 数据库初始化
│   │
│   ├── models/                   # SQLAlchemy模型
│   │   ├── __init__.py
│   │   ├── user.py              # 用户模型
│   │   ├── team.py              # 团队模型
│   │   ├── project.py           # 项目模型
│   │   ├── time_plan.py         # 计划模型
│   │   ├── timeline.py          # 时间线模型
│   │   ├── line.py              # 任务节点模型
│   │   ├── relation.py          # 依赖关系模型
│   │   ├── baseline.py          # 基线模型
│   │   ├── collaboration.py     # 协同记录模型
│   │   └── activity.py          # 活动日志模型
│   │
│   ├── schemas/                  # Pydantic模型（API数据验证）
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── team.py
│   │   ├── project.py
│   │   ├── time_plan.py
│   │   ├── timeline.py
│   │   ├── line.py
│   │   ├── relation.py
│   │   ├── baseline.py
│   │   └── common.py            # 通用schemas
│   │
│   ├── services/                 # 业务逻辑层
│   │   ├── __init__.py
│   │   ├── user_service.py
│   │   ├── auth_service.py
│   │   ├── team_service.py
│   │   ├── project_service.py
│   │   ├── time_plan_service.py
│   │   ├── timeline_service.py
│   │   ├── line_service.py
│   │   ├── relation_service.py
│   │   ├── baseline_service.py
│   │   ├── collaboration_service.py
│   │   ├── export_service.py
│   │   ├── search_service.py
│   │   └── notification_service.py
│   │
│   ├── repositories/             # 数据访问层
│   │   ├── __init__.py
│   │   ├── base_repository.py   # 基础Repository
│   │   ├── time_plan_repository.py
│   │   ├── line_repository.py
│   │   └── ...
│   │
│   ├── utils/                    # 工具函数
│   │   ├── __init__.py
│   │   ├── date_utils.py        # 日期处理
│   │   ├── validation.py        # 数据验证
│   │   ├── pagination.py        # 分页
│   │   ├── export_utils.py      # 导出工具
│   │   └── ot_algorithm.py      # OT算法实现
│   │
│   ├── tasks/                    # Celery异步任务
│   │   ├── __init__.py
│   │   ├── export_tasks.py      # 导出任务
│   │   └── notification_tasks.py # 通知任务
│   │
│   └── middleware/               # 中间件
│       ├── __init__.py
│       ├── cors.py              # CORS
│       ├── logging.py           # 日志
│       └── error_handler.py     # 错误处理
│
├── alembic/                      # 数据库迁移
│   ├── versions/
│   ├── env.py
│   └── script.py.mako
│
├── tests/                        # 测试
│   ├── __init__.py
│   ├── conftest.py              # pytest配置
│   ├── unit/                    # 单元测试
│   ├── integration/             # 集成测试
│   └── e2e/                     # 端到端测试
│
├── scripts/                      # 工具脚本
│   ├── init_db.py               # 初始化数据库
│   ├── create_admin.py          # 创建管理员
│   └── import_data.py           # 数据导入
│
├── .env.example                  # 环境变量示例
├── .gitignore
├── pyproject.toml               # 项目配置（使用Poetry）
├── poetry.lock
├── Dockerfile
├── docker-compose.yml
├── README.md
└── Makefile                     # 常用命令
```

---

## 🗄️ 数据库设计 (SQLAlchemy 2.0)

### 核心模型定义

```python
# app/models/user.py
from sqlalchemy import Column, String, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from app.db.base import Base
import enum
from datetime import datetime

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    MEMBER = "member"
    VIEWER = "viewer"

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=False, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    display_name = Column(String)
    avatar = Column(String)
    role = Column(Enum(UserRole), default=UserRole.MEMBER)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_active_at = Column(DateTime)
    
    # 关系
    owned_plans = relationship("TimePlan", back_populates="owner")
    team_members = relationship("TeamMember", back_populates="user")
    project_members = relationship("ProjectMember", back_populates="user")


# app/models/time_plan.py
from sqlalchemy import Column, String, Text, JSON, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class TimePlan(Base):
    __tablename__ = "time_plans"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False, index=True)
    description = Column(Text)
    project_id = Column(String, ForeignKey("projects.id"))
    owner_id = Column(String, ForeignKey("users.id"), nullable=False)
    
    # JSON存储视图配置
    view_config = Column(JSON)
    
    # 版本控制
    version = Column(Integer, default=1)
    
    # 时间戳
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_accessed_at = Column(DateTime)
    
    # 软删除
    is_deleted = Column(Boolean, default=False)
    deleted_at = Column(DateTime)
    
    # 关系
    owner = relationship("User", back_populates="owned_plans")
    project = relationship("Project", back_populates="plans")
    timelines = relationship("Timeline", back_populates="plan", cascade="all, delete-orphan")
    lines = relationship("Line", back_populates="plan", cascade="all, delete-orphan")
    relations = relationship("Relation", back_populates="plan", cascade="all, delete-orphan")
    baselines = relationship("Baseline", back_populates="plan", cascade="all, delete-orphan")
    collaborations = relationship("Collaboration", back_populates="plan")


# app/models/line.py
from sqlalchemy import Column, String, Text, JSON, DateTime, Integer, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.db.base import Base

class Line(Base):
    __tablename__ = "lines"
    
    id = Column(String, primary_key=True)
    plan_id = Column(String, ForeignKey("time_plans.id"), nullable=False)
    timeline_id = Column(String, ForeignKey("timelines.id"), nullable=False)
    
    # 基本信息
    schema_id = Column(String, nullable=False)  # 'lineplan', 'milestone', 'gateway'
    label = Column(String, nullable=False)
    
    # 时间信息
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime)
    
    # 扩展属性（JSON）
    attributes = Column(JSON, default={})
    
    # 排序
    order = Column(Integer, default=0)
    
    # 时间戳
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关系
    plan = relationship("TimePlan", back_populates="lines")
    timeline = relationship("Timeline", back_populates="lines")
    
    # 索引
    __table_args__ = (
        Index('idx_line_plan_timeline', 'plan_id', 'timeline_id'),
        Index('idx_line_dates', 'start_date', 'end_date'),
        Index('idx_line_schema', 'schema_id'),
    )


# app/models/relation.py
from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.db.base import Base
import enum

class RelationType(str, enum.Enum):
    FINISH_TO_START = "FS"
    START_TO_START = "SS"
    FINISH_TO_FINISH = "FF"
    START_TO_FINISH = "SF"

class Relation(Base):
    __tablename__ = "relations"
    
    id = Column(String, primary_key=True)
    plan_id = Column(String, ForeignKey("time_plans.id"), nullable=False)
    from_line_id = Column(String, ForeignKey("lines.id"), nullable=False)
    to_line_id = Column(String, ForeignKey("lines.id"), nullable=False)
    
    type = Column(Enum(RelationType), default=RelationType.FINISH_TO_START)
    lag = Column(Integer, default=0)  # 延迟天数
    notes = Column(Text)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关系
    plan = relationship("TimePlan", back_populates="relations")
```

---

## 🔧 核心模块设计

### 1. 认证与授权

```python
# app/core/security.py
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status

# 密码加密
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """验证密码"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """生成密码哈希"""
    return pwd_context.hash(password)

# JWT Token生成
SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

def create_access_token(data: dict) -> str:
    """创建访问Token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(data: dict) -> str:
    """创建刷新Token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    """解码Token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )


# app/api/deps.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.security import decode_token
from app.db.session import get_db
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """获取当前用户"""
    payload = decode_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    return user

def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """获取当前活跃用户"""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    return current_user
```

---

### 2. Service层示例

```python
# app/services/time_plan_service.py
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.time_plan import TimePlan
from app.models.user import User
from app.schemas.time_plan import TimePlanCreate, TimePlanUpdate
from app.core.exceptions import NotFoundException, PermissionDeniedException
from datetime import datetime

class TimePlanService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_plan(
        self, 
        plan_data: TimePlanCreate, 
        owner: User
    ) -> TimePlan:
        """创建计划"""
        plan = TimePlan(
            id=generate_uuid(),
            name=plan_data.name,
            description=plan_data.description,
            owner_id=owner.id,
            created_at=datetime.utcnow()
        )
        self.db.add(plan)
        self.db.commit()
        self.db.refresh(plan)
        return plan
    
    def get_plan(
        self, 
        plan_id: str, 
        user: User
    ) -> TimePlan:
        """获取计划详情（含权限检查）"""
        plan = self.db.query(TimePlan).filter(
            TimePlan.id == plan_id,
            TimePlan.is_deleted == False
        ).first()
        
        if not plan:
            raise NotFoundException(f"Plan {plan_id} not found")
        
        # 权限检查
        if not self._check_permission(plan, user, "read"):
            raise PermissionDeniedException("No permission to access this plan")
        
        # 更新最后访问时间
        plan.last_accessed_at = datetime.utcnow()
        self.db.commit()
        
        return plan
    
    def list_plans(
        self,
        user: User,
        page: int = 1,
        page_size: int = 20,
        filters: Optional[dict] = None
    ) -> tuple[List[TimePlan], int]:
        """获取计划列表（分页）"""
        query = self.db.query(TimePlan).filter(
            TimePlan.is_deleted == False
        )
        
        # 权限过滤：只返回用户有权限的计划
        # 简化版：只返回用户拥有的计划
        query = query.filter(TimePlan.owner_id == user.id)
        
        # 应用筛选条件
        if filters:
            if filters.get("name"):
                query = query.filter(TimePlan.name.ilike(f"%{filters['name']}%"))
            # ...更多筛选条件
        
        # 总数
        total = query.count()
        
        # 分页
        offset = (page - 1) * page_size
        plans = query.offset(offset).limit(page_size).all()
        
        return plans, total
    
    def update_plan(
        self,
        plan_id: str,
        plan_data: TimePlanUpdate,
        user: User
    ) -> TimePlan:
        """更新计划"""
        plan = self.get_plan(plan_id, user)
        
        # 权限检查
        if not self._check_permission(plan, user, "write"):
            raise PermissionDeniedException("No permission to update this plan")
        
        # 更新字段
        if plan_data.name is not None:
            plan.name = plan_data.name
        if plan_data.description is not None:
            plan.description = plan_data.description
        
        plan.updated_at = datetime.utcnow()
        plan.version += 1
        
        self.db.commit()
        self.db.refresh(plan)
        return plan
    
    def delete_plan(
        self,
        plan_id: str,
        user: User
    ) -> None:
        """删除计划（软删除）"""
        plan = self.get_plan(plan_id, user)
        
        # 权限检查
        if not self._check_permission(plan, user, "delete"):
            raise PermissionDeniedException("No permission to delete this plan")
        
        plan.is_deleted = True
        plan.deleted_at = datetime.utcnow()
        self.db.commit()
    
    def _check_permission(
        self, 
        plan: TimePlan, 
        user: User, 
        action: str
    ) -> bool:
        """检查权限"""
        # 所有者拥有所有权限
        if plan.owner_id == user.id:
            return True
        
        # TODO: 实现更复杂的权限逻辑
        # - 团队成员权限
        # - 项目协作者权限
        # - RBAC角色权限
        
        return False
```

---

### 3. API路由示例

```python
# app/api/v1/plans.py
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.api.deps import get_db, get_current_active_user
from app.models.user import User
from app.services.time_plan_service import TimePlanService
from app.schemas.time_plan import (
    TimePlanCreate, 
    TimePlanUpdate, 
    TimePlanResponse,
    TimePlanListResponse
)
from app.schemas.common import PaginationParams

router = APIRouter()

@router.post(
    "/",
    response_model=TimePlanResponse,
    status_code=status.HTTP_201_CREATED,
    summary="创建时间规划"
)
async def create_plan(
    plan_data: TimePlanCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """创建新的时间规划"""
    service = TimePlanService(db)
    plan = service.create_plan(plan_data, current_user)
    return plan

@router.get(
    "/",
    response_model=TimePlanListResponse,
    summary="获取时间规划列表"
)
async def list_plans(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    name: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """获取时间规划列表（分页）"""
    service = TimePlanService(db)
    filters = {"name": name} if name else None
    plans, total = service.list_plans(current_user, page, page_size, filters)
    
    return {
        "items": plans,
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": (total + page_size - 1) // page_size
    }

@router.get(
    "/{plan_id}",
    response_model=TimePlanResponse,
    summary="获取时间规划详情"
)
async def get_plan(
    plan_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """获取单个时间规划的详细信息"""
    service = TimePlanService(db)
    plan = service.get_plan(plan_id, current_user)
    return plan

@router.put(
    "/{plan_id}",
    response_model=TimePlanResponse,
    summary="更新时间规划"
)
async def update_plan(
    plan_id: str,
    plan_data: TimePlanUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """更新时间规划"""
    service = TimePlanService(db)
    plan = service.update_plan(plan_id, plan_data, current_user)
    return plan

@router.delete(
    "/{plan_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="删除时间规划"
)
async def delete_plan(
    plan_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """删除时间规划（软删除）"""
    service = TimePlanService(db)
    service.delete_plan(plan_id, current_user)
```

---

## 🔄 实时协同方案 (WebSocket + OT算法)

### Socket.IO服务器

```python
# app/api/websocket/collaboration.py
import socketio
from app.core.logger import logger
from app.utils.ot_algorithm import OTEngine

# 创建Socket.IO服务器
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*',
    logger=True,
    engineio_logger=True
)

# OT引擎实例
ot_engines = {}  # {plan_id: OTEngine}

@sio.event
async def connect(sid, environ, auth):
    """客户端连接"""
    logger.info(f"Client {sid} connected")
    
    # 验证JWT Token
    token = auth.get('token')
    if not token:
        raise ConnectionRefusedError('Authentication failed')
    
    # 解析token获取用户信息
    user = await verify_token(token)
    if not user:
        raise ConnectionRefusedError('Invalid token')
    
    # 保存用户信息到session
    async with sio.session(sid) as session:
        session['user_id'] = user.id
        session['username'] = user.username

@sio.event
async def disconnect(sid):
    """客户端断开"""
    async with sio.session(sid) as session:
        user_id = session.get('user_id')
        logger.info(f"Client {sid} (user: {user_id}) disconnected")

@sio.event
async def join_plan(sid, data):
    """加入计划房间"""
    plan_id = data.get('plan_id')
    
    # 权限检查
    async with sio.session(sid) as session:
        user_id = session.get('user_id')
        if not await check_plan_permission(user_id, plan_id):
            await sio.emit('error', {
                'message': 'No permission to access this plan'
            }, to=sid)
            return
    
    # 加入房间
    sio.enter_room(sid, plan_id)
    
    # 获取当前在线用户
    online_users = await get_online_users(plan_id)
    
    # 通知其他用户
    await sio.emit('user_joined', {
        'user_id': user_id,
        'online_users': online_users
    }, room=plan_id, skip_sid=sid)
    
    # 返回当前在线用户列表给新加入的用户
    await sio.emit('online_users', {
        'users': online_users
    }, to=sid)

@sio.event
async def operation(sid, data):
    """处理操作（OT算法）"""
    plan_id = data.get('plan_id')
    operation = data.get('operation')
    
    # 获取OT引擎
    if plan_id not in ot_engines:
        ot_engines[plan_id] = OTEngine(plan_id)
    
    engine = ot_engines[plan_id]
    
    # 应用操作
    try:
        transformed_op = await engine.apply_operation(operation)
        
        # 广播到其他用户（除了发送者）
        await sio.emit('operation', {
            'operation': transformed_op
        }, room=plan_id, skip_sid=sid)
        
        # 确认操作已应用
        await sio.emit('operation_ack', {
            'operation_id': operation['id'],
            'version': transformed_op['version']
        }, to=sid)
        
    except Exception as e:
        logger.error(f"Failed to apply operation: {e}")
        await sio.emit('operation_error', {
            'operation_id': operation['id'],
            'error': str(e)
        }, to=sid)

@sio.event
async def cursor(sid, data):
    """处理光标移动"""
    plan_id = data.get('plan_id')
    cursor_data = data.get('cursor')
    
    # 广播光标位置到其他用户
    await sio.emit('cursor', cursor_data, room=plan_id, skip_sid=sid)
```

### OT算法实现

```python
# app/utils/ot_algorithm.py
from typing import Dict, List, Any
from dataclasses import dataclass
from enum import Enum

class OpType(str, Enum):
    INSERT = "insert"
    DELETE = "delete"
    UPDATE = "update"
    MOVE = "move"

@dataclass
class Operation:
    id: str
    client_id: str
    type: OpType
    path: List[str]  # JSON path: ['lines', '123', 'label']
    value: Any = None
    old_value: Any = None
    version: int = 0

class OTEngine:
    """Operational Transformation引擎"""
    
    def __init__(self, plan_id: str):
        self.plan_id = plan_id
        self.version = 0
        self.history: List[Operation] = []
    
    async def apply_operation(self, op: Operation) -> Operation:
        """应用操作（核心OT逻辑）"""
        # 如果客户端版本落后，需要转换操作
        if op.version < self.version:
            op = await self._transform_operation(op)
        
        # 更新版本号
        self.version += 1
        op.version = self.version
        
        # 记录操作历史
        self.history.append(op)
        
        # 持久化到数据库
        await self._persist_operation(op)
        
        return op
    
    async def _transform_operation(self, op: Operation) -> Operation:
        """转换操作（OT核心算法）"""
        # 获取客户端版本之后的所有操作
        concurrent_ops = [
            h for h in self.history 
            if h.version > op.version
        ]
        
        # 对每个并发操作进行转换
        for concurrent_op in concurrent_ops:
            op = self._transform(op, concurrent_op)
        
        return op
    
    def _transform(self, op1: Operation, op2: Operation) -> Operation:
        """转换两个操作（简化版）"""
        # 如果路径不冲突，不需要转换
        if not self._is_conflicting_path(op1.path, op2.path):
            return op1
        
        # 相同路径的冲突处理
        if op1.path == op2.path:
            if op1.type == OpType.UPDATE and op2.type == OpType.UPDATE:
                # 两个都是更新：后者胜出（Last Write Wins）
                logger.warning(f"Conflict detected: {op1.id} vs {op2.id}")
                return op1
            elif op1.type == OpType.DELETE and op2.type == OpType.UPDATE:
                # 删除优先于更新
                return op1
            # ...更多冲突处理逻辑
        
        return op1
    
    def _is_conflicting_path(self, path1: List[str], path2: List[str]) -> bool:
        """检查路径是否冲突"""
        # 简化版：检查路径前缀是否相同
        min_len = min(len(path1), len(path2))
        return path1[:min_len] == path2[:min_len]
    
    async def _persist_operation(self, op: Operation):
        """持久化操作到数据库"""
        # 保存到collaboration表
        pass
```

---

## 🚀 部署方案

### Docker Compose配置

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/timeplan
      - REDIS_URL=redis://redis:6379/0
      - SECRET_KEY=${SECRET_KEY}
    depends_on:
      - db
      - redis
    volumes:
      - ./app:/app/app
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
  
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: timeplan
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
  
  celery_worker:
    build: .
    command: celery -A app.tasks worker --loglevel=info
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/timeplan
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - db
      - redis
  
  flower:
    build: .
    command: celery -A app.tasks flower --port=5555
    ports:
      - "5555:5555"
    environment:
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - redis

volumes:
  postgres_data:
  redis_data:
```

---

## 📝 总结

### 优势

1. **Python 3.11+性能优化**
   - 相比3.10性能提升10-60%
   - 更好的类型提示
   - 更清晰的错误信息

2. **FastAPI现代化**
   - 自动生成OpenAPI文档
   - 内置数据验证（Pydantic）
   - 异步支持优秀

3. **完整的架构**
   - 清晰的分层架构
   - Repository模式
   - Service层业务逻辑

4. **实时协同**
   - WebSocket支持
   - OT算法实现
   - 冲突自动解决

### 下一步

1. **Week 1-2**: 项目初始化 + 核心API
2. **Week 3-4**: 认证授权 + 权限系统
3. **Week 5-6**: WebSocket + OT算法
4. **Week 7-8**: 测试 + 部署

---

**技术栈已确定**: Python 3.11+ + FastAPI + PostgreSQL + Redis + Celery
