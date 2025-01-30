import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/uploads': 'http://localhost:8000',
      '/api': {
        target: 'http://localhost:8000',  
        changeOrigin: true,             
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@import "~slick-carousel/slick/slick-theme.css";' // Use the correct path
      },
    },
  },
  optimizeDeps: {
    include: ['slick-carousel'],
  },
});
  