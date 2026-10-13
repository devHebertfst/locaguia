CREATE TYPE "public"."evento_notificacao" AS ENUM('equipamento_chegou', 'equipamento_disponivel', 'equipamento_desativado');--> statement-breakpoint
CREATE TYPE "public"."papel_usuario" AS ENUM('admin', 'funcionario');--> statement-breakpoint
CREATE TYPE "public"."status_notificacao" AS ENUM('pendente', 'enviada', 'falhou');--> statement-breakpoint
CREATE TYPE "public"."status_solicitacao" AS ENUM('nova', 'em_atendimento', 'fechada', 'perdida');--> statement-breakpoint
CREATE TYPE "public"."status_sugestao" AS ENUM('pendente', 'atendida', 'descartada');--> statement-breakpoint
CREATE TYPE "public"."tipo_sugestao" AS ENUM('novo_equipamento', 'aguardar_disponibilidade');--> statement-breakpoint
CREATE TABLE "equipamento_fotos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"equipamento_id" uuid NOT NULL,
	"storage_path" text NOT NULL,
	"ordem" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "equipamento_fotos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "equipamentos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"descricao" text DEFAULT '' NOT NULL,
	"categoria" text NOT NULL,
	"disponivel" boolean DEFAULT true NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "equipamentos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "limites_uso" (
	"chave" text NOT NULL,
	"janela_inicio" timestamp with time zone NOT NULL,
	"contador" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "limites_uso_chave_janela_inicio_pk" PRIMARY KEY("chave","janela_inicio")
);
--> statement-breakpoint
ALTER TABLE "limites_uso" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "notificacoes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"telefone" text NOT NULL,
	"evento" "evento_notificacao" NOT NULL,
	"template" text NOT NULL,
	"parametros" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"equipamento_id" uuid,
	"sugestao_id" uuid,
	"solicitacao_id" uuid,
	"status" "status_notificacao" DEFAULT 'pendente' NOT NULL,
	"tentativas" integer DEFAULT 0 NOT NULL,
	"erro" text,
	"enviada_em" timestamp with time zone,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notificacoes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "solicitacao_equipamentos" (
	"solicitacao_id" uuid NOT NULL,
	"equipamento_id" uuid NOT NULL,
	CONSTRAINT "solicitacao_equipamentos_solicitacao_id_equipamento_id_pk" PRIMARY KEY("solicitacao_id","equipamento_id")
);
--> statement-breakpoint
ALTER TABLE "solicitacao_equipamentos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "solicitacoes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome_cliente" text NOT NULL,
	"telefone" text NOT NULL,
	"servico" text NOT NULL,
	"data_inicio" date NOT NULL,
	"data_fim" date NOT NULL,
	"materiais_sugeridos" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"aceita_whatsapp" boolean DEFAULT false NOT NULL,
	"status" "status_solicitacao" DEFAULT 'nova' NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "solicitacoes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "sugestoes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tipo" "tipo_sugestao" NOT NULL,
	"equipamento_id" uuid,
	"nome_equipamento" text NOT NULL,
	"motivo" text NOT NULL,
	"nome_cliente" text NOT NULL,
	"telefone" text NOT NULL,
	"quer_aviso" boolean DEFAULT false NOT NULL,
	"status" "status_sugestao" DEFAULT 'pendente' NOT NULL,
	"equipamento_atendido_id" uuid,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sugestoes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "usuarios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth_user_id" uuid,
	"nome" text NOT NULL,
	"email" text NOT NULL,
	"papel" "papel_usuario" DEFAULT 'funcionario' NOT NULL,
	"autorizado" boolean DEFAULT true NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "usuarios_auth_user_id_unique" UNIQUE("auth_user_id")
);
--> statement-breakpoint
ALTER TABLE "usuarios" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "equipamento_fotos" ADD CONSTRAINT "equipamento_fotos_equipamento_id_equipamentos_id_fk" FOREIGN KEY ("equipamento_id") REFERENCES "public"."equipamentos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notificacoes" ADD CONSTRAINT "notificacoes_equipamento_id_equipamentos_id_fk" FOREIGN KEY ("equipamento_id") REFERENCES "public"."equipamentos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notificacoes" ADD CONSTRAINT "notificacoes_sugestao_id_sugestoes_id_fk" FOREIGN KEY ("sugestao_id") REFERENCES "public"."sugestoes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notificacoes" ADD CONSTRAINT "notificacoes_solicitacao_id_solicitacoes_id_fk" FOREIGN KEY ("solicitacao_id") REFERENCES "public"."solicitacoes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solicitacao_equipamentos" ADD CONSTRAINT "solicitacao_equipamentos_solicitacao_id_solicitacoes_id_fk" FOREIGN KEY ("solicitacao_id") REFERENCES "public"."solicitacoes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solicitacao_equipamentos" ADD CONSTRAINT "solicitacao_equipamentos_equipamento_id_equipamentos_id_fk" FOREIGN KEY ("equipamento_id") REFERENCES "public"."equipamentos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sugestoes" ADD CONSTRAINT "sugestoes_equipamento_id_equipamentos_id_fk" FOREIGN KEY ("equipamento_id") REFERENCES "public"."equipamentos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sugestoes" ADD CONSTRAINT "sugestoes_equipamento_atendido_id_equipamentos_id_fk" FOREIGN KEY ("equipamento_atendido_id") REFERENCES "public"."equipamentos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "equipamento_fotos_equipamento_idx" ON "equipamento_fotos" USING btree ("equipamento_id");--> statement-breakpoint
CREATE INDEX "equipamentos_categoria_idx" ON "equipamentos" USING btree ("categoria");--> statement-breakpoint
CREATE INDEX "notificacoes_status_idx" ON "notificacoes" USING btree ("status");--> statement-breakpoint
CREATE INDEX "solicitacao_equipamentos_equipamento_idx" ON "solicitacao_equipamentos" USING btree ("equipamento_id");--> statement-breakpoint
CREATE INDEX "solicitacoes_status_idx" ON "solicitacoes" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sugestoes_status_idx" ON "sugestoes" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sugestoes_equipamento_idx" ON "sugestoes" USING btree ("equipamento_id");--> statement-breakpoint
CREATE UNIQUE INDEX "usuarios_email_idx" ON "usuarios" USING btree ("email");