import { describe, expect, it } from "vitest";
import { destinoSeguro, lerErroLogin, podeVincular, temPapel } from "@/lib/auth/regras";

const AUTH_A = "11111111-1111-4111-8111-111111111111";
const AUTH_B = "22222222-2222-4222-8222-222222222222";

describe("destinoSeguro", () => {
  it.each(["/admin", "/admin/equipamentos", "/admin/solicitacoes?status=nova", "/admin#topo"])(
    "aceita %s",
    (caminho) => {
      expect(destinoSeguro(caminho)).toBe(caminho);
    },
  );

  it.each([
    undefined,
    null,
    ["/admin"],
    "",
    "/",
    "/orcamento",
    "/administrador",
    "https://exemplo.com/admin",
    "//exemplo.com/admin",
    "/admin//exemplo.com",
    "/admin/\\exemplo.com",
  ])("troca %j por /admin", (valor) => {
    expect(destinoSeguro(valor)).toBe("/admin");
  });
});

describe("lerErroLogin", () => {
  it("só aceita códigos conhecidos", () => {
    expect(lerErroLogin("nao_autorizado")).toBe("nao_autorizado");
    expect(lerErroLogin("falha")).toBe("falha");
    expect(lerErroLogin("<script>")).toBeUndefined();
    expect(lerErroLogin(["falha"])).toBeUndefined();
  });
});

describe("temPapel", () => {
  it("sem restrição, qualquer papel passa", () => {
    expect(temPapel("funcionario")).toBe(true);
  });

  it("confere a lista de papéis", () => {
    expect(temPapel("admin", ["admin"])).toBe(true);
    expect(temPapel("funcionario", ["admin"])).toBe(false);
  });
});

describe("podeVincular", () => {
  it("recusa e-mail sem cadastro", () => {
    expect(podeVincular(undefined, AUTH_A)).toBe(false);
  });

  it("recusa cadastro não autorizado", () => {
    expect(podeVincular({ authUserId: null, autorizado: false }, AUTH_A)).toBe(false);
  });

  it("aceita o primeiro login e os seguintes da mesma conta", () => {
    expect(podeVincular({ authUserId: null, autorizado: true }, AUTH_A)).toBe(true);
    expect(podeVincular({ authUserId: AUTH_A, autorizado: true }, AUTH_A)).toBe(true);
  });

  it("recusa outra conta para um cadastro já vinculado", () => {
    expect(podeVincular({ authUserId: AUTH_A, autorizado: true }, AUTH_B)).toBe(false);
  });
});
