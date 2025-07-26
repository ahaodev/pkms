import { useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import {
  SettingsHeader,
  StorageSettings,
  AccountSettings,
  SecuritySettings,
  SettingsTabs,
  type StorageConfig,
  type AccountConfig,
  type SecurityConfig
} from "@/components/settings";

export default function Settings() {
  // 账户设置保存处理
  const handleSaveAccount = useCallback((config: AccountConfig) => {
    console.log('保存账户设置:', config);
    toast({
      title: "设置已保存",
      description: "账户设置已成功更新",
    });
  }, []);

  // 存储设置保存处理
  const handleSaveStorage = useCallback((config: StorageConfig) => {
    console.log('保存存储设置:', config);
    toast({
      title: "设置已保存",
      description: "存储设置已成功更新",
    });
  }, []);

  // 安全设置保存处理
  const handleSaveSecurity = useCallback((config: SecurityConfig) => {
    console.log('保存安全设置:', config);
    toast({
      title: "设置已保存",
      description: "安全设置已成功更新",
    });
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
          <AccountSettings onSave={handleSaveAccount} />
        }
        storageContent={
          <StorageSettings onSave={handleSaveStorage} />
        }
        securityContent={
          <SecuritySettings onSave={handleSaveSecurity} />
        }
      />
    </div>
  );
}