# PROMPT PARA O CLAUDE CODE: site Barruada

Cole este arquivo inteiro como primeira mensagem, com a pasta `seed/` já copiada para a raiz do repositório.

## 1. O que você vai construir

O site **Barruada**: o hub público e a sala de trabalho de um coletivo de comunicadores, professores e educadores nordestinos que produz conteúdo para mostrar um Nordeste que a TV não mostra. "Barruada" é batida, trombada (do verbo barruar): a ideia é bater de frente com o estereótipo de região atrasada.

O site tem cara de plataforma de streaming (trilhos horizontais de cartões, capas grandes, "em cartaz"), mas o catálogo é a contranarrativa: peças do coletivo, biblioteca de referências, jogos, glossário e material para sala de aula.

Público: gente que chega pelo Instagram e pelo TikTok no celular, nordestina ou não. Precisa funcionar para quem nunca foi ao Nordeste.

## 2. Regras que não podem ser quebradas

1. Todo texto de interface em português do Brasil, direto e bem-humorado. Nunca usar travessão em nenhum texto: usar vírgula, ponto, dois-pontos ou parênteses.
2. Não inventar dado, obra, autor, prêmio ou link. Todo conteúdo vem dos arquivos de `seed/data/`. Se faltar um campo, deixar vazio.
3. Itens da biblioteca com `checagem: "conferir"` aparecem só na área interna. A área pública mostra apenas `checagem: "ok"`.
4. Não usar imagem com direito autoral: nada de capa de livro, pôster, foto de artista ou cena de novela. As capas dos cartões são tipográficas, geradas em CSS ou SVG a partir do título.
5. Não reproduzir letra de música, trecho de livro ou fala de novela.
6. Fora da marca: cacto e mandacaru como enfeite, chita, letra de cordel, xilogravura, sépia.
7. Acessibilidade AA: contraste, foco visível, navegação por teclado em todos os jogos, `prefers-reduced-motion` respeitado.

## 3. Stack

- Astro com ilhas React e TypeScript. Tailwind para estilo, com os tokens em variáveis CSS.
- Site estático, sem banco de dados. Deploy na Vercel (ou Netlify) a partir do GitHub.
- Conteúdo em `src/data/*.json`, copiado de `seed/data/`.
- Script `npm run sync`: se a variável `SHEET_CSV_URL` existir, baixa o CSV publicado da planilha Banco de Pautas e regrava `src/data/pautas.json` (colunas iguais às chaves do JSON). Rodar no build. Se a variável não existir, usar o JSON como está.
- Testes: Vitest para a lógica dos jogos e para o parser do CSV. Playwright para um fluxo por jogo.

## 4. Design

O design system final ainda está sendo fechado. Por isso:

- Todos os tokens ficam em um único arquivo, `src/styles/tokens.css`. Nenhuma cor ou fonte fixa em componente.
- Valores de partida (design system v1, em `seed/data/site.json`): azul #2A4BA0, vermelho #CC3519, amarelo #F2B441, creme #F4EAD5, tinta #1D1A16, barro #8A1F12, azul-noite #172A5E. Fontes: Archivo (títulos em 800, texto em 500) e Covered By Your Grace (a "caneta", só em frases de até 12 palavras).
- Três gestos da marca: o mapa inteiro dos nove estados com as divisas à mostra, a afirmação (cor chapada e Archivo apertado) e a caneta (letra de mão que risca e corrige).
- Regra de cor: vermelho corrige (pilar Resposta), azul afirma (pilar Afirmação). Raios amarelos só sobre azul, atrás do mapa.
- Geometria do mapa: pacote `@svg-maps/brazil` (CC BY 4.0). Dar o crédito no rodapé.
- Quando eu colar o export final do design system, a troca deve acontecer só em `tokens.css` e nos componentes de marca.

O fundo padrão é azul-noite com cartões em creme e cor chapada. Sensação de streaming, sem copiar a interface de nenhuma plataforma existente.

## 5. Mapa do site

### 5.1 Início (`/`)
- Faixa de abertura: uma frase do manifesto, com a caneta riscando uma palavra, e dois botões: "Ver o que está em cartaz" e "Jogar".
- Trilhos horizontais, nesta ordem: Em cartaz (pautas com status Postado), Em breve (status Pronto), Pra jogar, Pra ler, Pra ver, Pra ouvir, Pra sala de aula, Dicionário da Barruada.
- Um trilho vazio não aparece.

### 5.2 Em cartaz (`/em-cartaz` e `/em-cartaz/[id]`)
- Grade das peças publicadas, com filtro por série, pilar e formato.
- Página da peça: título, série, texto de apresentação, botão para o post original, fontes da peça.

### 5.3 Biblioteca (`/biblioteca`)
- Itens de `biblioteca.json`, agrupados pelas seções do arquivo.
- Filtros: seção, estado (os nove, mais "Nordeste" e "Brasil"), checagem.
- Cartão: capa tipográfica, autoria, estado, ano, "por que entra". Ao abrir: "como virar conteúdo" e links das fontes.
- Busca por texto.

### 5.4 Jogos (`/jogos`)
Todos funcionam no celular com uma mão, têm tela de resultado e geram um cartão 1080x1350 para compartilhar (canvas para PNG, com a marca).

1. **Novela ou Nordeste?** (`quiz` em `jogos.json`). Uma afirmação por vez, dois botões: "Nordeste de verdade" (azul) e "Coisa de novela" (vermelho). Depois da resposta, mostra a explicação e o link da fonte. No fim, placar e cartão.
2. **Monte sua novela** (`gerador`). A pessoa escolhe lugar, protagonista e conflito, ou sorteia. O site monta uma sinopse de três frases e um título. Há um "medidor de clichê": se a pessoa escrever no campo livre algum termo da lista `cliche`, o medidor sobe e a caneta comenta. Cartão final: "Ei, Globo. Toma essa sinopse."
3. **Bingo do estereótipo** (`bingo`). Cartela 5x5 sorteada, com o centro livre ("Se passa em 2026"). Vale para qualquer obra. Marca com toque, avisa quando fecha linha, gera cartão.
4. **Dicionário da Barruada** (`glossario.json`). Modo jogo: aparece a palavra, quatro significados, uma só resposta certa. Modo consulta em `/glossario`, com busca e o campo "onde se ouve".
5. **A jornada desmontada** (`jornada`). As doze etapas da jornada do herói. Cada etapa mostra o clichê do "herói sertanejo"; ao tocar, o cartão vira e mostra a versão do Nordeste de hoje. No fim, a história inteira reescrita, pronta para compartilhar.

### 5.5 Sala de aula (`/sala-de-aula`)
- Lista das atividades do kit educacional, com área, ano e tempo, e botão para abrir o documento no Drive (link em `site.json`).
- Versão para projetar do jogo Novela ou Nordeste?: tela cheia, uma afirmação por vez, sem placar individual.

### 5.6 Nove (`/nove`)
- Mapa clicável do Nordeste. Ao tocar em um estado: membros do coletivo de lá (de `membros.json`, que começa vazio), itens da biblioteca daquele estado e dados da seção de Afirmação.

### 5.7 Manifesto (`/manifesto`)
- Texto curto vindo de `site.json`, quem somos, links das redes, contato.

### 5.8 Bastidores (`/bastidores`), área de trabalho
- Não aparece no menu, tem `noindex` e fica fora do sitemap. Não é segurança de verdade: os roteiros ficam no Drive, com permissão própria. Deixar esse aviso num comentário do código.
- Quadro das pautas de `pautas.json` em colunas por status: Ideia, Roteiro pré-pronto, Em revisão, Em produção, Pronto, Postado.
- Filtros por série, pilar, formato e responsável. Contador por pilar com alerta quando Resposta passar de 60% do que está em produção.
- Cada cartão: título, gancho, série, esforço, responsável, botão "Abrir roteiro no Drive" (campo `roteiro_url`) e, se postado, botão para o post.
- Aba Séries: as 14 séries de `series.json` com premissa e episódios.
- Aba Biblioteca completa: inclui os itens "conferir", com destaque visual.

## 6. Dados

Os arquivos de `seed/data/` já vêm preenchidos:

- `site.json`: nome, frases, tokens, links do Drive, ficha da novela.
- `series.json`: 14 séries, com premissa, pilar, esforço e episódios.
- `pautas.json`: 71 pautas, com id, título, série, pilar, formato, gancho, esforço, status, responsável, `roteiro_url`, `post_url`.
- `biblioteca.json`: referências por seção, com checagem e links.
- `glossario.json`: termos, significado, exemplo, onde se ouve.
- `jogos.json`: `quiz`, `bingo`, `gerador`, `jornada`.
- `membros.json`: lista vazia, com o formato esperado no primeiro item comentado no README.

Crie tipos TypeScript para cada arquivo e valide os JSON no build (falhar com mensagem clara se um campo obrigatório faltar).

## 7. Fases

**Fase 1 (primeira entrega):** estrutura, tokens, início com trilhos, biblioteca, glossário, bastidores, Novela ou Nordeste?, Monte sua novela, sync da planilha, deploy.

**Fase 2:** Bingo, Dicionário em modo jogo, A jornada desmontada, mapa dos nove, sala de aula, cartões de compartilhamento.

**Fase 3:** mural "Me mostra na novela" (envio por formulário externo, com moderação manual antes de aparecer), páginas por estado, imagens de compartilhamento por página.

Ao fim de cada fase, pare, rode os testes, publique uma prévia e me mostre o link antes de seguir.

## 8. Critérios de aceite

- Nota 90 ou mais em desempenho e acessibilidade no Lighthouse, em celular.
- Nenhum travessão em nenhum texto do site (crie um teste que varre os arquivos e falha se achar).
- Nenhum item "conferir" visível fora de `/bastidores` (teste automatizado).
- Todos os jogos jogáveis só com teclado.
- Trocar uma cor em `tokens.css` muda o site inteiro.
- `npm run sync` com um CSV de exemplo atualiza o status de uma pauta e ela muda de trilho.
- README com: como rodar, como publicar, como atualizar a planilha, como trocar o design system.

## 9. Como trabalhar

Comece lendo `seed/data/`. Proponha a estrutura de pastas em uma mensagem curta e siga sem esperar aprovação, a não ser que encontre conflito entre este prompt e os dados. Faça commits pequenos. Não instale dependência que não seja necessária.
