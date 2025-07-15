import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, Plus, Shield, Users, Eye, UserPlus, Key } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api/api';
import { Separator } from '@/components/ui/separator';

interface Policy {
  sub: string;
  obj: string;
  act: string;
}

interface Role {
  user: string;
  role: string;
}

interface UserPermission {
  user_id: string;
  permissions: string[][];
  roles: string[];
}



const PermissionsPage: React.FC = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [roleNames, setRoleNames] = useState<string[]>([]);
  const [objects, setObjects] = useState<string[]>([]);
  const [actions, setActions] = useState<string[]>([]);
  const [userPermissions, setUserPermissions] = useState<UserPermission[]>([]);
  const [activeTab, setActiveTab] = useState('role-permissions');

  // 对话框状态
  const [showAddRolePolicyDialog, setShowAddRolePolicyDialog] = useState(false);
  const [showAddUserRoleDialog, setShowAddUserRoleDialog] = useState(false);
  const [showAddUserPolicyDialog, setShowAddUserPolicyDialog] = useState(false);
  const [showUserPermissionsDialog, setShowUserPermissionsDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');

  // 表单状态
  const [newRolePolicy, setNewRolePolicy] = useState({
    role: '',
    object: '',
    action: ''
  });

  const [newUserRole, setNewUserRole] = useState({
    user_id: '',
    role: ''
  });

  const [newUserPolicy, setNewUserPolicy] = useState({
    user_id: '',
    object: '',
    action: ''
  });

  // 预定义的角色类型
  const predefinedRoles = ['admin', 'project_admin', 'developer', 'viewer', 'tester', 'package_admin'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchPolicies(),
        fetchRoles(),
        fetchRoleNames(),
        fetchObjects(),
        fetchActions(),
      ]);
    } catch (error) {
      console.error('获取数据失败:', error);
      toast.error('获取数据失败');
    }
  };

  const fetchPolicies = async () => {
    try {
      const response = await apiClient.get('/api/v1/casbin/policies');
      if (response.data && response.data.code === 0) {
        const policiesData = response.data.data.policies || [];
        setPolicies(policiesData.map((p: string[]) => ({
          sub: p[0],
          obj: p[1],
          act: p[2]
        })));
      }
    } catch (error) {
      console.error('获取策略失败:', error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await apiClient.get('/api/v1/casbin/roles');
      if (response.data && response.data.code === 0) {
        const rolesData = response.data.data.roles || [];
        setRoles(rolesData.map((r: string[]) => ({
          user: r[0],
          role: r[1]
        })));
      }
    } catch (error) {
      console.error('获取角色失败:', error);
    }
  };

  const fetchRoleNames = async () => {
    try {
      const response = await apiClient.get('/api/v1/casbin/roles/names');
      if (response.data && response.data.code === 0) {
        setRoleNames(response.data.data.role_names || []);
      }
    } catch (error) {
      console.error('获取角色名称失败:', error);
    }
  };

  const fetchObjects = async () => {
    try {
      const response = await apiClient.get('/api/v1/casbin/objects');
      if (response.data && response.data.code === 0) {
        setObjects(response.data.data.objects || []);
      }
    } catch (error) {
      console.error('获取对象失败:', error);
    }
  };

  const fetchActions = async () => {
    try {
      const response = await apiClient.get('/api/v1/casbin/actions');
      if (response.data && response.data.code === 0) {
        setActions(response.data.data.actions || []);
      }
    } catch (error) {
      console.error('获取操作失败:', error);
    }
  };

  const fetchUserPermissions = async (userId: string) => {
    try {
      const response = await apiClient.get(`/api/v1/casbin/users/${userId}/permissions`);
      if (response.data && response.data.code === 0) {
        return response.data.data;
      }
    } catch (error) {
      console.error('获取用户权限失败:', error);
    }
    return null;
  };



  const addRolePolicy = async () => {
    if (!newRolePolicy.role || !newRolePolicy.object || !newRolePolicy.action) {
      toast.error('请填写所有必填字段');
      return;
    }

    try {
      const response = await apiClient.post('/api/v1/casbin/role-policies', newRolePolicy);
      if (response.data && response.data.code === 0) {
        toast.success('角色权限添加成功');
        setShowAddRolePolicyDialog(false);
        setNewRolePolicy({ role: '', object: '', action: '' });
        fetchPolicies();
      } else {
        toast.error(response.data.msg || '添加角色权限失败');
      }
    } catch (error) {
      console.error('添加角色权限失败:', error);
      toast.error('添加角色权限失败');
    }
  };

  const removeRolePolicy = async (role: string, object: string, action: string) => {
    try {
      const response = await apiClient.delete('/api/v1/casbin/role-policies', {
        data: { role, object, action }
      });
      if (response.data && response.data.code === 0) {
        toast.success('角色权限删除成功');
        fetchPolicies();
      } else {
        toast.error(response.data.msg || '删除角色权限失败');
      }
    } catch (error) {
      console.error('删除角色权限失败:', error);
      toast.error('删除角色权限失败');
    }
  };

  const addUserRole = async () => {
    if (!newUserRole.user_id || !newUserRole.role) {
      toast.error('请填写所有必填字段');
      return;
    }

    try {
      const response = await apiClient.post('/api/v1/casbin/roles', newUserRole);
      if (response.data && response.data.code === 0) {
        toast.success('用户角色添加成功');
        setShowAddUserRoleDialog(false);
        setNewUserRole({ user_id: '', role: '' });
        fetchRoles();
      } else {
        toast.error(response.data.msg || '添加用户角色失败');
      }
    } catch (error) {
      console.error('添加用户角色失败:', error);
      toast.error('添加用户角色失败');
    }
  };

  const removeUserRole = async (userId: string, role: string) => {
    try {
      const response = await apiClient.delete('/api/v1/casbin/roles', {
        data: { user_id: userId, role }
      });
      if (response.data && response.data.code === 0) {
        toast.success('用户角色删除成功');
        fetchRoles();
      } else {
        toast.error(response.data.msg || '删除用户角色失败');
      }
    } catch (error) {
      console.error('删除用户角色失败:', error);
      toast.error('删除用户角色失败');
    }
  };

  const addUserPolicy = async () => {
    if (!newUserPolicy.user_id || !newUserPolicy.object || !newUserPolicy.action) {
      toast.error('请填写所有必填字段');
      return;
    }

    try {
      const response = await apiClient.post('/api/v1/casbin/policies', newUserPolicy);
      if (response.data && response.data.code === 0) {
        toast.success('用户权限添加成功');
        setShowAddUserPolicyDialog(false);
        setNewUserPolicy({ user_id: '', object: '', action: '' });
        fetchPolicies();
      } else {
        toast.error(response.data.msg || '添加用户权限失败');
      }
    } catch (error) {
      console.error('添加用户权限失败:', error);
      toast.error('添加用户权限失败');
    }
  };

  const removeUserPolicy = async (userId: string, object: string, action: string) => {
    try {
      const response = await apiClient.delete('/api/v1/casbin/policies', {
        data: { user_id: userId, object, action }
      });
      if (response.data && response.data.code === 0) {
        toast.success('用户权限删除成功');
        fetchPolicies();
      } else {
        toast.error(response.data.msg || '删除用户权限失败');
      }
    } catch (error) {
      console.error('删除用户权限失败:', error);
      toast.error('删除用户权限失败');
    }
  };

  const initializePolicies = async () => {
    try {
      const response = await apiClient.post('/api/v1/casbin/initialize');
      if (response.data && response.data.code === 0) {
        toast.success('默认策略初始化成功');
        fetchData();
      } else {
        toast.error(response.data.msg || '初始化策略失败');
      }
    } catch (error) {
      console.error('初始化策略失败:', error);
      toast.error('初始化策略失败');
    }
  };

  const showUserPermissions = async (userId: string) => {
    const permissions = await fetchUserPermissions(userId);
    if (permissions) {
      setUserPermissions([permissions]);
      setSelectedUserId(userId);
      setShowUserPermissionsDialog(true);
    }
  };

  // 获取角色的策略
  const getRolePolicies = () => {
    return policies.filter(policy => roleNames.includes(policy.sub));
  };

  // 获取用户的策略
  const getUserPolicies = () => {
    return policies.filter(policy => !roleNames.includes(policy.sub));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">权限管理</h1>
        <div className="flex gap-2">
          <Button onClick={initializePolicies} variant="outline">
            <Shield className="w-4 h-4 mr-2" />
            初始化默认策略
          </Button>
          <Button onClick={() => fetchData()} variant="outline">
            刷新数据
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="role-permissions">角色权限配置</TabsTrigger>
          <TabsTrigger value="user-roles">用户角色分配</TabsTrigger>
          <TabsTrigger value="user-permissions">用户权限配置</TabsTrigger>
        </TabsList>

        {/* 角色权限配置 */}
        <TabsContent value="role-permissions">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  角色权限配置
                </CardTitle>
                <Dialog open={showAddRolePolicyDialog} onOpenChange={setShowAddRolePolicyDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      添加角色权限
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>添加角色权限</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="role">角色</Label>
                        <Select value={newRolePolicy.role} onValueChange={(value) => setNewRolePolicy({...newRolePolicy, role: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="选择角色" />
                          </SelectTrigger>
                          <SelectContent>
                            {predefinedRoles.map(role => (
                              <SelectItem key={role} value={role}>{role}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="object">对象</Label>
                        <Select value={newRolePolicy.object} onValueChange={(value) => setNewRolePolicy({...newRolePolicy, object: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="选择对象" />
                          </SelectTrigger>
                          <SelectContent>
                            {objects.map(obj => (
                              <SelectItem key={obj} value={obj}>{obj}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="action">操作</Label>
                        <Select value={newRolePolicy.action} onValueChange={(value) => setNewRolePolicy({...newRolePolicy, action: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="选择操作" />
                          </SelectTrigger>
                          <SelectContent>
                            {actions.map(action => (
                              <SelectItem key={action} value={action}>{action}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={addRolePolicy} className="flex-1">添加</Button>
                        <Button variant="outline" onClick={() => setShowAddRolePolicyDialog(false)} className="flex-1">取消</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>角色</TableHead>
                    <TableHead>对象</TableHead>
                    <TableHead>操作</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getRolePolicies().map((policy, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Badge variant="secondary">{policy.sub}</Badge>
                      </TableCell>
                      <TableCell>{policy.obj}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{policy.act}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRolePolicy(policy.sub, policy.obj, policy.act)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 用户角色分配 */}
        <TabsContent value="user-roles">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  用户角色分配
                </CardTitle>
                <Dialog open={showAddUserRoleDialog} onOpenChange={setShowAddUserRoleDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="w-4 h-4 mr-2" />
                      添加用户角色
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>添加用户角色</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="user_id">用户ID</Label>
                        <Input
                          id="user_id"
                          value={newUserRole.user_id}
                          onChange={(e) => setNewUserRole({...newUserRole, user_id: e.target.value})}
                          placeholder="请输入用户ID"
                        />
                      </div>
                      <div>
                        <Label htmlFor="role">角色</Label>
                        <Select value={newUserRole.role} onValueChange={(value) => setNewUserRole({...newUserRole, role: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="选择角色" />
                          </SelectTrigger>
                          <SelectContent>
                            {predefinedRoles.map(role => (
                              <SelectItem key={role} value={role}>{role}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={addUserRole} className="flex-1">添加</Button>
                        <Button variant="outline" onClick={() => setShowAddUserRoleDialog(false)} className="flex-1">取消</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>用户ID</TableHead>
                    <TableHead>角色</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role, index) => (
                    <TableRow key={index}>
                      <TableCell>{role.user}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{role.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => showUserPermissions(role.user)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeUserRole(role.user, role.role)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 用户权限配置 */}
        <TabsContent value="user-permissions">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  用户权限配置
                </CardTitle>
                <Dialog open={showAddUserPolicyDialog} onOpenChange={setShowAddUserPolicyDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      添加用户权限
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>添加用户权限</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="user_id">用户ID</Label>
                        <Input
                          id="user_id"
                          value={newUserPolicy.user_id}
                          onChange={(e) => setNewUserPolicy({...newUserPolicy, user_id: e.target.value})}
                          placeholder="请输入用户ID"
                        />
                      </div>
                      <div>
                        <Label htmlFor="object">对象</Label>
                        <Select value={newUserPolicy.object} onValueChange={(value) => setNewUserPolicy({...newUserPolicy, object: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="选择对象" />
                          </SelectTrigger>
                          <SelectContent>
                            {objects.map(obj => (
                              <SelectItem key={obj} value={obj}>{obj}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="action">操作</Label>
                        <Select value={newUserPolicy.action} onValueChange={(value) => setNewUserPolicy({...newUserPolicy, action: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="选择操作" />
                          </SelectTrigger>
                          <SelectContent>
                            {actions.map(action => (
                              <SelectItem key={action} value={action}>{action}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={addUserPolicy} className="flex-1">添加</Button>
                        <Button variant="outline" onClick={() => setShowAddUserPolicyDialog(false)} className="flex-1">取消</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>用户ID</TableHead>
                    <TableHead>对象</TableHead>
                    <TableHead>操作</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getUserPolicies().map((policy, index) => (
                    <TableRow key={index}>
                      <TableCell>{policy.sub}</TableCell>
                      <TableCell>{policy.obj}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{policy.act}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => showUserPermissions(policy.sub)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeUserPolicy(policy.sub, policy.obj, policy.act)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 用户权限查看对话框 */}
      <Dialog open={showUserPermissionsDialog} onOpenChange={setShowUserPermissionsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>用户权限详情 - {selectedUserId}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {userPermissions.map((permission, index) => (
              <div key={index} className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">用户角色</h4>
                  <div className="flex flex-wrap gap-2">
                    {permission.roles.map((role, roleIndex) => (
                      <Badge key={roleIndex} variant="secondary">{role}</Badge>
                    ))}
                  </div>
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">权限列表</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>主体</TableHead>
                        <TableHead>对象</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {permission.permissions.map((perm, permIndex) => (
                        <TableRow key={permIndex}>
                          <TableCell>
                            <Badge variant={perm[0] === permission.user_id ? "default" : "secondary"}>
                              {perm[0]}
                            </Badge>
                          </TableCell>
                          <TableCell>{perm[1]}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{perm[2]}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PermissionsPage; 