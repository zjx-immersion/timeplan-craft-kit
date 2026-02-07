# 差距分析与完善实施计划

**日期**: 2026-02-07  
**项目**: timeplan-craft-kit vs timeline-craft-kit  
**版本**: v2.1.0  

---

## 📊 功能对比总览

### 源项目 (timeline-craft-kit) 统计
- Header/导航栏按钮：**5个**
- 工具栏按钮：**14+个**
- 右键菜单：**2种**（Timeline菜单、Node菜单）
- 下拉菜单：**1个主要菜单**（Timeline快速菜单）
- 对话框/Modal：**9个**

### 目标项目 (timeplan-craft-kit) 统计
- Header/导航栏按钮：**5个** ✅
- 工具栏按钮：**12个** ⚠️（部分功能缺失）
- 右键菜单：**2种** ⚠️（部分功能未实现）
- 下拉菜单：**1个** ⚠️（部分功能未集成）
- 对话框/Modal：**6个** ⚠️（3个未集成）

---

## 🔍 详细差距分析

### 1. Header/导航栏 - 差距：0%（已完全对齐）

| 功能 | 源项目 | 目标项目 | 状态 |
|------|--------|----------|------|
| 返回按钮 | ✅ | ✅ | 已对齐 |
| 标题编辑 | ✅ | ✅ | 已对齐 |
| 视图切换器 | ✅ (5个视图) | ✅ (5个视图) | 已对齐 |
| 产品选择器（迭代视图） | ✅ | ✅ | 已对齐 |

**总结**: Header区域功能完整，无需额外实施。

---

### 2. 工具栏按钮 - 差距：约20%

| 功能 | 源项目 | 目标项目 | 状态 | 优先级 |
|------|--------|----------|------|--------|
| 编辑/查看模式切换 | ✅ | ✅ | 已对齐 | - |
| Timeline 添加 | ✅ | ⚠️ 占位符（UnifiedTimelinePanelV2） | **需修复** | P0 |
| 节点添加下拉 | ✅ | ✅ | 已对齐 | - |
| 关键路径 | ✅ | ⚠️ 按钮存在，无高亮渲染 | **需增强** | P1 |
| 撤销/重做/取消/保存 | ✅ | ✅ | 已对齐 | - |
| 今天按钮 | ✅ | ✅ | 已对齐 | - |
| 缩放控制 | ✅ | ✅ | 已对齐 | - |
| 导出图片 | ✅ 4个选项 | ❌ 未集成 | **需实施** | P1 |
| 导出数据 | ✅ JSON/CSV/Excel | ⚠️ 仅JSON（UnifiedTimelinePanelV2） | **需修复** | P2 |
| 导入 | ✅ | ⚠️ 占位符（UnifiedTimelinePanelV2） | **需修复** | P2 |
| 全屏 | ✅ | ✅ | 已对齐 | - |

**关键差距**:
1. UnifiedTimelinePanelV2中的Timeline添加按钮未实现
2. 图片导出功能完全缺失（虽然Dialog已实现）
3. CSV/Excel导出在UnifiedTimelinePanelV2中缺失
4. 导入功能在UnifiedTimelinePanelV2中未实现
5. 关键路径无可视化高亮

---

### 3. 右键菜单 - 差距：约30%

#### 3.1 Timeline 右键菜单

| 功能 | 源项目 | 目标项目 | 状态 | 优先级 |
|------|--------|----------|------|--------|
| 添加节点（子菜单） | ✅ 3种类型 | ✅ | 已对齐 | - |
| 添加基准线 | ✅ | ✅ | 已对齐 | - |
| 绘制时间区间 | ✅ | ✅ | 已对齐 | - |
| 创建依赖连线 | ✅ | ✅ | 已对齐 | - |

**Timeline右键菜单**: 功能完整 ✅

#### 3.2 Node 右键菜单

| 功能 | 源项目 | 目标项目 | 状态 | 优先级 |
|------|--------|----------|------|--------|
| 编辑节点 | ✅ | ❌ 占位符 | **需实施** | P0 |
| 删除节点 | ✅ | ✅ | 已对齐 | - |
| 复制节点 | ✅ | ✅ | 已对齐 | - |
| 转换节点类型 | ✅ | ✅ | 已对齐 | - |
| 添加依赖关系 | ✅ | ✅ | 已对齐 | - |
| 添加到基线 | ✅ | ❌ 占位符 | **需实施** | P2 |
| 查看嵌套计划 | ✅ | ❌ 占位符 | **需实施** | P3 |

**关键差距**:
1. **编辑节点**功能虽然NodeEditDialog已实现，但未集成到右键菜单
2. 添加到基线功能未实现
3. 查看嵌套计划功能未实现

---

### 4. 下拉菜单（Timeline快速菜单）- 差距：约25%

| 功能 | 源项目 | 目标项目 | 状态 | 优先级 |
|------|--------|----------|------|--------|
| 添加节点（子菜单） | ✅ | ✅ | 已对齐 | - |
| 设置背景色 | ✅ | ❌ 未实现 | **需实施** | P2 |
| 整体时间调整 | ✅ | ❌ 未集成 | **需实施** | P1 |
| 复制 Timeline | ✅ | ✅ | 已对齐 | - |
| 显示/隐藏关键路径 | ✅ | ❌ 未实现 | **需实施** | P2 |
| 编辑 Timeline | ✅ | ✅ | 已对齐 | - |
| 删除 Timeline | ✅ | ✅ | 已对齐 | - |

**关键差距**:
1. **设置背景色**功能完全缺失（包括ColorPicker组件）
2. **整体时间调整**虽然Dialog已实现，但未集成到菜单
3. **显示/隐藏关键路径**菜单项缺失

---

### 5. 对话框/Modal - 差距：约30%

| 对话框 | 源项目 | 目标项目 | 状态 | 优先级 |
|--------|--------|----------|------|--------|
| 节点编辑对话框 | ✅ | ✅ 已实现但未集成 | **需集成** | P0 |
| Timeline 编辑对话框 | ✅ | ✅ | 已对齐 | - |
| 基准线编辑对话框 | ✅ | ✅ | 已对齐 | - |
| 基准线区间编辑对话框 | ✅ | ✅ | 已对齐 | - |
| Timeline 时间平移对话框 | ✅ | ✅ 已实现但未集成 | **需集成** | P1 |
| 导出对话框（数据） | ✅ | ✅ | 已对齐 | - |
| 导入对话框 | ✅ | ✅ | 已对齐 | - |
| 图片导出对话框 | ✅ | ✅ 已实现但未集成 | **需集成** | P1 |
| 备注侧边栏（Sheet） | ✅ | ❌ 未实现 | **需实施** | P2 |
| MR 选择/详情对话框 | ✅ | ✅ | 已对齐 | - |

**关键差距**:
1. **节点编辑对话框**已实现但未集成到右键菜单
2. **时间平移对话框**已实现但未集成到快速菜单
3. **图片导出对话框**已实现但未集成到工具栏
4. **备注侧边栏**完全缺失

---

### 6. 其他辅助功能 - 差距：约40%

| 功能 | 源项目 | 目标项目 | 状态 | 优先级 |
|------|--------|----------|------|--------|
| Timeline 颜色选择器 | ✅ | ❌ 未实现 | **需实施** | P2 |
| 备注编辑（Markdown支持） | ✅ | ❌ 未实现 | **需实施** | P2 |
| 关键路径高亮渲染 | ✅ | ❌ 未实现 | **需实施** | P1 |
| 未保存更改提示 | ✅ | ⚠️ 部分实现 | **需增强** | P2 |
| 节点连接点可视化 | ✅ | ❌ 未实现 | **需实施** | P2 |
| 拖拽创建节点 | ✅ | ⚠️ 部分实现 | **需验证** | P2 |

---

## 📋 完善实施计划

### Phase 1: 核心缺失功能修复（P0）- 预计2-3天

#### 任务1.1: 集成节点编辑功能
**优先级**: P0  
**预计工时**: 4小时

**任务描述**:
- 将已实现的`NodeEditDialog`集成到`NodeContextMenu`的"编辑节点"菜单项
- 在`TimelinePanel.tsx`中实现`handleEditNode`函数
- 双击节点时自动打开编辑对话框
- 测试所有节点类型（Bar/Milestone/Gateway）的编辑

**实施步骤**:
1. 在`TimelinePanel.tsx`中导入`NodeEditDialog`
2. 添加状态：`const [editingNode, setEditingNode] = useState<Line | null>(null);`
3. 添加状态：`const [nodeEditDialogOpen, setNodeEditDialogOpen] = useState(false);`
4. 实现`handleEditNode`函数：
   ```typescript
   const handleEditNode = useCallback((node: Line) => {
     setEditingNode(node);
     setNodeEditDialogOpen(true);
   }, []);
   ```
5. 实现`handleSaveNode`函数（更新data.lines）
6. 在渲染中添加`<NodeEditDialog>`组件
7. 传递`handleEditNode`到`NodeContextMenu`
8. 测试编辑功能

**验收标准**:
- ✅ 右键菜单"编辑节点"可打开对话框
- ✅ 双击节点可打开对话框
- ✅ 所有字段可正常编辑和保存
- ✅ 撤销/重做支持节点编辑

---

#### 任务1.2: 修复UnifiedTimelinePanelV2中的Timeline添加按钮
**优先级**: P0  
**预计工时**: 2小时

**任务描述**:
- 移除"Timeline"按钮的占位符代码
- 实现真实的Timeline添加功能
- 调用TimelinePanel的`handleAddTimeline`逻辑

**实施步骤**:
1. 在`UnifiedTimelinePanelV2.tsx`中实现`handleAddTimeline`函数
2. 更新`<Button onClick={handleAddTimeline}>`
3. 确保新Timeline正确添加到`plan.timelines`
4. 测试添加功能

**验收标准**:
- ✅ 点击"Timeline"按钮可创建新Timeline
- ✅ 新Timeline显示在列表中
- ✅ 可对新Timeline进行操作（编辑、删除等）

---

### Phase 2: 重要功能集成（P1）- 预计3-4天

#### 任务2.1: 集成图片导出功能
**优先级**: P1  
**预计工时**: 6小时

**任务描述**:
- 将`ImageExportDialog`集成到工具栏的导出下拉菜单
- 支持PNG/JPEG导出
- 支持1x/2x/3x分辨率选择

**实施步骤**:
1. 在`UnifiedTimelinePanelV2.tsx`中导入`ImageExportDialog`
2. 添加状态：`const [imageExportDialogOpen, setImageExportDialogOpen] = useState(false);`
3. 在导出下拉菜单中添加"导出为图片"选项
4. 更新菜单项点击事件：`onClick={() => setImageExportDialogOpen(true)}`
5. 在渲染中添加`<ImageExportDialog>`组件
6. 获取timeline容器ref：`const timelineContainerRef = useRef<HTMLDivElement>(null);`
7. 传递ref到TimelinePanel：`<TimelinePanel ref={timelineContainerRef} />`
8. 传递ref到ImageExportDialog：`targetElement={timelineContainerRef.current}`
9. 测试PNG和JPEG导出，验证不同分辨率

**验收标准**:
- ✅ 导出菜单中显示"导出为图片"选项
- ✅ 可选择PNG或JPEG格式
- ✅ 可选择1x/2x/3x分辨率
- ✅ 导出的图片质量符合预期
- ✅ JPEG格式可调整质量

---

#### 任务2.2: 集成时间平移功能
**优先级**: P1  
**预计工时**: 4小时

**任务描述**:
- 将`TimelineTimeShiftDialog`集成到Timeline快速菜单的"整体时间调整"
- 实现时间平移逻辑

**实施步骤**:
1. 在`TimelinePanel.tsx`中导入`TimelineTimeShiftDialog`
2. 在`TimelineQuickMenu`中添加"整体时间调整"菜单项
3. 添加状态：`const [timeShiftDialogOpen, setTimeShiftDialogOpen] = useState(false);`
4. 添加状态：`const [selectedTimelineIdForShift, setSelectedTimelineIdForShift] = useState<string | null>(null);`
5. 实现`handleOpenTimeShift`函数
6. 实现`handleConfirmTimeShift`函数（调整Timeline中所有Line的日期）
7. 在渲染中添加`<TimelineTimeShiftDialog>`组件
8. 测试时间平移功能

**验收标准**:
- ✅ 快速菜单中显示"整体时间调整"选项
- ✅ 可选择Timeline
- ✅ 可输入偏移天数（正数推迟，负数提前）
- ✅ 显示预览信息
- ✅ 确认后所有Line日期正确调整
- ✅ 保持依赖关系选项生效

---

#### 任务2.3: 实现关键路径高亮渲染
**优先级**: P1  
**预计工时**: 6小时

**任务描述**:
- 将已计算的关键路径节点在画布上高亮显示
- 关键路径的Line使用特殊样式（如加粗、特殊颜色）
- 关键路径的Relation使用特殊样式

**实施步骤**:
1. 在`TimelinePanel.tsx`中使用`calculateCriticalPath()`计算关键路径
2. 将关键路径节点ID列表存储在状态中：`const [criticalPathNodeIds, setCriticalPathNodeIds] = useState<Set<string>>(new Set());`
3. 当`showCriticalPath`为true时，计算关键路径
4. 传递`criticalPathNodeIds`到`LineRenderer`和`RelationRenderer`
5. 在`LineRenderer.tsx`中，如果节点在关键路径中，应用特殊样式：
   - 边框加粗（border-width: 3px）
   - 添加阴影（box-shadow: 0 0 8px rgba(255, 0, 0, 0.5)）
   - 或使用特殊颜色背景
6. 在`RelationRenderer.tsx`中，如果连线连接的两个节点都在关键路径中，应用特殊样式：
   - 线条加粗（stroke-width: 3）
   - 使用红色（stroke: #ef4444）
7. 测试关键路径高亮

**验收标准**:
- ✅ 点击"关键路径"按钮后，关键路径节点高亮显示
- ✅ 关键路径连线高亮显示
- ✅ 再次点击按钮，高亮取消
- ✅ 关键路径计算准确

---

### Phase 3: 增强功能实施（P2）- 预计4-5天

#### 任务3.1: 实现Timeline背景色设置
**优先级**: P2  
**预计工时**: 6小时

**任务描述**:
- 创建`TimelineColorPicker`组件（参考源项目实现）
- 集成到Timeline快速菜单的"设置背景色"
- 支持预设颜色和自定义颜色

**实施步骤**:
1. 创建`src/components/timeline/TimelineColorPicker.tsx`
2. 使用Ant Design的`ColorPicker`组件
3. 定义预设颜色列表（8-10种常用颜色）
4. 在`TimelineQuickMenu.tsx`中添加"设置背景色"子菜单
5. 点击颜色时调用`onBackgroundColorChange(timelineId, color)`
6. 在`TimelinePanel.tsx`中实现背景色应用逻辑
7. 更新Timeline的`style.backgroundColor`
8. 测试背景色设置

**验收标准**:
- ✅ 快速菜单中显示"设置背景色"子菜单
- ✅ 可选择预设颜色
- ✅ 可选择自定义颜色
- ✅ 背景色应用到Timeline行
- ✅ 背景色保存到数据中

---

#### 任务3.2: 实现备注侧边栏
**优先级**: P2  
**预计工时**: 8小时

**任务描述**:
- 创建`NotesSidebar`组件（参考源项目实现，适配Ant Design）
- 支持Markdown格式备注编辑
- 集成到节点编辑对话框

**实施步骤**:
1. 创建`src/components/timeline/NotesSidebar.tsx`
2. 使用Ant Design的`Drawer`组件（替代Shadcn/ui的Sheet）
3. 添加`TextArea`用于备注编辑
4. 添加Markdown格式提示
5. 在`TimelinePanel.tsx`中添加状态：
   ```typescript
   const [notesSidebarOpen, setNotesSidebarOpen] = useState(false);
   const [editingNodeForNotes, setEditingNodeForNotes] = useState<Line | null>(null);
   ```
6. 在`NodeEditDialog`中添加"编辑备注"按钮
7. 点击按钮时打开`NotesSidebar`
8. 实现备注保存逻辑（保存到`line.attributes.notes`）
9. 测试备注编辑和保存

**验收标准**:
- ✅ 节点编辑对话框显示"编辑备注"按钮
- ✅ 点击按钮打开右侧Drawer
- ✅ 可编辑备注内容
- ✅ 显示Markdown格式提示
- ✅ 保存后备注持久化
- ✅ 变更检测（未保存时提示）

---

#### 任务3.3: 实现快速菜单中的"显示/隐藏关键路径"
**优先级**: P2  
**预计工时**: 2小时

**任务描述**:
- 在Timeline快速菜单中添加"显示/隐藏关键路径"菜单项
- 点击时切换关键路径显示状态

**实施步骤**:
1. 在`TimelineQuickMenu.tsx`中添加菜单项
2. 菜单项文本根据`showCriticalPath`状态动态显示
3. 点击时调用`onToggleCriticalPath()`
4. 测试菜单项功能

**验收标准**:
- ✅ 快速菜单中显示"显示关键路径"或"隐藏关键路径"
- ✅ 点击后关键路径显示状态切换
- ✅ 文本随状态变化

---

#### 任务3.4: 修复UnifiedTimelinePanelV2中的CSV/Excel导出
**优先级**: P2  
**预计工时**: 4小时

**任务描述**:
- 将TimelinePanel中的CSV/Excel导出逻辑迁移到UnifiedTimelinePanelV2
- 确保导出功能正常工作

**实施步骤**:
1. 从`TimelinePanel.tsx`复制`downloadCSV()`和`downloadExcel()`函数
2. 粘贴到`UnifiedTimelinePanelV2.tsx`
3. 更新`handleExportData`函数：
   ```typescript
   const handleExportData = useCallback((format: 'json' | 'csv' | 'excel') => {
     switch (format) {
       case 'json': downloadJSON(); break;
       case 'csv': downloadCSV(); break;
       case 'excel': downloadExcel(); break;
     }
   }, [plan]);
   ```
4. 测试CSV和Excel导出

**验收标准**:
- ✅ 导出菜单中CSV和Excel选项可用
- ✅ 导出的CSV文件格式正确
- ✅ 导出的Excel文件格式正确
- ✅ 文件名包含计划名称和时间戳

---

#### 任务3.5: 修复UnifiedTimelinePanelV2中的导入功能
**优先级**: P2  
**预计工时**: 3小时

**任务描述**:
- 将TimelinePanel中的导入逻辑迁移到UnifiedTimelinePanelV2
- 实现文件选择和JSON解析

**实施步骤**:
1. 从`TimelinePanel.tsx`复制`handleImportData()`函数
2. 粘贴到`UnifiedTimelinePanelV2.tsx`
3. 更新导入按钮：`<Button onClick={handleImportData}>`
4. 测试导入功能

**验收标准**:
- ✅ 点击导入按钮打开文件选择器
- ✅ 可选择JSON文件
- ✅ 导入的数据正确加载到画布
- ✅ 导入失败时显示错误提示

---

### Phase 4: 高级功能实施（P3）- 预计3-4天

#### 任务4.1: 实现"添加到基线"功能
**优先级**: P3  
**预计工时**: 6小时

**任务描述**:
- 实现节点右键菜单中的"添加到基线"功能
- 支持将节点日期作为基线添加

**实施步骤**:
1. 在`TimelinePanel.tsx`中实现`handleAddNodeToBaseline`函数
2. 获取节点日期，创建新基线
3. 基线标签默认为节点名称
4. 调用`handleSaveBaseline(baseline)`
5. 测试功能

**验收标准**:
- ✅ 右键菜单"添加到基线"可用
- ✅ 点击后创建新基线
- ✅ 基线位置正确（节点开始日期）
- ✅ 基线标签为节点名称

---

#### 任务4.2: 实现"查看嵌套计划"功能
**优先级**: P3  
**预计工时**: 8小时

**任务描述**:
- 实现节点右键菜单中的"查看嵌套计划"功能
- 支持节点关联嵌套的TimePlan
- 打开新窗口或导航到嵌套计划

**实施步骤**:
1. 在`Line`类型中添加`nestedPlanId`属性（如果不存在）
2. 在`NodeEditDialog`中添加"关联嵌套计划"选择器
3. 在`TimelinePanel.tsx`中实现`handleViewNestedPlan`函数
4. 检查`nestedPlanId`是否存在
5. 使用`navigate()`导航到嵌套计划，或使用`window.open()`打开新窗口
6. 测试功能

**验收标准**:
- ✅ 右键菜单"查看嵌套计划"仅在节点有嵌套计划时显示
- ✅ 点击后导航到嵌套计划或打开新窗口
- ✅ 嵌套计划正确加载

---

#### 任务4.3: 实现节点连接点可视化
**优先级**: P3  
**预计工时**: 6小时

**任务描述**:
- 在编辑模式下，显示节点的连接点（4个方向：上下左右）
- 鼠标hover时高亮连接点
- 点击连接点开始创建依赖连线

**实施步骤**:
1. 在`LineRenderer.tsx`中添加连接点渲染逻辑
2. 仅在`isEditMode && isHovering`时显示连接点
3. 连接点位置：上中、下中、左中、右中
4. 连接点样式：小圆点，边框，hover时放大
5. 点击连接点时调用`onStartConnection(line, direction)`
6. 更新`handleStartConnection`支持方向参数
7. 测试连接点交互

**验收标准**:
- ✅ 编辑模式下hover节点时显示连接点
- ✅ 连接点位置准确（4个方向）
- ✅ 点击连接点开始创建连线
- ✅ 连线从指定方向开始

---

### Phase 5: 质量保证与优化（预计2-3天）

#### 任务5.1: 全面功能测试
**预计工时**: 8小时

**测试清单**:
- [ ] Header所有按钮功能
- [ ] 工具栏所有按钮功能
- [ ] Timeline右键菜单所有项
- [ ] Node右键菜单所有项
- [ ] Timeline快速菜单所有项
- [ ] 所有对话框的打开、编辑、保存、取消
- [ ] 数据导入导出（JSON/CSV/Excel/图片）
- [ ] 撤销/重做功能
- [ ] 关键路径计算和高亮
- [ ] 基线系统所有功能
- [ ] 迭代规划所有功能
- [ ] 跨视图切换

#### 任务5.2: 性能优化
**预计工时**: 6小时

**优化项**:
- 优化大数据量渲染（>100个节点）
- 优化连线渲染（使用`useMemo`缓存计算）
- 优化关键路径计算（仅在依赖关系变化时重新计算）
- 优化图片导出性能（使用worker）

#### 任务5.3: UI/UX 改进
**预计工时**: 4小时

**改进项**:
- 统一按钮图标和文字大小
- 优化对话框布局和间距
- 优化菜单项的文字和图标对齐
- 添加loading状态和进度提示
- 优化错误提示信息

#### 任务5.4: 文档更新
**预计工时**: 4小时

**文档项**:
- 更新README.md（功能清单）
- 创建用户指南（所有按钮和菜单的使用说明）
- 创建开发文档（组件架构和扩展指南）
- 更新CHANGELOG.md

---

## 🗓️ 总体时间表

| 阶段 | 预计时长 | 累计时长 |
|------|----------|----------|
| Phase 1: 核心缺失功能修复（P0） | 2-3天 | 2-3天 |
| Phase 2: 重要功能集成（P1） | 3-4天 | 5-7天 |
| Phase 3: 增强功能实施（P2） | 4-5天 | 9-12天 |
| Phase 4: 高级功能实施（P3） | 3-4天 | 12-16天 |
| Phase 5: 质量保证与优化 | 2-3天 | 14-19天 |

**总预计时长**: 14-19个工作日（约3-4周）

---

## 📊 优先级矩阵

### P0 - 必须实施（核心功能缺失）
1. 集成节点编辑功能（4h）
2. 修复Timeline添加按钮（2h）

**小计**: 6小时（1天）

### P1 - 重要实施（影响用户体验）
1. 集成图片导出功能（6h）
2. 集成时间平移功能（4h）
3. 实现关键路径高亮渲染（6h）

**小计**: 16小时（2天）

### P2 - 建议实施（增强功能）
1. 实现Timeline背景色设置（6h）
2. 实现备注侧边栏（8h）
3. 实现快速菜单中的"显示/隐藏关键路径"（2h）
4. 修复CSV/Excel导出（4h）
5. 修复导入功能（3h）

**小计**: 23小时（3天）

### P3 - 可选实施（高级功能）
1. 实现"添加到基线"功能（6h）
2. 实现"查看嵌套计划"功能（8h）
3. 实现节点连接点可视化（6h）

**小计**: 20小时（2.5天）

---

## 🎯 快速实施方案（MVP）

如果时间紧张，建议优先实施以下内容（P0 + P1核心）：

### 最小可行产品（3天）
1. **Day 1**: 
   - 集成节点编辑功能（4h）
   - 修复Timeline添加按钮（2h）
   - 集成图片导出功能（2h）

2. **Day 2**:
   - 完成图片导出功能（4h）
   - 集成时间平移功能（4h）

3. **Day 3**:
   - 实现关键路径高亮渲染（6h）
   - 全面测试和Bug修复（2h）

---

## 📈 进度跟踪建议

### 使用TODO工具
建议使用项目的TODO工具跟踪每个任务的状态：

```typescript
TodoWrite({
  todos: [
    { id: 'p0-node-edit', status: 'pending', content: '集成节点编辑功能' },
    { id: 'p0-timeline-add', status: 'pending', content: '修复Timeline添加按钮' },
    { id: 'p1-image-export', status: 'pending', content: '集成图片导出功能' },
    { id: 'p1-time-shift', status: 'pending', content: '集成时间平移功能' },
    { id: 'p1-critical-path', status: 'pending', content: '实现关键路径高亮' },
    // ... 更多任务
  ],
  merge: false
})
```

### 每日站会检查点
- 昨天完成了什么？
- 今天计划做什么？
- 有什么阻塞问题？

### 每周回顾
- 本周完成的功能数量
- 是否按计划进度推进
- 调整下周计划

---

## 🚧 风险与缓解措施

### 风险1: 组件集成复杂度高于预期
**可能性**: 中  
**影响**: 高  
**缓解措施**:
- 优先实施最小可行产品（MVP）
- 对复杂功能进行技术预研
- 及时寻求技术支持

### 风险2: 测试发现大量Bug
**可能性**: 中  
**影响**: 中  
**缓解措施**:
- 每个功能实施后立即进行单元测试
- 使用TypeScript严格模式减少类型错误
- 建立回归测试套件

### 风险3: UI/UX不符合设计规范
**可能性**: 低  
**影响**: 中  
**缓解措施**:
- 严格参考源项目的UI设计
- 使用Ant Design的默认样式
- 定期进行UI评审

---

## ✅ 验收标准

### 功能完整性
- [ ] 所有P0功能100%实现
- [ ] 所有P1功能100%实现
- [ ] 所有P2功能至少80%实现

### 质量标准
- [ ] 所有功能通过手动测试
- [ ] 无致命Bug和严重Bug
- [ ] 代码通过TypeScript编译（无error）
- [ ] 性能测试通过（加载<100个节点时响应流畅）

### 文档标准
- [ ] 所有新增功能有文档说明
- [ ] 用户指南更新完整
- [ ] CHANGELOG更新完整

---

## 📝 附录

### A. 参考文件清单

#### 源项目 (timeline-craft-kit)
- `/src/components/timeline/TimelineToolbar.tsx`
- `/src/components/timeline/TimelineContextMenu.tsx`
- `/src/components/timeline/NodeContextMenu.tsx`
- `/src/components/timeline/TimelineQuickMenu.tsx`
- `/src/components/timeline/NodeEditDialog.tsx`
- `/src/components/timeline/NotesSidebar.tsx`
- `/src/components/timeline/TimelineColorPicker.tsx`
- `/src/components/dialogs/ExportDialog.tsx`
- `/src/components/dialogs/ImportDialog.tsx`

#### 目标项目 (timeplan-craft-kit)
- `/src/components/timeline/UnifiedTimelinePanelV2.tsx`
- `/src/components/timeline/TimelinePanel.tsx`
- `/src/components/timeline/TimelineQuickMenu.tsx`
- `/src/components/timeline/NodeContextMenu.tsx`
- `/src/components/dialogs/NodeEditDialog.tsx`
- `/src/components/dialogs/ImageExportDialog.tsx`
- `/src/components/dialogs/TimelineTimeShiftDialog.tsx`

### B. 组件依赖关系图

```
UnifiedTimelinePanelV2
├── TimelinePanel
│   ├── TimelineHeader
│   ├── TimelineList
│   │   └── TimelineQuickMenu
│   ├── TimelineCanvas
│   │   ├── LineRenderer
│   │   │   └── NodeContextMenu
│   │   ├── RelationRenderer
│   │   ├── TodayLine
│   │   ├── BaselineMarker
│   │   └── BaselineRangeMarker
│   └── Dialogs
│       ├── TimelineEditDialog
│       ├── NodeEditDialog (待集成)
│       ├── BaselineEditDialog
│       ├── BaselineRangeEditDialog
│       ├── TimelineTimeShiftDialog (待集成)
│       ├── ImageExportDialog (待集成)
│       └── NotesSidebar (待实现)
└── Toolbar
    ├── EditModeButton
    ├── AddButtons
    ├── CriticalPathButton
    ├── UndoRedoButtons
    ├── SaveCancelButtons
    ├── TodayButton
    ├── ZoomControls
    ├── ExportMenu (待增强)
    ├── ImportButton (待修复)
    └── FullscreenButton
```

---

**报告完成时间**: 2026-02-07  
**报告版本**: v1.0  
**下一步行动**: 开始Phase 1实施
