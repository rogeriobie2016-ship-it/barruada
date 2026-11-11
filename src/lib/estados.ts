// Junta, por estado, as pessoas do coletivo e os itens checados da biblioteca.

import { bibliotecaPublica, ESTADOS, ufsDoItem } from './biblioteca.ts';
import type { ItemBiblioteca, Membro, SecaoBiblioteca } from './types.ts';

export const SECAO_DADOS = 'Dados para o pilar Afirmação';

export interface ResumoEstado {
  uf: string;
  nome: string;
  membros: Membro[];
  dados: ItemBiblioteca[];
  referencias: (ItemBiblioteca & { secao: string })[];
}

export function resumoPorEstado(biblioteca: SecaoBiblioteca[], membros: Membro[]): ResumoEstado[] {
  const publica = bibliotecaPublica(biblioteca);
  return ESTADOS.filter((e) => e.uf !== 'NE' && e.uf !== 'BR').map((e) => ({
    uf: e.uf,
    nome: e.nome,
    membros: membros.filter((m) => m.estado.toUpperCase() === e.uf),
    dados: publica.filter((s) => s.secao === SECAO_DADOS).flatMap((s) => s.itens.filter((i) => ufsDoItem(i).includes(e.uf))),
    referencias: publica
      .filter((s) => s.secao !== SECAO_DADOS)
      .flatMap((s) => s.itens.filter((i) => ufsDoItem(i).includes(e.uf)).map((i) => ({ ...i, secao: s.secao }))),
  }));
}
