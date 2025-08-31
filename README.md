# telelog (monorepo)

Bibliotecas Python e JS/TS para enviar logs e alertas para o Telegram em 60 segundos.

- Pacotes:
  - `packages/telelog-py/` (Python)
  - `packages/telelog-js/` (Node/TypeScript)
- Exemplos:
  - `examples/python-basic/`
  - `examples/node-winston/`

Requisitos de ambiente:
- TELEGRAM_BOT_TOKEN
- TELEGRAM_CHAT_ID ou TELEGRAM_CHAT_IDS
- TELEGRAM_PARSE_MODE (opcional: MarkdownV2 ou HTML; padrão: texto puro)

Avisos:
- Tamanho máximo por mensagem: 4096 caracteres (texto truncado com `...`).
- Rate-limit 429: respeita `Retry-After` com retries exponenciais com jitter.
- Este projeto é para alertas, não substitui soluções de observabilidade.

Consulte os READMEs dos subpacotes para instalação e uso.

## Notas rápidas

- O `.env` é lido do diretório atual (CWD) se existir; variáveis já exportadas no ambiente têm precedência.
- Requisitos: Python >= 3.8 e Node >= 18 (ESM para o pacote JS).

## Autor & Contato

- GitHub: https://github.com/ZarabaDev
- E-mail: zaraba@zarabatech.com.br
- Site: https://zarabatech.com.br
