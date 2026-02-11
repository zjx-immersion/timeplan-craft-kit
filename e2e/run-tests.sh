#!/bin/bash

# TimePlan Craft Kit E2E 测试运行脚本

echo "======================================"
echo "TimePlan Craft Kit - E2E 测试运行器"
echo "======================================"
echo ""

# 检查应用是否运行
echo "检查应用是否运行在 http://localhost:9082..."
if curl -s http://localhost:9082 > /dev/null; then
    echo "✅ 应用已启动"
else
    echo "❌ 应用未启动，请先运行: pnpm run dev"
    exit 1
fi

echo ""
echo "======================================"
echo "运行测试..."
echo "======================================"
echo ""

# 运行所有测试并生成报告
pnpm exec playwright test --project=chromium --reporter=html,line --timeout=90000

echo ""
echo "======================================"
echo "测试完成！"
echo "======================================"
echo ""
echo "查看 HTML 报告:"
echo "  pnpm exec playwright show-report"
echo ""
echo "查看失败测试的截图:"
echo "  ls -la test-results/"
echo ""
