# Ant Design 6.2.1 升级日志

## v2.0.1 - Ant Design 6.2.1 升级 (2026-02-10)

### 🚀 重大升级

#### 依赖升级
- ⬆️ **Ant Design**: 5.22.6 → **6.2.1**
- ✅ **@ant-design/icons**: 6.1.0（已兼容）
- ✅ **React**: 19.0.0（满足要求 >=18）

---

### 🔧 API 迁移

#### Modal 组件
```typescript
// v5 → v6
destroyOnClose → destroyOnHidden
```

**影响文件** (6 个):
- `src/components/common/Modal.tsx`
- `src/components/dialogs/TimelineEditDialog.tsx`
- `src/components/dialogs/TimelineTimeShiftDialog.tsx`
- `src/components/dialogs/ImageExportDialog.tsx`
- `src/components/timeline/BaselineRangeEditDialog.tsx`
- `src/components/timeline/BaselineEditDialog.tsx`

---

#### Space 组件
```typescript
// v5 → v6
direction="vertical" → orientation="vertical"
direction="horizontal" → orientation="horizontal"
```

**影响文件** (9 个):
- `src/components/dialogs/ExportDialog.tsx`
- `src/components/dialogs/ImportDialog.tsx`
- `src/components/dialogs/TimelineTimeShiftDialog.tsx`
- `src/components/dialogs/ImageExportDialog.tsx`
- `src/components/iteration/IterationMarkers.tsx`
- `src/components/views/IterationView.tsx`
- `src/components/views/ModuleIterationView.tsx`
- `src/components/timeline/TimelinePanel.tsx`

---

#### Card 组件
```typescript
// v5 → v6
bodyStyle={{ ... }} → styles={{ body: { ... } }}
```

**影响文件** (2 个):
- `src/components/iteration/ProductSelector.tsx`
- `src/components/views/ModuleIterationView.tsx`

---

#### DatePicker 组件
```typescript
// v5 类型定义
onChange?: (date: Dayjs | null, ...) => void

// v6 类型定义（支持 multiple 模式）
onChange?: (date: Dayjs | Dayjs[] | null, ...) => void
```

**影响文件** (1 个):
- `src/components/common/DatePicker.tsx`

---

### ✨ 新增功能

#### Modal 遮罩模糊效果
```typescript
// src/main.tsx
<ConfigProvider
  modal={{
    mask: {
      blur: true,  // 启用 v6 的模糊效果
    },
  }}
>
```

**效果**: 
- 更现代的视觉体验
- 更好的视觉层次感
- 符合最新设计规范

---

### 📈 性能提升

#### CSS 优化
- ✅ **CSS 体积减少**: 预计 20-30%（通过 CSS 变量）
- ✅ **主题切换性能**: 显著提升（CSS 变量即时切换）
- ✅ **组件渲染**: DOM 结构优化

#### 构建优化
- ✅ 更快的构建速度
- ✅ 更小的打包体积
- ✅ 更好的 Tree Shaking

---

### ✅ 验证结果

#### 代码质量
- ✅ **零 deprecated 警告**
- ✅ **TypeScript 编译通过**
- ✅ **ESLint 无新增错误**
- ✅ **所有 API 符合 v6 规范**

#### 功能验证
- ✅ **所有对话框正常运行**
- ✅ **表单提交功能正常**
- ✅ **下拉选择器正常**
- ✅ **表格操作正常**
- ✅ **视图切换正常**

#### 视觉验证
- ✅ **UI 显示效果一致**
- ✅ **Modal blur 效果正常**
- ✅ **Tag 间距正常**
- ✅ **响应式布局正常**

---

### 📚 文档更新

#### 新增文档 (7 个)
1. **README-ANTD6-UPGRADE.md** - 升级文档总览
2. **ANTD-6-UPGRADE-ANALYSIS.md** - 完整分析报告（2100+ 行）
3. **ANTD-6-UPGRADE-CODE-EXAMPLES.md** - 代码示例（1500+ 行）
4. **ANTD-6-UPGRADE-QUICK-REFERENCE.md** - 快速参考（450+ 行）
5. **ANTD-6-UPGRADE-PROGRESS.md** - 进度跟踪
6. **ANTD-6-UPGRADE-SUMMARY.md** - 完成总结
7. **CHANGELOG-ANTD6.md** - 本升级日志

#### 更新文档 (1 个)
- **README.md** - 添加 v2.0.1 版本说明

---

### 🔄 Breaking Changes

#### 用户需知
**无破坏性变更**

所有 API 迁移对最终用户透明，不影响功能使用。

#### 开发者需知
如需继续开发，请注意：
- 使用 `destroyOnHidden` 而非 `destroyOnClose`
- 使用 `orientation` 而非 `direction`（Space 组件）
- Card 样式使用 `styles.body` 而非 `bodyStyle`
- DatePicker onChange 类型支持数组

---

### 🛠️ 迁移指南

#### 从 v5 迁移到 v6
如果您有自定义的扩展或修改，请参考：
- [完整迁移指南](./docs/README-ANTD6-UPGRADE.md)
- [API 对照表](./docs/ANTD-6-UPGRADE-QUICK-REFERENCE.md)
- [代码示例](./docs/ANTD-6-UPGRADE-CODE-EXAMPLES.md)

---

### 🙏 致谢

感谢 Ant Design 团队提供的优秀组件库和详细的迁移文档。

---

### 📞 问题反馈

如遇到问题，请：
1. 查阅 [升级文档](./docs/README-ANTD6-UPGRADE.md)
2. 查看 [常见问题](./docs/ANTD-6-UPGRADE-ANALYSIS.md#常见问题)
3. 提交 Issue

---

**升级日期**: 2026-02-10  
**升级负责人**: AI Assistant  
**版本**: v2.0.1
