import { expect, test, type Page } from '@playwright/test';
import forro from '../../src/data/forro-ingles.json' with { type: 'json' };
import jogos from '../../src/data/jogos.json' with { type: 'json' };

async function tabAte(page: Page, seletor: string, limite = 60) {
  for (let i = 0; i < limite; i++) {
    const noAlvo = await page.evaluate((s) => document.activeElement?.matches(s) ?? false, seletor);
    if (noAlvo) return;
    await page.keyboard.press('Tab');
  }
  throw new Error(`Tab não chegou em ${seletor}`);
}

async function conferirCartao(page: Page) {
  await tabAte(page, '[data-gerar-cartao]');
  await page.keyboard.press('Enter');
  const cartao = page.locator('[data-cartao]');
  await expect(cartao).toBeVisible();
  const medidas = await cartao.evaluate(async (img: HTMLImageElement) => {
    await img.decode();
    return [img.naturalWidth, img.naturalHeight];
  });
  expect(medidas).toEqual([1080, 1350]);
  await expect(page.locator('[data-baixar]')).toHaveAttribute('download', /\.png$/);
}

test('Bingo: fecha uma linha só com teclado e gera o cartão 1080x1350', async ({ page }) => {
  await page.goto('/jogos/bingo-do-estereotipo/?ordem=fixa');
  await expect(page.locator('[data-casa="12"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-casa="0"]')).toHaveText(new RegExp(jogos.bingo[0]));

  await tabAte(page, '[data-casa="0"]');
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('Enter');
    if (i < 4) await page.keyboard.press('ArrowRight');
  }
  await expect(page.locator('[data-jogo="bingo"]')).toHaveAttribute('data-linhas', '1');
  await expect(page.locator('[data-aviso]')).toContainText('Bingo');
  await expect(page.locator('[data-contagem]')).toContainText('5 de 24');

  // Seta para baixo anda na coluna.
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('[data-casa="9"]')).toBeFocused();

  await conferirCartao(page);
});

test('Dicionário em modo jogo: oito palavras só com teclado', async ({ page }) => {
  await page.goto('/jogos/dicionario/?ordem=fixa');
  for (let i = 0; i < 8; i++) {
    await expect(page.locator('[data-termo]')).toBeVisible();
    // Erra a primeira de propósito.
    await tabAte(page, i === 0 ? '[data-certa="nao"]' : '[data-certa="sim"]');
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-retorno]')).toHaveAttribute('data-retorno', i === 0 ? 'errado' : 'certo');
    await tabAte(page, '[data-proxima]');
    await page.keyboard.press('Enter');
  }
  await expect(page.locator('[data-placar]')).toHaveText('7 de 8');
  await conferirCartao(page);
});

test('A jornada desmontada: vira as doze cartas e mostra a história reescrita', async ({ page }) => {
  await page.goto('/jogos/a-jornada-desmontada/');
  await tabAte(page, '[data-carta="0"]');
  for (let i = 0; i < jogos.jornada.length; i++) {
    await expect(page.locator(`[data-carta="${i}"]`)).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator(`[data-carta="${i}"]`)).toHaveAttribute('aria-pressed', 'true');
    if (i < jogos.jornada.length - 1) await page.keyboard.press('Tab');
  }
  const historia = page.locator('[data-tela="historia"]');
  await expect(historia).toBeVisible();
  for (const etapa of jogos.jornada) await expect(historia).toContainText(etapa.troca);
  await conferirCartao(page);
});

test('Aprendendo inglês com forró: liga os seis pares com teclado', async ({ page }) => {
  await page.goto('/jogos/ingles-com-forro/?ordem=fixa');
  await expect(page.locator('[data-aviso-prototipo]')).toBeVisible();
  const pares = forro.vocabulario.slice(0, 6);

  // Um erro de propósito.
  await page.locator(`[data-pt="${pares[0].pt}"]`).focus();
  await page.keyboard.press('Enter');
  await page.locator(`[data-en="${pares[1].en}"]`).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-aviso]')).toContainText('Ainda não');

  for (const p of pares) {
    await page.locator(`[data-pt="${p.pt}"]`).focus();
    await page.keyboard.press('Enter');
    await page.locator(`[data-en="${p.en}"]`).focus();
    await page.keyboard.press('Enter');
  }
  const fim = page.locator('[data-tela="resultado"]');
  await expect(fim).toBeVisible();
  await expect(fim).toContainText('1 erro');
  await conferirCartao(page);

  // Troca de baralho.
  await page.locator('[data-baralho="titulos"]').click();
  await expect(page.locator(`[data-pt="${forro.titulos[0].pt}"]`)).toBeVisible();
});

test('os jogos da fase 1 também geram cartão', async ({ page }) => {
  await page.goto('/jogos/monte-sua-novela/');
  await page.locator('[data-sortear]').click();
  await page.locator('[data-montar]').click();
  await expect(page.locator('[data-tela="sinopse"]')).toBeVisible();
  await conferirCartao(page);
});

test('mapa vivo: estado pelo teclado na abertura e em Quem somos', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-uf="PE"]').focus();
  await page.keyboard.press('Enter');
  const cartao = page.locator('[data-cartao-estado="PE"]');
  await expect(cartao).toContainText('Pernambuco');
  await cartao.getByRole('link').click();
  await expect(page).toHaveURL(/quem-somos\/#PE$/);
  await expect(page.locator('[data-nome-estado]')).toHaveText('Pernambuco');

  await page.locator('[data-chip="CE"]').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-nome-estado]')).toHaveText('Ceará');
  await expect(page.locator('[data-painel="CE"]')).toContainText('Gente do coletivo');
  await expect(page.locator('[data-uf="CE"]')).toHaveAttribute('aria-pressed', 'true');
});

test('sala de aula: atividades do kit e versão para projetar sem placar', async ({ page }) => {
  await page.goto('/sala-de-aula/');
  await expect(page.locator('[data-atividade]')).toHaveCount(6);
  await page.locator('[data-abrir-projetor]').click();

  const palco = page.locator('[data-projetor]');
  await expect(palco.locator('[data-afirmacao]')).toHaveText(jogos.quiz[0].afirmacao);
  await palco.locator('[data-avancar]').focus();
  await page.keyboard.press('Enter');
  await expect(palco.locator('[data-resposta]')).toContainText(jogos.quiz[0].explicacao);
  await page.keyboard.press('ArrowRight');
  await expect(palco.locator('[data-afirmacao]')).toHaveText(jogos.quiz[1].afirmacao);
  await page.keyboard.press('ArrowLeft');
  await expect(palco.locator('[data-afirmacao]')).toHaveText(jogos.quiz[0].afirmacao);
  await expect(palco).not.toContainText(/\d+ de \d+ acertos|Acertou|Errou/);
});

test('hub de marca abre as ferramentas do design system', async ({ page }) => {
  await page.goto('/marca/');
  await expect(page.locator('[data-hub]')).toHaveCount(6);
  await expect(page.locator('[data-cor="barro"]')).toHaveText(/^#[0-9A-F]{6}$/);
  await page.locator('[data-hub]').first().click();
  await expect(page.getByRole('heading', { name: 'Hub de Design' })).toBeVisible({ timeout: 15000 });
});

test('fase 3: página de estado, mural fechado e exportação do hub', async ({ page }) => {
  await page.goto('/quem-somos/#CE');
  await page.locator('[data-pagina-estado]').click();
  await expect(page).toHaveURL(/\/estado\/ce\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ceará');
  await expect(page.locator('[data-dado]').first()).toBeVisible();

  await page.goto('/mural/');
  await expect(page.locator('[data-mural-vazio]')).toBeVisible();
  await expect(page.locator('[data-envio-fechado]')).toBeVisible();
  await expect(page.locator('[data-recado]')).toHaveCount(0);

  await page.goto('/hub/' + encodeURIComponent('Coletivo Nordeste - Kit Rede Social.dc.html'));
  const botao = page.locator('[data-exportar]');
  await expect(botao).toBeVisible({ timeout: 20000 });
  const [arquivo] = await Promise.all([page.waitForEvent('download', { timeout: 60000 }), botao.click()]);
  expect(arquivo.suggestedFilename()).toMatch(/^barruada-.*\.png$/);
});
