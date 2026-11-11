// npm run sync: traz para o site o que mora em planilha.
//
// SHEET_CSV_URL  CSV publicado da planilha Banco de pautas. Regrava src/data/pautas.json.
// MURAL_CSV_URL  CSV publicado da planilha de moderação do mural. Regrava src/data/mural.json
//                só com as linhas aprovadas.
//
// Sem a variável, o JSON correspondente fica como está.
// As duas variáveis também aceitam o caminho de um arquivo local (útil para testar).
// PAUTAS_JSON e MURAL_JSON trocam o arquivo de destino (usado nos testes).
import { readFileSync, writeFileSync } from 'node:fs';
import { csvParaPautas } from '../src/lib/csv.ts';
import { csvParaMural, validarMural } from '../src/lib/mural.ts';
import { validarPautas } from '../src/lib/validate.ts';

async function ler(origem: string, nome: string): Promise<string> {
  if (/^https?:\/\//.test(origem)) {
    const resposta = await fetch(origem);
    if (!resposta.ok) {
      console.error(`Não deu para baixar ${nome} (HTTP ${resposta.status}). Confira se a planilha está publicada como CSV.`);
      process.exit(1);
    }
    return resposta.text();
  }
  return readFileSync(origem, 'utf8');
}

function parar(nome: string, arquivo: string, erros: string[]) {
  console.error(`\n${nome} tem ${erros.length} problema(s). ${arquivo} não foi alterado:\n`);
  for (const e of erros) console.error(`  - ${e}`);
  process.exit(1);
}

const pautasCsv = process.env.SHEET_CSV_URL;
if (!pautasCsv) {
  console.log('SHEET_CSV_URL não definida: mantendo src/data/pautas.json como está.');
} else {
  const pautas = csvParaPautas(await ler(pautasCsv, 'a planilha de pautas'));
  const erros = validarPautas(pautas, 'planilha');
  if (erros.length > 0) parar('A planilha de pautas', 'pautas.json', erros);
  writeFileSync(process.env.PAUTAS_JSON || new URL('../src/data/pautas.json', import.meta.url), JSON.stringify(pautas, null, 1) + '\n');
  console.log(`Planilha sincronizada: ${pautas.length} pautas gravadas em pautas.json.`);
}

const muralCsv = process.env.MURAL_CSV_URL;
if (!muralCsv) {
  console.log('MURAL_CSV_URL não definida: mantendo src/data/mural.json como está.');
} else {
  const recados = csvParaMural(await ler(muralCsv, 'a planilha do mural'));
  const erros = validarMural(recados);
  if (erros.length > 0) parar('A planilha do mural', 'mural.json', erros);
  writeFileSync(process.env.MURAL_JSON || new URL('../src/data/mural.json', import.meta.url), JSON.stringify(recados, null, 1) + '\n');
  console.log(`Mural sincronizado: ${recados.length} recado(s) aprovado(s) gravado(s) em mural.json.`);
}
