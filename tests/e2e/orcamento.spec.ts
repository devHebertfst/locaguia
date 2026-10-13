import { config } from "dotenv";
import postgres from "postgres";
import { expect, test, type Page } from "@playwright/test";

// Depende dos equipamentos de exemplo (npm run db:seed). Os pedidos criados
// aqui usam o nome abaixo e são apagados no fim.
config({ path: ".env.local", quiet: true });
const NOME_TESTE = "Teste Automatizado E2E";
const sql = postgres(process.env.DATABASE_URL ?? "", { prepare: false, max: 1 });

test.afterAll(async () => {
  await sql`delete from solicitacoes where nome_cliente = ${NOME_TESTE}`;
  await sql.end();
});

function dataDaqui(dias: number): string {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
}

async function preencherDados(page: Page) {
  await page.getByLabel("O que você vai fazer?").fill("Trocar o piso da sala, 20 m²");
  await page.getByLabel("Retirada").fill(dataDaqui(3));
  await page.getByLabel("Devolução").fill(dataDaqui(5));
  await page.getByLabel("Nome", { exact: true }).fill(NOME_TESTE);
  await page.getByLabel("WhatsApp", { exact: true }).fill("11912345678");
}

test("pede orçamento a partir do detalhe do equipamento", async ({ page }) => {
  await page.goto("/?busca=serra");
  await page.getByRole("link", { name: /Serra mármore/ }).click();
  await page.getByRole("article").getByRole("link", { name: "Pedir orçamento" }).click();

  await expect(page).toHaveURL(/\/orcamento\?equipamentos=/);
  const form = page.locator("form");
  await expect(form.getByText("Serra mármore")).toBeVisible();

  // adiciona um segundo equipamento pela lista
  await form.getByLabel("Adicionar equipamento").selectOption({ label: "Martelete rompedor 10 kg" });
  await expect(form.getByRole("button", { name: "Remover Martelete rompedor 10 kg" })).toBeVisible();

  await preencherDados(page);
  await expect(page.getByLabel("WhatsApp", { exact: true })).toHaveValue("(11) 91234-5678");
  await page.getByRole("button", { name: "Pedir orçamento" }).click();

  await expect(page.getByRole("heading", { name: "Pedido registrado" })).toBeVisible();
  const codigo = (await page.locator("strong.font-mono").textContent())!.trim();
  expect(codigo).toMatch(/^[0-9A-F]{8}$/);

  const link = page.getByRole("link", { name: "Enviar pelo WhatsApp" });
  const href = decodeURIComponent((await link.getAttribute("href"))!);
  expect(href).toContain("https://wa.me/5511900000000?text=");
  expect(href).toContain(`pedido ${codigo}`);
  expect(href).toContain("- Martelete rompedor 10 kg");
  expect(href).toContain("- Serra mármore");

  // gravado no banco com os dois equipamentos e o telefone em E.164
  const [pedido] = await sql`
    select s.telefone, s.aceita_whatsapp, s.status, count(se.*)::int as equipamentos
    from solicitacoes s join solicitacao_equipamentos se on se.solicitacao_id = s.id
    where s.nome_cliente = ${NOME_TESTE} and upper(left(s.id::text, 8)) = ${codigo}
    group by s.id`;
  expect(pedido).toMatchObject({
    telefone: "+5511912345678",
    aceita_whatsapp: false,
    status: "nova",
    equipamentos: 2,
  });
});

test("mostra os erros e mantém o que foi digitado", async ({ page }) => {
  await page.goto("/orcamento");
  await page.getByLabel("Nome", { exact: true }).fill(NOME_TESTE);
  await page.getByLabel("WhatsApp", { exact: true }).fill("1133334444");
  await page.getByRole("button", { name: "Pedir orçamento" }).click();

  await expect(page.locator("form").getByRole("alert")).toHaveText("Confira os campos destacados.");
  await expect(page.getByText("Escolha pelo menos um equipamento.")).toBeVisible();
  await expect(page.getByText(/Informe um celular com DDD/)).toBeVisible();
  await expect(page.getByText("Informe a data de início.")).toBeVisible();
  await expect(page.getByLabel("Nome", { exact: true })).toHaveValue(NOME_TESTE);
  await expect(page.getByLabel("WhatsApp", { exact: true })).toHaveAttribute("aria-invalid", "true");
});

test("equipamento indisponível na URL fica fora do pedido", async ({ page }) => {
  const [placa] = await sql`select id from equipamentos where nome = 'Placa vibratória'`;
  const [betoneira] = await sql`select id from equipamentos where nome = 'Betoneira 400 litros'`;
  await page.goto(`/orcamento?equipamentos=${placa.id},${betoneira.id}&servico=Calçada`);

  await expect(page.getByText("Um equipamento escolhido não está disponível agora")).toBeVisible();
  const form = page.locator("form");
  await expect(form.getByText("Betoneira 400 litros")).toBeVisible();
  await expect(form.getByText("Placa vibratória")).toHaveCount(0);
  await expect(page.getByLabel("O que você vai fazer?")).toHaveValue("Calçada");
});

test("equipamento indisponível não tem botão de orçamento", async ({ page }) => {
  await page.goto("/?busca=placa");
  await page.getByRole("link", { name: /Placa vibratória/ }).click();
  const detalhe = page.getByRole("article");
  await expect(detalhe.getByText("Indisponível no momento")).toBeVisible();
  await expect(detalhe.getByRole("link", { name: "Pedir orçamento" })).toHaveCount(0);
});
