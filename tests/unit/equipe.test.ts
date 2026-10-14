import { describe, expect, it } from "vitest";
import { bloqueioDaMudanca, errosMembro, esquemaMembro, lerFormularioMembro } from "@/lib/equipe/regras";

const EU = { id: "eu" };
const admin = (id: string, autorizado = true) => ({ id, papel: "admin" as const, autorizado });
const funcionario = (id: string, autorizado = true) => ({ id, papel: "funcionario" as const, autorizado });

describe("bloqueioDaMudanca", () => {
  it("o admin não bloqueia nem rebaixa a si mesmo", () => {
    expect(bloqueioDaMudanca(EU, admin("eu"), { autorizado: false }, 3)).toBe("Você não pode bloquear a sua própria conta.");
    expect(bloqueioDaMudanca(EU, admin("eu"), { papel: "funcionario" }, 3)).toBe(
      "Você não pode tirar o seu próprio acesso de administrador.",
    );
  });

  it("não deixa a loja sem admin ativo", () => {
    expect(bloqueioDaMudanca(EU, admin("outro"), { autorizado: false }, 1)).toBe("A loja precisa de pelo menos um administrador ativo.");
    expect(bloqueioDaMudanca(EU, admin("outro"), { papel: "funcionario" }, 1)).not.toBeNull();
  });

  it("com outro admin ativo, pode bloquear ou rebaixar", () => {
    expect(bloqueioDaMudanca(EU, admin("outro"), { autorizado: false }, 2)).toBeNull();
    expect(bloqueioDaMudanca(EU, admin("outro"), { papel: "funcionario" }, 2)).toBeNull();
  });

  it("funcionários e admins bloqueados podem mudar à vontade", () => {
    expect(bloqueioDaMudanca(EU, funcionario("f"), { autorizado: false }, 1)).toBeNull();
    expect(bloqueioDaMudanca(EU, funcionario("f"), { papel: "admin" }, 1)).toBeNull();
    expect(bloqueioDaMudanca(EU, admin("b", false), { autorizado: true }, 1)).toBeNull();
    expect(bloqueioDaMudanca(EU, admin("b", false), { papel: "funcionario" }, 1)).toBeNull();
  });
});

describe("esquemaMembro", () => {
  function form(campos: Record<string, string>) {
    const fd = new FormData();
    for (const [k, v] of Object.entries(campos)) fd.set(k, v);
    return lerFormularioMembro(fd);
  }

  it("guarda o e-mail em minúsculas e sem espaços", () => {
    expect(esquemaMembro.parse(form({ nome: " José  Lima ", email: " Jose.Lima@Gmail.com ", papel: "funcionario" }))).toEqual({
      nome: "José Lima",
      email: "jose.lima@gmail.com",
      papel: "funcionario",
    });
  });

  it("recusa e-mail inválido e papel desconhecido", () => {
    const r = esquemaMembro.safeParse(form({ nome: "Ana", email: "ana@", papel: "dono" }));
    expect(errosMembro(r.error!)).toEqual({
      email: "Informe um e-mail válido, o mesmo da conta Google.",
      papel: "Escolha o papel.",
    });
  });

  it("pede o e-mail quando vazio", () => {
    const r = esquemaMembro.safeParse(form({ nome: "Ana", email: "  ", papel: "admin" }));
    expect(errosMembro(r.error!).email).toBe("Informe o e-mail.");
  });
});
