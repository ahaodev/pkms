import { toast } from 'sonner';
import type { RolePolicyForm, UserRoleForm, UserPolicyForm } from '@/types';

// 通用表单验证结果类型
interface ValidationResult {
    isValid: boolean;
    errors?: string[];
}

// 统一的必填字段验证
export const validateRequiredFields = (data: Record<string, any>, requiredFields: string[]): ValidationResult => {
    const errors: string[] = [];
    
    for (const field of requiredFields) {
        if (!data[field] || data[field].toString().trim() === '') {
            errors.push(`请填写${getFieldDisplayName(field)}`);
        }
    }
    
    if (errors.length > 0) {
        toast.error('请填写所有必填字段');
        return { isValid: false, errors };
    }
    
    return { isValid: true };
};

// 字段显示名称映射
const getFieldDisplayName = (field: string): string => {
    const fieldMap: Record<string, string> = {
        'role': '角色',
        'tenant': '租户',
        'object': '对象',
        'action': '操作',
        'user_id': '用户',
    };
    
    return fieldMap[field] || field;
};

// 角色权限表单验证
export const validateRolePermissionForm = (formData: RolePolicyForm): ValidationResult => {
    const requiredFields = ['role', 'tenant', 'object', 'action'];
    return validateRequiredFields(formData, requiredFields);
};

// 用户角色表单验证
export const validateUserRoleForm = (formData: UserRoleForm): ValidationResult => {
    const requiredFields = ['user_id', 'role', 'tenant'];
    return validateRequiredFields(formData, requiredFields);
};

// 用户权限表单验证
export const validateUserPermissionForm = (formData: UserPolicyForm): ValidationResult => {
    const requiredFields = ['user_id', 'tenant', 'object', 'action'];
    return validateRequiredFields(formData, requiredFields);
};

// 通用验证器工厂函数
export const createValidator = (requiredFields: string[]) => {
    return (data: Record<string, any>): ValidationResult => {
        return validateRequiredFields(data, requiredFields);
    };
};

// 权限表单类型判断和验证
export const validatePermissionForm = (
    formData: RolePolicyForm | UserRoleForm | UserPolicyForm,
    formType: 'role-permissions' | 'user-roles' | 'user-permissions'
): ValidationResult => {
    switch (formType) {
        case 'role-permissions':
            return validateRolePermissionForm(formData as RolePolicyForm);
        case 'user-roles':
            return validateUserRoleForm(formData as UserRoleForm);
        case 'user-permissions':
            return validateUserPermissionForm(formData as UserPolicyForm);
        default:
            return { isValid: false, errors: ['未知的表单类型'] };
    }
};