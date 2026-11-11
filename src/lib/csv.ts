// Leitor do CSV publicado da planilha Banco de pautas.
// As colunas da planilha têm o mesmo nome das chaves de pautas.json.

import { CHAVES_PAUTA } from './types.ts';

// Lê CSV com aspas, vírgulas e quebras de linha dentro do campo.
export function lerCSV(texto: string): string[][] {
  const t = texto.replace(/^﻿/, '');
  const linhas: string[][] = [];
  let campo = '';
  let linha: string[] = [];
  let entreAspas = false;
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    if (entreAspas) {
      if (ch === '"') {
        if (t[i + 1] === '"') {
          campo += '"';
          i++;
        } else entreAspas = false;
      } else campo += ch;
      continue;
    }
    if (ch === '"') entreAspas = true;
    else if (ch === ',') {
      linha.push(campo);
      campo = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && t[i + 1] === '\n') i++;
      linha.push(campo);
      linhas.push(linha);
      linha = [];
      campo = '';
    } else campo += ch;
  }
  if (campo !== '' || linha.length > 0) {
    linha.push(campo);
    linhas.push(linha);
  }
  return linhas.filter((l) => l.some((c) => c.trim() !== ''));
}

// Converte o CSV em objetos com as chaves de pautas.json.
// Coluna que não existir na planilha vira texto vazio. Coluna extra é ignorada.
export function csvParaPautas(texto: string): Record<string, string>[] {
  const linhas = lerCSV(texto);
  if (linhas.length === 0) throw new Error('CSV vazio: a planilha não tem cabeçalho.');
  const cabecalho = linhas[0].map((c) => c.trim());
  if (!cabecalho.includes('id')) {
    throw new Error('CSV sem a coluna "id". Confira se a aba publicada é a de pautas.');
  }
  return linhas.slice(1).map((l) => {
    const pauta: Record<string, string> = {};
    for (const chave of CHAVES_PAUTA) {
      const pos = cabecalho.indexOf(chave);
      pauta[chave] = pos >= 0 ? (l[pos] ?? '').trim() : '';
    }
    return pauta;
  });
}
