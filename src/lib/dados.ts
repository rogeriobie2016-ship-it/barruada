// Ponto único de leitura dos dados nas páginas Astro.

import bibliotecaJson from '../data/biblioteca.json';
import glossarioJson from '../data/glossario.json';
import jogosJson from '../data/jogos.json';
import membrosJson from '../data/membros.json';
import pautasJson from '../data/pautas.json';
import seriesJson from '../data/series.json';
import siteJson from '../data/site.json';
import type { Jogos, Membro, Pauta, SecaoBiblioteca, Serie, Site, Termo } from './types.ts';

export const site = siteJson as unknown as Site;
export const series = seriesJson as Serie[];
export const pautas = pautasJson as Pauta[];
export const biblioteca = bibliotecaJson as SecaoBiblioteca[];
export const glossario = glossarioJson as Termo[];
export const jogos = jogosJson as Jogos;
export const membros = membrosJson as Membro[];

// Caminho interno respeitando BASE_PATH (publicação em subpasta).
export function rota(caminho: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}${caminho}`;
}
