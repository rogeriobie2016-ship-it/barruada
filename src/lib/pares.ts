// Lógica do jogo de ligar pares (Aprendendo inglês com forró).

import { embaralhar } from './quiz.ts';

export interface Par {
  pt: string;
  en: string;
  grupo?: string;
}

export interface Rodada {
  pares: Par[];
  esquerda: string[]; // palavras em português, embaralhadas
  direita: string[]; // palavras em inglês, embaralhadas
}

export function montarPares(lista: readonly Par[], quantos = 6, sorteio: () => number = Math.random): Rodada {
  const pares = embaralhar(lista, sorteio).slice(0, quantos);
  return {
    pares,
    esquerda: embaralhar(pares.map((p) => p.pt), sorteio),
    direita: embaralhar(pares.map((p) => p.en), sorteio),
  };
}

export function ehPar(pares: readonly Par[], pt: string, en: string): boolean {
  return pares.some((p) => p.pt === pt && p.en === en);
}

export function vereditoPares(erros: number): string {
  if (erros === 0) return 'Perfect. Nenhum erro.';
  if (erros <= 2) return 'Very good. Quase sem tropeço.';
  return 'Keep going. Joga de novo que melhora.';
}
