import { useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import {
  SettingsHeader,
  StorageSettings,
  NotificationSettings,
  SettingsTabs,
  type StorageConfig,
  type NotificationConfig
} from "@/components/settings";

export default function Settings() {
  // 存储设置保存处理
  const handleSaveStorage = useCallback((config: StorageConfig) => {
    console.log('保存存储设置:', config);
    toast({
      title: "设置已保存",
      description: "存储设置已成功更新",
    });
  }, []);
  
  // 通知设置保存处理
  const handleSaveNotifications = useCallback((config: NotificationConfig) => {
    console.log('保存通知设置:', config);
    toast({
      title: "设置已保存",
      description: "通知偏好设置已更新",
    });
  }, []);

  return (
    <div className="space-y-6">
      <SettingsHeader 
        title="设置" 
        description="管理您的应用程序设置和偏好" 
      />

      <SettingsTabs
        defaultValue="storage"
        storageContent={
          <StorageSettings onSave={handleSaveStorage} />
        }
        notificationsContent={
          <div className="space-y-4">
            <NotificationSettings onSave={handleSaveNotifications} />
          </div>
        }
      />
    </div>
  );
}