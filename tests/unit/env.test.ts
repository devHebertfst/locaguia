import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const obrigatorias = {
  DATABASE_URL: "postgresql://u:s@localhost:5432/db",
  NEXT_PUBLIC_SUPABASE_URL: "https://exemplo.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable",
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
    expect(env.supabaseChavePublica).toBe("publishable");
  });

  it("aceita a chave anon no lugar da publishable", async () => {
    process.env = { ...original, ...obrigatorias, NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon" };
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    const { env } = await import("@/lib/env");
    expect(env.supabaseChavePublica).toBe("anon");
  });

  it("exige uma das chaves públicas do Supabase", async () => {
    process.env = { ...original, ...obrigatorias };
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const { env } = await import("@/lib/env");
    expect(() => env.DATABASE_URL).toThrow(/NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/);
  });

  it("lista as variáveis obrigatórias que faltam só quando usada", async () => {
    process.env = { ...original, DATABASE_URL: "" };
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    const { env } = await import("@/lib/env");
    expect(() => env.DATABASE_URL).toThrow(/DATABASE_URL.*NEXT_PUBLIC_SUPABASE_URL/);
  });
});
