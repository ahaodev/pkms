基于 go-backend-clean-architecture项目的分层思想，帮我实现“发布包-文件分享”模块，具体需求如下：

1. 业务背景：

- 每个项目有多个软件包，每个包有多个版本,每个版本都有相对应的一个发布文件。
- 发布的版本可以删除,分享发布版本中的文件
- 分享的文件可以被其他用户下载
- 分享会在数据库生成一条记录,这条记录包含分享的文件信息,过期时间

2. 请分层输出每一层的设计和主要代码：
- 在 ent/schema 已有 ent/schema/share.go 定义分享相关的实体。
- 在 domain 层 domain/upgrade.go 定义等核心数据结构和交互接口。
- 在 usecase 层实现主要的业务逻辑，例如：创建/查询更新任务、设置设备的升级目标、校验升级条件等。
- 在 repository 层设计与 ent 交互的接口和实现，比如保存和查询升级记录等。
- 在 controller 层实现/api/controller/upgrade_controller.go，包括路由注册、参数校验、调用 usecase 层、错误处理等。

3. 要求：

- 每一层都按 go-backend-clean-architecture 风格输出接口定义和主要方法代码。
- 在ent 目录下新增 ent/schema/upgrade.go 定义升级相关的实体。
- 前端/frontend/src/pages/upgrade.tsx 对接后端 API，展示升级任务列表、创建新任务等。

