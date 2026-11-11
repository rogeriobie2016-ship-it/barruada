// Motor do estúdio de animação. Desenha em canvas, quadro a quadro, para poder exportar PNG e vídeo.
// A parte de cálculo (tempo, entrada das camadas, transformações) é pura e testada.
// As cores chegam de fora, lidas de tokens.css: nada fixo aqui.

import { ajustarTamanho } from './cartao.ts';

export const BASES = [
  { id: 'selo', nome: 'Selo com raios' },
  { id: 'moldura', nome: 'Selo de moldura' },
  { id: 'colagem', nome: 'Colagem recortada' },
  { id: 'corte', nome: 'Papel cortado' },
  { id: 'lettering', nome: 'Lettering e mapa' },
  { id: 'branco', nome: 'Em branco' },
] as const;
export type Base = (typeof BASES)[number]['id'];

export const MOVIMENTOS = [
  { id: 'girar', nome: 'Raios giram' },
  { id: 'queda', nome: 'Cai no lugar' },
  { id: 'crescer', nome: 'Cresce do centro' },
  { id: 'digitar', nome: 'Digita o título' },
  { id: 'barruada', nome: 'Barruada (bate e treme)' },
] as const;
export type Movimento = (typeof MOVIMENTOS)[number]['id'];

export const FORMATOS = {
  wide: { l: 1920, a: 1080, nome: 'Página e YouTube', razao: '16:9' },
  tall: { l: 1080, a: 1920, nome: 'Reels e Stories', razao: '9:16' },
  sq: { l: 1080, a: 1080, nome: 'Feed quadrado', razao: '1:1' },
  feed: { l: 1080, a: 1350, nome: 'Feed retrato', razao: '4:5' },
} as const;
export type Formato = keyof typeof FORMATOS;

export const ESQUEMAS = ['anil', 'barro', 'sol', 'papel', 'nanquim', 'areia'] as const;
export type EsquemaAnim = (typeof ESQUEMAS)[number];

export const CAMADAS = [
  { id: 'raios', nome: 'Raios' },
  { id: 'disco', nome: 'Disco' },
  { id: 'moldura', nome: 'Moldura' },
  { id: 'estrelas', nome: 'Estrelas' },
  { id: 'textura', nome: 'Textura de grão' },
  { id: 'assinatura', nome: 'Assinatura' },
] as const;
export type Camada = (typeof CAMADAS)[number]['id'];

export interface Config {
  base: Base;
  esquema: EsquemaAnim;
  titulo: string;
  apoio: string;
  esquerda: string;
  direita: string;
  assinatura: string;
  arte: string; // 'nove', 'estado', 'nada' ou um nome do acervo
  uf: string;
  camadas: Record<Camada, boolean>;
  traco: number; // espessura das divisas do mapa
  divisas: boolean;
  caixaAlta: boolean;
  movimento: Movimento;
  duracao: number; // segundos
  formato: Formato;
}

export const PADRAO: Config = {
  base: 'selo',
  esquema: 'anil',
  titulo: 'O Nordeste',
  apoio: 'por conta própria',
  esquerda: 'nove estados',
  direita: 'sem figurino',
  assinatura: 'Barruada',
  arte: 'nove',
  uf: 'CE',
  camadas: { raios: true, disco: true, moldura: true, estrelas: false, textura: true, assinatura: true },
  traco: 1.5,
  divisas: true,
  caixaAlta: true,
  movimento: 'girar',
  duracao: 6,
  formato: 'feed',
};

// Começar do zero: fundo, um título vazio e nenhuma camada ligada.
export const DO_ZERO: Config = {
  ...PADRAO,
  base: 'branco',
  titulo: '',
  apoio: '',
  esquerda: '',
  direita: '',
  arte: 'nada',
  camadas: { raios: false, disco: false, moldura: false, estrelas: false, textura: false, assinatura: false },
  caixaAlta: false,
};

/* ---------- Tempo e entrada das camadas (puro) ---------- */

const ORDEM = ['raios', 'disco', 'arte', 'moldura', 'titulo', 'apoio', 'laterais', 'estrelas', 'assinatura'] as const;
export type Peca = (typeof ORDEM)[number];

export const limitar = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
export const suave = (p: number) => 1 - Math.pow(1 - limitar(p), 3);
export function comQuique(p: number): number {
  const x = limitar(p);
  const c = 1.70158;
  return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2);
}

export interface Estado {
  alpha: number;
  escala: number;
  dx: number; // em fração da largura
  dy: number; // em fração da altura
  giro: number; // radianos
  letras: number; // fração do título já escrita (0 a 1)
}

export const IMPACTO = 1.1; // segundo em que as duas metades se encontram na barruada

// Como cada peça está no instante t. Tudo entra em sequência no primeiro terço da duração.
export function estadoDa(peca: Peca, movimento: Movimento, t: number, duracao: number): Estado {
  const passo = Math.min(0.22, (duracao * 0.45) / ORDEM.length);
  const inicio = ORDEM.indexOf(peca) * passo;
  const p = limitar((t - inicio) / 0.8);
  const e: Estado = { alpha: suave(p), escala: 1, dx: 0, dy: 0, giro: 0, letras: 1 };
  if (peca === 'raios') e.giro = t * 0.22;

  if (movimento === 'queda') {
    e.alpha = p > 0 ? 1 : 0;
    e.dy = -(1 - comQuique(p)) * 0.9;
  } else if (movimento === 'crescer') {
    e.escala = p === 0 ? 0 : comQuique(p);
  } else if (movimento === 'digitar') {
    if (peca === 'titulo') {
      e.alpha = 1;
      e.letras = limitar((t - inicio) / Math.max(0.8, duracao * 0.3));
    }
  } else if (movimento === 'barruada') {
    const chegada = limitar(t / IMPACTO);
    const tremor = t > IMPACTO ? Math.sin((t - IMPACTO) * 46) * 0.018 * Math.exp(-(t - IMPACTO) * 5) : 0;
    if (peca === 'disco' || peca === 'raios') {
      e.alpha = 1;
      e.dx = -(1 - suave(chegada)) * 0.9 + tremor;
    } else if (peca === 'arte') {
      e.alpha = 1;
      e.dx = (1 - suave(chegada)) * 0.9 - tremor;
    } else if (peca === 'estrelas') {
      const estouro = limitar((t - IMPACTO) / 0.5);
      e.alpha = t < IMPACTO ? 0 : 1;
      e.escala = t < IMPACTO ? 0 : comQuique(estouro);
    } else {
      const depois = limitar((t - IMPACTO - 0.1 - ORDEM.indexOf(peca) * 0.06) / 0.6);
      e.alpha = suave(depois);
      e.dx = tremor;
    }
  } else {
    e.escala = 0.92 + 0.08 * suave(p);
  }
  return e;
}

/* ---------- Transformações do acervo (puro) ---------- */

export type Matriz = [number, number, number, number, number, number]; // a b c d e f

export function multiplicar(m: Matriz, n: Matriz): Matriz {
  return [
    m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1],
    m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3],
    m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5],
  ];
}

// Entende "rotate(a cx cy)", "translate(x y)" e "scale(x y)", na ordem em que aparecem.
export function lerTransformacao(texto: string | undefined): Matriz {
  let m: Matriz = [1, 0, 0, 1, 0, 0];
  if (!texto) return m;
  const re = /(rotate|translate|scale)\(([^)]*)\)/g;
  let achado: RegExpExecArray | null;
  while ((achado = re.exec(texto))) {
    const n = achado[2].split(/[\s,]+/).filter(Boolean).map(Number);
    if (achado[1] === 'translate') m = multiplicar(m, [1, 0, 0, 1, n[0] ?? 0, n[1] ?? 0]);
    else if (achado[1] === 'scale') m = multiplicar(m, [n[0] ?? 1, 0, 0, n[1] ?? n[0] ?? 1, 0, 0]);
    else {
      const a = ((n[0] ?? 0) * Math.PI) / 180;
      const [cx, cy] = [n[1] ?? 0, n[2] ?? 0];
      m = multiplicar(m, [1, 0, 0, 1, cx, cy]);
      m = multiplicar(m, [Math.cos(a), Math.sin(a), -Math.sin(a), Math.cos(a), 0, 0]);
      m = multiplicar(m, [1, 0, 0, 1, -cx, -cy]);
    }
  }
  return m;
}

/* ---------- Cores ---------- */

export interface Paleta {
  fundo: string;
  texto: string;
  raios: string;
  disco: string;
  mapa: string;
  divisa: string;
  destaque: string;
  segundo: string;
}

// Nome do token de cada papel, por esquema. Raios amarelos só sobre azul.
export const PAPEIS: Record<EsquemaAnim, Record<keyof Paleta, string>> = {
  anil: { fundo: 'anil', texto: 'papel', raios: 'sol', disco: 'barro', mapa: 'papel', divisa: 'barro', destaque: 'sol', segundo: 'anil-noite' },
  barro: { fundo: 'barro', texto: 'papel', raios: 'barro-escuro', disco: 'anil', mapa: 'papel', divisa: 'anil', destaque: 'sol', segundo: 'barro-escuro' },
  sol: { fundo: 'sol', texto: 'nanquim', raios: 'papel', disco: 'barro', mapa: 'papel', divisa: 'barro', destaque: 'barro', segundo: 'nanquim' },
  papel: { fundo: 'papel', texto: 'nanquim', raios: 'areia', disco: 'anil', mapa: 'sol', divisa: 'nanquim', destaque: 'barro', segundo: 'anil' },
  nanquim: { fundo: 'nanquim', texto: 'papel', raios: 'cinza-quente', disco: 'barro', mapa: 'papel', divisa: 'barro', destaque: 'sol', segundo: 'anil' },
  areia: { fundo: 'areia', texto: 'nanquim', raios: 'papel', disco: 'barro', mapa: 'papel', divisa: 'barro', destaque: 'anil', segundo: 'barro' },
};

/* ---------- Desenho ---------- */

export interface Recursos {
  mapa: { w: number; h: number; states: { uf: string; d: string }[] };
  arte: Record<string, { vb: string; clip: string | null; L: { d: string; c: string; t?: string; clip?: number; o?: number; line?: string; sw?: number }[] }>;
  cor: (token: string) => string; // lê uma variável de tokens.css
  fonteTitulo: string;
  grao: CanvasImageSource | null;
}

const ESTRELA = 'M50 4L61 36L96 34L68 55L80 92L50 70L18 94L31 56L4 38L39 37Z';
const POSICOES_ESTRELA = [[0.12, 0.16, 0.9], [0.86, 0.12, 0.6], [0.9, 0.8, 1], [0.1, 0.84, 0.7], [0.5, 0.07, 0.5]];

function corDoPapel(valor: string, paleta: Paleta, r: Recursos): string {
  if (valor === 'm') return paleta.texto;
  if (valor === 'a') return paleta.destaque;
  if (valor === 'p') return paleta.fundo;
  const token = valor.match(/var\(--([a-z-]+)\)/);
  return token ? r.cor(token[1]) : valor;
}

export function paletaDe(esquema: EsquemaAnim, r: Pick<Recursos, 'cor'>): Paleta {
  const papeis = PAPEIS[esquema];
  return Object.fromEntries(Object.entries(papeis).map(([k, token]) => [k, r.cor(token)])) as unknown as Paleta;
}

export function desenhar(ctx: CanvasRenderingContext2D, cfg: Config, t: number, r: Recursos): void {
  const { l: L, a: A } = FORMATOS[cfg.formato];
  const u = Math.min(L, A) / 1000; // unidade de desenho
  const paleta = paletaDe(cfg.esquema, r);
  const est = (peca: Peca) => estadoDa(peca, cfg.movimento, t, cfg.duracao);
  const texto = (s: string) => (cfg.caixaAlta ? s.toUpperCase() : s);
  const fonte = (peso: number, tamanho: number) => `${peso} ${tamanho}px ${r.fonteTitulo}`;
  const medirCom = (peso: number) => (tamanho: number) => (trecho: string) => {
    ctx.font = fonte(peso, tamanho);
    return ctx.measureText(trecho).width;
  };
  const espacar = (valor: number) => {
    if ('letterSpacing' in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${valor}px`;
  };
  const com = (e: Estado, cx: number, cy: number, pintar: () => void) => {
    if (e.alpha <= 0 || e.escala <= 0) return;
    ctx.save();
    ctx.globalAlpha = e.alpha;
    ctx.translate(cx + e.dx * L, cy + e.dy * A);
    ctx.rotate(e.giro);
    ctx.scale(e.escala, e.escala);
    ctx.translate(-cx, -cy);
    pintar();
    ctx.restore();
  };

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.fillStyle = paleta.fundo;
  ctx.fillRect(0, 0, L, A);

  // Onde fica o centro da arte em cada base.
  const retrato = A >= L;
  let cx = L / 2;
  let cy = A / 2;
  let raio = 330 * u;
  if (cfg.base === 'colagem') { cx = retrato ? L * 0.62 : L * 0.72; cy = retrato ? A * 0.66 : A * 0.56; raio = 270 * u; }
  if (cfg.base === 'corte') { cx = retrato ? L * 0.5 : L * 0.7; cy = retrato ? A * 0.6 : A * 0.52; raio = 290 * u; }
  if (cfg.base === 'lettering') { cx = retrato ? L * 0.74 : L * 0.82; cy = retrato ? A * 0.8 : A * 0.7; raio = 170 * u; }
  if (cfg.base === 'moldura') { cy = retrato ? A * 0.44 : A * 0.46; raio = 300 * u; }
  const margem = 44 * u;

  // Recortes de papel das bases de colagem e de papel cortado.
  if (cfg.base === 'colagem') {
    ctx.fillStyle = paleta.segundo;
    ctx.beginPath();
    const topo = A * (retrato ? 0.56 : 0.6);
    ctx.moveTo(0, topo);
    for (let i = 0; i <= 24; i++) ctx.lineTo((L * i) / 24, topo + (i % 2 === 0 ? -1 : 1) * (12 + ((i * 37) % 17)) * u);
    ctx.lineTo(L, A);
    ctx.lineTo(0, A);
    ctx.closePath();
    ctx.fill();
  } else if (cfg.base === 'corte') {
    ctx.fillStyle = paleta.segundo;
    ctx.beginPath();
    ctx.moveTo(0, A * 0.72); ctx.lineTo(L, A * 0.5); ctx.lineTo(L, A); ctx.lineTo(0, A);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = paleta.destaque;
    ctx.beginPath();
    ctx.moveTo(0, A * 0.86); ctx.lineTo(L, A * 0.7); ctx.lineTo(L, A * 0.78); ctx.lineTo(0, A * 0.94);
    ctx.closePath();
    ctx.fill();
  }

  // Raios
  if (cfg.camadas.raios) {
    const e = est('raios');
    ctx.save();
    if (cfg.base === 'selo' && cfg.camadas.moldura) {
      ctx.beginPath();
      ctx.rect(margem + 12 * u, margem + 12 * u, L - 2 * (margem + 12 * u), A - 2 * (margem + 12 * u));
      ctx.clip();
    }
    com(e, cx, cy, () => {
      const n = 32;
      const longe = Math.hypot(L, A);
      if (cfg.base === 'selo' || cfg.base === 'moldura') ctx.fillStyle = paleta.raios;
      else {
        // Fora do selo os raios se desfazem com a distância, para não brigar com o título.
        const some = ctx.createRadialGradient(cx, cy, raio, cx, cy, raio * 2.5);
        some.addColorStop(0, paleta.raios);
        some.addColorStop(1, paleta.fundo);
        ctx.fillStyle = some;
      }
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const a = (i * 2 * Math.PI) / n;
        ctx.moveTo(cx + Math.cos(a - 0.012) * raio * 1.1, cy + Math.sin(a - 0.012) * raio * 1.1);
        ctx.lineTo(cx + Math.cos(a - 0.045) * longe, cy + Math.sin(a - 0.045) * longe);
        ctx.lineTo(cx + Math.cos(a + 0.045) * longe, cy + Math.sin(a + 0.045) * longe);
        ctx.lineTo(cx + Math.cos(a + 0.012) * raio * 1.1, cy + Math.sin(a + 0.012) * raio * 1.1);
        ctx.closePath();
      }
      ctx.fill();
    });
    ctx.restore();
  }

  // Disco
  if (cfg.camadas.disco) {
    com(est('disco'), cx, cy, () => {
      ctx.strokeStyle = paleta.texto;
      ctx.lineWidth = 1.6 * u;
      ctx.beginPath();
      ctx.arc(cx, cy, raio * 1.07, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = paleta.disco;
      ctx.beginPath();
      ctx.arc(cx, cy, raio, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // Ilustração central
  if (cfg.arte !== 'nada') {
    com(est('arte'), cx, cy, () => {
      if (cfg.arte === 'nove' || cfg.arte === 'estado') {
        const escala = (raio * 1.36) / r.mapa.h;
        ctx.save();
        ctx.translate(cx - (r.mapa.w * escala) / 2, cy - (r.mapa.h * escala) / 2);
        ctx.scale(escala, escala);
        for (const s of r.mapa.states) {
          const caminho = new Path2D(s.d);
          const destaque = cfg.arte === 'estado' && s.uf === cfg.uf;
          ctx.fillStyle = destaque ? paleta.destaque : paleta.mapa;
          ctx.globalAlpha *= cfg.arte === 'estado' && !destaque ? 0.55 : 1;
          ctx.fill(caminho);
          ctx.globalAlpha = est('arte').alpha;
          if (cfg.divisas && cfg.traco > 0) {
            ctx.strokeStyle = paleta.divisa;
            ctx.lineWidth = (cfg.traco * u * 1.6) / escala;
            ctx.lineJoin = 'round';
            ctx.stroke(caminho);
          }
        }
        ctx.restore();
      } else {
        const arte = r.arte[cfg.arte];
        if (!arte) return;
        const [, , vw, vh] = arte.vb.split(/\s+/).map(Number);
        const escala = (raio * 1.25) / Math.max(vw, vh);
        ctx.save();
        ctx.translate(cx - (vw * escala) / 2, cy - (vh * escala) / 2);
        ctx.scale(escala, escala);
        for (const camada of arte.L) {
          const m = lerTransformacao(camada.t);
          const caminho = new Path2D();
          caminho.addPath(new Path2D(camada.d), { a: m[0], b: m[1], c: m[2], d: m[3], e: m[4], f: m[5] });
          ctx.save();
          if (camada.clip && arte.clip) ctx.clip(new Path2D(arte.clip));
          ctx.globalAlpha *= camada.o ?? 1;
          if (camada.line) {
            ctx.strokeStyle = corDoPapel(camada.line, paleta, r);
            ctx.lineWidth = camada.sw ?? 1;
            ctx.stroke(caminho);
          } else {
            // Sobre o disco, a cor principal precisa contrastar com ele.
            ctx.fillStyle = camada.c === 'm' && cfg.camadas.disco ? paleta.mapa : corDoPapel(camada.c, paleta, r);
            ctx.fill(caminho, 'evenodd');
          }
          ctx.restore();
        }
        ctx.restore();
      }
    });
  }

  // Moldura
  if (cfg.camadas.moldura) {
    com(est('moldura'), L / 2, A / 2, () => {
      ctx.strokeStyle = paleta.texto;
      if (cfg.base === 'moldura') {
        ctx.lineWidth = 26 * u;
        ctx.strokeStyle = paleta.destaque;
        ctx.strokeRect(margem + 13 * u, margem + 13 * u, L - 2 * margem - 26 * u, A - 2 * margem - 26 * u);
        ctx.strokeStyle = paleta.texto;
      }
      ctx.lineWidth = 3.5 * u;
      ctx.strokeRect(margem, margem, L - 2 * margem, A - 2 * margem);
      ctx.lineWidth = 1.4 * u;
      ctx.strokeRect(margem + 10 * u, margem + 10 * u, L - 2 * (margem + 10 * u), A - 2 * (margem + 10 * u));
    });
  }

  // Estrelas
  if (cfg.camadas.estrelas) {
    const e = est('estrelas');
    POSICOES_ESTRELA.forEach(([px, py, tam], i) => {
      const x = px * L;
      const y = py * A;
      const pisca = 0.85 + 0.15 * Math.sin(t * 3 + i * 1.7);
      com({ ...e, escala: e.escala * pisca, giro: Math.sin(t * 0.8 + i) * 0.2 }, x, y, () => {
        const s = (70 * tam * u) / 100;
        ctx.save();
        ctx.translate(x - 50 * s, y - 50 * s);
        ctx.scale(s, s);
        ctx.fillStyle = i % 2 === 0 ? paleta.destaque : paleta.texto;
        ctx.fill(new Path2D(ESTRELA));
        ctx.restore();
      });
    });
  }

  // Textos
  ctx.textBaseline = 'alphabetic';
  const titulo = texto(cfg.titulo);
  const apoio = texto(cfg.apoio);
  const eTitulo = est('titulo');
  const visivel = titulo.slice(0, Math.round(titulo.length * eTitulo.letras));

  const escrever = (linhas: string[], x: number, y: number, tamanho: number, alinhamento: CanvasTextAlign, peso: number, entre: number, aperto: number) => {
    ctx.font = fonte(peso, tamanho);
    ctx.textAlign = alinhamento;
    espacar(aperto);
    linhas.forEach((linha, i) => ctx.fillText(linha, x, y + i * tamanho * entre));
    espacar(0);
  };

  if (cfg.base === 'selo' || cfg.base === 'moldura' || cfg.base === 'branco') {
    // Título em cima e apoio embaixo, em caixa espaçada, como no cartaz-selo.
    const largura = L - 2 * margem - 80 * u;
    const selo = cfg.base === 'selo';
    if (titulo) {
      const alturaFaixa = selo ? 96 * u : 150 * u;
      if (selo && cfg.camadas.moldura) {
        ctx.fillStyle = paleta.fundo;
        ctx.fillRect(margem + 12 * u, margem + 12 * u, L - 2 * (margem + 12 * u), alturaFaixa);
      }
      const yBase = cfg.base === 'branco' ? A * 0.5 : cfg.base === 'moldura' ? A - margem - (retrato ? 250 : 170) * u : margem + 12 * u + alturaFaixa * 0.68;
      com(eTitulo, L / 2, yBase, () => {
        const caixa = ajustarTamanho(titulo, largura, selo ? alturaFaixa * 0.8 : 260 * u, selo ? 58 * u : 120 * u, 24 * u, 1, medirCom(800));
        ctx.fillStyle = paleta.texto;
        const linhas = selo ? [visivel] : ajustarTamanho(visivel || ' ', largura, 9999, caixa.tamanho, caixa.tamanho - 1, 1, medirCom(800)).linhas;
        escrever(linhas, L / 2, yBase, caixa.tamanho, 'center', 800, 0.98, selo ? caixa.tamanho * 0.2 : -caixa.tamanho * 0.045);
      });
    }
    if (apoio) {
      const alturaFaixa = 96 * u;
      if (selo && cfg.camadas.moldura) {
        ctx.fillStyle = paleta.fundo;
        ctx.fillRect(margem + 12 * u, A - margem - 12 * u - alturaFaixa, L - 2 * (margem + 12 * u), alturaFaixa);
      }
      const yBase = cfg.base === 'branco' ? A * 0.5 + 110 * u : A - margem - 12 * u - alturaFaixa * 0.34 - (cfg.base === 'moldura' ? 60 * u : 0);
      com(est('apoio'), L / 2, yBase, () => {
        const caixa = ajustarTamanho(apoio, largura, alturaFaixa * 0.8, selo ? 50 * u : 56 * u, 20 * u, 1, medirCom(800));
        ctx.fillStyle = cfg.base === 'selo' ? paleta.texto : paleta.destaque;
        escrever([apoio], L / 2, yBase, caixa.tamanho, 'center', 800, 1, selo ? caixa.tamanho * 0.2 : 0);
      });
    }
    if (selo) {
      const lateral = (valor: string, x: number, sentido: number) => {
        if (!valor) return;
        com(est('laterais'), x, A / 2, () => {
          if (cfg.camadas.moldura) {
            ctx.fillStyle = paleta.fundo;
            ctx.fillRect(x - 38 * u, margem + 108 * u, 76 * u, A - 2 * (margem + 108 * u));
          }
          ctx.save();
          ctx.translate(x, A / 2);
          ctx.rotate((sentido * Math.PI) / 2);
          ctx.fillStyle = paleta.texto;
          escrever([texto(valor)], 0, 12 * u, 34 * u, 'center', 800, 1, 34 * u * 0.22);
          ctx.restore();
        });
      };
      lateral(cfg.esquerda, margem + 56 * u, -1);
      lateral(cfg.direita, L - margem - 56 * u, 1);
    }
  } else {
    // Colagem, papel cortado e lettering: título grande alinhado à esquerda.
    const x = margem + 40 * u;
    const largura = cfg.base === 'lettering' ? L - 2 * x : (retrato ? L - 2 * x : L * 0.52);
    const alturaMax = cfg.base === 'lettering' ? A * 0.56 : A * (retrato ? 0.36 : 0.5);
    const yTopo = margem + 70 * u;
    if (titulo) {
      com(eTitulo, x, yTopo, () => {
        const caixa = ajustarTamanho(titulo, largura, alturaMax, cfg.base === 'lettering' ? 300 * u : 170 * u, 40 * u, 0.92, medirCom(800));
        const linhas = ajustarTamanho(visivel || ' ', largura, 99999, caixa.tamanho, caixa.tamanho - 1, 0.92, medirCom(800)).linhas;
        ctx.fillStyle = paleta.texto;
        escrever(linhas, x, yTopo + caixa.tamanho * 0.86, caixa.tamanho, 'left', 800, 0.92, -caixa.tamanho * 0.05);
        if (apoio) {
          const yApoio = yTopo + caixa.tamanho * 0.86 + (caixa.linhas.length - 1) * caixa.tamanho * 0.92 + 80 * u;
          const e = est('apoio');
          ctx.globalAlpha = e.alpha;
          // Etiqueta de papel, levemente torta.
          ctx.font = fonte(800, 46 * u);
          const lg = ctx.measureText(apoio).width + 44 * u;
          ctx.save();
          ctx.translate(x, yApoio);
          ctx.rotate(-0.035);
          ctx.fillStyle = r.cor('nanquim');
          ctx.fillRect(6 * u, -46 * u, lg, 70 * u);
          ctx.fillStyle = paleta.destaque;
          ctx.fillRect(0, -52 * u, lg, 70 * u);
          ctx.fillStyle = cfg.esquema === 'sol' || cfg.esquema === 'areia' ? r.cor('papel') : r.cor('nanquim');
          escrever([apoio], 22 * u, 0, 46 * u, 'left', 800, 1, -1.5 * u);
          ctx.restore();
        }
      });
    }
  }

  // Assinatura
  if (cfg.camadas.assinatura && cfg.assinatura) {
    com(est('assinatura'), L / 2, A - margem - 30 * u, () => {
      const selo = cfg.base === 'selo';
      ctx.fillStyle = paleta.texto;
      const tamanho = (selo ? 22 : 40) * u;
      const y = selo ? A - margem + 30 * u : A - margem - 34 * u;
      const xAss = selo ? L / 2 : margem + 40 * u;
      if (!selo) {
        // Etiqueta de papel, para a assinatura aparecer sobre qualquer recorte.
        ctx.font = fonte(800, tamanho);
        espacar(-tamanho * 0.05);
        const lg = ctx.measureText(cfg.assinatura.toUpperCase()).width;
        espacar(0);
        ctx.fillStyle = r.cor('papel');
        ctx.fillRect(xAss - 14 * u, y - tamanho * 0.95, lg + 28 * u, tamanho * 1.3);
        ctx.fillStyle = r.cor('nanquim');
      }
      escrever([cfg.assinatura.toUpperCase()], xAss, y, tamanho, selo ? 'center' : 'left', 800, 1, selo ? tamanho * 0.3 : -tamanho * 0.05);
    });
  }

  // Textura
  if (cfg.camadas.textura && r.grao) {
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.globalCompositeOperation = 'multiply';
    const padrao = ctx.createPattern(r.grao, 'repeat');
    if (padrao) {
      ctx.fillStyle = padrao;
      ctx.fillRect(0, 0, L, A);
    }
    ctx.restore();
  }
  ctx.globalAlpha = 1;
  ctx.textAlign = 'left';
}
