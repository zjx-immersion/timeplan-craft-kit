# Ant Design 6.2.1 升级代码示例与脚本

> 本文档提供具体的代码修改示例和辅助脚本，配合《ANTD-6-UPGRADE-ANALYSIS.md》使用

---

## 📋 目录

1. [快速替换脚本](#快速替换脚本)
2. [Select 组件迁移示例](#select-组件迁移示例)
3. [DatePicker 组件迁移示例](#datepicker-组件迁移示例)
4. [Modal 组件迁移示例](#modal-组件迁移示例)
5. [Table 组件迁移示例](#table-组件迁移示例)
6. [Dropdown 组件迁移示例](#dropdown-组件迁移示例)
7. [Tooltip 组件迁移示例](#tooltip-组件迁移示例)
8. [Space 组件迁移示例](#space-组件迁移示例)
9. [Tag 间距修复示例](#tag-间距修复示例)
10. [Slider 组件迁移示例](#slider-组件迁移示例)
11. [Card 组件迁移示例](#card-组件迁移示例)
12. [Alert 组件迁移示例](#alert-组件迁移示例)
13. [Progress 组件迁移示例](#progress-组件迁移示例)
14. [通用辅助函数](#通用辅助函数)

---

## 🚀 快速替换脚本

### VSCode 全局搜索替换配置

使用 VSCode 的全局搜索替换（Ctrl+Shift+H / Cmd+Shift+H）：

#### 1. 启用正则表达式
点击搜索框右侧的 `.*` 按钮启用正则表达式模式

#### 2. 替换配置

```json
// .vscode/settings.json
{
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/build": true,
    "**/.git": true,
    "**/pnpm-lock.yaml": true
  },
  "search.useIgnoreFiles": true
}
```

---

### Bash 批量替换脚本

创建 `scripts/migrate-antd6.sh`:

```bash
#!/bin/bash

# Ant Design 6 API 迁移脚本
# 使用方法: chmod +x scripts/migrate-antd6.sh && ./scripts/migrate-antd6.sh

echo "🚀 开始 Ant Design 6 API 迁移..."

# 备份提示
echo "⚠️  请确保已经备份代码！按回车继续..."
read

# 设置工作目录
SRC_DIR="./src"

# 1. Select/DatePicker/Cascader/TreeSelect dropdown API 迁移
echo "📝 迁移 dropdown API..."

# dropdownMatchSelectWidth → popupMatchSelectWidth
find $SRC_DIR -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/dropdownMatchSelectWidth/popupMatchSelectWidth/g' {} +

# dropdownClassName → classNames.popup.root (需要手动处理)
echo "⚠️  dropdownClassName 需要手动迁移到 classNames.popup.root"

# dropdownStyle → styles.popup.root (需要手动处理)
echo "⚠️  dropdownStyle 需要手动迁移到 styles.popup.root"

# onDropdownVisibleChange → onOpenChange
find $SRC_DIR -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/onDropdownVisibleChange/onOpenChange/g' {} +

# 2. Space API 迁移
echo "📝 迁移 Space API..."

# 注意：Space 的 direction 很常见，需要谨慎替换
# 建议手动替换或使用更精确的正则

# 3. Dropdown API 迁移
echo "📝 迁移 Dropdown API..."

# destroyPopupOnHide → destroyOnHidden
find $SRC_DIR -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/destroyPopupOnHide/destroyOnHidden/g' {} +

# 4. Tooltip API 迁移
echo "📝 迁移 Tooltip API..."

# destroyTooltipOnHide → destroyOnHidden
find $SRC_DIR -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/destroyTooltipOnHide/destroyOnHidden/g' {} +

# 5. Modal/Drawer API 迁移
echo "📝 迁移 Modal/Drawer API..."

# destroyOnClose → destroyOnHidden
find $SRC_DIR -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/destroyOnClose/destroyOnHidden/g' {} +

# 6. Table API 迁移 (需要手动处理)
echo "⚠️  Table pagination.position → pagination.placement 需要手动迁移"

# 7. Button API 迁移
echo "📝 迁移 Button API..."

# iconPosition → iconPlacement
find $SRC_DIR -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/iconPosition/iconPlacement/g' {} +

# 8. Collapse API 迁移
echo "📝 迁移 Collapse API..."

# destroyInactivePanel → destroyOnHidden
find $SRC_DIR -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/destroyInactivePanel/destroyOnHidden/g' {} +

# expandIconPosition → expandIconPlacement
find $SRC_DIR -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/expandIconPosition/expandIconPlacement/g' {} +

# 9. Progress API 迁移 (需要手动处理，因为可能与其他属性冲突)
echo "⚠️  Progress strokeWidth/width → size 需要手动迁移"
echo "⚠️  Progress trailColor → railColor 需要手动迁移"
echo "⚠️  Progress gapPosition → gapPlacement 需要手动迁移"

echo ""
echo "✅ 自动迁移完成！"
echo ""
echo "⚠️  以下内容需要手动迁移："
echo "  1. dropdownClassName → classNames.popup.root"
echo "  2. dropdownStyle → styles.popup.root"
echo "  3. dropdownRender → popupRender"
echo "  4. overlayClassName → classNames.root"
echo "  5. overlayStyle → styles.root"
echo "  6. overlayInnerStyle → styles.container"
echo "  7. bodyStyle → styles.body"
echo "  8. maskStyle → styles.mask"
echo "  9. headStyle → styles.header"
echo " 10. Space direction → orientation"
echo " 11. Space split → separator"
echo " 12. Table pagination.position → pagination.placement"
echo " 13. Progress API 迁移"
echo " 14. Slider tooltip API 迁移"
echo " 15. bordered → variant"
echo ""
echo "📋 请查阅详细迁移文档完成手动迁移部分"
```

**使用方法**:
```bash
chmod +x scripts/migrate-antd6.sh
./scripts/migrate-antd6.sh
```

**注意**: 
- macOS 使用 `sed -i ''`
- Linux 使用 `sed -i`
- Windows 建议使用 VSCode 手动替换

---

## 🔧 组件迁移示例

### Select 组件迁移示例

#### 原始代码 (v5)
```tsx
import { Select } from 'antd';

const MySelect = () => {
  return (
    <Select
      placeholder="请选择"
      dropdownMatchSelectWidth={false}
      dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
      dropdownClassName="custom-select-dropdown"
      dropdownRender={(menu) => (
        <div>
          <div style={{ padding: 8 }}>自定义头部</div>
          {menu}
        </div>
      )}
      onDropdownVisibleChange={(open) => console.log('Dropdown:', open)}
      bordered={false}
    >
      <Select.Option value="1">选项1</Select.Option>
      <Select.Option value="2">选项2</Select.Option>
    </Select>
  );
};
```

#### 迁移后代码 (v6)
```tsx
import { Select } from 'antd';

const MySelect = () => {
  return (
    <Select
      placeholder="请选择"
      popupMatchSelectWidth={false}
      styles={{
        popup: {
          root: { maxHeight: 400, overflow: 'auto' }
        }
      }}
      classNames={{
        popup: {
          root: 'custom-select-dropdown'
        }
      }}
      popupRender={(menu) => (
        <div>
          <div style={{ padding: 8 }}>自定义头部</div>
          {menu}
        </div>
      )}
      onOpenChange={(open) => console.log('Dropdown:', open)}
      variant="borderless"
    >
      <Select.Option value="1">选项1</Select.Option>
      <Select.Option value="2">选项2</Select.Option>
    </Select>
  );
};
```

#### 对照表
| v5 API | v6 API | 说明 |
|--------|--------|------|
| `dropdownMatchSelectWidth` | `popupMatchSelectWidth` | 下拉菜单宽度匹配 |
| `dropdownStyle` | `styles.popup.root` | 下拉菜单样式 |
| `dropdownClassName` | `classNames.popup.root` | 下拉菜单类名 |
| `dropdownRender` | `popupRender` | 自定义下拉内容 |
| `onDropdownVisibleChange` | `onOpenChange` | 显示状态变化回调 |
| `bordered={false}` | `variant="borderless"` | 无边框样式 |

---

### DatePicker 组件迁移示例

#### 原始代码 (v5)
```tsx
import { DatePicker } from 'antd';
import dayjs from 'dayjs';

const MyDatePicker = () => {
  return (
    <DatePicker
      placeholder="请选择日期"
      dropdownClassName="custom-datepicker"
      popupStyle={{ zIndex: 2000 }}
      onSelect={(date) => console.log('Selected:', date)}
      bordered={false}
    />
  );
};

// RangePicker
const MyRangePicker = () => {
  return (
    <DatePicker.RangePicker
      popupClassName="custom-range-picker"
      onSelect={(dates) => console.log('Selected:', dates)}
    />
  );
};
```

#### 迁移后代码 (v6)
```tsx
import { DatePicker } from 'antd';
import dayjs from 'dayjs';

const MyDatePicker = () => {
  return (
    <DatePicker
      placeholder="请选择日期"
      classNames={{
        popup: {
          root: 'custom-datepicker'
        }
      }}
      styles={{
        popup: {
          root: { zIndex: 2000 }
        }
      }}
      onCalendarChange={(date) => console.log('Selected:', date)}
      variant="borderless"
    />
  );
};

// RangePicker
const MyRangePicker = () => {
  return (
    <DatePicker.RangePicker
      classNames={{
        popup: {
          root: 'custom-range-picker'
        }
      }}
      onCalendarChange={(dates) => console.log('Selected:', dates)}
    />
  );
};
```

#### 对照表
| v5 API | v6 API | 说明 |
|--------|--------|------|
| `dropdownClassName` | `classNames.popup.root` | 下拉面板类名 |
| `popupClassName` | `classNames.popup.root` | 下拉面板类名 |
| `popupStyle` | `styles.popup.root` | 下拉面板样式 |
| `onSelect` | `onCalendarChange` | 日期选择回调 |
| `bordered={false}` | `variant="borderless"` | 无边框样式 |

---

### Modal 组件迁移示例

#### 原始代码 (v5)
```tsx
import { Modal } from 'antd';

const MyModal = ({ open, onClose }) => {
  return (
    <Modal
      title="编辑信息"
      open={open}
      onCancel={onClose}
      bodyStyle={{ 
        padding: 24,
        maxHeight: '60vh',
        overflow: 'auto'
      }}
      maskStyle={{
        backgroundColor: 'rgba(0, 0, 0, 0.6)'
      }}
      destroyOnClose
    >
      <div>Modal 内容</div>
    </Modal>
  );
};
```

#### 迁移后代码 (v6)
```tsx
import { Modal } from 'antd';

const MyModal = ({ open, onClose }) => {
  return (
    <Modal
      title="编辑信息"
      open={open}
      onCancel={onClose}
      styles={{
        body: { 
          padding: 24,
          maxHeight: '60vh',
          overflow: 'auto'
        },
        mask: {
          backgroundColor: 'rgba(0, 0, 0, 0.6)'
        }
      }}
      destroyOnHidden
    >
      <div>Modal 内容</div>
    </Modal>
  );
};
```

#### 配置 blur 效果

```tsx
// 全局配置（推荐）
import { ConfigProvider } from 'antd';

const App = () => {
  return (
    <ConfigProvider
      modal={{
        mask: {
          blur: true, // 启用 blur 效果（默认）
          // blur: false, // 禁用 blur 效果
        },
      }}
    >
      <YourApp />
    </ConfigProvider>
  );
};
```

#### 对照表
| v5 API | v6 API | 说明 |
|--------|--------|------|
| `bodyStyle` | `styles.body` | 内容区域样式 |
| `maskStyle` | `styles.mask` | 遮罩样式 |
| `destroyOnClose` | `destroyOnHidden` | 关闭时销毁 |

---

### Table 组件迁移示例

#### 原始代码 (v5)
```tsx
import { Table } from 'antd';
import { useState } from 'react';

const MyTable = () => {
  const [filterOpen, setFilterOpen] = useState(false);

  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      filterDropdownOpen: filterOpen,
      onFilterDropdownOpenChange: setFilterOpen,
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowSelection={{
        onSelectInvert: (selectedRowKeys) => {
          console.log('反选:', selectedRowKeys);
        },
      }}
      pagination={{
        position: ['topRight', 'bottomRight'],
      }}
    />
  );
};
```

#### 迁移后代码 (v6)
```tsx
import { Table } from 'antd';
import { useState } from 'react';

const MyTable = () => {
  const [filterOpen, setFilterOpen] = useState(false);

  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      filterDropdownProps: {
        open: filterOpen,
        onOpenChange: setFilterOpen,
      },
    },
  ];

  const handleTableChange = (pagination, filters, sorter, extra) => {
    // v6 中 selectInvert 在 extra 中处理
    if (extra.action === 'selectInvert') {
      console.log('反选:', extra.selectedRowKeys);
    }
  };

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowSelection={{
        // onSelectInvert 移到 onChange 中处理
      }}
      onChange={handleTableChange}
      pagination={{
        placement: ['topRight', 'bottomRight'],
      }}
    />
  );
};
```

#### 对照表
| v5 API | v6 API | 说明 |
|--------|--------|------|
| `pagination.position` | `pagination.placement` | 分页位置 |
| `onSelectInvert` | `onChange` (在 extra 中) | 反选回调 |
| `filterDropdownOpen` | `filterDropdownProps.open` | 筛选下拉状态 |
| `onFilterDropdownOpenChange` | `filterDropdownProps.onOpenChange` | 筛选下拉状态变化 |

---

### Dropdown 组件迁移示例

#### 原始代码 (v5)
```tsx
import { Dropdown, Button } from 'antd';
import type { MenuProps } from 'antd';

const MyDropdown = () => {
  const items: MenuProps['items'] = [
    { key: '1', label: '菜单项 1' },
    { key: '2', label: '菜单项 2' },
  ];

  return (
    <Dropdown
      menu={{ items }}
      overlayClassName="custom-dropdown-menu"
      overlayStyle={{ width: 200 }}
      dropdownRender={(menu) => (
        <div>
          <div style={{ padding: 8 }}>自定义头部</div>
          {menu}
        </div>
      )}
      destroyPopupOnHide
      placement="bottomLeft"
    >
      <Button>下拉菜单</Button>
    </Dropdown>
  );
};
```

#### 迁移后代码 (v6)
```tsx
import { Dropdown, Button } from 'antd';
import type { MenuProps } from 'antd';

const MyDropdown = () => {
  const items: MenuProps['items'] = [
    { key: '1', label: '菜单项 1' },
    { key: '2', label: '菜单项 2' },
  ];

  return (
    <Dropdown
      menu={{ items }}
      classNames={{
        root: 'custom-dropdown-menu'
      }}
      styles={{
        root: { width: 200 }
      }}
      popupRender={(menu) => (
        <div>
          <div style={{ padding: 8 }}>自定义头部</div>
          {menu}
        </div>
      )}
      destroyOnHidden
      placement="bottomLeft"
    >
      <Button>下拉菜单</Button>
    </Dropdown>
  );
};
```

#### 对照表
| v5 API | v6 API | 说明 |
|--------|--------|------|
| `overlayClassName` | `classNames.root` | 浮层类名 |
| `overlayStyle` | `styles.root` | 浮层样式 |
| `dropdownRender` | `popupRender` | 自定义浮层内容 |
| `destroyPopupOnHide` | `destroyOnHidden` | 隐藏时销毁 |

---

### Tooltip 组件迁移示例

#### 原始代码 (v5)
```tsx
import { Tooltip, Button } from 'antd';

const MyTooltip = () => {
  return (
    <Tooltip
      title="这是提示信息"
      overlayClassName="custom-tooltip"
      overlayInnerStyle={{
        padding: 12,
        backgroundColor: '#333',
      }}
      overlayStyle={{
        maxWidth: 300,
      }}
      destroyTooltipOnHide
    >
      <Button>悬停查看</Button>
    </Tooltip>
  );
};
```

#### 迁移后代码 (v6)
```tsx
import { Tooltip, Button } from 'antd';

const MyTooltip = () => {
  return (
    <Tooltip
      title="这是提示信息"
      classNames={{
        root: 'custom-tooltip'
      }}
      styles={{
        container: {
          padding: 12,
          backgroundColor: '#333',
        },
        root: {
          maxWidth: 300,
        }
      }}
      destroyOnHidden
    >
      <Button>悬停查看</Button>
    </Tooltip>
  );
};
```

#### 对照表
| v5 API | v6 API | 说明 |
|--------|--------|------|
| `overlayClassName` | `classNames.root` | 浮层类名 |
| `overlayStyle` | `styles.root` | 浮层外层样式 |
| `overlayInnerStyle` | `styles.container` | 浮层内容样式 |
| `destroyTooltipOnHide` | `destroyOnHidden` | 隐藏时销毁 |

---

### Space 组件迁移示例

#### 原始代码 (v5)
```tsx
import { Space, Button, Divider } from 'antd';

const MySpace = () => {
  return (
    <>
      <Space direction="horizontal" size="large">
        <Button>按钮 1</Button>
        <Button>按钮 2</Button>
        <Button>按钮 3</Button>
      </Space>

      <Space
        direction="vertical"
        split={<Divider type="horizontal" />}
      >
        <div>内容 1</div>
        <div>内容 2</div>
        <div>内容 3</div>
      </Space>
    </>
  );
};
```

#### 迁移后代码 (v6)
```tsx
import { Space, Button, Divider } from 'antd';

const MySpace = () => {
  return (
    <>
      <Space orientation="horizontal" size="large">
        <Button>按钮 1</Button>
        <Button>按钮 2</Button>
        <Button>按钮 3</Button>
      </Space>

      <Space
        orientation="vertical"
        separator={<Divider type="horizontal" />}
      >
        <div>内容 1</div>
        <div>内容 2</div>
        <div>内容 3</div>
      </Space>
    </>
  );
};
```

#### 对照表
| v5 API | v6 API | 说明 |
|--------|--------|------|
| `direction` | `orientation` | 方向 |
| `split` | `separator` | 分隔符 |

**注意**: `Space.Compact` 组件也有相同的变化

---

### Tag 间距修复示例

#### 问题说明
v6 移除了 Tag 的默认 `margin-inline-end: 8px`，导致多个 Tag 紧贴在一起。

#### 原始代码 (v5 - 自动有间距)
```tsx
import { Tag } from 'antd';

const MyTags = () => {
  const tags = ['标签1', '标签2', '标签3', '标签4'];
  
  return (
    <div>
      {tags.map(tag => (
        <Tag key={tag} color="blue">
          {tag}
        </Tag>
      ))}
    </div>
  );
};
```

#### 解决方案 1: 使用 Space 组件（推荐）
```tsx
import { Tag, Space } from 'antd';

const MyTags = () => {
  const tags = ['标签1', '标签2', '标签3', '标签4'];
  
  return (
    <Space size={8} wrap>
      {tags.map(tag => (
        <Tag key={tag} color="blue">
          {tag}
        </Tag>
      ))}
    </Space>
  );
};
```

#### 解决方案 2: 全局配置
```tsx
// main.tsx 或 App.tsx
import { ConfigProvider } from 'antd';

const App = () => {
  return (
    <ConfigProvider
      tag={{
        styles: {
          root: {
            marginInlineEnd: 8, // 恢复 v5 的默认间距
          },
        },
      }}
    >
      <YourApp />
    </ConfigProvider>
  );
};
```

#### 解决方案 3: 自定义样式
```tsx
import { Tag } from 'antd';
import './MyTags.css';

const MyTags = () => {
  const tags = ['标签1', '标签2', '标签3', '标签4'];
  
  return (
    <div className="my-tags-container">
      {tags.map(tag => (
        <Tag key={tag} color="blue">
          {tag}
        </Tag>
      ))}
    </div>
  );
};
```

```css
/* MyTags.css */
.my-tags-container .ant-tag {
  margin-inline-end: 8px;
  margin-bottom: 8px; /* 如果需要换行间距 */
}
```

#### 推荐方案对比

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| Space 组件 | 明确的布局控制，支持换行 | 需要修改每个使用场景 | 推荐作为标准方案 |
| 全局配置 | 一次配置全局生效 | 可能影响不需要间距的场景 | 快速迁移，后续优化 |
| 自定义样式 | 灵活控制 | 需要维护额外的 CSS | 特殊定制场景 |

---

### Slider 组件迁移示例

#### 原始代码 (v5)
```tsx
import { Slider } from 'antd';
import { useState } from 'react';

const MySlider = () => {
  const [value, setValue] = useState(50);

  return (
    <Slider
      min={0}
      max={100}
      value={value}
      onChange={setValue}
      tipFormatter={(value) => `${value}%`}
      tooltipVisible={true}
      tooltipPlacement="top"
      getTooltipPopupContainer={(node) => node.parentElement!}
    />
  );
};
```

#### 迁移后代码 (v6)
```tsx
import { Slider } from 'antd';
import { useState } from 'react';

const MySlider = () => {
  const [value, setValue] = useState(50);

  return (
    <Slider
      min={0}
      max={100}
      value={value}
      onChange={setValue}
      tooltip={{
        formatter: (value) => `${value}%`,
        open: true,
        placement: 'top',
        getPopupContainer: (node) => node.parentElement!,
      }}
    />
  );
};
```

#### 对照表
| v5 API | v6 API | 说明 |
|--------|--------|------|
| `tipFormatter` | `tooltip.formatter` | 格式化提示信息 |
| `tooltipVisible` | `tooltip.open` | 提示显示状态 |
| `tooltipPlacement` | `tooltip.placement` | 提示位置 |
| `getTooltipPopupContainer` | `tooltip.getPopupContainer` | 提示容器 |
| `tooltipPrefixCls` | `tooltip.prefixCls` | 提示前缀类名 |

---

### Card 组件迁移示例

#### 原始代码 (v5)
```tsx
import { Card } from 'antd';

const MyCard = () => {
  return (
    <Card
      title="卡片标题"
      headStyle={{
        backgroundColor: '#f0f0f0',
        fontWeight: 'bold',
      }}
      bodyStyle={{
        padding: 24,
        minHeight: 200,
      }}
      bordered={false}
    >
      <div>卡片内容</div>
    </Card>
  );
};
```

#### 迁移后代码 (v6)
```tsx
import { Card } from 'antd';

const MyCard = () => {
  return (
    <Card
      title="卡片标题"
      styles={{
        header: {
          backgroundColor: '#f0f0f0',
          fontWeight: 'bold',
        },
        body: {
          padding: 24,
          minHeight: 200,
        },
      }}
      variant="borderless"
    >
      <div>卡片内容</div>
    </Card>
  );
};
```

#### variant 选项

```tsx
// v6 的 variant 选项
<Card variant="outlined">边框卡片</Card>
<Card variant="borderless">无边框卡片</Card>
<Card variant="filled">填充卡片</Card>
```

#### 对照表
| v5 API | v6 API | 说明 |
|--------|--------|------|
| `headStyle` | `styles.header` | 标题区域样式 |
| `bodyStyle` | `styles.body` | 内容区域样式 |
| `bordered={true}` | `variant="outlined"` | 有边框 |
| `bordered={false}` | `variant="borderless"` | 无边框 |

---

### Alert 组件迁移示例

#### 原始代码 (v5)
```tsx
import { Alert } from 'antd';

const MyAlert = () => {
  return (
    <>
      <Alert
        message="这是一条提示信息"
        type="info"
        closeText="关闭提示"
      />

      <Alert
        message="这是一条警告信息"
        description="详细的警告描述内容"
        type="warning"
      />
    </>
  );
};
```

#### 迁移后代码 (v6)
```tsx
import { Alert } from 'antd';

const MyAlert = () => {
  return (
    <>
      <Alert
        title="这是一条提示信息"
        type="info"
        closable={{
          closeIcon: '关闭提示',
        }}
      />

      <Alert
        title="这是一条警告信息"
        description="详细的警告描述内容"
        type="warning"
      />
    </>
  );
};
```

#### 对照表
| v5 API | v6 API | 说明 |
|--------|--------|------|
| `message` | `title` | 主要提示内容 |
| `closeText` | `closable.closeIcon` | 自定义关闭按钮文本 |

**注意**: `description` 属性保持不变

---

### Progress 组件迁移示例

#### 原始代码 (v5)
```tsx
import { Progress } from 'antd';

const MyProgress = () => {
  return (
    <>
      {/* 线形进度条 */}
      <Progress
        percent={75}
        strokeWidth={10}
        trailColor="#f0f0f0"
      />

      {/* 圆形进度条 */}
      <Progress
        type="circle"
        percent={60}
        width={120}
        trailColor="#f0f0f0"
        gapPosition="bottom"
      />
    </>
  );
};
```

#### 迁移后代码 (v6)
```tsx
import { Progress } from 'antd';

const MyProgress = () => {
  return (
    <>
      {/* 线形进度条 */}
      <Progress
        percent={75}
        size={10}
        railColor="#f0f0f0"
      />

      {/* 圆形进度条 */}
      <Progress
        type="circle"
        percent={60}
        size={120}
        railColor="#f0f0f0"
        gapPlacement="bottom"
      />
    </>
  );
};
```

#### 对照表
| v5 API | v6 API | 说明 |
|--------|--------|------|
| `strokeWidth` | `size` | 线形进度条粗细 |
| `width` | `size` | 圆形进度条大小 |
| `trailColor` | `railColor` | 未完成部分颜色 |
| `gapPosition` | `gapPlacement` | 缺口位置 |

---

## 🛠️ 通用辅助函数

### 1. variant 转换函数

```typescript
// src/utils/antdMigration.ts

/**
 * 将 v5 的 bordered 属性转换为 v6 的 variant 属性
 */
export function getBorderedVariant(
  bordered?: boolean
): 'outlined' | 'borderless' | 'filled' | undefined {
  if (bordered === false) return 'borderless';
  if (bordered === true) return 'outlined';
  return undefined; // 使用默认值
}

// 使用示例
import { Select } from 'antd';
import { getBorderedVariant } from '@/utils/antdMigration';

const MySelect = ({ bordered }) => {
  return (
    <Select variant={getBorderedVariant(bordered)}>
      {/* ... */}
    </Select>
  );
};
```

---

### 2. 样式 API 转换函数

```typescript
// src/utils/antdMigration.ts

/**
 * 将 v5 的样式属性转换为 v6 的 styles 对象
 */
export function convertModalStyles(props: {
  bodyStyle?: React.CSSProperties;
  maskStyle?: React.CSSProperties;
}) {
  const { bodyStyle, maskStyle } = props;
  
  if (!bodyStyle && !maskStyle) return undefined;
  
  return {
    ...(bodyStyle && { body: bodyStyle }),
    ...(maskStyle && { mask: maskStyle }),
  };
}

// 使用示例
import { Modal } from 'antd';
import { convertModalStyles } from '@/utils/antdMigration';

const MyModal = ({ bodyStyle, maskStyle, ...rest }) => {
  return (
    <Modal
      styles={convertModalStyles({ bodyStyle, maskStyle })}
      {...rest}
    />
  );
};
```

---

### 3. 下拉组件 props 转换

```typescript
// src/utils/antdMigration.ts

/**
 * 将 v5 的下拉相关 props 转换为 v6 格式
 */
export function convertDropdownProps<T extends Record<string, any>>(props: T) {
  const {
    dropdownMatchSelectWidth,
    dropdownStyle,
    dropdownClassName,
    dropdownRender,
    onDropdownVisibleChange,
    bordered,
    ...rest
  } = props;

  return {
    ...rest,
    ...(dropdownMatchSelectWidth !== undefined && {
      popupMatchSelectWidth: dropdownMatchSelectWidth,
    }),
    ...(dropdownStyle && {
      styles: { popup: { root: dropdownStyle } },
    }),
    ...(dropdownClassName && {
      classNames: { popup: { root: dropdownClassName } },
    }),
    ...(dropdownRender && {
      popupRender: dropdownRender,
    }),
    ...(onDropdownVisibleChange && {
      onOpenChange: onDropdownVisibleChange,
    }),
    ...(bordered !== undefined && {
      variant: bordered === false ? 'borderless' : 'outlined',
    }),
  };
}

// 使用示例
import { Select } from 'antd';
import { convertDropdownProps } from '@/utils/antdMigration';

const MySelect = (props) => {
  const convertedProps = convertDropdownProps(props);
  return <Select {...convertedProps} />;
};
```

---

### 4. Tooltip props 转换

```typescript
// src/utils/antdMigration.ts

/**
 * 将 v5 的 Tooltip props 转换为 v6 格式
 */
export function convertTooltipProps<T extends Record<string, any>>(props: T) {
  const {
    overlayClassName,
    overlayStyle,
    overlayInnerStyle,
    destroyTooltipOnHide,
    ...rest
  } = props;

  return {
    ...rest,
    ...(overlayClassName && {
      classNames: { root: overlayClassName },
    }),
    ...((overlayStyle || overlayInnerStyle) && {
      styles: {
        ...(overlayStyle && { root: overlayStyle }),
        ...(overlayInnerStyle && { container: overlayInnerStyle }),
      },
    }),
    ...(destroyTooltipOnHide !== undefined && {
      destroyOnHidden: destroyTooltipOnHide,
    }),
  };
}

// 使用示例
import { Tooltip } from 'antd';
import { convertTooltipProps } from '@/utils/antdMigration';

const MyTooltip = (props) => {
  const convertedProps = convertTooltipProps(props);
  return <Tooltip {...convertedProps} />;
};
```

---

### 5. 兼容层组件（过渡期使用）

如果需要在升级过程中保持兼容性，可以创建兼容层组件：

```typescript
// src/components/compat/Select.tsx

import { Select as AntSelect, SelectProps as AntSelectProps } from 'antd';
import { convertDropdownProps } from '@/utils/antdMigration';

/**
 * 兼容 v5 API 的 Select 组件
 * 过渡期使用，最终应该全部迁移到 v6 API
 */
export interface CompatSelectProps extends AntSelectProps {
  // v5 API (deprecated)
  dropdownMatchSelectWidth?: boolean;
  dropdownStyle?: React.CSSProperties;
  dropdownClassName?: string;
  dropdownRender?: (menu: React.ReactNode) => React.ReactNode;
  onDropdownVisibleChange?: (open: boolean) => void;
  bordered?: boolean;
}

export const Select = (props: CompatSelectProps) => {
  const convertedProps = convertDropdownProps(props);
  return <AntSelect {...convertedProps} />;
};

// 同样可以创建其他兼容组件
// - Modal
// - Tooltip
// - DatePicker
// 等等
```

---

## 📝 VSCode 代码片段

创建 `.vscode/antd6-migration.code-snippets`:

```json
{
  "Ant Design 6 Select": {
    "prefix": "antd6-select",
    "body": [
      "<Select",
      "  placeholder=\"${1:请选择}\"",
      "  popupMatchSelectWidth={${2:true}}",
      "  styles={{",
      "    popup: {",
      "      root: { ${3:} }",
      "    }",
      "  }}",
      "  classNames={{",
      "    popup: {",
      "      root: '${4:}'",
      "    }",
      "  }}",
      "  onOpenChange={(open) => ${5:console.log(open)}}",
      "  variant=\"${6|outlined,borderless,filled|}\"",
      ">",
      "  $0",
      "</Select>"
    ],
    "description": "Ant Design 6 Select 组件"
  },
  "Ant Design 6 Modal": {
    "prefix": "antd6-modal",
    "body": [
      "<Modal",
      "  title=\"${1:标题}\"",
      "  open={${2:open}}",
      "  onCancel={${3:onClose}}",
      "  styles={{",
      "    body: { ${4:} },",
      "    mask: { ${5:} }",
      "  }}",
      "  destroyOnHidden",
      ">",
      "  $0",
      "</Modal>"
    ],
    "description": "Ant Design 6 Modal 组件"
  },
  "Ant Design 6 Tooltip": {
    "prefix": "antd6-tooltip",
    "body": [
      "<Tooltip",
      "  title=\"${1:提示内容}\"",
      "  classNames={{",
      "    root: '${2:}'",
      "  }}",
      "  styles={{",
      "    container: { ${3:} }",
      "  }}",
      "  destroyOnHidden",
      ">",
      "  $0",
      "</Tooltip>"
    ],
    "description": "Ant Design 6 Tooltip 组件"
  }
}
```

---

## 🔍 升级检查脚本

创建 `scripts/check-antd6-migration.js`:

```javascript
#!/usr/bin/env node

/**
 * Ant Design 6 升级检查脚本
 * 检查代码中是否还有 v5 的废弃 API
 */

const fs = require('fs');
const path = require('path');

// 需要检查的废弃 API
const deprecatedAPIs = [
  'dropdownMatchSelectWidth',
  'dropdownStyle',
  'dropdownClassName',
  'dropdownRender',
  'onDropdownVisibleChange',
  'overlayClassName',
  'overlayStyle',
  'overlayInnerStyle',
  'destroyTooltipOnHide',
  'destroyPopupOnHide',
  'destroyOnClose',
  'bodyStyle',
  'maskStyle',
  'headStyle',
  'trailColor',
  'strokeWidth',
  'gapPosition',
  'iconPosition',
  'closeText',
  'expandIconPosition',
  'destroyInactivePanel',
];

// 搜索目录
const srcDir = path.join(process.cwd(), 'src');

// 检查结果
const results = [];

// 递归搜索文件
function searchFiles(dir) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      searchFiles(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      checkFile(filePath);
    }
  });
}

// 检查单个文件
function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  deprecatedAPIs.forEach((api) => {
    const regex = new RegExp(`\\b${api}\\b`, 'g');
    
    lines.forEach((line, index) => {
      if (regex.test(line)) {
        results.push({
          file: filePath.replace(srcDir, 'src'),
          line: index + 1,
          api,
          content: line.trim(),
        });
      }
    });
  });
}

// 执行检查
console.log('🔍 开始检查 Ant Design 6 升级状态...\n');
searchFiles(srcDir);

// 输出结果
if (results.length === 0) {
  console.log('✅ 未发现废弃 API，升级完成！\n');
} else {
  console.log(`⚠️  发现 ${results.length} 处需要升级的代码：\n`);
  
  // 按文件分组
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.file]) {
      acc[result.file] = [];
    }
    acc[result.file].push(result);
    return acc;
  }, {});

  Object.entries(groupedResults).forEach(([file, items]) => {
    console.log(`📄 ${file}`);
    items.forEach((item) => {
      console.log(`   行 ${item.line}: ${item.api}`);
      console.log(`   ${item.content}\n`);
    });
  });

  console.log('📋 请根据迁移文档完成这些 API 的升级\n');
  process.exit(1);
}
```

**使用方法**:
```bash
chmod +x scripts/check-antd6-migration.js
node scripts/check-antd6-migration.js
```

---

## 🎯 总结

### 迁移优先级

1. **高优先级** (必须立即处理)
   - Select, DatePicker, Cascader 等下拉组件
   - Modal, Drawer 等弹窗组件
   - 自定义封装的通用组件

2. **中优先级** (尽快处理)
   - Table, Dropdown, Tooltip
   - Tag 间距问题
   - Space, Card 等布局组件

3. **低优先级** (可以逐步处理)
   - Progress, Slider, Alert
   - Button iconPosition
   - 其他使用频率较低的 API

### 推荐工作流

1. **准备阶段**: 备份代码，创建升级分支
2. **自动化阶段**: 运行替换脚本处理简单的 API 重命名
3. **手动迁移阶段**: 处理需要结构调整的 API
4. **测试阶段**: 运行测试，手动验证功能
5. **优化阶段**: 清理警告，优化代码
6. **发布阶段**: 合并代码，部署上线

---

**文档版本**: 1.0.0  
**最后更新**: 2026-02-10  
**配套文档**: ANTD-6-UPGRADE-ANALYSIS.md
