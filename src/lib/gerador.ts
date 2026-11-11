// Lógica do jogo Monte sua novela.

import { maiuscula, semAcento } from './texto.ts';
import type { Gerador } from './types.ts';

export interface Escolhas {
  lugar: string;
  protagonista: string;
  conflito: string;
}

export interface Sinopse {
  titulo: string;
  frases: [string, string, string];
}

export function sortear(g: Gerador, sorteio: () => number = Math.random): Escolhas {
  const um = (lista: string[]) => lista[Math.floor(sorteio() * lista.length)];
  return { lugar: um(g.lugar), protagonista: um(g.protagonista), conflito: um(g.conflito) };
}

export function montarSinopse(e: Escolhas): Sinopse {
  return {
    titulo: maiuscula(e.conflito),
    frases: [
      `Em ${e.lugar}, ${e.protagonista} toca a vida numa terça-feira qualquer.`,
      `Tudo muda quando entra em cena ${e.conflito}.`,
      'Sem coronel, sem retirante e sem seca como vilã: só gente de hoje resolvendo a vida.',
    ],
  };
}

function limpo(s: string): string {
  return semAcento(s).replace(/[^a-z0-9]+/g, ' ').trim();
}

// "seca como vilã" também conta se a pessoa escrever só "seca".
function palavraChave(termo: string): string {
  return limpo(termo).split(/ como | em toda /)[0].trim();
}

export interface Medida {
  achados: string[];
  nivel: number; // de 0 a 1
  comentario: string;
}

export function medirCliche(texto: string, cliches: string[]): Medida {
  const t = ` ${limpo(texto)} `;
  const achados = cliches.filter((c) => t.includes(` ${palavraChave(c)} `));
  const n = achados.length;
  const nivel = Math.min(1, n / 3);
  let comentario = '';
  if (n === 1) comentario = 'Eita. Isso aí a novela já fez.';
  else if (n === 2) comentario = 'Dois clichês. Tá virando novela das seis.';
  else if (n >= 3) comentario = 'Pronto: você escreveu a novela que já existe.';
  return { achados, nivel, comentario };
}
