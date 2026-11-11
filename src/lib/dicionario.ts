// Lógica do Dicionário da Barruada em modo jogo: uma palavra, quatro significados, um só certo.

import { embaralhar } from './quiz.ts';
import type { Termo } from './types.ts';

export interface Pergunta {
  termo: string;
  opcoes: string[];
  certa: number;
  exemplo: string;
  onde: string;
}

export function montarRodada(termos: Termo[], quantas = 8, sorteio: () => number = Math.random): Pergunta[] {
  const escolhidos = embaralhar(termos, sorteio).slice(0, quantas);
  return escolhidos.map((t) => {
    const erradas = embaralhar(
      [...new Set(termos.filter((x) => x.significado !== t.significado).map((x) => x.significado))],
      sorteio,
    ).slice(0, 3);
    const opcoes = embaralhar([t.significado, ...erradas], sorteio);
    return { termo: t.termo, opcoes, certa: opcoes.indexOf(t.significado), exemplo: t.exemplo, onde: t.onde };
  });
}

export function vereditoDicionario(acertos: number, total: number): string {
  const fatia = total === 0 ? 0 : acertos / total;
  if (fatia === 1) return 'Arretado. Fala os nove sotaques.';
  if (fatia >= 0.6) return 'Massa. Já dá para pedir informação na rua.';
  return 'Oxe. Bora passar mais tempo no dicionário.';
}
