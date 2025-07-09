import { useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import {
  SettingsHeader,
  StorageSettings,
  NotificationSettings,
  NotificationChannels,
  SettingsTabs,
  type StorageConfig,
  type NotificationConfig
} from "@/components/settings";

/**
 * 设置页：支持存储、认证、通知、部署、进阶等多标签配置，所有设置均本地管理
 */

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

  // 通知渠道连接处理
  const handleConnectWecom = useCallback(() => {
    toast({
      title: "企业微信",
      description: "企业微信连接功能开发中...",
    });
  }, []);

  const handleConnectDingTalk = useCallback(() => {
    toast({
      title: "钉钉",
      description: "钉钉连接功能开发中...",
    });
  }, []);

  const handleConfigureWebhook = useCallback(() => {
    toast({
      title: "Webhook",
      description: "Webhook 配置功能开发中...",
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
            <NotificationChannels
              onConnectWecom={handleConnectWecom}
              onConnectDingTalk={handleConnectDingTalk}
              onConfigureWebhook={handleConfigureWebhook}
            />
          </div>
        }
      />
    </div>
  );
}