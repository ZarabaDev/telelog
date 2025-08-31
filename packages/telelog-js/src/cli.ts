#!/usr/bin/env node
import { envConfig, sendTelegram, TelegramConfigError, TelelogSendError } from "./core.js";

async function main() {
  const args = process.argv.slice(2);
  if (!args.length) {
    console.error('Uso: telelog "mensagem"');
    process.exit(2);
  }
  const text = args.join(" ");

  try {
    const cfg = envConfig();
    await sendTelegram(text, cfg);
    process.exit(0);
  } catch (e: any) {
    if (e instanceof TelegramConfigError) {
      console.error(e.message);
      process.exit(2);
    }
    if (e instanceof TelelogSendError) {
      console.error(`Falha ao enviar: ${e.message}`);
      process.exit(1);
    }
    console.error(`Erro inesperado: ${e?.message || e}`);
    process.exit(1);
  }
}

main();
