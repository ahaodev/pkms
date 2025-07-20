import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '@/hooks/use-projects';
import { usePackages } from '@/hooks/use-packages';
import { ExtendedPackage } from '@/types/simplified';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { 
  FolderOpen, 
  Package as PackageIcon, 
  ChevronRight,
  Search,
  Plus
} from 'lucide-react';

export default function HierarchyPage() {
  const navigate = useNavigate();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: projects } = useProjects();
  const { data: packagesData } = usePackages({ 
    projectId: selectedProjectId || undefined 
  });
  const packages: ExtendedPackage[] = packagesData?.data || [];
  
  const selectedProject = projects?.find(p => p.id === selectedProjectId);
  
  const filteredProjects = projects?.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];
  
  const filteredPackages = packages.filter(pkg =>
    pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProjectSelect = (projectId: string) => {
    if (selectedProjectId === projectId) {
      setSelectedProjectId(null);
    } else {
      setSelectedProjectId(projectId);
    }
  };

  const handlePackageSelect = (packageId: string) => {
    if (selectedProjectId) {
      navigate(`/releases?projectId=${selectedProjectId}&packageId=${packageId}`);
    }
  };

  const handleViewAllReleases = () => {
    if (selectedProjectId) {
      navigate(`/releases?projectId=${selectedProjectId}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">项目包管理</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            新建项目
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="搜索项目或包..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedProjectId(null)}
                className="p-0 h-auto font-normal"
              >
                项目
              </Button>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {selectedProject && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{selectedProject.name}</BreadcrumbPage>
              </BreadcrumbItem>
              {filteredPackages.length > 0 && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleViewAllReleases}
                        className="p-0 h-auto font-normal text-primary hover:text-primary/80"
                      >
                        版本
                      </Button>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </>
              )}
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Content */}
      <div className="grid gap-6">
        {!selectedProjectId ? (
          // Projects View
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">选择项目</h2>
              <Badge variant="secondary">{filteredProjects.length} 个项目</Badge>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => (
                <Card 
                  key={project.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleProjectSelect(project.id)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3">
                      <FolderOpen className="h-5 w-5 text-blue-600" />
                      <span>{project.name}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
                    </CardTitle>
                    <CardDescription>{project.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">包数量</span>
                      <Badge variant="outline">{project.packageCount || 0}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {filteredProjects.length === 0 && (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center space-y-2">
                    <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto" />
                    <div className="text-muted-foreground">
                      {searchTerm ? '未找到匹配的项目' : '暂无项目'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          // Packages View
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {selectedProject?.name} - 选择包
              </h2>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">{filteredPackages.length} 个包</Badge>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  新建包
                </Button>
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredPackages.map((pkg) => (
                <Card 
                  key={pkg.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handlePackageSelect(pkg.id)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3">
                      <PackageIcon className="h-5 w-5 text-green-600" />
                      <span>{pkg.name}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
                    </CardTitle>
                    <CardDescription>{pkg.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">类型</span>
                        <Badge variant="outline" className="capitalize">{pkg.type}</Badge>
                      </div>
                      {pkg.version && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">最新版本</span>
                          <Badge variant="default">v{pkg.version}</Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {filteredPackages.length === 0 && (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center space-y-2">
                    <PackageIcon className="h-12 w-12 text-muted-foreground mx-auto" />
                    <div className="text-muted-foreground">
                      {searchTerm ? '未找到匹配的包' : '该项目暂无包'}
                    </div>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      创建首个包
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}