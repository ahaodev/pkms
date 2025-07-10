-- 添加 email 列到 users 表
ALTER TABLE users ADD COLUMN email VARCHAR(255);

-- 为现有用户设置默认 email（避免 NOT NULL 约束失败）
UPDATE users SET email = username || '@example.com' WHERE email IS NULL;

-- 添加 NOT NULL 约束和唯一索引
-- SQLite 不支持直接修改列约束，需要重建表
BEGIN TRANSACTION;

-- 创建新表
CREATE TABLE users_new (
                           id VARCHAR(50) PRIMARY KEY,
                           username VARCHAR(100) NOT NULL UNIQUE,
                           email VARCHAR(255) NOT NULL UNIQUE,
                           password_hash VARCHAR(255) NOT NULL,
                           avatar VARCHAR(255),
                           role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'user')),
                           created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                           updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                           is_active BOOLEAN NOT NULL DEFAULT 1
);

-- 复制数据
INSERT INTO users_new (id, username, email, password_hash, avatar, role, created_at, updated_at, is_active)
SELECT id, username,
       CASE
           WHEN email IS NULL OR email = '' THEN username || '@example.com'
           ELSE email
           END as email,
       password_hash, avatar, role, created_at, updated_at, is_active
FROM users;

-- 删除旧表
DROP TABLE users;

-- 重命名新表
ALTER TABLE users_new RENAME TO users;

-- 重新创建索引
CREATE INDEX user_username ON users(username);
CREATE INDEX user_role ON users(role);
CREATE INDEX user_is_active ON users(is_active);

COMMIT;