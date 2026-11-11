// npm run validate: confere os JSON de src/data antes do build.
import { readFileSync } from 'node:fs';
import { validarTudo } from '../src/lib/validate.ts';

const nomes = ['site', 'series', 'pautas', 'biblioteca', 'glossario', 'jogos', 'membros'];
const dados: Record<string, unknown> = {};
const erros: string[] = [];

for (const nome of nomes) {
  const caminho = new URL(`../src/data/${nome}.json`, import.meta.url);
  try {
    dados[nome] = JSON.parse(readFileSync(caminho, 'utf8'));
  } catch (e) {
    erros.push(`${nome}.json: não deu para ler o arquivo (${(e as Error).message})`);
  }
}

erros.push(...validarTudo(dados));

if (erros.length > 0) {
  console.error(`\nDados inválidos em src/data. ${erros.length} problema(s):\n`);
  for (const e of erros) console.error(`  - ${e}`);
  console.error('\nCorrija os arquivos e rode o build de novo.\n');
  process.exit(1);
}
console.log('Dados de src/data conferidos: tudo certo.');
