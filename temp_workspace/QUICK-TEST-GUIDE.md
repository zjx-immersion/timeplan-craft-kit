# 甘特图优化功能快速测试指南

**测试日期**: 2026-02-08  
**功能数量**: 5项

---

## 快速启动

```bash
cd timeplan-craft-kit
npm run dev
# 访问: http://localhost:9088/orion-x-2026-full-v3
```

---

## 测试清单

### ✅ 测试1: Timeline背景色（极低透明度）

**预期效果**: 左侧Timeline列表有淡淡的彩色背景

**测试步骤**:
1. 打开Orion X计划页面
2. 查看左侧Timeline列表
3. 观察7个Timeline的背景色：
   ```
   1. 项目管理      → 淡绿色背景
   2. 电子电器架构   → 淡蓝色背景
   3. 感知算法      → 淡紫色背景
   4. 规划决策      → 淡青色背景
   5. 控制执行      → 淡橙色背景
   6. 软件集成      → 淡粉色背景
   7. 整车测试      → 淡黄色背景
   ```
4. 鼠标悬停到任一Timeline
5. 验证背景稍加深

**检查点**:
- [ ] 左侧列表每行有背景色
- [ ] 背景色极淡，不花哨
- [ ] 与右侧timeline背景色一致
- [ ] 悬停时背景加深

**参考**: 
- 默认透明度: 8% (hex: 08)
- 悬停透明度: 12% (hex: 12)

---

### ✅ 测试2: Line拖拽改变长度

**预期效果**: 可以拖拽Bar两端改变任务时长

**测试步骤**:
1. 点击"编辑"按钮进入编辑模式
2. 点击选中一个Bar（例如"E0 架构概念设计"）
3. 观察Bar两端（应该有调整区域）
4. 鼠标移到Bar左端，光标变为 ↔
5. 按住鼠标左键，向左拖拽
6. 观察Bar左侧延长
7. 松开鼠标
8. 验证开始日期已改变

**然后测试右端**:
9. 鼠标移到Bar右端，光标变为 ↔
10. 按住鼠标左键，向右拖拽
11. 观察Bar右侧延长
12. 松开鼠标
13. 验证结束日期已改变

**检查点**:
- [ ] 选中Bar后两端可拖拽
- [ ] 光标变为 ↔ (ew-resize)
- [ ] 拖拽时Bar长度实时变化
- [ ] 松开后日期已保存
- [ ] Bar最小宽度限制（20px）
- [ ] 开始日期 < 结束日期始终成立

---

### ✅ 测试3: 元素间磁吸效果

**预期效果**: 拖拽Bar接近其他元素时自动吸附

**测试步骤**:
1. 进入编辑模式
2. 选中"E0 架构概念设计" Bar
3. 拖拽右端接近"E0 评审" Milestone
4. 当距离<1天时，应该自动吸附
5. 观察Bar右端对齐到Milestone日期
6. 松开鼠标，验证日期完全对齐

**再测试左端**:
7. 拖拽"E1 架构方案设计" Bar的左端
8. 接近"E0 评审" Milestone
9. 验证自动吸附

**检查点**:
- [ ] 距离<1天时自动吸附
- [ ] 吸附到Milestone日期
- [ ] 吸附到Gateway日期
- [ ] 吸附到其他Bar的端点
- [ ] 松开后日期完全对齐

**磁吸阈值**: 1天

---

### ✅ 测试4: 基线编辑Hover操作图标

**预期效果**: 鼠标移到基线标签显示编辑和删除图标

**测试步骤**:
1. 进入编辑模式
2. 鼠标移到任一基线标签（例如顶部的时间点标签）
3. 观察标签下方出现两个图标按钮：
   - [✎] 青色编辑图标
   - [🗑] 红色删除图标
4. 鼠标悬停到编辑图标
5. 验证图标变深 + 放大效果
6. 点击编辑图标
7. 验证打开编辑对话框

**检查点**:
- [ ] Hover显示两个图标按钮
- [ ] 编辑图标: 青色(#13c2c2), 28×28px
- [ ] 删除图标: 红色(#ff4d4f), 28×28px
- [ ] 悬停有放大效果
- [ ] 点击打开对应对话框
- [ ] 鼠标移开，图标消失

**参考**: 附件2截图

---

### ✅ 测试5: Milestone和Gateway图形

**预期效果**: 新图形设计

**测试步骤 - Milestone**:
1. 查看甘特图
2. 找到任一Milestone（例如"E0 评审"）
3. 验证图形为倒三角形 ▽
4. 验证是空心（只有边框）
5. 验证边框较粗（2.5px）
6. 点击选中
7. 验证选中效果（ring+放大）

**测试步骤 - Gateway**:
8. 找到任一Gateway（例如"PTR 技术要求评审"）
9. 验证图形为菱形 ◆
10. 验证是实心（有填充）
11. 点击选中
12. 验证选中效果

**检查点 - 图形**:
- [ ] Milestone: 倒三角形（▽）
- [ ] Milestone: 空心 + 粗边
- [ ] Gateway: 菱形（◆）
- [ ] Gateway: 实心填充
- [ ] 两种图形明显不同
- [ ] 选中效果正常

---

### ✅ 测试6: Milestone特殊属性

**预期效果**: 可以设置交付产品和特性需求列表

**测试步骤**:
1. 进入编辑模式
2. 双击"E0 评审" Milestone
3. 打开编辑对话框
4. 查看表单，应该有"交付产品与特性需求"字段
5. 在输入框输入"E0架构概念设计文档"
6. 按Enter或点击+按钮
7. 验证显示为蓝色Tag
8. 继续添加更多项：
   - "E0评审报告"
   - "架构可行性分析"
   - "技术方案评估"
9. 点击Tag的×删除一项
10. 验证删除成功
11. 点击保存
12. 重新打开，验证数据已保存

**检查点**:
- [ ] 字段标题: "交付产品与特性需求"
- [ ] 输入框有+按钮
- [ ] 按Enter添加
- [ ] 显示为蓝色Tag
- [ ] Tag可删除
- [ ] 数据保存成功
- [ ] 仅Milestone显示此字段

---

### ✅ 测试7: Gateway特殊属性

**预期效果**: 可以设置质量门禁和评审要求列表

**测试步骤**:
1. 进入编辑模式
2. 双击"PTR 技术要求评审" Gateway
3. 打开编辑对话框
4. 查看表单，应该有"质量门禁与评审要求"字段
5. 在输入框输入"架构设计完整性检查"
6. 按Enter或点击+按钮
7. 验证显示为橙色Tag
8. 继续添加更多项：
   - "技术评审通过"
   - "风险评估完成"
   - "Stakeholder签字确认"
   - "文档齐全性检查"
9. 点击Tag的×删除一项
10. 验证删除成功
11. 点击保存
12. 重新打开，验证数据已保存

**检查点**:
- [ ] 字段标题: "质量门禁与评审要求"
- [ ] 输入框有+按钮
- [ ] 按Enter添加
- [ ] 显示为橙色Tag
- [ ] Tag可删除
- [ ] 数据保存成功
- [ ] 仅Gateway显示此字段

---

## 22. 视觉验证

### 22.1 Timeline背景色

**验证方式**: 截图 + 开发者工具

```javascript
// 在浏览器Console运行
const timelineRows = document.querySelectorAll('[data-timeline-row]');
timelineRows.forEach((row, index) => {
  const bgColor = window.getComputedStyle(row).backgroundColor;
  console.log(`Timeline ${index + 1}: ${bgColor}`);
});

// 预期输出:
// Timeline 1: rgba(82, 196, 26, 0.03)   ← 绿色 8%
// Timeline 2: rgba(24, 144, 255, 0.03)  ← 蓝色 8%
// ...
```

### 22.2 Milestone图形

**验证方式**: 开发者工具检查SVG

```javascript
// 查找Milestone的SVG
const milestones = document.querySelectorAll('[data-line-type="milestone"] svg');
milestones.forEach(svg => {
  const polygon = svg.querySelector('polygon');
  console.log('Milestone polygon points:', polygon.getAttribute('points'));
  console.log('Milestone fill:', polygon.getAttribute('fill'));
  console.log('Milestone stroke-width:', polygon.getAttribute('stroke-width'));
});

// 预期输出:
// points: "8,14 0,2 16,2"  ← 倒三角
// fill: "transparent"       ← 空心
// stroke-width: "2.5"       ← 粗边
```

### 22.3 Gateway图形

**验证方式**: 开发者工具检查SVG

```javascript
// 查找Gateway的SVG
const gateways = document.querySelectorAll('[data-line-type="gateway"] svg');
gateways.forEach(svg => {
  const polygon = svg.querySelector('polygon');
  console.log('Gateway polygon points:', polygon.getAttribute('points'));
  console.log('Gateway fill:', polygon.getAttribute('fill'));
});

// 预期输出:
// points: "7,0 14,7 7,14 0,7"  ← 菱形
// fill: "#A855F7" (或其他颜色)  ← 实心
```

---

## 23. 回归测试

### 23.1 确保原有功能不受影响

- [ ] 创建新Timeline
- [ ] 复制Timeline
- [ ] 删除Timeline
- [ ] 添加新Line
- [ ] 编辑Line属性
- [ ] 删除Line
- [ ] 创建依赖关系（连线）
- [ ] 删除依赖关系
- [ ] 撤销/重做
- [ ] 视图切换（表格/矩阵/版本对比）
- [ ] 时间刻度切换（天/周/双周/月/季度）
- [ ] 缩放功能
- [ ] 导出功能
- [ ] 关键路径显示

---

## 24. 性能测试

### 24.1 磁吸性能

**测试**: 50条Lines的磁吸计算

```javascript
// 测试脚本
const startTime = performance.now();

// 模拟50次磁吸计算
for (let i = 0; i < 50; i++) {
  findMagneticSnapDate(testDate, 'line-test', all50Lines, 'right');
}

const endTime = performance.now();
console.log(`50次磁吸计算耗时: ${endTime - startTime}ms`);

// 预期: < 10ms
```

**性能目标**: 单次计算 < 0.2ms

---

## 25. 问题排查

### 25.1 如果背景色不显示

**检查**:
1. 确认`timeline.color`字段存在
2. 确认CSS透明度值正确（08 = 8%）
3. 检查浏览器Console有无错误
4. 使用开发者工具检查computed style

**排查脚本**:
```javascript
const timeline = document.querySelector('[data-timeline-id]');
const bgColor = window.getComputedStyle(timeline).backgroundColor;
console.log('Background color:', bgColor);
// 预期: rgba(x, x, x, 0.03)
```

### 25.2 如果拖拽不工作

**检查**:
1. 确认已进入编辑模式
2. 确认Bar已被选中（有边框）
3. 确认鼠标在端点区域（左右各8px）
4. 检查Console有无错误
5. 验证`useBarResize` hook正常工作

### 25.3 如果磁吸不工作

**检查**:
1. 确认`allLines`参数已传递
2. 确认距离<1天
3. 检查`findMagneticSnapDate`函数逻辑
4. 使用Console.log调试：
   ```typescript
   console.log('Target date:', targetDate);
   console.log('Closest element date:', closestDate);
   console.log('Distance (days):', minDistance);
   ```

### 25.4 如果图形不正确

**检查**:
1. 确认SVG代码正确
2. 确认viewBox和points坐标
3. 使用开发者工具检查渲染的SVG
4. 验证`schemaId`判断逻辑

---

## 26. 预期截图

### 26.1 Timeline背景色

```
Timeline 列表
┌───────────────────────────────────┐
│ ┏━━━┓ ▼ 项目管理        ...      │ ← 淡绿色背景
│ ┗━━━┛    项目办 | ECU开发计划     │
├───────────────────────────────────┤
│ ┏━━━┓ ▼ 电子电器架构     ...      │ ← 淡蓝色背景
│ ┗━━━┛    架构团队 | ECU开发计划   │
├───────────────────────────────────┤
│ ┏━━━┓ ▼ 感知算法         ...      │ ← 淡紫色背景
│ ┗━━━┛    感知团队 | 软件产品计划  │
└───────────────────────────────────┘
```

### 26.2 拖拽手柄

```
编辑模式，选中Bar:

   E0 架构概念设计
[▌████████████████████████▐]
 ↑                        ↑
左端手柄               右端手柄
(8px宽)               (8px宽)
```

### 26.3 磁吸效果

```
拖拽前:
[Bar A====]    距离3天    [◆ Milestone]
         2026-01-12      2026-01-15

拖拽中:
[Bar A======]  距离0.5天  [◆ Milestone]
           2026-01-14.5  2026-01-15

磁吸后:
[Bar A=======] 对齐！     [◆ Milestone]
            2026-01-15   2026-01-15
```

### 26.4 基线Hover操作

```
默认状态:
[基线标签]
2026-01-15

Hover状态:
[基线标签]
2026-01-15
[✎ 编辑] [🗑 删除] ← 两个图标按钮
 青色     红色
```

### 26.5 新图形

```
Milestone (空心倒三角):
     ▽
    ╱ ╲
   ╱   ╲
  ╱     ╲
 ╱_______╲

Gateway (实心菱形):
      ◆
     ███
    █████
   ███████
    █████
     ███
      ◆
```

---

## 27. 数据验证

### 27.1 验证特殊属性保存

**Milestone数据**:
```javascript
// 在Console运行
const milestones = JSON.parse(localStorage.getItem('allTimePlans') || '[]')
  [0].lines.filter(l => l.schemaId === 'milestone-schema');

milestones.forEach(m => {
  console.log(m.label, ':', m.attributes?.deliverables || '无');
});

// 预期输出:
// E0 评审 : ["E0架构概念设计文档", "E0评审报告", ...]
```

**Gateway数据**:
```javascript
const gateways = JSON.parse(localStorage.getItem('allTimePlans') || '[]')
  [0].lines.filter(l => l.schemaId === 'gateway-schema');

gateways.forEach(g => {
  console.log(g.label, ':', g.attributes?.qualityGates || '无');
});

// 预期输出:
// PTR 技术要求评审 : ["架构设计完整性检查", "技术评审通过", ...]
```

---

## 28. 完成标志

✅ **所有测试通过标准**:
1. 左侧Timeline背景色显示且极淡
2. Bar可以通过拖拽端点改变长度
3. 拖拽接近其他元素时自动吸附
4. 基线hover显示编辑/删除图标
5. Milestone显示为空心倒三角
6. Gateway显示为实心菱形
7. Milestone可编辑交付产品列表
8. Gateway可编辑质量门禁列表
9. 无Console错误
10. 所有原有功能正常

---

**测试人**: _____  
**测试日期**: _____  
**测试结果**: [ ] 通过 / [ ] 部分通过 / [ ] 未通过  
**问题记录**: _____
