import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  server: {
    port: 4000,
    open: '/canvas.html',
    fs: {
      allow: ['..']
    }
  },
  resolve: {
    alias: {
      '/atomos-prime': resolve(__dirname, '../atomos-prime'),
      '/atomos-prime-style': resolve(__dirname, '../atomos-prime-style'),
      '/atomos-structura-core': resolve(__dirname, '../atomos-structura-core'),
      '/atomos-structura': resolve(__dirname, '.'),
      '/formular-dev': resolve(__dirname, '../formular-dev'),
      '@atomos-web/structura-core': resolve(__dirname, '../atomos-structura-core/src/index.ts'),
      '@atomos-web/prime-style': resolve(__dirname, '../atomos-prime-style/src/index.ts'),
      '@atomos-web/prime': resolve(__dirname, '../atomos-prime/src/index.ts')
    }
  }
});
