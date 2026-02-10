# Ant Design 6.2.1 升级快速参考

> 快速查阅常用 API 变化，详细内容请参考 ANTD-6-UPGRADE-ANALYSIS.md

---

## 🚀 快速开始

```bash
# 1. 创建升级分支
git checkout -b feature/timeplan-craft-kit-antd-upgrade

# 2. 升级依赖
pnpm add antd@6.2.1

# 3. 安装依赖
pnpm install

# 4. 启动开发服务器
pnpm dev

# 5. 运行测试
pnpm test
```

---

## 📊 API 速查表

### 下拉选择组件 (Select, DatePicker, Cascader, TreeSelect)

| v5 | v6 | 组件 |
|----|----|----|
| `dropdownMatchSelectWidth` | `popupMatchSelectWidth` | 所有 |
| `dropdownStyle={obj}` | `styles={{ popup: { root: obj } }}` | 所有 |
| `dropdownClassName="cls"` | `classNames={{ popup: { root: "cls" } }}` | 所有 |
| `dropdownRender={fn}` | `popupRender={fn}` | 所有 |
| `onDropdownVisibleChange={fn}` | `onOpenChange={fn}` | 所有 |
| `bordered={false}` | `variant="borderless"` | 所有 |
| `onSelect={fn}` | `onCalendarChange={fn}` | DatePicker |

---

### 弹窗组件 (Modal, Drawer)

| v5 | v6 |
|----|----|
| `bodyStyle={obj}` | `styles={{ body: obj }}` |
| `maskStyle={obj}` | `styles={{ mask: obj }}` |
| `destroyOnClose` | `destroyOnHidden` |
| `headerStyle={obj}` | `styles={{ header: obj }}` (Drawer) |
| `footerStyle={obj}` | `styles={{ footer: obj }}` (Drawer) |
| `width={num}` | `size={num}` (Drawer) |

**新增**: Modal/Drawer 默认启用 blur 效果

```tsx
// 全局禁用 blur
<ConfigProvider
  modal={{ mask: { blur: false } }}
  drawer={{ mask: { blur: false } }}
>
```

---

### 浮层组件 (Tooltip, Popover, Dropdown)

| v5 | v6 |
|----|----|
| `overlayClassName="cls"` | `classNames={{ root: "cls" }}` |
| `overlayStyle={obj}` | `styles={{ root: obj }}` |
| `overlayInnerStyle={obj}` | `styles={{ container: obj }}` |
| `destroyTooltipOnHide` | `destroyOnHidden` |
| `destroyPopupOnHide` | `destroyOnHidden` |

---

### 布局组件 (Space, Card)

| v5 | v6 | 组件 |
|----|----|----|
| `direction="horizontal"` | `orientation="horizontal"` | Space |
| `split={<Divider />}` | `separator={<Divider />}` | Space |
| `headStyle={obj}` | `styles={{ header: obj }}` | Card |
| `bodyStyle={obj}` | `styles={{ body: obj }}` | Card |
| `bordered={false}` | `variant="borderless"` | Card |

---

### 表格组件 (Table)

| v5 | v6 |
|----|----|
| `pagination={{ position: [...] }}` | `pagination={{ placement: [...] }}` |
| `onSelectInvert={fn}` | `onChange` (在 extra 中处理) |
| `filterDropdownOpen` | `filterDropdownProps.open` |
| `onFilterDropdownOpenChange` | `filterDropdownProps.onOpenChange` |

---

### 其他组件

| 组件 | v5 | v6 |
|------|----|----|
| **Button** | `iconPosition` | `iconPlacement` |
| **Alert** | `message` | `title` |
| **Alert** | `closeText` | `closable.closeIcon` |
| **Progress** | `strokeWidth` | `size` |
| **Progress** | `trailColor` | `railColor` |
| **Progress** | `gapPosition` | `gapPlacement` |
| **Slider** | `tipFormatter` | `tooltip.formatter` |
| **Slider** | `tooltipVisible` | `tooltip.open` |
| **Slider** | `tooltipPlacement` | `tooltip.placement` |
| **Collapse** | `destroyInactivePanel` | `destroyOnHidden` |
| **Collapse** | `expandIconPosition` | `expandIconPlacement` |

---

## ⚠️ 重要变化

### 1. Tag 组件 margin 移除

**问题**: v6 移除了 Tag 的默认 `margin-inline-end: 8px`

**解决方案**:
```tsx
// 推荐：使用 Space
<Space size={8} wrap>
  <Tag>标签1</Tag>
  <Tag>标签2</Tag>
</Space>

// 或全局配置
<ConfigProvider
  tag={{
    styles: { root: { marginInlineEnd: 8 } }
  }}
/>
```

---

### 2. Modal/Drawer blur 效果

**变化**: v6 默认启用遮罩模糊效果

**配置**:
```tsx
<ConfigProvider
  modal={{ mask: { blur: true } }} // 启用（默认）
  drawer={{ mask: { blur: true } }}
/>
```

---

### 3. variant 属性

**迁移规则**:
```tsx
// v5
<Input bordered={false} />

// v6
<Input variant="borderless" />

// variant 选项:
// - outlined (默认，有边框)
// - borderless (无边框)  
// - filled (填充样式)
```

---

## 📁 关键文件清单

### 必须修改（高优先级）

- ✅ `src/components/common/Select.tsx`
- ✅ `src/components/common/DatePicker.tsx`
- ✅ `src/components/common/Modal.tsx`
- ✅ `src/components/common/Input.tsx`
- ✅ `src/components/common/Button.tsx`
- ✅ `src/main.tsx` (配置 blur 效果)
- ✅ `src/theme/ThemeProvider.tsx`

### 重要修改（中优先级）

- `src/components/views/TableView.tsx`
- `src/components/views/VersionTableView.tsx`
- `src/components/dialogs/NodeEditDialog.tsx`
- `src/components/dialogs/TimelineEditDialog.tsx`
- `src/components/timeline/TimelineToolbar.tsx`
- `src/components/timeline/NodeContextMenu.tsx`
- `src/components/views/ModuleIterationView.tsx` (Tag 间距)

---

## 🔍 检查命令

```bash
# 搜索废弃 API
grep -r "dropdownMatchSelectWidth" src/
grep -r "dropdownStyle" src/
grep -r "onDropdownVisibleChange" src/
grep -r "overlayClassName" src/
grep -r "overlayStyle" src/
grep -r "bodyStyle" src/
grep -r "maskStyle" src/
grep -r "destroyOnClose" src/
grep -r "trailColor" src/

# 搜索可能需要修改的组件
grep -r "Space direction" src/
grep -r "bordered={" src/
grep -r "pagination.*position" src/
```

---

## ✅ 快速检查清单

### 升级前
- [ ] 确认 React >= 18 ✅ (项目使用 19.0.0)
- [ ] 确认 @ant-design/icons >= 6.0.0 ✅ (项目使用 6.1.0)
- [ ] 创建升级分支
- [ ] 代码备份

### 升级中
- [ ] 升级 antd 到 6.2.1
- [ ] 运行构建确认无错误
- [ ] 迁移通用组件 (Select, Modal, Input 等)
- [ ] 迁移下拉组件 API
- [ ] 迁移样式属性 (xxxStyle → styles.xxx)
- [ ] 修复 Tag 间距
- [ ] 配置 Modal blur 效果
- [ ] 迁移 Space direction → orientation
- [ ] 迁移 Table API

### 升级后
- [ ] 运行单元测试
- [ ] 手动功能测试
- [ ] 清理控制台警告
- [ ] 浏览器兼容性测试
- [ ] 性能测试
- [ ] 代码审查
- [ ] 更新文档

---

## 🛠️ 常用代码片段

### ConfigProvider 配置

```tsx
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';

<ConfigProvider
  locale={zhCN}
  theme={theme}
  // Modal blur 效果
  modal={{
    mask: { blur: true }
  }}
  // Drawer blur 效果
  drawer={{
    mask: { blur: true }
  }}
  // Tag 间距（可选）
  tag={{
    styles: {
      root: { marginInlineEnd: 8 }
    }
  }}
>
  <App />
</ConfigProvider>
```

---

### Select 迁移模板

```tsx
<Select
  placeholder="请选择"
  popupMatchSelectWidth={false}
  styles={{
    popup: {
      root: { maxHeight: 400 }
    }
  }}
  classNames={{
    popup: {
      root: 'custom-class'
    }
  }}
  popupRender={(menu) => <div>{menu}</div>}
  onOpenChange={(open) => console.log(open)}
  variant="borderless"
/>
```

---

### Modal 迁移模板

```tsx
<Modal
  title="标题"
  open={open}
  onCancel={onClose}
  styles={{
    body: { padding: 24 },
    mask: { backgroundColor: 'rgba(0,0,0,0.6)' }
  }}
  destroyOnHidden
>
  {children}
</Modal>
```

---

### Tag 列表模板

```tsx
<Space size={8} wrap>
  {tags.map(tag => (
    <Tag key={tag} color="blue">
      {tag}
    </Tag>
  ))}
</Space>
```

---

## 📚 相关文档

- **完整分析**: [ANTD-6-UPGRADE-ANALYSIS.md](./ANTD-6-UPGRADE-ANALYSIS.md)
- **代码示例**: [ANTD-6-UPGRADE-CODE-EXAMPLES.md](./ANTD-6-UPGRADE-CODE-EXAMPLES.md)
- **官方迁移指南**: https://ant.design/docs/react/migration-v6

---

## 💡 实用技巧

### 1. VSCode 批量替换技巧

使用正则表达式进行精确替换：

**替换 dropdownMatchSelectWidth**:
```
搜索: dropdownMatchSelectWidth
替换: popupMatchSelectWidth
文件类型: *.tsx, *.ts
```

**替换 onDropdownVisibleChange**:
```
搜索: onDropdownVisibleChange
替换: onOpenChange
文件类型: *.tsx, *.ts
```

### 2. Git 提交策略

建议分阶段提交，便于回滚：

```bash
# 提交 1: 依赖升级
git add package.json pnpm-lock.yaml
git commit -m "chore: 升级 Ant Design 到 6.2.1"

# 提交 2: 通用组件
git add src/components/common/
git commit -m "refactor: 迁移通用组件 API"

# 提交 3: 业务组件
git add src/components/
git commit -m "refactor: 迁移业务组件 API"

# 提交 4: 样式修复
git add src/
git commit -m "fix: 修复样式和间距问题"
```

### 3. 测试策略

优先测试高频使用的功能：
1. 所有对话框的打开/关闭
2. 所有表单的提交
3. 所有下拉选择器
4. 表格的排序/筛选/分页
5. 主题切换

---

## ⏱️ 预估工作量

| 阶段 | 工作量 | 说明 |
|------|--------|------|
| 准备工作 | 0.5 天 | 备份、创建分支、阅读文档 |
| 依赖升级 | 0.5 天 | 升级依赖、测试构建 |
| API 迁移 | 2-3 天 | 核心工作，需要仔细处理 |
| 样式调整 | 1-2 天 | Tag 间距、blur 效果等 |
| 功能测试 | 2-3 天 | 全面测试所有功能 |
| 优化文档 | 1 天 | 清理代码、更新文档 |
| **总计** | **6-8 天** | 根据团队规模可调整 |

---

## 🎯 成功标准

### 构建阶段
- ✅ 无 TypeScript 编译错误
- ✅ 无 ESLint 错误
- ✅ 构建成功

### 运行阶段
- ✅ 无控制台错误
- ✅ 所有 deprecated API 警告已清除
- ✅ 所有功能正常运行
- ✅ 单元测试全部通过

### 视觉阶段
- ✅ UI 显示正常，无明显变化
- ✅ 响应式布局正常
- ✅ 主题切换正常
- ✅ 所有图标显示正常

### 性能阶段
- ✅ CSS 体积减少 20-30%
- ✅ 页面加载速度无明显下降
- ✅ 交互流畅，无卡顿

---

**快速参考版本**: 1.0.0  
**最后更新**: 2026-02-10  
**适用项目**: timeplan-craft-kit v2.0.0
