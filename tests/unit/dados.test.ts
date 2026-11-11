import { describe, expect, it } from 'vitest';
import bibliotecaJson from '../../src/data/biblioteca.json';
import glossarioJson from '../../src/data/glossario.json';
import jogosJson from '../../src/data/jogos.json';
import membrosJson from '../../src/data/membros.json';
import pautasJson from '../../src/data/pautas.json';
import seriesJson from '../../src/data/series.json';
import siteJson from '../../src/data/site.json';
import { bibliotecaPublica, ufsDoItem } from '../../src/lib/biblioteca.ts';
import { montarTrilhos } from '../../src/lib/trilhos.ts';
import type { Pauta, SecaoBiblioteca, Termo } from '../../src/lib/types.ts';
import { validarPautas, validarTudo } from '../../src/lib/validate.ts';

describe('validação dos dados', () => {
  it('os arquivos de src/data passam', () => {
    const erros = validarTudo({
      site: siteJson,
      series: seriesJson,
      pautas: pautasJson,
      biblioteca: bibliotecaJson,
      glossario: glossarioJson,
      jogos: jogosJson,
      membros: membrosJson,
    });
    expect(erros).toEqual([]);
  });

  it('avisa com clareza quando falta campo obrigatório', () => {
    const quebrada = [{ ...pautasJson[0], titulo: '' }];
    const erros = validarPautas(quebrada);
    expect(erros).toHaveLength(1);
    expect(erros[0]).toContain('pautas.json');
    expect(erros[0]).toContain('S01E1');
    expect(erros[0]).toContain('"titulo"');
  });

  it('avisa quando o status não existe', () => {
    const erros = validarPautas([{ ...pautasJson[0], status: 'Publicado' }]);
    expect(erros[0]).toContain('"status"');
    expect(erros[0]).toContain('Postado');
  });
});

describe('biblioteca pública', () => {
  const publica = bibliotecaPublica(bibliotecaJson as SecaoBiblioteca[]);

  it('só tem item checado', () => {
    const itens = publica.flatMap((s) => s.itens);
    expect(itens.length).toBeGreaterThan(0);
    expect(itens.every((i) => i.checagem === 'ok')).toBe(true);
  });

  it('some com seção que ficou vazia', () => {
    expect(publica.every((s) => s.itens.length > 0)).toBe(true);
  });

  it('entende estado duplo', () => {
    expect(ufsDoItem({ uf: 'PE e BA' })).toEqual(['PE', 'BA']);
    expect(ufsDoItem({ uf: 'Fora do Brasil' })).toEqual([]);
  });
});

describe('trilhos da página inicial', () => {
  it('separa por status e não mostra item a conferir', () => {
    const pautas = (pautasJson as Pauta[]).map((p, i) => ({ ...p, status: i === 0 ? 'Postado' : i === 1 ? 'Pronto' : p.status }) as Pauta);
    const t = montarTrilhos(pautas, bibliotecaJson as SecaoBiblioteca[], glossarioJson as Termo[]);
    expect(t.emCartaz).toHaveLength(1);
    expect(t.emBreve).toHaveLength(1);
    for (const item of [...t.ler, ...t.ver, ...t.ouvir]) expect(item.checagem).toBe('ok');
  });
});
