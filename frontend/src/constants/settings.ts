/**
 * 设置页面相关的常量
 */

import {Server, Bell} from 'lucide-react';
import {SettingsTab} from '@/types/settings';

export const SETTINGS_TABS: SettingsTab[] = [
    {value: 'storage', label: '存储', icon: Server},
    {value: 'notifications', label: '通知', icon: Bell},
];

export const DEFAULT_S3_SETTINGS = {
    endpoint: 'http://localhost:9000',
    bucket: 'delivery-system',
    region: 'us-east-1',
    accessKey: 'minioadmin',
    secretKey: 'minioadmin',
};

export const DEFAULT_KEYCLOAK_SETTINGS = {
    url: 'http://localhost:8080',
    realm: 'delivery-system',
    clientId: 'delivery-client',
};

export const DEFAULT_NOTIFICATION_SETTINGS = {
    onDeployment: true,
    onFailure: true,
    onNewRelease: true,
    emailNotifications: true,
};

export const DEFAULT_DEPLOYMENT_SETTINGS = {
    cooldown: '10',
    automaticRollback: true,
    requiredApprovals: '1',
};
