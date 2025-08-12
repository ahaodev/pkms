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

/**
 * ShareDialog 组件：用于展示包的分享链接和二维码，支持复制和下载操作
 */

export function ShareDialog({isOpen, onClose, shareUrl, packageName, shareId, currentExpiryHours, onExpiryUpdated}: ShareDialogProps) {
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
                .catch(err => console.error('生成二维码失败:', err));
        }
    }, [fullShareUrl, isOpen]);

    const handleCopyUrl = async () => {
        try {
            await navigator.clipboard.writeText(fullShareUrl);
            setCopied(true);
            toast.success('链接已复制', {
                description: '分享链接已复制到剪贴板。',
            });

            // 2秒后重置复制状态
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error('复制失败', {
                description: '无法复制到剪贴板，请手动复制链接。',
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

            const description = dateString ? `已设置为${dateString}到期` : '已设置为永久';
            toast.success('过期时间已更新', {
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
            
            const errorMessage = err.response?.data?.message || '更新失败，请稍后重试';
            toast.error('更新过期时间失败', {
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
                throw new Error('服务器返回了错误的内容类型，请检查分享链接是否有效');
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

            toast.success('下载成功', {
                description: '文件已开始下载',
            });
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || '下载失败，请稍后重试';
            toast.error('下载失败', {
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
                        <span>分享包</span>
                    </DialogTitle>
                    <DialogDescription>
                        分享 "{packageName}" 的下载链接
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* 下载链接 */}
                    <div className="space-y-2">
                        <Label htmlFor="share-url">下载链接</Label>
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
                                        收起高级设置
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="h-4 w-4" />
                                        高级设置
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
                                                指定过期日期
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
                                                正在更新过期时间...
                                            </div>
                                        )}
                                        
                                        <p className="text-xs text-muted-foreground">
                                            默认为永久分享，勾选可设置具体过期日期
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    {/* 二维码 */}
                    <div className="space-y-2">
                        <Label>二维码</Label>
                        <div className="flex justify-center p-4 bg-white rounded-lg border">
                            {qrCodeUrl ? (
                                <img
                                    src={qrCodeUrl}
                                    alt="下载二维码"
                                    className="w-40 h-40"
                                />
                            ) : (
                                <div className="w-40 h-40 flex items-center justify-center bg-gray-100 rounded">
                                    <span className="text-gray-500">生成中...</span>
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground text-center">
                            扫描二维码即可下载
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
                            {downloading ? '下载中...' : '立即下载'}
                        </Button>
                        <Button
                            onClick={handleCopyUrl}
                            className="flex-1"
                        >
                            {copied ? (
                                <>
                                    <Check className="mr-2 h-4 w-4"/>
                                    已复制
                                </>
                            ) : (
                                <>
                                    <Copy className="mr-2 h-4 w-4"/>
                                    复制链接
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
