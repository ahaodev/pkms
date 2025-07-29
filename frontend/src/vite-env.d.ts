/// <reference types="vite/client" />

declare global {
  interface Window {
    AppInfoParser: new (file: File) => {
      parse(): Promise<{
        versionName?: string;
        versionCode?: number;
        [key: string]: any;
      }>;
    };
  }
}

export {};
