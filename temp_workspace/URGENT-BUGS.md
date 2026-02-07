# 紧急问题修复清单

**创建时间**: 2026-02-07  
**状态**: 🔴 紧急  

---

## 🐛 问题 1: 编辑模式功能全部失效

### 症状
- 点击"编辑"按钮后，editMode切换为true（console证实）
- 但所有编辑功能不工作：
  - ❌ Timeline快捷菜单（...按钮）不显示
  - ❌ 右键菜单不弹出
  - ❌ 节点选中无效果
  - ❌ 无法创建连线
  - ❌ 无法拖拽节点

### Console Log
```
UnifiedTimelinePanelV2 Render: {view: 'gantt', editMode: true, scale: 'month', zoom: 1}
TimelinePanel 正常接收 isEditMode: true
```

### 可能原因
1. TimelinePanel的hideToolbar=true可能影响了编辑模式
2. UnifiedTimelinePanelV2的editMode没有正确传递给TimelinePanel
3. TimelinePanel内部的isEditMode状态管理有问题

### 修复计划
1. 检查UnifiedTimelinePanelV2中的editMode传递
2. 检查TimelinePanel的props接收
3. 验证TimelineQuickMenu的渲染条件
4. 验证右键菜单的触发条件

---

## 🐛 问题 2: 版本计划导航按钮缺失

### 症状
- Header上没有看到新的"版本计划"导航按钮

### 可能原因
- 功能可能还没实现，或者按钮没有添加到Header

### 修复计划
- 检查是否真的实现了版本计划功能
- 如果没有，这不是bug，而是待实现的功能

---

## 🐛 问题 3: 水平滚动时时间轴不延伸

### 症状
- 向右滚动时，时间轴没有继续延伸

### 可能原因
- 时间轴宽度固定，没有根据滚动动态扩展

### 修复计划
- 检查时间轴总宽度计算逻辑
- 确保时间轴宽度足够大，可以覆盖所有节点

---

## 🐛 问题 4: 新Timeline高度对齐问题

### 症状
- 如截图，新建的Timeline与其他Timeline有gap
- Timeline标题列和画布中的timeline横线不在同一条线上

### 可能原因
- 新Timeline的样式或高度设置不一致
- Timeline列表的渲染高度计算有误

### 修复计划
- 确保所有Timeline使用固定高度ROW_HEIGHT (120px)
- 检查新Timeline的样式
- 像素级调整，确保完全对齐

---

## 🚨 修复优先级

1. 🔴 **问题1** - 编辑模式失效（最高优先级，影响所有编辑功能）
2. 🟠 **问题4** - Timeline对齐（影响视觉体验）
3. 🟡 **问题3** - 时间轴延伸（影响用户操作）
4. 🟢 **问题2** - 版本计划按钮（可能不是bug）

---

**下一步**: 立即修复问题1
