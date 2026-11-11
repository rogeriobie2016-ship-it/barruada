import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// SITE_URL e BASE_PATH permitem publicar na raiz (Vercel, Netlify) ou em subpasta (GitHub Pages).
const site = process.env.SITE_URL || 'https://barruada.vercel.app';
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  redirects: { '/manifesto': '/quem-somos/', '/nove': '/quem-somos/' },
  integrations: [
    react(),
    // /bastidores fica fora do sitemap (área de trabalho, ver src/pages/bastidores.astro).
    sitemap({ filter: (pagina) => !pagina.includes('/bastidores') }),
  ],
  vite: { plugins: [tailwindcss()] },
});
