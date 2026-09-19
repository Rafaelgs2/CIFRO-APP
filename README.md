# CIFRO

Aplicação de finanças pessoais em português, com autenticação e persistência por usuário no Supabase.

## Recursos

- Contas, receitas, despesas, transferências, cartões, faturas e pagamentos.
- Categorias, compromissos, metas, relatórios e fechamento mensal.
- Valores monetários armazenados e calculados em centavos inteiros.
- Autenticação por e-mail e senha com recuperação de conta.
- Dados relacionais protegidos por Row Level Security (RLS).
- Demonstração fictícia em memória, separada dos dados pessoais.

## Requisitos

- Node.js 22.13 ou mais recente dentro da linha 22.x.
- npm.
- Um projeto Supabase com todas as migrations de `supabase/migrations/` aplicadas em ordem.

## Configuração local

1. Copie `.env.example` para `.env.local`.
2. Preencha somente:

   - `NEXT_PUBLIC_SUPABASE_URL`;
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

3. Instale e inicie:

```bash
npm ci
npm run dev
```

A aplicação fica disponível em `http://localhost:5173`.

As variáveis `NEXT_PUBLIC_*` são incorporadas ao frontend e não podem conter secrets. O acesso aos dados é protegido pelas políticas RLS e pelas RPCs autenticadas do Supabase.

## Verificação

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Ou execute tudo com:

```bash
npm run check
```

## Estrutura principal

- `app/`: páginas, interface e rota de API.
- `lib/finance.ts`: modelos, validação e cálculos financeiros.
- `lib/supabase/`: clientes autenticados de navegador e servidor.
- `supabase/migrations/`: schema, RLS, integridade e RPCs transacionais.
- `scripts/test-finance.mjs`: testes dos invariantes financeiros.
- `docs/checklist-validacao-supabase.md`: validação obrigatória antes de usuários reais.
- `docs/publicacao-vercel.md`: procedimento de publicação.

## Segurança e publicação

Antes de compartilhar o CIFRO, conclua o [checklist de validação do Supabase](docs/checklist-validacao-supabase.md). Ele inclui isolamento entre duas contas, URLs de autenticação, SMTP, backup e smoke test de produção.

O resultado da revisão atual está no [relatório de pré-deploy de 19/09/2026](docs/relatorio-pre-deploy-2026-09-19.md).

A Vercel detecta o projeto Next.js automaticamente. Não é necessário `vercel.json`.
