ENT

Ent 是一个用于 Go 的实体框架，旨在简化数据库操作和数据模型的管理。
它提供了一个类型安全的方式来定义和操作数据模型，并支持多种数据库后端。
第一个版本迭代中,使用SQLite作为默认数据库。
https://github.com/ent/ent/blob/master/README_zh.md


## ent.Schema 导出到sql文件

```shell

# 安装 atlas
go install -tags 'sqlite' ariga.io/atlas/cmd/atlas@latest

# 导出 ent.Schema 当前对应数据库对应schema到 sql 文件
atlas schema inspect -u "sqlite://data.db" > schema.sql

# 比较两个 schema 的差异
atlas schema diff --from "sqlite://old.db" --to "sqlite://new.db"

# 应用 schema 变更
atlas schema apply -u "sqlite://database.db" --to file://target_schema.sql
```

