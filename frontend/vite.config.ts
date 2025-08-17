import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // UI Component libraries - only include installed packages
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-popover',
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-avatar',
            '@radix-ui/react-label',
            '@radix-ui/react-progress',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-separator',
            '@radix-ui/react-slot'
          ],
          
          // Form handling
          'forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          
          // Data fetching and state
          'data': ['@tanstack/react-query', 'axios'],
          
          // Icons and styling
          'icons': ['lucide-react'],
          'styling': ['class-variance-authority', 'clsx', 'tailwind-merge'],
          
          // Charts and visualization
          'charts': ['recharts'],
          
          // Utilities
          'utils': ['date-fns', 'sonner'],
          
          // System management modules
          'sys-management': [
            './src/pages/sys-roles', 
            './src/pages/sys-users',
            './src/pages/sys-tenants',
            './src/pages/sys-user-tenant-role'
          ]
        }
      }
    },
    minify: 'esbuild',
    target: 'esnext',
    chunkSizeWarningLimit: 300
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: ['.ahaodev.com','.ucorg.com' ,'localhost'],
    proxy: {
      '/api': {
        target: 'http://localhost:65080',
        changeOrigin: true,
        rewrite: (path) => path,
      },
      '/share': {
        target: 'http://localhost:65080',
        changeOrigin: true,
        rewrite: (path) => path,
      }
    },
  },
});
