# 🐛 连线不显示Bug修复

## 问题原因

**根本原因**: `RelationRenderer.tsx`第167行的条件判断有误！

### 错误代码
```typescript
if (!relation.displayConfig?.visible) return null;
```

### 问题分析

这个条件会导致：

| displayConfig.visible | !displayConfig.visible | 结果 |
|----------------------|------------------------|------|
| `true` | `false` | ✅ 渲染 |
| `false` | `true` | ❌ 跳过 |
| `undefined` (未定义) | `true` | ❌ **跳过** |

**关键问题**: 如果Relations数据中没有设置`displayConfig.visible`字段（值为`undefined`），所有连线都会被跳过！

而从源项目`timeline-craft-kit`的`Dependency`类型定义来看：

```typescript
export interface Dependency {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  type: 'finish-to-start' | ...;
  // ❌ 没有displayConfig字段！
}
```

迁移过来的数据**很可能没有`displayConfig`字段**，导致所有连线被跳过！

---

## 修复方案

### 修复代码
```typescript
// ✅ 只有明确设置为false才跳过，undefined默认为true
if (relation.displayConfig?.visible === false) return null;
```

### 修复后的行为

| displayConfig.visible | === false | 结果 |
|----------------------|-----------|------|
| `true` | `false` | ✅ 渲染 |
| `false` | `true` | ❌ 跳过 |
| `undefined` | `false` | ✅ **渲染** |

**结果**: 只有明确设置为`false`时才跳过，`undefined`或`true`都会渲染。

---

## 为什么日志显示"25 valid"但看不到连线？

### 日志显示的检查逻辑

日志中的"Valid"检查是在**数据层**（第100-118行）：

```typescript
relations.forEach((relation, idx) => {
  const fromPos = linePositions.get(relation.fromLineId);
  const toPos = linePositions.get(relation.toLineId);
  const visible = relation.displayConfig?.visible !== false;  // ← 注意这里！
  
  if (!visible) {
    console.log(`❌ 隐藏 (visible=false)`);
  } else if (!fromPos) {
    console.log(`❌ From line not found`);
  } else if (!toPos) {
    console.log(`❌ To line not found`);
  } else {
    console.log(`✅ Valid`);  // ← 这里标记为Valid
  }
});
```

**注意**: 这里的检查用的是`!== false`，所以`undefined`会被当作`true`，标记为"Valid"。

但实际渲染时（第167行）：

```typescript
if (!relation.displayConfig?.visible) return null;  // ← 问题在这里！
```

这里的条件用的是`!relation.displayConfig?.visible`，所以`undefined`会被跳过！

**结论**: 日志检查和实际渲染的逻辑**不一致**，导致日志显示"Valid"但实际不渲染。

---

## 测试验证

修复后，请验证：

1. ✅ 刷新页面
2. ✅ 查看日志仍然显示"25 valid"
3. ✅ **页面上应该能看到25条青绿色虚线**
4. ✅ Hover连线时应该变粗并显示标签（FS/SS/FF/SF）

---

## 后续优化建议

### 1. 统一displayConfig默认值

在Mock数据生成时，明确设置`displayConfig.visible = true`：

```typescript
// src/utils/mockData.ts
relations.push({
  id: generateId('relation'),
  type: 'dependency',
  fromLineId: lines[0].id,
  toLineId: lines[1].id,
  properties: {
    dependencyType: 'finish-to-start',
  },
  displayConfig: {
    visible: true,       // ✅ 明确设置
    lineStyle: 'solid',
    lineColor: '#14B8A6',
    lineWidth: 2,
    showArrow: true,
  },
});
```

### 2. 统一日志检查逻辑

将日志检查的逻辑改为与渲染逻辑一致：

```typescript
// 修改前（日志）
const visible = relation.displayConfig?.visible !== false;

// 修改后（与渲染一致）
const visible = relation.displayConfig?.visible !== false;
// 或者直接重用渲染逻辑
const shouldSkip = relation.displayConfig?.visible === false;
const visible = !shouldSkip;
```

---

## 总结

| 阶段 | 状态 | 说明 |
|------|------|------|
| 数据层 | ✅ 正常 | 25个Relations，所有引用有效 |
| 协议层 | ✅ 正常 | Line ID匹配，Timeline ID匹配 |
| 渲染层 | ❌ **有Bug** | `!displayConfig.visible`逻辑错误 |
| 显示层 | N/A | 未渲染，无法验证 |

**修复完成后**，连线应该立即显示！🚀
