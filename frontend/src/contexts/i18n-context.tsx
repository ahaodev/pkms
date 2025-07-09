import React, {createContext, useContext, useState} from "react";

interface I18nContextType {
    language: string;
    setLanguage: (lang: string) => void;
    t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType>({
    language: "zh",
    setLanguage: () => {
    },
    t: () => "",
});

export const useI18n = () => useContext(I18nContext);

// 翻译字典
const translations = {
    zh: {
        // 通用
        "common.loading": "加载中...",
        "common.save": "保存",
        "common.cancel": "取消",
        "common.delete": "删除",
        "common.edit": "编辑",
        "common.view": "查看",
        "common.create": "创建",
        "common.search": "搜索",
        "common.filter": "筛选",
        "common.refresh": "刷新",
        "common.export": "导出",
        "common.import": "导入",
        "common.settings": "设置",
        "common.help": "帮助",
        "common.back": "返回",
        "common.next": "下一步",
        "common.previous": "上一步",
        "common.submit": "提交",
        "common.reset": "重置",
        "common.confirm": "确认",
        "common.close": "关闭",
        "common.open": "打开",
        "common.yes": "是",
        "common.no": "否",
        "common.ok": "确定",
        "common.error": "错误",
        "common.success": "成功",
        "common.warning": "警告",
        "common.info": "信息",

        // 导航
        "nav.dashboard": "仪表板",
        "nav.releases": "发布管理",
        "nav.deployments": "部署管理",
        "nav.activity": "活动日志",
        "nav.users": "用户与团队",
        "nav.audit": "审计日志",
        "nav.settings": "系统设置",
        "nav.documentation": "查看文档",
        "nav.needHelp": "需要帮助？",
        "nav.helpDescription": "查看我们的文档或联系支持。",

        // 头部
        "header.notifications": "通知",
        "header.profile": "个人资料",
        "header.viewAllNotifications": "查看所有通知",
        "header.newReleaseAvailable": "新版本可用",
        "header.newReleaseDescription": "版本 1.2.0 已准备好部署",
        "header.deploymentCompleted": "部署完成",
        "header.deploymentDescription": "前端 v1.1.3 已部署到生产环境",
        "header.minutesAgo": "分钟前",
        "header.hourAgo": "小时前",

        // 仪表板
        "dashboard.title": "仪表板",
        "dashboard.welcome": "欢迎回来，{name}！这是您的部署情况概览。",
        "dashboard.newRelease": "新建发布",
        "dashboard.newDeployment": "新建部署",
        "dashboard.attention": "注意",
        "dashboard.attentionMessage": "新的后端版本 (v2.3.1) 已准备好部署。",
        "dashboard.viewReleaseDetails": "查看发布详情",
        "dashboard.overview": "概览",
        "dashboard.analytics": "分析",
        "dashboard.activity": "活动",
        "dashboard.totalReleases": "总发布数",
        "dashboard.totalDeployments": "总部署数",
        "dashboard.avgDeploymentTime": "平均部署时间",
        "dashboard.deploymentSuccessRate": "部署成功率",
        "dashboard.fromLastMonth": "较上月",
        "dashboard.deployments": "部署",
        "dashboard.deploymentsLast7Days": "最近 7 天的部署次数",
        "dashboard.deploymentEnvironment": "部署环境",
        "dashboard.environmentDistribution": "环境分布",
        "dashboard.recentDeployments": "最近部署",
        "dashboard.latestDeploymentActivities": "最新部署活动",
        "dashboard.upcomingReleases": "即将发布",
        "dashboard.scheduledForDeployment": "计划部署",
        "dashboard.reviewAndDeploy": "审核并部署",
        "dashboard.reviewProgress": "审核进度",
        "dashboard.developmentProgress": "开发进度",
        "dashboard.viewAllDeployments": "查看所有部署",
        "dashboard.viewAllReleases": "查看所有发布",
        "dashboard.deploymentTimeTrend": "部署时间趋势",
        "dashboard.avgDeploymentDuration": "平均部署持续时间（分钟）",
        "dashboard.deploymentSuccessRateByEnv": "按环境的部署成功率",
        "dashboard.teamPerformance": "团队表现",
        "dashboard.deploymentMetricsByTeam": "按团队的部署指标",
        "dashboard.recentActivity": "最近活动",
        "dashboard.latestActions": "系统最新操作",
        "dashboard.viewFullActivityLog": "查看完整活动日志",

        // 环境
        "env.production": "生产环境",
        "env.staging": "预发布环境",
        "env.qa": "测试环境",
        "env.development": "开发环境",

        // 状态
        "status.successful": "成功",
        "status.failed": "失败",
        "status.inProgress": "进行中",
        "status.warning": "警告",
        "status.ready": "就绪",
        "status.deployed": "已部署",
        "status.inReview": "审核中",
        "status.inDevelopment": "开发中",
        "status.pending": "等待中",
        "status.completed": "已完成",

        // 发布管理
        "releases.title": "发布管理",
        "releases.description": "管理和跟踪所有软件发布",
        "releases.newRelease": "新建发布",
        "releases.searchReleases": "搜索发布...",
        "releases.allReleases": "所有发布",
        "releases.ready": "就绪",
        "releases.deployed": "已部署",
        "releases.inProgress": "进行中",
        "releases.name": "名称",
        "releases.status": "状态",
        "releases.environment": "环境",
        "releases.version": "版本",
        "releases.created": "创建时间",
        "releases.author": "作者",
        "releases.releaseDescription": "描述",
        "releases.viewDetails": "查看详情",
        "releases.deploy": "部署",
        "releases.viewNotes": "查看说明",
        "releases.viewDeployment": "查看部署",
        "releases.noReleasesFound": "未找到匹配的发布。",

        // 部署管理
        "deployments.title": "部署管理",
        "deployments.description": "跟踪和管理所有环境的部署",
        "deployments.newDeployment": "新建部署",
        "deployments.searchDeployments": "搜索部署...",
        "deployments.allDeployments": "所有部署",
        "deployments.successful": "成功",
        "deployments.inProgress": "进行中",
        "deployments.failed": "失败",
        "deployments.name": "名称",
        "deployments.environment": "环境",
        "deployments.status": "状态",
        "deployments.startTime": "开始时间",
        "deployments.duration": "持续时间",
        "deployments.triggeredBy": "触发者",
        "deployments.viewDetails": "查看详情",
        "deployments.viewRelease": "查看发布",
        "deployments.retryDeployment": "重试部署",
        "deployments.viewLogs": "查看日志",
        "deployments.liveLogs": "实时日志",
        "deployments.retry": "重试",
        "deployments.overallProgress": "总体进度",
        "deployments.currentSteps": "当前步骤",
        "deployments.started": "已开始",
        "deployments.failurePoint": "失败点",
        "deployments.deploymentSteps": "部署步骤",
        "deployments.noDeploymentsFound": "未找到匹配的部署。",

        // 设置
        "settings.title": "系统设置",
        "settings.description": "管理您的应用程序设置和偏好",
        "settings.storage": "存储",
        "settings.authentication": "认证",
        "settings.notifications": "通知",
        "settings.deployment": "部署",
        "settings.advanced": "高级",
        "settings.s3Configuration": "S3/MinIO 配置",
        "settings.s3Description": "配置用于文件管理的对象存储设置",
        "settings.s3Endpoint": "S3/MinIO 端点",
        "settings.s3EndpointDescription": "您的 S3 或 MinIO 服务器的端点 URL",
        "settings.bucketName": "存储桶名称",
        "settings.bucketDescription": "用于存储文件的存储桶名称",
        "settings.region": "区域",
        "settings.accessKey": "访问密钥",
        "settings.secretKey": "密钥",
        "settings.testConnection": "测试连接",
        "settings.saveChanges": "保存更改",
        "settings.storageUsage": "存储使用情况",
        "settings.storageUsageDescription": "当前存储使用统计",
        "settings.totalStorage": "总存储",
        "settings.used": "已使用",
        "settings.available": "可用",
        "settings.usage": "使用率",
        "settings.keycloakConfiguration": "Keycloak 配置",
        "settings.keycloakDescription": "配置您的 Keycloak 认证设置",
        "settings.keycloakServerUrl": "Keycloak 服务器 URL",
        "settings.keycloakUrlDescription": "您的 Keycloak 服务器的 URL",
        "settings.realm": "域",
        "settings.realmDescription": "用于认证的 Keycloak 域",
        "settings.clientId": "客户端 ID",
        "settings.clientIdDescription": "在 Keycloak 中注册的客户端 ID",
        "settings.notificationPreferences": "通知偏好",
        "settings.notificationDescription": "配置何时以及如何接收通知",
        "settings.deploymentNotifications": "部署通知",
        "settings.deploymentNotificationsDescription": "接收成功部署的通知",
        "settings.failureNotifications": "失败通知",
        "settings.failureNotificationsDescription": "接收失败部署的通知",
        "settings.newReleaseNotifications": "新发布通知",
        "settings.newReleaseNotificationsDescription": "在创建新发布时接收通知",
        "settings.emailNotifications": "邮件通知",
        "settings.emailNotificationsDescription": "通过邮件接收通知",
        "settings.savePreferences": "保存偏好",
        "settings.deploymentSettings": "部署设置",
        "settings.deploymentDescription": "配置系统中部署的处理方式",
        "settings.deploymentCooldown": "部署冷却时间（分钟）",
        "settings.cooldownDescription": "同一环境部署之间的最小时间间隔",
        "settings.requiredApprovals": "必需审批数",
        "settings.approvalsDescription": "部署前需要的审批数量",
        "settings.automaticRollback": "自动回滚",
        "settings.rollbackDescription": "自动回滚失败的部署",
        "settings.deploymentStrategy": "部署策略",
        "settings.strategyDescription": "选择新版本的部署方式",
        "settings.environmentPromotion": "环境提升",
        "settings.promotionDescription": "强制执行顺序环境提升",
        "settings.saveSettings": "保存设置",
        "settings.systemMaintenance": "系统维护",
        "settings.maintenanceDescription": "高级系统维护选项",
        "settings.clearCache": "清除应用程序缓存",
        "settings.clearCacheDescription": "清除应用程序缓存以解决显示问题",
        "settings.rebuildIndex": "重建搜索索引",
        "settings.rebuildIndexDescription": "重建搜索索引以改善搜索结果",
        "settings.exportLogs": "导出系统日志",
        "settings.exportLogsDescription": "导出系统日志用于故障排除",
        "settings.resetSystem": "重置系统数据",
        "settings.resetSystemDescription": "重置所有系统数据和配置",
        "settings.systemInformation": "系统信息",
        "settings.systemInfoDescription": "当前系统的信息",
        "settings.version": "版本",
        "settings.lastUpdated": "最后更新",
        "settings.environment": "环境",
        "settings.license": "许可证",
        "settings.systemHealth": "系统健康状态",

        // 团队
        "team.frontendTeam": "前端团队",
        "team.backendTeam": "后端团队",
        "team.devopsTeam": "运维团队",
        "team.deployments": "部署次数",
        "team.avgTime": "平均时间",

        // 步骤
        "steps.build": "构建",
        "steps.test": "测试",
        "steps.deploy": "部署",
        "steps.backup": "备份",
        "steps.schemaUpdate": "架构更新",
        "steps.dataMigration": "数据迁移",

        // 时间
        "time.minutesAgo": "{count} 分钟前",
        "time.hourAgo": "{count} 小时前",
        "time.hoursAgo": "{count} 小时前",
        "time.ongoing": "进行中",

        // 消息
        "messages.connectionTestSuccess": "连接测试成功",
        "messages.s3ConnectionSuccess": "成功连接到 S3/MinIO",
        "messages.keycloakConnectionSuccess": "成功连接到 Keycloak",
        "messages.settingsSaved": "设置已保存",
        "messages.storageSettingsUpdated": "存储设置已成功更新",
        "messages.authSettingsUpdated": "认证设置已成功更新",
        "messages.notificationPreferencesUpdated": "通知偏好已更新",
        "messages.deploymentSettingsUpdated": "部署设置已成功更新",
        "messages.cacheCleared": "缓存已清除",
        "messages.cacheClearedSuccess": "应用程序缓存已成功清除",

        // 404页面
        "notFound.title": "404 - 页面未找到",
        "notFound.description": "您要查找的页面不存在或已被移动。",
        "notFound.goBack": "返回",
        "notFound.goToDashboard": "前往仪表板",

        // 品牌
        "brand.name": "PKMS",
        "brand.tagline": "轻松管理您的软件交付流水线",
    },
    en: {
        // 保留原有的英文翻译作为备用
        "common.loading": "Loading...",
        "common.save": "Save",
        "common.cancel": "Cancel",
        "common.delete": "Delete",
        "common.edit": "Edit",
        "common.view": "View",
        "common.create": "Create",
        "common.search": "Search",
        "common.filter": "Filter",
        "common.refresh": "Refresh",
        "common.export": "Export",
        "common.import": "Import",
        "common.settings": "Settings",
        "common.help": "Help",
        "common.back": "Back",
        "common.next": "Next",
        "common.previous": "Previous",
        "common.submit": "Submit",
        "common.reset": "Reset",
        "common.confirm": "Confirm",
        "common.close": "Close",
        "common.open": "Open",
        "common.yes": "Yes",
        "common.no": "No",
        "common.ok": "OK",
        "common.error": "Error",
        "common.success": "Success",
        "common.warning": "Warning",
        "common.info": "Info",

        "nav.dashboard": "Dashboard",
        "nav.releases": "Releases",
        "nav.deployments": "Deployments",
        "nav.activity": "Activity",
        "nav.users": "Users & Teams",
        "nav.audit": "Audit Log",
        "nav.settings": "Settings",
        "nav.documentation": "View Documentation",
        "nav.needHelp": "Need Help?",
        "nav.helpDescription": "Check out our documentation or contact support.",

        "brand.name": "DeliveryFlow",
        "brand.tagline": "Manage your software delivery pipeline with ease",

        // 其他英文翻译...
    }
};

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [language, setLanguage] = useState<string>("zh");

    const t = (key: string, params?: Record<string, string | number>): string => {
        const langTranslations = translations[language as keyof typeof translations];
        const translation = langTranslations ? (langTranslations as Record<string, string>)[key] || key : key;

        if (params) {
            return Object.entries(params).reduce((str, [paramKey, value]) => {
                return str.replace(`{${paramKey}}`, String(value));
            }, translation);
        }

        return translation;
    };

    const value = {
        language,
        setLanguage,
        t,
    };

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};