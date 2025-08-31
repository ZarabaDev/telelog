# telelog-js

Envie logs e alertas para o Telegram em 60 segundos (Node/TypeScript).

## Instalação

```bash
npm i telelog-js
```

## Uso mínimo

```ts
import { sendTelegram } from "telelog-js";
await sendTelegram("deploy ok ✅");
```

## Winston

```ts
import winston from "winston";
import { telegramWinstonTransport } from "telelog-js/winston";

const logger = winston.createLogger({
  transports: [telegramWinstonTransport()],
});
logger.warn("atenção");
```

## Pino

```ts
import pino from "pino";
import { createPinoTransport } from "telelog-js/pino";

const logger = pino({}, createPinoTransport());
logger.info("olá");
```

## Variáveis de ambiente

- TELEGRAM_BOT_TOKEN
- TELEGRAM_CHAT_ID ou TELEGRAM_CHAT_IDS (separados por vírgula)
- TELEGRAM_PARSE_MODE (opcional: MarkdownV2 ou HTML; padrão: texto puro)

## CLI

```bash
telelog "mensagem"
```

Códigos de saída:
- 0: sucesso
- 1: falha de envio
- 2: uso incorreto ou configuração ausente

## Comportamento

- Truncamento em 4096 caracteres com sufixo `...`.
- Retries (3), timeout (5s), backoff exponencial base 500ms com jitter ±20%.
- 429: respeita `retry_after` do Telegram.
- MarkdownV2/HTML: escape automático quando `TELEGRAM_PARSE_MODE` definido.

## Segurança

Nunca commitar `.env`. Use `.env.example` como referência e secrets no CI/CD.
