# Casbin 数据库规则分析

## rbac_model.conf 定义
```
[request_definition]
r = sub, dom, obj, act

[policy_definition]
p = sub, dom, obj, act

[role_definition]
g = _, _, _

[policy_effect]
e = some(where (p.eft == allow))

[matchers]
m = g(r.sub, p.sub, r.dom) && (p.dom == "*" || r.dom == p.dom) && (p.obj == "*" || r.obj == p.obj) && (p.act == "*" || r.act == p.act)
```

**期望格式**：
- **Policy (p)**: `subject, domain, object, action`
- **Role (g)**: `user, role, domain`

## 数据库实际数据

95,p,d208s9frlmvmbf5ketk0,*,*,*,"",""
96,p,d208s9frlmvmbf5ketl0,d208s9frlmvmbf5ketkg,project,*,"",""
97,p,d208s9frlmvmbf5ketl0,d208s9frlmvmbf5ketkg,package,*,"",""
98,p,d208s9frlmvmbf5ketl0,d208s9frlmvmbf5ketkg,release,*,"",""
99,p,d208s9frlmvmbf5ketl0,d208s9frlmvmbf5ketkg,sidebar,dashboard,"",""
100,p,d208s9frlmvmbf5ketl0,d208s9frlmvmbf5ketkg,sidebar,projects,"",""
101,p,d208s9frlmvmbf5ketl0,d208s9frlmvmbf5ketkg,sidebar,upgrade,"",""
102,p,d208s9frlmvmbf5ketm0,d208s9frlmvmbf5ketlg,project,*,"",""
103,p,d208s9frlmvmbf5ketm0,d208s9frlmvmbf5ketlg,package,*,"",""
104,p,d208s9frlmvmbf5ketm0,d208s9frlmvmbf5ketlg,release,*,"",""
105,p,d208s9frlmvmbf5ketm0,d208s9frlmvmbf5ketlg,sidebar,dashboard,"",""
106,p,d208s9frlmvmbf5ketm0,d208s9frlmvmbf5ketlg,sidebar,projects,"",""
107,p,d208s9frlmvmbf5ketm0,d208s9frlmvmbf5ketlg,sidebar,upgrade,"",""
108,p,admin,*,project,read,"",""
109,p,admin,*,project,write,"",""
110,p,admin,*,project,delete,"",""
111,p,admin,*,project,create,"",""
112,p,admin,*,project,update,"",""
113,p,admin,*,project,list,"",""
114,p,admin,*,project,share,"",""
115,p,admin,*,package,read,"",""
116,p,admin,*,package,write,"",""
117,p,admin,*,package,delete,"",""
118,p,admin,*,package,create,"",""
119,p,admin,*,package,update,"",""
120,p,admin,*,package,list,"",""
121,p,admin,*,package,share,"",""
122,p,admin,*,release,read,"",""
123,p,admin,*,release,write,"",""
124,p,admin,*,release,delete,"",""
125,p,admin,*,release,create,"",""
126,p,admin,*,release,update,"",""
127,p,admin,*,release,list,"",""
128,p,admin,*,user,read,"",""
129,p,admin,*,user,write,"",""
130,p,admin,*,user,delete,"",""
131,p,admin,*,user,create,"",""
132,p,admin,*,user,update,"",""
133,p,admin,*,user,list,"",""
134,p,admin,*,file,read,"",""
135,p,admin,*,file,write,"",""
136,p,admin,*,file,delete,"",""
137,p,admin,*,file,upload,"",""
138,p,admin,*,file,download,"",""
139,p,admin,*,file,share,"",""
140,p,admin,*,sidebar,dashboard,"",""
141,p,admin,*,sidebar,projects,"",""
142,p,admin,*,sidebar,upgrade,"",""
143,p,admin,*,sidebar,tenants,"",""
144,p,admin,*,sidebar,users,"",""
145,p,admin,*,sidebar,groups,"",""
146,p,admin,*,sidebar,permissions,"",""
147,p,admin,*,sidebar,settings,"",""
148,p,pm,*,file,read,"",""
149,p,pm,*,file,write,"",""
150,p,pm,*,file,upload,"",""
151,p,pm,*,file,download,"",""
152,p,pm,*,file,share,"",""
153,p,pm,*,project,read,"",""
154,p,pm,*,project,write,"",""
155,p,pm,*,project,delete,"",""
156,p,pm,*,project,create,"",""
157,p,pm,*,project,update,"",""
158,p,pm,*,project,list,"",""
159,p,pm,*,project,share,"",""
160,p,pm,*,package,read,"",""
161,p,pm,*,package,write,"",""
162,p,pm,*,package,delete,"",""
163,p,pm,*,package,create,"",""
164,p,pm,*,package,update,"",""
165,p,pm,*,package,list,"",""
166,p,pm,*,package,share,"",""
167,p,pm,*,release,read,"",""
168,p,pm,*,release,write,"",""
169,p,pm,*,release,delete,"",""
170,p,pm,*,release,create,"",""
171,p,pm,*,release,update,"",""
172,p,pm,*,release,list,"",""
173,p,pm,*,sidebar,dashboard,"",""
174,p,pm,*,sidebar,projects,"",""
175,p,pm,*,sidebar,upgrade,"",""
176,p,user,*,project,read,"",""
177,p,user,*,project,list,"",""
178,p,user,*,package,read,"",""
179,p,user,*,package,list,"",""
180,p,user,*,release,read,"",""
181,p,user,*,release,list,"",""
182,p,user,*,file,read,"",""
183,p,user,*,file,download,"",""
184,p,user,*,sidebar,dashboard,"",""
185,p,user,*,sidebar,projects,"",""
186,g,d208s9frlmvmbf5ketk0,admin,*,"","",""
187,g,d208s9frlmvmbf5ketl0,pm,d208s9frlmvmbf5ketkg,"","",""
188,g,d208s9frlmvmbf5ketm0,pm,d208s9frlmvmbf5ketlg,"","",""


### 🚨 主要问题

#### 1. 角色权限规则格式不一致
**当前数据**：
```
p,admin,*,project,read    # ❌ 错误：* 作为域
p,pm,*,file,write         # ❌ 错误：* 作为域  
p,user,*,project,read     # ❌ 错误：* 作为域
```

**应该是**：
```
p,admin,domain1,project,read   # ✅ 正确：具体域
p,admin,*,*,*         # ✅ 正确：通配符域（所有域）
```

#### 2. 域逻辑混淆
- **用户特定权限** (95-107行)：正确使用了具体域ID
- **角色权限** (108-185行)：错误地将域设为 `*`，这意味着这些角色权限适用于所有域

### 🔍 数据模式分析

#### A. 用户直接权限 (Direct User Permissions)
```
95,p,d208s9frlmvmbf5ketk0,*,*,*                    # 用户在所有域有全部权限
96,p,d208s9frlmvmbf5ketl0,d208s9frlmvmbf5ketkg,project,*  # 用户在特定域有项目权限
```
✅ **符合模型**：`subject(用户), domain(域), object(对象), action(操作)`

#### B. 角色权限定义 (Role Permissions)
```
108,p,admin,*,project,read    # 意图：admin角色有项目读权限
153,p,pm,*,project,read       # 意图：pm角色有项目读权限
176,p,user,*,project,read     # 意图：user角色有项目读权限
```
❌ **不符合模型**：第二个参数应该是域，但这里用了 `*`

#### C. 用户角色分配 (User Role Assignment)
```
186,g,d208s9frlmvmbf5ketk0,admin,*                 # 用户在所有域是admin
187,g,d208s9frlmvmbf5ketl0,pm,d208s9frlmvmbf5ketkg # 用户在特定域是pm
```
✅ **符合模型**：`user(用户), role(角色), domain(域)`

## 权限匹配逻辑分析

### 当前匹配器
```
m = g(r.sub, p.sub, r.dom) && (p.dom == "*" || r.dom == p.dom) && (p.obj == "*" || r.obj == p.obj) && (p.act == "*" || r.act == p.act)
```

### 问题场景

#### 场景1: 用户 `d208s9frlmvmbf5ketl0` 在域 `d208s9frlmvmbf5ketkg` 请求 `project:read`

**匹配过程**：
1. `g(d208s9frlmvmbf5ketl0, pm, d208s9frlmvmbf5ketkg)` ✅ 用户在该域是pm角色
2. 查找 `pm` 的权限规则：`p,pm,*,project,read`
3. 匹配条件：
   - `p.dom == "*"` ✅ 角色权限适用所有域
   - `r.dom == "d208s9frlmvmbf5ketkg"` ✅ 请求域匹配
   - `p.obj == "project"` ✅ 对象匹配
   - `p.act == "read"` ✅ 操作匹配

**结果**: ✅ **允许访问** - 但这可能不是预期行为！

### 🚨 安全风险

当前设计中，所有角色权限都使用 `*` 作为域，意味着：
- `admin` 角色在**所有域**都有完全权限
- `pm` 角色在**所有域**都有管理权限  
- `user` 角色在**所有域**都有读权限

这**违反了多租户隔离原则**！

## 修复建议

### 1. 角色权限应该按域定义

**当前错误方式**：
```sql
INSERT INTO casbin_rule VALUES (108,'p','admin','*','project','read','','');
```

**正确方式**：
```sql
-- 为每个域分别定义角色权限
INSERT INTO casbin_rule VALUES (108,'p','admin','d208s9frlmvmbf5ketkg','project','read','','');
INSERT INTO casbin_rule VALUES (109,'p','admin','d208s9frlmvmbf5ketlg','project','read','','');
-- 或者如果真的需要跨域权限
INSERT INTO casbin_rule VALUES (110,'p','admin','*','project','read','',''); -- 仅限超级管理员
```

### 3. 前端修复验证

我们之前修复的前端组件现在可以正确处理这种域特定的角色权限：
- 创建权限时包含正确的租户ID
- 显示权限时显示对应的域信息
- 删除权限时包含域参数

## 结论

### ✅ 符合模型的数据：
- 用户直接权限 (95-107行)
- 用户角色分配 (186-188行)

### ❌ 不符合模型的数据：
- 角色权限定义 (108-185行) - 所有角色权限都错误地使用 `*` 作为域

### 🔐 安全影响：
- **高风险**：当前设计破坏了多租户隔离
- **权限泄露**：角色权限在所有域生效
- **违反最小权限原则**

### 📋 修复优先级：
1. **立即修复**：角色权限数据格式
2. **验证修复**：测试多租户权限隔离
3. **监控**：确保新的权限创建使用正确格式
