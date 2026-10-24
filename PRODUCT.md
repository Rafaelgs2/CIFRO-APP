# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

PWA instalável (`app/manifest.ts`, `display: standalone`, orientação retrato, `start_url: /dashboard`). A interface é responsiva e prioriza o uso em celular; continua sendo web, não nativa.

## Users

Público amplo no Brasil: adultos que querem sair da planilha, do caderno ou da memória e organizar contas, cartões, compromissos e metas num só lugar. Uso individual (um usuário por conta), principalmente pelo celular, no momento em que registram um gasto ou revisam o mês.

## Product Purpose

O CIFRO é uma aplicação de finanças pessoais em português do Brasil. Ele organiza as informações financeiras do usuário para que ele consiga ver o que aconteceu, entender o presente e planejar os próximos passos. Sucesso é o usuário saber exatamente onde está financeiramente: saldo por conta, resultado do período, fatura do cartão e patrimônio.

## Positioning

**Em aberto.** O diferencial frente a Mobills, Organizze e planilhas ainda não foi definido. Não afirmar posicionamento competitivo (ex.: "o mais preciso", "o único sem integração bancária") em nenhuma superfície até que isso seja decidido.

## Operating Context

- Primeiro acesso: onboarding exige criar uma conta financeira (nome inicial "Conta principal", editável; saldo inicial obrigatório, pode ser R$ 0,00). Depois apresenta cartões, compromissos e metas sem exigir cadastro; pode ser pulado e a conclusão fica salva no perfil.
- Rotina: lançar receitas, despesas e transferências; acompanhar faturas de cartão; revisar o mês no fechamento mensal; consultar relatórios.
- Existe uma demonstração com dados fictícios em memória, separada dos dados pessoais e nunca salva na conta.
- Landing page pública (`app/landing-page.tsx`), login/cadastro com recuperação de senha, e o painel autenticado em `/dashboard`.
- Data corrente no fuso `America/Sao_Paulo`.

## Capabilities and Constraints

- Contas, receitas, despesas, transferências, cartões, faturas e pagamentos, categorias, compromissos, metas, relatórios e fechamento mensal.
- Regras financeiras (devem ser preservadas por qualquer trabalho de interface):
  - valores são inteiros em centavos;
  - saldo inicial não é receita;
  - transferências internas não alteram o resultado consolidado;
  - compra no cartão é despesa na data da compra; pagamento de fatura não duplica a despesa;
  - parcelas distribuem os centavos exatamente; compra no dia do fechamento entra no ciclo seguinte;
  - recorrência prevê os próximos meses (ou anos) como compromissos; cada um só vira lançamento quando o usuário confirma;
  - fechamento mensal é uma revisão e não bloqueia nem altera lançamentos.
- Limites atuais: sem integração bancária, sem importação automática, sem uso familiar/compartilhado. Exportação JSON manual, sem restauração automática.
- Stack existente: Next.js 16, React 19, Tailwind 4, Radix, Recharts, Supabase (Auth por e-mail e senha, Postgres com RLS e RPCs), deploy na Vercel.
- Terminologia da interface: "lançamento", "conta", "cartão", "fatura", "compromisso", "meta", "fechamento mensal", "patrimônio".

## Brand Commitments

- Nome: **CIFRO** (sempre em maiúsculas; nomes antigos "CIRFRO" não são usados).
- Slogan: "SUAS FINANÇAS MAIS CONECTADAS" / "Suas finanças mais conectadas."
- Idioma: português do Brasil, tratamento por "você".
- Ativos existentes: `public/favicon.svg`, ícones PWA em `public/icons/`, marca em `app/brand.tsx`, fonte Manrope em `public/fonts/` (OFL).
- Temas claro e escuro com tokens compartilhados; a preferência pode ser persistida no navegador.

## Evidence on Hand

- Copy real da landing page em `app/landing-page.tsx`.
- Dados de demonstração fictícios (em memória) para prévias.
- Não há depoimentos, número de usuários, avaliações, imprensa, preços ou parcerias. Não inventar nenhum desses.

## Product Principles

1. **Exatidão antes de conveniência.** Nenhum número exibido pode contradizer as regras financeiras; centavos não se perdem.
2. **Uma visão, contexto completo.** Cada movimento aparece com categoria, conta, data e valor, e se soma à visão consolidada.
3. **O usuário no controle.** Nada é criado, bloqueado ou alterado automaticamente; recorrência e fechamento são guias, não automações.
4. **Privado por padrão.** Dados isolados por usuário, painel só após autenticação, demonstração nunca mistura com dados reais.
5. **Celular primeiro.** O fluxo principal precisa funcionar bem com uma mão, numa tela pequena, instalado como app.

## Accessibility & Inclusion

WCAG 2.1 AA como padrão geral: contraste, foco visível, alvos de toque adequados e suporte a leitor de tela, nos dois temas. Nenhum público com necessidade específica definido além disso.
