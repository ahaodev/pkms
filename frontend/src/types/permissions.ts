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
    object: string;
    action: string;
}

export interface UserRoleForm {
    user_id: string;
    role: string;
}

export interface UserPolicyForm {
    user_id: string;
    object: string;
    action: string;
}

// Predefined roles
export const PREDEFINED_ROLES = ['admin', 'pm', 'developer', 'viewer', 'tester'] as const;
export type PredefinedRole = typeof PREDEFINED_ROLES[number];