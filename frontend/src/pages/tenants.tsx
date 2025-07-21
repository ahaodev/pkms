import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Globe,
  Plus,
  Users,
  Building,
  Calendar
} from 'lucide-react';

export default function TenantsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - replace with actual API call
  const tenants = [
    {
      id: '1',
      name: '默认租户',
      description: '系统默认租户',
      userCount: 15,
      createdAt: '2024-01-01',
      status: 'active'
    },
    {
      id: '2', 
      name: '企业租户A',
      description: '企业A的专用租户',
      userCount: 8,
      createdAt: '2024-01-15',
      status: 'active'
    }
  ];

  const filteredTenants = tenants.filter(tenant =>
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">租户管理</h1>
          <p className="text-muted-foreground">
            管理系统租户和多租户配置
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          新建租户
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Input
            placeholder="搜索租户..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* Tenants Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTenants.map((tenant) => (
          <Card key={tenant.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{tenant.name}</CardTitle>
                    <CardDescription className="text-sm">{tenant.description}</CardDescription>
                  </div>
                </div>
                <Badge variant={tenant.status === 'active' ? 'default' : 'secondary'}>
                  {tenant.status === 'active' ? '活跃' : '非活跃'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">用户数量</span>
                  <span className="font-medium">{tenant.userCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">创建时间</span>
                  <span className="font-medium">{tenant.createdAt}</span>
                </div>
                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    编辑
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    设置
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTenants.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center space-y-2">
              <Globe className="h-12 w-12 text-muted-foreground mx-auto" />
              <div className="text-muted-foreground">
                {searchTerm ? '未找到匹配的租户' : '暂无租户'}
              </div>
              {!searchTerm && (
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  创建首个租户
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}