"use server";

import { randomUUID } from "node:crypto";
import { and, asc, count, eq, max } from "drizzle-orm";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { getDb, type Transacao } from "@/db";
import { equipamentoFotos, equipamentos } from "@/db/schema";
import { exigirUsuario } from "@/lib/auth/sessao";
import { processarPendentes } from "@/lib/avisos/fila";
import { aplicarEfeitosDaMudanca } from "@/lib/avisos/gatilhos";
import {
  caminhoFotoValido,
  errosEquipamento,
  esquemaEquipamento,
  lerFormularioEquipamento,
  LIMITES_EQUIPAMENTO,
  UUID,
  type CampoEquipamento,
} from "@/lib/equipamentos/validacao";
import { clienteStorage } from "@/lib/supabase/admin";

// Toda ação confere o usuário no banco (exigirUsuario): o proxy só faz uma
// checagem otimista. Admin e funcionário podem gerenciar equipamentos.

export type EstadoEquipamento =
  | { status: "inicial" }
  | { status: "erro"; mensagem?: string; erros?: Partial<Record<CampoEquipamento, string>> }
  | { status: "ok"; mensagem: string };

export async function salvarEquipamento(
  _anterior: EstadoEquipamento,
  formData: FormData,
): Promise<EstadoEquipamento> {
  await exigirUsuario();
  const id = String(formData.get("id") ?? "");
  if (id && !UUID.test(id)) return { status: "erro", mensagem: "Equipamento inválido." };

  const validacao = esquemaEquipamento.safeParse(lerFormularioEquipamento(formData));
  if (!validacao.success) {
    return {
      status: "erro",
      mensagem: "Confira os campos destacados.",
      erros: errosEquipamento(validacao.error),
    };
  }

  const db = getDb();
  if (!id) {
    const [novo] = await db.insert(equipamentos).values(validacao.data).returning({ id: equipamentos.id });
    // Depois de criar, a mesma tela vira a edição, onde entram as fotos.
    redirect(`/admin/equipamentos/${novo.id}?criado=1`);
  }

  const resultado = await db.transaction((tx) => atualizarComAvisos(tx, id, validacao.data));
  if (!resultado) return { status: "erro", mensagem: "Este equipamento não existe mais." };
  if (resultado.avisos > 0) after(() => processarPendentes());
  refresh();
  return { status: "ok", mensagem: "Alterações salvas." };
}

// Atualiza o equipamento com a linha travada e põe na fila os avisos que a
// mudança dispara (voltou a ficar disponível, foi desativado). Null se o
// equipamento não existe.
async function atualizarComAvisos(
  tx: Transacao,
  id: string,
  mudanca: Partial<{ nome: string; categoria: string; descricao: string; disponivel: boolean; ativo: boolean }>,
): Promise<{ avisos: number } | null> {
  const [antes] = await tx
    .select({ id: equipamentos.id, nome: equipamentos.nome, ativo: equipamentos.ativo, disponivel: equipamentos.disponivel })
    .from(equipamentos)
    .where(eq(equipamentos.id, id))
    .for("update");
  if (!antes) return null;
  const [depois] = await tx
    .update(equipamentos)
    .set(mudanca)
    .where(eq(equipamentos.id, id))
    .returning({ id: equipamentos.id, nome: equipamentos.nome, ativo: equipamentos.ativo, disponivel: equipamentos.disponivel });
  return { avisos: await aplicarEfeitosDaMudanca(tx, antes, depois) };
}

// Disponível/indisponível e ativo/desativado mudam por botões, sem passar
// pelo formulário inteiro. Nada é apagado: desativar só tira do catálogo.
// Voltar a ficar disponível avisa quem pediu; desativar avisa os pedidos abertos.
export async function alterarSituacao(formData: FormData) {
  await exigirUsuario();
  const id = String(formData.get("id") ?? "");
  const campo = formData.get("campo");
  const valor = formData.get("valor") === "true";
  if (!UUID.test(id) || (campo !== "disponivel" && campo !== "ativo")) return;

  const resultado = await getDb().transaction((tx) =>
    atualizarComAvisos(tx, id, campo === "ativo" ? { ativo: valor } : { disponivel: valor }),
  );
  if (resultado && resultado.avisos > 0) after(() => processarPendentes());
  refresh();
}

export type EnvioPreparado =
  | { ok: true; caminho: string; token: string }
  | { ok: false; mensagem: string };

// Passo 1 do envio de foto: o servidor gera um link assinado e o navegador
// envia o arquivo direto ao Storage (fotos de celular passam do limite de
// tamanho de uma Server Action).
export async function prepararEnvioFoto(equipamentoId: string, formato: "webp" | "jpg"): Promise<EnvioPreparado> {
  await exigirUsuario();
  if (!UUID.test(equipamentoId) || (formato !== "webp" && formato !== "jpg")) {
    return { ok: false, mensagem: "Equipamento inválido." };
  }
  const storage = clienteStorage();
  if (!storage) return { ok: false, mensagem: "O envio de fotos não está configurado no servidor." };

  const [{ total }] = await getDb()
    .select({ total: count() })
    .from(equipamentoFotos)
    .where(eq(equipamentoFotos.equipamentoId, equipamentoId));
  if (total >= LIMITES_EQUIPAMENTO.fotos) {
    return { ok: false, mensagem: `Cada equipamento pode ter até ${LIMITES_EQUIPAMENTO.fotos} fotos.` };
  }

  const caminho = `${equipamentoId}/${randomUUID()}.${formato}`;
  const { data, error } = await storage.createSignedUploadUrl(caminho);
  if (error || !data) {
    console.error("Falha ao preparar envio de foto", error);
    return { ok: false, mensagem: "Não foi possível preparar o envio. Tente de novo." };
  }
  return { ok: true, caminho, token: data.token };
}

// Passo 2: depois do envio, registra a foto no fim da galeria.
export async function registrarFoto(equipamentoId: string, caminho: string): Promise<{ ok: boolean; mensagem?: string }> {
  await exigirUsuario();
  if (!caminhoFotoValido(equipamentoId, caminho)) return { ok: false, mensagem: "Foto inválida." };
  const storage = clienteStorage();
  if (!storage) return { ok: false, mensagem: "O envio de fotos não está configurado no servidor." };

  const { data: existe } = await storage.exists(caminho);
  if (!existe) return { ok: false, mensagem: "A foto não chegou ao servidor. Tente enviar de novo." };

  const db = getDb();
  const [equipamento] = await db.select({ id: equipamentos.id }).from(equipamentos).where(eq(equipamentos.id, equipamentoId));
  if (!equipamento) {
    await storage.remove([caminho]);
    return { ok: false, mensagem: "Este equipamento não existe mais." };
  }
  const [{ ultima }] = await db
    .select({ ultima: max(equipamentoFotos.ordem) })
    .from(equipamentoFotos)
    .where(eq(equipamentoFotos.equipamentoId, equipamentoId));
  await db.insert(equipamentoFotos).values({ equipamentoId, storagePath: caminho, ordem: (ultima ?? -1) + 1 });
  refresh();
  return { ok: true };
}

export async function removerFoto(formData: FormData) {
  await exigirUsuario();
  const fotoId = String(formData.get("fotoId") ?? "");
  if (!UUID.test(fotoId)) return;
  const [foto] = await getDb()
    .delete(equipamentoFotos)
    .where(eq(equipamentoFotos.id, fotoId))
    .returning({ caminho: equipamentoFotos.storagePath });
  if (foto) {
    const { error } = (await clienteStorage()?.remove([foto.caminho])) ?? {};
    // O registro já saiu: um arquivo órfão no Storage não aparece em lugar nenhum.
    if (error) console.error("Falha ao apagar arquivo de foto", error);
  }
  refresh();
}

// Troca a foto de lugar com a vizinha. A primeira é a capa no catálogo.
export async function moverFoto(formData: FormData) {
  await exigirUsuario();
  const fotoId = String(formData.get("fotoId") ?? "");
  const direcao = formData.get("direcao") === "antes" ? -1 : 1;
  if (!UUID.test(fotoId)) return;

  const db = getDb();
  await db.transaction(async (tx) => {
    const [foto] = await tx
      .select({ equipamentoId: equipamentoFotos.equipamentoId })
      .from(equipamentoFotos)
      .where(eq(equipamentoFotos.id, fotoId));
    if (!foto) return;
    const fotos = await tx
      .select({ id: equipamentoFotos.id })
      .from(equipamentoFotos)
      .where(eq(equipamentoFotos.equipamentoId, foto.equipamentoId))
      .orderBy(asc(equipamentoFotos.ordem), asc(equipamentoFotos.id));
    const i = fotos.findIndex((f) => f.id === fotoId);
    const j = i + direcao;
    if (i < 0 || j < 0 || j >= fotos.length) return;
    [fotos[i], fotos[j]] = [fotos[j], fotos[i]];
    // Regrava a ordem inteira (0, 1, 2…): corrige buracos e empates antigos.
    for (const [ordem, { id }] of fotos.entries()) {
      await tx
        .update(equipamentoFotos)
        .set({ ordem })
        .where(and(eq(equipamentoFotos.id, id), eq(equipamentoFotos.equipamentoId, foto.equipamentoId)));
    }
  });
  refresh();
}
