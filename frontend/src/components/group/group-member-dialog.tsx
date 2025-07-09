import { useState } from 'react';
import { useAuth } from '@/contexts/simple-auth-context';
import { Group, User } from '@/types/simplified';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Users, Plus, X, Search } from 'lucide-react';

interface GroupMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: Group;
}

export function GroupMemberDialog({ open, onOpenChange, group }: GroupMemberDialogProps) {
  const { 
    getAllUsers, 
    getUserGroups, 
    addUserToGroup, 
    removeUserFromGroup 
  } = useAuth();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');

  const allUsers = getAllUsers();
  
  // 获取组成员
  const groupMembers = allUsers.filter(user => 
    user.groupIds?.includes(group.id)
  );

  // 获取可添加的用户（不在组中的用户）
  const availableUsers = allUsers.filter(user => 
    !user.groupIds?.includes(group.id)
  );

  // 搜索过滤
  const filteredGroupMembers = groupMembers.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAvailableUsers = availableUsers.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddUser = async () => {
    if (!selectedUserId) return;

    setLoading(true);
    try {
      await addUserToGroup(selectedUserId, group.id);
      setSelectedUserId('');
    } catch (error) {
      console.error('添加用户到组失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!confirm('确定要从组中移除此用户吗？')) return;

    setLoading(true);
    try {
      await removeUserFromGroup(userId, group.id);
    } catch (error) {
      console.error('从组中移除用户失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const UserCard = ({ user, onRemove }: { user: User; onRemove?: () => void }) => {
    const userGroups = getUserGroups(user.id);
    
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarFallback>{user.avatar || '👤'}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{user.username}</div>
                <div className="text-sm text-muted-foreground">{user.email}</div>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role === 'admin' ? '管理员' : '普通用户'}
                  </Badge>
                  {userGroups.length > 1 && (
                    <Badge variant="outline">
                      {userGroups.length} 个组
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            {onRemove && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemove}
                disabled={loading}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Avatar 
              className="h-6 w-6" 
              style={{ backgroundColor: group.color }}
            >
              <AvatarFallback 
                style={{ backgroundColor: group.color, color: 'white' }}
                className="text-xs"
              >
                {group.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span>{group.name} - 成员管理</span>
          </DialogTitle>
          <DialogDescription>
            管理组成员，添加或移除用户
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索用户..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* 添加新成员 */}
          {filteredAvailableUsers.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">添加成员</h4>
              <div className="flex space-x-2">
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="选择要添加的用户" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredAvailableUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center space-x-2">
                          <span>{user.avatar || '👤'}</span>
                          <span>{user.username}</span>
                          <span className="text-muted-foreground">({user.email})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleAddUser} 
                  disabled={!selectedUserId || loading}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  添加
                </Button>
              </div>
            </div>
          )}

          <Separator />

          {/* 当前成员列表 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">当前成员</h4>
              <Badge variant="secondary">
                {filteredGroupMembers.length} / {groupMembers.length} 人
              </Badge>
            </div>

            {filteredGroupMembers.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-4">
                    <Users className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-2">
                      {searchTerm ? '未找到匹配的成员' : '该组暂无成员'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {filteredGroupMembers.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    onRemove={() => handleRemoveUser(user.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
