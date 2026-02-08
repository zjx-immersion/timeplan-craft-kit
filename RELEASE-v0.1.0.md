# 🎉 v0.1.0 Release Notes

## 发布信息

- **版本号**: v0.1.0
- **发布日期**: 2026-02-08
- **仓库地址**: https://github.com/zjx-immersion/timeplan-craft-kit
- **Release页面**: https://github.com/zjx-immersion/timeplan-craft-kit/releases/tag/v0.1.0

---

## ✅ 已完成任务清单

### 1. 代码提交 ✅
- 提交记录: `74f235a - release: v0.1.0 - 核心时间轴组件首个稳定版本`
- 修改文件: 47个
- 新增代码: 13,832行插入
- 修改代码: 321行删除

### 2. GitHub仓库创建 ✅
- 仓库名称: `timeplan-craft-kit`
- 仓库类型: Public
- 仓库地址: https://github.com/zjx-immersion/timeplan-craft-kit
- 远程分支: `origin/main`

### 3. README更新 ✅
- 版本号更新: v3.0.0 → v0.1.0
- 添加v0.1.0版本更新说明
- 添加完整的10个版本修复历史
- 添加技术亮点和文档索引
- 添加版本历史章节

### 4. Git Tag创建 ✅
- Tag名称: `v0.1.0`
- Tag类型: Annotated tag（带注释）
- Tag推送: 已推送到origin

### 5. GitHub Release发布 ✅
- Release标题: "v0.1.0 - 核心时间轴组件首个稳定版本"
- Release说明: 完整的功能介绍、修复历史、技术亮点
- Release链接: https://github.com/zjx-immersion/timeplan-craft-kit/releases/tag/v0.1.0

---

## 📦 本次发布内容

### 核心功能

#### 时间轴甘特图组件
- ✅ 多时间刻度（日/周/双周/月/季度视图）
- ✅ 拖拽编辑（移动、调整大小）
- ✅ 磁吸对齐（智能吸附，1天阈值）
- ✅ 删除功能（Delete/Backspace）
- ✅ 多种节点类型（Bar/Milestone/Gateway）
- ✅ 依赖关系可视化

#### 编辑体验优化
- ✅ 拖拽时显示完整日期范围
- ✅ 局部磁吸提示（绿色圆点+脉冲动画）
- ✅ 像素级精确对齐
- ✅ 流畅的视觉反馈

### 10个版本迭代

| 版本 | 主要内容 | 影响 |
|------|---------|------|
| V1-V4 | 单元测试覆盖 | 验证关键算法 |
| V5 | 删除、拖拽、UI优化 | 编辑功能完善 |
| V7 | 关键对齐修复 ⭐ | 像素级精确 |
| V8 | Bar边界对齐 | 视觉精确度 |
| V9 | 拖拽显示增强 | 用户体验 |
| V10 | 磁吸效果优化 | 视觉反馈 |

### 核心修改文件

1. **`src/utils/dateUtils.ts`** - 视图日期规范化修复
2. **`src/components/timeline/TimelineHeader.tsx`** - 头部宽度计算修复
3. **`src/components/timeline/TimelinePanel.tsx`** - 删除、拖拽、磁吸优化
4. **`src/components/timeline/LineRenderer.tsx`** - Bar边界对齐
5. **`src/hooks/useBarResize.ts`** - 拖拽长度修复

### 新增测试文件

- `src/utils/__tests__/dateUtils.test.ts` - 日期工具函数测试
- `src/hooks/__tests__/useBarResize.test.ts` - 拖拽调整Hook测试

### 新增文档

1. `docs/FIXES-SUMMARY.md` - 完整修复历史总结
2. `docs/V7-ALIGNMENT-FIX.md` - 关键对齐修复详解
3. `docs/V8-BAR-BOUNDARY-FIX.md` - Bar边界修复
4. `docs/V9-DRAG-DATE-DISPLAY.md` - 拖拽显示增强
5. `docs/V10-MAGNETIC-SNAP-FIX.md` - 磁吸效果优化

---

## 🎯 技术亮点

### 1. 单元测试覆盖
```typescript
// Vitest + React Testing Library
npm run test              // 运行所有测试
npm run test:ui          // 带UI的测试
npm run test:coverage    // 生成覆盖率报告
```

### 2. 日期对齐精度
- **像素级精确对齐**
- 时间轴、今日线、节点完全垂直对齐
- 统一的日期计算算法

### 3. 磁吸算法
```typescript
const MAGNETIC_SNAP_THRESHOLD_DAYS = 1;  // 1天内自动吸附
```
- 智能检测临近元素
- 自动吸附对齐
- 局部视觉反馈

### 4. 视觉反馈
```css
@keyframes magneticPulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.3); opacity: 0.7; }
}
```
- CSS脉冲动画
- 绿色圆点指示器
- 柔和的视觉提示

---

## 🚀 快速开始

### 克隆仓库
```bash
git clone https://github.com/zjx-immersion/timeplan-craft-kit.git
cd timeplan-craft-kit
```

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
# 访问: http://localhost:9081
```

### 运行测试
```bash
npm run test
```

### 构建
```bash
npm run build
```

---

## 📚 文档导航

### 核心文档
- [README.md](README.md) - 项目概览
- [FIXES-SUMMARY.md](docs/FIXES-SUMMARY.md) - 完整修复历史

### 版本修复文档
- [V7-ALIGNMENT-FIX.md](docs/V7-ALIGNMENT-FIX.md) - 关键对齐修复
- [V8-BAR-BOUNDARY-FIX.md](docs/V8-BAR-BOUNDARY-FIX.md) - Bar边界修复
- [V9-DRAG-DATE-DISPLAY.md](docs/V9-DRAG-DATE-DISPLAY.md) - 拖拽显示增强
- [V10-MAGNETIC-SNAP-FIX.md](docs/V10-MAGNETIC-SNAP-FIX.md) - 磁吸效果优化

### 测试文档
- [V5-TEST-REPORT.md](docs/V5-TEST-REPORT.md) - 测试报告
- [TEST-FEEDBACK-FIXES.md](docs/TEST-FEEDBACK-FIXES.md) - 测试反馈修复

---

## 📊 版本统计

### 代码变更
- **修改文件**: 47个
- **新增插入**: 13,832行
- **删除修改**: 321行
- **净增代码**: 13,511行

### 文档产出
- **核心文档**: 5个
- **修复文档**: 5个
- **测试文档**: 2个
- **总计**: 12个文档

### 测试覆盖
- **测试文件**: 2个
- **测试用例**: 50+个
- **覆盖模块**: 日期计算、拖拽调整

---

## 🎊 致谢

感谢所有参与测试和反馈的用户！

特别感谢：
- 提供详细反馈的测试用户
- 参考项目 `timeline-craft-kit` 的作者

---

## 📞 联系方式

- **仓库**: https://github.com/zjx-immersion/timeplan-craft-kit
- **Issues**: https://github.com/zjx-immersion/timeplan-craft-kit/issues
- **Release**: https://github.com/zjx-immersion/timeplan-craft-kit/releases/tag/v0.1.0

---

**发布人**: zjx-immersion  
**发布日期**: 2026-02-08  
**许可证**: MIT  
**状态**: ✅ 已发布

🎉 **v0.1.0 首个稳定版本发布成功！** 🎉
