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
| `npm run sync` | Só sincroniza as planilhas (pautas e mural) |
| `npm run og` | Gera as imagens de compartilhamento em `public/og/` |

Na primeira vez que rodar os testes de ponta a ponta: `npx playwright install chromium`.

## Estrutura

```
seed/data/            dados-semente originais (referência)
src/data/             dados que o site lê (cópia do seed, mais o mapa)
src/styles/tokens.css todas as cores e fontes
src/components/marca/ logo, capa, selo, ilustrações (arte.ts), mapa
src/styles/marca.css  texturas, faixas de cor, medalhões (só com variáveis de tokens.css)
public/hub/           ferramentas do design system (Hub de Design, Vídeo, Kit Rede Social)
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
| `MURAL_CSV_URL` | CSV publicado da planilha de moderação do mural |

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
4. As ilustrações ficam em `src/components/marca/arte.ts`, gerado a partir do `cn-art.js` do design system. As texturas e faixas ficam em `src/styles/marca.css`.
5. O ícone da aba (`public/favicon.svg`) é um arquivo solto: redesenhe junto.

Os valores atuais vêm do projeto "Sistema visual coletivo nordestino" no Claude Design: barro, anil, sol, nanquim, papel e areia, com Archivo 800 apertado. O logo é provisório (linha da proposta "Registro"), até o coletivo escolher o definitivo.

## Hub de marca

A página `/marca` é a porta de entrada para quem produz conteúdo. As ferramentas ficam em `public/hub/` e são os arquivos do projeto "Sistema visual coletivo nordestino" no Claude Design, publicados como estão.

Para atualizar: exporte o projeto no Claude Design, copie para `public/hub/` os arquivos `.dc.html` dos hubs e os `.js` e `.jsx` que eles usam, e troque qualquer travessão por hífen (o teste de travessão varre essa pasta também). A pasta `uploads/` do projeto não entra: são referências de terceiros.

Ficou de fora, de propósito, o Hub de marca v2 (nomes e logos antigos). Ao recopiar o Hub de Design e o Kit Rede Social, recoloque antes de `</body>` as duas linhas de script: `html-to-image.js` e `exportar.js`.

Atenção: o README do design system pede para conferir a autorização da frase da animação 1 antes de divulgar.

## Vídeos da biblioteca

`/biblioteca/videos/` é um feed: um vídeo por tela, com curtir (a curtida fica salva só no aparelho de quem curtiu). O site não hospeda vídeo: incorpora o tocador oficial do YouTube ou do Instagram, e só depois do toque.

Para acrescentar um vídeo, edite `src/data/videos.json`:

```json
{
  "titulo": "",
  "autoria": "",
  "url": "link do YouTube ou do Instagram",
  "origem": "coletivo ou referencia",
  "uf": "CE",
  "por_que": "",
  "checagem": "ok ou conferir"
}
```

Só aparece vídeo com `checagem: "ok"`. Antes de marcar ok, confira se o link é o canal oficial de quem fez o vídeo.

## Jogos e sala de aula

- A jornada desmontada é um jogo narrativo: doze cenas, dois caminhos por cena, e no fim o veredito (caiu no estereótipo da TV ou contou o Nordeste de verdade). As cartas que viram continuam em `?modo=cartas`.
- Cruzadinha do dicionário e Palavras cruzadas montam a grade sozinhas a partir de `glossario.json` e `cruzadas.json`.
- Todo jogo tem tela de resultado e gera um cartão 1080x1350 em PNG (`src/lib/cartao.ts`), com as cores e fontes de `tokens.css`.
- `/sala-de-aula/projetar/` é o Novela ou Nordeste? para projetar: tela cheia, uma afirmação por vez, sem placar.
- As atividades de `/sala-de-aula` vêm de `src/data/kit.json`, copiado do documento 05 Kit educacional no Drive.
- Aprendendo inglês com forró é um protótipo. O conteúdo está em `src/data/forro-ingles.json` e as traduções precisam da revisão das professoras de inglês do grupo. Não entra letra de música, nem traduzida: só palavra solta e título.

## Em cartaz: vídeo, carrossel, podcast, blog e textos

A página `/em-cartaz` separa o que foi publicado em quatro tipos. O tipo sai da coluna `formato` da planilha de pautas:

| Escreva em formato | Aparece em |
| --- | --- |
| Vídeo, Story, Reels | Vídeos |
| Carrossel, Post | Carrosséis |
| Podcast, Áudio, Episódio | Podcast |
| Blog, Texto, Artigo, Newsletter | Blog e textos |

A pauta entra quando o status vira `Postado`. O botão da peça leva para `post_url` (o episódio no tocador, o post na rede).

Para texto hospedado no próprio site, crie um arquivo Markdown em `src/textos/`. Copie `_modelo.md`, tire o sublinhado do nome e preencha o cabeçalho (`titulo` e `data` são obrigatórios). O nome do arquivo vira o endereço: `src/textos/meu-texto.md` abre em `/em-cartaz/textos/meu-texto/`. Arquivo com sublinhado no começo é rascunho.

## Mural Me mostra na novela

O envio é por formulário externo e nada aparece no site sem moderação.

1. Crie um formulário (Google Forms, por exemplo) com as perguntas `nome`, `estado` (sigla), `texto` e `link`. Os títulos das perguntas viram os nomes das colunas.
2. Na planilha de respostas, acrescente a coluna `aprovado`. Quem modera escreve `sim` nas linhas que podem ir ao ar.
3. Publique a planilha como CSV e cadastre o link em `MURAL_CSV_URL`.
4. Ponha o link do formulário em `mural_formulario`, no `src/data/site.json`. Enquanto estiver vazio, a página avisa que o envio não está ligado.

A cada build, `npm run sync` grava em `src/data/mural.json` só as linhas aprovadas, com texto cortado em 280 caracteres e link só se começar com https. A página ainda confere `aprovado: true` item por item. Também dá para editar o `mural.json` à mão.

Antes de publicar recado com nome de pessoa, confirme a autorização dela no próprio formulário.

## Páginas por estado e imagens de compartilhamento

- `/estado/ce/` e as outras oito juntam gente do coletivo, dados checados, referências, palavras do dicionário e recados do mural daquele estado.
- Cada página tem uma imagem de compartilhamento 1200x630 em `public/og/`. A lista de páginas e títulos fica em `src/lib/og.ts`.
- As imagens ficam no repositório. Mudou um título, criou página ou trocou o design system? Rode `npm run og` e faça commit. O gerador usa o Chromium do Playwright.

## Exportar peças dos hubs

- Hub de Design e Kit Rede Social: o botão Baixar PNG fica no canto de baixo da tela (`public/hub/exportar.js`). Clique na peça, escolha o tamanho (1080 px de largura é o padrão) e baixe.
- Hub de Animações: a aba Exportar baixa um quadro em PNG ou SVG e dá o código para incorporar. Vídeo em arquivo só sai pelo editor do Claude Design.
- Hub de Vídeo: no site ele serve para ver e ajustar. A exportação em vídeo também é pelo Claude Design.

## Regras do projeto

- Texto em português do Brasil, sem travessão. `npm test` varre os arquivos e falha se achar um.
- Nada de dado inventado: tudo vem de `src/data/`. Campo vazio fica vazio.
- Item da biblioteca com `checagem: "conferir"` só aparece em `/bastidores`. Há teste para isso.
- Nenhuma imagem de terceiros: as capas são tipográficas, feitas em CSS e SVG.
- Nada de letra de música, trecho de livro ou fala de novela.
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
| `kit.json` | Atividades do kit educacional |
| `mural.json` | Recados aprovados do mural. Formato: `{"nome": "", "estado": "CE", "texto": "", "link": "", "aprovado": true}` |
| `forro-ingles.json` | Pares de palavras do protótipo de inglês |
| `cruzadas.json` | Respostas e dicas das palavras cruzadas, cada uma com a origem do dado |

## Fases

- Fase 1 (entregue): estrutura, tokens, início com trilhos, biblioteca, dicionário, bastidores, Novela ou Nordeste?, Monte sua novela, sync da planilha, prévia.
- Fase 2 (entregue): Bingo, Dicionário em modo jogo, A jornada desmontada, mapa vivo dos nove em Quem somos, sala de aula, cartões de compartilhamento. Entraram junto: hub de marca, visual com as ilustrações e texturas do design system e o protótipo Aprendendo inglês com forró.
- Fase 3 (entregue): mural Me mostra na novela com moderação, páginas por estado, imagens de compartilhamento por página. Entraram junto: Hub de Animações e exportação em PNG nos hubs.

## Créditos

Mapa: @svg-maps/brazil, CC BY 4.0. Fontes: Archivo e Covered By Your Grace (SIL Open Font License).
