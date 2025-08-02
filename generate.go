package pkms

// 生成 ent
//go:generate go run -mod=mod entgo.io/ent/cmd/ent generate ./ent/schema

// 生成 swagger 文档
//go:generate swag init -g cmd/main.go -o docs
