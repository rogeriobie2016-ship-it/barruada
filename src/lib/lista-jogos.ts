// Lista dos jogos do site.

import type { Esquema } from '../components/marca/Capa.tsx';

export interface Jogo {
  id: string;
  nome: string;
  descricao: string;
  esquema: Esquema;
  arte: string;
  pronto: boolean;
  prototipo?: boolean;
}

export const JOGOS: Jogo[] = [
  {
    id: 'novela-ou-nordeste',
    nome: 'Novela ou Nordeste?',
    descricao: 'Uma afirmação por vez. Você diz se é Nordeste de verdade ou coisa de novela.',
    esquema: 'anil',
    arte: 'predio',
    pronto: true,
  },
  {
    id: 'monte-sua-novela',
    nome: 'Monte sua novela',
    descricao: 'Escolha lugar, protagonista e conflito. A sinopse sai na hora, sem coronel.',
    esquema: 'sol',
    arte: 'cadeira',
    pronto: true,
  },
  {
    id: 'bingo-do-estereotipo',
    nome: 'Bingo do estereótipo',
    descricao: 'Cartela sorteada para marcar enquanto assiste. Vale para qualquer obra.',
    esquema: 'barro',
    arte: 'filtro',
    pronto: true,
  },
  {
    id: 'dicionario',
    nome: 'Dicionário da Barruada',
    descricao: 'Uma palavra, quatro significados, uma resposta certa.',
    esquema: 'papel',
    arte: 'livro',
    pronto: true,
  },
  {
    id: 'a-jornada-desmontada',
    nome: 'A jornada desmontada',
    descricao: 'As doze etapas do herói sertanejo, viradas uma a uma.',
    esquema: 'nanquim',
    arte: 'jangada',
    pronto: true,
  },
  {
    id: 'ingles-com-forro',
    nome: 'Aprendendo inglês com forró',
    descricao: 'Ligue as palavras do forró e do dicionário com o inglês. Dá para ouvir a pronúncia.',
    esquema: 'areia',
    arte: 'mic',
    pronto: true,
    prototipo: true,
  },
];
