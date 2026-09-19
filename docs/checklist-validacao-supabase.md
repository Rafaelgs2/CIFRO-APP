# Checklist de validação do Supabase

Conclua este checklist no projeto Supabase que será usado em produção antes de compartilhar o CIFRO com usuários reais.

## Banco e migrations

- [ ] Todas as migrations em `supabase/migrations/` foram aplicadas em ordem.
- [ ] A migration `202609190004_grant_trigger_function_execution.sql` está aplicada.
- [ ] As tabelas financeiras estão com RLS habilitado.
- [ ] O papel `anon` não possui acesso às tabelas financeiras nem às RPCs privadas.
- [ ] O papel `authenticated` executa `finance_state_payload()` e `save_finance_state(jsonb,bigint)`.

## Isolamento entre usuários

1. Crie duas contas de teste diferentes no Supabase Auth.
2. Entre com a primeira conta e crie uma conta financeira e um lançamento identificáveis.
3. Em janela anônima, entre com a segunda conta.
4. Confirme que nenhum registro da primeira conta aparece.
5. Crie dados na segunda conta, volte à primeira e confirme o isolamento nos dois sentidos.
6. Teste também edição, exclusão, cartões, compromissos, metas e exportação.

Se qualquer dado cruzar entre contas, interrompa a publicação e preserve os registros para diagnóstico.

## Autenticação

- [ ] A Site URL aponta para o domínio de produção.
- [ ] Redirect URLs incluem o domínio de produção e os Preview Deployments necessários.
- [ ] `http://localhost:5173/**` permanece autorizado somente para desenvolvimento.
- [ ] Confirmação de e-mail funciona no domínio público.
- [ ] Recuperação e troca de senha funcionam no domínio público.
- [ ] Logout remove a sessão local e impede novo acesso ao dashboard/API.
- [ ] SMTP próprio está configurado; o provedor padrão não é usado para tráfego real.
- [ ] Rate limits e templates de e-mail foram revisados.

## Vercel

- [ ] `NEXT_PUBLIC_SUPABASE_URL` está configurada em Production e Preview.
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` está configurada em Production e Preview.
- [ ] Nenhuma secret key ou service-role key está cadastrada como `NEXT_PUBLIC_*`.
- [ ] A versão de Node selecionada é 22.x.
- [ ] Build, typecheck, lint e testes passam a partir de uma instalação limpa.

## Operação

- [ ] Existe rotina de backup e restauração testada.
- [ ] Logs/alertas não registram tokens nem conteúdo financeiro.
- [ ] Uma conta de suporte/teste está separada dos usuários reais.
- [ ] O procedimento de revogação de sessão e resposta a incidente está documentado.
- [ ] O primeiro acesso, criação, edição, recarga e exportação foram testados em desktop e mobile.

## Comandos locais

```bash
npm ci
npm run check
npm audit --omit=dev
npm start
```
