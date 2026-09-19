# CIFRO

Aplicação individual de finanças pessoais em português, pensada primeiro para celular.

## Recursos

- Contas com saldo inicial e histórico, incluindo salário, VR, investimentos e reserva.
- Receitas, despesas, transferências, pesquisa e filtros.
- Cartões, faturas, compras parceladas e pagamentos sem duplicar despesas.
- Categorias personalizadas, contas a pagar/receber, metas e fechamento mensal.
- Autenticação por Supabase Auth e dados financeiros armazenados em tabelas relacionais do Supabase, protegidas por Row Level Security (RLS).

## Principais arquivos

- `app/finance-main.tsx`: estado da interface, dashboard e navegação.
- `app/finance-views.tsx`: contas, cartões, planejamento, relatórios, perfil e detalhes.
- `app/finance-form.tsx`: formulários de cadastro e edição.
- `app/finance-ui.tsx`: elementos compartilhados e gráficos.
- `app/globals.css`: identidade visual e estilos responsivos.
- `lib/finance.ts`: modelos, validação, cálculos e exemplos.
- `app/api/finance/route.ts`: API de leitura e gravação com controle de revisão, usando a RPC transacional do Supabase.
- `db/schema.ts` e `drizzle/`: estrutura do banco e migração.

## Execução local

Requer Node.js 22.13 ou superior (conforme definido em `package.json`) e npm.

Antes de iniciar, copie `.env.example` para `.env.local` e preencha a Project URL e a Publishable key do Supabase. Nunca use uma Secret key no navegador.

Depois de aplicar todas as migrations, inclusive `202609190004_grant_trigger_function_execution.sql`, o PostgreSQL relacional do Supabase é a fonte oficial dos dados. Antes de publicar, execute o [checklist de validação do Supabase](docs/checklist-validacao-supabase.md).

Clone o repositório, instale as dependências e inicie o ambiente de desenvolvimento:

```bash
git clone https://github.com/Rafaelgs2/CIRFRO-APP.git
cd CIRFRO-APP
npm install
npm run dev
```

A prévia fica em `http://localhost:5173`.

Para gerar uma compilação de produção:

```bash
npm run build
```

Para executar a compilação em modo de produção local:

```bash
npm run start
```

## Verificação

```bash
npm run lint
node node_modules/typescript/bin/tsc --noEmit
npm run build
```

Os arquivos gerados pelos testes e pela execução local são ignorados pelo Git.
