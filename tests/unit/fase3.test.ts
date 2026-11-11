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
