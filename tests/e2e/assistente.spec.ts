import { expect, test, type Page } from "@playwright/test";

// Roda com ASSISTENTE_SIMULADO=1 (playwright.config.ts): respostas fixas, sem
// chamar o Gemini. Depende dos equipamentos de exemplo (npm run db:seed).

async function perguntar(page: Page, texto: string) {
  await page.getByLabel("Descreva o serviço que você vai fazer").fill(texto);
  await page.getByRole("button", { name: "Enviar" }).click();
}

const conversa = (page: Page) => page.getByRole("list", { name: "Conversa" });

test("pergunta feita no topo da home já chega respondida", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Qual serviço você vai fazer?").fill("vou cortar piso");
  await page.getByRole("button", { name: "Perguntar ao assistente" }).click();
  await expect(page).toHaveURL(/\/assistente$/);
  await expect(conversa(page).getByText("vou cortar piso")).toBeVisible();
  await expect(conversa(page).getByRole("link", { name: /Cortadora de piso/ })).toBeVisible();
});

test("começa por um exemplo", async ({ page }) => {
  await page.goto("/assistente");
  await expect(page.getByRole("heading", { name: "O que você vai fazer?" })).toBeVisible();

  await page.getByRole("button", { name: "Quero trocar o piso da sala por porcelanato" }).click();
  await expect(conversa(page).getByText("Quero trocar o piso da sala por porcelanato")).toBeVisible();
  await expect(conversa(page).getByRole("link", { name: /Cortadora de piso/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "Quero trocar o piso da sala por porcelanato" })).toHaveCount(0);
});

test("recomenda só o disponível e leva ao orçamento preenchido", async ({ page }) => {
  await page.goto("/assistente");
  await perguntar(page, "preciso de uma serra e da placa vibratória");

  const resposta = conversa(page).getByRole("article");
  await expect(resposta.getByRole("region", { name: "Equipamentos recomendados" }).getByRole("link", { name: /Serra mármore/ })).toBeVisible();
  await expect(resposta.getByText("Também serviria, mas está indisponível no momento:")).toBeVisible();
  await expect(resposta.getByRole("link", { name: /Placa vibratória/ })).toBeVisible();
  await expect(resposta.getByText("Disco diamantado")).toBeVisible();

  await resposta.getByRole("link", { name: "Pedir orçamento deste equipamento" }).click();
  await expect(page).toHaveURL(/\/orcamento\?/);
  const form = page.locator("form", { hasText: "Seus dados" });
  await expect(form.getByText("Serra mármore")).toBeVisible();
  await expect(form.getByText("Placa vibratória", { exact: true })).toHaveCount(0);
  await expect(page.getByLabel("O que você vai fazer?")).toHaveValue("preciso de uma serra e da placa vibratória");
  await expect(form.getByText("Materiais sugeridos pelo assistente")).toBeVisible();
});

test("pergunta fora do assunto oferece tentar de novo", async ({ page }) => {
  await page.goto("/assistente");
  await perguntar(page, "me passa uma receita de bolo");
  await expect(conversa(page).getByText("Só consigo ajudar com obras")).toBeVisible();

  await page.getByRole("button", { name: "Tentar de novo" }).click();
  await expect(conversa(page).getByText("me passa uma receita de bolo")).toHaveCount(0);
  await expect(page.getByLabel("Descreva o serviço que você vai fazer")).toBeFocused();
});

test("sem equipamento no catálogo, aponta o caminho", async ({ page }) => {
  await page.goto("/assistente");
  await perguntar(page, "guindaste para içar vigas");
  await expect(conversa(page).getByText(/Não temos "guindaste para içar vigas"/)).toBeVisible();
  await expect(conversa(page).getByRole("link", { name: "Ver o catálogo completo" })).toBeVisible();
});

test("código inventado pelo modelo nunca vira recomendação", async ({ page }) => {
  await page.goto("/assistente");
  await perguntar(page, "codigo-falso");
  const resposta = conversa(page).getByRole("article");
  await expect(resposta.getByText("Teste de código inexistente.")).toBeVisible();
  await expect(resposta.getByRole("region", { name: "Equipamentos recomendados" })).toHaveCount(0);
  await expect(resposta.getByRole("link", { name: /Pedir orçamento/ })).toHaveCount(0);
});

test("a conversa continua depois de abrir um equipamento e voltar", async ({ page }) => {
  await page.goto("/assistente");
  await perguntar(page, "quero usar a betoneira");
  await conversa(page).getByRole("link", { name: /Betoneira 400 litros/ }).click();
  await expect(page.getByRole("article").getByRole("heading", { level: 1, name: "Betoneira 400 litros" })).toBeVisible();

  await page.goto("/assistente");
  await expect(conversa(page).getByText("quero usar a betoneira")).toBeVisible();
  await page.getByRole("button", { name: "Nova conversa" }).click();
  await expect(conversa(page).getByText("quero usar a betoneira")).toHaveCount(0);
});
