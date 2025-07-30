import {useCallback} from "react";
import {toast} from "@/hooks/use-toast";
import {updateUserPassword} from "@/lib/api/users";
import {testStorageConfig, updateStorageConfig} from "@/lib/api/settings";
import {
    type AccountConfig,
    AccountSettings,
    SettingsHeader,
    SettingsTabs,
    type StorageConfig,
    StorageSettings,
} from "@/components/settings";

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

            toast({
                title: "设置已保存",
                description: "账户设置已成功更新",
            });
        } catch (error: any) {
            console.error('Failed to save account settings:', error);
            const errorMessage = error?.response?.data?.message || "账户设置更新失败，请稍后重试";
            toast({
                title: "保存失败",
                description: errorMessage,
                variant: "destructive",
            });
        }
    }, []);

    // 存储设置保存处理
    const handleSaveStorage = useCallback(async (config: StorageConfig) => {
        try {
            // 转换前端配置格式到后端格式
            const backendConfig = {
                storage_type: config.storageType,
                storage_base_path: config.diskPath,
                s3_address: config.s3Endpoint,
                s3_access_key: config.s3AccessKey,
                s3_secret_key: config.s3SecretKey,
                s3_bucket: config.s3Bucket,
                s3_token: "", // 前端没有这个字段，设为空
            };

            await updateStorageConfig(backendConfig);

            toast({
                title: "设置已保存",
                description: "存储设置已成功更新",
            });
        } catch (error: any) {
            console.error('Failed to save storage settings:', error);
            const errorMessage = error?.response?.data?.message || "存储设置更新失败，请稍后重试";
            toast({
                title: "保存失败",
                description: errorMessage,
                variant: "destructive",
            });
        }
    }, []);

    // 存储配置测试处理
    const handleTestStorage = useCallback(async () => {
        try {
            const result = await testStorageConfig();
            toast({
                title: "测试成功",
                description: result.data || "存储配置测试通过",
            });
        } catch (error: any) {
            console.error('Failed to test storage config:', error);
            const errorMessage = error?.response?.data?.message || "存储配置测试失败";
            toast({
                title: "测试失败",
                description: errorMessage,
                variant: "destructive",
            });
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
                storageContent={
                    <StorageSettings onSave={handleSaveStorage} onTest={handleTestStorage}/>
                }
            />
        </div>
    );
}