# TimePlan Craft Kit - 快速开始

**新项目**: 基于 Ant Design 的 1:1 迁移版本  
**端口**: 9081（避免与原项目 9080 冲突）  
**状态**: 🚧 开发中

---

## 📦 安装依赖

### 方式一: npm

```bash
cd timeplan-craft-kit
npm install
```

### 方式二: 快速脚本

```bash
cd timeplan-craft-kit
./start.sh
```

---

## 🚀 启动项目

### 开发模式

```bash
npm run dev
```

访问: http://localhost:9081

### 生产构建

```bash
npm run build
npm run preview
```

---

## 🔧 开发指南

### 项目结构

```
src/
├── components/     # UI 组件（Ant Design）
├── pages/          # 页面组件
├── stores/         # Zustand 状态管理
├── hooks/          # 自定义 Hooks
├── utils/          # 工具函数
├── types/          # TypeScript 类型
└── theme/          # Ant Design 主题
```

### 核心技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 19.2.0 | UI框架 |
| TypeScript | 5.9.3 | 类型系统 |
| Ant Design | 6.2.1 | UI组件库 |
| Zustand | 5.0.10 | 状态管理 |
| @dnd-kit | 6.3.1 | 拖拽功能 |
| date-fns | 3.6.0 | 日期处理 |
| Vite | 7.2.4 | 构建工具 |

---

## ✅ 已完成功能

### 基础设施

- [x] 项目配置（package.json, vite.config.ts等）
- [x] Ant Design 主题配置
- [x] TypeScript 类型定义
- [x] Zustand Store（状态管理）

### 页面组件

- [x] TimePlanList（项目列表页）
  - 项目列表展示
  - 创建/编辑/删除项目
  - 搜索和排序
  
- [x] Index（项目详情页）
  - 页面框架
  - 🚧 待实现: TimelinePanel 组件
  
- [x] NotFound（404页面）

---

## 🚧 开发中功能

### 核心组件（待迁移）

1. **TimelinePanel**（甘特图主容器）- 优先级: P0
2. **TimelineToolbar**（工具栏）- 优先级: P0
3. **TimelineRow**（时间线行）- 优先级: P0
4. **DependencyLines**（依赖连线）- 优先级: P1
5. ... 更多组件详见 [MIGRATION-TASKS.md](./MIGRATION-TASKS.md)

---

## 📊 迁移进度

| 类别 | 总数 | 已完成 | 进度 |
|------|------|--------|------|
| 环境配置 | 10 | 10 | 100% |
| 基础组件 | 5 | 3 | 60% |
| 页面组件 | 3 | 3 | 100% |
| 时间线组件 | 26 | 0 | 0% |
| 迭代规划组件 | 9 | 0 | 0% |
| Hooks/工具 | 13 | 0 | 0% |
| **总体** | **66** | **16** | **24%** |

详细任务清单: [MIGRATION-TASKS.md](./MIGRATION-TASKS.md)

---

## 🧪 测试

### 运行测试

```bash
npm run test
```

### 监听模式

```bash
npm run test:watch
```

### 覆盖率

```bash
npm run test:coverage
```

---

## 🔗 相关链接

- **原项目**: [timeline-craft-kit](../../timeline-craft-kit/)
- **迁移指南**: [MIGRATION-1TO1-GUIDE.md](../../timeline-craft-kit/docs/MIGRATION-1TO1-GUIDE.md)
- **任务清单**: [MIGRATION-TASKS.md](./MIGRATION-TASKS.md)
- **技术栈分析**: [TECH-STACK-ANALYSIS.md](../../timeline-craft-kit/docs/TECH-STACK-ANALYSIS.md)

---

## 💡 开发贴士

### 1. 状态管理

使用 Zustand Store 替代原项目的 Context:

```typescript
import { useTimePlanStore } from '@/stores/timePlanStore';

const { plans, addPlan, updatePlan } = useTimePlanStore();
```

### 2. Ant Design Token

使用 Token 替代 Tailwind CSS:

```typescript
import { theme } from 'antd';

const { token } = theme.useToken();

<div style={{ 
  padding: token.padding,
  borderRadius: token.borderRadius,
  backgroundColor: token.colorBgContainer,
}}>
```

### 3. 对比验证

每完成一个组件，立即与原项目对比:

- 功能对比: 所有功能点是否一致
- UI 对比: 截图对比，视觉是否一致
- 数据对比: 数据流和状态是否一致

---

## ❓ 常见问题

### Q: 为什么是独立项目而不是在原项目中创建 v2 目录？

A: 独立项目的优势:
- ✅ 完全隔离，不影响原项目
- ✅ 可以并行开发和运行
- ✅ 便于对比验证
- ✅ 依赖管理更清晰

### Q: 如何同时运行两个项目？

A: 
```bash
# 终端1: 原项目（端口 9080）
cd timeline-craft-kit
npm run dev

# 终端2: 新项目（端口 9081）
cd timeplan-craft-kit
npm run dev
```

### Q: 如何确保 1:1 还原？

A: 遵循三个原则:
1. **功能一致**: 所有功能点 100% 还原
2. **UI 一致**: 视觉效果完全一致
3. **数据一致**: 数据结构和处理逻辑一致

---

## 📞 联系方式

- **问题反馈**: 提交 Issue
- **迁移文档**: 查看 [MIGRATION-1TO1-GUIDE.md](../../timeline-craft-kit/docs/MIGRATION-1TO1-GUIDE.md)
- **任务认领**: 查看 [MIGRATION-TASKS.md](./MIGRATION-TASKS.md)

---

**最后更新**: 2026-01-27  
**版本**: 1.0.0  
**状态**: 🚧 开发中
