// npm run og: gera as imagens de compartilhamento (1200x630) em public/og/, uma por página.
// Usa o Chromium do Playwright para desenhar com as fontes e as cores de verdade (tokens.css).
// As imagens ficam no repositório: rode de novo quando mudar título, página ou design system.
import { mkdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { chromium } from '@playwright/test';
import { nomeOg, PAGINAS_OG, type PaginaOg } from '../src/lib/og.ts';

const raiz = join(import.meta.dirname, '..');
const require = createRequire(import.meta.url);
const tokens = readFileSync(join(raiz, 'src/styles/tokens.css'), 'utf8');
const mapa = JSON.parse(readFileSync(join(raiz, 'src/data/ne-map.json'), 'utf8')) as { w: number; h: number; states: { uf: string; d: string }[] };
// As fontes entram embutidas (base64): arquivo local não carrega numa página montada na memória.
const fonte = (pacote: string, arquivo: string) =>
  'data:font/woff2;base64,' + readFileSync(join(dirname(require.resolve(`${pacote}/package.json`)), 'files', arquivo)).toString('base64');

const N = 36;
const raios = Array.from({ length: N }, (_, i) => {
  const a = (i * 2 * Math.PI) / N;
  const p = (ang: number, r: number) => `${(r * Math.cos(ang)).toFixed(1)} ${(r * Math.sin(ang)).toFixed(1)}`;
  return `M${p(a - 0.02, 150)}L${p(a - 0.05, 900)}L${p(a + 0.05, 900)}L${p(a + 0.02, 150)}Z`;
}).join('');

// [fundo, texto, raios, disco, etiqueta fundo, etiqueta texto]. Raios amarelos só sobre azul.
const TONS: Record<PaginaOg['tom'], string[]> = {
  anil: ['anil', 'papel', 'sol', 'barro', 'sol', 'nanquim'],
  barro: ['barro', 'papel', 'barro-escuro', 'anil', 'sol', 'nanquim'],
  sol: ['sol', 'nanquim', 'papel', 'barro', 'nanquim', 'papel'],
  nanquim: ['nanquim', 'papel', 'cinza-quente', 'barro', 'sol', 'nanquim'],
  papel: ['papel', 'nanquim', 'areia', 'anil', 'barro', 'papel'],
  areia: ['areia', 'nanquim', 'papel', 'barro', 'anil', 'papel'],
};

function html(p: PaginaOg): string {
  const [fundo, texto, raio, disco, etFundo, etTexto] = TONS[p.tom];
  const tamanho = p.titulo.length <= 12 ? 150 : p.titulo.length <= 24 ? 104 : p.titulo.length <= 36 ? 84 : 70;
  const estados = mapa.states
    .map((s) => `<path d="${s.d}" fill="var(--${p.uf === s.uf ? 'sol' : 'papel'})" stroke="var(--${p.uf === s.uf ? 'nanquim' : disco})" stroke-width="${p.uf === s.uf ? 9 : 5}" stroke-linejoin="round"/>`)
    .join('');
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>
${tokens}
@font-face { font-family: 'Archivo Variable'; font-weight: 100 900; src: url('${fonte('@fontsource-variable/archivo', 'archivo-latin-wght-normal.woff2')}') format('woff2-variations'); }
@font-face { font-family: 'Covered By Your Grace'; src: url('${fonte('@fontsource/covered-by-your-grace', 'covered-by-your-grace-latin-400-normal.woff2')}') format('woff2'); }
* { box-sizing: border-box; margin: 0; }
body { width: 1200px; height: 630px; overflow: hidden; position: relative; background: var(--${fundo}); color: var(--${texto}); font-family: var(--fonte-titulo); }
.grao { position: absolute; inset: 0; width: 100%; height: 100%; mix-blend-mode: multiply; opacity: .45; }
.arte { position: absolute; right: -40px; top: -105px; width: 840px; height: 840px; }
.texto { position: absolute; left: 64px; top: 56px; bottom: 56px; width: 600px; display: flex; flex-direction: column; justify-content: space-between; }
.etiqueta { align-self: flex-start; padding: 8px 18px; background: var(--${etFundo}); color: var(--${etTexto}); font-weight: 800; font-size: 30px; letter-spacing: -0.03em; transform: rotate(-2deg); box-shadow: 5px 5px 0 var(--nanquim); }
h1 { font-weight: 800; font-size: ${tamanho}px; line-height: .92; letter-spacing: -0.05em; text-wrap: balance; }
.marca { font-weight: 800; font-size: 46px; letter-spacing: -0.05em; }
.moldura { position: absolute; inset: 18px; border: 2.5px solid var(--${texto}); opacity: .7; }
</style></head><body>
<svg class="arte" viewBox="-420 -420 840 840">
  <defs><radialGradient id="some"><stop offset="55%" stop-color="white"/><stop offset="100%" stop-color="black"/></radialGradient><mask id="m"><rect x="-420" y="-420" width="840" height="840" fill="url(#some)"/></mask></defs>
  <path d="${raios}" fill="var(--${raio})" mask="url(#m)"/>
  <circle r="232" fill="none" stroke="var(--${texto})" stroke-width="2"/>
  <circle r="218" fill="var(--${disco})"/>
  <g transform="translate(-155 -195) scale(0.31)">${estados}</g>
</svg>
<svg class="grao"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2"/><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .6 0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>
<div class="moldura"></div>
<div class="texto">
  <span class="etiqueta">${p.rotulo}</span>
  <h1>${p.titulo}</h1>
  <span class="marca">BARRUADA</span>
</div>
</body></html>`;
}

const saida = join(raiz, 'public/og');
mkdirSync(saida, { recursive: true });
const navegador = await chromium.launch();
const pagina = await navegador.newPage({ viewport: { width: 1200, height: 630 } });
for (const p of PAGINAS_OG) {
  await pagina.setContent(html(p), { waitUntil: 'load' });
  await pagina.evaluate(() => document.fonts.ready);
  await pagina.screenshot({ path: join(saida, `${nomeOg(p.caminho)}.png`) });
}
await navegador.close();
console.log(`${PAGINAS_OG.length} imagens de compartilhamento gravadas em public/og/.`);
