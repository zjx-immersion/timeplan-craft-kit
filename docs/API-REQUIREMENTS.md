# TimePlan Craft Kit - API需求分析

**版本**: v1.0.0  
**日期**: 2026-02-14  
**前端**: React 18 + TypeScript  
**后端**: Python 3.11+ + FastAPI  
**状态**: 📋 需求分析

---

## 📋 目录

1. [前端功能分析](#前端功能分析)
2. [API需求清单](#api需求清单)
3. [数据模型](#数据模型)
4. [实时协同需求](#实时协同需求)
5. [性能需求](#性能需求)

---

## 🎯 前端功能分析

### 核心功能模块

#### 1. **TimePlan管理** (时间规划)
**功能**:
- 创建新的时间规划
- 加载/保存时间规划
- 列表查看所有规划
- 删除/归档规划
- 重命名规划
- 复制规划

**当前实现**: LocalStorage + Zustand  
**需要**: RESTful API + 数据库持久化

---

#### 2. **Timeline管理** (时间线)
**功能**:
- 创建Timeline（泳道）
- 更新Timeline属性（名称、颜色、排序）
- 删除Timeline
- Timeline折叠/展开
- 拖拽调整Timeline顺序

**当前实现**: 本地状态管理  
**需要**: CRUD API + 实时同步

---

#### 3. **Line管理** (任务/节点)
**功能**:
- 创建Line（任务、里程碑、门禁）
- 更新Line属性（日期、名称、负责人、状态等）
- 删除Line
- 批量操作（批量编辑、批量删除）
- 拖拽移动Line（改变日期）
- 调整Line宽度（改变工期）
- 跨Timeline移动Line
- 复制/粘贴Line

**当前实现**: 本地状态 + 撤销重做  
**需要**: CRUD API + 批量操作API + 版本控制

---

#### 4. **Relation管理** (依赖关系)
**功能**:
- 创建依赖关系（FS/SS/FF/SF）
- 删除依赖关系
- 验证关系有效性（循环检测）
- 可视化关系连线
- 关键路径计算
- 依赖关系详情查看

**当前实现**: 本地计算 + 验证器  
**需要**: CRUD API + 关系验证API + 关键路径API

---

#### 5. **Baseline管理** (基线)
**功能**:
- 创建基线快照
- 对比基线差异
- 基线历史查看
- 恢复到某个基线

**当前实现**: 本地快照  
**需要**: 版本快照API + 对比API

---

#### 6. **视图切换** (多视图)
**功能**:
- 甘特图视图（主视图）
- 表格视图（数据视图）
- 矩阵视图（Product x Team）
- 迭代规划视图（MR分配）

**当前实现**: 前端渲染  
**需要**: 数据查询API（支持不同视角）

---

#### 7. **导出功能**
**功能**:
- Excel导出（.xlsx）
- PNG/PDF图像导出
- JSON数据导出
- CSV数据导出

**当前实现**: 前端本地生成  
**需要**: 服务端生成（大数据量） + 导出任务队列

---

#### 8. **用户配置**
**功能**:
- 用户偏好设置（主题、语言、默认视图）
- 视图配置保存（缩放级别、滚动位置）
- 配置导入/导出

**当前实现**: LocalStorage  
**需要**: 用户配置API + 持久化

---

#### 9. **搜索与筛选**
**功能**:
- 按名称搜索Line
- 按负责人筛选
- 按状态筛选
- 按日期范围筛选
- 按标签筛选
- 高级组合筛选

**当前实现**: 前端内存筛选  
**需要**: 搜索API + 索引优化

---

#### 10. **批量操作**
**功能**:
- 批量选择（复选框、Shift+点击、框选）
- 批量编辑（负责人、状态、标签等）
- 批量删除
- 批量移动（时间平移）
- 批量导出

**当前实现**: 前端批量操作  
**需要**: 批量操作API + 事务支持

---

## 🔌 API需求清单

### 1. TimePlan API

#### 1.1 CRUD操作
```
POST   /api/plans                     创建计划
GET    /api/plans                     获取计划列表（分页、筛选、排序）
GET    /api/plans/:id                 获取单个计划详情（含所有数据）
PUT    /api/plans/:id                 更新计划（元信息）
DELETE /api/plans/:id                 删除计划（软删除）
POST   /api/plans/:id/duplicate       复制计划
POST   /api/plans/:id/archive         归档计划
```

#### 1.2 数据操作
```
GET    /api/plans/:id/export          导出计划（JSON/Excel/PDF）
POST   /api/plans/:id/import          导入计划数据
GET    /api/plans/:id/stats           获取计划统计信息
```

**请求参数**:
- 分页: `page`, `page_size`
- 筛选: `owner`, `status`, `created_after`, `updated_after`
- 排序: `sort_by`, `order`

**响应数据**:
```typescript
interface TimePlanSummary {
  id: string;
  name: string;
  description?: string;
  owner: User;
  created_at: string;
  updated_at: string;
  last_accessed_at?: string;
  stats: {
    timeline_count: number;
    line_count: number;
    relation_count: number;
  };
}

interface TimePlanDetail {
  id: string;
  name: string;
  description?: string;
  timelines: Timeline[];
  lines: Line[];
  relations: Relation[];
  baselines: Baseline[];
  view_config: ViewConfig;
  created_at: string;
  updated_at: string;
}
```

---

### 2. Timeline API

```
POST   /api/plans/:planId/timelines              创建Timeline
GET    /api/plans/:planId/timelines              获取Timeline列表
GET    /api/plans/:planId/timelines/:id          获取单个Timeline
PUT    /api/plans/:planId/timelines/:id          更新Timeline
DELETE /api/plans/:planId/timelines/:id          删除Timeline
POST   /api/plans/:planId/timelines/reorder      批量调整顺序
```

**请求体**:
```typescript
interface CreateTimelineRequest {
  name: string;
  description?: string;
  color?: string;
  order?: number;
}

interface ReorderRequest {
  timeline_orders: { id: string; order: number }[];
}
```

---

### 3. Line API

#### 3.1 基本CRUD
```
POST   /api/plans/:planId/lines                  创建Line
GET    /api/plans/:planId/lines                  获取Line列表（支持筛选）
GET    /api/plans/:planId/lines/:id              获取单个Line
PUT    /api/plans/:planId/lines/:id              更新Line
DELETE /api/plans/:planId/lines/:id              删除Line
```

#### 3.2 批量操作
```
POST   /api/plans/:planId/lines/batch            批量创建Line
PUT    /api/plans/:planId/lines/batch            批量更新Line
DELETE /api/plans/:planId/lines/batch            批量删除Line
POST   /api/plans/:planId/lines/move             批量移动Line（时间平移）
```

#### 3.3 高级操作
```
POST   /api/plans/:planId/lines/:id/duplicate    复制Line
POST   /api/plans/:planId/lines/:id/split        拆分Line
POST   /api/plans/:planId/lines/:id/merge        合并Line
GET    /api/plans/:planId/lines/search           搜索Line
```

**请求体**:
```typescript
interface CreateLineRequest {
  timeline_id: string;
  schema_id: string;  // 'lineplan' | 'milestone' | 'gateway'
  label: string;
  start_date: string;  // ISO 8601
  end_date?: string;
  attributes: {
    owner?: string;
    status?: string;
    priority?: number;
    tags?: string[];
    description?: string;
    [key: string]: any;
  };
}

interface BatchUpdateRequest {
  line_ids: string[];
  updates: Partial<CreateLineRequest>;
  mode: 'merge' | 'replace';  // merge: 合并更新, replace: 完全替换
}

interface MoveRequest {
  line_ids: string[];
  offset_days: number;
  keep_duration: boolean;
}
```

---

### 4. Relation API

```
POST   /api/plans/:planId/relations               创建依赖关系
GET    /api/plans/:planId/relations               获取依赖关系列表
GET    /api/plans/:planId/relations/:id           获取单个依赖关系
PUT    /api/plans/:planId/relations/:id           更新依赖关系
DELETE /api/plans/:planId/relations/:id           删除依赖关系
POST   /api/plans/:planId/relations/validate      验证关系（循环检测）
GET    /api/plans/:planId/relations/critical-path 计算关键路径
```

**请求体**:
```typescript
interface CreateRelationRequest {
  from_line_id: string;
  to_line_id: string;
  type: 'FS' | 'SS' | 'FF' | 'SF';  // Finish-Start, Start-Start, etc.
  lag?: number;  // 延迟天数（可为负）
  notes?: string;
}

interface ValidateResponse {
  valid: boolean;
  errors: Array<{
    type: 'circular' | 'missing_node' | 'duplicate';
    relation_id?: string;
    message: string;
  }>;
}

interface CriticalPathResponse {
  critical_path: string[];  // Line IDs
  total_duration: number;
  earliest_start: { [lineId: string]: string };
  latest_finish: { [lineId: string]: string };
  slack: { [lineId: string]: number };
}
```

---

### 5. Baseline API

```
POST   /api/plans/:planId/baselines               创建基线
GET    /api/plans/:planId/baselines               获取基线列表
GET    /api/plans/:planId/baselines/:id           获取基线详情
DELETE /api/plans/:planId/baselines/:id           删除基线
GET    /api/plans/:planId/baselines/:id/compare   对比基线与当前状态
POST   /api/plans/:planId/baselines/:id/restore   恢复到基线
```

**请求体**:
```typescript
interface CreateBaselineRequest {
  name: string;
  description?: string;
  date: string;  // 基线日期
  include_relations?: boolean;
}

interface CompareResponse {
  added_lines: Line[];
  deleted_lines: Line[];
  modified_lines: Array<{
    id: string;
    baseline_state: Line;
    current_state: Line;
    changes: string[];  // 变更字段列表
  }>;
}
```

---

### 6. 用户与权限 API

```
POST   /api/auth/register                        用户注册
POST   /api/auth/login                           用户登录
POST   /api/auth/refresh                         刷新Token
POST   /api/auth/logout                          用户登出
GET    /api/users/me                             获取当前用户信息
PUT    /api/users/me                             更新用户信息
GET    /api/users/me/preferences                 获取用户配置
PUT    /api/users/me/preferences                 更新用户配置
```

```
GET    /api/teams                                获取团队列表
POST   /api/teams                                创建团队
GET    /api/teams/:id                            获取团队详情
PUT    /api/teams/:id                            更新团队
DELETE /api/teams/:id                            删除团队
POST   /api/teams/:id/members                    添加成员
DELETE /api/teams/:id/members/:userId           移除成员
```

```
GET    /api/projects                             获取项目列表
POST   /api/projects                             创建项目
GET    /api/projects/:id                         获取项目详情
PUT    /api/projects/:id                         更新项目
DELETE /api/projects/:id                         删除项目
POST   /api/projects/:id/members                 添加协作者
DELETE /api/projects/:id/members/:userId        移除协作者
```

---

### 7. 搜索与统计 API

```
GET    /api/plans/:planId/search                 全文搜索
GET    /api/plans/:planId/filter                 高级筛选
GET    /api/plans/:planId/statistics             统计分析
GET    /api/plans/:planId/timeline               时间轴数据（优化后的）
```

**搜索参数**:
```typescript
interface SearchRequest {
  query: string;
  type?: 'line' | 'timeline' | 'all';
  fields?: string[];  // 搜索字段：name, description, owner
  filters?: {
    timeline_ids?: string[];
    schema_ids?: string[];
    owner?: string;
    status?: string[];
    date_range?: { start: string; end: string };
    tags?: string[];
  };
  sort?: { field: string; order: 'asc' | 'desc' };
  page?: number;
  page_size?: number;
}
```

---

### 8. 导出 API

```
POST   /api/plans/:planId/export/excel           导出Excel
POST   /api/plans/:planId/export/pdf             导出PDF
POST   /api/plans/:planId/export/image           导出图片（PNG/SVG）
GET    /api/export-tasks/:taskId                 获取导出任务状态
GET    /api/export-tasks/:taskId/download        下载导出文件
```

**导出请求**:
```typescript
interface ExportRequest {
  format: 'xlsx' | 'pdf' | 'png' | 'svg';
  options: {
    include_timelines?: string[];  // 导出指定Timeline
    date_range?: { start: string; end: string };
    include_relations?: boolean;
    page_size?: 'A4' | 'A3' | 'custom';
    orientation?: 'portrait' | 'landscape';
  };
}

interface ExportTask {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;  // 0-100
  file_url?: string;
  error?: string;
  created_at: string;
}
```

---

## 🔄 实时协同需求

### WebSocket API

```
WS     /api/ws/plans/:planId                     建立WebSocket连接
```

**消息格式**:
```typescript
// 客户端 -> 服务器
interface ClientMessage {
  type: 'operation' | 'cursor' | 'heartbeat';
  data: Operation | CursorPosition | null;
}

// 服务器 -> 客户端
interface ServerMessage {
  type: 'operation' | 'cursor' | 'online_users' | 'error';
  data: Operation | CursorPosition | OnlineUser[] | Error;
}

// 操作（基于OT算法）
interface Operation {
  id: string;
  client_id: string;
  type: 'insert' | 'delete' | 'update' | 'move';
  path: string[];  // 数据路径: ['lines', '123', 'label']
  value?: any;
  old_value?: any;
  timestamp: string;
  version: number;
}

// 光标位置
interface CursorPosition {
  user_id: string;
  line_id?: string;
  position: { x: number; y: number };
}

// 在线用户
interface OnlineUser {
  user_id: string;
  username: string;
  avatar?: string;
  color: string;
  last_seen: string;
}
```

### 实时功能需求

1. **实时数据同步**
   - 使用Operational Transformation (OT)算法
   - 版本号追踪
   - 冲突自动解决

2. **在线状态管理**
   - 在线用户列表
   - 用户光标位置
   - 编辑状态指示

3. **通知系统**
   - @提及通知
   - 评论通知
   - 任务变更通知
   - 系统通知

---

## ⚡ 性能需求

### 响应时间要求

| API类型 | 目标响应时间 (P95) | 备注 |
|---------|-------------------|------|
| 查询单个计划 | < 100ms | 含全部数据 |
| 列表查询 | < 50ms | 分页后 |
| 创建/更新 | < 200ms | 单个操作 |
| 批量操作 | < 500ms | 100条以内 |
| 搜索 | < 200ms | 全文搜索 |
| 导出（小） | < 3s | <1000行 |
| 导出（大） | 异步任务 | >1000行 |
| WebSocket延迟 | < 200ms | 消息推送 |

### 并发要求

- 支持100+并发用户
- 支持10+用户同时编辑同一计划
- API QPS > 1000
- WebSocket连接 > 500

### 数据量要求

- 单个计划: 最多10000个Line
- 单个Timeline: 最多1000个Line
- 依赖关系: 最多5000条
- 基线数量: 最多100个

---

## 📝 总结

### 核心API优先级

**P0 (必须)**:
1. TimePlan CRUD
2. Timeline CRUD
3. Line CRUD + 批量操作
4. Relation CRUD + 验证
5. 用户认证 + 权限

**P1 (高优先级)**:
1. 实时同步（WebSocket）
2. 搜索筛选
3. Baseline管理
4. 用户配置

**P2 (中优先级)**:
1. 导出功能
2. 统计分析
3. 通知系统

**P3 (低优先级)**:
1. 高级搜索
2. 批量导入
3. 数据迁移工具

---

**下一步**: 基于此API需求设计Python FastAPI后端架构
