// npm run sync: se SHEET_CSV_URL existir, baixa o CSV publicado da planilha Banco de pautas
// e regrava src/data/pautas.json. Sem a variável, o JSON fica como está.
// SHEET_CSV_URL também aceita o caminho de um arquivo local (útil para testar).
// PAUTAS_JSON troca o arquivo de destino (usado nos testes).
import { readFileSync, writeFileSync } from 'node:fs';
import { csvParaPautas } from '../src/lib/csv.ts';
import { validarPautas } from '../src/lib/validate.ts';

const origem = process.env.SHEET_CSV_URL;
const destino = process.env.PAUTAS_JSON || new URL('../src/data/pautas.json', import.meta.url);

if (!origem) {
  console.log('SHEET_CSV_URL não definida: mantendo src/data/pautas.json como está.');
  process.exit(0);
}

let csv: string;
if (/^https?:\/\//.test(origem)) {
  const resposta = await fetch(origem);
  if (!resposta.ok) {
    console.error(`Não deu para baixar a planilha (HTTP ${resposta.status}). Confira se ela está publicada como CSV.`);
    process.exit(1);
  }
  csv = await resposta.text();
} else {
  csv = readFileSync(origem, 'utf8');
}

const pautas = csvParaPautas(csv);
const erros = validarPautas(pautas, 'planilha');
if (erros.length > 0) {
  console.error(`\nA planilha tem ${erros.length} problema(s). pautas.json não foi alterado:\n`);
  for (const e of erros) console.error(`  - ${e}`);
  process.exit(1);
}

writeFileSync(destino, JSON.stringify(pautas, null, 1) + '\n');
console.log(`Planilha sincronizada: ${pautas.length} pautas gravadas em pautas.json.`);
