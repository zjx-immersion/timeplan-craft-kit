# 如何重新加载最新代码

## 问题描述

如果您看到这样的错误：
```
TimelinePanel.tsx:2118 Uncaught ReferenceError: HEADER_HEIGHT is not defined
```

这说明浏览器还在运行旧的代码，需要重新加载最新的修复版本。

---

## 解决方案

### 方法1: 硬刷新浏览器（推荐）⭐

在浏览器中按以下快捷键：

#### Windows / Linux
- **Chrome / Edge**: `Ctrl + Shift + R` 或 `Ctrl + F5`
- **Firefox**: `Ctrl + Shift + R` 或 `Ctrl + F5`

#### macOS
- **Chrome / Edge**: `Cmd + Shift + R`
- **Firefox**: `Cmd + Shift + R`
- **Safari**: `Cmd + Option + R`

### 方法2: 清除缓存并刷新

1. 打开开发者工具（F12）
2. 右键点击浏览器刷新按钮
3. 选择"清空缓存并硬性重新加载"

### 方法3: 重启开发服务器

```bash
# 1. 停止当前服务器（Ctrl+C）

# 2. 重新启动
npm run dev
```

### 方法4: 完全重新构建

如果上述方法都不行，尝试：

```bash
# 1. 停止开发服务器

# 2. 删除构建缓存
rm -rf node_modules/.vite
rm -rf dist

# 3. 重新启动
npm run dev
```

---

## 验证修复成功

重新加载后，您应该：

1. ✅ **看不到** `HEADER_HEIGHT is not defined` 错误
2. ✅ 编辑模式下拖拽line不会显示空白页面
3. ✅ 今日标签和基线标签有透明效果
4. ✅ 删除功能正常工作（显示确认对话框）
5. ✅ Ctrl+S可以保存
6. ✅ Ctrl+Z可以撤销

---

## 修复内容（V11）

本次修复包含：

1. **修复致命bug**: 添加`HEADER_HEIGHT`常量定义
2. **标签透明度**: 今日和基线标签使用rgba格式
3. **删除功能增强**: 完整删除并支持撤销
4. **快捷键支持**: Ctrl+S保存、Ctrl+Z撤销、Ctrl+Shift+Z重做

---

## 如果问题仍然存在

1. 确认您已经拉取最新代码：
   ```bash
   git pull origin main
   git log --oneline -1  # 应该看到 "fix: V11测试反馈修复"
   ```

2. 确认文件已更新：
   ```bash
   grep "HEADER_HEIGHT" src/components/timeline/TimelinePanel.tsx
   # 应该看到: const HEADER_HEIGHT = 72;
   ```

3. 检查开发服务器是否在运行最新代码

4. 检查浏览器Console是否还有缓存的错误

---

**最后更新**: 2026-02-08  
**版本**: v0.1.1-rc  
**提交**: bb38997
