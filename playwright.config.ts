import { defineConfig, devices } from "@playwright/test";

const porta = 3100;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${porta}`,
    locale: "pt-BR",
    trace: "on-first-retry",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "celular", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    // Build de produção: roda junto com um `next dev` aberto (o Next 16 só
    // permite um dev server por pasta) e testa o que vai para a Vercel.
    command: `npm run build && npm run start -- --port ${porta}`,
    url: `http://localhost:${porta}`,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
    // Valores fixos para os testes (variáveis do processo têm prioridade sobre o .env.local).
    env: {
      WHATSAPP_LOJA: "5511900000000",
      LIMITE_FORMULARIOS_POR_IP_HORA: "1000",
      TURNSTILE_SECRET_KEY: "",
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: "",
    },
  },
});
