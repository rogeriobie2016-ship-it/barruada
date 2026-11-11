import { describe, expect, it } from 'vitest';
import bibliotecaJson from '../../src/data/biblioteca.json';
import forro from '../../src/data/forro-ingles.json';
import glossarioJson from '../../src/data/glossario.json';
import jogosJson from '../../src/data/jogos.json';
import kit from '../../src/data/kit.json';
import { alternar, cartelaVazia, CASA_LIVRE, CENTRO, LINHAS, linhasFechadas, sortearCartela } from '../../src/lib/bingo.ts';
import { ajustarTamanho, quebrarLinhas } from '../../src/lib/cartao.ts';
import { montarRodada, vereditoDicionario } from '../../src/lib/dicionario.ts';
import { resumoPorEstado } from '../../src/lib/estados.ts';
import { ehPar, montarPares, vereditoPares } from '../../src/lib/pares.ts';
import type { Membro, SecaoBiblioteca, Termo } from '../../src/lib/types.ts';

describe('Bingo do estereótipo', () => {
  const cartela = sortearCartela(jogosJson.bingo);

  it('sorteia 25 casas sem repetir, com o centro livre', () => {
    expect(cartela).toHaveLength(25);
    expect(cartela[CENTRO]).toBe(CASA_LIVRE);
    expect(new Set(cartela).size).toBe(25);
    for (const casa of cartela.filter((_, i) => i !== CENTRO)) expect(jogosJson.bingo).toContain(casa);
  });

  it('começa só com o centro marcado e não deixa desmarcar o centro', () => {
    const inicio = cartelaVazia();
    expect(inicio.filter(Boolean)).toHaveLength(1);
    expect(alternar(inicio, CENTRO)[CENTRO]).toBe(true);
  });

  it('tem 12 linhas possíveis', () => {
    expect(LINHAS).toHaveLength(12);
  });

  it('reconhece linha, coluna e diagonal fechadas', () => {
    let m = cartelaVazia();
    for (const i of [0, 1, 2, 3]) m = alternar(m, i);
    expect(linhasFechadas(m)).toHaveLength(0);
    m = alternar(m, 4);
    expect(linhasFechadas(m)).toEqual([[0, 1, 2, 3, 4]]);

    // A coluna e a diagonal do meio aproveitam a casa livre.
    let coluna = cartelaVazia();
    for (const i of [2, 7, 17, 22]) coluna = alternar(coluna, i);
    expect(linhasFechadas(coluna)).toEqual([[2, 7, 12, 17, 22]]);
    let diagonal = cartelaVazia();
    for (const i of [0, 6, 18, 24]) diagonal = alternar(diagonal, i);
    expect(linhasFechadas(diagonal)).toEqual([[0, 6, 12, 18, 24]]);
  });

  it('desmarcar desfaz a linha', () => {
    let m = cartelaVazia();
    for (const i of [0, 1, 2, 3, 4]) m = alternar(m, i);
    expect(linhasFechadas(alternar(m, 3))).toHaveLength(0);
  });
});

describe('Dicionário em modo jogo', () => {
  const termos = glossarioJson as Termo[];
  const rodada = montarRodada(termos, 8);

  it('monta oito perguntas com quatro opções diferentes e uma só certa', () => {
    expect(rodada).toHaveLength(8);
    for (const p of rodada) {
      expect(p.opcoes).toHaveLength(4);
      expect(new Set(p.opcoes).size).toBe(4);
      const certo = termos.find((t) => t.termo === p.termo)!.significado;
      expect(p.opcoes[p.certa]).toBe(certo);
      expect(p.opcoes.filter((o) => o === certo)).toHaveLength(1);
    }
  });

  it('não repete palavra na rodada', () => {
    expect(new Set(rodada.map((p) => p.termo)).size).toBe(8);
  });

  it('dá veredito para qualquer placar', () => {
    expect(vereditoDicionario(8, 8)).not.toBe(vereditoDicionario(1, 8));
  });
});

describe('Aprendendo inglês com forró', () => {
  it('monta seis pares e embaralha os dois lados', () => {
    const r = montarPares(forro.vocabulario, 6);
    expect(r.pares).toHaveLength(6);
    expect([...r.esquerda].sort()).toEqual(r.pares.map((p) => p.pt).sort());
    expect([...r.direita].sort()).toEqual(r.pares.map((p) => p.en).sort());
  });

  it('confere o par certo e recusa o errado', () => {
    expect(ehPar(forro.vocabulario, 'sanfona', 'accordion')).toBe(true);
    expect(ehPar(forro.vocabulario, 'sanfona', 'triangle')).toBe(false);
  });

  it('não tem tradução repetida dentro de um baralho', () => {
    for (const baralho of [forro.vocabulario, forro.titulos, forro.dicionario]) {
      expect(new Set(baralho.map((p) => p.en)).size).toBe(baralho.length);
      expect(new Set(baralho.map((p) => p.pt)).size).toBe(baralho.length);
      expect(baralho.length).toBeGreaterThanOrEqual(6);
    }
  });

  it('só tem palavra solta e título, nunca verso', () => {
    for (const p of [...forro.vocabulario, ...forro.titulos, ...forro.dicionario]) {
      expect(p.pt.split(/\s+/).length).toBeLessThanOrEqual(6);
      expect(p.en.split(/\s+/).length).toBeLessThanOrEqual(7);
    }
  });

  it('muda o veredito com os erros', () => {
    expect(vereditoPares(0)).not.toBe(vereditoPares(5));
  });
});

describe('cartão de compartilhamento', () => {
  const medir = (s: string) => s.length * 10; // cada letra vale 10

  it('quebra o texto na largura sem cortar palavra', () => {
    expect(quebrarLinhas('uma duas tres quatro', 90, medir)).toEqual(['uma duas', 'tres', 'quatro']);
  });

  it('respeita quebra de parágrafo', () => {
    expect(quebrarLinhas('a b\nc', 1000, medir)).toEqual(['a b', 'c']);
  });

  it('diminui a letra até o texto caber na caixa', () => {
    const medirCom = (tamanho: number) => (s: string) => s.length * tamanho * 0.5;
    const grande = ajustarTamanho('oi', 500, 200, 100, 20, 1, medirCom);
    expect(grande.tamanho).toBe(100);
    const apertado = ajustarTamanho('uma frase bem mais comprida que não cabe grande', 300, 120, 100, 20, 1, medirCom);
    expect(apertado.tamanho).toBeLessThan(100);
    expect(apertado.linhas.length * apertado.tamanho).toBeLessThanOrEqual(120);
  });
});

describe('os nove', () => {
  const membros: Membro[] = [{ nome: 'Pessoa de teste', estado: 'ce', area: 'Vídeo', topa: ['vídeo'], link: '' }];
  const resumo = resumoPorEstado(bibliotecaJson as SecaoBiblioteca[], membros);

  it('traz os nove estados', () => {
    expect(resumo.map((e) => e.uf).sort()).toEqual(['AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE']);
  });

  it('põe cada pessoa no seu estado', () => {
    expect(resumo.find((e) => e.uf === 'CE')!.membros).toHaveLength(1);
    expect(resumo.find((e) => e.uf === 'BA')!.membros).toHaveLength(0);
  });

  it('só mostra item checado', () => {
    for (const e of resumo) for (const i of [...e.dados, ...e.referencias]) expect(i.checagem).toBe('ok');
  });
});

describe('kit educacional', () => {
  it('toda atividade tem título e objetivo', () => {
    expect(kit.length).toBeGreaterThan(0);
    for (const a of kit) {
      expect(a.titulo).not.toBe('');
      expect(a.objetivo).not.toBe('');
    }
  });
});
