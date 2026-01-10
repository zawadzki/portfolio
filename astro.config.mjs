// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { fileURLToPath } from 'node:url';

// https://astro.build/config
export default defineConfig({
  prefetch: true,
  integrations: [mdx()],
  vite: {
    build: {
      rollupOptions: {
        input: {
          main: fileURLToPath(new URL('./src/scripts/main.ts', import.meta.url)),
        },
        output: {
          entryFileNames: 'assets/[name].js',
        },
      },
    },
  },
});
