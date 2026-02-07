# Timeline左右两侧容器结构不一致问题

## 问题分析

### 左侧Timeline列表结构
```
<div ref={sidebarRef}>                      ← 侧边栏容器
  <div>Timeline 列表</div>                  ← 表头
  {data.timelines.map(timeline => (
    <div key={timeline.id} style={{ height: 120, boxSizing, margin:0, padding:0 }}>  ← 外层
      <div style={{ height: 120, display: flex, alignItems: center, padding, borderBottom, boxSizing, margin:0 }}>  ← 内层
        {/* Timeline标题、颜色、菜单 */}
      </div>
    </div>
  ))}
</div>
```

**层级**：侧边栏 → (map循环) → 外层div → 内层div → 内容

### 右侧Timeline画布结构
```
<div>                                      ← 右侧内容区域
  <TimelineHeader />                       ← 时间轴表头
  <div>网格背景</div>                      ← 网格背景
  <div style={{ position: relative, width: totalWidth, paddingTop: 0 }}>  ← ⚠️ Timeline行内容容器
    {/* 依赖关系线 */}
    {/* 今日线 */}
    {/* 基线范围 */}
    {/* 基线 */}
    {data.timelines.map(timeline => (
      <div key={timeline.id} style={{ height: 120, boxSizing, margin:0, padding:0 }}>  ← 外层
        <div style={{ position: relative, height: 120, borderBottom, backgroundColor: transparent, boxSizing, margin:0, padding:0 }}>  ← 内层
          {/* Lines内容 */}
        </div>
      </div>
    ))}
  </div>
</div>
```

**层级**：右侧内容区 → Timeline行内容容器 → (map循环) → 外层div → 内层div → Lines

## 关键差异

| 维度 | 左侧 | 右侧 |
|------|------|------|
| 外层父容器 | 侧边栏 (sticky, zIndex:100) | **Timeline行内容 (relative)** ⚠️ |
| map循环直接子元素 | 外层div (height:120) | 外层div (height:120) ✅ |
| 内层div | display:flex | **position:relative** ⚠️ |
| 内层padding | `0 8px` | `0` ✅ |
| 内层background | colorBgContainer | **transparent** ⚠️ |

### 问题1：多了一层容器
右侧有额外的"Timeline行内容"容器 (`<div style={{ position: relative, width: totalWidth }}>`)，这个容器包裹了所有Timeline行。

**影响**：
- 该容器是为了放置依赖关系线、今日线、基线等绝对定位元素
- 但这导致Timeline行的DOM层级与左侧不一致

### 问题2：内层div样式差异
| 样式 | 左侧 | 右侧 | 影响 |
|------|------|------|------|
| display | flex | - | 布局方式不同 |
| position | - | relative | 定位方式不同 |
| padding | `0 8px` | `0` | 左侧有内边距 |
| backgroundColor | colorBgContainer | transparent | 左侧有背景色 |
| alignItems | center | - | 垂直对齐方式不同 |

## 修复方案

### 方案1：统一容器结构 ❌ 不推荐
移除右侧的"Timeline行内容"容器，将依赖线等直接放在右侧内容区。
- **问题**：依赖线、今日线等需要absolute定位，需要相对于所有Timeline行的容器定位

### 方案2：统一内层div样式 ✅ 推荐
保持容器结构不变，但确保左右两侧**同级**div的样式完全一致。

**问题根源**：
- 左侧内层div用于显示Timeline信息（标题、颜色等），需要flex布局
- 右侧内层div用于渲染Lines，需要relative定位作为Lines的定位容器
- **这两个div的功能不同，样式本来就应该不同**

### 方案3：理解结构差异，只统一关键样式 ✅ 最佳
**认识到**：
1. 左右两侧的内层div **功能不同**：
   - 左侧：显示静态信息（flex布局）
   - 右侧：作为Lines的相对定位容器

2. **外层div完全一致** ✅
   - 高度：120px
   - boxSizing: border-box
   - margin: 0
   - padding: 0

3. **内层div高度一致** ✅
   - 都是120px
   - boxSizing: border-box
   - borderBottom一致

**结论**：当前结构已经是正确的！左右两侧**外层div**完全一致，这确保了行高度对齐。内层div的样式差异是**必需的功能差异**，不是bug。

## 验证截图分析

截图2显示的是"新 Timeline"的左侧列表项，DevTools显示：
- `div 200×120` - 外层容器
- `Background #FFFFFF` - 内层div背景色
- `Padding 0px 8px` - 内层div的padding

这个结构与代码完全一致！**没有问题**。

## 结论

**问题不在容器结构**，左右两侧的外层容器（决定行高度）已经完全一致。

需要检查的是：
1. 是否有其他CSS导致显示差异（如继承的样式）
2. 是否是浏览器缓存问题（需要强制刷新）
3. 具体哪里"看起来不一致"？需要更详细的截图说明
