import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

// Todas as tabelas têm RLS ligado e nenhuma policy: o navegador não acessa
// nada direto pelo Supabase. Toda leitura e escrita passa pelo servidor, que
// conecta com o papel dono do banco.

const criadoEm = () =>
  timestamp("criado_em", { withTimezone: true }).notNull().defaultNow();
const atualizadoEm = () =>
  timestamp("atualizado_em", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());

export const papelUsuario = pgEnum("papel_usuario", ["admin", "funcionario"]);

export const statusSolicitacao = pgEnum("status_solicitacao", [
  "nova",
  "em_atendimento",
  "fechada",
  "perdida",
]);

export const tipoSugestao = pgEnum("tipo_sugestao", [
  "novo_equipamento",
  "aguardar_disponibilidade",
]);

export const statusSugestao = pgEnum("status_sugestao", [
  "pendente",
  "atendida",
  "descartada",
]);

export const eventoNotificacao = pgEnum("evento_notificacao", [
  "equipamento_chegou",
  "equipamento_disponivel",
  "equipamento_desativado",
]);

export const statusNotificacao = pgEnum("status_notificacao", [
  "pendente",
  "enviada",
  "falhou",
]);

export const usuarios = pgTable(
  "usuarios",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // id do usuário no Supabase Auth (auth.users.id). Preenchido no primeiro
    // login; o admin cadastra o funcionário pelo e-mail antes disso.
    authUserId: uuid("auth_user_id").unique(),
    nome: text("nome").notNull(),
    email: text("email").notNull(),
    papel: papelUsuario("papel").notNull().default("funcionario"),
    autorizado: boolean("autorizado").notNull().default(true),
    criadoEm: criadoEm(),
  },
  (t) => [uniqueIndex("usuarios_email_idx").on(t.email)],
).enableRLS();

export const equipamentos = pgTable(
  "equipamentos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    nome: text("nome").notNull(),
    descricao: text("descricao").notNull().default(""),
    categoria: text("categoria").notNull(),
    // indisponível: aparece no catálogo marcado; desativado (ativo = false):
    // some do catálogo, mas continua nas solicitações antigas.
    disponivel: boolean("disponivel").notNull().default(true),
    ativo: boolean("ativo").notNull().default(true),
    criadoEm: criadoEm(),
    atualizadoEm: atualizadoEm(),
  },
  (t) => [index("equipamentos_categoria_idx").on(t.categoria)],
).enableRLS();

export const equipamentoFotos = pgTable(
  "equipamento_fotos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    equipamentoId: uuid("equipamento_id")
      .notNull()
      .references(() => equipamentos.id, { onDelete: "cascade" }),
    storagePath: text("storage_path").notNull(),
    ordem: integer("ordem").notNull().default(0),
  },
  (t) => [index("equipamento_fotos_equipamento_idx").on(t.equipamentoId)],
).enableRLS();

export const solicitacoes = pgTable(
  "solicitacoes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    nomeCliente: text("nome_cliente").notNull(),
    // E.164: +55DD9XXXXXXXX
    telefone: text("telefone").notNull(),
    servico: text("servico").notNull(),
    dataInicio: date("data_inicio").notNull(),
    dataFim: date("data_fim").notNull(),
    materiaisSugeridos: jsonb("materiais_sugeridos")
      .$type<string[]>()
      .notNull()
      .default([]),
    aceitaWhatsapp: boolean("aceita_whatsapp").notNull().default(false),
    status: statusSolicitacao("status").notNull().default("nova"),
    criadoEm: criadoEm(),
    atualizadoEm: atualizadoEm(),
  },
  (t) => [index("solicitacoes_status_idx").on(t.status)],
).enableRLS();

export const solicitacaoEquipamentos = pgTable(
  "solicitacao_equipamentos",
  {
    solicitacaoId: uuid("solicitacao_id")
      .notNull()
      .references(() => solicitacoes.id, { onDelete: "cascade" }),
    equipamentoId: uuid("equipamento_id")
      .notNull()
      .references(() => equipamentos.id),
  },
  (t) => [
    primaryKey({ columns: [t.solicitacaoId, t.equipamentoId] }),
    index("solicitacao_equipamentos_equipamento_idx").on(t.equipamentoId),
  ],
).enableRLS();

export const sugestoes = pgTable(
  "sugestoes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tipo: tipoSugestao("tipo").notNull(),
    // preenchido em aguardar_disponibilidade; nulo em novo_equipamento
    equipamentoId: uuid("equipamento_id").references(() => equipamentos.id),
    nomeEquipamento: text("nome_equipamento").notNull(),
    motivo: text("motivo").notNull(),
    nomeCliente: text("nome_cliente").notNull(),
    telefone: text("telefone").notNull(),
    querAviso: boolean("quer_aviso").notNull().default(false),
    status: statusSugestao("status").notNull().default("pendente"),
    // equipamento cadastrado que atendeu a sugestão (gatilho "chegou")
    equipamentoAtendidoId: uuid("equipamento_atendido_id").references(
      () => equipamentos.id,
    ),
    criadoEm: criadoEm(),
  },
  (t) => [
    index("sugestoes_status_idx").on(t.status),
    index("sugestoes_equipamento_idx").on(t.equipamentoId),
  ],
).enableRLS();

// Fila de avisos ao cliente pela WhatsApp Cloud API.
export const notificacoes = pgTable(
  "notificacoes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    telefone: text("telefone").notNull(),
    evento: eventoNotificacao("evento").notNull(),
    template: text("template").notNull(),
    parametros: jsonb("parametros").$type<string[]>().notNull().default([]),
    equipamentoId: uuid("equipamento_id").references(() => equipamentos.id),
    sugestaoId: uuid("sugestao_id").references(() => sugestoes.id),
    solicitacaoId: uuid("solicitacao_id").references(() => solicitacoes.id),
    status: statusNotificacao("status").notNull().default("pendente"),
    tentativas: integer("tentativas").notNull().default(0),
    erro: text("erro"),
    enviadaEm: timestamp("enviada_em", { withTimezone: true }),
    criadoEm: criadoEm(),
  },
  (t) => [index("notificacoes_status_idx").on(t.status)],
).enableRLS();

// Contadores por janela de tempo, para limitar uso por IP e o teto diário do
// assistente sem depender de outro serviço.
export const limitesUso = pgTable(
  "limites_uso",
  {
    chave: text("chave").notNull(),
    janelaInicio: timestamp("janela_inicio", { withTimezone: true }).notNull(),
    contador: integer("contador").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.chave, t.janelaInicio] })],
).enableRLS();
