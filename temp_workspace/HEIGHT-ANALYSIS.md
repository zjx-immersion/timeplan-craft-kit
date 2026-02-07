# Timeline 高度分析

## 问题总结

根据截图分析，发现两个主要问题：

### 1. 复制功能不完整 ✅ **已修复**
- 原实现只复制了Timeline对象，未复制其中的Lines和Relations
- 修复：实现完整复制逻辑（TimelinePanel.tsx 688-741行）
  - 复制Timeline对象
  - 复制所有属于该Timeline的Lines
  - 复制Timeline内部的Relations
  - 生成新的ID避免冲突

### 2. 新增/复制的Timeline右侧画布空白 ❌ **待修复**
- 问题：新增Timeline时，右侧画布区域没有显示网格线和横线
- 原因分析：
  - 网格背景（gridBackground）基于 `data.timelines.length` 渲染
  - 横线（horizontalLines）也基于 `data.timelines` 遍历渲染
  - Timeline行容器正确设置了高度和边框
  - **可能原因**：需要检查网格线的渲染逻辑

### 3. 高度119px vs 120px问题 ℹ️ **说明**
- DevTools显示的119px是因为 `boxSizing: 'border-box'`
- 实际容器高度 = 120px ✅
- 内容区域高度 = 120px - 1px (borderBottom) = 119px ✅
- 这是正常现象，不是bug

## 代码位置

### 网格背景渲染
- 文件：TimelinePanel.tsx
- 位置：1860-1955行
- 高度计算：`height: data.timelines.length * ROW_HEIGHT`

### Timeline行渲染
- 文件：TimelinePanel.tsx
- 位置：2055-2307行
- 结构：两层div，都设置 `height: ROW_HEIGHT` 和 `boxSizing: 'border-box'`

## 下一步行动

1. ✅ **已完成**：修复复制功能
2. ⏳ **进行中**：检查网格背景和横线的渲染逻辑
3. ⏳ **待确认**：验证修复后的效果
