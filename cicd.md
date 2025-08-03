# PKMS Go CLI for Drone CI/CD 构思

## 概述

基于 `client_access_controller.go` 的 `Release` 方法，开发一个 Go CLI 工具，用于在 Drone CI/CD 流水线中自动发布制品到 PKMS
系统。

## CLI 工具设计

### 工具名称

`pkms-cli`

### 核心功能

#### 1. 发布制品 (Release)

```bash
pkms-cli release --token <access-token> --file <artifact-file> --version <version> [options]
```

**参数说明:**

- `--token, -t`: 客户端接入令牌 (x-access-token)
- `--file, -f`: 要上传的制品文件路径
- `--version, -v`: 版本号 (必填)
- `--artifact, -a`: 制品名称 (可选)
- `--os`: 操作系统 (可选)
- `--arch`: 架构 (可选)
- `--changelog, -c`: 版本更新日志 (可选)
- `--server, -s`: PKMS 服务器地址 (默认从环境变量读取)

**示例:**

```bash
# 基本发布
pkms-cli release --token abc123 --file ./dist/app.tar.gz --version v1.0.0

# 完整参数发布
pkms-cli release \
  --token abc123 \
  --file ./dist/app-linux-amd64.tar.gz \
  --version v1.0.0 \
  --artifact app \
  --os linux \
  --arch amd64 \
  --changelog "修复登录问题，增加新功能" \
  --server https://pkms.example.com
```

#### 2. 检查更新 (Check Update)

```bash
pkms-cli check-update --token <access-token> --current-version <version> [options]
```

**参数说明:**

- `--token, -t`: 客户端接入令牌
- `--current-version`: 当前版本号
- `--platform`: 平台信息 (可选)

### CLI 结构设计

```
pkms-cli/
├── cmd/
│   ├── root.go          # 根命令
│   ├── release.go       # 发布命令
│   ├── check.go         # 检查更新命令
│   └── download.go      # 下载命令
├── pkg/
│   ├── client/
│   │   └── client.go    # HTTP 客户端
│   ├── config/
│   │   └── config.go    # 配置管理
│   └── utils/
│       └── file.go      # 文件处理工具
├── internal/
│   ├── api/
│   │   ├── release.go   # 发布 API 调用
│   │   ├── check.go     # 检查更新 API 调用
│   │   └── download.go  # 下载 API 调用
│   └── models/
│       └── request.go   # 请求模型
├── main.go
├── go.mod
└── README.md
```

### API 接口映射

基于 `client_access_controller.go`，CLI 调用以下 API：

1. **发布制品**: `POST /client-access/release`
    - 头部: `x-access-token`
    - 表单: `file`, `version`, `artifact`, `os`, `arch`, `changelog`

## Drone CI/CD 集成

### Pipeline 配置示例

#### .drone.yml 发布配置

```yaml
kind: pipeline
type: docker
name: build-and-release

steps:
  - name: build
    image: golang:1.21
    commands:
      - go build -o dist/myapp ./cmd/main.go
      - tar -czf dist/myapp-linux-amd64.tar.gz -C dist myapp

  - name: release-to-pkms
    image: alpine:latest
    environment:
      PKMS_TOKEN:
        from_secret: pkms_access_token
      PKMS_SERVER:
        from_secret: pkms_server_url
    commands:
      # 下载 pkms-cli
      - wget -O /tmp/pkms-cli https://github.com/your-org/pkms-cli/releases/latest/download/pkms-cli-linux-amd64
      - chmod +x /tmp/pkms-cli
      # 发布制品
      - /tmp/pkms-cli release
        --token $PKMS_TOKEN
        --server $PKMS_SERVER
        --file dist/myapp-linux-amd64.tar.gz
        --version ${DRONE_TAG:-${DRONE_COMMIT:0:8}}
        --artifact myapp
        --os linux
        --arch amd64
        --changelog "Build:
          ${DRONE_BUILD_NUMBER}, Commit: ${DRONE_COMMIT_MESSAGE}"
    when:
      event:
        - tag
        - push
      branch:
        - main
        - release/*

trigger:
  branch:
    - main
    - release/*
  event:
    - push
    - tag
```

#### GoReleaser 集成

```yaml
# .goreleaser.yaml
version: 2

builds:
  - id: myapp
    binary: myapp
    env:
      - CGO_ENABLED=0
    goos:
      - linux
      - windows
      - darwin
    goarch:
      - amd64
      - arm64

archives:
  - id: default
    builds:
      - myapp
    format: tar.gz
    format_overrides:
      - goos: windows
        format: zip

release:
  disable: true  # 禁用 GitHub Release

# 自定义发布钩子
after:
  hooks:
    - cmd: |
        for artifact in dist/*.tar.gz dist/*.zip; do
          if [ -f "$artifact" ]; then
            pkms-cli release \
              --token $PKMS_TOKEN \
              --server $PKMS_SERVER \
              --file "$artifact" \
              --version {{ .Tag }} \
              --artifact {{ .ProjectName }} \
              --changelog "{{ .Changelog }}"
          fi
        done
      env:
        - PKMS_TOKEN={{ .Env.PKMS_TOKEN }}
        - PKMS_SERVER={{ .Env.PKMS_SERVER }}
```

### Drone Secret 配置

在 Drone 中配置以下 Secret：

```bash
# PKMS 访问令牌
drone secret add --repository your-org/your-repo --name pkms_access_token --data "your-access-token"

# PKMS 服务器地址
drone secret add --repository your-org/your-repo --name pkms_server_url --data "https://pkms.example.com"
```

## 实现细节

### 1. HTTP 客户端实现

```go
type Client struct {
baseURL    string
httpClient *http.Client
token      string
}

func (c *Client) Release(req *ReleaseRequest) (*ReleaseResponse, error) {
// 构建 multipart form 请求
// 设置 x-access-token 头部
// 发送文件和参数
}
```

### 2. 配置管理

- 支持环境变量 `PKMS_SERVER`, `PKMS_TOKEN`
- 支持配置文件 `~/.pkms-cli.yaml`
- 命令行参数优先级最高

### 3. 错误处理

- 网络错误重试机制
- 详细的错误信息输出
- 非零退出码用于 CI/CD 失败检测

### 4. 日志输出

- 支持不同级别的日志输出
- JSON 格式输出用于机器解析
- 进度条显示文件上传进度

## 安装与分发

### 1. 二进制分发

- 使用 GoReleaser 构建多平台二进制
- 发布到 GitHub Releases
- 提供安装脚本

### 2. Docker 镜像

```dockerfile
FROM alpine:latest
RUN apk add --no-cache ca-certificates
COPY pkms-cli /usr/local/bin/
ENTRYPOINT ["pkms-cli"]
```

### 3. 安装脚本

```bash
#!/bin/bash
# install.sh
curl -L https://github.com/your-org/pkms-cli/releases/latest/download/pkms-cli-$(uname -s)-$(uname -m) \
  -o /usr/local/bin/pkms-cli
chmod +x /usr/local/bin/pkms-cli
```

## 使用场景

### 1. 持续集成发布

- 每次代码提交自动构建并发布到 PKMS
- 支持多环境发布（开发、测试、生产）

### 2. 版本管理

- 自动化版本号管理
- 变更日志自动生成

### 3. 制品分发

- 统一的制品仓库管理
- 支持多平台制品分发

### 4. 权限控制

- 基于 access token 的安全认证
- 项目级别的访问控制

## 简化方案: 直接使用 curl

实际上，基于现有的 `/client-access/release` API，可以直接使用 curl 命令进行发布，无需开发专门的 CLI 工具。

### curl 发布示例

#### 基本发布命令

```bash
curl -X POST \
  -H "x-access-token: your-access-token" \
  -F "file=@./dist/app.tar.gz" \
  -F "version=v1.0.0" \
  https://pkms.example.com/client-access/release
```

### 移动端特殊考虑

包含更多移动端信息的发布

```bash 
curl -X POST \
-H "x-access-token: $PKMS_TOKEN" \
-F "file=@app-release.apk" \
-F "version=v2.1.0" \
-F "artifact=MyApp" \
-F "os=android" \
-F "arch=arm64-v8a" \
-F "changelog=新功能：支持暗黑模式\n修复：解决在 Android 12 上的兼容性问题\n优化：减少 30% 内存占用" \
$PKMS_SERVER/client-access/release
```

#### 完整参数发布

```bash
curl -X POST \
  -H "x-access-token: PKMS-SzZcndLRrE3yrpA4" \
  -F "file=@./data.db" \
  -F "version=v1.0.0" \
  -F "artifact=myapp" \
  -F "os=linux" \
  -F "arch=amd64" \
  -F "changelog=修复登录问题，增加新功能" \
  https://pkms.example.com/client-access/release
```

### 简化的 Drone Pipeline

#### .drone.yml 配置 (使用 curl)

```yaml
kind: pipeline
type: docker
name: build-and-release

steps:
  - name: build
    image: golang:1.21
    commands:
      - go build -o dist/myapp ./cmd/main.go
      - tar -czf dist/myapp-linux-amd64.tar.gz -C dist myapp

  - name: release-to-pkms
    image: curlimages/curl:latest
    environment:
      PKMS_TOKEN:
        from_secret: pkms_access_token
      PKMS_SERVER:
        from_secret: pkms_server_url
    commands:
      - |
        curl -X POST \
          -H "x-access-token: $PKMS_TOKEN" \
          -F "file=@dist/myapp-linux-amd64.tar.gz" \
          -F "version=${DRONE_TAG:-v0.0.0-${DRONE_COMMIT:0:8}}" \
          -F "artifact=myapp" \
          -F "os=linux" \
          -F "arch=amd64" \
          -F "changelog=Build: ${DRONE_BUILD_NUMBER}, Commit: ${DRONE_COMMIT_MESSAGE}" \
          $PKMS_SERVER/client-access/release
    when:
      event:
        - tag
        - push
      branch:
        - main

trigger:
  branch:
    - main
  event:
    - push
    - tag
```

#### 多制品发布脚本

```bash
#!/bin/bash
# release-artifacts.sh

set -e

PKMS_TOKEN=${PKMS_TOKEN}
PKMS_SERVER=${PKMS_SERVER}
VERSION=${VERSION:-"v0.0.0"}
CHANGELOG=${CHANGELOG:-"Automated release"}

# 发布函数
upload_artifact() {
    local file=$1
    local os=$2
    local arch=$3
    local artifact_name=$(basename "$file" | sed 's/\.[^.]*$//')
    
    echo "Uploading $file..."
    
    response=$(curl -s -w "%{http_code}" -X POST \
        -H "x-access-token: $PKMS_TOKEN" \
        -F "file=@$file" \
        -F "version=$VERSION" \
        -F "artifact=$artifact_name" \
        -F "os=$os" \
        -F "arch=$arch" \
        -F "changelog=$CHANGELOG" \
        "$PKMS_SERVER/client-access/release")
    
    http_code="${response: -3}"
    response_body="${response%???}"
    
    if [ "$http_code" -eq 201 ]; then
        echo "✅ Successfully uploaded $file"
        echo "   Response: $response_body"
    else
        echo "❌ Failed to upload $file (HTTP $http_code)"
        echo "   Response: $response_body"
        exit 1
    fi
}

# 批量上传 dist 目录下的所有制品
for file in dist/*.tar.gz dist/*.zip; do
    if [ -f "$file" ]; then
        # 从文件名解析 OS 和 ARCH
        basename=$(basename "$file")
        if [[ $basename =~ linux ]]; then
            os="linux"
        elif [[ $basename =~ windows ]]; then
            os="windows"
        elif [[ $basename =~ darwin ]]; then
            os="darwin"
        else
            os="unknown"
        fi
        
        if [[ $basename =~ amd64 ]]; then
            arch="amd64"
        elif [[ $basename =~ arm64 ]]; then
            arch="arm64"
        else
            arch="unknown"
        fi
        
        upload_artifact "$file" "$os" "$arch"
    fi
done

echo "🎉 All artifacts uploaded successfully!"
```

#### 使用脚本的 Drone 配置

```yaml
kind: pipeline
type: docker
name: build-and-release

steps:
  - name: build
    image: golang:1.21
    commands:
      - go build -o dist/myapp-linux-amd64 ./cmd/main.go
      - go build -o dist/myapp-windows-amd64.exe ./cmd/main.go
      - tar -czf dist/myapp-linux-amd64.tar.gz -C dist myapp-linux-amd64
      - zip dist/myapp-windows-amd64.zip dist/myapp-windows-amd64.exe

  - name: release-to-pkms
    image: curlimages/curl:latest
    environment:
      PKMS_TOKEN:
        from_secret: pkms_access_token
      PKMS_SERVER:
        from_secret: pkms_server_url
      VERSION: ${DRONE_TAG:-v0.0.0-${DRONE_COMMIT:0:8}}
      CHANGELOG: "Build: ${DRONE_BUILD_NUMBER}, Commit: ${DRONE_COMMIT_MESSAGE}"
    commands:
      - chmod +x release-artifacts.sh
      - ./release-artifacts.sh
```

### curl 方案的优势

1. **零依赖**: 几乎所有 CI/CD 环境都预装了 curl
2. **简单直接**: 一条命令完成发布，无需额外工具
3. **易于调试**: curl 输出详细，便于排查问题
4. **轻量级**: 无需下载和安装额外的二进制文件
5. **灵活性**: 易于在 shell 脚本中进行条件判断和循环处理

### 错误处理增强

```bash
# 带错误处理的 curl 命令
upload_with_retry() {
    local file=$1
    local max_retries=3
    local retry_count=0
    
    while [ $retry_count -lt $max_retries ]; do
        echo "Attempting upload (try $((retry_count + 1))/$max_retries)..."
        
        response=$(curl -s -w "%{http_code}" --max-time 300 -X POST \
            -H "x-access-token: $PKMS_TOKEN" \
            -F "file=@$file" \
            -F "version=$VERSION" \
            -F "artifact=$ARTIFACT_NAME" \
            -F "os=$OS" \
            -F "arch=$ARCH" \
            -F "changelog=$CHANGELOG" \
            "$PKMS_SERVER/client-access/release")
        
        http_code="${response: -3}"
        
        if [ "$http_code" -eq 201 ]; then
            echo "✅ Upload successful!"
            return 0
        else
            echo "⚠️  Upload failed with HTTP $http_code"
            retry_count=$((retry_count + 1))
            if [ $retry_count -lt $max_retries ]; then
                echo "Retrying in 5 seconds..."
                sleep 5
            fi
        fi
    done
    
    echo "❌ Upload failed after $max_retries attempts"
    return 1
}
```

## 总结

虽然专门的 Go CLI 工具能提供更好的用户体验和功能扩展性，但对于大多数 CI/CD 场景，**直接使用 curl** 是更简单、更直接的解决方案：

### curl 方案适用于:

- 简单的制品发布需求
- 已有完善的构建脚本
- 希望减少依赖的团队
- 快速原型和验证

### CLI 工具适用于:

- 复杂的发布流程
- 需要丰富的配置选项
- 希望统一工具链的团队
- 频繁的本地发布操作

**推荐**: 先使用 curl 方案快速上手，如果后续有更复杂的需求，再考虑开发专门的 CLI 工具。

## Changelog 自动归纳方案

在 CI/CD 中自动生成 changelog 是提升发布效率的关键。以下提供多种自动归纳 changelog 的方法：

### 1. 基于 Git Commit 的自动归纳

#### 简单的 Git Log 方式
```bash
#!/bin/bash
# generate-changelog.sh

# 获取自上次标签以来的提交
get_changelog_since_last_tag() {
    local last_tag=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
    
    if [ -z "$last_tag" ]; then
        # 如果没有标签，获取最近 10 条提交
        changelog=$(git log --oneline -10 --pretty=format="• %s")
    else
        # 获取自上次标签以来的提交
        changelog=$(git log ${last_tag}..HEAD --oneline --pretty=format="• %s")
    fi
    
    if [ -z "$changelog" ]; then
        changelog="• 首次发布"
    fi
    
    echo "$changelog"
}

# 使用示例
CHANGELOG=$(get_changelog_since_last_tag)
echo "Generated changelog:"
echo "$CHANGELOG"
```

#### 高级的 Git Log 归纳（按类型分类）
```bash
#!/bin/bash
# advanced-changelog.sh

generate_advanced_changelog() {
    local last_tag=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
    local commit_range=""
    
    if [ -z "$last_tag" ]; then
        commit_range="HEAD~10..HEAD"  # 最近 10 条提交
    else
        commit_range="${last_tag}..HEAD"
    fi
    
    # 获取提交信息
    local commits=$(git log $commit_range --pretty=format:"%s")
    
    # 初始化分类
    local features=""
    local fixes=""
    local improvements=""
    local others=""
    
    # 按类型分类提交
    while IFS= read -r commit; do
        case "$commit" in
            feat:*|feature:*|新功能:*|添加:*)
                features="${features}• ${commit#*:}\n"
                ;;
            fix:*|修复:*|bugfix:*)
                fixes="${fixes}• ${commit#*:}\n"
                ;;
            improve:*|优化:*|perf:*|性能:*)
                improvements="${improvements}• ${commit#*:}\n"
                ;;
            *)
                others="${others}• ${commit}\n"
                ;;
        esac
    done <<< "$commits"
    
    # 构建 changelog
    local changelog=""
    
    if [ -n "$features" ]; then
        changelog="${changelog}🚀 新功能:\n${features}\n"
    fi
    
    if [ -n "$fixes" ]; then
        changelog="${changelog}🐛 修复:\n${fixes}\n"
    fi
    
    if [ -n "$improvements" ]; then
        changelog="${changelog}⚡ 优化:\n${improvements}\n"
    fi
    
    if [ -n "$others" ]; then
        changelog="${changelog}📝 其他:\n${others}\n"
    fi
    
    if [ -z "$changelog" ]; then
        changelog="• 首次发布或无重要更新"
    fi
    
    echo -e "$changelog"
}

# 使用示例
CHANGELOG=$(generate_advanced_changelog)
echo "Advanced changelog:"
echo -e "$CHANGELOG"
```

### 2. 基于 Conventional Commits 的自动归纳

#### 标准化提交格式解析
```bash
#!/bin/bash
# conventional-changelog.sh

generate_conventional_changelog() {
    local last_tag=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
    local commit_range=""
    
    if [ -z "$last_tag" ]; then
        commit_range="HEAD~10..HEAD"
    else
        commit_range="${last_tag}..HEAD"
    fi
    
    # 提取不同类型的提交
    local breaking_changes=$(git log $commit_range --grep="BREAKING CHANGE" --pretty=format:"• %s" || echo "")
    local features=$(git log $commit_range --grep="^feat" --pretty=format:"• %s" | sed 's/^• feat[:(]/• /' || echo "")
    local fixes=$(git log $commit_range --grep="^fix" --pretty=format:"• %s" | sed 's/^• fix[:(]/• /' || echo "")
    local docs=$(git log $commit_range --grep="^docs" --pretty=format:"• %s" | sed 's/^• docs[:(]/• /' || echo "")
    local perf=$(git log $commit_range --grep="^perf" --pretty=format:"• %s" | sed 's/^• perf[:(]/• /' || echo "")
    local refactor=$(git log $commit_range --grep="^refactor" --pretty=format:"• %s" | sed 's/^• refactor[:(]/• /' || echo "")
    
    # 构建 changelog
    local changelog=""
    
    if [ -n "$breaking_changes" ]; then
        changelog="${changelog}💥 破坏性变更:\n${breaking_changes}\n\n"
    fi
    
    if [ -n "$features" ]; then
        changelog="${changelog}✨ 新功能:\n${features}\n\n"
    fi
    
    if [ -n "$fixes" ]; then
        changelog="${changelog}🐛 问题修复:\n${fixes}\n\n"
    fi
    
    if [ -n "$perf" ]; then
        changelog="${changelog}⚡ 性能优化:\n${perf}\n\n"
    fi
    
    if [ -n "$refactor" ]; then
        changelog="${changelog}♻️ 代码重构:\n${refactor}\n\n"
    fi
    
    if [ -n "$docs" ]; then
        changelog="${changelog}📚 文档更新:\n${docs}\n\n"
    fi
    
    # 移除末尾的空行
    changelog=$(echo -e "$changelog" | sed 's/[[:space:]]*$//')
    
    if [ -z "$changelog" ]; then
        changelog="• 版本更新"
    fi
    
    echo -e "$changelog"
}
```

### 3. 集成到 Drone CI/CD Pipeline

#### 完整的 Drone Pipeline 配置
```yaml
kind: pipeline
type: docker
name: build-and-release-with-changelog

steps:
  - name: build
    image: golang:1.21
    commands:
      - go build -o dist/myapp ./cmd/main.go
      - tar -czf dist/myapp-linux-amd64.tar.gz -C dist myapp

  - name: generate-changelog
    image: alpine/git:latest
    commands:
      # 创建 changelog 生成脚本
      - |
        cat > generate-changelog.sh << 'EOF'
        #!/bin/sh
        get_changelog() {
            last_tag=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
            
            if [ -z "$last_tag" ]; then
                commit_range="HEAD~5..HEAD"
            else
                commit_range="${last_tag}..HEAD"
            fi
            
            # 获取提交并分类
            features=""
            fixes=""
            others=""
            
            git log $commit_range --pretty=format:"%s" | while read commit; do
                case "$commit" in
                    feat:*|feature:*|新功能:*|添加:*)
                        echo "🚀 ${commit#*:}" >> /tmp/features.txt
                        ;;
                    fix:*|修复:*|bugfix:*)
                        echo "🐛 ${commit#*:}" >> /tmp/fixes.txt
                        ;;
                    *)
                        echo "📝 $commit" >> /tmp/others.txt
                        ;;
                esac
            done
            
            changelog=""
            
            if [ -f /tmp/features.txt ]; then
                changelog="${changelog}$(cat /tmp/features.txt | tr '\n' '\n')"
                changelog="${changelog}\n"
            fi
            
            if [ -f /tmp/fixes.txt ]; then
                changelog="${changelog}$(cat /tmp/fixes.txt | tr '\n' '\n')"
                changelog="${changelog}\n"
            fi
            
            if [ -f /tmp/others.txt ]; then
                changelog="${changelog}$(cat /tmp/others.txt | tr '\n' '\n')"
            fi
            
            if [ -z "$changelog" ]; then
                changelog="📦 版本更新"
            fi
            
            echo -e "$changelog"
        }
        
        get_changelog
        EOF
      - chmod +x generate-changelog.sh
      - ./generate-changelog.sh > changelog.txt
      - echo "Generated changelog:"
      - cat changelog.txt

  - name: release-to-pkms
    image: curlimages/curl:latest
    environment:
      PKMS_TOKEN:
        from_secret: pkms_access_token
      PKMS_SERVER:
        from_secret: pkms_server_url
    commands:
      # 读取生成的 changelog
      - CHANGELOG=$(cat changelog.txt | tr '\n' '\\n')
      - echo "Using changelog: $CHANGELOG"
      # 发布制品
      - |
        curl -X POST \
          -H "x-access-token: $PKMS_TOKEN" \
          -F "file=@dist/myapp-linux-amd64.tar.gz" \
          -F "version=${DRONE_TAG:-v0.0.0-${DRONE_COMMIT:0:8}}" \
          -F "artifact=myapp" \
          -F "os=linux" \
          -F "arch=amd64" \
          -F "changelog=$CHANGELOG" \
          $PKMS_SERVER/client-access/release
    depends_on:
      - build
      - generate-changelog
```

### 4. 使用现有工具自动生成

#### 使用 git-cliff 工具
```yaml
# Drone 中使用 git-cliff
- name: generate-changelog-with-cliff
  image: orhunp/git-cliff:latest
  commands:
    # 生成自上次标签以来的 changelog
    - git-cliff --latest --strip header > changelog.txt
    # 或生成指定范围的 changelog
    - git-cliff HEAD~10..HEAD --strip header > changelog.txt
    # 查看生成的内容
    - cat changelog.txt
```

#### 使用 conventional-changelog 工具
```yaml
- name: generate-changelog-with-node
  image: node:18-alpine
  commands:
    - npm install -g conventional-changelog-cli
    - conventional-changelog -p angular -i changelog.txt -s -r 0
    - cat changelog.txt
```

### 5. 高级 Changelog 模板

#### 带版本信息的详细模板
```bash
#!/bin/bash
# detailed-changelog.sh

generate_detailed_changelog() {
    local version=${1:-"v0.0.0"}
    local last_tag=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
    local commit_range=""
    local commit_count=0
    
    if [ -z "$last_tag" ]; then
        commit_range="HEAD~10..HEAD"
        commit_count=$(git rev-list --count HEAD~10..HEAD 2>/dev/null || echo "0")
    else
        commit_range="${last_tag}..HEAD"
        commit_count=$(git rev-list --count ${last_tag}..HEAD 2>/dev/null || echo "0")
    fi
    
    # 获取时间信息
    local release_date=$(date +"%Y-%m-%d")
    local contributors=$(git log $commit_range --pretty=format:"%an" | sort | uniq | wc -l)
    
    # 生成详细 changelog
    local changelog="📦 版本 $version ($release_date)

📊 本次更新：
• $commit_count 个提交
• $contributors 位贡献者

"
    
    # 添加分类的提交信息
    local features=$(git log $commit_range --grep="^feat\|^feature\|新功能" --pretty=format:"• %s" | head -10)
    local fixes=$(git log $commit_range --grep="^fix\|修复\|^bugfix" --pretty=format:"• %s" | head -10)
    local improvements=$(git log $commit_range --grep="^perf\|优化\|^improve" --pretty=format:"• %s" | head -10)
    
    if [ -n "$features" ]; then
        changelog="${changelog}🚀 新功能：
$features

"
    fi
    
    if [ -n "$fixes" ]; then
        changelog="${changelog}🐛 问题修复：
$fixes

"
    fi
    
    if [ -n "$improvements" ]; then
        changelog="${changelog}⚡ 性能优化：
$improvements

"
    fi
    
    # 添加下载信息
    changelog="${changelog}📥 下载地址：通过 PKMS 系统获取最新版本"
    
    echo "$changelog"
}

# 使用示例
VERSION=${DRONE_TAG:-"v0.0.0-${DRONE_COMMIT:0:8}"}
DETAILED_CHANGELOG=$(generate_detailed_changelog "$VERSION")
echo "$DETAILED_CHANGELOG"
```

### 6. Android 专用 Changelog 生成

#### Android APK 发布的 Changelog
```bash
#!/bin/bash
# android-changelog.sh

generate_android_changelog() {
    local version=$1
    local build_number=${DRONE_BUILD_NUMBER:-"unknown"}
    local last_tag=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
    
    # 获取 Android 相关的提交
    local ui_changes=$(git log ${last_tag}..HEAD --grep="UI\|界面\|样式" --pretty=format:"• %s" | head -5)
    local bug_fixes=$(git log ${last_tag}..HEAD --grep="fix\|修复\|bug" --pretty=format:"• %s" | head -5)
    local features=$(git log ${last_tag}..HEAD --grep="feat\|新功能\|添加" --pretty=format:"• %s" | head -5)
    local performance=$(git log ${last_tag}..HEAD --grep="性能\|优化\|perf" --pretty=format:"• %s" | head -5)
    
    # 构建移动端友好的 changelog
    local changelog="📱 版本 $version (构建 $build_number)

"
    
    if [ -n "$features" ]; then
        changelog="${changelog}✨ 新功能
$features

"
    fi
    
    if [ -n "$bug_fixes" ]; then
        changelog="${changelog}🔧 修复
$bug_fixes

"
    fi
    
    if [ -n "$ui_changes" ]; then
        changelog="${changelog}🎨 界面优化
$ui_changes

"
    fi
    
    if [ -n "$performance" ]; then
        changelog="${changelog}⚡ 性能提升
$performance

"
    fi
    
    changelog="${changelog}📅 发布时间：$(date +'%Y年%m月%d日')
🏷️ 版本代码：$build_number"
    
    echo "$changelog"
}
```

### 7. 完整的自动化发布脚本

#### 集成所有功能的发布脚本
```bash
#!/bin/bash
# auto-release.sh

set -e

# 配置
PKMS_TOKEN=${PKMS_TOKEN}
PKMS_SERVER=${PKMS_SERVER}
VERSION=${VERSION:-$(git describe --tags --abbrev=0 2>/dev/null || echo "v0.0.0")}
BUILD_NUMBER=${BUILD_NUMBER:-$(date +%Y%m%d%H%M)}

# 生成 changelog
generate_smart_changelog() {
    echo "🔍 分析提交历史..."
    
    local last_tag=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
    local commit_range=""
    
    if [ -z "$last_tag" ]; then
        commit_range="HEAD~5..HEAD"
        echo "📝 使用最近 5 次提交生成 changelog"
    else
        commit_range="${last_tag}..HEAD"
        echo "📝 自 $last_tag 以来的提交生成 changelog"
    fi
    
    # 智能提取关键信息
    local total_commits=$(git rev-list --count $commit_range)
    local changelog="📦 版本更新 $VERSION

📊 本次发布包含 $total_commits 个提交

"
    
    # 按重要性排序的提交分类
    local breaking=$(git log $commit_range --grep="BREAKING\|破坏\|不兼容" --pretty=format:"• %s" | head -3)
    local security=$(git log $commit_range --grep="security\|安全\|漏洞" --pretty=format:"• %s" | head -3)
    local features=$(git log $commit_range --grep="feat\|新功能\|添加.*功能" --pretty=format:"• %s" | head -5)
    local fixes=$(git log $commit_range --grep="fix\|修复\|解决.*问题" --pretty=format:"• %s" | head -5)
    local improvements=$(git log $commit_range --grep="优化\|改进\|提升.*性能" --pretty=format:"• %s" | head -3)
    
    # 构建有优先级的 changelog
    if [ -n "$breaking" ]; then
        changelog="${changelog}⚠️ 重要变更
$breaking

"
    fi
    
    if [ -n "$security" ]; then
        changelog="${changelog}🔒 安全更新
$security

"
    fi
    
    if [ -n "$features" ]; then
        changelog="${changelog}🚀 新功能
$features

"
    fi
    
    if [ -n "$fixes" ]; then
        changelog="${changelog}🐛 问题修复
$fixes

"
    fi
    
    if [ -n "$improvements" ]; then
        changelog="${changelog}⚡ 优化改进
$improvements

"
    fi
    
    changelog="${changelog}🕐 发布时间：$(date +'%Y-%m-%d %H:%M:%S')
🏗️ 构建编号：$BUILD_NUMBER"
    
    echo "$changelog"
}

# 主执行流程
main() {
    echo "🚀 开始自动发布流程..."
    
    # 检查必要参数
    if [ -z "$PKMS_TOKEN" ] || [ -z "$PKMS_SERVER" ]; then
        echo "❌ 错误：缺少必要的环境变量 PKMS_TOKEN 或 PKMS_SERVER"
        exit 1
    fi
    
    # 生成 changelog
    CHANGELOG=$(generate_smart_changelog)
    echo "📋 生成的 Changelog："
    echo "$CHANGELOG"
    echo ""
    
    # 查找要发布的文件
    echo "🔍 查找构建产物..."
    
    for artifact in dist/*.tar.gz dist/*.zip dist/*.apk dist/*.exe; do
        if [ -f "$artifact" ]; then
            echo "📦 找到构建产物：$artifact"
            
            # 从文件名推断信息
            filename=$(basename "$artifact")
            os="unknown"
            arch="unknown"
            
            case "$filename" in
                *linux*) os="linux" ;;
                *windows*) os="windows" ;;
                *darwin*|*macos*) os="darwin" ;;
                *android*|*.apk) os="android" ;;
            esac
            
            case "$filename" in
                *amd64*|*x86_64*) arch="amd64" ;;
                *arm64*|*aarch64*) arch="arm64" ;;
                *armv7*|*arm*) arch="arm" ;;
                *386*|*x86*) arch="386" ;;
                *.apk) arch="universal" ;;
            esac
            
            echo "📤 上传 $artifact (OS: $os, ARCH: $arch)..."
            
            # 发布到 PKMS
            response=$(curl -s -w "%{http_code}" -X POST \
                -H "x-access-token: $PKMS_TOKEN" \
                -F "file=@$artifact" \
                -F "version=$VERSION" \
                -F "artifact=$(basename $artifact .${artifact##*.})" \
                -F "os=$os" \
                -F "arch=$arch" \
                -F "changelog=$CHANGELOG" \
                "$PKMS_SERVER/client-access/release")
            
            http_code="${response: -3}"
            
            if [ "$http_code" -eq 201 ]; then
                echo "✅ $artifact 上传成功！"
            else
                echo "❌ $artifact 上传失败 (HTTP $http_code)"
                echo "响应: ${response%???}"
                exit 1
            fi
        fi
    done
    
    echo "🎉 所有构建产物发布完成！"
}

# 执行主函数
main "$@"
```

这些方案提供了从简单到复杂的多种 changelog 自动归纳方式，可以根据项目需求选择合适的方案：

1. **简单方案**：直接使用 git log 提取提交信息
2. **标准方案**：基于 Conventional Commits 规范分类
3. **高级方案**：智能分析提交内容，生成结构化 changelog
4. **工具方案**：使用专业的 changelog 生成工具

推荐从简单方案开始，随着项目发展逐步升级到更复杂的方案。