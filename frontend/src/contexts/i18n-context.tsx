import {createContext, useContext} from "react";

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