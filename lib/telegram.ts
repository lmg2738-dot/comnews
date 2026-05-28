import { APP_NAME } from "./branding";

export type TelegramSendResult = {
  ok: boolean;
  status: number;
  errorCode?: number;
  description?: string;
  /** 그룹→슈퍼그룹 전환 시 Telegram이 알려주는 새 chat_id */
  migrateToChatId?: string;
};

type TelegramApiBody = {
  ok?: boolean;
  error_code?: number;
  description?: string;
  parameters?: { migrate_to_chat_id?: number };
};

export async function sendTelegramDetailed(
  botToken: string,
  chatId: string,
  message: string
): Promise<TelegramSendResult> {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
        disable_web_page_preview: false,
      }),
      signal: AbortSignal.timeout(20000),
    });

    let body: TelegramApiBody = {};
    try {
      body = (await res.json()) as TelegramApiBody;
    } catch {
      body = { description: await res.text().catch(() => "") };
    }

    const migrateId = body.parameters?.migrate_to_chat_id;
    const apiOk = Boolean(body.ok);
    return {
      ok: res.ok && apiOk,
      status: res.status,
      errorCode: body.error_code,
      description: body.description,
      migrateToChatId:
        migrateId !== undefined ? String(migrateId) : undefined,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      ok: false,
      status: 0,
      description: msg,
    };
  }
}

export async function sendTelegram(
  botToken: string,
  chatId: string,
  message: string
): Promise<boolean> {
  const result = await sendTelegramDetailed(botToken, chatId, message);
  if (!result.ok) {
    console.error(
      "[telegram]",
      result.status,
      result.errorCode,
      result.description
    );
  }
  return result.ok;
}

export function formatTelegramMessage(article: {
  title: string;
  link: string;
  source: string;
}): string {
  const now = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date());

  const title = escapeHtml(article.title);
  const source = escapeHtml(article.source);
  const link = article.link;

  return (
    `📰 <b>${escapeHtml(APP_NAME)}</b>\n\n` +
    `<b>${title}</b>\n` +
    `출처: ${source}\n` +
    `<a href="${link}">기사 보기</a>\n\n` +
    `🕐 ${now}`
  );
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** sendMessage 실패 시 사용자 조치 안내 */
export function telegramFailureHint(result: TelegramSendResult): string {
  if (result.ok) return "";
  if (result.migrateToChatId) {
    return (
      `그룹이 슈퍼그룹으로 바뀌었습니다. Vercel·GitHub Secrets의 TELEGRAM_CHAT_ID를 ` +
      `${result.migrateToChatId} 로 바꾼 뒤 재배포하세요.`
    );
  }
  const desc = result.description ?? "";
  if (desc.includes("upgraded to a supergroup")) {
    return (
      "그룹이 슈퍼그룹으로 바뀌었습니다. @userinfobot 또는 getUpdates로 새 chat_id를 확인해 " +
      "TELEGRAM_CHAT_ID를 갱신하세요."
    );
  }
  if (desc.includes("chat not found") || desc.includes("bot was blocked")) {
    return "봇을 채팅방에 추가하고 /start 한 뒤 chat_id를 다시 확인하세요.";
  }
  return desc || "sendMessage 실패";
}
