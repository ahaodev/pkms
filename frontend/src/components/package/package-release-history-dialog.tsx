import {Download, History, Upload} from 'lucide-react';
import {useState} from 'react';
import {PackageReleaseDialog} from './package-release-dialog';
import {Button} from '@/components/ui/button';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Package} from '@/types/simplified';
import {PackageVersionCard} from './package-version-card';
import {uploadRelease} from "@/lib/api";

interface PackageReleaseHistoryDialogProps {
    open: boolean;
    onClose: () => void;
    package: Package;
    allVersions: Package[];
    visibleVersionsCount: number;
    isLoadingMore: boolean;
    onLoadMore: () => void;
    onDownload: (version: Package) => void;
    onShare: (version: Package) => void;
    onDelete: (version: Package) => void;
}

export function PackageReleaseHistoryDialog({
                                                open,
                                                onClose,
                                                package: packageData,
                                                allVersions,
                                                visibleVersionsCount,
                                                isLoadingMore,
                                                onLoadMore,
                                                onDownload,
                                                onShare,
                                                onDelete
                                            }: PackageReleaseHistoryDialogProps) {
    if (!packageData) return null;

    const visibleVersions = allVersions.slice(0, visibleVersionsCount);
    const hasMore = visibleVersionsCount < allVersions.length;

    const [isReleaseDialogOpen, setIsReleaseDialogOpen] = useState(false);

    return (
        <>
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
                    <DialogHeader className="flex-shrink-0 flex flex-row items-center justify-between">
                        <div>
                            <DialogTitle className="flex items-center">
                                <History className="mr-2 h-5 w-5"/>
                                {packageData.name}
                            </DialogTitle>
                            <DialogDescription className='m-4'>
                                {packageData.name} 的历史版本
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
                            {visibleVersions.map((version) => (
                                <PackageVersionCard
                                    key={version.id}
                                    version={version}
                                    onDownload={onDownload}
                                    onShare={onShare}
                                    onDelete={onDelete}
                                />
                            ))}

                            {hasMore && (
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
                                                加载更多版本 (还有 {allVersions.length - visibleVersionsCount} 个)
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
                packageId={packageData.id}
                packageName={packageData.name}
                onUpload={async (data) => {
                    await uploadRelease(data);
                }}
                isUploading={false}
            />
        </>
    );
}
