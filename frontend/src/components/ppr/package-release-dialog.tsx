import {useEffect, useState} from 'react';
import {Globe, Monitor, Smartphone} from 'lucide-react';
import {Button} from '@/components/ui/button.tsx';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog.tsx';
import {Label} from '@/components/ui/label.tsx';
import {Input} from '@/components/ui/input.tsx';
import {Textarea} from '@/components/ui/textarea.tsx';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select.tsx';
import {Progress} from '@/components/ui/progress.tsx';
import {ReleaseUpload, UploadProgress} from '@/types/release.ts';
import {formatFileSize} from '@/lib/utils.tsx';
import {uploadRelease} from '@/lib/api/packages.ts';
import {toast} from 'sonner';
import {useI18n} from '@/contexts/i18n-context.tsx';

interface PackageReleaseDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void; // Callback when upload succeeds
    packageId: string;
    packageName: string;
    packageType: string;
}

export function PackageReleaseDialog({
                                         open,
                                         onClose,
                                         onSuccess,
                                         packageId,
                                         packageType
                                     }: PackageReleaseDialogProps) {
    const {t} = useI18n();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [formData, setFormData] = useState<Omit<ReleaseUpload, 'file'>>({
        package_id: packageId,
        version_name: '',
        version_code: '',
        tag_name: '',
        changelog: '',
    });

    const parseAPKInfo = async (file: File) => {
        if (!file.name.toLowerCase().endsWith('.apk') || packageType !== 'android') {
            return;
        }

        try {
            if (typeof window.AppInfoParser === 'undefined') {
                return;
            }

            const parser = new window.AppInfoParser(file);
            const result = await parser.parse();

            if (result && result.versionName && result.versionCode) {
                setFormData(prev => ({
                    ...prev,
                    version_name: result.versionName || '',
                    version_code: result.versionCode?.toString() || '',
                }));
            }
        } catch (error) {
            // Silently fail APK parsing
            console.error(error);
        }
    };

    useEffect(() => {
        if (selectedFile) {
            parseAPKInfo(selectedFile);
        }
    }, [selectedFile, packageType]);

    const handleUpload = async () => {
        if (!selectedFile) return;

        setIsUploading(true);
        setUploadProgress({loaded: 0, total: selectedFile.size, percentage: 0});

        try {
            const uploadData: ReleaseUpload = {
                ...formData,
                file: selectedFile
            };

            await uploadRelease(uploadData, (progress) => {
                setUploadProgress(progress);
            });

            toast.success(t('release.publishSuccess', {version: formData.version_name}));

            // 重置表单
            resetForm();
            onSuccess?.();
            onClose();
        } catch (error: any) {
            console.error('Upload failed:', error);
            toast.error(error.response?.data?.message || error.message || t('release.publishError'));
        } finally {
            setIsUploading(false);
            setUploadProgress(null);
        }
    };

    const resetForm = () => {
        setSelectedFile(null);
        setFormData({
            package_id: packageId,
            version_name: '',
            version_code: '',
            tag_name: '',
            changelog: '',
        });
    };

    const handleClose = () => {
        if (!isUploading) {
            resetForm();
            onClose();
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{t('release.title')}</DialogTitle>
                    <DialogDescription>
                        {t('release.description')}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="file">{t('release.file')}</Label>
                        <Input
                            id="file"
                            type="file"
                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                            disabled={isUploading}
                        />
                        {selectedFile && (
                            <p className="text-sm text-muted-foreground mt-1">
                                {selectedFile.name} ({formatFileSize(selectedFile.size)})
                            </p>
                        )}
                    </div>

                    {/* 类型选择禁止选择 */}
                    <div>
                        <Label htmlFor="type">{t('package.type')}</Label>
                        <Select
                            value={packageType}
                            disabled
                        >
                            <SelectTrigger>
                                <SelectValue/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="android">
                                    <div className="flex items-center">
                                        <Smartphone className="mr-2 h-4 w-4"/>
                                        Android
                                    </div>
                                </SelectItem>
                                <SelectItem value="web">
                                    <div className="flex items-center">
                                        <Globe className="mr-2 h-4 w-4"/>
                                        Web
                                    </div>
                                </SelectItem>
                                <SelectItem value="desktop">
                                    <div className="flex items-center">
                                        <Monitor className="mr-2 h-4 w-4"/>
                                        Desktop
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="versionName">{t('release.versionName')}</Label>
                        <Input
                            id="versionName"
                            value={formData.version_name}
                            onChange={(e) => setFormData({...formData, version_name: e.target.value})}
                            placeholder="1.0.0-tab-beta.apk"
                            disabled={isUploading}
                        />
                    </div>
                    <div>
                        <Label htmlFor="versionCode">{t('release.versionCode')}</Label>
                        <Input
                            id="versionCode"
                            value={formData.version_code}
                            onChange={(e) => setFormData({...formData, version_code: e.target.value})}
                            placeholder="1.0.0"
                            disabled={isUploading}
                        />
                    </div>

                    <div>
                        <Label htmlFor="changelog">{t('release.changelog')}</Label>
                        <Textarea
                            id="changelog"
                            value={formData.changelog}
                            onChange={(e) => setFormData({...formData, changelog: e.target.value})}
                            placeholder={t('release.changelogPlaceholder')}
                            disabled={isUploading}
                        />
                    </div>

                    {uploadProgress && (
                        <div>
                            <Label>{t('release.uploadProgress')}</Label>
                            <Progress value={uploadProgress.percentage} className="mt-2"/>
                            <p className="text-sm text-muted-foreground mt-1">
                                {uploadProgress.percentage.toFixed(1)}%
                                ({formatFileSize(uploadProgress.loaded)} / {formatFileSize(uploadProgress.total)})
                            </p>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={isUploading}>
                        {t('common.cancel')}
                    </Button>
                    <Button
                        onClick={handleUpload}
                        disabled={!selectedFile || !formData.version_code || !formData.version_name || isUploading}
                    >
                        {isUploading ? t('release.uploading') : t('release.publish')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
