// Validação dos JSON de src/data. Roda no build (scripts/validate.ts) e nos testes.
// Devolve a lista de erros em português, com arquivo, posição e campo.

import { PILARES, STATUS } from './types.ts';

type Obj = Record<string, unknown>;

function ehObjeto(v: unknown): v is Obj {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

class Coletor {
  erros: string[] = [];
  arquivo: string;

  constructor(arquivo: string) {
    this.arquivo = arquivo;
  }

  erro(onde: string, msg: string) {
    this.erros.push(`${this.arquivo}: ${onde}: ${msg}`);
  }

  // Campo de texto. obrigatorio = precisa existir e não pode ser vazio.
  texto(o: Obj, campo: string, onde: string, obrigatorio = true) {
    const v = o[campo];
    if (v === undefined || v === null) {
      this.erro(onde, `falta o campo "${campo}"`);
      return;
    }
    if (typeof v !== 'string') {
      this.erro(onde, `o campo "${campo}" precisa ser texto`);
      return;
    }
    if (obrigatorio && v.trim() === '') this.erro(onde, `o campo obrigatório "${campo}" está vazio`);
  }

  umDe(o: Obj, campo: string, opcoes: readonly string[], onde: string) {
    const v = o[campo];
    if (typeof v !== 'string' || !opcoes.includes(v)) {
      this.erro(onde, `o campo "${campo}" vale "${String(v)}", mas precisa ser um destes: ${opcoes.join(', ')}`);
    }
  }

  listaDeTexto(o: Obj, campo: string, onde: string, minimo = 0) {
    const v = o[campo];
    if (!Array.isArray(v) || v.some((x) => typeof x !== 'string')) {
      this.erro(onde, `o campo "${campo}" precisa ser uma lista de textos`);
      return;
    }
    if (v.length < minimo) this.erro(onde, `o campo "${campo}" precisa de pelo menos ${minimo} itens`);
  }

  lista(v: unknown, onde: string): Obj[] {
    if (!Array.isArray(v)) {
      this.erro(onde, 'precisa ser uma lista');
      return [];
    }
    const itens: Obj[] = [];
    v.forEach((x, i) => {
      if (ehObjeto(x)) itens.push(x);
      else this.erro(`${onde}[${i}]`, 'precisa ser um objeto');
    });
    return itens;
  }
}

export function validarPautas(dado: unknown, arquivo = 'pautas.json'): string[] {
  const c = new Coletor(arquivo);
  const vistos = new Set<string>();
  c.lista(dado, 'raiz').forEach((p, i) => {
    const onde = `pauta ${i + 1} (${typeof p.id === 'string' && p.id ? p.id : 'sem id'})`;
    for (const campo of ['id', 'titulo', 'serie_id', 'serie', 'formato']) c.texto(p, campo, onde);
    for (const campo of ['gancho', 'esforco', 'responsavel', 'quem_faz_sugestao', 'roteiro_id', 'roteiro_url', 'post_url', 'data_alvo']) {
      c.texto(p, campo, onde, false);
    }
    c.umDe(p, 'pilar', PILARES, onde);
    c.umDe(p, 'status', STATUS, onde);
    if (typeof p.id === 'string') {
      if (vistos.has(p.id)) c.erro(onde, `id repetido: "${p.id}"`);
      vistos.add(p.id);
    }
  });
  return c.erros;
}

export function validarSeries(dado: unknown): string[] {
  const c = new Coletor('series.json');
  c.lista(dado, 'raiz').forEach((s, i) => {
    const onde = `série ${i + 1}`;
    for (const campo of ['id', 'nome', 'premissa']) c.texto(s, campo, onde);
    for (const campo of ['esforco', 'quem_faz']) c.texto(s, campo, onde, false);
    c.umDe(s, 'pilar', PILARES, onde);
    c.listaDeTexto(s, 'episodios', onde);
  });
  return c.erros;
}

export function validarBiblioteca(dado: unknown): string[] {
  const c = new Coletor('biblioteca.json');
  c.lista(dado, 'raiz').forEach((s, i) => {
    const ondeSecao = `seção ${i + 1}`;
    c.texto(s, 'secao', ondeSecao);
    c.texto(s, 'intro', ondeSecao, false);
    c.lista(s.itens, `${ondeSecao}.itens`).forEach((it, j) => {
      const onde = `${ondeSecao}, item ${j + 1}`;
      c.texto(it, 'titulo', onde);
      for (const campo of ['autoria', 'uf', 'ano', 'por_que', 'uso']) c.texto(it, campo, onde, false);
      c.umDe(it, 'checagem', ['ok', 'conferir'], onde);
      c.listaDeTexto(it, 'fontes', onde);
    });
  });
  return c.erros;
}

export function validarGlossario(dado: unknown): string[] {
  const c = new Coletor('glossario.json');
  c.lista(dado, 'raiz').forEach((t, i) => {
    const onde = `termo ${i + 1}`;
    c.texto(t, 'termo', onde);
    c.texto(t, 'significado', onde);
    c.texto(t, 'exemplo', onde, false);
    c.texto(t, 'onde', onde, false);
  });
  return c.erros;
}

export function validarJogos(dado: unknown): string[] {
  const c = new Coletor('jogos.json');
  if (!ehObjeto(dado)) return ['jogos.json: raiz: precisa ser um objeto'];
  c.lista(dado.quiz, 'quiz').forEach((q, i) => {
    const onde = `quiz, afirmação ${i + 1}`;
    c.texto(q, 'afirmacao', onde);
    c.texto(q, 'explicacao', onde);
    c.texto(q, 'fonte', onde, false);
    c.umDe(q, 'resposta', ['nordeste', 'novela'], onde);
  });
  c.listaDeTexto(dado, 'bingo', 'bingo', 24);
  if (ehObjeto(dado.gerador)) {
    for (const campo of ['lugar', 'protagonista', 'conflito', 'cliche']) c.listaDeTexto(dado.gerador, campo, 'gerador', 1);
  } else c.erro('gerador', 'precisa ser um objeto');
  c.lista(dado.jornada, 'jornada').forEach((e, i) => {
    const onde = `jornada, etapa ${i + 1}`;
    for (const campo of ['etapa', 'cliche', 'troca']) c.texto(e, campo, onde);
  });
  return c.erros;
}

export function validarMembros(dado: unknown): string[] {
  const c = new Coletor('membros.json');
  c.lista(dado, 'raiz').forEach((m, i) => {
    const onde = `membro ${i + 1}`;
    c.texto(m, 'nome', onde);
    c.texto(m, 'estado', onde);
    c.texto(m, 'area', onde, false);
    c.texto(m, 'link', onde, false);
    c.listaDeTexto(m, 'topa', onde);
  });
  return c.erros;
}

export function validarSite(dado: unknown): string[] {
  const c = new Coletor('site.json');
  if (!ehObjeto(dado)) return ['site.json: raiz: precisa ser um objeto'];
  for (const campo of ['nome', 'assinatura', 'significado', 'mapa_credito']) c.texto(dado, campo, 'raiz');
  c.listaDeTexto(dado, 'manifesto', 'raiz', 1);
  for (const campo of ['drive', 'redes', 'novela']) {
    if (!ehObjeto(dado[campo])) c.erro('raiz', `falta o objeto "${campo}"`);
  }
  return c.erros;
}

export function validarTudo(d: Record<string, unknown>): string[] {
  return [
    ...validarSite(d.site),
    ...validarSeries(d.series),
    ...validarPautas(d.pautas),
    ...validarBiblioteca(d.biblioteca),
    ...validarGlossario(d.glossario),
    ...validarJogos(d.jogos),
    ...validarMembros(d.membros),
  ];
}
