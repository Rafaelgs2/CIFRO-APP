# CIFRO

Aplicação individual de finanças pessoais em português, pensada primeiro para celular.

## Recursos

- Contas com saldo inicial e histórico, incluindo salário, VR, investimentos e reserva.
- Receitas, despesas, transferências, pesquisa e filtros.
- Cartões, faturas, compras parceladas e pagamentos sem duplicar despesas.
- Categorias personalizadas, contas a pagar/receber, metas e fechamento mensal.
- Persistência local em Cloudflare D1, sem autenticação nesta versão.

## Principais arquivos

- `app/finance-main.tsx`: estado da interface, dashboard e navegação.
- `app/finance-views.tsx`: contas, cartões, planejamento, relatórios, perfil e detalhes.
- `app/finance-form.tsx`: formulários de cadastro e edição.
- `app/finance-ui.tsx`: elementos compartilhados e gráficos.
- `app/globals.css`: identidade visual e estilos responsivos.
- `lib/finance.ts`: modelos, validação, cálculos e exemplos.
- `app/api/finance/route.ts`: API local de leitura e gravação com controle de revisão.
- `db/schema.ts` e `drizzle/`: estrutura do banco e migração.

## Execução local

Requer Node.js compatível com `package.json`.

```bash
npm ci
npm run dev
```

A prévia fica em `http://localhost:5173`.

Para executar a compilação local com o worker gerado:

```bash
npm run build
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
