import { expect, test } from "@playwright/test";

test("a página inicial abre com o nome do site", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/LocaGuia/);
});

test("a home leva ao catálogo, filtrado pela categoria escolhida", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("region", { name: "Equipamentos por tipo de serviço" }).getByRole("link", { name: /Corte/ }).click();
  await expect(page).toHaveURL(/\/catalogo\?categoria=Corte$/);
  await expect(page.getByRole("link", { name: /Serra mármore/ })).toBeVisible();
});

test("perguntas frequentes abrem e fecham", async ({ page }) => {
  await page.goto("/");
  const pergunta = page.getByText("O pedido já reserva o equipamento?");
  await pergunta.click();
  await expect(page.getByText("O pedido de orçamento não é uma reserva")).toBeVisible();
});
