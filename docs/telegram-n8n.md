# Registrar despesas pelo Telegram com n8n

O bot recebe `almoço 32,50`, o n8n chama a RPC `capture_expense` no Supabase e a confirmação só sai depois da gravação.

## 1. Preparar o Cifro

1. Aplique a migration `supabase/migrations/202610300001_telegram_capture.sql`.
2. No app, abra **Perfil → Registrar pelo Telegram**, informe o chat id, escolha a conta e clique em **Conectar**.
3. Copie o código exibido. Ele aparece uma única vez; gerar outro invalida o anterior.

## 2. Guardar os valores no n8n

Crie uma credencial **Header Auth** chamada `Cifro Supabase`:

- Name: `apikey`
- Value: a `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` do projeto

O código do passo anterior vai no nó Code abaixo. Não exporte nem compartilhe o workflow com ele.

## 3. Atualizar o nó Code

```js
const CIFRO_SECRET = 'COLE_O_CODIGO_AQUI';

const msg = $json.message;
const text = (msg.text || '').trim();
const m = text.match(/^(.+?)\s+(\d+(?:[.,]\d{1,2})?)$/);

if (!m) {
  return [{ json: { ok: false, chat_id: msg.chat.id } }];
}

const valor = parseFloat(m[2].replace(',', '.'));

return [{ json: {
  ok: true,
  chat_id: msg.chat.id,
  message_id: msg.message_id,
  descricao: m[1].trim(),
  valor,
  amount_cents: Math.round(valor * 100),
  secret: CIFRO_SECRET
} }];
```

A data não é mais enviada: a RPC usa o dia atual em `America/Sao_Paulo`.

## 4. Novo fluxo

`If (ok?)` true → **HTTP Request** → **If (gravou?)** → Telegram de confirmação (true) / Telegram de falha (false)

### HTTP Request

- Method: `POST`
- URL: `https://SEU-PROJETO.supabase.co/rest/v1/rpc/capture_expense`
- Authentication: Generic → Header Auth → `Cifro Supabase`
- Body (JSON, como expressão):

```
={{ {
  p_chat_id: $json.chat_id,
  p_secret: $json.secret,
  p_message_id: $json.message_id,
  p_description: $json.descricao,
  p_amount_cents: $json.amount_cents
} }}
```

- Settings → On Error: **Continue (using error output)**. Ligue a saída de erro ao Telegram de falha.

### If (gravou?)

`{{ $json.ok }}` is true (Boolean).

### Telegram de confirmação

- Chat ID: `{{ $('Code').item.json.chat_id }}`
- Texto: `✅ Registrado: {{ $('Code').item.json.descricao }} - R$ {{ $('Code').item.json.valor.toFixed(2).replace('.', ',') }} em {{ $json.account }} ({{ $json.category }})`

### Telegram de falha

- Chat ID: `{{ $('Code').item.json.chat_id }}`
- Texto: `⚠️ Não gravei: {{ $json.message || 'o Cifro não respondeu. Tente de novo.' }}`

Mantenha **Append n8n Attribution** desligado nos dois. O Telegram "Não entendi" continua ligado à saída false do `If (ok?)`.

Os nós usam `$('Code')` porque, depois do HTTP Request, `$json` passa a ser a resposta da RPC. Se o seu nó tiver outro nome, ajuste a expressão.

## Respostas da RPC

| Resposta | Significado |
| --- | --- |
| `{"ok":true,"duplicate":false,"account":…,"category":…,"amount_cents":…}` | Despesa gravada |
| `{"ok":true,"duplicate":true,…}` | Mensagem reenviada; nada foi gravado de novo |
| `{"ok":false,"message":…}` | Recusada; `message` explica o motivo |

## Como a categoria é escolhida

1. Nome de uma categoria de despesa sua dentro da descrição.
2. Palavras comuns associadas ao ícone da categoria (`almoço` → ícone de alimentação).
3. Categoria com o ícone "outros" ou, sem ela, a primeira de despesa.

Corrija a categoria no app quando o palpite errar.

## Segurança

- O código permite lançar despesas no chat vinculado, mas não ler nem apagar dados. Se vazar, gere outro no Perfil.
- Uma aba do app já aberta avisará que os dados mudaram ao salvar, em vez de sobrescrever a despesa.
