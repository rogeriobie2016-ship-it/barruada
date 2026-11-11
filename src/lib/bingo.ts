// Lógica do Bingo do estereótipo: cartela 5x5 sorteada, com o centro livre.

import { embaralhar } from './quiz.ts';

export const LADO = 5;
export const CENTRO = 12;
export const CASA_LIVRE = 'Se passa em 2026';

export function sortearCartela(itens: readonly string[], sorteio: () => number = Math.random): string[] {
  if (itens.length < LADO * LADO - 1) throw new Error('O bingo precisa de pelo menos 24 itens.');
  const sorteados = embaralhar(itens, sorteio).slice(0, LADO * LADO - 1);
  return [...sorteados.slice(0, CENTRO), CASA_LIVRE, ...sorteados.slice(CENTRO)];
}

export function cartelaVazia(): boolean[] {
  return Array.from({ length: LADO * LADO }, (_, i) => i === CENTRO);
}

// As 12 linhas possíveis: 5 na horizontal, 5 na vertical e 2 diagonais.
export const LINHAS: number[][] = [
  ...Array.from({ length: LADO }, (_, l) => Array.from({ length: LADO }, (_, c) => l * LADO + c)),
  ...Array.from({ length: LADO }, (_, c) => Array.from({ length: LADO }, (_, l) => l * LADO + c)),
  Array.from({ length: LADO }, (_, i) => i * LADO + i),
  Array.from({ length: LADO }, (_, i) => i * LADO + (LADO - 1 - i)),
];

export function linhasFechadas(marcadas: boolean[]): number[][] {
  return LINHAS.filter((linha) => linha.every((i) => marcadas[i]));
}

// O centro é livre e fica sempre marcado.
export function alternar(marcadas: boolean[], casa: number): boolean[] {
  if (casa === CENTRO) return marcadas;
  return marcadas.map((m, i) => (i === casa ? !m : m));
}
