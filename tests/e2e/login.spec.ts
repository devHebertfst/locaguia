import { expect, test } from "@playwright/test";

test("sem sessão, /admin leva ao login guardando o destino", async ({ page }) => {
  await page.goto("/admin/equipamentos");
  await expect(page).toHaveURL(/\/entrar\?proximo=%2Fadmin%2Fequipamentos$/);
  await expect(page.getByRole("heading", { name: "Área da equipe" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Entrar com Google" })).toBeVisible();
});

test("mostra o aviso de conta sem acesso", async ({ page }) => {
  await page.goto("/entrar?erro=nao_autorizado");
  await expect(page.getByRole("main").getByRole("alert")).toContainText("não tem acesso");
});

test("callback sem código volta ao login com erro", async ({ page }) => {
  await page.goto("/auth/callback");
  await expect(page).toHaveURL(/\/entrar\?erro=falha$/);
  await expect(page.getByRole("main").getByRole("alert")).toContainText("Não foi possível entrar");
});
