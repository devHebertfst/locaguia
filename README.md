# LocaGuia

Site de uma locadora pequena de equipamentos de construção que vende principalmente pelo WhatsApp. O cliente vê o catálogo, descreve o serviço a um assistente com IA que recomenda equipamentos da própria loja e envia um pedido de orçamento, que chega à loja por e-mail e abre no WhatsApp. A equipe da loja usa um painel para cadastrar equipamentos, marcar disponibilidade e atender os pedidos.

O sistema atende uma única loja (não é multi-tenant). Todo o texto da interface é em português do Brasil.

## Funcionalidades

**Para o cliente (sem login)**

- Catálogo com busca sem acento e filtro por categoria; equipamentos indisponíveis aparecem marcados como indisponíveis.
- Página de cada equipamento com fotos e, se estiver indisponível, um formulário "avise-me quando estiver disponível".
- Assistente com IA (Gemini): o cliente descreve o serviço e recebe uma recomendação feita **só** com equipamentos ativos e disponíveis, mais uma lista de materiais complementares. Ele nunca fala de preço, não confirma reserva e não promete disponibilidade.
- Pedido de orçamento, que pode vir preenchido pela recomendação do assistente.
- Sugestão de equipamento que a loja ainda não tem.
- Avisos automáticos pelo WhatsApp, só com consentimento: equipamento sugerido chegou, equipamento voltou a ficar disponível ou equipamento de um pedido em aberto foi desativado.

**Para a equipe (login com Google)**

- Cadastro e edição de equipamentos, com envio de fotos redimensionadas no navegador.
- Atendimento dos pedidos de orçamento e das sugestões.
- Gestão da equipe (só `admin`): adicionar pessoas pelo e-mail do Google, trocar o papel e bloquear ou desbloquear.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, `cacheComponents`) com React 19 e TypeScript
- [Supabase](https://supabase.com): Postgres, Storage para as fotos e Auth com Google para a equipe
- [Drizzle ORM](https://orm.drizzle.team) para acesso ao banco e migrações
- Tailwind CSS 4 e componentes Base UI / shadcn
- three.js para a betoneira 3D da home
- Gemini (`@google/genai`) no assistente
- Integrações opcionais: Cloudflare Turnstile, Resend, WhatsApp Cloud API e Vercel Cron
- Vitest (unitários) e Playwright (e2e)

## Como rodar

### Pré-requisitos

- Node.js 22 ou mais recente
- Um projeto no Supabase

### Passo a passo

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Copie o arquivo de variáveis e preencha pelo menos o bloco **Obrigatórias** (banco e Supabase):

   ```bash
   cp .env.example .env.local
   ```

3. Aplique as migrações e, se quiser, cadastre equipamentos de exemplo:

   ```bash
   npm run db:migrate
   npm run db:seed    # não faz nada se já houver equipamentos
   ```

4. Suba o servidor de desenvolvimento e abra <http://localhost:3000>:

   ```bash
   npm run dev
   ```

### Login da equipe

1. No Supabase, ative o provedor **Google** em Authentication e inclua `<NEXT_PUBLIC_SITE_URL>/auth/callback` nas URLs de redirecionamento permitidas.
2. Cadastre o primeiro admin direto no banco, com o e-mail da conta Google:

   ```sql
   insert into usuarios (nome, email, papel) values ('Seu nome', 'voce@gmail.com', 'admin');
   ```

3. Entre por `/entrar`. No primeiro login a conta do Google é vinculada a essa linha. Os próximos membros da equipe são adicionados pelo próprio painel, em `/admin/equipe`.

Uma conta Google que não está em `usuarios` com `autorizado = true` é desconectada e só vê o catálogo público.

## Variáveis de ambiente

Todas estão documentadas em [`.env.example`](.env.example). Só o bloco do Supabase e do banco é obrigatório; o resto liga recursos opcionais e o app continua funcionando sem eles.

| Recurso | Variáveis | Sem elas |
| --- | --- | --- |
| Banco e Supabase | `DATABASE_URL`, `DATABASE_URL_DIRETA`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL` | O app não sobe |
| Envio de fotos | `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_BUCKET_FOTOS` | O painel não envia fotos |
| Assistente | `GEMINI_API_KEY`, `GEMINI_MODEL`, `GEMINI_MODEL_RESERVA` | O assistente fica indisponível |
| Anti-spam | `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | A verificação é pulada |
| WhatsApp da loja | `WHATSAPP_LOJA` | O pedido não abre o `wa.me` |
| E-mail para a loja | `RESEND_API_KEY`, `EMAIL_REMETENTE`, `EMAIL_DESTINO` | O pedido é salvo, sem e-mail |
| Avisos aos clientes | `WHATSAPP_CLOUD_TOKEN`, `WHATSAPP_CLOUD_PHONE_NUMBER_ID`, `WHATSAPP_TEMPLATE_IDIOMA`, `CRON_SECRET` | Os avisos ficam pendentes na fila |
| Limites de uso | `LIMITE_*` | Valores padrão |

Os avisos pelo WhatsApp usam templates que precisam estar aprovados na Meta: `equipamento_chegou`, `equipamento_disponivel` e `equipamento_desativado`. Os textos e parâmetros estão em [`src/lib/avisos/templates.ts`](src/lib/avisos/templates.ts).

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` / `npm start` | Build de produção e servidor |
| `npm run lint` | ESLint |
| `npm run typecheck` | Gera os tipos de rota do Next e roda o `tsc` |
| `npm test` | Testes unitários (Vitest, `tests/unit`) |
| `npm run test:e2e` | Testes e2e (Playwright, `tests/e2e`) com build de produção na porta 3100 |
| `npm run db:generate` | Gera uma migração em `drizzle/` a partir de `src/db/schema.ts` |
| `npm run db:migrate` | Aplica as migrações (usa `DATABASE_URL_DIRETA`) |
| `npm run db:studio` | Abre o Drizzle Studio |
| `npm run db:seed` | Cadastra equipamentos de exemplo |

## Testes

```bash
npm test                                   # todos os unitários
npx vitest run tests/unit/env.test.ts      # um arquivo
npx vitest run tests/unit/env.test.ts -t "nome do teste"
npm run test:e2e
```

Os testes e2e rodam contra o banco do `.env.local` e esperam os dados do seed. O [`playwright.config.ts`](playwright.config.ts) fixa algumas variáveis: desliga o Turnstile, aumenta os limites de uso e liga `ASSISTENTE_SIMULADO=1`, para que o assistente responda sem chamar o Gemini. Os testes que gravam dados os apagam ao final.

A CI (GitHub Actions) roda lint, typecheck, testes unitários e build, sem banco de dados.

## Estrutura

```
src/
  app/            rotas (App Router)
    catalogo/     catálogo público
    equipamentos/ detalhe do equipamento
    assistente/   assistente com IA
    orcamento/    pedido de orçamento
    sugerir/      sugestão de equipamento
    entrar/, auth/  login da equipe
    admin/        painel: equipamentos, pedidos, sugestões e equipe
    api/cron/     reenvio de avisos pendentes (Vercel Cron)
  components/     componentes de interface
  conteudo/       conteúdo editorial (avaliações)
  db/             schema e conexão do Drizzle
  lib/            regras de negócio e integrações
  proxy.ts        proxy (antigo middleware) do Next
drizzle/          migrações SQL
scripts/seed.ts   dados de exemplo
tests/            unit/ e e2e/
docs/spec.md      especificação original do produto
```

## Arquitetura em resumo

- **Acesso a dados só no servidor.** O servidor conecta ao Postgres como dono do banco; todas as tabelas têm RLS ligado sem políticas, então o navegador não lê nem grava nada direto. Cada Server Action e Route Handler confere o papel do usuário com `exigirUsuario()`.
- **O assistente é limitado no servidor**, não só no prompt: o modelo recebe apenas equipamentos ativos, com códigos curtos no lugar dos IDs, e qualquer equipamento devolvido que não esteja ativo e disponível é descartado.
- **Pedido de orçamento em três etapas:** salvar no banco (se falhar, o cliente vê um erro), enviar o e-mail pela Resend (falha só é registrada em log) e abrir o WhatsApp da loja.
- **Avisos por fila (outbox).** A tabela `notificacoes` recebe os avisos na mesma transação da mudança que os gera; eles são enviados logo após a resposta e reenviados pelo Vercel Cron, com trava por linha para nada sair duas vezes.
- **Equipamentos nunca são apagados.** `disponivel = false` continua no catálogo como indisponível; `ativo = false` some do catálogo, mas continua nos pedidos antigos.

Mais detalhes em [`CLAUDE.md`](CLAUDE.md). O sistema visual está em [`DESIGN.md`](DESIGN.md) e o contexto do produto em [`PRODUCT.md`](PRODUCT.md).

## Deploy

O projeto é feito para a Vercel (região `gru1`, São Paulo). Na Vercel, use em `DATABASE_URL` o pooler do Supabase em modo transação (porta 6543), porque a conexão direta é só IPv6. O [`vercel.json`](vercel.json) agenda o cron que reenvia os avisos pendentes uma vez por dia; defina `CRON_SECRET` para que a rota aceite as chamadas.

## Contribuindo

Cada mudança vai num branch próprio, com pull request para `main`.
