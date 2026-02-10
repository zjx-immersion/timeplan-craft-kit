# Ant Design 6.2.1 升级分析报告

## 📋 项目信息

- **项目名称**: timeplan-craft-kit
- **当前版本**: 2.0.0
- **当前 Ant Design 版本**: 5.22.6
- **目标 Ant Design 版本**: 6.2.1
- **React 版本**: 19.0.0 ✅
- **@ant-design/icons 版本**: 6.1.0 ✅
- **分析日期**: 2026-02-10

---

## 🎯 升级目标

将 timeplan-craft-kit 项目从 Ant Design 5.22.6 升级到 6.2.1，确保：
1. 所有功能正常运行
2. UI 视觉效果保持一致
3. 性能得到提升（CSS 体积减少、CSS 变量优化）
4. 代码符合最新 API 标准，避免使用已废弃的 API

---

## ✅ 前置条件检查

### 已满足的条件
- ✅ **React 版本**: 19.0.0（要求 >= 18）
- ✅ **@ant-design/icons**: 6.1.0（要求 >= 6.0.0）
- ✅ **浏览器支持**: 仅支持现代浏览器，无 IE 兼容需求
- ✅ **React 19 补丁**: 无需 `@ant-design/v5-patch-for-react-19`

### 需要检查的内容
- ⚠️ **自定义样式**: 检查是否有针对组件内部 DOM 的自定义样式
- ⚠️ **CSS 覆盖**: 检查是否有 `.ant-` 前缀的样式覆盖
- ⚠️ **已废弃 API**: 需要迁移到新的 API

---

## 📊 组件使用情况分析

### 1. 核心数据组件

#### Table 组件
**使用场景**: 
- `src/components/views/TableView.tsx` - 任务表格视图
- `src/components/views/VersionTableView.tsx` - 版本表格视图
- `src/components/dialogs/TimelineTimeShiftDialog.tsx` - 时间偏移对话框中的表格

**API 变化**:
```diff
- pagination.position  → + pagination.placement
- onSelectInvert       → + onChange
- filterDropdownOpen   → + filterDropdownProps.open
- onFilterDropdownOpenChange → + filterDropdownProps.onOpenChange
```

**影响评估**: 🟡 中等
- 需要修改分页位置配置
- 需要调整过滤器下拉框状态管理

---

#### Form 组件
**使用场景**:
- `src/components/dialogs/NodeEditDialog.tsx` - 节点编辑表单
- `src/components/dialogs/TimelineEditDialog.tsx` - 时间轴编辑表单
- `src/components/dialogs/RelationEditDialog.tsx` - 关系编辑表单
- `src/components/dialogs/BaselineEditDialog.tsx` - 基线编辑表单
- `src/components/dialogs/ImageExportDialog.tsx` - 图片导出表单

**API 变化**:
```javascript
// ⚠️ Form.List 行为变化
// v5: onFinish 包含所有 Form.List 数据（包括未注册的子项）
// v6: onFinish 仅包含已注册的 Form.Item 数据

// 需要移除的代码
const onFinish = (values) => {
  // ❌ v5 需要使用 strict 过滤
  const realValues = getFieldsValue({ strict: true });
};

// 改为
const onFinish = (values) => {
  // ✅ v6 直接使用 values
  const realValues = values;
};
```

**影响评估**: 🟢 低
- 项目中未发现使用 Form.List 的场景
- 如果有使用，需要检查 `onFinish` 逻辑

---

### 2. 输入控件组件

#### Input 组件
**使用场景**: 
- `src/components/common/Input.tsx` - 通用输入框封装
- 各种对话框中的文本输入

**API 变化**:
```diff
# Input.Group 废弃
- Input.Group → + Space.Compact
```

**影响评估**: 🟢 低
- 项目已使用自定义封装的 Input 组件
- 未使用 Input.Group

---

#### Select 组件
**使用场景**:
- `src/components/common/Select.tsx` - 通用选择器封装
- `src/components/iteration/ProductSelector.tsx` - 产品选择器
- 各种对话框中的选择器

**API 变化**:
```diff
- dropdownMatchSelectWidth  → + popupMatchSelectWidth
- dropdownStyle             → + styles.popup.root
- dropdownClassName         → + classNames.popup.root
- dropdownRender            → + popupRender
- onDropdownVisibleChange   → + onOpenChange
- bordered                  → + variant
```

**影响评估**: 🟡 中等
- 需要全局替换 API 名称
- 可能影响自定义下拉渲染逻辑

---

#### DatePicker 组件
**使用场景**:
- `src/components/common/DatePicker.tsx` - 通用日期选择器封装
- 各种对话框中的日期选择

**API 变化**:
```diff
- dropdownClassName  → + classNames.popup.root
- popupClassName     → + classNames.popup.root
- popupStyle         → + styles.popup.root
- bordered           → + variant
- onSelect           → + onCalendarChange
```

**影响评估**: 🟡 中等
- 需要替换 API 名称
- 需要测试日期选择交互

---

#### InputNumber 组件
**使用场景**:
- `src/components/dialogs/NodeEditDialog.tsx` - 节点编辑对话框
- `src/components/dialogs/RelationEditDialog.tsx` - 关系编辑对话框
- `src/components/timeline/TimeAxisScaler.tsx` - 时间轴缩放控件

**API 变化**:
```diff
- bordered      → + variant
- addonAfter    → + Space.Compact
- addonBefore   → + Space.Compact
```

**影响评估**: 🟡 中等
- 如果使用了 `bordered={false}`，需要改为 `variant="borderless"`
- 如果使用了 `addonBefore/addonAfter`，需要改用 `Space.Compact`

---

#### ColorPicker 组件
**使用场景**:
- `src/components/dialogs/NodeEditDialog.tsx` - 节点编辑（颜色选择）
- `src/components/dialogs/TimelineEditDialog.tsx` - 时间轴编辑（颜色选择）

**影响评估**: 🟢 低
- ColorPicker 在 v6 中无重大 API 变化

---

### 3. 布局与容器组件

#### Modal 组件
**使用场景**: （大量使用）
- `src/components/common/Modal.tsx` - 通用对话框封装
- 各种编辑对话框

**API 变化**:
```diff
- bodyStyle        → + styles.body
- maskStyle        → + styles.mask
- destroyOnClose   → + destroyOnHidden
```

**⚠️ 重要变化 - Mask Blur 效果**:
```javascript
// v6 默认启用 blur 效果，如需禁用：
<ConfigProvider
  modal={{
    mask: {
      blur: false,
    },
  }}
>
  <Modal />
</ConfigProvider>
```

**影响评估**: 🟡 中等
- 需要替换样式 API
- 需要测试 blur 效果是否符合预期
- 可能需要调整遮罩样式

---

#### Drawer 组件
**使用场景**: 未在项目中发现使用

**影响评估**: 🟢 无影响

---

#### Card 组件
**使用场景**:
- `src/components/views/ModuleIterationView.tsx` - 模块迭代视图
- `src/components/views/VersionTableView.tsx` - 版本表格视图
- `src/components/iteration/ProductSelector.tsx` - 产品选择器
- `src/pages/ComponentDemo.tsx` - 组件演示

**API 变化**:
```diff
- headStyle  → + styles.header
- bodyStyle  → + styles.body
- bordered   → + variant
```

**影响评估**: 🟡 中等
- 需要替换样式 API
- 如果使用了 `bordered={false}`，需要改为 `variant="borderless"`

---

#### Space 组件
**使用场景**: 广泛使用于各种布局

**API 变化**:
```diff
- direction  → + orientation
- split      → + separator
```

**影响评估**: 🟡 中等
- 需要全局替换 `direction` 为 `orientation`
- 如果使用了 `split`，需要改为 `separator`

---

#### Space.Compact 组件
**使用场景**: 可能用于按钮组

**API 变化**:
```diff
- direction  → + orientation
```

**影响评估**: 🟢 低

---

#### Collapse 组件
**使用场景**:
- `src/components/views/ModuleIterationView.tsx` - 模块迭代视图

**API 变化**:
```diff
- destroyInactivePanel  → + destroyOnHidden
- expandIconPosition    → + expandIconPlacement
```

**影响评估**: 🟢 低
- 需要替换 API 名称

---

### 4. 反馈组件

#### Tag 组件
**使用场景**: 广泛使用

**API 变化**:
```diff
- bordered={false}      → + variant="filled"
- color="xxx-inverse"   → + variant="solid"
```

**⚠️ 重要变化 - Margin 调整**:
```javascript
// v6 移除了 Tag 的默认 margin-inline-end
// 如需恢复旧行为：
<ConfigProvider
  tag={{
    styles: {
      root: {
        marginInlineEnd: 8,
      },
    },
  }}
>
  <Tag>Tag A</Tag>
</ConfigProvider>
```

**影响评估**: 🟡 中等
- 需要检查 Tag 列表布局是否受影响
- 可能需要添加间距样式

---

#### Tooltip 组件
**使用场景**: 广泛使用

**API 变化**:
```diff
- overlayStyle         → + styles.root
- overlayInnerStyle    → + styles.container
- overlayClassName     → + classNames.root
- destroyTooltipOnHide → + destroyOnHidden
```

**影响评估**: 🟡 中等
- 需要全局替换 API 名称
- 需要测试自定义样式

---

#### Message 组件
**使用场景**: 全局消息提示

**影响评估**: 🟢 低
- 静态方法无重大变化

---

#### Alert 组件
**使用场景**:
- `src/components/dialogs/TimelineTimeShiftDialog.tsx` - 时间偏移提示
- `src/components/dialogs/ImportDialog.tsx` - 导入提示
- `src/components/timeline/ConnectionMode.tsx` - 连接模式提示

**API 变化**:
```diff
- closeText  → + closable.closeIcon
- message    → + title
```

**影响评估**: 🟡 中等
- 需要调整关闭图标配置
- 需要替换 message 为 title

---

#### Progress 组件
**使用场景**:
- `src/components/views/ModuleIterationView.tsx` - 进度显示
- `src/components/views/TableView.tsx` - 表格中的进度

**API 变化**:
```diff
- strokeWidth    → + size
- width          → + size
- trailColor     → + railColor
- gapPosition    → + gapPlacement
```

**影响评估**: 🟡 中等
- 需要替换 API 名称

---

#### Badge 组件
**使用场景**:
- `src/components/iteration/IterationMarkers.tsx` - 迭代标记

**影响评估**: 🟢 低
- 无重大 API 变化

---

### 5. 导航与菜单组件

#### Dropdown 组件
**使用场景**:
- `src/components/timeline/TimelineQuickMenu.tsx` - 快捷菜单
- `src/components/timeline/NodeContextMenu.tsx` - 节点右键菜单
- `src/components/dialogs/NodeContextMenu.tsx` - 节点上下文菜单
- `src/components/dialogs/TimelineContextMenu.tsx` - 时间轴右键菜单

**API 变化**:
```diff
- dropdownRender      → + popupRender
- destroyPopupOnHide  → + destroyOnHidden
- overlayClassName    → + classNames.root
- overlayStyle        → + styles.root
- placement: xxxCenter → + placement: xxx
```

**影响评估**: 🟡 中等
- 需要全局替换 API 名称
- 需要调整 placement 值

---

#### Segmented 组件
**使用场景**:
- `src/components/timeline/ViewSwitcher.tsx` - 视图切换器
- `src/components/iteration/IterationWidthSelector.tsx` - 迭代宽度选择器

**影响评估**: 🟢 低
- 无重大 API 变化

---

### 6. 其他组件

#### Button 组件
**使用场景**: 广泛使用
- `src/components/common/Button.tsx` - 通用按钮封装

**API 变化**:
```diff
- iconPosition  → + iconPlacement
```

**影响评估**: 🟢 低
- 自定义封装的 Button 组件已使用 variant prop
- 需要检查 iconPosition 使用

---

#### Upload 组件
**使用场景**:
- `src/components/dialogs/ImportDialog.tsx` - 文件导入

**影响评估**: 🟢 低
- 无重大 API 变化

---

#### Slider 组件
**使用场景**:
- `src/components/timeline/TimeAxisScaler.tsx` - 时间轴缩放滑块
- `src/components/dialogs/ImageExportDialog.tsx` - 图片导出质量控制

**API 变化**:
```diff
- tooltipPrefixCls          → + tooltip.prefixCls
- getTooltipPopupContainer  → + tooltip.getPopupContainer
- tipFormatter              → + tooltip.formatter
- tooltipPlacement          → + tooltip.placement
- tooltipVisible            → + tooltip.open
```

**影响评估**: 🟡 中等
- 需要重构 tooltip 相关配置

---

#### Result 组件
**使用场景**:
- `src/pages/Index.tsx` - 首页
- `src/pages/NotFound.tsx` - 404 页面
- `src/pages/EnhancedTimePlanView.tsx` - 增强视图错误页

**影响评估**: 🟢 低
- 无重大 API 变化

---

#### Empty 组件
**使用场景**:
- `src/components/views/ModuleIterationView.tsx` - 空状态

**API 变化**:
```diff
- imageStyle  → + styles.image
```

**影响评估**: 🟢 低

---

### 7. 配置与主题

#### ConfigProvider 组件
**使用场景**:
- `src/main.tsx` - 全局配置
- `src/theme/ThemeProvider.tsx` - 主题提供者

**API 变化**:
```diff
- dropdownMatchSelectWidth  → + popupMatchSelectWidth
```

**影响评估**: 🟢 低
- 需要更新全局配置项

---

#### theme 配置
**使用场景**:
- `src/theme/index.ts` - 主题配置
- `src/theme/ThemeProvider.tsx` - 主题提供者

**⚠️ 重要变化 - CSS 变量**:
- v6 默认启用 CSS 变量
- 样式体积减小
- 更好的主题切换性能

**影响评估**: 🟢 低
- 主题配置结构保持兼容
- CSS 变量自动生成

---

## 🔧 需要适配的主要内容

### 1. API 名称全局替换

#### 高优先级（影响范围大）

**Select / AutoComplete / TreeSelect / Cascader 相关**:
```bash
# 需要替换的 API（所有下拉选择类组件）
dropdownMatchSelectWidth  → popupMatchSelectWidth
dropdownStyle             → styles.popup.root
dropdownClassName         → classNames.popup.root
popupClassName            → classNames.popup.root
dropdownRender            → popupRender
onDropdownVisibleChange   → onOpenChange
```

**DatePicker / TimePicker 相关**:
```bash
dropdownClassName  → classNames.popup.root
popupClassName     → classNames.popup.root
popupStyle         → styles.popup.root
bordered           → variant
onSelect           → onCalendarChange (DatePicker)
addon              → renderExtraFooter (TimePicker)
```

**Dropdown 相关**:
```bash
dropdownRender      → popupRender
destroyPopupOnHide  → destroyOnHidden
overlayClassName    → classNames.root
overlayStyle        → styles.root
```

**Tooltip / Popover 相关**:
```bash
overlayStyle         → styles.root
overlayInnerStyle    → styles.container
overlayClassName     → classNames.root
destroyTooltipOnHide → destroyOnHidden
```

**Space 相关**:
```bash
direction  → orientation
split      → separator
```

**Table 相关**:
```bash
pagination.position              → pagination.placement
filterDropdownOpen               → filterDropdownProps.open
onFilterDropdownOpenChange       → filterDropdownProps.onOpenChange
```

---

#### 中优先级（局部影响）

**样式属性替换**:
```bash
# Modal
bodyStyle        → styles.body
maskStyle        → styles.mask
destroyOnClose   → destroyOnHidden

# Drawer
headerStyle           → styles.header
bodyStyle             → styles.body
footerStyle           → styles.footer
contentWrapperStyle   → styles.wrapper
maskStyle             → styles.mask
drawerStyle           → styles.section
destroyInactivePanel  → destroyOnHidden
width                 → size
height                → size

# Card
headStyle  → styles.header
bodyStyle  → styles.body
bordered   → variant

# Alert
closeText  → closable.closeIcon
message    → title
```

---

#### 低优先级（使用频率低）

```bash
# Button
iconPosition  → iconPlacement

# Collapse
destroyInactivePanel  → destroyOnHidden
expandIconPosition    → expandIconPlacement

# Progress
strokeWidth    → size
width          → size
trailColor     → railColor
gapPosition    → gapPlacement

# Slider
tooltipPrefixCls          → tooltip.prefixCls
getTooltipPopupContainer  → tooltip.getPopupContainer
tipFormatter              → tooltip.formatter
tooltipPlacement          → tooltip.placement
tooltipVisible            → tooltip.open
```

---

### 2. variant 属性迁移

很多组件的 `bordered` 属性被 `variant` 替代：

**受影响组件**:
- Input
- InputNumber  
- Select
- TreeSelect
- Cascader
- DatePicker
- Card

**迁移规则**:
```typescript
// v5
<Input bordered={true} />   // 默认
<Input bordered={false} />  // 无边框

// v6
<Input variant="outlined" />  // 默认（有边框）
<Input variant="borderless" /> // 无边框
<Input variant="filled" />    // 填充样式
```

---

### 3. Tag 组件 Margin 调整

**问题**: v6 移除了 Tag 的默认 `margin-inline-end: 8px`

**影响场景**:
- 多个 Tag 横向排列时，间距会消失
- 可能影响：
  - `src/components/views/ModuleIterationView.tsx`
  - `src/components/views/TableView.tsx`
  - `src/components/views/VersionTableView.tsx`
  - `src/components/iteration/IterationMarkers.tsx`
  - `src/components/dialogs/NodeEditDialog.tsx`

**解决方案**:

**方案 1**: 全局配置恢复旧行为
```tsx
// src/main.tsx
<ConfigProvider
  tag={{
    styles: {
      root: {
        marginInlineEnd: 8,
      },
    },
  }}
>
  {children}
</ConfigProvider>
```

**方案 2**: 局部使用 Space 组件
```tsx
// 推荐：更明确的布局控制
<Space size={8} wrap>
  <Tag>Tag 1</Tag>
  <Tag>Tag 2</Tag>
  <Tag>Tag 3</Tag>
</Space>
```

**建议**: 采用方案 2，使用 Space 组件明确控制间距

---

### 4. Modal/Drawer Blur 效果

**变化**: v6 默认启用遮罩模糊效果

**影响**: 
- 视觉效果更现代
- 可能影响性能（低端设备）
- 可能与现有设计不符

**配置**:
```tsx
// src/main.tsx 或 src/theme/ThemeProvider.tsx
<ConfigProvider
  modal={{
    mask: {
      blur: true,  // 启用（默认）
      // blur: false,  // 禁用
    },
  }}
  drawer={{
    mask: {
      blur: true,
    },
  }}
>
  {children}
</ConfigProvider>
```

**建议**: 
1. 先使用默认的 blur 效果
2. 测试在不同设备上的表现
3. 如果有性能问题或视觉不协调，再考虑禁用

---

### 5. 自定义样式检查

**潜在问题**: v6 优化了组件 DOM 结构，自定义样式可能失效

**需要检查的内容**:
1. 所有 `.ant-` 前缀的样式覆盖
2. 针对组件内部 DOM 节点的选择器
3. 使用 `::v-deep` 或 `:global` 的深度选择器

**检查文件**:
```bash
# 搜索所有样式文件中的 .ant- 前缀
grep -r "\.ant-" src/**/*.css src/**/*.scss src/**/*.less
```

**当前项目**: 未发现全局 CSS 文件，样式主要通过 Ant Design 主题配置

---

### 6. Form.List 数据处理

**变化**: `onFinish` 不再包含未注册的 Form.List 子项数据

**检查方法**:
```bash
# 搜索 Form.List 使用
grep -r "Form.List" src/
grep -r "getFieldsValue.*strict" src/
```

**当前项目**: 未发现使用 Form.List 的场景

---

## 📝 详细升级步骤

### 阶段 1: 准备工作（预计 0.5 天）

#### 1.1 代码备份
```bash
# 创建升级分支
git checkout -b feature/timeplan-craft-kit-antd-upgrade

# 确保工作区干净
git status

# 创建备份标签
git tag backup-before-antd6-upgrade
```

#### 1.2 依赖检查
```bash
# 检查所有依赖的兼容性
npm outdated

# 检查 @ant-design/icons 版本（应该已经是 6.x）
npm list @ant-design/icons
```

#### 1.3 创建测试检查清单
- [ ] 所有对话框的打开/关闭
- [ ] 所有表单的提交和验证
- [ ] 所有下拉选择器的交互
- [ ] 所有日期选择器的交互
- [ ] 所有表格的排序、筛选、分页
- [ ] 所有右键菜单的功能
- [ ] 主题切换功能
- [ ] 响应式布局
- [ ] 键盘快捷键

---

### 阶段 2: 依赖升级（预计 0.5 天）

#### 2.1 升级 Ant Design
```bash
# 升级到 6.2.1
pnpm add antd@6.2.1

# 或使用 npm
npm install antd@6.2.1

# 或使用 yarn
yarn add antd@6.2.1
```

#### 2.2 确认 @ant-design/icons
```bash
# 确认版本（应该已经是 6.1.0）
pnpm list @ant-design/icons

# 如果不是 6.x，则升级
# pnpm add @ant-design/icons@^6.1.0
```

#### 2.3 安装依赖并测试构建
```bash
# 安装依赖
pnpm install

# 测试构建
pnpm build

# 检查是否有编译错误
```

#### 2.4 启动开发服务器
```bash
# 启动开发服务器
pnpm dev

# 观察控制台是否有警告或错误
```

**预期结果**:
- ✅ 构建成功
- ⚠️ 控制台可能出现 deprecated API 警告（正常）
- ⚠️ 部分样式可能有轻微变化

---

### 阶段 3: API 迁移（预计 2-3 天）

#### 3.1 全局 API 替换

**步骤 1**: 下拉相关组件 API 替换

```bash
# 创建查找和替换脚本或手动替换
# 建议使用 VSCode 的全局搜索替换功能（Ctrl+Shift+H）
```

**替换列表**:

| 旧 API | 新 API | 搜索正则 |
|--------|--------|---------|
| `dropdownMatchSelectWidth` | `popupMatchSelectWidth` | `dropdownMatchSelectWidth` |
| `dropdownStyle` | `styles.popup.root` | `dropdownStyle=\{` |
| `dropdownClassName` | `classNames.popup.root` | `dropdownClassName=` |
| `popupClassName` | `classNames.popup.root` | `popupClassName=` |
| `dropdownRender` | `popupRender` | `dropdownRender=` |
| `onDropdownVisibleChange` | `onOpenChange` | `onDropdownVisibleChange=` |

**操作步骤**:
```typescript
// 示例：修改 Select 组件
// Before (v5):
<Select
  dropdownStyle={{ maxHeight: 400 }}
  dropdownClassName="custom-dropdown"
  onDropdownVisibleChange={handleVisibleChange}
>
  ...
</Select>

// After (v6):
<Select
  styles={{ popup: { root: { maxHeight: 400 } } }}
  classNames={{ popup: { root: 'custom-dropdown' } }}
  onOpenChange={handleVisibleChange}
>
  ...
</Select>
```

**受影响文件**:
- `src/components/common/Select.tsx` ⭐ 高优先级
- `src/components/common/DatePicker.tsx` ⭐ 高优先级
- `src/components/iteration/ProductSelector.tsx`
- `src/components/iteration/MRSelectorDialog.tsx`
- `src/components/dialogs/NodeEditDialog.tsx`
- `src/components/dialogs/TimelineEditDialog.tsx`
- `src/components/dialogs/RelationEditDialog.tsx`
- `src/components/dialogs/BaselineEditDialog.tsx`
- `src/components/dialogs/BaselineRangeEditDialog.tsx`
- `src/components/dialogs/ImageExportDialog.tsx`
- `src/components/dialogs/TimelineTimeShiftDialog.tsx`
- `src/components/timeline/TimelineToolbar.tsx`

---

**步骤 2**: Space 组件 API 替换

```bash
# 全局搜索替换
# direction → orientation
# split → separator
```

```typescript
// Before (v5):
<Space direction="horizontal" split={<Divider type="vertical" />}>
  ...
</Space>

// After (v6):
<Space orientation="horizontal" separator={<Divider type="vertical" />}>
  ...
</Space>
```

**受影响文件**: 几乎所有使用 Space 的文件（广泛使用）

**建议**: 
1. 先使用全局搜索确认使用次数
2. 使用 VSCode 的批量替换功能
3. 逐个文件确认替换结果

---

**步骤 3**: Dropdown 组件 API 替换

```typescript
// Before (v5):
<Dropdown
  overlayClassName="custom-menu"
  overlayStyle={{ width: 200 }}
  dropdownRender={(menu) => <div>{menu}</div>}
  destroyPopupOnHide
>
  ...
</Dropdown>

// After (v6):
<Dropdown
  classNames={{ root: 'custom-menu' }}
  styles={{ root: { width: 200 } }}
  popupRender={(menu) => <div>{menu}</div>}
  destroyOnHidden
>
  ...
</Dropdown>
```

**受影响文件**:
- `src/components/timeline/TimelineQuickMenu.tsx`
- `src/components/timeline/NodeContextMenu.tsx`
- `src/components/dialogs/NodeContextMenu.tsx`
- `src/components/dialogs/TimelineContextMenu.tsx`
- `src/components/timeline/TimelinePanel.tsx`

---

**步骤 4**: Tooltip 组件 API 替换

```typescript
// Before (v5):
<Tooltip
  overlayClassName="custom-tooltip"
  overlayInnerStyle={{ padding: 8 }}
  destroyTooltipOnHide
>
  ...
</Tooltip>

// After (v6):
<Tooltip
  classNames={{ root: 'custom-tooltip' }}
  styles={{ container: { padding: 8 } }}
  destroyOnHidden
>
  ...
</Tooltip>
```

**受影响文件**: 广泛使用（至少 20+ 文件）

---

#### 3.2 样式属性替换

**步骤 1**: Modal 组件

```typescript
// Before (v5):
<Modal
  bodyStyle={{ padding: 24 }}
  maskStyle={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
  destroyOnClose
>
  ...
</Modal>

// After (v6):
<Modal
  styles={{
    body: { padding: 24 },
    mask: { backgroundColor: 'rgba(0,0,0,0.45)' },
  }}
  destroyOnHidden
>
  ...
</Modal>
```

**受影响文件**:
- `src/components/common/Modal.tsx` ⭐ 高优先级（自定义封装）
- 所有使用 Modal 的对话框组件

**操作**: 
1. 先修改 `src/components/common/Modal.tsx`
2. 确保自定义封装兼容新旧 API（过渡期）
3. 测试所有对话框功能

---

**步骤 2**: Card 组件

```typescript
// Before (v5):
<Card
  headStyle={{ background: '#f0f0f0' }}
  bodyStyle={{ padding: 16 }}
  bordered={false}
>
  ...
</Card>

// After (v6):
<Card
  styles={{
    header: { background: '#f0f0f0' },
    body: { padding: 16 },
  }}
  variant="borderless"
>
  ...
</Card>
```

**受影响文件**:
- `src/components/views/ModuleIterationView.tsx`
- `src/components/views/VersionTableView.tsx`
- `src/components/iteration/ProductSelector.tsx`
- `src/pages/ComponentDemo.tsx`

---

**步骤 3**: Table 组件

```typescript
// Before (v5):
<Table
  pagination={{
    position: ['topRight', 'bottomRight'],
  }}
  onSelectInvert={(keys) => {}}
  filterDropdownOpen={open}
  onFilterDropdownOpenChange={setOpen}
/>

// After (v6):
<Table
  pagination={{
    placement: ['topRight', 'bottomRight'],
  }}
  onChange={(pagination, filters, sorter, extra) => {
    // 处理 selectInvert 在 extra 中
  }}
  filterDropdownProps={{
    open: open,
    onOpenChange: setOpen,
  }}
/>
```

**受影响文件**:
- `src/components/views/TableView.tsx` ⭐
- `src/components/views/VersionTableView.tsx`
- `src/components/dialogs/TimelineTimeShiftDialog.tsx`

---

#### 3.3 组件特定 API 替换

**Alert 组件**:
```typescript
// Before (v5):
<Alert
  message="这是一条消息"
  closeText="关闭"
/>

// After (v6):
<Alert
  title="这是一条消息"
  closable={{
    closeIcon: '关闭',
  }}
/>
```

**Progress 组件**:
```typescript
// Before (v5):
<Progress
  strokeWidth={10}
  trailColor="#f0f0f0"
/>

// After (v6):
<Progress
  size={10}
  railColor="#f0f0f0"
/>
```

**Slider 组件**:
```typescript
// Before (v5):
<Slider
  tipFormatter={(value) => `${value}%`}
  tooltipVisible={true}
  tooltipPlacement="top"
/>

// After (v6):
<Slider
  tooltip={{
    formatter: (value) => `${value}%`,
    open: true,
    placement: 'top',
  }}
/>
```

**受影响文件**:
- `src/components/timeline/TimeAxisScaler.tsx` (Slider)
- `src/components/dialogs/ImageExportDialog.tsx` (Slider)

---

#### 3.4 variant 属性迁移

**创建辅助工具函数** (可选):

```typescript
// src/utils/antdMigration.ts
export const getBorderedVariant = (bordered?: boolean) => {
  if (bordered === false) return 'borderless';
  if (bordered === true) return 'outlined';
  return undefined; // 使用默认值
};
```

**或直接替换**:

使用 VSCode 正则搜索替换:
```regex
# 搜索
bordered=\{false\}

# 替换为
variant="borderless"
```

```regex
# 搜索
bordered=\{true\}

# 替换为
variant="outlined"
```

**受影响组件**: Input, InputNumber, Select, DatePicker, Card, Cascader, TreeSelect

---

### 阶段 4: 样式调整（预计 1-2 天）

#### 4.1 Tag 间距修复

**步骤 1**: 全局搜索 Tag 使用场景

```bash
# 搜索所有 Tag 组件使用
grep -r "<Tag" src/ --include="*.tsx"
```

**步骤 2**: 评估影响

检查以下文件中的 Tag 列表布局:
- `src/components/views/ModuleIterationView.tsx`
- `src/components/views/TableView.tsx`
- `src/components/views/VersionTableView.tsx`
- `src/components/iteration/IterationMarkers.tsx`
- `src/components/dialogs/NodeEditDialog.tsx`
- `src/components/timeline/BaselineMarker.tsx`
- `src/components/timeline/BaselineRangeMarker.tsx`

**步骤 3**: 统一使用 Space 组件

```typescript
// Before (v5):
<div>
  {tags.map(tag => <Tag key={tag}>{tag}</Tag>)}
</div>

// After (v6):
<Space size={8} wrap>
  {tags.map(tag => <Tag key={tag}>{tag}</Tag>)}
</Space>
```

**注意**: 
- 使用 `wrap` 属性支持换行
- 统一间距为 8px（与 v5 默认值一致）

---

#### 4.2 Modal/Drawer Blur 配置

**步骤 1**: 在主题配置中添加 Modal 配置

```typescript
// src/theme/ThemeProvider.tsx 或 src/main.tsx

<ConfigProvider
  locale={zhCN}
  theme={theme}
  modal={{
    mask: {
      blur: true, // 启用 blur 效果（默认）
    },
  }}
  drawer={{
    mask: {
      blur: true,
    },
  }}
>
  {children}
</ConfigProvider>
```

**步骤 2**: 测试 Modal/Drawer 的视觉效果

- 打开各种对话框
- 检查 blur 效果是否合适
- 检查性能（特别是在低端设备上）

**步骤 3**: 根据测试结果调整

如果 blur 效果不符合预期，可以禁用:
```typescript
mask: {
  blur: false,
}
```

---

#### 4.3 自定义样式验证

**步骤 1**: 搜索自定义样式

```bash
# 搜索 .ant- 前缀的样式覆盖
grep -r "\.ant-" src/ --include="*.css" --include="*.scss" --include="*.less"

# 搜索内联样式中的组件类名
grep -r "className.*ant-" src/ --include="*.tsx"
```

**步骤 2**: 逐个检查和修复

对于每个自定义样式:
1. 确认目标 DOM 节点是否仍然存在
2. 确认选择器是否仍然有效
3. 测试样式是否生效
4. 如果失效，使用新的 classNames/styles API

---

#### 4.4 主题配置更新

**步骤 1**: 检查当前主题配置

```typescript
// src/theme/index.ts
// 检查是否使用了废弃的 token 或组件配置
```

**步骤 2**: 更新组件特定配置

```typescript
// 可能需要调整的组件配置
export const theme: ThemeConfig = {
  token: {
    // ... 保持不变
  },
  components: {
    Button: {
      // v6 可能需要调整的配置
    },
    Modal: {
      // 添加 v6 新配置
    },
    Tag: {
      // 如果需要全局恢复 margin
    },
    // ...
  },
};
```

**步骤 3**: 测试主题切换

- 测试亮色主题
- 测试暗色主题（如果有）
- 确认所有组件样式正确

---

### 阶段 5: 功能测试（预计 2-3 天）

#### 5.1 自动化测试

**步骤 1**: 运行现有单元测试

```bash
# 运行所有测试
pnpm test

# 运行特定测试
pnpm test:phase4
```

**步骤 2**: 修复失败的测试

常见问题:
- Mock 的 API 名称变化
- 组件 props 变化
- DOM 结构变化

**步骤 3**: 更新测试快照（如果使用）

```bash
pnpm test -- -u
```

---

#### 5.2 手动功能测试

**测试清单**:

**✅ 基础组件测试**
- [ ] Button 各种变体和状态
- [ ] Input 输入和验证
- [ ] Select 下拉选择和搜索
- [ ] DatePicker 日期选择
- [ ] Modal 打开/关闭/确认/取消
- [ ] Tooltip 悬停显示
- [ ] Dropdown 下拉菜单
- [ ] Tag 列表显示和间距
- [ ] Table 排序/筛选/分页

**✅ 业务功能测试**
- [ ] 时间轴面板渲染和交互
- [ ] 节点编辑对话框
- [ ] 时间轴编辑对话框
- [ ] 基线管理功能
- [ ] 关系编辑功能
- [ ] 导入/导出功能
- [ ] 图片导出功能
- [ ] 视图切换功能
- [ ] 右键菜单功能
- [ ] 键盘快捷键

**✅ 迭代管理功能**
- [ ] 迭代视图渲染
- [ ] 模块迭代视图
- [ ] MR 选择对话框
- [ ] MR 详情对话框
- [ ] 产品选择器

**✅ 表格视图功能**
- [ ] 任务表格视图
- [ ] 版本表格视图
- [ ] 矩阵视图
- [ ] 版本计划视图

**✅ 主题和样式**
- [ ] 亮色主题显示正常
- [ ] 暗色主题显示正常（如果有）
- [ ] 响应式布局正常
- [ ] 所有图标显示正常
- [ ] 自定义颜色正确应用

**✅ 性能测试**
- [ ] 页面加载速度
- [ ] 大数据量渲染性能
- [ ] Modal/Drawer blur 效果性能
- [ ] 主题切换速度

---

#### 5.3 浏览器兼容性测试

**测试浏览器**:
- [ ] Chrome 最新版
- [ ] Firefox 最新版
- [ ] Safari 最新版（macOS）
- [ ] Edge 最新版

**注意**: v6 不再支持 IE，无需测试 IE

---

#### 5.4 控制台警告清理

**步骤 1**: 打开浏览器控制台

**步骤 2**: 操作所有功能，记录警告信息

常见警告:
- Deprecated API 警告
- PropTypes 警告
- React key 警告
- 样式冲突警告

**步骤 3**: 逐个解决警告

优先级:
1. Deprecated API 警告（必须解决）
2. PropTypes 错误（必须解决）
3. 性能警告（建议解决）
4. 其他警告（可选解决）

---

### 阶段 6: 优化与文档（预计 1 天）

#### 6.1 代码优化

**清理废弃代码**:
```bash
# 搜索可能的临时代码或注释
grep -r "TODO.*v6" src/
grep -r "FIXME.*antd" src/
```

**优化 import**:
```typescript
// Before: 可能存在的冗余导入
import { Button, Modal, Input } from 'antd';
import type { ButtonProps } from 'antd';

// After: 检查是否有未使用的导入
import { Button, Modal } from 'antd';
import type { ButtonProps } from 'antd';
```

---

#### 6.2 性能优化

**检查 CSS 体积**:
```bash
# 构建生产版本
pnpm build

# 分析打包体积
# 对比升级前后的 CSS 文件大小
```

**预期改进**:
- CSS 体积减少 20-30%
- CSS 变量提升主题切换性能
- 组件渲染性能提升

---

#### 6.3 文档更新

**更新 README**:
```markdown
## 技术栈

- React 19.0.0
- Ant Design 6.2.1 ← 更新版本号
- TypeScript 5.6.2
- Vite 6.0.3
```

**创建升级日志**:
```markdown
# 升级日志

## 2026-02-10: Ant Design 6.2.1 升级

### 主要变化
- 升级 Ant Design 从 5.22.6 到 6.2.1
- 迁移所有废弃 API 到新 API
- 优化组件样式和性能

### Breaking Changes
- 所有下拉组件的 API 变化（dropdown → popup）
- Tag 组件移除默认 margin
- Modal/Drawer 启用 blur 效果

### 升级影响
- CSS 体积减少约 25%
- 主题切换性能提升
- 组件渲染性能提升
```

**更新组件文档**:

更新自定义组件的文档注释:
- `src/components/common/Button.tsx`
- `src/components/common/Modal.tsx`
- `src/components/common/Input.tsx`
- `src/components/common/Select.tsx`
- `src/components/common/DatePicker.tsx`

---

#### 6.4 提交代码

```bash
# 确认所有修改
git status

# 分阶段提交（推荐）
# 提交 1: 依赖升级
git add package.json pnpm-lock.yaml
git commit -m "chore: 升级 Ant Design 到 6.2.1"

# 提交 2: API 迁移 - 下拉组件
git add src/components/common/Select.tsx src/components/common/DatePicker.tsx
git commit -m "refactor: 迁移下拉组件 API (dropdown → popup)"

# 提交 3: API 迁移 - 样式属性
git add src/components/common/Modal.tsx
git commit -m "refactor: 迁移 Modal 样式 API (xxxStyle → styles.xxx)"

# 提交 4: API 迁移 - 其他组件
git add src/components/
git commit -m "refactor: 迁移其他组件废弃 API"

# 提交 5: 样式修复
git add src/
git commit -m "fix: 修复 Tag 间距和组件样式"

# 提交 6: 配置更新
git add src/theme/ src/main.tsx
git commit -m "feat: 配置 Modal blur 效果和主题优化"

# 提交 7: 文档更新
git add README.md docs/
git commit -m "docs: 更新升级文档和组件说明"

# 或一次性提交
git add .
git commit -m "feat: 升级 Ant Design 到 6.2.1

- 升级 antd 从 5.22.6 到 6.2.1
- 迁移所有废弃 API 到新 API
- 修复 Tag 间距问题
- 配置 Modal blur 效果
- 优化组件样式和性能
- 更新文档和示例"
```

---

### 阶段 7: 发布与监控（预计 0.5 天）

#### 7.1 预发布测试

**步骤 1**: 构建生产版本
```bash
pnpm build
```

**步骤 2**: 预览生产版本
```bash
pnpm preview
```

**步骤 3**: 完整功能测试
- 重新运行所有手动测试
- 检查生产构建的性能
- 确认没有控制台错误

---

#### 7.2 合并主分支

```bash
# 确保所有测试通过
pnpm test

# 切换到主分支
git checkout main

# 合并升级分支
git merge feature/timeplan-craft-kit-antd-upgrade

# 推送到远程
git push origin main

# 创建版本标签
git tag v2.0.1-antd6
git push origin v2.0.1-antd6
```

---

#### 7.3 发布后监控

**监控内容**:
- [ ] 用户反馈（如果有用户）
- [ ] 控制台错误日志
- [ ] 性能指标
- [ ] 浏览器兼容性问题

**准备回滚方案**:
```bash
# 如果发现严重问题，可以快速回滚
git revert <commit-hash>

# 或切换到备份标签
git checkout backup-before-antd6-upgrade
```

---

## 🎯 关键文件修改清单

### 高优先级（必须修改）

#### 1. 通用组件封装
- ⭐⭐⭐ `src/components/common/Select.tsx`
  - 迁移 dropdown 相关 API
  - 添加 variant 支持
  
- ⭐⭐⭐ `src/components/common/DatePicker.tsx`
  - 迁移 dropdown/popup 相关 API
  - 迁移 onSelect → onCalendarChange
  
- ⭐⭐⭐ `src/components/common/Modal.tsx`
  - 迁移 bodyStyle → styles.body
  - 迁移 maskStyle → styles.mask
  - 迁移 destroyOnClose → destroyOnHidden
  
- ⭐⭐ `src/components/common/Button.tsx`
  - 检查 iconPosition → iconPlacement
  
- ⭐⭐ `src/components/common/Input.tsx`
  - 添加 variant 支持（如果使用 bordered）

#### 2. 主题和配置
- ⭐⭐⭐ `src/main.tsx`
  - 添加 Modal blur 配置
  - 添加 Tag margin 配置（如果需要）
  
- ⭐⭐ `src/theme/ThemeProvider.tsx`
  - 检查主题配置兼容性
  
- ⭐⭐ `src/theme/index.ts`
  - 更新组件特定配置

---

### 中优先级（重要功能）

#### 3. 表格视图
- ⭐⭐ `src/components/views/TableView.tsx`
  - 迁移 pagination.position → pagination.placement
  - 检查 onSelectInvert
  - 检查 filterDropdown 相关 API
  
- ⭐⭐ `src/components/views/VersionTableView.tsx`
  - 同 TableView

#### 4. 对话框组件
- ⭐⭐ `src/components/dialogs/NodeEditDialog.tsx`
  - 迁移 Form 和 Select/DatePicker API
  - 检查 Tag 间距
  
- ⭐⭐ `src/components/dialogs/TimelineEditDialog.tsx`
  - 迁移 Select 相关 API
  
- ⭐⭐ `src/components/dialogs/TimelineTimeShiftDialog.tsx`
  - 迁移 Table API
  - 迁移 Alert API
  
- ⭐⭐ `src/components/dialogs/ImageExportDialog.tsx`
  - 迁移 Slider tooltip 相关 API
  
- ⭐⭐ `src/components/dialogs/ImportDialog.tsx`
  - 迁移 Alert API
  
- ⭐ `src/components/dialogs/RelationEditDialog.tsx`
  - 迁移 Select 相关 API
  
- ⭐ `src/components/dialogs/BaselineEditDialog.tsx`
  - 迁移 Select/DatePicker API
  
- ⭐ `src/components/dialogs/BaselineRangeEditDialog.tsx`
  - 迁移 Select/DatePicker API

#### 5. 右键菜单组件
- ⭐⭐ `src/components/timeline/TimelineQuickMenu.tsx`
  - 迁移 Dropdown API
  
- ⭐⭐ `src/components/timeline/NodeContextMenu.tsx`
  - 迁移 Dropdown API
  
- ⭐ `src/components/dialogs/NodeContextMenu.tsx`
  - 迁移 Dropdown API
  
- ⭐ `src/components/dialogs/TimelineContextMenu.tsx`
  - 迁移 Dropdown API

#### 6. 迭代管理
- ⭐⭐ `src/components/views/ModuleIterationView.tsx`
  - 修复 Tag 间距
  - 迁移 Card API
  - 迁移 Collapse API
  
- ⭐ `src/components/iteration/IterationMarkers.tsx`
  - 修复 Tag 间距
  
- ⭐ `src/components/iteration/ProductSelector.tsx`
  - 迁移 Select API
  - 迁移 Card API
  
- ⭐ `src/components/iteration/MRSelectorDialog.tsx`
  - 迁移 Modal 和其他组件 API

#### 7. 时间轴组件
- ⭐⭐ `src/components/timeline/TimelineToolbar.tsx`
  - 迁移 Select API
  
- ⭐⭐ `src/components/timeline/TimeAxisScaler.tsx`
  - 迁移 Slider tooltip 相关 API
  
- ⭐ `src/components/timeline/BaselineMarker.tsx`
  - 检查 Tag 间距
  
- ⭐ `src/components/timeline/BaselineRangeMarker.tsx`
  - 检查 Tag 间距

---

### 低优先级（可选优化）

#### 8. 其他视图和页面
- `src/components/views/MatrixView.tsx`
- `src/components/views/VersionPlanView.tsx`
- `src/components/iteration/IterationView.tsx`
- `src/pages/Index.tsx`
- `src/pages/ComponentDemo.tsx`
- `src/pages/EnhancedTimePlanView.tsx`

---

## ⚠️ 风险评估与应对

### 高风险项

#### 1. 自定义样式失效
**风险**: v6 DOM 结构变化导致自定义样式失效

**影响范围**: 中等

**应对措施**:
- 预先搜索所有 `.ant-` 前缀样式
- 建立样式测试清单
- 准备快速修复方案
- 考虑使用 classNames/styles API 替代直接样式覆盖

#### 2. 大量 API 替换导致遗漏
**风险**: 手动替换容易遗漏或出错

**影响范围**: 高

**应对措施**:
- 使用全局搜索确认所有需要替换的 API
- 使用 VSCode 的批量替换功能
- 分阶段提交，便于回滚
- 充分的功能测试
- 使用 TypeScript 类型检查发现问题

#### 3. Modal/Drawer blur 性能问题
**风险**: blur 效果可能影响低端设备性能

**影响范围**: 中等

**应对措施**:
- 在多种设备上测试性能
- 准备禁用 blur 的配置方案
- 监控用户反馈
- 可以根据设备性能动态启用/禁用

---

### 中风险项

#### 4. Tag 间距影响布局
**风险**: Tag margin 变化影响现有布局

**影响范围**: 中等

**应对措施**:
- 预先识别所有 Tag 使用场景
- 统一使用 Space 组件包裹
- 全面测试 Tag 列表显示

#### 5. Form.List 数据处理逻辑
**风险**: Form.List 行为变化可能影响数据提交

**影响范围**: 低（项目中未发现使用）

**应对措施**:
- 确认项目中是否使用 Form.List
- 如果使用，修改 onFinish 逻辑
- 测试表单提交功能

---

### 低风险项

#### 6. TypeScript 类型不匹配
**风险**: 新版本的类型定义可能导致编译错误

**影响范围**: 低

**应对措施**:
- 及时处理 TypeScript 编译错误
- 更新类型导入
- 使用 `@ts-expect-error` 标记临时不兼容的代码

#### 7. 浏览器兼容性问题
**风险**: CSS 变量在某些浏览器上的表现

**影响范围**: 低（现代浏览器支持良好）

**应对措施**:
- 在主流浏览器上充分测试
- 明确浏览器支持范围
- 不支持 IE（已知限制）

---

## 📈 预期收益

### 性能提升
- ✅ **CSS 体积减少**: 20-30%（通过 CSS 变量优化）
- ✅ **主题切换性能**: 显著提升（CSS 变量即时切换）
- ✅ **组件渲染性能**: 轻微提升（DOM 结构优化）
- ✅ **构建速度**: 可能有小幅提升

### 开发体验
- ✅ **API 一致性**: 更统一的 API 命名（popup, classNames, styles）
- ✅ **类型安全**: 更好的 TypeScript 类型定义
- ✅ **可维护性**: 移除废弃 API，代码更现代
- ✅ **新特性**: 使用 v6 的新功能（blur, variant 等）

### 用户体验
- ✅ **视觉效果**: Modal blur 效果更现代
- ✅ **加载速度**: CSS 体积减少带来的加载提升
- ✅ **流畅度**: 性能优化带来的交互提升

---

## 📚 参考资源

### 官方文档
- [Ant Design 6.x 官方文档](https://ant.design/)
- [从 v5 到 v6 迁移指南](https://ant.design/docs/react/migration-v6)
- [Ant Design 6.x Changelog](https://ant.design/changelog)
- [CSS in v6 技术博客](https://ant.design/docs/blog/css-tricks)

### 相关资源
- [Ant Design 6 实践指南](https://medium.com/@leandroaps/migrating-from-ant-design-v5-to-v6-a-practical-guide-for-frontend-teams-12aba4df425d)
- [Ant Design GitHub Releases](https://github.com/ant-design/ant-design/releases)
- [Ant Design GitHub Discussions](https://github.com/ant-design/ant-design/discussions)

---

## 🔄 回滚方案

如果升级后发现严重问题，可以使用以下方案快速回滚：

### 方案 1: Git 回滚
```bash
# 回滚到升级前的提交
git reset --hard backup-before-antd6-upgrade

# 或使用 revert（保留历史记录）
git revert <upgrade-commit-hash>

# 恢复依赖
pnpm install

# 重新构建
pnpm build
```

### 方案 2: 依赖降级
```bash
# 降级到 v5
pnpm add antd@5.22.6

# 重新安装
pnpm install

# 重新构建
pnpm build
```

### 方案 3: 分支切换
```bash
# 切换回主分支（如果还未合并）
git checkout main

# 或创建修复分支
git checkout -b hotfix/revert-antd6
```

---

## ✅ 升级检查清单

### 前期准备
- [ ] 创建升级分支
- [ ] 创建备份标签
- [ ] 确认 React 版本 >= 18
- [ ] 确认 @ant-design/icons 版本 >= 6.0.0
- [ ] 审阅迁移指南
- [ ] 创建测试清单

### 依赖升级
- [ ] 升级 antd 到 6.2.1
- [ ] 确认 @ant-design/icons 版本
- [ ] 安装依赖
- [ ] 测试构建
- [ ] 启动开发服务器

### API 迁移
- [ ] 迁移 Select/DatePicker/Cascader dropdown API
- [ ] 迁移 Space direction → orientation
- [ ] 迁移 Dropdown overlay API
- [ ] 迁移 Tooltip overlay API
- [ ] 迁移 Modal 样式 API
- [ ] 迁移 Card 样式 API
- [ ] 迁移 Table API
- [ ] 迁移 Alert API
- [ ] 迁移 Progress API
- [ ] 迁移 Slider tooltip API
- [ ] 迁移 variant 属性
- [ ] 迁移其他组件 API

### 样式调整
- [ ] 修复 Tag 间距
- [ ] 配置 Modal blur 效果
- [ ] 验证自定义样式
- [ ] 更新主题配置
- [ ] 测试主题切换

### 功能测试
- [ ] 运行单元测试
- [ ] 修复失败的测试
- [ ] 执行手动测试清单
- [ ] 浏览器兼容性测试
- [ ] 清理控制台警告
- [ ] 性能测试

### 优化与文档
- [ ] 清理废弃代码
- [ ] 优化 import
- [ ] 检查 CSS 体积
- [ ] 更新 README
- [ ] 创建升级日志
- [ ] 更新组件文档

### 发布
- [ ] 构建生产版本
- [ ] 预览生产版本
- [ ] 完整功能测试
- [ ] 提交代码
- [ ] 合并主分支
- [ ] 创建版本标签
- [ ] 部署
- [ ] 监控反馈

---

## 🤝 团队协作建议

### 如果是团队开发

#### 1. 分工策略
- **成员 A**: 通用组件迁移（Button, Modal, Input, Select, DatePicker）
- **成员 B**: 对话框和表单迁移（所有 Dialog 组件）
- **成员 C**: 视图和表格迁移（TableView, IterationView 等）
- **成员 D**: 主题配置和样式调整（Theme, Tag spacing, blur 等）
- **所有成员**: 各自负责模块的测试

#### 2. 协作流程
1. 创建共享的升级分支
2. 各成员创建自己的子分支
3. 完成自己部分后创建 Pull Request
4. Code Review 后合并到升级分支
5. 集成测试
6. 合并到主分支

#### 3. 沟通要点
- 共享 API 迁移对照表
- 记录遇到的问题和解决方案
- 定期同步进度
- 统一样式调整标准

---

## 📝 总结

### 升级工作量评估
- **总工作量**: 6-8 人天
- **核心开发**: 4-5 天
- **测试**: 2-3 天
- **风险**: 中低

### 升级必要性
- ✅ **高**: 性能优化、API 现代化、长期可维护性
- ✅ **中**: 新特性（blur, variant）、更好的 TypeScript 支持
- ⚠️ **注意**: 需要充分测试，特别是自定义样式部分

### 推荐执行时机
- ✅ 项目处于稳定期
- ✅ 有足够的测试时间
- ✅ 可以承受短期的不稳定风险
- ✅ 团队有时间进行升级工作

### 最终建议
**建议执行升级**，原因：
1. ✅ React 19 和 @ant-design/icons 6.x 已就绪
2. ✅ v6 带来显著的性能提升
3. ✅ API 迁移工作量可控
4. ✅ 长期维护成本降低
5. ✅ 现在升级比以后升级更容易

---

## 📞 支持与反馈

如果在升级过程中遇到问题，可以：
1. 查阅 [官方迁移指南](https://ant.design/docs/react/migration-v6)
2. 搜索 [GitHub Issues](https://github.com/ant-design/ant-design/issues)
3. 在 [GitHub Discussions](https://github.com/ant-design/ant-design/discussions) 提问
4. 参考本文档的风险应对措施
5. 必要时执行回滚方案

---

**文档版本**: 1.0.0  
**最后更新**: 2026-02-10  
**作者**: AI Assistant  
**审阅状态**: 待审阅
