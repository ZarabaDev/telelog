# Changelog

Todas as mudanças notáveis neste monorepo serão documentadas aqui.

## [0.1.0] - 2025-08-30
- Scaffold inicial do monorepo (`telelog-py` e `telelog-js`).
- Adicionados LICENSE, README, .gitignore, .env.example.
- Planejamento do MVP conforme escopo.

### Complementos
- Implementado core Python: `TeleConfig`, `env_config()`, `send_telegram()` com timeout, retries e truncamento.
- Adicionado `TelegramLogHandler` e CLI `telelog` (Python).
- Implementado core Node/TS: `TeleConfig`, `envConfig()`, `sendTelegram()` com timeout, retries e truncamento.
- Transports: Winston (`telegramWinstonTransport`) e Pino (`createPinoTransport`). CLI `telelog` (Node).
- Correção: `send_telegram`/`sendTelegram` agora lançam erro se nenhuma tentativa por chatId for bem-sucedida.
- Ajustes: `winston-transport` movido para `dependencies`; `preserveShebang` no TS para CLI.
- Workflows: `publish-pypi.yml` e `publish-npm.yml` adicionados.

### Ajustes (JS)
- CLI: adicionado wrapper `bin/telelog` para executar `dist/cli.js` sem depender de `preserveShebang`.
- tsconfig: removido `preserveShebang`; adicionado `types: ["node"]` para resolver `process` e módulos `node:*`.
- Core: troca de `require` por imports nativos de `fs` (`existsSync`, `readFileSync`).
- CLI: remoção de import explícito de `process` (uso do global).
- Winston/Pino: ajustes de tipos mínimos e assinatura de `write` no `Writable`.
- package.json: `bin` atualizado para `bin/telelog` e inclusão de `bin` em `files` publicados.
