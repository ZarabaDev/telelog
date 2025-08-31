import Transport from "winston-transport";
import { envConfig, sendTelegram } from "./core.js";

export type WinstonOptions = {
  level?: string;
};

export class TelegramWinstonTransport extends Transport {
  constructor(opts?: WinstonOptions) {
    super(opts as any);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  log(info: any, callback: () => void) {
    const cfg = envConfig();
    const text = formatInfo(info);
    sendTelegram(text, cfg).catch((e) => {
      // Não travar a app
      // eslint-disable-next-line no-console
      console.error(`[telelog] erro ao enviar log: ${e?.message || e}`);
    });
    callback();
  }
}

export function telegramWinstonTransport(opts?: WinstonOptions) {
  return new TelegramWinstonTransport(opts);
}

type MinimalLogEntry = { message?: unknown; stack?: string } & Record<string, unknown>;

function formatInfo(info: MinimalLogEntry) {
  // Usa mensagem e inclui stack se presente
  const parts = [String(info.message ?? "")];
  if (info.stack) parts.push(String(info.stack));
  return parts.filter(Boolean).join("\n");
}
