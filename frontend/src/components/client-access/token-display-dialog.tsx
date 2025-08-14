import {useState} from 'react';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Badge} from '@/components/ui/badge';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {AlertTriangle, Copy, Eye, EyeOff, Shield} from 'lucide-react';
import {toast} from 'sonner';
import {useI18n} from '@/contexts/i18n-context';
import type {ClientAccess} from '@/types/client-access';

interface TokenDisplayDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    clientAccess: ClientAccess | null;
}

export function TokenDisplayDialog({
                                       open,
                                       onOpenChange,
                                       clientAccess,
                                   }: TokenDisplayDialogProps) {
    const {t} = useI18n();
    const [showToken, setShowToken] = useState(false);

    const handleCopyToken = async () => {
        if (!clientAccess) return;

        try {
            await navigator.clipboard.writeText(clientAccess.access_token);
            toast.success(t('clientAccess.tokenCopied'));
        } catch {
            toast.error(t('clientAccess.tokenCopyFailed'));
        }
    };

    const handleCopyExample = async () => {
        if (!clientAccess) return;

        const example = `curl -X POST /api/v1/client-access/check-update \\
  -H "Content-Type: application/json" \\
  -H "access-token: ${clientAccess.access_token}" \\
  -d '{
    "current_version": "1.0.0",
    "client_info": "MyApp/1.0.0"
  }'`;

        try {
            await navigator.clipboard.writeText(example);
            toast.success(t('clientAccess.exampleCopied'))

        } catch {
            toast.error(t('clientAccess.exampleCopyFailed'));
        }
    };

    const maskedToken = (token: string) => {
        if (token.length <= 8) return token;
        return `${token.slice(0, 4)}${'*'.repeat(token.length - 8)}${token.slice(-4)}`;
    };

    if (!clientAccess) return null;

    const isExpired = clientAccess.expires_at && new Date(clientAccess.expires_at) < new Date();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5"/>
                        {t('clientAccess.tokenDetails')}
                    </DialogTitle>
                    <DialogDescription>
                        {t('clientAccess.viewTokenDescription')}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* 基本信息 */}
                    <div className="space-y-4">
                        <div>
                            <Label>{t('clientAccess.credentialName')}</Label>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="font-medium">{clientAccess.name}</span>
                                <Badge variant={
                                    !clientAccess.is_active
                                        ? 'secondary'
                                        : isExpired
                                            ? 'destructive'
                                            : 'default'
                                }>
                                    {!clientAccess.is_active
                                        ? t('clientAccess.inactive')
                                        : isExpired
                                            ? t('clientAccess.expired')
                                            : t('clientAccess.active')
                                    }
                                </Badge>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>{t('clientAccess.associatedProject')}</Label>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {clientAccess.project_name}
                                </p>
                            </div>
                            <div>
                                <Label>{t('clientAccess.associatedPackage')}</Label>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {clientAccess.package_name}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 安全警告 */}
                    {(!clientAccess.is_active || isExpired) && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4"/>
                            <AlertDescription>
                                {!clientAccess.is_active
                                    ? t('clientAccess.tokenDisabledWarning')
                                    : t('clientAccess.tokenExpiredWarning')
                                }
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* 访问令牌 */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>{t('clientAccess.token')}</Label>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowToken(!showToken)}
                            >
                                {showToken ? (
                                    <>
                                        <EyeOff className="mr-2 h-4 w-4"/>
                                        {t('clientAccess.hide')}
                                    </>
                                ) : (
                                    <>
                                        <Eye className="mr-2 h-4 w-4"/>
                                        {t('clientAccess.show')}
                                    </>
                                )}
                            </Button>
                        </div>

                        <div className="flex gap-2">
                            <Input
                                value={showToken ? clientAccess.access_token : maskedToken(clientAccess.access_token)}
                                readOnly
                                className="font-mono text-sm"
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCopyToken}
                            >
                                <Copy className="h-4 w-4"/>
                            </Button>
                        </div>

                        <Alert>
                            <Shield className="h-4 w-4"/>
                            <AlertDescription>
                                {t('clientAccess.tokenSecurity')}
                            </AlertDescription>
                        </Alert>
                    </div>

                    {/* API 调用示例 */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>{t('clientAccess.apiExample')}</Label>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCopyExample}
                            >
                                <Copy className="mr-2 h-4 w-4"/>
                                {t('clientAccess.copyExample')}
                            </Button>
                        </div>

                        <div className="bg-muted p-4 rounded-lg">
                            <p className="text-sm font-medium mb-2">POST /api/v1/client-access/check-update</p>
                            <div className="space-y-2">
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">{t('clientAccess.headers')}</p>
                                    <pre
                                        className="text-sm text-muted-foreground">access-token: {showToken ? clientAccess.access_token : maskedToken(clientAccess.access_token)}</pre>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">{t('clientAccess.requestBody')}</p>
                                    <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
{`{
  "current_version": "1.0.0",
  "client_info": "MyApp/1.0.0"
}`}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}