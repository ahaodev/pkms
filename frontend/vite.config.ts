import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
    server: {
        host: '0.0.0.0',
        port: 5173,
        strictPort: true,
        allowedHosts: ['.ahaodev.com','.ucorg.com' ,'localhost'],
        proxy: {
            '/api': {
                target: 'http://localhost:58080', // 后端服务器地址
                changeOrigin: true,           // 修改请求头中的 Host
                rewrite: (path) => path,      // 保持路径不变（可选）
                // 如果后端接口没有 /api 前缀，可以移除：
                // rewrite: (path) => path.replace(/^\/api/, '')
            }
        },
    },
});
