# CIFRO

Aplicação individual de finanças pessoais em português, pensada primeiro para celular.

## Recursos

- Contas com saldo inicial e histórico, incluindo salário, VR, investimentos e reserva.
- Receitas, despesas, transferências, pesquisa e filtros.
- Cartões, faturas, compras parceladas e pagamentos sem duplicar despesas.
- Categorias personalizadas, contas a pagar/receber, metas e fechamento mensal.
- Armazenamento em D1 por identidade autenticada e demonstração separada.

## Principais arquivos

- `app/finance-main.tsx`: estado da interface, dashboard e navegação.
- `app/finance-views.tsx`: contas, cartões, planejamento, relatórios, perfil e detalhes.
- `app/finance-form.tsx`: formulários de cadastro e edição.
- `app/finance-ui.tsx`: elementos compartilhados e gráficos.
- `app/globals.css`: identidade visual e estilos responsivos.
- `lib/finance.ts`: modelos, validação, cálculos e exemplos.
- `app/api/finance/route.ts`: API autenticada, proteção de origem e gravação com controle de revisão.
- `db/schema.ts` e `drizzle/`: estrutura do banco e migração.
- `docs/decisoes.md`: decisões, regras e limites da versão.

## Execução

Stack: React 19, TypeScript, Vinext/Vite, componentes Radix/Shadcn e Cloudflare D1. Use Node compatível com `package.json` e `npm ci`.

Execute `npm run dev`. No Windows, se o wrapper npm instalado no computador falhar, `node scripts/run-framework.mjs dev` executa diretamente a mesma aplicação.

A prévia padrão fica em `http://localhost:5173`. O login local da plataforma usa `/signin-with-chatgpt?return_to=/` e identifica um usuário fictício de desenvolvimento. Essa simulação não entra na versão publicada.

Para o banco local, gere uma compilação e execute:

```
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_eminent_eddie_brock.sql
```

Não reaplique a migração em um banco local que já a recebeu. A publicação Sites aplica migrações no banco hospedado.

## Verificação

- `node node_modules/typescript/bin/tsc --noEmit`
- `node scripts/test-finance.mjs`
- `node scripts/run-framework.mjs build`
- `node scripts/qa-finance.mjs`
- `node scripts/qa-persistence.mjs`

Os testes de navegador usam Playwright instalado separadamente em `.sites-runtime/qa` e Microsoft Edge. Não são dependências do produto. `qa-persistence` exige um banco local vazio e restaura o estado inicial ao encerrar. As capturas ficam em `outputs`, ignorado no Git. Não há dados financeiros de teste nas migrações ou no banco hospedado.