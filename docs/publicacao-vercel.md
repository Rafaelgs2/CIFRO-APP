# Publicação do CIFRO na Vercel

O CIFRO está configurado como uma aplicação Next.js. A Vercel deve usar o repositório `Rafaelgs2/CIRFRO-APP`, o comando `npm run build` e a configuração presente em `vercel.json`.

## Criar o projeto

1. Entre em [vercel.com/new](https://vercel.com/new) com a mesma conta usada no GitHub.
2. Importe o repositório `Rafaelgs2/CIRFRO-APP`.
3. Mantenha **Framework Preset: Next.js**, **Root Directory: `./`** e **Build Command: `npm run build`**.
4. Antes de clicar em **Deploy**, abra **Environment Variables** e adicione as variáveis abaixo para os ambientes Production, Preview e Development.

| Variável | Valor |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key do projeto Supabase |

Não cadastre Secret keys do Supabase na Vercel para esta versão do CIFRO.

## Depois do primeiro deploy

1. Copie a URL de produção gerada pela Vercel, por exemplo `https://cifro-app.vercel.app`.
2. No Supabase, abra **Authentication > URL Configuration**.
3. Em **Site URL**, informe a URL da Vercel.
4. Em **Redirect URLs**, adicione:
   - `https://SEU-DOMINIO.vercel.app/**`
   - `http://localhost:5173/**` para continuar desenvolvendo localmente.
5. Teste no endereço público: entrar, sair, atualizar a página, recuperar senha e salvar uma receita.

Cada push na branch principal dispara um novo deploy de produção na Vercel. Antes de adicionar dados reais ou compartilhar o endereço, configure SMTP próprio no Supabase para evitar os limites do envio padrão.
