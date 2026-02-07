# 修复无限重渲染循环Bug

**日期**: 2026-02-07  
**问题**: 编辑模式下移动/删除line元素时页面卡死

## 🐛 问题分析

### 症状
1. 页面不断重复渲染（TimelinePanel和RelationRenderer日志重复输出）
2. 最终抛出错误：`RangeError: Invalid array length`
3. 错误堆栈指向：
   - `useUndoRedo.ts:64:5`
   - `TimelinePanel.tsx:691:7` (onClick handler)
   - React状态更新队列溢出

### 根本原因

`useUndoRedo` hook中的`setState`函数在依赖数组中包含了`state`：

```typescript
// ❌ 错误的实现
const setState = useCallback((newState: T) => {
  setHistory(prev => {
    const newHistory = [...prev, state];  // 使用了外部的state
    // ...
  });
  setFuture([]);
  setStateInternal(newState);
}, [state, maxHistorySize]);  // state在依赖中
```

**问题链**:
1. 用户点击删除按钮
2. 调用`setState`更新数据
3. `state`变化导致`setState`函数重新创建
4. 如果某个effect依赖于`setState`，会再次触发
5. 形成无限循环，最终数组长度超出限制

## ✅ 解决方案

使用**函数式更新**，避免在依赖数组中包含`state`：

### 1. setState修复

```typescript
// ✅ 正确的实现
const setState = useCallback((newState: T) => {
  setStateInternal(prevState => {
    // 使用prevState而不是外部的state
    setHistory(prev => {
      const newHistory = [...prev, prevState];
      if (newHistory.length > maxHistorySize) {
        return newHistory.slice(-maxHistorySize);
      }
      return newHistory;
    });
    setFuture([]); // Clear redo stack on new change
    return newState;
  });
}, [maxHistorySize]);  // ✅ 只依赖maxHistorySize
```

### 2. undo修复

```typescript
// Before:
const undo = useCallback(() => {
  if (history.length === 0) return;
  const previous = history[history.length - 1];
  const newHistory = history.slice(0, -1);
  setHistory(newHistory);
  setFuture(prev => [state, ...prev]);  // ❌ 使用外部state
  setStateInternal(previous);
}, [history, state]);  // ❌ 依赖history和state

// After:
const undo = useCallback(() => {
  setHistory(prevHistory => {
    if (prevHistory.length === 0) return prevHistory;
    const previous = prevHistory[prevHistory.length - 1];
    const newHistory = prevHistory.slice(0, -1);
    
    setStateInternal(prevState => {
      setFuture(prev => [prevState, ...prev]);  // ✅ 使用prevState
      return previous;
    });
    
    return newHistory;
  });
}, []);  // ✅ 无依赖
```

### 3. redo修复

```typescript
// Before:
const redo = useCallback(() => {
  if (future.length === 0) return;
  const next = future[0];
  const newFuture = future.slice(1);
  setFuture(newFuture);
  setHistory(prev => [...prev, state]);  // ❌ 使用外部state
  setStateInternal(next);
}, [future, state]);  // ❌ 依赖future和state

// After:
const redo = useCallback(() => {
  setFuture(prevFuture => {
    if (prevFuture.length === 0) return prevFuture;
    const next = prevFuture[0];
    const newFuture = prevFuture.slice(1);
    
    setStateInternal(prevState => {
      setHistory(prev => [...prev, prevState]);  // ✅ 使用prevState
      return next;
    });
    
    return newFuture;
  });
}, []);  // ✅ 无依赖
```

## 🔑 关键改进

1. **函数式更新**: 使用`setState(prev => ...)`而不是直接访问外部状态
2. **移除状态依赖**: 回调函数不依赖任何可变状态
3. **嵌套更新**: 在`setStateInternal`的回调中执行其他状态更新，确保使用最新值

## 📊 修复效果

- ✅ 消除无限循环
- ✅ setState、undo、redo函数现在是稳定的（不会重新创建）
- ✅ 内存不再溢出
- ✅ 编辑模式下的删除和移动操作正常工作

## 🧪 测试验证

1. 进入编辑模式
2. 拖拽移动line元素
3. 删除line元素
4. 撤销/重做操作
5. 确认页面不再卡死，控制台无重复日志

## 📝 经验教训

### 为什么会出现这个问题？

在React中，当useCallback的依赖数组包含频繁变化的值时，回调函数会不断重新创建。如果这个回调又被用在effect的依赖中，就会形成循环：

```typescript
// ❌ 反模式
const fn = useCallback(() => {
  // 使用state
}, [state]);  // state变化 → fn重新创建

useEffect(() => {
  fn();  // fn变化 → effect重新运行 → state变化 → 循环
}, [fn]);
```

### 正确的模式

使用函数式更新来避免在依赖中包含状态：

```typescript
// ✅ 正确模式
const fn = useCallback(() => {
  setState(prev => {
    // 使用prev而不是外部state
    return newValue;
  });
}, []);  // 无状态依赖 → fn稳定

useEffect(() => {
  fn();  // fn不变化 → effect只运行一次
}, [fn]);
```

## 🔗 相关文件

- `/src/hooks/useUndoRedo.ts` - 修复的主要文件
- `/src/components/timeline/TimelinePanel.tsx` - 使用useUndoRedo的组件

## ⏭️ 下一步

1. ✅ 修复无限循环问题（已完成）
2. ⏳ 实现编辑模式的其他功能：
   - 右键菜单
   - 连线节点显示
   - 拖拽连线功能
   - 添加基线功能
