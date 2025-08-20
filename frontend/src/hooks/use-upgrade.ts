export interface Version {
    id: string;
    version: string;
    versionCode: number;
    platform: 'android' | 'ios' | 'windows' | 'web';
    status: 'draft' | 'published' | 'deprecated';
    isForced: boolean;
    downloadUrl: string;
    fileSize: number;
    changelog: string;
    createdAt: string;
    updatedAt: string;
    downloadCount: number;
}
