# 租户管理功能完善指南
- 仅admin系统管理员可以访问租户管理功能
- 租户管理功能可以创建、编辑、删除租户
- 建立用户会默认创建一个租户,默认创建得租户名称为用户的用户名,用户在租户下有写得权限(PM权限)
- 租户下面可以有多个用户
- 租户下面可以有多个项目,项目下有包,包下有多个版本
- 租户下面得用户对项目有两种校色,可读(reader),可写(PM)
- 可读角色仅仅可以访问,不可修改和删除
- 可写角色可以访问,可以修改和删除

## 目录结构
- config/rabc_models.go 定义了RBAC-domains模型(domain 代表租户)
- [jwt_auth_middleware.go](../api/middleware/jwt_auth_middleware.go) 定义了casbin权限校验得中间件
- ent/schema/tenant.go定义了数据库表结构
- api/controller/user_controller.go 定义了接入点(也可以单独定义tenant_controller.go)
- usecase/tenant_usecase.go 定义了业务逻辑
- repository/tenant_repository.go 定义了数据访问接口
- api/user_route.go 定义了路由(group是之前的概念,现在是tenant)
- domain/tenant.go 定义了交互的实体
- domain/user.go 定义了用户实体
- frontend/src/pages/tenant.tsx 定义了前端页面


## 要求
请根据当前go-backend-clean-architecture,
1.完善租户管理功能