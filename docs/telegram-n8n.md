# Registrar despesas pelo Telegram com n8n

Cada usuário conecta o próprio Telegram pelo Perfil. Depois, o bot recebe `almoço 32,50`, o n8n chama a RPC `capture_telegram_expense` no Supabase, e a confirmação só sai depois da gravação. É o banco que decide a qual usuário cada chat pertence.

## Como a identidade é garantida

- **O chat é verdadeiro:** o Telegram Trigger do n8n recusa requisições sem o segredo do webhook do Telegram (403).
- **O chat é da pessoa:** o vínculo só nasce quando alguém abre o link de uso único gerado na conta logada. O link dura 15 minutos, e o banco guarda só o hash.
- **A automação é a nossa:** as RPCs do bot exigem o cabeçalho `x-cifro-bot-secret`. Sem segredo configurado, tudo é recusado.
- **Grupos ficam de fora:** o nó de interpretação ignora qualquer chat que não seja privado.

## 1. Configurar o bot

1. Aplique as migrations.
2. No SQL Editor do Supabase, gere o segredo do bot. Ele aparece só nesse resultado:

   ```sql
   select public.rotate_telegram_bot_secret();
   ```

3. No n8n, crie uma credencial **Custom Auth** e cole os dois valores:

   ```json
   {
     "headers": {
       "apikey": "SUA_PUBLISHABLE_KEY",
       "x-cifro-bot-secret": "SEGREDO_DO_PASSO_ANTERIOR"
     }
   }
   ```

4. Defina `TELEGRAM_BOT_USERNAME` (usuário do bot, sem `@`) no `.env.local` e nas variáveis da Vercel.

Se o segredo vazar, rode o comando do passo 2 de novo e atualize a credencial.

## 2. Fluxo

```
Telegram Trigger → Interpretar mensagem → É conexão?
   sim → Confirmar conexão → Responder conexão
   não → É despesa?
           sim → Gravar no Cifro → Gravou?
                                    sim → Confirmar no Telegram
                                    não → Avisar falha no Telegram
           não → Orientar no Telegram
```

Erros de rede nos nós HTTP também seguem para uma resposta de falha. Os nós usam `$('Interpretar mensagem')` porque, depois de uma chamada HTTP, `$json` passa a ser a resposta da RPC.

### Interpretar mensagem (Code)

```js
const msg = $json.message;
if (msg.chat.type !== 'private') return [];

const chat_id = msg.chat.id;
const text = (msg.text || '').trim();
const reply = (message) => [{ json: { kind: 'reply', chat_id, text: message } }];

const start = text.match(/^\/start(?:@\w+)?(?:\s+(\S+))?$/);
if (start) {
  if (start[1]) return [{ json: { kind: 'link', chat_id, token: start[1] } }];
  return reply('Para conectar, abra Perfil no Cifro e toque em Conectar Telegram.');
}

const m = text.match(/^(.+?)\s+(\d+(?:[.,]\d{1,2})?)$/);
if (!m) return reply('Não entendi 🤔 Use: descrição valor (ex: almoço 32,50)');

const valor = parseFloat(m[2].replace(',', '.'));
return [{ json: {
  kind: 'expense',
  chat_id,
  message_id: msg.message_id,
  descricao: m[1].trim(),
  valor,
  amount_cents: Math.round(valor * 100)
} }];
```

### Chamadas HTTP

Nos dois nós: `POST`, autenticação **Generic → Custom Auth** e **On Error: Continue (using error output)**.

| Nó | URL | Corpo |
| --- | --- | --- |
| Confirmar conexão | `/rest/v1/rpc/confirm_telegram_link` | `p_chat_id`, `p_token` |
| Gravar no Cifro | `/rest/v1/rpc/capture_telegram_expense` | `p_chat_id`, `p_message_id`, `p_description`, `p_amount_cents` |

## Respostas das RPCs

| Resposta | Significado |
| --- | --- |
| `{"ok":true,"duplicate":false,"account":…,"category":…,"amount_cents":…}` | Despesa gravada |
| `{"ok":true,"duplicate":true,…}` | Mensagem reenviada; nada foi gravado de novo |
| `{"ok":true,"message":…}` | Telegram conectado |
| `{"ok":false,"message":…}` | Recusada; `message` explica o motivo |

## Como a categoria é escolhida

1. Nome de uma categoria de despesa do usuário dentro da descrição.
2. Palavras comuns associadas ao ícone da categoria (`almoço` → ícone de alimentação).
3. Categoria com o ícone "outros" ou, sem ela, a primeira de despesa.

O usuário corrige a categoria no app quando o palpite errar.

## Antes de abrir para outras pessoas

- O n8n precisa rodar em um servidor sempre ligado, com endereço fixo. No computador pessoal, o bot para quando a máquina desliga.
- O bot é público: qualquer pessoa pode mandar mensagens, e cada uma gera uma execução no n8n. Não há limite de envio por usuário.
- O segredo do bot vale para todos os usuários. Se vazar, permite lançar despesas em qualquer chat conectado, mas não ler nem apagar dados. Troque-o conforme o passo 1.
