import {Download, History, Upload} from 'lucide-react';
import {useEffect, useState} from 'react';
import {PackageReleaseDialog} from './package-release-dialog';
import {Button} from '@/components/ui/button';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Package, Release} from '@/types/simplified';
import {PackageReleaseCard} from '@/components/package';
import {getRelease, uploadRelease} from "@/lib/api";

interface PackageReleaseHistoryDialogProps {
    open: boolean;
    onClose: () => void;
    package: Package;
    visibleVersionsCount: number;
    isLoadingMore: boolean;
    onLoadMore: () => void;
    onDownload: (release: Release) => void;
    onShare: (release: Release) => void;
    onDelete: (release: Release) => void;
}

export function PackageReleaseHistoryDialog({
                                                open,
                                                onClose,
                                                package: pkg,
                                                visibleVersionsCount,
                                                isLoadingMore,
                                                onLoadMore,
                                                onDownload,
                                                onShare,
                                                onDelete
                                            }: PackageReleaseHistoryDialogProps) {
    const [releases, setReleases] = useState<Release[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isReleaseDialogOpen, setIsReleaseDialogOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const fetchReleases = () => {
        if (!pkg?.id) return;
        setLoading(true);
        setError(null);
        getRelease(pkg.id)
            .then((resp) => {
                setReleases(resp.data);
                setError(null);
            })
            .catch(() => {
                setError('获取版本失败');
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchReleases();
    }, [pkg?.id]);

    if (!pkg) return null;

    const visibleVersions = releases.slice(0, visibleVersionsCount);
    const hasMore = visibleVersionsCount < releases.length;

    return (
        <>
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
                    <DialogHeader className="flex-shrink-0 flex flex-row items-center justify-between">
                        <div>
                            <DialogTitle className="flex items-center">
                                <History className="mr-2 h-5 w-5"/>
                                {pkg.name}
                            </DialogTitle>
                            <DialogDescription className='m-4'>
                                {pkg.name} 的发布版本
                            </DialogDescription>
                        </div>
                        <Button
                            variant="default"
                            size="sm"
                            className="mr-2"
                            onClick={() => setIsReleaseDialogOpen(true)}
                        >
                            <Upload className="mr-2 h-4 w-4"/>
                            发布新版本
                        </Button>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto scrollbar-thin">
                        <div className="space-y-4 pr-2">
                            {loading && <div className="text-center py-4">加载中...</div>}
                            {error && <div className="text-center text-red-500 py-4">{error}</div>}
                            {!loading && !error && visibleVersions.map((release) => (
                                <PackageReleaseCard
                                    key={release.id}
                                    release={release}
                                    onDownload={onDownload}
                                    onShare={onShare}
                                    onDelete={onDelete}
                                />
                            ))}

                            {hasMore && !loading && !error && (
                                <div className="flex justify-center pt-4">
                                    <Button
                                        variant="outline"
                                        onClick={onLoadMore}
                                        disabled={isLoadingMore}
                                        className="w-full max-w-xs"
                                    >
                                        {isLoadingMore ? (
                                            <>
                                                <div
                                                    className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"/>
                                                加载中...
                                            </>
                                        ) : (
                                            <>
                                                <Download className="mr-2 h-4 w-4"/>
                                                加载更多版本 (还有 {releases.length - visibleVersionsCount} 个)
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <PackageReleaseDialog
                open={isReleaseDialogOpen}
                onClose={() => setIsReleaseDialogOpen(false)}
                packageId={pkg.id}
                packageName={pkg.name}
                isUploading={isUploading}
                onUpload={async (data: any) => {
                    setIsUploading(true);
                    try {
                        await uploadRelease(data);
                        setIsReleaseDialogOpen(false);
                        fetchReleases(); // 刷新版本列表
                    } catch (e) {
                        // 可选：toast 错误提示
                    } finally {
                        setIsUploading(false);
                    }
                }}
            />
        </>
    );
}
