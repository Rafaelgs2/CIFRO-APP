# Checklist de validação do Supabase

Este checklist confirma que o CIFRO está usando o Supabase como fonte oficial e que uma conta não consegue acessar os dados de outra.

## Situação já validada

- Login por e-mail e senha.
- Persistência após recarregar a página.
- Conta financeira, receita, despesa e transferência.
- Cartão, compra parcelada, fatura e pagamento de fatura.
- Compromisso e meta.
- Regras de integridade e permissões das triggers PostgreSQL.

## Teste de isolamento entre duas contas

Faça este teste antes de disponibilizar o aplicativo para outra pessoa.

1. No painel do Supabase, abra **Authentication > Users** e crie um segundo usuário de teste com outro e-mail. Para acelerar o teste, use a criação manual e deixe o e-mail já confirmado.
2. Abra o CIFRO numa janela anônima (ou em outro navegador) e entre com esse segundo usuário.
3. Confira que ele começa sem as contas, cartões, lançamentos, metas e compromissos da primeira conta. As categorias padrão podem aparecer, pois são criadas para cada usuário.
4. Com o segundo usuário, crie uma conta chamada `Conta teste RLS` e uma receita pequena.
5. Volte para a sessão do primeiro usuário e recarregue. Essa nova conta e receita não podem aparecer.
6. No topo da aplicação, use **Sair da conta** e entre novamente com cada usuário para confirmar que cada sessão continua isolada.

Se algum dado cruzar entre as duas contas, pare a publicação e não exclua os registros: anote qual conta criou o dado, em qual conta ele apareceu e em qual tela. Isso permite investigar a política RLS correta.

## Preparação para produção

- [ ] Em **Authentication > URL Configuration**, troque a Site URL de `http://localhost:5173` pelo endereço público do CIFRO e mantenha também a URL local para desenvolvimento.
- [ ] Cadastre a URL pública em **Redirect URLs**, principalmente para confirmação de e-mail e redefinição de senha.
- [ ] Configure um SMTP próprio em **Authentication > Emails > SMTP Settings**. O envio padrão do Supabase serve para testes e possui limites baixos.
- [ ] No provedor onde o CIFRO será hospedado, cadastre apenas `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` e `FINANCE_STORAGE=supabase`. Nunca exponha uma Secret key no navegador.
- [ ] Verifique que todas as migrations em `supabase/migrations/` foram aplicadas, inclusive `202609190004_grant_trigger_function_execution.sql`.
- [ ] Teste novamente login, recuperação de senha, criação de uma conta e um lançamento no endereço público.
- [ ] Defina uma rotina de backup/exportação antes de convidar usuários reais.

## Próxima evolução técnica recomendada

Hoje a gravação no Supabase é transacional e as tabelas relacionais são a fonte dos dados. A interface ainda envia o estado financeiro completo por uma RPC de compatibilidade. A próxima evolução é substituir essa sincronização por operações granulares — criar, editar e excluir cada conta, lançamento, cartão e compromisso individualmente — para obter histórico de alterações mais detalhado e reduzir o volume de escrita.
