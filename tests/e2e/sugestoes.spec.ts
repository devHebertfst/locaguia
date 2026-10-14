import { config } from "dotenv";
import postgres from "postgres";
import { expect, test, type TestInfo } from "@playwright/test";

// Depende dos equipamentos de exemplo (npm run db:seed): a Placa vibratória
// está indisponível. Os testes rodam em paralelo no mesmo banco: cada um usa
// um nome de cliente próprio e apaga só as próprias sugestões no fim.
config({ path: ".env.local", quiet: true });
// Sem sql.end() no afterAll: com fullyParallel o Playwright reaproveita o
// worker depois dele, e a conexão já fechada derrubaria o próximo teste. O
// idle_timeout fecha a conexão sozinho quando o worker fica parado.
const sql = postgres(process.env.DATABASE_URL ?? "", { prepare: false, max: 1, idle_timeout: 2 });
// O testId é único por teste e por projeto (o começo dele é só o hash do arquivo).
const nomeTeste = (info: TestInfo) => `Teste E2E ${info.testId}`;

test.afterEach(async ({}, info) => {
  await sql`delete from sugestoes where nome_cliente = ${nomeTeste(info)}`;
});

test("pede aviso de um equipamento indisponível", async ({ page }, info) => {
  const NOME_TESTE = nomeTeste(info);
  // Um telefone por projeto: o "avise-me" junta pedidos do mesmo telefone.
  const telefone = info.project.name === "celular" ? "11987654321" : "11987654322";
  await page.goto("/catalogo?busca=placa");
  await page.getByRole("link", { name: /Placa vibratória/ }).click();

  const bloco = page.getByRole("region", { name: "Quer este equipamento?" });
  const aviso = bloco.getByRole("checkbox");
  await expect(aviso).not.toBeChecked();
  await expect(aviso).toHaveAccessibleName(/voltar a ficar disponível/);

  await bloco.getByLabel("Nome", { exact: true }).fill(NOME_TESTE);
  await bloco.getByLabel("WhatsApp", { exact: true }).fill(telefone);
  await aviso.check();
  await bloco.getByRole("button", { name: "Me avise" }).click();
  await expect(bloco.getByRole("heading", { name: "Pedido anotado" })).toBeVisible();
  await expect(bloco.getByText("você recebe um aviso no WhatsApp")).toBeVisible();

  // Pedir de novo com o mesmo telefone não cria outra linha nem tira o aviso.
  await page.reload();
  const blocoDeNovo = page.getByRole("region", { name: "Quer este equipamento?" });
  await blocoDeNovo.getByLabel("Nome", { exact: true }).fill(NOME_TESTE);
  await blocoDeNovo.getByLabel("WhatsApp", { exact: true }).fill(telefone);
  await blocoDeNovo.getByRole("button", { name: "Me avise" }).click();
  await expect(blocoDeNovo.getByRole("heading", { name: "Pedido anotado" })).toBeVisible();

  const linhas = await sql`
    select s.tipo, s.nome_equipamento, s.quer_aviso, s.status, e.nome as equipamento
    from sugestoes s join equipamentos e on e.id = s.equipamento_id
    where s.nome_cliente = ${NOME_TESTE} and s.telefone = ${`+55${telefone}`}`;
  expect(linhas).toHaveLength(1);
  expect(linhas[0]).toMatchObject({
    tipo: "aguardar_disponibilidade",
    nome_equipamento: "Placa vibratória",
    equipamento: "Placa vibratória",
    quer_aviso: true,
    status: "pendente",
  });
});

test("equipamento disponível não mostra o pedido de aviso", async ({ page }) => {
  await page.goto("/catalogo?busca=betoneira");
  await page.getByRole("link", { name: /Betoneira 400 litros/ }).click();
  await expect(page.getByRole("article").getByRole("link", { name: "Pedir orçamento" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Quer este equipamento?" })).toHaveCount(0);
});

test("sugere equipamento que a loja não tem, vindo da busca sem resultado", async ({ page }, info) => {
  const NOME_TESTE = nomeTeste(info);
  await page.goto("/catalogo?busca=guindaste");
  await expect(page.getByText("Nenhum equipamento encontrado.")).toBeVisible();
  await page.getByRole("link", { name: "Sugerir este equipamento" }).click();

  await expect(page).toHaveURL(/\/sugerir\?equipamento=guindaste$/);
  const form = page.locator("form");
  await expect(form.getByLabel("Qual equipamento você procura?")).toHaveValue("guindaste");
  await expect(form.getByRole("checkbox")).not.toBeChecked();

  // Erros aparecem e o que foi digitado fica.
  await form.getByLabel("Nome", { exact: true }).fill(NOME_TESTE);
  await form.getByRole("button", { name: "Enviar sugestão" }).click();
  await expect(form.getByRole("alert")).toHaveText("Confira os campos destacados.");
  await expect(form.getByText(/Informe um celular com DDD/)).toBeVisible();
  await expect(form.getByLabel("Nome", { exact: true })).toHaveValue(NOME_TESTE);

  const motivo = "Içar vigas";
  await form.getByLabel("Para que serviço? (opcional)").fill(motivo);
  await form.getByLabel("WhatsApp", { exact: true }).fill("11912345678");
  await form.getByRole("button", { name: "Enviar sugestão" }).click();
  await expect(page.getByRole("heading", { name: "Sugestão enviada" })).toBeVisible();
  await expect(page.getByText("A locadora vai ver o seu pedido.")).toBeVisible();

  const [linha] = await sql`select tipo, nome_equipamento, equipamento_id, quer_aviso, telefone from sugestoes where nome_cliente = ${NOME_TESTE} and motivo = ${motivo}`;
  expect(linha).toEqual({
    tipo: "novo_equipamento",
    nome_equipamento: "guindaste",
    equipamento_id: null,
    quer_aviso: false,
    telefone: "+5511912345678",
  });
});

test("o assistente leva à sugestão quando não há equipamento", async ({ page }) => {
  await page.goto("/assistente");
  await page.getByLabel("Descreva o serviço que você vai fazer").fill("Preciso de um guindaste");
  await page.getByRole("button", { name: "Enviar" }).click();
  const link = page.getByRole("link", { name: "Sugerir este equipamento" });
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute("href", /^\/sugerir\?equipamento=Preciso\+de\+um\+guindaste/);
});

test("a rota do Cron recusa chamada sem o segredo", async ({ request }) => {
  const resposta = await request.get("/api/cron/avisos");
  expect(resposta.status()).toBe(401);
  const comSegredoErrado = await request.get("/api/cron/avisos", { headers: { Authorization: "Bearer errado" } });
  expect(comSegredoErrado.status()).toBe(401);
});

test("sem sessão, sugestões e equipe levam ao login", async ({ page }) => {
  await page.goto("/admin/sugestoes");
  await expect(page).toHaveURL(/\/entrar\?proximo=%2Fadmin%2Fsugestoes$/);
  await page.goto("/admin/equipe");
  await expect(page).toHaveURL(/\/entrar\?proximo=%2Fadmin%2Fequipe$/);
});
