import { useState, useEffect, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import {useDeletePackage, useGenerateShareLink, usePackages} from '@/hooks/use-packages';
import { useProjects } from '@/hooks/use-projects';
import {Package, Release} from '@/types/simplified';
import { ShareDialog } from '@/components/share-dialog';
import {
  PackageLoadingView,
  PackageList,
  PackageEmptyView,
  PackageCreateDialog,
  PackageHeader,
  SEARCH_DEBOUNCE_MS,
  getPackageKey,
  getTypeIcon
} from '@/components/package';
import { PackageToolbar } from '@/components/package/PackageToolbar';
import { PackagePagination } from '@/components/package/PackagePagination';

/**
 * 包管理页：支持包的上传、搜索、分组、分享、删除等操作，支持多视图切换
 */

export default function PackagesPage() {
  const { toast } = useToast();
  
  // 基础状态
  const [selectedType, setSelectedType] = useState<Package['type'] | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFiltering, setIsFiltering] = useState(false);
  // 分页相关状态
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  
  // 上传相关状态
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  // 分享相关状态
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [sharingPackage, setSharingPackage] = useState<Release | null>(null);


  // 数据获取
  const { data: projects } = useProjects();
  // usePackages 需支持分页参数
  const { data: pageData, isLoading, error } = usePackages({ 
    page, 
    pageSize, 
    type: selectedType, 
    search: debouncedSearchTerm || undefined 
  });
  const packages = useMemo(() => pageData?.data || [], [pageData?.data]);
  const totalPages = pageData?.totalPages || 1;
  const deletePackage = useDeletePackage();
  const generateShareLink = useGenerateShareLink();

  // 搜索防抖处理
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setIsFiltering(false);
    }, SEARCH_DEBOUNCE_MS);

    if (searchTerm !== debouncedSearchTerm) {
      setIsFiltering(true);
    }

    return () => clearTimeout(timer);
  }, [searchTerm, debouncedSearchTerm]);

  // 包分组：按名称和类型组合作为 key
  const groupedPackages = useMemo(() => {
    const grouped: Record<string, Package[]> = {};
    const packagesArray = packages || [];
    packagesArray.forEach((pkg) => {
      const key = getPackageKey(pkg);
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(pkg);
    });
    return grouped;
  }, [packages]);

  // 计算包统计
  const packageCounts = useMemo(() => {
    const counts = {
      total: 0,
      android: 0,
      web: 0,
      desktop: 0,
      linux: 0,
      other: 0
    };

    // 基于去重后的包进行统计
    const uniquePackages = new Set<string>();
    const packagesArray = packages || [];
    packagesArray.forEach((pkg: Package) => {
      const key = getPackageKey(pkg);
      if (!uniquePackages.has(key)) {
        uniquePackages.add(key);
        counts.total++;
        counts[pkg.type as keyof typeof counts]++;
      }
    });

    return counts;
  }, [packages]);

  // 获取版本数量
  const getVersionCount = (pkg: Package) => {
    const key = getPackageKey(pkg);
    return groupedPackages[key]?.length || 1;
  };

  // 删除处理
  const handleDelete = async (pkg: Package) => {
    if (!confirm(`确定要删除包 "${pkg.name}" 吗？`)) {
      return;
    }

    try {
      await deletePackage.mutateAsync(pkg.id);
      toast({
        title: '删除成功',
        description: `包 "${pkg.name}" 已成功删除。`,
      });
    } catch {
      toast({
        variant: 'destructive',
        title: '删除失败',
        description: '包删除失败，请重试。',
      });
    }
  };

  // 分享处理
  const handleShare = async (release: Release) => {
    try {
      const response = await generateShareLink.mutateAsync({ packageId: release.id });
      setShareUrl(response.share_url);
      setSharingPackage(release);
      setIsShareDialogOpen(true);
    } catch {
      toast({
        variant: 'destructive',
        title: '分享失败',
        description: '生成分享链接失败，请重试。',
      });
    }
  };



  if (isLoading) {
    return <PackageLoadingView />;
  }

  if (error) {
    console.error('PackagesPage - error:', error);
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">加载失败</h3>
          <p className="text-gray-500">无法加载包列表，请检查网络连接或刷新页面重试。</p>
          <p className="text-sm text-red-500 mt-2">错误信息: {error?.message || '未知错误'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-200px)]">
      <div className="space-y-6 flex-1">
        {/* 页面头部 */}
        <PackageHeader onCreatePackage={() => setIsUploadDialogOpen(true)} />

        {/* 工具栏 */}
        <PackageToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedType={selectedType || 'all'}
          onTypeChange={(value: string) => setSelectedType(value === 'all' ? undefined : value as Package['type'])}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          packageCounts={packageCounts}
          isFiltering={isFiltering}
        />

        <PackageList
          displayPackages={packages}
          viewMode={viewMode}
          isFiltering={isFiltering}
          getVersionCount={getVersionCount}
          getTypeIcon={getTypeIcon}
          handleShare={handleShare}
          handleDelete={handleDelete}
        />

        {packages.length === 0 && !isLoading && (
          <PackageEmptyView searchTerm={debouncedSearchTerm} />
        )}
      </div>

      {/* 分页组件始终在底部 */}
      <div className="mt-auto">
        {/* 强制更新 */}
        <PackagePagination
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      <PackageCreateDialog
        open={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        projects={projects}
      />

      <ShareDialog
        isOpen={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
        shareUrl={shareUrl}
        packageName={sharingPackage?.id || ''}
      />

    </div>
  );
}
