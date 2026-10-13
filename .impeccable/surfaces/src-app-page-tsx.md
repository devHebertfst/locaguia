---
version: 1
slug: "src-app-page-tsx"
primary_target: "src/app/page.tsx"
related_targets: ["src/app/assistente/page.tsx","src/app/orcamento/page.tsx","src/app/equipamentos/[id]/page.tsx"]
---

# Superfícies públicas do LocaGuia (home, catálogo, detalhe, assistente, orçamento)

Modo: Persuade (home); as páginas internas herdam o mundo com mais contenção. O painel /admin herda os tokens em modo Operate.

Público e tarefa: pedreiro com pressa no celular e dono de casa que só sabe o serviço. Ação: descrever o serviço ao assistente ou achar o equipamento e pedir orçamento. Provas: só o catálogo real; depoimentos e dados da loja entram quando forem enviados.

## Direction contract

THESIS: A betoneira que mistura o pedido: o cliente joga o serviço dentro e sai a lista de equipamentos e materiais. A home recusa o hero padrão de locadora (foto de escavadeira + "Alugue já" + cards de serviço) e põe o assistente funcionando na primeira tela, girando junto da betoneira 3D.

OWN-WORLD: Mundo Bolduzer traduzido. Chão marrom-terra quase preto #241D17 no topo, faixas e rodapé; corpo branco com faixas cinza #EEEEEE; laranja de sinalização #F1933C em botões pílula (texto escuro, por contraste), peach #FFDEBF em campos suaves, laranja queimado #C9680E em detalhes. Cabin 500 nos títulos, Inter no texto. Cantos 12px nos cartões, 20px nas faixas, pílula nos botões.

STORY: Entende em segundos que é uma locadora que ajuda a escolher; acredita porque o assistente responde com o que a loja tem; age perguntando ou pedindo orçamento direto do cartão.

FIRST VIEWPORT: Faixa marrom de altura quase total. Esquerda: H1 Cabin grande, subtítulo curto, campo "O que você vai fazer?" com botão laranja e exemplos tocáveis. Direita (no celular, atrás/abaixo do texto): betoneira 3D laranja e grafite, tambor girando, arrastável. Link secundário "Ver equipamentos" desce ao catálogo.

FORM: Mundo fixado pelo usuário (Bolduzer + three.js), sem sorteio; assinatura: betoneira procedural em three.js, tambor gira devagar, acelera ao enviar e ao rolar; respeita prefers-reduced-motion.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
