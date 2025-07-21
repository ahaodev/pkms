import {useState} from 'react';
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
import {formatFileSize} from '../lib/package-utils.tsx';

interface PackageReleaseDialogProps {
    open: boolean;
    onClose: () => void;
    onUpload: (data: ReleaseUpload) => Promise<void>;
    packageId: string;
    packageName: string;
    uploadProgress?: UploadProgress | null;
    isUploading: boolean;
}

export function PackageReleaseDialog({
                                         open,
                                         onClose,
                                         onUpload,
                                         packageId,
                                         packageName,
                                         uploadProgress,
                                         isUploading
                                     }: PackageReleaseDialogProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [formData, setFormData] = useState<Omit<ReleaseUpload, 'file'>>({
        package_id: packageId,
        name: packageName,
        type: 'android',
        versionName: '',
        versionCode: '',
        changelog: '',
    });

    console.log(packageId, packageName, uploadProgress, isUploading);

    const handleUpload = async () => {
        if (!selectedFile) return;

        try {
            await onUpload({
                ...formData,
                file: selectedFile
            });

            // 重置表单
            setSelectedFile(null);
            setFormData({
                package_id: packageId,
                name: '',
                type: 'android',
                versionName: '',
                versionCode: '',
                changelog: '',
            });
        } catch (error) {
            console.error(error);
        }
    };

    const handleClose = () => {
        if (!isUploading) {
            setSelectedFile(null);
            setFormData({
                package_id: packageId,
                name: packageName,
                type: 'android',
                versionCode: '',
                versionName: '',
                changelog: '',
            });
            onClose();
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>发布新版本</DialogTitle>
                    <DialogDescription>
                        上传一个新的软件包版本。
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="file">文件</Label>
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
                        <Label htmlFor="type">类型</Label>
                        <Select
                            value={formData.type}
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
                        <Label htmlFor="versionName">版本名称</Label>
                        <Input
                            id="versionName"
                            value={formData.versionName}
                            onChange={(e) => setFormData({...formData, versionName: e.target.value})}
                            placeholder="1.0.0-tab-beta.apk"
                            disabled={isUploading}
                        />
                    </div>
                    <div>
                        <Label htmlFor="versionCode">版本号</Label>
                        <Input
                            id="versionCode"
                            value={formData.versionCode}
                            onChange={(e) => setFormData({...formData, versionCode: e.target.value})}
                            placeholder="1.0.0"
                            disabled={isUploading}
                        />
                    </div>

                    <div>
                        <Label htmlFor="changelog">更新日志</Label>
                        <Textarea
                            id="changelog"
                            value={formData.changelog}
                            onChange={(e) => setFormData({...formData, changelog: e.target.value})}
                            placeholder="此版本的更新内容"
                            disabled={isUploading}
                        />
                    </div>

                    {uploadProgress && (
                        <div>
                            <Label>上传进度</Label>
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
                        取消
                    </Button>
                    <Button
                        onClick={handleUpload}
                        disabled={!selectedFile || !formData.versionCode || !formData.versionName || isUploading}
                    >
                        {isUploading ? '上传中...' : '发布'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
