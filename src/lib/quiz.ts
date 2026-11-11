// Lógica do jogo Novela ou Nordeste?

import type { QuizItem } from './types.ts';

export type Escolha = QuizItem['resposta'];

export function embaralhar<T>(lista: readonly T[], sorteio: () => number = Math.random): T[] {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(sorteio() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function acertou(item: QuizItem, escolha: Escolha): boolean {
  return item.resposta === escolha;
}

export function placar(itens: QuizItem[], escolhas: Escolha[]): { acertos: number; total: number } {
  const acertos = escolhas.filter((e, i) => itens[i] && acertou(itens[i], e)).length;
  return { acertos, total: itens.length };
}

// Frase da tela de resultado, conforme a fatia de acertos.
export function veredito(acertos: number, total: number): string {
  const fatia = total === 0 ? 0 : acertos / total;
  if (fatia === 1) return 'Gabaritou. Pode escrever a próxima novela.';
  if (fatia >= 0.75) return 'Quase lá. Você conhece mais Nordeste que muito roteirista.';
  if (fatia >= 0.5) return 'Metade novela, metade Nordeste. Bora conferir as fontes.';
  return 'Você andou vendo muita novela. As fontes estão aí embaixo.';
}
