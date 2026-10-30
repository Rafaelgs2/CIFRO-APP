# CIFRO — decisões vigentes

Este documento registra apenas decisões atualmente refletidas no código.

## Produto e interface

- O CIFRO é uma aplicação individual de finanças pessoais em português do Brasil.
- A interface é responsiva e prioriza o uso em celular.
- O slogan é “SUAS FINANÇAS MAIS CONECTADAS”.
- Temas claro e escuro usam tokens compartilhados; a preferência visual pode ser persistida no navegador.
- A demonstração usa dados fictícios somente em memória e nunca é salva na conta do usuário.
- No primeiro acesso de uma conta recém-criada, o onboarding exige o cadastro de uma conta financeira. O nome começa como “Conta principal” e pode ser alterado; o saldo inicial é obrigatório, mas pode ser R$ 0,00.
- Depois de criar a conta, o onboarding apresenta cartões, compromissos e metas, sem exigir o cadastro de nenhum deles. A apresentação pode ser pulada e sua conclusão é persistida no perfil.

## Identidade e segurança

- A identidade é fornecida pelo Supabase Auth, com e-mail e senha.
- Cada usuário possui um perfil associado a `auth.users`.
- Dados financeiros são isolados por `user_id` e Row Level Security.
- O frontend usa somente a URL e a publishable key públicas do Supabase.
- Secret keys e service-role keys não pertencem ao frontend nem às variáveis da Vercel desta aplicação.

## Persistência

- PostgreSQL/Supabase é a fonte oficial dos dados.
- As tabelas relacionais, políticas RLS e RPCs estão em `supabase/migrations/`.
- A interface envia o estado financeiro validado para uma RPC transacional de compatibilidade.
- Uma revisão por usuário impede que uma aba sobrescreva silenciosamente alterações de outra sessão.
- A próxima evolução de persistência deve substituir o salvamento integral por operações granulares.
- A captura pelo Telegram já é granular: a RPC `capture_expense` insere uma única despesa, sem sessão de usuário, autenticada por chat id e um segredo guardado só como hash. Ela não lê nem altera outros registros, incrementa a revisão e aplica as mesmas regras de `validateState`, pois um registro inválido impediria o app de carregar o estado. O guia está em `docs/telegram-n8n.md`.

## Regras financeiras

- Valores são inteiros em centavos.
- Saldo inicial não é receita.
- Transferências internas não alteram o resultado consolidado.
- Compras no cartão são despesas na data da compra; pagamentos de fatura não duplicam despesas.
- Parcelas distribuem os centavos exatamente.
- Compras no dia do fechamento entram no ciclo seguinte.
- Datas inexistentes de fechamento/vencimento são limitadas ao último dia do mês.
- Recorrência prevê compromissos mensais ou anuais; nenhum lançamento é criado automaticamente, cada ocorrência é confirmada pelo usuário. O valor previsto segue o último lançamento da série, e um lançamento feito à mão com a mesma descrição no mês conta como confirmado. Encerrar uma recorrência remove só os previstos não confirmados.
- Fechamento mensal é uma revisão e não bloqueia nem altera lançamentos.

## Limites atuais

- Não há integração bancária, importação automática ou uso familiar.
- Não há separação entre finanças pessoais e de empresa.
- A captura pelo Telegram atende um usuário por chat, com o segredo guardado na automação. Vários usuários no mesmo bot exigirão outra forma de autenticar a automação e confirmar a posse do chat.
- A exportação JSON é manual; não existe restauração automática.
- A aplicação usa o fuso `America/Sao_Paulo` para a data corrente.
- O volume máximo aceito pelo estado é limitado pelos schemas em `lib/finance.ts` e pelo limite de corpo da API.
