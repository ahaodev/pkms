import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Filter, RotateCcw } from 'lucide-react';
import { useProjects } from '@/hooks/use-projects';
import { usePackages } from '@/hooks/use-packages';
import type { ClientAccessFilters as Filters } from '@/types/client-access';

interface ClientAccessFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onReset: () => void;
}

export function ClientAccessFilters({ 
  filters, 
  onFiltersChange, 
  onReset 
}: ClientAccessFiltersProps) {
  const { data: projects = [] } = useProjects();
  const packagesResult = usePackages({
    projectId: filters.project_id
  });
  const packages = packagesResult?.data?.data || [];

  const handleProjectChange = (projectId: string) => {
    onFiltersChange({
      ...filters,
      project_id: projectId === 'all' ? undefined : projectId,
      package_id: undefined, // 重置包选择
    });
  };

  const handlePackageChange = (packageId: string) => {
    onFiltersChange({
      ...filters,
      package_id: packageId === 'all' ? undefined : packageId,
    });
  };

  const handleStatusChange = (status: string) => {
    onFiltersChange({
      ...filters,
      is_active: status === 'all' ? undefined : status === 'active',
    });
  };

  const handleSearchChange = (search: string) => {
    onFiltersChange({
      ...filters,
      search: search || undefined,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          筛选条件
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 搜索框 */}
          <div className="space-y-2">
            <Label htmlFor="search">搜索</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="搜索名称或描述..."
                value={filters.search || ''}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* 项目筛选 */}
          <div className="space-y-2">
            <Label>项目</Label>
            <Select 
              value={filters.project_id || 'all'} 
              onValueChange={handleProjectChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择项目" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部项目</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 包筛选 */}
          <div className="space-y-2">
            <Label>包</Label>
            <Select 
              value={filters.package_id || 'all'} 
              onValueChange={handlePackageChange}
              disabled={!filters.project_id}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择包" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部包</SelectItem>
                {packages.map((pkg) => (
                  <SelectItem key={pkg.id} value={pkg.id}>
                    {pkg.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 状态筛选 */}
          <div className="space-y-2">
            <Label>状态</Label>
            <Select 
              value={
                filters.is_active === undefined 
                  ? 'all' 
                  : filters.is_active 
                    ? 'active' 
                    : 'inactive'
              } 
              onValueChange={handleStatusChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="active">已启用</SelectItem>
                <SelectItem value="inactive">已禁用</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 重置按钮 */}
        <div className="flex justify-end">
          <Button variant="outline" onClick={onReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            重置筛选
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}