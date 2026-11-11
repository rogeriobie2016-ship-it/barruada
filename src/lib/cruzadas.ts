// Gerador de palavras cruzadas: recebe respostas com dica e monta a grade sozinho.
// Cada palavra nova precisa cruzar com alguma que já está na grade.

import { embaralhar } from './quiz.ts';
import { semAcento } from './texto.ts';

export interface Entrada {
  resposta: string;
  dica: string;
}

export interface Colocada {
  numero: number;
  resposta: string; // só letras maiúsculas, sem acento
  dica: string;
  linha: number;
  coluna: number;
  dir: 'h' | 'v';
}

export interface Grade {
  linhas: number;
  colunas: number;
  palavras: Colocada[];
  letras: (string | null)[][]; // gabarito: null é casa preta
}

export function limpar(resposta: string): string {
  return semAcento(resposta).toUpperCase().replace(/[^A-Z]/g, '');
}

type Mapa = Map<string, string>;
const chave = (l: number, c: number) => `${l},${c}`;

interface Posicao {
  linha: number;
  coluna: number;
  dir: 'h' | 'v';
}

// Quantos cruzamentos a palavra faz nessa posição. -1 se não cabe.
function cruzamentos(mapa: Mapa, palavra: string, p: Posicao): number {
  const dl = p.dir === 'v' ? 1 : 0;
  const dc = p.dir === 'h' ? 1 : 0;
  // A casa antes do começo e a casa depois do fim precisam estar vazias.
  if (mapa.has(chave(p.linha - dl, p.coluna - dc))) return -1;
  if (mapa.has(chave(p.linha + dl * palavra.length, p.coluna + dc * palavra.length))) return -1;
  let cruza = 0;
  for (let i = 0; i < palavra.length; i++) {
    const l = p.linha + dl * i;
    const c = p.coluna + dc * i;
    const atual = mapa.get(chave(l, c));
    if (atual !== undefined) {
      if (atual !== palavra[i]) return -1;
      cruza++;
    } else if (mapa.has(chave(l + dc, c + dl)) || mapa.has(chave(l - dc, c - dl))) {
      // Casa nova não pode encostar de lado em outra palavra.
      return -1;
    }
  }
  return cruza;
}

function limites(mapa: Mapa) {
  let minL = Infinity, maxL = -Infinity, minC = Infinity, maxC = -Infinity;
  for (const k of mapa.keys()) {
    const [l, c] = k.split(',').map(Number);
    minL = Math.min(minL, l); maxL = Math.max(maxL, l); minC = Math.min(minC, c); maxC = Math.max(maxC, c);
  }
  return { minL, maxL, minC, maxC };
}

function tentar(entradas: { resposta: string; dica: string }[], lado: number, quantas: number, sorteio: () => number) {
  const mapa: Mapa = new Map();
  const postas: (Posicao & { resposta: string; dica: string })[] = [];
  const por = (palavra: string, p: Posicao) => {
    for (let i = 0; i < palavra.length; i++) mapa.set(chave(p.linha + (p.dir === 'v' ? i : 0), p.coluna + (p.dir === 'h' ? i : 0)), palavra[i]);
  };
  const cabe = (palavra: string, p: Posicao) => {
    const m = limites(mapa);
    const fimL = p.linha + (p.dir === 'v' ? palavra.length - 1 : 0);
    const fimC = p.coluna + (p.dir === 'h' ? palavra.length - 1 : 0);
    return Math.max(m.maxL, fimL) - Math.min(m.minL, p.linha) < lado && Math.max(m.maxC, fimC) - Math.min(m.minC, p.coluna) < lado;
  };

  for (const e of entradas) {
    if (postas.length >= quantas) break;
    const palavra = e.resposta;
    if (palavra.length > lado) continue;
    if (postas.length === 0) {
      const p: Posicao = { linha: 0, coluna: 0, dir: 'h' };
      por(palavra, p);
      postas.push({ ...p, ...e });
      continue;
    }
    let melhor: Posicao | null = null;
    let nota = 0;
    for (const [k, letra] of mapa) {
      const [l, c] = k.split(',').map(Number);
      for (let i = 0; i < palavra.length; i++) {
        if (palavra[i] !== letra) continue;
        for (const dir of ['h', 'v'] as const) {
          const p: Posicao = { linha: l - (dir === 'v' ? i : 0), coluna: c - (dir === 'h' ? i : 0), dir };
          const n = cruzamentos(mapa, palavra, p);
          if (n < 1 || !cabe(palavra, p)) continue;
          const valor = n + sorteio() * 0.5;
          if (valor > nota) {
            nota = valor;
            melhor = p;
          }
        }
      }
    }
    if (melhor) {
      por(palavra, melhor);
      postas.push({ ...melhor, ...e });
    }
  }
  return { mapa, postas };
}

export function montarGrade(entradas: readonly Entrada[], lado = 13, quantas = 12, sorteio: () => number = Math.random): Grade {
  const limpas = entradas
    .map((e) => ({ resposta: limpar(e.resposta), dica: e.dica }))
    .filter((e, i, todas) => e.resposta.length >= 3 && todas.findIndex((x) => x.resposta === e.resposta) === i);

  let melhor = tentar([], lado, quantas, sorteio);
  for (let rodada = 0; rodada < 30; rodada++) {
    // Palavras compridas primeiro dão mais chance de cruzar.
    const ordem = embaralhar(limpas, sorteio).sort((a, b) => b.resposta.length - a.resposta.length + (sorteio() - 0.5) * 3);
    const resultado = tentar(ordem, lado, quantas, sorteio);
    if (resultado.postas.length > melhor.postas.length) melhor = resultado;
    if (melhor.postas.length >= quantas) break;
  }

  const { minL, maxL, minC, maxC } = limites(melhor.mapa);
  const linhas = melhor.postas.length === 0 ? 0 : maxL - minL + 1;
  const colunas = melhor.postas.length === 0 ? 0 : maxC - minC + 1;
  const letras: (string | null)[][] = Array.from({ length: linhas }, () => Array.from({ length: colunas }, () => null));
  for (const [k, letra] of melhor.mapa) {
    const [l, c] = k.split(',').map(Number);
    letras[l - minL][c - minC] = letra;
  }

  // Numera na ordem de leitura. Horizontal e vertical que começam na mesma casa dividem o número.
  const ajustadas = melhor.postas.map((p) => ({ ...p, linha: p.linha - minL, coluna: p.coluna - minC }));
  const inicios = [...new Set(ajustadas.map((p) => p.linha * 1000 + p.coluna))].sort((a, b) => a - b);
  const palavras: Colocada[] = ajustadas
    .map((p) => ({ numero: inicios.indexOf(p.linha * 1000 + p.coluna) + 1, resposta: p.resposta, dica: p.dica, linha: p.linha, coluna: p.coluna, dir: p.dir }))
    .sort((a, b) => a.numero - b.numero || a.dir.localeCompare(b.dir));

  return { linhas, colunas, palavras, letras };
}

export function casasDa(p: Colocada): [number, number][] {
  return Array.from({ length: p.resposta.length }, (_, i) => [p.linha + (p.dir === 'v' ? i : 0), p.coluna + (p.dir === 'h' ? i : 0)] as [number, number]);
}

// Compara o que a pessoa escreveu com o gabarito.
export function conferir(grade: Grade, escrito: string[][]): { certas: number; total: number; completa: boolean } {
  let certas = 0;
  let total = 0;
  for (let l = 0; l < grade.linhas; l++) {
    for (let c = 0; c < grade.colunas; c++) {
      if (grade.letras[l][c] === null) continue;
      total++;
      if ((escrito[l]?.[c] ?? '') === grade.letras[l][c]) certas++;
    }
  }
  return { certas, total, completa: total > 0 && certas === total };
}
