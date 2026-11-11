// Regras que não podem ser quebradas: nada de travessão no site e
// nenhum item "conferir" visível fora de /bastidores.

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative, sep } from 'node:path';
import { describe, expect, it } from 'vitest';
import bibliotecaJson from '../../src/data/biblioteca.json';
import type { SecaoBiblioteca } from '../../src/lib/types.ts';

const raiz = join(import.meta.dirname, '../..');

function arquivos(pasta: string): string[] {
  if (!existsSync(pasta)) return [];
  return readdirSync(pasta).flatMap((nome) => {
    const caminho = join(pasta, nome);
    return statSync(caminho).isDirectory() ? arquivos(caminho) : [caminho];
  });
}

describe('travessão', () => {
  // Escrito com escape para este arquivo não quebrar a própria regra.
  const e = '&';
  const proibidos = new RegExp(`[\\u2014\\u2013\\u2015]|${e}mdash;|${e}ndash;|${e}#8212;|${e}#8211;`);
  const textos = ['.astro', '.tsx', '.ts', '.css', '.json', '.md', '.html', '.svg', '.mjs', '.csv'];

  it('não aparece em nenhum arquivo de texto do projeto', () => {
    const alvos = [
      ...arquivos(join(raiz, 'src')),
      ...arquivos(join(raiz, 'public')),
      ...arquivos(join(raiz, 'scripts')),
      ...arquivos(join(raiz, 'tests')),
      join(raiz, 'README.md'),
    ].filter((a) => textos.includes(extname(a)) && existsSync(a));
    expect(alvos.length).toBeGreaterThan(20);

    const culpados: string[] = [];
    for (const a of alvos) {
      readFileSync(a, 'utf8')
        .split('\n')
        .forEach((linha, i) => {
          if (proibidos.test(linha)) culpados.push(`${relative(raiz, a)}:${i + 1}`);
        });
    }
    expect(culpados, `Travessão encontrado em: ${culpados.join(', ')}`).toEqual([]);
  });

  it('não aparece no site gerado', () => {
    const paginas = arquivos(join(raiz, 'dist')).filter((a) => a.endsWith('.html'));
    expect(paginas.length, 'Rode "npm run build" antes dos testes.').toBeGreaterThan(0);
    const culpados = paginas.filter((a) => proibidos.test(readFileSync(a, 'utf8'))).map((a) => relative(raiz, a));
    expect(culpados).toEqual([]);
  });
});

describe('itens "conferir"', () => {
  const secoes = bibliotecaJson as SecaoBiblioteca[];
  const itens = secoes.flatMap((s) => s.itens);
  const textoOk = itens
    .filter((i) => i.checagem === 'ok')
    .map((i) => `${i.titulo} ${i.por_que} ${i.uso}`)
    .join(' ');
  // Marcas de um item a conferir: o "por que entra" e o "como virar conteúdo" são textos únicos dele.
  const marcas = itens
    .filter((i) => i.checagem === 'conferir')
    .flatMap((i) => [i.por_que, i.uso])
    .filter((t) => t.length > 25 && !textoOk.includes(t));

  it('existem nos dados (senão o teste não prova nada)', () => {
    expect(marcas.length).toBeGreaterThan(50);
  });

  it('só aparecem em /bastidores no site gerado', () => {
    const gerados = arquivos(join(raiz, 'dist')).filter((a) => ['.html', '.js', '.json', '.xml'].includes(extname(a)));
    expect(gerados.length, 'Rode "npm run build" antes dos testes.').toBeGreaterThan(0);

    const escapar = (t: string) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const vazamentos: string[] = [];
    let vistosNosBastidores = 0;

    for (const a of gerados) {
      const conteudo = readFileSync(a, 'utf8');
      const interno = relative(join(raiz, 'dist'), a).split(sep)[0] === 'bastidores';
      for (const marca of marcas) {
        const achou = conteudo.includes(marca) || conteudo.includes(escapar(marca)) || conteudo.includes(JSON.stringify(marca).slice(1, -1));
        if (!achou) continue;
        if (interno) vistosNosBastidores++;
        else vazamentos.push(`${relative(raiz, a)}: "${marca.slice(0, 50)}"`);
      }
    }
    expect(vazamentos, `Item a conferir fora dos bastidores: ${vazamentos.join(' | ')}`).toEqual([]);
    expect(vistosNosBastidores).toBeGreaterThan(0);
  });

  it('/bastidores tem noindex e fica fora do sitemap', () => {
    const pagina = readFileSync(join(raiz, 'dist/bastidores/index.html'), 'utf8');
    expect(pagina).toMatch(/<meta name="robots" content="noindex/);
    const mapas = arquivos(join(raiz, 'dist')).filter((a) => a.endsWith('.xml'));
    expect(mapas.length).toBeGreaterThan(0);
    for (const m of mapas) expect(readFileSync(m, 'utf8')).not.toContain('bastidores');
    const inicio = readFileSync(join(raiz, 'dist/index.html'), 'utf8');
    expect(inicio).not.toContain('/bastidores');
  });
});
