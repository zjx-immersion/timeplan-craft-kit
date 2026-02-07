# 关键问题总结与修复状态

**更新时间**: 2026-02-07 24:00  
**紧急程度**: 🔴 高

---

## 🐛 问题清单

### 问题 1: 编辑模式功能全部失效 ✅ 已修复

**症状**:
- 点击"编辑"按钮后，`editMode: true`
- 但所有编辑功能不工作：
  - ❌ Timeline 快捷菜单（...按钮）不显示
  - ❌ 右键菜单不弹出
  - ❌ 节点选中无效果
  - ❌ 无法创建连线
  - ❌ 无法拖拽节点

**根本原因**:
`TimelinePanel.tsx` 中的 `isEditMode` 状态计算逻辑错误：
```typescript
// ❌ 错误：忽略了 externalIsEditMode prop
const isEditMode = externalReadonly !== undefined ? !externalReadonly : internalIsEditMode;

// ✅ 修复：优先使用 externalIsEditMode
const isEditMode = externalIsEditMode !== undefined 
  ? externalIsEditMode 
  : (externalReadonly !== undefined ? !externalReadonly : internalIsEditMode);
```

**修复提交**: `4559ca1`  
**验证方法**: 
1. 刷新页面 http://localhost:9086/orion-x-2026-full-v3
2. 点击"编辑"按钮
3. 验证：
   - ✅ Timeline 标题右侧出现"..."按钮
   - ✅ 右键点击画布空白处显示菜单
   - ✅ 点击节点出现选中效果（双层ring）
   - ✅ 点击节点后出现连线点
   - ✅ 可以拖拽节点

---

### 问题 2: 版本计划导航按钮缺失 ⚠️ 需确认

**症状**:
- Header 上没有看到"版本计划"导航按钮

**分析**:
这可能不是 bug，而是待实现的功能。从之前的任务清单看：
- ✅ 已实现："版本对比"视图（VersionTableView）
- ❌ 未实现："版本计划"（可能是新的独立功能）

**待确认**:
1. 用户是否指"版本对比"按钮？（这个已经存在）
2. 还是指一个新的"版本计划"功能？

**当前 Header 导航按钮**:
- 甘特图
- 表格
- 矩阵  
- 版本对比 ✅
- 迭代规划 ✅

**建议**:
- 如果用户指的是"版本对比"，这个按钮已经存在
- 如果是新功能，需要明确需求后实施

---

### 问题 3: 水平滚动时时间轴不延伸 ⏳ 待修复

**症状**:
- 向右滚动时，时间轴没有继续显示

**可能原因**:
1. 时间轴宽度计算基于 `viewEndDate`
2. `viewEndDate` 可能不够远，导致滚动到最右时没有时间轴

**修复方案**:
1. 检查 `viewEndDate` 的计算逻辑
2. 确保 `viewEndDate` 至少覆盖所有节点的结束日期 + 3个月
3. 或者：动态扩展时间轴，根据滚动位置延伸

**待实施**:
```typescript
// 在 TimelinePanel.tsx 中
const viewEndDate = useMemo(() => {
  const maxDate = Math.max(...data.lines.map(l => 
    new Date(l.endDate || l.startDate).getTime()
  ));
  return addMonths(new Date(maxDate), 3); // 最后节点后再延伸3个月
}, [data.lines]);
```

---

### 问题 4: 新 Timeline 高度对齐问题 ⏳ 待修复

**症状**:
- 如截图，新建的 Timeline 与其他 Timeline 有 gap
- Timeline 标题列和画布中的 timeline 横线不在同一条直线上

**分析**:
从代码看，所有 Timeline 都使用 `ROW_HEIGHT = 120px`，理论上应该对齐。

**可能原因**:
1. 折叠状态下的子节点渲染导致额外高度
2. Timeline 标题的 `borderBottom` 导致1px偏移
3. 新建的 Timeline 可能缺少某些样式

**待检查**:
1. 新建的 Timeline 是否正确应用了所有样式
2. 折叠/展开状态是否影响高度
3. border 是否正确计算在 boxSizing 中

**修复方向**:
- 确保所有 Timeline 行的 `height: ROW_HEIGHT` 且 `boxSizing: 'border-box'`
- 检查是否有 margin/padding 导致额外空间
- 可能需要像素级调试（Chrome DevTools 元素检查）

---

## 🎯 修复优先级

1. ✅ **问题 1**: 编辑模式失效 - **已修复**
2. 🔴 **问题 4**: Timeline 高度对齐 - **需要像素级调试**
3. 🟠 **问题 3**: 时间轴延伸 - **需要实施**
4. 🟢 **问题 2**: 版本计划按钮 - **需要用户确认需求**

---

## 📝 下一步行动

### 立即执行
1. ✅ 刷新浏览器，验证编辑模式修复
2. 使用 Chrome DevTools 检查 Timeline 高度：
   - 检查每个 Timeline 行的实际高度
   - 检查 border、padding、margin
   - 找出 gap 的来源
3. 修复 Timeline 对齐问题
4. 实施时间轴延伸逻辑

### 用户确认
- 请用户确认"版本计划"是指已有的"版本对比"，还是新功能

---

**预计修复时间**: 2-3 小时
