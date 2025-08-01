import {useEffect, useState} from 'react';
import {Check, Copy, Download, ExternalLink} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {toast} from 'sonner';
import QRCode from 'qrcode';
import type {ShareDialogProps} from '@/types';
import {apiClient} from '@/lib/api/api';

/**
 * ShareDialog 组件：用于展示包的分享链接和二维码，支持复制和下载操作
 */

export function ShareDialog({isOpen, onClose, shareUrl, packageName}: ShareDialogProps) {
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
    const [copied, setCopied] = useState(false);
    const [downloading, setDownloading] = useState(false);

    // 生成二维码
    useEffect(() => {
        if (shareUrl && isOpen) {
            QRCode.toDataURL(shareUrl, {
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
    }, [shareUrl, isOpen]);

    const handleCopyUrl = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
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
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
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
                                value={shareUrl}
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
                        <p className="text-xs text-muted-foreground">
                            此链接7天内有效，过期后需要重新生成。
                        </p>
                    </div>

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
