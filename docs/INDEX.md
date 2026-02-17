# Timeplan Craft Kit - 文档索引

## 📚 核心文档

### 设计文档
- [PRODUCT-REQUIREMENTS-DOCUMENT.md](./PRODUCT-REQUIREMENTS-DOCUMENT.md) - 产品需求文档
- [CORE-DESIGN.md](./CORE-DESIGN.md) - 核心设计文档
- [UNIFIED-DESIGN.md](./UNIFIED-DESIGN.md) - 统一设计方案
- [COMPLETE-SOLUTION-DESIGN.md](./COMPLETE-SOLUTION-DESIGN.md) - 完整解决方案设计

### 后端集成
- [BACKEND-ARCHITECTURE-PYTHON.md](./BACKEND-ARCHITECTURE-PYTHON.md) - 后端架构设计
- [API-REQUIREMENTS.md](./API-REQUIREMENTS.md) - API 需求文档
- [FRONTEND_BACKEND_INTEGRATION.md](./FRONTEND_BACKEND_INTEGRATION.md) - 前后端集成方案
- [TDD_IMPLEMENTATION_PLAN.md](./TDD_IMPLEMENTATION_PLAN.md) - TDD 实施计划
- [OPENAPI_SCHEMA.yaml](./OPENAPI_SCHEMA.yaml) - OpenAPI 规范

### 视图设计
- [PLAN-VIEW-ENHANCEMENT-DESIGN.md](./PLAN-VIEW-ENHANCEMENT-DESIGN.md) - Plan View 增强设计
- [ITERATION-VIEW-DESIGN.md](./ITERATION-VIEW-DESIGN.md) - Iteration View 设计
- [MODULE-ITERATION-VIEW-GUIDE.md](./MODULE-ITERATION-VIEW-GUIDE.md) - 模块迭代视图指南

### 技术分析
- [TIMELINE-CALCULATION-ANALYSIS.md](./TIMELINE-CALCULATION-ANALYSIS.md) - 时间线计算分析

### 实施指南
- [IMPLEMENTATION-GUIDE.md](./IMPLEMENTATION-GUIDE.md) - 实施指南

---

## 📦 主文档

- [README.md](../README.md) - 项目主文档
- [FAQ.md](../FAQ.md) - 常见问题
- [CHANGELOG-ANTD6.md](../CHANGELOG-ANTD6.md) - Ant Design 6 升级日志

---

## 🗂️ 归档文档

历史文档和过程记录已归档到 [archive/](./archive/) 目录。

---

## 📋 项目概览

### 技术栈
- **React**: 19.0.0
- **TypeScript**: 5.6.2
- **Ant Design**: 6.2.1
- **Zustand**: 5.0.3
- **Vite**: 6.0.3

### 核心功能
1. **5 种视图模式** - Gantt, Matrix, Kanban, Table, Timeline
2. **计划管理** - 创建、编辑、删除计划
3. **时间线管理** - 多时间线支持
4. **节点管理** - Bar, Milestone, Gateway, Line（嵌套计划）
5. **依赖关系** - 可视化依赖连线
6. **基线对比** - 快照和版本对比
7. **导入导出** - Excel、图片导出

### 测试覆盖
- ✅ **465+ 测试用例**
- ✅ **87% 代码覆盖率**

---

## 🔗 相关资源

- **GitHub**: https://github.com/zjx-immersion/timeplan-craft-kit
- **后端项目**: [timeplan-backend](https://github.com/zjx-immersion/timeplan-backend)
- **在线演示**: [待部署]

---

## 📖 快速开始

```bash
# 安装依赖
npm install --legacy-peer-deps

# 启动开发服务器
npm run dev

# 运行测试
npm test

# 构建生产版本
npm run build
```

---

**最后更新**: 2026-02-17
