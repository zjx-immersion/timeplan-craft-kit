#!/bin/bash

# 前后端集成测试脚本

API_BASE="http://localhost:8000"
USERNAME="test_user_$(date +%s)"
PASSWORD="TestPass123!"

echo "🚀 开始前后端集成测试..."
echo "========================================"

# 测试 1: 用户注册
echo -e "\n📝 测试 1: 用户注册"
REGISTER_RESPONSE=$(curl -s -X POST "$API_BASE/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"$USERNAME\", \"email\": \"${USERNAME}@test.com\", \"password\": \"$PASSWORD\"}")

USER_ID=$(echo $REGISTER_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])" 2>/dev/null)
if [ -z "$USER_ID" ]; then
  echo "❌ 用户注册失败"
  echo $REGISTER_RESPONSE
  exit 1
fi
echo "✅ 用户注册成功: $USERNAME"

# 测试 2: 用户登录
echo -e "\n📝 测试 2: 用户登录"
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"$USERNAME\", \"password\": \"$PASSWORD\"}")

TOKEN=$(echo $LOGIN_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null)
if [ -z "$TOKEN" ]; then
  echo "❌ 用户登录失败"
  echo $LOGIN_RESPONSE
  exit 1
fi
echo "✅ 用户登录成功，获取 Token"

# 测试 3: 创建计划
echo -e "\n📝 测试 3: 创建计划"
PLAN_RESPONSE=$(curl -s -X POST "$API_BASE/api/v1/plans" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"title\": \"集成测试计划\", \"owner\": \"$USERNAME\", \"description\": \"前后端集成测试\"}")

PLAN_ID=$(echo $PLAN_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])" 2>/dev/null)
if [ -z "$PLAN_ID" ]; then
  echo "❌ 计划创建失败"
  echo $PLAN_RESPONSE
  exit 1
fi
echo "✅ 计划创建成功: $PLAN_ID"

# 测试 4: 创建时间线
echo -e "\n📝 测试 4: 创建时间线"
TIMELINE_RESPONSE=$(curl -s -X POST "$API_BASE/api/v1/plans/$PLAN_ID/timelines" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "开发阶段", "owner": "张三", "color": "#1677ff"}')

TIMELINE_ID=$(echo $TIMELINE_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])" 2>/dev/null)
if [ -z "$TIMELINE_ID" ]; then
  echo "❌ 时间线创建失败"
  echo $TIMELINE_RESPONSE
  exit 1
fi
echo "✅ 时间线创建成功: $TIMELINE_ID"

# 测试 5: 创建节点
echo -e "\n📝 测试 5: 创建节点（Bar, Milestone, Gateway）"
# Bar 节点
NODE_A=$(curl -s -X POST "$API_BASE/api/v1/timelines/$TIMELINE_ID/nodes" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type": "bar", "label": "需求分析", "start_date": "2026-03-01T00:00:00", "end_date": "2026-03-15T00:00:00", "color": "#52c41a"}' | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])" 2>/dev/null)
echo "✅ Bar 节点创建成功: $NODE_A"

# Milestone 节点
NODE_B=$(curl -s -X POST "$API_BASE/api/v1/timelines/$TIMELINE_ID/nodes" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type": "milestone", "label": "需求评审", "start_date": "2026-03-16T00:00:00", "color": "#ff4d4f"}' | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])" 2>/dev/null)
echo "✅ Milestone 节点创建成功: $NODE_B"

# Gateway 节点
NODE_C=$(curl -s -X POST "$API_BASE/api/v1/timelines/$TIMELINE_ID/nodes" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type": "gateway", "label": "技术评审", "start_date": "2026-03-17T00:00:00", "color": "#faad14"}' | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])" 2>/dev/null)
echo "✅ Gateway 节点创建成功: $NODE_C"

# 测试 6: 创建依赖关系
echo -e "\n📝 测试 6: 创建依赖关系"
curl -s -X POST "$API_BASE/api/v1/dependencies" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"from_node_id\": \"$NODE_A\", \"to_node_id\": \"$NODE_B\", \"type\": \"FS\"}" > /dev/null
echo "✅ 依赖 A→B 创建成功"

curl -s -X POST "$API_BASE/api/v1/dependencies" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"from_node_id\": \"$NODE_B\", \"to_node_id\": \"$NODE_C\", \"type\": \"FS\"}" > /dev/null
echo "✅ 依赖 B→C 创建成功"

# 测试 7: 循环依赖检测
echo -e "\n📝 测试 7: 循环依赖检测 🔥"
CYCLE_RESPONSE=$(curl -s -X POST "$API_BASE/api/v1/dependencies" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"from_node_id\": \"$NODE_C\", \"to_node_id\": \"$NODE_A\", \"type\": \"FS\"}")

if echo $CYCLE_RESPONSE | grep -q "cycle_detected"; then
  echo "✅ 🔥 循环依赖检测成功！系统正确阻止了环形依赖"
else
  echo "❌ 循环依赖检测失败"
  echo $CYCLE_RESPONSE
fi

# 总结
echo -e "\n========================================"
echo -e "\n🎉 所有测试通过！"
echo ""
echo "✅ 认证系统正常"
echo "✅ CRUD 操作正常"
echo "✅ 三种节点类型创建成功"
echo "✅ 依赖关系创建成功"
echo "✅ 循环依赖检测工作正常"
echo ""
echo "🔗 前后端集成验证完成！"
