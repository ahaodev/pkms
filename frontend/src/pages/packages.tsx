import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { usePackages, useUploadPackage, useDeletePackage, useGenerateShareLink } from '@/hooks/use-packages';
import { useProjects } from '@/hooks/use-projects';
import { Package, PackageUpload, UploadProgress } from '@/types/simplified';
import type { PageResponse } from '@/types/api-response';
import { ShareDialog } from '@/components/share-dialog';
import {
  PackageHeader,
  PackageLoadingView,
  PackageFilterControls,
  PackageList,
  PackageEmptyView,
  PackageUploadDialog,
  PackageVersionHistoryDialog,
  SEARCH_DEBOUNCE_MS,
  VERSIONS_PER_PAGE,
  compareVersions,
  getPackageKey,
  formatFileSize,
  getTypeIcon
} from '@/components/package';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from '@/components/ui/pagination';

/**
 * 包管理页：支持包的上传、搜索、分组、分享、删除等操作，支持多视图切换
 */

export default function PackagesPage() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  // 基础状态
  const [selectedProjectId, setSelectedProjectId] = useState(searchParams.get('projectId') || '');
  const [selectedType, setSelectedType] = useState<Package['type'] | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFiltering, setIsFiltering] = useState(false);
  // 分页相关状态
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  
  // 上传相关状态
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  
  // 分享相关状态
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [sharingPackage, setSharingPackage] = useState<Package | null>(null);

  // 版本历史相关状态
  const [isVersionHistoryDialogOpen, setIsVersionHistoryDialogOpen] = useState(false);
  const [versionHistoryPackage, setVersionHistoryPackage] = useState<Package | null>(null);
  const [versionHistoryPage, setVersionHistoryPage] = useState(1);
  const [isLoadingMoreVersions, setIsLoadingMoreVersions] = useState(false);

  // 加载更多版本
  const loadMoreVersions = () => {
    setIsLoadingMoreVersions(true);
    setTimeout(() => {
      setVersionHistoryPage(prev => prev + 1);
      setIsLoadingMoreVersions(false);
    }, 500);
  };

  // 数据获取
  const { data: projects } = useProjects();
  // usePackages 需支持分页参数
  const { data: pageData, isLoading } = usePackages({ page, pageSize, projectId: selectedProjectId, type: selectedType, search: debouncedSearchTerm });
  const packages = (pageData as PageResponse<Package> | undefined)?.data || [];
  const totalPages = (pageData as PageResponse<Package> | undefined)?.totalPages || 1;
  const uploadPackage = useUploadPackage((progress) => setUploadProgress(progress));
  const deletePackage = useDeletePackage();
  const generateShareLink = useGenerateShareLink();

  // 调试信息
  console.log('PackagesPage - packages:', packages);
  console.log('PackagesPage - isLoading:', isLoading);

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

    // 对每个组内的版本进行排序
    Object.keys(grouped).forEach((key) => {
      grouped[key].sort((a, b) => compareVersions(a.version, b.version));
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

  // 上传处理
  const handleUpload = async (data: PackageUpload) => {
    try {
      await uploadPackage.mutateAsync(data);
      
      toast({
        title: '上传成功',
        description: `包 "${data.name}" 已成功上传。`,
      });
      
      setIsUploadDialogOpen(false);
      setUploadProgress(null);
    } catch {
      toast({
        variant: 'destructive',
        title: '上传失败',
        description: '包上传失败，请重试。',
      });
    }
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
  const handleShare = async (pkg: Package) => {
    try {
      const response = await generateShareLink.mutateAsync({ packageId: pkg.id });
      setShareUrl(response.share_url);
      setSharingPackage(pkg);
      setIsShareDialogOpen(true);
    } catch {
      toast({
        variant: 'destructive',
        title: '分享失败',
        description: '生成分享链接失败，请重试。',
      });
    }
  };

  // 版本历史处理
  const handleVersionHistory = (pkg: Package) => {
    setVersionHistoryPackage(pkg);
    setVersionHistoryPage(1);
    setIsVersionHistoryDialogOpen(true);
  };

  // 版本删除处理
  const handleDeleteVersion = async (pkg: Package) => {
    if (!confirm(`确定要删除版本 "${pkg.version}" 吗？`)) {
      return;
    }

    try {
      await deletePackage.mutateAsync(pkg.id);
      toast({
        title: '版本删除成功',
        description: `版本 "${pkg.version}" 已成功删除。`,
      });
      
      // 如果是当前查看的包的版本，重新获取版本列表
      if (versionHistoryPackage && getPackageKey(pkg) === getPackageKey(versionHistoryPackage)) {
        // 刷新版本历史
        const key = getPackageKey(pkg);
        const remainingVersions = groupedPackages[key]?.filter(v => v.id !== pkg.id) || [];
        if (remainingVersions.length === 0) {
          setIsVersionHistoryDialogOpen(false);
        }
      }
    } catch {
      toast({
        variant: 'destructive',
        title: '删除失败',
        description: '版本删除失败，请重试。',
      });
    }
  };

  // 下载处理
  const handleDownload = (pkg: Package) => {
    window.open(`/api/packages/${pkg.id}/download`, '_blank');
  };

  if (isLoading) {
    return <PackageLoadingView />;
  }

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <PackageHeader onUploadClick={() => setIsUploadDialogOpen(true)} />

      {/* 筛选控制器 */}
      <PackageFilterControls
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedProjectId={selectedProjectId || 'all'}
        onProjectChange={(value: string) => setSelectedProjectId(value === 'all' ? '' : value)}
        selectedType={selectedType || 'all'}
        onTypeChange={(value: string) => setSelectedType(value === 'all' ? undefined : value as Package['type'])}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        projects={projects}
        packageCounts={packageCounts}
        isFiltering={isFiltering}
      />

      {/* 包列表 */}
      <PackageList 
        displayPackages={packages}
        viewMode={viewMode}
        isFiltering={isFiltering}
        getVersionCount={getVersionCount}
        getTypeIcon={getTypeIcon}
        formatFileSize={formatFileSize}
        handleVersionHistory={handleVersionHistory}
        handleShare={handleShare}
        handleDelete={handleDelete}
      />

      {/* 空状态 */}
      {packages.length === 0 && !isLoading && (
        <PackageEmptyView searchTerm={debouncedSearchTerm} />
      )}

      {/* 上传对话框 */}
      <PackageUploadDialog
        open={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        onUpload={handleUpload}
        projects={projects}
        uploadProgress={uploadProgress}
        isUploading={uploadPackage.isPending}
        initialProjectId={selectedProjectId}
      />

      {/* 分享对话框 */}
      <ShareDialog
        isOpen={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
        shareUrl={shareUrl}
        packageName={sharingPackage?.name || ''}
      />

      {/* 版本历史对话框 */}
      {versionHistoryPackage && (
        <PackageVersionHistoryDialog
          open={isVersionHistoryDialogOpen}
          onClose={() => setIsVersionHistoryDialogOpen(false)}
          package={versionHistoryPackage}
          allVersions={groupedPackages[getPackageKey(versionHistoryPackage)] || []}
          visibleVersionsCount={versionHistoryPage * VERSIONS_PER_PAGE}
          isLoadingMore={isLoadingMoreVersions}
          onLoadMore={loadMoreVersions}
          onDownload={handleDownload}
          onShare={handleShare}
          onDelete={handleDeleteVersion}
        />
      )}

      {/* 分页控件 - shadcn ui，始终在页脚 */}
      <div className="flex justify-center mt-8 mb-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => page > 1 && setPage(page - 1)}
                aria-disabled={page <= 1}
                tabIndex={page <= 1 ? -1 : 0}
              />
            </PaginationItem>
            {/* 页码数字 */}
            {Array.from({ length: totalPages }).map((_, idx) => {
              if (
                idx + 1 === 1 ||
                idx + 1 === totalPages ||
                Math.abs(idx + 1 - page) <= 2
              ) {
                return (
                  <PaginationItem key={idx}>
                    <PaginationLink
                      isActive={page === idx + 1}
                      onClick={() => setPage(idx + 1)}
                    >
                      {idx + 1}
                    </PaginationLink>
                  </PaginationItem>
                );
              }
              if (
                (idx + 1 === page - 3 && page - 3 > 1) ||
                (idx + 1 === page + 3 && page + 3 < totalPages)
              ) {
                return (
                  <PaginationItem key={idx}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }
              return null;
            })}
            <PaginationItem>
              <PaginationNext
                onClick={() => page < totalPages && setPage(page + 1)}
                aria-disabled={page >= totalPages}
                tabIndex={page >= totalPages ? -1 : 0}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
