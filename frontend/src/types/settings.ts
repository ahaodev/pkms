/**
 * 设置页面相关的类型定义
 */

export interface S3Settings {
  endpoint: string;
  bucket: string;
  region: string;
  accessKey: string;
  secretKey: string;
}



export interface NotificationSettings {
  onDeployment: boolean;
  onFailure: boolean;
  onNewRelease: boolean;
  emailNotifications: boolean;
}


export interface SettingsTab {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface SettingsState {
  s3: S3Settings;
  notifications: NotificationSettings;
}
