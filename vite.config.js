import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

export default defineConfig({
  plugins: [svelte()],
  base: '/virus-and-where-to-find-them/',
  build: {
    outDir: 'docs',
    emptyOutDir: false, // Keep existing data in docs/ if needed, but usually true is better for clean builds
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
      output: {
        entryFileNames: 'bundle.js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'index.css') return 'bundle.css';
          return assetInfo.name;
        },
      },
    },
  },
  server: {
    port: 5000,
  },
});
