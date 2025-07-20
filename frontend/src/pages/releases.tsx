import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { usePackages } from '@/hooks/use-packages';
import { useProjects } from '@/hooks/use-projects';
import { Release } from '@/types/simplified';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Calendar, FileText, Package as PackageIcon, Plus, ArrowLeft } from 'lucide-react';
import { formatFileSize, formatDate } from '@/lib/utils';

export default function ReleasesPage() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  // ...existing code...
  
  const projectId = searchParams.get('projectId');
  const packageId = searchParams.get('packageId');
  
  const { data: projects } = useProjects();
  const { data: packagesData } = usePackages({ projectId: projectId || undefined });
  const packages = packagesData?.data || [];
  
  const selectedProject = projects?.find(p => p.id === projectId);
  const selectedPackage = packages.find(p => p.id === packageId);
  
  // Mock releases data - in real app this would come from an API
  const releases: Release[] = useMemo(() => {
    if (!selectedPackage) return [];
    
    return [
      {
        id: '1',
        packageId: selectedPackage.id,
        version: '2.1.0',
        title: '新功能发布',
        description: '添加了新的用户界面和性能优化',
        filePath: '/releases/app-v2.1.0.apk',
        fileName: 'app-v2.1.0.apk',
        fileSize: 25600000,
        isPrerelease: false,
        isLatest: true,
        isDraft: false,
        downloadCount: 156,
        createdBy: 'admin',
        createdAt: new Date('2024-01-15'),
        publishedAt: new Date('2024-01-15')
      },
      {
        id: '2',
        packageId: selectedPackage.id,
        version: '2.0.1',
        title: '修复版本',
        description: '修复了关键性错误和安全漏洞',
        filePath: '/releases/app-v2.0.1.apk',
        fileName: 'app-v2.0.1.apk',
        fileSize: 24800000,
        isPrerelease: false,
        isLatest: false,
        isDraft: false,
        downloadCount: 89,
        createdBy: 'admin',
        createdAt: new Date('2024-01-10'),
        publishedAt: new Date('2024-01-10')
      },
      {
        id: '3',
        packageId: selectedPackage.id,
        version: '2.0.0',
        title: '重大版本更新',
        description: '全新的架构和用户体验',
        filePath: '/releases/app-v2.0.0.apk',
        fileName: 'app-v2.0.0.apk',
        fileSize: 23400000,
        isPrerelease: false,
        isLatest: false,
        isDraft: false,
        downloadCount: 234,
        createdBy: 'admin',
        createdAt: new Date('2024-01-01'),
        publishedAt: new Date('2024-01-01')
      }
    ];
  }, [selectedPackage]);

  const handleDownload = (release: Release) => {
    window.open(`/api/packages/${release.id}/download`, '_blank');
    toast({
      title: '下载开始',
      description: `开始下载 ${release.fileName}`,
    });
  };

  const handleGoBack = () => {
    if (packageId) {
      // Go back to packages view
      window.history.back();
    } else {
      // Go back to projects view
      window.location.href = '/projects';
    }
  };

  if (!projectId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">发布版本管理</h1>
            <p className="text-muted-foreground">
              请先选择项目和包来查看版本发布
            </p>
          </div>
        </div>
        
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center space-y-2">
              <PackageIcon className="h-12 w-12 text-muted-foreground mx-auto" />
              <div className="text-muted-foreground">请从项目管理开始导航</div>
              <Button onClick={() => window.location.href = '/projects'}>
                前往项目管理
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!packageId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={handleGoBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {selectedProject?.name} - 发布版本管理
              </h1>
              <p className="text-muted-foreground">
                请选择包来查看版本发布
              </p>
            </div>
          </div>
        </div>
        
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center space-y-2">
              <PackageIcon className="h-12 w-12 text-muted-foreground mx-auto" />
              <div className="text-muted-foreground">请选择一个包来查看其版本发布</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={handleGoBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {selectedProject?.name} &gt; {selectedPackage?.name} - 版本发布
            </h1>
            <p className="text-muted-foreground">
              管理包的版本发布和下载
            </p>
          </div>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          新建发布
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总版本数</CardTitle>
            <PackageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{releases.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">最新版本</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{releases.find(r => r.isLatest)?.version || 'N/A'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总下载量</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {releases.reduce((sum, r) => sum + r.downloadCount, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">包类型</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{selectedPackage?.type}</div>
          </CardContent>
        </Card>
      </div>

      {/* Releases List */}
      <div className="space-y-4">
        {releases.map((release) => (
          <Card key={release.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <span>v{release.version}</span>
                      {release.isLatest && (
                        <Badge variant="default">最新</Badge>
                      )}
                      {release.isPrerelease && (
                        <Badge variant="secondary">预发布</Badge>
                      )}
                      {release.isDraft && (
                        <Badge variant="outline">草稿</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{release.title}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleDownload(release)}>
                    <Download className="h-4 w-4 mr-2" />
                    下载
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">{release.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">文件名:</span>
                    <div className="font-medium">{release.fileName}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">文件大小:</span>
                    <div className="font-medium">{formatFileSize(release.fileSize)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">下载次数:</span>
                    <div className="font-medium">{release.downloadCount.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">发布时间:</span>
                    <div className="font-medium">{formatDate(release.createdAt.toISOString())}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {releases.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center space-y-2">
              <PackageIcon className="h-12 w-12 text-muted-foreground mx-auto" />
              <div className="text-muted-foreground">该包暂无版本发布</div>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                创建首个发布
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}