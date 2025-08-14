import {useEffect, useState} from 'react';
import {Check, Copy, Download, ExternalLink, Clock, ChevronDown, ChevronUp} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {toast} from 'sonner';
import QRCode from 'qrcode';
import type {ShareDialogProps} from '@/types';
import {apiClient} from '@/lib/api/api';
import {sharesApi} from '@/lib/api/shares';
import {useI18n} from '@/contexts/i18n-context';

/**
 * ShareDialog 组件：用于展示包的分享链接和二维码，支持复制和下载操作
 */

export function ShareDialog({isOpen, onClose, shareUrl, packageName, shareId, currentExpiryHours, onExpiryUpdated}: ShareDialogProps) {
    const { t } = useI18n();
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
    const [copied, setCopied] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [selectedExpiryDate, setSelectedExpiryDate] = useState<string>(''); // 空字符串表示永久
    const [updatingExpiry, setUpdatingExpiry] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    // 根据currentExpiryHours初始化过期日期
    useEffect(() => {
        if (currentExpiryHours && currentExpiryHours > 0) {
            // 如果有当前过期小时数，计算对应的日期
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + currentExpiryHours);
            setSelectedExpiryDate(expiryDate.toISOString().split('T')[0]);
        } else {
            // 默认为永久（空字符串）
            setSelectedExpiryDate('');
        }
    }, [currentExpiryHours]);

    // 构建完整的分享URL
    const fullShareUrl = shareUrl.startsWith('http') 
        ? shareUrl 
        : `${window.location.origin}${shareUrl}`;

    // 生成二维码
    useEffect(() => {
        if (shareUrl && isOpen) {
            QRCode.toDataURL(fullShareUrl, {
                width: 200,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            })
                .then(url => setQrCodeUrl(url))
                .catch(err => console.error(t('share.qrCodeGenerateError'), err));
        }
    }, [fullShareUrl, isOpen]);

    const handleCopyUrl = async () => {
        try {
            await navigator.clipboard.writeText(fullShareUrl);
            setCopied(true);
            toast.success(t('share.copySuccess'), {
                description: t('share.copySuccessDescription'),
            });

            // 2秒后重置复制状态
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error(t('share.copyError'), {
                description: t('share.copyErrorDescription'),
            });
        }
    };

    // 获取最小日期（今天）
    const getMinDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const handleExpiryDateChange = async (dateString: string) => {
        setSelectedExpiryDate(dateString);

        // 如果没有shareId，则不调用API
        if (!shareId) {
            return;
        }

        try {
            setUpdatingExpiry(true);
            
            let expiryHours;
            if (!dateString) {
                // 空字符串表示永久
                expiryHours = -1;
            } else {
                // 计算从现在到选定日期的小时数
                const selectedDate = new Date(dateString + 'T23:59:59'); // 设置为当天结束时间
                const now = new Date();
                const diffMs = selectedDate.getTime() - now.getTime();
                expiryHours = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60))); // 至少1小时
            }

            await sharesApi.updateExpiry(shareId, {
                expiry_hours: expiryHours
            });

            const description = dateString ? t('share.expirySetTo', { date: dateString }) : t('share.expirySetToPermanent');
            toast.success(t('share.expiryUpdated'), {
                description,
            });
            
            // Call the success callback if provided
            onExpiryUpdated?.();
        } catch (err: any) {
            // 如果更新失败，回滚到原来的值
            if (currentExpiryHours && currentExpiryHours > 0) {
                const expiryDate = new Date();
                expiryDate.setHours(expiryDate.getHours() + currentExpiryHours);
                setSelectedExpiryDate(expiryDate.toISOString().split('T')[0]);
            } else {
                setSelectedExpiryDate('');
            }
            
            const errorMessage = err.response?.data?.message || t('share.updateError');
            toast.error(t('share.expiryUpdateError'), {
                description: errorMessage,
            });
        } finally {
            setUpdatingExpiry(false);
        }
    };

    const handleDownload = async () => {
        if (!shareUrl) return;

        try {
            setDownloading(true);
            // Extract the share code from the URL
            const shareCode = shareUrl.split('/share/')[1];

            // Use apiClient to download the file with proper blob handling
            const response = await apiClient.get(`/share/${shareCode}`, {
                responseType: 'blob',
            });

            // Check if response is actually HTML (indicates error)
            if (response.data.type === 'text/html') {
                throw new Error(t('share.invalidContentType'));
            }

            // Get filename from Content-Disposition header
            const contentDisposition = response.headers['content-disposition'];
            let filename = 'download';
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename=(.+)/);
                if (filenameMatch) {
                    filename = filenameMatch[1].replace(/"/g, '');
                }
            }
            // Fallback to packageName if no filename in headers
            if (filename === 'download' && packageName) {
                filename = packageName;
            }

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success(t('share.downloadSuccess'), {
                description: t('share.downloadStarted'),
            });
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || t('share.downloadError');
            toast.error(t('share.downloadFailed'), {
                description: errorMessage,
            });
        } finally {
            setDownloading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose} modal={true}>
            <DialogContent 
                className="max-w-md"
                onEscapeKeyDown={onClose}
                onInteractOutside={onClose}
            >
                <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                        <ExternalLink className="h-5 w-5"/>
                        <span>{t('share.sharePackage')}</span>
                    </DialogTitle>
                    <DialogDescription>
                        {t('share.sharePackageDescription', { packageName })}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* 下载链接 */}
                    <div className="space-y-2">
                        <Label htmlFor="share-url">{t('share.downloadLink')}</Label>
                        <div className="flex space-x-2">
                            <Input
                                id="share-url"
                                value={fullShareUrl}
                                readOnly
                                className="flex-1"
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCopyUrl}
                                className="px-3"
                            >
                                {copied ? (
                                    <Check className="h-4 w-4 text-green-600"/>
                                ) : (
                                    <Copy className="h-4 w-4"/>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* 高级设置按钮 */}
                    {shareId && (
                        <div className="space-y-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowAdvanced(!showAdvanced)}
                                className="flex items-center gap-2 text-muted-foreground hover:text-foreground p-0 h-auto"
                            >
                                {showAdvanced ? (
                                    <>
                                        <ChevronUp className="h-4 w-4" />
                                        {t('share.hideAdvancedSettings')}
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="h-4 w-4" />
                                        {t('share.advancedSettings')}
                                    </>
                                )}
                            </Button>

                            {/* 过期时间设置（仅在展开高级设置时显示） */}
                            {showAdvanced && (
                                <div className="space-y-3 pt-2 border-t">
                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id="custom-date"
                                                checked={!!selectedExpiryDate}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        // 勾选时设置默认为明天
                                                        const tomorrow = new Date();
                                                        tomorrow.setDate(tomorrow.getDate() + 1);
                                                        handleExpiryDateChange(tomorrow.toISOString().split('T')[0]);
                                                    } else {
                                                        // 不勾选时设置为永久
                                                        handleExpiryDateChange('');
                                                    }
                                                }}
                                                disabled={updatingExpiry}
                                                className="h-4 w-4"
                                            />
                                            <Label htmlFor="custom-date" className="text-sm">
                                                {t('share.setExpiryDate')}
                                            </Label>
                                        </div>
                                        
                                        {selectedExpiryDate && (
                                            <div className="ml-6">
                                                <Input
                                                    type="date"
                                                    value={selectedExpiryDate}
                                                    onChange={(e) => handleExpiryDateChange(e.target.value)}
                                                    min={getMinDate()}
                                                    disabled={updatingExpiry}
                                                    className="w-full"
                                                />
                                            </div>
                                        )}
                                        
                                        {updatingExpiry && (
                                            <div className="flex items-center text-sm text-muted-foreground">
                                                <Clock className="h-3 w-3 mr-1 animate-spin" />
                                                {t('share.updatingExpiry')}
                                            </div>
                                        )}
                                        
                                        <p className="text-xs text-muted-foreground">
                                            {t('share.permanentShareNote')}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    {/* 二维码 */}
                    <div className="space-y-2">
                        <Label>{t('share.qrCode')}</Label>
                        <div className="flex justify-center p-4 bg-white rounded-lg border">
                            {qrCodeUrl ? (
                                <img
                                    src={qrCodeUrl}
                                    alt="下载二维码"
                                    className="w-40 h-40"
                                />
                            ) : (
                                <div className="w-40 h-40 flex items-center justify-center bg-gray-100 rounded">
                                    <span className="text-gray-500">{t('share.generating')}</span>
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground text-center">
                            {t('share.scanToDownload')}
                        </p>
                    </div>


                    {/* 操作按钮 */}
                    <div className="flex space-x-2">
                        <Button
                            variant="outline"
                            onClick={handleDownload}
                            disabled={downloading}
                            className="flex-1"
                        >
                            <Download className="mr-2 h-4 w-4"/>
                            {downloading ? t('share.downloading') : t('share.downloadNow')}
                        </Button>
                        <Button
                            onClick={handleCopyUrl}
                            className="flex-1"
                        >
                            {copied ? (
                                <>
                                    <Check className="mr-2 h-4 w-4"/>
                                    {t('share.copied')}
                                </>
                            ) : (
                                <>
                                    <Copy className="mr-2 h-4 w-4"/>
                                    {t('share.copyLink')}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
