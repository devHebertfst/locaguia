# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## What it is

LocaGuia is a single-tenant web app for one small construction-equipment rental shop that sells mainly over WhatsApp. Customers browse a public catalog, describe a job to an AI assistant that recommends equipment from that catalog, and send a quote request. The original product spec is `docs/spec.md` (Portuguese). Decisions made since then, recorded below, override it. All UI text is pt-BR only.

## Commands

```bash
npm run dev            # dev server
npm run lint
npm run typecheck      # next typegen (route types such as LayoutProps) + tsc
npm test               # Vitest unit tests (tests/unit)
npx vitest run tests/unit/env.test.ts   # single test file; add -t "name" for one test
npm run test:e2e       # Playwright (tests/e2e): production build + `next start` on :3100
npm run build
npm run db:generate    # generate a migration in drizzle/ from src/db/schema.ts
npm run db:migrate     # apply migrations (uses DATABASE_URL_DIRETA)
npm run db:seed        # example equipment for dev; does nothing if any equipment exists
```

The e2e tests run against the DB in `.env.local` and expect the seed data. They fix some env vars in `playwright.config.ts` (shop WhatsApp, high rate limit, Turnstile off), and tests that write rows use a marker name and delete them in `afterAll`. Next 16 keeps the previous page hidden in the DOM after a client navigation, so scope locators (`getByRole("article")`, the form) instead of searching the whole page. The CI only runs lint, typecheck, unit tests and build, without a DB, so `next build` must never need credentials: get the DB through `getDb()` (`src/db/index.ts`), never at module scope.

Copy `.env.example` to `.env.local`. Only the Supabase/DB block is required; every other integration is optional and the app must keep working without it.

## Architecture

- **Next.js 16.4** App Router with `cacheComponents` and `partialPrefetching` on. Middleware is now called Proxy and lives in `src/proxy.ts`. Reads of the DB, cookies or session must sit inside `<Suspense>` or `use cache`, or the build fails. Read `node_modules/next/dist/docs/` before relying on older Next knowledge.
- **Supabase**: Postgres (through Drizzle, `src/db/`), Storage for equipment photos, and Auth with Google for staff only. Firebase from the spec was replaced. Customers never log in. A Google account that isn't in `usuarios` with `autorizado = true` only sees the public catalog.
- **Data access is server-only.** The server connects as the DB owner. Every table has RLS on with no policies, so the browser can't read or write anything directly. Check the user's role in every Server Action or Route Handler; the proxy check is only optimistic.
- Roles: `admin` can do everything, including managing users. `funcionario` manages equipment and quote requests. The first admin is inserted directly into the DB.
- `src/lib/env.ts` validates env vars lazily on first access, so build and tests run without credentials.
- Integrations: Gemini for the assistant, Turnstile for anti-spam, Resend for email to the shop, WhatsApp Cloud API for automatic notices to customers, a `wa.me` link to the shop's WhatsApp, and Vercel Cron.

## Data model

The source of truth is `src/db/schema.ts`. Names are Portuguese; keep them. Change the schema, then run `npm run db:generate`; never edit generated SQL by hand except for custom migrations.

- Catalog search goes through `public.sem_acento()` (custom migration `drizzle/0001_busca_sem_acento.sql`), which is case- and accent-insensitive.
- Equipment has two separate states. `disponivel = false` still appears in the catalog, marked as unavailable. `ativo = false` means deactivated: it is hidden from the catalog but kept in old quote requests. Equipment is never hard-deleted.
- `sugestoes` covers both equipment the shop lacks (`novo_equipamento`) and "notify me when it is available" requests (`aguardar_disponibilidade`).
- `notificacoes` is an outbox for WhatsApp Cloud API notices. While credentials are missing, rows stay `pendente`.
- `limites_uso` holds rate-limit counters per key and time window.

## Hard product rules

- The AI recommends **only** equipment with `ativo = true` and `disponivel = true`. Enforce this on the server: send the model only active equipment and drop every ID it returns that isn't active and available. Never rely on the prompt alone.
- The AI may suggest complementary materials as a plain list. It never quotes prices, confirms reservations or claims availability. The shop sets prices and terms during the quote.
- Quote requests are processed in this order:
  1. Save to the DB in a transaction. If this fails, block and show an error.
  2. Email via Resend, if configured. A failure is only logged.
  3. Open `wa.me` for the shop, if `WHATSAPP_LOJA` is set.
- Phones are Brazilian mobile numbers only, stored as E.164 (`+55DD9XXXXXXXX`); see `src/lib/telefone.ts`. Dates are calendar dates in the shop's time zone (`src/lib/datas.ts`).
- The quote form (`/orcamento`) can be prefilled through the URL: `?equipamentos=id1,id2&servico=...&materiais=...` (`src/lib/orcamento/params.ts`). The assistant uses this to hand over its recommendation. Validation lives in `src/lib/orcamento/validacao.ts` and runs on both the client and the server.
- Public forms go through Turnstile (skipped when `TURNSTILE_SECRET_KEY` is empty) and `consumirLimite()` (`src/lib/limites.ts`).
- The customer's consent to WhatsApp notices (`aceita_whatsapp`) must start unchecked.
- Customers get automatic WhatsApp notices in three cases:
  - **Suggested equipment arrived:** sent when the admin links the suggestion to the new equipment. There is no fuzzy matching.
  - **Equipment is available again:** sent to `aguardar_disponibilidade` suggestions that asked to be notified.
  - **Equipment was deactivated:** sent to open quote requests (`nova` or `em_atendimento`) whose customer consented.

## Out of scope for the MVP (do not build)

Multi-tenancy, SaaS billing, online payments, automatic pricing, integrations with material stores, finance or invoicing, digital contracts, reservations or a rental calendar, maintenance tracking, delivery, customer accounts, a native mobile app, and integrations with existing management systems.

## Workflow

Every change goes on its own branch with a PR to `main`. Never commit feature work directly to `main`.
