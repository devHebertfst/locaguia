import { describe, expect, it } from "vitest";
import { cronAutorizado } from "@/lib/avisos/cron";
import {
  avisoEquipamentoChegou,
  avisoEquipamentoDesativado,
  avisoEquipamentoDisponivel,
  corpoTemplate,
  efeitosDaMudanca,
  interpretarErroCloud,
  MAX_TENTATIVAS_AVISO,
  statusDepoisDaFalha,
} from "@/lib/avisos/templates";

const PEDIDO = "a1b2c3d4-1111-4111-8111-111111111111";
const EQUIP = { id: "b2c3d4e5-2222-4222-8222-222222222222", nome: "Betoneira 400 litros" };
const CLIENTE = { id: "c3d4e5f6-3333-4333-8333-333333333333", nomeCliente: "Maria da Silva", telefone: "+5511912345678" };

describe("efeitosDaMudanca", () => {
  const s = (ativo: boolean, disponivel: boolean) => ({ ativo, disponivel });

  it("voltar a ficar disponível avisa quem esperava", () => {
    expect(efeitosDaMudanca(s(true, false), s(true, true))).toEqual({ voltou: true, desativado: false });
  });

  it("reativar um equipamento disponível também conta como voltou", () => {
    expect(efeitosDaMudanca(s(false, true), s(true, true)).voltou).toBe(true);
  });

  it("reativar ainda indisponível não avisa", () => {
    expect(efeitosDaMudanca(s(false, false), s(true, false)).voltou).toBe(false);
  });

  it("desativar avisa os pedidos abertos", () => {
    expect(efeitosDaMudanca(s(true, true), s(false, true))).toEqual({ voltou: false, desativado: true });
    expect(efeitosDaMudanca(s(true, false), s(false, false)).desativado).toBe(true);
  });

  it("salvar sem mudar a situação não dispara nada", () => {
    expect(efeitosDaMudanca(s(true, true), s(true, true))).toEqual({ voltou: false, desativado: false });
    expect(efeitosDaMudanca(s(false, false), s(false, false))).toEqual({ voltou: false, desativado: false });
  });
});

describe("avisos", () => {
  it("cada evento usa o template de mesmo nome e os parâmetros na ordem combinada", () => {
    expect(avisoEquipamentoChegou(CLIENTE, EQUIP)).toEqual({
      telefone: "+5511912345678",
      evento: "equipamento_chegou",
      template: "equipamento_chegou",
      parametros: ["Maria", "Betoneira 400 litros"],
      equipamentoId: EQUIP.id,
      sugestaoId: CLIENTE.id,
    });
    expect(avisoEquipamentoDisponivel(CLIENTE, EQUIP).template).toBe("equipamento_disponivel");
    expect(avisoEquipamentoDesativado({ ...CLIENTE, id: PEDIDO }, EQUIP)).toMatchObject({
      template: "equipamento_desativado",
      parametros: ["Maria", "Betoneira 400 litros", "A1B2C3D4"],
      solicitacaoId: PEDIDO,
    });
  });

  it("monta o corpo da Cloud API com o número só em dígitos", () => {
    expect(corpoTemplate("+5511912345678", "equipamento_chegou", ["Maria", "Betoneira"], "pt_BR")).toEqual({
      messaging_product: "whatsapp",
      to: "5511912345678",
      type: "template",
      template: {
        name: "equipamento_chegou",
        language: { code: "pt_BR" },
        components: [{ type: "body", parameters: [{ type: "text", text: "Maria" }, { type: "text", text: "Betoneira" }] }],
      },
    });
  });
});

describe("falhas de envio", () => {
  it("número sem WhatsApp e template inexistente não são tentados de novo", () => {
    expect(interpretarErroCloud(400, { error: { code: 131026, message: "Message undeliverable" } })).toEqual({
      ok: false,
      erro: "400 (131026): Message undeliverable",
      definitivo: true,
    });
    expect(interpretarErroCloud(404, { error: { code: 132001, message: "Template name does not exist" } }).ok).toBe(false);
    expect((interpretarErroCloud(404, { error: { code: 132001 } }) as { definitivo: boolean }).definitivo).toBe(true);
  });

  it("token inválido, limite e erro sem corpo ficam para o Cron", () => {
    expect(interpretarErroCloud(401, { error: { code: 190, message: "token" } })).toMatchObject({ definitivo: false });
    expect(interpretarErroCloud(429, { error: { code: 130429 } })).toMatchObject({ definitivo: false });
    expect(interpretarErroCloud(500, null)).toEqual({ ok: false, erro: "500: erro desconhecido", definitivo: false });
  });

  it("desiste depois do máximo de tentativas", () => {
    expect(statusDepoisDaFalha(1, false)).toBe("pendente");
    expect(statusDepoisDaFalha(MAX_TENTATIVAS_AVISO, false)).toBe("falhou");
    expect(statusDepoisDaFalha(1, true)).toBe("falhou");
  });
});

describe("cronAutorizado", () => {
  it("só aceita o Bearer com o segredo configurado", () => {
    expect(cronAutorizado("Bearer segredo-123", "segredo-123")).toBe(true);
    expect(cronAutorizado("Bearer segredo-124", "segredo-123")).toBe(false);
    expect(cronAutorizado("segredo-123", "segredo-123")).toBe(false);
    expect(cronAutorizado(null, "segredo-123")).toBe(false);
  });

  it("sem CRON_SECRET a rota fica fechada", () => {
    expect(cronAutorizado("Bearer ", undefined)).toBe(false);
    expect(cronAutorizado("Bearer undefined", undefined)).toBe(false);
  });
});
