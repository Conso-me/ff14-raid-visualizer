import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  root: '.',
  build: {
    outDir: 'dist/editor',
    rollupOptions: {
      input: {
        editor: resolve(__dirname, 'editor.html'),
      },
    },
  },
  server: {
    port: 3000,
    open: '/editor.html',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
