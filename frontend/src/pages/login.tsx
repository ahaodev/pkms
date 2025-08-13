import {useCallback} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {BrandLogo} from '@/components/ui/brand-logo';
import {useLogin} from '@/hooks/use-login';
import {useI18n} from '@/contexts/i18n-context';

/**
 * 登录页：用户登录入口，支持表单校验与登录反馈
 */
export default function LoginPage() {
    const {t} = useI18n();
    const {formData, updateField, login, isLoading} = useLogin();

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        await login();
    }, [login]);

    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4">
                            <BrandLogo showText={false}/>
                        </div>
                        <CardTitle className="text-2xl font-bold">PKMS</CardTitle>
                        <CardDescription>{t("auth.systemName")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="username">{t("auth.username")}</Label>
                                <Input
                                    id="username"
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => updateField('username', e.target.value)}
                                    placeholder={t("auth.usernamePlaceholder")}
                                    disabled={isLoading}
                                    autoComplete="username"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">{t("auth.password")}</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => updateField('password', e.target.value)}
                                    placeholder={t("auth.passwordPlaceholder")}
                                    disabled={isLoading}
                                    autoComplete="current-password"
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? t("auth.loggingIn") : t("auth.login")}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}