import {useState} from 'react';
import {Badge} from '@/components/ui/badge.tsx';
import {Button} from '@/components/ui/button.tsx';
import {Card} from '@/components/ui/card.tsx';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table.tsx';
import {Download, Package as PackageIcon, Plus, Share2, Trash2} from 'lucide-react';
import {EmptyList} from '@/components/empty-list.tsx';
import {formatDate, formatFileSize} from '@/lib/utils.tsx';
import {Release} from '@/types/release.ts';
import {ShareDialog} from '@/components/share-dialog.tsx';
import {createShareLink, deleteRelease} from '@/lib/api/releases.ts';
import {toast} from 'sonner';
import {useI18n} from '@/contexts/i18n-context.tsx';

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
    const { t } = useI18n();
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
            toast.success(t('release.shareCreated'), {
                description: t('release.shareCreatedDescription'),
            });
        } catch (error) {
            console.error(error)
            toast.error(t('release.shareCreateError'), {
                description: t('release.shareCreateErrorDescription'),
            });
        }
    };

    const handleDelete = async (release: Release) => {
        if (!confirm(t('release.deleteConfirm', { version: release.version_code }))) {
            return;
        }

        try {
            await deleteRelease(release.id);
            toast.success(t('release.deleteSuccess'), {
                description: t('release.deleteSuccessDescription', { version: release.version_code }),
            });
            onReleaseDeleted?.(release.id);
        } catch (error) {
            console.error(error);
            toast.error(t('release.deleteError'), {
                description: t('release.deleteErrorDescription'),
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
                    <Badge variant="secondary">{releases.length} {t('release.count')}</Badge>
                    <Button onClick={handleCreateRelease}>
                        <Plus className="mr-2 h-4 w-4"/>
                        {t('release.newRelease')}
                    </Button>
                </div>

            </div>
            {filteredReleases.length > 0 ? (
                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('release.version')}</TableHead>
                                <TableHead>{t('release.fileName')}</TableHead>
                                <TableHead>{t('release.size')}</TableHead>
                                <TableHead>{t('release.downloadCount')}</TableHead>
                                <TableHead>{t('release.publishTime')}</TableHead>
                                <TableHead>{t('release.changelog')}</TableHead>
                                <TableHead className="text-right">{t('release.actions')}</TableHead>
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
                                            {release.changelog || t('release.noChangelog')}
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
                    title={searchTerm ? t('release.noReleasesFound') : t('release.noReleases')}
                    actionText={!searchTerm ? (
                        <div className="flex items-center">
                            <Plus className="mr-2 h-4 w-4"/>
                            {t('release.createFirstRelease')}
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

