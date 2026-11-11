// Cartão de compartilhamento 1080x1350, desenhado em canvas e exportado em PNG.
// Cores e fontes saem das variáveis de tokens.css: nada fixo aqui.

import { FORMAS } from '../components/marca/Formas.tsx';

export const LARGURA = 1080;
export const ALTURA = 1350;

export type FundoCartao = 'anil' | 'barro' | 'sol' | 'nanquim' | 'papel';

export interface Cartao {
  fundo: FundoCartao;
  rotulo: string;
  titulo: string;
  linhas?: string[];
  caneta?: string;
  grade?: { texto: string; marcada: boolean }[]; // cartela 5x5 do bingo
  marca: string; // nome do site
  assinatura: string;
}

// Mesmo esquema das capas: [texto, destaque]
const ESQUEMA: Record<FundoCartao, [string, string]> = {
  anil: ['papel', 'sol'],
  barro: ['papel', 'sol'],
  sol: ['nanquim', 'barro'],
  nanquim: ['papel', 'sol'],
  papel: ['nanquim', 'barro'],
};

// Quebra o texto em linhas que cabem na largura. "medir" devolve a largura de um trecho.
export function quebrarLinhas(texto: string, largura: number, medir: (trecho: string) => number): string[] {
  const linhas: string[] = [];
  for (const paragrafo of texto.split('\n')) {
    let atual = '';
    for (const palavra of paragrafo.split(/\s+/).filter(Boolean)) {
      const tentativa = atual ? `${atual} ${palavra}` : palavra;
      if (atual && medir(tentativa) > largura) {
        linhas.push(atual);
        atual = palavra;
      } else atual = tentativa;
    }
    if (atual) linhas.push(atual);
  }
  return linhas;
}

// Maior tamanho de fonte (entre max e min) em que o texto cabe na caixa.
export function ajustarTamanho(
  texto: string,
  largura: number,
  altura: number,
  max: number,
  min: number,
  entrelinha: number,
  medirCom: (tamanho: number) => (trecho: string) => number,
): { tamanho: number; linhas: string[] } {
  for (let tamanho = max; tamanho > min; tamanho -= 2) {
    const medir = medirCom(tamanho);
    const linhas = quebrarLinhas(texto, largura, medir);
    const cabe = linhas.every((l) => medir(l) <= largura);
    if (cabe && linhas.length * tamanho * entrelinha <= altura) return { tamanho, linhas };
  }
  return { tamanho: min, linhas: quebrarLinhas(texto, largura, medirCom(min)) };
}

export async function desenharCartao(c: Cartao): Promise<Blob> {
  const estilo = getComputedStyle(document.documentElement);
  const cor = (nome: string) => estilo.getPropertyValue(`--${nome}`).trim();
  const fonteTitulo = estilo.getPropertyValue('--fonte-titulo').trim();
  const fonteCaneta = estilo.getPropertyValue('--fonte-caneta').trim();
  const [nomeTexto, nomeDestaque] = ESQUEMA[c.fundo];
  const texto = cor(nomeTexto);
  const destaque = cor(nomeDestaque);

  await Promise.all([
    document.fonts.load(`800 100px ${fonteTitulo}`),
    document.fonts.load(`500 40px ${fonteTitulo}`),
    document.fonts.load(`400 60px ${fonteCaneta}`),
  ]).catch(() => undefined);

  const tela = document.createElement('canvas');
  tela.width = LARGURA;
  tela.height = ALTURA;
  const ctx = tela.getContext('2d');
  if (!ctx) throw new Error('Este navegador não desenha o cartão.');

  const margem = 84;
  const util = LARGURA - margem * 2;
  const fonte = (peso: number, tamanho: number, familia = fonteTitulo) => `${peso} ${tamanho}px ${familia}`;
  const medirCom = (peso: number) => (tamanho: number) => (trecho: string) => {
    ctx.font = fonte(peso, tamanho);
    return ctx.measureText(trecho).width;
  };
  const espacar = (valor: string) => {
    if ('letterSpacing' in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = valor;
  };

  // Fundo chapado e o sol da marca no canto.
  ctx.fillStyle = cor(c.fundo);
  ctx.fillRect(0, 0, LARGURA, ALTURA);
  ctx.save();
  ctx.translate(LARGURA - 300, -90);
  ctx.scale(3.9, 3.9);
  ctx.fillStyle = destaque;
  ctx.globalAlpha = c.grade ? 0.35 : 1;
  ctx.fill(new Path2D(FORMAS.sol), 'evenodd');
  ctx.restore();

  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = texto;

  // Rótulo
  espacar('6px');
  ctx.font = fonte(700, 28);
  ctx.fillText(c.rotulo.toUpperCase(), margem, margem + 30, util - 260);

  // Título
  let y = margem + 110;
  const alturaTitulo = c.grade ? 150 : 400;
  const titulo = ajustarTamanho(c.titulo, util - (c.grade ? 0 : 60), alturaTitulo, c.grade ? 84 : 128, 44, 0.94, medirCom(800));
  espacar(`${-titulo.tamanho * 0.05}px`);
  ctx.font = fonte(800, titulo.tamanho);
  for (const linha of titulo.linhas) {
    y += titulo.tamanho * 0.94;
    ctx.fillText(linha, margem, y);
  }
  y += 44;

  const rodape = ALTURA - margem - 110;

  // Cartela do bingo
  if (c.grade) {
    const lado = Math.min(util, rodape - y - 20) / 5;
    const x0 = margem + (util - lado * 5) / 2;
    espacar('0px');
    c.grade.forEach((casa, i) => {
      const x = x0 + (i % 5) * lado;
      const yy = y + Math.floor(i / 5) * lado;
      ctx.fillStyle = casa.marcada ? destaque : cor(c.fundo);
      ctx.fillRect(x, yy, lado, lado);
      ctx.strokeStyle = texto;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, yy, lado, lado);
      const caixa = ajustarTamanho(casa.texto, lado - 16, lado - 16, 26, 12, 1.12, medirCom(700));
      ctx.font = fonte(700, caixa.tamanho);
      ctx.fillStyle = casa.marcada ? cor(nomeDestaque === 'sol' ? 'nanquim' : 'papel') : texto;
      ctx.textAlign = 'center';
      const altura = caixa.linhas.length * caixa.tamanho * 1.12;
      caixa.linhas.forEach((linha, n) => {
        ctx.fillText(linha, x + lado / 2, yy + (lado - altura) / 2 + caixa.tamanho * (n * 1.12 + 0.9));
      });
      ctx.textAlign = 'left';
    });
    ctx.fillStyle = texto;
  }

  // Frase da caneta (fica logo acima do rodapé)
  let limite = rodape - 20;
  if (c.caneta) {
    espacar('0px');
    const caneta = ajustarTamanho(c.caneta, util, 150, 72, 40, 1, (t) => (trecho) => {
      ctx.font = fonte(400, t, fonteCaneta);
      return ctx.measureText(trecho).width;
    });
    ctx.font = fonte(400, caneta.tamanho, fonteCaneta);
    ctx.fillStyle = destaque;
    limite -= caneta.linhas.length * caneta.tamanho;
    caneta.linhas.forEach((linha, n) => ctx.fillText(linha, margem, limite + caneta.tamanho * (n + 0.85)));
    ctx.fillStyle = texto;
    limite -= 24;
  }

  // Corpo
  if (c.linhas && c.linhas.length > 0 && !c.grade) {
    espacar('0px');
    const corpo = ajustarTamanho(c.linhas.join('\n'), util, limite - y, 46, 22, 1.3, medirCom(500));
    ctx.font = fonte(500, corpo.tamanho);
    for (const linha of corpo.linhas) {
      y += corpo.tamanho * 1.3;
      ctx.fillText(linha, margem, y);
    }
  }

  // Rodapé com a marca
  ctx.fillRect(margem, rodape, util, 3);
  espacar('-2.6px');
  ctx.font = fonte(800, 52);
  ctx.fillText(c.marca.toUpperCase(), margem, rodape + 68);
  espacar('0px');
  ctx.font = fonte(500, 26);
  ctx.fillText(c.assinatura, margem, rodape + 108, util);

  return new Promise((resolve, reject) => {
    tela.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Não deu para gerar o PNG.'))), 'image/png');
  });
}
