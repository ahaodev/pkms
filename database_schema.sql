-- PKMS (Package Management System) SQLite Database Schema
-- 适用于 Go 后端 + SQLite 数据库

-- 1. 用户表
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- 存储加密后的密码
    avatar VARCHAR(255),
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'user')),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT 1
);

-- 2. 项目表
CREATE TABLE projects (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    package_count INTEGER NOT NULL DEFAULT 0,
    created_by VARCHAR(50) NOT NULL,
    is_public BOOLEAN NOT NULL DEFAULT 0,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. 组表
CREATE TABLE groups (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(20),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    member_count INTEGER NOT NULL DEFAULT 0,
    created_by VARCHAR(50) NOT NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. 包表
CREATE TABLE packages (
    id VARCHAR(50) PRIMARY KEY,
    project_id VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('android', 'web', 'desktop', 'linux', 'other')),
    version VARCHAR(50) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    checksum VARCHAR(255) NOT NULL,
    changelog TEXT,
    is_latest BOOLEAN NOT NULL DEFAULT 0,
    download_count INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version_code INTEGER NOT NULL,
    min_sdk_version INTEGER,
    target_sdk_version INTEGER,
    share_token VARCHAR(255) NOT NULL UNIQUE,
    share_expiry DATETIME,
    is_public BOOLEAN NOT NULL DEFAULT 0,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- 5. 用户项目分配表 (多对多关系)
CREATE TABLE user_project_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id VARCHAR(50) NOT NULL,
    project_id VARCHAR(50) NOT NULL,
    assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    assigned_by VARCHAR(50) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, project_id)
);

-- 6. 组成员表 (用户和组的多对多关系)
CREATE TABLE group_memberships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id VARCHAR(50) NOT NULL,
    group_id VARCHAR(50) NOT NULL,
    joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    added_by VARCHAR(50) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, group_id)
);

-- 7. 组权限表 (组对项目的权限)
CREATE TABLE group_permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id VARCHAR(50) NOT NULL,
    project_id VARCHAR(50) NOT NULL,
    can_view BOOLEAN NOT NULL DEFAULT 0,
    can_edit BOOLEAN NOT NULL DEFAULT 0,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    UNIQUE(group_id, project_id)
);

-- 8. 用户项目权限表 (直接的用户项目权限，补充组权限)
CREATE TABLE project_permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id VARCHAR(50) NOT NULL,
    project_id VARCHAR(50) NOT NULL,
    can_view BOOLEAN NOT NULL DEFAULT 0,
    can_edit BOOLEAN NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    UNIQUE(user_id, project_id)
);

-- 创建索引提高查询性能
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_projects_is_public ON projects(is_public);

CREATE INDEX idx_groups_created_by ON groups(created_by);

CREATE INDEX idx_packages_project_id ON packages(project_id);
CREATE INDEX idx_packages_type ON packages(type);
CREATE INDEX idx_packages_is_latest ON packages(is_latest);
CREATE INDEX idx_packages_share_token ON packages(share_token);
CREATE INDEX idx_packages_created_at ON packages(created_at);

CREATE INDEX idx_user_project_assignments_user_id ON user_project_assignments(user_id);
CREATE INDEX idx_user_project_assignments_project_id ON user_project_assignments(project_id);

CREATE INDEX idx_group_memberships_user_id ON group_memberships(user_id);
CREATE INDEX idx_group_memberships_group_id ON group_memberships(group_id);

CREATE INDEX idx_group_permissions_group_id ON group_permissions(group_id);
CREATE INDEX idx_group_permissions_project_id ON group_permissions(project_id);

CREATE INDEX idx_project_permissions_user_id ON project_permissions(user_id);
CREATE INDEX idx_project_permissions_project_id ON project_permissions(project_id);

-- 触发器：自动更新 updated_at 字段
CREATE TRIGGER update_users_updated_at 
    AFTER UPDATE ON users 
    FOR EACH ROW 
    WHEN NEW.updated_at = OLD.updated_at
BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_projects_updated_at 
    AFTER UPDATE ON projects 
    FOR EACH ROW 
    WHEN NEW.updated_at = OLD.updated_at
BEGIN
    UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_groups_updated_at 
    AFTER UPDATE ON groups 
    FOR EACH ROW 
    WHEN NEW.updated_at = OLD.updated_at
BEGIN
    UPDATE groups SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_packages_updated_at 
    AFTER UPDATE ON packages 
    FOR EACH ROW 
    WHEN NEW.updated_at = OLD.updated_at
BEGIN
    UPDATE packages SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- 触发器：自动维护项目包数量
CREATE TRIGGER update_project_package_count_insert
    AFTER INSERT ON packages
    FOR EACH ROW
BEGIN
    UPDATE projects 
    SET package_count = package_count + 1 
    WHERE id = NEW.project_id;
END;

CREATE TRIGGER update_project_package_count_delete
    AFTER DELETE ON packages
    FOR EACH ROW
BEGIN
    UPDATE projects 
    SET package_count = package_count - 1 
    WHERE id = OLD.project_id;
END;

-- 触发器：自动维护组成员数量
CREATE TRIGGER update_group_member_count_insert
    AFTER INSERT ON group_memberships
    FOR EACH ROW
BEGIN
    UPDATE groups 
    SET member_count = member_count + 1 
    WHERE id = NEW.group_id;
END;

CREATE TRIGGER update_group_member_count_delete
    AFTER DELETE ON group_memberships
    FOR EACH ROW
BEGIN
    UPDATE groups 
    SET member_count = member_count - 1 
    WHERE id = OLD.group_id;
END;
