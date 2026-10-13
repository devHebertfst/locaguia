# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

LocaGuia (working name) is pre-implementation: the only source of truth is `docs/spec.md` (Portuguese). No app has been scaffolded yet, so there are no build, lint or test commands. Add them here once the Next.js project exists. Read `docs/spec.md` before making product decisions.

## What it is

A single-tenant web app for one small construction-equipment rental shop that sells mainly over WhatsApp. Customers browse a public catalog, describe a job to an AI assistant that recommends equipment from that catalog, and send a quote request that goes to the shop's WhatsApp and email.

## Planned architecture

- **Next.js App Router** for UI and **Route Handlers** for the backend, deployed on Vercel.
- **PostgreSQL on Supabase** for data.
- **Firebase Auth (Google sign-in)** for staff only. Authorization comes from the `usuarios.autorizado` flag, which is matched by `firebase_uid`. Customers never log in.
- **Resend** sends the email notification for each quote request.
- **Cloudflare** handles domain and DNS.
- **LLM API** is called only from the server. Recommendations are limited to the catalog.

Screens: public catalog (list, search, details), AI assistant chat, quote request form (which opens WhatsApp), Google admin login, and an admin panel for equipment CRUD and viewing quote requests.

## Data model (Portuguese names, keep them)

- `usuarios`: id, firebase_uid, nome, email, autorizado
- `equipamentos`: id, nome, descricao, categoria, foto_url, disponivel
- `solicitacoes`: id, nome_cliente, telefone, servico, periodo, materiais_sugeridos, status, criado_em
- `solicitacao_equipamentos`: solicitacao_id, equipamento_id (join table)

## Hard product rules

- The AI recommends **only** equipment that is in `equipamentos` with `disponivel = true`. Enforce this on the server: filter the catalog before building the prompt and validate the IDs the model returns. Do not rely on the prompt alone.
- The AI may suggest complementary materials as a plain list. It never looks up prices or stock at other stores.
- The AI never quotes prices, confirms reservations or claims availability. The shop sets prices and terms during the quote.
- A quote request (name, WhatsApp number, desired period) does three things: it saves `solicitacoes` and `solicitacao_equipamentos`, opens a structured WhatsApp message to the shop, and sends an email through Resend.

## Out of scope for the MVP (do not build)

Multi-tenancy, SaaS billing, online payments, automatic pricing, integrations with material stores, finance or invoicing, digital contracts, reservations or a rental calendar, maintenance tracking, delivery, customer accounts, a native mobile app, and integrations with existing management systems.

## Success metric

At least 5 real, qualified quote requests in 30 days, each with contact info, the desired job and the requested equipment.
