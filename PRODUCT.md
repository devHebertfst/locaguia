# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
- **Pedreiros e empreiteiros:** profissionais que já sabem o que precisam. Querem achar o equipamento, ver se está disponível e pedir orçamento rápido, quase sempre pelo celular, muitas vezes na obra.
- **Donos de casa fazendo reforma:** leigos que sabem o serviço ("trocar o piso do banheiro"), não o equipamento. Precisam de orientação, e é para eles que o assistente existe.
- **Equipe da locadora (funcionário e admin):** cadastra equipamentos, marca disponibilidade e atende os pedidos de orçamento pelo painel, no computador da loja ou no celular.

## Product Purpose
Site de uma única locadora pequena de equipamentos de construção que vende principalmente pelo WhatsApp. Transforma visitantes em pedidos de orçamento qualificados: o cliente vê o catálogo, descreve o serviço ao assistente e envia o pedido, que chega à loja por e-mail e abre no WhatsApp. Sucesso: pelo menos 5 pedidos reais e qualificados em 30 dias.

## Positioning
Locadora de bairro que ajuda o cliente a descobrir do que ele precisa. O assistente recomenda só o que a loja tem e está disponível, e lista os materiais complementares. Ninguém precisa criar conta e o atendimento continua no WhatsApp.

## Operating Context
- Cliente: celular, sinal irregular, sol forte na obra, pressa. O fechamento acontece no WhatsApp da loja.
- Preço e condições são combinados no orçamento. O site nunca mostra preço, não confirma reserva e não promete disponibilidade.
- Equipe: o painel é ferramenta de trabalho do dia a dia, usado entre um atendimento e outro.

## Capabilities and Constraints
- Catálogo público com busca e categorias, página de detalhe com fotos, selo de disponível/indisponível.
- Assistente com IA (Gemini) que recomenda só equipamentos ativos e disponíveis e sugere materiais.
- Pedido de orçamento: nome, WhatsApp, serviço, período e equipamentos; e-mail para a loja e link `wa.me`.
- Login da equipe com Google; papéis `admin` e `funcionario`.
- Todo texto em pt-BR. Fora do MVP: pagamentos, preços, reservas, contas de cliente, entrega (lista completa no CLAUDE.md).

## Brand Commitments
- Nome: **LocaGuia** (provisório). Não há logo; a identidade é criada no redesign.
- Referência visual escolhida pelo usuário: o template Bolduzer da Kohesif Studio (https://templates.kohesifstudio.com/bolduzer/template-kit/home/), e uso de three.js.

## Evidence on Hand
- A loja tem fotos reais dos equipamentos, dados da loja (endereço, cidade, horário, tempo de mercado) e depoimentos reais de clientes, mas **nada disso está no repositório ainda**. Até chegar, o site mostra só o que o sistema já tem. Não inventar endereço, anos de mercado, números, clientes nem depoimentos.
- Fotos atuais: as que a equipe enviar pelo painel (Supabase Storage). Equipamento sem foto precisa de um estado digno.
- A home usa três fotos de obra do Unsplash (licença livre, com crédito ao fotógrafo); não são da loja e não devem ser apresentadas como se fossem.
- Avaliações: `src/conteudo/avaliacoes.ts` tem quatro avaliações de exemplo, escritas para o desenho da seção e visíveis só em desenvolvimento. As reais substituem esses exemplos.

## Product Principles
1. O pedido de orçamento é o objetivo de toda tela pública; o caminho até ele é curto e óbvio no celular.
2. Honestidade sobre disponibilidade: indisponível aparece como indisponível, e a IA nunca promete o que a loja não tem.
3. Orientar o leigo sem atrasar o profissional.
4. No painel, rapidez e clareza valem mais que expressão.

## Accessibility & Inclusion
- Uso ao ar livre em celulares baratos: contraste alto, alvos de toque grandes, páginas leves que funcionam com conexão ruim.
- Efeitos 3D e animações respeitam `prefers-reduced-motion` e nunca escondem conteúdo ou ações.
