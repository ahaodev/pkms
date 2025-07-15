#!/bin/bash

# 简单的权限测试脚本
API_BASE="http://localhost:8080/api/v1"

echo "==== 测试PKMS权限系统 ===="

# 测试登录
echo "1. 测试登录..."
curl -s -X POST "$API_BASE/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "123"}' | head -c 200

echo ""
echo ""

# 测试获取所有策略（不带认证）
echo "2. 测试获取策略（无认证）..."
curl -s -X GET "$API_BASE/casbin/policies" | head -c 200

echo ""
echo ""

# 测试casbin初始化（不带认证）
echo "3. 测试casbin初始化（无认证）..."
curl -s -X POST "$API_BASE/casbin/initialize" | head -c 200

echo ""
echo ""

echo "==== 权限系统测试完成 ====" 