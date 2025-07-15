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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, Plus, Shield, Users, Settings, Eye} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api/api';

interface Policy {
  sub: string;
  dom: string;
  obj: string;
  act: string;
}

interface Role {
  user: string;
  role: string;
  domain: string;
}

interface UserPermission {
  user_id: string;
  domain: string;
  permissions: string[][];
  roles: string[];
}

const PermissionsPage: React.FC = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [userPermissions, setUserPermissions] = useState<UserPermission[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddPolicyDialog, setShowAddPolicyDialog] = useState(false);
  const [showAddRoleDialog, setShowAddRoleDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');

  // 表单状态
  const [newPolicy, setNewPolicy] = useState({
    user_id: '',
    domain: '*',
    object: '',
    action: ''
  });

  const [newRole, setNewRole] = useState({
    user_id: '',
    role: '',
    domain: '*'
  });

  // 预定义的选项
  const objects = ['project', 'package', 'file', 'user', 'group', 'permission', 'system'];
  const actions = ['view', 'create', 'edit', 'delete', 'manage', 'admin'];
  const roleTypes = ['admin', 'project_admin', 'developer', 'viewer'];

  useEffect(() => {
    console.log(loading);
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchPolicies(),
        fetchRoles(),
      ]);
    } catch (error) {
      console.error('获取数据失败:', error);
      toast.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchPolicies = async () => {
    try {
      const response = await apiClient.get('/casbin/policies');
      if (response.data && response.data.code === 0) {
        const policiesData = response.data.data.policies || [];
        setPolicies(policiesData.map((p: string[]) => ({
          sub: p[0],
          dom: p[1],
          obj: p[2],
          act: p[3]
        })));
      }
    } catch (error) {
      console.error('获取策略失败:', error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await apiClient.get('/casbin/roles');
      if (response.data && response.data.code === 0) {
        const rolesData = response.data.data.roles || [];
        setRoles(rolesData.map((r: string[]) => ({
          user: r[0],
          role: r[1],
          domain: r[2]
        })));
      }
    } catch (error) {
      console.error('获取角色失败:', error);
    }
  };

  const fetchUserPermissions = async (userId: string) => {
    try {
      const response = await apiClient.get(`/casbin/users/${userId}/permissions`);
      if (response.data && response.data.code === 0) {
        return response.data.data;
      }
    } catch (error) {
      console.error('获取用户权限失败:', error);
    }
    return null;
  };

  const addPolicy = async () => {
    if (!newPolicy.user_id || !newPolicy.object || !newPolicy.action) {
      toast.error('请填写所有必填字段');
      return;
    }

    try {
      const response = await apiClient.post('/casbin/policies', newPolicy);
      if (response.data && response.data.code === 0) {
        toast.success('策略添加成功');
        setShowAddPolicyDialog(false);
        setNewPolicy({ user_id: '', domain: '*', object: '', action: '' });
        fetchPolicies();
      } else {
        toast.error(response.data.msg || '添加策略失败');
      }
    } catch (error) {
      console.error('添加策略失败:', error);
      toast.error('添加策略失败');
    }
  };

  const removePolicy = async (policy: Policy) => {
    try {
      const response = await apiClient.delete('/casbin/policies', {
        data: {
          user_id: policy.sub,
          domain: policy.dom,
          object: policy.obj,
          action: policy.act
        }
      });
      if (response.data && response.data.code === 0) {
        toast.success('策略删除成功');
        fetchPolicies();
      } else {
        toast.error(response.data.msg || '删除策略失败');
      }
    } catch (error) {
      console.error('删除策略失败:', error);
      toast.error('删除策略失败');
    }
  };

  const addRole = async () => {
    if (!newRole.user_id || !newRole.role) {
      toast.error('请填写所有必填字段');
      return;
    }

    try {
      const response = await apiClient.post('/casbin/roles', newRole);
      if (response.data && response.data.code === 0) {
        toast.success('角色添加成功');
        setShowAddRoleDialog(false);
        setNewRole({ user_id: '', role: '', domain: '*' });
        fetchRoles();
      } else {
        toast.error(response.data.msg || '添加角色失败');
      }
    } catch (error) {
      console.error('添加角色失败:', error);
      toast.error('添加角色失败');
    }
  };

  const removeRole = async (role: Role) => {
    try {
      const response = await apiClient.delete('/casbin/roles', {
        data: {
          user_id: role.user,
          role: role.role,
          domain: role.domain
        }
      });
      if (response.data && response.data.code === 0) {
        toast.success('角色删除成功');
        fetchRoles();
      } else {
        toast.error(response.data.msg || '删除角色失败');
      }
    } catch (error) {
      console.error('删除角色失败:', error);
      toast.error('删除角色失败');
    }
  };

  const initializePolicies = async () => {
    try {
      const response = await apiClient.post('/casbin/initialize');
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

  const checkUserPermissions = async () => {
    if (!selectedUserId) {
      toast.error('请输入用户ID');
      return;
    }

    const userPerm = await fetchUserPermissions(selectedUserId);
    if (userPerm) {
      setUserPermissions([userPerm]);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">权限管理</h1>
        <div className="flex gap-2">
          <Button onClick={initializePolicies} variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            初始化默认策略
          </Button>
        </div>
      </div>

      <Tabs defaultValue="policies" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="policies">策略管理</TabsTrigger>
          <TabsTrigger value="roles">角色管理</TabsTrigger>
          <TabsTrigger value="users">用户权限</TabsTrigger>
        </TabsList>

        <TabsContent value="policies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                权限策略
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-gray-600">
                  总共 {policies.length} 条策略
                </div>
                <Dialog open={showAddPolicyDialog} onOpenChange={setShowAddPolicyDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      添加策略
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>添加权限策略</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="user_id">用户ID</Label>
                        <Input
                          id="user_id"
                          value={newPolicy.user_id}
                          onChange={(e) => setNewPolicy({ ...newPolicy, user_id: e.target.value })}
                          placeholder="输入用户ID"
                        />
                      </div>
                      <div>
                        <Label htmlFor="domain">域</Label>
                        <Input
                          id="domain"
                          value={newPolicy.domain}
                          onChange={(e) => setNewPolicy({ ...newPolicy, domain: e.target.value })}
                          placeholder="域（如项目ID或*）"
                        />
                      </div>
                      <div>
                        <Label htmlFor="object">对象</Label>
                        <Select
                          value={newPolicy.object}
                          onValueChange={(value) => setNewPolicy({ ...newPolicy, object: value })}
                        >
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
                        <Label htmlFor="action">动作</Label>
                        <Select
                          value={newPolicy.action}
                          onValueChange={(value) => setNewPolicy({ ...newPolicy, action: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="选择动作" />
                          </SelectTrigger>
                          <SelectContent>
                            {actions.map(action => (
                              <SelectItem key={action} value={action}>{action}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={addPolicy} className="w-full">
                        添加策略
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>用户</TableHead>
                    <TableHead>域</TableHead>
                    <TableHead>对象</TableHead>
                    <TableHead>动作</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {policies.map((policy, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{policy.sub}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{policy.dom}</Badge>
                      </TableCell>
                      <TableCell>{policy.obj}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{policy.act}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePolicy(policy)}
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

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                角色管理
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-gray-600">
                  总共 {roles.length} 个角色分配
                </div>
                <Dialog open={showAddRoleDialog} onOpenChange={setShowAddRoleDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      添加角色
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>添加用户角色</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="role_user_id">用户ID</Label>
                        <Input
                          id="role_user_id"
                          value={newRole.user_id}
                          onChange={(e) => setNewRole({ ...newRole, user_id: e.target.value })}
                          placeholder="输入用户ID"
                        />
                      </div>
                      <div>
                        <Label htmlFor="role">角色</Label>
                        <Select
                          value={newRole.role}
                          onValueChange={(value) => setNewRole({ ...newRole, role: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="选择角色" />
                          </SelectTrigger>
                          <SelectContent>
                            {roleTypes.map(role => (
                              <SelectItem key={role} value={role}>{role}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="role_domain">域</Label>
                        <Input
                          id="role_domain"
                          value={newRole.domain}
                          onChange={(e) => setNewRole({ ...newRole, domain: e.target.value })}
                          placeholder="域（如项目ID或*）"
                        />
                      </div>
                      <Button onClick={addRole} className="w-full">
                        添加角色
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>用户</TableHead>
                    <TableHead>角色</TableHead>
                    <TableHead>域</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{role.user}</TableCell>
                      <TableCell>
                        <Badge variant="default">{role.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{role.domain}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRole(role)}
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

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                用户权限查看
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="输入用户ID"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                />
                <Button onClick={checkUserPermissions}>
                  查看权限
                </Button>
              </div>

              {userPermissions.map((userPerm, index) => (
                <div key={index} className="space-y-4">
                  <Alert>
                    <AlertDescription>
                      用户 {userPerm.user_id} 在域 {userPerm.domain} 的权限信息
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">角色</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {userPerm.roles.map((role, roleIndex) => (
                            <Badge key={roleIndex} variant="default">{role}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">权限</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {userPerm.permissions.map((perm, permIndex) => (
                            <div key={permIndex} className="flex gap-2">
                              <Badge variant="outline">{perm[2]}</Badge>
                              <Badge variant="secondary">{perm[3]}</Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PermissionsPage; 