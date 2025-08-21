//go:build !production
// +build !production

package main

import (
	_ "pkms/docs" // 仅在开发环境导入Swagger文档
)
