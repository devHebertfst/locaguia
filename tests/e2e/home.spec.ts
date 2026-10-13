import { expect, test } from "@playwright/test";

test("a página inicial abre com o nome do site", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/LocaGuia/);
});
