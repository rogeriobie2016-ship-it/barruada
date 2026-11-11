// Imagens de compartilhamento (1200x630), uma por página.
// A lista mora aqui para o gerador (scripts/og.ts) e o layout usarem o mesmo nome de arquivo.

import { ESTADOS } from './biblioteca.ts';
import { JOGOS } from './lista-jogos.ts';

export interface PaginaOg {
  caminho: string; // rota, com barras no começo e no fim
  rotulo: string;
  titulo: string;
  tom: 'anil' | 'barro' | 'sol' | 'nanquim' | 'papel' | 'areia';
  uf?: string; // destaca um estado no mapa
}

// "/jogos/dicionario/" vira "jogos-dicionario". A página inicial vira "inicio".
export function nomeOg(caminho: string): string {
  const limpo = caminho.replace(/^\/+|\/+$/g, '').replace(/\//g, '-');
  return limpo === '' ? 'inicio' : limpo;
}

const tonsDosJogos: PaginaOg['tom'][] = ['anil', 'sol', 'barro', 'papel', 'nanquim', 'areia'];

export const PAGINAS_OG: PaginaOg[] = [
  { caminho: '/', rotulo: 'Barruada', titulo: 'O Nordeste que a novela não mostra', tom: 'anil' },
  { caminho: '/em-cartaz/', rotulo: 'Em cartaz', titulo: 'O que já foi pro ar', tom: 'anil' },
  { caminho: '/biblioteca/', rotulo: 'Biblioteca', titulo: 'Tudo aqui tem fonte.', tom: 'papel' },
  { caminho: '/glossario/', rotulo: 'Dicionário da Barruada', titulo: 'Oxe, que palavra é essa?', tom: 'areia' },
  { caminho: '/jogos/', rotulo: 'Jogos', titulo: 'Pra jogar com uma mão só', tom: 'barro' },
  { caminho: '/sala-de-aula/', rotulo: 'Leva pra sala', titulo: 'Material para usar com a turma', tom: 'anil' },
  { caminho: '/sala-de-aula/projetar/', rotulo: 'Para projetar', titulo: 'Novela ou Nordeste? para a turma', tom: 'nanquim' },
  { caminho: '/quem-somos/', rotulo: 'Quem somos', titulo: 'Gente de cada estado', tom: 'barro' },
  { caminho: '/marca/', rotulo: 'Hub de marca', titulo: 'Pegue a marca e produza.', tom: 'sol' },
  { caminho: '/mural/', rotulo: 'Mural', titulo: 'Me mostra na novela', tom: 'barro' },
  ...JOGOS.map((j, n) => ({ caminho: `/jogos/${j.id}/`, rotulo: 'Jogo', titulo: j.nome, tom: tonsDosJogos[n % tonsDosJogos.length] })),
  ...ESTADOS.filter((e) => e.uf !== 'NE' && e.uf !== 'BR').map((e) => ({
    caminho: `/estado/${e.uf.toLowerCase()}/`,
    rotulo: 'Um dos nove',
    titulo: e.nome,
    tom: 'anil' as const,
    uf: e.uf,
  })),
];
