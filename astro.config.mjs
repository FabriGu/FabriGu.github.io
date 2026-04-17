import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://fabrigu.github.io',
  integrations: [tailwind()],
});
