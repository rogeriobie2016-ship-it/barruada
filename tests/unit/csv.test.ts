import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import bibliotecaJson from '../../src/data/biblioteca.json';
import glossarioJson from '../../src/data/glossario.json';
import pautasJson from '../../src/data/pautas.json';
import { csvParaPautas, lerCSV } from '../../src/lib/csv.ts';
import { montarTrilhos } from '../../src/lib/trilhos.ts';
import type { Pauta, SecaoBiblioteca, Termo } from '../../src/lib/types.ts';
import { validarPautas } from '../../src/lib/validate.ts';

const exemplo = join(import.meta.dirname, '../fixtures/pautas-exemplo.csv');

describe('leitor de CSV', () => {
  it('lê campos com vírgula, aspas e quebra de linha', () => {
    const linhas = lerCSV('a,b,c\r\n"Tem, mas também tem","disse ""oi""","linha 1\nlinha 2"\r\n');
    expect(linhas).toEqual([
      ['a', 'b', 'c'],
      ['Tem, mas também tem', 'disse "oi"', 'linha 1\nlinha 2'],
    ]);
  });

  it('ignora linhas em branco e o BOM do começo', () => {
    expect(lerCSV('﻿id,titulo\n\nX1,Um\n,\n')).toEqual([
      ['id', 'titulo'],
      ['X1', 'Um'],
    ]);
  });

  it('devolve objetos com as mesmas chaves de pautas.json', () => {
    const pautas = csvParaPautas(readFileSync(exemplo, 'utf8'));
    expect(Object.keys(pautas[0])).toEqual(Object.keys(pautasJson[0]));
    expect(validarPautas(pautas, 'planilha')).toEqual([]);
  });

  it('reclama de CSV sem coluna id', () => {
    expect(() => csvParaPautas('titulo,status\nUm,Ideia')).toThrow(/coluna "id"/);
  });
});

describe('npm run sync com um CSV de exemplo', () => {
  it('atualiza o status de uma pauta e ela muda de trilho', () => {
    const antes = montarTrilhos(pautasJson as Pauta[], bibliotecaJson as SecaoBiblioteca[], glossarioJson as Termo[]);
    expect(antes.emCartaz.map((p) => p.id)).not.toContain('S01E1');

    const destino = join(mkdtempSync(join(tmpdir(), 'barruada-')), 'pautas.json');
    execFileSync(process.execPath, ['scripts/sync.ts'], {
      cwd: join(import.meta.dirname, '../..'),
      env: { ...process.env, SHEET_CSV_URL: exemplo, PAUTAS_JSON: destino },
    });

    const sincronizadas = JSON.parse(readFileSync(destino, 'utf8')) as Pauta[];
    const depois = montarTrilhos(sincronizadas, bibliotecaJson as SecaoBiblioteca[], glossarioJson as Termo[]);
    expect(depois.emCartaz.map((p) => p.id)).toContain('S01E1');
    expect(depois.emBreve.map((p) => p.id)).toContain('S01E2');
  });
});
