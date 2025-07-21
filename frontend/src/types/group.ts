export interface Group {
    id: string;
    name: string;
    description: string;
    color?: string; // 组标识颜色
    createdAt: Date;
    updatedAt: Date;
    memberCount: number;
    createdBy: string; // 创建者用户ID
    permissions: GroupPermission[];
}

export interface GroupPermission {
    projectId: string;
    canView: boolean;
    canEdit: boolean;
}

