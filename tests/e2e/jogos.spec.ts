import { expect, test, type Page } from '@playwright/test';
import jogos from '../../src/data/jogos.json' with { type: 'json' };

// Anda com Tab até o foco cair no elemento pedido. Prova que dá para jogar só com teclado.
async function tabAte(page: Page, seletor: string, limite = 40) {
  for (let i = 0; i < limite; i++) {
    const noAlvo = await page.evaluate((s) => document.activeElement?.matches(s) ?? false, seletor);
    if (noAlvo) return;
    await page.keyboard.press('Tab');
  }
  throw new Error(`Tab não chegou em ${seletor}`);
}

test('Novela ou Nordeste? do começo ao placar, só com teclado', async ({ page }) => {
  await page.goto('/jogos/novela-ou-nordeste/?ordem=fixa');
  await expect(page.locator('[data-tela="pergunta"][data-pronto="true"]')).toBeVisible();

  for (const [i, item] of jogos.quiz.entries()) {
    await expect(page.locator('[data-afirmacao]')).toHaveText(item.afirmacao);
    // Erra de propósito a segunda, acerta o resto.
    const escolha = i === 1 ? (item.resposta === 'nordeste' ? 'novela' : 'nordeste') : item.resposta;
    await tabAte(page, `[data-resposta="${escolha}"]`);
    await page.keyboard.press('Enter');

    const retorno = page.locator('[data-retorno]');
    await expect(retorno).toHaveAttribute('data-retorno', i === 1 ? 'errado' : 'certo');
    await expect(retorno).toContainText(item.explicacao);
    await expect(retorno).toBeFocused();

    await tabAte(page, '[data-proxima]');
    await page.keyboard.press('Enter');
  }

  await expect(page.locator('[data-tela="resultado"]')).toBeVisible();
  await expect(page.locator('[data-placar]')).toHaveText(`${jogos.quiz.length - 1} de ${jogos.quiz.length}`);
  await expect(page.locator('[data-placar]')).toBeFocused();
});

test('Monte sua novela: sorteio, medidor de clichê e sinopse, só com teclado', async ({ page }) => {
  await page.goto('/jogos/monte-sua-novela/');
  const montar = page.locator('[data-montar]');
  await expect(montar).toBeDisabled();

  // Escolhe o lugar pelo teclado (digitar no select pula para a opção).
  await tabAte(page, '[data-campo="lugar"]');
  await page.keyboard.type('Recife');
  await expect(page.locator('[data-campo="lugar"]')).toHaveValue('Recife, no Porto Digital');

  // Sorteia o resto.
  await tabAte(page, '[data-sortear]');
  await page.keyboard.press('Enter');
  await expect(montar).toBeEnabled();
  const conflito = await page.locator('[data-campo="conflito"]').inputValue();
  expect(jogos.gerador.conflito).toContain(conflito);

  // Medidor de clichê.
  await expect(page.locator('[data-medidor]')).toHaveAttribute('data-medidor', '0');
  await page.locator('[data-livre]').focus();
  await page.keyboard.type('No fim aparece um coronel e um jagunço.');
  await expect(page.locator('[data-medidor]')).toHaveAttribute('data-medidor', '2');
  await expect(page.locator('[data-caneta]')).not.toBeEmpty();

  await tabAte(page, '[data-montar]');
  await page.keyboard.press('Enter');

  const sinopse = page.locator('[data-tela="sinopse"]');
  await expect(sinopse).toContainText('Ei, Globo. Toma essa sinopse.');
  await expect(page.locator('[data-titulo]')).toBeFocused();
  await expect(sinopse.locator('p').filter({ hasText: 'Tudo muda quando entra em cena' })).toBeVisible();

  await tabAte(page, '[data-outra]');
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-tela="montagem"]')).toBeVisible();
});

test('biblioteca pública não mostra item a conferir; bastidores mostra', async ({ page }) => {
  await page.goto('/biblioteca/');
  await expect(page.locator('[data-checagem="ok"]').first()).toBeVisible();
  await expect(page.locator('[data-checagem="conferir"]')).toHaveCount(0);

  await page.goto('/bastidores/');
  await page.getByRole('tab', { name: 'Biblioteca completa' }).click();
  await expect(page.locator('[data-checagem="conferir"]').first()).toBeVisible();
});
