# 📊 如何查看测试报告

## 🚀 快速开始（3种方式）

### 方式 1: 打开 HTML 报告（推荐 ⭐）

```bash
cd timeplan-craft-kit

# 启动报告服务器
pnpm exec playwright show-report

# 将自动在浏览器打开 http://localhost:9323
```

**报告内容**：
- 📈 通过率统计图表
- ✅ 成功用例列表
- ❌ 失败用例详情（含截图、视频、错误日志）
- ⏱️ 执行时间分析

---

### 方式 2: 终端查看（最快 ⚡）

```bash
cd timeplan-craft-kit

# 简洁报告（一行一个结果）
pnpm exec playwright test --reporter=line

# 详细列表
pnpm exec playwright test --reporter=list

# 示例输出：
# [chromium] › e2e/project-list.spec.ts:19:3 › Project List › should display project list page (1.2s)
# [chromium] › e2e/project-list.spec.ts:33:3 › Project List › should create new project (2.1s)
#   1 failed
#     [chromium] › e2e/project-list.spec.ts:55:3 › should display existing projects
```

---

### 方式 3: JSON 报告（编程处理 📊）

```bash
cd timeplan-craft-kit

# 生成 JSON 报告
pnpm exec playwright test --reporter=json > e2e/test-results.json

# 查看结果摘要
cat e2e/test-results.json | grep -E '"title"|"status"' | head -30
```

---

## 🖼️ 查看失败测试的截图

### 查看所有失败截图
```bash
# 列出所有失败测试的截图
ls -la timeplan-craft-kit/test-results/*-chromium/test-failed-1.png

# 示例输出：
# test-results/project-list-should-display-existing-projects-chromium/test-failed-1.png
```

### 打开特定截图
```bash
# macOS
open timeplan-craft-kit/test-results/project-list-Project-List-should-display-existing-projects-chromium/test-failed-1.png

# Linux
xdg-open timeplan-craft-kit/test-results/project-list-Project-List-should-display-existing-projects-chromium/test-failed-1.png
```

---

## 🎥 查看测试视频

```bash
# 视频位置
timeplan-craft-kit/test-results/<test-name>/video.webm

# 播放视频（macOS）
open timeplan-craft-kit/test-results/project-list-Project-List-should-create-new-project-chromium-retry1/video.webm
```

---

## 🔍 使用 Playwright Trace Viewer

### 查看执行追踪（最详细 🔬）
```bash
# 显示特定测试的详细追踪
pnpm exec playwright show-trace \
  test-results/project-list-Project-List-should-display-existing-projects-chromium-retry1/trace.zip

# 追踪包含：
# - 每个操作的 DOM 快照
# - 网络请求
# - 控制台日志
# - 错误信息
```

---

## 📁 报告文件位置

```
timeplan-craft-kit/
├── playwright-report/
│   ├── index.html              # HTML 报告入口 ⭐
│   └── data/                   # 报告数据文件
│
├── test-results/               # 测试失败时的调试文件
│   └── <test-name>-chromium/
│       ├── test-failed-1.png   # 失败截图 🖼️
│       ├── video.webm          # 执行视频 🎥
│       ├── trace.zip           # 执行追踪 🔍
│       └── error-context.md    # 错误上下文
│
└── e2e/
    ├── TEST-RESULTS.md         # 测试结果文档
    ├── test-summary.md         # 测试摘要
    └── test-results.json       # JSON 报告（如生成）
```

---

## 🎯 实际测试结果示例

### 最近一次运行结果（project-list.spec.ts）

```
Running 6 tests using 1 worker

✓ [chromium] › project-list.spec.ts:19 › should display project list page (1.2s)
✓ [chromium] › project-list.spec.ts:33 › should create new project (2.1s)
✗ [chromium] › project-list.spec.ts:55 › should display existing projects (5.0s)
- [chromium] › project-list.spec.ts:60 › should search projects (skipped)
- [chromium] › project-list.spec.ts:76 › should edit project (skipped)
- [chromium] › project-list.spec.ts:106 › should delete project (skipped)

1 failed
  - 选择器冲突: "text=Orion X" 匹配到2个元素

3 did not run (依赖失败)

总用时: 10.9s
```

---

## 🛠️ 故障排除

### 1. HTML 报告无法打开
```bash
# 重新生成报告
pnpm exec playwright test --reporter=html

# 手动指定端口
pnpm exec playwright show-report --port=9324
```

### 2. 没有生成截图/视频
检查 `playwright.config.ts` 配置：
```typescript
use: {
  screenshot: 'only-on-failure',  // 失败时截图
  video: 'retain-on-failure',     // 失败时保留视频
}
```

### 3. 测试通过但没有报告
```bash
# 强制生成报告（即使测试通过）
pnpm exec playwright test --reporter=html --trace=on
```

---

## 📊 持续集成报告

### 生成 CI 友好的报告
```bash
# JUnit XML 格式（供 Jenkins/GitLab CI 使用）
pnpm exec playwright test --reporter=junit --output=results.xml

# 多格式同时输出
pnpm exec playwright test \
  --reporter=line \
  --reporter=html \
  --reporter=json
```

---

## 💡 小贴士

1. **快速查看失败原因**：使用 `--reporter=line` 获取简洁输出
2. **调试失败测试**：使用 `show-trace` 查看详细执行步骤
3. **分享报告**：将 `playwright-report/` 目录打包分享
4. **历史对比**：保存每次运行的 JSON 报告进行对比
