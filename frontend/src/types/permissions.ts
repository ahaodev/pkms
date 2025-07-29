export interface EnhancedPolicy {
    subject: string;
    subject_name?: string;
    domain: string;
    domain_name?: string;
    object: string;
    action: string;
}

export interface EnhancedRole {
    user: string;
    user_name?: string;
    role: string;
    domain: string;
    domain_name?: string;
}

export interface User {
    id: string;
    name: string;
}

export interface UserPermission {
    user_id: string;
    permissions: string[][];
    roles: string[];
}

// Form state interfaces
export interface RolePolicyForm {
    role: string;
    tenant: string;
    object: string;
    action: string;
}

export interface UserRoleForm {
    user_id: string;
    role: string;
    tenant: string;
}

export interface UserPolicyForm {
    user_id: string;
    tenant: string;
    object: string;
    action: string;
}

// All roles defined in backend constants.go
export const ALL_ROLES = ['admin', 'owner', 'user', 'viewer'] as const;
export type AllRole = typeof ALL_ROLES[number];

// Assignable roles (excluding admin - system administrator)
export const ASSIGNABLE_ROLES = ['owner', 'user', 'viewer'] as const;
export type AssignableRole = typeof ASSIGNABLE_ROLES[number];

// Legacy export for backward compatibility
export const PREDEFINED_ROLES = ASSIGNABLE_ROLES;
export type PredefinedRole = AssignableRole;