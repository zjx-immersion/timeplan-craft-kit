# 网格渲染分析

## 当前实现

### 网格背景容器 (1860-1955行)
```typescript
<div style={{
  position: 'absolute',
  top: 68,  // 表头高度
  left: 0,
  width: totalWidth,
  height: data.timelines.length * ROW_HEIGHT || 400,  // 🔑 基于所有timelines的总高度
  pointerEvents: 'none',
  zIndex: 0,
}}>
  {/* 垂直网格线 */}
  {dateHeaders.map(...)}
  
  {/* 水平网格线 */}
  {data.timelines.map((_, index) => (
    <div key={index} style={{
      top: (index + 1) * ROW_HEIGHT - 1,  // 每行底部
      height: 1,
    }} />
  ))}
</div>
```

### Timeline行容器 (2055-2075行)
```typescript
{data.timelines.map(timeline => (
  <div key={timeline.id} style={{
    height: ROW_HEIGHT,  // 外层容器120px
    boxSizing: 'border-box',
  }}>
    <div style={{
      position: 'relative',
      height: ROW_HEIGHT,  // 内层容器120px
      borderBottom: `1px solid ${token.colorBorderSecondary}`,  // 底部边框
      backgroundColor: '#fff',
      boxSizing: 'border-box',
    }}>
      {/* Lines内容 */}
    </div>
  </div>
))}
```

## 渲染逻辑

### ✅ 网格背景
- **垂直网格线**：基于 `dateHeaders` 渲染，与timeline数量无关
- **水平网格线**：基于 `data.timelines.map` 渲染，每个timeline都有一条
- **高度**：`data.timelines.length * ROW_HEIGHT`

### ✅ Timeline行边框
- 每个timeline行都有 `borderBottom`
- 高度固定为 `ROW_HEIGHT` (120px)
- 使用 `boxSizing: 'border-box'` 确保border包含在高度内

## 预期行为

### 新增空Timeline
1. ✅ 左侧列表会新增一行 (120px高度)
2. ✅ 右侧画布会新增一行容器 (120px高度，有底部边框)
3. ✅ 网格背景高度增加 (+120px)
4. ✅ 新增水平网格线
5. ✅ 垂直网格线延伸到新行

### 复制Timeline
1. ✅ 复制所有Lines和Relations（已修复）
2. ✅ 新Timeline行结构与原行完全一致
3. ✅ 网格线自动覆盖新行

## 可能的问题

### 问题1：右侧画布滚动到最右边时空白
- **原因**：`viewEndDate` 范围不足
- **状态**：✅ 已修复（动态计算 viewEndDate）

### 问题2：新增Timeline右侧看起来"空白"
- **原因**：新Timeline的 `lineIds: []`，没有任何bars/milestones
- **状态**：⚠️ **这不是bug，而是预期行为**
  - 空timeline确实没有内容显示
  - 但应该有网格线和边框

### 问题3：网格线可能不明显
- **原因**：背景色相近，对比度低
- **解决方案**：
  - 网格背景：`#fafafa`
  - Timeline行：`#fff`
  - 边框颜色：`token.colorBorderSecondary`（通常是 `#f0f0f0`）

## 建议

### 1. 增强空Timeline的视觉反馈
为空timeline添加占位提示：
```typescript
{lines.length === 0 && isEditMode && (
  <div style={{
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    textAlign: 'center',
    color: token.colorTextTertiary,
    fontSize: 13,
  }}>
    点击 "+" 添加计划单元
  </div>
)}
```

### 2. 确认边框颜色对比度
检查theme token的颜色值，确保边框可见。

### 3. 验证网格背景z-index
确保网格背景 (z-index: 0) 不被其他元素覆盖。
