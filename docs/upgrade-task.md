基于 go-backend-clean-architecture项目的分层思想，帮我实现“软件包更新管理”模块，具体需求如下：

1. 业务背景：

- 每个项目有多个软件包，每个包有多个版本。
- 我需要有“更新管理”功能，可以选择项目、包、版本，作为设备的更新目标。

2. 请分层输出每一层的设计和主要代码：

- 在 domain 层 domain/upgrade.go 定义等核心数据结构和交互接口。
- 在 usecase 层实现主要的业务逻辑，例如：创建/查询更新任务、设置设备的升级目标、校验升级条件等。
- 在 repository 层设计与 ent 交互的接口和实现，比如保存和查询升级记录等。
- 在 controller 层实现/api/controller/upgrade_controller.go，包括路由注册、参数校验、调用 usecase 层、错误处理等。

3. 要求：

- 每一层都按 go-backend-clean-architecture 风格输出接口定义和主要方法代码。
- 在ent 目录下新增 ent/schema/upgrade.go 定义升级相关的实体。
- 前端/frontend/src/pages/upgrade.tsx 对接后端 API，展示升级任务列表、创建新任务等。

