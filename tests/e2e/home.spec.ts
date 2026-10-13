import { expect, test } from "@playwright/test";

test("a página inicial abre com o nome do site", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/LocaGuia/);
});

test("o catálogo da home leva direto ao orçamento do equipamento", async ({ page }) => {
  await page.goto("/");
  const cartao = page.getByRole("article").filter({ hasText: "Betoneira 400 litros" });
  await cartao.getByRole("link", { name: "Pedir orçamento" }).click();
  await expect(page).toHaveURL(/\/orcamento\?equipamentos=/);
  await expect(page.locator("form").getByText("Betoneira 400 litros")).toBeVisible();
});

test("perguntas frequentes abrem e fecham", async ({ page }) => {
  await page.goto("/");
  const pergunta = page.getByText("O pedido já reserva o equipamento?");
  await pergunta.click();
  await expect(page.getByText("O pedido de orçamento não é uma reserva")).toBeVisible();
});
