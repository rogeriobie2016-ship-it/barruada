import { describe, expect, it } from 'vitest';
import jogosJson from '../../src/data/jogos.json';
import { medirCliche, montarSinopse, sortear } from '../../src/lib/gerador.ts';
import { acertou, embaralhar, placar, veredito, type Escolha } from '../../src/lib/quiz.ts';
import type { Jogos } from '../../src/lib/types.ts';

const jogos = jogosJson as Jogos;

describe('Novela ou Nordeste?', () => {
  it('reconhece acerto e erro', () => {
    const item = jogos.quiz[0];
    expect(acertou(item, item.resposta)).toBe(true);
    expect(acertou(item, item.resposta === 'nordeste' ? 'novela' : 'nordeste')).toBe(false);
  });

  it('soma o placar', () => {
    const tudoCerto = jogos.quiz.map((q) => q.resposta);
    expect(placar(jogos.quiz, tudoCerto)).toEqual({ acertos: jogos.quiz.length, total: jogos.quiz.length });
    const tudoNovela: Escolha[] = jogos.quiz.map(() => 'novela');
    const esperado = jogos.quiz.filter((q) => q.resposta === 'novela').length;
    expect(placar(jogos.quiz, tudoNovela).acertos).toBe(esperado);
  });

  it('embaralha sem perder nem repetir afirmação', () => {
    const misturado = embaralhar(jogos.quiz, () => 0.3);
    expect(misturado).toHaveLength(jogos.quiz.length);
    expect(new Set(misturado).size).toBe(jogos.quiz.length);
    expect(jogos.quiz[0]).toBe(jogosJson.quiz[0]);
  });

  it('muda o veredito conforme o placar', () => {
    expect(veredito(12, 12)).toMatch(/Gabaritou/);
    expect(veredito(2, 12)).toMatch(/novela/);
    expect(veredito(0, 0)).toBeTypeOf('string');
  });
});

describe('Monte sua novela', () => {
  const escolhas = { lugar: 'Recife, no Porto Digital', protagonista: 'uma programadora', conflito: 'a herança de uma gráfica' };

  it('monta título e três frases com as escolhas', () => {
    const s = montarSinopse(escolhas);
    expect(s.titulo).toBe('A herança de uma gráfica');
    expect(s.frases).toHaveLength(3);
    expect(s.frases[0]).toContain(escolhas.lugar);
    expect(s.frases[0]).toContain(escolhas.protagonista);
    expect(s.frases[1]).toContain(escolhas.conflito);
  });

  it('sorteia só opções que existem nos dados', () => {
    const e = sortear(jogos.gerador, () => 0.99);
    expect(jogos.gerador.lugar).toContain(e.lugar);
    expect(jogos.gerador.protagonista).toContain(e.protagonista);
    expect(jogos.gerador.conflito).toContain(e.conflito);
  });

  it('o medidor fica em zero sem clichê', () => {
    const m = medirCliche('Uma engenheira descobre um segredo na usina.', jogos.gerador.cliche);
    expect(m.achados).toEqual([]);
    expect(m.nivel).toBe(0);
    expect(m.comentario).toBe('');
  });

  it('o medidor sobe com termos da lista, com ou sem acento', () => {
    const um = medirCliche('Aí aparece um CORONEL.', jogos.gerador.cliche);
    expect(um.achados).toEqual(['coronel']);
    expect(um.comentario).not.toBe('');

    const tres = medirCliche('O coronel manda o jagunco atras do retirante no pau de arara', jogos.gerador.cliche);
    expect(tres.achados.length).toBeGreaterThanOrEqual(3);
    expect(tres.nivel).toBe(1);
  });

  it('não confunde pedaço de palavra com clichê', () => {
    expect(medirCliche('A coronelada inteira secava roupa.', jogos.gerador.cliche).achados).toEqual([]);
  });

  it('a caneta nunca passa de 12 palavras', () => {
    for (const texto of ['coronel', 'coronel jagunço', 'coronel jagunço beata']) {
      const palavras = medirCliche(texto, jogos.gerador.cliche).comentario.split(/\s+/).length;
      expect(palavras).toBeLessThanOrEqual(12);
    }
  });
});
