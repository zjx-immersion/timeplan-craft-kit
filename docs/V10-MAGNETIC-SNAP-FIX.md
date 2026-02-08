# V10 磁吸效果优化 - 局部提示

## 问题描述

用户反馈：当前的磁吸效果是全局的、整个页面可见的红色大竖线，视觉冲击太强。

需求：
- 磁吸效果应该是局部的
- 仅在所选元素与靠近元素之间显示
- 提示用户靠近且已经磁吸上了
- 不需要全局/整个页面都看见

## 原有实现

### 全局红色指示线（TimelinePanel.tsx L2087-2133）

```tsx
{/* ✅ 磁吸指示线 - 超明显版（Portal到body层） */}
{magneticSnapInfo && (() => {
  return (
    <div style={{
      position: 'fixed',  // 固定定位，覆盖整个屏幕
      left: SIDEBAR_WIDTH + magneticSnapInfo.position - scrollLeft,
      top: 68 - scrollTop,
      height: '80vh',  // 占据80%视口高度
      width: 8,
      backgroundColor: '#ff4d4f',  // 红色
      zIndex: 9999,
      boxShadow: '0 0 24px 8px rgba(255, 77, 79, 1)',  // 强烈发光
    }}>
      {/* 大标签 */}
      <div style={{...}}>🧲 磁吸对齐</div>
    </div>
  );
})()}
```

**问题：**
- `position: fixed` - 固定在视口，整个页面可见
- `height: '80vh'` - 占据大部分屏幕高度
- `backgroundColor: '#ff4d4f'` - 醒目的红色
- `boxShadow` - 强烈发光效果
- `zIndex: 9999` - 超高层级，覆盖所有内容

## 解决方案

### 新设计：局部绿色指示器

**设计原则：**
1. **局部显示** - 只在被调整的line附近显示
2. **精准定位** - 准确定位到该line所在的行
3. **柔和提示** - 使用绿色圆点+短线的组合
4. **动画效果** - 添加脉冲动画，吸引注意但不刺眼

### 实现代码（TimelinePanel.tsx）

#### 1. 注入CSS动画（L327-349）

```tsx
// ✅ V10: 注入磁吸脉冲动画CSS
useEffect(() => {
  const styleId = 'magnetic-pulse-animation';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes magneticPulse {
        0%, 100% {
          transform: scale(1);
          opacity: 1;
        }
        50% {
          transform: scale(1.3);
          opacity: 0.7;
        }
      }
    `;
    document.head.appendChild(style);
  }
}, []);
```

#### 2. 局部磁吸指示器（L2107-2146）

```tsx
{/* ✅ V10 磁吸提示 - 局部效果（仅在调整的line上显示） */}
{magneticSnapInfo && isResizing && resizingNodeId && (() => {
  // 查找正在调整大小的line的timeline索引
  const resizingLine = data.lines.find(l => l.id === resizingNodeId);
  if (!resizingLine) return null;
  
  const timelineIndex = data.timelines.findIndex(t => t.id === resizingLine.timelineId);
  if (timelineIndex === -1) return null;
  
  const topOffset = timelineIndex * ROW_HEIGHT + HEADER_HEIGHT + ROW_HEIGHT / 2;
  
  return (
    <>
      {/* 磁吸点指示器 */}
      <div style={{
        position: 'absolute',
        left: magneticSnapInfo.position - 8,
        top: topOffset - 8,
        width: 16,
        height: 16,
        backgroundColor: '#52c41a',  // ✅ 绿色表示对齐成功
        borderRadius: '50%',
        border: '2px solid #fff',
        boxShadow: '0 2px 8px rgba(82, 196, 26, 0.6)',
        zIndex: 100,
        pointerEvents: 'none',
        animation: 'magneticPulse 1s ease-in-out infinite',
      }} />
      
      {/* 磁吸提示短线（局部） */}
      <div style={{
        position: 'absolute',
        left: magneticSnapInfo.position,
        top: topOffset - 20,
        width: 2,
        height: 40,
        backgroundColor: '#52c41a',
        opacity: 0.5,
        zIndex: 99,
        pointerEvents: 'none',
      }} />
    </>
  );
})()}
```

## 效果对比

| 特性 | 旧设计 | 新设计 |
|------|--------|--------|
| **定位方式** | `fixed` (视口固定) | `absolute` (相对于容器) |
| **可见范围** | 整个页面 | 仅在调整的line附近 |
| **高度** | 80vh (大部分屏幕) | 40px (局部) |
| **颜色** | 红色 (#ff4d4f) | 绿色 (#52c41a) |
| **视觉强度** | 强烈发光 | 柔和提示 |
| **层级** | z-index: 9999 | z-index: 100 |
| **动画** | 无 | 脉冲动画 |

## 技术要点

### 1. 精准定位
```tsx
const timelineIndex = data.timelines.findIndex(t => t.id === resizingLine.timelineId);
const topOffset = timelineIndex * ROW_HEIGHT + HEADER_HEIGHT + ROW_HEIGHT / 2;
```
- 根据line所在timeline的索引计算Y坐标
- 确保指示器显示在正确的行上

### 2. 条件渲染
```tsx
{magneticSnapInfo && isResizing && resizingNodeId && (...)}
```
- 只在调整大小时显示
- 必须有磁吸信息
- 必须有被调整的节点ID

### 3. 双重指示
- **绿色圆点** - 主要视觉焦点，带脉冲动画
- **短竖线** - 辅助对齐参考

### 4. CSS动画
- 使用`@keyframes magneticPulse`定义动画
- 动态注入到`<head>`中
- 避免重复注入（检查`styleId`）

## 用户体验提升

1. **专注性** - 用户注意力集中在正在编辑的元素上
2. **清晰性** - 绿色表示"对齐成功"，语义明确
3. **非侵入性** - 不遮挡其他内容，不影响操作
4. **流畅性** - 脉冲动画提供流畅的视觉反馈

## 测试验证

### 测试步骤
1. 进入编辑模式
2. 拖拽一个Bar的左/右边缘调整大小
3. 靠近另一个元素的开始/结束日期（1天内）
4. 观察磁吸指示器效果

### 预期结果
- 靠近其他元素时，在被拖拽的line上出现绿色圆点
- 圆点位置对应磁吸对齐的日期
- 有轻微的脉冲动画效果
- 移开后圆点消失
- 不会有全局的红色竖线

## 版本记录

- **V10 (2026-02-06)** - 磁吸效果从全局改为局部提示
  - 移除全局红色指示线
  - 添加局部绿色圆点指示器
  - 添加脉冲动画CSS
  - 优化视觉层级和用户体验
