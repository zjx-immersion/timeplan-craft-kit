# Phase 3+ 后续开发计划

**项目**: TimePlan Craft Kit  
**规划版本**: v1.0.0  
**创建日期**: 2026-02-12  
**规划周期**: 4-6周

---

## 📊 当前状态

### Phase 3完成情况

- **总体进度**: 20/27任务 (74%)
- **已完成模块**: 模块3（导航）、模块4（批量操作）
- **未完成模块**: 模块1（Timeline优化）、模块2（UX增强）

### 待完成任务清单

#### 模块1: Timeline视图优化 (剩余2/5任务)

| 任务 | 优先级 | 工时 | 说明 |
|------|-------|------|------|
| Task 1.3: Timeline排序拖拽 | P1 | 3h | 支持Timeline拖拽排序 |
| Task 1.4: Line内嵌编辑 | P2 | 4h | 甘特图任务双击编辑 |

#### 模块2: 用户体验增强 (剩余5/7任务)

| 任务 | 优先级 | 工时 | 说明 |
|------|-------|------|------|
| Task 2.3: Excel导出 | P0 | 3h | 实现Excel格式导出 |
| Task 2.4: 图像导出(PNG/PDF) | P1 | 3h | 实现图像格式导出 |
| Task 2.5: 导出对话框 | P1 | 2h | 统一导出UI |
| Task 2.6: 配置持久化 | P2 | 2h | 用户配置保存 |
| Task 2.7: 配置导入导出 | P2 | 2h | 配置备份恢复 |

**剩余总工时**: ~19小时

---

## 🎯 Phase 3完成计划

### 第一周: 完成模块2核心功能

#### 目标
完成导出功能和配置管理，使Phase 3达到可交付状态。

#### 任务清单

**Day 1-2: Excel导出功能** (Task 2.3)
- [ ] 安装xlsx依赖
- [ ] 实现数据转换逻辑
- [ ] 支持多Sheet导出（Timeline、Lines、Relations）
- [ ] 添加格式化和样式
- [ ] 集成到BatchOperationBar和ExportDialog

**验收标准**:
- ✅ 可导出完整的TimePlan数据到Excel
- ✅ 包含所有必要的列（ID、名称、日期、负责人等）
- ✅ 格式美观，易于阅读
- ✅ 文件命名规范

**技术方案**:
```typescript
// 使用xlsx库
import * as XLSX from 'xlsx';

const exportToExcel = (data: TimePlan) => {
  // 创建工作簿
  const workbook = XLSX.utils.book_new();
  
  // Sheet 1: Timelines
  const timelinesWS = XLSX.utils.json_to_sheet(data.timelines);
  XLSX.utils.book_append_sheet(workbook, timelinesWS, 'Timelines');
  
  // Sheet 2: Lines
  const linesWS = XLSX.utils.json_to_sheet(data.lines);
  XLSX.utils.book_append_sheet(workbook, linesWS, 'Lines');
  
  // 导出文件
  XLSX.writeFile(workbook, `timeplan_${Date.now()}.xlsx`);
};
```

---

**Day 3-4: 图像导出功能** (Task 2.4)
- [ ] 安装html2canvas和jsPDF依赖
- [ ] 实现PNG导出（截图整个视图）
- [ ] 实现PDF导出（多页支持）
- [ ] 优化大视图导出性能
- [ ] 添加导出选项（分辨率、页面大小）

**验收标准**:
- ✅ 可导出甘特图视图为PNG
- ✅ 可导出矩阵视图为PNG
- ✅ 可导出为PDF（支持多页）
- ✅ 导出质量高清

**技术方案**:
```typescript
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const exportToPNG = async (elementId: string) => {
  const element = document.getElementById(elementId);
  const canvas = await html2canvas(element, {
    scale: 2, // 高清导出
    useCORS: true,
  });
  
  const link = document.createElement('a');
  link.download = `timeplan_${Date.now()}.png`;
  link.href = canvas.toDataURL();
  link.click();
};

const exportToPDF = async (elementId: string) => {
  const element = document.getElementById(elementId);
  const canvas = await html2canvas(element);
  
  const pdf = new jsPDF();
  const imgData = canvas.toDataURL('image/png');
  pdf.addImage(imgData, 'PNG', 10, 10);
  pdf.save(`timeplan_${Date.now()}.pdf`);
};
```

---

**Day 5: 导出对话框统一** (Task 2.5)
- [ ] 创建ExportDialog组件
- [ ] 支持选择导出格式（JSON/Excel/PNG/PDF）
- [ ] 支持选择导出范围（全部/选中）
- [ ] 支持预览和选项配置
- [ ] 集成到所有视图

**UI设计**:
```
┌────────────────────────────────────┐
│ 导出计划                   [×]     │
├────────────────────────────────────┤
│ 导出格式:                          │
│   ○ JSON  ○ Excel  ○ PNG  ○ PDF   │
│                                    │
│ 导出范围:                          │
│   ○ 全部任务  ○ 选中任务 (5个)    │
│                                    │
│ 选项:                              │
│   ☑ 包含关系  ☑ 包含元数据        │
│                                    │
│ 文件名: timeplan_2026-02-12.json  │
│                                    │
│          [取消]  [导出]            │
└────────────────────────────────────┘
```

---

### 第二周: 完成模块1和测试

**Day 6-7: Timeline拖拽排序** (Task 1.3)
- [ ] 安装react-beautiful-dnd或@dnd-kit/core
- [ ] 实现Timeline拖拽排序
- [ ] 保存排序结果到Store
- [ ] 添加拖拽动画
- [ ] 处理拖拽冲突

**Day 8-9: Line内嵌编辑** (Task 1.4)
- [ ] 甘特图任务双击进入编辑模式
- [ ] 支持编辑任务名称
- [ ] 支持编辑日期（拖拽调整）
- [ ] 支持编辑其他属性
- [ ] 自动保存

**Day 10: 单元测试补充**
- [ ] 添加批量操作API测试
- [ ] 添加BatchEditDialog测试
- [ ] 添加BatchDeleteDialog测试
- [ ] 提高覆盖率到80%+

---

## 🚀 Phase 4: 高级功能增强

### 功能优先级矩阵

| 功能 | 用户价值 | 开发成本 | 优先级 | 预计工时 |
|------|---------|---------|--------|---------|
| **批量操作增强** | 高 | 中 | P0 | 8h |
| **数据导入** | 高 | 高 | P0 | 12h |
| **高级筛选** | 高 | 中 | P1 | 6h |
| **任务模板** | 中 | 中 | P1 | 8h |
| **协作功能** | 高 | 高 | P1 | 20h |
| **版本对比** | 中 | 高 | P2 | 12h |
| **自动化规则** | 中 | 高 | P2 | 16h |
| **移动端适配** | 中 | 高 | P2 | 24h |

---

### 1. 批量操作增强 (P0)

**目标**: 增强批量操作功能，提供更多操作类型

**功能清单**:
- [ ] 批量复制任务
- [ ] 批量移动任务到其他Timeline
- [ ] 批量调整日期（整体平移）
- [ ] 批量设置标签
- [ ] 批量操作预览
- [ ] 批量操作撤销/重做增强

**预计工时**: 8小时

**技术要点**:
```typescript
// 批量复制
copyLines: (lineIds: string[], targetTimelineId: string) => {
  // 复制任务并关联关系
};

// 批量移动
moveLines: (lineIds: string[], targetTimelineId: string) => {
  // 移动任务，保持关系
};

// 批量调整日期
adjustDates: (lineIds: string[], offset: number) => {
  // 平移所有任务日期
};
```

---

### 2. 数据导入 (P0)

**目标**: 支持从外部数据源导入计划

**功能清单**:
- [ ] 导入Excel文件
- [ ] 导入JSON文件
- [ ] 导入CSV文件
- [ ] 数据映射配置
- [ ] 导入预览和验证
- [ ] 冲突处理

**预计工时**: 12小时

**UI设计**:
```
┌────────────────────────────────────┐
│ 导入计划                   [×]     │
├────────────────────────────────────┤
│ 1. 选择文件                        │
│    [选择文件] timeplan.xlsx        │
│                                    │
│ 2. 数据映射                        │
│    Excel列 → TimePlan字段         │
│    A列(任务名称) → label          │
│    B列(开始日期) → startDate      │
│    C列(结束日期) → endDate        │
│                                    │
│ 3. 导入选项                        │
│    ○ 覆盖现有数据                  │
│    ○ 合并到现有数据                │
│    ○ 创建新计划                    │
│                                    │
│ 预览: 将导入45个任务               │
│                                    │
│          [取消]  [导入]            │
└────────────────────────────────────┘
```

---

### 3. 高级筛选 (P1)

**目标**: 提供强大的数据筛选和查询功能

**功能清单**:
- [ ] 多条件筛选（AND/OR逻辑）
- [ ] 日期范围筛选
- [ ] 文本搜索（模糊匹配）
- [ ] 保存筛选条件
- [ ] 筛选历史记录
- [ ] 快速筛选按钮

**预计工时**: 6小时

**筛选条件示例**:
```typescript
interface FilterCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan';
  value: any;
  logic?: 'AND' | 'OR';
}

const filters: FilterCondition[] = [
  { field: 'owner', operator: 'equals', value: '张三', logic: 'AND' },
  { field: 'status', operator: 'equals', value: 'in-progress', logic: 'AND' },
  { field: 'startDate', operator: 'greaterThan', value: '2026-02-01' },
];
```

---

### 4. 任务模板 (P1)

**目标**: 提供常用任务模板，快速创建标准任务

**功能清单**:
- [ ] 内置模板库（软件开发、产品发布等）
- [ ] 自定义模板
- [ ] 模板应用和实例化
- [ ] 模板参数化
- [ ] 模板分享和导入

**预计工时**: 8小时

**模板示例**:
```typescript
interface TaskTemplate {
  id: string;
  name: string;
  category: string;
  tasks: Array<{
    label: string;
    duration: number; // 天数
    dependencies?: string[];
    owner?: string;
  }>;
}

const sproftwareReleaseTemplate: TaskTemplate = {
  id: 'template-software-release',
  name: '软件发布流程',
  category: '软件开发',
  tasks: [
    { label: '需求评审', duration: 2 },
    { label: '设计评审', duration: 3, dependencies: ['需求评审'] },
    { label: '开发', duration: 10, dependencies: ['设计评审'] },
    { label: '测试', duration: 5, dependencies: ['开发'] },
    { label: '发布', duration: 1, dependencies: ['测试'] },
  ],
};
```

---

### 5. 协作功能 (P1)

**目标**: 支持多人协作编辑和实时同步

**功能清单**:
- [ ] 实时协作编辑（WebSocket）
- [ ] 用户在线状态
- [ ] 光标位置同步
- [ ] 冲突检测和解决
- [ ] 评论和讨论
- [ ] 变更通知

**预计工时**: 20小时

**技术架构**:
```
Client (Browser)
    ↓ WebSocket
Backend (Node.js)
    ↓ 
ShareDB/Y.js (CRDT)
    ↓
Database (MongoDB/PostgreSQL)
```

---

## 🧪 质量保证计划

### 测试目标

| 类型 | 目标覆盖率 | 当前状态 | 计划完成 |
|------|-----------|---------|---------|
| 单元测试 | 80%+ | 0% | Week 2 |
| 集成测试 | 60%+ | 0% | Week 3 |
| E2E测试 | 40%+ | 0% | Week 4 |

### 测试计划

**Week 2: 单元测试**
- [ ] SelectionStore测试 ✅ (已创建)
- [ ] NavigationStore测试 ✅ (已创建)
- [ ] TimePlanStore批量操作测试
- [ ] 对话框组件测试
- [ ] 工具函数测试

**Week 3: 集成测试**
- [ ] 表格视图批量操作集成测试
- [ ] 矩阵视图批量选择集成测试
- [ ] 导航跳转集成测试
- [ ] 导出功能集成测试

**Week 4: E2E测试**
- [ ] 完整批量操作流程测试
- [ ] 跨视图操作流程测试
- [ ] 数据导入导出流程测试

---

## 📈 性能优化计划

### 当前性能指标

| 操作 | 当前性能 | 目标性能 | 优化空间 |
|------|---------|---------|---------|
| 批量更新(1000任务) | ~50ms | <100ms | ✅ 已达标 |
| 选择操作(1000任务) | ~10ms | <50ms | ✅ 已达标 |
| 视图渲染(1000任务) | ~500ms | <300ms | ⚠️ 需优化 |
| 导出JSON(1000任务) | ~100ms | <200ms | ✅ 已达标 |

### 优化计划

**渲染性能优化**:
- [ ] 虚拟滚动（react-window）
- [ ] 懒加载和代码分割
- [ ] 组件级别的React.memo
- [ ] useMemo和useCallback优化

**数据处理优化**:
- [ ] Web Worker处理大数据
- [ ] IndexedDB本地缓存
- [ ] 增量更新策略

---

## 🎨 UI/UX改进计划

### 用户体验增强

1. **响应式设计**
   - 适配平板和移动设备
   - 触摸操作优化
   - 自适应布局

2. **无障碍访问**
   - 键盘导航支持
   - ARIA标签
   - 高对比度模式
   - 屏幕阅读器支持

3. **国际化**
   - 中英文切换
   - 日期格式本地化
   - 数字格式本地化

4. **主题定制**
   - 亮色/暗色主题
   - 自定义颜色方案
   - 字体大小调整

---

## 📋 技术债务清理

### 高优先级

1. **代码重构**
   - [ ] 提取重复代码为公共组件
   - [ ] 优化组件层级结构
   - [ ] 统一命名规范

2. **类型安全**
   - [ ] 消除所有any类型
   - [ ] 添加严格模式
   - [ ] 完善接口定义

3. **错误处理**
   - [ ] 统一错误处理机制
   - [ ] 添加错误边界
   - [ ] 完善日志系统

### 中优先级

4. **文档完善**
   - [ ] API文档
   - [ ] 组件文档
   - [ ] 架构设计文档
   - [ ] 用户手册

5. **开发工具**
   - [ ] Storybook组件库
   - [ ] ESLint规则优化
   - [ ] Prettier配置
   - [ ] Git hooks

---

## 📅 时间表

### Phase 3完成 (2周)

```
Week 1: 导出功能
├── Day 1-2: Excel导出 ✅
├── Day 3-4: 图像导出 ✅
└── Day 5: 导出对话框 ✅

Week 2: Timeline优化 + 测试
├── Day 6-7: Timeline拖拽 ✅
├── Day 8-9: Line编辑 ✅
└── Day 10: 单元测试 ✅
```

### Phase 4规划 (4-6周)

```
Week 3-4: 核心功能
├── 批量操作增强 (Week 3)
└── 数据导入 (Week 4)

Week 5-6: 高级功能
├── 高级筛选 (Week 5)
└── 任务模板 (Week 5)

Week 7-8: 质量保证
├── 测试补充 (Week 7)
└── 性能优化 (Week 8)
```

---

## 🎯 成功指标

### 功能完整性

- [ ] Phase 3所有任务完成（27/27）
- [ ] 测试覆盖率≥80%
- [ ] 无P0/P1级别bug

### 性能指标

- [ ] 1000任务批量操作<100ms
- [ ] 视图渲染<300ms
- [ ] 首屏加载<2s

### 用户体验

- [ ] 用户满意度≥4.5/5
- [ ] 任务完成率≥90%
- [ ] 错误率<1%

---

## 💡 风险与应对

### 风险识别

| 风险 | 影响 | 概率 | 应对措施 |
|------|------|------|---------|
| 性能瓶颈 | 高 | 中 | 提前进行性能测试，引入虚拟滚动 |
| 测试不足 | 高 | 中 | 制定详细测试计划，提高覆盖率 |
| 技术选型 | 中 | 低 | 充分调研，选择成熟方案 |
| 时间延期 | 中 | 中 | 合理排期，预留buffer时间 |

---

## 📞 资源需求

### 人力资源

- 前端开发: 1人
- 测试工程师: 0.5人
- UI设计师: 0.5人（按需）

### 技术资源

- 开发环境: ✅ 已就绪
- 测试环境: ⏳ 待搭建
- CI/CD: ⏳ 待配置

---

**规划版本**: v1.0.0  
**创建日期**: 2026-02-12  
**规划人**: AI Assistant  
**审核状态**: ✅ 待审核
