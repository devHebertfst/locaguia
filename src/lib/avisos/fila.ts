import "server-only";
import { and, asc, eq, lt, notInArray, sql } from "drizzle-orm";
import { getDb, type Transacao } from "@/db";
import { notificacoes } from "@/db/schema";
import { MAX_TENTATIVAS_AVISO, statusDepoisDaFalha, type NovoAviso } from "./templates";
import { avisosConfigurados, enviarTemplate } from "./whatsapp";

// Grava os avisos na fila, na mesma transação da mudança que os causou. O
// envio vem depois (processarPendentes), pela resposta ou pelo Cron.
export async function enfileirarAvisos(tx: Transacao, avisos: NovoAviso[]): Promise<number> {
  if (avisos.length === 0) return 0;
  await tx.insert(notificacoes).values(avisos);
  return avisos.length;
}

export type ResumoEnvio = { enviados: number; falhas: number; configurado: boolean };

// Envia os avisos pendentes, os mais antigos primeiro. Sem credenciais da
// Cloud API, não faz nada: as linhas ficam pendentes até a loja configurar.
// Cada aviso é enviado com a linha travada (for update skip locked), então o
// Cron e um envio disparado pelo painel ao mesmo tempo não mandam em dobro.
export async function processarPendentes(limite = 50): Promise<ResumoEnvio> {
  const resumo: ResumoEnvio = { enviados: 0, falhas: 0, configurado: avisosConfigurados() };
  if (!resumo.configurado) return resumo;

  const tentados: string[] = [];
  const db = getDb();
  while (tentados.length < limite) {
    const continuar = await db.transaction(async (tx) => {
      const [aviso] = await tx
        .select()
        .from(notificacoes)
        .where(
          and(
            eq(notificacoes.status, "pendente"),
            lt(notificacoes.tentativas, MAX_TENTATIVAS_AVISO),
            tentados.length ? notInArray(notificacoes.id, tentados) : undefined,
          ),
        )
        .orderBy(asc(notificacoes.criadoEm))
        .limit(1)
        .for("update", { skipLocked: true });
      if (!aviso) return false;
      tentados.push(aviso.id);

      const resultado = await enviarTemplate(aviso.telefone, aviso.template, aviso.parametros);
      const tentativas = aviso.tentativas + 1;
      if (resultado.ok) {
        resumo.enviados++;
        await tx
          .update(notificacoes)
          .set({ status: "enviada", tentativas, erro: null, enviadaEm: sql`now()` })
          .where(eq(notificacoes.id, aviso.id));
      } else {
        resumo.falhas++;
        console.error("[avisos] falha ao enviar", aviso.id, resultado.erro);
        await tx
          .update(notificacoes)
          .set({ status: statusDepoisDaFalha(tentativas, resultado.definitivo), tentativas, erro: resultado.erro })
          .where(eq(notificacoes.id, aviso.id));
      }
      return true;
    });
    if (!continuar) break;
  }
  return resumo;
}
