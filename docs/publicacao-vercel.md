# Publicação do CIFRO na Vercel

O CIFRO usa Next.js e deve ser publicado com a configuração padrão da Vercel. Não é necessário `vercel.json`.

## Antes de importar o repositório

1. Aplique todas as migrations do Supabase.
2. Conclua `docs/checklist-validacao-supabase.md`.
3. Confirme que `npm run check` passa em uma instalação limpa.
4. Garanta que nenhum `.env` ou secret está versionado.

## Criar o projeto

1. Importe o repositório na Vercel.
2. Mantenha Framework Preset `Next.js` e Root Directory `./`.
3. Use o comando padrão `npm run build`.
4. Selecione Node.js 22.x.
5. Cadastre em Production e Preview:

   - `NEXT_PUBLIC_SUPABASE_URL`;
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

Nunca cadastre secret/service-role key com prefixo `NEXT_PUBLIC_`.

## Configuração de autenticação

Depois que a URL pública existir:

1. Atualize a Site URL no Supabase Auth.
2. Adicione a URL de produção e os previews autorizados às Redirect URLs.
3. Teste confirmação de e-mail, login, recuperação de senha e logout.
4. Configure SMTP próprio antes de convidar usuários reais.

## Smoke test público

- Abra `/` e autentique uma conta de teste.
- Atualize `/dashboard` diretamente.
- Crie e edite uma conta e um lançamento.
- Confirme a persistência após recarregar.
- Valide uma segunda conta para confirmar o isolamento RLS.
- Teste exportação e logout.
- Verifique erros no Runtime Logs sem copiar tokens ou dados financeiros.

Não compartilhe a aplicação enquanto algum item de segurança ou isolamento permanecer pendente.
