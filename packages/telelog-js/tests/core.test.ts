import { describe, it, expect } from "vitest";
import { envConfig } from "../src/core";

describe("envConfig", () => {
  it("throws when env is missing", () => {
    const old = { ...process.env };
    delete process.env.TELEGRAM_BOT_TOKEN;
    delete process.env.TELEGRAM_CHAT_ID;
    delete process.env.TELEGRAM_CHAT_IDS;
    expect(() => envConfig()).toThrowError();
    process.env = old;
  });
});
