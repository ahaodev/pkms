import {useState} from 'react';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card} from '@/components/ui/card';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Download, Package as PackageIcon, Plus, Share2, Trash2} from 'lucide-react';
import {EmptyList} from '@/components/ui/empty-list';
import {formatDate, formatFileSize} from '@/lib/utils';
import {Release} from '@/types/release.ts';
import {ShareDialog} from '@/components/share-dialog';
import {createShareLink, deleteRelease} from '@/lib/api/releases';
import {toast} from 'sonner';

interface ReleasesViewProps {
    selectedPackage: any;
    releases: Release[];
    searchTerm: string;
    handleCreateRelease: () => void;
    handleDownload: (release: Release) => void;
    onReleaseDeleted?: (releaseId: string) => void;
}

export function Releases({
                             selectedPackage,
                             releases,
                             searchTerm,
                             handleCreateRelease,
                             handleDownload,
                             onReleaseDeleted
                         }: ReleasesViewProps) {
    const [shareDialog, setShareDialog] = useState<{
        isOpen: boolean;
        shareUrl: string;
        packageName: string;
        shareId?: string;
        currentExpiryHours?: number;
    }>({isOpen: false, shareUrl: '', packageName: ''});

    const handleShare = async (release: Release) => {
        try {
            const result = await createShareLink(release.id, {expiryHours: -1}); // 默认永久
            const shareResponse = result.data;
            const fullUrl = `${window.location.origin}/share/${shareResponse.code}`;
            setShareDialog({
                isOpen: true,
                shareUrl: fullUrl,
                packageName: `${selectedPackage?.name} v${release.version_code}`,
                shareId: shareResponse.id,
                currentExpiryHours: shareResponse.expiry_hours
            });
            toast.success('分享链接已创建', {
                description: '分享链接已生成。',
            });
        } catch (error) {
            console.error(error)
            toast.error('创建分享链接失败', {
                description: '无法创建分享链接，请稍后重试。',
            });
        }
    };

    const handleDelete = async (release: Release) => {
        if (!confirm(`确定要删除发布版本 v${release.version_code} 吗？此操作不可恢复。`)) {
            return;
        }

        try {
            await deleteRelease(release.id);
            toast.success('删除成功', {
                description: `发布版本 v${release.version_code} 已被删除。`,
            });
            onReleaseDeleted?.(release.id);
        } catch (error) {
            console.error(error);
            toast.error('删除失败', {
                description: '无法删除该发布版本，请稍后重试。',
            });
        }
    };

    const closeShareDialog = () => {
        setShareDialog({isOpen: false, shareUrl: '', packageName: ''});
    };
    // Filter releases based on search term
    const filteredReleases = releases.filter(release =>
        release.version_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (release.version_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        (release.changelog?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        release.file_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                    {selectedPackage?.name}
                </h2>
                <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{releases.length} 个发布</Badge>
                    <Button onClick={handleCreateRelease}>
                        <Plus className="mr-2 h-4 w-4"/>
                        新建发布
                    </Button>
                </div>

            </div>
            {filteredReleases.length > 0 ? (
                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>版本</TableHead>
                                <TableHead>文件名</TableHead>
                                <TableHead>大小</TableHead>
                                <TableHead>下载次数</TableHead>
                                <TableHead>发布时间</TableHead>
                                <TableHead>变更日志</TableHead>
                                <TableHead className="text-right">操作</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredReleases.map((release) => (
                                <TableRow key={release.id}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{release.version_name}</span>
                                            <span className="text-sm text-muted-foreground">{release.version_code}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono text-sm">{release.file_name}</TableCell>
                                    <TableCell>{formatFileSize(release.file_size)}</TableCell>
                                    <TableCell>{release.download_count.toLocaleString()}</TableCell>
                                    <TableCell>{formatDate(release.created_at.toISOString())}</TableCell>
                                    <TableCell className="max-w-xs">
                                        <div className="truncate text-sm text-muted-foreground" title={release.changelog}>
                                            {release.changelog || '无变更说明'}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end space-x-1">
                                            <Button variant="ghost" size="sm"
                                                    onClick={() => handleShare(release)}
                                                    className="h-8 w-8 p-0">
                                                <Share2 className="h-4 w-4"/>
                                            </Button>
                                            <Button variant="ghost" size="sm"
                                                    onClick={() => handleDownload(release)}
                                                    className="h-8 w-8 p-0">
                                                <Download className="h-4 w-4"/>
                                            </Button>
                                            <Button variant="ghost" size="sm"
                                                    onClick={() => handleDelete(release)}
                                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                                                <Trash2 className="h-4 w-4"/>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            ) : (
                <EmptyList
                    icon={PackageIcon}
                    title={searchTerm ? '未找到匹配的发布版本' : '该包暂无版本发布'}
                    actionText={!searchTerm ? (
                        <div className="flex items-center">
                            <Plus className="mr-2 h-4 w-4"/>
                            创建首个发布
                        </div>
                    ) : undefined}
                    onAction={!searchTerm ? handleCreateRelease : undefined}
                    showAction={!searchTerm}
                />
            )}

            <ShareDialog
                isOpen={shareDialog.isOpen}
                onClose={closeShareDialog}
                shareUrl={shareDialog.shareUrl}
                packageName={shareDialog.packageName}
                shareId={shareDialog.shareId}
                currentExpiryHours={shareDialog.currentExpiryHours}
            />
        </div>
    );
}

