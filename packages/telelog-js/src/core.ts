import { existsSync, readFileSync } from "node:fs";

export type TeleConfig = {
  botToken: string;
  chatIds: string[];
  parseMode?: "MarkdownV2" | "HTML";
  timeout?: number; // segundos
  retries?: number;
  backoffBaseMs?: number; // ms
  jitter?: number; // 0-1
};

const API_URL = (token: string) => `https://api.telegram.org/bot${token}/sendMessage`;
const MAX_MESSAGE_LEN = 4096;

export class TelegramConfigError extends Error {}
export class TelelogSendError extends Error {}

function loadDotenvIntoEnv(envPath = ".env"): void {
  try {
    if (!existsSync(envPath)) return;
    const content = readFileSync(envPath, "utf-8");
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      const value = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, "");
      if (key && !(key in process.env)) process.env[key] = value;
    }
  } catch {
    // ignora erros
  }
}

export function envConfig(): TeleConfig {
  loadDotenvIntoEnv();
  const botToken = (process.env.TELEGRAM_BOT_TOKEN || "").trim();
  const chatIdsRaw =
    process.env.TELEGRAM_CHAT_IDS || process.env.TELEGRAM_CHAT_ID || "";
  let parseMode = process.env.TELEGRAM_PARSE_MODE?.trim();

  if (!botToken || !chatIdsRaw) {
    throw new TelegramConfigError(
      "Defina TELEGRAM_BOT_TOKEN e TELEGRAM_CHAT_ID(S). Consulte o README."
    );
  }

  const chatIds = String(chatIdsRaw)
    .replace(/;/g, ",")
    .replace(/\s+/g, ",")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!chatIds.length) {
    throw new TelegramConfigError(
      "Defina TELEGRAM_BOT_TOKEN e TELEGRAM_CHAT_ID(S). Consulte o README."
    );
  }

  if (parseMode && parseMode !== "MarkdownV2" && parseMode !== "HTML") {
    parseMode = undefined;
  }

  return {
    botToken,
    chatIds,
    parseMode: parseMode as any,
    timeout: 5,
    retries: 3,
    backoffBaseMs: 500,
    jitter: 0.2,
  };
}

function escapeMarkdownV2(text: string): string {
  const specials = new Set(
    "_ * [ ] ( ) ~ ` > # + - = | { } . !".split(" ")
  );
  let out = "";
  for (const ch of text) {
    out += specials.has(ch) ? `\\${ch}` : ch;
  }
  return out;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function truncate(text: string, maxLen = MAX_MESSAGE_LEN): string {
  if (text.length <= maxLen) return text;
  let out = text.slice(0, maxLen - 3) + "...";
  if (out.endsWith("\\")) out = out.slice(0, -1);
  return out;
}

function calcBackoff(attempt: number, baseMs: number, jitter: number): number {
  const ms = baseMs * Math.pow(2, Math.max(0, attempt - 1));
  const jitterFactor = 1 + jitter * (2 * (Math.random() - 0.5));
  return ms * jitterFactor;
}

async function postJson(url: string, payload: any, timeoutSec: number): Promise<any> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutSec * 1000);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    } as any);
    const text = await res.text();
    const json = text ? JSON.parse(text) : {};
    if (!res.ok) {
      const err: any = new Error(`HTTP ${res.status}`);
      err.status = res.status;
      err.body = json;
      throw err;
    }
    return json;
  } finally {
    clearTimeout(t);
  }
}

export async function sendTelegram(
  text: string,
  cfg?: TeleConfig,
  opts?: Record<string, any>
): Promise<any[]> {
  const config = cfg ?? envConfig();
  let sendText = String(text);
  if (config.parseMode === "MarkdownV2") sendText = escapeMarkdownV2(sendText);
  else if (config.parseMode === "HTML") sendText = escapeHtml(sendText);
  sendText = truncate(sendText);

  const url = API_URL(config.botToken);
  const results: any[] = [];

  for (const chatId of config.chatIds) {
    let attempt = 1;
    let lastErr: any = null;
    let succeeded = false;
    while (attempt <= (config.retries ?? 3)) {
      const payload: any = { chat_id: chatId, text: sendText };
      if (config.parseMode) payload.parse_mode = config.parseMode;

      try {
        const res = await postJson(url, payload, config.timeout ?? 5);
        results.push(res);
        succeeded = true;
        break;
      } catch (e: any) {
        const status = e?.status;
        const body = e?.body || {};
        const retryAfter = body?.parameters?.retry_after;
        if (status === 429 && typeof retryAfter === "number") {
          await new Promise((r) => setTimeout(r, retryAfter * 1000));
          attempt++;
          lastErr = e;
          continue;
        }
        if ([408, 500, 502, 503, 504].includes(status)) {
          const backoff = calcBackoff(attempt, config.backoffBaseMs ?? 500, config.jitter ?? 0.2);
          await new Promise((r) => setTimeout(r, backoff));
          attempt++;
          lastErr = e;
          continue;
        }
        lastErr = e;
        break;
      }
    }
    if (!succeeded) {
      throw new TelelogSendError(`Falha ao enviar para chat_id=${chatId}: ${lastErr}`);
    }
  }
  return results;
}
