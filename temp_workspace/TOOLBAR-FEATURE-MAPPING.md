# 工具栏功能映射分析

**日期**: 2026-02-07  
**任务**: 分析源项目功能，完整映射到目标项目

---

## 📋 功能对比分析

### 源项目 (@timeline-craft-kit/)

#### 工具栏功能清单

**左侧功能区**：
1. ✅ 编辑/查看模式切换
2. ✅ Timeline 添加按钮（编辑模式）
3. ✅ 节点添加下拉菜单（编辑模式）
   - 添加 Bar（计划单元）
   - 添加 Milestone（里程碑）
   - 添加 Gateway（网关）
4. ✅ 关键路径切换按钮

**右侧功能区**：
1. ✅ 撤销（Undo）
2. ✅ 重做（Redo）
3. ✅ 取消更改（Cancel）
4. ✅ 保存（Save）
5. ✅ 今天按钮
6. ✅ 缩放控制（+/-）
7. ✅ 时间刻度选择（日/周/双周/月/季度）
8. ✅ 导出下拉菜单
   - 导出图片（1x/2x/3x）
   - 导出数据（JSON/CSV/Excel）
9. ✅ 导入按钮
10. ✅ 全屏按钮

---

### 目标项目 (@timeplan-craft-kit/) - 当前状态

#### 已实现功能 ✅

**左侧功能区**：
1. ✅ 编辑/查看模式切换 (Line 772-782)
2. ⚠️ Timeline 添加按钮（无实际功能）(Line 784-789)
3. ⚠️ 节点添加按钮（无下拉菜单）(Line 791-796)
4. ⚠️ 关键路径按钮（无实际功能）(Line 798-803)
5. ✅ 撤销按钮 (Line 814-816)
6. ✅ 重做按钮 (Line 818-820)
7. ✅ 保存按钮 (Line 822-833)

**右侧功能区**：
1. ✅ 今天按钮 (Line 838-845)
2. ✅ 放大按钮 (Line 847-853)
3. ✅ 缩小按钮 (Line 855-861)
4. ✅ 时间刻度选择 (Line 864-874)

#### 缺失功能 ❌

1. ❌ Timeline 添加功能实现
2. ❌ 节点添加下拉菜单
3. ❌ 关键路径功能实现
4. ❌ 取消更改按钮
5. ❌ 导出功能
6. ❌ 导入功能
7. ❌ 搜索功能
8. ❌ 全屏功能

---

## 🎯 实施计划

### 阶段1：补充基础功能按钮 ⚠️ 高优先级

#### 1.1 Timeline 添加功能
**当前状态**：按钮存在但无功能  
**需要实现**：
- 点击按钮打开对话框
- 创建新的Timeline
- 添加到数据中

**源代码参考**：
```typescript
// timeline-craft-kit: TimelineToolbar.tsx Line 141-149
<Button onClick={onAddTimeline}>
  <Plus />
  Timeline
</Button>
```

#### 1.2 节点添加下拉菜单
**当前状态**：只有一个按钮  
**需要实现**：
- 改为Dropdown组件
- 三个选项：Bar/Milestone/Gateway
- 点击后添加对应节点到选中的Timeline

**源代码参考**：
```typescript
// timeline-craft-kit: TimelineToolbar.tsx Line 151-178
<DropdownMenu>
  <DropdownMenuTrigger>
    <Plus /> 节点
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onClick={() => onAddNodeToSelected('bar')}>
      添加计划单元 (Bar)
    </DropdownMenuItem>
    <DropdownMenuItem onClick={() => onAddNodeToSelected('milestone')}>
      添加里程碑 (Milestone)
    </DropdownMenuItem>
    <DropdownMenuItem onClick={() => onAddNodeToSelected('gateway')}>
      添加网关 (Gateway)
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

#### 1.3 关键路径功能
**当前状态**：按钮存在但无功能  
**需要实现**：
- 计算关键路径算法
- 高亮显示关键路径
- 切换显示/隐藏

**源代码参考**：
```typescript
// timeline-craft-kit: TimelineToolbar.tsx Line 182-192
<Button
  variant={showCriticalPath ? "default" : "outline"}
  onClick={onToggleCriticalPath}
>
  <GitBranch />
  关键路径
</Button>
```

#### 1.4 取消更改按钮
**当前状态**：不存在  
**需要实现**：
- 撤销所有未保存的更改
- 恢复到上次保存状态

**源代码参考**：
```typescript
// timeline-craft-kit: TimelineToolbar.tsx Line 222-228
<Button
  onClick={onCancel}
  disabled={!hasChanges}
  title="取消更改"
>
  <X />
</Button>
```

---

### 阶段2：实现导出/导入功能 ⚠️ 中优先级

#### 2.1 导出下拉菜单
**需要实现**：
- 导出图片（PNG，1x/2x/3x分辨率）
- 导出数据（JSON/CSV/Excel）

**源代码参考**：
```typescript
// timeline-craft-kit: TimelineToolbar.tsx Line 289-327
<DropdownMenu>
  <DropdownMenuTrigger>
    <Download />
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    {/* 图片导出 */}
    <DropdownMenuItem onClick={() => onExportImage(1)}>
      导出图片 - 标准 (1x)
    </DropdownMenuItem>
    <DropdownMenuItem onClick={() => onExportImage(2)}>
      导出图片 - 高清 (2x)
    </DropdownMenuItem>
    <DropdownMenuItem onClick={() => onExportImage(3)}>
      导出图片 - 超高清 (3x)
    </DropdownMenuItem>
    {/* 数据导出 */}
    <DropdownMenuItem onClick={onExport}>
      导出数据 (JSON/CSV/Excel)
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

**需要的组件**：
- `ExportDialog.tsx` - 导出对话框
- 图片导出逻辑（html2canvas或类似）
- 数据导出逻辑（JSON.stringify, CSV生成）

#### 2.2 导入功能
**需要实现**：
- 导入JSON数据
- 导入CSV数据
- 验证数据格式

**源代码参考**：
```typescript
// timeline-craft-kit: TimelineToolbar.tsx Line 330-340
<Button onClick={onImport} title="导入数据">
  <Upload />
</Button>
```

**需要的组件**：
- `ImportDialog.tsx` - 导入对话框
- 文件上传逻辑
- 数据解析和验证

---

### 阶段3：增强功能 ✅ 低优先级

#### 3.1 搜索功能
**需要实现**：
- 搜索Timeline名称
- 搜索节点名称
- 高亮显示搜索结果

#### 3.2 全屏功能
**需要实现**：
- 进入/退出全屏
- 使用Fullscreen API

**源代码参考**：
```typescript
// timeline-craft-kit: TimelineToolbar.tsx Line 342-351
<Button onClick={onFullscreen}>
  <Maximize2 />
</Button>
```

#### 3.3 筛选功能
**需要实现**：
- 按状态筛选
- 按负责人筛选
- 按时间范围筛选

---

## 🛠️ 技术实现细节

### 1. Timeline 添加功能

**步骤**：
1. 创建状态管理添加操作
2. 打开TimelineEditDialog
3. 保存新Timeline到data

**代码示例**：
```typescript
const handleAddTimeline = useCallback(() => {
  const newTimeline: Timeline = {
    id: `timeline-${Date.now()}`,
    name: '新Timeline',
    description: '',
    color: '#1677ff',
    lineIds: [],
  };
  
  setData({
    ...data,
    timelines: [...data.timelines, newTimeline],
  });
  
  message.success('Timeline 已添加');
}, [data, setData]);
```

### 2. 节点添加下拉菜单

**步骤**：
1. 替换Button为Dropdown
2. 实现三个菜单项
3. 根据类型创建不同的Line

**代码示例**：
```typescript
const handleAddNode = useCallback((type: 'bar' | 'milestone' | 'gateway') => {
  if (!selectedTimelineId) {
    message.warning('请先选择一个Timeline');
    return;
  }
  
  const schemaId = type === 'bar' ? 'bar-schema' :
                  type === 'milestone' ? 'milestone-schema' :
                  'gateway-schema';
  
  const newLine: Line = {
    id: `line-${Date.now()}`,
    timelineId: selectedTimelineId,
    schemaId,
    label: `新${type}`,
    startDate: new Date(),
    endDate: type === 'bar' ? addDays(new Date(), 7) : undefined,
  };
  
  setData({
    ...data,
    lines: [...data.lines, newLine],
  });
}, [selectedTimelineId, data, setData]);
```

### 3. 关键路径算法

**算法思路**：
1. 构建依赖图
2. 拓扑排序
3. 计算最早开始时间（EST）
4. 计算最晚开始时间（LST）
5. 关键路径：EST === LST的节点

**代码参考**：
```typescript
// 可以参考源项目的criticalPath.ts
function calculateCriticalPath(lines: Line[], relations: Relation[]) {
  // ... 实现关键路径算法
}
```

### 4. 导出图片功能

**技术方案**：
- 使用`html2canvas`库
- 捕获甘特图区域的DOM
- 转换为Canvas
- 导出为PNG

**代码示例**：
```typescript
import html2canvas from 'html2canvas';

const handleExportImage = useCallback(async (scale: number) => {
  const element = scrollContainerRef.current;
  if (!element) return;
  
  const canvas = await html2canvas(element, {
    scale,
    backgroundColor: '#ffffff',
  });
  
  const link = document.createElement('a');
  link.download = `${data.title}-${new Date().toISOString()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}, [data.title]);
```

### 5. 导出数据功能

**支持格式**：
- JSON: `JSON.stringify(data)`
- CSV: 转换为表格格式
- Excel: 使用`xlsx`库

**代码示例**：
```typescript
const handleExportJSON = useCallback(() => {
  const dataStr = JSON.stringify(data, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.download = `${data.title}.json`;
  link.href = url;
  link.click();
  
  URL.revokeObjectURL(url);
}, [data]);
```

---

## 📐 工具栏布局优化

### 当前布局问题

**问题1**：按钮间距不统一  
**解决**：使用统一的`Space`组件，`size={4}`

**问题2**：功能分组不明确  
**解决**：使用分隔线`<div style={{ width: 1, height: 20, backgroundColor: token.colorBorder }} />`

**问题3**：编辑模式按钮不够醒目  
**解决**：
```typescript
<Button
  type={isEditMode ? 'primary' : 'default'}
  style={{ color: isEditMode ? '#FFFFFF' : undefined }}
>
  {isEditMode ? '编辑' : '查看'}
</Button>
```

### 优化后的布局

```
┌─────────────────────────────────────────────────────────────────┐
│ 左侧                                               右侧          │
│ [编辑] [Timeline] [节点▼] [关键路径] | [撤销] [重做] [取消] [保存] │ [今天] [+][-][月] [导出▼] [导入] [全屏] │
└─────────────────────────────────────────────────────────────────┘
     ↑          ↑         ↑        ↑       ↑                      ↑              ↑                 ↑
   模式     Timeline   节点添加  关键路径  编辑控制            时间导航    导出/导入         增强功能
```

---

## 🎯 实施优先级

### P0 - 立即实施（核心功能）
1. ✅ Timeline 添加功能
2. ✅ 节点添加下拉菜单
3. ✅ 关键路径功能
4. ✅ 取消更改按钮

### P1 - 短期实施（重要功能）
1. ⏳ 导出图片功能
2. ⏳ 导出数据功能
3. ⏳ 导入数据功能

### P2 - 中期实施（增强功能）
1. ⏳ 搜索功能
2. ⏳ 全屏功能
3. ⏳ 筛选功能

---

## 📊 工作量估算

| 功能 | 工作量 | 复杂度 | 依赖 |
|------|--------|--------|------|
| Timeline添加 | 30分钟 | 低 | TimelineEditDialog |
| 节点添加下拉菜单 | 30分钟 | 低 | - |
| 关键路径算法 | 2小时 | 高 | 依赖关系数据 |
| 取消更改 | 30分钟 | 低 | Undo/Redo系统 |
| 导出图片 | 1小时 | 中 | html2canvas库 |
| 导出数据 | 1小时 | 中 | - |
| 导入数据 | 1.5小时 | 中 | ImportDialog |
| 搜索功能 | 1.5小时 | 中 | - |
| 全屏功能 | 30分钟 | 低 | Fullscreen API |
| **总计** | **约9小时** | - | - |

---

## 📝 依赖组件清单

### 需要创建的组件
1. ❌ `ExportDialog.tsx` - 导出选项对话框
2. ❌ `ImportDialog.tsx` - 导入数据对话框
3. ❌ `SearchBar.tsx` - 搜索栏组件

### 需要的第三方库
1. ✅ `html2canvas` - 图片导出（可能已有）
2. ✅ `xlsx` - Excel导出（可能已有）
3. ✅ `date-fns` - 日期处理（已有）

### 需要的工具函数
1. ❌ `calculateCriticalPath()` - 关键路径算法
2. ❌ `exportToCSV()` - CSV导出
3. ❌ `exportToExcel()` - Excel导出
4. ❌ `validateImportData()` - 导入数据验证

---

## ✅ 测试清单

### 功能测试
- [ ] Timeline添加后出现在列表中
- [ ] 节点添加到正确的Timeline
- [ ] 关键路径高亮显示正确
- [ ] 取消更改恢复正确
- [ ] 导出图片完整清晰
- [ ] 导出数据格式正确
- [ ] 导入数据解析成功
- [ ] 搜索结果准确
- [ ] 全屏进入/退出正常

### 交互测试
- [ ] 所有按钮响应正确
- [ ] 下拉菜单显示正常
- [ ] 对话框打开/关闭正常
- [ ] 快捷键工作正常

### 样式测试
- [ ] 按钮大小统一
- [ ] 间距合理
- [ ] 分组清晰
- [ ] 响应式布局正常

---

## 🎉 预期成果

实施完成后，工具栏将提供：
- ✅ 完整的编辑功能（添加、编辑、删除）
- ✅ 完整的导出/导入功能
- ✅ 关键路径分析
- ✅ 高效的搜索和筛选
- ✅ 专业的用户体验

与源项目功能对齐，满足用户需求！🚀
