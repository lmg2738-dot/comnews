import { ensureEnvFilesLoaded, missingEnvHint } from "./secrets";

const DEFAULT_KEYWORD_FETCH_CONCURRENCY = 8;

export function getNewsKeywords(): string[] {
  ensureEnvFilesLoaded();
  return [
    ...new Set(
      (process.env.NEWS_KEYWORDS ?? "CJ")
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean)
    ),
  ];
}

/** Vercel `KEYWORD_FETCH_CONCURRENCY` (기본 8, 최대 32) */
export function getKeywordFetchConcurrency(): number {
  ensureEnvFilesLoaded();
  const raw = process.env.KEYWORD_FETCH_CONCURRENCY?.trim();
  if (!raw) return DEFAULT_KEYWORD_FETCH_CONCURRENCY;
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return DEFAULT_KEYWORD_FETCH_CONCURRENCY;
  return Math.min(32, n);
}

export function getConfig() {
  ensureEnvFilesLoaded();
  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const telegramChatId = process.env.TELEGRAM_CHAT_ID?.trim();
  const keywords = getNewsKeywords();

  if (!telegramBotToken || !telegramChatId) {
    throw new Error(
      missingEnvHint(["TELEGRAM_BOT_TOKEN", "TELEGRAM_CHAT_ID"])
    );
  }

  return { telegramBotToken, telegramChatId, keywords };
}
