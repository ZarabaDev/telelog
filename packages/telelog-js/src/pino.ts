import { Writable } from "node:stream";
import { envConfig, sendTelegram } from "./core.js";

export type PinoTransportOptions = {
  // reservado para futuro
};

export function createPinoTransport(_opts?: PinoTransportOptions) {
  const cfg = envConfig();
  return new Writable({
    write(
      chunk: any,
      _enc: BufferEncoding,
      cb: (error?: Error | null) => void
    ): void {
      try {
        const text = normalizeChunk(chunk);
        // Dispara sem aguardar
        sendTelegram(text, cfg).catch((e) => {
          // eslint-disable-next-line no-console
          console.error(`[telelog] erro ao enviar log: ${e?.message || e}`);
        });
      } catch (e: any) {
        // eslint-disable-next-line no-console
        console.error(`[telelog] erro inesperado: ${e?.message || e}`);
      } finally {
        cb();
      }
    },
  });
}

function normalizeChunk(chunk: any): string {
  try {
    const s = chunk.toString("utf-8");
    return s.trim();
  } catch {
    return String(chunk);
  }
}
