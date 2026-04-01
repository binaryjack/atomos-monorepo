import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true
  },
  server: {
    port: 3000,
    open: true
  },
  resolve: {
    alias: {
      '@atomos/structura-core': resolve(__dirname, '../atomos-structura-core/src/index.ts'),
      '@atomos/prime-style': resolve(__dirname, '../atomos-prime-style/src/index.ts'),
      '@atomos/prime': resolve(__dirname, '../atomos-prime/src/index.ts')
    }
  }
});
