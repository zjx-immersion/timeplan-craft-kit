#!/bin/bash

# TimePlan Craft Kit - 启动脚本
# 快速启动新项目

echo "🚀 启动 TimePlan Craft Kit (Ant Design 版本)..."
echo ""
echo "📦 检查依赖..."

# 检查 node_modules 是否存在
if [ ! -d "node_modules" ]; then
  echo "📥 首次运行，正在安装依赖..."
  npm install
else
  echo "✅ 依赖已安装"
fi

echo ""
echo "🎨 启动开发服务器..."
echo "   - 端口: 9081"
echo "   - 地址: http://localhost:9081"
echo ""

npm run dev
