import {useCallback} from "react";
import {toast} from "sonner";
import {updateUserPassword} from "@/lib/api/users";
import {type AccountConfig, AccountSettings, SettingsHeader, SettingsTabs,} from "@/components/settings";

export default function Settings() {
    // 账户设置保存处理
    const handleSaveAccount = useCallback(async (config: AccountConfig) => {
        try {
            // 密码更新逻辑
            if (config.newPassword && config.currentPassword) {
                await updateUserPassword({
                    current_password: config.currentPassword,
                    new_password: config.newPassword,
                });
            }

            toast.success("账户设置已成功更新");
        } catch (error: any) {
            console.error('Failed to save account settings:', error);
            const errorMessage = error?.response?.data?.message || "账户设置更新失败，请稍后重试";
            toast.error(errorMessage);
        }
    }, []);




    return (
        <div className="space-y-6">
            <SettingsHeader
                title="设置"
                description="管理您的应用程序设置和偏好"
            />

            <SettingsTabs
                defaultValue="account"
                accountContent={
                    <AccountSettings onSave={handleSaveAccount}/>
                }
            />
        </div>
    );
}