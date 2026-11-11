// Lista dos jogos do site. "pronto: false" aparece como "em breve" (fase 2).

import type { Esquema } from '../components/marca/Capa.tsx';
import type { NomeForma } from '../components/marca/Formas.tsx';

export interface Jogo {
  id: string;
  nome: string;
  descricao: string;
  esquema: Esquema;
  forma: NomeForma;
  pronto: boolean;
}

export const JOGOS: Jogo[] = [
  {
    id: 'novela-ou-nordeste',
    nome: 'Novela ou Nordeste?',
    descricao: 'Uma afirmação por vez. Você diz se é Nordeste de verdade ou coisa de novela.',
    esquema: 'anil',
    forma: 'raios',
    pronto: true,
  },
  {
    id: 'monte-sua-novela',
    nome: 'Monte sua novela',
    descricao: 'Escolha lugar, protagonista e conflito. A sinopse sai na hora, sem coronel.',
    esquema: 'sol',
    forma: 'estrela',
    pronto: true,
  },
  {
    id: 'bingo-do-estereotipo',
    nome: 'Bingo do estereótipo',
    descricao: 'Cartela sorteada para marcar enquanto assiste. Vale para qualquer obra.',
    esquema: 'barro',
    forma: 'disco',
    pronto: false,
  },
  {
    id: 'dicionario',
    nome: 'Dicionário da Barruada',
    descricao: 'Uma palavra, quatro significados, uma resposta certa.',
    esquema: 'papel',
    forma: 'sol',
    pronto: false,
  },
  {
    id: 'a-jornada-desmontada',
    nome: 'A jornada desmontada',
    descricao: 'As doze etapas do herói sertanejo, viradas uma a uma.',
    esquema: 'nanquim',
    forma: 'anel',
    pronto: false,
  },
];
