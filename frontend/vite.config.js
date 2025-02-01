import { defineConfig } from 'vite';

export default defineConfig({
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
  