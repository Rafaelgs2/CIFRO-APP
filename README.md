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
- `app/api/finance/route.ts`: API de leitura e gravação com controle de revisão, usando a RPC transacional do Supabase quando configurada.
- `db/schema.ts` e `drizzle/`: estrutura do banco e migração.

## Execução local

Requer Node.js 22.13 ou superior (conforme definido em `package.json`) e npm.

Antes de iniciar, copie `.env.example` para `.env.local` e preencha a Project URL e a Publishable key do Supabase. Nunca use uma Secret key no navegador.

`FINANCE_STORAGE=d1` mantém a persistência de transição. Depois de aplicar todas as migrations, inclusive `202609190004_grant_trigger_function_execution.sql`, use `FINANCE_STORAGE=supabase` para tornar o PostgreSQL relacional a fonte oficial dos dados. Antes de publicar, execute o [checklist de validação do Supabase](docs/checklist-validacao-supabase.md).

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

Para executar localmente o worker gerado após a compilação:

```bash
npm run start
```

Para inicializar um banco D1 local vazio depois da compilação:

```bash
node node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_eminent_eddie_brock.sql
```

Não reaplique a migração em um banco local que já a recebeu.

## Verificação

```bash
npm run lint
node node_modules/typescript/bin/tsc --noEmit
node scripts/test-finance.mjs
npm run build
```

Os arquivos gerados pelos testes e pela execução local são ignorados pelo Git.
