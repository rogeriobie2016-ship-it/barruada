# Barruada

O Nordeste que a novela não mostra. Hub público e sala de trabalho do coletivo.

Site estático em Astro, com ilhas React, TypeScript e Tailwind. Sem banco de dados: todo o conteúdo vem dos arquivos de `src/data/`.

## Como rodar

Precisa de Node 22.18 ou mais novo.

```bash
npm install
npm run dev
```

Outros comandos:

| Comando | O que faz |
| --- | --- |
| `npm run build` | Sincroniza a planilha (se houver), valida os dados e gera o site em `dist/` |
| `npm run preview` | Serve o site gerado |
| `npm test` | Gera o site e roda os testes de lógica e de regras (Vitest) |
| `npm run test:e2e` | Gera o site e joga cada jogo só com teclado (Playwright) |
| `npm run validate` | Só confere os JSON de `src/data/` |
| `npm run sync` | Só sincroniza a planilha |

Na primeira vez que rodar os testes de ponta a ponta: `npx playwright install chromium`.

## Estrutura

```
seed/data/            dados-semente originais (referência)
src/data/             dados que o site lê (cópia do seed, mais o mapa)
src/styles/tokens.css todas as cores e fontes
src/components/marca/ logo, capa tipográfica, formas, mapa
src/islands/          partes interativas (React)
src/lib/              tipos, validação, CSV, lógica dos jogos
src/pages/            páginas
scripts/              sync da planilha e validação
tests/                unitários, ponta a ponta e CSV de exemplo
```

## Como publicar

O site é estático. Qualquer serviço que rode `npm run build` e sirva a pasta `dist/` funciona.

**Vercel ou Netlify (recomendado para o endereço final):** importe o repositório do GitHub. Comando de build `npm run build`, pasta de saída `dist`. Defina `SITE_URL` com o endereço do site e, se quiser a planilha ao vivo, `SHEET_CSV_URL`.

**GitHub Pages (prévia atual):** o arquivo `.github/workflows/pages.yml` publica a cada push na `main`. Ele define `BASE_PATH` com o nome do repositório, porque o Pages serve o site em uma subpasta.

Variáveis de ambiente:

| Variável | Para quê |
| --- | --- |
| `SITE_URL` | Endereço público do site (usado no sitemap) |
| `BASE_PATH` | Subpasta de publicação. Deixe vazio na Vercel e na Netlify |
| `SHEET_CSV_URL` | CSV publicado da planilha Banco de pautas |

## Como atualizar a planilha

1. Na planilha Banco de pautas: Arquivo, Compartilhar, Publicar na Web. Escolha a aba de pautas e o formato CSV. Copie o link.
2. Cadastre o link como `SHEET_CSV_URL` no serviço de publicação (ou como variável do repositório no GitHub, em Settings, Secrets and variables, Actions, Variables).
3. A cada build, `npm run sync` baixa o CSV e regrava `src/data/pautas.json`. As colunas da planilha têm o mesmo nome das chaves do JSON.
4. Mudou um status na planilha? Dispare um novo build. Pauta com status `Postado` entra no trilho Em cartaz e ganha página. Pauta com status `Pronto` entra no trilho Em breve.

Sem a variável, o site usa o `pautas.json` como está. Se a planilha tiver erro (status que não existe, id repetido, título vazio), o build para e diz a linha e o campo.

Para testar com um arquivo local:

```bash
SHEET_CSV_URL=tests/fixtures/pautas-exemplo.csv npm run sync
```

(Esse comando regrava `src/data/pautas.json`. Use `git checkout src/data/pautas.json` para voltar.)

## Como trocar o design system

1. Abra `src/styles/tokens.css`. É o único arquivo com cor e fonte fixas. Troque os valores e o site inteiro muda.
2. Se a fonte mudar, troque também os dois `@import` de fonte no topo de `src/styles/global.css` (e instale o pacote `@fontsource` novo).
3. Se a forma da marca mudar (logo, formas, mapa), edite só `src/components/marca/`.
4. O ícone da aba (`public/favicon.svg`) é um arquivo solto: redesenhe junto.

Os valores atuais vêm do projeto "Sistema visual coletivo nordestino" no Claude Design: barro, anil, sol, nanquim, papel e areia, com Archivo 800 apertado. O logo é provisório (linha da proposta "Registro"), até o coletivo escolher o definitivo.

## Regras do projeto

- Texto em português do Brasil, sem travessão. `npm test` varre os arquivos e falha se achar um.
- Nada de dado inventado: tudo vem de `src/data/`. Campo vazio fica vazio.
- Item da biblioteca com `checagem: "conferir"` só aparece em `/bastidores`. Há teste para isso.
- Nenhuma imagem de terceiros: as capas são tipográficas, feitas em CSS e SVG.
- `/bastidores` fica fora do menu e do sitemap e tem `noindex`. Não é segurança de verdade: quem tiver o endereço abre. Os roteiros ficam no Drive, com permissão própria.

## Dados

| Arquivo | Conteúdo |
| --- | --- |
| `site.json` | Nome, manifesto, links do Drive, redes |
| `series.json` | As 14 séries |
| `pautas.json` | As pautas (regravado pela planilha) |
| `biblioteca.json` | Referências por seção, com checagem e fontes |
| `glossario.json` | Dicionário da Barruada |
| `jogos.json` | Conteúdo dos jogos |
| `membros.json` | Membros do coletivo. Formato: `{"nome": "", "estado": "CE", "area": "", "topa": ["vídeo", "texto"], "link": ""}` |
| `ne-map.json` | Geometria dos nove estados |

## Fases

- Fase 1 (entregue): estrutura, tokens, início com trilhos, biblioteca, dicionário, bastidores, Novela ou Nordeste?, Monte sua novela, sync da planilha, prévia.
- Fase 2: Bingo, Dicionário em modo jogo, A jornada desmontada, mapa dos nove, sala de aula, cartões de compartilhamento.
- Fase 3: mural Me mostra na novela, páginas por estado, imagens de compartilhamento por página.

## Créditos

Mapa: @svg-maps/brazil, CC BY 4.0. Fontes: Archivo e Covered By Your Grace (SIL Open Font License).
