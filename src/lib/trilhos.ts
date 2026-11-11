// Monta os trilhos da página inicial. Função pura, testada em tests/unit.

import { bibliotecaPublica, TRILHO_DA_SECAO } from './biblioteca.ts';
import type { ItemBiblioteca, Pauta, SecaoBiblioteca, Termo } from './types.ts';

export interface ItemComSecao extends ItemBiblioteca {
  secao: string;
}

export interface Trilhos {
  emCartaz: Pauta[];
  emBreve: Pauta[];
  ler: ItemComSecao[];
  ver: ItemComSecao[];
  ouvir: ItemComSecao[];
  dicionario: Termo[];
}

export function montarTrilhos(pautas: Pauta[], biblioteca: SecaoBiblioteca[], glossario: Termo[]): Trilhos {
  const publica = bibliotecaPublica(biblioteca);
  const doTrilho = (nome: 'ler' | 'ver' | 'ouvir') =>
    publica
      .filter((s) => TRILHO_DA_SECAO[s.secao] === nome)
      .flatMap((s) => s.itens.map((i) => ({ ...i, secao: s.secao })));
  return {
    emCartaz: pautas.filter((p) => p.status === 'Postado'),
    emBreve: pautas.filter((p) => p.status === 'Pronto'),
    ler: doTrilho('ler'),
    ver: doTrilho('ver'),
    ouvir: doTrilho('ouvir'),
    dicionario: glossario.slice(0, 14),
  };
}
