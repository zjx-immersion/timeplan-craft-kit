# Ant Design 6.2.1 升级文档总览

> timeplan-craft-kit 项目 Ant Design 升级专题文档

---

## 📚 文档索引

本升级方案包含以下文档，请根据需要查阅：

### 1. 📋 [完整分析报告](./ANTD-6-UPGRADE-ANALYSIS.md)
**适合人群**: 项目负责人、技术架构师、所有开发人员

**内容概要**:
- ✅ 前置条件检查
- 📊 组件使用情况全面分析（69 个 TSX 文件）
- 🔧 详细的适配和调整方案
- 📝 分 7 个阶段的详细升级步骤
- ⚠️ 风险评估与应对措施
- 📈 预期收益分析
- ✅ 完整的升级检查清单

**何时阅读**: 升级前必读，全面了解升级影响和计划

---

### 2. 💻 [代码示例与脚本](./ANTD-6-UPGRADE-CODE-EXAMPLES.md)
**适合人群**: 开发人员、负责具体实施的工程师

**内容概要**:
- 🚀 快速替换脚本（Bash/VSCode）
- 🔧 13 个组件的完整迁移示例
  - Select / DatePicker
  - Modal / Drawer
  - Dropdown / Tooltip
  - Table / Space
  - Card / Alert / Progress
  - Slider / Tag
- 🛠️ 通用辅助函数和工具
- 📝 VSCode 代码片段配置
- 🔍 自动化检查脚本

**何时使用**: 实际编码时查阅，复制粘贴代码示例

---

### 3. ⚡ [快速参考手册](./ANTD-6-UPGRADE-QUICK-REFERENCE.md)
**适合人群**: 所有开发人员、升级过程中的快速查询

**内容概要**:
- 📊 API 速查表（一目了然）
- ⚠️ 重要变化说明
- 📁 关键文件清单
- 🔍 常用检查命令
- ✅ 快速检查清单
- 🛠️ 常用代码片段
- 💡 实用技巧
- ⏱️ 工作量预估

**何时使用**: 升级过程中随时查阅，快速查找 API 对照

---

## 🎯 使用指南

### 场景 1: 开始升级前
**阅读顺序**:
1. 📋 完整分析报告 - 了解全貌
2. ⚡ 快速参考手册 - 确认关键点
3. 💻 代码示例 - 浏览了解

**目标**: 
- 了解升级影响范围
- 评估工作量和风险
- 制定升级计划

---

### 场景 2: 正在实施升级
**使用方式**:
- 📋 完整分析报告 - 跟随详细步骤执行
- 💻 代码示例 - 复制代码，参考示例
- ⚡ 快速参考 - 快速查 API 对照表

**建议**: 
- 将快速参考手册放在第二屏随时查阅
- 代码示例文档用于复制具体实现
- 遇到问题回查完整分析报告

---

### 场景 3: 升级后验证
**检查内容**:
- ✅ 完整分析报告的检查清单
- ⚡ 快速参考的成功标准
- 💻 代码示例的检查脚本

**验证步骤**:
```bash
# 1. 运行检查脚本
node scripts/check-antd6-migration.js

# 2. 运行测试
pnpm test

# 3. 手动测试
pnpm dev
```

---

## 📊 项目现状

### 技术栈信息
- **项目**: timeplan-craft-kit v2.0.0
- **当前 Ant Design**: 5.22.6
- **目标 Ant Design**: 6.2.1
- **React 版本**: 19.0.0 ✅
- **@ant-design/icons**: 6.1.0 ✅
- **开发语言**: TypeScript 5.6.2
- **包管理器**: pnpm

### 组件使用统计
- **TSX 文件**: 69 个
- **TS 文件**: 54 个
- **使用的组件**: 40+ 个 Ant Design 组件
- **自定义封装**: 5 个通用组件（Button, Modal, Input, Select, DatePicker）

---

## ⏱️ 升级时间线

### 预计工作量：6-8 人天

```
阶段 1: 准备工作 (0.5 天)
├── 代码备份
├── 创建升级分支
├── 阅读升级文档
└── 创建测试清单

阶段 2: 依赖升级 (0.5 天)
├── 升级 antd 到 6.2.1
├── 确认相关依赖
├── 测试构建
└── 启动开发服务器

阶段 3: API 迁移 (2-3 天) ⭐ 核心工作
├── 全局 API 替换
│   ├── 下拉组件 API (Select, DatePicker 等)
│   ├── Space direction → orientation
│   ├── Dropdown 组件 API
│   └── Tooltip 组件 API
├── 样式属性替换
│   ├── Modal/Drawer 样式
│   ├── Card 样式
│   └── Table API
└── 组件特定 API
    ├── Alert, Progress, Slider
    └── variant 属性迁移

阶段 4: 样式调整 (1-2 天)
├── Tag 间距修复
├── Modal/Drawer blur 配置
├── 自定义样式验证
└── 主题配置更新

阶段 5: 功能测试 (2-3 天)
├── 自动化测试
├── 手动功能测试
├── 浏览器兼容性测试
└── 控制台警告清理

阶段 6: 优化与文档 (1 天)
├── 代码优化
├── 性能检查
├── 文档更新
└── 提交代码

阶段 7: 发布与监控 (0.5 天)
├── 预发布测试
├── 合并主分支
└── 发布后监控
```

---

## ⚠️ 关键注意事项

### 必须处理的变化

#### 1. Tag 组件 margin 移除 🔴
```tsx
// 影响：Tag 列表间距消失
// 解决：使用 Space 组件包裹
<Space size={8} wrap>
  <Tag>标签1</Tag>
  <Tag>标签2</Tag>
</Space>
```

#### 2. Modal/Drawer blur 效果 🟡
```tsx
// 影响：遮罩模糊效果（默认启用）
// 配置：根据需要调整
<ConfigProvider
  modal={{ mask: { blur: true } }}
  drawer={{ mask: { blur: true } }}
/>
```

#### 3. 大量 API 重命名 🔴
```tsx
// 主要变化：
// dropdown → popup
// overlay → classNames/styles
// xxxStyle → styles.xxx
// direction → orientation
// bordered → variant
```

---

## 🎯 升级收益

### 性能提升
- ✅ **CSS 体积**: 减少 20-30%
- ✅ **主题切换**: 性能显著提升（CSS 变量）
- ✅ **渲染性能**: DOM 结构优化

### 开发体验
- ✅ **API 一致性**: 更统一的命名规范
- ✅ **类型安全**: 更好的 TypeScript 支持
- ✅ **可维护性**: 移除废弃 API

### 用户体验
- ✅ **现代视觉**: Modal blur 效果
- ✅ **加载速度**: CSS 体积减少
- ✅ **交互流畅**: 性能优化

---

## 📝 快速开始

### 1 分钟快速启动升级

```bash
# 1. 创建分支
git checkout -b feature/timeplan-craft-kit-antd-upgrade

# 2. 升级依赖
pnpm add antd@6.2.1

# 3. 安装并测试
pnpm install && pnpm build

# 4. 开始迁移
# 参考 ANTD-6-UPGRADE-CODE-EXAMPLES.md 中的代码示例
# 使用 ANTD-6-UPGRADE-QUICK-REFERENCE.md 查询 API

# 5. 运行检查
node scripts/check-antd6-migration.js

# 6. 测试
pnpm test && pnpm dev
```

---

## 🔗 相关资源

### 官方资源
- [Ant Design 6.x 官方文档](https://ant.design/)
- [v5 到 v6 迁移指南](https://ant.design/docs/react/migration-v6)
- [Ant Design Changelog](https://ant.design/changelog)
- [GitHub Issues](https://github.com/ant-design/ant-design/issues)

### 社区资源
- [Ant Design 6 实践指南](https://medium.com/@leandroaps/migrating-from-ant-design-v5-to-v6-a-practical-guide-for-frontend-teams-12aba4df425d)
- [CSS in v6 技术博客](https://ant.design/docs/blog/css-tricks)

---

## 🤝 团队协作

### 如果是团队开发

#### 分工建议
```
成员 A: 通用组件迁移
  └── Button, Modal, Input, Select, DatePicker

成员 B: 对话框和表单
  └── 所有 Dialog 组件

成员 C: 视图和表格
  └── TableView, IterationView 等

成员 D: 主题和样式
  └── Theme, Tag spacing, blur 配置

全员: 各自负责模块的测试
```

#### 协作流程
1. 创建共享升级分支
2. 各成员创建子分支
3. 完成后 Pull Request
4. Code Review
5. 合并到升级分支
6. 集成测试
7. 合并到主分支

---

## 💬 获取帮助

### 遇到问题？

1. **查阅文档**
   - 先查快速参考手册
   - 再查完整分析报告
   - 最后查代码示例

2. **搜索问题**
   - 官方 GitHub Issues
   - Ant Design 文档
   - Stack Overflow

3. **提问方式**
   - 提供错误信息
   - 提供相关代码
   - 说明已尝试的解决方案

---

## ✅ 升级完成标准

### 构建成功
- ✅ 无 TypeScript 错误
- ✅ 无 ESLint 错误  
- ✅ 构建成功

### 运行正常
- ✅ 无控制台错误
- ✅ 无 deprecated 警告
- ✅ 所有功能正常
- ✅ 单元测试通过

### 视觉正确
- ✅ UI 显示正常
- ✅ 响应式正常
- ✅ 主题切换正常
- ✅ 图标显示正常

### 性能达标
- ✅ CSS 体积减少
- ✅ 加载速度正常
- ✅ 交互流畅

---

## 📞 联系方式

- **技术负责人**: [待填写]
- **升级负责人**: [待填写]
- **紧急联系**: [待填写]

---

## 📅 版本历史

| 版本 | 日期 | 作者 | 说明 |
|------|------|------|------|
| 1.0.0 | 2026-02-10 | AI Assistant | 初始版本，完整升级方案 |

---

## 📄 文档清单

本升级方案包含以下文档：

```
timeplan-craft-kit/docs/
├── README-ANTD6-UPGRADE.md              # 本文档 - 总览
├── ANTD-6-UPGRADE-ANALYSIS.md           # 完整分析报告（主文档）
├── ANTD-6-UPGRADE-CODE-EXAMPLES.md      # 代码示例与脚本
└── ANTD-6-UPGRADE-QUICK-REFERENCE.md    # 快速参考手册

建议配套脚本：
scripts/
├── migrate-antd6.sh                     # 自动化替换脚本
└── check-antd6-migration.js             # 升级检查脚本
```

---

## 🎓 学习建议

### 首次接触升级任务？

**学习路径**:
1. 先读本文档（总览）- 10 分钟
2. 快速翻阅快速参考手册 - 15 分钟
3. 详细阅读完整分析报告 - 1-2 小时
4. 浏览代码示例文档 - 30 分钟
5. 开始实践 - 边做边查

**关键点**:
- 不要试图一次记住所有内容
- 升级过程中随时查阅文档
- 遇到问题先查快速参考，再查详细文档
- 多看代码示例，理解迁移模式

---

## 🚀 开始升级

**准备好了吗？**

1. ✅ 已阅读本总览文档
2. ✅ 已浏览快速参考手册
3. ✅ 已了解关键变化
4. ✅ 代码已备份
5. ✅ 创建了升级分支

**那么，开始吧！** 🎉

👉 下一步：打开 [完整分析报告](./ANTD-6-UPGRADE-ANALYSIS.md)，跟随详细步骤执行升级

---

**祝升级顺利！** 🌟

---

**文档版本**: 1.0.0  
**最后更新**: 2026-02-10  
**文档作者**: AI Assistant  
**审阅状态**: 待审阅
