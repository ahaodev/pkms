// 菜单国际化映射工具
// 将后端菜单ID映射到前端翻译键

import { useI18n } from '@/contexts/i18n-context';

// 菜单ID到翻译键的映射
export const MENU_TRANSLATION_KEYS: Record<string, string> = {
  // 基础菜单
  'dashboard': 'nav.dashboard',
  'hierarchy': 'nav.projectManagement', 
  'upgrade': 'nav.upgradeManagement',
  'access-manager': 'nav.accessManagement',
  'shares': 'nav.shareManagement',
  
  // 管理员菜单
  'users': 'nav.userManagement',
  'tenants': 'nav.tenantManagement',
  
  // 系统菜单
  'admin': 'nav.systemManagement',
};

/**
 * 获取菜单的翻译键
 * @param menuId 菜单ID
 * @returns 翻译键或null
 */
export const getMenuTranslationKey = (menuId: string): string | null => {
  return MENU_TRANSLATION_KEYS[menuId] || null;
};

/**
 * React Hook: 获取菜单的国际化名称
 * @param menuId 菜单ID
 * @param fallbackName 后端返回的原始名称（兜底）
 * @returns 国际化后的菜单名称
 */
export const useMenuTranslation = (menuId: string, fallbackName: string): string => {
  const { t } = useI18n();
  
  const translationKey = getMenuTranslationKey(menuId);
  if (translationKey) {
    return t(translationKey);
  }
  
  return fallbackName;
};