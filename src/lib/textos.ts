// Textos do blog hospedados no site: um arquivo Markdown por texto, em src/textos/.
// O nome do arquivo vira o endereço: src/textos/meu-texto.md abre em /em-cartaz/textos/meu-texto/.
// Arquivo que começa com "_" é rascunho e não vai ao ar.

import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import { validarTexto, type TextoDoSite } from './cartaz.ts';

interface ArquivoMd {
  frontmatter: Record<string, unknown>;
  Content: AstroComponentFactory;
}

const arquivos = import.meta.glob<ArquivoMd>('../textos/*.md', { eager: true });

export interface TextoCompleto extends TextoDoSite {
  Content: AstroComponentFactory;
}

export function lerTextos(): TextoCompleto[] {
  const erros: string[] = [];
  const textos: TextoCompleto[] = [];
  for (const [caminho, arquivo] of Object.entries(arquivos)) {
    const nome = caminho.split('/').pop() ?? caminho;
    if (nome.startsWith('_')) continue;
    const d = arquivo.frontmatter ?? {};
    erros.push(...validarTexto(`src/textos/${nome}`, d));
    textos.push({
      slug: nome.replace(/\.md$/, ''),
      titulo: String(d.titulo ?? ''),
      resumo: String(d.resumo ?? ''),
      autoria: String(d.autoria ?? ''),
      data: String(d.data ?? ''),
      serie: String(d.serie ?? ''),
      pilar: String(d.pilar ?? ''),
      Content: arquivo.Content,
    });
  }
  if (erros.length > 0) throw new Error(`Textos do blog com problema:\n  - ${erros.join('\n  - ')}`);
  return textos;
}
