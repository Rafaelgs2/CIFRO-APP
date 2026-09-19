# Relatório de pré-deploy — 19/09/2026

## Resultado

O código está aprovado para um deployment de preview. O compartilhamento com usuários reais permanece condicionado aos testes autenticados e operacionais descritos em `docs/checklist-validacao-supabase.md`.

Nenhum deploy externo foi executado durante esta revisão.

## Evidências concluídas

- `npm run check`: lint, TypeScript, testes financeiros e build de produção aprovados.
- `npm audit --omit=dev`: 0 vulnerabilidades conhecidas após atualização do lockfile.
- Next.js 16.3.5, React 19.2.6 e árvore de dependências sem pacotes extraneous.
- `/`, `/dashboard`, `/manifest.webmanifest` e `/favicon.svg`: HTTP 200 no servidor de produção local.
- API sem sessão: HTTP 401 com mensagem genérica.
- Escrita com origem externa: HTTP 403.
- Escrita com tipo de conteúdo incorreto: HTTP 415.
- Headers ativos: CSP restrita ao projeto Supabase configurado, HSTS, `nosniff`, `DENY` e remoção de `X-Powered-By`.
- Dashboard marcado como `noindex`.
- Projeto Supabase configurado: provedor de e-mail e cadastro habilitados; confirmação de e-mail obrigatória.
- Acesso com apenas a publishable key a `profiles`, `categories`, `financial_accounts`, `finance_revisions` e `finance_state_payload()`: HTTP 401 / PostgreSQL `42501` (permissão negada).
- `.env.local` ignorado pelo Git; somente os nomes das duas variáveis públicas necessárias permanecem configurados.
- Busca no código atual sem referências às pilhas legadas removidas nem a marcas externas proibidas.

## Validação manual obrigatória

- Aplicar/confirmar todas as migrations no projeto de produção.
- Testar isolamento RLS nos dois sentidos com duas contas autenticadas.
- Configurar Site URL e Redirect URLs do domínio definitivo.
- Configurar SMTP próprio e testar confirmação e recuperação de senha.
- Confirmar backup/restauração, logs, alertas e resposta a incidente.
- Executar o fluxo completo em desktop e mobile no domínio público.

Até esses itens serem concluídos, o status é **pronto para preview, ainda não liberado para público real**.
