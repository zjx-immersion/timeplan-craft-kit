# 测试指南

**项目**: TimePlan Craft Kit  
**文档版本**: v1.0.0  
**创建日期**: 2026-02-12

---

## 📋 测试概览

### 测试策略

本项目采用多层次测试策略：

1. **单元测试** (Unit Tests)
   - 测试Store逻辑
   - 测试工具函数
   - 测试纯组件

2. **集成测试** (Integration Tests)
   - 测试组件交互
   - 测试Store与组件集成
   - 测试数据流

3. **端到端测试** (E2E Tests)
   - 测试完整用户流程
   - 测试跨视图操作
   - 测试批量操作流程

---

## 🧪 已实现测试

### 1. SelectionStore 单元测试

**文件**: `src/stores/__tests__/selectionStore.test.ts`

**测试范围**:
- ✅ 基础选择功能（单选、多选）
- ✅ 批量操作（全选、清除、批量选择/取消）
- ✅ 选择模式切换
- ✅ 辅助方法（isSelected、getSelectedCount等）
- ✅ 性能测试（1000任务）
- ✅ 边界情况（空数组、重复ID、不存在的ID）

**测试用例数**: 23个

**关键测试**:

1. **性能测试**:
   ```typescript
   it('应该高效处理大量选择操作', () => {
     // 测试1000个任务的选择性能
     // 预期：< 100ms
   });
   ```

2. **边界情况**:
   ```typescript
   it('应该处理重复的ID', () => {
     // Set自动去重测试
   });
   ```

---

### 2. NavigationStore 单元测试

**文件**: `src/stores/__tests__/navigationStore.test.ts`

**测试范围**:
- ✅ 基础导航功能
- ✅ 导航选项（高亮、滚动、持续时间）
- ✅ 任务切换（上一个/下一个/指定索引）
- ✅ 大量任务优化（最多20个）
- ✅ 动画状态管理
- ✅ 边界情况

**测试用例数**: 25个

**关键测试**:

1. **大量任务优化**:
   ```typescript
   it('应该限制高亮任务数量为20个', () => {
     // Task 3.7: 测试50个任务只高亮前20个
   });
   ```

2. **任务循环**:
   ```typescript
   it('应该在最后一个任务后循环到第一个', () => {
     // 测试任务切换的循环逻辑
   });
   ```

---

## 🚀 运行测试

### 前置条件

确保已安装测试依赖：

```bash
npm install --save-dev \
  @testing-library/react \
  @testing-library/react-hooks \
  @testing-library/jest-dom \
  @types/jest \
  jest \
  jest-environment-jsdom
```

### 配置Jest

创建 `jest.config.js`:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.ts?(x)',
    '**/?(*.)+(spec|test).ts?(x)'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
    '!src/main.tsx',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### 运行命令

```bash
# 运行所有测试
npm test

# 监听模式
npm test -- --watch

# 生成覆盖率报告
npm test -- --coverage

# 运行特定测试文件
npm test selectionStore

# 运行特定测试用例
npm test -- --testNamePattern="应该能够切换单个任务的选择状态"
```

---

## 📊 测试覆盖率目标

| 模块 | 目标覆盖率 | 当前覆盖率 | 状态 |
|------|-----------|-----------|------|
| SelectionStore | 90% | - | ⏳ 待测试 |
| NavigationStore | 90% | - | ⏳ 待测试 |
| 批量操作API | 80% | - | ⏳ 待测试 |
| 组件 | 70% | - | ⏳ 待测试 |
| 工具函数 | 80% | - | ⏳ 待测试 |

**总体目标**: 80%+

---

## 🧩 待实现测试

### 高优先级

1. **批量操作API测试**
   ```typescript
   // src/stores/__tests__/timePlanStore.test.ts
   describe('batchUpdateLinesSameValue', () => {
     it('应该高效更新1000个任务');
     it('应该正确合并attributes');
     it('应该保存历史记录');
   });
   
   describe('batchDeleteLines', () => {
     it('应该删除任务和相关关系');
     it('应该返回删除统计');
   });
   ```

2. **BatchEditDialog组件测试**
   ```typescript
   // src/components/dialogs/__tests__/BatchEditDialog.test.tsx
   describe('BatchEditDialog', () => {
     it('应该显示可选字段');
     it('应该验证表单');
     it('应该正确提交更新');
   });
   ```

3. **BatchDeleteDialog组件测试**
   ```typescript
   // src/components/dialogs/__tests__/BatchDeleteDialog.test.tsx
   describe('BatchDeleteDialog', () => {
     it('应该显示删除确认');
     it('应该计算相关关系数量');
   });
   ```

### 中优先级

4. **EnhancedTableView集成测试**
   ```typescript
   describe('EnhancedTableView - 批量选择', () => {
     it('应该正确集成SelectionStore');
     it('应该显示批量操作栏');
     it('应该支持全选/取消全选');
   });
   ```

5. **MatrixViewV3集成测试**
   ```typescript
   describe('MatrixViewV3 - 批量选择', () => {
     it('应该在选择模式下选择单元格');
     it('应该显示批量操作栏');
   });
   ```

### 低优先级

6. **性能基准测试**
   ```typescript
   describe('Performance Benchmarks', () => {
     it('批量更新1000任务应在100ms内完成');
     it('选择1000任务应在50ms内完成');
   });
   ```

---

## 📝 测试最佳实践

### 1. 测试结构

使用 AAA 模式（Arrange-Act-Assert）:

```typescript
it('应该能够切换选择状态', () => {
  // Arrange - 准备
  const { result } = renderHook(() => useSelectionStore());
  
  // Act - 执行
  act(() => {
    result.current.toggleSelection('line-1');
  });
  
  // Assert - 断言
  expect(result.current.isSelected('line-1')).toBe(true);
});
```

### 2. 测试命名

- 使用描述性的测试名称
- 说明期望的行为
- 使用中文描述（项目约定）

```typescript
✅ 好的命名:
it('应该能够切换单个任务的选择状态')
it('应该在最后一个任务后循环到第一个')

❌ 差的命名:
it('test toggle')
it('works')
```

### 3. 测试独立性

- 每个测试应该独立运行
- 使用 beforeEach 清理状态
- 不依赖测试执行顺序

```typescript
beforeEach(() => {
  // 重置store状态
  const { result } = renderHook(() => useSelectionStore());
  act(() => {
    result.current.clearSelection();
  });
});
```

### 4. 测试覆盖

- 测试正常流程
- 测试边界情况
- 测试错误处理
- 测试性能

```typescript
describe('边界情况', () => {
  it('应该处理空数组');
  it('应该处理重复的ID');
  it('应该处理不存在的ID');
});
```

### 5. Mock使用

- 只Mock外部依赖
- 不Mock被测试的代码
- 使用jest.fn()创建mock函数

```typescript
const mockOnDataChange = jest.fn();
render(<Component onDataChange={mockOnDataChange} />);
```

---

## 🔍 测试调试

### 1. 查看测试输出

```bash
# 详细输出
npm test -- --verbose

# 只显示失败的测试
npm test -- --onlyFailures
```

### 2. 调试特定测试

```typescript
// 只运行这个测试
it.only('应该能够切换选择状态', () => {
  // ...
});

// 跳过这个测试
it.skip('暂时跳过的测试', () => {
  // ...
});
```

### 3. 使用console.log

```typescript
it('调试测试', () => {
  const { result } = renderHook(() => useSelectionStore());
  
  console.log('Before:', result.current.selectedLineIds);
  
  act(() => {
    result.current.toggleSelection('line-1');
  });
  
  console.log('After:', result.current.selectedLineIds);
});
```

---

## 📈 持续集成

### GitHub Actions配置

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v2
        with:
          files: ./coverage/coverage-final.json
```

---

## 🎯 测试清单

在PR提交前，确保：

- [ ] 所有测试通过
- [ ] 代码覆盖率≥80%
- [ ] 没有跳过的测试（除非有充分理由）
- [ ] 性能测试通过
- [ ] 边界情况已测试
- [ ] 测试文档已更新

---

## 📚 参考资料

- [Jest文档](https://jestjs.io/)
- [Testing Library文档](https://testing-library.com/)
- [React Testing最佳实践](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Zustand测试指南](https://github.com/pmndrs/zustand#testing)

---

**文档版本**: v1.0.0  
**最后更新**: 2026-02-12  
**维护人**: 开发团队
