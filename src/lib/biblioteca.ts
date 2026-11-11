// Regras da biblioteca. A área pública só enxerga itens com checagem "ok".

import type { ItemBiblioteca, SecaoBiblioteca } from './types.ts';

export const ESTADOS = [
  { uf: 'AL', nome: 'Alagoas' },
  { uf: 'BA', nome: 'Bahia' },
  { uf: 'CE', nome: 'Ceará' },
  { uf: 'MA', nome: 'Maranhão' },
  { uf: 'PB', nome: 'Paraíba' },
  { uf: 'PE', nome: 'Pernambuco' },
  { uf: 'PI', nome: 'Piauí' },
  { uf: 'RN', nome: 'Rio Grande do Norte' },
  { uf: 'SE', nome: 'Sergipe' },
  { uf: 'NE', nome: 'Nordeste' },
  { uf: 'BR', nome: 'Brasil' },
] as const;

export function bibliotecaPublica(secoes: SecaoBiblioteca[]): SecaoBiblioteca[] {
  return secoes
    .map((s) => ({ ...s, itens: s.itens.filter((i) => i.checagem === 'ok') }))
    .filter((s) => s.itens.length > 0);
}

// "PE e BA" vale para PE e para BA.
export function ufsDoItem(item: Pick<ItemBiblioteca, 'uf'>): string[] {
  return item.uf
    .split(/[^A-Za-z]+/)
    .filter((p) => p.length === 2 && p === p.toUpperCase());
}

export function nomeDoLugar(uf: string): string {
  let saida = uf;
  for (const e of ESTADOS) saida = saida.replace(new RegExp(`\\b${e.uf}\\b`, 'g'), e.nome);
  return saida;
}

// Em qual trilho da página inicial cada seção aparece.
export const TRILHO_DA_SECAO: Record<string, 'ler' | 'ver' | 'ouvir'> = {
  'Para entender o estereótipo': 'ler',
  'Literatura de agora': 'ler',
  'Clássicos para reler': 'ler',
  Tela: 'ver',
  Som: 'ouvir',
};
