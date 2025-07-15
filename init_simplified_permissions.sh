#!/bin/bash

# PKMS 简化权限体系初始化脚本
# 基于新的简化权限设计：view, edit, * 三种动作

API_BASE="http://localhost:8080/api/v1"
PROJECT_ID="d1qcem8rvcua2g9ugv70"  # 核电站项目ID

echo "🚀 开始初始化简化权限体系..."

# 获取登录token
echo "📝 获取管理员token..."
TOKEN=$(curl -s -X POST "$API_BASE/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "123"
  }' | jq -r '.data.accessToken')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ 登录失败，请检查管理员账号"
  exit 1
fi

echo "✅ 登录成功"

# 清空现有权限
echo "🧹 清空现有权限数据..."
curl -s -X DELETE "$API_BASE/casbin/policies/clear" \
  -H "Authorization: Bearer $TOKEN" > /dev/null

curl -s -X DELETE "$API_BASE/casbin/roles/clear" \
  -H "Authorization: Bearer $TOKEN" > /dev/null

echo "✅ 权限数据已清空"

# 添加角色策略
echo "👥 添加角色策略..."

# 系统管理员角色 (admin)
admin_policies=(
  "admin,*,*"
)

# 项目管理员角色 (project_manager)
project_manager_policies=(
  "project_manager,project:$PROJECT_ID,*"
  "project_manager,project:$PROJECT_ID:package,*"
  "project_manager,dashboard,view"
)

# 开发者角色 (developer)
developer_policies=(
  "developer,project:$PROJECT_ID,view"
  "developer,project:$PROJECT_ID:package,edit"
  "developer,dashboard,view"
)

# 查看者角色 (viewer)
viewer_policies=(
  "viewer,project:$PROJECT_ID,view"
  "viewer,project:$PROJECT_ID:package,view"
  "viewer,dashboard,view"
)

# 添加所有角色策略
all_policies=("${admin_policies[@]}" "${project_manager_policies[@]}" "${developer_policies[@]}" "${viewer_policies[@]}")

for policy in "${all_policies[@]}"; do
  IFS=',' read -r subject object action <<< "$policy"
  
  curl -s -X POST "$API_BASE/casbin/role-policies" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"role\": \"$subject\",
      \"object\": \"$object\",
      \"action\": \"$action\"
    }" > /dev/null
  
  echo "  ✓ 添加策略: $policy"
done

echo "✅ 角色策略添加完成"

# 为用户分配角色
echo "👤 为用户分配角色..."

# admin用户 -> 所有角色
admin_roles=("admin" "project_manager" "developer" "viewer")

for role in "${admin_roles[@]}"; do
  curl -s -X POST "$API_BASE/casbin/roles" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"user_id\": \"d1r2mtorvcubnqo3s2vg\",
      \"role\": \"$role\"
    }" > /dev/null
  echo "  ✓ admin用户 -> $role角色"
done

# dev1用户 -> developer角色 (核电站项目)
curl -s -X POST "$API_BASE/casbin/roles" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "d1qc188rvcu6e2k3b9d0",
    "role": "developer"
  }' > /dev/null
echo "  ✓ dev1用户 -> developer角色"

# viewer用户 -> viewer角色 (核电站项目)
curl -s -X POST "$API_BASE/casbin/roles" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "d1qc188rvcu6e2k3b9dg",
    "role": "viewer"
  }' > /dev/null
echo "  ✓ viewer用户 -> viewer角色"

echo "✅ 用户角色分配完成"

# 验证权限设置
echo "🔍 验证权限设置..."

# 检查admin用户的系统管理权限
admin_check=$(curl -s -X POST "$API_BASE/casbin/policies/check" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "d1qc188rvcu6e2k3b9c0",
    "object": "system",
    "action": "edit"
  }' | jq -r '.data.allowed')

# 检查dev1用户的项目包编辑权限
dev1_check=$(curl -s -X POST "$API_BASE/casbin/policies/check" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"user_id\": \"d1qc188rvcu6e2k3b9d0\",
    \"object\": \"project:$PROJECT_ID:package\",
    \"action\": \"edit\"
  }" | jq -r '.data.allowed')

# 检查viewer用户的项目包查看权限
viewer_check=$(curl -s -X POST "$API_BASE/casbin/policies/check" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"user_id\": \"d1qc188rvcu6e2k3b9dg\",
    \"object\": \"project:$PROJECT_ID:package\",
    \"action\": \"view\"
  }" | jq -r '.data.allowed')

# 检查dev1用户是否没有系统管理权限（应该为false）
dev1_system_check=$(curl -s -X POST "$API_BASE/casbin/policies/check" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "d1qc188rvcu6e2k3b9d0",
    "object": "system",
    "action": "edit"
  }' | jq -r '.data.allowed')

echo "  ✓ admin系统管理权限: $admin_check"
echo "  ✓ dev1项目包编辑权限: $dev1_check"
echo "  ✓ viewer项目包查看权限: $viewer_check"
echo "  ✓ dev1系统管理权限: $dev1_system_check (应该为false)"

# 重新加载权限
echo "🔄 重新加载权限..."
curl -s -X POST "$API_BASE/casbin/reload" \
  -H "Authorization: Bearer $TOKEN" > /dev/null

echo ""
echo "🎉 简化权限体系初始化完成！"
echo ""
echo "📋 权限分配总结："
echo "  • admin用户: 拥有所有角色权限 (admin + project_manager + developer + viewer)"
echo "  • dev1用户: 核电站项目的编辑权限（包含查看、创建、修改、删除）"
echo "  • viewer用户: 核电站项目的查看权限（只读）"
echo ""
echo "📱 侧边栏显示逻辑："
echo "  • admin: 拥有所有角色，显示所有菜单项（超级管理员权限）"
echo "  • dev1: 显示仪表板、项目、包管理"
echo "  • viewer: 显示仪表板、项目、包管理（只读）"
echo ""
echo "🔍 可以使用以下命令验证："
echo "  curl -X GET '$API_BASE/casbin/roles' -H 'Authorization: Bearer $TOKEN'"
echo "  curl -X GET '$API_BASE/casbin/policies' -H 'Authorization: Bearer $TOKEN'" 