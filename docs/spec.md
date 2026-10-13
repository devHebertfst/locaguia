# LocaGuia (nome provisório)

## O problema
Pequenas locadoras de equipamentos de construção têm dificuldade para conquistar novos clientes e transformar interessados em pedidos de locação. Muitos clientes não sabem quais equipamentos e materiais precisam para realizar um serviço.

## Pra quem
Proprietário de uma pequena locadora de ferramentas e equipamentos de construção que atende principalmente pelo WhatsApp.

## O que o MVP faz
1. **Gestão de equipamentos:** funcionário autorizado cadastra, edita e marca equipamentos como disponíveis ou indisponíveis, com nome, foto, categoria e descrição.
2. **Catálogo público:** clientes visualizam e pesquisam os equipamentos cadastrados, sem precisar fazer login.
3. **Assistente com IA:** cliente descreve o serviço que deseja realizar e recebe recomendações somente de equipamentos cadastrados e disponíveis.
4. **Sugestão de materiais:** o assistente apresenta uma lista de materiais complementares necessários ao serviço, sem consultar preços ou estoques de outras lojas.
5. **Solicitação de orçamento:** cliente informa nome, WhatsApp e período desejado; o sistema registra a solicitação, abre uma mensagem estruturada no WhatsApp da locadora e envia uma notificação por e-mail.

## O que NÃO entra no MVP
- Múltiplas locadoras (multi-tenant).
- Assinaturas e cobrança pelo SaaS.
- Pagamentos online.
- Cálculo automático de preços ou cobrança por hora.
- Integração com lojas de materiais.
- Controle financeiro e emissão de notas fiscais.
- Contratos digitais.
- Reservas automáticas e calendário de locações.
- Controle de manutenção dos equipamentos.
- Entrega, frete ou rastreamento.
- Cadastro e login de clientes finais.
- Aplicativo mobile nativo.
- Integração com sistemas de gestão existentes.

**Regra:** preços e condições são definidos pela locadora durante o orçamento. A IA não confirma reservas nem inventa disponibilidade.

## Telas
- **Catálogo:** listagem, pesquisa e detalhes dos equipamentos.
- **Assistente:** conversa para identificar serviços, equipamentos e materiais.
- **Solicitar orçamento:** formulário e encaminhamento ao WhatsApp.
- **Login administrativo:** autenticação com Google.
- **Painel administrativo:** gestão dos equipamentos e visualização de solicitações.

## Dados
- `usuarios`: id, firebase_uid, nome, email, autorizado.
- `equipamentos`: id, nome, descricao, categoria, foto_url, disponivel.
- `solicitacoes`: id, nome_cliente, telefone, servico, periodo, materiais_sugeridos, status, criado_em.
- `solicitacao_equipamentos`: solicitacao_id, equipamento_id.

## Stack
- **Frontend e backend:** Next.js (App Router e Route Handlers), hospedado na Vercel.
- **Banco de dados:** PostgreSQL no Supabase.
- **Autenticação:** Firebase Auth com Google, somente para funcionários autorizados.
- **E-mail:** Resend para notificações de solicitações.
- **Domínio e DNS:** Cloudflare.
- **IA:** API de modelo de linguagem, com recomendações limitadas ao catálogo e regras de segurança no servidor.

## Como eu sei que deu certo
**Pelo menos 5 solicitações reais e qualificadas de orçamento em 30 dias**, geradas pela plataforma e contendo contato, serviço desejado e equipamento solicitado.