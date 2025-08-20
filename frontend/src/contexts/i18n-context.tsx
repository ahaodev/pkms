import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import i18n from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";
import { resources } from "@/translations";

// Initialize i18next
if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: localStorage.getItem('pkms-language') || 'en', // Default language
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false, // React already escapes values
      },
      debug: process.env.NODE_ENV === 'development',
    });
}

// Context interface
interface I18nContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string, options?: any) => string;
  isLoading: boolean;
  error: string | null;
}

// Default context value
const defaultContextValue: I18nContextType = {
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
  isLoading: false,
  error: null,
};

// Create context
const I18nContext = createContext<I18nContextType>(defaultContextValue);

// Provider props interface
interface I18nProviderProps {
  children: ReactNode;
}

// I18n Provider component
export function I18nProvider({ children }: I18nProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t: reactI18nT, i18n: i18nInstance } = useTranslation();
  
  // Language change handler with persistence
  const setLanguage = async (lang: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Change language in i18next
      await i18nInstance.changeLanguage(lang);
      
      // Persist to localStorage
      localStorage.setItem('pkms-language', lang);
      
      // Update document language attribute for accessibility
      document.documentElement.lang = lang;
      
    } catch (err) {
      console.error('Failed to change language:', err);
      setError('Failed to change language');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Set initial document language
  useEffect(() => {
    document.documentElement.lang = i18nInstance.language;
  }, [i18nInstance.language]);
  
  // Enhanced translation function with error handling
  const t = (key: string, options?: any) => {
    try {
      const result = reactI18nT(key, options);
      return typeof result === 'string' ? result : key;
    } catch (err) {
      console.error('Translation error for key:', key, err);
      return key; // Fallback to key if translation fails
    }
  };
  
  const contextValue: I18nContextType = {
    language: i18nInstance.language,
    setLanguage,
    t,
    isLoading,
    error,
  };
  
  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
}

// Custom hook to use i18n context
export const useI18n = () => {
  const context = useContext(I18nContext);
  
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  
  return context;
};

// Re-export the useTranslation hook for direct react-i18next usage
export { useTranslation } from 'react-i18next';

// Export the i18n instance for direct access if needed
export { i18n };