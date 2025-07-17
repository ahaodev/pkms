import {useEffect, useState} from 'react';
import {Check, Copy, Download, ExternalLink} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {useToast} from '@/hooks/use-toast';
import QRCode from 'qrcode';
import type {ShareDialogProps} from '@/types';

/**
 * ShareDialog 组件：用于展示包的分享链接和二维码，支持复制和下载操作
 */

export function ShareDialog({isOpen, onClose, shareUrl, packageName}: ShareDialogProps) {
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
    const [copied, setCopied] = useState(false);
    const {toast} = useToast();

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
            toast({
                title: '链接已复制',
                description: '分享链接已复制到剪贴板。',
            });

            // 2秒后重置复制状态
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast({
                variant: 'destructive',
                title: '复制失败',
                description: '无法复制到剪贴板，请手动复制链接。',
            });
        }
    };

    const handleDownload = () => {
        window.open(shareUrl, '_blank');
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
                            className="flex-1"
                        >
                            <Download className="mr-2 h-4 w-4"/>
                            立即下载
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
