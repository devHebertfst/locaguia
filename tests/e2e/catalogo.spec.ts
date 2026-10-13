import { expect, test } from "@playwright/test";

// Depende dos equipamentos de exemplo (npm run db:seed).

test("lista os equipamentos e marca os indisponíveis", async ({ page }) => {
  await page.goto("/catalogo");
  await expect(page.getByRole("heading", { name: "Equipamentos para alugar" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Betoneira 400 litros/ })).toBeVisible();
  const indisponivel = page.getByRole("link", { name: /Placa vibratória/ });
  await expect(indisponivel.getByText("Indisponível no momento")).toBeVisible();
});

test("busca sem diferenciar acentos e maiúsculas", async ({ page }) => {
  await page.goto("/catalogo");
  await page.getByRole("searchbox", { name: "Buscar equipamento" }).fill("SERRA MARMORE");
  await page.getByRole("button", { name: "Buscar" }).click();
  await expect(page).toHaveURL(/busca=SERRA\+MARMORE/);
  await expect(page.getByText("1 equipamento encontrado")).toBeVisible();
  await expect(page.getByRole("link", { name: /Serra mármore/ })).toBeVisible();
});

test("busca também pela descrição", async ({ page }) => {
  await page.goto("/catalogo?busca=porcelanato");
  await expect(page.getByRole("link", { name: /Serra mármore/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Cortadora de piso/ })).toBeVisible();
});

test("filtra por categoria mantendo a busca", async ({ page }) => {
  await page.goto("/catalogo?busca=compact");
  await page.getByRole("navigation", { name: "Categorias" }).getByRole("link", { name: "Compactação" }).click();
  await expect(page).toHaveURL(/busca=compact.*categoria=Compacta/);
  await expect(page.getByText("2 equipamentos encontrados")).toBeVisible();
});

test("mostra mensagem quando nada é encontrado", async ({ page }) => {
  await page.goto("/catalogo?busca=helicoptero");
  await expect(page.getByText("Nenhum equipamento encontrado.")).toBeVisible();
  await page.getByRole("link", { name: "Ver todos os equipamentos" }).click();
  await expect(page.getByRole("link", { name: /Betoneira 400 litros/ })).toBeVisible();
});

test("abre o detalhe do equipamento", async ({ page }) => {
  await page.goto("/catalogo");
  await page.getByRole("link", { name: /Lavadora de alta pressão/ }).click();
  // O Next mantém a página anterior escondida no DOM; olhe só o detalhe.
  const detalhe = page.getByRole("article");
  await expect(detalhe.getByRole("heading", { level: 1, name: "Lavadora de alta pressão" })).toBeVisible();
  await expect(detalhe.getByText("Indisponível no momento")).toBeVisible();
  await expect(page).toHaveTitle("Lavadora de alta pressão | LocaGuia");
});

test("id inexistente ou inválido mostra página de não encontrado", async ({ page }) => {
  await page.goto("/equipamentos/nao-existe");
  await expect(page.getByRole("heading", { name: "Equipamento não encontrado" })).toBeVisible();
  await page.goto("/equipamentos/00000000-0000-0000-0000-000000000000");
  await expect(page.getByRole("heading", { name: "Equipamento não encontrado" })).toBeVisible();
});

test("o cartão leva direto ao orçamento do equipamento", async ({ page }) => {
  await page.goto("/catalogo");
  const cartao = page.getByRole("article").filter({ hasText: "Betoneira 400 litros" });
  await cartao.getByRole("link", { name: "Pedir orçamento" }).click();
  await expect(page).toHaveURL(/\/orcamento\?equipamentos=/);
  await expect(page.locator("form").getByText("Betoneira 400 litros")).toBeVisible();
});

test("links antigos de busca na home vão para o catálogo", async ({ page }) => {
  await page.goto("/?busca=serra");
  await expect(page).toHaveURL(/\/catalogo\?busca=serra$/);
  await expect(page.getByText("1 equipamento encontrado")).toBeVisible();
});
