import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const obrigatorias = {
  DATABASE_URL: "postgresql://u:s@localhost:5432/db",
  NEXT_PUBLIC_SUPABASE_URL: "https://exemplo.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon",
  SUPABASE_SERVICE_ROLE_KEY: "service",
};

describe("env", () => {
  const original = { ...process.env };

  beforeEach(() => vi.resetModules());
  afterEach(() => {
    process.env = { ...original };
  });

  it("aplica os padrões e trata opcionais vazias como ausentes", async () => {
    process.env = { ...original, ...obrigatorias, WHATSAPP_LOJA: "" };
    const { env } = await import("@/lib/env");
    expect(env.LIMITE_ASSISTENTE_DIARIO).toBe(500);
    expect(env.SUPABASE_BUCKET_FOTOS).toBe("equipamentos");
    expect(env.WHATSAPP_LOJA).toBeUndefined();
  });

  it("lista as variáveis obrigatórias que faltam só quando usada", async () => {
    process.env = { ...original, DATABASE_URL: "" };
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    const { env } = await import("@/lib/env");
    expect(() => env.DATABASE_URL).toThrow(/DATABASE_URL.*NEXT_PUBLIC_SUPABASE_URL/);
  });
});
