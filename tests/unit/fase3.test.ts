import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import muralJson from '../../src/data/mural.json';
import { csvParaMural, muralPublico, validarMural, type Recado } from '../../src/lib/mural.ts';
import { nomeOg, PAGINAS_OG } from '../../src/lib/og.ts';

const raiz = join(import.meta.dirname, '../..');
const exemplo = join(raiz, 'tests/fixtures/mural-exemplo.csv');

function paginas(pasta: string): string[] {
  return readdirSync(pasta).flatMap((nome) => {
    const caminho = join(pasta, nome);
    if (statSync(caminho).isDirectory()) return nome === 'hub' ? [] : paginas(caminho);
    return nome.endsWith('.html') ? [caminho] : [];
  });
}

describe('mural: moderação', () => {
  const recados = csvParaMural(readFileSync(exemplo, 'utf8'));

  it('só passa o que foi aprovado na planilha', () => {
    expect(recados.map((r) => r.nome)).toEqual(['Pessoa aprovada', 'Outra aprovada']);
    expect(recados.every((r) => r.aprovado)).toBe(true);
  });

  it('normaliza a sigla do estado e descarta link que não é https', () => {
    expect(recados[0].estado).toBe('CE');
    expect(recados[0].link).toBe('https://example.com/video');
    expect(recados[1].link).toBe('');
  });

  it('o arquivo gerado é válido', () => {
    expect(validarMural(recados)).toEqual([]);
  });

  it('a página nunca mostra recado sem aprovação, mesmo que ele esteja no JSON', () => {
    const misto: Recado[] = [
      { nome: 'A', estado: 'CE', texto: 'ok', link: '', aprovado: true },
      { nome: 'B', estado: 'PE', texto: 'espera', link: '', aprovado: false },
      { nome: 'C', estado: 'BA', texto: 'sem campo', link: '' } as unknown as Recado,
    ];
    expect(muralPublico(misto).map((r) => r.nome)).toEqual(['A']);
  });

  it('avisa com clareza quando o JSON está errado', () => {
    const erros = validarMural([{ nome: 'A', estado: 'SP', texto: '', link: '', aprovado: 'sim' }]);
    expect(erros.join(' ')).toContain('"aprovado"');
    expect(erros.join(' ')).toContain('"texto"');
    expect(erros.join(' ')).toContain('"estado"');
  });

  it('reclama de planilha sem a coluna aprovado', () => {
    expect(() => csvParaMural('nome,texto\nA,oi')).toThrow(/aprovado/);
  });

  it('o mural do repositório é válido', () => {
    expect(validarMural(muralJson)).toEqual([]);
  });

  it('npm run sync com MURAL_CSV_URL grava só os aprovados', () => {
    const destino = join(mkdtempSync(join(tmpdir(), 'barruada-mural-')), 'mural.json');
    execFileSync(process.execPath, ['scripts/sync.ts'], {
      cwd: raiz,
      env: { ...process.env, SHEET_CSV_URL: '', MURAL_CSV_URL: exemplo, MURAL_JSON: destino },
    });
    const gravado = readFileSync(destino, 'utf8');
    expect(JSON.parse(gravado)).toHaveLength(2);
    expect(gravado).not.toContain('Pessoa em espera');
    expect(gravado).not.toContain('Pessoa recusada');
  });
});

describe('imagens de compartilhamento', () => {
  it('dá nome de arquivo a partir da rota', () => {
    expect(nomeOg('/')).toBe('inicio');
    expect(nomeOg('/jogos/dicionario/')).toBe('jogos-dicionario');
    expect(nomeOg('/estado/ce/')).toBe('estado-ce');
  });

  it('existe uma imagem 1200x630 para cada página da lista', () => {
    for (const p of PAGINAS_OG) {
      const arquivo = join(raiz, 'public/og', `${nomeOg(p.caminho)}.png`);
      expect(existsSync(arquivo), `Falta ${arquivo}. Rode "npm run og".`).toBe(true);
      const png = readFileSync(arquivo);
      expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1200, 630]);
    }
  });

  it('toda página gerada aponta para uma imagem que existe', () => {
    const geradas = paginas(join(raiz, 'dist'));
    expect(geradas.length).toBeGreaterThan(20);
    let comImagemPropria = 0;
    for (const pagina of geradas) {
      const html = readFileSync(pagina, 'utf8');
      if (html.includes('http-equiv="refresh"')) continue; // endereços antigos
      const achou = html.match(/property="og:image" content="[^"]*\/og\/([^"]+\.png)"/);
      expect(achou, `Sem og:image em ${pagina}`).not.toBeNull();
      expect(existsSync(join(raiz, 'dist/og', achou![1]))).toBe(true);
      if (achou![1] !== 'inicio.png') comImagemPropria++;
    }
    expect(comImagemPropria).toBeGreaterThanOrEqual(PAGINAS_OG.length - 1);
  });
});

describe('páginas por estado', () => {
  it('gera as nove', () => {
    for (const uf of ['al', 'ba', 'ce', 'ma', 'pb', 'pe', 'pi', 'rn', 'se']) {
      expect(existsSync(join(raiz, 'dist/estado', uf, 'index.html')), uf).toBe(true);
    }
  });
});

describe('em cartaz por tipo', async () => {
  const { grupoDoFormato, itensEmCartaz, validarTexto, GRUPOS } = await import('../../src/lib/cartaz.ts');
  const pautas = (await import('../../src/data/pautas.json')).default as import('../../src/lib/types.ts').Pauta[];

  it('separa vídeo, carrossel, podcast e texto pelo formato da pauta', () => {
    expect(grupoDoFormato('Vídeo')).toBe('video');
    expect(grupoDoFormato('Story')).toBe('video');
    expect(grupoDoFormato('Carrossel')).toBe('carrossel');
    expect(grupoDoFormato('Podcast')).toBe('podcast');
    expect(grupoDoFormato('Episódio de áudio')).toBe('podcast');
    expect(grupoDoFormato('Blog')).toBe('texto');
    expect(grupoDoFormato('Texto')).toBe('texto');
    expect(GRUPOS.map((g) => g.id)).toEqual(['video', 'carrossel', 'podcast', 'texto']);
  });

  it('só entra pauta postada, e texto do site entra no grupo de textos', () => {
    const postadas = pautas.map((p, i) => ({ ...p, status: i < 2 ? 'Postado' : p.status, formato: i === 1 ? 'Podcast' : p.formato })) as typeof pautas;
    const textos = [{ slug: 'um-texto', titulo: 'Um texto', resumo: '', autoria: '', data: '2026-11-11', serie: '', pilar: '' }];
    const itens = itensEmCartaz(postadas, textos);
    expect(itens).toHaveLength(3);
    expect(itens.map((i) => i.grupo).sort()).toEqual(['podcast', 'texto', 'video']);
    expect(itens.find((i) => i.grupo === 'texto')!.href).toBe('/em-cartaz/textos/um-texto/');
  });

  it('confere o cabeçalho dos textos', () => {
    expect(validarTexto('a.md', { titulo: 'Oi', data: '2026-11-11' })).toEqual([]);
    const erros = validarTexto('a.md', { titulo: '', data: '11/11/2026', pilar: 'Outro' });
    expect(erros).toHaveLength(3);
    expect(erros[0]).toContain('a.md');
  });
});

describe('palavras cruzadas', async () => {
  const { casasDa, conferir, limpar, montarGrade } = await import('../../src/lib/cruzadas.ts');
  const dados = (await import('../../src/data/cruzadas.json')).default;
  const semente = (s: number) => () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
  const entradas = dados.referencias.map((r) => ({ resposta: r.resposta, dica: r.dica }));
  const grade = montarGrade(entradas, 13, 12, semente(7));

  it('tira acento e espaço das respostas', () => {
    expect(limpar('Ficção')).toBe('FICCAO');
    expect(limpar('arre égua')).toBe('ARREEGUA');
  });

  it('monta uma grade que cabe no limite, com as palavras pedidas', () => {
    expect(grade.palavras.length).toBeGreaterThanOrEqual(10);
    expect(grade.linhas).toBeLessThanOrEqual(13);
    expect(grade.colunas).toBeLessThanOrEqual(13);
  });

  it('cada palavra bate letra por letra com o gabarito', () => {
    for (const p of grade.palavras) {
      const escrita = casasDa(p).map(([l, c]) => grade.letras[l][c]).join('');
      expect(escrita).toBe(p.resposta);
    }
  });

  it('toda palavra cruza com outra e nenhuma casa fica solta', () => {
    const uso = new Map<string, number>();
    for (const p of grade.palavras) for (const [l, c] of casasDa(p)) uso.set(`${l},${c}`, (uso.get(`${l},${c}`) ?? 0) + 1);
    for (const p of grade.palavras) expect(casasDa(p).some(([l, c]) => uso.get(`${l},${c}`)! > 1), p.resposta).toBe(true);
    const preenchidas = grade.letras.flat().filter((x) => x !== null).length;
    expect(preenchidas).toBe(uso.size);
  });

  it('não repete resposta e numera na ordem de leitura', () => {
    expect(new Set(grade.palavras.map((p) => p.resposta)).size).toBe(grade.palavras.length);
    const numeros = grade.palavras.map((p) => p.numero);
    expect([...numeros].sort((a, b) => a - b)).toEqual(numeros);
  });

  it('a mesma semente dá a mesma grade', () => {
    expect(montarGrade(entradas, 13, 12, semente(7))).toEqual(grade);
  });

  it('confere letras certas e grade completa', () => {
    const vazio = grade.letras.map((l) => l.map(() => ''));
    expect(conferir(grade, vazio).completa).toBe(false);
    const cheio = grade.letras.map((l) => l.map((x) => x ?? ''));
    const r = conferir(grade, cheio);
    expect(r.completa).toBe(true);
    expect(r.certas).toBe(r.total);
  });

  it('as respostas têm dica e origem nos dados do site', () => {
    for (const r of dados.referencias) {
      expect(r.dica.length).toBeGreaterThan(10);
      expect(r.origem).not.toBe('');
      expect(limpar(r.resposta).length).toBeGreaterThanOrEqual(3);
    }
  });
});

describe('jornada narrativa', async () => {
  const { montarPassos, veredito } = await import('../../src/lib/jornada.ts');
  const jogos = (await import('../../src/data/jogos.json')).default;

  it('cada cena tem um clichê e uma troca, vindos dos dados', () => {
    const passos = montarPassos(jogos.jornada);
    expect(passos).toHaveLength(12);
    passos.forEach((p, i) => {
      expect(p.opcoes.map((o) => o.tipo).sort()).toEqual(['cliche', 'troca']);
      expect(p.opcoes.find((o) => o.tipo === 'cliche')!.texto).toBe(jogos.jornada[i].cliche);
      expect(p.opcoes.find((o) => o.tipo === 'troca')!.texto).toBe(jogos.jornada[i].troca);
    });
  });

  it('o resultado depende de quantos clichês a pessoa escolheu', () => {
    const doze = (n: number) => Array.from({ length: 12 }, (_, i) => (i < n ? 'cliche' : 'troca')) as ('cliche' | 'troca')[];
    expect(veredito(doze(12)).lado).toBe('tv');
    expect(veredito(doze(8)).lado).toBe('tv');
    expect(veredito(doze(5)).lado).toBe('meio');
    expect(veredito(doze(3)).lado).toBe('verdade');
    expect(veredito(doze(0)).lado).toBe('verdade');
    expect(veredito(doze(0)).cliches).toBe(0);
  });
});
