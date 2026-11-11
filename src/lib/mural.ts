// Mural "Me mostra na novela": envio por formulário externo, com moderação manual.
// Nada aparece no site sem aprovação. A regra vale em dois lugares:
// 1. o sync só grava em mural.json as linhas com "aprovado" igual a "sim";
// 2. a página só mostra item com aprovado === true.

import { lerCSV } from './csv.ts';
import { semAcento } from './texto.ts';

export interface Recado {
  nome: string;
  estado: string; // sigla, como CE
  texto: string;
  link: string;
  aprovado: boolean;
}

export const CHAVES_MURAL = ['nome', 'estado', 'texto', 'link', 'aprovado'] as const;
export const LIMITE_TEXTO = 280;

const UFS = ['AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE'];

function disseSim(valor: string): boolean {
  return ['sim', 's', 'true', 'ok', 'x', 'aprovado'].includes(semAcento(valor.trim()));
}

// Lê a planilha de moderação e devolve só o que foi aprovado.
export function csvParaMural(texto: string): Recado[] {
  const linhas = lerCSV(texto);
  if (linhas.length === 0) throw new Error('CSV do mural vazio: a planilha não tem cabeçalho.');
  const cabecalho = linhas[0].map((c) => semAcento(c.trim()));
  for (const chave of ['texto', 'aprovado']) {
    if (!cabecalho.includes(chave)) throw new Error(`CSV do mural sem a coluna "${chave}".`);
  }
  const campo = (linha: string[], chave: string) => {
    const pos = cabecalho.indexOf(chave);
    return pos >= 0 ? (linha[pos] ?? '').trim() : '';
  };
  return linhas
    .slice(1)
    .filter((l) => disseSim(campo(l, 'aprovado')) && campo(l, 'texto') !== '')
    .map((l) => ({
      nome: campo(l, 'nome'),
      estado: campo(l, 'estado').toUpperCase(),
      texto: campo(l, 'texto').slice(0, LIMITE_TEXTO),
      link: /^https:\/\//.test(campo(l, 'link')) ? campo(l, 'link') : '',
      aprovado: true,
    }));
}

export function muralPublico(recados: Recado[]): Recado[] {
  return recados.filter((r) => r.aprovado === true && r.texto.trim() !== '');
}

export function validarMural(dado: unknown): string[] {
  if (!Array.isArray(dado)) return ['mural.json: raiz: precisa ser uma lista'];
  const erros: string[] = [];
  dado.forEach((r, i) => {
    const onde = `mural.json: recado ${i + 1}`;
    if (typeof r !== 'object' || r === null) {
      erros.push(`${onde}: precisa ser um objeto`);
      return;
    }
    const o = r as Record<string, unknown>;
    for (const chave of ['nome', 'estado', 'texto', 'link']) {
      if (typeof o[chave] !== 'string') erros.push(`${onde}: o campo "${chave}" precisa ser texto`);
    }
    if (typeof o.aprovado !== 'boolean') erros.push(`${onde}: o campo "aprovado" precisa ser true ou false`);
    if (typeof o.texto === 'string' && o.texto.trim() === '') erros.push(`${onde}: o campo obrigatório "texto" está vazio`);
    if (typeof o.estado === 'string' && o.estado !== '' && !UFS.includes(o.estado)) {
      erros.push(`${onde}: o campo "estado" vale "${o.estado}", mas precisa ser uma sigla do Nordeste ou ficar vazio`);
    }
  });
  return erros;
}
